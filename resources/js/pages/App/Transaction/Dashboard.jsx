'use client';

import SideNav from '@/components/App/SideBar/SideNav';
import {
    AccountBalance as AccountBalanceIcon,
    ArrowForward as ArrowForwardIcon,
    Backspace as BackspaceIcon,
    CheckCircle as CheckCircleIcon,
    Check as CheckIcon,
    Circle as CircleIcon,
    Close as CloseIcon,
    CreditCard as CreditCardIcon,
    TwoWheeler as DeliveryIcon,
    Diamond as DiamondIcon,
    LocalDining as DiningIcon,
    FilterAlt as FilterIcon,
    Home as HomeIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon,
    Print as PrintIcon,
    Receipt as ReceiptIcon,
    EventSeat as ReservationIcon,
    Restaurant as RestaurantIcon,
    Search as SearchIcon,
    TakeoutDining as TakeoutIcon,
} from '@mui/icons-material';
import RoomServiceIcon from '@mui/icons-material/RoomService';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Collapse,
    Dialog,
    DialogContent,
    Grid,
    IconButton,
    InputAdornment,
    TextField,
    Typography,
} from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

// Custom CSS
const styles = {
    root: {
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
    },
    tabButton: {
        borderRadius: '20px',
        margin: '0 5px',
        textTransform: 'none',
        fontWeight: 'normal',
        padding: '6px 16px',
        border: '1px solid #00274D',
        color: '#00274D',
    },
    activeTabButton: {
        backgroundColor: '#0a3d62',
        color: 'white',
        borderRadius: '20px',
        margin: '0 5px',
        textTransform: 'none',
        fontWeight: 'normal',
        padding: '6px 16px',
    },
    revenueCard: {
        backgroundColor: '#0a3d62',
        color: 'white',
        borderRadius: '8px',
        padding: '15px',
    },
    transactionCard: {
        backgroundColor: '#1e4258',
        color: 'white',
        borderRadius: '8px',
        padding: '15px',
    },
    orderCard: {
        marginBottom: '10px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        cursor: 'pointer',
    },
    tableAvatar: {
        backgroundColor: '#0a3d62',
        color: 'white',
        width: '36px',
        height: '36px',
        fontSize: '14px',
    },
    deliveryAvatar: {
        backgroundColor: '#3498db',
        color: 'white',
        width: '36px',
        height: '36px',
        fontSize: '14px',
    },
    pickupAvatar: {
        backgroundColor: '#27ae60',
        color: 'white',
        width: '36px',
        height: '36px',
        fontSize: '14px',
    },
    statusChip: {
        borderRadius: '4px',
        height: '24px',
        fontSize: '12px',
    },
    filterButton: {
        backgroundColor: 'white',
        color: '#333',
        border: '1px solid #ddd',
        boxShadow: 'none',
        textTransform: 'none',
    },
    filterChip: {
        backgroundColor: '#e3f2fd',
        color: '#0a3d62',
        margin: '0 4px',
        borderRadius: '16px',
    },
    activeFilterChip: {
        backgroundColor: '#0a3d62',
        color: 'white',
        margin: '0 4px',
        borderRadius: '16px',
    },
    modalTitle: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: '1px solid #eee',
    },
    modalFooter: {
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '16px 24px',
        borderTop: '1px solid #eee',
    },
    applyButton: {
        backgroundColor: '#0a3d62',
        color: 'white',
        textTransform: 'none',
    },
    resetButton: {
        backgroundColor: 'white',
        color: '#333',
        border: '1px solid #ddd',
        marginRight: '8px',
        textTransform: 'none',
    },
    cancelButton: {
        backgroundColor: 'white',
        color: '#333',
        border: '1px solid #ddd',
        textTransform: 'none',
    },
    orderDetailHeader: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '16px',
    },
    orderDetailAvatar: {
        backgroundColor: '#0a3d62',
        color: 'white',
        width: '40px',
        height: '40px',
    },
    orderItemImage: {
        width: '50px',
        height: '50px',
        borderRadius: '8px',
        objectFit: 'cover',
    },
    trackOrderStep: {
        display: 'flex',
        marginBottom: '16px',
    },
    trackOrderStepIcon: {
        color: '#0a3d62',
        marginRight: '16px',
    },
    trackOrderStepContent: {
        flex: 1,
    },
    trackOrderStepTitle: {
        fontWeight: 'bold',
        marginBottom: '4px',
    },
    trackOrderStepTime: {
        color: '#666',
        fontSize: '12px',
    },
    printReceiptButton: {
        backgroundColor: '#0a3d62',
        color: 'white',
        textTransform: 'none',
    },
    shareReceiptButton: {
        backgroundColor: 'white',
        color: '#333',
        border: '1px solid #ddd',
        textTransform: 'none',
    },
    closeButton: {
        color: '#333',
    },
    orderIdChip: {
        backgroundColor: '#f0f0f0',
        borderRadius: '4px',
        padding: '4px 8px',
        fontSize: '14px',
    },
    orderInfoGrid: {
        marginBottom: '16px',
    },
    orderInfoLabel: {
        color: '#666',
        fontSize: '14px',
    },
    orderInfoValue: {
        fontWeight: 'bold',
        fontSize: '14px',
    },
    orderItemVariant: {
        color: '#666',
        fontSize: '12px',
        marginTop: '4px',
    },
    orderItemPrice: {
        textAlign: 'right',
        fontWeight: 'bold',
    },
    orderItemQuantity: {
        color: '#666',
        fontSize: '14px',
        textAlign: 'right',
    },
    orderSummaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px',
    },
    orderTotal: {
        fontWeight: 'bold',
        fontSize: '16px',
    },
    paymentInfo: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '16px 0',
        borderTop: '1px solid #eee',
        borderBottom: '1px solid #eee',
        marginBottom: '16px',
    },
    paymentMethod: {
        display: 'flex',
        alignItems: 'center',
    },
    paymentIcon: {
        marginRight: '8px',
        color: '#0a3d62',
    },
    trackOrderImage: {
        width: '100%',
        height: '120px',
        objectFit: 'cover',
        borderRadius: '8px',
        marginTop: '8px',
    },
    productSoldCard: {
        backgroundColor: '#1e4258',
        color: 'white',
        borderRadius: '8px',
        padding: '15px',
        height: '100%',
    },
    totalOrderCard: {
        backgroundColor: '#1e4258',
        color: 'white',
        borderRadius: '8px',
        padding: '15px',
        height: '100%',
    },
    filterSection: {
        marginBottom: '16px',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
    },
    filterHeader: {
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer',
    },
    filterContent: {
        padding: '0 16px 16px 16px',
    },
    filterChipNew: {
        margin: '4px',
        borderRadius: '16px',
        backgroundColor: '#e3f2fd',
        color: '#0a3d62',
        border: 'none',
    },
    activeFilterChipNew: {
        margin: '4px',
        borderRadius: '16px',
        backgroundColor: '#0a3d62',
        color: 'white',
        border: 'none',
    },
    numpadButton: {
        width: '100%',
        height: '60px',
        fontSize: '24px',
        borderRadius: '4px',
        border: '1px solid #e0e0e0',
        backgroundColor: 'white',
        color: '#333',
        '&:hover': {
            backgroundColor: '#f5f5f5',
        },
    },
    quickAmountButton: {
        borderRadius: '4px',
        border: '1px solid #e0e0e0',
        backgroundColor: 'white',
        color: '#333',
        padding: '8px 16px',
        textTransform: 'none',
        '&:hover': {
            backgroundColor: '#f5f5f5',
        },
    },
    payNowButton: {
        backgroundColor: '#0a3d62',
        color: 'white',
        borderRadius: '4px',
        padding: '12px 24px',
        textTransform: 'none',
        '&:hover': {
            backgroundColor: '#083352',
        },
    },
    successIcon: {
        backgroundColor: '#4caf50',
        color: 'white',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '0 auto 24px auto',
    },
    paymentMethodTab: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '15px',
        cursor: 'pointer',
        borderBottom: '2px solid transparent',
    },
    activePaymentMethodTab: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '15px',
        cursor: 'pointer',
        borderBottom: '2px solid #0a3d62',
        backgroundColor: '#e3f2fd',
    },
    bankButton: {
        borderRadius: '4px',
        border: '1px solid #e0e0e0',
        backgroundColor: 'white',
        color: '#333',
        padding: '8px 16px',
        margin: '4px',
        textTransform: 'none',
        '&:hover': {
            backgroundColor: '#f5f5f5',
        },
    },
    activeBankButton: {
        borderRadius: '4px',
        border: '1px solid #0a3d62',
        backgroundColor: '#e3f2fd',
        color: '#0a3d62',
        padding: '8px 16px',
        margin: '4px',
        textTransform: 'none',
    },
    receiptContainer: {
        width: '40%',
        backgroundColor: '#f5f5f5',
        padding: '20px',
        borderRight: '1px solid #ddd',
        fontFamily: 'monospace',
        fontSize: '12px',
        overflowY: 'auto',
        height: '100vh',
    },
    receiptHeader: {
        textAlign: 'center',
        marginBottom: '10px',
    },
    receiptOrderId: {
        border: '1px dashed #ccc',
        padding: '10px',
        textAlign: 'center',
        marginBottom: '15px',
    },
    receiptDivider: {
        borderTop: '1px dashed #ccc',
        margin: '10px 0',
    },
    receiptFooter: {
        textAlign: 'center',
        marginTop: '20px',
        fontSize: '11px',
    },
    receiptLogo: {
        fontWeight: 'bold',
        fontSize: '16px',
        textAlign: 'center',
        marginTop: '10px',
    },
    receiptRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '5px',
    },
    receiptTotal: {
        fontWeight: 'bold',
        marginTop: '10px',
        borderTop: '1px dashed #ccc',
        paddingTop: '10px',
    },
};

