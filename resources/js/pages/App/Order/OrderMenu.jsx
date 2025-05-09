'use client';

import SideNav from '@/components/App/SideBar/SideNav';
import { tenantAsset } from '@/helpers/asset';
import { useOrderStore } from '@/stores/useOrderStore';
import { router } from '@inertiajs/react';
import { ArrowBack, Search } from '@mui/icons-material';
import { Avatar, Badge, Box, Button, Grid, IconButton, InputAdornment, Paper, TextField, Typography } from '@mui/material';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import OrderDetail from './Detail';
import OrderSaved from './Saved';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const OrderMenu = () => {
    const { orderDetails, handleOrderDetailChange } = useOrderStore();

    const [open, setOpen] = useState(false);

    // const [showPayment, setShowPayment] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(1);
    const [editingItemIndex, setEditingItemIndex] = useState(null);
    const [activeView, setActiveView] = useState('orderDetail');
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);

    const handleCategoryClick = (categoryId) => {
        setSelectedCategory(categoryId);
    };

    const [variantPopupOpen, setVariantPopupOpen] = useState(false);
    const [variantProduct, setVariantProduct] = useState(null);
    const [initialEditItem, setInitialEditItem] = useState(null);

    // This would be called when user clicks a product
    const handleProductClick = (product) => {
        if (product.current_stock === 0) return;

        if (product.variants && product.variants.length > 0) {
            setVariantProduct(product);
            setVariantPopupOpen(true);
        } else {
            const item = {
                id: product.id,
                name: product.name,
                price: parseFloat(product.base_price),
                total_price: parseFloat(product.base_price),
                quantity: 1,
                kitchen_id: product.kitchen_id,
                category: product.category?.name || '',
                variants: [],
            };

            handleOrderDetailChange('order_items', [...orderDetails.order_items, item]);
        }
    };

    const handleVariantConfirm = (item) => {
        let updatedItems = [...orderDetails.order_items];

        if (editingItemIndex !== null) {
            updatedItems[editingItemIndex] = item;
        } else {
            updatedItems.push(item);
        }

        handleOrderDetailChange('order_items', updatedItems);
        setVariantPopupOpen(false);
        setVariantProduct(null);
        setEditingItemIndex(null);
    };

    const handleEditItem = (item, index) => {
        const fullProduct = products.find((p) => p.id === item.id);
        if (!fullProduct) return;

        setVariantProduct(fullProduct);
        setEditingItemIndex(index);
        setVariantPopupOpen(true);
        setInitialEditItem(item); // new state to pass into VariantSelector
    };

    useEffect(() => {
        axios.get(route('products.categories')).then((res) => setCategories(res.data.categories));
    }, []);

    useEffect(() => {
        axios.get(route('products.bycategory', { category_id: selectedCategory })).then((res) => setProducts(res.data.products));
    }, [selectedCategory]);

    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5.5rem',
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
                        <IconButton onClick={() => router.visit(route('order.new'))} sx={{ mr: 1 }}>
                            <ArrowBack />
                        </IconButton>
                    </Box>

                    {variantPopupOpen && variantProduct && (
                        <VariantSelector
                            product={variantProduct}
                            initialItem={initialEditItem}
                            onClose={() => {
                                setVariantPopupOpen(false);
                                setEditingItemIndex(null);
                                setInitialEditItem(null);
                            }}
                            onConfirm={handleVariantConfirm}
                        />
                    )}

                    {/* <pre>{JSON.stringify(orderDetails, null, 2)}</pre> */}

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
                                        onClick={() => handleCategoryClick(category.id)}
                                        sx={{
                                            width: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            py: 1,
                                            cursor: 'pointer',
                                            bgcolor: selectedCategory === category.id ? '#f0f7ff' : 'transparent',
                                            border: selectedCategory === category.id ? '1px solid #063455' : '1px solid #E3E3E3',
                                        }}
                                    >
                                        {/* Skip image for first item */}
                                        <Avatar
                                            src={tenantAsset(category.image)}
                                            alt={category.name}
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                mb: 1,
                                                bgcolor: selectedCategory === category.id ? '#e3f2fd' : '#f5f5f5',
                                            }}
                                        />
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
                                        {products.length > 0 ? products.length : '0'}
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
                                        products.map((product, index) => (
                                            <>
                                                {/* {index === 0 && <pre>{JSON.stringify(product, null, 2)}</pre>} */}
                                                <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={product.id}>
                                                    <Paper
                                                        elevation={0}
                                                        onClick={() => handleProductClick(product)}
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
                                                                src={tenantAsset(product.images[0])}
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
                                            </>
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
                                        variant={activeView === 'orderDetail' ? 'text' : 'outlined'}
                                        size="small"
                                        onClick={() => setActiveView('orderDetail')}
                                        sx={{
                                            borderRadius: 5,
                                            textTransform: 'none',
                                            borderColor: activeView === 'orderDetail' ? 'transparent' : '#0c3b5c',
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
                                        variant={activeView === 'orderSaved' ? 'text' : 'outlined'}
                                        size="small"
                                        onClick={() => setActiveView('orderSaved')}
                                        sx={{
                                            borderRadius: 5,
                                            textTransform: 'none',
                                            borderColor: activeView === 'orderSaved' ? 'transparent' : '#0c3b5c',
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
                            {activeView === 'orderDetail' ? (
                                <OrderDetail handleEditItem={handleEditItem} />
                            ) : (
                                <OrderSaved setActiveView={setActiveView} />
                            )}
                        </Paper>
                    </Box>
                </Box>
            </div>

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

const VariantSelector = ({ product, onConfirm, onClose, initialItem = null }) => {
    const [selectedValues, setSelectedValues] = useState({});
    const [quantity, setQuantity] = useState(initialItem?.quantity || 1);

    useEffect(() => {
        if (initialItem?.variants?.length) {
            const initial = {};
            for (const v of product.variants) {
                const match = initialItem.variants.find((iv) => iv.id === v.id);
                const option = v.values.find((opt) => opt.name === match?.value);
                if (option) {
                    initial[v.name] = option;
                }
            }
            setSelectedValues(initial);
        }
    }, [initialItem, product]);

    const handleConfirm = () => {
        const selectedVariantItems = product.variants
            .filter((variant) => selectedValues[variant.name])
            .map((variant) => {
                const selected = selectedValues[variant.name];
                return {
                    id: variant.id,
                    name: variant.name,
                    price: parseFloat(selected?.additional_price || 0),
                    value: selected?.name || '',
                };
            });

        const totalVariantPrice = selectedVariantItems.reduce((acc, v) => acc + v.price, 0);
        const total_price = (parseFloat(product.base_price) + totalVariantPrice) * quantity;

        const orderItem = {
            id: product.id,
            name: product.name,
            price: parseFloat(product.base_price),
            kitchen_id: product.kitchen_id,
            total_price,
            quantity,
            category: product.category?.name || '',
            variants: selectedVariantItems,
        };

        onConfirm(orderItem);
    };

    return (
        <div style={popupStyle}>
            <h3>{product.name}</h3>

            {product.variants.map((variant, idx) => (
                <div key={idx}>
                    <h4>{variant.name}</h4>
                    <ul>
                        {variant.values.map((v, idx2) => (
                            <li key={idx2}>
                                <button
                                    style={{
                                        marginBottom: '10px',
                                        fontWeight: selectedValues[variant.name]?.name === v.name ? 'bold' : 'normal',
                                        opacity: v.stock === 0 ? 0.5 : 1,
                                    }}
                                    disabled={v.stock === 0}
                                    onClick={() =>
                                        setSelectedValues({
                                            ...selectedValues,
                                            [variant.name]: v,
                                        })
                                    }
                                >
                                    {v.name} (+${v.additional_price}) — Stock: {v.stock}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}

            <div style={{ marginTop: '10px' }}>
                <label>
                    Quantity:
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                        style={{ marginLeft: '10px', width: '60px' }}
                    />
                </label>
            </div>

            <div style={{ marginTop: '20px' }}>
                <button onClick={handleConfirm} disabled={Object.values(selectedValues).some((v) => !v || v.stock === 0)}>
                    {initialItem ? 'Update' : 'Add'}
                </button>
                <button onClick={onClose} style={{ marginLeft: '10px' }}>
                    Cancel
                </button>
            </div>
        </div>
    );
};
const popupStyle = {
    position: 'fixed',
    top: '20%',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#fff',
    padding: '20px',
    border: '1px solid #ccc',
    zIndex: 1000,
};

export default OrderMenu;
