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
    const [paymentMethod, setPaymentMethod] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPaying, setIsPaying] = useState(false);
    const [filter, setFilter] = useState('all');

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

    const handleInvoiceSelect = (invoice) => {
        if (invoice.status !== 'unpaid') return; // only unpaid invoices are selectable
        setSelectedInvoices((prev) => (prev.some((inv) => inv.id === invoice.id) ? prev.filter((inv) => inv.id !== invoice.id) : [...prev, invoice]));
    };

    const handlePaySelected = async () => {
        if (!paymentMethod || selectedInvoices.length === 0) return;
        setIsPaying(true);

        try {
            const ids = selectedInvoices.map((inv) => inv.id);
            await axios.post(`/api/pay-multiple-invoices`, {
                invoice_ids: ids,
                method: paymentMethod,
            });

            setAllInvoices((prev) => prev.map((inv) => (ids.includes(inv.id) ? { ...inv, status: 'paid' } : inv)));
            setSelectedInvoices([]);
            setPaymentMethod('');
        } catch (err) {
            console.error(err);
        } finally {
            setIsPaying(false);
        }
    };

    const getStatusChip = (invoice) => {
        const due = dayjs(invoice.issue_date);
        const isOverdue = invoice.status === 'unpaid' && due.isBefore(dayjs(), 'day');

        if (invoice.status === 'paid') return <Chip label="Paid" color="success" />;
        if (invoice.status === 'cancelled') return <Chip label="Cancelled" color="error" />;
        if (isOverdue) return <Chip label="Overdue" color="warning" />;
        return <Chip label="Unpaid" color="default" />;
    };

    return (
        <Box>
            <AsyncSearchTextField label="Search Customer" name="user" endpoint="/admin/api/search-users" onChange={(e) => setSelectedCustomer(e.target.value)} />

            {loading && <CircularProgress sx={{ mt: 2 }} />}

            {selectedCustomer && (
                <>
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
                            <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handlePaySelected} disabled={isPaying}>
                                {isPaying ? 'Processing...' : `Pay ${selectedInvoices.length} Invoice(s)`}
                            </Button>
                        </Paper>
                    )}

                    {filteredInvoices.map((invoice) => (
                        <Paper key={invoice.id} sx={{ p: 2, mb: 2 }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="body1">
                                        {invoice.invoice_no} (
                                        {invoice.invoice_type
                                            .replace(/-./, ' ')
                                            .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase())
                                            .replace('TYPE', 'Type')}{' '}
                                        - {invoice.subscription_type})
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

                    {!loading && filteredInvoices.length === 0 && <Typography sx={{ mt: 4 }}>No invoices found for selected filter.</Typography>}
                </>
            )}
        </Box>
    );
};

export default InvoiceViewer;
