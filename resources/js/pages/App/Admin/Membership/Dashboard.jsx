import { useState } from 'react';
import { Typography, Button, Card, CardContent, TextField, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper, IconButton, Avatar, Box, Alert, Slide, InputAdornment, Snackbar } from '@mui/material';
import { ArrowBack, Search, FilterAlt, MoreVert, People, CreditCard } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router } from '@inertiajs/react';
import MembershipSuspensionDialog from './Modal';
import MembershipCancellationDialog from './CancelModal';
import MemberProfileModal from './Profile';
import MembershipCardComponent from './UserCard';
import MemberFilter from './MemberFilter';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const MembershipDashboard = ({ member = [] }) => {
    // Modal state
    const [open, setOpen] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const [selectedMember, setSelectedMember] = useState(null);
    const [modalType, setModalType] = useState('actions');
    const [suspensionModalOpen, setSuspensionModalOpen] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [openProfileModal, setOpenProfileModal] = useState(false);
    const [openCardModal, setOpenCardModal] = useState(false);
    const [openFilterModal, setOpenFilterModal] = useState(false);
    const [selectMember, setSelectMember] = useState(null);
    const [detailsData] = useState({
        reason: 'Violation of rules',
        duration: '30 Month',
        fromDate: 'Apr 1, 2025',
        toDate: 'Apr 30, 2025',
    });

    console.log('Member prop:', member); // Debug: Log the member prop

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

    const handleCancelMembership = () => {
        setCancelModalOpen(false);
        setShowAlert(false);
        setTimeout(() => {
            setShowAlert(true);
        }, 100);
    };

    const handleConfirmSuspend = () => {
        setSuspensionModalOpen(false);
        setShowAlert(false);
        setTimeout(() => {
            setShowAlert(true);
        }, 100);
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
                <div className="container-fluid p-4" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <Typography sx={{ marginLeft: '10px', fontWeight: 500, color: '#3F4E4F', fontSize: '30px' }}>Membership Dashboard</Typography>
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
                            onClick={() => router.visit('/admin/add/personal/information')}
                        >
                            Add Member
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="row mb-4 mt-5">
                        <div className="col-md-4 mb-3">
                            <Card style={{ backgroundColor: '#3F4E4F', color: 'white', height: '150px' }}>
                                <CardContent className="text-center py-4">
                                    <div className="mb-2">
                                        <Avatar style={{ backgroundColor: '#202728', margin: '0 auto' }}>
                                            <People />
                                        </Avatar>
                                    </div>
                                    <Typography sx={{ mt: 1, marginBottom: '5px', fontSize: '16px', fontWeight: 400, color: '#C6C6C6' }}>Total Membership</Typography>
                                    <Typography sx={{ fontWeight: 700, fontSize: '24px', color: '#FFFFFF' }}>{member.length}</Typography>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="col-md-4 mb-3">
                            <Card style={{ backgroundColor: '#3F4E4F', color: 'white', height: '150px' }}>
                                <CardContent className="text-center py-4">
                                    <div className="mb-2">
                                        <Avatar style={{ backgroundColor: '#202728', margin: '0 auto' }}>
                                            <CreditCard />
                                        </Avatar>
                                    </div>
                                    <Typography sx={{ mt: 1, marginBottom: '5px', fontSize: '16px', fontWeight: 400, color: '#C6C6C6' }}>Total Payment</Typography>
                                    <Typography sx={{ fontWeight: 700, fontSize: '24px', color: '#FFFFFF' }}>10,000</Typography>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="col-md-4 mb-3">
                            <Card style={{ backgroundColor: '#3F4E4F', color: 'white', height: '150px' }}>
                                <CardContent className="text-center py-4">
                                    <div className="mb-2">
                                        <Avatar style={{ backgroundColor: '#202728', margin: '0 auto' }}>
                                            <CreditCard />
                                        </Avatar>
                                    </div>
                                    <Typography sx={{ mt: 1, marginBottom: '5px', fontSize: '16px', fontWeight: 400, color: '#C6C6C6' }}>Current Balance</Typography>
                                    <Typography sx={{ fontWeight: 700, fontSize: '24px', color: '#FFFFFF' }}>300,000</Typography>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Recently Joined Section */}
                    <div className="mx-0">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <Typography style={{ fontWeight: 500, fontSize: '24px', color: '#000000' }}>Recently Joined</Typography>
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
                                        border: '1px solid #3F4E4F',
                                        color: '#333',
                                        textTransform: 'none',
                                        backgroundColor: 'transparent',
                                    }}
                                    onClick={() => setOpenFilterModal(true)}
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
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Membership ID</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Member</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Member Type</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Status</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Card</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Invoice</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {member.map((user) => (
                                        <TableRow key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <TableCell
                                                sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', cursor: 'pointer' }}
                                                onClick={() => {
                                                    setSelectMember(user);
                                                    setOpenProfileModal(true);
                                                }}
                                            >
                                                {user.user_detail?.membership_number || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="d-flex align-items-center">
                                                    <Avatar src={user.profile_photo || '/placeholder.svg?height=40&width=40'} alt={user.name} style={{ marginRight: '10px' }} />
                                                    <div>
                                                        <Typography sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.name}</Typography>
                                                        <Typography sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.email}</Typography>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.user_detail?.member_type?.name || 'N/A'}</TableCell>
                                            <TableCell>
                                                <span
                                                    style={{
                                                        color: user.user_detail?.card_status === 'Active' ? '#2e7d32' : user.user_detail?.card_status === 'Suspend' ? '#FFA90B' : '#d32f2f',
                                                        fontWeight: 'medium',
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={(e) => showMemberDetails(user, e)}
                                                >
                                                    {user.user_detail?.card_status || 'N/A'}
                                                    {user.user_detail?.card_status === 'Suspend' && (
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
                                                <Button
                                                    style={{ color: '#0C67AA', textDecoration: 'underline', textTransform: 'none' }}
                                                    onClick={() => {
                                                        setSelectMember(user);
                                                        setOpenCardModal(true);
                                                    }}
                                                >
                                                    View
                                                </Button>
                                            </TableCell>
                                            <TableCell>{user.user_detail?.card_status === 'Expired' || user.user_detail?.card_status === 'Suspend' ? <Button style={{ color: '#0C67AA', textDecoration: 'underline', textTransform: 'none' }}>Send Remind</Button> : <Button style={{ color: '#0C67AA', textDecoration: 'underline', textTransform: 'none' }}>View</Button>}</TableCell>
                                            <TableCell>
                                                <IconButton onClick={(e) => handleOpenModal(user, e)}>
                                                    <MoreVert />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>

                    {/* Modal */}
                    {openModal && (
                        <div
                            style={{
                                position: 'absolute',
                                top: `${modalPosition.top - 115}px`,
                                left: `${modalPosition.left - 333}px`,
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                padding: '16px',
                            }}
                        >
                            <Box display="flex" justifyContent="flex-end">
                                <IconButton size="small" onClick={handleCloseModal} style={{ padding: '4px' }}>
                                    ×
                                </IconButton>
                            </Box>
                            <div className="d-flex" style={{ gap: '10px' }}>
                                <Button
                                    variant="outlined"
                                    style={{
                                        borderColor: '#1976d2',
                                        color: '#1976d2',
                                        textTransform: 'none',
                                        justifyContent: 'center',
                                        padding: '8px 16px',
                                    }}
                                    onClick={() => {
                                        handleCloseModal();
                                        setTimeout(() => {
                                            setCancelModalOpen(true);
                                        }, 200);
                                    }}
                                >
                                    Cancel Membership
                                </Button>
                                <Button
                                    variant="contained"
                                    style={{
                                        backgroundColor: '#0a3d62',
                                        textTransform: 'none',
                                        justifyContent: 'center',
                                        padding: '8px 16px',
                                    }}
                                    onClick={() => {
                                        handleCloseModal();
                                        setTimeout(() => {
                                            setSuspensionModalOpen(true);
                                        }, 200);
                                    }}
                                >
                                    Suspend Membership
                                </Button>
                            </div>
                        </div>
                    )}
                    <MembershipSuspensionDialog open={suspensionModalOpen} onClose={() => setSuspensionModalOpen(false)} onConfirm={handleConfirmSuspend} />
                    <MembershipCancellationDialog open={cancelModalOpen} onClose={() => setCancelModalOpen(false)} onConfirm={handleCancelMembership} />
                    <MemberProfileModal open={openProfileModal} onClose={() => setOpenProfileModal(false)} member={selectMember} />
                    <MembershipCardComponent open={openCardModal} onClose={() => setOpenCardModal(false)} member={selectMember} />
                    <MemberFilter open={openFilterModal} onClose={() => setOpenFilterModal(false)} />
                    {/* Membership Alerts */}
                    <Snackbar open={showAlert} autoHideDuration={5000} onClose={() => setShowAlert(false)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} TransitionComponent={(props) => <Slide {...props} direction="left" />}>
                        <Alert onClose={() => setShowAlert(false)} severity="error" sx={{ width: '100%', fontWeight: 500, fontSize: '18px' }}>
                            Membership successfully suspended!
                            <Typography sx={{ fontWeight: 400, fontSize: '14px' }}>This member card suspended successfully</Typography>
                        </Alert>
                    </Snackbar>
                    <Snackbar open={showAlert} autoHideDuration={5000} onClose={() => setShowAlert(false)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} TransitionComponent={(props) => <Slide {...props} direction="left" />}>
                        <Alert onClose={() => setShowAlert(false)} severity="error" sx={{ width: '100%', fontWeight: 500, fontSize: '18px' }}>
                            Membership successfully cancelled!
                            <Typography sx={{ fontWeight: 400, fontSize: '14px' }}>This member card has been cancelled successfully</Typography>
                        </Alert>
                    </Snackbar>
                </div>
            </div>
        </>
    );
};

export default MembershipDashboard;
