import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Typography, IconButton, Box, Grid, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import AddEventMenuModal from '@/components/App/Events/Menu/AddModal';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const EventMenuManage = ({ eventMenusData }) => {
    const [open, setOpen] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingMenu, setEditingMenu] = useState(null);
    const [eventMenus, setEventMenus] = useState(eventMenusData || []);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [menuCategoryToDelete, setMenuCategoryToDelete] = useState(null);
    const { props } = usePage();
    const csrfToken = props._token;

    const handleAdd = () => {
        setEditingMenu(null);
        setModalOpen(true);
    };

    const handleEdit = (menuCategory) => {
        setEditingMenu(menuCategory);
        setModalOpen(true);
    };

    const confirmDelete = (menuCategory) => {
        setMenuCategoryToDelete(menuCategory);
        setDeleteDialogOpen(true);
    };

    const cancelDelete = () => {
        setMenuCategoryToDelete(null);
        setDeleteDialogOpen(false);
    };

    const handleDelete = async () => {
        if (!menuCategoryToDelete) return;

        try {
            await axios.delete(route('event-menu-category.destroy', menuCategoryToDelete.id), {
                headers: { 'X-CSRF-TOKEN': csrfToken },
            });
            setEventMenus((prev) => prev.filter((menuCategory) => menuCategory.id !== menuCategoryToDelete.id));
            enqueueSnackbar('Event Menu Category deleted successfully.', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Failed to delete: ' + (error.response?.data?.message || error.message), {
                variant: 'error',
            });
        } finally {
            cancelDelete();
        }
    };

    const handleSuccess = (data) => {
        setEventMenus((prev) => {
            const exists = prev.find((p) => p.id === data.id);
            return exists ? prev.map((p) => (p.id === data.id ? data : p)) : [...prev, data];
        });
        setModalOpen(false);
        setEditingMenu(null);
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }} onClick={() => router.visit(route('events.dashboard'))}>
                        <IconButton>
                            <ArrowBackIcon sx={{ color: '#555' }} />
                        </IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 500, color: '#333' }}>
                            Event Menus
                        </Typography>
                    </Box>

                    <Button variant="contained" startIcon={<AddIcon />} sx={{ backgroundColor: '#003366', textTransform: 'none' }} onClick={() => router.visit(route('event-menu.create'))}>
                        Add Menu
                    </Button>
                </Box>

                <TableContainer component={Paper} style={{ boxShadow: 'none' }}>
                    <Table>
                        <TableHead>
                            <TableRow style={{ backgroundColor: '#E5E5EA', height: '60px' }}>
                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>#</TableCell>
                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Menu Name</TableCell>
                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Total</TableCell>
                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Action</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {eventMenus.length > 0 ? (
                                eventMenus.map((menuCategory, index) => (
                                    <TableRow key={menuCategory.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <TableCell sx={{ color: '#7F7F7F', fontSize: '14px' }}>{index + 1}</TableCell>
                                        <TableCell sx={{ color: '#7F7F7F', fontSize: '14px' }}>{menuCategory.name}</TableCell>
                                        <TableCell sx={{ color: '#7F7F7F', fontSize: '14px', textTransform: 'capitalize' }}>{menuCategory.status}</TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => router.visit(route('event-menu.edit', menuCategory.id))} size="small" title="Edit">
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton onClick={() => confirmDelete(menuCategory)} size="small" title="Delete">
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 3, color: '#999' }}>
                                        No Event Menus found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={cancelDelete} aria-labelledby="delete-dialog-title">
                <DialogTitle id="delete-dialog-title">Delete Event Menu Category</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete <strong>{menuCategoryToDelete?.name}</strong>?
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

export default EventMenuManage;
