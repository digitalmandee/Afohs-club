'use client';

import SideNav from '@/components/App/SideBar/SideNav';
import { router } from '@inertiajs/react';
import {
    Close as CloseIcon,
    DirectionsCar as DeliveryIcon,
    LocalDining as DiningIcon,
    FilterAlt as FilterIcon,
    Print as PrintIcon,
} from '@mui/icons-material';
import {
    Button,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    MenuItem,
    Paper,
    Select,
    Typography,
} from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useCallback, useState } from 'react';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const OrderManagement = ({ kitchenOrders }) => {
    const [open, setOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('All Order');

    // Filter states
    const [datePeriod, setDatePeriod] = useState('');
    const [fromDate, setFromDate] = useState('Jan 01, 2024');
    const [toDate, setToDate] = useState('August 01, 2024');
    const [statusFilters, setStatusFilters] = useState(['All']);
    const [orderTypeFilters, setOrderTypeFilters] = useState(['All']);
    const [filteredOrder, setFilteredOrder] = useState([]);

    const handleFilterOpen = () => {
        setFilterOpen(true);
    };

    const handleFilterClose = () => {
        setFilterOpen(false);
    };

    // Modify the handleTabChange function to filter orders
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleDatePeriodChange = (period) => {
        setDatePeriod(period);
    };

    const handleStatusFilterChange = (status) => {
        if (status === 'All') {
            setStatusFilters(['All']);
        } else {
            const newFilters = statusFilters.includes('All')
                ? [status]
                : statusFilters.includes(status)
                  ? statusFilters.filter((s) => s !== status)
                  : [...statusFilters, status];

            setStatusFilters(newFilters.length ? newFilters : ['All']);
        }
    };

    const handleOrderTypeFilterChange = (type) => {
        if (type === 'All') {
            setOrderTypeFilters(['All']);
        } else {
            const newFilters = orderTypeFilters.includes('All')
                ? [type]
                : orderTypeFilters.includes(type)
                  ? orderTypeFilters.filter((t) => t !== type)
                  : [...orderTypeFilters, type];

            setOrderTypeFilters(newFilters.length ? newFilters : ['All']);
        }
    };

    const resetFilters = () => {
        setDatePeriod('');
        setFromDate('Jan 01, 2024');
        setToDate('August 01, 2024');
        setStatusFilters(['All']);
        setOrderTypeFilters(['All']);
    };

    const applyFilters = () => {
        // Apply filter logic here
        handleFilterClose();
    };

    // Filter tabs
    // Filter tabs with dynamic counts
    const tabs = [
        { id: 'All Order', count: null },
        { id: 'New Order', count: kitchenOrders?.filter((o) => o.status === 'New Order').length || 0 },
        { id: 'Process', count: kitchenOrders?.filter((o) => o.status === 'Process').length || 0 },
        { id: 'Done', count: kitchenOrders?.filter((o) => o.status === 'Done').length || 0 },
        { id: 'Refund', count: kitchenOrders?.filter((o) => o.status === 'Refund').length || 0 },
    ];

    // Date period options
    const datePeriods = ['Yesterday', 'Last Week', 'Last Month', 'Last 3 Month', 'Last Year', 'Custom Date'];

    // Status filter options
    const statusOptions = ['All', 'New Order', 'Refund', 'Process', 'Done'];

    // Order type filter options
    const orderTypeOptions = ['All', 'Dine', 'Pickup', 'Delivery', 'Takeaway', 'Reservation'];

    // Filter orders based on active tab
    const filteredOrders = (kitchenOrders || []).filter((order) => {
        if (activeTab === 'All Order') {
            return true;
        } else {
            return order.status === activeTab;
        }
    });

    const handleStatusChange = useCallback(
        (e, orderId, currentStatus) => {
            e.preventDefault();

            let nextStatus = null;
            if (currentStatus === 'pending') nextStatus = 'in_progress';
            else if (currentStatus === 'in_progress') nextStatus = 'completed';
            else return;

            const formData = new FormData();
            formData.append('status', nextStatus);

            router.post(route('kitchen.update', orderId), formData, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setFilteredOrder((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: nextStatus } : order)));
                },
                onError: (errors) => {
                    console.error('Status update error:', errors);
                },
            });
        },
        [setFilteredOrder],
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
                <div className="container-fluid p-3">
                    {/* Header with tabs and filter */}
                    <div
                        className="d-flex justify-content-between align-items-center mb-3 p-3"
                        style={{ backgroundColor: '#eeeeee', borderRadius: '10px' }}
                    >
                        <div className="d-flex">
                            {tabs.map((tab) => (
                                <Button
                                    key={tab.id}
                                    variant={activeTab === tab.id ? 'contained' : 'outlined'}
                                    style={{
                                        marginRight: '10px',
                                        borderRadius: '20px',
                                        backgroundColor: activeTab === tab.id ? '#063455' : 'white',
                                        color: activeTab === tab.id ? 'white' : '#063455',
                                        textTransform: 'none',
                                        padding: '6px 16px',
                                        border: '1px solid #063455',
                                    }}
                                    onClick={() => handleTabChange(tab.id)}
                                >
                                    {tab.id} {tab.count !== null && `(${tab.count})`}
                                </Button>
                            ))}
                        </div>
                        <Button
                            variant="outlined"
                            startIcon={<FilterIcon />}
                            onClick={handleFilterOpen}
                            style={{
                                borderRadius: '0px',
                                color: '#063455',
                                border: '1px solid #063455',
                                textTransform: 'none',
                            }}
                        >
                            Filter
                        </Button>
                    </div>

                    {/* Order cards grid */}
                    <div className="row m-1 p-2" style={{ backgroundColor: '#fbfbfb', borderRadius: '10px' }}>
                        {filteredOrders.map((order, index) => {
                            const orderTaking = order.order_takings?.slice(-1)[0];

                            return (
                                <>
                                    <div key={order.id} className="col-md-3 mb-3">
                                        {/* {JSON.stringify(order.order_takings[0].status, null, 2)} */}

                                        <Paper elevation={1} style={{ borderRadius: '8px', overflow: 'hidden' }}>
                                            {/* Order header */}
                                            <div
                                                style={{
                                                    backgroundColor:
                                                        order.status === 'completed'
                                                            ? '#4CAF50'
                                                            : order.status === 'pending'
                                                              ? '#1565C0'
                                                              : order.status === 'in_progress'
                                                                ? '#003366'
                                                                : '#00BCD4',
                                                    color: 'white',
                                                    padding: '12px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <div>
                                                    <Typography variant="h6" style={{ fontWeight: 'bold' }}>
                                                        #{order.id}
                                                        {}
                                                    </Typography>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <Typography variant="body2">{order.start_time}</Typography>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <div
                                                        style={{
                                                            backgroundColor: '#1976D2',
                                                            width: '36px',
                                                            height: '36px',
                                                            borderRadius: '50%',
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            marginRight: '8px',
                                                        }}
                                                    >
                                                        <Typography variant="body2">{order.table_id}</Typography>
                                                    </div>
                                                    <IconButton size="small" style={{ color: 'white' }}>
                                                        {orderTaking.status === 'DE' ? <DiningIcon /> : <DeliveryIcon />}
                                                    </IconButton>
                                                </div>
                                            </div>

                                            {/* Order items */}
                                            <div style={{ padding: '12px' }}>
                                                {order.order_takings.map((item, idx) => (
                                                    <div key={idx} style={{ marginBottom: '8px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="body1">{item.order_item.item}</Typography>
                                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                <Typography variant="body2" style={{ marginRight: '8px' }}>
                                                                    {item.order_item.qty}x
                                                                </Typography>
                                                                <Checkbox
                                                                    // checked={item.checked}
                                                                    size="small"
                                                                    style={{
                                                                        color: item.checked ? '#1976D2' : undefined,
                                                                        padding: '2px',
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* {item.details && !item.details.refund && (
                                                            <div
                                                                style={{
                                                                    display: 'grid',
                                                                    gridTemplateColumns: '1fr 1fr',
                                                                    fontSize: '12px',
                                                                    color: '#666',
                                                                    marginTop: '4px',
                                                                }}
                                                            >
                                                                {Object.entries(item.details).map(([key, value]) => (
                                                                    <React.Fragment key={key}>
                                                                        <div>{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                                                                        <div style={{ textAlign: 'right' }}>{value}</div>
                                                                    </React.Fragment>
                                                                ))}
                                                            </div>
                                                        )} */}

                                                        {/* {item.details && item.details.refund && (
                                                            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                    <div>Reason</div>
                                                                    <div>{item.details.refund.reason}</div>
                                                                </div>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                    <div>Refund Amount</div>
                                                                    <div>{item.details.refund.amount}</div>
                                                                </div>
                                                            </div>
                                                        )} */}
                                                    </div>
                                                ))}

                                                {/* {order.showMore && (
                                                    <Button
                                                        variant="text"
                                                        size="small"
                                                        style={{ color: '#666', textTransform: 'none', padding: '0', fontSize: '12px' }}
                                                    >
                                                        Show More (2)
                                                    </Button>
                                                )} */}
                                            </div>

                                            {/* Order actions */}
                                            <div
                                                style={{
                                                    borderTop: '1px solid #eee',
                                                    padding: '8px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                }}
                                            >
                                                <IconButton size="small">
                                                    <PrintIcon fontSize="small" />
                                                </IconButton>

                                                {['pending', 'in_progress'].includes(order.status) && (
                                                    <Button
                                                        variant="contained"
                                                        fullWidth
                                                        style={{
                                                            marginLeft: '8px',
                                                            backgroundColor: order.status === 'pending' ? '#1565C0' : '#1976D2',
                                                            textTransform: 'none',
                                                        }}
                                                        onClick={(e) => handleStatusChange(e, order.id, order.status)}
                                                    >
                                                        {order.status === 'pending' ? 'Start' : 'Finish'}
                                                    </Button>
                                                )}

                                                {order.status === 'completed' && (
                                                    <div style={{ display: 'flex', marginLeft: '8px' }}>
                                                        <Button
                                                            variant="outlined"
                                                            style={{
                                                                marginRight: '4px',
                                                                textTransform: 'none',
                                                                borderColor: '#e0e0e0',
                                                                color: '#333',
                                                            }}
                                                        >
                                                            Reject
                                                        </Button>
                                                        <Button
                                                            variant="contained"
                                                            style={{
                                                                backgroundColor: '#00BCD4',
                                                                textTransform: 'none',
                                                                color: 'white',
                                                            }}
                                                        >
                                                            Refund
                                                        </Button>
                                                    </div>
                                                )}

                                                {/* {order.status === 'pending' && (
                                                    <Button
                                                        variant="contained"
                                                        fullWidth
                                                        style={{
                                                            marginLeft: '8px',
                                                            backgroundColor: '#1565C0',
                                                            textTransform: 'none',
                                                        }}
                                                    >
                                                        Start
                                                    </Button>
                                                )}

                                                {order.status === 'in_progress' && (
                                                    <Button
                                                        variant="contained"
                                                        fullWidth
                                                        style={{
                                                            marginLeft: '8px',
                                                            backgroundColor: '#003366',
                                                            textTransform: 'none',
                                                        }}
                                                    >
                                                        In Progress
                                                    </Button>
                                                )}
                                                {order.status === 'completed' && (
                                                    <Button
                                                        variant="contained"
                                                        fullWidth
                                                        style={{
                                                            marginLeft: '8px',
                                                            backgroundColor: '#4CAF50',
                                                            textTransform: 'none',
                                                        }}
                                                    >
                                                        Finish
                                                    </Button>
                                                )}

                                                {order.action === 'Print Receipt' && (
                                                    <Button
                                                        variant="text"
                                                        startIcon={<PrintIcon />}
                                                        style={{
                                                            marginLeft: '8px',
                                                            color: '#333',
                                                            textTransform: 'none',
                                                        }}
                                                    >
                                                        Print Receipt
                                                    </Button>
                                                )}

                                                {order.action === 'Refund' && (
                                                    <div style={{ display: 'flex', marginLeft: '8px' }}>
                                                        <Button
                                                            variant="outlined"
                                                            style={{
                                                                marginRight: '4px',
                                                                textTransform: 'none',
                                                                borderColor: '#e0e0e0',
                                                                color: '#333',
                                                            }}
                                                        >
                                                            Reject
                                                        </Button>
                                                        <Button
                                                            variant="contained"
                                                            style={{
                                                                backgroundColor: '#00BCD4',
                                                                textTransform: 'none',
                                                                color: 'white',
                                                            }}
                                                        >
                                                            Refund
                                                        </Button>
                                                    </div>
                                                )} */}
                                            </div>
                                        </Paper>
                                    </div>
                                </>
                            );
                        })}
                    </div>

                    <Dialog
                        open={filterOpen}
                        onClose={handleFilterClose}
                        maxWidth="sm"
                        fullWidth
                        PaperProps={{
                            style: {
                                borderRadius: '10px',
                                position: 'fixed',
                                right: '0px',
                                margin: 0,
                                width: '400px',
                                maxHeight: '100vh',
                                overflowY: 'auto',
                            },
                        }}
                    >
                        <DialogTitle
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '20px 24px 12px',
                            }}
                        >
                            <Typography variant="h6" style={{ fontWeight: 600 }}>
                                Menu Filter
                            </Typography>
                            <IconButton onClick={handleFilterClose} size="small">
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>

                        <DialogContent style={{ padding: '0 24px' }}>
                            {/* Date Period */}
                            <div style={{ marginBottom: '24px' }}>
                                <Typography variant="subtitle2" style={{ marginBottom: '12px' }}>
                                    Date Period
                                </Typography>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {datePeriods.slice(0, 5).map((period) => (
                                        <Chip
                                            key={period}
                                            label={period}
                                            onClick={() => handleDatePeriodChange(period)}
                                            variant={datePeriod === period ? 'filled' : 'outlined'}
                                            style={{
                                                backgroundColor: datePeriod === period ? '#1976D2' : '#E3F2FD',
                                                color: datePeriod === period ? 'white' : '#1976D2',
                                                borderRadius: '16px',
                                                fontSize: '13px',
                                            }}
                                        />
                                    ))}
                                    <Chip
                                        label="Custom Date"
                                        onClick={() => handleDatePeriodChange('Custom Date')}
                                        variant={datePeriod === 'Custom Date' ? 'filled' : 'outlined'}
                                        style={{
                                            backgroundColor: datePeriod === 'Custom Date' ? '#003366' : 'transparent',
                                            color: datePeriod === 'Custom Date' ? 'white' : '#003366',
                                            borderRadius: '16px',
                                            border: '1px solid #003366',
                                            fontSize: '13px',
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Date Range */}
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                                <div style={{ flex: 1 }}>
                                    <Typography variant="body2" style={{ marginBottom: '8px' }}>
                                        From
                                    </Typography>
                                    <FormControl fullWidth variant="outlined" size="small">
                                        <Select value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ borderRadius: '6px' }}>
                                            <MenuItem value="Jan 01, 2024">Jan 01, 2024</MenuItem>
                                            <MenuItem value="Feb 01, 2024">Feb 01, 2024</MenuItem>
                                            <MenuItem value="Mar 01, 2024">Mar 01, 2024</MenuItem>
                                        </Select>
                                    </FormControl>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Typography variant="body2" style={{ marginBottom: '8px' }}>
                                        To
                                    </Typography>
                                    <FormControl fullWidth variant="outlined" size="small">
                                        <Select value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ borderRadius: '6px' }}>
                                            <MenuItem value="August 01, 2024">August 01, 2024</MenuItem>
                                            <MenuItem value="July 01, 2024">July 01, 2024</MenuItem>
                                            <MenuItem value="June 01, 2024">June 01, 2024</MenuItem>
                                        </Select>
                                    </FormControl>
                                </div>
                            </div>

                            {/* Status */}
                            <div style={{ marginBottom: '24px' }}>
                                <Typography variant="subtitle2" style={{ marginBottom: '12px' }}>
                                    Status
                                </Typography>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {statusOptions.map((status) => (
                                        <Chip
                                            key={status}
                                            label={status}
                                            onClick={() => handleStatusFilterChange(status)}
                                            variant={statusFilters.includes(status) ? 'filled' : 'outlined'}
                                            style={{
                                                backgroundColor: statusFilters.includes(status)
                                                    ? status === 'All'
                                                        ? '#003366'
                                                        : status === 'New Order'
                                                          ? '#1976D2'
                                                          : '#E3F2FD'
                                                    : 'transparent',
                                                color: statusFilters.includes(status)
                                                    ? status === 'All' || status === 'New Order'
                                                        ? 'white'
                                                        : '#1976D2'
                                                    : 'inherit',
                                                borderRadius: '16px',
                                                fontSize: '13px',
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Order Type */}
                            <div style={{ marginBottom: '24px' }}>
                                <Typography variant="subtitle2" style={{ marginBottom: '12px' }}>
                                    Order Type
                                </Typography>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {orderTypeOptions.map((type) => (
                                        <Chip
                                            key={type}
                                            label={type}
                                            onClick={() => handleOrderTypeFilterChange(type)}
                                            variant={orderTypeFilters.includes(type) ? 'filled' : 'outlined'}
                                            style={{
                                                backgroundColor: orderTypeFilters.includes(type)
                                                    ? type === 'All'
                                                        ? '#003366'
                                                        : '#E3F2FD'
                                                    : 'transparent',
                                                color: orderTypeFilters.includes(type) ? (type === 'All' ? 'white' : '#1976D2') : 'inherit',
                                                borderRadius: '16px',
                                                fontSize: '13px',
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </DialogContent>

                        <DialogActions style={{ padding: '16px 24px', justifyContent: 'space-between' }}>
                            <Button onClick={handleFilterClose} style={{ color: '#666', textTransform: 'none' }}>
                                Cancel
                            </Button>
                            <div>
                                <Button
                                    onClick={resetFilters}
                                    variant="outlined"
                                    style={{
                                        marginRight: '8px',
                                        textTransform: 'none',
                                        borderColor: '#e0e0e0',
                                    }}
                                >
                                    Reset Filter
                                </Button>
                                <Button
                                    onClick={applyFilters}
                                    variant="contained"
                                    style={{
                                        backgroundColor: '#003366',
                                        color: '#fff',
                                        textTransform: 'none',
                                    }}
                                >
                                    Apply Filters
                                </Button>
                            </div>
                        </DialogActions>
                    </Dialog>
                </div>
            </div>
        </>
    );
};

export default OrderManagement;
