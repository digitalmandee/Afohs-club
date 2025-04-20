import React, { useState, useEffect, useRef } from 'react'
import {
    Button,
    TextField,
    DialogContent,
    DialogActions,
    IconButton,
    Typography,
    Box,
    Grid,
    Switch,
    Divider,
    MenuItem,
    Tooltip,
} from "@mui/material"
import SideNav from '../../Components/SideBar/SideNav'
import {
    Close as CloseIcon,
    Add as AddIcon,
    CloudUpload as CloudUploadIcon,
    InsertEmoticon as InsertEmoticonIcon,
    FormatBold as FormatBoldIcon,
    FormatItalic as FormatItalicIcon,
    FormatListBulleted,
    FormatListNumbered,
    Link as LinkIcon,
    MoreVert as MoreVertIcon,
    Info as InfoIcon,
    RestaurantMenu as RestaurantMenuIcon,
    LocalMall as LocalMallIcon,
    LocalShipping as LocalShippingIcon,
    ShoppingBag as ShoppingBagIcon,
    EventSeat as EventSeatIcon,
} from "@mui/icons-material"
import "bootstrap/dist/css/bootstrap.min.css"
import { router } from '@inertiajs/react';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const AddProduct = () => {
    const [open, setOpen] = useState(false);
    const [addMenuStep, setAddMenuStep] = useState(1)
    const [uploadedImages, setUploadedImages] = useState([])
    const fileInputRef = useRef(null)
    const [newMenu, setNewMenu] = useState({
        name: "",
        id: "",
        category: "",
        currentStock: "",
        minimalStock: "",
        outOfStock: false,
        orderTypes: {
            dineIn: false,
            pickUp: false,
            delivery: false,
            takeaway: false,
            reservation: false,
        },
        cogs: "",
        basePrice: "",
        profit: "0.00",
        variants: {
            temperature: false,
            size: false,
            sweetness: false,
            milkOptions: false,
        },
        toppings: {
            active: false,
            multipleChoice: false,
            items: [
                { name: "Palm Sugar", price: "1.00", stock: "80" },
                { name: "Boba", price: "2.00", stock: "30" },
                { name: "Grass Jelly", price: "2.00", stock: "20" },
            ],
            newItem: { name: "", price: "", stock: "" },
        },
        description: "",
        images: [],
    })

    const handleAddMenuClose = () => {
        setOpenAddMenu(false)
        setNewMenu({
            name: "",
            id: "",
            category: "",
            currentStock: "",
            minimalStock: "",
            outOfStock: false,
            orderTypes: {
                dineIn: false,
                pickUp: false,
                delivery: false,
                takeaway: false,
                reservation: false,
            },
            cogs: "",
            basePrice: "",
            profit: "0.00",
            variants: {
                temperature: false,
                size: false,
                sweetness: false,
                milkOptions: false,
            },
            toppings: {
                active: false,
                multipleChoice: false,
                items: [
                    { name: "Palm Sugar", price: "1.00", stock: "80" },
                    { name: "Boba", price: "2.00", stock: "30" },
                    { name: "Grass Jelly", price: "2.00", stock: "20" },
                ],
                newItem: { name: "", price: "", stock: "" },
            },
            description: "",
            images: [],
        })
        setUploadedImages([])
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setNewMenu((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleOrderTypeToggle = (type) => {
        setNewMenu((prev) => ({
            ...prev,
            orderTypes: {
                ...prev.orderTypes,
                [type]: !prev.orderTypes[type],
            },
        }))
    }

    const handleVariantToggle = (variant) => {
        setNewMenu((prev) => ({
            ...prev,
            variants: {
                ...prev.variants,
                [variant]: !prev.variants[variant],
            },
        }))
    }

    const handleToppingsToggle = () => {
        setNewMenu((prev) => ({
            ...prev,
            toppings: {
                ...prev.toppings,
                active: !prev.toppings.active,
            },
        }))
    }

    const handleMultipleChoiceToggle = () => {
        setNewMenu((prev) => ({
            ...prev,
            toppings: {
                ...prev.toppings,
                multipleChoice: !prev.toppings.multipleChoice,
            },
        }))
    }

    const handleNewToppingItemChange = (field, value) => {
        setNewMenu((prev) => ({
            ...prev,
            toppings: {
                ...prev.toppings,
                newItem: {
                    ...prev.toppings.newItem,
                    [field]: value,
                },
            },
        }))
    }

    const handleAddToppingItem = () => {
        const { name, price, stock } = newMenu.toppings.newItem
        if (name && price && stock) {
            setNewMenu((prev) => ({
                ...prev,
                toppings: {
                    ...prev.toppings,
                    items: [...prev.toppings.items, { name, price, stock }],
                    newItem: { name: "", price: "", stock: "" },
                },
            }))
        }
    }

    const handleRemoveToppingItem = (index) => {
        setNewMenu((prev) => {
            const updatedItems = [...prev.toppings.items]
            updatedItems.splice(index, 1)
            return {
                ...prev,
                toppings: {
                    ...prev.toppings,
                    items: updatedItems,
                },
            }
        })
    }

    const handleSaveMenu = () => {
        const newProduct = {
            id: newMenu.id || `MENU${(products.length + 1).toString().padStart(3, "0")}`,
            name: newMenu.name,
            category: newMenu.category || "Coffee & Beverage",
            image:
                newMenu.images[0] ||
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jkx2mHK5QcKtUn8SdTDaegzAMc1u6b.png",
            images:
                newMenu.images.length > 0
                    ? newMenu.images
                    : ["https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jkx2mHK5QcKtUn8SdTDaegzAMc1u6b.png"],
            stock: {
                status: newMenu.outOfStock ? "Out of Stock" : "Ready Stock",
                quantity: newMenu.outOfStock ? "0 Pcs" : `${newMenu.currentStock} Pcs`,
            },
            price: {
                current: Number.parseFloat(newMenu.basePrice) || 0,
                original: null,
                discount: null,
                cogs: Number.parseFloat(newMenu.cogs) || 0,
                profit: Number.parseFloat(newMenu.profit) || 0,
            },
            temperature: newMenu.variants.temperature ? ["Ice", "Hot"] : [],
            size: newMenu.variants.size ? ["S", "M", "L"] : [],
            description: newMenu.description || "No description provided.",
            available: !newMenu.outOfStock,
            orderTypes: Object.entries(newMenu.orderTypes)
                .filter(([_, isSelected]) => isSelected)
                .map(([type]) => {
                    switch (type) {
                        case "dineIn":
                            return "Dine In"
                        case "pickUp":
                            return "Pick Up"
                        case "delivery":
                            return "Delivery"
                        case "takeaway":
                            return "Takeway"
                        case "reservation":
                            return "Reservation"
                        default:
                            return ""
                    }
                }),
            stockDetails: {
                ready: newMenu.outOfStock ? 0 : Number.parseInt(newMenu.currentStock) || 0,
                outOfStock: newMenu.outOfStock ? Number.parseInt(newMenu.minimalStock) || 0 : 0,
                totalVariant: 10,
            },
            sales: {
                weekly: [0, 0, 0, 0, 0, 0, 0],
                byOrderType: [
                    { name: "Dine In", value: 0, percentage: "0%", color: "#003B5C" },
                    { name: "Delivery", value: 0, percentage: "0%", color: "#0288d1" },
                    { name: "Pick Up", value: 0, percentage: "0%", color: "#4caf50" },
                    { name: "Reservation", value: 0, percentage: "0%", color: "#b0bec5" },
                    { name: "Other", value: 0, percentage: "0%", color: "#e0e0e0" },
                ],
                average: 0,
            },
        }

        setProducts((prev) => [...prev, newProduct])
        setOpenAddMenu(false)
        setShowConfirmation(true)

        // Reset form
        setNewMenu({
            name: "",
            id: "",
            category: "",
            currentStock: "",
            minimalStock: "",
            outOfStock: false,
            orderTypes: {
                dineIn: false,
                pickUp: false,
                delivery: false,
                takeaway: false,
                reservation: false,
            },
            cogs: "",
            basePrice: "",
            profit: "0.00",
            variants: {
                temperature: false,
                size: false,
                sweetness: false,
                milkOptions: false,
            },
            toppings: {
                active: false,
                multipleChoice: false,
                items: [
                    { name: "Palm Sugar", price: "1.00", stock: "80" },
                    { name: "Boba", price: "2.00", stock: "30" },
                    { name: "Grass Jelly", price: "2.00", stock: "20" },
                ],
                newItem: { name: "", price: "", stock: "" },
            },
            description: "",
            images: [],
        })
        setUploadedImages([])
    }

    useEffect(() => {
        if (newMenu.cogs && newMenu.basePrice) {
            const cogs = Number.parseFloat(newMenu.cogs)
            const basePrice = Number.parseFloat(newMenu.basePrice)
            if (!isNaN(cogs) && !isNaN(basePrice)) {
                const profit = (basePrice - cogs).toFixed(2)
                setNewMenu((prev) => ({
                    ...prev,
                    profit,
                }))
            }
        }
    }, [newMenu.cogs, newMenu.basePrice])

    const handleNextStep = () => {
        setAddMenuStep(2)
    }

    const handlePreviousStep = () => {
        setAddMenuStep(1)
    }

    const handleSelectAll = () => {
        setNewMenu((prev) => ({
            ...prev,
            orderTypes: {
                dineIn: true,
                pickUp: true,
                delivery: true,
                takeaway: true,
                reservation: true,
            },
        }))
    }

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files)
        if (files.length > 0) {
            const newImages = files.map((file) => URL.createObjectURL(file))
            setUploadedImages((prev) => [...prev, ...newImages])
            setNewMenu((prev) => ({
                ...prev,
                images: [...prev.images, ...newImages],
            }))
        }
    }

    const triggerFileInput = () => {
        fileInputRef.current.click()
    }

    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div style={{
                marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                transition: "margin-left 0.3s ease-in-out",
                marginTop: '5rem',
            }}>
                <Box sx={{
                    width: '650px',
                    margin: '0 auto'
                }}>
                    <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="h5" fontWeight="bold">
                            Add Menu
                        </Typography>
                    </Box>

                    <DialogContent sx={{ p: 0 }}>
                        {/* Step Indicators */}
                        <Box sx={{ px: 3, mb: 3, display: "flex", alignItems: "center" }}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Box
                                    sx={{
                                        width: 30,
                                        height: 30,
                                        borderRadius: "50%",
                                        backgroundColor: "#003B5C",
                                        color: "white",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mr: 1,
                                    }}
                                >
                                    1
                                </Box>
                                <Typography
                                    variant="body2"
                                    fontWeight="bold"
                                    color={addMenuStep === 1 ? "text.primary" : "text.secondary"}
                                >
                                    General Information
                                </Typography>
                            </Box>
                            <Box sx={{ flex: 1, mx: 2, height: 1, backgroundColor: "#e0e0e0" }} />
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Box
                                    sx={{
                                        width: 30,
                                        height: 30,
                                        borderRadius: "50%",
                                        backgroundColor: addMenuStep === 2 ? "#003B5C" : "#e0e0e0",
                                        color: addMenuStep === 2 ? "white" : "text.secondary",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mr: 1,
                                    }}
                                >
                                    2
                                </Box>
                                <Typography
                                    variant="body2"
                                    fontWeight="bold"
                                    color={addMenuStep === 2 ? "text.primary" : "text.secondary"}
                                >
                                    Descriptions and Image
                                </Typography>
                            </Box>
                        </Box>

                        {/* Step 1: General Information */}
                        {addMenuStep === 1 && (
                            <Box sx={{ px: 3, pb: 3 }}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            Product Name
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            placeholder="Cappucino"
                                            name="name"
                                            value={newMenu.name}
                                            onChange={handleInputChange}
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            Menu Id (Optional)
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            placeholder="e.g. A001"
                                            name="id"
                                            value={newMenu.id}
                                            onChange={handleInputChange}
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            Categories
                                        </Typography>
                                        <TextField
                                            select
                                            fullWidth
                                            placeholder="Choose category"
                                            name="category"
                                            value={newMenu.category}
                                            onChange={handleInputChange}
                                            variant="outlined"
                                            size="small"
                                            SelectProps={{
                                                displayEmpty: true,
                                                renderValue: (value) => value || "Choose category",
                                            }}
                                        >
                                            <MenuItem value="">Choose category</MenuItem>
                                            <MenuItem value="Coffee & Beverage">Coffee & Beverage</MenuItem>
                                            <MenuItem value="Food & Snack">Food & Snack</MenuItem>
                                            <MenuItem value="Imaji at Home">Imaji at Home</MenuItem>
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            Current Ready Stock
                                        </Typography>
                                        <Box sx={{ display: "flex" }}>
                                            <TextField
                                                fullWidth
                                                placeholder="10"
                                                name="currentStock"
                                                value={newMenu.currentStock}
                                                onChange={handleInputChange}
                                                variant="outlined"
                                                size="small"
                                                type="number"
                                            />
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    border: "1px solid #e0e0e0",
                                                    borderLeft: "none",
                                                    px: 2,
                                                    borderTopRightRadius: 4,
                                                    borderBottomRightRadius: 4,
                                                }}
                                            >
                                                <Typography variant="body2">Pcs</Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            Minimal Stock
                                        </Typography>
                                        <Box sx={{ display: "flex" }}>
                                            <TextField
                                                fullWidth
                                                placeholder="10"
                                                name="minimalStock"
                                                value={newMenu.minimalStock}
                                                onChange={handleInputChange}
                                                variant="outlined"
                                                size="small"
                                                type="number"
                                            />
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    border: "1px solid #e0e0e0",
                                                    borderLeft: "none",
                                                    px: 2,
                                                    borderTopRightRadius: 4,
                                                    borderBottomRightRadius: 4,
                                                }}
                                            >
                                                <Typography variant="body2">Pcs</Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box
                                            sx={{
                                                p: 2,
                                                border: "1px solid #e0e0e0",
                                                borderRadius: 1,
                                                backgroundColor: "#f5f5f5",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                            }}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                                <Box sx={{ mr: 2 }}>
                                                    <img src="/placeholder.svg" alt="Out of Stock" style={{ width: 40, height: 40 }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="body1" fontWeight="bold">
                                                        Out of Stock Menu
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Out of Stock notification
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Switch
                                                checked={newMenu.outOfStock}
                                                onChange={() => setNewMenu((prev) => ({ ...prev, outOfStock: !prev.outOfStock }))}
                                                color="primary"
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                            <Typography variant="body1" fontWeight="bold">
                                                Select Order Type
                                            </Typography>
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                                <Typography variant="body2" sx={{ mr: 1 }}>
                                                    Select All
                                                </Typography>
                                                <Switch
                                                    checked={Object.values(newMenu.orderTypes).every(Boolean)}
                                                    onChange={handleSelectAll}
                                                    color="primary"
                                                    size="small"
                                                />
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                            <Button
                                                variant={newMenu.orderTypes.dineIn ? "contained" : "outlined"}
                                                onClick={() => handleOrderTypeToggle("dineIn")}
                                                sx={{
                                                    flex: 1,
                                                    py: 2,
                                                    borderRadius: 1,
                                                    backgroundColor: newMenu.orderTypes.dineIn ? "#003B5C" : "transparent",
                                                    "&:hover": {
                                                        backgroundColor: newMenu.orderTypes.dineIn ? "#003B5C" : "rgba(0, 59, 92, 0.04)",
                                                    },
                                                }}
                                            >
                                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                    <RestaurantMenuIcon sx={{ mb: 1 }} />
                                                    <Typography variant="body2">Dine In</Typography>
                                                </Box>
                                            </Button>
                                            <Button
                                                variant={newMenu.orderTypes.pickUp ? "contained" : "outlined"}
                                                onClick={() => handleOrderTypeToggle("pickUp")}
                                                sx={{
                                                    flex: 1,
                                                    py: 2,
                                                    borderRadius: 1,
                                                    backgroundColor: newMenu.orderTypes.pickUp ? "#003B5C" : "transparent",
                                                    "&:hover": {
                                                        backgroundColor: newMenu.orderTypes.pickUp ? "#003B5C" : "rgba(0, 59, 92, 0.04)",
                                                    },
                                                }}
                                            >
                                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                    <LocalMallIcon sx={{ mb: 1 }} />
                                                    <Typography variant="body2">Pick Up</Typography>
                                                </Box>
                                            </Button>
                                            <Button
                                                variant={newMenu.orderTypes.delivery ? "contained" : "outlined"}
                                                onClick={() => handleOrderTypeToggle("delivery")}
                                                sx={{
                                                    flex: 1,
                                                    py: 2,
                                                    borderRadius: 1,
                                                    backgroundColor: newMenu.orderTypes.delivery ? "#003B5C" : "transparent",
                                                    "&:hover": {
                                                        backgroundColor: newMenu.orderTypes.delivery ? "#003B5C" : "rgba(0, 59, 92, 0.04)",
                                                    },
                                                }}
                                            >
                                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                    <LocalShippingIcon sx={{ mb: 1 }} />
                                                    <Typography variant="body2">Delivery</Typography>
                                                </Box>
                                            </Button>
                                            <Button
                                                variant={newMenu.orderTypes.takeaway ? "contained" : "outlined"}
                                                onClick={() => handleOrderTypeToggle("takeaway")}
                                                sx={{
                                                    flex: 1,
                                                    py: 2,
                                                    borderRadius: 1,
                                                    backgroundColor: newMenu.orderTypes.takeaway ? "#003B5C" : "transparent",
                                                    "&:hover": {
                                                        backgroundColor: newMenu.orderTypes.takeaway ? "#003B5C" : "rgba(0, 59, 92, 0.04)",
                                                    },
                                                }}
                                            >
                                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                    <ShoppingBagIcon sx={{ mb: 1 }} />
                                                    <Typography variant="body2">Takeaway</Typography>
                                                </Box>
                                            </Button>
                                            <Button
                                                variant={newMenu.orderTypes.reservation ? "contained" : "outlined"}
                                                onClick={() => handleOrderTypeToggle("reservation")}
                                                sx={{
                                                    flex: 1,
                                                    py: 2,
                                                    borderRadius: 1,
                                                    backgroundColor: newMenu.orderTypes.reservation ? "#003B5C" : "transparent",
                                                    "&:hover": {
                                                        backgroundColor: newMenu.orderTypes.reservation ? "#003B5C" : "rgba(0, 59, 92, 0.04)",
                                                    },
                                                }}
                                            >
                                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                    <EventSeatIcon sx={{ mb: 1 }} />
                                                    <Typography variant="body2">Reservation</Typography>
                                                </Box>
                                            </Button>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            Cost Of Goods Sold (COGS)
                                        </Typography>
                                        <Box sx={{ display: "flex" }}>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    border: "1px solid #e0e0e0",
                                                    borderRight: "none",
                                                    px: 2,
                                                    borderTopLeftRadius: 4,
                                                    borderBottomLeftRadius: 4,
                                                }}
                                            >
                                                <Typography variant="body2">Rs</Typography>
                                            </Box>
                                            <TextField
                                                fullWidth
                                                placeholder="3.00"
                                                name="cogs"
                                                value={newMenu.cogs}
                                                onChange={handleInputChange}
                                                variant="outlined"
                                                size="small"
                                                type="number"
                                                inputProps={{ step: "0.01" }}
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            Base Price Selling
                                        </Typography>
                                        <Box sx={{ display: "flex" }}>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    border: "1px solid #e0e0e0",
                                                    borderRight: "none",
                                                    px: 2,
                                                    borderTopLeftRadius: 4,
                                                    borderBottomLeftRadius: 4,
                                                }}
                                            >
                                                <Typography variant="body2">Rs</Typography>
                                            </Box>
                                            <TextField
                                                fullWidth
                                                placeholder="4.00"
                                                name="basePrice"
                                                value={newMenu.basePrice}
                                                onChange={handleInputChange}
                                                variant="outlined"
                                                size="small"
                                                type="number"
                                                inputProps={{ step: "0.01" }}
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            Profit Estimate
                                        </Typography>
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <Typography variant="h6" fontWeight="bold">
                                                Rs {newMenu.profit}
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    {/* Product Variant */}
                                    <Grid item xs={12}>
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="h6" fontWeight="bold">
                                                Product Variant
                                            </Typography>
                                        </Box>

                                        <Box sx={{ mb: 2 }}>
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                                <Typography variant="body1">Temperature</Typography>
                                                <Switch
                                                    checked={newMenu.variants.temperature}
                                                    onChange={() => handleVariantToggle("temperature")}
                                                    color="primary"
                                                    size="small"
                                                />
                                            </Box>
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                                <Typography variant="body1">Size</Typography>
                                                <Switch
                                                    checked={newMenu.variants.size}
                                                    onChange={() => handleVariantToggle("size")}
                                                    color="primary"
                                                    size="small"
                                                />
                                            </Box>
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                                <Typography variant="body1">Sweetness</Typography>
                                                <Switch
                                                    checked={newMenu.variants.sweetness}
                                                    onChange={() => handleVariantToggle("sweetness")}
                                                    color="primary"
                                                    size="small"
                                                />
                                            </Box>
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                                <Typography variant="body1">Milk Options</Typography>
                                                <Switch
                                                    checked={newMenu.variants.milkOptions}
                                                    onChange={() => handleVariantToggle("milkOptions")}
                                                    color="primary"
                                                    size="small"
                                                />
                                            </Box>
                                        </Box>

                                        {/* Toppings */}
                                        <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 1, p: 2, mb: 2 }}>
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                                <Typography variant="body1" fontWeight="bold">
                                                    Toppings
                                                </Typography>
                                                <Switch
                                                    checked={newMenu.toppings.active}
                                                    onChange={handleToppingsToggle}
                                                    color="primary"
                                                    size="small"
                                                />
                                            </Box>

                                            {newMenu.toppings.active && (
                                                <>
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                            Variant Name
                                                        </Typography>
                                                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                                            <Typography variant="body2" sx={{ flex: 1 }}>
                                                                Variant Name
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ width: 120 }}>
                                                                Additional Price
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ width: 80 }}>
                                                                Stock
                                                            </Typography>
                                                            <Box sx={{ width: 40 }}></Box>
                                                        </Box>

                                                        {newMenu.toppings.items.map((item, index) => (
                                                            <Box
                                                                key={index}
                                                                sx={{ display: "flex", justifyContent: "space-between", mb: 1, alignItems: "center" }}
                                                            >
                                                                <Typography variant="body2" sx={{ flex: 1 }}>
                                                                    {item.name}
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ width: 120 }}>
                                                                    + Rs {item.price}
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ width: 80 }}>
                                                                    {item.stock}
                                                                </Typography>
                                                                <IconButton
                                                                    size="small"
                                                                    sx={{ width: 40 }}
                                                                    onClick={() => handleRemoveToppingItem(index)}
                                                                >
                                                                    <MoreVertIcon fontSize="small" />
                                                                </IconButton>
                                                            </Box>
                                                        ))}

                                                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1, alignItems: "center" }}>
                                                            <TextField
                                                                placeholder="e.g. Oreo"
                                                                size="small"
                                                                value={newMenu.toppings.newItem.name}
                                                                onChange={(e) => handleNewToppingItemChange("name", e.target.value)}
                                                                sx={{ flex: 1, mr: 1 }}
                                                            />
                                                            <Box sx={{ display: "flex", width: 120, mr: 1 }}>
                                                                <Box
                                                                    sx={{
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        border: "1px solid #e0e0e0",
                                                                        borderRight: "none",
                                                                        px: 1,
                                                                        borderTopLeftRadius: 4,
                                                                        borderBottomLeftRadius: 4,
                                                                    }}
                                                                >
                                                                    <Typography variant="body2">Rs</Typography>
                                                                </Box>
                                                                <TextField
                                                                    placeholder="10"
                                                                    size="small"
                                                                    value={newMenu.toppings.newItem.price}
                                                                    onChange={(e) => handleNewToppingItemChange("price", e.target.value)}
                                                                    fullWidth
                                                                />
                                                            </Box>
                                                            <TextField
                                                                placeholder="0"
                                                                size="small"
                                                                value={newMenu.toppings.newItem.stock}
                                                                onChange={(e) => handleNewToppingItemChange("stock", e.target.value)}
                                                                sx={{ width: 80, mr: 1 }}
                                                            />
                                                            <IconButton size="small" sx={{ width: 40 }} onClick={handleAddToppingItem} color="error">
                                                                <CloseIcon fontSize="small" />
                                                            </IconButton>
                                                        </Box>

                                                        <Button variant="text" startIcon={<AddIcon />} onClick={handleAddToppingItem} sx={{ mt: 1 }}>
                                                            Add Variant
                                                        </Button>
                                                    </Box>

                                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                                            <Typography variant="body2" sx={{ mr: 1 }}>
                                                                Multiple Choice
                                                            </Typography>
                                                            <Tooltip title="Allow customers to select multiple toppings">
                                                                <IconButton size="small">
                                                                    <InfoIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                        <Switch
                                                            checked={newMenu.toppings.multipleChoice}
                                                            onChange={handleMultipleChoiceToggle}
                                                            color="primary"
                                                            size="small"
                                                        />
                                                    </Box>
                                                </>
                                            )}
                                        </Box>
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
                                <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
                                    {uploadedImages.length > 0 &&
                                        uploadedImages.map((image, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    width: 80,
                                                    height: 80,
                                                    borderRadius: 1,
                                                    overflow: "hidden",
                                                }}
                                            >
                                                <img
                                                    src={image || "/placeholder.svg"}
                                                    alt={`Uploaded ${index + 1}`}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            </Box>
                                        ))}
                                    <Box
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: 1,
                                            border: "1px solid #e0e0e0",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: "pointer",
                                            backgroundColor: "#f5f5f5",
                                        }}
                                        onClick={triggerFileInput}
                                    >
                                        <Typography variant="body2" fontWeight="bold">
                                            Upload
                                        </Typography>
                                        <CloudUploadIcon fontSize="small" sx={{ mt: 0.5 }} />
                                    </Box>
                                    <Box
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: 1,
                                            border: "1px dashed #90caf9",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: "pointer",
                                            backgroundColor: "#e3f2fd",
                                        }}
                                    >
                                        <AddIcon sx={{ color: "#90caf9" }} />
                                    </Box>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: "none" }}
                                        onChange={handleImageUpload}
                                        accept="image/*"
                                        multiple
                                    />
                                </Box>

                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    Descriptions
                                </Typography>
                                <Box
                                    sx={{
                                        border: "1px solid #e0e0e0",
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
                                        value={newMenu.description}
                                        onChange={handleInputChange}
                                        variant="outlined"
                                        sx={{
                                            "& .MuiOutlinedInput-notchedOutline": {
                                                border: "none",
                                            },
                                        }}
                                    />
                                    <Divider />
                                    <Box sx={{ display: "flex", p: 1 }}>
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
                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Maximum 500 characters
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {newMenu.description.length} / 500
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </DialogContent>

                    <DialogActions sx={{ p: 3, justifyContent: "space-between" }}>
                        {addMenuStep === 1 ? (
                            <>
                                <Button

                                    sx={{
                                        color: "text.primary",
                                        "&:hover": {
                                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                                        },
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleNextStep}
                                    variant="contained"
                                    sx={{
                                        backgroundColor: "#003B5C",
                                        "&:hover": {
                                            backgroundColor: "#002A41",
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
                                        color: "text.primary",
                                        "&:hover": {
                                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                                        },
                                    }}
                                >
                                    Previous
                                </Button>
                                <Button
                                    onClick={handleSaveMenu}
                                    variant="contained"
                                    sx={{
                                        backgroundColor: "#003B5C",
                                        "&:hover": {
                                            backgroundColor: "#002A41",
                                        },
                                    }}
                                >
                                    Save
                                </Button>
                            </>
                        )}
                    </DialogActions>
                </Box>
            </div>
        </>
    )
}

export default AddProduct
