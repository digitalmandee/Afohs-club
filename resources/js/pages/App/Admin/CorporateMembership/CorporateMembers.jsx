import React, { useState, useEffect } from 'react';
import { Typography, Button, TextField, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper, IconButton, Avatar, Box, InputAdornment, Menu, MenuItem, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Chip } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import axios from 'axios';
import { Search, Delete, Visibility, Add } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import { router, usePage } from '@inertiajs/react';
import { useSnackbar } from 'notistack';
import { FaEdit } from 'react-icons/fa';
import dayjs from 'dayjs';

import CorporateMembershipDashboardFilter from './CorporateMembershipDashboardFilter';
const CorporateMembers = ({ members }) => {
    const props = usePage().props;
    const { enqueueSnackbar } = useSnackbar();

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const [filteredMembers, setFilteredMembers] = useState(members.data);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);

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
                .delete(route('corporate-membership.destroy', memberToDelete.id))
                .then(() => {
                    setFilteredMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));
                    setDeleteDialogOpen(false);
                    setMemberToDelete(null);
                    enqueueSnackbar('Corporate member deleted successfully', { variant: 'success' });
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
        status: props.filters?.status || 'all',
    });

    const handleFilter = () => {
        router.get(route('corporate-membership.members'), filters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <div className="container-fluid p-4 pt-4" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', overflowX: 'hidden' }}>
                <div className="mx-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <Typography sx={{ fontWeight: 700, fontSize: '30px', color: '#063455' }}>All Corporate Members</Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<Delete />}
                                onClick={() => router.get(route('corporate-membership.trashed'))}
                                sx={{
                                    color: '#d32f2f',
                                    borderColor: '#d32f2f',
                                    borderRadius: '16px',
                                    textTransform: 'none',
                                    '&:hover': { backgroundColor: '#ffebee', borderColor: '#d32f2f' },
                                }}
                            >
                                Deleted Members
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<Add/>}
                                onClick={() => router.get(route('corporate-membership.add'))}
                                sx={{
                                    backgroundColor: '#063455',
                                    borderRadius: '16px',
                                    textTransform: 'none',
                                    '&:hover': { backgroundColor: '#052a42' },
                                }}
                            >
                                Add Corporate Member
                            </Button>
                        </Box>
                    </div>
                    <Typography style={{ color: '#063455', fontSize: '15px', fontWeight: '600' }}>A list of all corporate members with their details</Typography>

                    {/* Filter Section */}
                    <CorporateMembershipDashboardFilter />

                    {/* Members Table */}
                    <TableContainer component={Paper} style={{ boxShadow: 'none', overflowX: 'auto', borderRadius: '12px' }}>
                        <Table>
                            <TableHead>
                                <TableRow style={{ backgroundColor: '#063455', height: '60px' }}>
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
                                {filteredMembers.map((user) => (
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
                                                    <Typography sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.personal_email}</Typography>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.member_category?.description || 'N/A'}</TableCell>
                                        <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                            <Chip label="Corporate" size="small" sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 600, fontSize: '11px' }} />
                                        </TableCell>
                                        <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>{user.cnic_no || 'N/A'}</TableCell>
                                        <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.mobile_number_a || 'N/A'}</TableCell>
                                        <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.membership_date ? dayjs(user.membership_date).format('DD-MM-YYYY') : 'N/A'}</TableCell>
                                        <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.card_status || 'N/A'}</TableCell>
                                        <TableCell>
                                            <span style={{ color: user.status === 'active' ? '#2e7d32' : user.status === 'suspended' ? '#FFA90B' : '#d32f2f', fontWeight: 'medium' }}>{user.status || 'N/A'}</span>
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                onClick={(e) => {
                                                    setAnchorEl(e.currentTarget);
                                                    setSelectedMember(user);
                                                }}
                                                sx={{ color: '#063455' }}
                                            >
                                                <MoreVertIcon />
                                            </IconButton>
                                            <Menu anchorEl={anchorEl} open={open && selectedMember?.id === user.id} onClose={() => setAnchorEl(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
                                                <MenuItem
                                                    onClick={() => {
                                                        router.visit(route('corporate-membership.profile', user.id));
                                                        setAnchorEl(null);
                                                    }}
                                                >
                                                    <Visibility size={18} style={{ marginRight: 10, color: '#063455' }} />
                                                    View Profile
                                                </MenuItem>
                                                <MenuItem
                                                    onClick={() => {
                                                        router.visit(route('corporate-membership.edit', user.id));
                                                        setAnchorEl(null);
                                                    }}
                                                >
                                                    <FaEdit size={18} style={{ marginRight: 10, color: '#f57c00' }} />
                                                    Edit Member
                                                </MenuItem>
                                                <MenuItem
                                                    onClick={() => {
                                                        handleDeleteClick(user);
                                                        setAnchorEl(null);
                                                    }}
                                                    sx={{ color: '#d32f2f' }}
                                                >
                                                    <Delete size={18} style={{ marginRight: 10 }} />
                                                    Delete Member
                                                </MenuItem>
                                            </Menu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredMembers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                                            No corporate members found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <Box display="flex" justifyContent="center" mt={2} pb={2}>
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
                                        backgroundColor: link.active ? '#063455' : '#fff',
                                    }}
                                >
                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                </Button>
                            ))}
                        </Box>
                    </TableContainer>
                </div>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogContent>
                        <DialogContentText>Are you sure you want to delete this corporate member? This action cannot be undone.</DialogContentText>
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
        </>
    );
};

export default CorporateMembers;
