import { AccessTime, Add, Block, Restore } from '@mui/icons-material';
import { Avatar, Box, Button, Checkbox, Dialog, DialogContent, IconButton, List, ListItem, ListItemText, Paper, Typography, Slide, Select, MenuItem, InputLabel, FormControl, FormControlLabel, Radio, TextField, RadioGroup, Collapse } from '@mui/material';
import { useEffect, useState } from 'react';
import AddItems from './AddItem';
import VariantSelectorDialog from '../VariantSelectorDialog';
import CancelItemDialog from './CancelItemDialog';

function EditOrderModal({ open, onClose, order, orderItems, setOrderItems, onSave, allrestaurants }) {
    const [showAddItem, setShowAddItem] = useState(false);
    const [variantPopupOpen, setVariantPopupOpen] = useState(false);
    const [variantProductId, setVariantProductId] = useState(null);
    const [initialEditItem, setInitialEditItem] = useState(null);
    const [editingItemIndex, setEditingItemIndex] = useState(null);
    const [orderStatus, setOrderStatus] = useState(order?.status || 'pending');
    const [loading, setLoading] = useState(false);

    // Cancel Item State
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [itemToCancel, setItemToCancel] = useState(null);

    const [openCancelDetails, setOpenCancelDetails] = useState({});

    const toggleCancelDetails = (index) => {
        setOpenCancelDetails((prev) => ({
            ...prev,
            [index]: !prev[index], // toggle only this item
        }));
    };

    const getUnitPrice = (orderItem) => {
        const base = parseFloat(orderItem?.price) || 0;
        const variants = Array.isArray(orderItem?.variants) ? orderItem.variants : [];
        const variantsSum = variants.reduce((sum, v) => sum + (parseFloat(v?.price) || 0), 0);
        return base + variantsSum;
    };

    const updateItem = (index, updates) => {
        setOrderItems((prev) =>
            prev.map((item, i) => {
                if (i !== index) return item;

                let updatedId = item.id;
                if (item.id && typeof item.id === 'number') {
                    updatedId = `update-${item.id}`;
                }

                return {
                    ...item,
                    id: updatedId,
                    ...updates, // merge root-level updates (instructions, remark, cancelType)
                };
            }),
        );
    };

    useEffect(() => {
        setOrderStatus(order?.status || 'pending');
    }, [order]);

    const handleQuantityChange = (index, delta) => {
        setOrderItems((prev) =>
            prev.map((item, i) => {
                if (i !== index) return item;

                const currentQty = Number(item.order_item.quantity) || 1;
                const updatedQty = currentQty + Number(delta);

                let updatedId = item.id;
                if (item.id && typeof item.id === 'number') {
                    updatedId = `update-${item.id}`;
                }

                const unitPrice = getUnitPrice(item.order_item);
                const safeQty = updatedQty > 0 ? updatedQty : 1;

                return {
                    ...item,
                    id: updatedId,
                    order_item: {
                        ...item.order_item,
                        quantity: safeQty,
                        total_price: unitPrice * safeQty,
                    },
                };
            }),
        );
    };

    const handleCancelClick = (item) => {
        setItemToCancel(item);
        setCancelDialogOpen(true);
    };

    const handleRestoreItem = (index) => {
        setOrderItems((prev) =>
            prev.map((item, i) => {
                if (i !== index) return item;

                let updatedId = item.id;
                if (item.id && typeof item.id === 'number') {
                    updatedId = `update-${item.id}`;
                }

                return {
                    ...item,
                    id: updatedId,
                    status: 'pending',
                    remark: null,
                    instructions: null,
                    cancelType: null,
                };
            }),
        );
    };

    const handleConfirmCancel = (data) => {
        const { quantity: cancelQty, remark, instructions, cancelType } = data;
        if (!itemToCancel) return;

        const index = orderItems.findIndex((i) => i === itemToCancel);
        if (index === -1) return;

        const originalItem = orderItems[index];

        // Ensure we are working with numbers
        const currentQty = parseInt(originalItem.order_item.quantity, 10);
        const safeCancelQty = parseInt(cancelQty, 10);

        if (safeCancelQty >= currentQty) {
            // Cancel Entire Item
            updateItem(index, {
                status: 'cancelled',
                remark,
                instructions,
                cancelType,
            });
        } else {
            // Partial Cancel -> Split
            // 1. Reduce quantity of original item
            const reducedQty = currentQty - safeCancelQty;
            const unitPrice = getUnitPrice(originalItem.order_item);
            const reducedPrice = unitPrice * reducedQty;

            const updatedOriginal = {
                ...originalItem,
                id: originalItem.id && typeof originalItem.id === 'number' ? `update-${originalItem.id}` : originalItem.id,
                order_item: {
                    ...originalItem.order_item,
                    quantity: reducedQty,
                    total_price: reducedPrice,
                },
            };

            // 2. Create NEW item for cancelled part
            const cancelledPrice = unitPrice * safeCancelQty;
            const cancelledItem = {
                ...originalItem,
                id: 'new', // Treat as new item
                status: 'cancelled',
                remark,
                instructions,
                cancelType,
                order_item: {
                    ...originalItem.order_item,
                    quantity: safeCancelQty,
                    total_price: cancelledPrice,
                },
            };

            setOrderItems((prev) => {
                const newItems = [...prev];
                newItems[index] = updatedOriginal; // Replace original with reduced
                newItems.splice(index + 1, 0, cancelledItem); // Insert cancelled right after
                return newItems;
            });
        }

        setCancelDialogOpen(false);
        setItemToCancel(null);
    };

    const handleItemClick = async (item, index) => {
        setVariantProductId(item.order_item.id);
        setVariantPopupOpen(true);
        setInitialEditItem(item.order_item);
        setEditingItemIndex(index);
    };

    const handleVariantConfirm = (updatedItem) => {
        setOrderItems((prevItems) =>
            prevItems.map((item, i) =>
                i === editingItemIndex
                    ? {
                          ...item,
                          order_item: updatedItem,
                          id: item.id && typeof item.id === 'number' ? `update-${item.id}` : item.id,
                      }
                    : item,
            ),
        );

        resetVariantState();
    };

    const resetVariantState = () => {
        setVariantPopupOpen(false);
        setInitialEditItem(null);
        setEditingItemIndex(null);
    };

    const onSubmit = async () => {
        setLoading(true);
        try {
            await onSave(orderStatus); // or perform API call here
            setShowAddItem(false);
        } catch (error) {
            console.error('Failed to save order', error);
            // optionally show an error Snackbar here
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} fullScreen={showAddItem} TransitionComponent={Slide}>
                <DialogContent
                    sx={{
                        p: 0,
                        width: showAddItem ? '100%' : '600px', // expand when adding
                        maxWidth: '100vw',
                        height: '90vh',
                        display: 'flex',
                        flexDirection: 'row',
                    }}
                >
                    {/* Variant Popup */}
                    {variantPopupOpen && <VariantSelectorDialog open={variantPopupOpen} onClose={resetVariantState} productId={variantProductId} initialItem={initialEditItem} onConfirm={handleVariantConfirm} />}
                    {cancelDialogOpen && <CancelItemDialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} onConfirm={handleConfirmCancel} item={itemToCancel} />}

                    {/* Order Info Panel */}
                    <Paper
                        elevation={1}
                        sx={{
                            width: showAddItem ? '30%' : '100%',
                            transition: 'width 0.3s ease',
                            borderRight: showAddItem ? '1px solid #ccc' : 'none',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            height: 'calc(100vh - 64px)',
                        }}
                    >
                        {/* Sticky Header */}
                        <Box
                            sx={{
                                bgcolor: '#063455',
                                color: 'white',
                                p: 2,
                                position: 'sticky',
                                top: 0,
                                zIndex: 1,
                            }}
                        >
                            <Typography variant="subtitle2" sx={{ fontWeight: 500, fontSize: '18px' }}>
                                #{order?.id ?? '—'}
                            </Typography>

                            <Typography variant="h6" sx={{ fontWeight: 500, fontSize: '18px' }}>
                                {order?.member ? `${order.member?.full_name} (${order.member?.membership_no})` : `${order?.customer ? order.customer.name : order?.employee?.name}`}
                            </Typography>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    bgcolor: '#0066cc',
                                    width: 'fit-content',
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 0.5,
                                    mt: 1,
                                }}
                            >
                                <AccessTime fontSize="small" sx={{ fontSize: 16, mr: 0.5 }} />
                                <Typography variant="caption">02:02</Typography>
                            </Box>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 16,
                                    right: 16,
                                    display: 'flex',
                                }}
                            >
                                <Avatar
                                    sx={{
                                        bgcolor: '#1976d2',
                                        width: 36,
                                        height: 36,
                                        fontSize: 14,
                                        fontWeight: 500,
                                        mr: 1,
                                    }}
                                >
                                    {order?.table?.table_no ?? '-'}
                                </Avatar>
                                <Avatar
                                    sx={{
                                        bgcolor: '#E3E3E3',
                                        width: 36,
                                        height: 36,
                                        color: '#666',
                                    }}
                                >
                                    <img
                                        src="/assets/food-tray.png"
                                        alt=""
                                        style={{
                                            width: 24,
                                            height: 24,
                                        }}
                                    />
                                </Avatar>
                            </Box>
                        </Box>

                        {/* Scrollable Order Items */}
                        <Box
                            sx={{
                                flex: 1,
                                overflowY: 'auto',
                                '&::-webkit-scrollbar': {
                                    width: '6px',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: '#ccc',
                                    borderRadius: '3px',
                                },
                            }}
                        >
                            <Box p={2}></Box>
                            <List sx={{ py: 0 }}>
                                {orderItems.length > 0 &&
                                    orderItems.map((item, index) => (
                                        <Box key={index}>
                                            <ListItem
                                                divider
                                                sx={{
                                                    py: 0,
                                                    px: 2,
                                                    ...(item.status === 'cancelled' && {
                                                        '& .MuiListItemText-primary': {
                                                            textDecoration: 'line-through',
                                                        },
                                                    }),
                                                }}
                                            >
                                                <ListItemText primary={item.order_item?.name} onClick={() => handleItemClick(item, index)} sx={{ cursor: 'pointer' }} />

                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <IconButton size="small" onClick={() => handleQuantityChange(index, -1)} sx={{ color: '#003153' }}>
                                                        <Typography sx={{ fontSize: 16, fontWeight: 'bold' }}>-</Typography>
                                                    </IconButton>
                                                    <Typography sx={{ mx: 1 }}>{item.order_item.quantity}x</Typography>
                                                    <IconButton size="small" onClick={() => handleQuantityChange(index, 1)} sx={{ color: '#003153' }}>
                                                        <Typography sx={{ fontSize: 16, fontWeight: 'bold' }}>+</Typography>
                                                    </IconButton>
                                                    {item.id === 'new' ? (
                                                        <IconButton
                                                            onClick={() => {
                                                                setOrderItems((prev) => prev.filter((_, i) => i !== index));
                                                            }}
                                                            sx={{ color: '#d32f2f', fontSize: 16 }}
                                                        >
                                                            ✕
                                                        </IconButton>
                                                    ) : item.status === 'cancelled' ? (
                                                        <IconButton size="small" onClick={() => handleRestoreItem(index)} sx={{ color: '#2e7d32' }} title="Restore Item">
                                                            <Restore />
                                                        </IconButton>
                                                    ) : (
                                                        <IconButton size="small" onClick={() => handleCancelClick(item)} sx={{ color: '#d32f2f' }} title="Cancel Item">
                                                            <Block />
                                                        </IconButton>
                                                    )}

                                                    {item.status === 'cancelled' && (
                                                        <Button variant="text" size="small" onClick={() => toggleCancelDetails(index)} sx={{ textTransform: 'none', color: '#d32f2f' }}>
                                                            Details
                                                        </Button>
                                                    )}
                                                </Box>
                                            </ListItem>
                                            {/* Inline Collapse for Cancel Details */}
                                            <Collapse in={openCancelDetails[index] && item.status === 'cancelled'}>
                                                <Box sx={{ px: 4, py: 2, bgcolor: '#f9f9f9' }}>
                                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                                        <InputLabel>Remark</InputLabel>
                                                        <Select size="small" sx={{ py: 1 }} value={item.remark || ''} onChange={(e) => updateItem(index, { remark: e.target.value })}>
                                                            <MenuItem value="CANCELLED BY CUSTOMER">CANCELLED BY CUSTOMER</MenuItem>
                                                            <MenuItem value="GUEST MIND CHANGE">GUEST MIND CHANGE</MenuItem>
                                                            <MenuItem value="FOOD COMPLAIN">FOOD COMPLAIN</MenuItem>
                                                            <MenuItem value="GUEST DIDN'T PICK THE CALL">GUEST DIDN'T PICK THE CALL</MenuItem>
                                                            <MenuItem value="GUEST DIDN'T LIKE THE FOOD">GUEST DIDN'T LIKE THE FOOD</MenuItem>
                                                            <MenuItem value="OTHER">OTHER</MenuItem>
                                                            <MenuItem value="WRONG PUNCHING">WRONG PUNCHING</MenuItem>
                                                            <MenuItem value="RUN OUT">RUN OUT</MenuItem>
                                                            <MenuItem value="DIDN'T SERVED">DIDN'T SERVED</MenuItem>
                                                        </Select>
                                                    </FormControl>

                                                    <TextField size="small" label="Instructions" multiline rows={2} fullWidth sx={{ mb: 2 }} value={item.instructions || ''} onChange={(e) => updateItem(index, { instructions: e.target.value })} />
                                                </Box>
                                            </Collapse>
                                        </Box>
                                    ))}
                            </List>

                            {/* Add Item Button */}
                            {!showAddItem && (
                                <Box sx={{ px: 2 }}>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        startIcon={<Add sx={{ color: '#063455' }} />}
                                        sx={{
                                            border: '1px solid #063455',
                                            color: '#063455',
                                            textTransform: 'none',
                                            py: 1,
                                            mb: 1,
                                        }}
                                        onClick={() => setShowAddItem(true)}
                                    >
                                        Add Item
                                    </Button>
                                </Box>
                            )}
                        </Box>

                        {/* Notes Section - Sticky at bottom before footer */}
                        {(order?.kitchen_note || order?.staff_note || order?.payment_note) && (
                            <Box
                                sx={{
                                    px: 2,
                                    py: 1.5,
                                    borderTop: '1px solid #e0e0e0',
                                    bgcolor: '#f9f9f9',
                                }}
                            >
                                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#063455', mb: 1, display: 'block' }}>
                                    Notes:
                                </Typography>
                                {order.kitchen_note && (
                                    <Box sx={{ mb: 0.5 }}>
                                        <Typography variant="caption" component="span" fontWeight="bold" sx={{ color: '#555' }}>
                                            • Kitchen:{' '}
                                        </Typography>
                                        <Typography variant="caption" component="span" sx={{ color: '#666' }}>
                                            {order.kitchen_note}
                                        </Typography>
                                    </Box>
                                )}
                                {order.staff_note && (
                                    <Box sx={{ mb: 0.5 }}>
                                        <Typography variant="caption" component="span" fontWeight="bold" sx={{ color: '#555' }}>
                                            • Staff:{' '}
                                        </Typography>
                                        <Typography variant="caption" component="span" sx={{ color: '#666' }}>
                                            {order.staff_note}
                                        </Typography>
                                    </Box>
                                )}
                                {order.payment_note && (
                                    <Box sx={{ mb: 0.5 }}>
                                        <Typography variant="caption" component="span" fontWeight="bold" sx={{ color: '#555' }}>
                                            • Payment:{' '}
                                        </Typography>
                                        <Typography variant="caption" component="span" sx={{ color: '#666' }}>
                                            {order.payment_note}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        )}

                        {/* Footer */}
                        <Box sx={{ display: 'flex', p: 2, gap: 2, borderTop: '1px solid #e0e0e0' }}>
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => {
                                    onClose();
                                    setShowAddItem(false);
                                }}
                                sx={{
                                    borderColor: '#003153',
                                    color: '#003153',
                                    textTransform: 'none',
                                    py: 1,
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={() => onSubmit()}
                                disabled={loading}
                                loading={loading}
                                loadingPosition="start"
                                sx={{
                                    bgcolor: '#003153',
                                    '&:hover': { bgcolor: '#00254d' },
                                    textTransform: 'none',
                                    py: 1,
                                }}
                            >
                                Save Changes
                            </Button>
                        </Box>
                    </Paper>

                    {/* Add Items Panel (Full-screen right pane) */}
                    {showAddItem && (
                        <Box
                            sx={{
                                width: '70%',
                                transition: 'width 0.3s ease',
                                overflow: 'auto',
                            }}
                        >
                            <AddItems allrestaurants={allrestaurants} orderItems={orderItems} setOrderItems={setOrderItems} setShowAddItem={setShowAddItem} initialRestaurantId={order?.tenant_id} orderType={order?.order_type} />
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
EditOrderModal.layout = (page) => page;
export default EditOrderModal;
