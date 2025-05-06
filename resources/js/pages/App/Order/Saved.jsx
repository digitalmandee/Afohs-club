'use client';
import { Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, Typography } from '@mui/material';
import axios from 'axios';

import { useEffect, useState } from 'react';
import CancelOrder from '../Dashboard/DelModal';

const OrderSaved = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isNotificationVisible, setIsNotificationVisible] = useState(false);
    const [savedOrders, setSavedOrders] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false); // State for popup
    const [selectedOrder, setSelectedOrder] = useState(null); // State for selected order

    const handleCancelOrder = () => {
        setIsModalVisible(false); // Close the cancel order modal
        setIsNotificationVisible(true); // Show the notification

        // Auto-hide the notification after 3 seconds
        setTimeout(() => {
            setIsNotificationVisible(false);
        }, 3000);
    };

    const handleContinueOrderClick = (order) => {
        setSelectedOrder(order); // Set the selected order
        setIsPopupOpen(true); // Open the popup
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false); // Close the popup
    };

    useEffect(() => {
        axios
            .post(route('order.savedOrder'))
            .then((response) => {
                setSavedOrders(response.data.SavedOrders);
            })
            .catch((error) => {
                console.error('Error fetching saved orders:', error);
            });
    }, []);

    return (
        <Box
            sx={{
                bgcolor: '#FFFFFF',
                mt: 2,
                mx: -2,
                borderRadius: '20px',
                border: '1px solid #E3E3E3',
            }}
        >
            <Box
                sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <Typography
                    sx={{
                        color: '#7F7F7F',
                        fontSize: '12px',
                    }}
                >
                    Order Saved
                </Typography>
                <Typography
                    sx={{
                        color: '#063455',
                        fontWeight: 700,
                        fontSize: '14px',
                        marginLeft: 1,
                    }}
                >
                    3 Order
                </Typography>
            </Box>
            <List sx={{ p: 0 }}>
                {savedOrders.map((order, index) => (
                    <ListItem
                        key={index}
                        sx={{
                            px: 2,
                        }}
                    >
                        <Box
                            sx={{
                                width: '100%',
                                bgcolor: '#F6F6F6',
                                border: '1px solid #E3E3E3',
                                p: 2,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Avatar
                                    sx={{
                                        bgcolor: '#0C67AA',
                                        width: 36,
                                        height: 36,
                                        fontSize: '16px',
                                        color: '#FFFFFF',
                                    }}
                                >
                                    {order.table_id}
                                </Avatar>
                                {isModalVisible && <CancelOrder onClose={() => setIsModalVisible(false)} onConfirm={handleCancelOrder} />}
                                {isNotificationVisible && (
                                    <Box
                                        sx={{
                                            position: 'fixed',
                                            top: '5%',
                                            right: '2%',
                                            zIndex: 2000,
                                            display: 'flex',
                                            alignItems: 'center',
                                            bgcolor: '#E6FAE6',
                                            color: '#333',
                                            borderRadius: 2,
                                            p: 2,
                                            boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
                                            minWidth: 300,
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontWeight: 'bold',
                                                mr: 1,
                                            }}
                                        >
                                            ✅ Order Canceled!
                                        </Typography>
                                        <Typography
                                            sx={{
                                                fontSize: '0.875rem',
                                            }}
                                        >
                                            Order id <b>#Order002</b> has been canceled
                                        </Typography>
                                    </Box>
                                )}
                                <IconButton
                                    size="small"
                                    sx={{
                                        ml: 1,
                                        bgcolor: '#E3E3E3',
                                        width: 36,
                                        height: 36,
                                    }}
                                >
                                    <img src="/assets/food-tray.png" alt="" />
                                </IconButton>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 500, mr: 1 }}>
                                    {order.user.name}
                                </Typography>

                                <img
                                    src="/assets/Diamond.png"
                                    alt=""
                                    style={{
                                        height: 24,
                                        width: 24,
                                    }}
                                />
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box
                                    sx={{
                                        bgcolor: '#E3E3E3',
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        #{order.order_number}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <img
                                        src="/assets/trash.png"
                                        alt=""
                                        style={{
                                            height: 20,
                                            width: 20,
                                            marginRight: 10,
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => setIsModalVisible(true)}
                                    />
                                    <Button
                                        variant="contained"
                                        size="small"
                                        sx={{
                                            bgcolor: '#0c3b5c',
                                            textTransform: 'none',
                                            '&:hover': {
                                                bgcolor: '#072a42',
                                            },
                                        }}
                                        onClick={() => handleContinueOrderClick(order)}
                                    >
                                        Continue Order
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </ListItem>
                ))}
            </List>

            {/* Popup Dialog */}
            <Dialog open={isPopupOpen} onClose={handleClosePopup}>
                <DialogTitle>Continue Order</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to continue with order #{selectedOrder?.order_number}?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePopup} color="secondary">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            // Add logic to continue the order
                            handleClosePopup();
                        }}
                        color="primary"
                        variant="contained"
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default OrderSaved;
