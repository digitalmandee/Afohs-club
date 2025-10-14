import React, { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Box, Card, CardContent, Typography, Grid, TextField, Button, FormControl, Select, MenuItem, Autocomplete, Chip, Alert, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Divider, Pagination, InputAdornment } from '@mui/material';
import { Add, Delete, Save, Person, Search, Receipt } from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';
import axios from 'axios';
import SideNav from '@/components/App/AdminSideBar/SideNav';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;
export default function BulkMigration() {
    const [open, setOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [payments, setPayments] = useState([]);

    // Transaction history states
    const [memberTransactions, setMemberTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [searchInvoice, setSearchInvoice] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [transactionsPerPage] = useState(5);
    const [filteredTransactions, setFilteredTransactions] = useState([]);

    // Create initial payment row
    const createEmptyPayment = () => ({
        id: Date.now() + Math.random(),
        fee_type: '',
        payment_frequency: '',
        quarter_number: 1,
        amount: '',
        valid_from: '',
        valid_to: '',
        invoice_no: '',
        payment_date: '',
        discount_type: '',
        discount_value: '',
        payment_method: 'cash',
        credit_card_type: '',
        receipt_file: null,
    });

    // Initialize with one empty payment
    useEffect(() => {
        setPayments([createEmptyPayment()]);
    }, []);

    // Search members function
    const searchMembers = async (query) => {
        if (!query || query.length < 2) {
            setSearchResults([]);
            return;
        }

        setSearchLoading(true);
        try {
            const response = await axios.get(route('membership.transactions.search'), {
                params: { query },
            });
            setSearchResults(response.data.members || []);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    // Handle member selection
    const handleMemberSelect = async (member) => {
        setSelectedMember(member);
        setLoadingTransactions(true);

        try {
            const response = await axios.get(route('membership.transactions.member', member.user_id));
            setMemberTransactions(response.data.transactions);
            setFilteredTransactions(response.data.transactions);
            setCurrentPage(1); // Reset pagination
            setSearchInvoice(''); // Reset search

            enqueueSnackbar(`Selected member: ${member.full_name}`, { variant: 'info' });
        } catch (error) {
            console.error('Error fetching member transactions:', error);
            enqueueSnackbar('Error loading member data', { variant: 'error' });
        } finally {
            setLoadingTransactions(false);
        }
    };

    // Add new payment row
    const addNewPayment = () => {
        setPayments([...payments, createEmptyPayment()]);
    };

    // Remove payment row
    const removePayment = (id) => {
        if (payments.length > 1) {
            setPayments(payments.filter((p) => p.id !== id));
        }
    };

    // Update payment field
    const updatePayment = (id, field, value) => {
        setPayments(payments.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    };

    // Handle fee type change for a payment
    const handleFeeTypeChange = (id, feeType) => {
        console.log('Fee type change:', { id, feeType, currentPayments: payments });
        setPayments(
            payments.map((p) => {
                if (p.id === id) {
                    if (feeType === 'membership_fee') {
                        // Set 4-year validity for membership fee
                        const today = new Date();
                        const endDate = new Date(today);
                        endDate.setFullYear(endDate.getFullYear() + 4);

                        return {
                            ...p,
                            fee_type: feeType,
                            valid_from: today.toISOString().split('T')[0],
                            valid_to: endDate.toISOString().split('T')[0],
                            payment_frequency: '',
                            quarter_number: 1,
                            amount: selectedMember?.member_category?.membership_fee || p.amount,
                        };
                    } else if (feeType === 'maintenance_fee') {
                        // Reset for maintenance fee
                        return {
                            ...p,
                            fee_type: feeType,
                            valid_from: '',
                            valid_to: '',
                            payment_frequency: 'quarterly',
                            quarter_number: 1,
                            amount: selectedMember?.member_category?.subscription_fee || p.amount,
                        };
                    } else {
                        // Just update fee type
                        return {
                            ...p,
                            fee_type: feeType,
                        };
                    }
                }
                return p;
            }),
        );
    };

    // Calculate total for a payment
    const calculatePaymentTotal = (payment) => {
        const amount = parseFloat(payment.amount) || 0;
        const discountValue = parseFloat(payment.discount_value) || 0;

        if (!payment.discount_type || !discountValue) return amount;

        if (payment.discount_type === 'percent') {
            return amount - (amount * discountValue) / 100;
        } else {
            return amount - discountValue;
        }
    };

    // Calculate grand total
    const calculateGrandTotal = () => {
        return payments.reduce((total, payment) => total + calculatePaymentTotal(payment), 0);
    };

    // Search function for invoice numbers
    const handleSearchInvoice = (searchTerm) => {
        setSearchInvoice(searchTerm);
        setCurrentPage(1); // Reset to first page when searching

        if (!searchTerm.trim()) {
            setFilteredTransactions(memberTransactions);
        } else {
            const filtered = memberTransactions.filter((transaction) => transaction.invoice_no == searchTerm);
            setFilteredTransactions(filtered);
        }
    };

    // Pagination calculations
    const indexOfLastTransaction = currentPage * transactionsPerPage;
    const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
    const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
    const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

    const handlePageChange = (event, newPage) => {
        setCurrentPage(newPage);
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Get status color for chips
    const getStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return 'success';
            case 'pending':
                return 'warning';
            case 'overdue':
                return 'error';
            default:
                return 'default';
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedMember) {
            enqueueSnackbar('Please select a member first', { variant: 'error' });
            return;
        }

        // Validate all payments
        const validPayments = payments.filter((p) => p.fee_type && p.amount && p.valid_from && p.valid_to && p.invoice_no);

        if (validPayments.length === 0) {
            enqueueSnackbar('Please fill at least one complete payment', { variant: 'error' });
            return;
        }

        setSubmitting(true);

        try {
            // Create FormData for file uploads
            const formData = new FormData();
            formData.append('member_id', selectedMember.user_id);

            // Add each payment with its files
            validPayments.forEach((payment, index) => {
                Object.keys(payment).forEach((key) => {
                    if (key === 'receipt_file' && payment[key]) {
                        formData.append(`payments[${index}][${key}]`, payment[key]);
                    } else if (key !== 'receipt_file' && payment[key] !== null && payment[key] !== '') {
                        formData.append(`payments[${index}][${key}]`, payment[key]);
                    }
                });
            });

            const response = await axios.post(route('membership.transactions.bulk-store'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                enqueueSnackbar(`Successfully created ${validPayments.length} transactions!`, { variant: 'success' });

                // Reset form
                setSelectedMember(null);
                setPayments([createEmptyPayment()]);
            }
        } catch (error) {
            console.error('Submission error:', error);
            enqueueSnackbar('Error creating transactions. Please try again.', { variant: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Head title="Bulk Payment Migration" />
            <SideNav open={open} setOpen={setOpen} />

            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                    backgroundColor: '#f8fafc',
                    minHeight: '100vh',
                }}
            >
                <Box sx={{ p: 4 }}>
                    {/* Header */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                            Payment Migration
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Import multiple payments from old system for a selected member
                        </Typography>
                    </Box>

                    <Grid container spacing={3}>
                        {/* Step 1: Member Selection */}
                        <Grid item xs={12}>
                            <Card sx={{ mb: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderRadius: 2 }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                        <Box
                                            sx={{
                                                bgcolor: '#0a3d62',
                                                color: 'white',
                                                borderRadius: '50%',
                                                width: 32,
                                                height: 32,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mr: 2,
                                                fontSize: '14px',
                                                fontWeight: 600,
                                            }}
                                        >
                                            1
                                        </Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                            Select Member for Migration
                                        </Typography>
                                    </Box>

                                    <Autocomplete
                                        options={searchResults}
                                        getOptionLabel={(option) => `${option.full_name} (${option.membership_no})`}
                                        loading={searchLoading}
                                        onInputChange={(event, value) => searchMembers(value)}
                                        onChange={(event, value) => {
                                            if (value) handleMemberSelect(value);
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Search by name, membership no, CNIC, or phone"
                                                variant="outlined"
                                                fullWidth
                                                sx={{ mb: 2 }}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
                                                    endAdornment: (
                                                        <>
                                                            {searchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                            {params.InputProps.endAdornment}
                                                        </>
                                                    ),
                                                }}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <Box component="li" {...props} sx={{ p: 2 }}>
                                                <Person sx={{ mr: 2, color: 'text.secondary' }} />
                                                <Box>
                                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                        {option.full_name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {option.membership_no} • {option.cnic_no} • {option.phone_no}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        )}
                                    />

                                    {selectedMember && (
                                        <Box
                                            sx={{
                                                mt: 2,
                                                p: 2,
                                                bgcolor: 'success.50',
                                                borderRadius: 2,
                                                border: '1px solid',
                                                borderColor: 'success.200',
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <Person sx={{ mr: 1, color: 'success.main' }} />
                                                <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                                                    Selected: {selectedMember.full_name}
                                                </Typography>
                                            </Box>
                                            <Grid container spacing={1}>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Membership No: <strong>{selectedMember.membership_no}</strong>
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        CNIC No: <strong>{selectedMember.cnic_no}</strong>
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Step 2: Bulk Payments */}
                        {selectedMember && (
                            <Grid item xs={12}>
                                <Card sx={{ mb: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderRadius: 2 }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Box
                                                    sx={{
                                                        bgcolor: '#0a3d62',
                                                        color: 'white',
                                                        borderRadius: '50%',
                                                        width: 32,
                                                        height: 32,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        mr: 2,
                                                        fontSize: '14px',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    2
                                                </Box>
                                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                    Add Multiple Payments
                                                </Typography>
                                            </Box>
                                            <Button variant="outlined" startIcon={<Add />} onClick={addNewPayment} sx={{ borderRadius: 2 }}>
                                                Add New Payment
                                            </Button>
                                        </Box>

                                        <form onSubmit={handleSubmit}>
                                            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'grey.200', borderRadius: 2 }}>
                                                <Table>
                                                    <TableHead>
                                                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                                                            <TableCell sx={{ fontWeight: 600 }}>Fee Type</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>Payment Frequency</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>Quarter</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>Valid From</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>Valid To</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>Invoice No</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>Payment Date</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>Payment Method</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>Card Type</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>Receipt</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {payments.map((payment, index) => {
                                                            console.log('Rendering payment:', payment);
                                                            return (
                                                                <TableRow key={payment.id}>
                                                                    <TableCell>
                                                                        <FormControl size="small" sx={{ minWidth: 120 }}>
                                                                            <Select
                                                                                value={payment.fee_type || ''}
                                                                                onChange={(e) => {
                                                                                    console.log('Select onChange:', e.target.value, payment.id);
                                                                                    handleFeeTypeChange(payment.id, e.target.value);
                                                                                }}
                                                                                displayEmpty
                                                                            >
                                                                                <MenuItem value="">Select Fee Type</MenuItem>
                                                                                <MenuItem value="membership_fee">💳 Membership</MenuItem>
                                                                                <MenuItem value="maintenance_fee">🔧 Maintenance</MenuItem>
                                                                            </Select>
                                                                        </FormControl>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {payment.fee_type === 'maintenance_fee' && (
                                                                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                                                                <Select value={payment.payment_frequency} onChange={(e) => updatePayment(payment.id, 'payment_frequency', e.target.value)} displayEmpty>
                                                                                    <MenuItem value="">Select Frequency</MenuItem>
                                                                                    <MenuItem value="quarterly">Quarterly</MenuItem>
                                                                                    <MenuItem value="half_yearly">Half Yearly</MenuItem>
                                                                                    <MenuItem value="three_quarters">3 Quarters</MenuItem>
                                                                                    <MenuItem value="annually">Annually</MenuItem>
                                                                                </Select>
                                                                            </FormControl>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {payment.fee_type === 'maintenance_fee' && (
                                                                            <FormControl size="small" sx={{ minWidth: 80 }}>
                                                                                <Select value={payment.quarter_number} onChange={(e) => updatePayment(payment.id, 'quarter_number', e.target.value)} displayEmpty>
                                                                                    <MenuItem value="">Quarter</MenuItem>
                                                                                    <MenuItem value={1}>Q1</MenuItem>
                                                                                    <MenuItem value={2}>Q2</MenuItem>
                                                                                    <MenuItem value={3}>Q3</MenuItem>
                                                                                    <MenuItem value={4}>Q4</MenuItem>
                                                                                </Select>
                                                                            </FormControl>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <TextField size="small" type="number" value={payment.amount} onChange={(e) => updatePayment(payment.id, 'amount', e.target.value)} sx={{ width: 100 }} />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <TextField size="small" type="date" value={payment.valid_from} onChange={(e) => updatePayment(payment.id, 'valid_from', e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 140 }} />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <TextField size="small" type="date" value={payment.valid_to} onChange={(e) => updatePayment(payment.id, 'valid_to', e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 140 }} />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <TextField size="small" value={payment.invoice_no} onChange={(e) => updatePayment(payment.id, 'invoice_no', e.target.value)} placeholder="1" sx={{ width: 100 }} />
                                                                    </TableCell>

                                                                    {/* Payment Date */}
                                                                    <TableCell>
                                                                        <TextField size="small" type="date" value={payment.payment_date} onChange={(e) => updatePayment(payment.id, 'payment_date', e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 140 }} />
                                                                    </TableCell>

                                                                    {/* Payment Method */}
                                                                    <TableCell>
                                                                        <FormControl size="small" sx={{ minWidth: 100 }}>
                                                                            <Select value={payment.payment_method || 'cash'} onChange={(e) => updatePayment(payment.id, 'payment_method', e.target.value)} displayEmpty>
                                                                                <MenuItem value="cash">💵 Cash</MenuItem>
                                                                                <MenuItem value="credit_card">💳 Card</MenuItem>
                                                                            </Select>
                                                                        </FormControl>
                                                                    </TableCell>

                                                                    {/* Credit Card Type */}
                                                                    <TableCell>
                                                                        {payment.payment_method === 'credit_card' && (
                                                                            <FormControl size="small" sx={{ minWidth: 100 }}>
                                                                                <Select value={payment.credit_card_type || ''} onChange={(e) => updatePayment(payment.id, 'credit_card_type', e.target.value)} displayEmpty>
                                                                                    <MenuItem value="">Select Card</MenuItem>
                                                                                    <MenuItem value="mastercard">🔴 MasterCard</MenuItem>
                                                                                    <MenuItem value="visa">🔵 Visa</MenuItem>
                                                                                </Select>
                                                                            </FormControl>
                                                                        )}
                                                                    </TableCell>

                                                                    {/* Receipt Upload */}
                                                                    <TableCell>
                                                                        {payment.payment_method === 'credit_card' && (
                                                                            <Box sx={{ width: 120 }}>
                                                                                <input
                                                                                    type="file"
                                                                                    accept="image/*,.pdf"
                                                                                    onChange={(e) => updatePayment(payment.id, 'receipt_file', e.target.files[0])}
                                                                                    style={{
                                                                                        width: '100%',
                                                                                        padding: '4px',
                                                                                        border: '1px solid #d1d5db',
                                                                                        borderRadius: '4px',
                                                                                        fontSize: '12px',
                                                                                        backgroundColor: '#f9fafb',
                                                                                    }}
                                                                                />
                                                                                {payment.receipt_file && (
                                                                                    <Typography variant="caption" color="success.main" sx={{ fontSize: '10px' }}>
                                                                                        ✅ {payment.receipt_file.name.substring(0, 15)}...
                                                                                    </Typography>
                                                                                )}
                                                                            </Box>
                                                                        )}
                                                                    </TableCell>

                                                                    <TableCell>
                                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                                                            {formatCurrency(calculatePaymentTotal(payment))}
                                                                        </Typography>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <IconButton color="error" size="small" onClick={() => removePayment(payment.id)} disabled={payments.length === 1}>
                                                                            <Delete />
                                                                        </IconButton>
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>

                                            {/* Grand Total */}
                                            <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.50', borderRadius: 2, border: '2px solid', borderColor: 'primary.200' }}>
                                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#0a3d62', textAlign: 'center' }}>
                                                    💰 Grand Total: {formatCurrency(calculateGrandTotal())}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                                                    {payments.filter((p) => p.fee_type && p.amount).length} payments ready to save
                                                </Typography>
                                            </Box>

                                            {/* Submit Button */}
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                size="large"
                                                fullWidth
                                                disabled={submitting || !selectedMember}
                                                startIcon={<Save />}
                                                sx={{
                                                    mt: 3,
                                                    py: 2,
                                                    bgcolor: '#0a3d62',
                                                    borderRadius: 2,
                                                    fontSize: '16px',
                                                    fontWeight: 600,
                                                    textTransform: 'none',
                                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                                    '&:hover': {
                                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                                    },
                                                }}
                                            >
                                                {submitting ? (
                                                    <>
                                                        <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                                                        Saving All Payments...
                                                    </>
                                                ) : (
                                                    'Save All Payments'
                                                )}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}

                        {/* Step 3: Transaction History */}
                        {selectedMember && (
                            <Grid item xs={12}>
                                <Card sx={{ mb: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderRadius: 2 }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                            <Box
                                                sx={{
                                                    bgcolor: 'secondary.main',
                                                    color: 'white',
                                                    borderRadius: '50%',
                                                    width: 32,
                                                    height: 32,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mr: 2,
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                3
                                            </Box>
                                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                Transaction History - {selectedMember.full_name}
                                            </Typography>
                                        </Box>

                                        {/* Search Bar */}
                                        <Box sx={{ mb: 3 }}>
                                            <TextField
                                                fullWidth
                                                placeholder="Search by invoice number..."
                                                value={searchInvoice}
                                                onChange={(e) => handleSearchInvoice(e.target.value)}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Search sx={{ color: 'action.active' }} />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                        bgcolor: 'grey.50',
                                                    },
                                                }}
                                            />
                                        </Box>

                                        {loadingTransactions ? (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                                <CircularProgress />
                                            </Box>
                                        ) : (
                                            <>
                                                <TableContainer component={Paper} elevation={0}>
                                                    <Table>
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell>Invoice No</TableCell>
                                                                <TableCell>Fee Type</TableCell>
                                                                <TableCell>Amount</TableCell>
                                                                <TableCell>Payment Method</TableCell>
                                                                <TableCell>Receipt</TableCell>
                                                                <TableCell>Status</TableCell>
                                                                <TableCell>Payment Date</TableCell>
                                                                <TableCell>Period</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {currentTransactions.length > 0 ? (
                                                                currentTransactions.map((transaction) => (
                                                                    <TableRow key={transaction.id}>
                                                                        <TableCell>{transaction.invoice_no}</TableCell>
                                                                        <TableCell>
                                                                            <Chip label={transaction.fee_type?.replace('_', ' ').toUpperCase()} color={transaction.fee_type === 'membership_fee' ? 'primary' : 'secondary'} size="small" />
                                                                        </TableCell>
                                                                        <TableCell>{formatCurrency(transaction.total_price)}</TableCell>
                                                                        <TableCell>
                                                                            <Chip 
                                                                                label={transaction.payment_method === 'credit_card' ? `💳 ${transaction.credit_card_type?.toUpperCase() || 'CARD'}` : '💵 CASH'} 
                                                                                color={transaction.payment_method === 'credit_card' ? 'info' : 'default'} 
                                                                                size="small" 
                                                                            />
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {transaction.receipt ? (
                                                                                <Button
                                                                                    size="small"
                                                                                    variant="outlined"
                                                                                    startIcon={<Receipt />}
                                                                                    onClick={() => window.open(`${transaction.receipt}`, '_blank')}
                                                                                    sx={{ fontSize: '11px', py: 0.5, px: 1 }}
                                                                                >
                                                                                    View
                                                                                </Button>
                                                                            ) : (
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    No Receipt
                                                                                </Typography>
                                                                            )}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Chip label={transaction.status?.toUpperCase()} color={getStatusColor(transaction.status)} size="small" />
                                                                        </TableCell>
                                                                        <TableCell>{transaction.payment_date ? formatDate(transaction.payment_date) : '-'}</TableCell>
                                                                        <TableCell>{transaction.valid_from && transaction.valid_to ? `${formatDate(transaction.valid_from)} - ${formatDate(transaction.valid_to)}` : '-'}</TableCell>
                                                                    </TableRow>
                                                                ))
                                                            ) : (
                                                                <TableRow>
                                                                    <TableCell colSpan={8} align="center">
                                                                        <Typography color="textSecondary">{searchInvoice ? `No transactions found matching "${searchInvoice}"` : 'No transactions found for this member'}</Typography>
                                                                    </TableCell>
                                                                </TableRow>
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>

                                                {/* Pagination */}
                                                {filteredTransactions.length > transactionsPerPage && (
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3, gap: 2 }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Showing {indexOfFirstTransaction + 1}-{Math.min(indexOfLastTransaction, filteredTransactions.length)} of {filteredTransactions.length} transactions
                                                        </Typography>
                                                        <Pagination
                                                            count={totalPages}
                                                            page={currentPage}
                                                            onChange={handlePageChange}
                                                            color="primary"
                                                            size="medium"
                                                            showFirstButton
                                                            showLastButton
                                                            sx={{
                                                                '& .MuiPaginationItem-root': {
                                                                    borderRadius: 2,
                                                                },
                                                            }}
                                                        />
                                                    </Box>
                                                )}
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            </div>
        </>
    );
}