// Sample data
const orders = [
    {
        id: 1,
        customer: 'Qafi Latif',
        tableNumber: 'T2',
        items: 4,
        status: 'Ready to serve',
        statusCode: 'ready',
        amount: 47.0,
        orderNumber: '001',
        isVIP: true,
        type: 'dine-in',
    },
    {
        id: 2,
        customer: 'Hamid Indra',
        tableNumber: 'T3',
        items: 4,
        status: 'Order Done',
        statusCode: 'done',
        amount: 47.0,
        orderNumber: '001',
        isVIP: false,
        type: 'dine-in',
    },
    {
        id: 3,
        customer: 'Miles Esther',
        tableNumber: 'T4',
        items: 4,
        status: 'Order Done',
        statusCode: 'done',
        amount: 47.0,
        orderNumber: '001',
        isVIP: false,
        type: 'dine-in',
    },
    {
        id: 4,
        customer: 'Miles Esther',
        tableNumber: 'DE',
        items: 4,
        status: 'Order Cancelled',
        statusCode: 'cancelled',
        amount: 10.0,
        orderNumber: '001',
        isVIP: false,
        type: 'delivery',
    },
];

const orderDetail = {
    id: '#123',
    customer: 'Qafi Latif',
    tableNumber: 'T14',
    date: '12. Jan 2024',
    cashier: 'Tynisha Obey',
    cashierAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    workingTime: '15.00 - 22.00 PM',
    isVIP: true,
    items: [
        {
            name: 'Cappucino',
            category: 'Coffee & Beverage',
            variant: 'Ice, Large, Normal sugar',
            quantity: 1,
            price: 5.0,
            image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
        },
        {
            name: 'Buttermilk Waffle',
            category: 'Food & Snack',
            variant: 'Choco',
            quantity: 2,
            price: 5.0,
            image: 'https://images.unsplash.com/photo-1562376552-0d160a2f35b6?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
        },
        {
            name: 'At Home Classic',
            category: 'Imaji at Home',
            variant: '250 gr',
            quantity: 1,
            price: 4.0,
            image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
        },
    ],
    subtotal: 19.0,
    discount: 0,
    tax: 2.28,
    total: 16.72,
    payment: {
        method: 'Cash',
        amount: 20.0,
        change: 3.28,
    },
};

const paymentOrderDetail = {
    id: 'ORDER001',
    customer: 'Ravi Kamil',
    tableNumber: 'T2',
    date: 'Wed, May 27, 2020 • 9:27:53 AM',
    cashier: 'Tynisha Obey',
    workingTime: '15.00 - 22.00 PM',
    items: [
        { name: 'Cappuccino', quantity: 2, price: 5.0, total: 10.0 },
        { name: 'Soda Beverage', quantity: 3, price: 5.0, total: 15.0 },
        { name: 'Chocolate Croissant', quantity: 2, price: 5.0, total: 10.0 },
        { name: 'French Toast Sugar', quantity: 3, price: 4.0, total: 12.0 },
    ],
    subtotal: 47.0,
    discount: 0,
    tax: 5.64,
    total: 52.64,
    payment: {
        method: 'Cash',
        amount: 60.0,
        change: 7.36,
    },
};

const trackingSteps = [
    {
        title: 'Successfully Delivered',
        time: 'Thursday, 4 April 2024, 08:17 AM',
        completed: true,
        hasProof: true,
        proofImage: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-O8EAr4Sr4VdJp28I2jkRandb7W6KeU.png',
        proofText: 'Photo Proof of Delivery',
        proofAddedBy: 'Added at 12:23 PM by Jhon Andi (Courier)',
    },
    {
        title: 'Processed at Delivered Center',
        time: 'Thursday, 4 April 2024, 03:07 AM',
        completed: true,
    },
    {
        title: 'Arrived at Sorting Center',
        time: 'Monday, 4 April 2024, 22:45 PM',
        completed: true,
    },
    {
        title: 'Shipment En Route',
        time: 'Monday, 4 April 2024, 22:24 PM',
        completed: true,
    },
    {
        title: 'Arrived At Sorting Center',
        time: 'Monday, 4 April 2024, 15:13 PM',
        completed: true,
    },
    {
        title: 'Shipment En Route',
        time: 'Monday, 3 April 2024, 12:14 PM',
        completed: true,
    },
];

