import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Typography, IconButton, Box, Grid, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import AddEventMenuAddonModal from '@/components/App/Events/MenuAddons/AddModal';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const EventMenuAddons = ({ eventMenuAddOnsData }) => {
    const [open, setOpen] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAddon, setEditingAddon] = useState(null);
    const [eventMenuAddons, setEventMenuAddons] = useState(eventMenuAddOnsData || []);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [addonToDelete, setAddonToDelete] = useState(null);
    const { props } = usePage();
    const csrfToken = props._token;

    const handleAdd = () => {
        setEditingAddon(null);
        setModalOpen(true);
    };

    const handleEdit = (addon) => {
        setEditingAddon(addon);
        setModalOpen(true);
    };

    const confirmDelete = (addon) => {
        setAddonToDelete(addon);
        setDeleteDialogOpen(true);
    };

    const cancelDelete = () => {
        setAddonToDelete(null);
        setDeleteDialogOpen(false);
    };

    const handleDelete = async () => {
        if (!addonToDelete) return;

        try {
            await axios.delete(route('event-menu-addon.destroy', addonToDelete.id), {
                headers: { 'X-CSRF-TOKEN': csrfToken },
            });
            setEventMenuAddons((prev) => prev.filter((addon) => addon.id !== addonToDelete.id));
            enqueueSnackbar('Event Menu Addon deleted successfully.', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Failed to delete: ' + (error.response?.data?.message || error.message), {
                variant: 'error',
            });
        } finally {
            cancelDelete();
        }
    };

    const handleSuccess = (data) => {
        setEventMenuAddons((prev) => {
            const exists = prev.find((p) => p.id === data.id);
            return exists ? prev.map((p) => (p.id === data.id ? data : p)) : [...prev, data];
        });
        setModalOpen(false);
        setEditingAddon(null);
    };

    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <Box
                sx={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                    backgroundColor: '#F6F6F6',
                    minHeight: '100vh',
                    padding: '20px',
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }} onClick={() => router.visit(route('events.manage'))}>
                        <IconButton>
                            <ArrowBackIcon sx={{ color: '#555' }} />
                        </IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 500, color: '#333' }}>
                            Event Menu Addons
                        </Typography>
                    </Box>
                    <Button variant="contained" startIcon={<AddIcon />} sx={{ backgroundColor: '#003366', textTransform: 'none' }} onClick={handleAdd}>
                        Add Addon
                    </Button>
                </Box>

                <TableContainer component={Paper} style={{ boxShadow: 'none' }}>
                    <Table>
                        <TableHead>
                            <TableRow style={{ backgroundColor: '#E5E5EA', height: '60px' }}>
                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>#</TableCell>
                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Event Menu Addon</TableCell>
                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Price</TableCell>
                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Status</TableCell>
                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Action</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {eventMenuAddons.length > 0 ? (
                                eventMenuAddons.map((addon, index) => (
                                    <TableRow key={addon.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <TableCell sx={{ color: '#7F7F7F', fontSize: '14px' }}>{index + 1}</TableCell>
                                        <TableCell sx={{ color: '#7F7F7F', fontSize: '14px' }}>{addon.name}</TableCell>
                                        <TableCell sx={{ color: '#7F7F7F', fontSize: '14px' }}>{addon.amount}</TableCell>
                                        <TableCell sx={{ color: '#7F7F7F', fontSize: '14px', textTransform: 'capitalize' }}>{addon.status}</TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleEdit(addon)} size="small" title="Edit">
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton onClick={() => confirmDelete(addon)} size="small" title="Delete">
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 3, color: '#999' }}>
                                        No Event Menu Addons found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <AddEventMenuAddonModal open={modalOpen} handleClose={() => setModalOpen(false)} eventMenuAddon={editingAddon} onSuccess={handleSuccess} />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={cancelDelete} aria-labelledby="delete-dialog-title">
                <DialogTitle id="delete-dialog-title">Delete Event Menu Addon</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete <strong>{addonToDelete?.name}</strong>?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelDelete}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default EventMenuAddons;
