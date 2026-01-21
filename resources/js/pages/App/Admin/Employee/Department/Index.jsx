import React, { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { MdArrowBackIos } from 'react-icons/md';
import { Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Pagination, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Snackbar, Alert, Box, Switch } from '@mui/material';
import axios from 'axios';
import { ArrowBack } from '@mui/icons-material';
import { Search, FilterAlt, Visibility, Delete } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import { enqueueSnackbar } from 'notistack';
import { FaEdit } from 'react-icons/fa';

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

    const handleStatusChange = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            await axios.post(route('employees.departments.change-status', id), { status: newStatus });
            enqueueSnackbar('Status updated successfully!', { variant: 'success' });
            router.reload({ only: ['departments'] });
        } catch (error) {
            enqueueSnackbar('Error updating status!', { variant: 'error' });
        }
    };

    return (
        <>
            {/* <SideNav open={open} setOpen={setOpen} /> */}
            <div
                style={{
                    minHeight: '100vh',
                    backgroundColor: '#f5f5f5',
                }}
            >
                <div className="container-fluid p-4">
                    {/* Header */}
                    <div className="row align-items-center">
                        <div className="col-auto d-flex align-items-center">
                            {/* <div onClick={() => window.history.back()} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <IconButton>
                                    <ArrowBack sx={{ color: '#063455' }} />
                                </IconButton>
                            </div> */}
                            <Typography
                                style={{
                                    fontWeight: '700',
                                    fontSize: '30px',
                                    color: '#063455',
                                }}
                            >
                                Departments
                            </Typography>
                        </div>
                        <div className="col-auto ms-auto">
                            <Button variant="outlined" sx={{ borderRadius: '16px', height: 35, textTransform: 'none', borderColor: '#063455', color: '#063455', marginRight: 2 }} onClick={() => router.visit(route('employees.departments.trashed'))}>
                                Trashed
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={
                                    <span
                                        style={{
                                            fontSize: '1.5rem',
                                            marginBottom: 5,
                                        }}
                                    >
                                        +
                                    </span>
                                }
                                sx={{ bgcolor: '#063455', borderRadius: '16px', height: 35, textTransform: 'none' }}
                                onClick={() => handleOpen()}
                            >
                                New Department
                            </Button>
                        </div>
                    </div>
                    <Typography sx={{ color: '#063455', fontSize: '15px', fontWeight: '600' }}>Manage all primary departments within the club</Typography>

                    {/* Table */}
                    <TableContainer component={Paper} sx={{ boxShadow: 'none', marginTop: '2rem', overflowX: 'auto', borderRadius: '16px' }}>
                        <Table>
                            <TableHead sx={{ bgcolor: '#063455' }}>
                                <TableRow>
                                    <TableCell style={{ color: '#fff', fontWeight: '600' }}>Name</TableCell>
                                    <TableCell style={{ color: '#fff', fontWeight: '600' }}>Total Employees</TableCell>
                                    <TableCell style={{ color: '#fff', fontWeight: '600' }}>Status</TableCell>
                                    <TableCell style={{ color: '#fff', fontWeight: '600' }}>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {departments.data.length > 0 ? (
                                    departments.data.map((department) => (
                                        <TableRow key={department.id}>
                                            <TableCell style={{ color: '#7f7f7f', fontWeight: '400', fontSize: '14px' }}>{department.name}</TableCell>
                                            <TableCell style={{ color: '#7f7f7f', fontWeight: '400', fontSize: '14px' }}>{department.employees_count || 0}</TableCell>
                                            <TableCell>
                                                <Switch checked={department.status === 'active'} onChange={() => handleStatusChange(department.id, department.status)} color="primary" />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton onClick={() => handleOpen(department)} color="primary">
                                                    <FaEdit size={18} style={{ marginRight: 10, color: '#f57c00' }} />
                                                </IconButton>
                                                <Button startIcon={<Delete />} onClick={() => openDeleteDialog(department.id)} color="error" />
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
            </div>

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
                                // backgroundColor: '#FFFFFF',
                                border: '1px solid #063455',
                                color: '#063455',
                                textTransform: 'none',
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            sx={{
                                bgcolor: '#063455',
                                textTransform: 'none',
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
