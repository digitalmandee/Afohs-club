import React, { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { usePage, router } from '@inertiajs/react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, InputAdornment } from '@mui/material';
import { Search, Visibility } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import { styled } from '@mui/material/styles';
import { generateInvoiceContent, JSONParse } from '@/helpers/generateTemplate';
import BookingInvoiceModal from '@/components/App/Rooms/BookingInvoiceModal';
import ViewDocumentsModal from '@/components/App/Rooms/ViewDocumentsModal';
import RoomOrderHistoryModal from '@/components/App/Rooms/RoomOrderHistoryModal';

// const drawerWidthOpen = 240;
// const drawerWidthClosed = 110;

const RoomCheckOut = ({ bookings, filters }) => {
    // const [open, setOpen] = useState(true);

    // ✅ State for Invoice Modal
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    // ✅ Filter States
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');

    // View Documents Modal state
    const [showDocsModal, setShowDocsModal] = useState(false);
    const [selectedBookingForDocs, setSelectedBookingForDocs] = useState(null);

    // Order History Modal state
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedBookingForHistory, setSelectedBookingForHistory] = useState(null);

    const handleShowHistory = (booking) => {
        setSelectedBookingForHistory(booking);
        setShowHistoryModal(true);
    };

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

    // View Documents handlers
    const handleShowDocs = (booking) => {
        setSelectedBookingForDocs(booking);
        setShowDocsModal(true);
    };

    const handleCloseDocs = () => {
        setShowDocsModal(false);
        setSelectedBookingForDocs(null);
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
            },
        );
    };

    // ✅ Reset Filters
    const handleReset = () => {
        setSearchQuery('');
        setStartDate('');
        setEndDate('');
        router.get(route('rooms.checkout'), {}, { preserveState: true, preserveScroll: true });
    };
    const RoundedTextField = styled(TextField)({
        '& .MuiOutlinedInput-root': {
            borderRadius: '16px',
        },
    });

    return (
        <>
            {/* <SideNav open={open} setOpen={setOpen} /> */}

            <div
                style={{
                    minHeight: '100vh',
                    backgroundColor: '#f5f5f5',
                }}
            >
                <Box sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography
                            sx={{
                                marginLeft: '10px',
                                fontWeight: 700,
                                color: '#063455',
                                fontSize: '30px',
                            }}
                        >
                            Room CheckOut
                        </Typography>
                    </Box>

                    {/* Filter Section */}
                    <Box sx={{ mb: 1, p: 2 }}>
                        <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
                            {/* Search Input */}
                            <TextField
                                placeholder="Search by ID, Member, Guest, Room..."
                                variant="outlined"
                                size="small"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                sx={{
                                    minWidth: '250px', backgroundColor: 'transparent',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '16px',
                                    },
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Start Date */}
                            {/* Start Date */}
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Start Date"
                                    value={startDate ? dayjs(startDate) : null}
                                    onChange={(newValue) => setStartDate(newValue ? newValue.format('YYYY-MM-DD') : '')}
                                    format="DD-MM-YYYY"
                                    enableAccessibleFieldDOMStructure={false}
                                    slots={{ textField: RoundedTextField }}
                                    slotProps={{
                                        textField: {
                                            size: 'small',
                                            fullWidth: false,
                                            sx: { maxWidth: '180px', backgroundColor: 'transparent' },
                                            onClick: (e) => e.target.closest('.MuiFormControl-root').querySelector('button')?.click(),
                                        },
                                        actionBar: { actions: ['clear', 'today', 'cancel', 'accept'] },
                                    }}
                                />
                            </LocalizationProvider>

                            {/* End Date */}
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="End Date"
                                    value={endDate ? dayjs(endDate) : null}
                                    onChange={(newValue) => setEndDate(newValue ? newValue.format('YYYY-MM-DD') : '')}
                                    format="DD-MM-YYYY"
                                    enableAccessibleFieldDOMStructure={false}
                                    slots={{ textField: RoundedTextField }}
                                    slotProps={{
                                        textField: {
                                            size: 'small',
                                            fullWidth: false,
                                            sx: { maxWidth: '180px', backgroundColor: 'transparent' },
                                            onClick: (e) => e.target.closest('.MuiFormControl-root').querySelector('button')?.click(),
                                        },
                                        actionBar: { actions: ['clear', 'today', 'cancel', 'accept'] },
                                    }}
                                />
                            </LocalizationProvider>

                            {/* Search Button */}
                            <Button
                                variant="contained"
                                startIcon={<Search/>}
                                onClick={handleSearch}
                                sx={{
                                    backgroundColor: '#063455',
                                    color: 'white',
                                    textTransform: 'none',
                                    borderRadius:'16px',
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
                                    borderRadius:'16px',
                                    '&:hover': {
                                        borderColor: '#052a44',
                                        backgroundColor: '#f5f5f5',
                                    },
                                }}
                            >
                                Reset
                            </Button>

                            {/* Results Count */}
                            {/* <Typography sx={{ ml: 'auto', color: '#7F7F7F', fontSize: '14px' }}>
                                Showing {bookings.from || 0} to {bookings.to || 0} of {bookings.total || 0} results
                            </Typography> */}
                        </Box>
                    </Box>

                    <TableContainer sx={{ marginTop: '20px' }} component={Paper} style={{ boxShadow: 'none', overflowX: 'auto' }}>
                        <Table>
                            <TableHead>
                                <TableRow style={{ backgroundColor: '#063455', height: '30px' }}>
                                    <TableCell sx={{ fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>ID</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>Booking Date</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>Check-In</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>Check-Out</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>Member / Guest</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>Room</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>Persons</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>Per Day Charge</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {bookings.data && bookings.data.length > 0 ? (
                                    bookings.data.map((booking) => (
                                        <TableRow key={booking.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>{booking.id}</TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>{booking.booking_date ? dayjs(booking.booking_date).format('DD-MM-YYYY') : ''}</TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>{booking.check_in_date ? dayjs(booking.check_in_date).format('DD-MM-YYYY') : ''}</TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>{booking.check_out_date ? dayjs(booking.check_out_date).format('DD-MM-YYYY') : ''}</TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>{booking.customer ? booking.customer.name : booking.member ? booking.member.full_name : ''}</TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>{booking.room?.name}</TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>{booking.persons}</TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>{booking.per_day_charge}</TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>{booking.status.replace(/_/g, ' ')}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                    <Button size="small" color='#063455' onClick={() => handleShowDocs(booking)} title="View Documents" sx={{ minWidth: 'auto', p: '4px' }}>
                                                        <Visibility fontSize="small" />
                                                    </Button>
                                                    <Button variant="outlined" size="small" color='#063455' onClick={() => handleOpenInvoice(booking)}>
                                                        View
                                                    </Button>
                                                    <Button variant="outlined" size="small" color='#063455' onClick={() => handleShowHistory(booking)} title="Order History" sx={{ minWidth: 'auto', p: '4px' }}>
                                                        <Box component="span" sx={{ fontSize: '12px', fontWeight: 600 }}>
                                                            Orders
                                                        </Box>
                                                    </Button>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center" sx={{ py: 4, color: '#7F7F7F' }}>
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

            {/* View Documents Modal */}
            <ViewDocumentsModal open={showDocsModal} onClose={handleCloseDocs} bookingId={selectedBookingForDocs?.id} />

            {/* Room Order History Modal */}
            <RoomOrderHistoryModal
                open={showHistoryModal}
                onClose={() => {
                    setShowHistoryModal(false);
                    setSelectedBookingForHistory(null);
                }}
                bookingId={selectedBookingForHistory?.id}
            />
        </>
    );
};

export default RoomCheckOut;
