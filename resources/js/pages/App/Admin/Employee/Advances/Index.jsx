import { useState } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AdminLayout from '@/layouts/AdminLayout';
import { Box, Card, CardContent, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, FormControl, InputLabel, Select, MenuItem, Grid, Chip, TextField, Pagination } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Check as CheckIcon, Close as CloseIcon, Payment as PaymentIcon } from '@mui/icons-material';

const formatCurrency = (amount) => `Rs ${parseFloat(amount || 0).toLocaleString()}`;

const getStatusColor = (status) => {
    const colors = { pending: 'warning', approved: 'info', rejected: 'error', paid: 'primary', deducted: 'success' };
    return colors[status] || 'default';
};

const Index = ({ advances, employees = [], stats = {}, filters = {} }) => {
    const [selectedEmployee, setSelectedEmployee] = useState(filters.employee_id || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

    const handleFilter = () => {
        router.get(
            route('employees.advances.index'),
            {
                employee_id: selectedEmployee || undefined,
                status: selectedStatus || undefined,
            },
            { preserveState: true },
        );
    };

    const handleApprove = (id) => {
        if (confirm('Approve this advance request?')) {
            router.post(route('employees.advances.approve', id));
        }
    };

    const handleReject = (id) => {
        if (confirm('Reject this advance request?')) {
            router.post(route('employees.advances.reject', id));
        }
    };

    const handleMarkPaid = (id) => {
        if (confirm('Mark this advance as paid (disbursed)?')) {
            router.post(route('employees.advances.mark-paid', id));
        }
    };

    const handleDelete = (id) => {
        if (confirm('Delete this advance request?')) {
            router.delete(route('employees.advances.destroy', id));
        }
    };

    return (
        <AdminLayout>
            <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ color: '#063455', fontWeight: 700 }}>
                        Employee Salary Advances
                    </Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => router.visit(route('employees.advances.create'))} sx={{ backgroundColor: '#063455' }}>
                        New Advance Request
                    </Button>
                </Box>

                {/* Stats Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6} sm={3}>
                        <Card sx={{ borderRadius: '12px', textAlign: 'center', p: 2 }}>
                            <Typography variant="body2" color="textSecondary">
                                Pending Requests
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 600, color: '#ff9800' }}>
                                {stats.pending_count || 0}
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Card sx={{ borderRadius: '12px', textAlign: 'center', p: 2 }}>
                            <Typography variant="body2" color="textSecondary">
                                Pending Amount
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#ff9800' }}>
                                {formatCurrency(stats.total_pending)}
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Card sx={{ borderRadius: '12px', textAlign: 'center', p: 2 }}>
                            <Typography variant="body2" color="textSecondary">
                                Approved Amount
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2196f3' }}>
                                {formatCurrency(stats.total_approved)}
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Card sx={{ borderRadius: '12px', textAlign: 'center', p: 2, backgroundColor: '#063455' }}>
                            <Typography variant="body2" sx={{ color: '#ccc' }}>
                                Outstanding Balance
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
                                {formatCurrency(stats.total_outstanding)}
                            </Typography>
                        </Card>
                    </Grid>
                </Grid>

                {/* Filters */}
                <Card sx={{ mb: 3, p: 2, borderRadius: '12px' }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Employee</InputLabel>
                                <Select value={selectedEmployee} label="Employee" onChange={(e) => setSelectedEmployee(e.target.value)}>
                                    <MenuItem value="">All Employees</MenuItem>
                                    {employees.map((emp) => (
                                        <MenuItem key={emp.id} value={emp.id}>
                                            {emp.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Status</InputLabel>
                                <Select value={selectedStatus} label="Status" onChange={(e) => setSelectedStatus(e.target.value)}>
                                    <MenuItem value="">All Status</MenuItem>
                                    <MenuItem value="pending">Pending</MenuItem>
                                    <MenuItem value="approved">Approved</MenuItem>
                                    <MenuItem value="rejected">Rejected</MenuItem>
                                    <MenuItem value="paid">Paid (Being Deducted)</MenuItem>
                                    <MenuItem value="deducted">Fully Deducted</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Button variant="contained" onClick={handleFilter} sx={{ backgroundColor: '#063455' }}>
                                Apply Filters
                            </Button>
                        </Grid>
                    </Grid>
                </Card>

                {/* Table */}
                <Card sx={{ borderRadius: '12px' }}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#063455' }}>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>#</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Employee</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Date</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }} align="right">
                                        Amount
                                    </TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Reason</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }} align="center">
                                        Months
                                    </TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }} align="right">
                                        Remaining
                                    </TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Status</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }} align="center">
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {advances.data?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                                            <Typography color="textSecondary">No advance requests found</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    advances.data?.map((advance, index) => (
                                        <TableRow key={advance.id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell sx={{ fontWeight: 500 }}>{advance.employee?.name}</TableCell>
                                            <TableCell>{advance.advance_date}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                                                {formatCurrency(advance.amount)}
                                            </TableCell>
                                            <TableCell>{advance.reason || '-'}</TableCell>
                                            <TableCell align="center">{advance.deduction_months}</TableCell>
                                            <TableCell align="right" sx={{ color: 'red' }}>
                                                {formatCurrency(advance.remaining_amount)}
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={advance.status} size="small" color={getStatusColor(advance.status)} />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                                    {advance.status === 'pending' && (
                                                        <>
                                                            <IconButton size="small" color="success" onClick={() => handleApprove(advance.id)} title="Approve">
                                                                <CheckIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton size="small" color="error" onClick={() => handleReject(advance.id)} title="Reject">
                                                                <CloseIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton size="small" onClick={() => router.visit(route('employees.advances.edit', advance.id))} title="Edit">
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </>
                                                    )}
                                                    {advance.status === 'approved' && (
                                                        <IconButton size="small" color="primary" onClick={() => handleMarkPaid(advance.id)} title="Mark as Paid">
                                                            <PaymentIcon fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                    {['pending', 'rejected'].includes(advance.status) && (
                                                        <IconButton size="small" color="error" onClick={() => handleDelete(advance.id)} title="Delete">
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {advances.last_page > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                            <Pagination count={advances.last_page} page={advances.current_page} onChange={(e, page) => router.get(route('employees.advances.index'), { ...filters, page })} />
                        </Box>
                    )}
                </Card>
            </Box>
        </AdminLayout>
    );
};

export default Index;
