import { useState } from 'react';
import { TextField, Button, Paper, Typography, Box, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
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

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.inputAmount || parseFloat(formData.inputAmount) <= 0) {
            setError('Please enter a valid amount.');
            return;
        }

        const paymentData = {
            user_id: member?.id || formData.user_id, // fallback to formData value
            subscription_type: formData.subscriptionType,
            amount: parseFloat(formData.inputAmount),
            customer_charges: parseFloat(formData.customerCharges),
        };

        console.log('Sending payment data:', paymentData);

        // Send payment data to backend
        router.post('/admin/membership/payments/store', paymentData, {
            onSuccess: () => {
                setError('');
                // Optionally navigate to a success page or show a confirmation
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
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2, pl: 2 }}>
                    <IconButton onClick={onBack} sx={{ color: '#000' }}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h5" component="h1" sx={{ ml: 1, fontWeight: 500, color: '#333' }}>
                        Cash Payment
                    </Typography>
                </Box>

                {/* Member Details */}
                {member && (
                    <Paper sx={{ p: 2, mb: 3, boxShadow: 'none', border: '1px solid #e0e0e0', ml: 2, mr: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Member Details
                        </Typography>
                        <Typography>
                            Name: {member.first_name} {member.last_name}
                        </Typography>
                        <Typography>Email: {member.email}</Typography>
                        <Typography>Membership Number: {member.userDetail?.members[0]?.membership_number}</Typography>
                    </Paper>
                )}

                {/* Progress Steps */}
                <Paper
                    elevation={0}
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        mb: 3,
                        backgroundColor: '#f0f0f0',
                        borderRadius: '4px',
                        ml: 2,
                        mr: 2,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                            sx={{
                                width: 30,
                                height: 30,
                                borderRadius: '50%',
                                backgroundColor: '#e0e0e0',
                                color: '#333',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 2,
                            }}
                        >
                            1
                        </Box>
                        <Typography sx={{ fontWeight: 500 }}>Member Detail</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                            sx={{
                                width: 30,
                                height: 30,
                                borderRadius: '50%',
                                backgroundColor: '#2c3e50',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 2,
                            }}
                        >
                            2
                        </Box>
                        <Typography sx={{ fontWeight: 500 }}>Payment Detail</Typography>
                    </Box>
                </Paper>

                {/* Main Form */}
                <Paper sx={{ p: 3, boxShadow: 'none', border: '1px solid #e0e0e0', ml: 2, mr: 2 }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 500, color: '#2c3e50', mb: 2 }}>
                        Payment Method
                    </Typography>

                    {error && (
                        <Typography variant="body2" sx={{ color: 'red', mb: 2 }}>
                            {error}
                        </Typography>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                Payment Subscription
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                {['One Time', 'Monthly', 'Annual'].map((type) => (
                                    <Button
                                        key={type}
                                        variant={formData.subscriptionType === type ? 'contained' : 'outlined'}
                                        sx={{
                                            textTransform: 'none',
                                            backgroundColor: formData.subscriptionType === type ? '#0c4b6e' : 'transparent',
                                            color: formData.subscriptionType === type ? 'white' : '#333',
                                            borderColor: '#ccc',
                                            '&:hover': { backgroundColor: formData.subscriptionType === type ? '#083854' : '#f5f5f5' },
                                        }}
                                        onClick={() => handleInputChange({ target: { name: 'subscriptionType', value: type } })}
                                    >
                                        {type}
                                    </Button>
                                ))}
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <Box>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Input Amount
                                </Typography>
                                <TextField variant="outlined" size="small" name="inputAmount" value={formData.inputAmount} onChange={handleInputChange} type="number" step="0.01" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                            </Box>
                            <Box>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Customer Charges
                                </Typography>
                                <TextField variant="outlined" size="small" name="customerCharges" value={formData.customerCharges} onChange={handleInputChange} type="number" step="0.01" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                            <Typography variant="body2">Exact money</Typography>
                            {['10.00', '20.00', '50.00', '100.00'].map((amount) => (
                                <Button
                                    key={amount}
                                    variant={formData.inputAmount === amount ? 'contained' : 'outlined'}
                                    sx={{
                                        textTransform: 'none',
                                        backgroundColor: formData.inputAmount === amount ? '#0c4b6e' : 'transparent',
                                        color: formData.inputAmount === amount ? 'white' : '#333',
                                        borderColor: '#ccc',
                                        '&:hover': { backgroundColor: formData.inputAmount === amount ? '#083854' : '#f5f5f5' },
                                    }}
                                    onClick={() => handleInputChange({ target: { name: 'inputAmount', value: amount } })}
                                >
                                    Rs {amount}
                                </Button>
                            ))}
                        </Box>

                        <Button
                            variant="contained"
                            type="submit"
                            sx={{
                                textTransform: 'none',
                                backgroundColor: '#0c4b6e',
                                '&:hover': { backgroundColor: '#083854' },
                            }}
                        >
                            Pay Now
                        </Button>
                    </form>
                </Paper>
            </div>
        </>
    );
};

export default Payment;
