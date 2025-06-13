import { useState } from 'react';
import { TextField, Button, Typography, Box, IconButton, Radio, RadioGroup, FormControlLabel, Paper } from '@mui/material';
import { ArrowBack, ArrowForward, Check } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const Payment = ({ invoice, member, onBack }) => {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        user_id: invoice?.customer?.id,
        inputAmount: invoice?.total_price?.toString() || '0',
        customerCharges: '0.00',
        paymentMethod: 'cash',
        receipt: null,
    });

    const [error, setError] = useState('');

    const minAmount = parseFloat(invoice.total_price || 0);

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;

        if (name === 'receipt') {
            setFormData((prev) => ({ ...prev, receipt: files[0] }));
            return;
        }

        if (name === 'inputAmount') {
            let inputValue = parseFloat(value) || 0;
            inputValue = Math.round(inputValue);
            const charges = inputValue - Math.round(minAmount);
            setFormData((prev) => ({
                ...prev,
                inputAmount: inputValue.toString(),
                customerCharges: charges > 0 ? charges.toString() : '0',
            }));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleQuickAmount = (value) => {
        setFormData((prev) => ({ ...prev, inputAmount: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const inputAmount = parseFloat(formData.inputAmount || '0');

        if (!formData.inputAmount || inputAmount <= 0) {
            setError('Please enter a valid amount.');
            return;
        }

        if (inputAmount < minAmount) {
            setError(`Amount must be at least Rs ${minAmount.toFixed(2)}.`);
            return;
        }

        const data = new FormData();
        data.append('user_id', formData.user_id);
        data.append('amount', invoice.amount); // or any other base you need
        data.append('total_amount', inputAmount);
        data.append('invoice_no', invoice.invoice_no); // optionally link to invoice
        data.append('customer_charges', parseFloat(formData.customerCharges));
        data.append('payment_method', formData.paymentMethod);

        if (formData.paymentMethod === 'credit_card' && formData.receipt) {
            data.append('receipt', formData.receipt);
        }

        try {
            const response = await axios.post(route('subscriptions.payment.store'), data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                setError('');
                enqueueSnackbar('Payment successful', { variant: 'success' });
                router.visit(route('subscription.dashboard'));
            } else {
                setError('Payment failed: ' + (response.data?.message || 'Please check the form data.'));
            }
        } catch (error) {
            console.log(error);

            setError('Payment failed: ' + (error.response?.data?.message || 'Please check the form data.'));
        }
    };

    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                    backgroundColor: '#F6F6F6',
                    minHeight: '100vh',
                    padding: '2rem',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <IconButton onClick={onBack} sx={{ color: '#000' }}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h5" sx={{ ml: 1, fontWeight: 500, color: '#333' }}>
                        Cash Payment
                    </Typography>
                </Box>
                <Box sx={{ maxWidth: '650px', width: '100%', margin: '0 auto' }}>
                    {/* Progress Steps */}
                    <Paper
                        elevation={0}
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 2,
                            mb: 4,
                            backgroundColor: '#e0e0e0',
                            borderRadius: '4px',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                                sx={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    backgroundColor: '#fff',
                                    color: '#333',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 1,
                                    border: '2px solid #333',
                                }}
                            >
                                <Check sx={{ fontSize: 16 }} />
                            </Box>
                            <Typography sx={{ fontWeight: 500, color: '#666' }}>Subscription Detail</Typography>
                        </Box>
                        <Box sx={{ width: '40%', height: '2px', backgroundColor: '#333' }} />
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                                sx={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    backgroundColor: '#2c3e50',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 1,
                                }}
                            >
                                2
                            </Box>
                            <Typography sx={{ fontWeight: 500, color: '#2c3e50' }}>Payment Detail</Typography>
                        </Box>
                    </Paper>

                    {/* Member Details */}
                    {invoice && (
                        <Paper sx={{ p: 2, mb: 4, boxShadow: 'none', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                            <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                                Member Details
                            </Typography>
                            <Typography sx={{ mb: 1 }}>
                                Name: {invoice.customer?.first_name} {invoice.customer?.last_name}
                            </Typography>
                            <Typography sx={{ mb: 1 }}>Email: {invoice.customer?.email}</Typography>
                            <Typography>Membership Type: {invoice.customer?.member?.member_type?.name}</Typography>
                            <Typography>Subscription Category: {invoice.data?.category?.name}</Typography>
                            <Typography>Subscription Type: {invoice.subscription_type}</Typography>
                            <Typography variant="body2" sx={{ color: 'gray', mt: 1 }}>
                                Amount: Rs {invoice.amount} <br />
                                Total: Rs {invoice.total_price}
                            </Typography>
                        </Paper>
                    )}

                    {/* Main Form */}
                    <Box className="bg-white p-4" sx={{ border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                        <Box sx={{ my: 4 }}>
                            <Typography variant="h4" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 2, color: '#333' }}>
                                Payment Method
                            </Typography>
                        </Box>
                        <Typography variant="h6" sx={{ fontSize: '1.125rem', mb: 2, color: '#666' }}>
                            Payment Method
                        </Typography>

                        <RadioGroup row name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} sx={{ mb: 4 }}>
                            <FormControlLabel value="cash" control={<Radio />} label="Cash" />
                            <FormControlLabel value="credit_card" control={<Radio />} label="Credit Card" />
                        </RadioGroup>

                        <Box className="d-flex gap-5 mb-4">
                            <Box className="d-flex flex-column w-50">
                                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500, color: '#666' }}>
                                    Input Amount
                                </Typography>
                                <Box className="d-flex">
                                    <Box className="py-2 px-3 border border-end-0" sx={{ bgcolor: '#dbdbdb', borderColor: '#ccc', display: 'flex', alignItems: 'center' }}>
                                        Rs
                                    </Box>
                                    <TextField
                                        name="inputAmount"
                                        value={formData.inputAmount}
                                        onChange={handleInputChange}
                                        placeholder="10.00"
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '0 4px 4px 0',
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ccc' },
                                                width: '100%',
                                            },
                                        }}
                                        inputProps={{ type: 'number', step: '1', min: '0' }}
                                    />
                                </Box>
                                {/* Show minimum amount below input */}
                                {minAmount > 0 && (
                                    <Typography variant="body2" sx={{ color: 'gray', mt: 1 }}>
                                        Minimum Amount: Rs {Math.round(minAmount)}
                                    </Typography>
                                )}
                            </Box>
                            <Box className="d-flex flex-column w-50">
                                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500, color: '#666' }}>
                                    Customer Charges
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 500, color: '#333' }}>
                                    Rs {Math.round(formData.customerCharges)}
                                </Typography>
                            </Box>
                        </Box>

                        <Box className="d-flex gap-3 mb-4">
                            {['Exact money', '10.00', '20.00', '50.00', '100.00'].map((value) => (
                                <Button
                                    key={value}
                                    variant="outlined"
                                    className="p-2"
                                    onClick={() => handleQuickAmount(value === 'Exact money' ? Math.round(minAmount) : parseInt(value))}
                                    sx={{
                                        textTransform: 'none',
                                        borderColor: '#ccc',
                                        color: '#333',
                                        fontSize: '0.875rem',
                                        '&:hover': { borderColor: '#999', bgcolor: '#f5f5f5' },
                                    }}
                                >
                                    {value === 'Exact money' ? 'Exact money' : `Rs ${value}`}
                                </Button>
                            ))}
                        </Box>

                        {error && (
                            <Typography color="error" sx={{ mb: 2 }}>
                                {error}
                            </Typography>
                        )}

                        {formData.paymentMethod === 'credit_card' && (
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500, color: '#666' }}>
                                    Upload Receipt
                                </Typography>
                                <input type="file" name="receipt" accept="image/*,application/pdf" onChange={handleInputChange} style={{ display: 'block' }} />
                            </Box>
                        )}

                        <Box className="d-flex justify-content-end">
                            <Button
                                variant="contained"
                                className="d-flex align-items-center"
                                onClick={handleSubmit}
                                sx={{
                                    bgcolor: '#0c4b6e',
                                    '&:hover': {
                                        bgcolor: '#083854',
                                    },
                                    textTransform: 'none',
                                }}
                            >
                                Pay Now
                                <ArrowForward sx={{ ml: 1, fontSize: '16px' }} />
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </div>
        </>
    );
};

export default Payment;
