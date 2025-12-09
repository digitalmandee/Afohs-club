import { useState, useEffect } from 'react';
import { Typography, Button, TextField, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper, IconButton, Avatar, Box, InputAdornment, Menu, MenuItem, Tooltip, Drawer, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import axios from 'axios';
import { Search, FilterAlt, Visibility, Delete } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import { router, usePage } from '@inertiajs/react';
import { useSnackbar } from 'notistack';
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
import { JSONParse } from '@/helpers/generateTemplate';

const AllMembers = ({ members }) => {
    const props = usePage().props;
    const { enqueueSnackbar } = useSnackbar();

    // Modal state
    // const [open, setOpen] = useState(true);
    const [suspensionModalOpen, setSuspensionModalOpen] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [activateModalOpen, setActivateModalOpen] = useState(false);
    const [openCardModal, setOpenCardModal] = useState(false);
    const [openFilterModal, setOpenFilterModal] = useState(false);
    const [selectMember, setSelectMember] = useState(null);
    const [filteredMembers, setFilteredMembers] = useState(members.data);
    const [openInvoiceModal, setOpenInvoiceModal] = useState(false);
    const [pauseModalOpen, setPauseModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [openDocumentModal, setOpenDocumentModal] = useState(false);

    // Sync filteredMembers with props.members.data when props change (e.g. pagination)
    useEffect(() => {
        setFilteredMembers(members.data);
    }, [members.data]);

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

    const [filters, setFilters] = useState({
        membership_no: props.filters?.membership_no || '',
        name: props.filters?.name || '',
        cnic: props.filters?.cnic || '',
        contact: props.filters?.contact || '',
        status: props.filters?.status || 'all',
        member_type: props.filters?.member_type || 'all',
    });

    const handleFilter = () => {
        router.get(route('membership.members'), filters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Extract unique status and member type values from members
    const statusOptions = [
        { label: 'All type', value: 'all', icon: null },
        { label: 'Active', value: 'active', icon: null },
        { label: 'Suspended', value: 'suspended', icon: null },
        { label: 'Cancelled', value: 'cancelled', icon: null },
        { label: 'Absent', value: 'absent', icon: null },
    ];

    const memberTypeOptions = [
        { label: 'All types', value: 'all' },
        ...[...new Set(members.data.map((member) => member.member_type?.name).filter((name) => name))].map((name) => ({
            label: name,
            value: name,
        })),
    ];

    const handleCancelMembership = () => {
        setCancelModalOpen(false);
    };

    const getAvailableStatusActions = (currentStatus) => {
        const allStatuses = ['active', 'suspended', 'cancelled', 'absent'];
        return allStatuses.filter((status) => status.toLowerCase() !== currentStatus?.toLowerCase());
    };

    const handleStatusUpdate = (memberId, newStatus) => {
        const foundMember = members.data.find((m) => m.id === memberId);
        if (foundMember) {
            foundMember.status = newStatus;
        }
    };

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
            <div className="container-fluid px-4 pt-4" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', overflowX: 'hidden' }}>
                {/* Recently Joined Section */}
                <div className="mx-3">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <Typography sx={{ fontWeight: 600, fontSize: '24px', color: '#063455' }}>All Members</Typography>
                    </div>

                    {/* Filter Modal */}
                    <MembershipDashboardFilter />

                    {/* Members Table */}
                    <TableContainer component={Paper} style={{ boxShadow: 'none', overflowX: 'auto' }}>
                        <Table>
                            <TableHead>
                                <TableRow style={{ backgroundColor: '#E5E5EA', height: '60px' }}>
                                    <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Membership No</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Member</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Member Category</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Member Type</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>CNIC</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Contact</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Membership Date</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Duration</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Family Members</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Card Status</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Status</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Card</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Invoice</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Documents</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredMembers.map((user) => (
                                    <TableRow key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <TableCell onClick={() => router.visit(route('membership.profile', user.id))} sx={{
                                            color: '#7F7F7F', fontWeight: 400, fontSize: '14px', cursor: 'pointer', "&:hover": {
                                                color: '#000',               // dark text on hover
                                                fontWeight: 600             // bold on hover
                                            }
                                        }}>
                                            {user.membership_no || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="d-flex align-items-center">
                                                <Avatar src={user.profile_photo?.file_path || '/placeholder.svg?height=40&width=40'} alt={user.name} style={{ marginRight: '10px' }} />
                                                <div>
                                                    <Typography sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }} className="d-flex align-items-center gap-2">
                                                        {user.full_name}

                                                        {user.is_document_enabled && (
                                                            <Tooltip title="Documents missing" arrow>
                                                                <WarningAmberIcon color="warning" fontSize="small" />
                                                            </Tooltip>
                                                        )}
                                                    </Typography>
                                                    <Typography sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.personal_email}</Typography>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.member_category?.description || 'N/A'}</TableCell>
                                        <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.member_type?.name || 'N/A'}</TableCell>
                                        <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.cnic_no || 'N/A'}</TableCell>
                                        <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.mobile_number_a || 'N/A'}</TableCell>
                                        <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.membership_date || 'N/A'}</TableCell>
                                        <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.membership_duration || 'N/A'}</TableCell>
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
                                        <TableCell>
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
                                        </TableCell>
                                        <TableCell>
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
                                        </TableCell>
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
                </div>

                {/* Modal */}
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
                        {selectMember && selectMember?.documents && selectMember?.documents.length > 0 && (
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
                        <DialogContentText id="alert-dialog-description">Are you sure you want to delete this member? This action cannot be undone.</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={confirmDelete} color="error" autoFocus>
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
            {/* </div> */}
        </>
    );
};

export default AllMembers;
