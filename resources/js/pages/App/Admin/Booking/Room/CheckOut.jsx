import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import 'bootstrap/dist/css/bootstrap.min.css';

import { generateInvoiceContent, JSONParse } from '@/helpers/generateTemplate';
import BookingInvoiceModal from '@/components/App/Rooms/BookingInvoiceModal';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const RoomCheckOut = ({ bookings, filters }) => {
    const [open, setOpen] = useState(true);

    // ✅ State for Invoice Modal
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    // ✅ Filter States
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');

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

    // ✅ Handle Filter/Search - Send to backend
    const handleSearch = () => {
        router.get(
            route('rooms.checkout'),
            {
                search: searchQuery,
                start_date: startDate,
                end_date: endDate,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    // ✅ Reset Filters
    const handleReset = () => {
        setSearchQuery('');
        setStartDate('');
        setEndDate('');
        router.get(route('rooms.checkout'), {}, { preserveState: true, preserveScroll: true });
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
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
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
                    </Box>

                    {/* Filter Section */}
                    <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                            {/* Search Input */}
                            <TextField
                                placeholder="Search by ID, Member, Guest, Room..."
                                variant="outlined"
                                size="small"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                sx={{ minWidth: '300px', backgroundColor: 'white' }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Start Date */}
                            <TextField
                                label="Start Date"
                                type="date"
                                size="small"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                sx={{ minWidth: '180px', backgroundColor: 'white' }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />

                            {/* End Date */}
                            <TextField
                                label="End Date"
                                type="date"
                                size="small"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                sx={{ minWidth: '180px', backgroundColor: 'white' }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />

                            {/* Search Button */}
                            <Button
                                variant="contained"
                                onClick={handleSearch}
                                sx={{
                                    backgroundColor: '#063455',
                                    color: 'white',
                                    textTransform: 'none',
                                    '&:hover': {
                                        backgroundColor: '#052a44',
                                    },
                                }}
                            >
                                Search
                            </Button>

                            {/* Reset Button */}
                            <Button
                                variant="outlined"
                                onClick={handleReset}
                                sx={{
                                    borderColor: '#063455',
                                    color: '#063455',
                                    textTransform: 'none',
                                    '&:hover': {
                                        borderColor: '#052a44',
                                        backgroundColor: '#f5f5f5',
                                    },
                                }}
                            >
                                Reset
                            </Button>

                            {/* Results Count */}
                            <Typography sx={{ ml: 'auto', color: '#7F7F7F', fontSize: '14px' }}>
                                Showing {bookings.from || 0} to {bookings.to || 0} of {bookings.total || 0} results
                            </Typography>
                        </Box>
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
                                {bookings.data && bookings.data.length > 0 ? (
                                    bookings.data.map((booking) => (
                                        <TableRow key={booking.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <TableCell>{booking.id}</TableCell>
                                            <TableCell>{booking.booking_date}</TableCell>
                                            <TableCell>{booking.customer ? booking.customer.name : booking.member ? booking.member.full_name : ''}</TableCell>
                                            <TableCell>{booking.room?.name}</TableCell>
                                            <TableCell>{booking.persons}</TableCell>
                                            <TableCell>{booking.per_day_charge}</TableCell>
                                            <TableCell>{booking.status.replace(/_/g, ' ')}</TableCell>
                                            <TableCell>
                                                <Button variant="outlined" size="small" color="secondary" onClick={() => handleOpenInvoice(booking)}>
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 4, color: '#7F7F7F' }}>
                                            No bookings found
                                        </TableCell>
                                    </TableRow>
                                )}
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

            <BookingInvoiceModal open={showInvoiceModal} onClose={() => setShowInvoiceModal(false)} bookingId={selectedBooking?.id} />
        </>
    );
};

export default RoomCheckOut;
