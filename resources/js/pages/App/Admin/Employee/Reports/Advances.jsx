import { useState } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AdminLayout from '@/layouts/AdminLayout';
import { Box, Card, CardContent, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, FormControl, InputLabel, Select, MenuItem, Grid, Chip, TextField, Alert } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Print as PrintIcon, FileDownload as FileDownloadIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';

const formatCurrency = (amount) => `Rs ${parseFloat(amount || 0).toLocaleString()}`;

const getStatusColor = (status) => {
    const colors = { pending: 'warning', approved: 'info', rejected: 'error', paid: 'primary', deducted: 'success' };
    return colors[status] || 'default';
};

const Advances = ({ advances = [], employees = [], summary = null, hasAdvancesTable = true, filters = {}, message = null }) => {
    const [selectedEmployee, setSelectedEmployee] = useState(filters.employee_id || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const handleFilter = () => {
        router.get(
            route('employees.reports.advances'),
            {
                employee_id: selectedEmployee || undefined,
                status: selectedStatus || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            },
            { preserveState: true },
        );
    };

    const handlePrint = () => {
        window.print();
    };

    if (!hasAdvancesTable) {
        return (
            <AdminLayout>
                <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <IconButton onClick={() => router.visit(route('employees.reports'))}>
                            <ArrowBackIcon sx={{ color: '#063455' }} />
                        </IconButton>
                        <Typography variant="h5" sx={{ color: '#063455', fontWeight: 700, ml: 1 }}>
                            Advances Report
                        </Typography>
                    </Box>
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        {message || 'Advances module not configured.'}
                    </Alert>
                </Box>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton onClick={() => router.visit(route('employees.reports'))}>
                            <ArrowBackIcon sx={{ color: '#063455' }} />
                        </IconButton>
                        <Typography variant="h5" sx={{ color: '#063455', fontWeight: 700, ml: 1 }}>
                            Advances Report
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button variant="contained" startIcon={<OpenInNewIcon />} onClick={() => router.visit(route('employees.advances.index'))} sx={{ backgroundColor: '#28a745' }}>
                            Manage Advances
                        </Button>
                        <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ borderColor: '#063455', color: '#063455' }}>
                            Print
                        </Button>
                    </Box>
                </Box>

                {/* Summary Cards */}
                {summary && (
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6} sm={2.4}>
                            <Card sx={{ borderRadius: '12px', textAlign: 'center', p: 2 }}>
                                <Typography variant="body2" color="textSecondary">
                                    Total Advances
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {summary.count}
                                </Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={6} sm={2.4}>
                            <Card sx={{ borderRadius: '12px', textAlign: 'center', p: 2 }}>
                                <Typography variant="body2" color="textSecondary">
                                    Total Amount
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#063455' }}>
                                    {formatCurrency(summary.total_amount)}
                                </Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={6} sm={2.4}>
                            <Card sx={{ borderRadius: '12px', textAlign: 'center', p: 2 }}>
                                <Typography variant="body2" color="textSecondary">
                                    Outstanding
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: 'red' }}>
                                    {formatCurrency(summary.total_remaining)}
                                </Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={6} sm={2.4}>
                            <Card sx={{ borderRadius: '12px', textAlign: 'center', p: 2 }}>
                                <Typography variant="body2" color="textSecondary">
                                    Pending
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#ff9800' }}>
                                    {summary.pending_count}
                                </Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={6} sm={2.4}>
                            <Card sx={{ borderRadius: '12px', textAlign: 'center', p: 2, backgroundColor: '#063455' }}>
                                <Typography variant="body2" sx={{ color: '#ccc' }}>
                                    Being Deducted
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
                                    {summary.paid_count}
                                </Typography>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {/* Filters */}
                <Card sx={{ mb: 3, p: 2, borderRadius: '12px' }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
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
                        <Grid item xs={12} sm={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Status</InputLabel>
                                <Select value={selectedStatus} label="Status" onChange={(e) => setSelectedStatus(e.target.value)}>
                                    <MenuItem value="">All Status</MenuItem>
                                    <MenuItem value="pending">Pending</MenuItem>
                                    <MenuItem value="approved">Approved</MenuItem>
                                    <MenuItem value="paid">Paid</MenuItem>
                                    <MenuItem value="deducted">Deducted</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <TextField fullWidth size="small" type="date" label="From" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <TextField fullWidth size="small" type="date" label="To" value={dateTo} onChange={(e) => setDateTo(e.target.value)} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={3}>
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
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Department</TableCell>
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
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {advances.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                                            <Typography color="textSecondary">No advances found</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    advances.map((advance, index) => (
                                        <TableRow key={advance.id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell sx={{ fontWeight: 500 }}>{advance.employee?.name}</TableCell>
                                            <TableCell>{advance.employee?.department?.name || '-'}</TableCell>
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
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            </Box>
        </AdminLayout>
    );
};

export default Advances;
