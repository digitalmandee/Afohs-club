import { useOrderStore } from '@/stores/useOrderStore';
import { router } from '@inertiajs/react';
import { Close as CloseIcon, CreditCard as CreditCardIcon, Edit as EditIcon, Print as PrintIcon, Receipt as ReceiptIcon } from '@mui/icons-material';
import { Avatar, Box, Button, Chip, Divider, Grid, IconButton, Paper, TextField, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useEffect } from 'react';

const OrderDetail = ({ handleEditItem }) => {
    const { orderDetails, handleOrderDetailChange } = useOrderStore();

    const subtotal = orderDetails.order_items.reduce((total, item) => total + item.total_price, 0);
    const discount = 0;
    const taxRate = 0.12;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount - discount;

    const handleCashTotalChange = (e) => {
        const value = parseFloat(e.target.value) || 0;
        handleOrderDetailChange('cash_total', value.toFixed(2));
        handleOrderDetailChange('customer_change', (value - total).toFixed(2));
    };

    // Automatically update customer change when order_items or cash_total changes
    useEffect(() => {
        const cash = parseFloat(orderDetails.cash_total || 0);
        const calculatedSubtotal = orderDetails.order_items.reduce((total, item) => total + item.total_price, 0);
        const tax = calculatedSubtotal * 0.12;
        const finalTotal = calculatedSubtotal + tax;

        if (cash > 0) {
            const change = (cash - finalTotal).toFixed(2);
            handleOrderDetailChange('customer_change', change);
        }
    }, [orderDetails.order_items, orderDetails.cash_total]);

    const handleSendToKitchen = () => {
        const payload = {
            ...orderDetails,
            price: total,
        };

        router.post(route('order.send-to-kitchen'), payload, {
            onSuccess: () => {
                enqueueSnackbar('Your order has been successfully sent to the kitchen!', { variant: 'success' });
            },
            onError: (errors) => {
                enqueueSnackbar('Something went wrong: ' + errors, { variant: 'error' });
            },
        });
    };

    return (
        <>
            {/* Order ID */}
            <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: '100vh' }}>
                <Paper
                    elevation={0}
                    sx={{
                        width: '100%',
                        maxWidth: 500,
                        borderRadius: 1,
                        overflow: 'hidden',
                    }}
                >
                    {/* Header */}
                    {orderDetails.member && (
                        <Box sx={{ border: '1px solid #E3E3E3', p: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Member
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                        <Avatar sx={{ width: 24, height: 24, bgcolor: '#e0e0e0', fontSize: 12, mr: 1 }}>Q</Avatar>
                                        <Typography variant="body2" fontWeight="medium">
                                            {orderDetails.member.name}
                                        </Typography>
                                        <Box
                                            component="span"
                                            sx={{
                                                display: 'inline-block',
                                                width: 16,
                                                height: 16,
                                                borderRadius: '50%',
                                                bgcolor: '#ffc107',
                                                ml: 1,
                                            }}
                                        />
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Avatar sx={{ width: 28, height: 28, bgcolor: '#1976d2', fontSize: 12 }}>{orderDetails.table}</Avatar>
                                    <IconButton size="small" sx={{ width: 28, height: 28, bgcolor: '#f5f5f5' }}>
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" sx={{ width: 28, height: 28, bgcolor: '#f5f5f5' }}>
                                        <ReceiptIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" sx={{ width: 28, height: 28, bgcolor: '#f5f5f5' }}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={4}>
                                    <Typography variant="caption" color="text.secondary">
                                        Order Date
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium">
                                        {new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(
                                            new Date(orderDetails.date),
                                        )}
                                    </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="caption" color="text.secondary">
                                        Waiter
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                        <Avatar sx={{ width: 20, height: 20, mr: 0.5, fontSize: 10 }}>T</Avatar>
                                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                            {orderDetails.waiter.name}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="caption" color="text.secondary">
                                        Order Time
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium">
                                        {orderDetails.time}
                                    </Typography>
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 2 }}>
                                <Chip
                                    label={`Order Id : #${orderDetails.order_no}`}
                                    size="small"
                                    sx={{
                                        bgcolor: '#f5f5f5',
                                        color: '#555',
                                        height: '24px',
                                        fontSize: '0.75rem',
                                        borderRadius: '4px',
                                    }}
                                />
                            </Box>
                        </Box>
                    )}

                    {/* Order Items */}
                    <Box sx={{ mt: 1, p: 1 }}>
                        {/* Cappuccino */}
                        {orderDetails.order_items.length > 0 &&
                            orderDetails.order_items.map((item, index) => (
                                <Box
                                    key={index}
                                    onClick={() => handleEditItem(item, index)}
                                    sx={{ mb: 2, borderBottom: '1px solid #E3E3E3', cursor: 'pointer' }}
                                >
                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Avatar src={item.image} variant="rounded" sx={{ width: 36, height: 36, mr: 1.5, bgcolor: '#f8c291' }} />
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="body2" fontWeight="medium">
                                                {item.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {item.category}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="caption" color="text.secondary">
                                                Qty : {item.quantity} x Rs {item.price}
                                            </Typography>
                                            <Typography variant="body2" fontWeight="medium">
                                                Rs. {item.total_price}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    {item.variants.length > 0 &&
                                        item.variants.map((variant, variantIndex) => (
                                            <Button
                                                key={variantIndex}
                                                sx={{
                                                    border: '1px solid #e0e0e0 !important',
                                                    borderRadius: '4px !important',
                                                    mb: 2,
                                                    mx: 0.5,
                                                    minWidth: '2px',
                                                    fontSize: '0.7rem',
                                                    py: 0.5,
                                                    px: 1.5,
                                                    color: '#555',
                                                }}
                                            >
                                                {variant.value}
                                            </Button>
                                        ))}
                                </Box>
                            ))}
                    </Box>

                    {/* Order Summary */}
                    <Box sx={{ px: 1, py: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Subtotal
                            </Typography>
                            <Typography variant="body2">Rs {subtotal.toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Discount
                            </Typography>
                            <Typography variant="body2" color="#4caf50">
                                Rs 0% (0)
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Tax 12%
                            </Typography>
                            <Typography variant="body2">Rs {taxAmount.toFixed(2)}</Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle2">Total</Typography>
                            <Typography variant="subtitle2">Rs {total.toFixed(2)}</Typography>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2">
                                <b>Cash Total</b>
                            </Typography>
                            <TextField
                                variant="outlined"
                                size="small"
                                type="number"
                                value={orderDetails.cash_total}
                                onChange={handleCashTotalChange}
                                sx={{ width: '50%' }}
                            />
                        </Box>
                    </Box>

                    {/* Payment Info */}
                    <Box
                        sx={{
                            border: '1px solid #E3E3E3',
                            borderRadius: 1,
                            overflow: 'hidden', // ensures borders align perfectly
                        }}
                    >
                        <Grid container>
                            <Grid
                                item
                                xs={4}
                                sx={{
                                    borderRight: '1px solid #E3E3E3',
                                    p: 1.5,
                                }}
                            >
                                <Typography variant="caption" color="text.secondary">
                                    Payment
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                    <CreditCardIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                    <Typography variant="body2" fontWeight="medium">
                                        Cash
                                    </Typography>
                                </Box>
                            </Grid>

                            <Grid
                                item
                                xs={4}
                                sx={{
                                    borderRight: '1px solid #E3E3E3',
                                    p: 1.5,
                                }}
                            >
                                <Typography variant="caption" color="text.secondary">
                                    Cash Total
                                </Typography>
                                <Typography variant="body2" fontWeight="medium" mt={0.5}>
                                    Rs {orderDetails.cash_total}
                                </Typography>
                            </Grid>

                            <Grid item xs={4} sx={{ p: 1.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Customer Change
                                </Typography>
                                <Typography variant="body2" fontWeight="medium" mt={0.5}>
                                    Rs {parseFloat(orderDetails.customer_change || 0).toFixed(2)}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            sx={{
                                flex: 1,
                                borderColor: '#e0e0e0',
                                color: '#555',
                                textTransform: 'none',
                            }}
                        >
                            Close
                        </Button>
                        <Button
                            variant="outlined"
                            disabled={
                                parseFloat(orderDetails.cash_total || 0) < total || orderDetails.order_items.length == 0 || !orderDetails.member
                            }
                            onClick={handleSendToKitchen}
                            sx={{
                                flex: 2,
                                borderColor: '#e0e0e0',
                                color: '#555',
                                textTransform: 'none',
                            }}
                        >
                            Send to kitchen
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<PrintIcon />}
                            disabled={
                                parseFloat(orderDetails.cash_total || 0) < total || orderDetails.order_items.length == 0 || !orderDetails.member
                            }
                            sx={{
                                flex: 2,
                                bgcolor: '#0a3d62',
                                '&:hover': { bgcolor: '#0c2461' },
                                textTransform: 'none',
                            }}
                        >
                            Print Receipt
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </>
    );
};

export default OrderDetail;
