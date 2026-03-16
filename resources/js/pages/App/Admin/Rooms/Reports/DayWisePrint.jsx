import { useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';

const DayWisePrint = ({ bookings = [], filters = {}, generatedAt = '' }) => {
    useEffect(() => {
        setTimeout(() => window.print(), 500);
    }, []);

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
        <Box sx={{ p: 3, backgroundColor: '#fff' }}>
            <style>{`@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`}</style>

            <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Day-wise Room Report
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Booking: {filters.booking_date_from || '-'} to {filters.booking_date_to || '-'} | Check-In: {filters.check_in_from || '-'} to {filters.check_in_to || '-'} | Check-Out: {filters.check_out_from || '-'} to {filters.check_out_to || '-'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Generated: {generatedAt}
                </Typography>
            </Box>

            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #ddd' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Booking No</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Booking Date</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Guest</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Room Type</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Room No</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Check In</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Check Out</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Advance/Security</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Paid Total</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Balance</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {bookings.map((booking) => (
                            <TableRow key={booking.id}>
                                <TableCell>{booking.booking_no || booking.id}</TableCell>
                                <TableCell>{booking.booking_date || '-'}</TableCell>
                                <TableCell>{booking.customer ? booking.customer.name : booking.member ? booking.member.full_name : booking.corporateMember ? booking.corporateMember.full_name : '-'}</TableCell>
                                <TableCell>{booking.room?.roomType?.name || '-'}</TableCell>
                                <TableCell>{booking.room?.name || '-'}</TableCell>
                                <TableCell>{booking.check_in_date || '-'}</TableCell>
                                <TableCell>{booking.check_out_date || '-'}</TableCell>
                                <TableCell>
                                    <Chip label={booking.status} size="small" color={getStatusColor(booking.status)} variant="outlined" />
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
                            <TableCell sx={{ fontWeight: 700 }}>{bookings.reduce((sum, b) => sum + Number(b.computed_total ?? b.grand_total ?? 0), 0)}</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>{bookings.reduce((sum, b) => sum + Number(b.computed_advance_security ?? 0), 0)}</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>{bookings.reduce((sum, b) => sum + Number(b.computed_paid_total ?? 0), 0)}</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>{bookings.reduce((sum, b) => sum + Number(b.computed_balance ?? 0), 0)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Total Bookings: {bookings.length}
                </Typography>
            </Box>
        </Box>
    );
};

DayWisePrint.layout = (page) => page;

export default DayWisePrint;
