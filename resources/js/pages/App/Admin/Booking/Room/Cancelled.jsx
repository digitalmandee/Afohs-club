import { router } from '@inertiajs/react';
import { ArrowBack, Search, Restore } from '@mui/icons-material';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, ThemeProvider, Typography, createTheme, IconButton, TextField, Grid, Chip } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { styled } from '@mui/material/styles';
import debounce from 'lodash.debounce';
import BookingInvoiceModal from '@/components/App/Rooms/BookingInvoiceModal';

const theme = createTheme({
    palette: {
        primary: { main: '#003366' },
        secondary: { main: '#2c3e50' },
    },
});

const RoundedTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': { borderRadius: '16px' },
});

const RoomCancelled = ({ bookings, filters = {} }) => {
    const [searchTerm, setSearchTerm] = useState(filters.search_name || '');
    const [searchId, setSearchId] = useState(filters.search_id || '');
    const [bookingDateFrom, setBookingDateFrom] = useState(filters.booking_date_from || '');
    const [bookingDateTo, setBookingDateTo] = useState(filters.booking_date_to || '');
    const [filteredBookings, setFilteredBookings] = useState(bookings.data || []);

    // Invoice Modal
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const handleOpenInvoice = (booking) => {
        setSelectedBooking(booking);
        setShowInvoiceModal(true);
    };

    const debouncedSearch = useMemo(
        () =>
            debounce((value) => {
                router.get(route('rooms.booking.cancelled'), { search_name: value }, { preserveState: true });
            }, 500),
        [],
    );

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        debouncedSearch(e.target.value);
    };

    const handleReset = () => {
        setSearchTerm('');
        setSearchId('');
        setBookingDateFrom('');
        setBookingDateTo('');

        router.get(route('rooms.booking.cancelled'), {}, { preserveState: true, preserveScroll: true });
    };

    const handleApply = () => {
        const filterParams = {};
        if (searchTerm) filterParams.search_name = searchTerm;
        if (searchId) filterParams.search_id = searchId;
        if (bookingDateFrom) filterParams.booking_date_from = bookingDateFrom;
        if (bookingDateTo) filterParams.booking_date_to = bookingDateTo;

        router.get(route('rooms.booking.cancelled'), filterParams, { preserveState: true, preserveScroll: true });
    };

    const handleUndo = (id) => {
        if (confirm('Are you sure you want to undo this cancellation?')) {
            router.put(route('rooms.booking.undo-cancel', id));
        }
    };

    useEffect(() => {
        setFilteredBookings(bookings.data || []);
    }, [bookings]);

    useEffect(() => {
        setFilteredBookings(bookings.data || []);
    }, [bookings]);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <ThemeProvider theme={theme}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Box sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <IconButton onClick={() => router.visit(route('rooms.dashboard'))} sx={{ color: '#063455' }}>
                                <ArrowBack />
                            </IconButton>
                            <Typography style={{ color: '#063455', fontWeight: 700, fontSize: '30px' }}>Cancelled Room Bookings</Typography>
                        </Box>

                        {/* Filters */}
                        <Box sx={{ mb: 3 }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={3}>
                                    <TextField fullWidth size="small" label="Search by Name" placeholder="Guest name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }} />
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <TextField fullWidth size="small" label="Booking ID" placeholder="Booking ID..." value={searchId} onChange={(e) => setSearchId(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }} />
                                </Grid>
                                <Grid item xs={12} md={2.5}>
                                    <DatePicker label="Check-In From" format="DD-MM-YYYY" value={bookingDateFrom ? dayjs(bookingDateFrom) : null} onChange={(newValue) => setBookingDateFrom(newValue ? newValue.format('YYYY-MM-DD') : '')} slots={{ textField: RoundedTextField }} slotProps={{ textField: { size: 'small', fullWidth: true } }} enableAccessibleFieldDOMStructure={false} />
                                </Grid>
                                <Grid item xs={12} md={2.5}>
                                    <DatePicker label="Check-In To" format="DD-MM-YYYY" value={bookingDateTo ? dayjs(bookingDateTo) : null} onChange={(newValue) => setBookingDateTo(newValue ? newValue.format('YYYY-MM-DD') : '')} slots={{ textField: RoundedTextField }} slotProps={{ textField: { size: 'small', fullWidth: true } }} enableAccessibleFieldDOMStructure={false} />
                                </Grid>
                                <Grid item xs={12} md={2} sx={{ display: 'flex', gap: 1 }}>
                                    <Button variant="outlined" onClick={handleReset} sx={{ borderRadius: '16px', color: '#063455', borderColor: '#063455', textTransform: 'none' }}>
                                        Reset
                                    </Button>
                                    <Button variant="contained" onClick={handleApply} startIcon={<Search />} sx={{ borderRadius: '16px', backgroundColor: '#063455', textTransform: 'none' }}>
                                        Search
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>

                        <TableContainer component={Paper} style={{ boxShadow: 'none', borderRadius: '16px' }}>
                            <Table>
                                <TableHead>
                                    <TableRow style={{ backgroundColor: '#063455', height: '60px' }}>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>ID</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600, whiteSpace: 'nowrap' }}>Booking Date</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600, whiteSpace: 'nowrap' }}>Check-In</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600, whiteSpace: 'nowrap' }}>Check-Out</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600, whiteSpace: 'nowrap' }}>Member / Guest</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600, whiteSpace: 'nowrap' }}>Room</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Persons</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600, whiteSpace: 'nowrap' }}>Per Day Charge</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredBookings.length > 0 ? (
                                        filteredBookings.map((booking) => (
                                            <TableRow key={booking.id} hover style={{ borderBottom: '1px solid #eee' }}>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>{booking.id}</TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>{booking.booking_date ? dayjs(booking.booking_date).format('DD-MM-YYYY') : ''}</TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>{booking.check_in_date ? dayjs(booking.check_in_date).format('DD-MM-YYYY') : ''}</TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>{booking.check_out_date ? dayjs(booking.check_out_date).format('DD-MM-YYYY') : ''}</TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>{booking.customer ? booking.customer.name : booking.member ? booking.member.full_name : booking.corporateMember?.full_name || 'N/A'}</TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>{booking.room?.name || 'N/A'}</TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>{booking.persons}</TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>{booking.per_day_charge}</TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>{booking.status.replace(/_/g, ' ')}</TableCell>
                                                <TableCell>
                                                    <Button size="small" variant="outlined" color="primary" startIcon={<Restore />} onClick={() => handleUndo(booking.id)} sx={{ textTransform: 'none', borderRadius: '8px' }}>
                                                        Undo
                                                    </Button>
                                                    <Button variant="outlined" size="small" color="#063455" onClick={() => handleOpenInvoice(booking)} sx={{ textTransform: 'none', color: '#063455', ml: 1, borderRadius: '8px' }}>
                                                        View
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={10} align="center">
                                                No cancelled bookings found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        {bookings.links && (
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                                {bookings.links.map((link, index) => (
                                    <Button key={index} variant={link.active ? 'contained' : 'outlined'} size="small" onClick={() => link.url && router.visit(link.url)} disabled={!link.url} sx={{ mx: 0.5 }}>
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    </Button>
                                ))}
                            </Box>
                        )}
                    </Box>
                </LocalizationProvider>
            </ThemeProvider>

            <BookingInvoiceModal open={showInvoiceModal} onClose={() => setShowInvoiceModal(false)} bookingId={selectedBooking?.id} />
        </div>
    );
};

export default RoomCancelled;
