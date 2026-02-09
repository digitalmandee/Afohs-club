import SideNav from '@/components/App/SideBar/SideNav';
import { tenantAsset } from '@/helpers/asset';
import { useOrderStore } from '@/stores/useOrderStore';
import { router, usePage } from '@inertiajs/react';
import { ArrowBack, Search } from '@mui/icons-material';
import { Avatar, Badge, Box, Button, FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Paper, Select, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import OrderDetail from './Detail';
import OrderSaved from './Saved';
import VariantSelectorDialog from './VariantSelectorDialog';
import ShiftGate from '@/components/Pos/ShiftGate';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const OrderMenu = () => {
    const { orderNo, orderContext, totalSavedOrders, allrestaurants, activeTenantId, firstCategoryId, reservation, is_new_order } = usePage().props;

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
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchMode, setSearchMode] = useState('product'); // 'product' or 'booking'

    const handleCategoryClick = (categoryId) => {
        setSelectedCategory(categoryId);
        // Clear search when selecting category
        setSearchTerm('');
        setShowSearchResults(false);
        setSearchResults([]);
    };

    const [variantPopupOpen, setVariantPopupOpen] = useState(false);
    const [variantProduct, setVariantProduct] = useState(null);
    const [initialEditItem, setInitialEditItem] = useState(null);

    // Search functionality

    // Search functionality
    const handleSearch = async (value) => {
        setSearchTerm(value);

        if (value.trim() === '') {
            setShowSearchResults(false);
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        try {
            const url = searchMode === 'booking' ? route('api.cake-bookings.search') : route('order.search.products');
            const params = searchMode === 'booking' ? { query: value.trim() } : { search: value.trim() };

            const response = await axios.get(url, { params });

            if (searchMode === 'booking') {
                // Booking API returns array directly
                setSearchResults(response.data);
                setShowSearchResults(true);
            } else {
                if (response.data.success) {
                    setSearchResults(response.data.products);
                    setShowSearchResults(true);
                }
            }
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Handle product click from search results
    const handleSearchProductClick = (product) => {
        // If product is from different restaurant, switch restaurant first
        if (product.tenant_id !== selectedRestaurant) {
            setSelectedRestaurant(product.tenant_id);
            // Clear current category selection since we're switching restaurants
            setSelectedCategory('');
        }

        // Add product to order
        handleProductClick(product);

        // Clear search
        setSearchTerm('');
        setShowSearchResults(false);
        setSearchResults([]);
    };

    const handleBookingClick = (booking) => {
        const product = booking.cake_type;
        if (!product) {
            alert('Booking has no associated product/cake type.');
            return;
        }

        const bookedPrice = parseFloat(booking.total_price);
        const advanceAmount = parseFloat(booking.advance_amount || 0);

        const newItem = {
            id: product.id,
            name: product.name + ` (Booking #${booking.booking_number || booking.id})`,
            price: bookedPrice,
            total_price: bookedPrice,
            quantity: 1,
            tenant_id: product.tenant_id,
            category: product.category?.name || 'Cakes',
            variants: [],
            is_discountable: false, // Usually fixed price
            discount_value: 0,
            discount_type: 'percentage',
            discount_amount: 0,
            is_taxable: product.is_taxable,
            booking_id: booking.id,
        };

        const details = [];
        if (booking.weight) details.push({ value: `Weight: ${booking.weight}` });
        if (booking.flavor) details.push({ value: `Flavor: ${booking.flavor}` });

        if (details.length > 0) {
            newItem.variants = details;
        }

        handleOrderDetailChange('order_items', [...orderDetails.order_items, newItem]);

        // Update Advance Amount in Order Store (assuming store supports it, if not need to add handling)
        // Check if advance_amount exists in store or just add to notes/deduction
        // Based on previous task, we might used 'advance_amount' in order details
        handleOrderDetailChange('advance_amount', (orderDetails.advance_amount || 0) + advanceAmount);

        // Clear search
        setSearchTerm('');
        setShowSearchResults(false);
        setSearchResults([]);
    };

    // This would be called when user clicks a product
    const handleProductClick = (product) => {
        // Only check stock if management is enabled
        if (product.manage_stock && product.minimal_stock > product.current_stock - 1) return;

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
                    is_discountable: product.is_discountable !== false,
                    discount_value: 0,
                    discount_type: 'percentage',
                    discount_amount: 0,
                    is_taxable: product.is_taxable, // Add is_taxable flag
                    max_discount: product.max_discount,
                    max_discount_type: product.max_discount_type,
                    manage_stock: product.manage_stock,
                    current_stock: product.current_stock,
                    minimal_stock: product.minimal_stock,
                };

                handleOrderDetailChange('order_items', [...orderDetails.order_items, newItem]);
            }
        }
    };

    const handleVariantConfirm = (item) => {
        let updatedItems = [...orderDetails.order_items];

        if (editingItemIndex !== null) {
            const oldItem = updatedItems[editingItemIndex];

            const mergedItem = {
                ...oldItem,
                ...item,
                // Preserve critical fields
                is_saved: oldItem.is_saved,
                discount_value: oldItem.discount_value,
                discount_type: oldItem.discount_type,
            };

            // Recalculate discount
            if (mergedItem.discount_value > 0) {
                const gross = mergedItem.total_price;
                let disc = 0;
                if (mergedItem.discount_type === 'percentage') {
                    disc = Math.round(gross * (mergedItem.discount_value / 100));
                } else {
                    disc = Math.round(mergedItem.discount_value * mergedItem.quantity);
                }
                if (disc > gross) disc = gross;
                mergedItem.discount_amount = disc;
            } else {
                mergedItem.discount_amount = 0;
            }

            updatedItems[editingItemIndex] = mergedItem;
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
        if (reservation) {
            handleOrderDetailChange('reservation_id', reservation.id);
            handleOrderDetailChange('order_type', 'reservation');

            if (reservation.member || reservation.customer) {
                const memberData = { id: reservation.member ? reservation.member.user_id : reservation.customer.id, name: reservation.member ? reservation.member.full_name : reservation.customer.name, membership_no: reservation.member ? reservation.member.membership_no : reservation.customer.customer_no, booking_type: reservation.member ? 'member' : 'guest' };
                handleOrderDetailChange('member', memberData);
            }
            handleOrderDetailChange('person_count', reservation.person_count);
            handleOrderDetailChange('table', reservation.table);

            // Load existing order items if available

            // Load existing order items if available
            if (reservation.order) {
                handleOrderDetailChange('id', reservation.order.id);
                handleOrderDetailChange('order_no', reservation.order.order_no);

                if (reservation.order.order_items && reservation.order.order_items.length > 0) {
                    const mappedItems = reservation.order.order_items.map((item) => {
                        const productData = item.order_item || {};
                        return {
                            ...productData,
                            quantity: productData.quantity,
                            total_price: productData.quantity * (productData.price || 0),
                            // Restore other fields if necessary
                            discount_value: productData.discount_value,
                            discount_type: productData.discount_type,
                            discount_amount: productData.discount_amount,
                            variants: productData.variants || [],
                            is_saved: true, // Mark as existing in DB
                        };
                    });
                    handleOrderDetailChange('order_items', mappedItems);
                }
            }
        }
        if (!reservation || !reservation.order) {
            handleOrderDetailChange('order_no', orderNo);
        }
        if (orderContext) {
            Object.entries(orderContext).forEach(([key, value]) => {
                handleOrderDetailChange(key, value);
            });

            if (orderContext.cake_booking) {
                const booking = orderContext.cake_booking;
                const product = booking.cake_type;

                if (product) {
                    const bookedPrice = parseFloat(booking.total_price);
                    const advanceAmount = parseFloat(booking.advance_amount || 0);

                    const newItem = {
                        id: product.id,
                        name: product.name + ` (Booking #${booking.booking_number || booking.id})`,
                        price: bookedPrice,
                        total_price: bookedPrice,
                        quantity: 1,
                        tenant_id: product.tenant_id,
                        category: product.category?.name || 'Cakes',
                        variants: [],
                        is_discountable: false,
                        discount_value: 0,
                        discount_type: 'percentage',
                        discount_amount: 0,
                        is_taxable: product.is_taxable,
                        booking_id: booking.id,
                    };

                    const details = [];
                    if (booking.weight) details.push({ value: `Weight: ${booking.weight}` });
                    if (booking.flavor) details.push({ value: `Flavor: ${booking.flavor}` });
                    if (booking.message) details.push({ value: `Msg: ${booking.message}` });

                    if (details.length > 0) {
                        newItem.variants = details;
                    }

                    handleOrderDetailChange('order_items', [newItem]);
                    handleOrderDetailChange('advance_amount', advanceAmount);
                }
            }
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
                                    <Box sx={{ display: 'flex' }}>
                                        <TextField
                                            placeholder={searchMode === 'booking' ? 'Search Booking # or Name' : 'Search by ID, menu code or name'}
                                            variant="outlined"
                                            size="small"
                                            value={searchTerm}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            sx={{
                                                width: 300,
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
                                    </Box>
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
                                {/* Search Results */}
                                {showSearchResults ? (
                                    <Box>
                                        <Typography variant="h6" sx={{ mb: 2, color: '#063455' }}>
                                            Search Results ({searchResults.length})
                                        </Typography>
                                        {isSearching ? (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                                <Typography>Searching...</Typography>
                                            </Box>
                                        ) : searchResults.length > 0 ? (
                                            <Grid container spacing={0} sx={{ flexWrap: 'wrap', gap: 1 }}>
                                                {searchResults.map((item, index) => {
                                                    // Determine if it's a product or booking based on searchMode
                                                    if (searchMode === 'booking') {
                                                        return (
                                                            <Grid item key={item.id} sx={{ width: '20%' }}>
                                                                <Paper
                                                                    elevation={0}
                                                                    onClick={() => handleBookingClick(item)}
                                                                    sx={{
                                                                        p: 2,
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'center',
                                                                        border: '1px solid #063455',
                                                                        bgcolor: '#e3f2fd',
                                                                        cursor: 'pointer',
                                                                        borderRadius: 2,
                                                                        height: '100%',
                                                                        '&:hover': {
                                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                                        },
                                                                    }}
                                                                >
                                                                    <Typography variant="subtitle2" fontWeight="bold">
                                                                        #{item.booking_number}
                                                                    </Typography>
                                                                    <Typography variant="caption">{item.customer_name || item.member?.full_name}</Typography>
                                                                    <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                                                                        {item.cake_type?.name}
                                                                    </Typography>
                                                                    <Typography variant="caption">Total: {item.total_price}</Typography>
                                                                    <Typography variant="caption">Adv: {item.advance_amount || 0}</Typography>
                                                                </Paper>
                                                            </Grid>
                                                        );
                                                    }

                                                    // Product Render
                                                    const product = item;
                                                    return (
                                                        <Grid item key={product.id} sx={{ width: '15%' }}>
                                                            <Paper
                                                                elevation={0}
                                                                onClick={() => handleSearchProductClick(product)}
                                                                sx={{
                                                                    p: 2,
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center',
                                                                    border: product.tenant_id !== selectedRestaurant ? '2px solid #ff9800' : '1px solid #eee',
                                                                    opacity: product.manage_stock && product.minimal_stock > product.current_stock - 1 ? 0.5 : 1,
                                                                    cursor: product.manage_stock && product.minimal_stock > product.current_stock - 1 ? 'not-allowed' : 'pointer',
                                                                    borderRadius: 2,
                                                                    height: '100%',
                                                                    width: 100,
                                                                    position: 'relative',
                                                                    '&:hover': {
                                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                                    },
                                                                }}
                                                            >
                                                                {/* Restaurant indicator */}
                                                                {product.tenant_id !== selectedRestaurant && (
                                                                    <Box
                                                                        sx={{
                                                                            position: 'absolute',
                                                                            top: -5,
                                                                            right: -5,
                                                                            bgcolor: '#ff9800',
                                                                            color: 'white',
                                                                            borderRadius: '50%',
                                                                            width: 20,
                                                                            height: 20,
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            fontSize: '10px',
                                                                            fontWeight: 'bold',
                                                                        }}
                                                                    >
                                                                        !
                                                                    </Box>
                                                                )}

                                                                {product.images && product.images.length > 0 && (
                                                                    <Box
                                                                        sx={{
                                                                            width: 40,
                                                                            height: 40,
                                                                            borderRadius: '50%',
                                                                            overflow: 'hidden',
                                                                            mb: 1,
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
                                                                    variant="body2"
                                                                    sx={{
                                                                        fontWeight: 500,
                                                                        mb: 0.5,
                                                                        textAlign: 'center',
                                                                        fontSize: '11px',
                                                                    }}
                                                                >
                                                                    {product.name}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', fontSize: '10px' }}>
                                                                    Rs {product.base_price}
                                                                </Typography>
                                                                {product.tenant && product.tenant_id !== selectedRestaurant && (
                                                                    <Typography variant="caption" sx={{ textAlign: 'center', color: '#ff9800', fontSize: '9px', mt: 0.5 }}>
                                                                        {product.tenant.name}
                                                                    </Typography>
                                                                )}
                                                            </Paper>
                                                        </Grid>
                                                    );
                                                })}
                                            </Grid>
                                        ) : (
                                            <Box sx={{ textAlign: 'center', p: 4 }}>
                                                <Typography color="text.secondary">No products found for "{searchTerm}"</Typography>
                                            </Box>
                                        )}
                                    </Box>
                                ) : (
                                    /* Regular Category Products */
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
                                                            opacity: product.manage_stock && product.minimal_stock > product.current_stock - 1 ? 0.5 : 1,
                                                            cursor: product.manage_stock && product.minimal_stock > product.current_stock - 1 ? 'not-allowed' : 'pointer',
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
                                )}
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
                            {activeView === 'orderDetail' ? <OrderDetail handleEditItem={handleEditItem} is_new_order={is_new_order} /> : <OrderSaved setActiveView={setActiveView} />}
                        </Paper>
                    </Box>
                </Box>
            </div>
        </>
    );
};
OrderMenu.layout = (page) => page;
export default OrderMenu;
