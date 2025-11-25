import React, { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { MdArrowBackIos } from 'react-icons/md';
import { Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Pagination, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Snackbar, Alert, Box, Autocomplete } from '@mui/material';
import axios from 'axios';
import { ArrowBack } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import { enqueueSnackbar } from 'notistack';

const Management = () => {
    const { props } = usePage();
    const { subdepartments } = props; // comes from Laravel

    const [isSaving, setIsSaving] = useState(false);
    const [openSubdepartment, setOpenSubdepartment] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteSubdepartmentId, setDeleteSubdepartmentId] = useState(null);
    const [editSubdepartment, setEditSubdepartment] = useState(null);
    const [name, setName] = useState('');
    const [department, setDepartment] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [departmentSearchTerm, setDepartmentSearchTerm] = useState('');
    const [error, setError] = useState('');

    // Fetch departments for dropdown
    useEffect(() => {
        axios
            .get(route('api.departments.listAll', { type: 'search', query: departmentSearchTerm }))
            .then((res) => setDepartments(res.data.results))
            .catch((err) => console.error('Error fetching departments', err));
    }, [departmentSearchTerm]);

    const handleOpen = (subdepartment = null) => {
        if (subdepartment) {
            setEditSubdepartment(subdepartment);
            setName(subdepartment.name);
            setDepartment(subdepartment.department);
        } else {
            setEditSubdepartment(null);
            setName('');
            setDepartment(null);
        }
        setError('');
        setOpenSubdepartment(true);
    };

    const handleClose = () => {
        setOpenSubdepartment(false);
        setError('');
        setName('');
        setDepartment(null);
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError('Subdepartment name is required');
            return;
        }
        if (!department) {
            setError('Department is required');
            return;
        }
        setIsSaving(true);
        try {
            if (editSubdepartment) {
                await axios.put(`/api/subdepartments/${editSubdepartment.id}`, { name, department_id: department.id });
                enqueueSnackbar('Subdepartment updated successfully!', { variant: 'success' });
            } else {
                await axios.post('/api/subdepartments', { name, department_id: department.id });
                enqueueSnackbar('Subdepartment added successfully!', { variant: 'success' });
            }
            router.reload({ only: ['subdepartments'] }); // reload just subdepartments
            handleClose();
        } catch (error) {
            enqueueSnackbar('Error saving subdepartment!', { variant: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const openDeleteDialog = (subdepartmentId) => {
        setDeleteSubdepartmentId(subdepartmentId);
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setDeleteSubdepartmentId(null);
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/subdepartments/${deleteSubdepartmentId}`);
            enqueueSnackbar('Subdepartment deleted successfully!', { variant: 'success' });
            router.reload({ only: ['subdepartments'] });
        } catch (error) {
            enqueueSnackbar('Error deleting subdepartment!', { variant: 'error' });
        } finally {
            closeDeleteDialog();
        }
    };

    return (
        <>
            <div
                style={{
                    minHeight: '100vh',
                    backgroundColor: '#F6F6F6',
                }}
            >
                <div className="container-fluid p-4">
                    {/* Header */}
                    <div className="row mb-4 align-items-center">
                        <div className="col-auto d-flex align-items-center">
                            <div onClick={() => window.history.back()} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <IconButton>
                                    <ArrowBack sx={{ color: '#063455' }} />
                                </IconButton>
                            </div>
                            <Typography
                                variant="h5"
                                className="mb-0"
                                style={{
                                    fontWeight: '600',
                                    color: '#063455',
                                }}
                            >
                                Sub Departments
                            </Typography>
                        </div>
                        <div className="col-auto ms-auto">
                            <Button variant="contained" sx={{ bgcolor: '#0a3d62', borderRadius: '4px', '&:hover': { bgcolor: '#0a3d62' } }} onClick={() => handleOpen()}>
                                New Subdepartment
                            </Button>
                        </div>
                    </div>

                    {/* Table */}
                    <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                        <Table>
                            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                                <TableRow>
                                    <TableCell>Subdepartment Name</TableCell>
                                    <TableCell>Department</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {subdepartments.data.length > 0 ? (
                                    subdepartments.data.map((subdepartment) => (
                                        <TableRow key={subdepartment.id}>
                                            <TableCell>{subdepartment.name}</TableCell>
                                            <TableCell>{subdepartment.department?.name || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Button onClick={() => handleOpen(subdepartment)} color="primary">
                                                    Edit
                                                </Button>
                                                <Button onClick={() => openDeleteDialog(subdepartment.id)} color="secondary">
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center">
                                            No subdepartments found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination */}
                    <div className="d-flex justify-content-end mt-4">
                        <Pagination count={subdepartments.last_page} page={subdepartments.current_page} onChange={(e, page) => router.get(route('employees.subdepartments'), { page })} />
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog} maxWidth="xs" fullWidth>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>Are you sure you want to delete this subdepartment?</DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} variant="contained" color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add/Edit Subdepartment Modal */}
            <Dialog open={openSubdepartment} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>{editSubdepartment ? 'Edit Subdepartment' : 'New Subdepartment'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                            Department*
                        </Typography>
                        <Autocomplete options={departments} getOptionLabel={(option) => option.name} value={department} onInputChange={(event, value) => setDepartmentSearchTerm(value)} onChange={(event, value) => setDepartment(value)} renderInput={(params) => <TextField {...params} label="Search Department" variant="outlined" error={!!error && !department} />} />
                    </Box>
                    <TextField fullWidth label="Subdepartment Name" variant="outlined" margin="normal" value={name} onChange={(e) => setName(e.target.value)} error={!!error && !name.trim()} helperText={error} />
                    <DialogActions>
                        <Button
                            onClick={handleClose}
                            color="secondary"
                            sx={{
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #000000',
                                color: '#000000',
                                '&:hover': {
                                    backgroundColor: '#f5f5f5',
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
                            {editSubdepartment ? 'Update' : 'Save'}
                        </Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Management;
