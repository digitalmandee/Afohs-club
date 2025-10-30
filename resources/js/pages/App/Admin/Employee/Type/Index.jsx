import React, { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { MdArrowBackIos } from 'react-icons/md';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Pagination, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Box } from '@mui/material';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { enqueueSnackbar } from 'notistack';


const Management = () => {
    const { props } = usePage();
    const { employeeTypes } = props; // comes from Laravel

    // const [open, setOpen] = useState(true);

    const [isSaving, setIsSaving] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [editItem, setEditItem] = useState(null);
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleOpen = (employeeType = null) => {
        if (employeeType) {
            setEditItem(employeeType);
            setName(employeeType.name);
        } else {
            setEditItem(null);
            setName('');
        }
        setError('');
        setOpenDialog(true);
    };

    const handleClose = () => {
        setOpenDialog(false);
        setError('');
        setName('');
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError('Employee type name is required');
            return;
        }
        setIsSaving(true);
        try {
            if (editItem) {
                await axios.put(`/api/employee-types/${editItem.id}`, { name });
                enqueueSnackbar('Employee Type updated successfully!', { variant: 'success' });
            } else {
                await axios.post('/api/employee-types', { name });
                enqueueSnackbar('Employee Type added successfully!', { variant: 'success' });
            }
            router.reload({ only: ['employeeTypes'] }); // reload just employee types
            handleClose();
        } catch (error) {
            enqueueSnackbar('Error saving employee type!', { variant: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const openDeleteDialog = (id) => {
        setDeleteId(id);
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setDeleteId(null);
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/employee-types/${deleteId}`);
            enqueueSnackbar('Employee Type deleted successfully!', { variant: 'success' });
            router.reload({ only: ['employeeTypes'] });
        } catch (error) {
            enqueueSnackbar('Error deleting employee type!', { variant: 'error' });
        } finally {
            closeDeleteDialog();
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
                <Box sx={{ px: 2, py: 2 }}>
                    <div className="container-fluid py-4">
                        {/* Header */}
                        <div className="row mb-4 align-items-center">
                            <div className="col-auto d-flex align-items-center">
                                <div onClick={() => router.visit(document.referrer || '/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                    <MdArrowBackIos style={{ fontSize: '20px' }} />
                                </div>
                                <Typography variant="h5" className="mb-0 ms-2" style={{ fontSize: '30px', color: '#202224' }}>
                                    Employee Types
                                </Typography>
                            </div>
                            <div className="col-auto ms-auto">
                                <Button variant="contained" sx={{ bgcolor: '#0a3d62', borderRadius: '10px', '&:hover': { bgcolor: '#0a3d62' } }} onClick={() => handleOpen()}>
                                    New Employee Type
                                </Button>
                            </div>
                        </div>

                        {/* Table */}
                        <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                            <Table>
                                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {employeeTypes.data.length > 0 ? (
                                        employeeTypes.data.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{item.name}</TableCell>
                                                <TableCell>
                                                    <Button onClick={() => handleOpen(item)} color="primary">
                                                        Edit
                                                    </Button>
                                                    <Button onClick={() => openDeleteDialog(item.id)} color="secondary">
                                                        Delete
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={2} align="center">
                                                No employee types found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        <div className="d-flex justify-content-end mt-4">
                            <Pagination count={employeeTypes.last_page} page={employeeTypes.current_page} onChange={(e, page) => router.get(route('employees.employee-types'), { page })} />
                        </div>
                    </div>
                </Box>
            {/* </div> */}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog} maxWidth="xs" fullWidth>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>Are you sure you want to delete this employee type?</DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} variant="contained" color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add/Edit Employee Type Modal */}
            <Dialog open={openDialog} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>{editItem ? 'Edit Employee Type' : 'New Employee Type'}</DialogTitle>
                <DialogContent>
                    <TextField fullWidth label="Employee Type Name" variant="outlined" margin="normal" value={name} onChange={(e) => setName(e.target.value)} error={!!error} helperText={error} />
                    <DialogActions>
                        <Button
                            onClick={handleClose}
                            color="secondary"
                            sx={{
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #000000',
                                color: '#000000',
                                '&:hover': { backgroundColor: '#f5f5f5', border: '1px solid #000000' },
                            }}
                        >
                            Cancel
                        </Button>
                        <Button sx={{ bgcolor: '#0a3d62' }} onClick={handleSubmit} variant="contained" disabled={isSaving}>
                            {editItem ? 'Update' : 'Save'}
                        </Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Management;
