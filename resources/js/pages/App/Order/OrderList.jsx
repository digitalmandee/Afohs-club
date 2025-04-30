'use client';

import { ArrowBack, Search } from '@mui/icons-material';
import { Avatar, Badge, Box, Button, Grid, IconButton, InputAdornment, Paper, TextField, Typography } from '@mui/material';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import OrderDetail from './Detail';
import OrderSaved from './Saved';

const AllOrder = ({ setShowProducts }) => {
    // const [showPayment, setShowPayment] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All Menus');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [activeView, setActiveView] = useState('orderSaved');
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
    };

    const handleProductClick = (productId) => {
        setSelectedProduct(productId);
    };

    useEffect(() => {
        axios.get(route('products.categories')).then((res) => setCategories(res.data.categories));
        axios.get(route('products.bycategory', { category_id: 1 })).then((res) => setProducts(res.data.products));
    }, []);

    return (
        <>
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
                    <IconButton onClick={() => setShowProducts(false)} sx={{ mr: 1 }}>
                        <ArrowBack />
                    </IconButton>
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
                        {categories.length > 0 &&
                            categories.map((category, index) => (
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
                                            src={category.image}
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
                                {products.length > 0 &&
                                    products.map((product) => (
                                        <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={product.id}>
                                            <pre>{product.images}</pre>
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
                                                        src={product.images[0]}
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
                                                    Rs {product.base_price}
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
        </>
    );
};

export default AllOrder;
