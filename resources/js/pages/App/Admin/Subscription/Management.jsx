import { useState, useEffect } from 'react';
import PeopleIcon from '@mui/icons-material/People';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import { Typography, Button, Card, CardContent, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Avatar, Box, InputAdornment } from '@mui/material';
import { ArrowBack, Search, FilterAlt, MoreVert, People, CreditCard, Warning } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router } from '@inertiajs/react';
import SubscriptionFilter from './Filter';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const ManagementDashboard = ({ subscriptions }) => {
    // Modal state
    const [open, setOpen] = useState(true);
    const [openFilterModal, setOpenFilterModal] = useState(false);

    const handleOpenModal = (member, event, type = 'actions') => {
        const rect = event.currentTarget.getBoundingClientRect();
        const position = {
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
        };
        setSelectedMember(member);
        setModalPosition(position);
        setModalType(type);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const showMemberDetails = (member, event) => {
        handleOpenModal(member, event, 'details');
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
                <div className="container-fluid px-4" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center pt-3">
                        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <Typography
                                sx={{
                                    fontWeight: 500,
                                    fontSize: '30px',
                                    color: '#063455',
                                }}
                            >
                                Subscription Management
                            </Typography>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div
                        style={{
                            display: 'flex',
                            width: '100%',
                            justifyContent: 'space-between',
                            gap: '1rem',
                            marginBottom: '24px',
                        }}
                    >
                        {[
                            { title: 'Total Subscriptions', value: 0, icon: PeopleIcon },
                            { title: 'Active', value: 0, image: '/assets/ticks.png' },
                            { title: 'Expired', value: 0, image: '/assets/cross.png' },
                            { title: 'Total Revenue', value: 0, image: '/assets/refresh.png' },
                        ].map((item, index) => (
                            <div key={index} style={{ flex: 1 }}>
                                <Card
                                    style={{
                                        backgroundColor: '#063455',
                                        color: '#fff',
                                        borderRadius: '2px',
                                        height: '150px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '1rem',
                                        boxShadow: 'none',
                                        border: 'none',
                                        textAlign: 'center',
                                    }}
                                >
                                    <div
                                        style={{
                                            backgroundColor: '#1E2C2F',
                                            borderRadius: '50%',
                                            width: '50px',
                                            height: '50px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: '0.5rem',
                                        }}
                                    >
                                        {item.icon ? <item.icon style={{ color: '#fff', fontSize: '28px' }} /> : <img src={item.image} alt={item.title} style={{ width: '28px', height: '28px', objectFit: 'contain' }} />}
                                    </div>
                                    <Typography variant="body2" style={{ color: '#DDE6E8', marginBottom: '0.25rem' }}>
                                        {item.title}
                                    </Typography>
                                    <Typography variant="h6" style={{ fontWeight: 'bold', color: '#fff' }}>
                                        {item.value}
                                    </Typography>
                                </Card>
                            </div>
                        ))}
                    </div>

                    {/* Recently Joined Section */}
                    <Box sx={{ pb: 2 }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <Typography sx={{ fontWeight: 500, fontSize: '24px', color: '#000000' }}>All Subscription</Typography>
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
                                        borderColor: '#ccc',
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

                        {/* Members Table */}
                        <TableContainer component={Paper} style={{ boxShadow: 'none' }}>
                            <Table>
                                <TableHead>
                                    <TableRow style={{ backgroundColor: '#E5E5EA', height: '70px' }}>
                                        <TableCell sx={{ color: '#000000', fontWeight: 500, fontSize: '18px' }}>Invoice ID</TableCell>
                                        <TableCell sx={{ color: '#000000', fontWeight: 500, fontSize: '18px' }}>Member</TableCell>
                                        <TableCell sx={{ color: '#000000', fontWeight: 500, fontSize: '18px' }}>Category</TableCell>
                                        <TableCell sx={{ color: '#000000', fontWeight: 500, fontSize: '18px' }}>Type</TableCell>
                                        <TableCell sx={{ color: '#000000', fontWeight: 500, fontSize: '18px' }}>Start-Date</TableCell>
                                        <TableCell sx={{ color: '#000000', fontWeight: 500, fontSize: '18px' }}>Expiry</TableCell>
                                        <TableCell sx={{ color: '#000000', fontWeight: 500, fontSize: '18px' }}>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {subscriptions &&
                                        subscriptions.length > 0 &&
                                        subscriptions.map((subscription) => (
                                            <TableRow key={subscription.id} style={{ borderBottom: '1px solid #eee' }}>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>AFOHS-{subscription.invoice_id}</TableCell>
                                                <TableCell>
                                                    <div className="d-flex align-items-center">
                                                        {/* <Avatar src={user.profile_photo || '/placeholder.svg?height=40&width=40'} alt={user.first_name} style={{ marginRight: '10px' }} /> */}
                                                        <div>
                                                            <Typography sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{subscription.user?.first_name + ' ' + subscription.user?.last_name || 'N/A'}</Typography>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{subscription.category?.name}</TableCell>
                                                <TableCell>
                                                    <span
                                                        style={{
                                                            color: '#7F7F7F',
                                                            fontWeight: 400,
                                                            fontSize: '14px',
                                                        }}
                                                        onClick={(e) => showMemberDetails(user, e)}
                                                    >
                                                        {subscription.subscription_type}
                                                    </span>
                                                </TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{subscription.start_date}</TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{subscription.expiry_date}</TableCell>
                                                <TableCell>
                                                    <span
                                                        style={{
                                                            color: subscription.status === 'active' ? '#178F6F' : '#F14C35',
                                                        }}
                                                    >
                                                        {subscription.status}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                    <SubscriptionFilter open={openFilterModal} onClose={() => setOpenFilterModal(false)} />
                </div>
            </div>
        </>
    );
};

export default ManagementDashboard;
