import SideNav from '@/components/App/SideBar/SideNav';
import Receipt from '@/components/App/Invoice/Receipt';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, MenuItem, Select, FormControl, InputLabel, Pagination, Typography, Chip, InputAdornment, CircularProgress, IconButton, Tooltip, Dialog, DialogContent, DialogTitle, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import debounce from 'lodash.debounce';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const Dashboard = ({ orders, filters }) => {
    const { auth } = usePage().props;
    const user = auth.user;

    const [open, setOpen] = useState(true);
    const [searchId, setSearchId] = useState(filters?.search_id || '');
    const [searchName, setSearchName] = useState(filters?.search_name || '');
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');
    const [orderType, setOrderType] = useState(filters?.type || 'all');
    const [paymentStatus, setPaymentStatus] = useState(filters?.payment_status || 'all');
    const [isLoading, setIsLoading] = useState(false);

    // Modal state
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const applyFilters = debounce(() => {
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
            },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsLoading(false),
            },
        );
    }, 500);

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
        return {
            id: order.id,
            order_no: order.id,
            start_date: order.start_date,
            date: order.start_date,
            amount: order.amount || order.total_price,
            discount: order.discount || 0,
            tax: order.tax || 0,
            total_price: order.total_price,
            order_type: order.order_type,
            member: order.member,
            customer: order.customer,
            employee: order.employee,
            table: order.table,
            cashier: order.cashier,
            waiter: order.waiter,
            paid_amount: order.paid_amount,
            order_items:
                order.order_items?.map((item) => ({
                    order_item: item.order_item,
                    name: item.order_item?.name || 'Item',
                    quantity: item.order_item?.quantity || 1,
                    price: item.order_item?.total_price || 0,
                    total_price: (item.order_item?.quantity || 1) * (item.order_item?.total_price || 0),
                })) || [],
        };
    };

    const handlePrintReceipt = (order) => {
        const printWindow = window.open('', '_blank');
        const customerName = order.member?.full_name || order.customer?.name || order.employee?.name || 'N/A';
        const memberNo = order.member?.membership_no || '';

        // Calculate items HTML
        const itemsHtml =
            order.order_items
                ?.map((item) => {
                    const name = item.order_item?.name || 'Item';
                    const qty = item.order_item?.quantity || 1;
                    const price = item.order_item?.total_price || 0;
                    const total = qty * price;
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
            <div class="header">
              <div><img src='/assets/Logo.png' class="logo"/></div>
            </div>
            <div class="header">
              <div>${order.start_date ? new Date(order.start_date).toLocaleString() : ''}</div>
            </div>

            <div class="order-id">
              <div>Order Id</div>
              <div><strong>#${order.id}</strong></div>
            </div>

            <div class="row">
              <div>Cashier</div>
              <div>${order.cashier?.name || user?.name || 'N/A'}</div>
            </div>

            ${
                order.waiter
                    ? `
            <div class="row">
              <div>Waiter</div>
              <div>${order.waiter.name}</div>
            </div>
            `
                    : ''
            }

            <div class="divider"></div>

            <div class="row">
              <div>Customer Name</div>
              <div>${customerName}</div>
            </div>

            ${
                memberNo
                    ? `
            <div class="row">
              <div>Member Id</div>
              <div>${memberNo}</div>
            </div>
            `
                    : ''
            }

            <div class="row">
              <div>Order Type</div>
              <div>${formatOrderType(order.order_type)}</div>
            </div>

            ${
                order.table
                    ? `
            <div class="row">
              <div>Table Number</div>
              <div>${order.table.table_no}</div>
            </div>
            `
                    : ''
            }

            <div class="divider"></div>

            ${itemsHtml}

            <div class="divider"></div>

            <div class="row">
              <div>Subtotal</div>
              <div>Rs ${order.amount || order.total_price || 0}</div>
            </div>

            <div class="row">
              <div>Discount</div>
              <div>Rs ${order.discount || 0}</div>
            </div>

            <div class="row">
              <div>Tax</div>
              <div>Rs ${order.tax ? Math.round((order.amount || order.total_price) * order.tax) : 0}</div>
            </div>

            <div class="divider"></div>

            <div class="row total">
              <div>Total Amount</div>
              <div>Rs ${order.total_price || 0}</div>
            </div>

            ${
                order.paid_amount
                    ? `
            <div class="row">
              <div>Paid Amount</div>
              <div>Rs ${order.paid_amount}</div>
            </div>
            <div class="row">
              <div>Change</div>
              <div>Rs ${order.paid_amount - order.total_price}</div>
            </div>
            `
                    : ''
            }

            <div class="footer">
              <p>Thanks for having our passion. Drop by again!</p>
            </div>
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

    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <Box
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                }}
            >
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#063455' }}>
                    Order History
                </Typography>

                {/* Filters */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                        <TextField
                            size="small"
                            label="Order ID"
                            value={searchId}
                            onChange={(e) => {
                                setSearchId(e.target.value);
                                applyFilters();
                            }}
                            sx={{ width: 120 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            size="small"
                            label="Client Name"
                            value={searchName}
                            onChange={(e) => {
                                setSearchName(e.target.value);
                                applyFilters();
                            }}
                            sx={{ width: 200 }}
                        />
                        <TextField
                            size="small"
                            type="date"
                            label="Start Date"
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                applyFilters();
                            }}
                            InputLabelProps={{ shrink: true }}
                            sx={{ width: 160 }}
                        />
                        <TextField
                            size="small"
                            type="date"
                            label="End Date"
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                applyFilters();
                            }}
                            InputLabelProps={{ shrink: true }}
                            sx={{ width: 160 }}
                        />
                        <FormControl size="small" sx={{ width: 140 }}>
                            <InputLabel>Order Type</InputLabel>
                            <Select
                                value={orderType}
                                label="Order Type"
                                onChange={(e) => {
                                    setOrderType(e.target.value);
                                    applyFilters();
                                }}
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="dineIn">Dine-In</MenuItem>
                                <MenuItem value="delivery">Delivery</MenuItem>
                                <MenuItem value="takeaway">Takeaway</MenuItem>
                                <MenuItem value="reservation">Reservation</MenuItem>
                                <MenuItem value="room_service">Room Service</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ width: 140 }}>
                            <InputLabel>Payment</InputLabel>
                            <Select
                                value={paymentStatus}
                                label="Payment"
                                onChange={(e) => {
                                    setPaymentStatus(e.target.value);
                                    applyFilters();
                                }}
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="paid">Paid</MenuItem>
                                <MenuItem value="awaiting">Awaiting</MenuItem>
                                <MenuItem value="unpaid">Unpaid</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Paper>

                {/* Table */}
                <TableContainer component={Paper} sx={{ position: 'relative' }}>
                    {/* Loading Overlay */}
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
                    <Table>
                        <TableHead sx={{ backgroundColor: '#063455' }}>
                            <TableRow>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Order #</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Date</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Type</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Client</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Table</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Items</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Total</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Payment</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders?.data?.length > 0 ? (
                                orders.data.map((order) => (
                                    <TableRow key={order.id} hover>
                                        <TableCell>#{order.id}</TableCell>
                                        <TableCell>{new Date(order.start_date).toLocaleDateString()}</TableCell>
                                        <TableCell>{formatOrderType(order.order_type)}</TableCell>
                                        <TableCell>{getClientName(order)}</TableCell>
                                        <TableCell>{order.table?.table_no || '-'}</TableCell>
                                        <TableCell>{order.order_items?.length || 0}</TableCell>
                                        <TableCell>Rs. {order.total_price?.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Chip label={order.status} size="small" color={order.status === 'completed' ? 'success' : 'default'} />
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={order.payment_status || 'unpaid'} size="small" color={getStatusColor(order.payment_status)} />
                                        </TableCell>
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
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={10} align="center">
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
                            {/* Receipt Preview */}
                            <Receipt invoiceData={getReceiptData(selectedOrder)} openModal={viewModalOpen} showButtons={false} />

                            {/* Order Details */}
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
                                            Status
                                        </Typography>
                                        <Box>
                                            <Chip label={selectedOrder.status} size="small" color={selectedOrder.status === 'completed' ? 'success' : 'default'} />
                                        </Box>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Payment
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
                                            {selectedOrder.order_items?.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{item.order_item?.name || 'Item'}</TableCell>
                                                    <TableCell align="right">{item.order_item?.quantity || 1}</TableCell>
                                                    <TableCell align="right">Rs. {item.order_item?.total_price || 0}</TableCell>
                                                    <TableCell align="right">Rs. {(item.order_item?.quantity || 1) * (item.order_item?.total_price || 0)}</TableCell>
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
