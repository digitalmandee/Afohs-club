import { useState, useEffect } from 'react';
import { Typography, Button, Card, CardContent, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, InputAdornment, Pagination, MenuItem, Select, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Grid, Box, Chip } from '@mui/material';
import { Search, FilterAlt, People, CreditCard, Payment } from '@mui/icons-material';
import PrintIcon from '@mui/icons-material/Print';
import 'bootstrap/dist/css/bootstrap.min.css';
import { router } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import TransactionFilter from './Filter';
import InvoiceSlip from '../Subscription/Invoice';
import MembershipInvoiceSlip from '../Membership/Invoice';
import BookingInvoiceModal from '@/components/App/Rooms/BookingInvoiceModal';
import EventBookingInvoiceModal from '@/components/App/Events/EventBookingInvoiceModal';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';

// const drawerWidthOpen = 240;
// const drawerWidthClosed = 110;

const Transaction = ({ transactions, filters }) => {
    // Modal state
    // const [open, setOpen] = useState(true);
    const [openFilterModal, setOpenFilterModal] = useState(false);
    const [openInvoiceModal, setOpenInvoiceModal] = useState(false);
    const [openMembershipInvoiceModal, setOpenMembershipInvoiceModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [selectedMemberUserId, setSelectedMemberUserId] = useState(null);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
    const [showRoomInvoiceModal, setShowRoomInvoiceModal] = useState(false);
    const [showEventInvoiceModal, setShowEventInvoiceModal] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [transactionList, setTransactionList] = useState(transactions);
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.per_page || 10);

    // Handle search with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            router.get(
                route('finance.transaction'),
                { search: searchQuery, per_page: perPage },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Handle per page change
    const handlePerPageChange = (event) => {
        const newPerPage = event.target.value;
        setPerPage(newPerPage);
        router.get(
            route('finance.transaction'),
            { search: searchQuery, per_page: newPerPage },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Handle page change
    const handlePageChange = (event, value) => {
        router.get(
            transactions.links[value].url,
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Payment Confirmation State
    const [paymentConfirmationOpen, setPaymentConfirmationOpen] = useState(false);
    const [transactionToPay, setTransactionToPay] = useState(null);

    // Payment Confirmation Handlers
    const handlePayClick = (transaction) => {
        setTransactionToPay(transaction);
        setPaymentConfirmationOpen(true);
    };

    const handleConfirmPayment = async () => {
        if (!transactionToPay) return;

        try {
            const response = await axios.post(route('finance.transaction.update-status', transactionToPay.id), {
                status: 'paid',
            });
            if (response.data.success) {
                enqueueSnackbar('Invoice marked as paid successfully!', { variant: 'success' });
                // Refresh transactions using Inertia reload
                router.reload({ only: ['transactions'] });
                setPaymentConfirmationOpen(false);
                setTransactionToPay(null);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            enqueueSnackbar('Failed to update status', { variant: 'error' });
        }
    };

    // Helper function to format currency
    const formatCurrency = (amount) => {
        if (!amount) return 'Rs 0';
        return `Rs ${parseFloat(amount).toLocaleString()}`;
    };

    // Helper function to format date
    const formatDate = (date) => {
        if (!date) return '';
        try {
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch (error) {
            return date;
        }
    };

    return (
        <>
            {/* <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                    backgroundColor: '#F6F6F6',
                }}
            > */}
            <div className="container-fluid p-4" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', overflowX: 'hidden' }}>
                {/* Recently Joined Section */}
                <div className="mx-0">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <Typography style={{ fontWeight: 500, fontSize: '30px', color: '#063455' }}>Transactions</Typography>
                            <Typography style={{ fontSize: '14px', color: '#7F7F7F', marginTop: '5px' }}>
                                Showing {transactions.from || 0} to {transactions.to || 0} of {transactions.total || 0} transactions
                            </Typography>
                        </div>
                        <div className="d-flex align-items-center">
                            <TextField
                                placeholder="Search by invoice, name, membership no..."
                                variant="outlined"
                                size="small"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ width: '350px', marginRight: '10px' }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <FormControl size="small" style={{ width: '100px', marginRight: '10px' }}>
                                <Select value={perPage} onChange={handlePerPageChange} displayEmpty>
                                    <MenuItem value={10}>10</MenuItem>
                                    <MenuItem value={25}>25</MenuItem>
                                    <MenuItem value={50}>50</MenuItem>
                                    <MenuItem value={100}>100</MenuItem>
                                </Select>
                            </FormControl>
                            <Button
                                variant="outlined"
                                startIcon={<FilterAlt />}
                                style={{
                                    border: '1px solid #063455',
                                    color: '#333',
                                    textTransform: 'none',
                                    backgroundColor: 'transparent',
                                    marginRight: 10,
                                }}
                                onClick={() => {
                                    setOpenFilterModal(true); // open the modal
                                }}
                            >
                                Filter
                            </Button>

                            <Button
                                variant="contained"
                                startIcon={<PrintIcon />}
                                sx={{
                                    backgroundColor: '#003366',
                                    textTransform: 'none',
                                    color: 'white',
                                }}
                            >
                                Print
                            </Button>
                        </div>
                    </div>

                    {/* Transactions Table */}
                    <TableContainer component={Paper} style={{ boxShadow: 'none', overflowX: 'auto' }}>
                        <Table>
                            <TableHead>
                                <TableRow style={{ backgroundColor: '#E5E5EA', height: '60px' }}>
                                    <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Invoice No</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Member</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Type</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Amount</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Status</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Payment Method</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Date</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Valid Until</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Invoice</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {transactions.data && transactions.data.length > 0 ? (
                                    transactions.data.map((transaction) => {
                                        // Format fee type or invoice type for display
                                        const formatType = (type) => {
                                            if (!type) return 'N/A';
                                            return type
                                                .replace(/_/g, ' ')
                                                .split(' ')
                                                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                .join(' ');
                                        };

                                        // Use fee_type if available, otherwise use invoice_type
                                        const displayType = transaction.fee_type || transaction.invoice_type;

                                        // Format payment method
                                        const formatPaymentMethod = (method) => {
                                            if (!method) return 'N/A';
                                            return method
                                                .replace(/_/g, ' ')
                                                .split(' ')
                                                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                .join(' ');
                                        };

                                        // Format date
                                        const formatDate = (date) => {
                                            if (!date) return 'N/A';
                                            try {
                                                return new Date(date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                });
                                            } catch (e) {
                                                return 'N/A';
                                            }
                                        };

                                        // Get status badge style
                                        const getStatusBadge = (status) => {
                                            const formattedText = status ? status.replace(/_/g, ' ') : 'N/A';
                                            const styles = {
                                                paid: { bg: '#d4edda', color: '#155724', text: 'Paid' },
                                                unpaid: { bg: '#f8d7da', color: '#721c24', text: 'Unpaid' },
                                                partial: { bg: '#fff3cd', color: '#856404', text: 'Partial' },
                                                checked_in: { bg: '#cce5ff', color: '#004085', text: 'Checked In' },
                                                checked_out: { bg: '#d1ecf1', color: '#0c5460', text: 'Checked Out' },
                                                default: { bg: '#e2e3e5', color: '#383d41', text: formattedText },
                                            };
                                            return styles[status] || styles.default;
                                        };

                                        const statusStyle = getStatusBadge(transaction.status);

                                        return (
                                            <TableRow key={transaction.id} style={{ borderBottom: '1px solid #eee' }}>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{transaction.invoice_no || 'N/A'}</TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                    <div>
                                                        <div style={{ fontWeight: 500, color: '#000000' }}>{transaction.member?.full_name || transaction.customer?.name || 'N/A'}</div>
                                                        {transaction.member?.membership_no && <div style={{ fontSize: '12px', color: '#7F7F7F' }}>{transaction.member.membership_no}</div>}
                                                    </div>
                                                </TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                    <span
                                                        style={{
                                                            backgroundColor: '#e3f2fd',
                                                            color: '#1976d2',
                                                            padding: '4px 8px',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {formatType(displayType)}
                                                    </span>
                                                </TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 500, fontSize: '14px' }}>Rs {transaction.total_price?.toLocaleString() || transaction.amount?.toLocaleString() || 0}</TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                    <span
                                                        style={{
                                                            backgroundColor: statusStyle.bg,
                                                            color: statusStyle.color,
                                                            padding: '4px 8px',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {statusStyle.text.toUpperCase()}
                                                    </span>
                                                </TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{formatPaymentMethod(transaction.payment_method)}</TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{formatDate(transaction.payment_date || transaction.created_at)}</TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                    {transaction.valid_to ? (
                                                        <span
                                                            style={{
                                                                color: new Date(transaction.valid_to) > new Date() ? '#28a745' : '#dc3545',
                                                                fontWeight: 500,
                                                            }}
                                                        >
                                                            {formatDate(transaction.valid_to)}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: '#7F7F7F' }}>-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell sx={{ display: 'flex', gap: '4px' }}>
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        style={{
                                                            backgroundColor: '#003366',
                                                            textTransform: 'none',
                                                            color: 'white',
                                                        }}
                                                        onClick={() => {
                                                            // Check invoice type and open appropriate modal
                                                            if (transaction.invoice_type === 'room_booking' && transaction.invoiceable_id) {
                                                                setSelectedBookingId(transaction.invoiceable_id);
                                                                setShowRoomInvoiceModal(true);
                                                            } else if (transaction.invoice_type === 'event_booking' && transaction.invoiceable_id) {
                                                                setSelectedBookingId(transaction.invoiceable_id);
                                                                setShowEventInvoiceModal(true);
                                                            } else if (transaction.member && transaction.member.id) {
                                                                // Member-related invoices
                                                                if (transaction.fee_type === 'membership_fee') {
                                                                    // Membership fee: use member ID only
                                                                    setSelectedMemberUserId(transaction.member.id);
                                                                    setSelectedInvoiceId(null);
                                                                } else {
                                                                    // Subscription/Maintenance fees: use invoice ID
                                                                    setSelectedMemberUserId(null);
                                                                    setSelectedInvoiceId(transaction.id);
                                                                }
                                                                setOpenMembershipInvoiceModal(true);
                                                            } else {
                                                                // Fallback
                                                                setSelectedInvoice(transaction);
                                                                setOpenInvoiceModal(true);
                                                            }
                                                        }}
                                                    >
                                                        View
                                                    </Button>
                                                    {transaction.status === 'unpaid' && (
                                                        <Button size="small" variant="contained" color="success" startIcon={<Payment />} onClick={() => handlePayClick(transaction)} sx={{ fontSize: '11px', py: 0.5, px: 1, whiteSpace: 'nowrap', mr: 1 }}>
                                                            Pay Now
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ py: 4, color: '#7F7F7F' }}>
                                            {searchQuery ? 'No transactions found matching your search' : 'No transactions found'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination */}
                    {transactions.last_page > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                            <Typography style={{ fontSize: '14px', color: '#7F7F7F' }}>
                                Page {transactions.current_page} of {transactions.last_page}
                            </Typography>
                            <Pagination count={transactions.last_page} page={transactions.current_page} onChange={handlePageChange} color="primary" showFirstButton showLastButton />
                        </div>
                    )}
                </div>
                <TransactionFilter open={openFilterModal} onClose={() => setOpenFilterModal(false)} />

                {/* Fallback Invoice Modal (for non-member transactions) */}
                <InvoiceSlip open={openInvoiceModal} onClose={() => setOpenInvoiceModal(false)} data={selectedInvoice} />

                {/* Membership Invoice Modal - Used for Membership, Subscription & Maintenance Fees */}
                <MembershipInvoiceSlip
                    open={openMembershipInvoiceModal}
                    onClose={() => {
                        setOpenMembershipInvoiceModal(false);
                        setSelectedMemberUserId(null);
                        setSelectedInvoiceId(null);
                    }}
                    invoiceNo={selectedMemberUserId}
                    invoiceId={selectedInvoiceId}
                />

                {/* Room Booking Invoice Modal */}
                <BookingInvoiceModal
                    open={showRoomInvoiceModal}
                    onClose={() => {
                        setShowRoomInvoiceModal(false);
                        setSelectedBookingId(null);
                    }}
                    bookingId={selectedBookingId}
                    setBookings={setTransactionList}
                    financeView={true}
                />

                {/* Event Booking Invoice Modal */}
                <EventBookingInvoiceModal
                    open={showEventInvoiceModal}
                    onClose={() => {
                        setShowEventInvoiceModal(false);
                        setSelectedBookingId(null);
                    }}
                    bookingId={selectedBookingId}
                    setBookings={setTransactionList}
                    financeView={true}
                />

                {/* Payment Confirmation Dialog */}
                <Dialog open={paymentConfirmationOpen} onClose={() => setPaymentConfirmationOpen(false)} aria-labelledby="payment-dialog-title" aria-describedby="payment-dialog-description">
                    <DialogTitle id="payment-dialog-title" sx={{ color: '#0a3d62', fontWeight: 600 }}>
                        Confirm Payment
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="payment-dialog-description">Are you sure you want to mark this invoice as paid?</DialogContentText>
                        {transactionToPay && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                                <Grid container spacing={1}>
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Invoice No:</strong> {transactionToPay.invoice_no}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Member:</strong> {transactionToPay.member?.full_name || transactionToPay.customer?.name || 'N/A'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Type:</strong> {transactionToPay.fee_type?.replace(/_/g, ' ').toUpperCase() || transactionToPay.invoice_type?.replace(/_/g, ' ').toUpperCase()}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Amount:</strong> {formatCurrency(transactionToPay.total_price || transactionToPay.amount)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Period:</strong> {transactionToPay.valid_from && transactionToPay.valid_to ? `${formatDate(transactionToPay.valid_from)} - ${formatDate(transactionToPay.valid_to)}` : '-'}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setPaymentConfirmationOpen(false)} color="inherit">
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmPayment} variant="contained" color="success" autoFocus startIcon={<Payment />}>
                            Confirm Payment
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
            {/* </div> */}
        </>
    );
};

export default Transaction;
