import { useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Grid } from '@mui/material';

const MemberWisePrint = ({ bookings = [], member = null, generatedAt = '' }) => {
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
                    Member History Report
                </Typography>
                {member && (
                    <Typography variant="h6" sx={{ mt: 1 }}>
                        {member.full_name} ({member.membership_no})
                    </Typography>
                )}
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
                            <TableCell sx={{ fontWeight: 600 }}>Member / Guest</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Check In</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Check Out</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Room</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Advance/Security</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Paid</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Due</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {bookings.map((booking) => {
                            const guestName = booking.customer ? booking.customer.name : booking.member ? booking.member.full_name : booking.corporateMember ? booking.corporateMember.full_name : 'Unknown';
                            const advanceSecurity = Number(booking.security_deposit || 0) + Number(booking.advance_amount || 0);
                            const total = Number(booking.grand_total || 0);
                            const paid = Number(booking.invoice?.paid_amount || 0);
                            const due = total - paid;
                            return (
                                <TableRow key={booking.id}>
                                    <TableCell>{booking.booking_no || booking.booking_number}</TableCell>
                                    <TableCell>{booking.booking_date || '-'}</TableCell>
                                    <TableCell>{guestName}</TableCell>
                                    <TableCell>{booking.check_in_date}</TableCell>
                                    <TableCell>{booking.check_out_date}</TableCell>
                                    <TableCell>{booking.room?.name || '-'}</TableCell>
                                    <TableCell>{advanceSecurity.toFixed(2)}</TableCell>
                                    <TableCell>{total.toFixed(2)}</TableCell>
                                    <TableCell>{paid.toFixed(2)}</TableCell>
                                    <TableCell>{due.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Chip label={booking.status} size="small" color={getStatusColor(booking.status)} variant="outlined" />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
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

MemberWisePrint.layout = (page) => page;

export default MemberWisePrint;
