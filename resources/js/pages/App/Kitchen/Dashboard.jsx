'use client';

import SideNav from '@/components/App/SideBar/SideNav';
import { router } from '@inertiajs/react';
import { Close as CloseIcon, FilterAlt as FilterIcon, Print as PrintIcon } from '@mui/icons-material';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining'; // delivery
import RestaurantIcon from '@mui/icons-material/Restaurant'; // dine_in
import TakeoutDiningIcon from '@mui/icons-material/TakeoutDining'; // take_away

import {
    Alert,
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
    Snackbar,
    Typography,
} from '@mui/material';

import 'bootstrap/dist/css/bootstrap.min.css';
import { useCallback, useEffect, useState } from 'react';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const OrderManagement = ({ kitchenOrders, flash }) => {
    const [open, setOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('All Order');
    const [checkedItems, setCheckedItems] = useState(
        (kitchenOrders || []).reduce((acc, order) => {
            acc[order.id] = order.order_takings.map((item) => ({
                id: item.id,
                checked: item.status === 'completed',
            }));
            return acc;
        }, {}),
    );
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const [datePeriod, setDatePeriod] = useState('');
    const [fromDate, setFromDate] = useState('Jan 01, 2024');
    const [toDate, setToDate] = useState('August 01, 2024');
    const [statusFilters, setStatusFilters] = useState(['All']);
    const [orderTypeFilters, setOrderTypeFilters] = useState(['All']);
    const [filteredOrder, setFilteredOrder] = useState(kitchenOrders || []);

    useEffect(() => {
        if (flash?.success) {
            setSnackbarMessage(flash.success);
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } else if (flash?.error) {
            setSnackbarMessage(flash.error);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    }, [flash]);

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleFilterOpen = () => {
        setFilterOpen(true);
    };

    const handleFilterClose = () => {
        setFilterOpen(false);
    };

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
        handleFilterClose();
    };

    const tabs = [
        { id: 'All Order', count: null },
        { id: 'pending', count: kitchenOrders?.filter((o) => o.status === 'pending').length || 0 },
        { id: 'in_progress', count: kitchenOrders?.filter((o) => o.status === 'in_progress').length || 0 },
        { id: 'completed', count: kitchenOrders?.filter((o) => o.status === 'completed').length || 0 },
        // { id: 'Refund', count: kitchenOrders?.filter((o) => o.status === 'Refund').length || 0 },
    ];

    const datePeriods = ['Yesterday', 'Last Week', 'Last Month', 'Last 3 Month', 'Last Year', 'Custom Date'];
    const statusOptions = ['All', 'New Order', 'Refund', 'Process', 'Done'];
    const orderTypeOptions = ['All', 'Dine', 'Pickup', 'Delivery', 'Takeaway', 'Reservation'];

    const filteredOrders = (kitchenOrders || []).filter((order) => {
        if (activeTab === 'All Order') {
            return true;
        } else {
            return order.status === activeTab;
        }
    });

    const handleCheckboxChange = (orderId, itemId, checked) => {
        // Update local state
        setCheckedItems((prev) => ({
            ...prev,
            [orderId]: prev[orderId].map((item) => (item.id === itemId ? { ...item, checked } : item)),
        }));

        // Prepare form data
        const formData = new FormData();
        formData.append('status', checked ? 'completed' : 'pending');

        // Send POST request to update item status in the database
        router.post(route('kitchen.item.update-status', { order: orderId, item: itemId }), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setFilteredOrder((prev) =>
                    prev.map((order) =>
                        order.id === orderId
                            ? {
                                  ...order,
                                  order_takings: order.order_takings.map((item) =>
                                      item.id === itemId ? { ...item, status: checked ? 'completed' : 'pending' } : item,
                                  ),
                              }
                            : order,
                    ),
                );
            },
            onError: (errors) => {
                console.error('Item status update error:', errors);
                setSnackbarMessage('Failed to update item status: ' + (errors.status || 'Unknown error'));
                setSnackbarSeverity('error');
                setSnackbarOpen(true);

                // Revert local state on error to stay in sync with database
                setCheckedItems((prev) => ({
                    ...prev,
                    [orderId]: prev[orderId].map((item) => (item.id === itemId ? { ...item, checked: !checked } : item)),
                }));
            },
        });
    };

    const handleStatusChange = useCallback(
        (e, orderId) => {
            e.preventDefault();

            const order = kitchenOrders.find((o) => o.id === orderId);
            const newOrderStatus = order.status === 'pending' ? 'in_progress' : 'completed';

            const itemStatuses = checkedItems[orderId].map((item) => ({
                id: item.id,
                status: item.checked ? 'completed' : 'pending',
            }));

            const formData = new FormData();
            formData.append('status', newOrderStatus);
            formData.append('items', JSON.stringify(itemStatuses));

            router.post(route('kitchen.update-all', orderId), formData, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setFilteredOrder((prev) =>
                        prev.map((order) =>
                            order.id === orderId
                                ? {
                                      ...order,
                                      status: newOrderStatus,
                                      order_takings: order.order_takings.map((item) => {
                                          const updatedItem = itemStatuses.find((i) => i.id === item.id);
                                          return updatedItem ? { ...item, status: updatedItem.status } : item;
                                      }),
                                  }
                                : order,
                        ),
                    );
                },
                onError: (errors) => {
                    console.error('Status update error:', errors);
                    setSnackbarMessage('Failed to update statuses: ' + (errors.status || 'Unknown error'));
                    setSnackbarSeverity('error');
                    setSnackbarOpen(true);
                },
            });
        },
        [checkedItems, setFilteredOrder, kitchenOrders],
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
                                    {tab.id.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
                                    {tab.count !== null && `(${tab.count})`}
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

                    <div className="row m-1 p-2" style={{ backgroundColor: '#fbfbfb', borderRadius: '10px' }}>
                        {filteredOrders.map((order) => {
                            // const latestStatus = order.order_takings?.slice(-1)[0]?.status;
                            const orderTaking = order.order_takings?.slice(-1)[0];

                            return (
                                <div key={order.id} className="col-md-3 mb-3">
                                    <Paper elevation={1} style={{ borderRadius: '8px', overflow: 'hidden' }}>
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
                                                </Typography>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <Typography variant="body2">{order.order_time}</Typography>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <div
                                                    style={{
                                                        backgroundColor: '#ffff',
                                                        color: '#000',
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
                                                    {/* {order.order_type === 'DE' ? <DiningIcon /> : <DeliveryIcon />} */}
                                                    {order.order_type === 'dine_in' ? (
                                                        <RestaurantIcon />
                                                    ) : order.order_type === 'delivery' ? (
                                                        <DeliveryDiningIcon />
                                                    ) : order.order_type === 'take_away' ? (
                                                        <TakeoutDiningIcon />
                                                    ) : null}
                                                </IconButton>
                                            </div>
                                        </div>

                                        <div style={{ padding: '12px' }}>
                                            {order.order_takings.map((item, idx) => {
                                                const isEditable = order.status === 'in_progress';
                                                const isCancelled = item.status === 'cancelled';
                                                const isActive = item.status === 'pending';
                                                const isChecked = checkedItems[order.id]?.find((i) => i.id === item.id)?.checked || false;

                                                return (
                                                    <div key={idx} style={{ marginBottom: '8px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography
                                                                variant="body1"
                                                                style={{
                                                                    textDecoration: isCancelled ? 'line-through' : 'none',
                                                                    color: isCancelled ? 'red' : item.status === 'completed' ? 'green' : undefined,
                                                                }}
                                                            >
                                                                {item.order_item.item} - {item.status}
                                                            </Typography>

                                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                <Typography variant="body2" style={{ marginRight: '8px' }}>
                                                                    {item.order_item.qty}x
                                                                </Typography>
                                                                <Checkbox
                                                                    disabled={!isEditable}
                                                                    checked={isChecked}
                                                                    onChange={(e) => handleCheckboxChange(order.id, item.id, e.target.checked)}
                                                                    size="small"
                                                                    style={{
                                                                        color: isChecked ? '#1976D2' : undefined,
                                                                        padding: '2px',
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

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
                                                        backgroundColor: order.status === 'pending' ? '#1565C0' : '#003366',
                                                        textTransform: 'none',
                                                    }}
                                                    onClick={(e) => handleStatusChange(e, order.id)}
                                                >
                                                    {order.status === 'pending' ? 'Start' : 'Finish'}
                                                </Button>
                                            )}
                                        </div>
                                    </Paper>
                                </div>
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
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default OrderManagement;
