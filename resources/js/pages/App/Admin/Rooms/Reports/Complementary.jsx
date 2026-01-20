import { useState } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AdminLayout from '@/layouts/AdminLayout';
import { Box, Card, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TextField, Chip, Grid } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Print as PrintIcon } from '@mui/icons-material';

const ComplementaryReport = ({ items = [], filters = {} }) => {
    const [dateFrom, setDateFrom] = useState(filters.dateFrom || '');
    const [dateTo, setDateTo] = useState(filters.dateTo || '');

    const handleFilter = () => {
        router.get(
            route('rooms.reports.complementary'),
            {
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            },
            { preserveState: true },
        );
    };

    const handlePrint = () => {
        const printUrl = route('rooms.reports.complementary.print', {
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
        });
        window.open(printUrl, '_blank');
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
                            Complementary Items Report
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
                        Showing {items.length} records
                    </Typography>
                </Box>

                {/* Table */}
                <Card sx={{ borderRadius: '12px' }}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#063455' }}>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Date</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Room</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Guest</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Details</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Value (Free)</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {items.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                            <Typography color="textSecondary">No data found</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    items.map((item) => (
                                        <TableRow key={item.id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                                            <TableCell>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</TableCell>
                                            <TableCell>{item.room_booking?.room?.room_number}</TableCell>
                                            <TableCell>{item.room_booking?.customer ? item.room_booking.customer.name : item.room_booking?.member ? item.room_booking.member.full_name : item.room_booking?.corporate_member ? item.room_booking.corporate_member.name : '-'}</TableCell>
                                            <TableCell>{item.details}</TableCell>
                                            <TableCell>{item.amount}</TableCell>
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

export default ComplementaryReport;
