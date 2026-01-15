import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Grid, Typography, Box, FormControl, Select, InputLabel, FormHelperText, CircularProgress } from '@mui/material';
import { Payment, CloudUpload, Close } from '@mui/icons-material';

const PaymentDialog = ({ open, onClose, transaction, onConfirm, submitting }) => {
    const [data, setData] = useState({
        payment_method: 'cash',
        credit_card_type: '',
        receipt_file: null,
    });
    const [errors, setErrors] = useState({});

    // Reset state when dialog opens
    useEffect(() => {
        if (open) {
            setData({
                payment_method: 'cash',
                credit_card_type: '',
                receipt_file: null,
            });
            setErrors({});
        }
    }, [open, transaction]);

    const handleChange = (field, value) => {
        setData((prev) => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleChange('receipt_file', file);
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!data.payment_method) {
            newErrors.payment_method = 'Payment method is required';
        }
        if (data.payment_method === 'credit_card' || data.payment_method === 'debit_card') {
            if (!data.credit_card_type) {
                newErrors.credit_card_type = 'Card type is required';
            }
            // Receipt is now OPTIONAL for all methods
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            onConfirm(data);
        }
    };

    if (!transaction) return null;

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return 'Rs 0';
        return `Rs ${parseFloat(amount).toLocaleString()}`;
    };

    const formatDate = (date) => {
        if (!date) return '-';
        try {
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch (error) {
            return date;
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ color: '#0a3d62', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Confirm Payment
                <Button size="small" onClick={onClose} sx={{ minWidth: 'auto', color: 'text.secondary' }}>
                    <Close />
                </Button>
            </DialogTitle>
            <DialogContent>
                {/* Transaction Summary */}
                <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                                Invoice No:
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                                {transaction.invoice_no}
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" color="text.secondary">
                                Amount:
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color="primary.main">
                                {formatCurrency(transaction.total_price || transaction.amount)}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                                Type:
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                                {transaction.fee_type?.replace(/_/g, ' ').toUpperCase() || transaction.invoice_type?.replace(/_/g, ' ').toUpperCase()}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sx={{ mt: 1, borderTop: '1px dashed #e0e0e0', pt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Member:
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                                {transaction.member?.full_name || transaction.customer?.name || 'N/A'}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>

                {/* Form Fields */}
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <FormControl fullWidth size="small" error={!!errors.payment_method}>
                            <InputLabel>Payment Method</InputLabel>
                            <Select value={data.payment_method} label="Payment Method" onChange={(e) => handleChange('payment_method', e.target.value)}>
                                <MenuItem value="cash">Cash</MenuItem>
                                <MenuItem value="credit_card">Credit Card</MenuItem>
                                <MenuItem value="debit_card">Debit Card</MenuItem>
                                <MenuItem value="cheque">Cheque</MenuItem>
                                <MenuItem value="online">Online Transfer</MenuItem>
                            </Select>
                            {errors.payment_method && <FormHelperText>{errors.payment_method}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    {(data.payment_method === 'credit_card' || data.payment_method === 'debit_card') && (
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small" error={!!errors.credit_card_type}>
                                <InputLabel>Card Type</InputLabel>
                                <Select value={data.credit_card_type} label="Card Type" onChange={(e) => handleChange('credit_card_type', e.target.value)}>
                                    <MenuItem value="visa">Visa</MenuItem>
                                    <MenuItem value="mastercard">MasterCard</MenuItem>
                                </Select>
                                {errors.credit_card_type && <FormHelperText>{errors.credit_card_type}</FormHelperText>}
                            </FormControl>
                        </Grid>
                    )}

                    {(data.payment_method === 'credit_card' || data.payment_method === 'debit_card' || data.payment_method === 'cheque' || data.payment_method === 'online') && (
                        <Grid item xs={12} sm={data.payment_method === 'credit_card' || data.payment_method === 'debit_card' ? 6 : 12}>
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                startIcon={<CloudUpload />}
                                sx={{
                                    height: '40px',
                                    color: errors.receipt_file ? 'error.main' : 'primary.main',
                                    borderColor: errors.receipt_file ? 'error.main' : 'rgba(0, 0, 0, 0.23)',
                                }}
                            >
                                {data.receipt_file ? 'Change Receipt' : 'Upload Receipt (Optional)'}
                                <input type="file" hidden accept="image/*,.pdf" onChange={handleFileChange} />
                            </Button>
                            {errors.receipt_file && (
                                <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 0.5, display: 'block' }}>
                                    {errors.receipt_file}
                                </Typography>
                            )}
                            {data.receipt_file && (
                                <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5, textAlign: 'center' }}>
                                    Selected: {data.receipt_file.name}
                                </Typography>
                            )}
                        </Grid>
                    )}

                    {(data.payment_method === 'cheque' || data.payment_method === 'online' || data.payment_method === 'credit_card' || data.payment_method === 'debit_card') && (
                        <Grid item xs={12}>
                            <TextField fullWidth size="small" label={data.payment_method === 'cheque' ? 'Cheque No' : data.payment_method === 'online' ? 'Transaction ID/Ref' : 'Card No (Last 4) / Ref'} value={data.payment_mode_details || ''} onChange={(e) => handleChange('payment_mode_details', e.target.value)} />
                        </Grid>
                    )}
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} disabled={submitting} color="inherit">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} variant="contained" color="success" disabled={submitting} startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Payment />}>
                    {submitting ? 'Processing...' : 'Save & Receive'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PaymentDialog;
