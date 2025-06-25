import { useOrderStore } from '@/stores/useOrderStore';
import { router } from '@inertiajs/react';
import { Close as CloseIcon, Edit as EditIcon, Print as PrintIcon, Save as SaveIcon } from '@mui/icons-material';
import { Avatar, Box, Button, Chip, Divider, Grid, IconButton, TextField, Dialog, Paper, Typography, MenuItem, DialogContent } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import axios from 'axios';
import DescriptionIcon from '@mui/icons-material/Description';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

const OrderDetail = ({ handleEditItem }) => {
    const { orderDetails, handleOrderDetailChange, clearOrderItems } = useOrderStore();

    const [openDiscountModal, setOpenDiscountModal] = useState(false);
    const [isEditingDiscount, setIsEditingDiscount] = useState(false);
    const [editingQtyIndex, setEditingQtyIndex] = useState(null);
    const [tempQty, setTempQty] = useState(null);
    const [discount, setDiscount] = useState(0);
    const [setting, setSetting] = useState(null);
    const [loadingSetting, setLoadingSetting] = useState(true);
    const [isEditingTax, setIsEditingTax] = useState(false);
    const [tempTax, setTempTax] = useState('');
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [notes, setNotes] = useState({
        kitchen_note: '',
        staff_note: '',
        payment_note: '',
    });

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleNoteChange = (e) => {
        setNotes({
            ...notes,
            [e.target.name]: e.target.value,
        });
    };

    useEffect(() => {
        axios
            .get(route('setting.showTax'))
            .then((response) => {
                setSetting(response.data);
                setTempTax(response.data.tax?.toString() || '0');
                setLoadingSetting(false);
            })
            .catch((error) => {
                console.error('Failed to load setting:', error);
                enqueueSnackbar('Failed to load tax settings. Please try again.', { variant: 'error' });
                setLoadingSetting(false);
            });
    }, []);

    const [formData, setFormData] = useState({
        discountValue: '',
        discountType: 'percentage',
    });

    const [tempFormData, setTempFormData] = useState({
        discountValue: '',
        discountType: 'percentage',
    });

    const openDiscountDialog = () => {
        setTempFormData(formData);
        setOpenDiscountModal(true);
    };

    const rawSubtotal = orderDetails.order_items.reduce((total, item) => total + item.total_price, 0);

    const subtotal = Math.round(rawSubtotal);

    // Calculate discount first
    const discountAmount = formData.discountType === 'percentage' ? Math.round(subtotal * (Number(formData.discountValue || 0) / 100)) : Math.round(Number(formData.discountValue || 0));

    // Subtotal after discount
    const discountedSubtotal = subtotal - discountAmount;

    // Now apply tax on the discounted amount
    const taxRate = setting?.tax ? setting.tax / 100 : 0;
    const taxAmount = Math.round(discountedSubtotal * taxRate);

    // Final total
    const total = Math.round(discountedSubtotal + taxAmount);

    const handleSendToKitchen = async () => {
        setIsLoading(true);
        const payload = {
            ...orderDetails,
            price: subtotal,
            tax: taxRate,
            discount: discountAmount,
            total_price: total,
            kitchen_note: notes.kitchen_note,
            staff_note: notes.staff_note,
            payment_note: notes.payment_note,
        };

        router.post(route('order.send-to-kitchen'), payload, {
            onSuccess: () => {
                enqueueSnackbar('Your order has been successfully sent to the kitchen!', {
                    variant: 'success',
                });
                setIsLoading(false);
            },
            onError: (errors) => {
                const errorMessage = Object.values(errors).join(', ') || 'Something went wrong';
                enqueueSnackbar(`Failed to send order: ${errorMessage}`, {
                    variant: 'error',
                });
                setIsLoading(false);
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

    const handleTaxEditClick = () => {
        setIsEditingTax(true);
        setTempTax(setting?.tax?.toString() || '0');
    };

    const handleTaxChange = (e) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
            setTempTax(value);
        }
    };

    const handleSaveTax = () => {
        const newTax = parseFloat(tempTax);
        if (!isNaN(newTax) && newTax >= 0 && newTax <= 100) {
            setSetting({ ...setting, tax: newTax });
        } else {
            enqueueSnackbar('Tax must be a number between 0 and 100.', { variant: 'error' });
        }
        setIsEditingTax(false);
    };

    const handleClearOrderItems = () => {
        clearOrderItems();
        setFormData({ discountValue: '', discountType: 'percentage' });
        setDiscount(0);
        setNotes({ kitchen_note: '', staff_note: '', payment_note: '' });
    };

    const handleApplyDiscount = () => {
        const val = Number(tempFormData.discountValue || 0);
        const calcDiscount = tempFormData.discountType === 'percentage' ? (subtotal * val) / 100 : val;
        setFormData(tempFormData);
        setDiscount(calcDiscount);
        setOpenDiscountModal(false);
    };

    useEffect(() => {
        if (!openDiscountModal) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleApplyDiscount();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [openDiscountModal, tempFormData, subtotal]);

    // keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            const tag = document.activeElement.tagName.toLowerCase();
            if (tag === 'input' || tag === 'textarea') return;

            const key = e.key.toLowerCase();

            if (e.ctrlKey && !e.shiftKey) {
                switch (key) {
                    case 'd':
                        e.preventDefault();
                        openDiscountDialog();
                        break;
                    case 'e':
                        e.preventDefault();
                        handleTaxEditClick();
                        break;
                    case 'k':
                        if (orderDetails.order_items.length > 0 && orderDetails.member) {
                            e.preventDefault();
                            handleSendToKitchen();
                        }
                        break;
                    case 'l':
                        e.preventDefault();
                        handleClearOrderItems();
                        break;
                    default:
                        break;
                }
            }

            if (e.shiftKey && key === 'n') {
                e.preventDefault();
                handleOpen(); // open note/description dialog
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [openDiscountDialog, handleTaxEditClick, handleSendToKitchen, handleClearOrderItems, handleOpen, orderDetails]);

    return (
        <>
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
                                        <Avatar sx={{ width: 24, height: 24, bgcolor: '#e0e0e0', fontSize: 12, mr: 1 }}>{orderDetails.member.name?.charAt(0) || 'Q'}</Avatar>
                                        <Typography variant="body2" fontWeight="medium">
                                            {orderDetails.member.name}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {orderDetails.table && <Avatar sx={{ width: 28, height: 28, bgcolor: '#0C67AA', fontSize: 12 }}>{`T${orderDetails.table}`}</Avatar>}
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
                                    <IconButton size="small" sx={{ width: 28, height: 28, bgcolor: '#f5f5f5' }}>
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
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
                                        }).format(new Date(orderDetails.date))}
                                    </Typography>
                                </Grid>

                                <Grid item xs={4} sx={{ px: 1, borderRight: '1px solid #e0e0e0' }}>
                                    <Typography sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '12px' }}>Cashier</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                        <Avatar sx={{ width: 20, height: 20, mr: 1, fontSize: 10 }}>{orderDetails.waiter?.name?.charAt(0) || 'N'}</Avatar>
                                        <Typography variant="body2" fontWeight="medium">
                                            {orderDetails.waiter?.name || 'N/A'}
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={4} sx={{ px: 1, mt: -0.5 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Order Time
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium">
                                        {formatTime(orderDetails.time)}
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Box sx={{ mt: 2 }}>
                                <Chip
                                    label={
                                        <span>
                                            <span style={{ color: '#7F7F7F' }}>Order Id : </span>
                                            <span style={{ color: '#000' }}>#{orderDetails.order_no}</span>
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
                    )}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'end',
                            alignItems: 'center',
                            p: 1,
                            borderBottom: '1px solid #E3E3E3',
                        }}
                    >
                        <Button
                            size="small"
                            onClick={handleClearOrderItems}
                            sx={{
                                textTransform: 'none',
                                color: '#0c3b5c',
                                display: 'flex',
                                alignItems: 'center',
                                padding: 0,
                                minWidth: 0,
                                marginRight: 0,
                            }}
                        >
                            <HighlightOffIcon sx={{ fontSize: 24 }} />
                        </Button>
                        <Button
                            size="small"
                            onClick={handleOpen}
                            sx={{
                                textTransform: 'none',
                                color: '#0c3b5c',
                                display: 'flex',
                                alignItems: 'center',
                                padding: 0,
                                minWidth: 0,
                                marginLeft: 2,
                            }}
                        >
                            <DescriptionIcon sx={{ fontSize: 24 }} />
                        </Button>
                    </Box>

                    {/* Order Items */}
                    <Box sx={{ mt: 1, p: 1 }}>
                        {orderDetails.order_items.length > 0 &&
                            orderDetails.order_items.map((item, index) => {
                                const isEditing = editingQtyIndex === index;

                                const handleQtyClick = (e) => {
                                    e.stopPropagation();
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

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Discount
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" color="#4caf50">
                                    {formData.discountType === 'percentage' ? `${formData.discountValue || 0}%` : `Rs ${formData.discountValue || 0}`}
                                </Typography>
                                <IconButton size="small" onClick={openDiscountDialog}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                            {isEditingTax ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TextField
                                        size="small"
                                        value={tempTax}
                                        onChange={handleTaxChange}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSaveTax();
                                            }
                                        }}
                                        autoFocus
                                        sx={{ width: '80px' }}
                                        inputProps={{ style: { textAlign: 'center' } }}
                                    />
                                    <IconButton size="small" onClick={handleSaveTax}>
                                        <SaveIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Tax {setting?.tax || 0}%
                                    </Typography>
                                    <IconButton size="small" onClick={handleTaxEditClick}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            )}
                            <Typography variant="body2">Rs {taxAmount.toFixed(2)}</Typography>
                        </Box>

                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle2">Total</Typography>
                            <Typography variant="subtitle2">Rs {total.toFixed(2)}</Typography>
                        </Box>
                        <Divider sx={{ my: 2 }} />
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
                            m: 0,
                            width: '600px',
                            borderRadius: 2,
                            p: 2,
                        },
                    }}
                >
                    <Box sx={{ padding: 3 }}>
                        <Typography variant="h5" sx={{ fontWeight: 500, color: '#063455', fontSize: '30px', mb: 3 }}>
                            Apply Discount
                        </Typography>

                        <Box mb={2}>
                            <Typography variant="body1" sx={{ mb: 1, fontSize: '14px', fontWeight: 500 }}>
                                Discount Rate
                            </Typography>
                            <TextField fullWidth name="discountValue" type="number" value={tempFormData.discountValue} onChange={(e) => setTempFormData((prev) => ({ ...prev, discountValue: e.target.value }))} placeholder={tempFormData.discountType === 'percentage' ? 'Enter % discount' : 'Enter amount in Rs'} size="small" />
                        </Box>

                        <Box mb={3}>
                            <Typography variant="body1" sx={{ mb: 1, fontSize: '14px', fontWeight: 500 }}>
                                Discount Method
                            </Typography>
                            <TextField select fullWidth name="discountType" value={tempFormData.discountType} onChange={(e) => setTempFormData((prev) => ({ ...prev, discountType: e.target.value }))} size="small">
                                <MenuItem key="percentage" value="percentage">
                                    Percentage (%)
                                </MenuItem>
                                <MenuItem key="amount" value="amount">
                                    Fixed Amount (Rs)
                                </MenuItem>
                            </TextField>
                        </Box>

                        <Box display="flex" justifyContent="flex-end">
                            <Button
                                variant="contained"
                                onClick={() => setOpenDiscountModal(false)}
                                sx={{
                                    backgroundColor: '#F14C35',
                                    color: '#FFFFFF',
                                    textTransform: 'none',
                                    fontSize: '14px',
                                    mr: 1,
                                    '&:hover': { backgroundColor: '#d8432f' },
                                }}
                            >
                                Cancel
                            </Button>

                            <Button
                                variant="contained"
                                onClick={handleApplyDiscount}
                                sx={{
                                    backgroundColor: '#003366',
                                    color: '#FFFFFF',
                                    textTransform: 'none',
                                    fontSize: '14px',
                                    px: 3,
                                    '&:hover': { backgroundColor: '#002244' },
                                }}
                            >
                                Apply
                            </Button>
                        </Box>
                    </Box>
                </Dialog>

                {/* Notes Popup Modal */}
                <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                    <DialogContent sx={{ position: 'relative' }}>
                        {/* Close Icon */}
                        <IconButton
                            onClick={handleClose}
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                color: '#888',
                                zIndex: 1,
                            }}
                        >
                            <CloseIcon />
                        </IconButton>

                        {/* Note Fields */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#0c3b5c' }}>
                                    Kitchen Note
                                </Typography>
                                <TextField fullWidth multiline minRows={6} name="kitchen_note" placeholder="Instructions to chef will be displayed in kitchen along order details" value={notes.kitchen_note} onChange={handleNoteChange} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#0c3b5c' }}>
                                    Staff Note
                                </Typography>
                                <TextField fullWidth multiline minRows={6} name="staff_note" placeholder="Staff note for internal use" value={notes.staff_note} onChange={handleNoteChange} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#0c3b5c' }}>
                                    Payment Note
                                </Typography>
                                <TextField fullWidth multiline minRows={6} name="payment_note" placeholder="Payment note for internal use" value={notes.payment_note} onChange={handleNoteChange} />
                            </Box>
                        </Box>
                    </DialogContent>
                </Dialog>
            </Box>
            {/* Action Buttons */}
            <Box sx={{ mt: 1, position: 'sticky', bottom: 16, display: 'flex', gap: 1, px: 1, bgcolor: '#fff' }}>
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
                    loading={isLoading}
                    loadingPosition="start"
                    sx={{
                        flex: 2,
                        borderColor: '#063455',
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
        </>
    );
};

export default OrderDetail;
