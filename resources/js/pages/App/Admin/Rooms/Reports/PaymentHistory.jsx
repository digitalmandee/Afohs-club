import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AdminLayout from '@/layouts/AdminLayout';
import { Box, Card, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Chip } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Print as PrintIcon, FileDownload as FileDownloadIcon } from '@mui/icons-material';

import RoomBookingFilter from '../../Booking/BookingFilter';

const PaymentHistoryReport = ({ rows = [], filters = {}, cutoff }) => {
    const handlePrint = () => {
        const params = new URLSearchParams(window.location.search);
        const printUrl = route('rooms.reports.payment-history.print', Object.fromEntries(params));
        window.open(printUrl, '_blank');
    };

    const handleExport = () => {
        const params = new URLSearchParams(window.location.search);
        const exportUrl = route('rooms.reports.payment-history.export', Object.fromEntries(params));
        window.location.href = exportUrl;
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
                        <Typography sx={{ color: '#063455', fontWeight: 700, fontSize: '30px' }}>Room-wise Payment History</Typography>
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

                <RoomBookingFilter routeName="rooms.reports.payment-history" showStatus={false} showRoomType={true} showDates={{ booking: true, checkIn: true, checkOut: true }} dateLabels={{ booking: 'Date', checkIn: 'Check-In Date', checkOut: 'Check-Out Date' }} dateMode={{ checkIn: 'single', checkOut: 'single' }} />

                {/* Results Summary */}
                <Box sx={{ mb: 2 }}>
                    <Chip label={`Date: ${cutoff || '-'}`} color="primary" variant="outlined" />
                </Box>

                {/* Table */}
                <Card sx={{ borderRadius: '12px' }}>
                    <TableContainer component={Paper} elevation={0}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#063455' }}>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Room Type</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Room No</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Booking No</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Check In</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Check Out</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Total</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Advance/Security</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Paid</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Balance</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                                            <Typography color="textSecondary">No data found</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rows.flatMap((group) => {
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
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            </Box>
        </AdminLayout>
    );
};

export default PaymentHistoryReport;
