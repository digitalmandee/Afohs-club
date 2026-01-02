import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Typography, IconButton, Box, Grid, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import AddEventMenuTypeModal from '@/components/App/Events/MenuType/AddModal';
import { FaEdit } from 'react-icons/fa';

const EventMenuTypes = ({ eventMenuTypesData }) => {
    // const [open, setOpen] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingMenuType, setEditingMenuType] = useState(null);
    const [eventMenuTypes, setEventMenuTypes] = useState(eventMenuTypesData || []);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [menuTypeToDelete, setMenuTypeToDelete] = useState(null);
    const { props } = usePage();
    const csrfToken = props._token;

    const handleAdd = () => {
        setEditingMenuType(null);
        setModalOpen(true);
    };

    const handleEdit = (menuType) => {
        setEditingMenuType(menuType);
        setModalOpen(true);
    };

    const confirmDelete = (menuType) => {
        setMenuTypeToDelete(menuType);
        setDeleteDialogOpen(true);
    };

    const cancelDelete = () => {
        setMenuTypeToDelete(null);
        setDeleteDialogOpen(false);
    };

    const handleDelete = async () => {
        if (!menuTypeToDelete) return;

        try {
            await axios.delete(route('event-menu-type.destroy', menuTypeToDelete.id), {
                headers: { 'X-CSRF-TOKEN': csrfToken },
            });
            setEventMenuTypes((prev) => prev.filter((menuType) => menuType.id !== menuTypeToDelete.id));
            enqueueSnackbar('Event Menu Type deleted successfully.', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Failed to delete: ' + (error.response?.data?.message || error.message), {
                variant: 'error',
            });
        } finally {
            cancelDelete();
        }
    };

    const handleSuccess = (data) => {
        setEventMenuTypes((prev) => {
            const exists = prev.find((p) => p.id === data.id);
            return exists ? prev.map((p) => (p.id === data.id ? data : p)) : [...prev, data];
        });
        setModalOpen(false);
        setEditingMenuType(null);
    };

    return (
        <>
            {/* <SideNav open={open} setOpen={setOpen} /> */}
            <Box
                sx={{
                    minHeight: '100vh',
                    backgroundColor: '#f5f5f5',
                    padding: '20px',
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {/* <IconButton onClick={() => router.visit(route('events.dashboard'))}>
                            <ArrowBackIcon sx={{ color: '#063455' }} />
                        </IconButton> */}
                        <Typography sx={{ fontWeight: 700, color: '#063455', fontSize: '30px' }}>
                            Menu Types
                        </Typography>
                    </Box>
                    <Button variant="contained" startIcon={<AddIcon />} sx={{ backgroundColor: '#063455', height: 35, borderRadius: '16px', textTransform:'none' }} onClick={handleAdd}>
                        Add Menu Type
                    </Button>
                </Box>
                <Typography style={{ color: '#063455', fontSize: '15px', fontWeight: '600' }}>
                    Define menu formats such as Buffet, Hi-Tea, or Plated Service
                </Typography>

                <TableContainer component={Paper} style={{ boxShadow: 'none', borderRadius: '16px', marginTop:'2rem' }}>
                    <Table>
                        <TableHead>
                            <TableRow style={{ backgroundColor: '#063455', height: '30px' }}>
                                <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>#</TableCell>
                                <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Menu Type</TableCell>
                                <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Action</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {eventMenuTypes.length > 0 ? (
                                eventMenuTypes.map((menuType, index) => (
                                    <TableRow key={menuType.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <TableCell sx={{ color: '#000', fontSize: '14px', fontWeight:600 }}>{index + 1}</TableCell>
                                        <TableCell sx={{ color: '#7F7F7F', fontSize: '14px' }}>{menuType.name}</TableCell>
                                        <TableCell sx={{ color: '#7F7F7F', fontSize: '14px', textTransform: 'capitalize' }}>{menuType.status}</TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleEdit(menuType)} size="small" title="Edit">
                                                <FaEdit size={16} style={{ marginRight: 8, color: '#f57c00' }} />                                            </IconButton>
                                            <IconButton onClick={() => confirmDelete(menuType)} size="small" title="Delete">
                                                <DeleteIcon fontSize="small" color='error' />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 3, color: '#999' }}>
                                        No Event Menu Types found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <AddEventMenuTypeModal open={modalOpen} handleClose={() => setModalOpen(false)} eventMenuType={editingMenuType} onSuccess={handleSuccess} />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={cancelDelete} aria-labelledby="delete-dialog-title">
                <DialogTitle id="delete-dialog-title">Delete Event Menu Type</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete <strong>{menuTypeToDelete?.name}</strong>?
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

export default EventMenuTypes;
