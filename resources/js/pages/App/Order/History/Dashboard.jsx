import SideNav from '@/components/App/SideBar/SideNav';
import Receipt from '@/components/App/Invoice/Receipt';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, MenuItem, Select, FormControl, InputLabel, Pagination, Typography, Chip, InputAdornment, CircularProgress, IconButton, Tooltip, Dialog, DialogContent, DialogTitle, Button, Grid, Autocomplete } from '@mui/material';
import { Search } from '@mui/icons-material';
import PrintIcon from '@mui/icons-material/Print';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useEffect, useMemo } from 'react';
import { router, usePage } from '@inertiajs/react';
import debounce from 'lodash.debounce';
import axios from 'axios';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const Dashboard = ({ orders, filters, tables = [], waiters = [], cashiers = [] }) => {
    const { auth } = usePage().props;
    const user = auth.user;

    const [open, setOpen] = useState(true);
    const [searchId, setSearchId] = useState(filters?.search_id || '');
    const [searchName, setSearchName] = useState(filters?.search_name || '');
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');
    const [orderType, setOrderType] = useState(filters?.type || 'all');
    const [paymentStatus, setPaymentStatus] = useState(filters?.payment_status || 'all');
    const [paymentMethod, setPaymentMethod] = useState(filters?.payment_method || 'all');
    const [adjustmentType, setAdjustmentType] = useState(filters?.adjustment_type || 'all');
    const [tableId, setTableId] = useState(filters?.table_id || '');
    const [waiterId, setWaiterId] = useState(filters?.waiter_id || '');
    const [cashierId, setCashierId] = useState(filters?.cashier_id || '');
    const [isLoading, setIsLoading] = useState(false);

    // Suggestions State
    const [suggestions, setSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    // Modal state
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Fetch Suggestions
    const fetchSuggestions = useMemo(
        () =>
            debounce(async (query, type) => {
                if (!query) {
                    setSuggestions([]);
                    return;
                }
                setLoadingSuggestions(true);
                try {
                    const response = await axios.get(route('api.orders.search-customers'), {
                        params: { query, type },
                    });
                    setSuggestions(response.data);
                } catch (error) {
                    console.error('Error fetching suggestions:', error);
                } finally {
                    setLoadingSuggestions(false);
                }
            }, 300),
        [],
    );

    useEffect(() => {
        if (searchName) {
            fetchSuggestions(searchName, orderType);
        } else {
            setSuggestions([]);
        }
    }, [searchName, orderType]);

    const handleApply = () => {
        setIsLoading(true);
        router.get(
            route('order.history'),
            {
                search_id: searchId || undefined,
                search_name: searchName || undefined,
                start_date: startDate || undefined,
                end_date: endDate || undefined,
                type: orderType !== 'all' ? orderType : undefined,
                payment_status: paymentStatus !== 'all' ? paymentStatus : undefined,
                payment_method: paymentMethod !== 'all' ? paymentMethod : undefined,
                adjustment_type: adjustmentType !== 'all' ? adjustmentType : undefined,
                table_id: tableId || undefined,
                waiter_id: waiterId || undefined,
                cashier_id: cashierId || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const handleReset = () => {
        setSearchId('');
        setSearchName('');
        setStartDate('');
        setEndDate('');
        setOrderType('all');
        setPaymentStatus('all');
        setPaymentMethod('all');
        setAdjustmentType('all');
        setTableId('');
        setWaiterId('');
        setCashierId('');

        setIsLoading(true);
        router.get(
            route('order.history'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const handlePageChange = (event, page) => {
        setIsLoading(true);
        router.get(
            route('order.history'),
            { ...filters, page },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const getClientName = (order) => {
        if (order.member) return order.member.full_name;
        if (order.customer) return order.customer.name;
        if (order.employee) return order.employee.name;
        return 'N/A';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return 'success';
            case 'awaiting':
                return 'warning';
            case 'completed':
                return 'info';
            case 'cancelled':
                return 'error';
            default:
                return 'default';
        }
    };

    const getOrderStatusColor = (status) => {
        switch (status) {
            case 'in_progress':
                return 'info';
            case 'completed':
                return 'success';
            case 'cancelled':
            case 'refund':
                return 'error';
            case 'saved':
                return 'warning';
            default:
                return 'default';
        }
    };

    const formatOrderStatus = (status) => {
        const statuses = {
            in_progress: 'In Progress',
            completed: 'Completed',
            cancelled: 'Cancelled',
            saved: 'Saved',
            refund: 'Refund',
        };
        return statuses[status] || status;
    };

    const formatOrderType = (type) => {
        const types = {
            dineIn: 'Dine-In',
            delivery: 'Delivery',
            takeaway: 'Takeaway',
            reservation: 'Reservation',
            room_service: 'Room Service',
        };
        return types[type] || type;
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setViewModalOpen(true);
    };

    const handleCloseModal = () => {
        setViewModalOpen(false);
        setSelectedOrder(null);
    };

    // Transform order data for Receipt component
    const getReceiptData = (order) => {
        if (!order) return null;
        const bankChargesEnabled = order.invoice_bank_charges_enabled === true || order.invoice_bank_charges_enabled === 1 || order.invoice_bank_charges_enabled === '1' || order.invoice_bank_charges_enabled === 'true';
        return {
            id: order.id,
            order_no: order.id,
            start_date: order.start_date,
            date: order.start_date,
            amount: order.amount || order.total_price,
            discount: order.discount || 0,
            tax: order.tax || 0,
            total_price: order.total_price,
            data: {
                bank_charges_enabled: bankChargesEnabled,
                bank_charges_type: order.invoice_bank_charges_type || 'percentage',
                bank_charges_value: Number(order.invoice_bank_charges_value || 0),
                bank_charges_amount: Number(order.invoice_bank_charges_amount || 0),
            },
            order_type: order.order_type,
            member: order.member,
            customer: order.customer,
            employee: order.employee,
            table: order.table,
            cashier: order.cashier,
            waiter: order.waiter,
            paid_amount: order.paid_amount,
            order_items:
                order.order_items
                    ?.filter((item) => item.status !== 'cancelled')
                    .map((item) => ({
                        order_item: item.order_item,
                        name: item.order_item?.name || 'Item',
                        quantity: item.order_item?.quantity || 1,
                        price: item.order_item?.price || 0,
                        total_price: item.order_item?.total_price || (item.order_item?.quantity || 1) * (item.order_item?.price || 0),
                    })) || [],
        };
    };

    const handlePrintReceipt = (order) => {
        const printWindow = window.open('', '_blank');
        const customerName = order.member?.full_name || order.customer?.name || order.employee?.name || 'N/A';
        const memberNo = order.member?.membership_no || '';
        const bankCharges = parseFloat(order.invoice_bank_charges_amount || 0);

        const itemsHtml =
            order.order_items
                ?.filter((item) => item.status !== 'cancelled')
                .map((item) => {
                    const name = item.order_item?.name || 'Item';
                    const qty = item.order_item?.quantity || 1;
                    const price = item.order_item?.price || 0;
                    const total = item.order_item?.total_price || qty * price;
                    return `
              <div style="margin-bottom: 10px;">
                <div><strong>${name}</strong></div>
                <div class="row">
                  <div>${qty} x Rs ${price}</div>
                  <div>Rs ${total}</div>
                </div>
              </div>
            `;
                })
                .join('') || '<div>No items</div>';

        const content = `
        <html>
          <head>
            <title>Receipt - Order #${order.id}</title>
            <style>
              body { font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 10px; }
              .order-id { border: 1px dashed #ccc; padding: 10px; text-align: center; margin: 15px 0; }
              .divider { border-top: 1px dashed #ccc; margin: 10px 0; }
              .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
              .total { font-weight: bold; margin-top: 10px; }
              .footer { text-align: center; margin-top: 20px; font-size: 11px; }
              .logo { width: 80px; }
            </style>
          </head>
          <body>
            <div class="header"><img src='/assets/Logo.png' class="logo"/></div>
            <div class="header"><div>${order.start_date ? new Date(order.start_date).toLocaleString() : ''}</div></div>
            <div class="order-id"><div>Order Id</div><div><strong>#${order.id}</strong></div></div>
            <div class="row"><div>Cashier</div><div>${order.cashier?.name || user?.name || 'N/A'}</div></div>
            ${order.waiter ? `<div class="row"><div>Waiter</div><div>${order.waiter.name}</div></div>` : ''}
            <div class="divider"></div>
            <div class="row"><div>Customer Name</div><div>${customerName}</div></div>
            ${memberNo ? `<div class="row"><div>Member Id</div><div>${memberNo}</div></div>` : ''}
            <div class="row"><div>Order Type</div><div>${formatOrderType(order.order_type)}</div></div>
            ${order.table ? `<div class="row"><div>Table Number</div><div>${order.table.table_no}</div></div>` : ''}
            <div class="divider"></div>
            ${itemsHtml}
            <div class="divider"></div>
            <div class="row"><div>Subtotal</div><div>Rs ${order.amount || order.total_price || 0}</div></div>
            <div class="row"><div>Discount</div><div>Rs ${order.discount || 0}</div></div>
            <div class="row"><div>Tax</div><div>Rs ${order.tax ? Math.round((order.amount || order.total_price) * order.tax) : 0}</div></div>
            ${
                bankCharges > 0
                    ? `<div class="row"><div>Bank Charges</div><div>Rs ${bankCharges}</div></div>`
                    : ''
            }
            <div class="divider"></div>
            <div class="row total"><div>Total Amount</div><div>Rs ${(Number(order.total_price || 0) + Number(bankCharges || 0)).toFixed(2)}</div></div>
            ${
                order.paid_amount
                    ? `
            <div class="row"><div>Paid Amount</div><div>Rs ${order.paid_amount}</div></div>
            <div class="row"><div>Change</div><div>Rs ${Number(order.paid_amount || 0) - (Number(order.total_price || 0) + Number(bankCharges || 0))}</div></div>
            `
                    : ''
            }
            <div class="footer"><p>Thanks for having our passion. Drop by again!</p></div>
          </body>
        </html>
        `;

        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    // MenuProps for styled dropdowns
    const menuProps = {
        sx: {
            '& .MuiPaper-root': {
                borderRadius: '16px',
                boxShadow: 'none !important',
                marginTop: '4px',
                maxHeight: '180px',
                overflowY: 'auto',
            },
            '& .MuiMenuItem-root': {
                borderRadius: '16px',
                '&:hover': {
                    backgroundColor: '#063455 !important',
                    color: '#fff !important',
                },
            },
        },
    };

    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <Box
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                    padding: '0 16px',
                }}
            >
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#063455' }}>
                    Order History
                </Typography>

                {/* Filters */}
                <Box sx={{ mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        {/* Unified Type Selection */}
                        <Grid item xs={12} md={2}>
                            <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}>
                                <Select value={orderType} onChange={(e) => setOrderType(e.target.value)} MenuProps={menuProps}>
                                    <MenuItem value="all">All Types</MenuItem>
                                    <MenuItem value="member">Member</MenuItem>
                                    <MenuItem value="corporate">Corporate</MenuItem>
                                    <MenuItem value="employee">Employee</MenuItem>
                                    <MenuItem value="guest">Guest</MenuItem>
                                    <MenuItem value="dineIn">Dine-In</MenuItem>
                                    <MenuItem value="delivery">Delivery</MenuItem>
                                    <MenuItem value="takeaway">Takeaway</MenuItem>
                                    <MenuItem value="reservation">Reservation</MenuItem>
                                    <MenuItem value="room_service">Room Service</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Search by Name with Autocomplete */}
                        <Grid item xs={12} md={3}>
                            <Autocomplete
                                freeSolo
                                disablePortal
                                options={suggestions}
                                getOptionLabel={(option) => option.value || option.name || option.full_name || option}
                                inputValue={searchName}
                                onInputChange={(event, newInputValue) => {
                                    setSearchName(newInputValue);
                                }}
                                loading={loadingSuggestions}
                                renderInput={(params) => <TextField {...params} fullWidth size="small" label="Search Name" placeholder="Customer Name..." sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }} />}
                                renderOption={(props, option) => (
                                    <li {...props} key={option.id || option.label}>
                                        <Box sx={{ width: '100%' }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Typography variant="body2" fontWeight="bold">
                                                    {option.membership_no || option.customer_no || option.employee_id}
                                                </Typography>
                                                {option.status && (
                                                    <Chip
                                                        label={option.status}
                                                        size="small"
                                                        sx={{
                                                            height: '20px',
                                                            fontSize: '10px',
                                                            backgroundColor: option.status === 'active' ? '#e8f5e9' : option.status === 'suspended' ? '#fff3e0' : '#ffebee',
                                                            color: option.status === 'active' ? '#2e7d32' : option.status === 'suspended' ? '#ef6c00' : '#c62828',
                                                            textTransform: 'capitalize',
                                                            ml: 1,
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">
                                                {option.name || option.full_name || option.label}
                                            </Typography>
                                        </Box>
                                    </li>
                                )}
                            />
                        </Grid>

                        {/* Order ID */}
                        <Grid item xs={12} md={2}>
                            <TextField fullWidth size="small" label="Order ID" placeholder="Order ID..." value={searchId} onChange={(e) => setSearchId(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }} />
                        </Grid>

                        {/* Start Date */}
                        <Grid item xs={12} md={2}>
                            <TextField fullWidth size="small" type="date" label="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }} />
                        </Grid>

                        {/* End Date */}
                        <Grid item xs={12} md={2}>
                            <TextField fullWidth size="small" type="date" label="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }} />
                        </Grid>

                        {/* Status */}
                        <Grid item xs={12} md={2}>
                            <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}>
                                <Select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} displayEmpty MenuProps={menuProps}>
                                    <MenuItem value="all">All Status</MenuItem>
                                    <MenuItem value="paid">Paid</MenuItem>
                                    <MenuItem value="awaiting">Awaiting</MenuItem>
                                    <MenuItem value="unpaid">Unpaid</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Payment Method */}
                        <Grid item xs={12} md={2}>
                            <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}>
                                <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} displayEmpty MenuProps={menuProps}>
                                    <MenuItem value="all">All Methods</MenuItem>
                                    <MenuItem value="cash">Cash</MenuItem>
                                    <MenuItem value="credit_card">Credit Card</MenuItem>
                                    <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                                    <MenuItem value="split_payment">Split Payment</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Adjustment Type (ENT/CTS) */}
                        <Grid item xs={12} md={2}>
                            <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}>
                                <Select value={adjustmentType} onChange={(e) => setAdjustmentType(e.target.value)} displayEmpty MenuProps={menuProps}>
                                    <MenuItem value="all">All Adjustments</MenuItem>
                                    <MenuItem value="ent">ENT Only</MenuItem>
                                    <MenuItem value="cts">CTS Only</MenuItem>
                                    <MenuItem value="none">No Adjustments</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Table */}
                        <Grid item xs={12} md={2}>
                            <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}>
                                <Select value={tableId} onChange={(e) => setTableId(e.target.value)} displayEmpty MenuProps={menuProps}>
                                    <MenuItem value="">All Tables</MenuItem>
                                    {tables.map((t) => (
                                        <MenuItem key={t.id} value={t.id}>
                                            {t.table_no}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Waiter */}
                        <Grid item xs={12} md={2}>
                            <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}>
                                <Select value={waiterId} onChange={(e) => setWaiterId(e.target.value)} displayEmpty MenuProps={menuProps}>
                                    <MenuItem value="">All Waiters</MenuItem>
                                    {waiters.map((w) => (
                                        <MenuItem key={w.id} value={w.id}>
                                            {w.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Cashier */}
                        <Grid item xs={12} md={2}>
                            <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}>
                                <Select value={cashierId} onChange={(e) => setCashierId(e.target.value)} displayEmpty MenuProps={menuProps}>
                                    <MenuItem value="">All Cashiers</MenuItem>
                                    {cashiers.map((c) => (
                                        <MenuItem key={c.id} value={c.id}>
                                            {c.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Action Buttons */}
                        <Grid item xs={12} md={3} sx={{ display: 'flex', gap: 2 }}>
                            <Button variant="outlined" onClick={handleReset} sx={{ borderRadius: '16px', textTransform: 'none', color: '#063455', border: '1px solid #063455', px: 4 }}>
                                Reset
                            </Button>
                            <Button variant="contained" startIcon={<Search />} onClick={handleApply} sx={{ borderRadius: '16px', backgroundColor: '#063455', textTransform: 'none', px: 4 }}>
                                Search
                            </Button>
                        </Grid>
                    </Grid>
                </Box>

                {/* Table */}
                <TableContainer component={Paper} sx={{ position: 'relative' }}>
                    {isLoading && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                zIndex: 10,
                            }}
                        >
                            <CircularProgress size={40} />
                        </Box>
                    )}
                    <Table size="small">
                        <TableHead sx={{ backgroundColor: '#063455' }}>
                            <TableRow>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Order #</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Date</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Membership #</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Name</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Client Type</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Order Type</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Table</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Gross</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Disc</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Tax</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Total</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Paid</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Balance</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Method</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Order Status</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Payment Status</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>ENT</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>CTS</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Cashier</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Location</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders?.data?.length > 0 ? (
                                orders.data.map((order) => {
                                    const round0 = (n) => Math.round(Number(n) || 0);
                                    const gross = round0(order.amount || 0);
                                    const discount = round0(order.discount || 0);
                                    const taxRate = Number(order.tax || 0);
                                    const taxAmount = round0((gross - discount) * taxRate);
                                    const total = round0(order.total_price || 0);
                                    const paid = round0(order.paid_amount || 0);
                                    const entAmount = round0(order.invoice_ent_amount || 0);
                                    const ctsAmount = round0(order.invoice_cts_amount || 0);
                                    const bankCharges = round0(order.invoice_bank_charges_amount || 0);
                                    const balance = round0(total + bankCharges - paid - entAmount - ctsAmount);

                                    // Determine Client Type
                                    let clientType = 'Guest';
                                    if (order.employee) clientType = 'Employee';
                                    else if (order.member) {
                                        clientType = order.member.member_type?.name === 'Corporate' ? 'Corporate' : 'Member';
                                    } else if (order.customer && order.customer.guest_type) {
                                        clientType = order.customer.guest_type.name || 'Guest';
                                    }

                                    // Determine ID
                                    let clientId = '-';
                                    if (order.member) clientId = order.member.membership_no;
                                    else if (order.customer) clientId = order.customer.customer_no;
                                    else if (order.employee) clientId = order.employee.employee_id;

                                    return (
                                        <TableRow key={order.id} hover>
                                            <TableCell>#{order.id}</TableCell>
                                            <TableCell>{new Date(order.start_date).toLocaleDateString()}</TableCell>
                                            <TableCell>{clientId}</TableCell>
                                            <TableCell>{getClientName(order)}</TableCell>
                                            <TableCell>{clientType}</TableCell>
                                            <TableCell>{formatOrderType(order.order_type)}</TableCell>
                                            <TableCell>{order.table?.table_no || '-'}</TableCell>
                                            <TableCell>{gross}</TableCell>
                                            <TableCell>{discount}</TableCell>
                                            <TableCell>{taxAmount}</TableCell>
                                            <TableCell>{total}</TableCell>
                                            <TableCell>{paid}</TableCell>
                                            <TableCell sx={{ color: balance > 0 ? 'red' : 'green' }}>{balance}</TableCell>
                                            <TableCell>{order.payment_method || '-'}</TableCell>
                                            <TableCell>
                                                <Chip label={formatOrderStatus(order.status)} size="small" color={getOrderStatusColor(order.status)} />
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={order.payment_status || 'unpaid'} size="small" color={getStatusColor(order.payment_status)} />
                                            </TableCell>
                                            <TableCell>
                                                {order.invoice_ent_amount > 0 ? (
                                                    <Tooltip title={order.invoice_ent_reason || 'ENT Applied'}>
                                                        <Chip label={`Rs ${order.invoice_ent_amount}`} size="small" sx={{ bgcolor: '#e3f2fd', color: '#1565c0' }} />
                                                    </Tooltip>
                                                ) : (
                                                    '-'
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {order.invoice_cts_amount > 0 ? (
                                                    <Tooltip title={order.invoice_cts_comment || 'CTS Applied'}>
                                                        <Chip label={`Rs ${order.invoice_cts_amount}`} size="small" sx={{ bgcolor: '#fff3e0', color: '#ef6c00' }} />
                                                    </Tooltip>
                                                ) : (
                                                    '-'
                                                )}
                                            </TableCell>
                                            <TableCell>{order.cashier?.name || order.user?.name || '-'}</TableCell>
                                            <TableCell>{order.tenant?.name || '-'}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    <Tooltip title="View Details">
                                                        <IconButton size="small" onClick={() => handleViewOrder(order)} sx={{ color: '#1976d2' }}>
                                                            <VisibilityIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Print Receipt">
                                                        <IconButton size="small" onClick={() => handlePrintReceipt(order)} sx={{ color: '#063455' }}>
                                                            <PrintIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={15} align="center">
                                        No orders found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                {orders?.last_page > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Pagination count={orders.last_page} page={orders.current_page} onChange={handlePageChange} color="primary" />
                    </Box>
                )}
            </Box>

            {/* View Order Modal */}
            <Dialog open={viewModalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#063455', color: '#fff' }}>
                    <Typography variant="h6">Order Details - #{selectedOrder?.id}</Typography>
                    <IconButton onClick={handleCloseModal} sx={{ color: '#fff' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    {selectedOrder && (
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                            <Receipt invoiceData={getReceiptData(selectedOrder)} openModal={viewModalOpen} showButtons={false} />
                            <Box sx={{ flex: 1, p: 3 }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Order Information
                                </Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Order Type
                                        </Typography>
                                        <Typography variant="body1">{formatOrderType(selectedOrder.order_type)}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Date
                                        </Typography>
                                        <Typography variant="body1">{new Date(selectedOrder.start_date).toLocaleString()}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Order Status
                                        </Typography>
                                        <Box>
                                            <Chip label={formatOrderStatus(selectedOrder.status)} size="small" color={getOrderStatusColor(selectedOrder.status)} />
                                        </Box>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Payment Status
                                        </Typography>
                                        <Box>
                                            <Chip label={selectedOrder.payment_status || 'unpaid'} size="small" color={getStatusColor(selectedOrder.payment_status)} />
                                        </Box>
                                    </Box>
                                    {selectedOrder.table && (
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Table
                                            </Typography>
                                            <Typography variant="body1">{selectedOrder.table.table_no}</Typography>
                                        </Box>
                                    )}
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Payment Method
                                        </Typography>
                                        <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                                            {selectedOrder.payment_method?.replace('_', ' ') || '-'}
                                        </Typography>
                                    </Box>
                                    {selectedOrder.cashier && (
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Cashier
                                            </Typography>
                                            <Typography variant="body1">{selectedOrder.cashier.name}</Typography>
                                        </Box>
                                    )}
                                    {selectedOrder.waiter && (
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Waiter
                                            </Typography>
                                            <Typography variant="body1">{selectedOrder.waiter.name}</Typography>
                                        </Box>
                                    )}
                                </Box>

                                {/* ENT/CTS Details Section */}
                                {(selectedOrder.invoice_ent_amount > 0 || selectedOrder.invoice_cts_amount > 0) && (
                                    <>
                                        <Typography variant="h6" sx={{ mb: 2 }}>
                                            Adjustments & Deductions
                                        </Typography>
                                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                            {selectedOrder.invoice_ent_amount > 0 && (
                                                <>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            ENT Amount
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ color: '#1565c0', fontWeight: 600 }}>
                                                            Rs {selectedOrder.invoice_ent_amount}
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            ENT Reason
                                                        </Typography>
                                                        <Typography variant="body1">{selectedOrder.invoice_ent_reason || '-'}</Typography>
                                                    </Box>
                                                    {selectedOrder.invoice_ent_comment && (
                                                        <Box sx={{ gridColumn: 'span 2' }}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                ENT Comment
                                                            </Typography>
                                                            <Typography variant="body2">{selectedOrder.invoice_ent_comment}</Typography>
                                                        </Box>
                                                    )}
                                                </>
                                            )}
                                            {selectedOrder.invoice_cts_amount > 0 && (
                                                <>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            CTS Amount
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ color: '#ef6c00', fontWeight: 600 }}>
                                                            Rs {selectedOrder.invoice_cts_amount}
                                                        </Typography>
                                                    </Box>
                                                    {selectedOrder.invoice_cts_comment && (
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary">
                                                                CTS Comment
                                                            </Typography>
                                                            <Typography variant="body2">{selectedOrder.invoice_cts_comment}</Typography>
                                                        </Box>
                                                    )}
                                                </>
                                            )}
                                        </Box>
                                    </>
                                )}

                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Order Items
                                </Typography>
                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Item</TableCell>
                                                <TableCell align="right">Qty</TableCell>
                                                <TableCell align="right">Price</TableCell>
                                                <TableCell align="right">Total</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedOrder.order_items
                                                ?.filter((item) => item.status !== 'cancelled')
                                                .map((item, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{item.order_item?.name || 'Item'}</TableCell>
                                                        <TableCell align="right">{item.order_item?.quantity || 1}</TableCell>
                                                        <TableCell align="right">Rs. {item.order_item?.price || 0}</TableCell>
                                                        <TableCell align="right">Rs. {item.order_item?.total_price || (item.order_item?.quantity || 1) * (item.order_item?.price || 0)}</TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                    <Button variant="outlined" onClick={handleCloseModal}>
                                        Close
                                    </Button>
                                    <Button variant="contained" startIcon={<PrintIcon />} onClick={() => handlePrintReceipt(selectedOrder)} sx={{ backgroundColor: '#063455' }}>
                                        Print Receipt
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

Dashboard.layout = (page) => page;

export default Dashboard;
