import { useState } from 'react';
import { Typography, Button, Card, CardContent, TextField, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper, IconButton, Avatar, InputAdornment, Menu, MenuItem } from '@mui/material';
import { Search, FilterAlt, People, CreditCard, LocalDining as DiningIcon, TakeoutDining as TakeoutIcon, TwoWheeler as DeliveryIcon } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router } from '@inertiajs/react';
import MembershipSuspensionDialog from './Modal';
import MembershipCancellationDialog from './CancelModal';
import MemberProfileModal from './Profile';
import MembershipCardComponent from './UserCard';
import InvoiceSlip from './Invoice';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import ActivateMembershipDialog from './ActivateMembershipDialog';
import MembershipDashboardFilter from './MembershipDashboardFilter';
import { MdModeEdit } from 'react-icons/md';
import { FaEdit } from 'react-icons/fa';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const styles = {
    root: {
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
    },
};

const MembershipDashboard = ({ members = [], total_members, total_payment }) => {
    // Modal state
    const [open, setOpen] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const [suspensionModalOpen, setSuspensionModalOpen] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [activateModalOpen, setActivateModalOpen] = useState(false);
    const [openProfileModal, setOpenProfileModal] = useState(false);
    const [openCardModal, setOpenCardModal] = useState(false);
    const [openFilterModal, setOpenFilterModal] = useState(false);
    const [selectMember, setSelectMember] = useState(null);
    const [statusAnchorEl, setStatusAnchorEl] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [filteredMembers, setFilteredMembers] = useState(members);
    const [openInvoiceModal, setOpenInvoiceModal] = useState(false);


    // Extract unique status and member type values from members
    const statusOptions = [
        { label: 'All type', value: 'all', icon: null },
        ...[...new Set(members.map(member => member.member?.card_status).filter(status => status))].map(status => ({
            label: status.charAt(0).toUpperCase() + status.slice(1),
            value: status,
        })),
    ];

    const memberTypeOptions = [
        { label: 'All types', value: 'all' },
        ...[...new Set(members.map(member => member.member?.member_type?.name).filter(name => name))].map(name => ({
            label: name,
            value: name,
        })),
    ];

    const handleStatusClick = (event, member) => {
        setStatusAnchorEl(event.currentTarget);
        setSelectedMember(member);
    };

    const handleStatusClose = () => {
        setStatusAnchorEl(null);
    };

    const handleOpenModal = (member, event, type = 'actions') => {
        const rect = event.currentTarget.getBoundingClientRect();
        const position = {
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
        };
        setModalPosition(position);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const handleCancelMembership = () => {
        setCancelModalOpen(false);
    };

    const handleConfirmSuspend = () => {
        setSuspensionModalOpen(false);
    };

    const showMemberDetails = (member, event) => {
        handleOpenModal(member, event, 'details');
    };

    const getAvailableStatusActions = (currentStatus) => {
        const allStatuses = statusOptions.map(option => option.value).filter(value => value !== 'all');
        return allStatuses.filter((status) => status.toLowerCase() !== currentStatus?.toLowerCase());
    };

    const handleStatusUpdate = (memberId, newStatus) => {
        const foundMember = members.find((m) => m.id === memberId);
        if (foundMember) {
            foundMember.member.card_status = newStatus;
        }
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
                            <Typography sx={{ marginLeft: '10px', fontWeight: 500, color: '#063455', fontSize: '30px' }}>Membership Dashboard</Typography>
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
                            onClick={() => router.visit(route('membership.add'))}
                        >
                            Add Member
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="row mb-4 mt-5">
                        <div className="col-md-4 mb-3">
                            <Card style={{ backgroundColor: '#063455', color: 'white', height: '150px' }}>
                                <CardContent className="text-center py-4">
                                    <div className="mb-2">
                                        <Avatar style={{ backgroundColor: '#202728', margin: '0 auto' }}>
                                            <People />
                                        </Avatar>
                                    </div>
                                    <Typography sx={{ mt: 1, marginBottom: '5px', fontSize: '16px', fontWeight: 400, color: '#C6C6C6' }}>Total Membership</Typography>
                                    <Typography sx={{ fontWeight: 700, fontSize: '24px', color: '#FFFFFF' }}>{total_members ?? 0}</Typography>
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
                                    <Typography sx={{ mt: 1, marginBottom: '5px', fontSize: '16px', fontWeight: 400, color: '#C6C6C6' }}>Total Payment</Typography>
                                    <Typography sx={{ fontWeight: 700, fontSize: '24px', color: '#FFFFFF' }}>{total_payment ?? 0}</Typography>
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
                                    <Typography sx={{ mt: 1, marginBottom: '5px', fontSize: '16px', fontWeight: 400, color: '#C6C6C6' }}>Current Balance</Typography>
                                    <Typography sx={{ fontWeight: 700, fontSize: '24px', color: '#FFFFFF' }}>0</Typography>
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
                                        border: '1px solid #063455',
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
                                    {filteredMembers.map((user) => (
                                        <TableRow key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', cursor: 'pointer' }}>{user.member?.membership_no || 'N/A'}</TableCell>
                                            <TableCell>
                                                <div className="d-flex align-items-center">
                                                    <Avatar src={user.profile_photo || '/placeholder.svg?height=40&width=40'} alt={user.name} style={{ marginRight: '10px' }} />
                                                    <div>
                                                        <Typography sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.first_name}</Typography>
                                                        <Typography sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.email}</Typography>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.member?.member_type?.name || 'N/A'}</TableCell>
                                            <TableCell>
                                                <PopupState variant="popover" popupId={`status-popup-${user.id}`}>
                                                    {(popupState) => (
                                                        <>
                                                            <span
                                                                style={{
                                                                    color: user.member?.card_status === 'active' ? '#2e7d32' : user.member?.card_status === 'suspended' ? '#FFA90B' : '#d32f2f',
                                                                    fontWeight: 'medium',
                                                                    cursor: 'pointer',
                                                                }}
                                                                {...bindTrigger(popupState)}
                                                            >
                                                                {user.member?.card_status || 'N/A'}
                                                                {user.member?.card_status === 'suspended' && (
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
                                                                <MdModeEdit size={18} style={{ marginLeft: '5px' }} />
                                                            </span>
                                                            <Menu {...bindMenu(popupState)}>
                                                                {getAvailableStatusActions(user.member?.card_status).map((statusOption) => (
                                                                    <MenuItem
                                                                        key={statusOption}
                                                                        onClick={() => {
                                                                            popupState.close();
                                                                            if (statusOption === 'suspended') {
                                                                                setSelectMember(user);
                                                                                setSuspensionModalOpen(true);
                                                                            } else if (statusOption === 'cancelled') {
                                                                                setSelectMember(user);
                                                                                setCancelModalOpen(true);
                                                                            } else if (statusOption === 'active') {
                                                                                setSelectMember(user);
                                                                                setActivateModalOpen(true);
                                                                            }
                                                                        }}
                                                                    >
                                                                        {statusOption === 'active' ? 'Activate' : statusOption}
                                                                    </MenuItem>
                                                                ))}
                                                            </Menu>
                                                        </>
                                                    )}
                                                </PopupState>
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
                                            <TableCell>
                                                {user.member?.card_status === 'Expired' || user.member?.card_status === 'Suspend' ? (
                                                    <Button style={{ color: '#0C67AA', textDecoration: 'underline', textTransform: 'none' }}>Send Remind</Button>
                                                ) : (
                                                    <Button
                                                        style={{ color: '#0C67AA', textDecoration: 'underline', textTransform: 'none' }}
                                                        onClick={() => {
                                                            setSelectMember(user);
                                                            setOpenInvoiceModal(true);
                                                        }}
                                                    >
                                                        View
                                                    </Button>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <IconButton onClick={() => router.visit(route('membership.edit', user.id))}>
                                                    <FaEdit size={18} />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>

                    {/* Filter Modal */}
                    <MembershipDashboardFilter
                        openFilterModal={openFilterModal}
                        setOpenFilterModal={setOpenFilterModal}
                        members={members}
                        filteredMembers={filteredMembers}
                        setFilteredMembers={setFilteredMembers}
                        statusOptions={statusOptions}
                        memberTypeOptions={memberTypeOptions}
                    />
                </div>
            </div>

            <MembershipSuspensionDialog open={suspensionModalOpen} onClose={() => setSuspensionModalOpen(false)} memberId={selectMember?.member?.id} onSuccess={(newStatus) => handleStatusUpdate(selectMember.id, newStatus)} />
            <MembershipCancellationDialog open={cancelModalOpen} onClose={() => setCancelModalOpen(false)} onConfirm={handleCancelMembership} memberId={selectMember?.member?.id} onSuccess={(newStatus) => handleStatusUpdate(selectMember.id, newStatus)} />
            <ActivateMembershipDialog open={activateModalOpen} onClose={() => setActivateModalOpen(false)} memberId={selectMember?.member?.id} onSuccess={(newStatus) => handleStatusUpdate(selectMember.id, newStatus)} />
            <MemberProfileModal open={openProfileModal} onClose={() => setOpenProfileModal(false)} member={selectMember} memberData={members} />
            <MembershipCardComponent open={openCardModal} onClose={() => setOpenCardModal(false)} member={selectMember} memberData={members} />
            <InvoiceSlip open={openInvoiceModal} onClose={() => setOpenInvoiceModal(false)} invoiceNo={selectMember?.member?.invoice_id} />
        </>
    );
};

export default MembershipDashboard;
