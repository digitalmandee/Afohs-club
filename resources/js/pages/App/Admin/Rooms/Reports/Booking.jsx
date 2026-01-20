import { useState } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AdminLayout from '@/layouts/AdminLayout';
import { Box, Card, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, FormControl, InputLabel, TextField, Chip, Grid, Select, MenuItem } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Print as PrintIcon } from '@mui/icons-material';

const BookingReport = ({ bookings = [], filters = {} }) => {
    const [dateFrom, setDateFrom] = useState(filters.dateFrom || '');
    const [dateTo, setDateTo] = useState(filters.dateTo || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleFilter = () => {
        router.get(
            route('rooms.reports.booking'),
            {
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
                status: status || undefined,
            },
            { preserveState: true },
        );
    };

    const handlePrint = () => {
        const printUrl = route('rooms.reports.booking.print', {
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
            status: status || undefined,
        });
        window.open(printUrl, '_blank');
    };

    const getStatusColor = (status) => {
        const colors = {
            confirmed: 'primary',
            checked_in: 'success',
            checked_out: 'default',
            cancelled: 'error',
            refunded: 'warning',
            completed: 'success',
            pending: 'warning',
        };
        return colors[status] || 'default';
    };

    return (
        <AdminLayout>
            <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton onClick={() => router.visit(route('rooms.reports'))}>
                            <ArrowBackIcon sx={{ color: '#063455' }} />
                        </IconButton>
                        <Typography variant="h5" sx={{ color: '#063455', fontWeight: 700, ml: 1 }}>
                            Booking Report
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ borderColor: '#063455', color: '#063455' }}>
                            Print
                        </Button>
                    </Box>
                </Box>

                {/* Filters */}
                <Card sx={{ mb: 3, p: 2, borderRadius: '12px' }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
                            <TextField type="date" label="From Date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth size="small" />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField type="date" label="To Date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth size="small" />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Status</InputLabel>
                                <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="period_confirmed">Confirmed</MenuItem>
                                    <MenuItem value="checked_in">Checked In</MenuItem>
                                    <MenuItem value="checked_out">Checked Out</MenuItem>
                                    <MenuItem value="cancelled">Cancelled</MenuItem>
                                    <MenuItem value="refunded">Refunded</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Button variant="contained" onClick={handleFilter} sx={{ backgroundColor: '#063455', '&:hover': { backgroundColor: '#052d45' } }}>
                                Apply Filters
                            </Button>
                        </Grid>
                    </Grid>
                </Card>

                {/* Results Summary */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                        Showing {bookings.length} records
                    </Typography>
                </Box>

                {/* Table */}
                <Card sx={{ borderRadius: '12px' }}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#063455' }}>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Booking ID</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Room</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Guest</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Check In</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Check Out</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Status</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Total</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Paid</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Due</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {bookings.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                                            <Typography color="textSecondary">No data found</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    bookings.map((booking) => (
                                        <TableRow key={booking.id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                                            <TableCell>{booking.booking_number || booking.id}</TableCell>
                                            <TableCell>{booking.room?.room_number}</TableCell>
                                            <TableCell>{booking.customer ? booking.customer.name : booking.member ? booking.member.full_name : booking.corporate_member ? booking.corporate_member.name : '-'}</TableCell>
                                            <TableCell>{booking.check_in_date}</TableCell>
                                            <TableCell>{booking.check_out_date}</TableCell>
                                            <TableCell>
                                                <Chip label={booking.status} size="small" color={getStatusColor(booking.status)} />
                                            </TableCell>
                                            <TableCell>{booking.invoice?.total_amount || booking.total_amount}</TableCell>
                                            <TableCell>{booking.invoice?.paid_amount || booking.paid_amount || 0}</TableCell>
                                            <TableCell>{(booking.invoice?.total_amount || booking.total_amount) - (booking.invoice?.paid_amount || booking.paid_amount || 0)}</TableCell>
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

export default BookingReport;
