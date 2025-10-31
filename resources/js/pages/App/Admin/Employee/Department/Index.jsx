import React, { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { MdArrowBackIos } from 'react-icons/md';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Pagination, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Snackbar, Alert, Box } from '@mui/material';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { enqueueSnackbar } from 'notistack';


const Management = () => {
    const { props } = usePage();
    const { departments } = props; // comes from Laravel

    // const [open, setOpen] = useState(true);

    const [isSaving, setIsSaving] = useState(false);
    const [openDepartment, setOpenDepartment] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteDepartmentId, setDeleteDepartmentId] = useState(null);
    const [editDepartment, setEditDepartment] = useState(null);
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleOpen = (department = null) => {
        if (department) {
            setEditDepartment(department);
            setName(department.name);
        } else {
            setEditDepartment(null);
            setName('');
        }
        setError('');
        setOpenDepartment(true);
    };

    const handleClose = () => {
        setOpenDepartment(false);
        setError('');
        setName('');
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError('Department name is required');
            return;
        }
        setIsSaving(true);
        try {
            if (editDepartment) {
                await axios.put(`/api/departments/${editDepartment.id}`, { name });
                enqueueSnackbar('Department updated successfully!', { variant: 'success' });
            } else {
                await axios.post('/api/departments', { name });
                enqueueSnackbar('Department added successfully!', { variant: 'success' });
            }
            router.reload({ only: ['departments'] }); // reload just departments
            handleClose();
        } catch (error) {
            enqueueSnackbar('Error saving department!', { variant: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const openDeleteDialog = (departmentId) => {
        setDeleteDepartmentId(departmentId);
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setDeleteDepartmentId(null);
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/departments/${deleteDepartmentId}`);
            enqueueSnackbar('Department deleted successfully!', { variant: 'success' });
            router.reload({ only: ['departments'] });
        } catch (error) {
            enqueueSnackbar('Error deleting department!', { variant: 'error' });
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
                <Box
                    sx={{
                        px: 2,
                        py: 2,
                    }}
                >
                    <div className="container-fluid py-4">
                        {/* Header */}
                        <div className="row mb-4 align-items-center">
                            <div className="col-auto d-flex align-items-center">
                                <div onClick={() => router.visit(document.referrer || '/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                    <MdArrowBackIos style={{ fontSize: '20px' }} />
                                </div>
                                <Typography
                                    variant="h5"
                                    className="mb-0 ms-2"
                                    style={{
                                        // fontWeight:'700',
                                        fontSize: '30px',
                                        color: '#202224',
                                    }}
                                >
                                    Departments
                                </Typography>
                            </div>
                            <div className="col-auto ms-auto">
                                <Button variant="contained" sx={{ bgcolor: '#0a3d62', borderRadius: '10px', '&:hover': { bgcolor: '#0a3d62' } }} onClick={() => handleOpen()}>
                                    New Department
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
                                    {departments.data.length > 0 ? (
                                        departments.data.map((department) => (
                                            <TableRow key={department.id}>
                                                <TableCell>{department.name}</TableCell>
                                                <TableCell>
                                                    <Button onClick={() => handleOpen(department)} color="primary">
                                                        Edit
                                                    </Button>
                                                    <Button onClick={() => openDeleteDialog(department.id)} color="secondary">
                                                        Delete
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={2} align="center">
                                                No departments found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        <div className="d-flex justify-content-end mt-4">
                            <Pagination count={departments.last_page} page={departments.current_page} onChange={(e, page) => router.get(route('employees.departments'), { page })} />
                        </div>
                    </div>
                </Box>
            {/* </div> */}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog} maxWidth="xs" fullWidth>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>Are you sure you want to delete this department?</DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} variant="contained" color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add/Edit Department Modal */}
            <Dialog open={openDepartment} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>{editDepartment ? 'Edit Department' : 'New Department'}</DialogTitle>
                <DialogContent>
                    <TextField fullWidth label="Department Name" variant="outlined" margin="normal" value={name} onChange={(e) => setName(e.target.value)} error={!!error} helperText={error} />
                    <DialogActions>
                        <Button
                            onClick={handleClose}
                            color="secondary"
                            sx={{
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #000000',
                                color: '#000000', // Ensures text is visible on white
                                '&:hover': {
                                    backgroundColor: '#f5f5f5', // Optional: light gray on hover
                                    border: '1px solid #000000',
                                },
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            sx={{
                                bgcolor: '#0a3d62',
                            }}
                            onClick={handleSubmit}
                            variant="contained"
                            disabled={isSaving}
                            loading={isSaving}
                        >
                            {editDepartment ? 'Update' : 'Save'}
                        </Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Management;
