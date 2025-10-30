// MembersType.jsx
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Typography, IconButton, Box, Menu, MenuItem, Grid, Card } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Add as AddIcon, MoreVert as MoreVertIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import AddMemberModal from '@/components/App/MemberTypes/AddModal';


const MembersType = ({ memberTypesData }) => {
    // const [open, setOpen] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [memberTypes, setMemberTypes] = useState(memberTypesData || []);
    const { props } = usePage();
    const csrfToken = props._token;

    const handleMenuOpen = (event, member) => {
        setAnchorEl(event.currentTarget);
        setSelectedMember(member);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedMember(null);
    };

    const handleAdd = () => {
        setEditingMember(null);
        setModalOpen(true);
    };

    const handleEdit = () => {
        if (selectedMember) {
            setEditingMember(selectedMember);
            setModalOpen(true);
        }
        handleMenuClose();
    };

    const handleDelete = async () => {
        if (selectedMember) {
            try {
                await axios.delete(route('member-types.destroy', selectedMember.id), {
                    headers: { 'X-CSRF-TOKEN': csrfToken },
                });
                setMemberTypes((prev) => prev.filter((type) => type.id !== selectedMember.id));
                enqueueSnackbar('Member Type deleted successfully.', { variant: 'success' });
            } catch (error) {
                enqueueSnackbar('Failed to delete: ' + (error.response?.data?.message || error.message), { variant: 'error' });
            }
        }
        handleMenuClose();
    };

    const handleSuccess = (data) => {
        setMemberTypes((prev) => {
            const exists = prev.find((p) => p.id === data.id);
            return exists ? prev.map((p) => (p.id === data.id ? data : p)) : [...prev, data];
        });
        setModalOpen(false);
        setEditingMember(null);
    };

    return (
        <>
            {/* <SideNav open={open} setOpen={setOpen} /> */}
            <Box
                sx={{
                    // marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    // transition: 'margin-left 0.3s ease-in-out',
                    // marginTop: '5rem',
                    // backgroundColor: '#F6F6F6',
                    minHeight: '100vh',
                    padding: '20px',
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton onClick={() => window.history.back()}>
                            <ArrowBackIcon sx={{ color: '#555' }} />
                        </IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 500, color: '#333' }}>
                            Members Type
                        </Typography>
                    </Box>
                    <Button variant="contained" startIcon={<AddIcon />} sx={{ backgroundColor: '#003366', textTransform: 'none' }} onClick={handleAdd}>
                        Add Type
                    </Button>
                </Box>

                <Grid container spacing={3}>
                    {memberTypes.map((type) => (
                        <Grid item xs={12} sm={6} md={4} key={type.id}>
                            <Card sx={{ p: 2, border: '1px solid #ddd' }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography fontWeight={500}>{type.name}</Typography>
                                    <IconButton onClick={(e) => handleMenuOpen(e, type)}>
                                        <MoreVertIcon />
                                    </IconButton>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                    <MenuItem onClick={handleEdit}>
                        <EditIcon sx={{ mr: 1 }} /> Edit
                    </MenuItem>
                    <MenuItem onClick={handleDelete}>
                        <DeleteIcon sx={{ mr: 1 }} /> Delete
                    </MenuItem>
                </Menu>
            </Box>

            <AddMemberModal open={modalOpen} handleClose={() => setModalOpen(false)} memberType={editingMember} onSuccess={handleSuccess} />
        </>
    );
};

export default MembersType;
