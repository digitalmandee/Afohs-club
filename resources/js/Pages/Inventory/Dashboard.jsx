"use client"

import { useState, useEffect, useRef } from "react"
import {
    Button,
    TextField,
    Dialog,
    DialogContent,
    DialogActions,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Box,
    Card,
    CardContent,
    Grid,
    Chip,
    InputAdornment,
    Switch,
    Divider,
    LinearProgress,
    MenuItem,
    Alert,
    Snackbar,
    Tooltip,
} from "@mui/material"
import SideNav from '../../Components/SideBar/SideNav'
import {
    Close as CloseIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Add as AddIcon,
    ExpandMore as ExpandMoreIcon,
    ArrowUpward as ArrowUpwardIcon,
    ArrowDownward as ArrowDownwardIcon,
    Check as CheckIcon,
    ChevronRight as ChevronRightIcon,
    Edit as EditIcon,
    AttachMoney as AttachMoneyIcon,
    Delete as DeleteIcon,
    ArrowForward as ArrowForwardIcon,
    CloudUpload as CloudUploadIcon,
    InsertEmoticon as InsertEmoticonIcon,
    FormatBold as FormatBoldIcon,
    FormatItalic as FormatItalicIcon,
    FormatListBulleted,
    FormatListNumbered,
    Link as LinkIcon,
    MoreVert as MoreVertIcon,
    CheckCircle as CheckCircleIcon,
    Info as InfoIcon,
    RestaurantMenu as RestaurantMenuIcon,
    LocalMall as LocalMallIcon,
    LocalShipping as LocalShippingIcon,
    ShoppingBag as ShoppingBagIcon,
    EventSeat as EventSeatIcon,
    Inventory as InventoryIcon,
    CalendarToday as CalendarIcon,
} from "@mui/icons-material"
import "bootstrap/dist/css/bootstrap.min.css"
import { PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer } from "recharts"

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

