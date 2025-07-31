import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { Box, Typography, Paper, Chip, Checkbox, Button, CircularProgress, TextField, MenuItem, Tabs, Tab } from '@mui/material';
import AsyncSearchTextField from '@/components/AsyncSearchTextField';
import { enqueueSnackbar } from 'notistack';

const InvoiceViewer = () => {
    const [member, setMember] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [selectedInvoices, setSelectedInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [amountPaid, setAmountPaid] = useState('');
    const [receipt, setReceipt] = useState(null);
    const [activeTab, setActiveTab] = useState('all');

    const fetchInvoices = async (userId) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/member-invoices?user_id=${userId}`);
            setInvoices(res.data.invoices || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (member?.id) {
            fetchInvoices(member.id);
            setSelectedInvoices([]);
        }
    }, [member]);

    const getInvoiceKey = (invoice) => (invoice.id !== 'new' ? `existing-${invoice.id}` : invoice.subscription_type + '-' + (invoice.paid_for_month || invoice.paid_for_quarter || invoice.paid_for_yearly || ''));

    const handleInvoiceSelect = (invoice) => {
        const key = getInvoiceKey(invoice);
        const exists = selectedInvoices.find((i) => i._key === key);

        // Allow de-select anytime
        if (exists) {
            setSelectedInvoices(selectedInvoices.filter((i) => i._key !== key));
            return;
        }

        // Enforce sequential payment: unpaid first, then upcoming
        const sortedInvoices = [...invoices]
            .filter((inv) => inv.status === 'overdue' || inv.status === 'unpaid' || inv.status === 'upcoming')
            .sort((a, b) => {
                const aDate = a.paid_for_month || a.paid_for_quarter || a.paid_for_yearly || a.issue_date || '';
                const bDate = b.paid_for_month || b.paid_for_quarter || b.paid_for_yearly || b.issue_date || '';
                return new Date(aDate) - new Date(bDate);
            });

        const currentIndex = sortedInvoices.findIndex((i) => getInvoiceKey(i) === key);

        const hasEarlierUnselected = sortedInvoices.slice(0, currentIndex).some((inv) => {
            const invKey = getInvoiceKey(inv);
            return !selectedInvoices.some((sel) => sel._key === invKey);
        });

        if (hasEarlierUnselected) {
            enqueueSnackbar('Please select previous unpaid invoices before selecting this.', {
                variant: 'warning',
            });
            return;
        }

        setSelectedInvoices([...selectedInvoices, { ...invoice, _key: key }]);
    };

    const filteredInvoices = invoices.filter((inv) => {
        if (activeTab === 'all') return true;
        if (activeTab === 'paid') return inv.status === 'paid';
        if (activeTab === 'due') return inv.status === 'overdue' || inv.status === 'unpaid';
        if (activeTab === 'upcoming') return inv.status === 'upcoming';
        return true;
    });

    const renderInvoice = (invoice) => {
        const key = getInvoiceKey(invoice);
        const isSelected = selectedInvoices.some((i) => i._key === key);
        const isPayable = invoice.status === 'overdue' || invoice.status === 'upcoming' || invoice.status === 'unpaid';

        const chipColor = invoice.status === 'paid' ? 'success' : invoice.status === 'upcoming' ? 'info' : invoice.status === 'overdue' || invoice.status === 'unpaid' ? 'warning' : 'default';

        const chipLabel = invoice.status === 'paid' ? 'Paid' : invoice.status === 'upcoming' ? 'Upcoming' : invoice.status === 'overdue' ? 'Overdue' : invoice.status === 'unpaid' ? 'Unpaid' : invoice.status;

        return (
            <Paper key={key} sx={{ p: 2, mb: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography fontWeight={500}>
                            ({invoice.invoice_type} - {invoice.subscription_type})
                        </Typography>
                        <Typography variant="body2">Amount: PKR {invoice.amount}</Typography>
                        {invoice.paid_for_month && <Typography variant="body2">For: {invoice.paid_for_month}</Typography>}
                        {invoice.paid_for_quarter && <Typography variant="body2">For: {invoice.paid_for_quarter}</Typography>}
                        {invoice.paid_for_yearly && <Typography variant="body2">For Year: {invoice.paid_for_yearly}</Typography>}
                    </Box>
                    <Box textAlign="right">
                        <Chip label={chipLabel} color={chipColor} />
                        {isPayable && <Checkbox checked={isSelected} onChange={() => handleInvoiceSelect(invoice)} sx={{ ml: 1 }} />}
                    </Box>
                </Box>
            </Paper>
        );
    };

    const handlePaySelected = async () => {
        if (!selectedInvoices.length || !paymentMethod || !amountPaid) {
            enqueueSnackbar('Please select at least one invoice and enter payment details.', {
                variant: 'warning',
            });
            return;
        }

        // Validate chronological payment (no skipped unpaid invoices)
        const sortedInvoices = [...invoices]
            .filter((inv) => inv.status === 'overdue' || inv.status === 'unpaid' || inv.status === 'upcoming')
            .sort((a, b) => {
                const aDate = a.paid_for_month || a.paid_for_quarter || a.paid_for_yearly || a.issue_date || '';
                const bDate = b.paid_for_month || b.paid_for_quarter || b.paid_for_yearly || b.issue_date || '';
                return new Date(aDate) - new Date(bDate);
            });

        const selectedKeys = selectedInvoices.map((inv) => getInvoiceKey(inv));

        for (let i = 0; i < sortedInvoices.length; i++) {
            const key = getInvoiceKey(sortedInvoices[i]);
            const isSelected = selectedKeys.includes(key);

            // If user selected an upcoming invoice but skipped earlier unpaid ones
            if (!isSelected) {
                const remainingSelected = sortedInvoices.slice(i + 1).some((inv) => selectedKeys.includes(getInvoiceKey(inv)));
                if (remainingSelected) {
                    enqueueSnackbar('Cannot pay future invoices without clearing earlier unpaid ones.', {
                        variant: 'error',
                    });
                    return;
                }
            }
        }

        // Proceed to payment
        const formData = new FormData();
        formData.append('customer_id', member.id);
        formData.append('payment_method', paymentMethod);
        formData.append('amount_paid', amountPaid);
        if (receipt) formData.append('receipt', receipt);
        formData.append('invoices', JSON.stringify(selectedInvoices));

        try {
            await axios.post('/api/pay-invoices', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            fetchInvoices(member.id);
            setSelectedInvoices([]);
            setAmountPaid('');
            setPaymentMethod('');
            setReceipt(null);
            enqueueSnackbar('Payment successful', { variant: 'success' });
        } catch (err) {
            enqueueSnackbar('Payment failed', { variant: 'error' });
        }
    };

    const totalAmount = selectedInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);

    return (
        <Box p={2}>
            <AsyncSearchTextField label="Search Member" name="user" endpoint="admin.api.search-users" onChange={(e) => setMember(e.target.value)} />

            <Tabs value={activeTab} onChange={(_, newVal) => setActiveTab(newVal)} sx={{ mt: 2, mb: 2 }} variant="scrollable" scrollButtons="auto">
                <Tab label="All" value="all" />
                <Tab label="Paid" value="paid" />
                <Tab label="Unpaid / Overdue" value="due" />
                <Tab label="Upcoming" value="upcoming" />
            </Tabs>

            {loading ? (
                <CircularProgress sx={{ mt: 4 }} />
            ) : filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => renderInvoice(inv))
            ) : (
                <Typography variant="body2" color="textSecondary" mt={2}>
                    No invoices to show.
                </Typography>
            )}

            {selectedInvoices.length > 0 && (
                <Box mt={4} p={2} borderTop="1px solid #ccc">
                    <Typography variant="h6">Selected Invoices</Typography>
                    <Typography variant="body1">Total: PKR {totalAmount}</Typography>

                    <TextField select fullWidth label="Payment Method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} sx={{ mt: 2 }}>
                        <MenuItem value="cash">Cash</MenuItem>
                        <MenuItem value="credit_card">Credit Card</MenuItem>
                    </TextField>

                    {paymentMethod && <TextField fullWidth label="Paid Amount" type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} sx={{ mt: 2 }} />}

                    {paymentMethod === 'credit_card' && <TextField fullWidth label="Upload Receipt" type="file" InputLabelProps={{ shrink: true }} onChange={(e) => setReceipt(e.target.files[0])} sx={{ mt: 2 }} />}

                    <Button variant="contained" fullWidth sx={{ mt: 3 }} onClick={handlePaySelected}>
                        Finalize & Pay
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default InvoiceViewer;
