import { useState } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AdminLayout from '@/layouts/AdminLayout';
import { Box, Card, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Chip } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Print as PrintIcon, FileDownload as FileDownloadIcon } from '@mui/icons-material';
import Pagination from '@/components/Pagination';

import RoomBookingFilter from '../../Booking/BookingFilter';

const DayWiseReport = ({ bookings = {}, filters = {} }) => {
    // bookings is now a paginated object { data: [], links: [], ... }
    const bookingList = bookings.data || [];

    const handlePrint = () => {
        const params = new URLSearchParams(window.location.search);
        const printUrl = route('rooms.reports.day-wise.print', Object.fromEntries(params));
        window.open(printUrl, '_blank');
    };

    const handleExport = () => {
        const params = new URLSearchParams(window.location.search);
        const exportUrl = route('rooms.reports.day-wise.export', Object.fromEntries(params));
        window.location.href = exportUrl;
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

    const getGuestName = (booking) => {
        if (booking.customer) return booking.customer.name;
        if (booking.member) return booking.member.full_name;
        if (booking.corporateMember) return booking.corporateMember.full_name;
        return 'Unknown';
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
                        <Typography sx={{ color: '#063455', fontWeight: 700, fontSize: '30px' }}>Day-wise Room Report</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExport} sx={{ bgcolor: '#063455', color: '#fff', borderRadius: '16px', textTransform: 'none' }}>
                            Export
                        </Button>
                        <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ bgcolor: '#063455', color: '#fff', borderRadius: '16px', textTransform: 'none' }}>
                            Print
                        </Button>
                    </Box>
                </Box>

                {/* Filters */}
                <RoomBookingFilter routeName="rooms.reports.day-wise" showStatus={true} showRoomType={true} showDates={{ booking: true, checkIn: true, checkOut: true }} dateLabels={{ booking: 'Booking Date', checkIn: 'Check-In Date', checkOut: 'Check-Out Date' }} />

                {/* Results Summary */}
                <Box sx={{ mb: 2 }}>
                    <Chip label={`Total Records: ${bookings.total || 0}`} color="primary" variant="outlined" />
                </Box>

                {/* Table */}
                <Card sx={{ borderRadius: '12px' }}>
                    <TableContainer component={Paper} elevation={0}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#063455' }}>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Booking No</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Booking Date</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Guest</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Room Type</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Room No</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Check In</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Check Out</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Status</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Total</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Advance/Security</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Paid Total</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Balance</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {bookingList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
                                            <Typography color="textSecondary">No data found</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    <>
                                        {bookingList.map((booking) => (
                                            <TableRow key={booking.id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                                                <TableCell>{booking.booking_no || booking.id}</TableCell>
                                                <TableCell>{booking.booking_date || '-'}</TableCell>
                                                <TableCell>{getGuestName(booking)}</TableCell>
                                                <TableCell>{booking.room?.room_type?.name || '-'}</TableCell>
                                                <TableCell>{booking.room?.name || '-'}</TableCell>
                                                <TableCell>{booking.check_in_date || '-'}</TableCell>
                                                <TableCell>{booking.check_out_date || '-'}</TableCell>
                                                <TableCell>
                                                    <Chip label={booking.status} size="small" color={getStatusColor(booking.status)} />
                                                </TableCell>
                                                <TableCell>{booking.computed_total ?? booking.grand_total ?? 0}</TableCell>
                                                <TableCell>{booking.computed_advance_security ?? 0}</TableCell>
                                                <TableCell>{booking.computed_paid_total ?? 0}</TableCell>
                                                <TableCell>{booking.computed_balance ?? 0}</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow sx={{ backgroundColor: '#fafafa' }}>
                                            <TableCell colSpan={8} sx={{ fontWeight: 700 }}>
                                                Grand Total
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>{bookingList.reduce((sum, b) => sum + Number(b.computed_total ?? b.grand_total ?? 0), 0)}</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>{bookingList.reduce((sum, b) => sum + Number(b.computed_advance_security ?? 0), 0)}</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>{bookingList.reduce((sum, b) => sum + Number(b.computed_paid_total ?? 0), 0)}</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>{bookingList.reduce((sum, b) => sum + Number(b.computed_balance ?? 0), 0)}</TableCell>
                                        </TableRow>
                                    </>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>

                <Pagination data={bookings} />
            </Box>
        </AdminLayout>
    );
};

export default DayWiseReport;
