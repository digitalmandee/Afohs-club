import { useState } from 'react';
import { Typography, Button, TextField, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper, IconButton, Avatar, Box, InputAdornment, Menu, MenuItem, Tooltip } from '@mui/material';
import { Search, FilterAlt } from '@mui/icons-material';
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
import { FaEdit } from 'react-icons/fa';
import { MdModeEdit } from 'react-icons/md';
import MembershipDashboardFilter from './MembershipDashboardFilter';
import MembershipPauseDialog from './MembershipPauseDialog';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const AllMembers = ({ members }) => {
    // Modal state
    const [open, setOpen] = useState(true);
    const [suspensionModalOpen, setSuspensionModalOpen] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [activateModalOpen, setActivateModalOpen] = useState(false);
    const [openProfileModal, setOpenProfileModal] = useState(false);
    const [openCardModal, setOpenCardModal] = useState(false);
    const [openFilterModal, setOpenFilterModal] = useState(false);
    const [selectMember, setSelectMember] = useState(null);
    const [filteredMembers, setFilteredMembers] = useState(members.data);
    const [openInvoiceModal, setOpenInvoiceModal] = useState(false);
    const [pauseModalOpen, setPauseModalOpen] = useState(false);

    // Extract unique status and member type values from members
    const statusOptions = [
        { label: 'All type', value: 'all', icon: null },
        { label: 'Active', value: 'active', icon: null },
        { label: 'Suspended', value: 'suspended', icon: null },
        { label: 'Cancelled', value: 'cancelled', icon: null },
        { label: 'Pause', value: 'pause', icon: null },
    ];

    const memberTypeOptions = [
        { label: 'All types', value: 'all' },
        ...[...new Set(members.data.map((member) => member.member?.member_type?.name).filter((name) => name))].map((name) => ({
            label: name,
            value: name,
        })),
    ];

    const handleCancelMembership = () => {
        setCancelModalOpen(false);
    };

    const getAvailableStatusActions = (currentStatus) => {
        const allStatuses = ['active', 'suspended', 'cancelled', 'pause'];
        return allStatuses.filter((status) => status.toLowerCase() !== currentStatus?.toLowerCase());
    };

    const handleStatusUpdate = (memberId, newStatus) => {
        const foundMember = members.data.find((m) => m.id === memberId);
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
                <div className="container-fluid px-4 pt-4" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
                    {/* Recently Joined Section */}
                    <div className="mx-3">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <Typography sx={{ fontWeight: 500, fontSize: '24px', color: '#000000' }}>All Members</Typography>
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
                                                        <Typography sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }} className="d-flex align-items-center gap-2">
                                                            {user.first_name}

                                                            {user.member?.is_document_enabled && (
                                                                <Tooltip title="Documents missing" arrow>
                                                                    <WarningAmberIcon color="warning" fontSize="small" />
                                                                </Tooltip>
                                                            )}
                                                        </Typography>

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
                                                                                // Optional: trigger activate logic/modal here
                                                                                console.log('Activate clicked');
                                                                            } else if (statusOption === 'pause') {
                                                                                setSelectMember(user);
                                                                                setPauseModalOpen(true);
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
                            <Box display="flex" justifyContent="center" mt={2}>
                                {members.links?.map((link, index) => (
                                    <Button
                                        key={index}
                                        onClick={() => link.url && router.visit(link.url)}
                                        disabled={!link.url}
                                        variant={link.active ? 'contained' : 'outlined'}
                                        size="small"
                                        style={{
                                            margin: '0 5px',
                                            minWidth: '36px',
                                            padding: '6px 10px',
                                            fontWeight: link.active ? 'bold' : 'normal',
                                            backgroundColor: link.active ? '#333' : '#fff',
                                        }}
                                    >
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    </Button>
                                ))}
                            </Box>
                        </TableContainer>

                        {/* Filter Modal */}
                        <MembershipDashboardFilter openFilterModal={openFilterModal} setOpenFilterModal={setOpenFilterModal} members={members.data} filteredMembers={filteredMembers} setFilteredMembers={setFilteredMembers} statusOptions={statusOptions} memberTypeOptions={memberTypeOptions} />
                    </div>

                    {/* Modal */}
                    <MembershipPauseDialog open={pauseModalOpen} onClose={() => setPauseModalOpen(false)} memberId={selectMember?.member?.id} onSuccess={(newStatus) => handleStatusUpdate(selectMember.id, newStatus)} />
                    <MembershipSuspensionDialog open={suspensionModalOpen} onClose={() => setSuspensionModalOpen(false)} memberId={selectMember?.member?.id} onSuccess={(newStatus) => handleStatusUpdate(selectMember.id, newStatus)} />
                    <MembershipCancellationDialog open={cancelModalOpen} onClose={() => setCancelModalOpen(false)} onConfirm={handleCancelMembership} memberId={selectMember?.member?.id} onSuccess={(newStatus) => handleStatusUpdate(selectMember.id, newStatus)} />
                    <ActivateMembershipDialog open={activateModalOpen} onClose={() => setActivateModalOpen(false)} memberId={selectMember?.member?.id} onSuccess={(newStatus) => handleStatusUpdate(selectMember.id, newStatus)} />
                    <MemberProfileModal open={openProfileModal} onClose={() => setOpenProfileModal(false)} member={selectMember} memberData={members.data} />
                    <MembershipCardComponent open={openCardModal} onClose={() => setOpenCardModal(false)} member={selectMember} memberData={members.data} />
                    <InvoiceSlip open={openInvoiceModal} onClose={() => setOpenInvoiceModal(false)} invoiceNo={selectMember?.member?.invoice_id} />
                </div>
            </div>
        </>
    );
};

export default AllMembers;
