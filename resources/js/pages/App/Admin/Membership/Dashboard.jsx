import React, { useState, useEffect } from 'react';
import { Typography, Button, Card, CardContent, TextField, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper, IconButton, Avatar, InputAdornment, Menu, MenuItem, Tooltip, Drawer, Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Tabs, Tab, Chip } from '@mui/material';
import { Search, FilterAlt, People, CreditCard, LocalDining as DiningIcon, TakeoutDining as TakeoutIcon, TwoWheeler as DeliveryIcon, Visibility, Delete, Add } from '@mui/icons-material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import 'bootstrap/dist/css/bootstrap.min.css';
import { router } from '@inertiajs/react';
import MembershipSuspensionDialog from './Modal';
import MembershipCancellationDialog from './CancelModal';
import MembershipCardComponent from './UserCard';
import InvoiceSlip from './Invoice';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import ActivateMembershipDialog from './ActivateMembershipDialog';
import { MdModeEdit } from 'react-icons/md';
import { FaEdit } from 'react-icons/fa';
import MembershipPauseDialog from './MembershipPauseDialog';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import dayjs from 'dayjs';
import { MdOutlineAccountBalance } from 'react-icons/md';

const styles = {
    root: {
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
    },
};

const MembershipDashboard = ({ members = [], corporateMembers = [], total_members, total_payment, total_corporate_members, total_corporate_payment }) => {
    // Tab state for Primary/Corporate
    const [memberTab, setMemberTab] = useState(0);
    // Modal state
    // const [open, setOpen] = useState(true);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [suspensionModalOpen, setSuspensionModalOpen] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [activateModalOpen, setActivateModalOpen] = useState(false);
    const [openProfileModal, setOpenProfileModal] = useState(false);
    const [openCardModal, setOpenCardModal] = useState(false);
    const [openFilterModal, setOpenFilterModal] = useState(false);
    const [selectMember, setSelectMember] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [filteredMembers, setFilteredMembers] = useState(members);
    const [filteredCorporateMembers, setFilteredCorporateMembers] = useState(corporateMembers);
    const [openInvoiceModal, setOpenInvoiceModal] = useState(false);
    const [pauseModalOpen, setPauseModalOpen] = useState(false);
    const [openDocumentModal, setOpenDocumentModal] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);
    // const [anchorE2, setAnchorE2] = useState(null);
    // const [menuMember, setMenuMember] = useState(null);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [menuMember, setMenuMember] = useState(null);
    const handleOpenMenu = (e, user) => {
        setMenuAnchor(e.currentTarget);
        setSelectedUserId(user.id);  // Track which user
        setMenuMember(user);
    };

    // const handleOpenMenu = (event, user) => {
    //     setAnchorE2(event.currentTarget);
    //     setMenuMember(user);
    // };

    const handleCloseMenu = () => {
        setMenuAnchor(null);
        setSelectedUserId(null);
    };

    const handleOpenCard = () => {
        setSelectMember(menuMember);
        setOpenCardModal(true);
        handleCloseMenu();
    };

    const handleOpenInvoice = () => {
        if (menuMember.card_status === 'Expired' || menuMember.card_status === 'Suspend') {
            // your “Send Remind” logic here if needed
            handleCloseMenu();
            return;
        }
        setSelectMember(menuMember);
        setOpenInvoiceModal(true);
        handleCloseMenu();
    };

    const handleOpenDocuments = () => {
        setSelectMember(menuMember);
        setOpenDocumentModal(true);
        handleCloseMenu();
    };

    const handleDeleteClick = (member) => {
        setMemberToDelete(member);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (memberToDelete) {
            axios
                .delete(route('membership.destroy', memberToDelete.id))
                .then(() => {
                    // Remove member from local state to avoid full reload
                    setFilteredMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));
                    setDeleteDialogOpen(false);
                    setMemberToDelete(null);
                    enqueueSnackbar('Member deleted successfully', { variant: 'success' });
                })
                .catch((error) => {
                    console.error('Error deleting member:', error);
                    enqueueSnackbar('Failed to delete member. Please try again.', { variant: 'error' });
                    setDeleteDialogOpen(false);
                });
        }
    };

    // Extract unique status and member type values from members
    const handleCancelMembership = () => {
        setCancelModalOpen(false);
    };

    const getAvailableStatusActions = (currentStatus) => {
        const allStatuses = ['active', 'suspended', 'cancelled', 'absent'];
        return allStatuses.filter((status) => status.toLowerCase() !== currentStatus?.toLowerCase());
    };

    const handleStatusUpdate = (memberId, newStatus) => {
        const foundMember = members.find((m) => m.id === memberId);
        if (foundMember) {
            foundMember.status = newStatus;
        }
    };

    return (
        <>
            {/* <SideNav open={open} setOpen={setOpen} /> */}
            {/* <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                    backgroundColor: '#F6F6F6',
                }}
            > */}
            <div className="container-fluid p-4" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', overflowX: 'hidden' }}>
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center" style={{ width: '100%', paddingLeft: 0, paddingRight: 0 }}>
                    <div className="align-items-center">
                        <Typography sx={{ fontWeight: 700, color: '#063455', fontSize: '30px' }}>Membership Dashboard</Typography>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Button
                            variant="contained"
                            startIcon={
                                // <span
                                //     style={{
                                //         fontSize: '1.75rem',
                                //         marginBottom: 5,
                                //     }}
                                // >
                                //     +
                                // </span>
                                <Add />
                            }
                            style={{
                                backgroundColor: '#063455',
                                borderRadius: '16px',
                                height: 40,
                                // width: 170,
                                display: 'flex',
                                alignItems: 'center',
                                textTransform: 'none'
                            }}
                            onClick={() => router.visit(route('membership.add'))}
                        >
                            Add Member
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            style={{
                                backgroundColor: '#063455',
                                borderRadius: '16px',
                                height: 40,
                                // width: 220,
                                display: 'flex',
                                alignItems: 'center',
                                textTransform: 'none'
                            }}
                            onClick={() => router.visit(route('corporate-membership.add'))}
                        >
                            Corporate Member
                        </Button>
                    </div>
                </div>
                <Typography style={{ color: '#063455', fontSize: '15px', fontWeight: '600' }}>A quick overview of membership statistics, recent activities, and important alerts</Typography>

                {/* Stats Cards */}
                <div className="row mb-4 mt-5">
                    <div className="col-md-4 mb-3">
                        <Card style={{ backgroundColor: '#063455', color: 'white', height: '150px', borderRadius: '16px' }}>
                            <CardContent className="text-center py-4">
                                <div className="mb-2">
                                    <Avatar style={{ backgroundColor: 'transparent', margin: '0 auto' }}>
                                        <People style={{ height: 40, width: 40 }} />
                                    </Avatar>
                                </div>
                                <Typography sx={{ mt: 1, marginBottom: '5px', fontSize: '16px', fontWeight: 400, color: '#C6C6C6' }}>Total Membership</Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: '24px', color: '#FFFFFF' }}>{total_members ?? 0}</Typography>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="col-md-4 mb-3">
                        <Card style={{ backgroundColor: '#063455', color: 'white', height: '150px', borderRadius: '16px' }}>
                            <CardContent className="text-center py-4">
                                <div className="mb-2">
                                    <Avatar style={{ backgroundColor: 'transparent', margin: '0 auto' }}>
                                        <CreditCard style={{ height: 40, width: 40 }} />
                                    </Avatar>
                                </div>
                                <Typography sx={{ mt: 1, marginBottom: '5px', fontSize: '16px', fontWeight: 400, color: '#C6C6C6' }}>Total Payment</Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: '24px', color: '#FFFFFF' }}>{(total_payment ?? 0).toLocaleString()}</Typography>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="col-md-4 mb-3">
                        <Card style={{ backgroundColor: '#063455', color: 'white', height: '150px', borderRadius: '16px' }}>
                            <CardContent className="text-center py-4">
                                <div className="mb-2">
                                    <Avatar style={{ backgroundColor: 'transparent', margin: '0 auto' }}>
                                        <MdOutlineAccountBalance style={{ height: 40, width: 40 }} />
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
                        <Typography style={{ fontWeight: 600, fontSize: '24px', color: '#000000' }}>Recently Joined</Typography>
                        <Tabs
                            value={memberTab}
                            onChange={(e, newValue) => setMemberTab(newValue)}
                            sx={{
                                '& .MuiTab-root': {
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                },
                                '& .Mui-selected': {
                                    color: '#063455 !important',
                                },
                                '& .MuiTabs-indicator': {
                                    backgroundColor: '#063455',
                                },
                            }}
                        >
                            <Tab label="Primary Members" />
                            <Tab label="Corporate Members" />
                        </Tabs>
                    </div>
                    {/* Primary Members Table */}
                    {memberTab === 0 && (
                        <TableContainer component={Paper} style={{ boxShadow: 'none', overflowX: 'auto', borderRadius: '12px' }}>
                            {/* <div style={{ direction: 'ltr' }}> */}
                            <Table
                            // sx={{ border: '2px solid #063455' }}
                            >
                                <TableHead>
                                    <TableRow style={{ backgroundColor: '#063455', height: '30px' }}>
                                        <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Membership No</TableCell>
                                        <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Member</TableCell>
                                        <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Category</TableCell>
                                        <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Type</TableCell>
                                        <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>CNIC</TableCell>
                                        <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Contact</TableCell>
                                        <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Membership Date</TableCell>
                                        <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Duration</TableCell>
                                        <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Family Members</TableCell>
                                        <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Card Status</TableCell>
                                        <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Status</TableCell>
                                        {/* <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Card</TableCell>
                                    <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Invoice</TableCell>
                                    <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Documents</TableCell> */}
                                        <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Files</TableCell>
                                        <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredMembers.map((user) => (
                                        <TableRow key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <TableCell
                                                onClick={() => router.visit(route('membership.profile', user.id))}
                                                sx={{
                                                    color: '#000',
                                                    fontWeight: 600,
                                                    fontSize: '14px',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        color: '#7f7f7f', // dark text on hover
                                                        fontWeight: 600, // bold on hover
                                                    },
                                                }}
                                            >
                                                {user.membership_no || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="d-flex align-items-center">
                                                    <Avatar src={user.profile_photo?.file_path || '/placeholder.svg?height=40&width=40'} alt={user.name} style={{ marginRight: '10px' }} />
                                                    <div>
                                                        <Typography sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }} className="d-flex align-items-center gap-2">
                                                            <Typography sx={{
                                                                color: '#7F7F7F', fontWeight: 400, fontSize: '14px', maxWidth: '120px',  // ~20 chars width
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis'
                                                            }}>
                                                                <Tooltip title={user.full_name || 'N/A'} arrow>
                                                                    <span>{user.full_name || 'N/A'}</span>
                                                                </Tooltip>
                                                            </Typography>
                                                            {user.is_document_enabled && (
                                                                <Tooltip title="Documents missing" arrow>
                                                                    <WarningAmberIcon color="warning" fontSize="small" />
                                                                </Tooltip>
                                                            )}
                                                        </Typography>
                                                        <Typography
                                                            sx={{
                                                                color: '#7F7F7F',
                                                                fontWeight: 400,
                                                                fontSize: '14px',
                                                                maxWidth: '120px', // controls visible length (~15 chars)
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            <Tooltip title={user.personal_email || 'N/A'} arrow>
                                                                <span>{user.personal_email || 'N/A'}</span>
                                                            </Tooltip>

                                                        </Typography>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.member_category?.description || 'N/A'}</TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {/* <Chip size="small" /> */}
                                                    {user.member_type?.name || ''}
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>{user.cnic_no || 'N/A'}</TableCell>
                                            {/* <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.mobile_number_a || 'N/A'}</TableCell> */}
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                <Tooltip title={user.mobile_number_a || ''} arrow>
                                                    <span style={{ cursor: 'pointer' }}>{user.mobile_number_a && user.mobile_number_a.length > 11 ? `${user.mobile_number_a.slice(0, 11)}...` : user.mobile_number_a}</span>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.membership_date ? dayjs(user.membership_date).format('DD-MM-YYYY') : 'N/A'}</TableCell>
                                            <TableCell sx={{
                                                color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap', maxWidth: '100px', overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}>
                                                {/* {user.membership_duration || 'N/A'} */}
                                                <Tooltip title={user.membership_duration || 'N/A'} arrow>
                                                    <span>{user.membership_duration || 'N/A'}</span>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.family_members_count || 'N/A'}</TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.card_status || 'N/A'}</TableCell>
                                            <TableCell>
                                                <PopupState variant="popover" popupId={`status-popup-${user.id}`}>
                                                    {(popupState) => (
                                                        <>
                                                            <span
                                                                style={{
                                                                    color: user.status === 'active' ? '#2e7d32' : user.status === 'suspended' ? '#FFA90B' : '#d32f2f',
                                                                    fontWeight: 'medium',
                                                                    cursor: 'pointer',
                                                                }}
                                                                {...bindTrigger(popupState)}
                                                            >
                                                                {user.status || 'N/A'}
                                                                {user.status === 'suspended' && (
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
                                                                {getAvailableStatusActions(user.status).map((statusOption) => (
                                                                    <MenuItem
                                                                        key={statusOption}
                                                                        onClick={() => {
                                                                            popupState.close();
                                                                            setSelectMember(user);
                                                                            if (statusOption === 'suspended') setSuspensionModalOpen(true);
                                                                            else if (statusOption === 'cancelled') setCancelModalOpen(true);
                                                                            else if (statusOption === 'active') setActivateModalOpen(true);
                                                                            else if (statusOption === 'absent') setPauseModalOpen(true);
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
                                            {/* <TableCell>
                                                <Button
                                                    style={{
                                                        color: '#0C67AA',
                                                        textDecoration: 'underline',
                                                        textTransform: 'none',
                                                    }}
                                                    onClick={() => {
                                                        setSelectMember(user);
                                                        setOpenCardModal(true);
                                                    }}
                                                >
                                                    View
                                                </Button>
                                            </TableCell> */}

                                            {/* <TableCell>
                                                {user.card_status === 'Expired' || user.card_status === 'Suspend' ? (
                                                    <Button style={{ color: '#0C67AA', textDecoration: 'underline', textTransform: 'none' }}>Send Remind</Button>
                                                ) : (
                                                    <Button
                                                        style={{
                                                            color: '#0C67AA',
                                                            textDecoration: 'underline',
                                                            textTransform: 'none',
                                                        }}
                                                        onClick={() => {
                                                            setSelectMember(user);
                                                            setOpenInvoiceModal(true);
                                                        }}
                                                    >
                                                        View
                                                    </Button>
                                                )}
                                            </TableCell> */}
                                            {/*
                                        <TableCell>
                                            <Button
                                                style={{
                                                    color: '#0C67AA',
                                                    textDecoration: 'underline',
                                                    textTransform: 'none',
                                                }}
                                                onClick={() => {
                                                    setSelectMember(user);
                                                    setOpenDocumentModal(true);
                                                }}
                                            >
                                                View
                                            </Button>
                                        </TableCell> */}
                                            <TableCell>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleOpenMenu(e, user)}
                                                >
                                                    <MoreVertIcon sx={{ color: '#063455' }} />
                                                </IconButton>
                                                <Menu
                                                    anchorEl={menuAnchor}  // Fixed: anchorEl (not anchorE2)
                                                    open={Boolean(menuAnchor && selectedUserId === user.id)}
                                                    onClose={handleCloseMenu}
                                                    anchorOrigin={{
                                                        vertical: 'bottom',
                                                        horizontal: 'right',
                                                    }}
                                                    transformOrigin={{
                                                        vertical: 'top',
                                                        horizontal: 'right',
                                                    }}
                                                // slotProps={{
                                                //     paper: {
                                                //         sx: { mt: -5 },
                                                //     },
                                                // }}
                                                >
                                                    <MenuItem onClick={handleOpenCard}>Card</MenuItem>
                                                    <MenuItem onClick={handleOpenInvoice}>
                                                        {menuMember && (menuMember.card_status === 'Expired' || menuMember.card_status === 'Suspend')
                                                            ? 'Send Remind'
                                                            : 'Invoice'
                                                        }
                                                    </MenuItem>
                                                    <MenuItem onClick={handleOpenDocuments}>Documents</MenuItem>
                                                </Menu>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Tooltip title="View Profile">
                                                        <IconButton onClick={() => router.visit(route('membership.profile', user.id))} sx={{ color: '#063455' }}>
                                                            <Visibility size={18} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Edit Member">
                                                        <IconButton onClick={() => router.visit(route('membership.edit', user.id))} sx={{ color: '#f57c00' }}>
                                                            <FaEdit size={18} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete Member">
                                                        <IconButton onClick={() => handleDeleteClick(user)} sx={{ color: '#d32f2f' }}>
                                                            <Delete size={18} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                            {/* <TableCell align="center">
                                                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: '#063455' }}>
                                                    <MoreVertIcon />
                                                </IconButton>

                                                <Menu
                                                    anchorEl={anchorEl}
                                                    open={Boolean(anchorEl)}
                                                    onClose={() => setAnchorEl(null)}
                                                    anchorOrigin={{
                                                        vertical: 'bottom',
                                                        horizontal: 'right',
                                                    }}
                                                    transformOrigin={{
                                                        vertical: 'top',
                                                        horizontal: 'right',
                                                    }}
                                                >
                                                    <MenuItem
                                                        onClick={() => {
                                                            router.visit(route('membership.profile', user.id));
                                                            setAnchorEl(null);
                                                        }}
                                                    >
                                                        <Visibility size={16} style={{ marginRight: 8 }} />
                                                        View Profile
                                                    </MenuItem>

                                                    <MenuItem
                                                        onClick={() => {
                                                            router.visit(route('membership.edit', user.id));
                                                            setAnchorEl(null);
                                                        }}
                                                    >
                                                        <FaEdit size={16} style={{ marginRight: 8, color: '#f57c00' }} />
                                                        Edit Member
                                                    </MenuItem>

                                                    <MenuItem
                                                        onClick={() => {
                                                            handleDeleteClick(user);
                                                            setAnchorEl(null);
                                                        }}
                                                        sx={{ color: '#d32f2f' }}
                                                    >
                                                        <Delete size={16} style={{ marginRight: 8 }} />
                                                        Delete Member
                                                    </MenuItem>
                                                </Menu>
                                            </TableCell> */}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {/* </div> */}
                        </TableContainer>
                    )}

                    {/* Corporate Members Table */}
                    {memberTab === 1 && (
                        <TableContainer component={Paper} style={{ boxShadow: 'none', overflowX: 'auto', borderRadius: '12px' }}>
                            <Table>
                                <TableHead>
                                    <TableRow style={{ backgroundColor: '#063455', height: '30px' }}>
                                        <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Membership No</TableCell>
                                        <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Member</TableCell>
                                        <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Category</TableCell>
                                        <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Type</TableCell>
                                        <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>CNIC</TableCell>
                                        <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Contact</TableCell>
                                        <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Membership Date</TableCell>
                                        <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Card Status</TableCell>
                                        <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Status</TableCell>
                                        <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredCorporateMembers.map((user) => (
                                        <TableRow key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <TableCell
                                                onClick={() => router.visit(route('corporate-membership.profile', user.id))}
                                                sx={{
                                                    color: '#000',
                                                    fontWeight: 600,
                                                    fontSize: '14px',
                                                    cursor: 'pointer',
                                                    '&:hover': { color: '#7f7f7f', fontWeight: 600 },
                                                }}
                                            >
                                                {user.membership_no || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="d-flex align-items-center">
                                                    <Avatar src={user.profile_photo?.file_path || '/placeholder.svg?height=40&width=40'} alt={user.full_name} style={{ marginRight: '10px' }} />
                                                    <div>
                                                        <Typography sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.full_name}</Typography>
                                                        <Typography sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.personal_email}</Typography>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.member_category?.description || 'N/A'}</TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                <Chip label="Corporate" size="small" sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 600, fontSize: '11px' }} />
                                            </TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>{user.cnic_no || 'N/A'}</TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                <Tooltip title={user.mobile_number_a || ''} arrow>
                                                    <span style={{ cursor: 'pointer' }}>{user.mobile_number_a && user.mobile_number_a.length > 11 ? `${user.mobile_number_a.slice(0, 11)}...` : user.mobile_number_a}</span>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.membership_date ? dayjs(user.membership_date).format('DD-MM-YYYY') : 'N/A'}</TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.card_status || 'N/A'}</TableCell>
                                            <TableCell>
                                                <span style={{ color: user.status === 'active' ? '#2e7d32' : user.status === 'suspended' ? '#FFA90B' : '#d32f2f', fontWeight: 'medium' }}>{user.status || 'N/A'}</span>
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton onClick={() => router.visit(route('corporate-membership.edit', user.id))} sx={{ color: '#f57c00' }}>
                                                    <FaEdit size={16} />
                                                </IconButton>
                                                <IconButton onClick={() => router.visit(route('corporate-membership.profile', user.id))} sx={{ color: '#063455' }}>
                                                    <Visibility fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredCorporateMembers.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                                                No corporate members found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </div>
            </div>
            {/* </div> */}

            <MembershipPauseDialog open={pauseModalOpen} onClose={() => setPauseModalOpen(false)} memberId={selectMember?.id} onSuccess={(newStatus) => handleStatusUpdate(selectMember.id, newStatus)} />
            <MembershipSuspensionDialog open={suspensionModalOpen} onClose={() => setSuspensionModalOpen(false)} memberId={selectMember?.id} onSuccess={(newStatus) => handleStatusUpdate(selectMember.id, newStatus)} />
            <MembershipCancellationDialog open={cancelModalOpen} onClose={() => setCancelModalOpen(false)} onConfirm={handleCancelMembership} memberId={selectMember?.id} onSuccess={(newStatus) => handleStatusUpdate(selectMember.id, newStatus)} />

            <ActivateMembershipDialog open={activateModalOpen} onClose={() => setActivateModalOpen(false)} memberId={selectMember?.id} onSuccess={(newStatus) => handleStatusUpdate(selectMember.id, newStatus)} />

            <MembershipCardComponent open={openCardModal} onClose={() => setOpenCardModal(false)} member={selectMember} memberData={members} />
            <InvoiceSlip
                open={openInvoiceModal}
                onClose={() => {
                    setOpenInvoiceModal(false);
                    setSelectMember(null); // ✅ Clear selected member when closing
                }}
                invoiceNo={selectMember?.membership_invoice?.id ? null : selectMember?.id}
                invoiceId={selectMember?.membership_invoice?.id || null}
            />

            <Drawer
                anchor="top"
                open={openDocumentModal}
                onClose={() => setOpenDocumentModal(false)}
                ModalProps={{ keepMounted: true }}
                PaperProps={{
                    sx: {
                        margin: '20px auto 0',
                        width: 600,
                        borderRadius: '8px',
                    },
                }}
            >
                <Box sx={{ p: 2 }}>
                    {/* ✅ Documents Preview */}
                    <h5 style={{ marginBottom: '10px', fontWeight: 700 }}>Attached Documents</h5>
                    {selectMember && selectMember?.documents && selectMember?.documents.length > 0 ? (
                        <div style={{ marginTop: '20px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {selectMember?.documents.map((doc, index) => {
                                    const ext = doc.file_path.split('.').pop().toLowerCase();

                                    // ✅ For images
                                    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
                                        return (
                                            <div key={index} style={{ width: '100px', textAlign: 'center' }}>
                                                <img src={doc.file_path} alt={`Document ${index + 1}`} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer' }} onClick={() => window.open(doc.file_path, '_blank')} />
                                                <p style={{ fontSize: '12px', marginTop: '5px' }}>Image</p>
                                            </div>
                                        );
                                    }

                                    // ✅ For PDF
                                    if (ext === 'pdf') {
                                        return (
                                            <div key={index} style={{ width: '100px', textAlign: 'center' }}>
                                                <img
                                                    src="/assets/pdf-icon.png" // You can use a static icon
                                                    alt="PDF"
                                                    style={{ width: '60px', cursor: 'pointer' }}
                                                    onClick={() => window.open(doc.file_path, '_blank')}
                                                />
                                                <p style={{ fontSize: '12px', marginTop: '5px' }}>PDF</p>
                                            </div>
                                        );
                                    }

                                    // ✅ For DOCX
                                    if (ext === 'docx' || ext === 'doc') {
                                        return (
                                            <div key={index} style={{ width: '100px', textAlign: 'center' }}>
                                                <img
                                                    src="/assets/word-icon.png" // Use a static Word icon
                                                    alt="DOCX"
                                                    style={{ width: '60px', cursor: 'pointer' }}
                                                    onClick={() => window.open(doc.file_path, '_blank')}
                                                />
                                                <p style={{ fontSize: '12px', marginTop: '5px' }}>Word</p>
                                            </div>
                                        );
                                    }

                                    return null; // For unknown file types
                                })}
                            </div>
                        </div>
                    ) : (
                        <div style={{ marginTop: '20px', textAlign: 'center', color: '#7F7F7F', fontSize: '14px' }}>
                            No attached documents
                        </div>
                    )}
                </Box>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button variant="text" color="inherit" onClick={() => setOpenDocumentModal(false)}>
                        Close
                    </Button>
                </Box>
            </Drawer>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                <DialogTitle id="alert-dialog-title">{'Confirm Deletion'}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description" style={{ color: '#D32F2F' }}>Are you sure you want to delete this member? </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} style={{ color: '#063455', border: '1px solid #063455' }}>
                        Cancel
                    </Button>
                    <Button onClick={confirmDelete} color="error" autoFocus style={{ color: '#D32F2F', border: '1px solid #D32F2F' }}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default MembershipDashboard;
