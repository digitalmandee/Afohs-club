import { useState } from 'react';
import { TextField, Button, Typography, Box, IconButton, Radio, RadioGroup, FormControlLabel, Paper } from '@mui/material';
import { ArrowBack, ArrowForward, Check } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router } from '@inertiajs/react';
import axios from 'axios';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const Payment = ({ member, onBack }) => {
    const [open, setOpen] = useState(true);
    const [formData, setFormData] = useState({
        user_id: member?.id,
        subscriptionType: 'one_time',
        inputAmount: '0',
        customerCharges: '0.00',
        paymentMethod: 'cash',
        receipt: null,
    });

    const [error, setError] = useState('');

    const subscriptionTypes = [
        { label: 'One Time', value: 'one_time' },
        { label: 'Monthly', value: 'monthly' },
        { label: 'Annual', value: 'annual' },
    ];

    const getMinimumAmount = () => {
        const { subscriptionType } = formData;
        const memberType = member?.member?.member_type;

        const fee = parseFloat(memberType?.fee || 0);
        const maintenance = parseFloat(memberType?.maintenance_fee || 0);
        const discountType = memberType?.discount_type;
        const discountValue = parseFloat(memberType?.discount_value || 0);
        const baseDuration = parseInt(memberType?.duration || 1);

        let totalWithoutDiscount = 0;
        let duration = baseDuration;

        if (subscriptionType === 'one_time') {
            totalWithoutDiscount = (fee + maintenance) * baseDuration;
        } else if (subscriptionType === 'monthly') {
            totalWithoutDiscount = fee + maintenance;
            duration = 1;
        } else if (subscriptionType === 'annual') {
            totalWithoutDiscount = (fee + maintenance) * 12;
            duration = 12;
        }

        let totalWithDiscount = totalWithoutDiscount;

        if (discountType === '%') {
            totalWithDiscount -= (totalWithoutDiscount * discountValue) / 100;
        } else if (discountType === 'Rs') {
            totalWithDiscount -= discountValue;
        }

        return {
            amount: totalWithoutDiscount,
            total: totalWithDiscount,
            duration,
        };
    };

    const { total } = getMinimumAmount();
    const minAmount = total;

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;

        if (name === 'receipt') {
            setFormData((prev) => ({ ...prev, receipt: files[0] }));
            return;
        }

        if (name === 'inputAmount') {
            let inputValue = parseFloat(value) || 0;
            inputValue = Math.round(inputValue); // Round to nearest whole number
            const charges = inputValue - Math.round(minAmount);
            setFormData((prev) => ({
                ...prev,
                inputAmount: inputValue.toString(),
                customerCharges: charges > 0 ? charges.toString() : '0',
            }));
            return;
        } else if (name === 'subscriptionType') {
            const newFormData = {
                ...formData,
                subscriptionType: value,
            };

            const { total: newMinAmount } = getMinimumAmount(); // Recalculate with new type
            const inputValue = Math.round(parseFloat(newFormData.inputAmount) || 0);
            const charges = inputValue - Math.round(newMinAmount);

            setFormData({
                ...newFormData,
                inputAmount: inputValue.toString(),
                customerCharges: charges > 0 ? charges.toString() : '0',
            });

            return;
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleQuickAmount = (value) => {
        setFormData((prev) => ({ ...prev, inputAmount: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const inputAmount = parseFloat(formData.inputAmount || '0');
        const { amount, total, duration } = getMinimumAmount();

        if (!formData.inputAmount || inputAmount <= 0) {
            setError('Please enter a valid amount.');
            return;
        }

        if (inputAmount < total) {
            setError(`Amount must be at least Rs ${total.toFixed(2)}.`);
            return;
        }

        const data = new FormData();
        data.append('user_id', formData.user_id);
        data.append('subscription_type', formData.subscriptionType);
        data.append('amount', amount);
        data.append('total_amount', inputAmount);
        data.append('member_type_id', member?.member?.member_type?.id);
        data.append('customer_charges', parseFloat(formData.customerCharges));
        data.append('payment_method', formData.paymentMethod);
        data.append('duration', duration);

        if (formData.paymentMethod === 'credit_card' && formData.receipt) {
            data.append('receipt', formData.receipt);
        }

        try {
            const response = await axios.post(route('membership.payment.store'), data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                setError('');
                router.visit(route('membership.history'));
            } else {
                setError('Payment failed: ' + (response.data?.message || 'Please check the form data.'));
            }
        } catch (error) {
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
                            {/* {JSON.stringify(member.member?.member_type, null, 2)} */}
                            <Typography>Membership Type: {member.member?.member_type?.name}</Typography>
                            <Typography variant="body2" sx={{ color: 'gray', mt: 1 }}>
                                Subscription Fee: Rs {parseFloat(member?.member?.member_type?.fee || 0).toFixed(2)} <br />
                                Maintenance Fee: Rs {parseFloat(member?.member?.member_type?.maintenance_fee || 0).toFixed(2)} <br />
                                Total ({formData.subscriptionType}): Rs {minAmount.toFixed(2)}
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

                        <Typography variant="h6" sx={{ fontSize: '1.125rem', mb: 3, color: '#666' }}>
                            Payment Subscription
                        </Typography>

                        <Box className="d-flex gap-3 mb-4">
                            <RadioGroup row name="subscriptionType" value={formData.subscriptionType} onChange={handleInputChange}>
                                {subscriptionTypes.map(({ label, value }) => (
                                    <Box
                                        key={value}
                                        className="d-flex align-items-center p-2 border"
                                        sx={{
                                            borderRadius: '4px',
                                            bgcolor: formData.subscriptionType === value ? '#f0f0f0' : 'transparent',
                                            borderColor: '#ccc',
                                        }}
                                    >
                                        <FormControlLabel value={value} control={<Radio sx={{ color: '#1976d2' }} />} label={label} sx={{ margin: 0, '& .MuiTypography-root': { fontSize: '0.875rem' } }} />
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
