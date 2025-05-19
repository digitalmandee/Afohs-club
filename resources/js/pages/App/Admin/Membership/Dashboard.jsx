import { useState } from 'react';
import { Typography, Button, Card, CardContent, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Avatar, Box, Alert, Slide, InputAdornment, Snackbar } from '@mui/material';
import { ArrowBack, Search, FilterAlt, MoreVert, People, CreditCard, Warning } from '@mui/icons-material';
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

const MembershipDashboard = ({ member }) => {
    // Modal state
    const [open, setOpen] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const [selectedMember, setSelectedMember] = useState(null);
    const [modalType, setModalType] = useState('actions'); // "actions" or "details"
    const [suspensionModalOpen, setSuspensionModalOpen] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [openProfileModal, setOpenProfileModal] = useState(false);
    const [openCardModal, setOpenCardModal] = useState(false);
    const [openFilterModal, setOpenFilterModal] = useState(false);
    const [selectMember, setSelectMember] = useState(null);
    const [detailsData, setDetailsData] = useState({
        reason: 'Violation of rules',
        duration: '30 Month',
        fromDate: 'Apr 1, 2025',
        toDate: 'Apr 30, 2025',
    });
    console.log('member', member);

    const handleOpenModal = (member, event, type = 'actions') => {
        // Get the position of the clicked button
        const rect = event.currentTarget.getBoundingClientRect();

        // Calculate position for the modal
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
        // You would typically fetch these details from an API
        // For now we'll use the sample data
        handleOpenModal(member, event, 'details');
    };

    // Sample data
    const members = [
        {
            id: 'AFOHS-1235',
            name: 'Zahid Ullah',
            email: 'user@gmail.com',
            type: 'Member',
            status: 'Active',
            avatar: '/placeholder.svg?height=40&width=40',
        },
        {
            id: 'AFOHS-1234',
            name: 'Zahid Ullah',
            email: 'user@gmail.com',
            type: 'Applied Member',
            status: 'Suspend',
            avatar: '/placeholder.svg?height=40&width=40',
        },
        {
            id: 'AFOHS-1245',
            name: 'Zahid Ullah',
            email: 'user@gmail.com',
            type: 'Affiliated Member',
            status: 'Active',
            avatar: '/placeholder.svg?height=40&width=40',
        },
        {
            id: 'AFOHS-1345',
            name: 'Zahid Ullah',
            email: 'user@gmail.com',
            type: 'VIP Guest',
            status: 'Expired',
            avatar: '/placeholder.svg?height=40&width=40',
        },
        {
            id: 'AFOHS-2345',
            name: 'Zahid Ullah',
            email: 'user@gmail.com',
            type: 'Applied Member',
            status: 'Suspend',
            avatar: '/placeholder.svg?height=40&width=40',
        },
    ];

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
                                    <Typography sx={{ fontWeight: 700, fontSize: '24px', color: '#FFFFFF' }}>320</Typography>
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
                                    <Typography sx={{ fontWeight: 700, fontSize: '24px', color: '#FFFFFF' }}>300,00</Typography>
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
                                    {members.map((member) => (
                                        <TableRow key={member.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <TableCell
                                                sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', cursor: 'pointer' }}
                                                onClick={() => {
                                                    setSelectMember(member); // save the clicked member
                                                    setOpenProfileModal(true); // open the modal
                                                }}
                                            >
                                                {member.id}
                                            </TableCell>
                                            <TableCell>
                                                <div className="d-flex align-items-center">
                                                    <Avatar src={member.avatar} alt={member.name} style={{ marginRight: '10px' }} />
                                                    <div>
                                                        <Typography sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{member.name}</Typography>
                                                        <Typography sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{member.email}</Typography>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{member.type}</TableCell>
                                            <TableCell>
                                                <span
                                                    style={{
                                                        color: member.status === 'Active' ? '#2e7d32' : member.status === 'Suspend' ? '#FFA90B' : '#d32f2f',
                                                        fontWeight: 'medium',
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={(e) => showMemberDetails(member, e)}
                                                >
                                                    {member.status}
                                                    {member.status === 'Suspend' && (
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
                                                <Button
                                                    style={{ color: '#0C67AA', textDecoration: 'underline', textTransform: 'none' }}
                                                    onClick={() => {
                                                        setOpenCardModal(true); // open the modal
                                                    }}
                                                >
                                                    View
                                                </Button>
                                            </TableCell>
                                            <TableCell>{member.status === 'Expired' || member.status === 'Suspend' ? <Button style={{ color: '#0C67AA', textDecoration: 'underline', textTransform: 'none' }}>Send Remind</Button> : <Button style={{ color: '#0C67AA', textDecoration: 'underline', textTransform: 'none' }}>View</Button>}</TableCell>
                                            <TableCell>
                                                <IconButton onClick={(e) => handleOpenModal(member, e)}>
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
                    <MembershipCardComponent open={openCardModal} onClose={() => setOpenCardModal(false)} />
                    <MemberFilter open={openFilterModal} onClose={() => setOpenFilterModal(false)} />
                    {/* membership suspension alert */}
                    <Snackbar open={showAlert} autoHideDuration={5000} onClose={() => setShowAlert(false)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} TransitionComponent={(props) => <Slide {...props} direction="left" />}>
                        <Alert onClose={() => setShowAlert(false)} severity="error" sx={{ width: '100%', fontWeight: 500, fontSize: '18px' }}>
                            Membership successfully suspended!
                            <Typography sx={{ fontWeight: 400, fontSize: '14px' }}>This member card suspended successfully</Typography>
                        </Alert>
                    </Snackbar>

                    {/* membership cancellation alert */}
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
