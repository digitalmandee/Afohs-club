import SideNav from '@/components/App/SideBar/SideNav';
import { tenantAsset } from '@/helpers/asset';
import { useOrderStore } from '@/stores/useOrderStore';
import { router, usePage } from '@inertiajs/react';
import { ArrowBack, Search } from '@mui/icons-material';
import { Avatar, Badge, Box, Button, FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Paper, Select, TextField, Typography } from '@mui/material';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import OrderDetail from './Detail';
import OrderSaved from './Saved';
import VariantSelectorDialog from './VariantSelectorDialog';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const OrderMenu = () => {
    const { orderNo, orderContext, totalSavedOrders, allrestaurants, activeTenantId, firstCategoryId, reservation } = usePage().props;

    const { orderDetails, handleOrderDetailChange } = useOrderStore();

    const [open, setOpen] = useState(true);

    // const [showPayment, setShowPayment] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(firstCategoryId || '');
    const [selectedRestaurant, setSelectedRestaurant] = useState(activeTenantId);
    const [variantProductId, setVariantProductId] = useState(null);
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
        if (product.minimal_stock > product.current_stock - 1) return;

        if (product.variants && product.variants.length > 0) {
            setVariantProductId(product.id);
            setVariantProduct(product);
            setVariantPopupOpen(true);
        } else {
            const existingIndex = orderDetails.order_items.findIndex((item) => item.id === product.id && item.variants.length === 0);

            if (existingIndex !== -1) {
                // Update existing item (increment quantity & total_price)
                const updatedItems = [...orderDetails.order_items];
                const existingItem = updatedItems[existingIndex];

                const newQuantity = existingItem.quantity + 1;
                updatedItems[existingIndex] = {
                    ...existingItem,
                    quantity: newQuantity,
                    total_price: newQuantity * existingItem.price,
                };

                handleOrderDetailChange('order_items', updatedItems);
            } else {
                // Add new item
                const newItem = {
                    id: product.id,
                    name: product.name,
                    price: parseFloat(product.base_price),
                    total_price: parseFloat(product.base_price),
                    quantity: 1,
                    tenant_id: product.tenant_id,
                    category: product.category?.name || '',
                    variants: [],
                };

                handleOrderDetailChange('order_items', [...orderDetails.order_items, newItem]);
            }
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
        setVariantProductId(item.id);
        setEditingItemIndex(index);
        setVariantPopupOpen(true);
        setInitialEditItem(item); // new state to pass into VariantSelector
    };

    useEffect(() => {
        axios.get(route('products.categories'), { params: { tenant_id: selectedRestaurant } }).then((res) => setCategories(res.data.categories));
    }, [selectedRestaurant]);

    useEffect(() => {
        axios
            .get(route('products.bycategory', { category_id: selectedCategory }), {
                params: { order_type: orderDetails.order_type },
            })
            .then((res) => setProducts(res.data.products));
    }, [selectedCategory]);

    useEffect(() => {
        if (reservation && (reservation.member || reservation.customer)) {
            const memberData = { id: reservation.member ? reservation.member.user_id : reservation.customer.id, name: reservation.member ? reservation.member.full_name : reservation.customer.name, membership_no: reservation.member ? reservation.member.membership_no : reservation.customer.customer_no, booking_type: reservation.member ? 'member' : 'guest' };
            handleOrderDetailChange('member', memberData);
            handleOrderDetailChange('person_count', reservation.person_count);
            handleOrderDetailChange('table', reservation.table);
            handleOrderDetailChange('reservation_id', reservation.id);
            handleOrderDetailChange('order_type', 'reservation');
        }
        handleOrderDetailChange('order_no', orderNo);
        if (orderContext) {
            Object.entries(orderContext).forEach(([key, value]) => {
                handleOrderDetailChange(key, value);
            });
        }
    }, [reservation, orderContext]);

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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, pr: 2 }}>
                        <Box
                            sx={{
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
                            <Typography sx={{ color: '#063455', fontSize: '30px', fontWeight: 500 }}>Back</Typography>
                        </Box>
                        <Box>
                            <FormControl fullWidth>
                                <InputLabel id="restuarant-label">Restuarants</InputLabel>
                                <Select labelId="restuarant-label" value={selectedRestaurant} size="small" label="Restuarants" onChange={(e) => setSelectedRestaurant(e.target.value)}>
                                    {allrestaurants && allrestaurants.length > 0
                                        ? allrestaurants.map((item, index) => (
                                              <MenuItem value={item.id} key={index}>
                                                  {item.name}
                                              </MenuItem>
                                          ))
                                        : ''}
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>

                    {variantPopupOpen && (
                        <VariantSelectorDialog
                            open={variantPopupOpen}
                            onClose={() => {
                                setVariantPopupOpen(false);
                                setEditingItemIndex(null);
                                setInitialEditItem(null);
                            }}
                            productId={variantProductId}
                            initialItem={initialEditItem}
                            onConfirm={handleVariantConfirm}
                        />
                    )}

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
                                // width: '95px',
                                flex: { xs: '1 1 100%', sm: '0 0 100px', md: '0 0 95px' },
                                marginLeft: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                bgcolor: '#FFFFFF',
                                px: 1,
                                py: 2,
                                borderRadius: '12px',
                                gap: 2,
                                maxHeight: 7 * 90,
                                overflowY: 'auto',
                                scrollbarWidth: 'thin', // for Firefox
                                '&::-webkit-scrollbar': {
                                    width: '4px', // for Chrome/Edge
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: '#ccc',
                                    borderRadius: '4px',
                                },
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
                                            mb: 0.5,
                                        }}
                                    >
                                        {/* Skip image for first item */}
                                        {category.image && (
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
                                // width: '55%',
                                flex: { xs: '1 1 100%', md: '1 1 60%' }, // Responsive width
                                minWidth: 300,
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
                                <Grid container spacing={0} sx={{ flexWrap: 'wrap', gap: 1 }}>
                                    {products.length > 0 &&
                                        products.map((product, index) => (
                                            <Grid item key={product.id} sx={{ width: '15%' }}>
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
                                                        width: 100,
                                                        cursor: 'pointer',
                                                        // bgcolor: 'pink',
                                                        '&:hover': {
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                        },
                                                    }}
                                                >
                                                    {product.images && product.images.length > 0 && (
                                                        <Box
                                                            sx={{
                                                                width: 40,
                                                                height: 40,
                                                                borderRadius: '50%',
                                                                overflow: 'hidden',
                                                                // mb: 1,
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
                                                    )}

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
                                // width: '40%',
                                flex: { xs: '1 1 100%', md: '1 1 40%' }, // Responsive width
                                minWidth: 280,
                                borderRadius: 2,
                                p: 2,
                                // height:'80vh',
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
                                        <Badge badgeContent={totalSavedOrders ?? 0} color="primary" sx={{ ml: 3, mr: 1 }} />
                                    </Button>
                                </Box>
                            </Box>

                            {/* Conditional rendering based on active view */}
                            {activeView === 'orderDetail' ? <OrderDetail handleEditItem={handleEditItem} /> : <OrderSaved setActiveView={setActiveView} />}
                        </Paper>
                    </Box>
                </Box>
            </div>
        </>
    );
};
OrderMenu.layout = (page) => page;
export default OrderMenu;
