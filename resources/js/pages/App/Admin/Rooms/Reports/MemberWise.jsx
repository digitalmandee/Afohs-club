import { useState } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AdminLayout from '@/layouts/AdminLayout';
import { Box, Card, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, FormControl, InputLabel, Select, MenuItem, Chip, Grid, Autocomplete, TextField } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Print as PrintIcon } from '@mui/icons-material';

const MemberWiseReport = ({ bookings = [], members = [], filters = {} }) => {
    const [selectedMember, setSelectedMember] = useState(filters.memberId ? members.find((m) => m.id == filters.memberId) : null);

    const handleFilter = () => {
        router.get(
            route('rooms.reports.member-wise'),
            {
                member_id: selectedMember ? selectedMember.id : undefined,
            },
            { preserveState: true },
        );
    };

    const handlePrint = () => {
        if (!selectedMember) return;
        const printUrl = route('rooms.reports.member-wise.print', {
            member_id: selectedMember.id,
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
                            Member-wise Report
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint} disabled={!selectedMember} sx={{ borderColor: '#063455', color: '#063455' }}>
                            Print
                        </Button>
                    </Box>
                </Box>

                {/* Filters */}
                <Card sx={{ mb: 3, p: 2, borderRadius: '12px' }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={members}
                                getOptionLabel={(option) => `${option.full_name} (${option.membership_no})`}
                                value={selectedMember}
                                onChange={(event, newValue) => {
                                    setSelectedMember(newValue);
                                }}
                                renderInput={(params) => <TextField {...params} label="Select Member" fullWidth size="small" />}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Button variant="contained" onClick={handleFilter} sx={{ backgroundColor: '#063455', '&:hover': { backgroundColor: '#052d45' } }}>
                                Get History
                            </Button>
                        </Grid>
                    </Grid>
                </Card>

                {/* Results Summary */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                        Showing {bookings.length} bookings for selected member
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
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Check In</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Check Out</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Status</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Total Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {bookings.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                            <Typography color="textSecondary">No bookings found</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    bookings.map((booking) => (
                                        <TableRow key={booking.id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                                            <TableCell>{booking.booking_number || booking.id}</TableCell>
                                            <TableCell>{booking.room?.room_number}</TableCell>
                                            <TableCell>{booking.check_in_date}</TableCell>
                                            <TableCell>{booking.check_out_date}</TableCell>
                                            <TableCell>
                                                <Chip label={booking.status} size="small" color={getStatusColor(booking.status)} />
                                            </TableCell>
                                            <TableCell>{booking.total_amount}</TableCell>
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

export default MemberWiseReport;
