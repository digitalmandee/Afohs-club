import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Typography, IconButton, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { FaEdit } from 'react-icons/fa';
import Tooltip from '@mui/material/Tooltip';
// const drawerWidthOpen = 240;
// const drawerWidthClosed = 110;

const ManageCustomer = ({ customerData }) => {
    // const [open, setOpen] = useState(true);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [customers, setCustomers] = useState(customerData || []);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState(null);
    const { props } = usePage();
    const csrfToken = props._token;

    const handleEdit = (customer) => {
        // Open your own modal or navigate to edit page if needed
        // enqueueSnackbar('Edit customer logic to be implemented.', { variant: 'info' });
    };

    const confirmDelete = (customer) => {
        setCustomerToDelete(customer);
        setDeleteDialogOpen(true);
    };

    const cancelDelete = () => {
        setCustomerToDelete(null);
        setDeleteDialogOpen(false);
    };

    const handleDelete = async () => {
        if (!customerToDelete) return;

        try {
            await axios.delete(route('guests.destroy', customerToDelete.id), {
                headers: { 'X-CSRF-TOKEN': csrfToken },
            });
            setCustomers((prev) => prev.filter((c) => c.id !== customerToDelete.id));
            enqueueSnackbar('Customer deleted successfully.', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Failed to delete: ' + (error.response?.data?.message || error.message), {
                variant: 'error',
            });
        } finally {
            cancelDelete();
        }
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }} onClick={() => router.visit(route('dashboard'))}>
                        <IconButton onClick={() => window.history.back()}>
                            <ArrowBackIcon sx={{ color: '#063455' }} />
                        </IconButton>
                        <Typography sx={{ fontWeight: 700, fontSize: '30px', color: '#063455' }}>
                            Customers
                        </Typography>
                    </Box>

                    <Button variant="contained"
                        startIcon={<span style={{
                            fontSize: '1.5rem', padding: 0, marginBottom: 5
                        }}>+</span>}
                        sx={{ backgroundColor: '#063455', borderRadius: '16px', height: 35 }} onClick={() => router.visit(route('guests.create'))}>
                        Add Customer
                    </Button>
                </Box>

                <Typography style={{ color: '#063455', fontSize: '15px', fontWeight: '600' }}>
                    View and manage registered guests currently staying or scheduled to arrive
                </Typography>

                <TableContainer component={Paper} style={{ boxShadow: 'none', overflowX: 'auto', borderRadius: '16px', marginTop:'2rem' }}>
                    <Table>
                        <TableHead>
                            <TableRow style={{ backgroundColor: '#063455', height: '60px' }}>
                                {/* <TableCell sx={{ color: '#fff', fontSize: '16px', fontWeight: 600 }}>#</TableCell> */}
                                <TableCell sx={{ color: '#fff', fontSize: '16px', fontWeight: 600 }}>Customer No</TableCell>
                                <TableCell sx={{ color: '#fff', fontSize: '16px', fontWeight: 600 }}>Name</TableCell>
                                <TableCell sx={{ color: '#fff', fontSize: '16px', fontWeight: 600 }}>Email</TableCell>
                                <TableCell sx={{ color: '#fff', fontSize: '16px', fontWeight: 600 }}>Action</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {customers.length > 0 ? (
                                customers.map((customer, index) => (
                                    <TableRow key={customer.id} style={{ borderBottom: '1px solid #eee' }}>
                                        {/* <TableCell sx={{ color: '#7F7F7F', fontSize: '14px', fontWeight: '400' }}>{index + 1}</TableCell> */}
                                        <TableCell sx={{ color: '#7F7F7F', fontSize: '14px', fontWeight: '400' }}>{customer.customer_no}</TableCell>
                                        <TableCell sx={{ color: '#7F7F7F', fontSize: '14px', fontWeight: '400' }}>{customer.name}</TableCell>
                                        {/* <TableCell sx={{ color: '#7F7F7F', fontSize: '14px', fontWeight:'400' }}>{customer.email}</TableCell> */}
                                        <TableCell sx={{
                                            color: '#7F7F7F',
                                            fontSize: '14px',
                                            fontWeight: '400',
                                            maxWidth: '150px',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            <Tooltip title={customer.email} placement="top">
                                                <span>{customer.email}</span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => router.visit(route('guests.edit', customer.id))} size="small" title="Edit">
                                                <FaEdit size={16} style={{ marginRight: 8, color: '#f57c00' }} />
                                            </IconButton>
                                            <IconButton onClick={() => confirmDelete(customer)} size="small" title="Delete">
                                                <DeleteIcon fontSize="small" sx={{ color: '#d32f2f' }} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 3, color: '#999' }}>
                                        No customers found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={cancelDelete} aria-labelledby="delete-dialog-title">
                <DialogTitle id="delete-dialog-title">Delete Customer</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete <strong>{customerToDelete?.name}</strong>?
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

export default ManageCustomer;
