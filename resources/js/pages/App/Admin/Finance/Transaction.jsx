import { useState, useEffect } from 'react';
import { Typography, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, InputAdornment, Pagination, MenuItem, Select, FormControl, Tooltip } from '@mui/material';
import { Search, FilterAlt, Payment } from '@mui/icons-material';
import PrintIcon from '@mui/icons-material/Print';
import 'bootstrap/dist/css/bootstrap.min.css';
import { router } from '@inertiajs/react';
import TransactionFilter from './Filter';
import InvoiceSlip from '../Subscription/Invoice';
import MembershipInvoiceSlip from '../Membership/Invoice';
import BookingInvoiceModal from '@/components/App/Rooms/BookingInvoiceModal';
import EventBookingInvoiceModal from '@/components/App/Events/EventBookingInvoiceModal';
import PaymentDialog from '@/components/App/Transactions/PaymentDialog';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import dayjs from 'dayjs';

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

    const [submittingPayment, setSubmittingPayment] = useState(false);

    const handleConfirmPayment = async (paymentData) => {
        if (!transactionToPay) return;

        setSubmittingPayment(true);
        const formData = new FormData();
        formData.append('status', 'paid');
        formData.append('payment_method', paymentData.payment_method);
        if (paymentData.payment_method === 'credit_card') {
            formData.append('credit_card_type', paymentData.credit_card_type);
            if (paymentData.receipt_file) {
                formData.append('receipt_file', paymentData.receipt_file);
            }
        }

        try {
            const response = await axios.post(route('finance.transaction.update-status', transactionToPay.id), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
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
            enqueueSnackbar(error.response?.data?.errors ? Object.values(error.response.data.errors).flat().join(', ') : 'Failed to update status', { variant: 'error' });
        } finally {
            setSubmittingPayment(false);
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
            return dayjs(date).format('DD-MM-YYYY');
        } catch (error) {
            return date;
        }
    };

    return (
        <>
            <div className="container-fluid p-4" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', overflowX: 'hidden' }}>
                {/* Recently Joined Section */}
                <div className="mx-0">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <Typography style={{ fontWeight: 700, fontSize: '30px', color: '#063455' }}>Transactions</Typography>
                            {/* <Typography style={{ fontSize: '14px', color: '#7F7F7F', marginTop: '5px' }}>
                                Showing {transactions.from || 0} to {transactions.to || 0} of {transactions.total || 0} transactions
                            </Typography> */}
                        </div>
                        <div className="d-flex align-items-center">
                            <TextField
                                placeholder="Search by invoice, name, membership no..."
                                variant="outlined"
                                size="small"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                sx={{
                                    width: '300px',
                                    marginRight: '10px',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '16px',
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderRadius: '16px',
                                    },
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <FormControl
                                size="small"
                                sx={{
                                    width: '80px',
                                    marginRight: '10px',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '16px',
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderRadius: '16px',
                                    },
                                }}
                            >
                                <Select value={perPage} onChange={handlePerPageChange} displayEmpty>
                                    <MenuItem value={10}>10</MenuItem>
                                    <MenuItem value={25}>25</MenuItem>
                                    <MenuItem value={50}>50</MenuItem>
                                    <MenuItem value={100}>100</MenuItem>
                                </Select>
                            </FormControl>
                            <Button
                                variant="outlined"
                                startIcon={<FilterAlt sx={{ color: '#fff' }} />}
                                style={{
                                    border: '1px solid #063455',
                                    color: '#fff',
                                    textTransform: 'none',
                                    backgroundColor: '#063455',
                                    marginRight: 10,
                                    borderRadius: '16px',
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
                                    backgroundColor: '#063455',
                                    textTransform: 'none',
                                    color: 'white',
                                    borderRadius: '16px',
                                }}
                            >
                                Print
                            </Button>
                        </div>
                    </div>
                    <Typography sx={{ color: '#063455', fontSize: '15px', fontWeight: '600' }}>View and manage all recorded financial transactions</Typography>

                    {/* Transactions Table */}
                    <TableContainer component={Paper} style={{ boxShadow: 'none', marginTop: '2rem', overflowX: 'auto', borderRadius: '16px' }}>
                        <Table>
                            <TableHead>
                                <TableRow style={{ backgroundColor: '#063455', height: '30px' }}>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600, whiteSpace: 'nowrap' }}>Invoice No</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600, whiteSpace: 'nowrap' }}>Member</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600, whiteSpace: 'nowrap' }}>Type</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600, whiteSpace: 'nowrap' }}>Amount</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600, whiteSpace: 'nowrap' }}>Status</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600, whiteSpace: 'nowrap' }}>Payment Method</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600, whiteSpace: 'nowrap' }}>Date</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600, whiteSpace: 'nowrap' }}>From</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600, whiteSpace: 'nowrap' }}>To</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600, whiteSpace: 'nowrap' }}>Days</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600, whiteSpace: 'nowrap' }}>Invoice</TableCell>
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
                                                        <div style={{ fontWeight: 500, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '200px' }}>
                                                            <Tooltip title={transaction.member?.full_name || transaction.customer?.name || transaction.invoiceable?.name || 'N/A'} arrow>
                                                                <span>{transaction.member?.full_name || transaction.customer?.name || transaction.invoiceable?.name || 'N/A'}</span>
                                                            </Tooltip>
                                                        </div>
                                                        {transaction.member?.membership_no && <div style={{ fontSize: '12px', color: '#7F7F7F' }}>{transaction.member.membership_no}</div>}
                                                    </div>
                                                </TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>
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
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 500, fontSize: '14px', whiteSpace:'nowrap', textOverflow:'ellipsis', overflow:'hidden', maxWidth:'120px' }}> 
                                                    <Tooltip title={transaction.total_price?.toLocaleString() || transaction.amount?.toLocaleString() || 0} arrow>
                                                        <span> Rs {transaction.total_price?.toLocaleString() || transaction.amount?.toLocaleString() || 0}</span>
                                                    </Tooltip>
                                                </TableCell>
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
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>{formatDate(transaction.payment_date || transaction.created_at)}</TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>
                                                    {transaction.valid_from ? (
                                                        <span
                                                            style={{
                                                                color: new Date(transaction.valid_from) > new Date() ? '#28a745' : '#dc3545',
                                                                fontWeight: 500,
                                                            }}
                                                        >
                                                            {formatDate(transaction.valid_from)}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: '#7F7F7F' }}>-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>
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
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>{transaction.valid_from && transaction.valid_to ? <span>{dayjs(transaction.valid_to).diff(dayjs(transaction.valid_from), 'day') + 1}</span> : <span style={{ color: '#7F7F7F' }}>-</span>}</TableCell>
                                                <TableCell sx={{ display: 'flex', gap: '4px' }}>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        color='#063455'
                                                        style={{
                                                            // border: '1px solid #063455',
                                                            // backgroundColor: 'transparent',
                                                            textTransform: 'none',
                                                            color: '#063455',
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

                {/* Payment Dialog */}
                <PaymentDialog
                    open={paymentConfirmationOpen}
                    onClose={() => {
                        setPaymentConfirmationOpen(false);
                        setTransactionToPay(null);
                    }}
                    transaction={transactionToPay}
                    onConfirm={handleConfirmPayment}
                    submitting={submittingPayment}
                />
            </div>
            {/* </div> */}
        </>
    );
};

export default Transaction;
