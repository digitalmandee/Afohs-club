import { useState } from 'react';
import { Typography, Button, Card, CardContent, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, InputAdornment } from '@mui/material';
import { Search, FilterAlt, People, CreditCard } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router } from '@inertiajs/react';
import SubscriptionFilter from './Filter';
import SubscriptionCardComponent from './UserCard';
import InvoiceSlip from '../Membership/Invoice';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const SubscriptionDashboard = ({ subscriptions, newSubscriptionsToday, totalRevenue }) => {
    // Modal state
    const [open, setOpen] = useState(true);
    const [openInvoiceModal, setOpenInvoiceModal] = useState(false);
    const [openCardModal, setOpenCardModal] = useState(false);
    const [openFilterModal, setOpenFilterModal] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState(null);

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
                <div className="container-fluid p-4" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            {/* <IconButton>
                                <ArrowBack />
                            </IconButton> */}
                            <Typography sx={{ marginLeft: '10px', fontWeight: 500, color: '#063455', fontSize: '30px' }}>Subscription Dashboard</Typography>
                        </div>
                        <Button
                            variant="contained"
                            startIcon={<span>+</span>}
                            style={{
                                backgroundColor: '#063455',
                                textTransform: 'none',
                                borderRadius: '4px',
                                height: 40,
                                width: 170,
                            }}
                            onClick={() => router.visit(route('subscriptions.create'))}
                        >
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
                                    <Typography sx={{ mt: 1, marginBottom: '5px', fontSize: '16px', fontWeight: 400, color: '#C6C6C6' }}>Total Active Member</Typography>
                                    <Typography sx={{ fontWeight: 700, fontSize: '24px', color: '#FFFFFF' }}>2</Typography>
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
                                    <Typography sx={{ mt: 1, marginBottom: '5px', fontSize: '16px', fontWeight: 400, color: '#C6C6C6' }}>New Subscribers Today</Typography>
                                    <Typography sx={{ fontWeight: 700, fontSize: '24px', color: '#FFFFFF' }}>{newSubscriptionsToday}</Typography>
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
                                    <Typography sx={{ fontWeight: 700, fontSize: '24px', color: '#FFFFFF' }}>{totalRevenue}</Typography>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Recently Joined Section */}
                    <div className="mx-0">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <Typography style={{ fontWeight: 500, fontSize: '24px', color: '#000000' }}>Recently Added</Typography>

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
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Invoice ID</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Member</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Category</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Type</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Start Date</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Expiry</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Status</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Card</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Invoice</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {subscriptions &&
                                        subscriptions.length > 0 &&
                                        subscriptions.map((subscription) => (
                                            <TableRow key={subscription.id} style={{ borderBottom: '1px solid #eee' }}>
                                                <TableCell
                                                    sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', cursor: 'pointer' }}
                                                    onClick={() => {
                                                        setSelectMember(subscription); // save the clicked member
                                                        setOpenProfileModal(true); // open the modal
                                                    }}
                                                >
                                                    {subscription.invoice_id}
                                                </TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{subscription.user?.first_name + ' ' + subscription.user?.last_name}</TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{subscription.category?.name}</TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{subscription.subscription_type}</TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{subscription.start_date}</TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{subscription.expiry_date}</TableCell>
                                                <TableCell>
                                                    <span
                                                        style={{
                                                            color: subscription.status === 'active' ? '#2e7d32' : subscription.status === 'Suspend' ? '#FFA90B' : '#d32f2f',
                                                            fontWeight: 'medium',
                                                            cursor: 'pointer',
                                                        }}
                                                        onClick={(e) => showMemberDetails(subscription, e)}
                                                    >
                                                        {subscription.status}
                                                        {subscription.status === 'Suspend' && (
                                                            // <Warning
                                                            //     style={{ color: "#ed6c02", fontSize: "16px", marginLeft: "5px", verticalAlign: "middle" }}
                                                            // />
                                                            <img
                                                                src="/assets/system-expired.png"
                                                                alt=""
                                                                style={{
                                                                    width: 25,
                                                                    height: 25,
                                                                    marginLeft: 2,
                                                                    marginBottom: 5,
                                                                }}
                                                            />
                                                        )}
                                                    </span>
                                                </TableCell>

                                                <TableCell>
                                                    <span
                                                        style={{
                                                            backgroundColor: 'transparent',
                                                            color: '#0C67AA',
                                                            textDecoration: 'underline',
                                                            cursor: 'pointer',
                                                        }}
                                                        onClick={() => {
                                                            setSelectedSubscription(subscription);
                                                            setOpenCardModal(true);
                                                        }}
                                                    >
                                                        View
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {/* View button can stay here if you need it */}
                                                    <Button
                                                        onClick={() => {
                                                            setSelectedSubscription(subscription);
                                                            setOpenInvoiceModal(true);
                                                        }}
                                                        sx={{ color: '#0C67AA', textDecoration: 'underline', textTransform: 'none' }}
                                                    >
                                                        View
                                                    </Button>
                                                    <Button
                                                        disabled={subscription?.invoice?.status !== 'unpaid'}
                                                        onClick={() => handleSendNotification(subscription.id)}
                                                        variant="contained"
                                                        style={{
                                                            backgroundColor: '#063455',
                                                            color: 'white',
                                                            textTransform: 'none',
                                                            borderRadius: '4px',
                                                            height: 40,
                                                        }}
                                                    >
                                                        Notify
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                    <SubscriptionCardComponent open={openCardModal} onClose={() => setOpenCardModal(false)} subscription={selectedSubscription} />

                    <SubscriptionFilter open={openFilterModal} onClose={() => setOpenFilterModal(false)} />

                    <InvoiceSlip open={openInvoiceModal} onClose={() => setOpenInvoiceModal(false)} invoiceNo={selectedSubscription?.invoice_id} />
                </div>
            </div>
        </>
    );
};

export default SubscriptionDashboard;
