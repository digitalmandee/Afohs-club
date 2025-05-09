import { router } from '@inertiajs/react';
import { AccessTime, Add } from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogContent,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Paper,
    Snackbar,
    Typography,
} from '@mui/material';
import { useState } from 'react';

function EditOrderModal({ open, onClose, orderItems, setOrderItems }) {
    const [showSuccess, setShowSuccess] = useState(false);
    const handleQuantityChange = (id, delta) => {
        setOrderItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item)));
    };

    const handleRemoveToggle = (id) => {
        setOrderItems((prev) => prev.map((item) => (item.id === id ? { ...item, removed: !item.removed } : item)));
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogContent sx={{ p: 0, width: '400px' }}>
                <Paper elevation={1} sx={{ borderRadius: 1, overflow: 'hidden' }}>
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
                        <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.5, fontSize: '18px', color: '#FFFFFF' }}>
                            #003
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 500, mb: 2, fontSize: '18px', color: '#FFFFFF' }}>
                            Applied{' '}
                            <Typography component="span" variant="body2" sx={{ opacity: 0.8, fontWeight: 500, fontSize: '18px' }}>
                                (Member)
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
                                T2
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

                    {/* Scrollable Content */}
                    <Box
                        sx={{
                            maxHeight: '300px', // adjust based on needs
                            overflowY: 'auto',
                            scrollbarWidth: 'none', // Firefox
                            '&::-webkit-scrollbar': {
                                display: 'none', // Chrome, Safari
                            },
                        }}
                    >
                        {/* Order Items */}
                        <List sx={{ py: 0 }}>
                            {orderItems.map((item) => (
                                <ListItem
                                    key={item.id}
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
                                    <ListItemText primary={item.name} />
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <IconButton size="small" onClick={() => handleQuantityChange(item.id, -1)} sx={{ color: '#003153' }}>
                                            <Typography sx={{ fontSize: 16, fontWeight: 'bold' }}>-</Typography>
                                        </IconButton>
                                        <Typography sx={{ mx: 1, minWidth: 20, textAlign: 'center' }}>{item.quantity}x</Typography>
                                        <IconButton size="small" onClick={() => handleQuantityChange(item.id, 1)} sx={{ color: '#003153' }}>
                                            <Typography sx={{ fontSize: 16, fontWeight: 'bold' }}>+</Typography>
                                        </IconButton>
                                        <Checkbox
                                            checked={item.removed}
                                            onChange={() => handleRemoveToggle(item.id)}
                                            sx={{
                                                color: '#ccc',
                                                '&.Mui-checked': {
                                                    color: '#003153',
                                                },
                                            }}
                                        />
                                    </Box>
                                </ListItem>
                            ))}
                        </List>

                        {/* Add Item */}
                        <Box sx={{ p: 2, pt: 0 }}>
                            <Button
                                variant="outlined"
                                fullWidth
                                startIcon={
                                    <Add
                                        sx={{
                                            color: '#063455',
                                        }}
                                    />
                                }
                                sx={{
                                    border: '1px solid #063455',
                                    color: '#063455',
                                    textTransform: 'none',
                                    py: 1,
                                    mb: 1,
                                }}
                                onClick={() => router.visit('/all/order')}
                            >
                                Add Item
                            </Button>
                        </Box>
                    </Box>

                    {/* Footer Actions */}
                    <Box sx={{ display: 'flex', p: 2, pt: 0, gap: 2 }}>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={onClose}
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
                                // Save logic
                                setShowSuccess(true); // Show the toast
                                onClose(); // Close the drawer/modal
                            }}
                            sx={{
                                bgcolor: '#003153',
                                '&:hover': { bgcolor: '#00254d' },
                                textTransform: 'none',
                                py: 1,
                            }}
                        >
                            Save Change
                        </Button>
                        <Snackbar
                            open={showSuccess}
                            autoHideDuration={5000}
                            onClose={() => setShowSuccess(false)}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                            <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
                                Order edit Successfully! <br />
                                The order detail edit successfully
                            </Alert>
                        </Snackbar>
                    </Box>
                </Paper>
            </DialogContent>
        </Dialog>
    );
}

export default EditOrderModal;
