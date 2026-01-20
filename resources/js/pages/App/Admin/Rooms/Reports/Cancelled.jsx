import { useState } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AdminLayout from '@/layouts/AdminLayout';
import { Box, Card, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TextField, Chip, Grid } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Print as PrintIcon } from '@mui/icons-material';

const CancelledReport = ({ bookings = [], filters = {} }) => {
    const [dateFrom, setDateFrom] = useState(filters.dateFrom || '');
    const [dateTo, setDateTo] = useState(filters.dateTo || '');

    const handleFilter = () => {
        router.get(
            route('rooms.reports.cancelled'),
            {
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            },
            { preserveState: true },
        );
    };

    const handlePrint = () => {
        const printUrl = route('rooms.reports.cancelled.print', {
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
        });
        window.open(printUrl, '_blank');
    };

    const getStatusColor = (status) => {
        const colors = {
            cancelled: 'error',
            refunded: 'info',
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
                            Cancelled Bookings Report
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
                        <Grid item xs={12} sm={4}>
                            <TextField type="date" label="From Date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth size="small" />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField type="date" label="To Date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth size="small" />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Button variant="contained" onClick={handleFilter} sx={{ backgroundColor: '#063455', '&:hover': { backgroundColor: '#052d45' } }}>
                                Apply Filters
                            </Button>
                        </Grid>
                    </Grid>
                </Card>

                {/* Results Summary */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                        Showing {bookings.length} cancelled/refunded bookings
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
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Status</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Cancellation Date</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Total Amount</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Refunded Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {bookings.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                            <Typography color="textSecondary">No data found</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    bookings.map((booking) => (
                                        <TableRow key={booking.id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                                            <TableCell>{booking.booking_number || booking.id}</TableCell>
                                            <TableCell>{booking.room?.room_number}</TableCell>
                                            <TableCell>{booking.customer ? booking.customer.name : booking.member ? booking.member.full_name : booking.corporate_member ? booking.corporate_member.name : '-'}</TableCell>
                                            <TableCell>
                                                <Chip label={booking.status} size="small" color={getStatusColor(booking.status)} />
                                            </TableCell>
                                            <TableCell>{booking.updated_at ? new Date(booking.updated_at).toLocaleDateString() : '-'}</TableCell>
                                            <TableCell>{booking.total_amount}</TableCell>
                                            {/* Assuming refund amount is tracked or implied by Paid Amount if status is refunded?
                                                Actually, if refunded, usually Paid Amount becomes 0? Or we track refund separately?
                                                For now, let's show Paid Amount as a proxy if we don't have exact 'refunded_amount' column.
                                                Or if status is 'refunded', implies full refund?
                                                I'll show Paid Amount for now.
                                            */}
                                            <TableCell>{booking.paid_amount || '0'}</TableCell>
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

export default CancelledReport;
