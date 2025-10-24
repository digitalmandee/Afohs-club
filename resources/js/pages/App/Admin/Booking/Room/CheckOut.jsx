import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Modal } from '@mui/material';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import 'bootstrap/dist/css/bootstrap.min.css';

import { generateInvoiceContent, JSONParse } from '@/helpers/generateTemplate';
import BookingInvoiceModal from '@/components/App/Rooms/BookingInvoiceModal';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const RoomCheckOut = () => {
    const { bookings } = usePage().props;
    const [open, setOpen] = useState(true);

    // ✅ State for Invoice Modal
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const [filteredBookings, setFilteredBookings] = useState(bookings.data || []);

    // ✅ Open Invoice Modal
    const handleOpenInvoice = (booking) => {
        setSelectedBooking(booking);
        setShowInvoiceModal(true);
    };

    // ✅ Close Invoice Modal
    const handleCloseInvoice = () => {
        setShowInvoiceModal(false);
        setSelectedBooking(null);
    };

    return (
        <>
            <SideNav open={open} setOpen={setOpen} />

            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                }}
            >
                <Box sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between">
                        <div className="d-flex align-items-center">
                            <Typography
                                sx={{
                                    marginLeft: '10px',
                                    fontWeight: 500,
                                    color: '#063455',
                                    fontSize: '30px',
                                }}
                            >
                                Room CheckOut
                            </Typography>
                        </div>
                    </Box>

                    <TableContainer sx={{ marginTop: '20px' }} component={Paper} style={{ boxShadow: 'none' }}>
                        <Table>
                            <TableHead>
                                <TableRow style={{ backgroundColor: '#E5E5EA', height: '60px' }}>
                                    <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Booking Date</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Member / Guest</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Room</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Persons</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Per Day Charge</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredBookings
                                    .filter((booking) => booking.status === 'checked_in') // ✅ Show only checked-in bookings
                                    .map((booking) => (
                                        <TableRow key={booking.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <TableCell>{booking.id}</TableCell>
                                            <TableCell>{booking.booking_date}</TableCell>
                                            <TableCell>{booking.customer ? booking.customer.name : booking.member ? booking.member.full_name : ''}</TableCell>
                                            <TableCell>{booking.room?.name}</TableCell>
                                            <TableCell>{booking.persons}</TableCell>
                                            <TableCell>{booking.per_day_charge}</TableCell>
                                            <TableCell>{booking.status.replace(/_/g, ' ')}</TableCell>
                                            <TableCell>
                                                <Button variant="outlined" size="small" style={{ marginRight: '8px' }} onClick={() => router.visit(route('rooms.edit.booking', { id: booking.id, type: 'checkout' }))}>
                                                    Check Out
                                                </Button>
                                                <Button variant="outlined" size="small" color="secondary" onClick={() => handleOpenInvoice(booking)}>
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box display="flex" justifyContent="center" mt={2}>
                        {bookings.links?.map((link, index) => (
                            <Button
                                key={index}
                                onClick={() => link.url && router.visit(link.url)}
                                disabled={!link.url}
                                variant={link.active ? 'contained' : 'outlined'}
                                size="small"
                                style={{
                                    margin: '0 5px',
                                    minWidth: '36px',
                                    padding: '6px 10px',
                                    fontWeight: link.active ? 'bold' : 'normal',
                                    backgroundColor: link.active ? '#333' : '#fff',
                                }}
                            >
                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                            </Button>
                        ))}
                    </Box>
                </Box>
            </div>

            <BookingInvoiceModal open={showInvoiceModal} onClose={() => setShowInvoiceModal(false)} bookingId={selectedBooking?.id} setBookings={setFilteredBookings} />
        </>
    );
};

export default RoomCheckOut;
