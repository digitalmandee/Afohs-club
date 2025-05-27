import { Avatar, Box, Button, Chip, CircularProgress, Divider, Grid, IconButton, Paper, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';
import { useEffect, useState } from 'react';

const OrderDetails = ({ orderId, onClose }) => {
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(null);

    const getOrderDetails = async () => {
        setLoading(true);
        await axios
            .get(route('table.order.details', orderId))
            .then((res) => {
                setOrderDetails(res.data.order);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (orderId) {
            getOrderDetails();
        }
    }, [orderId]);

    function formatTime(timeStr) {
        if (!timeStr) return '';
        const [hour, minute] = timeStr.split(':');
        const date = new Date();
        date.setHours(parseInt(hour), parseInt(minute));

        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    return (
        <Box sx={{ p: 3, minHeight: '80vh' }}>
            <Paper elevation={0} sx={{ width: '100%', borderRadius: 1, pb: 5, overflow: 'hidden' }}>
                {/* Header */}
                {/* Header */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        px: 2,
                        py: 1,
                        mb: 3,
                    }}
                >
                    <Typography variant="h4" sx={{ fontWeight: 500 }}>
                        Order Details
                    </Typography>
                    <IconButton size="small" onClick={onClose}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                        <CircularProgress />
                    </Box>
                ) : orderDetails ? (
                    <>
                        <Box sx={{ border: '1px solid #E3E3E3', p: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Member
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                        <Avatar sx={{ width: 24, height: 24, bgcolor: '#e0e0e0', fontSize: 12, mr: 1 }}>Q</Avatar>
                                        <Typography variant="body2" fontWeight="medium">
                                            {orderDetails.user?.name}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {orderDetails.table && <Avatar sx={{ width: 28, height: 28, bgcolor: '#0C67AA', fontSize: 12 }}>{orderDetails.table?.table_no}</Avatar>}
                                    <Box
                                        sx={{
                                            height: 30,
                                            width: 30,
                                            borderRadius: '50%',
                                            bgcolor: '#E3E3E3',
                                        }}
                                    >
                                        <img src="/assets/food-tray.png" alt="" style={{ width: 20, height: 20, marginLeft: 4 }} />
                                    </Box>
                                </Box>
                            </Box>

                            <Grid container sx={{ border: '1px solid transparent' }}>
                                <Grid item xs={4} sx={{ pr: 2, borderRight: '1px solid #e0e0e0' }}>
                                    <Typography sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '12px' }}>Order Date</Typography>
                                    <Typography variant="body2" fontWeight="medium" sx={{ mt: 1 }}>
                                        {new Intl.DateTimeFormat('en-US', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                        }).format(new Date(orderDetails.start_date))}
                                    </Typography>
                                </Grid>
                                <Grid item xs={4} sx={{ px: 2, borderRight: '1px solid #e0e0e0' }}>
                                    <Typography sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '12px' }}>People of Attend.</Typography>
                                    <Typography variant="body2" fontWeight="medium" sx={{ mt: 1 }}>
                                        {orderDetails.person_count} Person
                                    </Typography>
                                </Grid>

                                <Grid item xs={4} sx={{ pl: 1, mt: -0.5 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Time of Attend.
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium">
                                        {formatTime(orderDetails.start_time)}
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Box sx={{ mt: 2 }}>
                                <Chip
                                    label={
                                        <span>
                                            <span style={{ color: '#7F7F7F' }}>Order Id : </span>
                                            <span style={{ color: '#000' }}>#{orderDetails.order_number}</span>
                                        </span>
                                    }
                                    size="small"
                                    sx={{
                                        bgcolor: '#E3E3E3',
                                        height: '24px',
                                        fontSize: '0.75rem',
                                        borderRadius: '4px',
                                    }}
                                />
                            </Box>
                        </Box>

                        {/* Order Items */}
                        <Box sx={{ mt: 1, p: 1 }}>
                            {orderDetails.order_items.length > 0 &&
                                orderDetails.order_items.map((item, index) => {
                                    return (
                                        <Box
                                            key={index}
                                            sx={{
                                                mb: 2,
                                                borderBottom: '1px solid #E3E3E3',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', mb: 1 }}>
                                                <Avatar src={item.order_item?.image} variant="rounded" sx={{ width: 36, height: 36, mr: 1.5, bgcolor: '#f8c291' }} />
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {item.order_item?.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {item.order_item?.category}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ textAlign: 'right' }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Qty : {item.order_item?.quantity} x Rs {item.order_item?.price}
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        Rs. {item.order_item?.total_price.toFixed(2)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            {item.order_item?.variants.length > 0 &&
                                                item.order_item?.variants.map((variant, variantIndex) => (
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
                                    );
                                })}
                        </Box>

                        {/* Order Summary */}
                        <Box sx={{ px: 1, py: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Subtotal
                                </Typography>
                                <Typography variant="body2">Rs {orderDetails.amount}</Typography>
                            </Box>

                            {/* Editable Discount Row */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Discount
                                </Typography>
                                <Typography variant="body2" color="#4caf50">
                                    {orderDetails.invoice?.discount_type === 'percentage' ? `${orderDetails.invoice?.discount || 0}%` : `Rs ${orderDetails.invoice?.discount || 0}`}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Tax %
                                </Typography>
                                <Typography variant="body2">Rs {orderDetails.invoice.tax}</Typography>
                            </Box>

                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle2">Total</Typography>
                                <Typography variant="subtitle2">Rs {orderDetails.invoice.total_price}</Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                        </Box>

                        {/* Action Buttons */}
                        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'end', gap: 1 }}>
                            <Button
                                variant="outlined"
                                onClick={onClose}
                                sx={{
                                    py: 1,
                                    px: 2,
                                    borderColor: '#e0e0e0',
                                    color: '#555',
                                    textTransform: 'none',
                                }}
                            >
                                Close
                            </Button>
                            {orderDetails.status === 'completed' ? (
                                <Button
                                    variant="outlined"
                                    sx={{
                                        py: 1,
                                        px: 2,
                                        borderColor: '#063455',
                                        color: '#063455',
                                        textTransform: 'none',
                                    }}
                                    disabled
                                >
                                    Completed Order
                                </Button>
                            ) : (
                                <Button
                                    variant="outlined"
                                    // onClick={handleCancelOrder}
                                    sx={{
                                        py: 1,
                                        px: 2,
                                        borderColor: '#063455',
                                        color: '#063455',
                                        textTransform: 'none',
                                    }}
                                >
                                    Cancel Order
                                </Button>
                            )}
                        </Box>
                    </>
                ) : (
                    'No Order Found'
                )}
            </Paper>
        </Box>
    );
};

export default OrderDetails;
