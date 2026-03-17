import { useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';

const PaymentHistoryPrint = ({ rows = [], filters = {}, cutoff, generatedAt = '' }) => {
    useEffect(() => {
        setTimeout(() => window.print(), 500);
    }, []);

    return (
        <Box sx={{ p: 3, backgroundColor: '#fff' }}>
            <style>{`@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`}</style>

            <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Room-wise Payment History
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Date: {cutoff || '-'} | Check-In: {filters.check_in_from || '-'} to {filters.check_in_to || '-'} | Check-Out: {filters.check_out_from || '-'} to {filters.check_out_to || '-'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Generated: {generatedAt}
                </Typography>
            </Box>

            <TableContainer component={Paper} sx={{ overflow: 'visible', boxShadow: 'none', border: '1px solid #ddd' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Room Type</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Room No</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Booking No</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Check In</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Check Out</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Advance/Security</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Paid</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Balance</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.flatMap((group) => {
                            const out = [];
                            out.push(
                                <TableRow key={`room-${group.room_name}`} sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableCell colSpan={9} sx={{ fontWeight: 700 }}>
                                        {group.room_name} ({group.room_type})
                                    </TableCell>
                                </TableRow>,
                            );
                            group.items.forEach((row) => {
                                out.push(
                                    <TableRow key={`booking-${row.booking_id}`}>
                                        <TableCell>{group.room_type}</TableCell>
                                        <TableCell>{group.room_name}</TableCell>
                                        <TableCell>{row.booking_no}</TableCell>
                                        <TableCell>{row.check_in_date || '-'}</TableCell>
                                        <TableCell>{row.check_out_date || '-'}</TableCell>
                                        <TableCell>{row.total}</TableCell>
                                        <TableCell>{row.advance_security}</TableCell>
                                        <TableCell>{row.paid}</TableCell>
                                        <TableCell>{row.balance}</TableCell>
                                    </TableRow>,
                                );
                            });
                            out.push(
                                <TableRow key={`room-total-${group.room_name}`} sx={{ backgroundColor: '#fafafa' }}>
                                    <TableCell colSpan={5} sx={{ fontWeight: 700 }}>
                                        Room Total
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>{group.totals.total}</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>{group.totals.advance_security}</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>{group.totals.paid}</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>{group.totals.balance}</TableCell>
                                </TableRow>,
                            );
                            return out;
                        })}
                        {rows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={9} sx={{ textAlign: 'center' }}>
                                    No data available
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Box sx={{ mt: 3, textAlign: 'right' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Total Rooms: {rows.length}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

PaymentHistoryPrint.layout = (page) => page;

export default PaymentHistoryPrint;