export default function CoffeeShop() {
    const [open, setOpen] = useState(false);
    const [openFilter, setOpenFilter] = useState(false)
    const [openProductDetail, setOpenProductDetail] = useState(false)
    const [openAddMenu, setOpenAddMenu] = useState(false)
    const [addMenuStep, setAddMenuStep] = useState(1)
    const [selectedProduct, setSelectedProduct] = useState({
        id: "",
        name: "",
        category: "Coffee & Beverage",
        image: "",
        images: [],
        stock: { status: "", quantity: "" },
        price: { current: 0, original: null, discount: null, cogs: 0, profit: 0 },
        temperature: [],
        size: [],
        description: "",
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
    })
    const [activeCategory, setActiveCategory] = useState("All Menus")
    const [searchTerm, setSearchTerm] = useState("")
    const [filteredProducts, setFilteredProducts] = useState([])
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [uploadedImages, setUploadedImages] = useState([])
    const fileInputRef = useRef(null)

    // New menu form state
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

    // Sorting states
    const [sortingOptions, setSortingOptions] = useState({
        name: null,
        price: null,
        date: null,
        purchase: null,
    })

    // Category and stock filters
    const [categoryFilter, setCategoryFilter] = useState("All")
    const [stockFilter, setStockFilter] = useState("All")

    // Product data
    const [products, setProducts] = useState([
        {
            id: "MENU001",
            name: "Ristretto Bianco",
            category: "Coffee & Beverage",
            image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jkx2mHK5QcKtUn8SdTDaegzAMc1u6b.png",
            images: [
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jkx2mHK5QcKtUn8SdTDaegzAMc1u6b.png",
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jkx2mHK5QcKtUn8SdTDaegzAMc1u6b.png",
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jkx2mHK5QcKtUn8SdTDaegzAMc1u6b.png",
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jkx2mHK5QcKtUn8SdTDaegzAMc1u6b.png",
            ],
            stock: { status: "Ready Stock", quantity: "520 Pcs" },
            price: { current: 4.0, original: 8.0, discount: "50%", cogs: 3.0, profit: 1.0 },
            temperature: ["Ice", "Hot"],
            size: ["S", "M", "L"],
            description:
                "An all-time favorite blend with citrus fruit character, caramel flavors, and a pleasant faintly floral aroma. Locked scent: Excelso prevents all...",
            available: true,
            orderTypes: ["Dine In", "Pick Up", "Delivery", "Takeway", "Reservation"],
            stockDetails: {
                ready: 520,
                outOfStock: 32,
                totalVariant: 14,
            },
            sales: {
                weekly: [120, 150, 180, 200, 170, 190, 160],
                byOrderType: [
                    { name: "Dine In", value: 230, percentage: "25%", color: "#003B5C" },
                    { name: "Delivery", value: 120, percentage: "13%", color: "#0288d1" },
                    { name: "Pick Up", value: 80, percentage: "9%", color: "#4caf50" },
                    { name: "Reservation", value: 140, percentage: "15%", color: "#b0bec5" },
                    { name: "Other", value: 350, percentage: "38%", color: "#e0e0e0" },
                ],
                average: 2420,
            },
        },
        {
            id: "MENU002",
            name: "Iced creamy latte",
            category: "Coffee & Beverage",
            image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jkx2mHK5QcKtUn8SdTDaegzAMc1u6b.png",
            images: [
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jkx2mHK5QcKtUn8SdTDaegzAMc1u6b.png",
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jkx2mHK5QcKtUn8SdTDaegzAMc1u6b.png",
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jkx2mHK5QcKtUn8SdTDaegzAMc1u6b.png",
            ],
            stock: { status: "Out of Stock", quantity: "0 Pcs" },
            price: { current: 5.0, original: null, discount: null, cogs: 4.0, profit: 1.0 },
            temperature: ["Ice", "Hot"],
            size: ["S", "M", "L"],
            description:
                "A creamy, smooth latte with a perfect balance of espresso and milk. The iced version is refreshing and perfect for warm days.",
            available: false,
            orderTypes: ["Dine In", "Pick Up", "Delivery", "Takeway", "Reservation"],
            stockDetails: {
                ready: 0,
                outOfStock: 120,
                totalVariant: 8,
            },
            sales: {
                weekly: [80, 100, 90, 110, 95, 105, 85],
                byOrderType: [
                    { name: "Dine In", value: 180, percentage: "20%", color: "#003B5C" },
                    { name: "Delivery", value: 200, percentage: "22%", color: "#0288d1" },
                    { name: "Pick Up", value: 150, percentage: "17%", color: "#4caf50" },
                    { name: "Reservation", value: 120, percentage: "13%", color: "#b0bec5" },
                    { name: "Other", value: 250, percentage: "28%", color: "#e0e0e0" },
                ],
                average: 1850,
            },
        },
        {
            id: "MENU003",
            name: "Cappucino",
            category: "Coffee & Beverage",
            image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jkx2mHK5QcKtUn8SdTDaegzAMc1u6b.png",
            images: [
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jkx2mHK5QcKtUn8SdTDaegzAMc1u6b.png",
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jkx2mHK5QcKtUn8SdTDaegzAMc1u6b.png",
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jkx2mHK5QcKtUn8SdTDaegzAMc1u6b.png",
            ],
            stock: { status: "Ready Stock", quantity: "520 Pcs" },
            price: { current: 4.0, original: 8.0, discount: "50%", cogs: 3.0, profit: 1.0 },
            temperature: ["Ice", "Hot"],
            size: ["S", "M", "L"],
            description:
                "A classic Italian coffee drink prepared with espresso, hot milk, and steamed milk foam. Perfect balance of flavors.",
            available: true,
            orderTypes: ["Dine In", "Pick Up", "Delivery", "Takeway", "Reservation"],
            stockDetails: {
                ready: 520,
                outOfStock: 0,
                totalVariant: 12,
            },
            sales: {
                weekly: [140, 160, 150, 180, 170, 190, 160],
                byOrderType: [
                    { name: "Dine In", value: 250, percentage: "28%", color: "#003B5C" },
                    { name: "Delivery", value: 150, percentage: "17%", color: "#0288d1" },
                    { name: "Pick Up", value: 100, percentage: "11%", color: "#4caf50" },
                    { name: "Reservation", value: 120, percentage: "13%", color: "#b0bec5" },
                    { name: "Other", value: 280, percentage: "31%", color: "#e0e0e0" },
                ],
                average: 2200,
            },
        },
        {
            id: "MENU004",
            name: "Orange juice",
            category: "Coffee & Beverage",
            image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jkx2mHK5QcKtUn8SdTDaegzAMc1u6b.png",
            images: [
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jkx2mHK5QcKtUn8SdTDaegzAMc1u6b.png",
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jkx2mHK5QcKtUn8SdTDaegzAMc1u6b.png",
            ],
            stock: { status: "Ready Stock", quantity: "520 Pcs" },
            price: { current: 4.0, original: null, discount: null, cogs: 2.5, profit: 1.5 },
            temperature: ["Ice", "Hot"],
            size: ["S", "M", "L"],
            description: "Freshly squeezed orange juice, rich in vitamin C and refreshing taste. Made from premium oranges.",
            available: true,
            orderTypes: ["Dine In", "Pick Up", "Delivery", "Takeway", "Reservation"],
            stockDetails: {
                ready: 520,
                outOfStock: 0,
                totalVariant: 6,
            },
            sales: {
                weekly: [100, 120, 110, 130, 125, 115, 105],
                byOrderType: [
                    { name: "Dine In", value: 200, percentage: "25%", color: "#003B5C" },
                    { name: "Delivery", value: 180, percentage: "22%", color: "#0288d1" },
                    { name: "Pick Up", value: 150, percentage: "19%", color: "#4caf50" },
                    { name: "Reservation", value: 100, percentage: "12%", color: "#b0bec5" },
                    { name: "Other", value: 170, percentage: "22%", color: "#e0e0e0" },
                ],
                average: 1900,
            },
        },
        {
            id: "MENU005",
            name: "Soda Beverage",
            category: "Coffee & Beverage",
            image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jkx2mHK5QcKtUn8SdTDaegzAMc1u6b.png",
            images: [
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jkx2mHK5QcKtUn8SdTDaegzAMc1u6b.png",
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jkx2mHK5QcKtUn8SdTDaegzAMc1u6b.png",
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jkx2mHK5QcKtUn8SdTDaegzAMc1u6b.png",
            ],
            stock: { status: "Ready Stock", quantity: "520 Pcs" },
            price: { current: 4.0, original: null, discount: null, cogs: 2.0, profit: 2.0 },
            temperature: ["Ice", "Hot"],
            size: ["S", "M", "L"],
            description:
                "Refreshing carbonated beverage with a variety of flavors to choose from. Perfect for a quick refreshment.",
            available: true,
            orderTypes: ["Dine In", "Pick Up", "Delivery", "Takeway", "Reservation"],
            stockDetails: {
                ready: 520,
                outOfStock: 0,
                totalVariant: 10,
            },
            sales: {
                weekly: [90, 110, 100, 120, 115, 105, 95],
                byOrderType: [
                    { name: "Dine In", value: 180, percentage: "22%", color: "#003B5C" },
                    { name: "Delivery", value: 150, percentage: "18%", color: "#0288d1" },
                    { name: "Pick Up", value: 200, percentage: "24%", color: "#4caf50" },
                    { name: "Reservation", value: 120, percentage: "15%", color: "#b0bec5" },
                    { name: "Other", value: 170, percentage: "21%", color: "#e0e0e0" },
                ],
                average: 1800,
            },
        },
    ])

    // Add new state variables for Stock and Update Stock modals
    const [openStockModal, setOpenStockModal] = useState(false)
    const [openUpdateStockModal, setOpenUpdateStockModal] = useState(false)
    const [openEditMenu, setOpenEditMenu] = useState(false)
    const [editMenuStep, setEditMenuStep] = useState(1)
    const [openAdjustPrice, setOpenAdjustPrice] = useState(false)
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false)
    const [deleteConfirmText, setDeleteConfirmText] = useState("")
    const [showDeleteSuccess, setShowDeleteSuccess] = useState(false)

    // Filter products based on active category
    useEffect(() => {
        let filtered = [...products]

        // Filter by category
        if (activeCategory !== "All Menus") {
            filtered = filtered.filter((product) => product.category === activeCategory)
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
        }

        setFilteredProducts(filtered)
    }, [activeCategory, searchTerm, products])

    // Calculate profit when cogs or basePrice changes
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

    // Apply filters from the filter modal
    const applyFilters = () => {
        let filtered = [...products]

        // Apply category filter
        if (categoryFilter !== "All") {
            filtered = filtered.filter((product) => product.category === categoryFilter)
        }

        // Apply stock filter
        if (stockFilter !== "All") {
            filtered = filtered.filter((product) =>
                stockFilter === "Ready"
                    ? product.stock.status === "Ready Stock"
                    : stockFilter === "Out of Stock"
                        ? product.stock.status === "Out of Stock"
                        : stockFilter === "Imaji at Home"
                            ? product.category === "Imaji at Home"
                            : true,
            )
        }

        // Apply sorting
        if (sortingOptions.name === "ascending") {
            filtered.sort((a, b) => a.name.localeCompare(b.name))
        } else if (sortingOptions.name === "descending") {
            filtered.sort((a, b) => b.name.localeCompare(a.name))
        }

        if (sortingOptions.price === "ascending") {
            filtered.sort((a, b) => a.price.current - b.price.current)
        } else if (sortingOptions.price === "descending") {
            filtered.sort((a, b) => b.price.current - a.price.current)
        }

        setFilteredProducts(filtered)
        setOpenFilter(false)
    }

    // Reset all filters
    const resetFilters = () => {
        setSortingOptions({
            name: null,
            price: null,
            date: null,
            purchase: null,
        })
        setCategoryFilter("All")
        setStockFilter("All")
    }

    // Toggle sorting option
    const toggleSorting = (field, direction) => {
        setSortingOptions((prev) => ({
            ...prev,
            [field]: prev[field] === direction ? null : direction,
        }))
    }

    // Handle category button click
    const handleCategoryClick = (category) => {
        setActiveCategory(category)
    }

    // Handle filter modal open/close
    const handleFilterOpen = () => {
        setOpenFilter(true)
    }

    const handleFilterClose = () => {
        setOpenFilter(false)
    }

    // Handle product detail modal
    const handleProductClick = (product) => {
        setSelectedProduct(product)
        setOpenProductDetail(true)
    }

    const handleProductDetailClose = () => {
        setOpenProductDetail(false)
    }

    // Handle Add Menu modal
    const handleAddMenuOpen = () => {
        setAddMenuStep(1)
        setOpenAddMenu(true)
    }

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

    const handleNextStep = () => {
        setAddMenuStep(2)
    }

    const handlePreviousStep = () => {
        setAddMenuStep(1)
    }

    // Handle form input changes
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

    const handleToppingItemChange = (index, field, value) => {
        setNewMenu((prev) => {
            const updatedItems = [...prev.toppings.items]
            updatedItems[index] = {
                ...updatedItems[index],
                [field]: value,
            }
            return {
                ...prev,
                toppings: {
                    ...prev.toppings,
                    items: updatedItems,
                },
            }
        })
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

    // Handle image upload
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

    // Save new menu
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

    const handleCloseConfirmation = () => {
        setShowConfirmation(false)
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

    // Add handlers for Stock modal
    const handleViewStock = () => {
        setOpenStockModal(true)
    }

    const handleCloseStockModal = () => {
        setOpenStockModal(false)
    }

    // Add handlers for Update Stock modal
    const handleUpdateStock = () => {
        setOpenUpdateStockModal(true)
        setOpenStockModal(false)
    }

    const handleCloseUpdateStockModal = () => {
        setOpenUpdateStockModal(false)
        setOpenStockModal(true)
    }

    const handleSaveStockChanges = () => {
        setOpenUpdateStockModal(false)
        // Here you would update the product's stock data
        // For now, we'll just show a success message
        setShowConfirmation(true)
    }

    // Edit Menu handlers
    const handleEditMenuOpen = () => {
        setEditMenuStep(1)
        setOpenEditMenu(true)
    }

    const handleEditMenuClose = () => {
        setOpenEditMenu(false)
    }

    const handleEditMenuNextStep = () => {
        setEditMenuStep(2)
    }

    const handleEditMenuPreviousStep = () => {
        setEditMenuStep(1)
    }

    const handleSaveEditMenu = () => {
        // Here you would update the product data
        setOpenEditMenu(false)
        setShowConfirmation(true)
    }

    // Adjust Price handlers
    const handleAdjustPriceOpen = () => {
        setOpenAdjustPrice(true)
    }

    const handleAdjustPriceClose = () => {
        setOpenAdjustPrice(false)
    }

    const handleSaveAdjustPrice = () => {
        // Here you would update the product's price data
        setOpenAdjustPrice(false)
        setShowConfirmation(true)
    }

    // Delete Product handlers
    const handleDeleteConfirmOpen = () => {
        setOpenDeleteConfirm(true)
        setDeleteConfirmText("")
    }

    const handleDeleteConfirmClose = () => {
        setOpenDeleteConfirm(false)
    }

    const handleDeleteProduct = () => {
        if (deleteConfirmText === "CONFIRM DELETE") {
            // Here you would delete the product from your data
            if (selectedProduct) {
                setProducts((prev) => prev.filter((product) => product.id !== selectedProduct.id))
            }
            setOpenDeleteConfirm(false)
            setOpenProductDetail(false)
            setShowDeleteSuccess(true)
        }
    }

    const handleDeleteSuccessClose = () => {
        setShowDeleteSuccess(false)
    }

    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div style={{
                marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                transition: "margin-left 0.3s ease-in-out",
                marginTop: '5rem',
            }}>
                <div className="container-fluid bg-light py-4">
                    {/* Category Filter Buttons */}
                    <div className="mb-4"
                        style={{
                            background: "#f0f0f0",
                            padding: "20px",
                            borderRadius: "10px",
                        }}>
                        <Button
                            variant={activeCategory === "All Menus" ? "contained" : "outlined"}
                            onClick={() => handleCategoryClick("All Menus")}
                            sx={{
                                borderRadius: 50,
                                mr: 1,
                                color: activeCategory === "All Menus" ? "#fff" : "#063455",
                                borderColor: "#063455",
                                backgroundColor: activeCategory === "All Menus" ? "#063455" : "transparent",
                                "&:hover": {
                                    backgroundColor: activeCategory === "All Menus" ? "#063455" : "rgba(6, 52, 85, 0.04)",
                                },
                            }}
                        >
                            All Menus
                        </Button>

                        <Button
                            variant={activeCategory === "Coffee & Beverage" ? "contained" : "outlined"}
                            onClick={() => handleCategoryClick("Coffee & Beverage")}
                            sx={{
                                borderRadius: 50,
                                mr: 1,
                                color: activeCategory === "Coffee & Beverage" ? "#fff" : "#063455",
                                borderColor: "#063455",
                                backgroundColor: activeCategory === "Coffee & Beverage" ? "#063455" : "transparent",
                                "&:hover": {
                                    backgroundColor: activeCategory === "Coffee & Beverage" ? "#063455" : "rgba(6, 52, 85, 0.04)",
                                },
                            }}
                        >
                            Coffee & Beverage
                        </Button>

                        <Button
                            variant={activeCategory === "Food & Snack" ? "contained" : "outlined"}
                            onClick={() => handleCategoryClick("Food & Snack")}
                            sx={{
                                borderRadius: 50,
                                mr: 1,
                                color: activeCategory === "Food & Snack" ? "#fff" : "#063455",
                                borderColor: "#063455",
                                backgroundColor: activeCategory === "Food & Snack" ? "#063455" : "transparent",
                                "&:hover": {
                                    backgroundColor: activeCategory === "Food & Snack" ? "#063455" : "rgba(6, 52, 85, 0.04)",
                                },
                            }}
                        >
                            Food & Snack
                        </Button>

                        <Button
                            variant={activeCategory === "Imaji at Home" ? "contained" : "outlined"}
                            onClick={() => handleCategoryClick("Imaji at Home")}
                            sx={{
                                borderRadius: 50,
                                color: activeCategory === "Imaji at Home" ? "#fff" : "#063455",
                                borderColor: "#063455",
                                backgroundColor: activeCategory === "Imaji at Home" ? "#063455" : "transparent",
                                "&:hover": {
                                    backgroundColor: activeCategory === "Imaji at Home" ? "#063455" : "rgba(6, 52, 85, 0.04)",
                                },
                            }}
                        >
                            Imaji at Home
                        </Button>

                    </div>

                    {/* Product Count, Search and Filter */}
                    <div style={{
                        background: "#ffff",
                        padding: "20px",
                        borderRadius: "10px",
                    }}>
                        <div className="d-flex align-items-center mb-4"
                        >
                            <div className="d-flex align-items-center">
                                <Typography variant="h4" component="h1" fontWeight="500" sx={{ mr: 2 }}>
                                    67
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
                                    "& .MuiOutlinedInput-root": {
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

                            <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
                                <Button
                                    variant="#3F4E4F" startIcon={<FilterIcon />} onClick={handleFilterOpen} sx={{
                                        borderRadius: 1,
                                        border: "solid 1px #3F4E4F",
                                        "&:hover": {
                                            backgroundColor: "#002A41",
                                            color: "#ffff",
                                        },
                                    }}>
                                    Filter
                                </Button>

                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={handleAddMenuOpen}
                                    sx={{
                                        borderRadius: 1,
                                        backgroundColor: "#003B5C",
                                        "&:hover": {
                                            backgroundColor: "#002A41",
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
                                        border: "1px solid #E3E3E3",
                                        boxShadow: "none",
                                        cursor: "pointer",
                                        "&:hover": {
                                            background: '#F6F6F6',
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Grid container alignItems="center">
                                            <Grid item xs={12} sm={3} md={2.5} sx={{ display: "flex", alignItems: "center" }}>
                                                <Box sx={{ width: 70, height: 70, mr: 2 }}>
                                                    <img
                                                        src={product.image || "/placeholder.svg"}
                                                        alt={product.name}
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                            objectFit: "cover",
                                                            borderRadius: "50%",
                                                        }}
                                                    />
                                                </Box>

                                                <Box>
                                                    <Typography
                                                        sx={{ fontSize: '18px', fontWeight: 500, color: '#121212' }}
                                                    >
                                                        {product.name}
                                                    </Typography>
                                                    <Typography
                                                        sx={{ fontSize: '14px', fontWeight: 500, color: '#063455' }}
                                                    >
                                                        {product.category}
                                                    </Typography>
                                                </Box>


                                            </Grid>

                                            <Grid
                                                item
                                                xs={12}
                                                sm={3}
                                                md={2.5}
                                                sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                                            >
                                                <Box>
                                                    {product.stock.status === "Out of Stock" ? (
                                                        <Typography variant="body2" component="span" className="badge" sx={{
                                                            background: "#F14C35",
                                                        }}>
                                                            {product.stock.status}
                                                        </Typography>
                                                    ) : (
                                                        <Typography variant="body2" color="text.secondary">
                                                            {product.stock.status}
                                                        </Typography>
                                                    )}
                                                    <Typography variant="body1" fontWeight="500"
                                                        sx={{ fontSize: "18px" }}
                                                    >
                                                        {product.stock.quantity}
                                                    </Typography>
                                                </Box>
                                            </Grid>

                                            <Grid
                                                item
                                                xs={12}
                                                sm={3}
                                                md={2.5}
                                                sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                                            >
                                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                                        Rs
                                                    </Typography>
                                                    <Typography variant="h6" fontWeight="500"
                                                        sx={{ fontSize: "24px" }}
                                                    >
                                                        {product.price.current.toFixed(2)}
                                                    </Typography>

                                                    {product.price.original && (
                                                        <>
                                                            <Typography
                                                                variant="body2"
                                                                color="#FFA90B"
                                                                sx={{ ml: 1, textDecoration: "line-through" }}
                                                            >
                                                                Rs {product.price.original.toFixed(2)}
                                                            </Typography>
                                                            <Chip
                                                                label={product.price.discount}
                                                                size="small"
                                                                sx={{
                                                                    ml: 1,
                                                                    backgroundColor: "#0288d1",
                                                                    color: "white",
                                                                    height: 20,
                                                                    fontSize: "0.7rem",
                                                                }}
                                                            />
                                                        </>
                                                    )}
                                                </Box>
                                            </Grid>

                                            <Grid item xs={12} sm={3} md={4.5} sx={{ display: "flex", justifyContent: "flex-end" }}>
                                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mr: 2 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Temperature
                                                    </Typography>
                                                    <Box sx={{ display: "flex", gap: 0.5 }}>
                                                        {product.temperature.map((temp) => (
                                                            <Button
                                                                key={temp}
                                                                variant="outlined"
                                                                size="small"
                                                                sx={{
                                                                    minWidth: "unset",
                                                                    px: 1.5,
                                                                    borderColor: "#e0e0e0",
                                                                    color: "text.primary",
                                                                }}
                                                            >
                                                                {temp}
                                                            </Button>
                                                        ))}
                                                    </Box>
                                                </Box>

                                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mr: 2 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Size
                                                    </Typography>
                                                    <Box sx={{ display: "flex", gap: 0.5 }}>
                                                        {product.size.map((size) => (
                                                            <Button
                                                                key={size}
                                                                variant="outlined"
                                                                size="small"
                                                                sx={{
                                                                    minWidth: "unset",
                                                                    px: 1.5,
                                                                    borderColor: "#e0e0e0",
                                                                    color: "text.primary",
                                                                }}
                                                            >
                                                                {size}
                                                            </Button>
                                                        ))}
                                                    </Box>
                                                </Box>

                                                <Box sx={{ display: "flex", alignItems: "center" }}>
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
                                position: "fixed",
                                right: 0,
                                top: 0,
                                height: "100%",
                                maxHeight: "100%",
                            },
                        }}
                    >
                        <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="h5" fontWeight="bold">
                                Menu Filter
                            </Typography>
                            <IconButton onClick={handleFilterClose}>
                                <CloseIcon />
                            </IconButton>
                        </Box>

                        <DialogContent sx={{ p: 0 }}>
                            <Box sx={{ px: 3, pb: 2 }}>
                                <Accordion defaultExpanded sx={{
                                    boxShadow: "none", "&:before": { display: "none" },
                                    border: "1px solid #e0e0e0",
                                    borderRadius: "10px",
                                    p: 1,
                                }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0, }}>
                                        <Typography fontWeight="bold" fontSize="16px">
                                            Sorting
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ px: 0 }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                            <Typography>By Name</Typography>
                                            <Box>
                                                <Button
                                                    variant={sortingOptions.name === "ascending" ? "contained" : "outlined"}
                                                    size="small"
                                                    startIcon={<ArrowUpwardIcon fontSize="small" />}
                                                    onClick={() => toggleSorting("name", "ascending")}
                                                    sx={{
                                                        mr: 1,
                                                        borderRadius: 50,
                                                        backgroundColor: sortingOptions.name === "ascending" ? "#90caf9" : "transparent",
                                                        color: sortingOptions.name === "ascending" ? "primary.main" : "inherit",
                                                        borderColor: "#90caf9",
                                                        "&:hover": {
                                                            backgroundColor:
                                                                sortingOptions.name === "ascending" ? "#90caf9" : "rgba(144, 202, 249, 0.08)",
                                                        },
                                                    }}
                                                >
                                                    Ascending
                                                </Button>
                                                <Button
                                                    variant={sortingOptions.name === "descending" ? "contained" : "outlined"}
                                                    size="small"
                                                    startIcon={<ArrowDownwardIcon fontSize="small" />}
                                                    onClick={() => toggleSorting("name", "descending")}
                                                    sx={{
                                                        borderRadius: 50,
                                                        backgroundColor: sortingOptions.name === "descending" ? "#90caf9" : "transparent",
                                                        color: sortingOptions.name === "descending" ? "primary.main" : "inherit",
                                                        borderColor: "#90caf9",
                                                        "&:hover": {
                                                            backgroundColor:
                                                                sortingOptions.name === "descending" ? "#90caf9" : "rgba(144, 202, 249, 0.08)",
                                                        },
                                                    }}
                                                >
                                                    Descending
                                                </Button>
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                            <Typography>By Price</Typography>
                                            <Box>
                                                <Button
                                                    variant={sortingOptions.price === "ascending" ? "contained" : "outlined"}
                                                    size="small"
                                                    startIcon={<ArrowUpwardIcon fontSize="small" />}
                                                    onClick={() => toggleSorting("price", "ascending")}
                                                    sx={{
                                                        mr: 1,
                                                        borderRadius: 50,
                                                        backgroundColor: sortingOptions.price === "ascending" ? "#90caf9" : "transparent",
                                                        color: sortingOptions.price === "ascending" ? "primary.main" : "inherit",
                                                        borderColor: "#90caf9",
                                                        "&:hover": {
                                                            backgroundColor:
                                                                sortingOptions.price === "ascending" ? "#90caf9" : "rgba(144, 202, 249, 0.08)",
                                                        },
                                                    }}
                                                >
                                                    Ascending
                                                </Button>
                                                <Button
                                                    variant={sortingOptions.price === "descending" ? "contained" : "outlined"}
                                                    size="small"
                                                    startIcon={<ArrowDownwardIcon fontSize="small" />}
                                                    onClick={() => toggleSorting("price", "descending")}
                                                    sx={{
                                                        borderRadius: 50,
                                                        backgroundColor: sortingOptions.price === "descending" ? "#90caf9" : "transparent",
                                                        color: sortingOptions.price === "descending" ? "primary.main" : "inherit",
                                                        borderColor: "#90caf9",
                                                        "&:hover": {
                                                            backgroundColor:
                                                                sortingOptions.price === "descending" ? "#90caf9" : "rgba(144, 202, 249, 0.08)",
                                                        },
                                                    }}
                                                >
                                                    Descending
                                                </Button>
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                            <Typography>By Date</Typography>
                                            <Box>
                                                <Button
                                                    variant={sortingOptions.date === "ascending" ? "contained" : "outlined"}
                                                    size="small"
                                                    startIcon={<ArrowUpwardIcon fontSize="small" />}
                                                    onClick={() => toggleSorting("date", "ascending")}
                                                    sx={{
                                                        mr: 1,
                                                        borderRadius: 50,
                                                        backgroundColor: sortingOptions.date === "ascending" ? "#90caf9" : "transparent",
                                                        color: sortingOptions.date === "ascending" ? "primary.main" : "inherit",
                                                        borderColor: "#90caf9",
                                                        "&:hover": {
                                                            backgroundColor:
                                                                sortingOptions.date === "ascending" ? "#90caf9" : "rgba(144, 202, 249, 0.08)",
                                                        },
                                                    }}
                                                >
                                                    Ascending
                                                </Button>
                                                <Button
                                                    variant={sortingOptions.date === "descending" ? "contained" : "outlined"}
                                                    size="small"
                                                    startIcon={<ArrowDownwardIcon fontSize="small" />}
                                                    onClick={() => toggleSorting("date", "descending")}
                                                    sx={{
                                                        borderRadius: 50,
                                                        backgroundColor: sortingOptions.date === "descending" ? "#90caf9" : "transparent",
                                                        color: sortingOptions.date === "descending" ? "primary.main" : "inherit",
                                                        borderColor: "#90caf9",
                                                        "&:hover": {
                                                            backgroundColor:
                                                                sortingOptions.date === "descending" ? "#90caf9" : "rgba(144, 202, 249, 0.08)",
                                                        },
                                                    }}
                                                >
                                                    Descending
                                                </Button>
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                            <Typography>By Purchase</Typography>
                                            <Box>
                                                <Button
                                                    variant={sortingOptions.purchase === "best" ? "contained" : "outlined"}
                                                    size="small"
                                                    startIcon={sortingOptions.purchase === "best" ? <CheckIcon fontSize="small" /> : null}
                                                    onClick={() => toggleSorting("purchase", "best")}
                                                    sx={{
                                                        mr: 1,
                                                        borderRadius: 50,
                                                        backgroundColor: sortingOptions.purchase === "best" ? "#90caf9" : "transparent",
                                                        color: sortingOptions.purchase === "best" ? "primary.main" : "inherit",
                                                        borderColor: "#90caf9",
                                                        "&:hover": {
                                                            backgroundColor: sortingOptions.purchase === "best" ? "#90caf9" : "rgba(144, 202, 249, 0.08)",
                                                        },
                                                    }}
                                                >
                                                    Best Seller
                                                </Button>
                                                <Button
                                                    variant={sortingOptions.purchase === "less" ? "contained" : "outlined"}
                                                    size="small"
                                                    startIcon={sortingOptions.purchase === "less" ? <CheckIcon fontSize="small" /> : null}
                                                    onClick={() => toggleSorting("purchase", "less")}
                                                    sx={{
                                                        borderRadius: 50,
                                                        backgroundColor: sortingOptions.purchase === "less" ? "#90caf9" : "transparent",
                                                        color: sortingOptions.purchase === "less" ? "primary.main" : "inherit",
                                                        borderColor: "#90caf9",
                                                        "&:hover": {
                                                            backgroundColor: sortingOptions.purchase === "less" ? "#90caf9" : "rgba(144, 202, 249, 0.08)",
                                                        },
                                                    }}
                                                >
                                                    Less Desirable
                                                </Button>
                                            </Box>
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion sx={{
                                    boxShadow: "none", "&:before": { display: "none" },
                                    border: "1px solid #e0e0e0",
                                    borderRadius: "10px",
                                    p: 1,
                                    mb: 2,
                                }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
                                        <Typography variant="h6" fontWeight="bold" fontSize="16px">
                                            Categories
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ px: 0 }}>
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                            <Button
                                                variant={categoryFilter === "All" ? "contained" : "outlined"}
                                                size="small"
                                                onClick={() => setCategoryFilter("All")}
                                                sx={{
                                                    borderRadius: 50,
                                                    backgroundColor: categoryFilter === "All" ? "#003B5C" : "transparent",
                                                    color: categoryFilter === "All" ? "white" : "inherit",
                                                    "&:hover": {
                                                        backgroundColor: categoryFilter === "All" ? "#003B5C" : "rgba(0, 59, 92, 0.04)",
                                                    },
                                                }}
                                            >
                                                All
                                            </Button>
                                            <Button
                                                variant={categoryFilter === "Coffee & Beverage" ? "contained" : "outlined"}
                                                size="small"
                                                onClick={() => setCategoryFilter("Coffee & Beverage")}
                                                sx={{
                                                    borderRadius: 50,
                                                    backgroundColor: categoryFilter === "Coffee & Beverage" ? "#90caf9" : "transparent",
                                                    color: categoryFilter === "Coffee & Beverage" ? "primary.main" : "inherit",
                                                    borderColor: "#90caf9",
                                                    "&:hover": {
                                                        backgroundColor:
                                                            categoryFilter === "Coffee & Beverage" ? "#90caf9" : "rgba(144, 202, 249, 0.08)",
                                                    },
                                                }}
                                            >
                                                Coffee & Beverage
                                            </Button>
                                            <Button
                                                variant={categoryFilter === "Food & Snack" ? "contained" : "outlined"}
                                                size="small"
                                                onClick={() => setCategoryFilter("Food & Snack")}
                                                sx={{
                                                    borderRadius: 50,
                                                    backgroundColor: categoryFilter === "Food & Snack" ? "#90caf9" : "transparent",
                                                    color: categoryFilter === "Food & Snack" ? "primary.main" : "inherit",
                                                    borderColor: "#90caf9",
                                                    "&:hover": {
                                                        backgroundColor: categoryFilter === "Food & Snack" ? "#90caf9" : "rgba(144, 202, 249, 0.08)",
                                                    },
                                                }}
                                            >
                                                Food & Snack
                                            </Button>
                                            <Button
                                                variant={categoryFilter === "Imaji at Home" ? "contained" : "outlined"}
                                                size="small"
                                                onClick={() => setCategoryFilter("Imaji at Home")}
                                                sx={{
                                                    borderRadius: 50,
                                                    backgroundColor: categoryFilter === "Imaji at Home" ? "#90caf9" : "transparent",
                                                    color: categoryFilter === "Imaji at Home" ? "primary.main" : "inherit",
                                                    borderColor: "#90caf9",
                                                    "&:hover": {
                                                        backgroundColor: categoryFilter === "Imaji at Home" ? "#90caf9" : "rgba(144, 202, 249, 0.08)",
                                                    },
                                                }}
                                            >
                                                Imaji at Home
                                            </Button>
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion sx={{
                                    boxShadow: "none", "&:before": { display: "none" },
                                    border: "1px solid #e0e0e0",
                                    borderRadius: "10px",
                                    p: 1,
                                }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
                                        <Typography fontWeight="bold" fontSize="16px">
                                            Stock
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ px: 0 }}>
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                            <Button
                                                variant={stockFilter === "All" ? "contained" : "outlined"}
                                                size="small"
                                                onClick={() => setStockFilter("All")}
                                                sx={{
                                                    borderRadius: 50,
                                                    backgroundColor: stockFilter === "All" ? "#003B5C" : "transparent",
                                                    color: stockFilter === "All" ? "white" : "inherit",
                                                    "&:hover": {
                                                        backgroundColor: stockFilter === "All" ? "#003B5C" : "rgba(0, 59, 92, 0.04)",
                                                    },
                                                }}
                                            >
                                                All
                                            </Button>
                                            <Button
                                                variant={stockFilter === "Ready" ? "contained" : "outlined"}
                                                size="small"
                                                onClick={() => setStockFilter("Ready")}
                                                sx={{
                                                    borderRadius: 50,
                                                    backgroundColor: stockFilter === "Ready" ? "#90caf9" : "transparent",
                                                    color: stockFilter === "Ready" ? "primary.main" : "inherit",
                                                    borderColor: "#90caf9",
                                                    "&:hover": {
                                                        backgroundColor: stockFilter === "Ready" ? "#90caf9" : "rgba(144, 202, 249, 0.08)",
                                                    },
                                                }}
                                            >
                                                Ready
                                            </Button>
                                            <Button
                                                variant={stockFilter === "Out of Stock" ? "contained" : "outlined"}
                                                size="small"
                                                onClick={() => setStockFilter("Out of Stock")}
                                                sx={{
                                                    borderRadius: 50,
                                                    backgroundColor: stockFilter === "Out of Stock" ? "#90caf9" : "transparent",
                                                    color: stockFilter === "Out of Stock" ? "primary.main" : "inherit",
                                                    borderColor: "#90caf9",
                                                    "&:hover": {
                                                        backgroundColor: stockFilter === "Out of Stock" ? "#90caf9" : "rgba(144, 202, 249, 0.08)",
                                                    },
                                                }}
                                            >
                                                Out of Stock
                                            </Button>
                                            <Button
                                                variant={stockFilter === "Imaji at Home" ? "contained" : "outlined"}
                                                size="small"
                                                onClick={() => setStockFilter("Imaji at Home")}
                                                sx={{
                                                    borderRadius: 50,
                                                    backgroundColor: stockFilter === "Imaji at Home" ? "#90caf9" : "transparent",
                                                    color: stockFilter === "Imaji at Home" ? "primary.main" : "inherit",
                                                    borderColor: "#90caf9",
                                                    "&:hover": {
                                                        backgroundColor: stockFilter === "Imaji at Home" ? "#90caf9" : "rgba(144, 202, 249, 0.08)",
                                                    },
                                                }}
                                            >
                                                Imaji at Home
                                            </Button>
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>
                            </Box>
                        </DialogContent>

                        <DialogActions sx={{ p: 3, justifyContent: "space-between" }}>
                            <Button
                                onClick={handleFilterClose}
                                sx={{
                                    color: "text.primary",
                                    "&:hover": {
                                        backgroundColor: "rgba(0, 0, 0, 0.04)",
                                    },
                                }}
                            >
                                Cancel
                            </Button>
                            <Box>
                                <Button
                                    onClick={resetFilters}
                                    variant="outlined"
                                    sx={{
                                        mr: 1,
                                        borderColor: "#e0e0e0",
                                        color: "text.primary",
                                        "&:hover": {
                                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                                            borderColor: "#d5d5d5",
                                        },
                                    }}
                                >
                                    Reset Filter
                                </Button>
                                <Button
                                    onClick={applyFilters}
                                    variant="contained"
                                    sx={{
                                        backgroundColor: "#003B5C",
                                        "&:hover": {
                                            backgroundColor: "#002A41",
                                        },
                                    }}
                                >
                                    Apply Filters
                                </Button>
                            </Box>
                        </DialogActions>
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
                                position: "fixed",
                                right: 0,
                                top: 0,
                                height: "100%",
                                maxHeight: "100%",
                            },
                        }}
                    >
                        {selectedProduct.id && (
                            <>
                                <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Box>
                                        <Typography variant="h5" fontWeight="bold" >
                                            {selectedProduct.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {selectedProduct.id} • {selectedProduct.category}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                        <Box sx={{ mr: 2, display: "flex", alignItems: "center" }}>
                                            <Typography variant="body2" sx={{ mr: 1 }}>
                                                Available
                                            </Typography>
                                            <Switch checked={selectedProduct.available} color="primary" size="small" />
                                        </Box>
                                        <IconButton onClick={handleProductDetailClose}>
                                            <CloseIcon />
                                        </IconButton>
                                    </Box>
                                </Box>

                                <DialogContent sx={{ p: 0 }}>
                                    <Box sx={{ px: 3, pb: 3 }}>
                                        {/* Product Images */}
                                        <Box sx={{ display: "flex", gap: 2, mb: 3, overflowX: "auto", pb: 1 }}>
                                            {selectedProduct.images.map((image, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        width: 120,
                                                        height: 80,
                                                        flexShrink: 0,
                                                        borderRadius: 1,
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    <img
                                                        src={image || "/placeholder.svg"}
                                                        alt={`${selectedProduct.name} ${index + 1}`}
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                            objectFit: "cover",
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
                                                        minWidth: "auto",
                                                        color: "primary.main",
                                                        fontWeight: "bold",
                                                        textTransform: "none",
                                                    }}
                                                >
                                                    Read more
                                                </Button>
                                            </Typography>
                                        </Box>

                                        {/* Action Buttons */}
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                right: 0,
                                                top: 80,
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 1,
                                                p: 1,
                                            }}
                                        >
                                            <IconButton sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }} onClick={handleEditMenuOpen}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }} onClick={handleAdjustPriceOpen}>
                                                <AttachMoneyIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }} onClick={handleDeleteConfirmOpen}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>

                                        {/* Pricing Information */}
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                border: "1px solid #e0e0e0",
                                                borderRadius: "8px",
                                                p: 2,
                                                alignItems: "center",
                                            }}
                                        >
                                            {/* COGS */}
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    COGS
                                                </Typography>
                                                <Typography variant="h6" fontWeight="bold">
                                                    Rs {selectedProduct.price.cogs.toFixed(2)}
                                                </Typography>
                                            </Box>

                                            {/* Divider */}
                                            <Divider orientation="vertical" flexItem sx={{ mx: 2, borderColor: "#e0e0e0" }} />

                                            {/* Base Price Selling */}
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Base Price Selling
                                                </Typography>
                                                <Typography variant="h6" fontWeight="bold">
                                                    Rs {selectedProduct.price.current.toFixed(2)}
                                                </Typography>
                                            </Box>

                                            {/* Divider */}
                                            <Divider orientation="vertical" flexItem sx={{ mx: 2, borderColor: "#e0e0e0" }} />

                                            {/* Profit Estimate */}
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Profit Estimate
                                                </Typography>
                                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                                    <Typography variant="h6" fontWeight="bold">
                                                        Rs {selectedProduct.price.profit.toFixed(2)}
                                                    </Typography>
                                                    <Chip
                                                        label="33%"
                                                        size="small"
                                                        sx={{
                                                            ml: 1,
                                                            backgroundColor: "#0A2F49", // Dark blue as in image
                                                            color: "white",
                                                            height: 20,
                                                            fontSize: "0.7rem",
                                                            px: "4px",
                                                            borderRadius: "2px",
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>

                                        <Divider sx={{ mb: 3 }} />

                                        {/* Available Order Type */}
                                        <Box
                                            sx={{
                                                justifyContent: "space-between",
                                                border: "1px solid #e0e0e0",
                                                borderRadius: "8px",
                                                p: 2,
                                                mb: 3,
                                                alignItems: "center",
                                            }}>
                                            <Typography variant="body1" fontWeight="bold" sx={{ mb: 2 }}>
                                                Available Order Type
                                            </Typography>
                                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                                {selectedProduct.orderTypes.map((type) => (
                                                    <Button
                                                        key={type}
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{
                                                            borderRadius: 1,
                                                            borderColor: "#e0e0e0",
                                                            color: "text.primary",
                                                            textTransform: "none",
                                                        }}
                                                        startIcon={type === "Dine In" ? <CheckIcon fontSize="small" /> : null}
                                                    >
                                                        {type}
                                                    </Button>
                                                ))}
                                            </Box>
                                        </Box>

                                        {/* Stock Availability */}
                                        <Box
                                            sx={{
                                                justifyContent: "space-between",
                                                border: "1px solid #e0e0e0",
                                                borderRadius: "8px",
                                                p: 2,
                                                mb: 3,
                                                alignItems: "center",
                                            }}>
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                                <Typography variant="body1" fontWeight="bold">
                                                    Stock Availability
                                                </Typography>
                                                <Button
                                                    variant="text"
                                                    size="small"
                                                    endIcon={<ArrowForwardIcon fontSize="small" />}
                                                    onClick={handleViewStock}
                                                    sx={{
                                                        color: "primary.main",
                                                        textTransform: "none",
                                                    }}
                                                >
                                                    View Stock
                                                </Button>
                                            </Box>

                                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Ready Stock
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Out of Stock
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Total Variant
                                                </Typography>
                                            </Box>

                                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                                <Typography variant="body1" fontWeight="bold">
                                                    {selectedProduct.stockDetails.ready} pcs
                                                </Typography>
                                                <Typography variant="body1" fontWeight="bold">
                                                    {selectedProduct.stockDetails.outOfStock} pcs
                                                </Typography>
                                                <Typography variant="body1" fontWeight="bold">
                                                    {selectedProduct.stockDetails.totalVariant} variant
                                                </Typography>
                                            </Box>

                                            <Box sx={{ mb: 3 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={
                                                        (selectedProduct.stockDetails.ready /
                                                            (selectedProduct.stockDetails.ready + selectedProduct.stockDetails.outOfStock)) *
                                                        100
                                                    }
                                                    sx={{
                                                        height: 10,
                                                        borderRadius: 5,
                                                        backgroundColor: "#ff5722",
                                                        "& .MuiLinearProgress-bar": {
                                                            backgroundColor: "#003B5C",
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        </Box>

                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                gap: 2,
                                                mb: 3,
                                            }}
                                        >
                                            {/* 1. Average Weekly Sales */}
                                            <Box
                                                sx={{
                                                    flex: 1,
                                                    border: "1px solid #e0e0e0",
                                                    borderRadius: "12px",
                                                    p: 3,
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    justifyContent: "space-between",
                                                }}
                                            >
                                                <Box>
                                                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
                                                        Rs {selectedProduct.sales.average.toLocaleString()}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Average Weekly Sales
                                                    </Typography>
                                                </Box>

                                                {/* Bar Chart */}
                                                <Box sx={{ width: "100%", height: 100, mt: 2 }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart
                                                            data={selectedProduct.sales.weekly.map((value, index) => ({
                                                                name: `Week ${index + 1}`,
                                                                value,
                                                            }))}
                                                        >
                                                            <Bar dataKey="value" fill="#003B5C" radius={[4, 4, 0, 0]} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </Box>
                                            </Box>

                                            {/* 2. Sales by Order Type */}
                                            <Box
                                                sx={{
                                                    flex: 1,
                                                    border: "1px solid #e0e0e0",
                                                    borderRadius: "12px",
                                                    p: 3,
                                                    display: "flex",
                                                    flexDirection: "column",
                                                }}
                                            >
                                                <Typography variant="body1" fontWeight="bold" sx={{ mb: 2 }}>
                                                    Sales by Order Type
                                                </Typography>

                                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                    {/* Pie Chart */}
                                                    <Box sx={{ width: "50%", height: 180 }}>
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <PieChart>
                                                                <Pie
                                                                    data={selectedProduct.sales.byOrderType}
                                                                    cx="50%"
                                                                    cy="50%"
                                                                    innerRadius={50}
                                                                    outerRadius={70}
                                                                    paddingAngle={2}
                                                                    dataKey="value"
                                                                    nameKey="name"
                                                                >
                                                                    {selectedProduct.sales.byOrderType.map((entry, index) => (
                                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                                    ))}
                                                                </Pie>
                                                                <Tooltip
                                                                    contentStyle={{
                                                                        backgroundColor: "#1c1c1c",
                                                                        borderRadius: 6,
                                                                        border: "none",
                                                                        color: "#fff",
                                                                        fontSize: "14px",
                                                                    }}
                                                                    formatter={(value, name) => [`${value} pcs`, name]}
                                                                />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                    </Box>

                                                    {/* Legend */}
                                                    <Box sx={{ width: "45%" }}>
                                                        {selectedProduct.sales.byOrderType.slice(0, 4).map((entry) => (
                                                            <Box key={entry.name} sx={{ display: "flex", alignItems: "center", mb: 1.2 }}>
                                                                <Box
                                                                    sx={{
                                                                        width: 10,
                                                                        height: 10,
                                                                        borderRadius: "50%",
                                                                        backgroundColor: entry.color,
                                                                        mr: 1,
                                                                    }}
                                                                />
                                                                <Typography variant="body2" sx={{ mr: 1 }}>
                                                                    {entry.name}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {entry.percentage}
                                                                </Typography>
                                                            </Box>
                                                        ))}
                                                    </Box>

                                                </Box>
                                            </Box>

                                        </Box>

                                    </Box>
                                </DialogContent>
                            </>
                        )}
                    </Dialog>

                    {/* Add Menu Modal */}
                    <Dialog
                        open={openAddMenu}
                        onClose={handleAddMenuClose}
                        fullWidth
                        maxWidth="md"
                        PaperProps={{
                            sx: {
                                borderRadius: 1,
                                m: 0,
                                position: "fixed",
                                right: 0,
                                top: 0,
                                height: "100%",
                                maxHeight: "100%",
                            },
                        }}
                    >
                        <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="h5" fontWeight="bold">
                                Add Menu
                            </Typography>
                            <IconButton onClick={handleAddMenuClose}>
                                <CloseIcon />
                            </IconButton>
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
                                        onClick={handleAddMenuClose}
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
                    </Dialog>

                    {/* Confirmation Popup */}
                    <Snackbar
                        open={showConfirmation}
                        autoHideDuration={3000}
                        onClose={handleCloseConfirmation}
                        anchorOrigin={{ vertical: "top", horizontal: "center" }}
                    >
                        <Alert
                            severity="success"
                            onClose={handleCloseConfirmation}
                            icon={<CheckCircleIcon />}
                            sx={{
                                width: "100%",
                                backgroundColor: "#e8f5e9",
                                color: "#2e7d32",
                                "& .MuiAlert-icon": {
                                    color: "#2e7d32",
                                },
                            }}
                        >
                            <Box>
                                <Typography variant="body1" fontWeight="bold">
                                    Menu Added!
                                </Typography>
                                <Typography variant="body2">The menu "{newMenu.name || "Cappuccino"}" has been addedd</Typography>
                            </Box>
                        </Alert>
                    </Snackbar>

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
                                position: "fixed",
                                right: 0,
                                top: 0,
                                height: "100%",
                                maxHeight: "100%",
                            },
                        }}
                    >
                        <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <IconButton sx={{ mr: 2, backgroundColor: "#f5f5f5", borderRadius: "50%" }}>
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
                                        border: "1px solid #e0e0e0",
                                        borderRadius: 1,
                                        mb: 2,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography variant="body1">Temperature : 200 pcs</Typography>
                                    <ChevronRightIcon color="action" />
                                </Box>

                                {/* Size */}
                                <Box
                                    sx={{
                                        p: 3,
                                        border: "1px solid #e0e0e0",
                                        borderRadius: 1,
                                        mb: 2,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography variant="body1">Size : 200 pcs</Typography>
                                    <ChevronRightIcon color="action" />
                                </Box>

                                {/* Sweetness */}
                                <Box
                                    sx={{
                                        p: 3,
                                        border: "1px solid #e0e0e0",
                                        borderRadius: 1,
                                        mb: 2,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography variant="body1">Sweetness : 200 pcs</Typography>
                                    <ChevronRightIcon color="action" />
                                </Box>

                                {/* Milk Options */}
                                <Box
                                    sx={{
                                        p: 3,
                                        border: "1px solid #e0e0e0",
                                        borderRadius: 1,
                                        mb: 2,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography variant="body1">Milk Options : 200 pcs</Typography>
                                    <ChevronRightIcon color="action" />
                                </Box>

                                {/* Toppings */}
                                <Box
                                    sx={{
                                        p: 3,
                                        border: "1px solid #e0e0e0",
                                        borderRadius: 1,
                                        mb: 2,
                                        backgroundColor: "#e3f2fd",
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

                                        <Divider sx={{ borderStyle: "dashed" }} />

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

                                        <Divider sx={{ borderStyle: "dashed" }} />

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

                                        <Divider sx={{ borderStyle: "dashed" }} />

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

                                        <Divider sx={{ borderStyle: "dashed" }} />

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
                                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                                        <Typography variant="body2">32 pcs</Typography>
                                                        <Chip
                                                            label="Sold"
                                                            size="small"
                                                            sx={{
                                                                ml: 1,
                                                                backgroundColor: "#ff5722",
                                                                color: "white",
                                                                height: 20,
                                                                fontSize: "0.7rem",
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
                                position: "fixed",
                                right: 0,
                                top: 0,
                                height: "100%",
                                maxHeight: "100%",
                            },
                        }}
                    >
                        <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <IconButton sx={{ mr: 2, backgroundColor: "#f5f5f5", borderRadius: "50%" }}>
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
                                        border: "1px solid #e0e0e0",
                                        borderRadius: 1,
                                        mb: 2,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography variant="body1">Temperature : 200 pcs</Typography>
                                    <ChevronRightIcon color="action" />
                                </Box>

                                {/* Size */}
                                <Box
                                    sx={{
                                        p: 3,
                                        border: "1px solid #e0e0e0",
                                        borderRadius: 1,
                                        mb: 2,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography variant="body1">Size : 200 pcs</Typography>
                                    <ChevronRightIcon color="action" />
                                </Box>

                                {/* Sweetness */}
                                <Box
                                    sx={{
                                        p: 3,
                                        border: "1px solid #e0e0e0",
                                        borderRadius: 1,
                                        mb: 2,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography variant="body1">Sweetness : 200 pcs</Typography>
                                    <ChevronRightIcon color="action" />
                                </Box>

                                {/* Milk Options */}
                                <Box
                                    sx={{
                                        p: 3,
                                        border: "1px solid #e0e0e0",
                                        borderRadius: 1,
                                        mb: 2,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography variant="body1">Milk Options : 200 pcs</Typography>
                                    <ChevronRightIcon color="action" />
                                </Box>

                                {/* Toppings */}
                                <Box
                                    sx={{
                                        p: 3,
                                        border: "1px solid #e0e0e0",
                                        borderRadius: 1,
                                        mb: 2,
                                        backgroundColor: "#e3f2fd",
                                    }}
                                >
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
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
                                                    <Box sx={{ display: "flex" }}>
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
                                                    <Box sx={{ display: "flex" }}>
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
                                                    <Box sx={{ display: "flex" }}>
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
                                                    <Box sx={{ display: "flex" }}>
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
                                        <Switch checked={true} color="primary" size="small" />
                                    </Box>
                                </Box>
                            </Box>
                        </DialogContent>

                        <DialogActions sx={{ p: 3, justifyContent: "space-between" }}>
                            <Button
                                onClick={handleCloseUpdateStockModal}
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
                                onClick={handleSaveStockChanges}
                                variant="contained"
                                sx={{
                                    backgroundColor: "#003B5C",
                                    "&:hover": {
                                        backgroundColor: "#002A41",
                                    },
                                }}
                            >
                                Save Changes
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Edit Menu Modal */}
                    <Dialog
                        open={openEditMenu}
                        onClose={handleEditMenuClose}
                        fullWidth
                        maxWidth="md"
                        PaperProps={{
                            sx: {
                                borderRadius: 1,
                                m: 0,
                                position: "fixed",
                                right: 0,
                                top: 0,
                                height: "100%",
                                maxHeight: "100%",
                            },
                        }}
                    >
                        {selectedProduct.id && (
                            <>
                                <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="h5" fontWeight="bold">
                                        Edit Menu
                                    </Typography>
                                    <IconButton onClick={handleEditMenuClose}>
                                        <CloseIcon />
                                    </IconButton>
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
                                                color={editMenuStep === 1 ? "text.primary" : "text.secondary"}
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
                                                    backgroundColor: editMenuStep === 2 ? "#003B5C" : "#e0e0e0",
                                                    color: editMenuStep === 2 ? "white" : "text.secondary",
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
                                                color={editMenuStep === 2 ? "text.primary" : "text.secondary"}
                                            >
                                                Descriptions and Image
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Step 1: General Information */}
                                    {editMenuStep === 1 && (
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
                                                        defaultValue={selectedProduct.name}
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
                                                        defaultValue={selectedProduct.id}
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
                                                        defaultValue={selectedProduct.category}
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
                                                            defaultValue={selectedProduct.stockDetails.ready}
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
                                                            defaultValue={selectedProduct.stockDetails.outOfStock}
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
                                                        <Switch defaultChecked={!selectedProduct.available} color="primary" />
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
                                                                defaultChecked={selectedProduct.orderTypes.length === 5}
                                                                color="primary"
                                                                size="small"
                                                            />
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ display: "flex", gap: 1 }}>
                                                        <Button
                                                            variant={selectedProduct.orderTypes.includes("Dine In") ? "contained" : "outlined"}
                                                            sx={{
                                                                flex: 1,
                                                                py: 2,
                                                                borderRadius: 1,
                                                                backgroundColor: selectedProduct.orderTypes.includes("Dine In") ? "#003B5C" : "transparent",
                                                                "&:hover": {
                                                                    backgroundColor: selectedProduct.orderTypes.includes("Dine In")
                                                                        ? "#003B5C"
                                                                        : "rgba(0, 59, 92, 0.04)",
                                                                },
                                                            }}
                                                        >
                                                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                <RestaurantMenuIcon sx={{ mb: 1 }} />
                                                                <Typography variant="body2">Dine In</Typography>
                                                            </Box>
                                                        </Button>
                                                        <Button
                                                            variant={selectedProduct.orderTypes.includes("Pick Up") ? "contained" : "outlined"}
                                                            sx={{
                                                                flex: 1,
                                                                py: 2,
                                                                borderRadius: 1,
                                                                backgroundColor: selectedProduct.orderTypes.includes("Pick Up") ? "#003B5C" : "transparent",
                                                                "&:hover": {
                                                                    backgroundColor: selectedProduct.orderTypes.includes("Pick Up")
                                                                        ? "#003B5C"
                                                                        : "rgba(0, 59, 92, 0.04)",
                                                                },
                                                            }}
                                                        >
                                                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                <LocalMallIcon sx={{ mb: 1 }} />
                                                                <Typography variant="body2">Pick Up</Typography>
                                                            </Box>
                                                        </Button>
                                                        <Button
                                                            variant={selectedProduct.orderTypes.includes("Delivery") ? "contained" : "outlined"}
                                                            sx={{
                                                                flex: 1,
                                                                py: 2,
                                                                borderRadius: 1,
                                                                backgroundColor: selectedProduct.orderTypes.includes("Delivery")
                                                                    ? "#003B5C"
                                                                    : "transparent",
                                                                "&:hover": {
                                                                    backgroundColor: selectedProduct.orderTypes.includes("Delivery")
                                                                        ? "#003B5C"
                                                                        : "rgba(0, 59, 92, 0.04)",
                                                                },
                                                            }}
                                                        >
                                                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                <LocalShippingIcon sx={{ mb: 1 }} />
                                                                <Typography variant="body2">Delivery</Typography>
                                                            </Box>
                                                        </Button>
                                                        <Button
                                                            variant={selectedProduct.orderTypes.includes("Takeway") ? "contained" : "outlined"}
                                                            sx={{
                                                                flex: 1,
                                                                py: 2,
                                                                borderRadius: 1,
                                                                backgroundColor: selectedProduct.orderTypes.includes("Takeway") ? "#003B5C" : "transparent",
                                                                "&:hover": {
                                                                    backgroundColor: selectedProduct.orderTypes.includes("Takeway")
                                                                        ? "#003B5C"
                                                                        : "rgba(0, 59, 92, 0.04)",
                                                                },
                                                            }}
                                                        >
                                                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                <ShoppingBagIcon sx={{ mb: 1 }} />
                                                                <Typography variant="body2">Takeaway</Typography>
                                                            </Box>
                                                        </Button>
                                                        <Button
                                                            variant={selectedProduct.orderTypes.includes("Reservation") ? "contained" : "outlined"}
                                                            sx={{
                                                                flex: 1,
                                                                py: 2,
                                                                borderRadius: 1,
                                                                backgroundColor: selectedProduct.orderTypes.includes("Reservation")
                                                                    ? "#003B5C"
                                                                    : "transparent",
                                                                "&:hover": {
                                                                    backgroundColor: selectedProduct.orderTypes.includes("Reservation")
                                                                        ? "#003B5C"
                                                                        : "rgba(0, 59, 92, 0.04)",
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
                                                            defaultValue={selectedProduct.price.cogs}
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
                                                            defaultValue={selectedProduct.price.current}
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
                                                            Rs {selectedProduct.price.profit}
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
                                                                defaultChecked={selectedProduct.temperature.length > 0}
                                                                color="primary"
                                                                size="small"
                                                            />
                                                        </Box>
                                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                                            <Typography variant="body1">Size</Typography>
                                                            <Switch defaultChecked={selectedProduct.size.length > 0} color="primary" size="small" />
                                                        </Box>
                                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                                            <Typography variant="body1">Sweetness</Typography>
                                                            <Switch defaultChecked={false} color="primary" size="small" />
                                                        </Box>
                                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                                            <Typography variant="body1">Milk Options</Typography>
                                                            <Switch defaultChecked={false} color="primary" size="small" />
                                                        </Box>
                                                    </Box>

                                                    {/* Toppings */}
                                                    <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 1, p: 2, mb: 2 }}>
                                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                                            <Typography variant="body1" fontWeight="bold">
                                                                Toppings
                                                            </Typography>
                                                            <Switch defaultChecked={true} color="primary" size="small" />
                                                        </Box>

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

                                                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1, alignItems: "center" }}>
                                                                <TextField
                                                                    placeholder="e.g. Oreo"
                                                                    size="small"
                                                                    defaultValue="Oreo"
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
                                                                    <TextField placeholder="10" size="small" defaultValue="10" fullWidth />
                                                                </Box>
                                                                <TextField placeholder="0" size="small" defaultValue="0" sx={{ width: 80, mr: 1 }} />
                                                                <IconButton size="small" sx={{ width: 40 }} color="error">
                                                                    <CloseIcon fontSize="small" />
                                                                </IconButton>
                                                            </Box>

                                                            <Button variant="text" startIcon={<AddIcon />} sx={{ mt: 1 }}>
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
                                                            <Switch defaultChecked={true} color="primary" size="small" />
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    )}

                                    {/* Step 2: Descriptions and Image */}
                                    {editMenuStep === 2 && (
                                        <Box sx={{ px: 3, pb: 3 }}>
                                            <Typography variant="body1" sx={{ mb: 2 }}>
                                                Menu Image
                                            </Typography>
                                            <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
                                                {selectedProduct.images.map((image, index) => (
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
                                                            alt={`${selectedProduct.name} ${index + 1}`}
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
                                                    defaultValue={selectedProduct.description}
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
                                                    {selectedProduct.description.length} / 500
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
                                </DialogContent>

                                <DialogActions sx={{ p: 3, justifyContent: "space-between" }}>
                                    {editMenuStep === 1 ? (
                                        <>
                                            <Button
                                                onClick={handleEditMenuClose}
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
                                                onClick={handleEditMenuNextStep}
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
                                                onClick={handleEditMenuPreviousStep}
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
                                                onClick={handleSaveEditMenu}
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
                            </>
                        )}
                    </Dialog>

                    {/* Adjust Price Modal */}
                    <Dialog
                        open={openAdjustPrice}
                        onClose={handleAdjustPriceClose}
                        fullWidth
                        maxWidth="sm"
                        PaperProps={{
                            sx: {
                                borderRadius: 1,
                                m: 0,
                                position: "fixed",
                                right: 0,
                                top: 0,
                                height: "100%",
                                maxHeight: "100%",
                            },
                        }}
                    >
                        {selectedProduct.id && (
                            <>
                                <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="h5" fontWeight="bold">
                                        Adjust Price
                                    </Typography>
                                    <IconButton onClick={handleAdjustPriceClose}>
                                        <CloseIcon />
                                    </IconButton>
                                </Box>

                                <DialogContent sx={{ p: 0 }}>
                                    <Box sx={{ px: 3, pb: 3 }}>
                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            Valid From
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            placeholder="Select date"
                                            variant="outlined"
                                            size="small"
                                            type="date"
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton edge="end">
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{ mb: 3 }}
                                        />

                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            Valid to
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            placeholder="Select date"
                                            variant="outlined"
                                            size="small"
                                            type="date"
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton edge="end">
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{ mb: 3 }}
                                        />

                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            Cost Of Goods Sold (COGS)
                                        </Typography>
                                        <Box sx={{ display: "flex", mb: 3 }}>
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
                                                defaultValue={selectedProduct.price.cogs}
                                                variant="outlined"
                                                size="small"
                                                type="number"
                                                inputProps={{ step: "0.01" }}
                                            />
                                        </Box>

                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            New Base Price Selling
                                        </Typography>
                                        <Box sx={{ display: "flex", mb: 3 }}>
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
                                                defaultValue={selectedProduct.price.current}
                                                variant="outlined"
                                                size="small"
                                                type="number"
                                                inputProps={{ step: "0.01" }}
                                            />
                                        </Box>

                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                                            <Typography variant="body1">Have different Price</Typography>
                                            <Switch defaultChecked={false} color="primary" />
                                        </Box>

                                        <Typography variant="body1" sx={{ mb: 2 }}>
                                            Select Order Type
                                        </Typography>
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                                            {selectedProduct.orderTypes.map((type) => (
                                                <Button
                                                    key={type}
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{
                                                        borderRadius: 1,
                                                        borderColor: "#e0e0e0",
                                                        color: "text.primary",
                                                        textTransform: "none",
                                                    }}
                                                    startIcon={<CheckIcon fontSize="small" />}
                                                >
                                                    {type}
                                                </Button>
                                            ))}
                                        </Box>

                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            Profit Estimate
                                        </Typography>
                                        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                                            <Typography variant="h6" fontWeight="bold">
                                                Rs {selectedProduct.price.profit}
                                            </Typography>
                                        </Box>

                                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                                            Adjustment History
                                        </Typography>

                                        <Box sx={{ mb: 2 }}>
                                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                                    <Box
                                                        sx={{
                                                            width: 24,
                                                            height: 24,
                                                            borderRadius: "50%",
                                                            backgroundColor: "#003B5C",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            mr: 2,
                                                        }}
                                                    >
                                                        <CheckIcon sx={{ color: "white", fontSize: 16 }} />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            Rs 5.00 from Rs 4.00
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Monday, 3 April 2023, 10:58 AM
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ textAlign: "right" }}>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        Valid from 10 Aug 23
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Valid to 10 Aug 24
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>

                                        <Box sx={{ mb: 2 }}>
                                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                                    <Box
                                                        sx={{
                                                            width: 24,
                                                            height: 24,
                                                            borderRadius: "50%",
                                                            backgroundColor: "#003B5C",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            mr: 2,
                                                        }}
                                                    >
                                                        <CheckIcon sx={{ color: "white", fontSize: 16 }} />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            Rs 4.00 from Rs 3.00
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Monday, 3 April 2023, 10:58 AM
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ textAlign: "right" }}>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        Valid from 10 Aug 22
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Valid to 10 Aug 23
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                </DialogContent>

                                <DialogActions sx={{ p: 3, justifyContent: "space-between" }}>
                                    <Button
                                        onClick={handleAdjustPriceClose}
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
                                        onClick={handleSaveAdjustPrice}
                                        variant="contained"
                                        sx={{
                                            backgroundColor: "#003B5C",
                                            "&:hover": {
                                                backgroundColor: "#002A41",
                                            },
                                        }}
                                    >
                                        Save Changes
                                    </Button>
                                </DialogActions>
                            </>
                        )}
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
                            <TextField
                                fullWidth
                                placeholder="Type CONFIRM DELETE"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                variant="outlined"
                                size="small"
                            />
                        </DialogContent>
                        <DialogActions sx={{ p: 3, justifyContent: "space-between" }}>
                            <Button onClick={handleDeleteConfirmClose} color="primary">
                                Cancel
                            </Button>
                            <Button onClick={handleDeleteProduct} color="error" disabled={deleteConfirmText !== "CONFIRM DELETE"}>
                                Delete
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Delete Success Snackbar */}
                    <Snackbar
                        open={showDeleteSuccess}
                        autoHideDuration={3000}
                        onClose={handleDeleteSuccessClose}
                        anchorOrigin={{ vertical: "top", horizontal: "center" }}
                    >
                        <Alert
                            severity="success"
                            onClose={handleDeleteSuccessClose}
                            icon={<CheckCircleIcon />}
                            sx={{
                                width: "100%",
                                backgroundColor: "#e8f5e9",
                                color: "#2e7d32",
                                "& .MuiAlert-icon": {
                                    color: "#2e7d32",
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
    )
}
