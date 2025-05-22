import { useState } from 'react';
import { TextField, Button, Paper, Typography, Box, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideNav from '@/components/App/AdminSideBar/SideNav';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;
const Payment = ({ onNext, onBack }) => {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        subscriptionType: 'One Time',
        inputAmount: '10.00',
        customerCharges: '0.00',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form2 Data:', formData);
        onNext(formData);
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
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
                    <IconButton onClick={onBack} sx={{ color: '#000' }}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h5" component="h1" sx={{ ml: 1, fontWeight: 500, color: '#333' }}>
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
                        mb: 3,
                        backgroundColor: '#f0f0f0',
                        borderRadius: '4px',
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
                <Paper sx={{ p: 3, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 500, color: '#2c3e50', mb: 2 }}>
                        Payment Method
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                Payment Subscription
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                    variant={formData.subscriptionType === 'One Time' ? 'contained' : 'outlined'}
                                    sx={{
                                        textTransform: 'none',
                                        backgroundColor: formData.subscriptionType === 'One Time' ? '#0c4b6e' : 'transparent',
                                        color: formData.subscriptionType === 'One Time' ? 'white' : '#333',
                                        borderColor: '#ccc',
                                        '&:hover': { backgroundColor: formData.subscriptionType === 'One Time' ? '#083854' : '#f5f5f5' },
                                    }}
                                    onClick={() => handleInputChange({ target: { name: 'subscriptionType', value: 'One Time' } })}
                                >
                                    One Time
                                </Button>
                                <Button
                                    variant={formData.subscriptionType === 'Monthly' ? 'contained' : 'outlined'}
                                    sx={{
                                        textTransform: 'none',
                                        backgroundColor: formData.subscriptionType === 'Monthly' ? '#0c4b6e' : 'transparent',
                                        color: formData.subscriptionType === 'Monthly' ? 'white' : '#333',
                                        borderColor: '#ccc',
                                        '&:hover': { backgroundColor: formData.subscriptionType === 'Monthly' ? '#083854' : '#f5f5f5' },
                                    }}
                                    onClick={() => handleInputChange({ target: { name: 'subscriptionType', value: 'Monthly' } })}
                                >
                                    Monthly
                                </Button>
                                <Button
                                    variant={formData.subscriptionType === 'Annual' ? 'contained' : 'outlined'}
                                    sx={{
                                        textTransform: 'none',
                                        backgroundColor: formData.subscriptionType === 'Annual' ? '#0c4b6e' : 'transparent',
                                        color: formData.subscriptionType === 'Annual' ? 'white' : '#333',
                                        borderColor: '#ccc',
                                        '&:hover': { backgroundColor: formData.subscriptionType === 'Annual' ? '#083854' : '#f5f5f5' },
                                    }}
                                    onClick={() => handleInputChange({ target: { name: 'subscriptionType', value: 'Annual' } })}
                                >
                                    Annual
                                </Button>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <Box>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Input Amount
                                </Typography>
                                <TextField variant="outlined" size="small" name="inputAmount" value={formData.inputAmount} onChange={handleInputChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                            </Box>
                            <Box>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Customer Charges
                                </Typography>
                                <TextField variant="outlined" size="small" name="customerCharges" value={formData.customerCharges} onChange={handleInputChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
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
