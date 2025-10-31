import SideNav from '@/components/App/SideBar/SideNav';
import { router, useForm } from '@inertiajs/react';
import { Add as AddIcon, Close as CloseIcon, EventSeat as EventSeatIcon, FormatBold as FormatBoldIcon, FormatItalic as FormatItalicIcon, FormatListBulleted, FormatListNumbered, InsertEmoticon as InsertEmoticonIcon, Link as LinkIcon, LocalMall as LocalMallIcon, LocalShipping as LocalShippingIcon, ShoppingBag as ShoppingBagIcon } from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, Divider, Grid, IconButton, InputAdornment, MenuItem, Switch, TextField, Typography } from '@mui/material';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ChevronDown } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useRef, useState } from 'react';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const AddProduct = ({ product, id }) => {
    const [open, setOpen] = useState(true);
    const { data, setData, submit, processing, errors, reset, transform } = useForm(
        id
            ? { ...product, description: product.description || '', discountValue: product.discount || '', discountType: product.discount_type || 'percentage' }
            : {
                  name: '',
                  menu_code: '',
                  category_id: '',
                  current_stock: '',
                  minimal_stock: '',
                  outOfStock: false,
                  available_order_types: [],
                  cost_of_goods_sold: '',
                  base_price: '',
                  profit: '0.00',
                  discountValue: '',
                  discountType: 'percentage',
                  variants: [
                      {
                          name: 'Size',
                          active: false,
                          type: 'multiple',
                          items: [
                              { name: 'Small', additional_price: 0, stock: 0 },
                              { name: 'Medium', additional_price: 0, stock: 0 },
                              { name: 'Large', additional_price: 0, stock: 0 },
                          ],
                          newItem: { name: '', additional_price: '', stock: '' },
                      },
                  ],
                  description: '',
                  images: [],
              },
    );

    const [categories, setCategories] = useState([]);
    const [addMenuStep, setAddMenuStep] = useState(1);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]); // For existing images from server
    const [deletedImages, setDeletedImages] = useState([]); // Track deleted images
    const [formData, setFormData] = useState({
        discountValue: data.discountValue || '',
        discountType: data.discountType || 'percentage',
    });
    const [tempFormData, setTempFormData] = useState({
        discountValue: data.discountValue || '',
        discountType: data.discountType || 'percentage',
    });
    const fileInputRef = useRef(null);
    const [fieldErrors, setFieldErrors] = useState({}); // State to store field-specific errors

    const orderTypes = [
        { value: 'dineIn', label: 'Dine In', icon: EventSeatIcon },
        { value: 'pickUp', label: 'Pick Up', icon: LocalMallIcon },
        { value: 'delivery', label: 'Delivery', icon: LocalShippingIcon },
        { value: 'takeaway', label: 'Takeaway', icon: ShoppingBagIcon },
        { value: 'reservation', label: 'Reservation', icon: EventSeatIcon },
    ];

    // Menu Steps
    const handleNextStep = () => {
        const validationErrors = getMenuValidationErrors(data);
        if (validationErrors.length > 0) {
            // Map errors to fields
            const newFieldErrors = {};
            validationErrors.forEach((error) => {
                if (error.includes('Name')) newFieldErrors.name = error;
                if (error.includes('Category')) newFieldErrors.category_id = error;
                if (error.includes('Current stock')) newFieldErrors.current_stock = error;
                if (error.includes('Minimal stock')) newFieldErrors.minimal_stock = error;
                if (error.includes('order type')) newFieldErrors.available_order_types = error;
                if (error.includes('COGS')) newFieldErrors.cost_of_goods_sold = error;
                if (error.includes('Base price')) newFieldErrors.base_price = error;
                if (error.includes('Profit')) newFieldErrors.profit = error;
            });
            setFieldErrors(newFieldErrors);
            return;
        }
        setFieldErrors({}); // Clear errors if validation passes
        setAddMenuStep(2);
    };

    const getMenuValidationErrors = (menu) => {
        const errors = [];
        if (!menu.name.trim()) errors.push('Name is required');
        if (!menu.category_id) errors.push('Category is required');
        if (!menu.current_stock || isNaN(menu.current_stock)) errors.push('Current stock must be a valid number');
        if (!menu.minimal_stock || isNaN(menu.minimal_stock)) errors.push('Minimal stock must be a valid number');
        if (!menu.available_order_types || menu.available_order_types.length === 0) errors.push('At least one order type must be selected');
        if (!menu.cost_of_goods_sold || isNaN(menu.cost_of_goods_sold)) errors.push('COGS must be a valid number');
        if (!menu.base_price || isNaN(menu.base_price)) errors.push('Base price must be a valid number');
        if (!menu.profit || isNaN(menu.profit)) errors.push('Profit must be a valid number');
        return errors;
    };

    const handlePreviousStep = () => {
        setAddMenuStep(1);
        setFieldErrors({}); // Clear errors when going back
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error for the field when user starts typing
        setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const openDiscountDialog = () => {
        setTempFormData(formData);
    };

    const handleOrderTypeToggle = (type) => {
        setData((prev) => ({
            ...prev,
            available_order_types: prev.available_order_types.includes(type) ? prev.available_order_types.filter((t) => t !== type) : [...prev.available_order_types, type],
        }));
        setFieldErrors((prev) => ({ ...prev, available_order_types: '' }));
    };

    const handleSelectAll = () => {
        setData((prev) => {
            const allSelected = orderTypes.every((opt) => prev.available_order_types.includes(opt.value));
            return {
                ...prev,
                available_order_types: allSelected ? [] : orderTypes.map((opt) => opt.value),
            };
        });
        setFieldErrors((prev) => ({ ...prev, available_order_types: '' }));
    };

    // Handle variant changes
    const handleVariantToggle = (name) => {
        setData((prev) => {
            const updatedVariants = prev.variants.map((variant) => (variant.name === name ? { ...variant, active: !variant.active } : variant));
            return { ...prev, variants: updatedVariants };
        });
    };

    const handleVariantNameChange = (variantIndex, value) => {
        setData((prev) => {
            const variants = [...prev.variants];
            variants[variantIndex].name = value;
            return { ...prev, variants };
        });
    };

    const updateVariantItem = (variantIndex, itemIndex, field, value) => {
        setData((prev) => {
            const variants = [...prev.variants];
            const items = [...variants[variantIndex].items];
            items[itemIndex] = { ...items[itemIndex], [field]: value };
            variants[variantIndex].items = items;
            return { ...prev, variants };
        });
    };

    const updateNewVariantField = (variantIndex, field, value) => {
        setData((prev) => {
            const variants = [...prev.variants];
            const newItem = { ...(variants[variantIndex].newItem || {}) };
            newItem[field] = value;
            variants[variantIndex].newItem = newItem;
            return { ...prev, variants };
        });
    };

    const addVariantItem = (variantIndex) => {
        setData((prev) => {
            const variants = [...prev.variants];
            const newItem = variants[variantIndex].newItem;
            if (!newItem?.name) return prev;
            variants[variantIndex].items = [
                ...(variants[variantIndex].items || []),
                {
                    name: newItem.name,
                    additional_price: parseFloat(newItem.additional_price) || 0,
                    stock: parseInt(newItem.stock) || 0,
                },
            ];
            variants[variantIndex].newItem = { name: '', additional_price: '', stock: '' };
            return { ...prev, variants };
        });
    };

    const removeVariantItem = (variantIndex, itemIndex) => {
        setData((prev) => {
            const variants = [...prev.variants];
            variants[variantIndex].items = variants[variantIndex].items.filter((_, idx) => idx !== itemIndex);
            return { ...prev, variants };
        });
    };

    const handleAddNewVariant = () => {
        setData((prev) => ({
            ...prev,
            variants: [
                ...prev.variants,
                {
                    name: 'New Variant',
                    type: 'multiple',
                    active: true,
                    items: [],
                    newItem: { name: '', additional_price: '', stock: '' },
                },
            ],
        }));
    };

    // Handle image upload
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setData((prev) => ({
                ...prev,
                images: [...prev.images, ...files],
            }));
            const newImages = files.map((file) => URL.createObjectURL(file));
            setUploadedImages((prev) => [...prev, ...newImages]);
        }
    };

    // Handle existing image deletion
    const handleDeleteExistingImage = (imageUrl) => {
        setExistingImages((prev) => prev.filter(img => img !== imageUrl));
        
        // Convert full URL back to path for backend (remove origin, keep the full path)
        const imagePath = imageUrl.replace(window.location.origin, '');
        setDeletedImages((prev) => [...prev, imagePath]);
    };

    // Handle new uploaded image deletion
    const handleDeleteUploadedImage = (index) => {
        setUploadedImages((prev) => prev.filter((_, i) => i !== index));
        setData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    // Save new menu
    const handleSaveMenu = () => {
        setData((prev) => ({
            ...prev,
            discountValue: tempFormData.discountValue,
            discountType: tempFormData.discountType,
        }));
        transform((data) => ({
            ...data,
            discount: data.discountValue || null,
            discountType: data.discountType || null,
            deleted_images: deletedImages, // Include deleted images for backend processing
        }));
        submit('post', route(id ? 'inventory.update' : 'inventory.store', { id }), {
            onSuccess: () => {
                enqueueSnackbar(id ? 'Product updated successfully' : 'Product added successfully', { variant: 'success' });
                reset();
                setUploadedImages([]);
                setExistingImages([]);
                setDeletedImages([]);
                router.visit(route('inventory.index'));
            },
            onError: (errors) => {
                console.log(errors);
                enqueueSnackbar('Something went wrong', { variant: 'error' });
            },
        });
    };

    // Calculate profit when cost_of_goods_sold or base_price changes
    useEffect(() => {
        if (data.cost_of_goods_sold && data.base_price) {
            const cogs = Number.parseFloat(data.cost_of_goods_sold);
            const basePrice = Number.parseFloat(data.base_price);
            if (!isNaN(cogs) && !isNaN(basePrice)) {
                const profit = (basePrice - cogs).toFixed(2);
                setData((prev) => ({
                    ...prev,
                    profit,
                }));
            }
        }
    }, [data.cost_of_goods_sold, data.base_price]);

    const fetchCategories = () => {
        axios.get(route('inventory.categories')).then((response) => {
            console.log(response.data);
            setCategories(response.data.categories);
        });
    };

    useEffect(() => {
        fetchCategories();
        
        // Load existing images when editing
        if (id && product && product.images) {
            // Images already have full paths from FileHelper
            const imageUrls = product.images.map(image => 
                image.startsWith('http') ? image : `${window.location.origin}${image}`
            );
            setExistingImages(imageUrls);
        }
    }, [id, product]);

    useEffect(() => {
        fetchCategories();
    }, []);

    // Render
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
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                    <ArrowBackIcon sx={{ fontSize: 24, color: '#063455', cursor: 'pointer' }} onClick={() => router.visit(route('inventory.index'))} />
                    <Typography
                        fontWeight="bold"
                        sx={{
                            fontSize: '30px',
                            color: '#063455',
                            marginLeft: 3,
                        }}
                    >
                        {id ? 'Edit Menu' : 'Add Menu'}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        width: '650px',
                        margin: '0 auto',
                    }}
                >
                    <DialogContent sx={{ p: 0 }}>
                        {/* Step Indicators */}
                        <Box sx={{ px: 3, mb: 3, py: 1.5, display: 'flex', alignItems: 'center', bgcolor: '#F0F0F0' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box
                                    sx={{
                                        width: 30,
                                        height: 30,
                                        borderRadius: '50%',
                                        backgroundColor: '#003B5C',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mr: 1,
                                    }}
                                >
                                    1
                                </Box>
                                <Typography variant="body2" fontWeight="bold" color={addMenuStep === 1 ? 'text.primary' : 'text.secondary'}>
                                    General Information
                                </Typography>
                            </Box>
                            <Box sx={{ flex: 1, mx: 2, height: 1, backgroundColor: '#e0e0e0' }} />
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box
                                    sx={{
                                        width: 30,
                                        height: 30,
                                        borderRadius: '50%',
                                        backgroundColor: addMenuStep === 2 ? '#003B5C' : '#e0e0e0',
                                        color: addMenuStep === 2 ? 'white' : 'text.secondary',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mr: 1,
                                    }}
                                >
                                    2
                                </Box>
                                <Typography variant="body2" fontWeight="bold" color={addMenuStep === 2 ? 'text.primary' : 'text.secondary'}>
                                    Descriptions and Image
                                </Typography>
                            </Box>
                        </Box>

                        {/* Step 1: General Information */}
                        {addMenuStep === 1 && (
                            <Box sx={{ px: 3, pb: 3 }}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="body1" sx={{ mb: 1, color: '#121212', fontSize: '14px' }}>
                                            Product Name
                                        </Typography>
                                        <TextField required fullWidth placeholder="Cappucino" name="name" value={data.name} onChange={handleInputChange} variant="outlined" size="small" error={!!fieldErrors.name} helperText={fieldErrors.name} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="body1" sx={{ mb: 1, color: '#121212', fontSize: '14px' }}>
                                            Menu Id (Optional)
                                        </Typography>
                                        <TextField fullWidth placeholder="e.g. A001" name="menu_code" value={data.menu_code} onChange={handleInputChange} variant="outlined" size="small" />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="body1" sx={{ mb: 1, color: '#121212', fontSize: '14px' }}>
                                            Categories
                                        </Typography>
                                        <TextField
                                            select
                                            fullWidth
                                            placeholder="Choose category"
                                            name="category_id"
                                            value={data.category_id}
                                            onChange={handleInputChange}
                                            variant="outlined"
                                            size="small"
                                            SelectProps={{
                                                displayEmpty: true,
                                            }}
                                            error={!!fieldErrors.category_id}
                                            helperText={fieldErrors.category_id}
                                        >
                                            <MenuItem value="">Choose category</MenuItem>
                                            {categories?.length > 0 &&
                                                categories.map(({ id, name }) => (
                                                    <MenuItem key={id} value={id}>
                                                        {name}
                                                    </MenuItem>
                                                ))}
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body1" sx={{ mb: 1, color: '#121212', fontSize: '14px' }}>
                                            Current Ready Stock
                                        </Typography>
                                        <Box>
                                            <Box sx={{ display: 'flex' }}>
                                                <TextField fullWidth placeholder="10" name="current_stock" value={data.current_stock} onChange={handleInputChange} variant="outlined" size="small" type="number" error={!!fieldErrors.current_stock} />
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        border: '1px solid #e0e0e0',
                                                        borderLeft: 'none',
                                                        px: 2,
                                                        borderTopRightRadius: 4,
                                                        borderBottomRightRadius: 4,
                                                        borderColor: fieldErrors.current_stock ? 'error.main' : '#e0e0e0', // Highlight border if error
                                                    }}
                                                >
                                                    <Typography variant="body2">Pcs</Typography>
                                                </Box>
                                            </Box>
                                            {fieldErrors.current_stock && (
                                                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                                                    {fieldErrors.current_stock}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body1" sx={{ mb: 1, color: '#121212', fontSize: '14px' }}>
                                            Minimal Stock
                                        </Typography>
                                        <Box>
                                            <Box sx={{ display: 'flex' }}>
                                                <TextField fullWidth placeholder="10" name="minimal_stock" value={data.minimal_stock} onChange={handleInputChange} variant="outlined" size="small" type="number" error={!!fieldErrors.minimal_stock} />
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        border: '1px solid #e0e0e0',
                                                        borderLeft: 'none',
                                                        px: 2,
                                                        borderTopRightRadius: 4,
                                                        borderBottomRightRadius: 4,
                                                        borderColor: fieldErrors.minimal_stock ? 'error.main' : '#e0e0e0', // Highlight border if error
                                                    }}
                                                >
                                                    <Typography variant="body2">Pcs</Typography>
                                                </Box>
                                            </Box>
                                            {fieldErrors.minimal_stock && (
                                                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                                                    {fieldErrors.minimal_stock}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Box mb={2}>
                                            <Typography variant="body1" sx={{ mb: 1, fontSize: '14px', fontWeight: 500 }}>
                                                Discount Rate
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                name="discountValue"
                                                type="number"
                                                value={tempFormData.discountValue}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setTempFormData((prev) => ({ ...prev, discountValue: value }));
                                                    setData((prev) => ({ ...prev, discountValue: value }));
                                                }}
                                                placeholder={tempFormData.discountType === 'percentage' ? 'Enter % discount' : 'Enter amount in Rs'}
                                                size="small"
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Box mb={3}>
                                            <Typography variant="body1" sx={{ mb: 1, fontSize: '14px', fontWeight: 500 }}>
                                                Discount Method
                                            </Typography>
                                            <TextField
                                                select
                                                fullWidth
                                                name="discountType"
                                                value={tempFormData.discountType}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setTempFormData((prev) => ({ ...prev, discountType: value }));
                                                    setData((prev) => ({ ...prev, discountType: value }));
                                                }}
                                                size="small"
                                            >
                                                <MenuItem value="percentage">Percentage (%)</MenuItem>
                                                <MenuItem value="amount">Fixed Amount (Rs)</MenuItem>
                                            </TextField>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box
                                            sx={{
                                                p: 2,
                                                border: '1px solid #063455',
                                                borderRadius: 1,
                                                backgroundColor: '#D0E2F2',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Box sx={{ mr: 2 }}>
                                                    <img src="/placeholder.svg" alt="Out of Stock" style={{ width: 40, height: 40 }} />
                                                </Box>
                                                <Box>
                                                    <Typography
                                                        variant="body1"
                                                        fontWeight="medium"
                                                        sx={{
                                                            color: '#121212',
                                                            fontSize: '16px',
                                                        }}
                                                    >
                                                        Out of Stock Menu
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Out of Stock notification
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Switch checked={data.outOfStock} onChange={() => setData((prev) => ({ ...prev, outOfStock: !prev.outOfStock }))} color="primary" />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Typography
                                                variant="body1"
                                                fontWeight="medium"
                                                sx={{
                                                    color: '#121212',
                                                    fontSize: '14px',
                                                }}
                                            >
                                                Select Order Type
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Typography variant="body2" sx={{ mr: 1, color: '#121212', fontSize: '14px' }}>
                                                    Select All
                                                </Typography>
                                                <Switch checked={orderTypes.every((opt) => data.available_order_types.includes(opt.value))} onChange={handleSelectAll} color="primary" size="small" />
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                            {orderTypes.map((item, index) => {
                                                const isSelected = data.available_order_types.includes(item.value);
                                                return (
                                                    <Button
                                                        key={index}
                                                        variant={isSelected ? 'contained' : 'outlined'}
                                                        onClick={() => handleOrderTypeToggle(item.value)}
                                                        sx={{
                                                            flex: 1,
                                                            py: 2,
                                                            borderRadius: 1,
                                                            backgroundColor: isSelected ? '#003B5C' : 'transparent',
                                                            '&:hover': {
                                                                backgroundColor: isSelected ? '#003B5C' : 'rgba(0, 59, 92, 0.04)',
                                                            },
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                            {item.icon && <item.icon sx={{ mb: 1 }} />}
                                                            <Typography variant="body2">{item.label}</Typography>
                                                        </Box>
                                                    </Button>
                                                );
                                            })}
                                        </Box>
                                        {fieldErrors.available_order_types && (
                                            <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                                                {fieldErrors.available_order_types}
                                            </Typography>
                                        )}
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography variant="body1" sx={{ mb: 1, color: '#121212', fontSize: '14px' }}>
                                            Cost Of Goods Sold (COGS)
                                        </Typography>
                                        <Box>
                                            <Box sx={{ display: 'flex' }}>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        border: '1px solid #e0e0e0',
                                                        borderRight: 'none',
                                                        px: 2,
                                                        borderTopLeftRadius: 4,
                                                        borderBottomLeftRadius: 4,
                                                        borderColor: fieldErrors.cost_of_goods_sold ? 'error.main' : '#e0e0e0', // Highlight border if error
                                                    }}
                                                >
                                                    <Typography variant="body2">Rs</Typography>
                                                </Box>
                                                <TextField fullWidth placeholder="3.00" name="cost_of_goods_sold" value={data.cost_of_goods_sold} onChange={handleInputChange} variant="outlined" size="small" type="number" inputProps={{ step: '0.01' }} error={!!fieldErrors.cost_of_goods_sold} />
                                            </Box>
                                            {fieldErrors.cost_of_goods_sold && (
                                                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                                                    {fieldErrors.cost_of_goods_sold}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography variant="body1" sx={{ mb: 1, color: '#121212', fontSize: '14px' }}>
                                            Base Price Selling
                                        </Typography>
                                        <Box>
                                            <Box sx={{ display: 'flex' }}>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        border: '1px solid #e0e0e0',
                                                        borderRight: 'none',
                                                        px: 2,
                                                        borderTopLeftRadius: 4,
                                                        borderBottomLeftRadius: 4,
                                                        borderColor: fieldErrors.base_price ? 'error.main' : '#e0e0e0', // Highlight border if error
                                                    }}
                                                >
                                                    <Typography variant="body2">Rs</Typography>
                                                </Box>
                                                <TextField fullWidth placeholder="4.00" name="base_price" value={data.base_price} onChange={handleInputChange} variant="outlined" size="small" type="number" inputProps={{ step: '0.01' }} error={!!fieldErrors.base_price} />
                                            </Box>
                                            {fieldErrors.base_price && (
                                                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                                                    {fieldErrors.base_price}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography variant="body1" sx={{ mb: 1, color: '#121212', fontSize: '14px' }}>
                                            Profit Estimate
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography variant="h6" fontWeight="bold">
                                                Rs {data.profit}
                                            </Typography>
                                        </Box>
                                        {fieldErrors.profit && (
                                            <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                                                {fieldErrors.profit}
                                            </Typography>
                                        )}
                                    </Grid>

                                    {/* Product Variant */}
                                    <Grid item xs={12}>
                                        <Box sx={{ mb: 2 }}>
                                            <Typography
                                                variant="h6"
                                                fontWeight="medium"
                                                sx={{
                                                    color: '#121212',
                                                    fontSize: '16px',
                                                }}
                                            >
                                                Product Variant
                                            </Typography>
                                        </Box>

                                        {data.variants.map((variant, variantIndex) => (
                                            <Box key={variant.name} sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2, mb: 2 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    {variant.active ? (
                                                        <TextField size="small" value={variant.name} onChange={(e) => handleVariantNameChange(variantIndex, e.target.value)} sx={{ fontWeight: 'bold' }} />
                                                    ) : (
                                                        <Typography variant="body1" fontWeight="bold">
                                                            {variant.name}
                                                        </Typography>
                                                    )}
                                                    <Switch checked={!!variant.active} onChange={() => handleVariantToggle(variant.name)} color="primary" size="small" />
                                                </Box>

                                                {variant.active && (
                                                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                        <Grid container sx={{ mb: 1 }}>
                                                            <Grid item xs={5}>
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
                                                        </Grid>

                                                        {variant.items.map((item, itemIndex) => (
                                                            <Grid container sx={{ mb: 1 }} key={itemIndex}>
                                                                <Grid item xs={5}>
                                                                    {variant.type === 'single' ? <Typography>{item.name}</Typography> : <TextField size="small" placeholder="Variant Name" value={item.name} onChange={(e) => updateVariantItem(variantIndex, itemIndex, 'name', e.target.value)} sx={{ flex: 1, mr: 1 }} />}
                                                                </Grid>
                                                                <Grid item xs={3}>
                                                                    <TextField size="small" type="number" placeholder="Price" value={item.additional_price} inputProps={{ min: 0 }} onChange={(e) => updateVariantItem(variantIndex, itemIndex, 'additional_price', e.target.value)} sx={{ width: 130, mr: 1 }} />
                                                                </Grid>
                                                                <Grid item xs={3}>
                                                                    <TextField size="small" type="number" placeholder="Stock" value={item.stock} inputProps={{ min: 0 }} onChange={(e) => updateVariantItem(variantIndex, itemIndex, 'stock', e.target.value)} sx={{ width: 130, mr: 1 }} />
                                                                </Grid>
                                                                <Grid item xs={1}>
                                                                    <IconButton size="small" onClick={() => removeVariantItem(variantIndex, itemIndex)} color="error">
                                                                        <CloseIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Grid>
                                                            </Grid>
                                                        ))}

                                                        {variant.type === 'multiple' && (
                                                            <>
                                                                <Grid container sx={{ mb: 1 }}>
                                                                    <Grid item xs={5}>
                                                                        <TextField placeholder="e.g. Oreo" size="small" value={variant.newItem?.name || ''} onChange={(e) => updateNewVariantField(variantIndex, 'name', e.target.value)} sx={{ flex: 1, mr: 1 }} />
                                                                    </Grid>
                                                                    <Grid item xs={3}>
                                                                        <Box sx={{ display: 'flex', width: 130, mr: 1 }}>
                                                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e0e0e0', borderRight: 'none', px: 1, borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }}>
                                                                                <Typography variant="body2">Rs</Typography>
                                                                            </Box>
                                                                            <TextField type="number" placeholder="10" size="small" value={variant.newItem?.additional_price || ''} onChange={(e) => updateNewVariantField(variantIndex, 'additional_price', e.target.value)} fullWidth inputProps={{ min: 0 }} />
                                                                        </Box>
                                                                    </Grid>
                                                                    <Grid item xs={3}>
                                                                        <TextField type="number" placeholder="0" size="small" value={variant.newItem?.stock || ''} onChange={(e) => updateNewVariantField(variantIndex, 'stock', e.target.value)} sx={{ width: 130, mr: 1 }} inputProps={{ min: 0 }} />
                                                                    </Grid>
                                                                    <Grid item xs={1}>
                                                                        <IconButton size="small" onClick={() => addVariantItem(variantIndex)} color="primary">
                                                                            <AddIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Grid>
                                                                </Grid>
                                                                <Button variant="text" startIcon={<AddIcon />} onClick={() => addVariantItem(variantIndex)} sx={{ mt: 1 }}>
                                                                    Add Variant Item
                                                                </Button>
                                                            </>
                                                        )}
                                                    </Box>
                                                )}
                                            </Box>
                                        ))}

                                        <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddNewVariant} sx={{ mt: 2 }}>
                                            Add New Variant
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        {/* Step 2: Descriptions and Image */}
                        {addMenuStep === 2 && (
                            <Box sx={{ px: 3, pb: 3 }}>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    Menu Image
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                                    {/* Display existing images */}
                                    {existingImages.map((image, index) => (
                                        <Box
                                            key={`existing-${index}`}
                                            sx={{
                                                position: 'relative',
                                                width: 80,
                                                height: 80,
                                                borderRadius: 1,
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <img
                                                src={image}
                                                alt={`Existing ${index + 1}`}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteExistingImage(image)}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 2,
                                                    right: 2,
                                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                    },
                                                }}
                                            >
                                                <CloseIcon fontSize="small" color="error" />
                                            </IconButton>
                                        </Box>
                                    ))}
                                    
                                    {/* Display newly uploaded images */}
                                    {uploadedImages.map((image, index) => (
                                        <Box
                                            key={`new-${index}`}
                                            sx={{
                                                position: 'relative',
                                                width: 80,
                                                height: 80,
                                                borderRadius: 1,
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <img
                                                src={image}
                                                alt={`New ${index + 1}`}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteUploadedImage(index)}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 2,
                                                    right: 2,
                                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                    },
                                                }}
                                            >
                                                <CloseIcon fontSize="small" color="error" />
                                            </IconButton>
                                        </Box>
                                    ))}
                                    <Box
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: 1,
                                            border: '1px dashed #90caf9',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            backgroundColor: '#e3f2fd',
                                        }}
                                        onClick={triggerFileInput}
                                    >
                                        <AddIcon sx={{ color: '#90caf9' }} />
                                    </Box>
                                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageUpload} accept="image/*" multiple />
                                </Box>

                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    Descriptions
                                </Typography>
                                <Box
                                    sx={{
                                        border: '1px solid #e0e0e0',
                                        borderRadius: 1,
                                        mb: 1,
                                    }}
                                >
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={5}
                                        placeholder="e.g An all-time favorite blend with citrus fruit character, caramel flavors, and a pleasant faintly floral aroma."
                                        name="description"
                                        value={data.description}
                                        onChange={handleInputChange}
                                        variant="outlined"
                                        sx={{
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                border: 'none',
                                            },
                                        }}
                                    />
                                    <Divider />
                                    <Box sx={{ display: 'flex', p: 1 }}>
                                        <IconButton size="small">
                                            <InsertEmoticonIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small">
                                            <FormatBoldIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small">
                                            <FormatItalicIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small">
                                            <FormatListBulleted fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small">
                                            <FormatListNumbered fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small">
                                            <LinkIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Maximum 500 characters
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {(data.description || '').length} / 500
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </DialogContent>

                    <DialogActions sx={{ p: 3, justifyContent: 'flex-end' }}>
                        {addMenuStep === 1 ? (
                            <>
                                <Button
                                    onClick={handleNextStep}
                                    variant="contained"
                                    sx={{
                                        backgroundColor: '#003B5C',
                                        '&:hover': {
                                            backgroundColor: '#002A41',
                                        },
                                    }}
                                >
                                    Next
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    onClick={handlePreviousStep}
                                    sx={{
                                        color: 'text.primary',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                        },
                                    }}
                                >
                                    Previous
                                </Button>
                                <Button
                                    onClick={handleSaveMenu}
                                    variant="contained"
                                    sx={{
                                        backgroundColor: '#003B5C',
                                        '&:hover': {
                                            backgroundColor: '#002A41',
                                        },
                                    }}
                                    disabled={processing}
                                    loading={processing}
                                    loadingPosition="start"
                                >
                                    Save
                                </Button>
                            </>
                        )}
                    </DialogActions>
                </Box>
            </div>
        </>
    );
};
AddProduct.layout = (page) => page;
export default AddProduct;
