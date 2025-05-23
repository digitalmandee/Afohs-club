'use client';

import AddMenu from '@/components/App/Inventory/AddMenu';
import SideNav from '@/components/App/SideBar/SideNav';
import { tenantAsset } from '@/helpers/asset';
import { router, usePage } from '@inertiajs/react';
import { Add as AddIcon, ArrowDownward as ArrowDownwardIcon, ArrowUpward as ArrowUpwardIcon, AttachMoney as AttachMoneyIcon, CheckCircle as CheckCircleIcon, Check as CheckIcon, ChevronRight as ChevronRightIcon, Close as CloseIcon, Delete as DeleteIcon, Edit as EditIcon, ExpandMore as ExpandMoreIcon, FilterList as FilterIcon, Info as InfoIcon, Inventory as InventoryIcon, Search as SearchIcon } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, Divider, Grid, IconButton, InputAdornment, Snackbar, Switch, TextField, Tooltip, Typography } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import MenuFilter from './Menu';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

export default function CoffeeShop({ productLists, categoriesList = [] }) {
    const { url } = usePage();
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const categoryId = queryParams.get('category_id');

    const [open, setOpen] = useState(false);
    const [openFilter, setOpenFilter] = useState(false);
    const [openProductDetail, setOpenProductDetail] = useState(false);
    const [openAddMenu, setOpenAddMenu] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState({
        id: '',
        name: '',
        category: 'Coffee & Beverage',
        image: '',
        images: [],
        stock: { status: '', quantity: '' },
        price: { current: 0, original: null, discount: null, cogs: 0, profit: 0 },
        temperature: [],
        size: [],
        description: '',
        available: true,
        orderTypes: [],
        stockDetails: {
            ready: 0,
            outOfStock: 0,
            totalVariant: 0,
        },
        sales: {
            weekly: [0, 0, 0, 0, 0, 0, 0],
            byOrderType: [],
            average: 0,
        },
    });
    const [activeCategory, setActiveCategory] = useState('All Menus');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);

    // Sorting states
    const [sortingOptions, setSortingOptions] = useState({
        name: null,
        price: null,
        date: null,
        purchase: null,
    });

    // Category and stock filters
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [stockFilter, setStockFilter] = useState('All');

    // Product data
    const [products, setProducts] = useState(productLists || []);

    // Add new state variables for Stock and Update Stock modals
    const [openStockModal, setOpenStockModal] = useState(false);
    const [openUpdateStockModal, setOpenUpdateStockModal] = useState(false);
    const [openEditMenu, setOpenEditMenu] = useState(false);
    const [editMenuStep, setEditMenuStep] = useState(1);
    const [openAdjustPrice, setOpenAdjustPrice] = useState(false);
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

    // Filter products based on active category
    useEffect(() => {
        let filtered = [...products];

        // Filter by category
        if (activeCategory !== 'All Menus') {
            filtered = filtered.filter((product) => product.category.id === activeCategory);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        setFilteredProducts(filtered);
    }, [activeCategory, searchTerm, products]);

    // Apply filters from the filter modal
    const applyFilters = () => {
        let filtered = [...products];

        // Apply category filter
        if (categoryFilter !== 'All') {
            filtered = filtered.filter((product) => product.category === categoryFilter);
        }

        // Apply stock filter
        if (stockFilter !== 'All') {
            filtered = filtered.filter((product) => (stockFilter === 'Ready' ? product.stock.status === 'Ready Stock' : stockFilter === 'Out of Stock' ? product.stock.status === 'Out of Stock' : stockFilter === 'Afohs at Home' ? product.category === 'Afohs at Home' : true));
        }

        // Apply sorting
        if (sortingOptions.name === 'ascending') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortingOptions.name === 'descending') {
            filtered.sort((a, b) => b.name.localeCompare(a.name));
        }

        if (sortingOptions.price === 'ascending') {
            filtered.sort((a, b) => a.base_price - b.base_price);
        } else if (sortingOptions.price === 'descending') {
            filtered.sort((a, b) => b.base_price - a.base_price);
        }

        setFilteredProducts(filtered);
        setOpenFilter(false);
    };

    // Reset all filters
    const resetFilters = () => {
        setSortingOptions({
            name: null,
            price: null,
            date: null,
            purchase: null,
        });
        setCategoryFilter('All');
        setStockFilter('All');
    };

    // Toggle sorting option
    const toggleSorting = (field, direction) => {
        setSortingOptions((prev) => ({
            ...prev,
            [field]: prev[field] === direction ? null : direction,
        }));
    };

    // Handle category button click
    const handleCategoryClick = (category) => {
        setActiveCategory(category);
    };

    // Handle filter modal open/close
    const handleFilterOpen = () => {
        setOpenFilter(true);
    };

    const handleFilterClose = () => {
        setOpenFilter(false);
    };

    // Handle product detail modal
    const handleProductClick = (product) => {
        setSelectedProduct(product);
        setOpenProductDetail(true);
    };

    const handleProductDetailClose = () => {
        setOpenProductDetail(false);
    };

    // Handle Add Menu modal
    const handleAddMenuOpen = () => {
        setOpenAddMenu(true);
    };

    const handleAddMenuClose = () => {
        setOpenAddMenu(false);
    };

    const handleCloseConfirmation = () => {
        setShowConfirmation(false);
    };

    // Add handlers for Stock modal
    const handleViewStock = () => {
        setOpenStockModal(true);
    };

    const handleCloseStockModal = () => {
        setOpenStockModal(false);
    };

    // Add handlers for Update Stock modal
    const handleUpdateStock = () => {
        setOpenUpdateStockModal(true);
        setOpenStockModal(false);
    };

    const handleCloseUpdateStockModal = () => {
        setOpenUpdateStockModal(false);
        setOpenStockModal(true);
    };

    const handleSaveStockChanges = () => {
        setOpenUpdateStockModal(false);
        // Here you would update the product's stock data
        // For now, we'll just show a success message
        setShowConfirmation(true);
    };

    // Edit Menu handlers
    const handleEditMenuOpen = () => {
        setEditMenuStep(1);
        setOpenEditMenu(true);
    };

    const handleEditMenuClose = () => {
        setOpenEditMenu(false);
    };

    const handleEditMenuNextStep = () => {
        setEditMenuStep(2);
    };

    const handleEditMenuPreviousStep = () => {
        setEditMenuStep(1);
    };

    const handleSaveEditMenu = () => {
        // Here you would update the product data
        setOpenEditMenu(false);
        setShowConfirmation(true);
    };

    // Adjust Price handlers
    const handleAdjustPriceOpen = () => {
        setOpenAdjustPrice(true);
    };

    const handleAdjustPriceClose = () => {
        setOpenAdjustPrice(false);
    };

    const handleSaveAdjustPrice = () => {
        // Here you would update the product's price data
        setOpenAdjustPrice(false);
        setShowConfirmation(true);
    };

    // Delete Product handlers
    const handleDeleteConfirmOpen = () => {
        setOpenDeleteConfirm(true);
        setDeleteConfirmText('');
    };

    const handleDeleteConfirmClose = () => {
        setOpenDeleteConfirm(false);
    };

    const handleDeleteProduct = async () => {
        if (selectedProduct === null) {
            enqueueSnackbar('No product selected', { variant: 'warning' });
            return;
        }

        // Here you would delete the product from your data
        setDeleteLoading(true);
        try {
            const response = await axios.delete(route('inventory.destroy', selectedProduct.id));
            if (response.data?.success) {
                setProducts((prev) => prev.filter((product) => product.id !== selectedProduct.id));
                setOpenDeleteConfirm(false);
                setOpenProductDetail(false);
                setShowDeleteSuccess(true);
                enqueueSnackbar('Product deleted successfully!', { variant: 'success' });
            } else {
                enqueueSnackbar('Something went wrong', { variant: 'error' });
                console.error('Error deleting product:', response.data);
            }
        } catch (error) {
            enqueueSnackbar('Something went wrong', { variant: 'error' });
            console.error('Error deleting product:', error);
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleDeleteSuccessClose = () => {
        setShowDeleteSuccess(false);
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
                <div className="container-fluid bg-light py-4">
                    {/* Category Filter Buttons */}
                    {!categoryId ? (
                        <div
                            className="mb-4"
                            style={{
                                background: '#f0f0f0',
                                padding: '20px',
                                borderRadius: '10px',
                            }}
                        >
                            {/* Add "All" Button */}
                            <Button
                                variant={activeCategory === 'All Menus' ? 'contained' : 'outlined'}
                                onClick={() => handleCategoryClick('All Menus')}
                                sx={{
                                    borderRadius: 50,
                                    mr: 1,
                                    color: activeCategory === 'All Menus' ? '#fff' : '#063455',
                                    borderColor: '#063455',
                                    backgroundColor: activeCategory === 'All Menus' ? '#063455' : 'transparent',
                                    '&:hover': {
                                        backgroundColor: activeCategory === 'All Menus' ? '#063455' : 'rgba(6, 52, 85, 0.04)',
                                    },
                                }}
                            >
                                All Menus
                            </Button>
                            {categoriesList.map((category) => (
                                <Button
                                    key={category.id}
                                    variant={activeCategory === category.id ? 'contained' : 'outlined'}
                                    onClick={() => handleCategoryClick(category.id)}
                                    sx={{
                                        borderRadius: 50,
                                        mr: 1,
                                        color: activeCategory === category.id ? '#fff' : '#063455',
                                        borderColor: '#063455',
                                        backgroundColor: activeCategory === category.id ? '#063455' : 'transparent',
                                        '&:hover': {
                                            backgroundColor: activeCategory === category.id ? '#063455' : 'rgba(6, 52, 85, 0.04)',
                                        },
                                    }}
                                >
                                    {category.name}
                                </Button>
                            ))}
                        </div>
                    ) : (
                        ''
                    )}

                    {/* Product Count, Search and Filter */}
                    <div
                        style={{
                            background: '#ffff',
                            padding: '20px',
                            borderRadius: '10px',
                        }}
                    >
                        <div className="d-flex align-items-center mb-4">
                            <div className="d-flex align-items-center">
                                <Typography variant="h4" component="h1" fontWeight="500" sx={{ mr: 2 }}>
                                    {products.length}
                                </Typography>
                                <Typography variant="body1" color="#7F7F7F">
                                    Products
                                </Typography>
                            </div>

                            <TextField
                                placeholder="Search"
                                variant="outlined"
                                size="small"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                sx={{
                                    ml: 3,
                                    width: 450,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1,
                                    },
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                                <Button
                                    variant="#3F4E4F"
                                    startIcon={<FilterIcon />}
                                    onClick={handleFilterOpen}
                                    sx={{
                                        borderRadius: 1,
                                        border: 'solid 1px #3F4E4F',
                                        '&:hover': {
                                            backgroundColor: '#002A41',
                                            color: '#ffff',
                                        },
                                    }}
                                >
                                    Filter
                                </Button>

                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => router.visit(route('product.create'))}
                                    sx={{
                                        borderRadius: 1,
                                        backgroundColor: '#003B5C',
                                        '&:hover': {
                                            backgroundColor: '#002A41',
                                        },
                                    }}
                                >
                                    Add Product
                                </Button>
                            </Box>
                        </div>

                        {/* Product List */}
                        <div>
                            {filteredProducts.map((product) => (
                                <Card
                                    key={product.id}
                                    sx={{
                                        mb: 1,
                                        borderRadius: 1,
                                        border: '1px solid #E3E3E3',
                                        boxShadow: 'none',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            background: '#F6F6F6',
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Grid container alignItems="center">
                                            <Grid item xs={12} sm={3} md={2.5} sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Box sx={{ width: 70, height: 70, mr: 2 }}>
                                                    <img
                                                        src={(product.images.length > 0 && tenantAsset(product.images[0])) || '/placeholder.svg'}
                                                        alt={product.name}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                            borderRadius: '50%',
                                                        }}
                                                    />
                                                </Box>

                                                <Box>
                                                    <Typography sx={{ fontSize: '18px', fontWeight: 500, color: '#121212' }}>{product.name}</Typography>
                                                    <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#063455' }}>{product.category?.name}</Typography>
                                                </Box>
                                            </Grid>

                                            <Grid item xs={12} sm={3} md={2.5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Box>
                                                    {product.current_stock === 0 ? (
                                                        <Typography
                                                            variant="body2"
                                                            component="span"
                                                            className="badge"
                                                            sx={{
                                                                background: '#F14C35',
                                                            }}
                                                        >
                                                            Out of Stock
                                                            {/* {product.stock.status} */}
                                                        </Typography>
                                                    ) : (
                                                        <Typography variant="body2" color="text.secondary">
                                                            Stock Available
                                                        </Typography>
                                                    )}
                                                    <Typography variant="body1" fontWeight="500" sx={{ fontSize: '18px' }}>
                                                        {product.current_stock}
                                                    </Typography>
                                                </Box>
                                            </Grid>

                                            <Grid item xs={12} sm={3} md={2.5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                                        Rs
                                                    </Typography>
                                                    <Typography variant="h6" fontWeight="500" sx={{ fontSize: '24px' }}>
                                                        {product.base_price}
                                                    </Typography>

                                                    {/* {product.cost_of_goods_sold && (
                                                        <>
                                                            <Typography
                                                                variant="body2"
                                                                color="#FFA90B"
                                                                sx={{ ml: 1, textDecoration: 'line-through' }}
                                                            >
                                                                Rs {product.cost_of_goods_sold}
                                                            </Typography>
                                                            <Chip
                                                                label={product.price.discount}
                                                                size="small"
                                                                sx={{
                                                                    ml: 1,
                                                                    backgroundColor: '#0288d1',
                                                                    color: 'white',
                                                                    height: 20,
                                                                    fontSize: '0.7rem',
                                                                }}
                                                            />
                                                        </>
                                                    )} */}
                                                </Box>
                                            </Grid>

                                            <Grid item xs={12} sm={3} md={4.5} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                {product.variants.length > 0
                                                    ? product.variants.map((variant, index) => {
                                                          return (
                                                              <Box key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 1, mr: 2 }}>
                                                                  <Typography variant="body2" color="text.secondary">
                                                                      {variant.name}
                                                                  </Typography>
                                                                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                                      {variant.values.map((value, valueIndex) => (
                                                                          <Button
                                                                              key={valueIndex}
                                                                              variant="outlined"
                                                                              size="small"
                                                                              sx={{
                                                                                  minWidth: 'unset',
                                                                                  px: 1.5,
                                                                                  borderColor: '#e0e0e0',
                                                                                  color: 'text.primary',
                                                                              }}
                                                                          >
                                                                              {value.name}
                                                                          </Button>
                                                                      ))}
                                                                  </Box>
                                                              </Box>
                                                          );
                                                      })
                                                    : '-----'}

                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <IconButton onClick={() => handleProductClick(product)}>
                                                        <ChevronRightIcon />
                                                    </IconButton>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                    {/* Filter Modal */}
                    <Dialog
                        open={openFilter}
                        onClose={handleFilterClose}
                        fullWidth
                        maxWidth="sm"
                        PaperProps={{
                            sx: {
                                borderRadius: 1,
                                m: 0,
                                position: 'fixed',
                                right: 10,
                                top: 10,
                                bottom: 0,
                                height: 'calc(100% - 25px)',
                                maxHeight: '100%',
                            },
                        }}
                    >
                        <Box sx={{ p: 3, height: '100%' }}>
                            <MenuFilter handleFilterClose={handleFilterClose} />
                        </Box>
                    </Dialog>

                    {/* Product Detail Modal */}
                    <Dialog
                        open={openProductDetail}
                        onClose={handleProductDetailClose}
                        fullWidth
                        maxWidth="sm"
                        PaperProps={{
                            sx: {
                                borderRadius: 1,
                                m: 0,
                                position: 'fixed',
                                right: 0,
                                top: 0,
                                height: '100%',
                                maxHeight: '100%',
                            },
                        }}
                    >
                        {selectedProduct.id && (
                            <>
                                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="h5" fontWeight="bold">
                                            {selectedProduct.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {selectedProduct.id} • {selectedProduct.category?.name}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                                            <Typography variant="body2" sx={{ mr: 1 }}>
                                                Available
                                            </Typography>
                                            <Switch checked={selectedProduct.status} color="primary" size="small" />
                                        </Box>
                                        <IconButton onClick={handleProductDetailClose}>
                                            <CloseIcon />
                                        </IconButton>
                                    </Box>
                                </Box>

                                <DialogContent sx={{ p: 0 }}>
                                    <Box sx={{ px: 3, pb: 3 }}>
                                        {/* Product Images */}
                                        <Box sx={{ display: 'flex', gap: 2, mb: 3, overflowX: 'auto', pb: 1 }}>
                                            {selectedProduct.images.map((image, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        width: 120,
                                                        height: 80,
                                                        flexShrink: 0,
                                                        borderRadius: 1,
                                                        overflow: 'hidden',
                                                    }}
                                                >
                                                    <img
                                                        src={image ? tenantAsset(image) : '/placeholder.svg'}
                                                        alt={`${selectedProduct.name} ${index + 1}`}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                        }}
                                                    />
                                                </Box>
                                            ))}
                                        </Box>

                                        {/* Product Description */}
                                        <Box sx={{ mb: 3 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {selectedProduct.description}
                                                <Button
                                                    variant="text"
                                                    size="small"
                                                    sx={{
                                                        p: 0,
                                                        ml: 0.5,
                                                        minWidth: 'auto',
                                                        color: 'primary.main',
                                                        fontWeight: 'bold',
                                                        textTransform: 'none',
                                                    }}
                                                >
                                                    Read more
                                                </Button>
                                            </Typography>
                                        </Box>

                                        {/* Action Buttons */}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                right: 0,
                                                top: 80,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1,
                                                p: 1,
                                            }}
                                        >
                                            <IconButton sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }} onClick={() => router.visit(route('inventory.show', selectedProduct.id))}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }} onClick={handleDeleteConfirmOpen}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>

                                        {/* Pricing Information */}
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                border: '1px solid #e0e0e0',
                                                borderRadius: '8px',
                                                p: 2,
                                                alignItems: 'center',
                                            }}
                                        >
                                            {/* COGS */}
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    COGS
                                                </Typography>
                                                <Typography variant="h6" fontWeight="bold">
                                                    Rs {selectedProduct.cost_of_goods_sold}
                                                </Typography>
                                            </Box>

                                            {/* Divider */}
                                            <Divider orientation="vertical" flexItem sx={{ mx: 2, borderColor: '#e0e0e0' }} />

                                            {/* Base Price Selling */}
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Base Price Selling
                                                </Typography>
                                                <Typography variant="h6" fontWeight="bold">
                                                    Rs {selectedProduct.base_price}
                                                </Typography>
                                            </Box>

                                            {/* Divider */}
                                            <Divider orientation="vertical" flexItem sx={{ mx: 2, borderColor: '#e0e0e0' }} />

                                            {/* Profit Estimate */}
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Profit Estimate
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Typography variant="h6" fontWeight="bold">
                                                        Rs {(selectedProduct.base_price - selectedProduct.cost_of_goods_sold).toFixed(2)}
                                                    </Typography>
                                                    <Chip
                                                        label={`${Math.round(((selectedProduct.base_price - selectedProduct.cost_of_goods_sold) / selectedProduct.base_price) * 100)}%`}
                                                        size="small"
                                                        sx={{
                                                            ml: 1,
                                                            backgroundColor: '#0A2F49', // Dark blue as in image
                                                            color: 'white',
                                                            height: 20,
                                                            fontSize: '0.7rem',
                                                            px: '4px',
                                                            borderRadius: '2px',
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>

                                        <Divider sx={{ mb: 3 }} />

                                        {/* Available Order Type */}
                                        <Box
                                            sx={{
                                                justifyContent: 'space-between',
                                                border: '1px solid #e0e0e0',
                                                borderRadius: '8px',
                                                p: 2,
                                                mb: 3,
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Typography variant="body1" fontWeight="bold" sx={{ mb: 2 }}>
                                                Available Order Type
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                {selectedProduct.available_order_types.map((type) => (
                                                    <Button
                                                        key={type}
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{
                                                            borderRadius: 1,
                                                            borderColor: '#e0e0e0',
                                                            color: 'text.primary',
                                                            textTransform: 'none',
                                                        }}
                                                        startIcon={type === 'Dine In' ? <CheckIcon fontSize="small" /> : null}
                                                    >
                                                        {type}
                                                    </Button>
                                                ))}
                                            </Box>
                                        </Box>
                                    </Box>
                                </DialogContent>
                            </>
                        )}
                    </Dialog>

                    {/* Add Menu Modal */}
                    <AddMenu
                        openMenu={openAddMenu}
                        onClose={handleAddMenuClose}
                        // handleAddMenu={handleAddMenu}
                        // selectedCategory={selectedCategory}
                        // setSelectedCategory={setSelectedCategory}
                        // newMenu={newMenu}
                        // setNewMenu={setNewMenu}
                        // addMenuStep={addMenuStep}
                    />

                    {/* Stock Modal */}
                    <Dialog
                        open={openStockModal}
                        onClose={handleCloseStockModal}
                        fullWidth
                        maxWidth="sm"
                        PaperProps={{
                            sx: {
                                borderRadius: 1,
                                m: 0,
                                position: 'fixed',
                                right: 0,
                                top: 0,
                                height: '100%',
                                maxHeight: '100%',
                            },
                        }}
                    >
                        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <IconButton sx={{ mr: 2, backgroundColor: '#f5f5f5', borderRadius: '50%' }}>
                                    <InventoryIcon />
                                </IconButton>
                                <Typography variant="h5" fontWeight="bold">
                                    Stock
                                </Typography>
                            </Box>
                            <Button variant="outlined" startIcon={<EditIcon />} onClick={handleUpdateStock} sx={{ borderRadius: 1 }}>
                                Update Stock
                            </Button>
                        </Box>

                        <DialogContent sx={{ p: 0 }}>
                            <Box sx={{ px: 3, pb: 3 }}>
                                <Typography variant="body1" fontWeight="bold" sx={{ mb: 2 }}>
                                    Product Variant
                                </Typography>

                                {/* Temperature */}
                                <Box
                                    sx={{
                                        p: 3,
                                        border: '1px solid #e0e0e0',
                                        borderRadius: 1,
                                        mb: 2,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Typography variant="body1">Temperature : 200 pcs</Typography>
                                    <ChevronRightIcon color="action" />
                                </Box>

                                {/* Size */}
                                <Box
                                    sx={{
                                        p: 3,
                                        border: '1px solid #e0e0e0',
                                        borderRadius: 1,
                                        mb: 2,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Typography variant="body1">Size : 200 pcs</Typography>
                                    <ChevronRightIcon color="action" />
                                </Box>

                                {/* Sweetness */}
                                <Box
                                    sx={{
                                        p: 3,
                                        border: '1px solid #e0e0e0',
                                        borderRadius: 1,
                                        mb: 2,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Typography variant="body1">Sweetness : 200 pcs</Typography>
                                    <ChevronRightIcon color="action" />
                                </Box>

                                {/* Milk Options */}
                                <Box
                                    sx={{
                                        p: 3,
                                        border: '1px solid #e0e0e0',
                                        borderRadius: 1,
                                        mb: 2,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Typography variant="body1">Milk Options : 200 pcs</Typography>
                                    <ChevronRightIcon color="action" />
                                </Box>

                                {/* Toppings */}
                                <Box
                                    sx={{
                                        p: 3,
                                        border: '1px solid #e0e0e0',
                                        borderRadius: 1,
                                        mb: 2,
                                        backgroundColor: '#e3f2fd',
                                    }}
                                >
                                    <Typography variant="body1" sx={{ mb: 2 }}>
                                        Toppings : 130 pcs
                                    </Typography>

                                    <Box sx={{ mb: 2 }}>
                                        <Grid container sx={{ mb: 1, px: 1 }}>
                                            <Grid item xs={4}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Variant Name
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Additional Price
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Stock
                                                </Typography>
                                            </Grid>
                                        </Grid>

                                        <Divider sx={{ borderStyle: 'dashed' }} />

                                        <Box sx={{ py: 1, px: 1 }}>
                                            <Grid container alignItems="center">
                                                <Grid item xs={1}>
                                                    <Typography variant="body2">1.</Typography>
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <Typography variant="body2">Palm Sugar</Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="body2">+ Rs 1.00</Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="body2">80 pcs</Typography>
                                                </Grid>
                                            </Grid>
                                        </Box>

                                        <Divider sx={{ borderStyle: 'dashed' }} />

                                        <Box sx={{ py: 1, px: 1 }}>
                                            <Grid container alignItems="center">
                                                <Grid item xs={1}>
                                                    <Typography variant="body2">2.</Typography>
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <Typography variant="body2">Boba</Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="body2">+ Rs 2.00</Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="body2">30 pcs</Typography>
                                                </Grid>
                                            </Grid>
                                        </Box>

                                        <Divider sx={{ borderStyle: 'dashed' }} />

                                        <Box sx={{ py: 1, px: 1 }}>
                                            <Grid container alignItems="center">
                                                <Grid item xs={1}>
                                                    <Typography variant="body2">3.</Typography>
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <Typography variant="body2">Grass Jelly</Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="body2">+ Rs 2.00</Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="body2">20 pcs</Typography>
                                                </Grid>
                                            </Grid>
                                        </Box>

                                        <Divider sx={{ borderStyle: 'dashed' }} />

                                        <Box sx={{ py: 1, px: 1 }}>
                                            <Grid container alignItems="center">
                                                <Grid item xs={1}>
                                                    <Typography variant="body2">4.</Typography>
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <Typography variant="body2">Oreo</Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="body2">+ Rs 2.00</Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Typography variant="body2">32 pcs</Typography>
                                                        <Chip
                                                            label="Sold"
                                                            size="small"
                                                            sx={{
                                                                ml: 1,
                                                                backgroundColor: '#ff5722',
                                                                color: 'white',
                                                                height: 20,
                                                                fontSize: '0.7rem',
                                                            }}
                                                        />
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </DialogContent>
                    </Dialog>

                    {/* Update Stock Modal */}
                    <Dialog
                        open={openUpdateStockModal}
                        onClose={handleCloseUpdateStockModal}
                        fullWidth
                        maxWidth="sm"
                        PaperProps={{
                            sx: {
                                borderRadius: 1,
                                m: 0,
                                position: 'fixed',
                                right: 0,
                                top: 0,
                                height: '100%',
                                maxHeight: '100%',
                            },
                        }}
                    >
                        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <IconButton sx={{ mr: 2, backgroundColor: '#f5f5f5', borderRadius: '50%' }}>
                                    <InventoryIcon />
                                </IconButton>
                                <Typography variant="h5" fontWeight="bold">
                                    Update Stock
                                </Typography>
                            </Box>
                        </Box>

                        <DialogContent sx={{ p: 0 }}>
                            <Box sx={{ px: 3, pb: 3 }}>
                                <Typography variant="body1" fontWeight="bold" sx={{ mb: 2 }}>
                                    Product Variant
                                </Typography>

                                {/* Temperature */}
                                <Box
                                    sx={{
                                        p: 3,
                                        border: '1px solid #e0e0e0',
                                        borderRadius: 1,
                                        mb: 2,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Typography variant="body1">Temperature : 200 pcs</Typography>
                                    <ChevronRightIcon color="action" />
                                </Box>

                                {/* Size */}
                                <Box
                                    sx={{
                                        p: 3,
                                        border: '1px solid #e0e0e0',
                                        borderRadius: 1,
                                        mb: 2,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Typography variant="body1">Size : 200 pcs</Typography>
                                    <ChevronRightIcon color="action" />
                                </Box>

                                {/* Sweetness */}
                                <Box
                                    sx={{
                                        p: 3,
                                        border: '1px solid #e0e0e0',
                                        borderRadius: 1,
                                        mb: 2,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Typography variant="body1">Sweetness : 200 pcs</Typography>
                                    <ChevronRightIcon color="action" />
                                </Box>

                                {/* Milk Options */}
                                <Box
                                    sx={{
                                        p: 3,
                                        border: '1px solid #e0e0e0',
                                        borderRadius: 1,
                                        mb: 2,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Typography variant="body1">Milk Options : 200 pcs</Typography>
                                    <ChevronRightIcon color="action" />
                                </Box>

                                {/* Toppings */}
                                <Box
                                    sx={{
                                        p: 3,
                                        border: '1px solid #e0e0e0',
                                        borderRadius: 1,
                                        mb: 2,
                                        backgroundColor: '#e3f2fd',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                        <Typography variant="body1">Toppings</Typography>
                                        <Switch checked={true} color="primary" />
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Grid container sx={{ mb: 1 }}>
                                            <Grid item xs={4}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Variant Name
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Additional Price
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Stock
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={2}></Grid>
                                        </Grid>

                                        {/* Palm Sugar */}
                                        <Box sx={{ mb: 2 }}>
                                            <Grid container spacing={1} alignItems="center">
                                                <Grid item xs={1}>
                                                    <Typography variant="body2">1.</Typography>
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <TextField fullWidth size="small" defaultValue="Palm Sugar" />
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <Box sx={{ display: 'flex' }}>
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                border: '1px solid #e0e0e0',
                                                                borderRight: 'none',
                                                                px: 1,
                                                                borderTopLeftRadius: 4,
                                                                borderBottomLeftRadius: 4,
                                                            }}
                                                        >
                                                            <Typography variant="body2">Rs</Typography>
                                                        </Box>
                                                        <TextField fullWidth size="small" defaultValue="1.00" />
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <TextField fullWidth size="small" defaultValue="80" />
                                                </Grid>
                                                <Grid item xs={2}>
                                                    <IconButton color="error">
                                                        <CloseIcon />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        </Box>

                                        {/* Boba */}
                                        <Box sx={{ mb: 2 }}>
                                            <Grid container spacing={1} alignItems="center">
                                                <Grid item xs={1}>
                                                    <Typography variant="body2">2.</Typography>
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <TextField fullWidth size="small" defaultValue="Boba" />
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <Box sx={{ display: 'flex' }}>
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                border: '1px solid #e0e0e0',
                                                                borderRight: 'none',
                                                                px: 1,
                                                                borderTopLeftRadius: 4,
                                                                borderBottomLeftRadius: 4,
                                                            }}
                                                        >
                                                            <Typography variant="body2">Rs</Typography>
                                                        </Box>
                                                        <TextField fullWidth size="small" defaultValue="2.00" />
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <TextField fullWidth size="small" defaultValue="30" />
                                                </Grid>
                                                <Grid item xs={2}>
                                                    <IconButton color="error">
                                                        <CloseIcon />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        </Box>

                                        {/* Grass Jelly */}
                                        <Box sx={{ mb: 2 }}>
                                            <Grid container spacing={1} alignItems="center">
                                                <Grid item xs={1}>
                                                    <Typography variant="body2">3.</Typography>
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <TextField fullWidth size="small" defaultValue="Grass Jelly" />
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <Box sx={{ display: 'flex' }}>
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                border: '1px solid #e0e0e0',
                                                                borderRight: 'none',
                                                                px: 1,
                                                                borderTopLeftRadius: 4,
                                                                borderBottomLeftRadius: 4,
                                                            }}
                                                        >
                                                            <Typography variant="body2">Rs</Typography>
                                                        </Box>
                                                        <TextField fullWidth size="small" defaultValue="2.00" />
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <TextField fullWidth size="small" defaultValue="20" />
                                                </Grid>
                                                <Grid item xs={2}>
                                                    <IconButton color="error">
                                                        <CloseIcon />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        </Box>

                                        {/* Oreo */}
                                        <Box sx={{ mb: 2 }}>
                                            <Grid container spacing={1} alignItems="center">
                                                <Grid item xs={1}>
                                                    <Typography variant="body2">4.</Typography>
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <TextField fullWidth size="small" defaultValue="Oreo" />
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <Box sx={{ display: 'flex' }}>
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                border: '1px solid #e0e0e0',
                                                                borderRight: 'none',
                                                                px: 1,
                                                                borderTopLeftRadius: 4,
                                                                borderBottomLeftRadius: 4,
                                                            }}
                                                        >
                                                            <Typography variant="body2">Rs</Typography>
                                                        </Box>
                                                        <TextField fullWidth size="small" defaultValue="2.00" />
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <TextField fullWidth size="small" defaultValue="0" />
                                                </Grid>
                                                <Grid item xs={2}>
                                                    <IconButton color="error">
                                                        <CloseIcon />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        </Box>

                                        <Button variant="text" startIcon={<AddIcon />} sx={{ mt: 1 }}>
                                            Add Variant
                                        </Button>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography variant="body2" sx={{ mr: 1 }}>
                                                Multiple Choice
                                            </Typography>
                                            <Tooltip title="Allow customers to select multiple toppings">
                                                <IconButton size="small">
                                                    <InfoIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                        <Switch checked={true} color="primary" size="small" />
                                    </Box>
                                </Box>
                            </Box>
                        </DialogContent>

                        <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
                            <Button
                                onClick={handleCloseUpdateStockModal}
                                sx={{
                                    color: 'text.primary',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                    },
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveStockChanges}
                                variant="contained"
                                sx={{
                                    backgroundColor: '#003B5C',
                                    '&:hover': {
                                        backgroundColor: '#002A41',
                                    },
                                }}
                            >
                                Save Changes
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Delete Confirmation Modal */}
                    <Dialog open={openDeleteConfirm} onClose={handleDeleteConfirmClose}>
                        <DialogContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                                Delete Product
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                Are you sure want to delete this product?
                            </Typography>
                        </DialogContent>
                        <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
                            <Button onClick={handleDeleteConfirmClose} color="primary">
                                Cancel
                            </Button>
                            <Button onClick={handleDeleteProduct} color="error" disabled={deleteLoading} loading={deleteLoading} loadingPosition="start">
                                Delete
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Delete Success Snackbar */}
                    <Snackbar open={showDeleteSuccess} autoHideDuration={3000} onClose={handleDeleteSuccessClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                        <Alert
                            severity="success"
                            onClose={handleDeleteSuccessClose}
                            icon={<CheckCircleIcon />}
                            sx={{
                                width: '100%',
                                backgroundColor: '#e8f5e9',
                                color: '#2e7d32',
                                '& .MuiAlert-icon': {
                                    color: '#2e7d32',
                                },
                            }}
                        >
                            <Box>
                                <Typography variant="body1" fontWeight="bold">
                                    Menu Deleted!
                                </Typography>
                                <Typography variant="body2">The menu "{selectedProduct.name}" has been deleted</Typography>
                            </Box>
                        </Alert>
                    </Snackbar>
                </div>
            </div>
        </>
    );
}
