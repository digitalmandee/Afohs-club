import { useState } from 'react';
import { Select, MenuItem, FormControl, InputLabel, Typography, Button, Card, CardContent, TextField, Box, ToggleButton, ToggleButtonGroup, Divider } from '@mui/material';

const Payment = () => {
    const [paymentMethod, setPaymentMethod] = useState('One Time');
    const [inputAmount, setInputAmount] = useState('');
    const [customerCharges, setCustomerCharges] = useState('0,00');

    const handleExactMoney = (amount) => {
        setInputAmount(amount);
        setCustomerCharges('0,00');
    };

    const handlePayNow = () => {
        console.log('Payment:', {
            paymentMethod,
            inputAmount,
            customerCharges,
        });
    };

    return (
        <Box sx={{ p: 4, backgroundColor: '#F6F6F6', minHeight: '100vh' }}>
            <Typography variant="h6" sx={{ fontWeight: 500, color: '#3F4E4F', mb: 3 }}>
                ← Cash Payment
            </Typography>

            <Card sx={{ maxWidth: 600, mx: 'auto', borderRadius: 2 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Payment Method
                    </Typography>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="payment-method-label">Payment Subscription</InputLabel>
                        <Select labelId="payment-method-label" value={paymentMethod} label="Payment Subscription" onChange={(e) => setPaymentMethod(e.target.value)}>
                            <MenuItem value="One Time">One Time</MenuItem>
                            <MenuItem value="Monthly">Monthly</MenuItem>
                            <MenuItem value="Yearly">Yearly</MenuItem>
                        </Select>
                    </FormControl>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <TextField label="Input Amount" value={inputAmount} onChange={(e) => setInputAmount(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="Rs 0,00" fullWidth sx={{ mr: 1 }} />
                        <TextField label="Customer Charges" value={`Rs ${customerCharges}`} disabled fullWidth sx={{ ml: 1 }} />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Exact money
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {[10, 20, 50, 100].map((amt) => (
                                <Button key={amt} variant="outlined" onClick={() => handleExactMoney(`${amt},00`)} sx={{ textTransform: 'none', px: 2, borderColor: '#3F4E4F' }}>
                                    Rs {amt},00
                                </Button>
                            ))}
                        </Box>
                    </Box>

                    <Button variant="contained" onClick={handlePayNow} fullWidth sx={{ backgroundColor: '#003366', textTransform: 'none', py: 1.5 }}>
                        Pay Now
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
};

export default Payment;
