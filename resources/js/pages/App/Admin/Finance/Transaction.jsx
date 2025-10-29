import { useState, useEffect } from 'react';
import { Typography, Button, Card, CardContent, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, InputAdornment, Pagination, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { Search, FilterAlt, People, CreditCard } from '@mui/icons-material';
import PrintIcon from '@mui/icons-material/Print';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import TransactionFilter from './Filter';
import InvoiceSlip from '../Membership/Invoice';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const Transaction = ({ transactions, filters }) => {
    // Modal state
    const [open, setOpen] = useState(true);
    const [openFilterModal, setOpenFilterModal] = useState(false);
    const [openInvoiceModal, setOpenInvoiceModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
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
                }
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
            }
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
            }
        );
    };

    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                    backgroundColor: '#F6F6F6',
                }}
            >
                <div className="container-fluid p-4" style={{ backgroundColor: '#f5f5f5', minHeight: 'auto' }}>
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
                                    <Select
                                        value={perPage}
                                        onChange={handlePerPageChange}
                                        displayEmpty
                                    >
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
                        <TableContainer component={Paper} style={{ boxShadow: 'none' }}>
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
                                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
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
                                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                    .join(' ');
                                            };

                                            // Format date
                                            const formatDate = (date) => {
                                                if (!date) return 'N/A';
                                                try {
                                                    return new Date(date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    });
                                                } catch (e) {
                                                    return 'N/A';
                                                }
                                            };

                                            // Get status badge style
                                            const getStatusBadge = (status) => {
                                                const styles = {
                                                    paid: { bg: '#d4edda', color: '#155724', text: 'Paid' },
                                                    unpaid: { bg: '#f8d7da', color: '#721c24', text: 'Unpaid' },
                                                    partial: { bg: '#fff3cd', color: '#856404', text: 'Partial' },
                                                    default: { bg: '#e2e3e5', color: '#383d41', text: status || 'N/A' }
                                                };
                                                return styles[status] || styles.default;
                                            };

                                            const statusStyle = getStatusBadge(transaction.status);

                                            return (
                                                <TableRow key={transaction.id} style={{ borderBottom: '1px solid #eee' }}>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                        {transaction.invoice_no || 'N/A'}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                        <div>
                                                            <div style={{ fontWeight: 500, color: '#000000' }}>
                                                                {transaction.member?.full_name || transaction.customer?.name || 'N/A'}
                                                            </div>
                                                            {transaction.member?.membership_no && (
                                                                <div style={{ fontSize: '12px', color: '#7F7F7F' }}>
                                                                    {transaction.member.membership_no}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                        <span style={{
                                                            backgroundColor: '#e3f2fd',
                                                            color: '#1976d2',
                                                            padding: '4px 8px',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            fontWeight: 500
                                                        }}>
                                                            {formatType(displayType)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 500, fontSize: '14px' }}>
                                                        Rs {transaction.total_price?.toLocaleString() || transaction.amount?.toLocaleString() || 0}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                        <span style={{
                                                            backgroundColor: statusStyle.bg,
                                                            color: statusStyle.color,
                                                            padding: '4px 8px',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            fontWeight: 500
                                                        }}>
                                                            {statusStyle.text.toUpperCase()}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                        {formatPaymentMethod(transaction.payment_method)}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                        {formatDate(transaction.payment_date || transaction.created_at)}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                        {transaction.valid_to ? (
                                                            <span style={{ 
                                                                color: new Date(transaction.valid_to) > new Date() ? '#28a745' : '#dc3545',
                                                                fontWeight: 500 
                                                            }}>
                                                                {formatDate(transaction.valid_to)}
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: '#7F7F7F' }}>-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span
                                                            style={{
                                                                color: '#0C67AA',
                                                                textDecoration: 'underline',
                                                                cursor: 'pointer',
                                                                fontWeight: 500
                                                            }}
                                                            onClick={() => {
                                                                setSelectedInvoice(transaction);
                                                                setOpenInvoiceModal(true);
                                                            }}
                                                        >
                                                            View
                                                        </span>
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
                                <Pagination 
                                    count={transactions.last_page} 
                                    page={transactions.current_page} 
                                    onChange={handlePageChange} 
                                    color="primary"
                                    showFirstButton
                                    showLastButton
                                />
                            </div>
                        )}
                    </div>
                    <TransactionFilter open={openFilterModal} onClose={() => setOpenFilterModal(false)} />
                    <InvoiceSlip open={openInvoiceModal} onClose={() => setOpenInvoiceModal(false)} data={selectedInvoice} />
                </div>
            </div>
        </>
    );
};

export default Transaction;
