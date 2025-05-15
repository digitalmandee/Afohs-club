import { useState } from 'react';
import { Typography, Button, Card, CardContent, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Avatar, Box, InputAdornment } from '@mui/material';
import { ArrowBack, Search, FilterAlt, MoreVert, People, CreditCard, Warning } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router, usePage } from '@inertiajs/react'; // Import usePage for props
import MembershipSuspensionDialog from './Modal';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const MembershipDashboard = ({ members }) => {
    // Receive members as a prop
    // Modal state
    const [open, setOpen] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const [selectedMember, setSelectedMember] = useState(null);
    const [modalType, setModalType] = useState('actions'); // "actions" or "details"
    const [suspensionModalOpen, setSuspensionModalOpen] = useState(false);
    const [detailsData, setDetailsData] = useState({
        reason: 'Violation of rules',
        duration: '30 Month',
        fromDate: 'Apr 1, 2025',
        toDate: 'Apr 30, 2025',
    });

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
        handleCloseModal();
    };

    const handleSuspendMembership = () => {
        handleCloseModal();
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
                <div className="container-fluid p-0" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center p-3">
                        <div className="d-flex align-items-center">
                            <IconButton>
                                <ArrowBack />
                            </IconButton>
                            <Typography variant="h5" component="h1" style={{ marginLeft: '10px', fontWeight: 500, color: '#333' }}>
                                Membership Dashboard
                            </Typography>
                        </div>
                        <Button
                            variant="contained"
                            startIcon={<span>+</span>}
                            style={{
                                backgroundColor: '#0a3d62',
                                textTransform: 'none',
                                borderRadius: '4px',
                                padding: '8px 16px',
                            }}
                            onClick={() => router.visit('/admin/add/personal/information')}
                        >
                            Add Member
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="row mx-2 mb-4">
                        <div className="col-md-4 mb-3">
                            <Card style={{ backgroundColor: '#3d4d57', color: 'white', height: '100%' }}>
                                <CardContent className="text-center py-4">
                                    <div className="mb-2">
                                        <Avatar style={{ backgroundColor: 'rgba(255,255,255,0.2)', margin: '0 auto' }}>
                                            <People />
                                        </Avatar>
                                    </div>
                                    <Typography variant="body2" style={{ marginBottom: '8px' }}>
                                        Total Membership
                                    </Typography>
                                    <Typography variant="h4" style={{ fontWeight: 'bold' }}>
                                        {members.length} {/* Update with dynamic count */}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="col-md-4 mb-3">
                            <Card style={{ backgroundColor: '#3d4d57', color: 'white', height: '100%' }}>
                                <CardContent className="text-center py-4">
                                    <div className="mb-2">
                                        <Avatar style={{ backgroundColor: 'rgba(255,255,255,0.2)', margin: '0 auto' }}>
                                            <CreditCard />
                                        </Avatar>
                                    </div>
                                    <Typography variant="body2" style={{ marginBottom: '8px' }}>
                                        Total Payment
                                    </Typography>
                                    <Typography variant="h4" style={{ fontWeight: 'bold' }}>
                                        10,000 {/* Replace with dynamic data if available */}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="col-md-4 mb-3">
                            <Card style={{ backgroundColor: '#3d4d57', color: 'white', height: '100%' }}>
                                <CardContent className="text-center py-4">
                                    <div className="mb-2">
                                        <Avatar style={{ backgroundColor: 'rgba(255,255,255,0.2)', margin: '0 auto' }}>
                                            <CreditCard />
                                        </Avatar>
                                    </div>
                                    <Typography variant="body2" style={{ marginBottom: '8px' }}>
                                        Current Balance
                                    </Typography>
                                    <Typography variant="h4" style={{ fontWeight: 'bold' }}>
                                        300,00 {/* Replace with dynamic data if available */}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Recently Joined Section */}
                    <div className="mx-3">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <Typography variant="h6" style={{ fontWeight: 'bold' }}>
                                Recently Joined
                            </Typography>
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
                                        backgroundColor: 'white',
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
                                    <TableRow style={{ backgroundColor: '#e8e8e8' }}>
                                        <TableCell>Membership ID</TableCell>
                                        <TableCell>Member</TableCell>
                                        <TableCell>Member Type</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Card</TableCell>
                                        <TableCell>Invoice</TableCell>
                                        <TableCell>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {JSON.stringify(members)}
                                    {members.map((member) => (
                                        <TableRow key={member.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <TableCell>{member.id}</TableCell>
                                            <TableCell>
                                                <div className="d-flex align-items-center">
                                                    <Avatar src={member.avatar} alt={member.name} style={{ marginRight: '10px' }} />
                                                    <div>
                                                        <Typography variant="body2" style={{ fontWeight: 'bold' }}>
                                                            {member.name}
                                                        </Typography>
                                                        <Typography variant="body2" color="textSecondary">
                                                            {member.email}
                                                        </Typography>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{member.type}</TableCell>
                                            <TableCell>
                                                <span
                                                    style={{
                                                        color: member.status === 'Active' ? '#2e7d32' : member.status === 'Suspend' ? '#ed6c02' : '#d32f2f',
                                                        fontWeight: 'medium',
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={(e) => showMemberDetails(member, e)}
                                                >
                                                    {member.status}
                                                    {member.status === 'Suspend' && <Warning style={{ color: '#ed6c02', fontSize: '16px', marginLeft: '5px', verticalAlign: 'middle' }} />}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="text" style={{ color: '#1976d2', textTransform: 'none', padding: '0' }}>
                                                    View
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                {member.status === 'Expired' || member.status === 'Suspend' ? (
                                                    <Button variant="text" style={{ color: '#1976d2', textTransform: 'none', padding: '0' }}>
                                                        Send Remind
                                                    </Button>
                                                ) : (
                                                    <Button variant="text" style={{ color: '#1976d2', textTransform: 'none', padding: '0' }}>
                                                        View
                                                    </Button>
                                                )}
                                            </TableCell>
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
                                top: `${modalPosition.top + -115}px`,
                                left: modalType === 'actions' ? `${modalPosition.left - 333}px` : `${modalPosition.left - 240}px`,
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

                            {modalType === 'actions' ? (
                                <div className="d-flex" style={{ gap: '10px' }}>
                                    <Button
                                        miners
                                        variant="outlined"
                                        style={{
                                            borderColor: '#1976d2',
                                            color: '#1976d2',
                                            textTransform: 'none',
                                            justifyContent: 'center',
                                            padding: '8px 16px',
                                        }}
                                        onClick={handleCancelMembership}
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
                                            }, 2000);
                                        }}
                                    >
                                        Suspend Membership
                                    </Button>
                                </div>
                            ) : (
                                <div className="d-flex flex-column" style={{ gap: '15px' }}>
                                    <Typography variant="body1" style={{ color: '#555' }}>
                                        <span style={{ marginRight: '10px' }}>Reason :</span>
                                        <span style={{ color: '#333', fontWeight: '500' }}>{detailsData.reason}</span>
                                    </Typography>
                                    <Typography variant="body1" style={{ color: '#555' }}>
                                        <span style={{ marginRight: '10px' }}>Duration :</span>
                                        <span style={{ color: '#333', fontWeight: '500' }}>{detailsData.duration}</span>
                                    </Typography>
                                    <Typography variant="body1" style={{ color: '#555' }}>
                                        <span style={{ marginRight: '10px' }}>From :</span>
                                        <span style={{ color: '#333', fontWeight: '500' }}>{detailsData.fromDate}</span>
                                        <span style={{ margin: '0 10px' }}>To :</span>
                                        <span style={{ color: '#333', fontWeight: '500' }}>{detailsData.toDate}</span>
                                    </Typography>
                                </div>
                            )}
                        </div>
                    )}
                    <MembershipSuspensionDialog open={suspensionModalOpen} onClose={() => setSuspensionModalOpen(false)} />
                </div>
            </div>
        </>
    );
};

export default MembershipDashboard;
