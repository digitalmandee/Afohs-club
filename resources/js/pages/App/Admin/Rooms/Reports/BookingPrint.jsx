import { useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';

const BookingPrint = ({ bookings = [], filters = {}, generatedAt = '' }) => {
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
                    Booking Report
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                        Date: {filters.dateFrom} - {filters.dateTo}
                    </Typography>
                    {filters.status && (
                        <Typography variant="body2" color="textSecondary">
                            Status: {filters.status}
                        </Typography>
                    )}
                </Box>
                <Typography variant="body2" color="textSecondary">
                    Generated: {generatedAt}
                </Typography>
            </Box>

            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #ddd' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Booking ID</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Room</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Guest</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Check In</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Check Out</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Paid</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Due</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {bookings.map((booking) => {
                            const total = parseFloat(booking.invoice?.total_amount || booking.total_amount || 0);
                            const paid = parseFloat(booking.invoice?.paid_amount || booking.paid_amount || 0);
                            const due = total - paid;

                            return (
                                <TableRow key={booking.id}>
                                    <TableCell>{booking.booking_number || booking.id}</TableCell>
                                    <TableCell>{booking.room?.room_number}</TableCell>
                                    <TableCell>{booking.customer ? booking.customer.name : booking.member ? booking.member.full_name : booking.corporate_member ? booking.corporate_member.name : '-'}</TableCell>
                                    <TableCell>{booking.check_in_date}</TableCell>
                                    <TableCell>{booking.check_out_date}</TableCell>
                                    <TableCell>
                                        <Chip label={booking.status} size="small" color={getStatusColor(booking.status)} variant="outlined" />
                                    </TableCell>
                                    <TableCell>{total.toFixed(2)}</TableCell>
                                    <TableCell>{paid.toFixed(2)}</TableCell>
                                    <TableCell>{due.toFixed(2)}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Total Records: {bookings.length}
                </Typography>
            </Box>
        </Box>
    );
};

BookingPrint.layout = (page) => page;

export default BookingPrint;
