import React, { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Box, Card, CardContent, Typography, Grid, TextField, Button, FormControl, Select, MenuItem, Autocomplete, Chip, Alert, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, FormHelperText, Pagination, InputAdornment } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enqueueSnackbar } from 'notistack';
import axios from 'axios';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { Person, Receipt, Search } from '@mui/icons-material';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;
export default function CreateTransaction() {
    const [open, setOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [memberTransactions, setMemberTransactions] = useState([]);
    const [membershipFeePaid, setMembershipFeePaid] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [dateValidation, setDateValidation] = useState({ isValid: true, message: '' });

    // Pagination and search states
    const [searchInvoice, setSearchInvoice] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [transactionsPerPage] = useState(5);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [quarterStatus, setQuarterStatus] = useState({
        paidQuarters: [],
        nextAvailableQuarter: 1,
        currentYear: new Date().getFullYear(),
    });

    const { data, setData, post, processing, errors, reset } = useForm({
        member_id: '',
        fee_type: '',
        payment_frequency: 'quarterly',
        discount_type: '',
        discount_value: '',
        payment_method: 'cash',
        amount: '',
        valid_from: '',
        valid_to: '',
        starting_quarter: 1,
        credit_card_type: '',
        receipt_file: null,
    });


    const analyzeQuarterStatus = (transactions, membershipDate) => {
        const membershipYear = new Date(membershipDate).getFullYear();
        const currentYear = new Date().getFullYear();

        // Get maintenance fee transactions for current membership year cycle
        const maintenanceTransactions = transactions.filter((t) => t.fee_type === 'maintenance_fee' && t.status === 'paid' && t.quarter_number);

        // Sort transactions by validity end date (latest first) to find the most recent payment period
        const sortedTransactions = [...maintenanceTransactions].sort((a, b) => new Date(b.valid_to) - new Date(a.valid_to));

        // Find the current active payment period
        // Use a simpler approach: find all transactions that are "current" (not from old completed cycles)
        let currentPeriodTransactions = [];

        if (sortedTransactions.length > 0) {
            const mostRecentTransaction = sortedTransactions[0];
            const mostRecentEnd = new Date(mostRecentTransaction.valid_to);
            const mostRecentStart = new Date(mostRecentTransaction.valid_from);

            // Simpler approach: exclude transactions that are complete annual cycles from previous years
            // Include all other transactions as part of the current payment period

            // Much simpler approach: include transactions within 18 months of the most recent transaction
            // This captures the current payment cycle without complex logic
            const eighteenMonthsAgo = new Date(mostRecentEnd);
            eighteenMonthsAgo.setMonth(eighteenMonthsAgo.getMonth() - 18);

            currentPeriodTransactions = sortedTransactions.filter((transaction) => {
                const txStart = new Date(transaction.valid_from);
                const txEnd = new Date(transaction.valid_to);

                // Include transaction if it starts within 18 months of the most recent transaction end
                const isWithinWindow = txStart >= eighteenMonthsAgo;

                return isWithinWindow;
            });
        }

        // Calculate paid quarters and find the latest payment end date
        let paidQuarters = [];
        let latestEndDate = null;
        let completedCycles = 0;

        // Sort current period transactions by start date to analyze them chronologically
        const chronologicalTransactions = [...currentPeriodTransactions].sort((a, b) => new Date(a.valid_from) - new Date(b.valid_from));

        // Only analyze the most recent membership year cycle
        // Find the latest transaction and work backwards to find the current cycle
        const latestTransaction = chronologicalTransactions[chronologicalTransactions.length - 1];
        const latestStart = new Date(latestTransaction.valid_from);

        // Calculate the start of the current membership year (when Q1 would have started)
        const currentCycleStart = new Date(latestStart);
        const quartersSinceQ1 = (latestTransaction.quarter_number - 1) * 3;
        currentCycleStart.setMonth(currentCycleStart.getMonth() - quartersSinceQ1);

        const currentCycleEnd = new Date(currentCycleStart);
        currentCycleEnd.setFullYear(currentCycleEnd.getFullYear() + 1);
        currentCycleEnd.setDate(currentCycleEnd.getDate() - 1);

        // Only include transactions that fall within the current membership year
        const currentYearTransactions = chronologicalTransactions.filter((transaction) => {
            const txStart = new Date(transaction.valid_from);
            return txStart >= currentCycleStart && txStart <= currentCycleEnd;
        });

        currentYearTransactions.forEach((transaction, index) => {
            const startingQuarter = transaction.quarter_number;
            let quartersCount = 1; // Default for quarterly

            // Determine how many quarters this transaction covers
            if (transaction.payment_frequency === 'half_yearly') {
                quartersCount = 2;
            } else if (transaction.payment_frequency === 'three_quarters') {
                quartersCount = 3;
            } else if (transaction.payment_frequency === 'annually') {
                quartersCount = 4;
            }

            // Add all covered quarters to the paid list
            const coveredQuarters = [];
            for (let i = 0; i < quartersCount; i++) {
                const quarterNum = ((startingQuarter - 1 + i) % 4) + 1;
                coveredQuarters.push(quarterNum);
                if (!paidQuarters.includes(quarterNum)) {
                    paidQuarters.push(quarterNum);
                }
            }

            // Track the latest end date from transactions
            if (transaction.valid_to) {
                const endDate = new Date(transaction.valid_to);
                if (!latestEndDate || endDate > latestEndDate) {
                    latestEndDate = endDate;
                }
            }
        });

        paidQuarters.sort((a, b) => a - b);

        // Calculate how many complete cycles have been paid
        const hasAllQuarters = paidQuarters.includes(1) && paidQuarters.includes(2) && paidQuarters.includes(3) && paidQuarters.includes(4);
        if (hasAllQuarters) {
            completedCycles = Math.floor(maintenanceTransactions.length / 4) || 1;
        }

        // Find next available quarter
        let nextQuarter = 1;
        let isNewCycle = false;

        // If all 4 quarters are paid, start next cycle
        if (hasAllQuarters) {
            nextQuarter = 1;
            isNewCycle = true;
            paidQuarters = []; // Reset for new cycle display
        } else {
            // Find next unpaid quarter in current cycle
            for (let i = 1; i <= 4; i++) {
                if (!paidQuarters.includes(i)) {
                    nextQuarter = i;
                    break;
                }
            }
            isNewCycle = false;
        }

        return {
            paidQuarters,
            nextAvailableQuarter: nextQuarter,
            currentYear: membershipYear,
            isNewCycle,
            latestEndDate,
            completedCycles,
        };
    };

    // Search members function
    const searchMembers = async (query) => {
        if (!query || query.length < 2) {
            setSearchResults([]);
            return;
        }

        setSearchLoading(true);
        try {
            const response = await axios.get(route('membership.transactions.search'), {
                params: { query }
            });
            setSearchResults(response.data.members || []);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleMemberSelect = async (member) => {
        setSelectedMember(member);
        setData('member_id', member.user_id);
        setLoadingTransactions(true);

        try {
            const response = await axios.get(route('membership.transactions.member', member.user_id));
            setMemberTransactions(response.data.transactions);
            setFilteredTransactions(response.data.transactions);
            setMembershipFeePaid(response.data.membership_fee_paid);
            setCurrentPage(1); // Reset pagination
            setSearchInvoice(''); // Reset search

            // Analyze quarter payment status
            const quarterAnalysis = analyzeQuarterStatus(response.data.transactions, member.membership_date);
            setQuarterStatus(quarterAnalysis);

            enqueueSnackbar(`Selected member: ${member.full_name}`, { variant: 'info' });
        } catch (error) {
            console.error('Error fetching member transactions:', error);
            enqueueSnackbar('Error loading member data', { variant: 'error' });
        } finally {
            setLoadingTransactions(false);
        }
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

    const handleFeeTypeChange = (feeType) => {
        setData('fee_type', feeType);

        // Update amount based on fee type and selected member
        if (selectedMember && selectedMember.member_category) {
            if (feeType === 'membership_fee') {
                setData('amount', selectedMember.member_category.fee);
                // Auto-suggest 4 years validity for membership fee
                const today = new Date();
                const fourYearsLater = new Date(today.getFullYear() + 4, today.getMonth(), today.getDate());
                setData('valid_from', today.toISOString().split('T')[0]);
                setData('valid_to', fourYearsLater.toISOString().split('T')[0]);
            } else if (feeType === 'maintenance_fee') {
                setData('amount', selectedMember.member_category.subscription_fee);
                // Auto-suggest quarterly period based on member joining date
                suggestMaintenancePeriod('quarterly');
            }
        }
    };

    const suggestMaintenancePeriod = (frequency) => {
        if (!selectedMember) return;

        const membershipDate = new Date(selectedMember.membership_date);
        const nextQuarter = quarterStatus.nextAvailableQuarter;

        // Calculate number of quarters to add based on frequency
        const quartersToAdd = frequency === 'quarterly' ? 1 : frequency === 'half_yearly' ? 2 : frequency === 'three_quarters' ? 3 : 4;

        let quarterStartDate;

        // Always start from the end of the latest payment if there is one
        if (quarterStatus.latestEndDate) {
            quarterStartDate = new Date(quarterStatus.latestEndDate);
            quarterStartDate.setDate(quarterStartDate.getDate() + 1); // Start the day after the last payment ended
        } else {
            // Calculate quarter start date based on member's joining date and next quarter
            quarterStartDate = new Date(membershipDate);
            quarterStartDate.setMonth(membershipDate.getMonth() + (nextQuarter - 1) * 3);
        }

        // Calculate end date by adding the required number of quarters (3 months each)
        const endDate = new Date(quarterStartDate);
        endDate.setMonth(quarterStartDate.getMonth() + quartersToAdd * 3);
        endDate.setDate(endDate.getDate() - 1); // Last day of the period

        setData('valid_from', quarterStartDate.toISOString().split('T')[0]);
        setData('valid_to', endDate.toISOString().split('T')[0]);
        setData('starting_quarter', nextQuarter);

        // Update amount based on number of quarters
        if (selectedMember.member_category) {
            const quarterlyAmount = selectedMember.member_category.subscription_fee;
            const totalAmount = quarterlyAmount * quartersToAdd;
            setData('amount', totalAmount);
        }
    };

    const calculateTotal = () => {
        const amount = parseFloat(data.amount) || 0;
        const discountValue = parseFloat(data.discount_value) || 0;

        if (data.discount_type === 'percent') {
            return amount - (amount * discountValue) / 100;
        } else if (data.discount_type === 'fixed') {
            return amount - discountValue;
        }

        return amount;
    };

    const validateDateOverlap = () => {
        if (!data.valid_from || !data.valid_to || !selectedMember || data.fee_type !== 'maintenance_fee') {
            return { isValid: true };
        }

        const newStart = new Date(data.valid_from);
        const newEnd = new Date(data.valid_to);

        // Get maintenance fee transactions and find the most recent active period
        const maintenanceTransactions = memberTransactions.filter((t) => t.fee_type === 'maintenance_fee' && t.status === 'paid' && t.valid_from && t.valid_to);

        // Sort by end date (latest first) to get the most recent transaction
        const sortedTransactions = [...maintenanceTransactions].sort((a, b) => new Date(b.valid_to) - new Date(a.valid_to));

        // Only check overlap with the most recent transaction (current active period)
        if (sortedTransactions.length > 0) {
            const mostRecentTransaction = sortedTransactions[0];
            const existingStart = new Date(mostRecentTransaction.valid_from);
            const existingEnd = new Date(mostRecentTransaction.valid_to);

            // Check if dates overlap with the current active period
            const hasOverlap = newStart <= existingEnd && newEnd >= existingStart;

            if (hasOverlap) {
                return {
                    isValid: false,
                    message: `Selected period (${formatDate(newStart)} to ${formatDate(newEnd)}) overlaps with current payment period (${formatDate(existingStart)} to ${formatDate(existingEnd)})`,
                };
            }
        }

        return { isValid: true };
    };

    // Real-time validation when dates change
    const handleDateChange = (field, value) => {
        setData(field, value);

        // Update validation after a short delay
        setTimeout(() => {
            const validation = validateDateOverlap();
            setDateValidation(validation);
        }, 100);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate date overlap before submitting
        const validation = validateDateOverlap();
        if (!validation.isValid) {
            alert(`❌ Date Conflict: ${validation.message}`);
            return;
        }

        // Validate credit card fields if credit card is selected
        if (data.payment_method === 'credit_card') {
            if (!data.credit_card_type) {
                alert('❌ Please select credit card type');
                return;
            }
            if (!data.receipt_file) {
                alert('❌ Please upload receipt for credit card payment');
                return;
            }
        }

        setSubmitting(true);

        try {
            // Create FormData for file upload
            const formData = new FormData();

            // Add all form fields to FormData
            Object.keys(data).forEach((key) => {
                if (key === 'receipt_file' && data[key]) {
                    formData.append('receipt_file', data[key]);
                } else if (data[key] !== null && data[key] !== '') {
                    formData.append(key, data[key]);
                }
            });

            const response = await axios.post(route('membership.transactions.store'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                // Reset form
                setData({
                    member_id: '',
                    fee_type: 'maintenance_fee',
                    payment_frequency: 'quarterly',
                    amount: '',
                    discount_type: '',
                    discount_value: '',
                    payment_method: 'cash',
                    valid_from: '',
                    valid_to: '',
                    starting_quarter: 1,
                    credit_card_type: '',
                    receipt_file: null,
                });
                setSelectedMember(null);
                setMemberTransactions([]);
                setMembershipFeePaid(false);
                setFormErrors({});
                setDateValidation({ isValid: true });
                setQuarterStatus({
                    paidQuarters: [],
                    nextAvailableQuarter: 1,
                    currentYear: new Date().getFullYear(),
                });

                // Show success message
                enqueueSnackbar('Transaction created successfully!', { variant: 'success' });

                // Optionally redirect to transaction details
                // window.location.href = route('membership.transactions.show', response.data.transaction.id);
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                // Validation errors
                setFormErrors(error.response.data.errors || {});
                enqueueSnackbar('Please check the form for validation errors.', { variant: 'error' });
            } else if (error.response && error.response.data.error) {
                // Business logic errors
                enqueueSnackbar(error.response.data.error, { variant: 'error' });
            } else {
                // Other errors
                enqueueSnackbar('Failed to create transaction. Please try again.', { variant: 'error' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
        }).format(amount);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-PK', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return 'success';
            case 'unpaid':
                return 'error';
            case 'partial':
                return 'warning';
            default:
                return 'default';
        }
    };

    return (
        <>
            <Head title="Create Transaction" />
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
                            Create New Transaction
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Search for a member and create a new transaction
                        </Typography>
                    </Box>

                    <Grid container spacing={3}>
                        {/* Step 1: Member Search */}
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
                                            Select Member
                                        </Typography>
                                    </Box>

                                    <Autocomplete
                                        options={searchResults}
                                        getOptionLabel={(option) => `${option.full_name} (${option.membership_no})`}
                                        loading={searchLoading}
                                        onInputChange={(event, value) => {
                                            searchMembers(value);
                                        }}
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
                                                    Selected Member
                                                </Typography>
                                            </Box>
                                            <Grid container spacing={1}>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                        Full Name
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                        {selectedMember.full_name}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                        Membership No
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                        {selectedMember.membership_no}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                        Category
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                        {selectedMember.member_category?.name}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                        Membership Date
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                        {formatDate(selectedMember.membership_date)}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Step 2: Transaction Form */}
                        <Grid item xs={12}>
                            <Card sx={{ mb: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderRadius: 2 }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                        <Box
                                            sx={{
                                                bgcolor: selectedMember ? '#0a3d62' : 'grey.300',
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
                                            Transaction Details
                                        </Typography>
                                    </Box>
                                    {selectedMember ? (
                                        <form onSubmit={handleSubmit}>
                                            <Grid container spacing={3}>
                                                {/* Fee Type Selection */}
                                                <Grid item xs={12}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                                                        Fee Type
                                                    </Typography>
                                                    <FormControl fullWidth>
                                                        <Select value={data.fee_type} onChange={(e) => handleFeeTypeChange(e.target.value)} error={!!errors.fee_type} sx={{ borderRadius: 2 }}>
                                                            <MenuItem value="membership_fee" disabled={membershipFeePaid}>
                                                                💳 Membership Fee {membershipFeePaid && '(Already Paid)'}
                                                            </MenuItem>
                                                            <MenuItem value="maintenance_fee">🔧 Maintenance Fee</MenuItem>
                                                        </Select>
                                                        {errors.fee_type && (
                                                            <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                                                                {errors.fee_type}
                                                            </Typography>
                                                        )}
                                                    </FormControl>
                                                </Grid>

                                                {/* Maintenance Fee Quarter Status */}
                                                {data.fee_type === 'maintenance_fee' && (
                                                    <>
                                                        <Grid item xs={12}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                                                                Quarter Payment Status
                                                            </Typography>
                                                            <Box
                                                                sx={{
                                                                    p: 2,
                                                                    bgcolor: quarterStatus.isNewCycle ? 'info.50' : 'warning.50',
                                                                    borderRadius: 2,
                                                                    border: '1px solid',
                                                                    borderColor: quarterStatus.isNewCycle ? 'info.200' : 'warning.200',
                                                                }}
                                                            >
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                                                    📊 {quarterStatus.isNewCycle ? 'New Cycle' : 'Current Cycle'}
                                                                </Typography>
                                                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                                                    {[1, 2, 3, 4].map((quarter) => (
                                                                        <Chip key={quarter} label={`Q${quarter}`} color={quarterStatus.paidQuarters.includes(quarter) ? 'success' : 'default'} variant={quarterStatus.paidQuarters.includes(quarter) ? 'filled' : 'outlined'} size="medium" sx={{ minWidth: 50, fontWeight: 600 }} />
                                                                    ))}
                                                                </Box>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    <strong>Next available:</strong> Quarter {quarterStatus.nextAvailableQuarter}
                                                                    {quarterStatus.isNewCycle && quarterStatus.latestEndDate && <span> (Starting from {formatDate(new Date(new Date(quarterStatus.latestEndDate).getTime() + 24 * 60 * 60 * 1000))})</span>}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>

                                                        <Grid item xs={12}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                                                                Payment Options
                                                            </Typography>
                                                            <FormControl fullWidth>
                                                                <Select
                                                                    value={data.payment_frequency}
                                                                    onChange={(e) => {
                                                                        setData('payment_frequency', e.target.value);
                                                                        suggestMaintenancePeriod(e.target.value);
                                                                    }}
                                                                    sx={{ borderRadius: 2 }}
                                                                >
                                                                    <MenuItem value="quarterly">📅 Pay Next Quarter Only (Q{quarterStatus.nextAvailableQuarter})</MenuItem>
                                                                    {quarterStatus.nextAvailableQuarter <= 3 && (
                                                                        <MenuItem value="half_yearly">
                                                                            📅 Pay Next 2 Quarters (Q{quarterStatus.nextAvailableQuarter}-Q{quarterStatus.nextAvailableQuarter + 1})
                                                                        </MenuItem>
                                                                    )}
                                                                    {quarterStatus.nextAvailableQuarter <= 2 && (
                                                                        <MenuItem value="three_quarters">
                                                                            📅 Pay Next 3 Quarters (Q{quarterStatus.nextAvailableQuarter}-Q{quarterStatus.nextAvailableQuarter + 2})
                                                                        </MenuItem>
                                                                    )}
                                                                    {quarterStatus.nextAvailableQuarter === 1 && <MenuItem value="annually">📅 Pay All 4 Quarters (Q1-Q4)</MenuItem>}
                                                                </Select>
                                                            </FormControl>
                                                        </Grid>
                                                    </>
                                                )}

                                                {/* Amount and Discount Section */}
                                                <Grid item xs={12}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                                                        Amount & Discount
                                                    </Typography>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12}>
                                                            <TextField
                                                                fullWidth
                                                                label="Amount (PKR)"
                                                                type="number"
                                                                value={data.amount}
                                                                onChange={(e) => setData('amount', e.target.value)}
                                                                error={!!errors.amount}
                                                                helperText={errors.amount}
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                                                }}
                                                                InputProps={{
                                                                    startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>Rs</Typography>,
                                                                }}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <FormControl fullWidth>
                                                                <Select value={data.discount_type} onChange={(e) => setData('discount_type', e.target.value)} displayEmpty sx={{ borderRadius: 2 }}>
                                                                    <MenuItem value="">🚫 No Discount</MenuItem>
                                                                    <MenuItem value="percent">📊 Percentage</MenuItem>
                                                                    <MenuItem value="fixed">💰 Fixed Amount</MenuItem>
                                                                </Select>
                                                            </FormControl>
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <TextField
                                                                fullWidth
                                                                label="Discount Value"
                                                                type="number"
                                                                value={data.discount_value}
                                                                onChange={(e) => setData('discount_value', e.target.value)}
                                                                disabled={!data.discount_type}
                                                                error={!!errors.discount_value}
                                                                helperText={errors.discount_value}
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                                                }}
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                </Grid>

                                                {/* Payment Method Section */}
                                                <Grid item xs={12}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                                                        Payment Method
                                                    </Typography>
                                                    <FormControl fullWidth>
                                                        <Select value={data.payment_method} onChange={(e) => setData('payment_method', e.target.value)} sx={{ borderRadius: 2 }}>
                                                            <MenuItem value="cash">💵 Cash Payment</MenuItem>
                                                            <MenuItem value="credit_card">💳 Credit Card</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Grid>

                                                {/* Credit Card Additional Fields */}
                                                {data.payment_method === 'credit_card' && (
                                                    <Grid item xs={12}>
                                                        <Box
                                                            sx={{
                                                                p: 3,
                                                                bgcolor: 'primary.50',
                                                                borderRadius: 2,
                                                                border: '1px solid',
                                                                borderColor: 'primary.200',
                                                            }}
                                                        >
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#0a3d62' }}>
                                                                💳 Credit Card Details
                                                            </Typography>
                                                            <Grid container spacing={2}>
                                                                <Grid item xs={12} sm={6}>
                                                                    <FormControl fullWidth>
                                                                        <Select value={data.credit_card_type} onChange={(e) => setData('credit_card_type', e.target.value)} error={!!formErrors.credit_card_type} displayEmpty sx={{ borderRadius: 2 }}>
                                                                            <MenuItem value="">Select Card Type</MenuItem>
                                                                            <MenuItem value="mastercard">🔴 MasterCard</MenuItem>
                                                                            <MenuItem value="visa">🔵 Visa</MenuItem>
                                                                        </Select>
                                                                        {formErrors.credit_card_type && (
                                                                            <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                                                                                {formErrors.credit_card_type[0]}
                                                                            </Typography>
                                                                        )}
                                                                    </FormControl>
                                                                </Grid>
                                                                <Grid item xs={12} sm={6}>
                                                                    <Box>
                                                                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                                                            📄 Upload Receipt
                                                                        </Typography>
                                                                        <input
                                                                            type="file"
                                                                            accept="image/*,.pdf"
                                                                            onChange={(e) => setData('receipt_file', e.target.files[0])}
                                                                            style={{
                                                                                width: '100%',
                                                                                padding: '12px',
                                                                                border: `2px dashed ${formErrors.receipt_file ? '#f44336' : '#d1d5db'}`,
                                                                                borderRadius: '8px',
                                                                                fontSize: '14px',
                                                                                backgroundColor: '#f9fafb',
                                                                                cursor: 'pointer',
                                                                            }}
                                                                        />
                                                                        {formErrors.receipt_file && (
                                                                            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                                                                                {formErrors.receipt_file[0]}
                                                                            </Typography>
                                                                        )}
                                                                        {data.receipt_file && (
                                                                            <Box sx={{ mt: 1, p: 1, bgcolor: 'success.50', borderRadius: 1, border: '1px solid', borderColor: 'success.200' }}>
                                                                                <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>
                                                                                    ✅ {data.receipt_file.name}
                                                                                </Typography>
                                                                            </Box>
                                                                        )}
                                                                    </Box>
                                                                </Grid>
                                                            </Grid>
                                                        </Box>
                                                    </Grid>
                                                )}

                                                {/* Validity Period Section */}
                                                {selectedMember && data.fee_type && (
                                                    <Grid item xs={12}>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                                                            Validity Period
                                                        </Typography>
                                                        <Box
                                                            sx={{
                                                                p: 3,
                                                                bgcolor: 'grey.50',
                                                                borderRadius: 2,
                                                                border: '1px solid',
                                                                borderColor: 'grey.200',
                                                            }}
                                                        >
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                                    📅 Set Payment Period
                                                                </Typography>
                                                                <Button size="small" variant="outlined" onClick={() => (data.fee_type === 'membership_fee' ? handleFeeTypeChange('membership_fee') : suggestMaintenancePeriod(data.payment_frequency))} sx={{ borderRadius: 2 }}>
                                                                    Auto-Suggest Dates
                                                                </Button>
                                                            </Box>

                                                            <Grid container spacing={2}>
                                                                <Grid item xs={6}>
                                                                    <TextField
                                                                        fullWidth
                                                                        label="Valid From"
                                                                        type="date"
                                                                        value={data.valid_from}
                                                                        onChange={(e) => handleDateChange('valid_from', e.target.value)}
                                                                        InputLabelProps={{ shrink: true }}
                                                                        error={!!(errors.valid_from || formErrors.valid_from || !dateValidation.isValid)}
                                                                        helperText={errors.valid_from || formErrors.valid_from?.[0] || (!dateValidation.isValid ? 'Date conflict detected' : '')}
                                                                        sx={{
                                                                            '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                                                        }}
                                                                    />
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <TextField
                                                                        fullWidth
                                                                        label="Valid To"
                                                                        type="date"
                                                                        value={data.valid_to}
                                                                        onChange={(e) => handleDateChange('valid_to', e.target.value)}
                                                                        InputLabelProps={{ shrink: true }}
                                                                        error={!!(errors.valid_to || formErrors.valid_to || !dateValidation.isValid)}
                                                                        helperText={errors.valid_to || formErrors.valid_to?.[0] || (!dateValidation.isValid ? 'Date conflict detected' : '')}
                                                                        sx={{
                                                                            '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                                                        }}
                                                                    />
                                                                </Grid>
                                                            </Grid>

                                                            {data.valid_from && data.valid_to && (
                                                                <>
                                                                    {!dateValidation.isValid && (
                                                                        <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                                                                            <strong>⚠️ Date Conflict:</strong> {dateValidation.message}
                                                                        </Alert>
                                                                    )}

                                                                    <Alert severity={dateValidation.isValid ? 'success' : 'warning'} sx={{ mt: 2, borderRadius: 2 }}>
                                                                        <strong>Selected Period:</strong> {formatDate(data.valid_from)} to {formatDate(data.valid_to)}
                                                                        {data.fee_type === 'membership_fee' && <span> (Membership Fee Validity)</span>}
                                                                        {data.fee_type === 'maintenance_fee' && data.payment_frequency && <span> ({data.payment_frequency === 'quarterly' ? '1 Quarter' : data.payment_frequency === 'half_yearly' ? '2 Quarters' : data.payment_frequency === 'three_quarters' ? '3 Quarters' : data.payment_frequency === 'annually' ? '4 Quarters' : 'Custom Period'})</span>}
                                                                    </Alert>
                                                                </>
                                                            )}
                                                        </Box>
                                                    </Grid>
                                                )}

                                                {/* Total Amount Summary */}
                                                {data.amount && (
                                                    <Grid item xs={12}>
                                                        <Box
                                                            sx={{
                                                                p: 2,
                                                                bgcolor: 'primary.50',
                                                                borderRadius: 2,
                                                                border: '2px solid',
                                                                borderColor: 'primary.200',
                                                            }}
                                                        >
                                                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#0a3d62' }}>
                                                                💰 Total Amount: {formatCurrency(calculateTotal())}
                                                            </Typography>
                                                            {data.discount_value && (
                                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                                    Original: {formatCurrency(data.amount)} | Discount: {data.discount_type === 'percent' ? `${data.discount_value}%` : formatCurrency(data.discount_value)}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </Grid>
                                                )}

                                                {/* Submit Button */}
                                                <Grid item xs={12}>
                                                    <Button
                                                        type="submit"
                                                        variant="contained"
                                                        size="large"
                                                        fullWidth
                                                        disabled={submitting || !data.fee_type || !data.amount || !data.valid_from || !data.valid_to || !dateValidation.isValid}
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
                                                                Creating Transaction...
                                                            </>
                                                        ) : !dateValidation.isValid ? (
                                                            <>⚠️ Fix Date Conflict First</>
                                                        ) : (
                                                            <>
                                                                <Receipt sx={{ mr: 1 }} />
                                                                Create Transaction
                                                            </>
                                                        )}
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </form>
                                    ) : (
                                        <Alert severity="info">Please search and select a member to create a transaction.</Alert>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

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
