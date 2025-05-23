import { useState } from 'react';
import { TextField, Button, Typography, Box, IconButton, Radio, RadioGroup, FormControlLabel, Paper } from '@mui/material';
import { ArrowBack, ArrowForward, Check } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router } from '@inertiajs/react';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const Payment = ({ member, onBack, memberTypes }) => {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        user_id: '1',
        subscriptionType: 'One Time',
        inputAmount: '10.00',
        customerCharges: '0.00',
    });
    const [error, setError] = useState('');
    console.log('memberTypes data', memberTypes);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleQuickAmount = (value) => {
        setFormData((prev) => ({ ...prev, inputAmount: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.inputAmount || parseFloat(formData.inputAmount) <= 0) {
            setError('Please enter a valid amount.');
            return;
        }

        const paymentData = {
            user_id: member?.id || formData.user_id,
            subscription_type: formData.subscriptionType,
            amount: parseFloat(formData.inputAmount),
            customer_charges: parseFloat(formData.customerCharges),
        };

        console.log('Sending payment data:', paymentData);

        router.post('/admin/membership/payments/store', paymentData, {
            onSuccess: () => {
                setError('');
                router.visit('/admin/membership/history');
            },
            onError: (errors) => {
                setError('Payment failed: ' + (errors.message || 'Please check the form data.'));
            },
        });
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
                    padding: '0 2rem',
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
                        <Typography sx={{ fontWeight: 500, color: '#666' }}>Member Detail</Typography>
                    </Box>
                    <Box sx={{ width: '50%', height: '2px', backgroundColor: '#333' }} />
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
                {member && (
                    <Paper sx={{ p: 2, mb: 4, boxShadow: 'none', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                        <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                            Member Details
                        </Typography>
                        <Typography sx={{ mb: 1 }}>
                            Name: {member.first_name} {member.last_name}
                        </Typography>
                        <Typography sx={{ mb: 1 }}>Email: {member.email}</Typography>
                        <Typography>Membership Number: {member.userDetail?.members[0]?.membership_number}</Typography>
                    </Paper>
                )}

                {/* Main Form */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 2, color: '#333' }}>
                        Payment Method
                    </Typography>
                </Box>
                <Box className="bg-white p-4" sx={{ border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                    <Typography variant="h6" sx={{ fontSize: '1.125rem', mb: 3, color: '#666' }}>
                        Payment Subscription
                    </Typography>

                    <Box className="d-flex gap-3 mb-4">
                        <RadioGroup row name="subscriptionType" value={formData.subscriptionType} onChange={handleInputChange}>
                            {['One Time', 'Monthly', 'Annual'].map((type) => (
                                <Box
                                    key={type}
                                    className="d-flex align-items-center p-2 border"
                                    sx={{
                                        borderRadius: '4px',
                                        bgcolor: formData.subscriptionType === type ? '#f0f0f0' : 'transparent',
                                        borderColor: '#ccc',
                                    }}
                                >
                                    <FormControlLabel value={type} control={<Radio sx={{ color: '#1976d2' }} />} label={type} sx={{ margin: 0, '& .MuiTypography-root': { fontSize: '0.875rem' } }} />
                                </Box>
                            ))}
                        </RadioGroup>
                    </Box>

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
                                    inputProps={{ type: 'text', pattern: '[0-9.]*' }}
                                />
                            </Box>
                        </Box>
                        <Box className="d-flex flex-column w-50">
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500, color: '#666' }}>
                                Customer Charges
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 500, color: '#333' }}>
                                Rs {formData.customerCharges}
                            </Typography>
                        </Box>
                    </Box>

                    <Box className="d-flex gap-3 mb-4">
                        {['Exact money', '10.00', '20.00', '50.00', '100.00'].map((value) => (
                            <Button
                                key={value}
                                variant="outlined"
                                className="p-2"
                                onClick={() => handleQuickAmount(value === 'Exact money' ? '' : value)}
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

                    <Box className="d-flex justify-content-end">
                        <Button
                            variant="contained"
                            className="d-flex align-items-center"
                            onClick={handleSubmit}
                            sx={{
                                bgcolor: '#0056b3',
                                color: '#fff',
                                textTransform: 'none',
                                padding: '8px 16px',
                                fontSize: '0.875rem',
                                '&:hover': { bgcolor: '#004085' },
                            }}
                        >
                            Pay Now
                            <ArrowForward sx={{ ml: 1, fontSize: '16px' }} />
                        </Button>
                    </Box>
                </Box>
            </div>
        </>
    );
};

export default Payment;
