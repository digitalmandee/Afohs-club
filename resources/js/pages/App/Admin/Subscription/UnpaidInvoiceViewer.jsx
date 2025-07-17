import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Button, CircularProgress, Paper, Checkbox, FormControlLabel, Divider, RadioGroup, Radio, TextField, Stack, Chip, ToggleButtonGroup, ToggleButton } from '@mui/material';
import AsyncSearchTextField from '@/components/AsyncSearchTextField';
import dayjs from 'dayjs';

const InvoiceViewer = () => {
    const [searchText, setSearchText] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [allInvoices, setAllInvoices] = useState([]);
    const [selectedInvoices, setSelectedInvoices] = useState([]);
    // const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [receiptFile, setReceiptFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
    const [subscriptions, setSubscriptions] = useState([]);
    const [memberDetails, setMemberDetails] = useState(null);
    const [newInvoiceData, setNewInvoiceData] = useState({
        invoice_type: 'membership',
        subscription_type: 'one_time',
        selected_subscription_id: null,
        base_fee: 0,
        subscription_fee: 0,
        selected_quarters: [],
        amount: '',
        discount_type: '',
        discount_value: '',
    });

    useEffect(() => {
        if (!selectedCustomer) return;
        setLoading(true);
        axios
            .get(`/api/customer-invoices/${selectedCustomer.id}`)
            .then((res) => setAllInvoices(res.data))
            .catch(() => setAllInvoices([]))
            .finally(() => setLoading(false));
    }, [selectedCustomer]);

    const filteredInvoices = allInvoices.filter((inv) => {
        const dueDate = dayjs(inv.issue_date);
        const isOverdue = inv.status === 'unpaid' && dueDate.isBefore(dayjs(), 'day');
        switch (filter) {
            case 'paid':
                return inv.status === 'paid';
            case 'unpaid':
                return inv.status === 'unpaid' && !isOverdue;
            case 'cancelled':
                return inv.status === 'cancelled';
            case 'overdue':
                return isOverdue;
            default:
                return true;
        }
    });

    useEffect(() => {
        if (!selectedCustomer || !invoiceModalOpen) return;

        if (newInvoiceData.invoice_type === 'membership') {
            axios.get(`/api/members/by-user/${selectedCustomer.id}`).then((res) => {
                setMemberDetails(res.data);
                setNewInvoiceData((prev) => ({
                    ...prev,
                    amount: res.data.member_category?.fee || '',
                }));
            });
        } else {
            axios.get(`/api/subscriptions/by-user/${selectedCustomer.id}`).then((res) => {
                setSubscriptions(res.data);
                setNewInvoiceData((prev) => ({
                    ...prev,
                    amount: '',
                    selected_subscription_id: null,
                    subscription_type: '',
                }));
            });
        }
    }, [invoiceModalOpen, newInvoiceData.invoice_type]);

    const handleInvoiceSelect = (invoice) => {
        if (invoice.status !== 'unpaid') return;
        setSelectedInvoices((prev) => (prev.some((inv) => inv.id === invoice.id) ? prev.filter((inv) => inv.id !== invoice.id) : [...prev, invoice]));
    };

    const handlePaySelected = async () => {
        if (!paymentMethod || selectedInvoices.length === 0) return;
        const formData = new FormData();
        formData.append(
            'invoice_ids',
            selectedInvoices.map((inv) => inv.id),
        );
        formData.append('method', paymentMethod);
        if (receiptFile) formData.append('receipt', receiptFile);

        try {
            await axios.post('/api/pay-multiple-invoices', formData);
            setSelectedInvoices([]);
            setPaymentMethod('cash');
            setReceiptFile(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateAndPay = async () => {
        if (!selectedCustomer || !newInvoiceData.amount) return;

        const formData = new FormData();
        formData.append('customer_id', selectedCustomer.id);
        formData.append('invoice_type', newInvoiceData.invoice_type);
        formData.append('subscription_type', newInvoiceData.subscription_type);
        formData.append('amount', newInvoiceData.amount);
        formData.append('discount_type', newInvoiceData.discount_type);
        formData.append('discount_value', newInvoiceData.discount_value);
        formData.append('prepay_quarters', newInvoiceData.prepay_quarters);
        formData.append('method', paymentMethod);
        if (newInvoiceData.selected_subscription_id) formData.append('subscription_id', newInvoiceData.selected_subscription_id);
        if (receiptFile) formData.append('receipt', receiptFile);

        try {
            await axios.post('/api/create-and-pay-invoice', formData);
            setInvoiceModalOpen(false);
        } catch (err) {
            console.error(err);
        }
    };

    const getStatusChip = (invoice) => {
        const due = dayjs(invoice.issue_date);
        const isOverdue = invoice.status === 'unpaid' && due.isBefore(dayjs());
        if (invoice.status === 'paid') return <Chip label="Paid" color="success" />;
        if (invoice.status === 'cancelled') return <Chip label="Cancelled" color="error" />;
        if (isOverdue) return <Chip label="Overdue" color="warning" />;
        return <Chip label="Unpaid" />;
    };

    return (
        <Box>
            <AsyncSearchTextField label="Search Customer" name="user" endpoint="/admin/api/search-users" onChange={(e) => setSelectedCustomer(e.target.value)} />

            <Button variant="outlined" onClick={() => setInvoiceModalOpen(true)} sx={{ mt: 2 }}>
                Create & Pay New Invoice
            </Button>

            {invoiceModalOpen && (
                <Paper sx={{ p: 3, mt: 3 }}>
                    <Typography variant="h6">Create New Invoice</Typography>

                    <ToggleButtonGroup value={newInvoiceData.invoice_type} exclusive onChange={(e, val) => val && setNewInvoiceData((prev) => ({ ...prev, invoice_type: val }))} sx={{ mb: 2 }}>
                        <ToggleButton value="membership">Membership</ToggleButton>
                        <ToggleButton value="subscription">Subscription</ToggleButton>
                    </ToggleButtonGroup>

                    {newInvoiceData.invoice_type === 'membership' && memberDetails && (
                        <Box>
                            <Typography variant="body1">Category: {memberDetails.member_category?.name}</Typography>
                            <Typography variant="body2">Base Fee: PKR {memberDetails.member_category?.fee}</Typography>

                            <TextField
                                select
                                fullWidth
                                label="Select Payment Type"
                                value={newInvoiceData.subscription_type}
                                onChange={(e) => {
                                    const type = e.target.value;
                                    let amount = 0;

                                    if (type === 'one_time') {
                                        amount = memberDetails.member_category?.fee || 0;
                                    } else if (type === 'monthly') {
                                        amount = memberDetails.member_category?.subscription_fee || 0;
                                    } else if (type === 'yearly') {
                                        amount = (memberDetails.member_category?.subscription_fee || 0) * 12;
                                    } else if (type === 'quarter') {
                                        amount = 0; // will be set when quarters selected
                                    }

                                    setNewInvoiceData((prev) => ({
                                        ...prev,
                                        subscription_type: type,
                                        base_fee: memberDetails.member_category?.fee || 0,
                                        subscription_fee: memberDetails.member_category?.subscription_fee || 0,
                                        selected_quarters: [],
                                        amount,
                                    }));
                                }}
                                SelectProps={{ native: true }}
                                sx={{ my: 2 }}
                            >
                                <option value="one_time">One Time</option>
                                <option value="monthly">Monthly</option>
                                <option value="quarter">Quarterly</option>
                                <option value="yearly">Yearly</option>
                            </TextField>

                            {newInvoiceData.subscription_type === 'quarter' && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        Select Quarters to Pay:
                                    </Typography>
                                    <ToggleButtonGroup
                                        value={newInvoiceData.selected_quarters}
                                        onChange={(e, val) => {
                                            const fee = memberDetails.member_category?.subscription_fee || 0;
                                            setNewInvoiceData((prev) => ({
                                                ...prev,
                                                selected_quarters: val,
                                                amount: val.length * 3 * fee,
                                            }));
                                        }}
                                        aria-label="quarter-selection"
                                    >
                                        <ToggleButton value={1}>Q1</ToggleButton>
                                        <ToggleButton value={2}>Q2</ToggleButton>
                                        <ToggleButton value={3}>Q3</ToggleButton>
                                        <ToggleButton value={4}>Q4</ToggleButton>
                                    </ToggleButtonGroup>
                                </Box>
                            )}
                        </Box>
                    )}

                    {newInvoiceData.invoice_type === 'subscription' && (
                        <Box>
                            <TextField
                                select
                                fullWidth
                                label="Select Subscription"
                                value={newInvoiceData.selected_subscription_id || ''}
                                onChange={(e) => {
                                    const sub = subscriptions.find((s) => s.id === Number(e.target.value));
                                    setNewInvoiceData((prev) => ({
                                        ...prev,
                                        selected_subscription_id: sub.id,
                                        subscription_type: 'one_time',
                                        base_fee: sub.category?.fee,
                                        subscription_fee: sub.category?.subscription_fee,
                                        selected_quarters: [],
                                        amount: sub.category?.fee,
                                    }));
                                }}
                                SelectProps={{ native: true }}
                                sx={{ mb: 2 }}
                            >
                                <option value="">Select</option>
                                {subscriptions.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.category} ({s.subscription_type})
                                    </option>
                                ))}
                            </TextField>

                            {newInvoiceData.selected_subscription_id && (
                                <>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Select Payment Type"
                                        value={newInvoiceData.subscription_type}
                                        onChange={(e) => {
                                            const type = e.target.value;
                                            let amount = 0;
                                            const fee = newInvoiceData.base_fee || 0;
                                            const subFee = newInvoiceData.subscription_fee || 0;

                                            if (type === 'one_time') amount = fee;
                                            if (type === 'monthly') amount = subFee;
                                            if (type === 'yearly') amount = subFee * 12;
                                            if (type === 'quarter') amount = 0;

                                            setNewInvoiceData((prev) => ({
                                                ...prev,
                                                subscription_type: type,
                                                selected_quarters: [],
                                                amount,
                                            }));
                                        }}
                                        SelectProps={{ native: true }}
                                        sx={{ mb: 2 }}
                                    >
                                        <option value="one_time">One Time</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="quarter">Quarterly</option>
                                        <option value="yearly">Yearly</option>
                                    </TextField>

                                    {newInvoiceData.subscription_type === 'quarter' && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2" sx={{ mb: 1 }}>
                                                Select Quarters to Pay:
                                            </Typography>
                                            <ToggleButtonGroup
                                                value={newInvoiceData.selected_quarters}
                                                onChange={(e, val) => {
                                                    const fee = newInvoiceData.subscription_fee || 0;
                                                    setNewInvoiceData((prev) => ({
                                                        ...prev,
                                                        selected_quarters: val,
                                                        amount: val.length * 3 * fee,
                                                    }));
                                                }}
                                                aria-label="quarter-selection"
                                            >
                                                <ToggleButton value={1}>Q1</ToggleButton>
                                                <ToggleButton value={2}>Q2</ToggleButton>
                                                <ToggleButton value={3}>Q3</ToggleButton>
                                                <ToggleButton value={4}>Q4</ToggleButton>
                                            </ToggleButtonGroup>
                                        </Box>
                                    )}
                                </>
                            )}
                        </Box>
                    )}

                    <Stack spacing={2}>
                        <TextField label="Amount" type="number" value={newInvoiceData.amount} onChange={(e) => setNewInvoiceData((prev) => ({ ...prev, amount: e.target.value }))} />
                        <RadioGroup row value={newInvoiceData.discount_type} onChange={(e) => setNewInvoiceData((prev) => ({ ...prev, discount_type: e.target.value }))}>
                            <FormControlLabel value="fixed" control={<Radio />} label="Fixed" />
                            <FormControlLabel value="percentage" control={<Radio />} label="%" />
                        </RadioGroup>
                        <TextField label="Discount Value" type="number" value={newInvoiceData.discount_value} onChange={(e) => setNewInvoiceData((prev) => ({ ...prev, discount_value: e.target.value }))} />
                        <Button variant="contained" onClick={handleCreateAndPay}>
                            Pay & Create Invoice
                        </Button>
                    </Stack>
                </Paper>
            )}

            <ToggleButtonGroup value={filter} exclusive onChange={(e, val) => val && setFilter(val)} sx={{ my: 2 }}>
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="paid">Paid</ToggleButton>
                <ToggleButton value="unpaid">Unpaid</ToggleButton>
                <ToggleButton value="overdue">Overdue</ToggleButton>
                <ToggleButton value="cancelled">Cancelled</ToggleButton>
            </ToggleButtonGroup>

            {selectedInvoices.length > 0 && (
                <Paper sx={{ p: 2, backgroundColor: '#f7f7f7', mb: 2 }}>
                    <Typography variant="h6">Selected Invoices</Typography>
                    {selectedInvoices.map((inv) => (
                        <Typography key={inv.id} variant="body2">
                            {inv.invoice_no} - {inv.invoice_type} - PKR {inv.amount}
                        </Typography>
                    ))}
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1">Choose Payment Method:</Typography>
                    <RadioGroup row value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                        <FormControlLabel value="cash" control={<Radio />} label="Cash" />
                        <FormControlLabel value="card" control={<Radio />} label="Credit Card" />
                    </RadioGroup>
                    {paymentMethod === 'card' && (
                        <Stack spacing={2} sx={{ mt: 2 }}>
                            <TextField label="Card Number" fullWidth />
                            <TextField label="Card Holder Name" fullWidth />
                            <TextField label="Expiry Date" fullWidth />
                        </Stack>
                    )}
                    {selectedInvoices.some((inv) => inv.subscription_type === 'quarter') && (
                        <Box sx={{ mt: 2 }}>
                            <TextField type="number" label="Prepay Future Quarters" inputProps={{ min: 0, max: 4 }} value={prepayCount} onChange={(e) => setPrepayCount(Math.min(4, Math.max(0, parseInt(e.target.value || '0'))))} />
                        </Box>
                    )}
                    <Button variant="contained" sx={{ mt: 2 }} onClick={handlePaySelected} disabled={isPaying}>
                        {isPaying ? 'Processing...' : `Pay ${selectedInvoices.length} Invoice(s)`}
                    </Button>
                </Paper>
            )}

            {filteredInvoices.map((invoice) => (
                <Paper key={invoice.id} sx={{ p: 2, mb: 2 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                            <Typography variant="body1">
                                {invoice.invoice_no} ({invoice.invoice_type} - {invoice.subscription_type})
                            </Typography>
                            <Typography variant="body2">Amount: PKR {invoice.amount}</Typography>
                            <Typography variant="body2">Due: {dayjs(invoice.issue_date).format('YYYY-MM-DD')}</Typography>
                        </Box>
                        <Box textAlign="right">
                            {getStatusChip(invoice)}
                            {invoice.status === 'unpaid' && <Checkbox checked={selectedInvoices.some((inv) => inv.id === invoice.id)} onChange={() => handleInvoiceSelect(invoice)} sx={{ ml: 2 }} />}
                        </Box>
                    </Box>
                </Paper>
            ))}
        </Box>
    );
};

export default InvoiceViewer;
