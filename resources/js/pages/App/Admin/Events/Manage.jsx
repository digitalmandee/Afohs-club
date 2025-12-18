import { router } from '@inertiajs/react';
import { ArrowBack, Search, Visibility } from '@mui/icons-material';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, ThemeProvider, Typography, createTheme, IconButton, TextField, FormControl, Select, MenuItem, Grid, Chip } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useMemo, useState } from 'react';
import { Badge, Container } from 'react-bootstrap';
import dayjs from 'dayjs';
import EventBookingInvoiceModal from '@/components/App/Events/EventBookingInvoiceModal';
import EventViewDocumentsModal from '@/components/App/Events/EventViewDocumentsModal';
import debounce from 'lodash.debounce';
import axios from 'axios';

const theme = createTheme({
    palette: {
        primary: {
            main: '#003366',
        },
        secondary: {
            main: '#2c3e50',
        },
        success: {
            main: '#0e5f3c',
        },
        warning: {
            main: '#5f0e0e',
        },
    },
});

const EventsManage = ({ bookings, filters = {} }) => {
    // const [open, setOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState(filters.search_name || '');
    const [searchId, setSearchId] = useState(filters.search_id || '');
    const [bookingDateFrom, setBookingDateFrom] = useState(filters.booking_date_from || '');
    const [bookingDateTo, setBookingDateTo] = useState(filters.booking_date_to || '');
    const [eventDateFrom, setEventDateFrom] = useState(filters.event_date_from || '');
    const [eventDateTo, setEventDateTo] = useState(filters.event_date_to || '');
    const [selectedVenue, setSelectedVenue] = useState(filters.venues || []);
    const [selectedStatus, setSelectedStatus] = useState(filters.status || []);
    const [filteredBookings, setFilteredBookings] = useState(bookings.data || []);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [venues, setVenues] = useState([]);

    // View Documents Modal state
    const [showDocsModal, setShowDocsModal] = useState(false);
    const [selectedBookingForDocs, setSelectedBookingForDocs] = useState(null);

    const debouncedSearch = useMemo(
        () =>
            debounce((value) => {
                router.get(route('events.manage'), { search: value }, { preserveState: true });
            }, 500),
        [],
    );

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        debouncedSearch(e.target.value);
    };

    const handleShowInvoice = (booking) => {
        setSelectedBookingId(booking.id);
        setShowInvoiceModal(true);
    };

    const handleCloseInvoice = () => {
        setShowInvoiceModal(false);
        setSelectedBookingId(null);
    };

    const handleBookingUpdate = () => {
        router.reload({ only: ['bookings'] });
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

    const handleReset = () => {
        setSearchTerm('');
        setSearchId('');
        setBookingDateFrom('');
        setBookingDateTo('');
        setEventDateFrom('');
        setEventDateTo('');
        setSelectedVenue([]);
        setSelectedStatus([]);

        // Clear URL parameters
        router.get(
            route('events.manage'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleApply = () => {
        const filterParams = {};

        if (searchTerm) filterParams.search_name = searchTerm;
        if (searchId) filterParams.search_id = searchId;
        if (bookingDateFrom) filterParams.booking_date_from = bookingDateFrom;
        if (bookingDateTo) filterParams.booking_date_to = bookingDateTo;
        if (eventDateFrom) filterParams.event_date_from = eventDateFrom;
        if (eventDateTo) filterParams.event_date_to = eventDateTo;
        if (selectedVenue.length > 0) filterParams.venues = selectedVenue;
        if (selectedStatus.length > 0) filterParams.status = selectedStatus;

        router.get(route('events.manage'), filterParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusBadge = (booking) => {
        const { status, invoice } = booking;

        if (status === 'confirmed') {
            return <Badge bg="success">Confirmed</Badge>;
        } else if (status === 'completed') {
            return <Badge bg="primary">Completed</Badge>;
        } else if (status === 'cancelled') {
            return <Badge bg="danger">Cancelled</Badge>;
        } else if (invoice?.status === 'paid') {
            return <Badge bg="success">Paid</Badge>;
        } else if (invoice?.status === 'unpaid') {
            return <Badge bg="warning">Unpaid</Badge>;
        }
        return <Badge bg="secondary">Pending</Badge>;
    };

    // Load venues on component mount
    useEffect(() => {
        const loadVenues = async () => {
            try {
                const response = await axios.get('/api/events/venues');
                setVenues(response.data);
            } catch (error) {
                console.error('Error loading venues:', error);
            }
        };
        loadVenues();
    }, []);

    useEffect(() => {
        setFilteredBookings(bookings.data || []);
    }, [bookings]);

    return (
        <>
            {/* <SideNav open={open} setOpen={setOpen} /> */}
            <div
                style={{
                    minHeight: '100vh',
                    backgroundColor: '#f5f5f5',
                    overflowX: 'hidden',
                }}
            >
                <ThemeProvider theme={theme}>
                    <Container fluid className="p-4 bg-light">
                        {/* Header */}
                        <Box className="mb-4 d-flex justify-content-between align-items-center">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <IconButton onClick={() => router.visit(route('events.dashboard'))} sx={{ mr: 2 }}>
                                    <ArrowBack />
                                </IconButton>
                                <Typography style={{ color: '#003366', fontWeight: 500, fontSize: '30px' }}>Manage Event Bookings</Typography>
                            </Box>
                        </Box>

                        {/* Filter Section */}
                        <Paper sx={{ p: 3, mb: 3, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                            <Grid container spacing={2} alignItems="center">
                                {/* Search by Name */}
                                <Grid item xs={12} md={2}>
                                    <TextField fullWidth size="small" label="Search by Name" placeholder="Enter guest name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                </Grid>

                                {/* Search by ID */}
                                <Grid item xs={12} md={2}>
                                    <TextField fullWidth size="small" label="Search by ID" placeholder="Enter booking ID..." value={searchId} onChange={(e) => setSearchId(e.target.value)} />
                                </Grid>

                                {/* Booking Date From */}
                                <Grid item xs={12} md={2}>
                                    <TextField fullWidth size="small" type="date" label="Booking Date From" value={bookingDateFrom} onChange={(e) => setBookingDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
                                </Grid>

                                {/* Booking Date To */}
                                <Grid item xs={12} md={2}>
                                    <TextField fullWidth size="small" type="date" label="Booking Date To" value={bookingDateTo} onChange={(e) => setBookingDateTo(e.target.value)} InputLabelProps={{ shrink: true }} />
                                </Grid>

                                {/* Event Date From */}
                                <Grid item xs={12} md={2}>
                                    <TextField fullWidth size="small" type="date" label="Event Date From" value={eventDateFrom} onChange={(e) => setEventDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
                                </Grid>

                                {/* Event Date To */}
                                <Grid item xs={12} md={2}>
                                    <TextField fullWidth size="small" type="date" label="Event Date To" value={eventDateTo} onChange={(e) => setEventDateTo(e.target.value)} InputLabelProps={{ shrink: true }} />
                                </Grid>

                                {/* Choose Venues */}
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            multiple
                                            value={selectedVenue}
                                            onChange={(e) => setSelectedVenue(e.target.value)}
                                            displayEmpty
                                            renderValue={(selected) => {
                                                if (selected.length === 0) {
                                                    return <em style={{ color: '#999' }}>Choose Venues</em>;
                                                }
                                                return (
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {selected.map((value) => {
                                                            const venueObj = venues.find((v) => v.value === value);
                                                            return <Chip key={value} label={venueObj?.label || value} size="small" />;
                                                        })}
                                                    </Box>
                                                );
                                            }}
                                        >
                                            {venues.map((venue) => (
                                                <MenuItem key={venue.value} value={venue.value}>
                                                    {venue.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Status Filter */}
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            multiple
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            displayEmpty
                                            renderValue={(selected) => {
                                                if (selected.length === 0) {
                                                    return <em style={{ color: '#999' }}>Choose Status</em>;
                                                }
                                                const statusOptions = [
                                                    { value: 'confirmed', label: 'Confirmed' },
                                                    { value: 'completed', label: 'Completed' },
                                                    { value: 'cancelled', label: 'Cancelled' },
                                                    // { value: 'unpaid', label: 'Unpaid' },
                                                    // { value: 'paid', label: 'Paid' }
                                                ];
                                                return (
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {selected.map((value) => {
                                                            const statusObj = statusOptions.find((s) => s.value === value);
                                                            return <Chip key={value} label={statusObj?.label || value} size="small" />;
                                                        })}
                                                    </Box>
                                                );
                                            }}
                                        >
                                            <MenuItem value="confirmed">Confirmed</MenuItem>
                                            <MenuItem value="completed">Completed</MenuItem>
                                            <MenuItem value="cancelled">Cancelled</MenuItem>
                                            {/* <MenuItem value="unpaid">Unpaid</MenuItem>
                                            <MenuItem value="paid">Paid</MenuItem> */}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Action Buttons */}
                                <Grid item xs={12} md={4} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <Button
                                        variant="outlined"
                                        onClick={handleReset}
                                        sx={{
                                            borderColor: '#dc2626',
                                            color: '#dc2626',
                                            textTransform: 'none',
                                            '&:hover': {
                                                backgroundColor: '#fef2f2',
                                                borderColor: '#dc2626',
                                            },
                                        }}
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        variant="contained"
                                        startIcon={<Search />}
                                        onClick={handleApply}
                                        sx={{
                                            backgroundColor: '#063455',
                                            textTransform: 'none',
                                            '&:hover': {
                                                backgroundColor: '#047857',
                                            },
                                        }}
                                    >
                                        Sort
                                    </Button>
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* Bookings Table */}
                        <TableContainer component={Paper} style={{ boxShadow: 'none', overflowX: 'auto' }}>
                            <Table>
                                <TableHead>
                                    <TableRow style={{ backgroundColor: '#E5E5EA', height: '60px' }}>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Booking No</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Guest Name</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Event</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Venue</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Booking Date</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Event Date</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Status</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredBookings.length > 0 ? (
                                        filteredBookings.map((booking) => (
                                            <TableRow key={booking.id} hover>
                                                <TableCell>{booking.booking_no}</TableCell>
                                                <TableCell>{booking.name || booking.customer?.name || booking.member?.full_name || 'N/A'}</TableCell>
                                                <TableCell>{booking.nature_of_event}</TableCell>
                                                <TableCell>{booking.event_venue?.name || 'N/A'}</TableCell>
                                                <TableCell>{booking.created_at ? dayjs(booking.created_at).format('MMM DD, YYYY') : 'N/A'}</TableCell>
                                                <TableCell>{booking.event_date ? dayjs(booking.event_date).format('MMM DD, YYYY') : 'N/A'}</TableCell>
                                                <TableCell>{getStatusBadge(booking)}</TableCell>
                                                <TableCell>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1, // adds space between buttons
                                                            flexWrap: 'nowrap', // ensures they stay on the same line
                                                        }}
                                                    >
                                                        <Button variant="outlined" size="small" color="info" onClick={() => handleShowDocs(booking)} title="View Documents" sx={{ minWidth: 'auto', p: '4px' }}>
                                                            <Visibility fontSize="small" />
                                                        </Button>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() => handleShowInvoice(booking)}
                                                            sx={{
                                                                border: '1px solid #003366',
                                                                color: '#003366',
                                                                textTransform: 'none',
                                                                width: 100,
                                                            }}
                                                        >
                                                            View Details
                                                        </Button>

                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            onClick={() => router.visit(route('events.booking.edit', booking.id))}
                                                            sx={{
                                                                backgroundColor: '#003366',
                                                                border: 'none',
                                                                textTransform: 'none',
                                                                '&:hover': { backgroundColor: '#002855' },
                                                            }}
                                                        >
                                                            Edit
                                                        </Button>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center">
                                                <Typography variant="body1" color="textSecondary">
                                                    No event bookings found
                                                </Typography>
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
                    </Container>

                    {/* Event Booking Invoice Modal */}
                    <EventBookingInvoiceModal open={showInvoiceModal} onClose={handleCloseInvoice} bookingId={selectedBookingId} setBookings={handleBookingUpdate} />

                    {/* View Documents Modal */}
                    <EventViewDocumentsModal open={showDocsModal} onClose={handleCloseDocs} bookingId={selectedBookingForDocs?.id} />
                </ThemeProvider>
            </div>
        </>
    );
};

export default EventsManage;
