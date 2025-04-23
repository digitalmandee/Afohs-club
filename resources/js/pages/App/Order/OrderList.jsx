'use client';

import SideNav from '@/components/App/SideBar/SideNav';
import { router } from '@inertiajs/react';
import { ArrowBack, Search } from '@mui/icons-material';
import { Avatar, Badge, Box, Button, Grid, IconButton, InputAdornment, Paper, TextField, Typography } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import OrderDetail from './Detail';
import OrderSaved from './Saved';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const AllOrder = () => {
    const [open, setOpen] = useState(false);
    // const [showPayment, setShowPayment] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All Menus');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [activeView, setActiveView] = useState('orderSaved');

    const categories = [
        { id: 'all', name: 'All Menus', icon: '' },
        { id: 'beverage', name: 'Beverage', icon: '/assets/image.png' },
        { id: 'food', name: 'Food', icon: '/assets/cimage.png' },
        { id: 'snack', name: 'Snack', icon: '/assets/bgimage.png' },
        { id: 'imaji', name: 'Imaji', icon: '/assets/cimage.png' },
        { id: 'home', name: 'Home', icon: '/assets/image.png' },
    ];

    const products = [
        {
            id: 1,
            name: 'Ristretto Bianco',
            category: 'Coffee & Beverage',
            price: 4.0,
            image: '/assets/image.png',
        },
        {
            id: 2,
            name: 'Cappuccino',
            category: 'Coffee & Beverage',
            price: 5.0,
            image: '/assets/cimage.png',
        },
        {
            id: 3,
            name: 'Orange Juice',
            category: 'Coffee & Beverage',
            price: 4.0,
            image: '/assets/bgimage.png',
        },
        {
            id: 4,
            name: 'Soda Beverage',
            category: 'Coffee & Beverage',
            price: 5.0,
            image: '/assets/image.png',
        },
        {
            id: 5,
            name: 'Iced Chocolate',
            category: 'Coffee & Beverage',
            price: 4.0,
            image: '/assets/cimage.png',
        },
        {
            id: 6,
            name: 'Milk Coffee',
            category: 'Coffee & Beverage',
            price: 5.0,
            image: '/assets/bgimage.png',
        },
        {
            id: 7,
            name: 'Iced Coffee',
            category: 'Coffee & Beverage',
            price: 4.0,
            image: '/assets/image.png',
        },
        {
            id: 8,
            name: 'Soda Beverage',
            category: 'Coffee & Beverage',
            price: 5.0,
            image: '/assets/cimage.png',
        },
        {
            id: 9,
            name: 'Ristretto Bianco',
            category: 'Coffee & Beverage',
            price: 4.0,
            image: '/assets/bgimage.png',
        },
        {
            id: 10,
            name: 'Cappuccino',
            category: 'Coffee & Beverage',
            price: 5.0,
            image: '/assets/image.png',
        },
        {
            id: 11,
            name: 'Orange Juice',
            category: 'Coffee & Beverage',
            price: 4.0,
            image: '/assets/cimage.png',
        },
        {
            id: 12,
            name: 'Soda Beverage',
            category: 'Coffee & Beverage',
            price: 5.0,
            image: '/assets/bgimage.png',
        },
        {
            id: 13,
            name: 'Sea Food',
            category: 'Food',
            price: 4.0,
            image: '/assets/image.png',
        },
        {
            id: 14,
            name: 'Chocolate Crisp',
            category: 'Snack',
            price: 5.0,
            image: '/assets/cimage.png',
        },
        {
            id: 15,
            name: 'Sandwich',
            category: 'Food',
            price: 4.0,
            image: '/assets/bgimage.png',
        },
        {
            id: 16,
            name: 'Buttermilk',
            category: 'Beverage',
            price: 5.0,
            image: '/assets/image.png',
        },
    ];

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
    };

    const handleProductClick = (productId) => {
        setSelectedProduct(productId);
    };

    const handleBackToAllOrders = () => {
        // Navigate back to all orders page
        router.visit(-1);
    };

    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                }}
            >
                <Box
                    sx={{
                        bgcolor: '#f5f5f5',
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            py: 1,
                            // px: 3,
                            display: 'flex',
                            alignItems: 'center',
                            // borderBottom: "1px solid #e0e0e0",
                            // bgcolor: "white",
                        }}
                    >
                        <IconButton onClick={handleBackToAllOrders} sx={{ mr: 1 }}>
                            <ArrowBack />
                        </IconButton>
                        {/* <Typography variant="h6" sx={{ fontWeight: 500 }}>
              All Order
            </Typography> */}
                    </Box>

                    {/* Main Content */}
                    <Box
                        sx={{
                            display: 'flex',
                            flex: 1,
                            p: 1,
                            gap: 2,
                        }}
                    >
                        {/* Left Category Sidebar */}
                        <Box
                            sx={{
                                width: '80px',
                                marginLeft: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                bgcolor: '#FFFFFF',
                                px: 1,
                                py: 2,
                                borderRadius: '12px',
                                gap: 2,
                            }}
                        >
                            {categories.map((category, index) => (
                                <Box
                                    key={category.id}
                                    onClick={() => handleCategoryClick(category.name)}
                                    sx={{
                                        width: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        py: 1,
                                        cursor: 'pointer',
                                        bgcolor: selectedCategory === category.name ? '#f0f7ff' : 'transparent',
                                        border: index === 0 ? '1px solid #063455' : '1px solid #E3E3E3',
                                    }}
                                >
                                    {/* Skip image for first item */}
                                    {index !== 0 && (
                                        <Avatar
                                            src={category.icon}
                                            alt={category.name}
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                mb: 1,
                                                bgcolor: selectedCategory === category.name ? '#e3f2fd' : '#f5f5f5',
                                            }}
                                        />
                                    )}
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            fontSize: '12px',
                                            color: '#121212',
                                            textAlign: 'center',
                                        }}
                                    >
                                        {category.name}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>

                        {/* Main Content Area */}
                        <Box
                            sx={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                borderRadius: '12px',
                                bgcolor: '#FBFBFB',
                            }}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    // mb: 2,
                                    borderRadius: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    bgcolor: 'transparent',
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mr: 1 }}>
                                        67
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Products
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <TextField
                                        placeholder="Search"
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            width: 300,
                                            // height:44,
                                            mr: 2,
                                            borderRadius: 0,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 0,
                                                backgroundColor: '#FFFFFF',
                                                '& fieldset': {
                                                    border: '1px solid #121212',
                                                },
                                                '&:hover fieldset': {
                                                    border: '1px solid #121212',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    border: '1px solid #121212',
                                                },
                                            },
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Search />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <img
                                        src="/assets/right.png"
                                        alt=""
                                        style={{
                                            width: '39px',
                                            height: '39px',
                                        }}
                                    />
                                </Box>
                            </Paper>

                            {/* Products Grid */}
                            <Paper
                                elevation={0}
                                sx={{
                                    flex: 1,
                                    // borderRadius: 2,
                                    p: 1,
                                    overflow: 'auto',
                                    bgcolor: 'transparent',
                                }}
                            >
                                <Grid container spacing={2}>
                                    {products.map((product) => (
                                        <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={product.id}>
                                            <Paper
                                                elevation={0}
                                                onClick={() => handleProductClick(product.id)}
                                                sx={{
                                                    p: 2,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    border: '1px solid #eee',
                                                    borderRadius: 2,
                                                    height: '100%',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                    },
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 80,
                                                        height: 80,
                                                        borderRadius: '50%',
                                                        overflow: 'hidden',
                                                        mb: 1.5,
                                                    }}
                                                >
                                                    <Box
                                                        component="img"
                                                        src={product.image}
                                                        alt={product.name}
                                                        sx={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                        }}
                                                    />
                                                </Box>
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        fontWeight: 500,
                                                        mb: 0.5,
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    {product.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                                                    Rs {product.price.toFixed(2)}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Paper>
                        </Box>

                        {/* Order Details Section */}
                        <Paper
                            sx={{
                                width: 320,
                                borderRadius: 2,
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                bgcolor: '#FBFBFB',
                            }}
                        >
                            {/* Header with toggle buttons */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mb: 2,
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        width: '100%',
                                    }}
                                >
                                    {/* Order Detail Button */}
                                    <Button
                                        variant={activeView === 'orderDetail' ? 'outlined' : 'text'}
                                        size="small"
                                        onClick={() => setActiveView('orderDetail')}
                                        sx={{
                                            borderRadius: 5,
                                            textTransform: 'none',
                                            borderColor: activeView === 'orderDetail' ? '#0c3b5c' : 'transparent',
                                            color: '#0c3b5c',
                                            minWidth: 'auto',
                                            px: 1.5,
                                            fontSize: '16px',
                                        }}
                                    >
                                        Order Detail
                                    </Button>

                                    {/* Order Saved Button */}
                                    <Button
                                        variant={activeView === 'orderSaved' ? 'outlined' : 'text'}
                                        size="small"
                                        onClick={() => setActiveView('orderSaved')}
                                        sx={{
                                            borderRadius: 5,
                                            textTransform: 'none',
                                            borderColor: activeView === 'orderSaved' ? '#0c3b5c' : 'transparent',
                                            color: '#0c3b5c',
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontSize: '16px',
                                        }}
                                    >
                                        Order Saved
                                        <Badge badgeContent="3" color="primary" sx={{ ml: 3, mr: 1 }} />
                                    </Button>
                                </Box>
                            </Box>

                            {/* Conditional rendering based on active view */}
                            {activeView === 'orderDetail' ? <OrderDetail /> : <OrderSaved />}
                        </Paper>
                    </Box>
                </Box>

                {/* Payment Modal */}
                {/* <Modal
                    open={showPayment}
                    onClose={() => setShowPayment(false)}
                    aria-labelledby="payment-modal-title"
                    aria-describedby="payment-modal-description"
                    closeAfterTransition
                    sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                    }}
                >
                    <Slide
                        direction="left"
                        in={showPayment}
                        mountOnEnter
                        unmountOnExit
                    >
                        <Box
                            sx={{
                                position: "fixed",
                                top: "10px",
                                bottom: "10px",
                                right: 10,
                                width: { xs: "100%", sm: 900 },
                                bgcolor: "#fff",
                                boxShadow: 4,
                                zIndex: 1300,
                                overflowY: "auto",
                                borderRadius: 1,
                                scrollbarWidth: "none",
                                "&::-webkit-scrollbar": {
                                    display: "none",
                                },
                            }}
                        >
                            <PaymentPage />
                        </Box>
                    </Slide>
                </Modal> */}
            </div>
        </>
    );
};

export default AllOrder;
