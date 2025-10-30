import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Typography, IconButton, Box, Grid, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import AddEventModal from '@/components/App/Events/Charges/AddModal';


const EventChargesType = ({ eventChargesData }) => {
    // const [open, setOpen] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [roomCharges, setRoomCharges] = useState(eventChargesData || []);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState(null);
    const { props } = usePage();
    const csrfToken = props._token;

    const handleAdd = () => {
        setEditingRoom(null);
        setModalOpen(true);
    };

    const handleEdit = (event) => {
        setEditingRoom(event);
        setModalOpen(true);
    };

    const confirmDelete = (event) => {
        setRoomToDelete(event);
        setDeleteDialogOpen(true);
    };

    const cancelDelete = () => {
        setRoomToDelete(null);
        setDeleteDialogOpen(false);
    };

    const handleDelete = async () => {
        if (!roomToDelete) return;

        try {
            await axios.delete(route('event-charges-type.destroy', roomToDelete.id), {
                headers: { 'X-CSRF-TOKEN': csrfToken },
            });
            setRoomCharges((prev) => prev.filter((type) => type.id !== roomToDelete.id));
            enqueueSnackbar('Event Charge Type deleted successfully.', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Failed to delete: ' + (error.response?.data?.message || error.message), {
                variant: 'error',
            });
        } finally {
            cancelDelete();
        }
    };

    const handleSuccess = (data) => {
        setRoomCharges((prev) => {
            const exists = prev.find((p) => p.id === data.id);
            return exists ? prev.map((p) => (p.id === data.id ? data : p)) : [...prev, data];
        });
        setModalOpen(false);
        setEditingRoom(null);
    };

    return (
        <>
            {/* <SideNav open={open} setOpen={setOpen} /> */}
            <Box
                sx={{
                    minHeight: '100vh',
                    padding: '20px',
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }} onClick={() => router.visit(route('rooms.manage'))}>
                        <IconButton>
                            <ArrowBackIcon sx={{ color: '#555' }} />
                        </IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 500, color: '#333' }}>
                            Event Charges
                        </Typography>
                    </Box>
                    <Button variant="contained" startIcon={<AddIcon />} sx={{ backgroundColor: '#003366', textTransform: 'none' }} onClick={handleAdd}>
                        Add Charge
                    </Button>
                </Box>

                <TableContainer component={Paper} style={{ boxShadow: 'none' }}>
                    <Table>
                        <TableHead>
                            <TableRow style={{ backgroundColor: '#E5E5EA', height: '60px' }}>
                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>#</TableCell>
                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Event Charge Type</TableCell>
                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Amount</TableCell>
                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Status</TableCell>
                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Action</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {roomCharges.length > 0 ? (
                                roomCharges.map((type, index) => (
                                    <TableRow key={type.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <TableCell sx={{ color: '#7F7F7F', fontSize: '14px' }}>{index + 1}</TableCell>
                                        <TableCell sx={{ color: '#7F7F7F', fontSize: '14px' }}>{type.name}</TableCell>
                                        <TableCell sx={{ color: '#7F7F7F', fontSize: '14px' }}>{type.amount}</TableCell>
                                        <TableCell sx={{ color: '#7F7F7F', fontSize: '14px', textTransform: 'capitalize' }}>{type.status}</TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleEdit(type)} size="small" title="Edit">
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton onClick={() => confirmDelete(type)} size="small" title="Delete">
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 3, color: '#999' }}>
                                        No Event Charges found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <AddEventModal open={modalOpen} handleClose={() => setModalOpen(false)} eventChargesType={editingRoom} onSuccess={handleSuccess} />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={cancelDelete} aria-labelledby="delete-dialog-title">
                <DialogTitle id="delete-dialog-title">Delete Event Charge Type</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete <strong>{roomToDelete?.name}</strong>?
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

export default EventChargesType;
