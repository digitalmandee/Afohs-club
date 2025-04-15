"use client";

import { useState } from "react";
import SideNav from "../../Components/SideBar/SideNav";
import {
    Typography,
    Button,
    TextField,
    IconButton,
    Dialog,
    DialogContent,
    Card,
    CardContent,
    Chip,
    Avatar,
    Box,
    Grid,
    InputAdornment,
    Divider,
    Collapse,
} from "@mui/material";
import {
    Search as SearchIcon,
    FilterAlt as FilterIcon,
    Close as CloseIcon,
    Home as HomeIcon,
    Restaurant as RestaurantIcon,
    LocalDining as DiningIcon,
    TwoWheeler as DeliveryIcon,
    TakeoutDining as TakeoutIcon,
    EventSeat as ReservationIcon,
    CheckCircle as CheckCircleIcon,
    Receipt as ReceiptIcon,
    Print as PrintIcon,
    Circle as CircleIcon,
    Person as PersonIcon,
    Star as StarIcon,
    Diamond as DiamondIcon,
    ArrowDropDown as ArrowDropDownIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon,
    ArrowForward as ArrowForwardIcon,
    Backspace as BackspaceIcon,
    Check as CheckIcon,
} from "@mui/icons-material";
import "bootstrap/dist/css/bootstrap.min.css";
import RoomServiceIcon from "@mui/icons-material/RoomService";

// Custom CSS
const styles = {
    root: {
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
    },
    tabButton: {
        borderRadius: "20px",
        margin: "0 5px",
        textTransform: "none",
        fontWeight: "normal",
        padding: "6px 16px",
        border: "1px solid #00274D",
        color: "#00274D",
    },
    activeTabButton: {
        backgroundColor: "#0a3d62",
        color: "white",
        borderRadius: "20px",
        margin: "0 5px",
        textTransform: "none",
        fontWeight: "normal",
        padding: "6px 16px",
    },
    revenueCard: {
        backgroundColor: "#0a3d62",
        color: "white",
        borderRadius: "8px",
        padding: "15px",
    },
    transactionCard: {
        backgroundColor: "#1e4258",
        color: "white",
        borderRadius: "8px",
        padding: "15px",
    },
    orderCard: {
        marginBottom: "10px",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        cursor: "pointer",
    },
    tableAvatar: {
        backgroundColor: "#0a3d62",
        color: "white",
        width: "36px",
        height: "36px",
        fontSize: "14px",
    },
    deliveryAvatar: {
        backgroundColor: "#3498db",
        color: "white",
        width: "36px",
        height: "36px",
        fontSize: "14px",
    },
    pickupAvatar: {
        backgroundColor: "#27ae60",
        color: "white",
        width: "36px",
        height: "36px",
        fontSize: "14px",
    },
    statusChip: {
        borderRadius: "4px",
        height: "24px",
        fontSize: "12px",
    },
    filterButton: {
        backgroundColor: "white",
        color: "#333",
        border: "1px solid #ddd",
        boxShadow: "none",
        textTransform: "none",
    },
    filterChip: {
        backgroundColor: "#e3f2fd",
        color: "#0a3d62",
        margin: "0 4px",
        borderRadius: "16px",
    },
    activeFilterChip: {
        backgroundColor: "#0a3d62",
        color: "white",
        margin: "0 4px",
        borderRadius: "16px",
    },
    modalTitle: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        borderBottom: "1px solid #eee",
    },
    modalFooter: {
        display: "flex",
        justifyContent: "flex-end",
        padding: "16px 24px",
        borderTop: "1px solid #eee",
    },
    applyButton: {
        backgroundColor: "#0a3d62",
        color: "white",
        textTransform: "none",
    },
    resetButton: {
        backgroundColor: "white",
        color: "#333",
        border: "1px solid #ddd",
        marginRight: "8px",
        textTransform: "none",
    },
    cancelButton: {
        backgroundColor: "white",
        color: "#333",
        border: "1px solid #ddd",
        textTransform: "none",
    },
    orderDetailHeader: {
        display: "flex",
        alignItems: "center",
        marginBottom: "16px",
    },
    orderDetailAvatar: {
        backgroundColor: "#0a3d62",
        color: "white",
        width: "40px",
        height: "40px",
    },
    orderItemImage: {
        width: "50px",
        height: "50px",
        borderRadius: "8px",
        objectFit: "cover",
    },
    trackOrderStep: {
        display: "flex",
        marginBottom: "16px",
    },
    trackOrderStepIcon: {
        color: "#0a3d62",
        marginRight: "16px",
    },
    trackOrderStepContent: {
        flex: 1,
    },
    trackOrderStepTitle: {
        fontWeight: "bold",
        marginBottom: "4px",
    },
    trackOrderStepTime: {
        color: "#666",
        fontSize: "12px",
    },
    printReceiptButton: {
        backgroundColor: "#0a3d62",
        color: "white",
        textTransform: "none",
    },
    shareReceiptButton: {
        backgroundColor: "white",
        color: "#333",
        border: "1px solid #ddd",
        textTransform: "none",
    },
    closeButton: {
        color: "#333",
    },
    orderIdChip: {
        backgroundColor: "#f0f0f0",
        borderRadius: "4px",
        padding: "4px 8px",
        fontSize: "14px",
    },
    orderInfoGrid: {
        marginBottom: "16px",
    },
    orderInfoLabel: {
        color: "#666",
        fontSize: "14px",
    },
    orderInfoValue: {
        fontWeight: "bold",
        fontSize: "14px",
    },
    orderItemVariant: {
        color: "#666",
        fontSize: "12px",
        marginTop: "4px",
    },
    orderItemPrice: {
        textAlign: "right",
        fontWeight: "bold",
    },
    orderItemQuantity: {
        color: "#666",
        fontSize: "14px",
        textAlign: "right",
    },
    orderSummaryRow: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "8px",
    },
    orderTotal: {
        fontWeight: "bold",
        fontSize: "16px",
    },
    paymentInfo: {
        display: "flex",
        justifyContent: "space-between",
        padding: "16px 0",
        borderTop: "1px solid #eee",
        borderBottom: "1px solid #eee",
        marginBottom: "16px",
    },
    paymentMethod: {
        display: "flex",
        alignItems: "center",
    },
    paymentIcon: {
        marginRight: "8px",
        color: "#0a3d62",
    },
    trackOrderImage: {
        width: "100%",
        height: "120px",
        objectFit: "cover",
        borderRadius: "8px",
        marginTop: "8px",
    },
    productSoldCard: {
        backgroundColor: "#1e4258",
        color: "white",
        borderRadius: "8px",
        padding: "15px",
        height: "100%",
    },
    totalOrderCard: {
        backgroundColor: "#1e4258",
        color: "white",
        borderRadius: "8px",
        padding: "15px",
        height: "100%",
    },
    filterSection: {
        marginBottom: "16px",
        border: "1px solid #e0e0e0",
        borderRadius: "4px",
    },
    filterHeader: {
        padding: "12px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        cursor: "pointer",
    },
    filterContent: {
        padding: "0 16px 16px 16px",
    },
    filterChipNew: {
        margin: "4px",
        borderRadius: "16px",
        backgroundColor: "#e3f2fd",
        color: "#0a3d62",
        border: "none",
    },
    activeFilterChipNew: {
        margin: "4px",
        borderRadius: "16px",
        backgroundColor: "#0a3d62",
        color: "white",
        border: "none",
    },
    numpadButton: {
        width: "100%",
        height: "60px",
        fontSize: "24px",
        borderRadius: "4px",
        border: "1px solid #e0e0e0",
        backgroundColor: "white",
        color: "#333",
        "&:hover": {
            backgroundColor: "#f5f5f5",
        },
    },
    quickAmountButton: {
        borderRadius: "4px",
        border: "1px solid #e0e0e0",
        backgroundColor: "white",
        color: "#333",
        padding: "8px 16px",
        textTransform: "none",
        "&:hover": {
            backgroundColor: "#f5f5f5",
        },
    },
    payNowButton: {
        backgroundColor: "#0a3d62",
        color: "white",
        borderRadius: "4px",
        padding: "12px 24px",
        textTransform: "none",
        "&:hover": {
            backgroundColor: "#083352",
        },
    },
    successIcon: {
        backgroundColor: "#4caf50",
        color: "white",
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: "0 auto 24px auto",
    },
};

// Sample data
const orders = [
    {
        id: 1,
        customer: "Qafi Latif",
        tableNumber: "T2",
        items: 4,
        status: "Ready to serve",
        statusCode: "ready",
        amount: 47.0,
        orderNumber: "001",
        isVIP: true,
        type: "dine-in",
    },
    {
        id: 2,
        customer: "Hamid Indra",
        tableNumber: "T3",
        items: 4,
        status: "Order Done",
        statusCode: "done",
        amount: 47.0,
        orderNumber: "001",
        isVIP: false,
        type: "dine-in",
    },
    {
        id: 3,
        customer: "Miles Esther",
        tableNumber: "T4",
        items: 4,
        status: "Order Done",
        statusCode: "done",
        amount: 47.0,
        orderNumber: "001",
        isVIP: false,
        type: "dine-in",
    },
    {
        id: 4,
        customer: "Miles Esther",
        tableNumber: "DE",
        items: 4,
        status: "Order Cancelled",
        statusCode: "cancelled",
        amount: 10.0,
        orderNumber: "001",
        isVIP: false,
        type: "delivery",
    },
];

