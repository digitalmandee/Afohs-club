import POSLayout from "@/components/POSLayout";
import Receipt from '@/components/App/Invoice/Receipt';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, MenuItem, Select, FormControl, InputLabel, Pagination, Typography, Chip, InputAdornment, Card, CardContent, Grid, CircularProgress, IconButton, Tooltip, Dialog, DialogContent, DialogTitle, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import debounce from 'lodash.debounce';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

// const drawerWidthOpen = 240;
// const drawerWidthClosed = 110;

const Dashboard = ({ orders, filters, totals }) => {
    const { auth } = usePage().props;
    const user = auth.user;

    // const [open, setOpen] = useState(true);
    const [searchId, setSearchId] = useState(filters?.search_id || '');
    const [searchName, setSearchName] = useState(filters?.search_name || '');
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');
    const [orderType, setOrderType] = useState(filters?.type || 'all');
    const [paymentMethod, setPaymentMethod] = useState(filters?.payment_method || 'all');
    const [isLoading, setIsLoading] = useState(false);

    // Modal state
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const applyFilters = debounce(() => {
        setIsLoading(true);
        router.get(
            route('transaction.history'),
            {
                search_id: searchId || undefined,
                search_name: searchName || undefined,
                start_date: startDate || undefined,
                end_date: endDate || undefined,
                type: orderType !== 'all' ? orderType : undefined,
                payment_method: paymentMethod !== 'all' ? paymentMethod : undefined,
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
            route('transaction.history'),
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

    const formatPaymentMethod = (method) => {
        const methods = {
            cash: 'Cash',
            card: 'Card',
            online: 'Online',
            wallet: 'Wallet',
        };
        return methods[method] || method || '-';
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
            start_date: order.paid_at || order.start_date,
            date: order.paid_at || order.start_date,
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
            payment_method: order.payment_method,
            order_items:
                order.order_items?.map((item) => ({
                    order_item: item.order_item,
                    name: item.order_item?.name || 'Item',
                    quantity: item.order_item?.quantity || 1,
                    price: item.order_item?.price || 0,
                    total_price: item.order_item?.total_price || (item.order_item?.quantity || 1) * (item.order_item?.price || 0),
                })) || [],
            data: {
                bank_charges_enabled: order.id ? true : false, // Simplification, need actual data from pivot/invoice
                // Since we don't have direct invoice data here on 'order' object easily without transformation in controller...
                // Ideally, controller should have loaded 'invoice' relation.
                // Assuming 'order' has 'invoice' loaded as per TransactionController::transactionHistory
                bank_charges_amount: order.invoice?.data?.bank_charges_amount || 0,
                bank_charges_type: order.invoice?.data?.bank_charges_type || 'percentage',
                bank_charges_value: order.invoice?.data?.bank_charges_value || 0,
            },
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
            <div class="header">
              <div><img src='/assets/Logo.png' class="logo"/></div>
            </div>
            <div class="header">
              <div>${order.paid_at ? new Date(order.paid_at).toLocaleString() : ''}</div>
            </div>

            <div class="order-id">
              <div>Order Id</div>
              <div><strong>#${order.id}</strong></div>
            </div>

            <div class="row">
              <div>Cashier</div>
              <div>${order.cashier?.name || user?.name || 'N/A'}</div>
            </div>

            ${order.waiter
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

            ${memberNo
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

            ${order.table
                ? `
            <div class="row">
              <div>Table Number</div>
              <div>${order.table.table_no}</div>
            </div>
            `
                : ''
            }

            <div class="row">
              <div>Payment Method</div>
              <div>${formatPaymentMethod(order.payment_method)}</div>
            </div>

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

            ${order.invoice?.data?.bank_charges_amount > 0
                ? `
                <div class="row">
                  <div>Bank Charges (${order.invoice.data.bank_charges_type === 'percentage' ? order.invoice.data.bank_charges_value + '%' : 'Fixed'})</div>
                  <div>Rs ${order.invoice.data.bank_charges_amount}</div>
                </div>
                `
                : ''
            }

            <div class="divider"></div>

            <div class="row total">
              <div>Total Amount</div>
              <div>Rs ${order.total_price || 0}</div>
            </div>

            <div class="row">
              <div>Paid Amount</div>
              <div>Rs ${order.paid_amount || 0}</div>
            </div>

            ${order.paid_amount > order.total_price
                ? `
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
            {/* <SideNav open={open} setOpen={setOpen} />
            <Box
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                }}
            > */}
            <Box sx={{
                minHeight: '100vh',
                bgcolor: '#f5f5f5',
                p: 2
            }}>
                <Typography sx={{ mb: 3, fontWeight: 600, fontSize: '30px', color: '#063455' }}>
                    Transaction History
                </Typography>

                {/* Summary Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ backgroundColor: '#063455', color: '#fff', borderRadius: '16px' }}>
                            <CardContent>
                                <Typography variant="body2">Total Transactions</Typography>
                                <Typography sx={{ fontWeight: '500', fontSize: '22px', color: '#fff' }}>{totals?.count || 0}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ backgroundColor: '#063455', color: '#fff', borderRadius: '16px' }}>
                            <CardContent>
                                <Typography variant="body2">Total Amount</Typography>
                                <Typography sx={{ fontWeight: '500', fontSize: '22px', color: '#fff' }}>Rs. {(totals?.total_amount || 0).toLocaleString()}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ backgroundColor: '#063455', color: '#fff', borderRadius: '16px' }}>
                            <CardContent>
                                <Typography variant="body2">Total Paid</Typography>
                                <Typography sx={{ fontWeight: '500', fontSize: '22px', color: '#fff' }}>Rs. {(totals?.total_paid || 0).toLocaleString()}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Filters */}
                <Box sx={{ mb: 3, pt: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                        <TextField
                            size="small"
                            label="Order ID"
                            value={searchId}
                            onChange={(e) => {
                                setSearchId(e.target.value);
                                applyFilters();
                            }}
                            sx={{
                                width: 120,
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "16px",
                                },
                            }}
                        // InputProps={{
                        //     startAdornment: (
                        //         <InputAdornment position="start">
                        //             <SearchIcon />
                        //         </InputAdornment>
                        //     ),
                        // }}
                        />
                        <TextField
                            size="small"
                            label="Client Name"
                            value={searchName}
                            onChange={(e) => {
                                setSearchName(e.target.value);
                                applyFilters();
                            }}
                            sx={{
                                width: 200,
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "16px",
                                },
                            }}
                        />
                        {/* <TextField
                            size="small"
                            type="date"
                            label="Start Date"
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                applyFilters();
                            }}
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                width: 150,
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "16px",
                                },
                            }}
                        /> */}
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Start Date"
                                value={startDate ? dayjs(startDate) : null}
                                onChange={(newValue) => {
                                    const formattedDate = newValue ? newValue.format('YYYY-MM-DD') : '';
                                    handleFilterChange('start_date', formattedDate);
                                }}
                                sx={{
                                    width: '150px',
                                    '& .MuiInputBase-root, & .MuiOutlinedInput-root, & fieldset': {
                                        borderRadius: '16px !important',
                                    },
                                }}
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                    },
                                }}
                            />
                        </LocalizationProvider>
                        {/* <TextField
                            size="small"
                            type="date"
                            label="End Date"
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                applyFilters();
                            }}
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                width: 150,
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "16px",
                                },
                            }}
                        /> */}
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="End Date"
                                value={endDate ? dayjs(endDate) : null}
                                onChange={(newValue) => {
                                    const formattedDate = newValue ? newValue.format('YYYY-MM-DD') : '';
                                    handleFilterChange('end_date', formattedDate);
                                }}
                                sx={{
                                    width: '150px',
                                    '& .MuiInputBase-root, & .MuiOutlinedInput-root, & fieldset': {
                                        borderRadius: '16px !important',
                                    },
                                }}
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                    },
                                }}
                            />
                        </LocalizationProvider>
                        <FormControl size="small" sx={{
                            width: 200,
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "16px",
                            },
                        }}>
                            <InputLabel>Order Type</InputLabel>
                            <Select
                                value={orderType}
                                label="Order Type"
                                onChange={(e) => {
                                    setOrderType(e.target.value);
                                    applyFilters();
                                }}
                                MenuProps={{
                                    sx: {
                                        '& .MuiMenuItem-root': {
                                            '&:hover': {
                                                backgroundColor: '#063455 !important',
                                                color: '#fff !important',
                                                borderRadius: '16px',
                                                my: 0.3,
                                                mx: 0.3
                                            },
                                            '&.Mui-selected': {
                                                backgroundColor: '#063455',
                                                color: '#fff',
                                                borderRadius: '16px',
                                                my: 0.3,
                                                mx: 0.3,
                                                '&:hover': {
                                                    backgroundColor: '#063455',
                                                    color: '#fff',
                                                    borderRadius: '16px',
                                                    my: 0.3,
                                                    mx: 0.3
                                                },
                                            },
                                        },
                                    },
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
                        <FormControl size="small" sx={{
                            width: 150,
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "16px",
                            },
                        }}>
                            <InputLabel>Payment</InputLabel>
                            <Select
                                value={paymentMethod}
                                label="Payment"
                                onChange={(e) => {
                                    setPaymentMethod(e.target.value);
                                    applyFilters();
                                }}
                                MenuProps={{
                                    sx: {
                                        '& .MuiMenuItem-root': {
                                            '&:hover': {
                                                backgroundColor: '#063455 !important',
                                                color: '#fff !important',
                                                borderRadius: '16px',
                                                my: 0.3,
                                                mx: 0.3
                                            },
                                            '&.Mui-selected': {
                                                backgroundColor: '#063455',
                                                color: '#fff',
                                                borderRadius: '16px',
                                                my: 0.3,
                                                mx: 0.3,
                                                '&:hover': {
                                                    backgroundColor: '#063455',
                                                    color: '#fff',
                                                    borderRadius: '16px',
                                                    my: 0.3,
                                                    mx: 0.3
                                                },
                                            },
                                        },
                                    },
                                }}
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="cash">Cash</MenuItem>
                                <MenuItem value="card">Card</MenuItem>
                                <MenuItem value="online">Online</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Box>

                {/* Table */}
                <TableContainer component={Paper} sx={{ position: 'relative', borderRadius: '12px' }}>
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
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Order</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Paid At</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Type</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Client</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Table</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Total</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Paid</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Balance</TableCell> {/* Renamed from Method/etc or added */}
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Method</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>ENT</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>CTS</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders?.data?.length > 0 ? (
                                orders.data.map((order) => {
                                    // Parse ENT/CTS from comments - this is a bit hacky if not in separate columns,
                                    // but we just added them to DB. Let's assume they might be in comments OR new columns if we reload.
                                    // Ideally, the backend should return these values.
                                    // For now, let's extract value from comment string if columns are null (backward comp)
                                    // OR better, we know we added columns ent_reason, ent_comment etc.
                                    // Use regex to extract value from brackets [ENT... Value: 100] if needed or use logic similar to controller.

                                    // Actually, we should calculate balance: Total - Paid - ENT_Value - CTS_Value
                                    // We need to parse the value from the new comment format IF the new columns aren't populous or if we just want to display what was saved.
                                    // The controller logic: "[ENT Items: ... - Value: 123.00]"

                                    const getEntValue = (o) => {
                                        if (o.ent_comment) {
                                            const match = o.ent_comment.match(/Value:\s*([\d,]+\.?\d*)/);
                                            return match ? parseFloat(match[1].replace(/,/g, '')) : 0;
                                        }
                                        return 0;
                                    };
                                    const getCtsValue = (o) => {
                                        if (o.cts_comment) {
                                            const match = o.cts_comment.match(/Partial CTS Amount:\s*([\d,]+\.?\d*)/);
                                            // If full CTS, comment is just comment, amount is total - paid (usually 0 if full cts)
                                            // But wait, if full CTS, paid_amount is 0?
                                            // Let's rely on the fact that Balance = Total - Paid - ENT - CTS.
                                            // If balance is 0, then we are good.
                                            // Let's just try to parse what we can.
                                            if (match) return parseFloat(match[1].replace(/,/g, ''));
                                            // If method is CTS and no partial amount, maybe full amount?
                                            // best to leave 0 if not explicit.
                                            return 0;
                                        }
                                        return 0;
                                    };

                                    const entVal = getEntValue(order);
                                    const ctsVal = getCtsValue(order);
                                    const bankCharges = Number(order.invoice?.data?.bank_charges_amount || 0);
                                    const advance = Number(order.invoice?.advance_payment || order.down_payment || order.invoice?.data?.advance_deducted || 0);
                                    const paidTotal = Number(order.paid_amount || 0) + advance;
                                    const balance = (order.total_price || 0) + bankCharges - paidTotal - entVal - ctsVal;

                                    return (
                                        <TableRow key={order.id} hover>
                                            <TableCell>#{order.id}</TableCell>
                                            <TableCell>{order.paid_at ? new Date(order.paid_at).toLocaleString() : '-'}</TableCell>
                                            <TableCell>{formatOrderType(order.order_type)}</TableCell>
                                            <TableCell>{getClientName(order)}</TableCell>
                                            <TableCell>{order.table?.table_no || '-'}</TableCell>
                                            <TableCell>Rs. {order.total_price?.toLocaleString()}</TableCell>
                                            <TableCell>Rs. {paidTotal?.toLocaleString()}</TableCell>
                                            <TableCell sx={{ color: balance > 5 ? 'error.main' : 'success.main', fontWeight: 'bold' }}>Rs. {Math.max(0, balance).toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Chip label={formatPaymentMethod(order.payment_method)} size="small" color="primary" variant="outlined" />
                                            </TableCell>
                                            <TableCell>{entVal > 0 ? `Rs. ${entVal.toLocaleString()}` : '-'}</TableCell>
                                            <TableCell>{ctsVal > 0 ? `Rs. ${ctsVal.toLocaleString()}` : '-'}</TableCell>
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
                                    <TableCell colSpan={12} align="center">
                                        No transactions found
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
            {/* </Box> */}

            {/* View Order Modal */}
            <Dialog open={viewModalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#063455', color: '#fff' }}>
                    <Typography variant="h6">Transaction Details - #{selectedOrder?.id}</Typography>
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
                                    Transaction Information
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
                                            Paid At
                                        </Typography>
                                        <Typography variant="body1">{selectedOrder.paid_at ? new Date(selectedOrder.paid_at).toLocaleString() : '-'}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Payment Method
                                        </Typography>
                                        <Box>
                                            <Chip label={formatPaymentMethod(selectedOrder.payment_method)} size="small" color="primary" variant="outlined" />
                                        </Box>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Total Amount
                                        </Typography>
                                        <Typography variant="body1" fontWeight="bold">
                                            Rs. {selectedOrder.total_price?.toLocaleString()}
                                        </Typography>
                                    </Box>

                                    {/* Bank Charges Detail in Modal */}
                                    {selectedOrder.invoice?.data?.bank_charges_amount > 0 && (
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Bank Charges
                                            </Typography>
                                            <Typography variant="body1" color="error">
                                                Rs. {selectedOrder.invoice.data.bank_charges_amount}
                                            </Typography>
                                        </Box>
                                    )}
                                    {/* Additional Details for ENT/CTS in Modal */}
                                    {selectedOrder.ent_comment && (
                                        <Box sx={{ gridColumn: 'span 2' }}>
                                            <Typography variant="caption" color="text.secondary">
                                                ENT Details
                                            </Typography>
                                            <Typography variant="body2" sx={{ backgroundColor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                                                {selectedOrder.ent_comment}
                                            </Typography>
                                        </Box>
                                    )}
                                    {selectedOrder.cts_comment && (
                                        <Box sx={{ gridColumn: 'span 2' }}>
                                            <Typography variant="caption" color="text.secondary">
                                                CTS Details
                                            </Typography>
                                            <Typography variant="body2" sx={{ backgroundColor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                                                {selectedOrder.cts_comment}
                                            </Typography>
                                        </Box>
                                    )}

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

Dashboard.layout = (page) => <POSLayout>{page}</POSLayout>;

export default Dashboard;
