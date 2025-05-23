import { useOrderStore } from '@/stores/useOrderStore';
import { router } from '@inertiajs/react';
import { Close as CloseIcon, Edit as EditIcon, Print as PrintIcon, Receipt as ReceiptIcon } from '@mui/icons-material';
import { Avatar, Box, Button, Chip, Divider, Grid, IconButton, TextField, Dialog, Paper, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const OrderDetail = ({ handleEditItem }) => {
    const { orderDetails, handleOrderDetailChange } = useOrderStore();

    const [openDiscountModal, setOpenDiscountModal] = useState(false);
    const [isEditingDiscount, setIsEditingDiscount] = useState(false);
    const [editingQtyIndex, setEditingQtyIndex] = useState(null);
    const [tempQty, setTempQty] = useState(null);
    const [discount, setDiscount] = useState(0); // percentage

    const [formData, setFormData] = useState({
        guestName: '',
        phone: '',
        clubName: '',
        authorizedBy: '',
        checkInDate: '',
        checkInTime: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const subtotal = orderDetails.order_items.reduce((total, item) => total + item.total_price, 0);
    const taxRate = 0.12;
    const taxAmount = subtotal * taxRate;
    const discountAmount = subtotal * (discount / 100);
    const total = subtotal + taxAmount - discountAmount;

    useEffect(() => {
        const cash = parseFloat(orderDetails.cash_total || 0);
        const calculatedSubtotal = orderDetails.order_items.reduce((total, item) => total + item.total_price, 0);
        const tax = calculatedSubtotal * 0.12;
        const discountAmt = calculatedSubtotal * (discount / 100);
        const finalTotal = calculatedSubtotal + tax - discountAmt;

        if (cash > 0) {
            const change = (cash - finalTotal).toFixed(2);
            handleOrderDetailChange('customer_change', change);
        }
    }, [orderDetails.order_items, orderDetails.cash_total, discount]);

    const handleSendToKitchen = () => {
        const payload = {
            ...orderDetails,
            price: subtotal,
            tax: taxRate,
            discount: discount,
            total_price: total,
        };

        router.post(route('order.send-to-kitchen'), payload, {
            onSuccess: () => {
                enqueueSnackbar('Your order has been successfully sent to the kitchen!', {
                    variant: 'success',
                });
            },
            onError: (errors) => {
                enqueueSnackbar('Something went wrong: ' + errors, {
                    variant: 'error',
                });
            },
        });
    };

    function formatTime(timeStr) {
        if (!timeStr) return '';
        const [hour, minute] = timeStr.split(':');
        const date = new Date();
        date.setHours(parseInt(hour), parseInt(minute));

        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: '80vh' }}>
            <Paper elevation={0} sx={{ width: '100%', maxWidth: 500, borderRadius: 1, overflow: 'hidden' }}>
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
                                    {/* <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                        <Avatar sx={{ width: 24, height: 24, bgcolor: '#e0e0e0', fontSize: 12, mr: 1 }}>Q</Avatar>
                                        <Typography sx={{ fontWeight: 500, fontSize: '14px', color: '#121212' }}>{orderDetails.member.name}</Typography>
                                        <img
                                            src="/assets/Diamond.png"
                                            alt=""
                                            style={{
                                                height: 24,
                                                width: 24,
                                                marginLeft: 5,
                                            }}
                                        />
                                    </Box> */}
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                {orderDetails.table && <Avatar sx={{ width: 28, height: 28, bgcolor: '#0C67AA', fontSize: 12 }}>{`T${orderDetails.table}`}</Avatar>}
                                {/* <IconButton size="small" sx={{ width: 28, height: 28, bgcolor: '#f5f5f5' }}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" sx={{ width: 28, height: 28, bgcolor: '#f5f5f5' }}>
                                    <ReceiptIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" sx={{ width: 28, height: 28, bgcolor: '#f5f5f5' }}>
                                    <EditIcon fontSize="small" />
                                </IconButton> */}
                            </Box>
                        </Box>

                        <Grid container sx={{ mt: 1, border: '1px solid transparent' }}>
                            <Grid item xs={4} sx={{ pr: 2, borderRight: '1px solid #e0e0e0' }}>
                                <Typography sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '12px' }}>Order Date</Typography>
                                <Typography variant="body2" fontWeight="medium" sx={{ mt: 1 }}>
                                    {new Intl.DateTimeFormat('en-US', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                    }).format(new Date(orderDetails.date))}
                                </Typography>
                            </Grid>

                            <Grid item xs={8} sx={{ px: 1, borderRight: '1px solid #e0e0e0' }}>
                                <Typography sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '12px' }}>Cashier</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                    <Avatar sx={{ width: 20, height: 20, mr: 1, fontSize: 10 }}>{orderDetails.waiter?.name?.charAt(0) || 'N'}</Avatar>
                                    <Typography variant="body2" fontWeight="medium">
                                        {orderDetails.waiter?.name || 'N/A'}
                                    </Typography>
                                </Box>
                            </Grid>

                            {/* <Grid item xs={4} sx={{ pl: 2 }}>
                                <Typography sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '12px' }}>Order Time</Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {formatTime(orderDetails.time)}
                                </Typography>
                            </Grid> */}
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary">
                                Order Time
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                                {formatTime(orderDetails.time)}
                            </Typography>
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
                    {orderDetails.order_items.length > 0 &&
                        orderDetails.order_items.map((item, index) => {
                            const isEditing = editingQtyIndex === index;

                            const handleQtyClick = (e) => {
                                e.stopPropagation(); // prevent triggering handleEditItem
                                setEditingQtyIndex(index);
                                setTempQty(item.quantity.toString());
                            };

                            const handleQtyChange = (e) => {
                                const value = e.target.value;
                                if (/^\d*$/.test(value)) {
                                    setTempQty(value);
                                }
                            };

                            const handleQtyBlur = () => {
                                const newQty = Number(tempQty);
                                if (newQty > 0 && newQty !== item.quantity) {
                                    const updatedItems = [...orderDetails.order_items];
                                    updatedItems[index].quantity = newQty;
                                    updatedItems[index].total_price = newQty * updatedItems[index].price;

                                    handleOrderDetailChange('order_items', updatedItems);
                                }
                                setEditingQtyIndex(null);
                                setTempQty('');
                            };
                            return (
                                <Box
                                    key={index}
                                    onClick={() => handleEditItem(item, index)}
                                    sx={{
                                        mb: 2,
                                        borderBottom: '1px solid #E3E3E3',
                                        cursor: 'pointer',
                                    }}
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
                                            <Typography variant="caption" color="text.secondary" onClick={handleQtyClick}>
                                                Qty :{' '}
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={tempQty}
                                                        onChange={handleQtyChange}
                                                        onBlur={handleQtyBlur}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleQtyBlur();
                                                            }
                                                        }}
                                                        autoFocus
                                                        style={{
                                                            width: '40px',
                                                            fontSize: '0.8rem',
                                                            textAlign: 'center',
                                                            marginLeft: '4px',
                                                            border: '1px solid #ccc',
                                                            borderRadius: '4px',
                                                            padding: '2px 4px',
                                                        }}
                                                    />
                                                ) : (
                                                    item.quantity
                                                )}{' '}
                                                x Rs {item.price}
                                            </Typography>
                                            <Typography variant="body2" fontWeight="medium">
                                                Rs. {item.total_price.toFixed(2)}
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
                            );
                        })}
                </Box>

                {/* Order Summary */}
                <Box sx={{ px: 1, py: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Subtotal
                        </Typography>
                        <Typography variant="body2">Rs {subtotal.toFixed(2)}</Typography>
                    </Box>

                    {/* Editable Discount Row */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" onClick={() => setOpenDiscountModal(true)} sx={{ cursor: 'pointer' }}>
                            Discount
                        </Typography>
                        {isEditingDiscount ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <input
                                    type="number"
                                    value={discount}
                                    onChange={(e) => setDiscount(Number(e.target.value))}
                                    style={{
                                        width: '60px',
                                        height: '24px',
                                        fontSize: '0.8rem',
                                        padding: '2px 4px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                    }}
                                />
                                <span>%</span>
                                <Button variant="text" size="small" onClick={() => setIsEditingDiscount(false)} sx={{ fontSize: '0.75rem' }}>
                                    Save
                                </Button>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" color="#4caf50">
                                    {discount}%
                                </Typography>
                                <IconButton size="small" onClick={() => setIsEditingDiscount(true)}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        )}
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
                </Box>

                {/* Action Buttons */}
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
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
                        disabled={orderDetails.order_items.length === 0 || !orderDetails.member}
                        onClick={handleSendToKitchen}
                        sx={{
                            flex: 2,
                            borderColor: '1px solid #3F4E4F',
                            color: '#555',
                            textTransform: 'none',
                        }}
                    >
                        Send to kitchen
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<PrintIcon />}
                        disabled={orderDetails.order_items.length === 0 || !orderDetails.member}
                        sx={{
                            flex: 2,
                            bgcolor: '#063455',
                            '&:hover': { bgcolor: '#063455' },
                            textTransform: 'none',
                        }}
                    >
                        Print Receipt
                    </Button>
                </Box>
            </Paper>

            <Dialog
                open={openDiscountModal}
                onClose={() => setOpenDiscountModal(false)}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    style: {
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        m: 0,
                        width: '600px',
                        borderRadius: 2,
                        p: 2,
                    },
                }}
            >
                <div
                    style={{
                        fontFamily: 'Arial, sans-serif',
                        padding: '20px',
                        backgroundColor: '#FFFFFF',
                        // minHeight: '100vh'
                    }}
                >
                    {/* Header with back button and title */}
                    <div className="d-flex align-items-center mb-4">
                        <Typography
                            variant="h5"
                            style={{
                                fontWeight: 500,
                                color: '#3F4E4F',
                                fontSize: '30px',
                            }}
                        >
                            Apply Discount
                        </Typography>
                    </div>

                    {/* Form Card */}
                    <Paper
                        elevation={0}
                        style={{
                            maxWidth: '600px',
                            margin: '0 auto',
                            padding: '10px',
                            borderRadius: '4px',
                        }}
                    >
                        <form>
                            {/* Guest Name */}
                            <Box mb={2}>
                                <Typography
                                    variant="body1"
                                    style={{
                                        marginBottom: '8px',
                                        color: '#121212',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                    }}
                                >
                                    Discount Rate
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="guestName"
                                    value={formData.guestName}
                                    onChange={handleChange}
                                    placeholder="e.g. Enter Discount in Price"
                                    variant="outlined"
                                    size="small"
                                    style={{ marginBottom: '8px' }}
                                    InputProps={{
                                        style: { fontSize: '14px' },
                                    }}
                                />
                            </Box>

                            {/* Phone */}
                            <Box mb={2}>
                                <Typography
                                    variant="body1"
                                    style={{
                                        marginBottom: '8px',
                                        color: '#121212',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                    }}
                                >
                                    Discount Method
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="e.g. Discount in Percentage %"
                                    variant="outlined"
                                    size="small"
                                    style={{ marginBottom: '8px' }}
                                    InputProps={{
                                        style: { fontSize: '14px' },
                                        endAdornment: <ArrowDropDownIcon style={{ color: '#121212' }} />,
                                    }}
                                />
                            </Box>

                            {/* Action Buttons */}
                            <Box display="flex" justifyContent="flex-end">
                                <Button
                                    variant="text"
                                    style={{
                                        backgroundColor: '#F14C35',
                                        marginRight: '10px',
                                        color: '#FFFFFF',
                                        textTransform: 'none',
                                        fontSize: '14px',
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    style={{
                                        backgroundColor: '#003366',
                                        color: 'white',
                                        textTransform: 'none',
                                        fontSize: '14px',
                                        padding: '6px 16px',
                                    }}
                                >
                                    Apply
                                </Button>
                            </Box>
                        </form>
                    </Paper>
                </div>
            </Dialog>
        </Box>
    );
};

export default OrderDetail;