const orderDetail = {
    id: "#123",
    customer: "Qafi Latif",
    tableNumber: "T14",
    date: "12. Jan 2024",
    cashier: "Tynisha Obey",
    cashierAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    workingTime: "15.00 - 22.00 PM",
    isVIP: true,
    items: [
        {
            name: "Cappucino",
            category: "Coffee & Beverage",
            variant: "Ice, Large, Normal sugar",
            quantity: 1,
            price: 5.0,
            image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        },
        {
            name: "Buttermilk Waffle",
            category: "Food & Snack",
            variant: "Choco",
            quantity: 2,
            price: 5.0,
            image: "https://images.unsplash.com/photo-1562376552-0d160a2f35b6?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        },
        {
            name: "At Home Classic",
            category: "Imaji at Home",
            variant: "250 gr",
            quantity: 1,
            price: 4.0,
            image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        },
    ],
    subtotal: 19.0,
    discount: 0,
    tax: 2.28,
    total: 16.72,
    payment: {
        method: "Cash",
        amount: 20.0,
        change: 3.28,
    },
};

const paymentOrderDetail = {
    id: "ORDER001",
    customer: "Ravi Kamil",
    tableNumber: "T2",
    date: "Wed, May 27, 2020 • 9:27:53 AM",
    cashier: "Tynisha Obey",
    workingTime: "15.00 - 22.00 PM",
    items: [
        { name: "Cappuccino", quantity: 2, price: 5.0, total: 10.0 },
        { name: "Soda Beverage", quantity: 3, price: 5.0, total: 15.0 },
        { name: "Chocolate Croissant", quantity: 2, price: 5.0, total: 10.0 },
        { name: "French Toast Sugar", quantity: 3, price: 4.0, total: 12.0 },
    ],
    subtotal: 47.0,
    discount: 0,
    tax: 5.64,
    total: 52.64,
    payment: {
        method: "Cash",
        amount: 60.0,
        change: 7.36,
    },
};

const trackingSteps = [
    {
        title: "Successfully Delivered",
        time: "Thursday, 4 April 2024, 08:17 AM",
        completed: true,
        hasProof: true,
        proofImage:
            "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-O8EAr4Sr4VdJp28I2jkRandb7W6KeU.png",
        proofText: "Photo Proof of Delivery",
        proofAddedBy: "Added at 12:23 PM by Jhon Andi (Courier)",
    },
    {
        title: "Processed at Delivered Center",
        time: "Thursday, 4 April 2024, 03:07 AM",
        completed: true,
    },
    {
        title: "Arrived at Sorting Center",
        time: "Monday, 4 April 2024, 22:45 PM",
        completed: true,
    },
    {
        title: "Shipment En Route",
        time: "Monday, 4 April 2024, 22:24 PM",
        completed: true,
    },
    {
        title: "Arrived At Sorting Center",
        time: "Monday, 4 April 2024, 15:13 PM",
        completed: true,
    },
    {
        title: "Shipment En Route",
        time: "Monday, 3 April 2024, 12:14 PM",
        completed: true,
    },
];

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const TransactionDashboard = () => {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("all");
    const [openFilterModal, setOpenFilterModal] = useState(false);
    const [openOrderDetailModal, setOpenOrderDetailModal] = useState(false);
    const [openTrackOrderModal, setOpenTrackOrderModal] = useState(false);
    const [openPaymentModal, setOpenPaymentModal] = useState(false);
    const [openPaymentSuccessModal, setOpenPaymentSuccessModal] =
        useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filters, setFilters] = useState({
        sort: "asc",
        orderType: "all",
        memberStatus: "all",
        orderStatus: "all",
    });

    // Filter sections expand/collapse state
    const [expandedSections, setExpandedSections] = useState({
        sorting: true,
        orderType: true,
        memberStatus: true,
        orderStatus: true,
    });

    // Payment state
    const [inputAmount, setInputAmount] = useState("110.00");
    const [customerChanges, setCustomerChanges] = useState("0.00");

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleOpenFilterModal = () => {
        setOpenFilterModal(true);
    };

    const handleCloseFilterModal = () => {
        setOpenFilterModal(false);
    };

    const handleOpenOrderDetail = (order) => {
        setSelectedOrder(order);
        setOpenOrderDetailModal(true);
    };

    const handleCloseOrderDetail = () => {
        setOpenOrderDetailModal(false);
    };

    const handleOpenTrackOrder = () => {
        setOpenTrackOrderModal(true);
        setOpenOrderDetailModal(false);
    };

    const handleCloseTrackOrder = () => {
        setOpenTrackOrderModal(false);
    };

    const handleOpenPayment = (order) => {
        setSelectedOrder(order);
        setOpenPaymentModal(true);
        setOpenOrderDetailModal(false);
    };

    const handleClosePayment = () => {
        setOpenPaymentModal(false);
    };

    const handlePayNow = () => {
        setOpenPaymentModal(false);
        setOpenPaymentSuccessModal(true);
    };

    const handleClosePaymentSuccess = () => {
        setOpenPaymentSuccessModal(false);
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleResetFilters = () => {
        setFilters({
            sort: "asc",
            orderType: "all",
            memberStatus: "all",
            orderStatus: "all",
        });
    };

    const handleApplyFilters = () => {
        setOpenFilterModal(false);
        // Here you would typically apply the filters to your data
        console.log("Applied filters:", filters);
    };

    const toggleSection = (section) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const handleQuickAmountClick = (amount) => {
        setInputAmount(amount);
        // Calculate customer changes
        const total = paymentOrderDetail.total;
        setCustomerChanges((amount - total).toFixed(2));
    };

    const handleNumberClick = (number) => {
        let newAmount;
        if (inputAmount === "110.00") {
            newAmount = number;
        } else {
            newAmount = inputAmount + number;
        }
        setInputAmount(newAmount);

        // Calculate customer changes
        const total = paymentOrderDetail.total;
        setCustomerChanges((Number.parseFloat(newAmount) - total).toFixed(2));
    };

    const handleDeleteClick = () => {
        if (inputAmount.length > 1) {
            const newAmount = inputAmount.slice(0, -1);
            setInputAmount(newAmount);

            // Calculate customer changes
            const total = paymentOrderDetail.total;
            setCustomerChanges(
                (Number.parseFloat(newAmount) - total).toFixed(2)
            );
        } else {
            setInputAmount("0");
            setCustomerChanges((0 - paymentOrderDetail.total).toFixed(2));
        }
    };

    const handleDecimalClick = () => {
        if (!inputAmount.includes(".")) {
            const newAmount = inputAmount + ".";
            setInputAmount(newAmount);
        }
    };

    const getStatusChipColor = (status) => {
        switch (status) {
            case "ready":
                return "#e3f2fd";
            case "done":
                return "#e8f5e9";
            case "cancelled":
                return "#ffebee";
            default:
                return "#e0e0e0";
        }
    };

    const getStatusChipTextColor = (status) => {
        switch (status) {
            case "ready":
                return "#0288d1";
            case "done":
                return "#388e3c";
            case "cancelled":
                return "#d32f2f";
            default:
                return "#616161";
        }
    };

    const getAvatarStyle = (type) => {
        switch (type) {
            case "delivery":
                return styles.deliveryAvatar;
            case "pickup":
                return styles.pickupAvatar;
            default:
                return styles.tableAvatar;
        }
    };

    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open
                        ? `${drawerWidthOpen}px`
                        : `${drawerWidthClosed}px`,
                    transition: "margin-left 0.3s ease-in-out",
                    marginTop: "5rem",
                }}
            >
                <div style={styles.root}>
                    <Box p={2}>
                        {/* Tab Navigation */}
                        <Box
                            display="flex"
                            mb={2}
                            overflow="auto"
                            pb={1}
                            style={{
                                background: "#f0f0f0",
                                padding: "20px",
                                borderRadius: "10px",
                            }}
                        >
                            <Button
                                style={
                                    activeTab === "all"
                                        ? styles.activeTabButton
                                        : styles.tabButton
                                }
                                onClick={() => handleTabChange("all")}
                            >
                                All transactions
                            </Button>
                            <Button
                                style={
                                    activeTab === "dine-in"
                                        ? styles.activeTabButton
                                        : styles.tabButton
                                }
                                onClick={() => handleTabChange("dine-in")}
                            >
                                Dine In
                            </Button>
                            <Button
                                style={
                                    activeTab === "pickup"
                                        ? styles.activeTabButton
                                        : styles.tabButton
                                }
                                onClick={() => handleTabChange("pickup")}
                            >
                                Pick Up
                            </Button>
                            <Button
                                style={
                                    activeTab === "delivery"
                                        ? styles.activeTabButton
                                        : styles.tabButton
                                }
                                onClick={() => handleTabChange("delivery")}
                            >
                                Delivery
                            </Button>
                            <Button
                                style={
                                    activeTab === "takeaway"
                                        ? styles.activeTabButton
                                        : styles.tabButton
                                }
                                onClick={() => handleTabChange("takeaway")}
                            >
                                Takeaway
                            </Button>
                            <Button
                                style={
                                    activeTab === "reservation"
                                        ? styles.activeTabButton
                                        : styles.tabButton
                                }
                                onClick={() => handleTabChange("reservation")}
                            >
                                Reservation
                            </Button>
                        </Box>
                        <Box
                            p={2}
                            style={{
                                background: "#fbfbfb",
                                padding: "20px",
                                borderRadius: "10px",
                            }}
                        >
                            {/* Header */}
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={2}
                            >
                                <Typography
                                    variant="h4"
                                    fontWeight="bold"
                                    sx={{
                                        fontWeight: 500,
                                        fontSize: "36px",
                                    }}
                                >
                                    240{" "}
                                    <span
                                        style={{
                                            fontSize: "16px",
                                            fontWeight: "400",
                                            color: "#7F7F7F",
                                        }}
                                    >
                                        Transactions in your Shift
                                    </span>
                                </Typography>
                                <Box display="flex" gap={1}>
                                    <TextField
                                        placeholder="Search"
                                        variant="outlined"
                                        size="small"
                                        sx={{ width: "300px" }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <Button
                                        variant="contained"
                                        startIcon={<FilterIcon />}
                                        style={styles.filterButton}
                                        onClick={handleOpenFilterModal}
                                    >
                                        Filter
                                    </Button>
                                </Box>
                            </Box>

                            {/* Main Content */}
                            <Grid container spacing={2}>
                                {/* Right Column - Orders List */}
                                <Grid item xs={12}>
                                    {orders.map((order) => (
                                        <Card
                                            style={{
                                                ...styles.orderCard,
                                                borderRadius: 0,
                                                boxShadow: "none",
                                                border: "1px solid #E3E3E3",
                                            }}
                                            key={order.id}
                                            onClick={() =>
                                                handleOpenOrderDetail(order)
                                            }
                                        >
                                            <CardContent>
                                                <Box
                                                    display="flex"
                                                    alignItems="center"
                                                >
                                                    <Avatar
                                                        style={getAvatarStyle(
                                                            order.type
                                                        )}
                                                    >
                                                        {order.tableNumber}
                                                    </Avatar>

                                                    {/* Waiter Icon */}
                                                    <Avatar
                                                        style={{
                                                            marginLeft: 8,
                                                            backgroundColor:
                                                                "#E3E3E3",
                                                            width: 32,
                                                            height: 32,
                                                        }}
                                                    >
                                                        <RoomServiceIcon
                                                            style={{
                                                                color: "#000",
                                                                fontSize: 20,
                                                            }}
                                                        />
                                                    </Avatar>
                                                    <Box ml={2} flex={1}>
                                                        <Box
                                                            display="flex"
                                                            alignItems="center"
                                                        >
                                                            <Typography
                                                                variant="subtitle1"
                                                                sx={{
                                                                    fontWeight: 500,
                                                                    fontSize:
                                                                        "18px",
                                                                }}
                                                            >
                                                                {order.customer}
                                                            </Typography>
                                                            {order.isVIP && (
                                                                <Box
                                                                    component="span"
                                                                    ml={1}
                                                                    display="inline-block"
                                                                    width={16}
                                                                    height={16}
                                                                    borderRadius="50%"
                                                                    bgcolor="#ffc107"
                                                                />
                                                            )}
                                                        </Box>
                                                        <Typography
                                                            variant="body2"
                                                            color="#7F7F7F"
                                                            sx={{
                                                                fontWeight: 400,
                                                                fontSize:
                                                                    "14px",
                                                            }}
                                                        >
                                                            {order.items} Items
                                                        </Typography>
                                                    </Box>
                                                    <Box textAlign="right">
                                                        <Typography
                                                            variant="subtitle1"
                                                            fontWeight="bold"
                                                            display="flex"
                                                            gap="5px"
                                                            alignItems="center"
                                                            sx={{
                                                                fontWeight: 500,
                                                                fontSize:
                                                                    "20px",
                                                            }}
                                                        >
                                                            <Typography
                                                                color="#7F7F7F"
                                                                sx={{
                                                                    fontWeight: 400,
                                                                    fontSize:
                                                                        "16px",
                                                                }}
                                                            >
                                                                Rs{" "}
                                                            </Typography>
                                                            {order.amount.toFixed(
                                                                2
                                                            )}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Box
                                                    display="flex"
                                                    alignItems="center"
                                                    mt={1}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ mr: 1 }}
                                                    >
                                                        #{order.orderNumber}
                                                    </Typography>
                                                    <Chip
                                                        label={order.status}
                                                        size="small"
                                                        style={{
                                                            ...styles.statusChip,
                                                            backgroundColor:
                                                                getStatusChipColor(
                                                                    order.statusCode
                                                                ),
                                                            color: getStatusChipTextColor(
                                                                order.statusCode
                                                            ),
                                                        }}
                                                    />
                                                </Box>
                                                <Box
                                                    display="flex"
                                                    justifyContent="flex-end"
                                                    mt={1}
                                                    gap={1}
                                                >
                                                    <Button
                                                        size="small"
                                                        startIcon={
                                                            <PrintIcon />
                                                        }
                                                        variant="outlined"
                                                        sx={{
                                                            borderRadius: "4px",
                                                            fontSize: "12px",
                                                            textTransform:
                                                                "none",
                                                            border: "1px solid #0a3d62",
                                                            color: "#0a3d62",
                                                        }}
                                                    >
                                                        Print Receipt
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenPayment(
                                                                order
                                                            );
                                                        }}
                                                        sx={{
                                                            borderRadius: "4px",
                                                            fontSize: "12px",
                                                            textTransform:
                                                                "none",
                                                            backgroundColor:
                                                                "#0a3d62",
                                                            color: "white",
                                                        }}
                                                    >
                                                        Payment Now
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>

                    {/* Filter Modal */}
                    <Dialog
                        open={openFilterModal}
                        onClose={handleCloseFilterModal}
                        fullWidth
                        maxWidth="sm"
                        PaperProps={{
                            style: {
                                position: "fixed",
                                top: 0,
                                right: 0,
                                margin: 0,
                                height: "100vh",
                                maxHeight: "100vh",
                                overflow: "auto",
                                borderRadius: 0,
                            },
                        }}
                    >
                        <Box sx={{ p: 3 }}>
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={3}
                            >
                                <Typography variant="h6" fontWeight="bold">
                                    Menu Filter
                                </Typography>
                                <IconButton
                                    onClick={handleCloseFilterModal}
                                    edge="end"
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Box>

                            {/* Sorting Section */}
                            <Box className={styles.filterSection}>
                                <Box
                                    className={styles.filterHeader}
                                    onClick={() => toggleSection("sorting")}
                                >
                                    <Typography variant="subtitle1">
                                        Sorting
                                    </Typography>
                                    <KeyboardArrowDownIcon
                                        sx={{
                                            transform: expandedSections.sorting
                                                ? "rotate(180deg)"
                                                : "rotate(0deg)",
                                            transition: "transform 0.3s",
                                        }}
                                    />
                                </Box>
                                <Collapse in={expandedSections.sorting}>
                                    <Box className={styles.filterContent}>
                                        <Typography variant="body2" mb={1}>
                                            By Order Id
                                        </Typography>
                                        <Box display="flex" gap={1}>
                                            <Button
                                                variant="contained"
                                                onClick={() =>
                                                    handleFilterChange(
                                                        "sort",
                                                        "asc"
                                                    )
                                                }
                                                sx={{
                                                    backgroundColor:
                                                        filters.sort === "asc"
                                                            ? "#0a3d62"
                                                            : "#e3f2fd",
                                                    color:
                                                        filters.sort === "asc"
                                                            ? "white"
                                                            : "#0a3d62",
                                                    "&:hover": {
                                                        backgroundColor:
                                                            filters.sort ===
                                                            "asc"
                                                                ? "#0a3d62"
                                                                : "#d0e8fc",
                                                    },
                                                }}
                                                startIcon={
                                                    filters.sort === "asc" ? (
                                                        <CheckIcon fontSize="small" />
                                                    ) : null
                                                }
                                            >
                                                Ascending
                                            </Button>
                                            <Button
                                                variant="contained"
                                                onClick={() =>
                                                    handleFilterChange(
                                                        "sort",
                                                        "desc"
                                                    )
                                                }
                                                sx={{
                                                    backgroundColor:
                                                        filters.sort === "desc"
                                                            ? "#0a3d62"
                                                            : "#e3f2fd",
                                                    color:
                                                        filters.sort === "desc"
                                                            ? "white"
                                                            : "#0a3d62",
                                                    "&:hover": {
                                                        backgroundColor:
                                                            filters.sort ===
                                                            "desc"
                                                                ? "#0a3d62"
                                                                : "#d0e8fc",
                                                    },
                                                }}
                                                startIcon={
                                                    filters.sort === "desc" ? (
                                                        <CheckIcon fontSize="small" />
                                                    ) : null
                                                }
                                            >
                                                Descending
                                            </Button>
                                        </Box>
                                    </Box>
                                </Collapse>
                            </Box>

                            {/* Order Type Section */}
                            <Box className={styles.filterSection} mt={2}>
                                <Box
                                    className={styles.filterHeader}
                                    onClick={() => toggleSection("orderType")}
                                >
                                    <Typography variant="subtitle1">
                                        Order Type
                                    </Typography>
                                    <KeyboardArrowDownIcon
                                        sx={{
                                            transform:
                                                expandedSections.orderType
                                                    ? "rotate(180deg)"
                                                    : "rotate(0deg)",
                                            transition: "transform 0.3s",
                                        }}
                                    />
                                </Box>
                                <Collapse in={expandedSections.orderType}>
                                    <Box className={styles.filterContent}>
                                        <Box
                                            display="flex"
                                            flexWrap="wrap"
                                            gap={1}
                                        >
                                            <Chip
                                                label="All Status"
                                                onClick={() =>
                                                    handleFilterChange(
                                                        "orderType",
                                                        "all"
                                                    )
                                                }
                                                sx={{
                                                    backgroundColor:
                                                        filters.orderType ===
                                                        "all"
                                                            ? "#0a3d62"
                                                            : "#e3f2fd",
                                                    color:
                                                        filters.orderType ===
                                                        "all"
                                                            ? "white"
                                                            : "#0a3d62",
                                                    fontWeight: 500,
                                                }}
                                                icon={
                                                    filters.orderType ===
                                                    "all" ? (
                                                        <CheckIcon
                                                            style={{
                                                                color: "white",
                                                            }}
                                                        />
                                                    ) : null
                                                }
                                            />
                                            <Chip
                                                label="Dine In"
                                                onClick={() =>
                                                    handleFilterChange(
                                                        "orderType",
                                                        "dine-in"
                                                    )
                                                }
                                                sx={{
                                                    backgroundColor:
                                                        filters.orderType ===
                                                        "dine-in"
                                                            ? "#0a3d62"
                                                            : "#e3f2fd",
                                                    color:
                                                        filters.orderType ===
                                                        "dine-in"
                                                            ? "white"
                                                            : "#0a3d62",
                                                    fontWeight: 500,
                                                }}
                                                icon={
                                                    <DiningIcon
                                                        style={{
                                                            color:
                                                                filters.orderType ===
                                                                "dine-in"
                                                                    ? "white"
                                                                    : "#0a3d62",
                                                        }}
                                                    />
                                                }
                                            />
                                            <Chip
                                                label="Pick Up"
                                                onClick={() =>
                                                    handleFilterChange(
                                                        "orderType",
                                                        "pickup"
                                                    )
                                                }
                                                sx={{
                                                    backgroundColor:
                                                        filters.orderType ===
                                                        "pickup"
                                                            ? "#0a3d62"
                                                            : "#e3f2fd",
                                                    color:
                                                        filters.orderType ===
                                                        "pickup"
                                                            ? "white"
                                                            : "#0a3d62",
                                                    fontWeight: 500,
                                                }}
                                                icon={
                                                    <TakeoutIcon
                                                        style={{
                                                            color:
                                                                filters.orderType ===
                                                                "pickup"
                                                                    ? "white"
                                                                    : "#0a3d62",
                                                        }}
                                                    />
                                                }
                                            />
                                            <Chip
                                                label="Delivery"
                                                onClick={() =>
                                                    handleFilterChange(
                                                        "orderType",
                                                        "delivery"
                                                    )
                                                }
                                                sx={{
                                                    backgroundColor:
                                                        filters.orderType ===
                                                        "delivery"
                                                            ? "#0a3d62"
                                                            : "#e3f2fd",
                                                    color:
                                                        filters.orderType ===
                                                        "delivery"
                                                            ? "white"
                                                            : "#0a3d62",
                                                    fontWeight: 500,
                                                }}
                                                icon={
                                                    <DeliveryIcon
                                                        style={{
                                                            color:
                                                                filters.orderType ===
                                                                "delivery"
                                                                    ? "white"
                                                                    : "#0a3d62",
                                                        }}
                                                    />
                                                }
                                            />
                                            <Chip
                                                label="Takeaway"
                                                onClick={() =>
                                                    handleFilterChange(
                                                        "orderType",
                                                        "takeaway"
                                                    )
                                                }
                                                sx={{
                                                    backgroundColor:
                                                        filters.orderType ===
                                                        "takeaway"
                                                            ? "#0a3d62"
                                                            : "#e3f2fd",
                                                    color:
                                                        filters.orderType ===
                                                        "takeaway"
                                                            ? "white"
                                                            : "#0a3d62",
                                                    fontWeight: 500,
                                                }}
                                                icon={
                                                    <TakeoutIcon
                                                        style={{
                                                            color:
                                                                filters.orderType ===
                                                                "takeaway"
                                                                    ? "white"
                                                                    : "#0a3d62",
                                                        }}
                                                    />
                                                }
                                            />
                                            <Chip
                                                label="Reservation"
                                                onClick={() =>
                                                    handleFilterChange(
                                                        "orderType",
                                                        "reservation"
                                                    )
                                                }
                                                sx={{
                                                    backgroundColor:
                                                        filters.orderType ===
                                                        "reservation"
                                                            ? "#0a3d62"
                                                            : "#e3f2fd",
                                                    color:
                                                        filters.orderType ===
                                                        "reservation"
                                                            ? "white"
                                                            : "#0a3d62",
                                                    fontWeight: 500,
                                                }}
                                                icon={
                                                    <ReservationIcon
                                                        style={{
                                                            color:
                                                                filters.orderType ===
                                                                "reservation"
                                                                    ? "white"
                                                                    : "#0a3d62",
                                                        }}
                                                    />
                                                }
                                            />
                                        </Box>
                                    </Box>
                                </Collapse>
                            </Box>

                            {/* Member Status Section */}
                            <Box className={styles.filterSection} mt={2}>
                                <Box
                                    className={styles.filterHeader}
                                    onClick={() =>
                                        toggleSection("memberStatus")
                                    }
                                >
                                    <Typography variant="subtitle1">
                                        Member Status
                                    </Typography>
                                    <KeyboardArrowDownIcon
                                        sx={{
                                            transform:
                                                expandedSections.memberStatus
                                                    ? "rotate(180deg)"
                                                    : "rotate(0deg)",
                                            transition: "transform 0.3s",
                                        }}
                                    />
                                </Box>
                                <Collapse in={expandedSections.memberStatus}>
                                    <Box className={styles.filterContent}>
                                        <Box
                                            display="flex"
                                            flexWrap="wrap"
                                            gap={1}
                                        >
                                            <Chip
                                                label="All Status"
                                                onClick={() =>
                                                    handleFilterChange(
                                                        "memberStatus",
                                                        "all"
                                                    )
                                                }
                                                sx={{
                                                    backgroundColor:
                                                        filters.memberStatus ===
                                                        "all"
                                                            ? "#0a3d62"
                                                            : "#e3f2fd",
                                                    color:
                                                        filters.memberStatus ===
                                                        "all"
                                                            ? "white"
                                                            : "#0a3d62",
                                                    fontWeight: 500,
                                                }}
                                                icon={
                                                    filters.memberStatus ===
                                                    "all" ? (
                                                        <CheckIcon
                                                            style={{
                                                                color: "white",
                                                            }}
                                                        />
                                                    ) : null
                                                }
                                            />
                                            <Chip
                                                label="Guest"
                                                onClick={() =>
                                                    handleFilterChange(
                                                        "memberStatus",
                                                        "guest"
                                                    )
                                                }
                                                sx={{
                                                    backgroundColor:
                                                        filters.memberStatus ===
                                                        "guest"
                                                            ? "#0a3d62"
                                                            : "#e3f2fd",
                                                    color:
                                                        filters.memberStatus ===
                                                        "guest"
                                                            ? "white"
                                                            : "#0a3d62",
                                                    fontWeight: 500,
                                                }}
                                                icon={
                                                    <PersonIcon
                                                        style={{
                                                            color:
                                                                filters.memberStatus ===
                                                                "guest"
                                                                    ? "white"
                                                                    : "#0a3d62",
                                                        }}
                                                    />
                                                }
                                            />
                                            <Chip
                                                label="Star"
                                                onClick={() =>
                                                    handleFilterChange(
                                                        "memberStatus",
                                                        "star"
                                                    )
                                                }
                                                sx={{
                                                    backgroundColor:
                                                        filters.memberStatus ===
                                                        "star"
                                                            ? "#0a3d62"
                                                            : "#e3f2fd",
                                                    color:
                                                        filters.memberStatus ===
                                                        "star"
                                                            ? "white"
                                                            : "#0a3d62",
                                                    fontWeight: 500,
                                                }}
                                                icon={
                                                    <StarIcon
                                                        style={{
                                                            color:
                                                                filters.memberStatus ===
                                                                "star"
                                                                    ? "white"
                                                                    : "#0a3d62",
                                                        }}
                                                    />
                                                }
                                            />
                                            <Chip
                                                label="Diamond"
                                                onClick={() =>
                                                    handleFilterChange(
                                                        "memberStatus",
                                                        "diamond"
                                                    )
                                                }
                                                sx={{
                                                    backgroundColor:
                                                        filters.memberStatus ===
                                                        "diamond"
                                                            ? "#0a3d62"
                                                            : "#e3f2fd",
                                                    color:
                                                        filters.memberStatus ===
                                                        "diamond"
                                                            ? "white"
                                                            : "#0a3d62",
                                                    fontWeight: 500,
                                                }}
                                                icon={
                                                    <DiamondIcon
                                                        style={{
                                                            color:
                                                                filters.memberStatus ===
                                                                "diamond"
                                                                    ? "white"
                                                                    : "#0a3d62",
                                                        }}
                                                    />
                                                }
                                            />
                                        </Box>
                                    </Box>
                                </Collapse>
                            </Box>

                            {/* Order Status Section */}
                            <Box className={styles.filterSection} mt={2}>
                                <Box
                                    className={styles.filterHeader}
                                    onClick={() => toggleSection("orderStatus")}
                                >
                                    <Typography variant="subtitle1">
                                        Order Status
                                    </Typography>
                                    <KeyboardArrowDownIcon
                                        sx={{
                                            transform:
                                                expandedSections.orderStatus
                                                    ? "rotate(180deg)"
                                                    : "rotate(0deg)",
                                            transition: "transform 0.3s",
                                        }}
                                    />
                                </Box>
                                <Collapse in={expandedSections.orderStatus}>
                                    <Box className={styles.filterContent}>
                                        <Box
                                            display="flex"
                                            flexWrap="wrap"
                                            gap={1}
                                        >
                                            <Chip
                                                label="All Status"
                                                onClick={() =>
                                                    handleFilterChange(
                                                        "orderStatus",
                                                        "all"
                                                    )
                                                }
                                                sx={{
                                                    backgroundColor:
                                                        filters.orderStatus ===
                                                        "all"
                                                            ? "#0a3d62"
                                                            : "#e3f2fd",
                                                    color:
                                                        filters.orderStatus ===
                                                        "all"
                                                            ? "white"
                                                            : "#0a3d62",
                                                    fontWeight: 500,
                                                }}
                                                icon={
                                                    filters.orderStatus ===
                                                    "all" ? (
                                                        <CheckIcon
                                                            style={{
                                                                color: "white",
                                                            }}
                                                        />
                                                    ) : null
                                                }
                                            />
                                            <Chip
                                                label="Ready to serve"
                                                onClick={() =>
                                                    handleFilterChange(
                                                        "orderStatus",
                                                        "ready"
                                                    )
                                                }
                                                sx={{
                                                    backgroundColor:
                                                        filters.orderStatus ===
                                                        "ready"
                                                            ? "#0a3d62"
                                                            : "#e3f2fd",
                                                    color:
                                                        filters.orderStatus ===
                                                        "ready"
                                                            ? "white"
                                                            : "#0a3d62",
                                                    fontWeight: 500,
                                                }}
                                                icon={
                                                    <CheckCircleIcon
                                                        style={{
                                                            color:
                                                                filters.orderStatus ===
                                                                "ready"
                                                                    ? "white"
                                                                    : "#0a3d62",
                                                        }}
                                                    />
                                                }
                                            />
                                            <Chip
                                                label="Cooking Process"
                                                onClick={() =>
                                                    handleFilterChange(
                                                        "orderStatus",
                                                        "cooking"
                                                    )
                                                }
                                                sx={{
                                                    backgroundColor:
                                                        filters.orderStatus ===
                                                        "cooking"
                                                            ? "#0a3d62"
                                                            : "#e3f2fd",
                                                    color:
                                                        filters.orderStatus ===
                                                        "cooking"
                                                            ? "white"
                                                            : "#0a3d62",
                                                    fontWeight: 500,
                                                }}
                                                icon={
                                                    <RestaurantIcon
                                                        style={{
                                                            color:
                                                                filters.orderStatus ===
                                                                "cooking"
                                                                    ? "white"
                                                                    : "#0a3d62",
                                                        }}
                                                    />
                                                }
                                            />
                                            <Chip
                                                label="Waiting to payment"
                                                onClick={() =>
                                                    handleFilterChange(
                                                        "orderStatus",
                                                        "waiting"
                                                    )
                                                }
                                                sx={{
                                                    backgroundColor:
                                                        filters.orderStatus ===
                                                        "waiting"
                                                            ? "#0a3d62"
                                                            : "#e3f2fd",
                                                    color:
                                                        filters.orderStatus ===
                                                        "waiting"
                                                            ? "white"
                                                            : "#0a3d62",
                                                    fontWeight: 500,
                                                }}
                                                icon={
                                                    <ReceiptIcon
                                                        style={{
                                                            color:
                                                                filters.orderStatus ===
                                                                "waiting"
                                                                    ? "white"
                                                                    : "#0a3d62",
                                                        }}
                                                    />
                                                }
                                            />
                                            <Chip
                                                label="Order done"
                                                onClick={() =>
                                                    handleFilterChange(
                                                        "orderStatus",
                                                        "done"
                                                    )
                                                }
                                                sx={{
                                                    backgroundColor:
                                                        filters.orderStatus ===
                                                        "done"
                                                            ? "#0a3d62"
                                                            : "#e3f2fd",
                                                    color:
                                                        filters.orderStatus ===
                                                        "done"
                                                            ? "white"
                                                            : "#0a3d62",
                                                    fontWeight: 500,
                                                }}
                                                icon={
                                                    <CheckCircleIcon
                                                        style={{
                                                            color:
                                                                filters.orderStatus ===
                                                                "done"
                                                                    ? "white"
                                                                    : "#0a3d62",
                                                        }}
                                                    />
                                                }
                                            />
                                            <Chip
                                                label="Order Canceled"
                                                onClick={() =>
                                                    handleFilterChange(
                                                        "orderStatus",
                                                        "cancelled"
                                                    )
                                                }
                                                sx={{
                                                    backgroundColor:
                                                        filters.orderStatus ===
                                                        "cancelled"
                                                            ? "#0a3d62"
                                                            : "#e3f2fd",
                                                    color:
                                                        filters.orderStatus ===
                                                        "cancelled"
                                                            ? "white"
                                                            : "#0a3d62",
                                                    fontWeight: 500,
                                                }}
                                                icon={
                                                    <CloseIcon
                                                        style={{
                                                            color:
                                                                filters.orderStatus ===
                                                                "cancelled"
                                                                    ? "white"
                                                                    : "#0a3d62",
                                                        }}
                                                    />
                                                }
                                            />
                                        </Box>
                                    </Box>
                                </Collapse>
                            </Box>

                            {/* Footer Buttons */}
                            <Box
                                display="flex"
                                justifyContent="flex-end"
                                gap={1}
                                mt={3}
                            >
                                <Button
                                    variant="outlined"
                                    onClick={handleCloseFilterModal}
                                    sx={{
                                        color: "#333",
                                        borderColor: "#ddd",
                                        textTransform: "none",
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={handleResetFilters}
                                    sx={{
                                        color: "#333",
                                        borderColor: "#ddd",
                                        textTransform: "none",
                                    }}
                                >
                                    Reset Filter
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleApplyFilters}
                                    sx={{
                                        backgroundColor: "#0a3d62",
                                        color: "white",
                                        textTransform: "none",
                                        "&:hover": {
                                            backgroundColor: "#083352",
                                        },
                                    }}
                                >
                                    Apply Filters
                                </Button>
                            </Box>
                        </Box>
                    </Dialog>

                    {/* Order Detail Modal */}
                    <Dialog
                        open={openOrderDetailModal}
                        onClose={handleCloseOrderDetail}
                        fullWidth
                        maxWidth="sm"
                        PaperProps={{
                            style: {
                                position: "fixed",
                                top: 0,
                                right: 0,
                                margin: 0,
                                height: "100vh",
                                maxHeight: "100vh",
                                overflow: "auto",
                                borderRadius: 0,
                            },
                        }}
                    >
                        <Box sx={{ p: 3 }}>
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={3}
                            >
                                <Typography variant="h6" fontWeight="bold">
                                    Order Detail
                                </Typography>
                                <IconButton
                                    onClick={handleCloseOrderDetail}
                                    edge="end"
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Box>

                            {/* Customer Info */}
                            <Box sx={{ mb: 3 }}>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Customer Name
                                </Typography>
                                <Box display="flex" alignItems="center" mt={1}>
                                    <Avatar
                                        sx={{
                                            bgcolor: "#f5f5f5",
                                            color: "#333",
                                            width: 36,
                                            height: 36,
                                            mr: 1,
                                        }}
                                    >
                                        {orderDetail.customer.charAt(0)}
                                    </Avatar>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="medium"
                                    >
                                        {orderDetail.customer}
                                    </Typography>
                                    {orderDetail.isVIP && (
                                        <Box
                                            component="span"
                                            ml={1}
                                            display="inline-block"
                                            width={16}
                                            height={16}
                                            borderRadius="50%"
                                            bgcolor="#ffc107"
                                        />
                                    )}
                                    <Box
                                        ml="auto"
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                    >
                                        <Avatar
                                            sx={{
                                                bgcolor: "#0a3d62",
                                                color: "white",
                                                width: 36,
                                                height: 36,
                                            }}
                                        >
                                            {orderDetail.tableNumber}
                                        </Avatar>
                                        <IconButton
                                            size="small"
                                            sx={{ border: "1px solid #e0e0e0" }}
                                        >
                                            <HomeIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            sx={{ border: "1px solid #e0e0e0" }}
                                        >
                                            <RoomServiceIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Order Info Grid */}
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={4}>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Order Date
                                    </Typography>
                                    <Typography variant="body2" mt={0.5}>
                                        {orderDetail.date}
                                    </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Cashier
                                    </Typography>
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        mt={0.5}
                                    >
                                        <Avatar
                                            src={orderDetail.cashierAvatar}
                                            sx={{
                                                width: 20,
                                                height: 20,
                                                mr: 1,
                                            }}
                                        />
                                        <Typography variant="body2">
                                            {orderDetail.cashier}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Working Time
                                    </Typography>
                                    <Typography variant="body2" mt={0.5}>
                                        {orderDetail.workingTime}
                                    </Typography>
                                </Grid>
                            </Grid>

                            {/* Order ID */}
                            <Box sx={{ mb: 3 }}>
                                <Chip
                                    label={`Order Id : ${orderDetail.id}`}
                                    sx={{
                                        backgroundColor: "#f5f5f5",
                                        color: "#333",
                                        fontWeight: 500,
                                        borderRadius: "4px",
                                    }}
                                />
                            </Box>

                            {/* Order Items */}
                            <Box sx={{ mb: 3 }}>
                                {orderDetail.items.map((item, index) => (
                                    <Box
                                        key={index}
                                        display="flex"
                                        alignItems="center"
                                        mb={2}
                                    >
                                        <img
                                            src={
                                                item.image || "/placeholder.svg"
                                            }
                                            alt={item.name}
                                            style={{
                                                width: 50,
                                                height: 50,
                                                borderRadius: 8,
                                                objectFit: "cover",
                                            }}
                                        />
                                        <Box ml={2} flex={1}>
                                            <Typography
                                                variant="subtitle2"
                                                fontWeight="bold"
                                            >
                                                {item.name}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                display="block"
                                            >
                                                {item.category}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Variant: {item.variant}
                                            </Typography>
                                        </Box>
                                        <Box textAlign="right">
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Qty: {item.quantity} x Rs{" "}
                                                {item.price.toFixed(2)}
                                            </Typography>
                                            <Typography
                                                variant="subtitle2"
                                                fontWeight="bold"
                                                display="block"
                                            >
                                                Rs{" "}
                                                {(
                                                    item.quantity * item.price
                                                ).toFixed(2)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>

                            {/* Order Summary */}
                            <Box sx={{ mb: 3 }}>
                                <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    mb={1}
                                >
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Subtotal
                                    </Typography>
                                    <Typography variant="body2">
                                        Rs {orderDetail.subtotal.toFixed(2)}
                                    </Typography>
                                </Box>
                                <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    mb={1}
                                >
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Discount
                                    </Typography>
                                    <Typography variant="body2" color="#4caf50">
                                        Rs 0% (0)
                                    </Typography>
                                </Box>
                                <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    mb={1}
                                >
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Tax 12%
                                    </Typography>
                                    <Typography variant="body2">
                                        Rs {orderDetail.tax.toFixed(2)}
                                    </Typography>
                                </Box>
                                <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    mt={2}
                                >
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                    >
                                        Total
                                    </Typography>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                    >
                                        Rs {orderDetail.total.toFixed(2)}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Payment Info */}
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    p: 2,
                                    bgcolor: "#f9f9f9",
                                    borderRadius: 1,
                                    mb: 3,
                                }}
                            >
                                <Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Payment
                                    </Typography>
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        mt={0.5}
                                    >
                                        <ReceiptIcon
                                            fontSize="small"
                                            sx={{ mr: 1, color: "#0a3d62" }}
                                        />
                                        <Typography
                                            variant="body2"
                                            fontWeight="medium"
                                        >
                                            {orderDetail.payment.method}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Cash Total
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        fontWeight="medium"
                                        mt={0.5}
                                    >
                                        Rs{" "}
                                        {orderDetail.payment.amount.toFixed(2)}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Customer Change
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        fontWeight="medium"
                                        mt={0.5}
                                    >
                                        Rs{" "}
                                        {orderDetail.payment.change.toFixed(2)}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Action Buttons */}
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                mt={3}
                            >
                                <Button
                                    variant="outlined"
                                    onClick={handleCloseOrderDetail}
                                    sx={{
                                        color: "#333",
                                        borderColor: "#ddd",
                                        textTransform: "none",
                                    }}
                                >
                                    Close
                                </Button>
                                <Box display="flex" gap={1}>
                                    <Button
                                        variant="outlined"
                                        endIcon={<ArrowDropDownIcon />}
                                        sx={{
                                            color: "#333",
                                            borderColor: "#ddd",
                                            textTransform: "none",
                                        }}
                                    >
                                        Share Receipt
                                    </Button>
                                    <Button
                                        variant="contained"
                                        startIcon={<PrintIcon />}
                                        onClick={() =>
                                            handleOpenPayment(selectedOrder)
                                        }
                                        sx={{
                                            backgroundColor: "#0a3d62",
                                            color: "white",
                                            textTransform: "none",
                                            "&:hover": {
                                                backgroundColor: "#083352",
                                            },
                                        }}
                                    >
                                        Print Receipt
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </Dialog>

                    {/* Payment Modal */}
                    <Dialog
                        open={openPaymentModal}
                        onClose={handleClosePayment}
                        fullWidth
                        maxWidth="md"
                        PaperProps={{
                            style: {
                                margin: 0,
                                maxWidth: "100%",
                                borderRadius: 0,
                            },
                        }}
                    >
                        <Box sx={{ display: "flex", height: "100vh" }}>
                            {/* Left Side - Receipt */}
                            <Box
                                sx={{
                                    width: "40%",
                                    bgcolor: "#f5f5f5",
                                    p: 3,
                                    borderRight: "1px solid #ddd",
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                    textAlign="center"
                                    mb={1}
                                >
                                    {paymentOrderDetail.date}
                                </Typography>

                                {/* Order ID */}
                                <Box
                                    sx={{
                                        border: "1px dashed #ccc",
                                        p: 2,
                                        mb: 3,
                                        textAlign: "center",
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        display="block"
                                        mb={0.5}
                                    >
                                        Order Id
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        fontWeight="bold"
                                    >
                                        {paymentOrderDetail.id}
                                    </Typography>
                                </Box>

                                {/* Order Info */}
                                <Grid container spacing={1} sx={{ mb: 1 }}>
                                    <Grid item xs={4}>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Cashier
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={8} textAlign="right">
                                        <Typography variant="caption">
                                            {paymentOrderDetail.cashier}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={1} sx={{ mb: 1 }}>
                                    <Grid item xs={4}>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Working Time
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={8} textAlign="right">
                                        <Typography variant="caption">
                                            {paymentOrderDetail.workingTime}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Divider sx={{ my: 2 }} />

                                <Grid container spacing={1} sx={{ mb: 1 }}>
                                    <Grid item xs={4}>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Customer Name
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={8} textAlign="right">
                                        <Typography variant="caption">
                                            {paymentOrderDetail.customer}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={1} sx={{ mb: 1 }}>
                                    <Grid item xs={4}>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Member Id Card
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={8} textAlign="right">
                                        <Typography variant="caption">
                                            -
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={1} sx={{ mb: 1 }}>
                                    <Grid item xs={4}>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Order Type
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={8} textAlign="right">
                                        <Typography variant="caption">
                                            Dine In
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={1} sx={{ mb: 1 }}>
                                    <Grid item xs={4}>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Table Number
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={8} textAlign="right">
                                        <Typography variant="caption">
                                            {paymentOrderDetail.tableNumber}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Divider sx={{ my: 2 }} />

                                {/* Order Items */}
                                {paymentOrderDetail.items.map((item, index) => (
                                    <Box key={index} mb={1.5}>
                                        <Typography
                                            variant="caption"
                                            fontWeight="medium"
                                        >
                                            {item.name}
                                        </Typography>
                                        <Grid container spacing={1}>
                                            <Grid item xs={6}>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    {item.quantity} x Rs{" "}
                                                    {item.price.toFixed(2)}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6} textAlign="right">
                                                <Typography variant="caption">
                                                    Rs {item.total.toFixed(2)}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                ))}

                                <Divider sx={{ my: 2 }} />

                                {/* Order Summary */}
                                <Grid container spacing={1} sx={{ mb: 1 }}>
                                    <Grid item xs={6}>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Subtotal
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6} textAlign="right">
                                        <Typography variant="caption">
                                            Rs{" "}
                                            {paymentOrderDetail.subtotal.toFixed(
                                                2
                                            )}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={1} sx={{ mb: 1 }}>
                                    <Grid item xs={6}>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Discount
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6} textAlign="right">
                                        <Typography variant="caption">
                                            Rs {paymentOrderDetail.discount}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={1} sx={{ mb: 1 }}>
                                    <Grid item xs={6}>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Tax (12%)
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6} textAlign="right">
                                        <Typography variant="caption">
                                            Rs{" "}
                                            {paymentOrderDetail.tax.toFixed(2)}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Divider sx={{ my: 2 }} />

                                <Grid container spacing={1} sx={{ mb: 2 }}>
                                    <Grid item xs={6}>
                                        <Typography
                                            variant="body2"
                                            fontWeight="bold"
                                            color="#0a3d62"
                                        >
                                            Total Amount
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6} textAlign="right">
                                        <Typography
                                            variant="body2"
                                            fontWeight="bold"
                                            color="#0a3d62"
                                        >
                                            Rs{" "}
                                            {paymentOrderDetail.total.toFixed(
                                                2
                                            )}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                    textAlign="center"
                                    fontSize="0.65rem"
                                    mb={3}
                                >
                                    Thanks for having our passion. Drop by
                                    again. If your orders aren't still visible,
                                    you're always welcome here!
                                </Typography>

                                <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    color="#0a3d62"
                                    textAlign="center"
                                >
                                    IMAJI Coffee.
                                </Typography>
                            </Box>

                            {/* Right Side - Payment */}
                            <Box sx={{ flex: 1, p: 3 }}>
                                <Typography
                                    variant="h5"
                                    fontWeight="bold"
                                    mb={4}
                                >
                                    Payment
                                </Typography>

                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" mb={1}>
                                            Input Amount
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            value={inputAmount}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Typography variant="body1">
                                                            Rs
                                                        </Typography>
                                                    </InputAdornment>
                                                ),
                                                readOnly: true,
                                            }}
                                            sx={{ mb: 2 }}
                                        />

                                        <Typography variant="subtitle1" mb={1}>
                                            Customer Changes
                                        </Typography>
                                        <Box
                                            sx={{
                                                mb: 3,
                                                display: "flex",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Typography
                                                variant="h5"
                                                fontWeight="bold"
                                                color={
                                                    Number.parseFloat(
                                                        customerChanges
                                                    ) < 0
                                                        ? "#f44336"
                                                        : "#333"
                                                }
                                            >
                                                Rs {customerChanges}
                                            </Typography>
                                        </Box>

                                        {/* Quick Amount Buttons */}
                                        <Box
                                            sx={{
                                                display: "flex",
                                                gap: 1,
                                                mb: 3,
                                                flexWrap: "wrap",
                                            }}
                                        >
                                            <Button
                                                variant="outlined"
                                                onClick={() =>
                                                    handleQuickAmountClick(
                                                        "10.00"
                                                    )
                                                }
                                                sx={styles.quickAmountButton}
                                            >
                                                Exact money
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                onClick={() =>
                                                    handleQuickAmountClick(
                                                        "10.00"
                                                    )
                                                }
                                                sx={styles.quickAmountButton}
                                            >
                                                Rs 10.00
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                onClick={() =>
                                                    handleQuickAmountClick(
                                                        "20.00"
                                                    )
                                                }
                                                sx={styles.quickAmountButton}
                                            >
                                                Rs 20.00
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                onClick={() =>
                                                    handleQuickAmountClick(
                                                        "50.00"
                                                    )
                                                }
                                                sx={styles.quickAmountButton}
                                            >
                                                Rs 50.00
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                onClick={() =>
                                                    handleQuickAmountClick(
                                                        "100.00"
                                                    )
                                                }
                                                sx={styles.quickAmountButton}
                                            >
                                                Rs 100.00
                                            </Button>
                                        </Box>

                                        {/* Numpad */}
                                        <Grid container spacing={1}>
                                            <Grid item xs={4}>
                                                <Button
                                                    fullWidth
                                                    sx={styles.numpadButton}
                                                    onClick={() =>
                                                        handleNumberClick("1")
                                                    }
                                                >
                                                    1
                                                </Button>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Button
                                                    fullWidth
                                                    sx={styles.numpadButton}
                                                    onClick={() =>
                                                        handleNumberClick("2")
                                                    }
                                                >
                                                    2
                                                </Button>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Button
                                                    fullWidth
                                                    sx={styles.numpadButton}
                                                    onClick={() =>
                                                        handleNumberClick("3")
                                                    }
                                                >
                                                    3
                                                </Button>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Button
                                                    fullWidth
                                                    sx={styles.numpadButton}
                                                    onClick={() =>
                                                        handleNumberClick("4")
                                                    }
                                                >
                                                    4
                                                </Button>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Button
                                                    fullWidth
                                                    sx={styles.numpadButton}
                                                    onClick={() =>
                                                        handleNumberClick("5")
                                                    }
                                                >
                                                    5
                                                </Button>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Button
                                                    fullWidth
                                                    sx={styles.numpadButton}
                                                    onClick={() =>
                                                        handleNumberClick("6")
                                                    }
                                                >
                                                    6
                                                </Button>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Button
                                                    fullWidth
                                                    sx={styles.numpadButton}
                                                    onClick={() =>
                                                        handleNumberClick("7")
                                                    }
                                                >
                                                    7
                                                </Button>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Button
                                                    fullWidth
                                                    sx={styles.numpadButton}
                                                    onClick={() =>
                                                        handleNumberClick("8")
                                                    }
                                                >
                                                    8
                                                </Button>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Button
                                                    fullWidth
                                                    sx={styles.numpadButton}
                                                    onClick={() =>
                                                        handleNumberClick("9")
                                                    }
                                                >
                                                    9
                                                </Button>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Button
                                                    fullWidth
                                                    sx={styles.numpadButton}
                                                    onClick={handleDecimalClick}
                                                >
                                                    .
                                                </Button>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Button
                                                    fullWidth
                                                    sx={styles.numpadButton}
                                                    onClick={() =>
                                                        handleNumberClick("0")
                                                    }
                                                >
                                                    0
                                                </Button>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Button
                                                    fullWidth
                                                    sx={{
                                                        ...styles.numpadButton,
                                                        backgroundColor:
                                                            "#ffebee",
                                                        color: "#f44336",
                                                        "&:hover": {
                                                            backgroundColor:
                                                                "#ffcdd2",
                                                        },
                                                    }}
                                                    onClick={handleDeleteClick}
                                                >
                                                    <BackspaceIcon />
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>

                                {/* Footer Buttons */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        mt: 4,
                                    }}
                                >
                                    <Button
                                        variant="outlined"
                                        onClick={handleClosePayment}
                                        sx={{
                                            color: "#333",
                                            borderColor: "#ddd",
                                            textTransform: "none",
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="contained"
                                        endIcon={<ArrowForwardIcon />}
                                        onClick={handlePayNow}
                                        sx={styles.payNowButton}
                                    >
                                        Pay Now
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </Dialog>

                    {/* Payment Success Modal */}
                    <Dialog
                        open={openPaymentSuccessModal}
                        onClose={handleClosePaymentSuccess}
                        fullWidth
                        maxWidth="md"
                        PaperProps={{
                            style: {
                                margin: 0,
                                maxWidth: "100%",
                                borderRadius: 0,
                            },
                        }}
                    >
                        <Box sx={{ display: "flex", height: "100vh" }}>
                            {/* Left Side - Receipt */}
                            <Box
                                sx={{
                                    width: "40%",
                                    bgcolor: "#f5f5f5",
                                    p: 3,
                                    borderRight: "1px solid #ddd",
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                    textAlign="center"
                                    mb={1}
                                >
                                    {paymentOrderDetail.date}
                                </Typography>

                                {/* Order ID */}
                                <Box
                                    sx={{
                                        border: "1px dashed #ccc",
                                        p: 2,
                                        mb: 3,
                                        textAlign: "center",
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        display="block"
                                        mb={0.5}
                                    >
                                        Order Id
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        fontWeight="bold"
                                    >
                                        {paymentOrderDetail.id}
                                    </Typography>
                                </Box>

                                {/* Order Info */}
                                <Grid container spacing={1} sx={{ mb: 1 }}>
                                    <Grid item xs={4}>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Cashier
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={8} textAlign="right">
                                        <Typography variant="caption">
                                            {paymentOrderDetail.cashier}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={1} sx={{ mb: 1 }}>
                                    <Grid item xs={4}>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Working Time
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={8} textAlign="right">
                                        <Typography variant="caption">
                                            {paymentOrderDetail.workingTime}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Divider sx={{ my: 2 }} />

                                <Grid container spacing={1} sx={{ mb: 1 }}>
                                    <Grid item xs={4}>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Customer Name
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={8} textAlign="right">
                                        <Typography variant="caption">
                                            {paymentOrderDetail.customer}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={1} sx={{ mb: 1 }}>
                                    <Grid item xs={4}>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Member Id Card
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={8} textAlign="right">
                                        <Typography variant="caption">
                                            -
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={1} sx={{ mb: 1 }}>
                                    <Grid item xs={4}>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Order Type
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={8} textAlign="right">
                                        <Typography variant="caption">
                                            Dine In
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={1} sx={{ mb: 1 }}>
                                    <Grid item xs={4}>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Table Number
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={8} textAlign="right">
                                        <Typography variant="caption">
                                            {paymentOrderDetail.tableNumber}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Divider sx={{ my: 2 }} />

                                {/* Order Items */}
                                {paymentOrderDetail.items.map((item, index) => (
                                    <Box key={index} mb={1.5}>
                                        <Typography
                                            variant="caption"
                                            fontWeight="medium"
                                        >
                                            {item.name}
                                        </Typography>
                                        <Grid container spacing={1}>
                                            <Grid item xs={6}>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    {item.quantity} x Rs{" "}
                                                    {item.price.toFixed(2)}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6} textAlign="right">
                                                <Typography variant="caption">
                                                    Rs {item.total.toFixed(2)}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                ))}

                                <Divider sx={{ my: 2 }} />

                                {/* Order Summary */}
                                <Grid container spacing={1} sx={{ mb: 1 }}>
                                    <Grid item xs={6}>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Subtotal
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6} textAlign="right">
                                        <Typography variant="caption">
                                            Rs{" "}
                                            {paymentOrderDetail.subtotal.toFixed(
                                                2
                                            )}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={1} sx={{ mb: 1 }}>
                                    <Grid item xs={6}>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Discount
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6} textAlign="right">
                                        <Typography variant="caption">
                                            Rs {paymentOrderDetail.discount}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={1} sx={{ mb: 1 }}>
                                    <Grid item xs={6}>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Tax (12%)
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6} textAlign="right">
                                        <Typography variant="caption">
                                            Rs{" "}
                                            {paymentOrderDetail.tax.toFixed(2)}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Divider sx={{ my: 2 }} />

                                <Grid container spacing={1} sx={{ mb: 2 }}>
                                    <Grid item xs={6}>
                                        <Typography
                                            variant="body2"
                                            fontWeight="bold"
                                            color="#0a3d62"
                                        >
                                            Total Amount
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6} textAlign="right">
                                        <Typography
                                            variant="body2"
                                            fontWeight="bold"
                                            color="#0a3d62"
                                        >
                                            Rs{" "}
                                            {paymentOrderDetail.total.toFixed(
                                                2
                                            )}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                    textAlign="center"
                                    fontSize="0.65rem"
                                    mb={3}
                                >
                                    Thanks for having our passion. Drop by
                                    again. If your orders aren't still visible,
                                    you're always welcome here!
                                </Typography>

                                <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    color="#0a3d62"
                                    textAlign="center"
                                >
                                    IMAJI Coffee.
                                </Typography>

                                {/* Footer Buttons */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        mt: 3,
                                    }}
                                >
                                    <Button
                                        variant="outlined"
                                        onClick={handleClosePaymentSuccess}
                                        sx={{
                                            color: "#333",
                                            borderColor: "#ddd",
                                            textTransform: "none",
                                        }}
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        variant="contained"
                                        startIcon={<PrintIcon />}
                                        sx={styles.printReceiptButton}
                                    >
                                        Print Receipt
                                    </Button>
                                </Box>
                            </Box>

                            {/* Right Side - Success Message */}
                            <Box
                                sx={{
                                    flex: 1,
                                    p: 5,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                {/* Confetti Animation */}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: "100px",
                                        overflow: "hidden",
                                    }}
                                >
                                    {/* Confetti elements would be here in a real implementation */}
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            top: 20,
                                            left: "10%",
                                            width: 10,
                                            height: 10,
                                            bgcolor: "#4caf50",
                                            transform: "rotate(15deg)",
                                        }}
                                    />
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            top: 40,
                                            left: "20%",
                                            width: 8,
                                            height: 8,
                                            bgcolor: "#2196f3",
                                            transform: "rotate(45deg)",
                                        }}
                                    />
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            top: 30,
                                            left: "30%",
                                            width: 12,
                                            height: 12,
                                            bgcolor: "#ff9800",
                                            borderRadius: "50%",
                                        }}
                                    />
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            top: 50,
                                            left: "40%",
                                            width: 15,
                                            height: 15,
                                            bgcolor: "#e91e63",
                                            transform: "rotate(30deg)",
                                        }}
                                    />
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            top: 20,
                                            left: "50%",
                                            width: 10,
                                            height: 10,
                                            bgcolor: "#9c27b0",
                                            transform: "rotate(60deg)",
                                        }}
                                    />
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            top: 60,
                                            left: "60%",
                                            width: 8,
                                            height: 8,
                                            bgcolor: "#f44336",
                                            borderRadius: "50%",
                                        }}
                                    />
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            top: 40,
                                            left: "70%",
                                            width: 12,
                                            height: 12,
                                            bgcolor: "#ffeb3b",
                                            transform: "rotate(15deg)",
                                        }}
                                    />
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            top: 30,
                                            left: "80%",
                                            width: 10,
                                            height: 10,
                                            bgcolor: "#4caf50",
                                            transform: "rotate(45deg)",
                                        }}
                                    />
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            top: 50,
                                            left: "90%",
                                            width: 15,
                                            height: 15,
                                            bgcolor: "#2196f3",
                                            borderRadius: "50%",
                                        }}
                                    />
                                </Box>

                                <Box sx={styles.successIcon}>
                                    <CheckIcon sx={{ fontSize: 40 }} />
                                </Box>

                                <Typography
                                    variant="h4"
                                    fontWeight="bold"
                                    mb={2}
                                >
                                    Payment Success!
                                </Typography>

                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    mb={4}
                                    textAlign="center"
                                >
                                    You've successfully pay your bill. Well
                                    done!
                                </Typography>

                                <Box sx={{ width: "100%", maxWidth: 400 }}>
                                    <Box sx={{ mb: 3 }}>
                                        <Typography
                                            variant="subtitle2"
                                            color="text.secondary"
                                            mb={1}
                                        >
                                            Total Amount
                                        </Typography>
                                        <Typography
                                            variant="h4"
                                            fontWeight="bold"
                                            color="#0a3d62"
                                            textAlign="center"
                                        >
                                            Rs{" "}
                                            {paymentOrderDetail.total.toFixed(
                                                2
                                            )}
                                        </Typography>
                                    </Box>

                                    <Grid container spacing={3} mb={4}>
                                        <Grid item xs={6}>
                                            <Typography
                                                variant="subtitle2"
                                                color="text.secondary"
                                                mb={1}
                                            >
                                                Payment Method
                                            </Typography>
                                            <Typography variant="body1">
                                                Cash
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography
                                                variant="subtitle2"
                                                color="text.secondary"
                                                mb={1}
                                            >
                                                Cash
                                            </Typography>
                                            <Typography variant="body1">
                                                Rs{" "}
                                                {paymentOrderDetail.payment.amount.toFixed(
                                                    2
                                                )}
                                            </Typography>
                                        </Grid>
                                    </Grid>

                                    <Box sx={{ mb: 3 }}>
                                        <Typography
                                            variant="subtitle2"
                                            color="text.secondary"
                                            mb={1}
                                        >
                                            Customer Changes
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            fontWeight="medium"
                                        >
                                            Rs{" "}
                                            {paymentOrderDetail.payment.change.toFixed(
                                                2
                                            )}
                                        </Typography>
                                    </Box>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            mt: 4,
                                        }}
                                    >
                                        <Button
                                            variant="outlined"
                                            onClick={handleClosePaymentSuccess}
                                            sx={{
                                                color: "#333",
                                                borderColor: "#ddd",
                                                textTransform: "none",
                                            }}
                                        >
                                            Close
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            endIcon={<ArrowDropDownIcon />}
                                            sx={{
                                                color: "#333",
                                                borderColor: "#ddd",
                                                textTransform: "none",
                                            }}
                                        >
                                            Share Receipt
                                        </Button>
                                        <Button
                                            variant="contained"
                                            startIcon={<PrintIcon />}
                                            sx={styles.printReceiptButton}
                                        >
                                            Print Receipt
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Dialog>

                    {/* Track Order Modal */}
                    <Dialog
                        open={openTrackOrderModal}
                        onClose={handleCloseTrackOrder}
                        fullWidth
                        maxWidth="sm"
                        PaperProps={{
                            style: {
                                position: "fixed",
                                top: 0,
                                right: 0,
                                margin: 0,
                                height: "100vh",
                                maxHeight: "100vh",
                                overflow: "auto",
                                borderRadius: 0,
                            },
                        }}
                    >
                        <Box style={styles.modalTitle}>
                            <Typography variant="h6" fontWeight="bold">
                                Track Order
                            </Typography>
                            <IconButton
                                onClick={handleCloseTrackOrder}
                                style={styles.closeButton}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <DialogContent>
                            {trackingSteps.map((step, index) => (
                                <Box key={index} style={styles.trackOrderStep}>
                                    {step.completed ? (
                                        <CheckCircleIcon
                                            style={styles.trackOrderStepIcon}
                                        />
                                    ) : (
                                        <CircleIcon
                                            style={styles.trackOrderStepIcon}
                                        />
                                    )}
                                    <Box style={styles.trackOrderStepContent}>
                                        <Typography
                                            variant="body1"
                                            style={styles.trackOrderStepTitle}
                                        >
                                            {step.title}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            style={styles.trackOrderStepTime}
                                        >
                                            {step.time}
                                        </Typography>
                                        {step.hasProof && (
                                            <Box mt={1}>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight="bold"
                                                >
                                                    {step.proofText}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    style={
                                                        styles.trackOrderStepTime
                                                    }
                                                >
                                                    {step.proofAddedBy}
                                                </Typography>
                                                <img
                                                    src={
                                                        step.proofImage ||
                                                        "/placeholder.svg"
                                                    }
                                                    alt="Delivery Proof"
                                                    style={
                                                        styles.trackOrderImage
                                                    }
                                                />
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            ))}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </>
    );
};

export default TransactionDashboard;
