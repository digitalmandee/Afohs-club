import { router } from '@inertiajs/react';
import { AccessTime, Add } from '@mui/icons-material';
import { Alert, Avatar, Box, Button, Checkbox, Dialog, DialogContent, IconButton, List, ListItem, ListItemText, Paper, Snackbar, Typography, Slide } from '@mui/material';
import { useState } from 'react';
import AddItems from './AddItem';

function EditOrderModal({ open, onClose, order, orderItems, setOrderItems, onSave }) {
    const [showSuccess, setShowSuccess] = useState(false);
    const [showAddItem, setShowAddItem] = useState(false);

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
                    },
                };
            }),
        );
    };

    const handleRemoveToggle = (index) => {
        setOrderItems((prev) => prev.map((item, i) => (i === index ? { ...item, removed: !item.removed } : item)));
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} fullScreen={showAddItem} TransitionComponent={Slide}>
                <DialogContent
                    sx={{
                        p: 0,
                        width: showAddItem ? '100%' : '400px', // expand when adding
                        maxWidth: '100vw',
                        height: '90vh',
                        display: 'flex',
                        flexDirection: 'row',
                    }}
                >
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
                                {order?.user?.member_type?.name ?? '—'}{' '}
                                <Typography component="span" variant="body2" sx={{ opacity: 0.8, fontWeight: 500 }}>
                                    ({order?.type ?? '—'})
                                </Typography>
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
                                maxHeight: showAddItem ? 'calc(100vh - 200px)' : '300px',
                                overflowY: 'auto',
                                '&::-webkit-scrollbar': {
                                    display: 'none',
                                },
                            }}
                        >
                            <List sx={{ py: 0 }}>
                                {/* {JSON.stringify(orderItems)} */}
                                {orderItems.length > 0 &&
                                    orderItems.map((item, index) => (
                                        <ListItem
                                            key={index}
                                            divider
                                            sx={{
                                                py: 0,
                                                px: 2,
                                                ...(item.removed && {
                                                    '& .MuiListItemText-primary': {
                                                        textDecoration: 'line-through',
                                                    },
                                                }),
                                            }}
                                        >
                                            <ListItemText primary={item.order_item?.name} />
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
                                                ) : (
                                                    <Checkbox
                                                        checked={item.removed}
                                                        onChange={() => handleRemoveToggle(index)}
                                                        sx={{
                                                            color: '#ccc',
                                                            '&.Mui-checked': {
                                                                color: '#003153',
                                                            },
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        </ListItem>
                                    ))}
                            </List>

                            {/* Add Item Button */}
                            <Box sx={{ p: 2, pt: 0 }}>
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
                        </Box>

                        {/* Footer */}
                        <Box sx={{ display: 'flex', p: 2, pt: 0, gap: 2 }}>
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
                                onClick={() => {
                                    console.log('Saving order:', order.id, orderItems);
                                    setShowSuccess(true);
                                    onSave();
                                }}
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
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                                <Button variant="outlined" size="small" onClick={() => setShowAddItem(false)} sx={{ textTransform: 'none' }}>
                                    Close Add Item
                                </Button>
                            </Box>
                            <AddItems orderItems={orderItems} setOrderItems={setOrderItems} />
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            <Snackbar open={showSuccess} autoHideDuration={5000} onClose={() => setShowSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
                    Order edit Successfully! <br />
                    The order detail edit successfully
                </Alert>
            </Snackbar>
        </>
    );
}

export default EditOrderModal;