function TransactionDashboard({ Invoices, totalOrders }) {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [openFilterModal, setOpenFilterModal] = useState(false);
    const [openOrderDetailModal, setOpenOrderDetailModal] = useState(false);
    const [openTrackOrderModal, setOpenTrackOrderModal] = useState(false);
    const [openPaymentModal, setOpenPaymentModal] = useState(false);
    const [openPaymentSuccessModal, setOpenPaymentSuccessModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filters, setFilters] = useState({
        sort: 'asc',
        orderType: 'all',
        memberStatus: 'all',
        orderStatus: 'all',
    });

    // Filter sections expand/collapse state
    const [expandedSections, setExpandedSections] = useState({
        sorting: true,
        orderType: true,
        memberStatus: true,
        orderStatus: true,
    });

    // Payment state
    const [inputAmount, setInputAmount] = useState('110.00');
    const [customerChanges, setCustomerChanges] = useState('0.00');
    const [activePaymentMethod, setActivePaymentMethod] = useState('cash');
    const [selectedBank, setSelectedBank] = useState('bca');

    // Bank transfer form state
    const [accountNumber, setAccountNumber] = useState('');
    const [cardHolderName, setCardHolderName] = useState('');
    const [cvvCode, setCvvCode] = useState('');

    const [openRejectModal, setOpenRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

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
        // Reset payment method to cash when opening payment modal
        setActivePaymentMethod('cash');
        setInputAmount('110.00');
        setCustomerChanges((110 - paymentOrderDetail.total).toFixed(2));
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
            sort: 'asc',
            orderType: 'all',
            memberStatus: 'all',
            orderStatus: 'all',
        });
    };

    const handleApplyFilters = () => {
        setOpenFilterModal(false);
        // Here you would typically apply the filters to your data
        console.log('Applied filters:', filters);
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
        if (inputAmount === '110.00') {
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
            setCustomerChanges((Number.parseFloat(newAmount) - total).toFixed(2));
        } else {
            setInputAmount('0');
            setCustomerChanges((0 - paymentOrderDetail.total).toFixed(2));
        }
    };

    const handleDecimalClick = () => {
        if (!inputAmount.includes('.')) {
            const newAmount = inputAmount + '.';
            setInputAmount(newAmount);
        }
    };

    const handlePaymentMethodChange = (method) => {
        setActivePaymentMethod(method);
    };

    const handleBankSelection = (bank) => {
        setSelectedBank(bank);
    };

    const handlePrintReceipt = () => {
        // Create a new window for printing
        const printWindow = window.open('', '_blank');

        // Generate the receipt content to print
        const content = `
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 10px; }
            .order-id { border: 1px dashed #ccc; padding: 10px; text-align: center; margin: 15px 0; }
            .divider { border-top: 1px dashed #ccc; margin: 10px 0; }
            .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .total { font-weight: bold; margin-top: 10px; }
            .footer { text-align: center; margin-top: 20px; font-size: 11px; }
            .logo { font-weight: bold; font-size: 16px; text-align: center; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>${paymentOrderDetail.date}</div>
          </div>

          <div class="order-id">
            <div>Order Id</div>
            <div><strong>${paymentOrderDetail.id}</strong></div>
          </div>

          <div class="row">
            <div>Cashier</div>
            <div>${paymentOrderDetail.cashier}</div>
          </div>

          <div class="row">
            <div>Working Time</div>
            <div>${paymentOrderDetail.workingTime}</div>
          </div>

          <div class="divider"></div>

          <div class="row">
            <div>Customer Name</div>
            <div>${paymentOrderDetail.customer}</div>
          </div>

          <div class="row">
            <div>Member Id Card</div>
            <div>-</div>
          </div>

          <div class="row">
            <div>Order Type</div>
            <div>Dine In</div>
          </div>

          <div class="row">
            <div>Table Number</div>
            <div>${paymentOrderDetail.tableNumber}</div>
          </div>

          <div class="divider"></div>

          ${paymentOrderDetail.items
              .map(
                  (item) => `
            <div style="margin-bottom: 10px;">
              <div><strong>${item.name}</strong></div>
              <div class="row">
                <div>${item.quantity} x Rs ${item.price.toFixed(2)}</div>
                <div>Rs ${item.total.toFixed(2)}</div>
              </div>
            </div>
          `,
              )
              .join('')}

          <div class="divider"></div>

          <div class="row">
            <div>Subtotal</div>
            <div>Rs ${paymentOrderDetail.subtotal.toFixed(2)}</div>
          </div>

          <div class="row">
            <div>Discount</div>
            <div>Rs ${paymentOrderDetail.discount}</div>
          </div>

          <div class="row">
            <div>Tax (12%)</div>
            <div>Rs ${paymentOrderDetail.tax.toFixed(2)}</div>
          </div>

          <div class="divider"></div>

          <div class="row total">
            <div>Total Amount</div>
            <div>Rs ${paymentOrderDetail.total.toFixed(2)}</div>
          </div>

          <div class="footer">
            <p>Thanks for having our passion. Drop by again. If your orders aren't still visible, you're always welcome here!</p>
          </div>

          <div class="logo">
            IMAJI Coffee.
          </div>
        </body>
      </html>
    `;

        // Write the content to the new window and print it
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    const handleOpenRejectModal = () => {
        setOpenRejectModal(true);
    };

    const handleCloseRejectModal = () => {
        setOpenRejectModal(false);
        setRejectReason('');
    };

    const handleRejectOrder = () => {
        console.log('Order rejected with reason:', rejectReason);
        setOpenRejectModal(false);
        setOpenOrderDetailModal(false);
        setRejectReason('');
    };

    const handlePrintOrderDetail = () => {
        // Create a new window for printing
        const printWindow = window.open('', '_blank');

        // Generate the content to print
        const content = `
      <html>
        <head>
          <title>Order Detail</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .order-id { font-weight: bold; margin-bottom: 10px; }
            .customer-info { margin-bottom: 15px; }
            .item { margin-bottom: 10px; }
            .item-name { font-weight: bold; }
            .item-variant { color: #666; font-size: 12px; }
            .summary { margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; }
            .total { font-weight: bold; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Order Detail</h2>
            <div class="order-id">Order ID: ${orderDetail.id}</div>
          </div>

          <div class="customer-info">
            <p><strong>Customer:</strong> ${orderDetail.customer}</p>
            <p><strong>Table:</strong> ${orderDetail.tableNumber}</p>
            <p><strong>Date:</strong> ${orderDetail.date}</p>
            <p><strong>Cashier:</strong> ${orderDetail.cashier}</p>
          </div>

          <h3>Items</h3>
          ${orderDetail.items
              .map(
                  (item) => `
            <div class="item">
              <div class="item-name">${item.name} (${item.quantity} x Rs ${item.price.toFixed(2)})</div>
              <div class="item-variant">Variant: ${item.variant}</div>
              <div>Rs ${(item.quantity * item.price).toFixed(2)}</div>
            </div>
          `,
              )
              .join('')}

          <div class="summary">
            <p>Subtotal: Rs ${orderDetail.subtotal.toFixed(2)}</p>
            <p>Discount: Rs ${orderDetail.discount.toFixed(2)}</p>
            <p>Tax (12%): Rs ${orderDetail.tax.toFixed(2)}</p>
            <p class="total">Total: Rs ${orderDetail.total.toFixed(2)}</p>
          </div>

          <div class="payment">
            <p><strong>Payment Method:</strong> ${orderDetail.payment.method}</p>
            <p><strong>Amount Paid:</strong> Rs ${orderDetail.payment.amount.toFixed(2)}</p>
            <p><strong>Change:</strong> Rs ${orderDetail.payment.change.toFixed(2)}</p>
          </div>
        </body>
      </html>
    `;

        // Write the content to the new window and print it
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    const getStatusChipColor = (status) => {
        switch (status) {
            case 'pending':
                return '#e3f2fd';
            case 'completed':
                return '#e8f5e9';
            case 'cancelled':
                return '#ffebee';
            default:
                return '#e0e0e0';
        }
    };

    const getStatusChipTextColor = (status) => {
        switch (status) {
            case 'pending':
                return '#0288d1';
            case 'completed':
                return '#388e3c';
            case 'cancelled':
                return '#d32f2f';
            default:
                return '#616161';
        }
    };

    const getAvatarStyle = (type) => {
        switch (type) {
            case 'delivery':
                return styles.deliveryAvatar;
            case 'pickup':
                return styles.pickupAvatar;
            default:
                return styles.tableAvatar;
        }
    };

    // Receipt component for reuse
    const Receipt = ({ orderData, showButtons = true }) => (
        <Box sx={styles.receiptContainer}>
            <Box sx={styles.receiptHeader}>
                <Typography variant="caption">{orderData.date}</Typography>
            </Box>

            <Box sx={styles.receiptOrderId}>
                <Typography variant="caption" color="text.secondary">
                    Order Id
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                    {orderData.id}
                </Typography>
            </Box>

            <Box sx={styles.receiptRow}>
                <Typography variant="caption" color="text.secondary">
                    Cashier
                </Typography>
                <Typography variant="caption">{orderData.cashier}</Typography>
            </Box>

            <Box sx={styles.receiptRow}>
                <Typography variant="caption" color="text.secondary">
                    Working Time
                </Typography>
                <Typography variant="caption">{orderData.workingTime}</Typography>
            </Box>

            <Box sx={styles.receiptDivider} />

            <Box sx={styles.receiptRow}>
                <Typography variant="caption" color="text.secondary">
                    Customer Name
                </Typography>
                <Typography variant="caption">{orderData.customer}</Typography>
            </Box>

            <Box sx={styles.receiptRow}>
                <Typography variant="caption" color="text.secondary">
                    Member Id Card
                </Typography>
                <Typography variant="caption">-</Typography>
            </Box>

            <Box sx={styles.receiptRow}>
                <Typography variant="caption" color="text.secondary">
                    Order Type
                </Typography>
                <Typography variant="caption">Dine In</Typography>
            </Box>

            <Box sx={styles.receiptRow}>
                <Typography variant="caption" color="text.secondary">
                    Table Number
                </Typography>
                <Typography variant="caption">{orderData.tableNumber}</Typography>
            </Box>

            <Box sx={styles.receiptDivider} />

            {orderData.items.map((item, index) => (
                <Box key={index} mb={1.5}>
                    <Typography variant="caption" fontWeight="medium">
                        {item.name}
                    </Typography>
                    <Box sx={styles.receiptRow}>
                        <Typography variant="caption" color="text.secondary">
                            {item.quantity} x Rs {item.price.toFixed(2)}
                        </Typography>
                        <Typography variant="caption">Rs {item.total.toFixed(2)}</Typography>
                    </Box>
                </Box>
            ))}

            <Box sx={styles.receiptDivider} />

            <Box sx={styles.receiptRow}>
                <Typography variant="caption" color="text.secondary">
                    Subtotal
                </Typography>
                <Typography variant="caption">Rs {orderData.subtotal.toFixed(2)}</Typography>
            </Box>

            <Box sx={styles.receiptRow}>
                <Typography variant="caption" color="text.secondary">
                    Discount
                </Typography>
                <Typography variant="caption">Rs {orderData.discount}</Typography>
            </Box>

            <Box sx={styles.receiptRow}>
                <Typography variant="caption" color="text.secondary">
                    Tax (12%)
                </Typography>
                <Typography variant="caption">Rs {orderData.tax.toFixed(2)}</Typography>
            </Box>

            <Box sx={styles.receiptDivider} />

            <Box sx={styles.receiptTotal}>
                <Typography variant="body2" fontWeight="bold" color="#0a3d62">
                    Total Amount
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="#0a3d62">
                    Rs {orderData.total.toFixed(2)}
                </Typography>
            </Box>

            <Box sx={styles.receiptFooter}>
                <Typography variant="caption" fontSize="0.65rem">
                    Thanks for having our passion. Drop by again. If your orders aren't still visible, you're always welcome here!
                </Typography>
            </Box>

            <Box sx={styles.receiptLogo}>
                <Typography variant="h6" fontWeight="bold" color="#0a3d62">
                    IMAJI Coffee.
                </Typography>
            </Box>

            {showButtons && (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mt: 3,
                    }}
                >
                    <Button
                        variant="outlined"
                        onClick={handleClosePaymentSuccess}
                        sx={{
                            color: '#333',
                            borderColor: '#ddd',
                            textTransform: 'none',
                        }}
                    >
                        Close
                    </Button>
                    <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrintReceipt} sx={styles.printReceiptButton}>
                        Print Receipt
                    </Button>
                </Box>
            )}
        </Box>
    );

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
                <div style={styles.root}>
                    <Box p={2}>
                        {/* Tab Navigation */}
                        <Box
                            display="flex"
                            mb={2}
                            overflow="auto"
                            pb={1}
                            style={{
                                background: '#f0f0f0',
                                padding: '20px',
                                borderRadius: '10px',
                            }}
                        >
                            <Button style={activeTab === 'all' ? styles.activeTabButton : styles.tabButton} onClick={() => handleTabChange('all')}>
                                All transactions
                            </Button>
                            <Button
                                style={activeTab === 'dine-in' ? styles.activeTabButton : styles.tabButton}
                                onClick={() => handleTabChange('dine-in')}
                            >
                                Dine In
                            </Button>
                            <Button
                                style={activeTab === 'pickup' ? styles.activeTabButton : styles.tabButton}
                                onClick={() => handleTabChange('pickup')}
                            >
                                Pick Up
                            </Button>
                            <Button
                                style={activeTab === 'delivery' ? styles.activeTabButton : styles.tabButton}
                                onClick={() => handleTabChange('delivery')}
                            >
                                Delivery
                            </Button>
                            <Button
                                style={activeTab === 'takeaway' ? styles.activeTabButton : styles.tabButton}
                                onClick={() => handleTabChange('takeaway')}
                            >
                                Takeaway
                            </Button>
                            <Button
                                style={activeTab === 'reservation' ? styles.activeTabButton : styles.tabButton}
                                onClick={() => handleTabChange('reservation')}
                            >
                                Reservation
                            </Button>
                        </Box>
                        <Box
                            p={2}
                            style={{
                                background: '#fbfbfb',
                                padding: '20px',
                                borderRadius: '10px',
                            }}
                        >
                            {/* Header */}
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography
                                    variant="h4"
                                    fontWeight="bold"
                                    sx={{
                                        fontWeight: 500,
                                        fontSize: '36px',
                                    }}
                                >
                                    240{' '}
                                    <span
                                        style={{
                                            fontSize: '16px',
                                            fontWeight: '400',
                                            color: '#7F7F7F',
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
                                        sx={{ width: '300px' }}
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
                                <Grid item xs={12}>
                                    <pre>{JSON.stringify(Invoices, null, 2)}</pre>
                                    {Invoices.map((invoice) => (
                                        <div key={invoice.id}>
                                            <p>Order ID: {invoice.order?.id}</p>
                                            <p>Order Placed By: {invoice.order?.user?.name}</p>
                                        </div>
                                    ))}

                                    {Invoices.map((order) => (
                                        <Card
                                            sx={{
                                                ...styles.orderCard,
                                                borderRadius: 0,
                                                boxShadow: 'none',
                                                border: '1px solid #E3E3E3',
                                                transition: 'background-color 0.3s ease',
                                                '&:hover': {
                                                    backgroundColor: '#eeeeee',
                                                    cursor: 'pointer',
                                                },
                                            }}
                                            key={order.id}
                                            onClick={() => handleOpenOrderDetail(order)}
                                        >
                                            <CardContent>
                                                <Box display="flex" alignItems="center">
                                                    <Avatar style={getAvatarStyle(order.order.order_type)}>{order.order.table_id}</Avatar>

                                                    <Avatar
                                                        style={{
                                                            marginLeft: 8,
                                                            backgroundColor: '#E3E3E3',
                                                            width: 32,
                                                            height: 32,
                                                        }}
                                                    >
                                                        <RoomServiceIcon
                                                            style={{
                                                                color: '#000',
                                                                fontSize: 20,
                                                            }}
                                                        />
                                                    </Avatar>
                                                    <Box ml={2} flex={1}>
                                                        <Box display="flex" alignItems="center">
                                                            <Typography
                                                                variant="subtitle1"
                                                                sx={{
                                                                    fontWeight: 500,
                                                                    fontSize: '18px',
                                                                }}
                                                            >
                                                                {order.order?.user?.name}
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
                                                                fontSize: '14px',
                                                            }}
                                                        >
                                                            {totalOrders} Items
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
                                                                fontSize: '20px',
                                                            }}
                                                        >
                                                            <Typography
                                                                color="#7F7F7F"
                                                                sx={{
                                                                    fontWeight: 400,
                                                                    fontSize: '16px',
                                                                }}
                                                            >
                                                                Rs{' '}
                                                            </Typography>
                                                            {order.amount}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                                                    <Box display="flex" alignItems="center">
                                                        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                                            #{order?.order.order_number}
                                                        </Typography>

                                                        <Chip
                                                            label={
                                                                order?.order.status === 'pending'
                                                                    ? 'Pending'
                                                                    : order?.status === 'in_progress'
                                                                      ? 'In Progress'
                                                                      : order?.status === 'completed'
                                                                        ? '' // Don't show label if completed
                                                                        : order?.status === 'cancelled'
                                                                          ? 'Order Cancelled'
                                                                          : 'Unknown' // Default if status is not recognized
                                                            }
                                                            size="small"
                                                            style={{
                                                                ...styles.statusChip,
                                                                backgroundColor: getStatusChipColor(order?.order.status),
                                                                color: getStatusChipTextColor(order?.order.status),
                                                            }}
                                                        />
                                                    </Box>

                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenPayment(order);
                                                        }}
                                                        sx={{
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            textTransform: 'none',
                                                            backgroundColor: '#0a3d62',
                                                            color: 'white',
                                                        }}
                                                    >
                                                        Payment Now
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {orders.map((order) => (
                                        <Card
                                            sx={{
                                                ...styles.orderCard,
                                                borderRadius: 0,
                                                boxShadow: 'none',
                                                border: '1px solid #E3E3E3',
                                                transition: 'background-color 0.3s ease',
                                                '&:hover': {
                                                    backgroundColor: '#eeeeee',
                                                    cursor: 'pointer',
                                                },
                                            }}
                                            key={order.id}
                                            onClick={() => handleOpenOrderDetail(order)}
                                        >
                                            <CardContent>
                                                <Box display="flex" alignItems="center">
                                                    <Avatar style={getAvatarStyle(order.type)}>{order.tableNumber}</Avatar>

                                                    {/* Waiter Icon */}
                                                    <Avatar
                                                        style={{
                                                            marginLeft: 8,
                                                            backgroundColor: '#E3E3E3',
                                                            width: 32,
                                                            height: 32,
                                                        }}
                                                    >
                                                        <RoomServiceIcon
                                                            style={{
                                                                color: '#000',
                                                                fontSize: 20,
                                                            }}
                                                        />
                                                    </Avatar>
                                                    <Box ml={2} flex={1}>
                                                        <Box display="flex" alignItems="center">
                                                            <Typography
                                                                variant="subtitle1"
                                                                sx={{
                                                                    fontWeight: 500,
                                                                    fontSize: '18px',
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
                                                                fontSize: '14px',
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
                                                                fontSize: '20px',
                                                            }}
                                                        >
                                                            <Typography
                                                                color="#7F7F7F"
                                                                sx={{
                                                                    fontWeight: 400,
                                                                    fontSize: '16px',
                                                                }}
                                                            >
                                                                Rs{' '}
                                                            </Typography>
                                                            {order.amount.toFixed(2)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                                                    <Box display="flex" alignItems="center">
                                                        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                                            #{order.orderNumber}
                                                        </Typography>
                                                        <Chip
                                                            label={order.status}
                                                            size="small"
                                                            style={{
                                                                ...styles.statusChip,
                                                                backgroundColor: getStatusChipColor(order.statusCode),
                                                                color: getStatusChipTextColor(order.statusCode),
                                                            }}
                                                        />
                                                    </Box>

                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenPayment(order);
                                                        }}
                                                        sx={{
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            textTransform: 'none',
                                                            backgroundColor: '#0a3d62',
                                                            color: 'white',
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
                                position: 'fixed',
                                top: 0,
                                right: 0,
                                margin: 0,
                                height: '100vh',
                                maxHeight: '100vh',
                                width: '100%',
                                maxWidth: '600px',
                                borderRadius: 0,
                                overflow: 'auto',
                            },
                        }}
                    >
                        <Box sx={{ p: 3 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                <Typography variant="h6" fontWeight="bold">
                                    Menu Filter
                                </Typography>
                                <IconButton onClick={handleCloseFilterModal} edge="end">
                                    <CloseIcon />
                                </IconButton>
                            </Box>

                            {/* Sorting Section */}
                            <Box
                                className={styles.filterSection}
                                sx={{
                                    mb: 3,
                                    border: '1px solid #eee',
                                    borderRadius: '8px',
                                    p: 2,
                                    backgroundColor: '#fff',
                                    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.05)',
                                }}
                            >
                                <Box
                                    className={styles.filterHeader}
                                    onClick={() => toggleSection('sorting')}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Typography variant="subtitle1">Sorting</Typography>
                                    <KeyboardArrowDownIcon
                                        sx={{
                                            transform: expandedSections.sorting ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.3s ease',
                                        }}
                                    />
                                </Box>

                                <Collapse in={expandedSections.sorting}>
                                    <Box
                                        sx={{
                                            mt: 2,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'baseline',
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ mb: 1, color: '#555' }}>
                                            By Order Id
                                        </Typography>
                                        <Box display="flex" gap={2}>
                                            <Button
                                                variant="contained"
                                                onClick={() => handleFilterChange('sort', 'asc')}
                                                sx={{
                                                    backgroundColor: filters.sort === 'asc' ? '#b3e5fc' : '#e3f2fd',
                                                    color: '#000',
                                                    borderRadius: '20px',
                                                    textTransform: 'none',
                                                    fontWeight: 500,
                                                    '&:hover': {
                                                        backgroundColor: '#b3e5fc',
                                                    },
                                                    minWidth: '130px',
                                                }}
                                                startIcon={
                                                    <span
                                                        style={{
                                                            fontSize: '16px',
                                                        }}
                                                    >
                                                        ↑
                                                    </span>
                                                }
                                            >
                                                Ascending
                                            </Button>
                                            <Button
                                                variant="contained"
                                                onClick={() => handleFilterChange('sort', 'desc')}
                                                sx={{
                                                    backgroundColor: filters.sort === 'desc' ? '#b3e5fc' : '#e3f2fd',
                                                    color: '#000',
                                                    borderRadius: '20px',
                                                    textTransform: 'none',
                                                    fontWeight: 500,
                                                    '&:hover': {
                                                        backgroundColor: '#b3e5fc',
                                                    },
                                                    minWidth: '130px',
                                                }}
                                                startIcon={
                                                    <span
                                                        style={{
                                                            fontSize: '16px',
                                                        }}
                                                    >
                                                        ↓
                                                    </span>
                                                }
                                            >
                                                Descending
                                            </Button>
                                        </Box>
                                    </Box>
                                </Collapse>
                            </Box>

                            {/* Order Type Section */}
                            <Box
                                className={styles.filterSection}
                                sx={{
                                    mb: 3,
                                    border: '1px solid #eee',
                                    borderRadius: '8px',
                                    p: 2,
                                    backgroundColor: '#fff',
                                    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.05)',
                                }}
                            >
                                <Box
                                    className={styles.filterHeader}
                                    onClick={() => toggleSection('orderType')}
                                    sx={{
                                        p: 0,
                                        mb: 1,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Typography variant="subtitle1">Order Type</Typography>
                                    <KeyboardArrowDownIcon
                                        sx={{
                                            transform: expandedSections.orderType ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.3s',
                                        }}
                                    />
                                </Box>

                                <Collapse in={expandedSections.orderType}>
                                    <Box sx={{ mb: 1 }}>
                                        <Box display="flex" flexWrap="wrap" gap={1}>
                                            {[
                                                {
                                                    label: 'All Status',
                                                    value: 'all',
                                                    icon: null,
                                                },
                                                {
                                                    label: 'Dine In',
                                                    value: 'dine-in',
                                                    icon: <DiningIcon />,
                                                },
                                                {
                                                    label: 'Pick Up',
                                                    value: 'pickup',
                                                    icon: <TakeoutIcon />,
                                                },
                                                {
                                                    label: 'Delivery',
                                                    value: 'delivery',
                                                    icon: <DeliveryIcon />,
                                                },
                                                {
                                                    label: 'Takeaway',
                                                    value: 'takeaway',
                                                    icon: <TakeoutIcon />,
                                                },
                                                {
                                                    label: 'Reservation',
                                                    value: 'reservation',
                                                    icon: <ReservationIcon />,
                                                },
                                            ].map((item) => (
                                                <Chip
                                                    key={item.value}
                                                    label={item.label}
                                                    onClick={() => handleFilterChange('orderType', item.value)}
                                                    sx={{
                                                        backgroundColor: filters.orderType === item.value ? '#0a3d62' : '#b3e5fc', // light blue for unselected
                                                        color: filters.orderType === item.value ? 'white' : '#0a3d62',
                                                        fontWeight: 500,
                                                        borderRadius: '16px', // more round
                                                        px: 2,
                                                        py: 0.5,
                                                        fontSize: '0.875rem',
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                </Collapse>
                            </Box>
                            {/* Order Status Section */}
                            <Box
                                className={styles.filterSection}
                                sx={{
                                    mb: 3,
                                    border: '1px solid #eee',
                                    borderRadius: '8px',
                                    p: 2,
                                    backgroundColor: '#fff',
                                    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.05)',
                                }}
                            >
                                <Box
                                    className={styles.filterHeader}
                                    onClick={() => toggleSection('orderStatus')}
                                    sx={{
                                        p: 0,
                                        mb: 1,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Typography variant="subtitle1">Order Status</Typography>
                                    <KeyboardArrowDownIcon
                                        sx={{
                                            transform: expandedSections.orderStatus ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.3s',
                                        }}
                                    />
                                </Box>
                                <Collapse in={expandedSections.orderStatus}>
                                    <Box sx={{ mb: 1 }}>
                                        <Box display="flex" flexWrap="wrap" gap={1}>
                                            <Chip
                                                label="All Status"
                                                onClick={() => handleFilterChange('orderStatus', 'all')}
                                                sx={{
                                                    backgroundColor: filters.orderStatus === 'all' ? '#003049' : '#cce5ff',
                                                    color: filters.orderStatus === 'all' ? '#fff' : '#003049',
                                                    fontWeight: 500,
                                                    borderRadius: '20px',
                                                    px: 2,
                                                }}
                                                icon={
                                                    filters.orderStatus === 'all' ? (
                                                        <CheckIcon
                                                            style={{
                                                                color: 'white',
                                                            }}
                                                        />
                                                    ) : null
                                                }
                                            />
                                            <Chip
                                                label="Ready to serve"
                                                onClick={() => handleFilterChange('orderStatus', 'ready')}
                                                sx={{
                                                    backgroundColor: filters.orderStatus === 'ready' ? '#003049' : '#cce5ff',
                                                    color: filters.orderStatus === 'ready' ? '#fff' : '#003049',
                                                    fontWeight: 500,
                                                    borderRadius: '20px',
                                                    px: 2,
                                                }}
                                                icon={
                                                    <CheckCircleIcon
                                                        style={{
                                                            color: filters.orderStatus === 'ready' ? 'white' : '#003049',
                                                        }}
                                                    />
                                                }
                                            />
                                            <Chip
                                                label="Cooking Process"
                                                onClick={() => handleFilterChange('orderStatus', 'cooking')}
                                                sx={{
                                                    backgroundColor: filters.orderStatus === 'cooking' ? '#003049' : '#cce5ff',
                                                    color: filters.orderStatus === 'cooking' ? '#fff' : '#003049',
                                                    fontWeight: 500,
                                                    borderRadius: '20px',
                                                    px: 2,
                                                }}
                                                icon={
                                                    <RestaurantIcon
                                                        style={{
                                                            color: filters.orderStatus === 'cooking' ? 'white' : '#003049',
                                                        }}
                                                    />
                                                }
                                            />
                                            <Chip
                                                label="Waiting to payment"
                                                onClick={() => handleFilterChange('orderStatus', 'waiting')}
                                                sx={{
                                                    backgroundColor: filters.orderStatus === 'waiting' ? '#003049' : '#cce5ff',
                                                    color: filters.orderStatus === 'waiting' ? '#fff' : '#003049',
                                                    fontWeight: 500,
                                                    borderRadius: '20px',
                                                    px: 2,
                                                }}
                                                icon={
                                                    <ReceiptIcon
                                                        style={{
                                                            color: filters.orderStatus === 'waiting' ? 'white' : '#003049',
                                                        }}
                                                    />
                                                }
                                            />
                                            <Chip
                                                label="Order done"
                                                onClick={() => handleFilterChange('orderStatus', 'done')}
                                                sx={{
                                                    backgroundColor: filters.orderStatus === 'done' ? '#003049' : '#cce5ff',
                                                    color: filters.orderStatus === 'done' ? '#fff' : '#003049',
                                                    fontWeight: 500,
                                                    borderRadius: '20px',
                                                    px: 2,
                                                }}
                                                icon={
                                                    <CheckCircleIcon
                                                        style={{
                                                            color: filters.orderStatus === 'done' ? 'white' : '#003049',
                                                        }}
                                                    />
                                                }
                                            />
                                            <Chip
                                                label="Order Canceled"
                                                onClick={() => handleFilterChange('orderStatus', 'cancelled')}
                                                sx={{
                                                    backgroundColor: filters.orderStatus === 'cancelled' ? '#003049' : '#cce5ff',
                                                    color: filters.orderStatus === 'cancelled' ? '#fff' : '#003049',
                                                    fontWeight: 500,
                                                    borderRadius: '20px',
                                                    px: 2,
                                                }}
                                                icon={
                                                    <CloseIcon
                                                        style={{
                                                            color: filters.orderStatus === 'cancelled' ? 'white' : '#003049',
                                                        }}
                                                    />
                                                }
                                            />
                                        </Box>
                                    </Box>
                                </Collapse>
                            </Box>
                            {/* Member Status Section */}
                            <Box
                                className={styles.filterSection}
                                sx={{
                                    mb: 3,
                                    border: '1px solid #eee',
                                    borderRadius: '8px',
                                    p: 2,
                                    backgroundColor: '#fff',
                                    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.05)',
                                }}
                            >
                                <Box
                                    className={styles.filterHeader}
                                    onClick={() => toggleSection('memberStatus')}
                                    sx={{
                                        p: 0,
                                        mb: 1,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Typography variant="subtitle1">Member Status</Typography>
                                    <KeyboardArrowDownIcon
                                        sx={{
                                            transform: expandedSections.memberStatus ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.3s',
                                        }}
                                    />
                                </Box>
                                <Collapse in={expandedSections.memberStatus}>
                                    <Box sx={{ mb: 1 }}>
                                        <Box display="flex" flexWrap="wrap" gap={1}>
                                            <Chip
                                                label="All Status"
                                                onClick={() => handleFilterChange('memberStatus', 'all')}
                                                sx={{
                                                    backgroundColor: filters.memberStatus === 'all' ? '#003049' : '#cce5ff',
                                                    color: filters.memberStatus === 'all' ? '#fff' : '#003049',
                                                    fontWeight: 500,
                                                    borderRadius: '20px',
                                                    px: 2,
                                                }}
                                                icon={
                                                    filters.memberStatus === 'all' ? (
                                                        <CheckIcon
                                                            style={{
                                                                color: 'white',
                                                            }}
                                                        />
                                                    ) : null
                                                }
                                            />
                                            <Chip
                                                label="Guest"
                                                onClick={() => handleFilterChange('memberStatus', 'guest')}
                                                sx={{
                                                    backgroundColor: filters.memberStatus === 'guest' ? '#003049' : '#cce5ff',
                                                    color: filters.memberStatus === 'guest' ? '#fff' : '#003049',
                                                    fontWeight: 500,
                                                    borderRadius: '20px',
                                                    px: 2,
                                                }}
                                            />
                                            <Chip
                                                label="Star"
                                                onClick={() => handleFilterChange('memberStatus', 'star')}
                                                sx={{
                                                    backgroundColor: filters.memberStatus === 'star' ? '#003049' : '#cce5ff',
                                                    color: filters.memberStatus === 'star' ? '#fff' : '#003049',
                                                    fontWeight: 500,
                                                    borderRadius: '20px',
                                                    px: 2,
                                                }}
                                            />
                                            <Chip
                                                label="Diamond"
                                                onClick={() => handleFilterChange('memberStatus', 'diamond')}
                                                sx={{
                                                    backgroundColor: filters.memberStatus === 'diamond' ? '#003049' : '#cce5ff',
                                                    color: filters.memberStatus === 'diamond' ? '#fff' : '#003049',
                                                    fontWeight: 500,
                                                    borderRadius: '20px',
                                                    px: 2,
                                                }}
                                                icon={
                                                    <DiamondIcon
                                                        style={{
                                                            color: filters.memberStatus === 'diamond' ? 'white' : '#003049',
                                                        }}
                                                    />
                                                }
                                            />
                                        </Box>
                                    </Box>
                                </Collapse>
                            </Box>

                            {/* Footer Buttons */}
                            <Box display="flex" justifyContent="flex-end" gap={1} mt={3}>
                                <Button
                                    variant="outlined"
                                    onClick={handleResetFilters}
                                    sx={{
                                        color: '#333',
                                        borderColor: '#ddd',
                                        textTransform: 'none',
                                    }}
                                >
                                    Reset Filter
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleApplyFilters}
                                    sx={{
                                        backgroundColor: '#0a3d62',
                                        color: 'white',
                                        textTransform: 'none',
                                        '&:hover': {
                                            backgroundColor: '#083352',
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
                                position: 'fixed',
                                top: 0,
                                right: 0,
                                margin: 0,
                                height: '100vh',
                                maxHeight: '100vh',
                                overflow: 'auto',
                                borderRadius: 0,
                            },
                        }}
                    >
                        <Box sx={{ p: 3 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                <Typography variant="h6" fontWeight="bold">
                                    Order Detail
                                </Typography>
                                <IconButton onClick={handleCloseOrderDetail} edge="end">
                                    <CloseIcon />
                                </IconButton>
                            </Box>

                            {/* Customer Info */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Customer Name
                                </Typography>
                                <Box display="flex" alignItems="center" mt={1}>
                                    <Avatar
                                        sx={{
                                            bgcolor: '#f5f5f5',
                                            color: '#333',
                                            width: 36,
                                            height: 36,
                                            mr: 1,
                                        }}
                                    >
                                        {orderDetail.customer.charAt(0)}
                                    </Avatar>
                                    <Typography variant="subtitle1" fontWeight="medium">
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
                                    <Box ml="auto" display="flex" alignItems="center" gap={1}>
                                        <Avatar
                                            sx={{
                                                bgcolor: '#0a3d62',
                                                color: 'white',
                                                width: 36,
                                                height: 36,
                                            }}
                                        >
                                            {orderDetail.tableNumber}
                                        </Avatar>
                                        <IconButton size="small" sx={{ border: '1px solid #e0e0e0' }}>
                                            <HomeIcon />
                                        </IconButton>
                                        <IconButton size="small" sx={{ border: '1px solid #e0e0e0' }}>
                                            <RoomServiceIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Order Info Grid */}
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={4}>
                                    <Typography variant="caption" color="text.secondary">
                                        Order Date
                                    </Typography>
                                    <Typography variant="body2" mt={0.5}>
                                        {orderDetail.date}
                                    </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="caption" color="text.secondary">
                                        Cashier
                                    </Typography>
                                    <Box display="flex" alignItems="center" mt={0.5}>
                                        <Avatar
                                            src={orderDetail.cashierAvatar}
                                            sx={{
                                                width: 20,
                                                height: 20,
                                                mr: 1,
                                            }}
                                        />
                                        <Typography variant="body2">{orderDetail.cashier}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="caption" color="text.secondary">
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
                                        backgroundColor: '#f5f5f5',
                                        color: '#333',
                                        fontWeight: 500,
                                        borderRadius: '4px',
                                    }}
                                />
                            </Box>

                            {/* Order Items */}
                            <Box sx={{ mb: 3 }}>
                                {orderDetail.items.map((item, index) => (
                                    <Box key={index} display="flex" alignItems="center" mb={2}>
                                        <img
                                            src={item.image || '/placeholder.svg'}
                                            alt={item.name}
                                            style={{
                                                width: 50,
                                                height: 50,
                                                borderRadius: 8,
                                                objectFit: 'cover',
                                            }}
                                        />
                                        <Box ml={2} flex={1}>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                {item.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                {item.category}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Variant: {item.variant}
                                            </Typography>
                                        </Box>
                                        <Box textAlign="right">
                                            <Typography variant="caption" color="text.secondary">
                                                Qty: {item.quantity} x Rs {item.price.toFixed(2)}
                                            </Typography>
                                            <Typography variant="subtitle2" fontWeight="bold" display="block">
                                                Rs {(item.quantity * item.price).toFixed(2)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>

                            {/* Order Summary */}
                            <Box sx={{ mb: 3 }}>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                    <Typography variant="body2" color="text.secondary">
                                        Subtotal
                                    </Typography>
                                    <Typography variant="body2">Rs {orderDetail.subtotal.toFixed(2)}</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                    <Typography variant="body2" color="text.secondary">
                                        Discount
                                    </Typography>
                                    <Typography variant="body2" color="#4caf50">
                                        Rs 0% (0)
                                    </Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                    <Typography variant="body2" color="text.secondary">
                                        Tax 12%
                                    </Typography>
                                    <Typography variant="body2">Rs {orderDetail.tax.toFixed(2)}</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between" mt={2}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        Total
                                    </Typography>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        Rs {orderDetail.total.toFixed(2)}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Payment Info */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    p: 2,
                                    bgcolor: '#f9f9f9',
                                    borderRadius: 1,
                                    mb: 3,
                                }}
                            >
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Payment
                                    </Typography>
                                    <Box display="flex" alignItems="center" mt={0.5}>
                                        <ReceiptIcon fontSize="small" sx={{ mr: 1, color: '#0a3d62' }} />
                                        <Typography variant="body2" fontWeight="medium">
                                            {orderDetail.payment.method}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Cash Total
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium" mt={0.5}>
                                        Rs {orderDetail.payment.amount.toFixed(2)}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Customer Change
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium" mt={0.5}>
                                        Rs {orderDetail.payment.change.toFixed(2)}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Action Buttons */}
                            <Box display="flex" justifyContent="space-between" mt={3}>
                                <Button
                                    variant="outlined"
                                    onClick={handleOpenTrackOrder}
                                    sx={{
                                        color: '#333',
                                        borderColor: '#ddd',
                                        textTransform: 'none',
                                    }}
                                >
                                    Track Order
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<PrintIcon />}
                                    onClick={handlePrintOrderDetail}
                                    sx={{
                                        backgroundColor: '#0a3d62',
                                        color: 'white',
                                        textTransform: 'none',
                                        '&:hover': {
                                            backgroundColor: '#083352',
                                        },
                                    }}
                                >
                                    Print Receipt
                                </Button>
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
                                position: 'fixed',
                                top: 0,
                                right: 0,
                                margin: 0,
                                height: '100vh',
                                maxHeight: '100vh',
                                width: '100%',
                                maxWidth: '800px',
                                borderRadius: 0,
                                overflow: 'auto',
                            },
                        }}
                    >
                        <Box sx={{ display: 'flex', height: '100vh' }}>
                            {/* Left Side - Receipt */}
                            <Receipt orderData={paymentOrderDetail} showButtons={false} />

                            {/* Right Side - Payment */}
                            <Box sx={{ flex: 1, p: 3 }}>
                                <Typography variant="h5" fontWeight="bold" mb={4}>
                                    Payment
                                </Typography>

                                {/* Payment Method Tabs */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        borderBottom: '1px solid #e0e0e0',
                                        mb: 3,
                                    }}
                                >
                                    <Box
                                        sx={activePaymentMethod === 'cash' ? styles.activePaymentMethodTab : styles.paymentMethodTab}
                                        onClick={() => handlePaymentMethodChange('cash')}
                                    >
                                        <CreditCardIcon
                                            sx={{
                                                fontSize: 24,
                                                mb: 1,
                                                color: activePaymentMethod === 'cash' ? '#0a3d62' : '#666',
                                            }}
                                        />
                                        <Typography variant="body1" fontWeight={activePaymentMethod === 'cash' ? 'medium' : 'normal'}>
                                            Cash
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={activePaymentMethod === 'bank' ? styles.activePaymentMethodTab : styles.paymentMethodTab}
                                        onClick={() => handlePaymentMethodChange('bank')}
                                    >
                                        <AccountBalanceIcon
                                            sx={{
                                                fontSize: 24,
                                                mb: 1,
                                                color: activePaymentMethod === 'bank' ? '#0a3d62' : '#666',
                                            }}
                                        />
                                        <Typography variant="body1" fontWeight={activePaymentMethod === 'bank' ? 'medium' : 'normal'}>
                                            Bank Transfer
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Cash Payment Form */}
                                {activePaymentMethod === 'cash' && (
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
                                                            <Typography variant="body1">Rs</Typography>
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
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Typography
                                                    variant="h5"
                                                    fontWeight="bold"
                                                    color={Number.parseFloat(customerChanges) < 0 ? '#f44336' : '#333'}
                                                >
                                                    Rs {customerChanges}
                                                </Typography>
                                            </Box>

                                            {/* Quick Amount Buttons */}
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    gap: 1,
                                                    mb: 3,
                                                    flexWrap: 'wrap',
                                                }}
                                            >
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => handleQuickAmountClick(paymentOrderDetail.total.toString())}
                                                    sx={styles.quickAmountButton}
                                                >
                                                    Exact money
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => handleQuickAmountClick('10.00')}
                                                    sx={styles.quickAmountButton}
                                                >
                                                    Rs 10.00
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => handleQuickAmountClick('20.00')}
                                                    sx={styles.quickAmountButton}
                                                >
                                                    Rs 20.00
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => handleQuickAmountClick('50.00')}
                                                    sx={styles.quickAmountButton}
                                                >
                                                    Rs 50.00
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => handleQuickAmountClick('100.00')}
                                                    sx={styles.quickAmountButton}
                                                >
                                                    Rs 100.00
                                                </Button>
                                            </Box>

                                            {/* Numpad */}
                                            <Grid container spacing={1}>
                                                <Grid item xs={4}>
                                                    <Button fullWidth sx={styles.numpadButton} onClick={() => handleNumberClick('1')}>
                                                        1
                                                    </Button>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Button fullWidth sx={styles.numpadButton} onClick={() => handleNumberClick('2')}>
                                                        2
                                                    </Button>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Button fullWidth sx={styles.numpadButton} onClick={() => handleNumberClick('3')}>
                                                        3
                                                    </Button>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Button fullWidth sx={styles.numpadButton} onClick={() => handleNumberClick('4')}>
                                                        4
                                                    </Button>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Button fullWidth sx={styles.numpadButton} onClick={() => handleNumberClick('5')}>
                                                        5
                                                    </Button>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Button fullWidth sx={styles.numpadButton} onClick={() => handleNumberClick('6')}>
                                                        6
                                                    </Button>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Button fullWidth sx={styles.numpadButton} onClick={() => handleNumberClick('7')}>
                                                        7
                                                    </Button>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Button fullWidth sx={styles.numpadButton} onClick={() => handleNumberClick('8')}>
                                                        8
                                                    </Button>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Button fullWidth sx={styles.numpadButton} onClick={() => handleNumberClick('9')}>
                                                        9
                                                    </Button>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Button fullWidth sx={styles.numpadButton} onClick={handleDecimalClick}>
                                                        .
                                                    </Button>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Button fullWidth sx={styles.numpadButton} onClick={() => handleNumberClick('0')}>
                                                        0
                                                    </Button>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Button
                                                        fullWidth
                                                        sx={{
                                                            ...styles.numpadButton,
                                                            backgroundColor: '#ffebee',
                                                            color: '#f44336',
                                                            '&:hover': {
                                                                backgroundColor: '#ffcdd2',
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
                                )}

                                {/* Bank Transfer Form */}
                                {activePaymentMethod === 'bank' && (
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle1" mb={2}>
                                                Choose Bank
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    gap: 1,
                                                    mb: 3,
                                                }}
                                            >
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => handleBankSelection('bca')}
                                                    sx={selectedBank === 'bca' ? styles.activeBankButton : styles.bankButton}
                                                >
                                                    BCA Bank
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => handleBankSelection('citi')}
                                                    sx={selectedBank === 'citi' ? styles.activeBankButton : styles.bankButton}
                                                >
                                                    CITI Bank
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => handleBankSelection('hbl')}
                                                    sx={selectedBank === 'hbl' ? styles.activeBankButton : styles.bankButton}
                                                >
                                                    HBL Bank
                                                </Button>
                                            </Box>

                                            <Typography variant="subtitle1" mb={1}>
                                                Account Number
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                placeholder="e.g. 222-29863902-2"
                                                value={accountNumber}
                                                onChange={(e) => setAccountNumber(e.target.value)}
                                                sx={{ mb: 3 }}
                                            />

                                            <Typography variant="subtitle1" mb={1}>
                                                Card Holder Name
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                placeholder="e.g. Zahid Ullah"
                                                value={cardHolderName}
                                                onChange={(e) => setCardHolderName(e.target.value)}
                                                sx={{ mb: 3 }}
                                            />

                                            <Typography variant="subtitle1" mb={1}>
                                                CVV Code
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                placeholder="e.g. 234"
                                                value={cvvCode}
                                                onChange={(e) => setCvvCode(e.target.value)}
                                                sx={{ mb: 3 }}
                                                type="password"
                                            />
                                        </Grid>
                                    </Grid>
                                )}

                                {/* Footer Buttons */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        mt: 4,
                                    }}
                                >
                                    <Button
                                        variant="outlined"
                                        onClick={handleClosePayment}
                                        sx={{
                                            color: '#333',
                                            borderColor: '#ddd',
                                            textTransform: 'none',
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={handlePayNow} sx={styles.payNowButton}>
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
                                position: 'fixed',
                                top: 0,
                                right: 0,
                                margin: 0,
                                height: '100vh',
                                maxHeight: '100vh',
                                width: '100%',
                                maxWidth: '800px',
                                borderRadius: 0,
                                overflow: 'auto',
                            },
                        }}
                    >
                        <Box sx={{ display: 'flex', height: '100vh' }}>
                            {/* Left Side - Receipt */}
                            <Receipt orderData={paymentOrderDetail} />

                            {/* Right Side - Success Message */}
                            <Box
                                sx={{
                                    flex: 1,
                                    p: 5,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Box sx={styles.successIcon}>
                                    <CheckIcon sx={{ fontSize: 40 }} />
                                </Box>

                                <Typography variant="h4" fontWeight="bold" mb={2} textAlign="center">
                                    Payment Success!
                                </Typography>

                                <Typography variant="body1" color="text.secondary" mb={4} textAlign="center">
                                    You've successfully pay your bill. Well done!
                                </Typography>

                                <Box sx={{ width: '100%', maxWidth: 400 }}>
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="subtitle2" color="text.secondary" mb={1} textAlign="center">
                                            Total Amount
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#0a3d62" textAlign="center">
                                            Rs {paymentOrderDetail.total.toFixed(2)}
                                        </Typography>
                                    </Box>

                                    <Grid container spacing={2} mb={4}>
                                        <Grid item xs={6}>
                                            <Typography variant="subtitle2" color="text.secondary" mb={1}>
                                                Payment Method
                                            </Typography>
                                            <Typography variant="body1">Cash</Typography>
                                        </Grid>
                                        <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                            <Typography variant="subtitle2" color="text.secondary" mb={1}>
                                                Cash
                                            </Typography>
                                            <Typography variant="body1">Rs {paymentOrderDetail.payment.amount.toFixed(2)}</Typography>
                                        </Grid>
                                    </Grid>

                                    <Box sx={{ mb: 3 }}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                            }}
                                        >
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Customer Changes
                                            </Typography>
                                            <Typography variant="body1" fontWeight="medium">
                                                Rs {paymentOrderDetail.payment.change.toFixed(2)}
                                            </Typography>
                                        </Box>
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
                                position: 'fixed',
                                top: 0,
                                right: 0,
                                margin: 0,
                                height: '100vh',
                                maxHeight: '100vh',
                                overflow: 'auto',
                                borderRadius: 0,
                            },
                        }}
                    >
                        <Box style={styles.modalTitle}>
                            <Typography variant="h6" fontWeight="bold">
                                Track Order
                            </Typography>
                            <IconButton onClick={handleCloseTrackOrder} style={styles.closeButton}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <DialogContent>
                            {trackingSteps.map((step, index) => (
                                <Box key={index} style={styles.trackOrderStep}>
                                    {step.completed ? (
                                        <CheckCircleIcon style={styles.trackOrderStepIcon} />
                                    ) : (
                                        <CircleIcon style={styles.trackOrderStepIcon} />
                                    )}
                                    <Box style={styles.trackOrderStepContent}>
                                        <Typography variant="body1" style={styles.trackOrderStepTitle}>
                                            {step.title}
                                        </Typography>
                                        <Typography variant="body2" style={styles.trackOrderStepTime}>
                                            {step.time}
                                        </Typography>
                                        {step.hasProof && (
                                            <Box mt={1}>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {step.proofText}
                                                </Typography>
                                                <Typography variant="body2" style={styles.trackOrderStepTime}>
                                                    {step.proofAddedBy}
                                                </Typography>
                                                <img
                                                    src={step.proofImage || '/placeholder.svg'}
                                                    alt="Delivery Proof"
                                                    style={styles.trackOrderImage}
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
}
export default TransactionDashboard;
