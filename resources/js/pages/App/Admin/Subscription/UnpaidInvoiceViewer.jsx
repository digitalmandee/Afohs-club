import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Autocomplete, Typography, Button, CircularProgress } from '@mui/material';
import AsyncSearchTextField from '@/components/AsyncSearchTextField';

const UnpaidInvoiceViewer = () => {
    const [searchText, setSearchText] = useState('');
    const [customerOptions, setCustomerOptions] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch matching customers when search text changes
    useEffect(() => {
        if (!searchText || searchText.length < 2) return;
        const delayDebounceFn = setTimeout(() => {
            axios
                .get(`/api/customers/search`, { params: { q: searchText } })
                .then((res) => setCustomerOptions(res.data))
                .catch(() => setCustomerOptions([]));
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchText]);

    // Fetch unpaid invoices when customer selected
    useEffect(() => {
        if (!selectedCustomer) return;
        setLoading(true);
        axios
            .get(`/api/unpaid-invoices/${selectedCustomer.id}`)
            .then((res) => setInvoices(res.data))
            .catch(() => setInvoices([]))
            .finally(() => setLoading(false));
    }, [selectedCustomer]);

    const handlePay = async (invoiceId) => {
        try {
            await axios.post(`/api/pay-invoice/${invoiceId}`);
            setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Box>
            <AsyncSearchTextField label="Search Customer" name="user" endpoint="/admin/api/search-users" onChange={(e) => setSelectedCustomer(e.target.value)} />

            {loading && <CircularProgress />}
            {!loading && selectedCustomer && invoices.length === 0 && <Typography>No unpaid invoices found.</Typography>}

            {invoices.map((invoice) => (
                <Box key={invoice.id} sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                    <Typography variant="body1">Invoice #: {invoice.invoice_no}</Typography>
                    <Typography variant="body2">Amount: {invoice.amount}</Typography>
                    <Typography variant="body2">Due from: {invoice.issue_date}</Typography>
                    <Button variant="contained" onClick={() => handlePay(invoice.id)} sx={{ mt: 1 }}>
                        Pay Now
                    </Button>
                </Box>
            ))}
        </Box>
    );
};

export default UnpaidInvoiceViewer;
