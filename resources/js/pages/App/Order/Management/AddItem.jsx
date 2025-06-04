'use client';

import { tenantAsset } from '@/helpers/asset';
import { Search } from '@mui/icons-material';
import { Avatar, Badge, Box, Button, FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Paper, Select, TextField, Typography } from '@mui/material';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';

const AddItems = ({ setOrderItems, orderItems, setShowAddItem, allrestaurants }) => {
    const [selectedCategory, setSelectedCategory] = useState(1);
    const [editingItemIndex, setEditingItemIndex] = useState(null);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(allrestaurants[0]?.id);

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
            console.log(product);

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

            setOrderItems((prev) => [...prev, { id: 'new', order_item: item, removed: false }]);
            // handleOrderDetailChange('order_items', [...orderDetails.order_items, item]);
        }
    };

    const handleVariantConfirm = (item) => {
        let updatedItems = [...orderItems];

        if (editingItemIndex !== null) {
            updatedItems[editingItemIndex] = item;
        } else {
            updatedItems.push(item);
        }

        setOrderItems((prev) => [...prev, { id: 'new', order_item: item, removed: false }]);
        // handleOrderDetailChange('order_items', updatedItems);
        setVariantPopupOpen(false);
        setVariantProduct(null);
        setEditingItemIndex(null);
    };

    useEffect(() => {
        axios.get(route('products.categories'), { params: { tenant_id: selectedRestaurant } }).then((res) => setCategories(res.data.categories));
    }, [selectedRestaurant]);

    useEffect(() => {
        axios.get(route('products.bycategory', { category_id: selectedCategory })).then((res) => setProducts(res.data.products));
    }, [selectedCategory]);

    return (
        <>
            <div>
                <Box
                    sx={{
                        bgcolor: '#f5f5f5',
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, px: 3 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <Button variant="outlined" size="small" onClick={() => setShowAddItem(false)} sx={{ textTransform: 'none' }}>
                                Close Add Item
                            </Button>
                        </Box>

                        <Box>
                            <FormControl fullWidth>
                                <InputLabel id="restuarant-label">Restuarants</InputLabel>
                                <Select labelId="restuarant-label" size="small" value={selectedRestaurant} label="Restuarants" onChange={(e) => setSelectedRestaurant(e.target.value)}>
                                    {allrestaurants.length > 0 &&
                                        allrestaurants.map((item, index) => (
                                            <MenuItem value={item.id} key={index}>
                                                {item.name}
                                            </MenuItem>
                                        ))}
                                </Select>
                            </FormControl>
                        </Box>
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
                    </Box>
                </Box>
            </div>
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
                    <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} style={{ marginLeft: '10px', width: '60px' }} />
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

export default AddItems;
