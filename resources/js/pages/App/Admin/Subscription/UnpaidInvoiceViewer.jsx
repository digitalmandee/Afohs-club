import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { Box, Typography, Paper, Chip, Checkbox, Button, CircularProgress, TextField, MenuItem } from '@mui/material';
import AsyncSearchTextField from '@/components/AsyncSearchTextField';

const InvoiceViewer = () => {
    const [member, setMember] = useState(null);
    const [invoices, setInvoices] = useState({
        existing_invoices: [],
        due_invoices: [],
        future_invoices: [],
    });
    const [selectedInvoices, setSelectedInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [amountPaid, setAmountPaid] = useState('');
    const [receipt, setReceipt] = useState(null);

    const fetchInvoices = async (userId) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/member-invoices?user_id=${userId}`);
            setInvoices(res.data);
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

    const handleInvoiceSelect = (invoice) => {
        const key = invoice.id !== 'new' ? `existing-${invoice.id}` : invoice.subscription_type + '-' + (invoice.paid_for_month || invoice.paid_for_quarter || invoice.paid_for_yearly || '');

        const exists = selectedInvoices.find((i) => i._key === key);

        if (exists) {
            setSelectedInvoices(selectedInvoices.filter((i) => i._key !== key));
        } else {
            setSelectedInvoices([...selectedInvoices, { ...invoice, _key: key }]);
        }
    };

    const getInvoiceKey = (invoice) => (invoice.id !== 'new' ? `existing-${invoice.id}` : invoice.subscription_type + '-' + (invoice.paid_for_month || invoice.paid_for_quarter || invoice.paid_for_yearly || ''));

    const renderInvoice = (invoice, section) => {
        const key = getInvoiceKey(invoice);
        const isSelected = selectedInvoices.some((i) => i._key === key);
        const isPayable = section === 'due' || section === 'future' || (section === 'existing' && invoice.status !== 'paid');

        const chipColor = invoice.status === 'paid' ? 'success' : section === 'future' ? 'info' : section === 'due' || (section === 'existing' && invoice.status === 'unpaid') ? 'warning' : 'default';

        const chipLabel = invoice.status === 'paid' ? 'Paid' : section === 'future' ? 'Upcoming' : section === 'due' ? 'Due' : invoice.status === 'unpaid' ? 'Unpaid' : invoice.status;

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
            alert('Please fill required payment fields');
            return;
        }

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
        } catch (err) {
            console.log(err);

            alert('Payment failed');
        }
    };

    const totalAmount = selectedInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);

    return (
        <Box p={2}>
            <AsyncSearchTextField label="Search Member" name="user" endpoint="/admin/api/search-users" onChange={(e) => setMember(e.target.value)} />

            {loading ? (
                <CircularProgress sx={{ mt: 4 }} />
            ) : (
                <>
                    {['existing_invoices', 'due_invoices', 'future_invoices'].map((sectionKey) => {
                        const titleMap = {
                            existing_invoices: 'Existing Invoices',
                            due_invoices: 'Due Invoices',
                            future_invoices: 'Upcoming Invoices',
                        };
                        return (
                            invoices[sectionKey]?.length > 0 && (
                                <React.Fragment key={sectionKey}>
                                    <Typography variant="h6" mt={3} mb={1}>
                                        {titleMap[sectionKey]}
                                    </Typography>
                                    {invoices[sectionKey].map((inv) => renderInvoice(inv, sectionKey.replace('_invoices', '')))}
                                </React.Fragment>
                            )
                        );
                    })}
                </>
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
