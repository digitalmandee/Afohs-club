import { AccessTime, Add } from '@mui/icons-material';
import { Avatar, Box, Button, Checkbox, Dialog, DialogContent, IconButton, List, ListItem, ListItemText, Paper, Typography, Slide, Select, MenuItem, InputLabel, FormControl, FormControlLabel, Radio, TextField, RadioGroup, Collapse } from '@mui/material';
import { useEffect, useState } from 'react';
import AddItems from './AddItem';
import VariantSelectorDialog from '../VariantSelectorDialog';

function EditOrderModal({ open, onClose, order, orderItems, setOrderItems, onSave, allrestaurants }) {
    const [showAddItem, setShowAddItem] = useState(false);
    const [variantPopupOpen, setVariantPopupOpen] = useState(false);
    const [variantProductId, setVariantProductId] = useState(null);
    const [initialEditItem, setInitialEditItem] = useState(null);
    const [editingItemIndex, setEditingItemIndex] = useState(null);
    const [orderStatus, setOrderStatus] = useState(order?.status || 'pending');
    const [loading, setLoading] = useState(false);

    const [openCancelDetails, setOpenCancelDetails] = useState({});

    const toggleCancelDetails = (index) => {
        setOpenCancelDetails((prev) => ({
            ...prev,
            [index]: !prev[index], // toggle only this item
        }));
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

                const currentQty = item.order_item.quantity;
                const updatedQty = currentQty + delta;

                let updatedId = item.id;
                if (item.id && typeof item.id === 'number') {
                    updatedId = `update-${item.id}`;
                }

                return {
                    ...item,
                    id: updatedId,
                    order_item: {
                        ...item.order_item,
                        quantity: updatedQty > 0 ? updatedQty : 1, // prevent quantity going below 1
                        total_price: item.order_item.price * (updatedQty > 0 ? updatedQty : 1),
                    },
                };
            }),
        );
    };

    const handleRemoveToggle = (index) => {
        setOrderItems((prev) =>
            prev.map((item, i) => {
                if (i !== index) return item;

                let updatedId = item.id;
                if (item.id && typeof item.id === 'number') {
                    updatedId = `update-${item.id}`;
                }

                if (item.status === 'cancelled') {
                    // Unchecking → restore + clear cancel fields
                    return {
                        ...item,
                        id: updatedId,
                        status: 'pending',
                        remark: 'CANCELLED BY CUSTOMER',
                        instructions: '',
                        cancelType: 'void',
                    };
                } else {
                    // Checking → cancel
                    return {
                        ...item,
                        id: updatedId,
                        status: 'cancelled',
                    };
                }
            }),
        );
    };

    const handleItemClick = async (item, index) => {
        try {
            setVariantProductId(item.order_item.id);
            setVariantPopupOpen(true);
            setInitialEditItem(item.order_item);
            setEditingItemIndex(index);
        } catch (error) {
            console.error('Error loading product:', error);
        } finally {
            setVariantLoading(false);
        }
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
        setVariantProduct(null);
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

                    {/* Order Info Panel */}
                    <Paper
                        elevation={1}
                        sx={{
                            width: showAddItem ? '30%' : '100%',
                            transition: 'width 0.3s ease',
                            borderRight: showAddItem ? '1px solid #ccc' : 'none',
                            overflow: 'hidden',
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
                                #{order?.order_number ?? '—'}
                            </Typography>

                            <Typography variant="h6" sx={{ fontWeight: 500, fontSize: '18px' }}>
                                {order?.member?.member_type?.name ?? '—'}{' '}
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
                                maxHeight: 'calc(100vh - 300px)',
                                overflowY: 'auto',
                                '&::-webkit-scrollbar': {
                                    display: 'none',
                                },
                            }}
                        >
                            <Box p={2}>
                                <FormControl fullWidth>
                                    <InputLabel id="status-label">Status</InputLabel>
                                    <Select
                                        labelId="status-label"
                                        fullWidth
                                        value={orderStatus}
                                        onChange={(e) => setOrderStatus(e.target.value)}
                                        sx={{
                                            backgroundColor: 'white',
                                            borderRadius: 1,
                                            color: '#003153',
                                            fontWeight: 500,
                                        }}
                                    >
                                        <MenuItem value="pending">Pending</MenuItem>
                                        <MenuItem value="in_progress">In Progress</MenuItem>
                                        <MenuItem value="completed">Completed</MenuItem>
                                        <MenuItem value="cancelled">Cancelled</MenuItem>
                                        <MenuItem value="no_show">No Show</MenuItem>
                                        <MenuItem value="refund">Refund</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
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

                                                    <Checkbox
                                                        checked={item.status === 'cancelled'}
                                                        onChange={() => {
                                                            handleRemoveToggle(index);
                                                            toggleCancelDetails(index);
                                                        }}
                                                    />

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
                                                        <Select size="small" value={item.remark || ''} onChange={(e) => updateItem(index, { remark: e.target.value })}>
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

                                                    <RadioGroup row value={item.cancelType || ''} onChange={(e) => updateItem(index, { cancelType: e.target.value })}>
                                                        <FormControlLabel value="void" control={<Radio size="small" />} label="Void" />
                                                        <FormControlLabel value="return" control={<Radio size="small" />} label="Return" />
                                                        <FormControlLabel value="complementary" control={<Radio size="small" />} label="Complementary" />
                                                    </RadioGroup>
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

                        {/* Footer */}
                        <Box sx={{ display: 'flex', p: 2, gap: 2 }}>
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
                            <AddItems allrestaurants={allrestaurants} orderItems={orderItems} setOrderItems={setOrderItems} setShowAddItem={setShowAddItem} />
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

export default EditOrderModal;
