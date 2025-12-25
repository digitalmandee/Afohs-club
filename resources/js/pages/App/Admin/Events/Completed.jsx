import { router } from '@inertiajs/react';
import { ArrowBack, Search, Visibility } from '@mui/icons-material';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, ThemeProvider, Typography, createTheme, IconButton, TextField, FormControl, Select, MenuItem, Grid, Chip } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useMemo, useState } from 'react';
import { Badge, Container } from 'react-bootstrap';
import dayjs from 'dayjs';
import EventBookingInvoiceModal from '@/components/App/Events/EventBookingInvoiceModal';
import EventViewDocumentsModal from '@/components/App/Events/EventViewDocumentsModal';
import debounce from 'lodash.debounce';
import axios from 'axios';
import { FaEdit } from 'react-icons/fa';
import { styled } from '@mui/material/styles';

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

const EventsCompleted = ({ bookings, filters = {} }) => {
    // const [open, setOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState(filters.search_name || '');
    const [searchId, setSearchId] = useState(filters.search_id || '');
    const [bookingDateFrom, setBookingDateFrom] = useState(filters.booking_date_from || '');
    const [bookingDateTo, setBookingDateTo] = useState(filters.booking_date_to || '');
    const [eventDateFrom, setEventDateFrom] = useState(filters.event_date_from || '');
    const [eventDateTo, setEventDateTo] = useState(filters.event_date_to || '');
    const [selectedVenue, setSelectedVenue] = useState(filters.venues || []);
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
                router.get(route('events.completed'), { search: value }, { preserveState: true });
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

        // Clear URL parameters
        router.get(
            route('events.completed'),
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

        router.get(route('events.completed'), filterParams, {
            preserveState: true,
            preserveScroll: true,
        });
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
                <ThemeProvider theme={theme}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Container fluid className="p-4 bg-light">
                            {/* Header */}
                            <Box className="mb-4 d-flex justify-content-between align-items-center">
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <IconButton onClick={() => router.visit(route('events.dashboard'))} sx={{ color: '#063455' }}>
                                        <ArrowBack />
                                    </IconButton>
                                    <Typography style={{ color: '#003366', fontWeight: 700, fontSize: '30px' }}>Completed Event Bookings</Typography>
                                </Box>
                            </Box>

                            {/* Filter Section */}
                            <Box sx={{ mb: 3 }}>
                                <Grid container spacing={2} alignItems="center">
                                    {/* Search by Name */}
                                    <Grid item xs={12} md={2.5}>
                                        <TextField fullWidth size="small" label="Search by Name" placeholder="Enter guest name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '16px',
                                            },
                                        }} />
                                    </Grid>

                                    {/* Search by ID */}
                                    <Grid item xs={12} md={2.5}>
                                        <TextField fullWidth size="small" label="Search by ID" placeholder="Enter booking ID..." value={searchId} onChange={(e) => setSearchId(e.target.value)} sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '16px',
                                            },
                                        }} />
                                    </Grid>

                                    {/* Booking Date From */}
                                    <Grid item xs={12} md={2.5}>
                                        {/* <DatePicker
                                            label="Booking Date From"
                                            format="DD-MM-YYYY"
                                            value={bookingDateFrom ? dayjs(bookingDateFrom) : null}
                                            onChange={(newValue) => setBookingDateFrom(newValue ? newValue.format('YYYY-MM-DD') : '')}
                                            slotProps={{
                                                textField: { size: 'small', fullWidth: true, InputLabelProps: { shrink: true }, onClick: (e) => e.target.closest('.MuiFormControl-root').querySelector('button')?.click() },
                                                actionBar: { actions: ['clear', 'today', 'cancel', 'accept'] },
                                            }}
                                        /> */}
                                        <DatePicker
                                            label="Booking Date From"
                                            format="DD-MM-YYYY"
                                            value={bookingDateFrom ? dayjs(bookingDateFrom) : null}
                                            onChange={(newValue) =>
                                                setBookingDateFrom(newValue ? newValue.format('YYYY-MM-DD') : '')
                                            }
                                            enableAccessibleFieldDOMStructure={false}
                                            slots={{ textField: RoundedTextField }}
                                            slotProps={{
                                                textField: {
                                                    size: 'small',
                                                    fullWidth: true,
                                                    placeholder: 'Select date',   // instead of InputLabelProps: { shrink: true }
                                                    sx: { minWidth: '180px' },
                                                    onClick: (e) =>
                                                        e.target
                                                            .closest('.MuiFormControl-root')
                                                            ?.querySelector('button')
                                                            ?.click(),
                                                },
                                                actionBar: { actions: ['clear', 'today', 'cancel', 'accept'] },
                                            }}
                                        />
                                    </Grid>

                                    {/* Booking Date To */}
                                    <Grid item xs={12} md={2.5}>
                                        {/* <DatePicker
                                            label="Booking Date To"
                                            format="DD-MM-YYYY"
                                            value={bookingDateTo ? dayjs(bookingDateTo) : null}
                                            onChange={(newValue) => setBookingDateTo(newValue ? newValue.format('YYYY-MM-DD') : '')}
                                            slotProps={{
                                                textField: { size: 'small', fullWidth: true, InputLabelProps: { shrink: true }, onClick: (e) => e.target.closest('.MuiFormControl-root').querySelector('button')?.click() },
                                                actionBar: { actions: ['clear', 'today', 'cancel', 'accept'] },
                                            }}
                                        /> */}
                                        <DatePicker
                                            label="Booking Date To"
                                            format="DD-MM-YYYY"
                                            value={bookingDateTo ? dayjs(bookingDateTo) : null}
                                            onChange={(newValue) =>
                                                setBookingDateTo(newValue ? newValue.format('YYYY-MM-DD') : '')
                                            }
                                            enableAccessibleFieldDOMStructure={false}
                                            slots={{ textField: RoundedTextField }}
                                            slotProps={{
                                                textField: {
                                                    size: 'small',
                                                    fullWidth: true,
                                                    placeholder: 'Select date',   // instead of InputLabelProps: { shrink: true }
                                                    sx: { minWidth: '180px' },
                                                    onClick: (e) =>
                                                        e.target
                                                            .closest('.MuiFormControl-root')
                                                            ?.querySelector('button')
                                                            ?.click(),
                                                },
                                                actionBar: { actions: ['clear', 'today', 'cancel', 'accept'] },
                                            }}
                                        />
                                    </Grid>

                                    {/* Event Date From */}
                                    <Grid item xs={12} md={2.5}>
                                        {/* <DatePicker
                                            label="Event Date From"
                                            format="DD-MM-YYYY"
                                            value={eventDateFrom ? dayjs(eventDateFrom) : null}
                                            onChange={(newValue) => setEventDateFrom(newValue ? newValue.format('YYYY-MM-DD') : '')}
                                            slotProps={{
                                                textField: { size: 'small', fullWidth: true, InputLabelProps: { shrink: true }, onClick: (e) => e.target.closest('.MuiFormControl-root').querySelector('button')?.click() },
                                                actionBar: { actions: ['clear', 'today', 'cancel', 'accept'] },
                                            }}
                                        /> */}
                                        <DatePicker
                                            label="Event Date From"
                                            format="DD-MM-YYYY"
                                            value={eventDateFrom ? dayjs(eventDateFrom) : null}
                                            onChange={(newValue) =>
                                                setEventDateFrom(newValue ? newValue.format('YYYY-MM-DD') : '')
                                            }
                                            enableAccessibleFieldDOMStructure={false}
                                            slots={{ textField: RoundedTextField }}
                                            slotProps={{
                                                textField: {
                                                    size: 'small',
                                                    fullWidth: true,
                                                    placeholder: 'Select date',   // instead of InputLabelProps: { shrink: true }
                                                    sx: { minWidth: '180px' },
                                                    onClick: (e) =>
                                                        e.target
                                                            .closest('.MuiFormControl-root')
                                                            ?.querySelector('button')
                                                            ?.click(),
                                                },
                                                actionBar: { actions: ['clear', 'today', 'cancel', 'accept'] },
                                            }}
                                        />
                                    </Grid>

                                    {/* Event Date To */}
                                    <Grid item xs={12} md={2.5}>
                                        {/* <DatePicker
                                            label="Event Date To"
                                            format="DD-MM-YYYY"
                                            value={eventDateTo ? dayjs(eventDateTo) : null}
                                            onChange={(newValue) => setEventDateTo(newValue ? newValue.format('YYYY-MM-DD') : '')}
                                            slotProps={{
                                                textField: { size: 'small', fullWidth: true, InputLabelProps: { shrink: true }, onClick: (e) => e.target.closest('.MuiFormControl-root').querySelector('button')?.click() },
                                                actionBar: { actions: ['clear', 'today', 'cancel', 'accept'] },
                                            }}
                                        /> */}
                                        <DatePicker
                                            label="Event Date To"
                                            format="DD-MM-YYYY"
                                            value={eventDateTo ? dayjs(eventDateTo) : null}
                                            onChange={(newValue) =>
                                                setEventDateTo(newValue ? newValue.format('YYYY-MM-DD') : '')
                                            }
                                            enableAccessibleFieldDOMStructure={false}
                                            slots={{ textField: RoundedTextField }}
                                            slotProps={{
                                                textField: {
                                                    size: 'small',
                                                    fullWidth: true,
                                                    placeholder: 'Select date',   // instead of InputLabelProps: { shrink: true }
                                                    sx: { minWidth: '180px' },
                                                    onClick: (e) =>
                                                        e.target
                                                            .closest('.MuiFormControl-root')
                                                            ?.querySelector('button')
                                                            ?.click(),
                                                },
                                                actionBar: { actions: ['clear', 'today', 'cancel', 'accept'] },
                                            }}
                                        />
                                    </Grid>

                                    {/* Choose Venues */}
                                    <Grid item xs={12} md={2.5}>
                                        <FormControl fullWidth size="small" sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '16px',
                                            },
                                        }}>
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

                                    {/* Action Buttons */}
                                    <Grid item xs={12} md={4} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <Button
                                            variant="outlined"
                                            onClick={handleReset}
                                            sx={{
                                                borderColor: '#063455',
                                                color: '#063455',
                                                textTransform: 'none',
                                                borderRadius: '16px',
                                                '&:hover': {
                                                    // backgroundColor: '#fef2f2',
                                                    // borderColor: '#dc2626',
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
                                                borderRadius: '16px',
                                                '&:hover': {
                                                    // backgroundColor: '#047857',
                                                },
                                            }}
                                        >
                                            Search
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Bookings Table */}
                            <TableContainer component={Paper} style={{ boxShadow: 'none', borderRadius: '16px' }}>
                                <Table>
                                    <TableHead>
                                        <TableRow style={{ backgroundColor: '#063455', height: '30px' }}>
                                            <TableCell sx={{ color: '#fff', fontSize: '16px', fontWeight: 600, whiteSpace: 'nowrap' }}>Booking No</TableCell>
                                            <TableCell sx={{ color: '#fff', fontSize: '16px', fontWeight: 600, whiteSpace: 'nowrap' }}>Guest Name</TableCell>
                                            <TableCell sx={{ color: '#fff', fontSize: '16px', fontWeight: 600 }}>Event</TableCell>
                                            <TableCell sx={{ color: '#fff', fontSize: '16px', fontWeight: 600 }}>Venue</TableCell>
                                            <TableCell sx={{ color: '#fff', fontSize: '16px', fontWeight: 600, whiteSpace: 'nowrap' }}>Booking Date</TableCell>
                                            <TableCell sx={{ color: '#fff', fontSize: '16px', fontWeight: 600, whiteSpace: 'nowrap' }}>Event Date</TableCell>
                                            <TableCell sx={{ color: '#fff', fontSize: '16px', fontWeight: 600 }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredBookings.length > 0 ? (
                                            filteredBookings.map((booking) => (
                                                <TableRow key={booking.id} hover>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>{booking.booking_no}</TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>{booking.name || booking.customer?.name || booking.member?.full_name || 'N/A'}</TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>{booking.nature_of_event}</TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>{booking.event_venue?.name || 'N/A'}</TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>{booking.created_at ? dayjs(booking.created_at).format('DD-MM-YYYY') : 'N/A'}</TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>{booking.event_date ? dayjs(booking.event_date).format('DD-MM-YYYY') : 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                            <Button size="small" onClick={() => handleShowDocs(booking)} title="View Documents" sx={{ minWidth: 'auto', p: '4px', color: '#063455' }}>
                                                                <Visibility fontSize="small" />
                                                            </Button>
                                                            <IconButton onClick={() => router.visit(route('events.booking.edit', booking.id))} size="small" title="Edit">
                                                                <FaEdit size={16} style={{ marginRight: 8, color: '#f57c00' }} />
                                                            </IconButton>
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                onClick={() => handleShowInvoice(booking)}
                                                                style={{
                                                                    border: '1px solid #063455',
                                                                    color: '#063455',
                                                                }}
                                                            >
                                                                View
                                                            </Button>
                                                            {/* <Button
                                                                variant="contained"
                                                                size="small"
                                                                onClick={() => router.visit(route('events.booking.edit', booking.id))}
                                                                style={{
                                                                    backgroundColor: '#003366',
                                                                    border: 'none',
                                                                    color: 'white',
                                                                }}
                                                            >
                                                                Edit
                                                            </Button> */}
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} align="center">
                                                    <Typography variant="body1" color="textSecondary">
                                                        No completed event bookings found
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
                    </LocalizationProvider>
                </ThemeProvider>
            </div>
        </>
    );
};

export default EventsCompleted;
