import { useState } from 'react';
import { Typography, Button, Card, CardContent, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, InputAdornment } from '@mui/material';
import { Search, FilterAlt, People, CreditCard } from '@mui/icons-material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import 'bootstrap/dist/css/bootstrap.min.css';
import { router } from '@inertiajs/react';
import SubscriptionFilter from './Filter';
import SubscriptionCardComponent from './UserCard';
import MembershipInvoiceSlip from '../Membership/Invoice';

const SubscriptionDashboard = ({ statistics, recent_subscriptions }) => {
    // Modal state
    // const [open, setOpen] = useState(true);
    const [openInvoiceModal, setOpenInvoiceModal] = useState(false);
    const [openCardModal, setOpenCardModal] = useState(false);
    const [openFilterModal, setOpenFilterModal] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState(null);
    const [selectedMemberUserId, setSelectedMemberUserId] = useState(null);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

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
            <div className="container-fluid p-4" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        {/* <IconButton>
                                <ArrowBack />
                            </IconButton> */}
                        <Typography sx={{ marginLeft: '10px', fontWeight: 500, color: '#063455', fontSize: '30px' }}>Subscription Dashboard</Typography>
                    </div>
                    <Button variant="contained" sx={{ backgroundColor: '#063455', color: 'white' }} onClick={() => router.visit(route('finance.transaction.create'))}>
                        Add Subscription
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="row mb-4 mt-4">
                    <div className="col-md-4 mb-3">
                        <Card style={{ backgroundColor: '#063455', color: 'white', height: '150px' }}>
                            <CardContent className="text-center py-4">
                                <div className="mb-2">
                                    <Avatar style={{ backgroundColor: '#202728', margin: '0 auto' }}>
                                        <People />
                                    </Avatar>
                                </div>
                                <Typography sx={{ mt: 1, marginBottom: '5px', fontSize: '16px', fontWeight: 400, color: '#C6C6C6' }}>Total Active Subscriptions</Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: '24px', color: '#FFFFFF' }}>{statistics?.total_active_subscriptions || 0}</Typography>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="col-md-4 mb-3">
                        <Card style={{ backgroundColor: '#063455', color: 'white', height: '150px' }}>
                            <CardContent className="text-center py-4">
                                <div className="mb-2">
                                    <Avatar style={{ backgroundColor: '#202728', margin: '0 auto' }}>
                                        <CreditCard />
                                    </Avatar>
                                </div>
                                <Typography sx={{ mt: 1, marginBottom: '5px', fontSize: '16px', fontWeight: 400, color: '#C6C6C6' }}>New Subscriptions Today</Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: '24px', color: '#FFFFFF' }}>{statistics?.new_subscriptions_today || 0}</Typography>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="col-md-4 mb-3">
                        <Card style={{ backgroundColor: '#063455', color: 'white', height: '150px' }}>
                            <CardContent className="text-center py-4">
                                <div className="mb-2">
                                    <Avatar style={{ backgroundColor: '#202728', margin: '0 auto' }}>
                                        <CreditCard />
                                    </Avatar>
                                </div>
                                <Typography sx={{ mt: 1, marginBottom: '5px', fontSize: '16px', fontWeight: 400, color: '#C6C6C6' }}>Total Revenue</Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: '24px', color: '#FFFFFF' }}>Rs. {statistics?.total_revenue?.toLocaleString() || 0}</Typography>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Recently Joined Section */}
                <div className="mx-0">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <Typography style={{ fontWeight: 500, fontSize: '24px', color: '#000000' }}>Recent Subscription Transactions</Typography>

                        <div className="d-flex">
                            <TextField
                                placeholder="Search by name, member type etc"
                                variant="outlined"
                                size="small"
                                style={{ width: '350px', marginRight: '10px' }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Button
                                variant="outlined"
                                startIcon={<FilterAlt />}
                                style={{
                                    border: '1px solid #063455',
                                    color: '#333',
                                    textTransform: 'none',
                                    backgroundColor: 'transparent',
                                }}
                                onClick={() => {
                                    setOpenFilterModal(true); // open the modal
                                }}
                            >
                                Filter
                            </Button>
                        </div>
                    </div>

                    {/* Members Table */}
                    <TableContainer component={Paper} style={{ boxShadow: 'none' }}>
                        <Table>
                            <TableHead>
                                <TableRow style={{ backgroundColor: '#E5E5EA', height: '60px' }}>
                                    <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Invoice No</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Member</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Subscription Type</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Category</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Amount</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Valid From</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Valid To</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Status</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Payment Date</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Invoice</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {recent_subscriptions &&
                                    recent_subscriptions.length > 0 &&
                                    recent_subscriptions.map((subscription) => (
                                        <TableRow key={subscription.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{subscription.invoice_no}</TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{subscription.member?.full_name}</div>
                                                    <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{subscription.member?.membership_no}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{subscription.subscription_type?.name || '-'}</TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{subscription.subscription_category?.name}</div>
                                                    <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Rs. {subscription.subscription_category?.fee}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                <span style={{ fontWeight: 600, color: '#059669' }}>Rs. {subscription.total_price?.toLocaleString()}</span>
                                            </TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{subscription.valid_from ? new Date(subscription.valid_from).toLocaleDateString() : '-'}</TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{subscription.valid_to ? new Date(subscription.valid_to).toLocaleDateString() : 'Unlimited'}</TableCell>
                                            <TableCell>
                                                <span
                                                    style={{
                                                        color: subscription.status === 'paid' ? '#2e7d32' : subscription.status === 'unpaid' ? '#FFA90B' : '#d32f2f',
                                                        fontWeight: 'medium',
                                                        textTransform: 'uppercase',
                                                        fontSize: '12px',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        backgroundColor: subscription.status === 'paid' ? '#dcfce7' : subscription.status === 'unpaid' ? '#fef3c7' : '#fecaca',
                                                    }}
                                                >
                                                    {subscription.status}
                                                </span>
                                            </TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{subscription.payment_date ? new Date(subscription.payment_date).toLocaleDateString() : '-'}</TableCell>
                                            <TableCell>
                                                <Button
                                                    size="small"
                                                    startIcon={<ReceiptIcon />}
                                                    sx={{
                                                        color: '#063455',
                                                        textTransform: 'none',
                                                        '&:hover': {
                                                            backgroundColor: '#f0f0f0',
                                                        },
                                                    }}
                                                    onClick={() => {
                                                        setSelectedMemberUserId(subscription.member?.id);
                                                        setSelectedInvoiceId(subscription.invoice_id);
                                                        setOpenInvoiceModal(true);
                                                    }}
                                                >
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                {(!recent_subscriptions || recent_subscriptions.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                                            <Typography color="textSecondary">No subscription transactions found</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
                <SubscriptionCardComponent open={openCardModal} onClose={() => setOpenCardModal(false)} subscription={selectedSubscription} />

                <SubscriptionFilter open={openFilterModal} onClose={() => setOpenFilterModal(false)} />

                {/* Membership Invoice Modal - Used for Subscription Fees */}
                <MembershipInvoiceSlip
                    open={openInvoiceModal}
                    onClose={() => {
                        setOpenInvoiceModal(false);
                        setSelectedMemberUserId(null);
                        setSelectedInvoiceId(null);
                    }}
                    invoiceNo={selectedMemberUserId}
                    invoiceId={selectedInvoiceId}
                />
            </div>
            {/* </div> */}
        </>
    );
};

export default SubscriptionDashboard;
