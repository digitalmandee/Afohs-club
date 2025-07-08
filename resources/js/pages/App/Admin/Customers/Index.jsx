import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Typography, IconButton, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const ManageCustomer = ({ customerData }) => {
    const [open, setOpen] = useState(true);
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }} onClick={() => router.visit(route('dashboard'))}>
                        <IconButton>
                            <ArrowBackIcon sx={{ color: '#555' }} />
                        </IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 500, color: '#333' }}>
                            Customers
                        </Typography>
                    </Box>
                    <Button variant="contained" sx={{ backgroundColor: '#003366', textTransform: 'none' }} onClick={() => router.visit(route('guests.create'))}>
                        Add Customer
                    </Button>
                </Box>

                <TableContainer component={Paper} style={{ boxShadow: 'none' }}>
                    <Table>
                        <TableHead>
                            <TableRow style={{ backgroundColor: '#E5E5EA', height: '60px' }}>
                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>#</TableCell>
                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Customer No</TableCell>
                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Name</TableCell>
                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Email</TableCell>
                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Action</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {customers.length > 0 ? (
                                customers.map((customer, index) => (
                                    <TableRow key={customer.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <TableCell sx={{ color: '#7F7F7F', fontSize: '14px' }}>{index + 1}</TableCell>
                                        <TableCell sx={{ color: '#7F7F7F', fontSize: '14px' }}>{customer.customer_no}</TableCell>
                                        <TableCell sx={{ color: '#7F7F7F', fontSize: '14px' }}>{customer.name}</TableCell>
                                        <TableCell sx={{ color: '#7F7F7F', fontSize: '14px' }}>{customer.email}</TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => router.visit(route('guests.edit', customer.id))} size="small" title="Edit">
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton onClick={() => confirmDelete(customer)} size="small" title="Delete">
                                                <DeleteIcon fontSize="small" />
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
