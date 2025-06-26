import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router } from '@inertiajs/react';
import { Add, ArrowBack, FilterAlt, Search } from '@mui/icons-material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import { Box, Button, Grid, IconButton, Link, Paper, ThemeProvider, Typography, createTheme } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { Badge, Card, Col, Container, Form, Modal, Row } from 'react-bootstrap';
import EventBookingFilter from './EventFilter';
import dayjs from 'dayjs';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const theme = createTheme({
    palette: {
        primary: {
            main: '#0e3c5f',
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

const dialogStyles = `
.custom-dialog-right.modal-dialog {
  position: fixed;
  top: 20px;
  right: 20px;
  margin: 0;
  width: 600px;
  max-width: 600px;
  transform: none;
  z-index: 1050;
}

.custom-dialog-right .modal-content {
  height: auto;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.custom-dialog-right .modal-content::-webkit-scrollbar {
  display: none;
}
  .dialog-top-right {
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    margin: 0 !important;
    transform: none !important;
    height: auto;
    max-height: calc(100vh - 40px);
  }

  .dialog-top-right .modal-dialog {
    margin: 0 !important;
    max-width: 600px !important;
    width: 600px !important;
  }

  .dialog-top-right .modal-content {
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    border-radius: 0px;
    border: 1px solid rgba(0,0,0,0.1);
    height: 100%;
    max-height: calc(100vh - 40px);
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .dialog-top-right .modal-content::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 600px) {
    .dialog-top-right .modal-dialog {
      width: 90% !important;
      max-width: 90% !important;
    }
  }
`;

const EventScreen = ({ events, data }) => {
    const [open, setOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
    const [showResultsModal, setShowResultsModal] = useState(false);
    const [showAvailableRooms, setShowAvailableRooms] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    console.log('events', data);

    const filteredBookings = data.bookingsData.filter((booking) =>
        booking.typeable?.event_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenBookingModal = () => {
        setShowAvailabilityModal(true);
    };

    const handleCloseAvailabilityModal = () => {
        setShowAvailabilityModal(false);
        setShowAvailableRooms(false);
    };

    const handleShowAvailableRooms = () => {
        setShowAvailableRooms(true);
    };

    const handleFilterClose = () => setShowFilter(false);
    const handleFilterShow = () => setShowFilter(true);

    const handleShowInvoice = (booking) => {
        console.log('Show invoice for booking:', booking);
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
                <ThemeProvider theme={theme}>
                    <style>{dialogStyles}</style>
                    <Container
                        fluid
                        className="p-4"
                        style={{
                            backgroundColor: '#F6F6F6',
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <IconButton sx={{ mr: 1, color: '#063455' }}>
                                    <ArrowBack />
                                </IconButton>
                                <Typography
                                    sx={{
                                        color: '#063455',
                                        fontSize: '30px',
                                        fontWeight: 500,
                                    }}
                                >
                                    Booking
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<Add />}
                                    sx={{
                                        border: '1px solid #063455',
                                        color: '#333',
                                        bgcolor: 'white',
                                        '&:hover': {
                                            border: '1px solid #063455',
                                            bgcolor: '#FFFFFF',
                                        },
                                    }}
                                    onClick={() => router.visit('/booking/add/room?type=event')}
                                >
                                    Add Event
                                </Button>
                                <Button
                                    variant="contained"
                                    sx={{
                                        bgcolor: '#063455',
                                        '&:hover': {
                                            bgcolor: '#063455',
                                        },
                                    }}
                                >
                                    Booking
                                </Button>
                            </Box>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Box textAlign="right" pb={2}>
                                <Link
                                    href="/events/manage"
                                    underline="none"
                                    sx={{
                                        color: '#0a3d62',
                                        fontWeight: 500,
                                        fontSize: '16px',
                                    }}
                                >
                                    View All
                                </Link>
                            </Box>
                            <Grid container spacing={2}>
                                {events.slice(0, 4).map((event, index) => (
                                    <Grid item xs={12} sm={6} key={index}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                borderRadius: 1,
                                                overflow: 'hidden',
                                                display: 'flex',
                                                height: '100px',
                                                bgcolor: '#FFFFFF',
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                                                <img
                                                    src={event.photo_path ? `/${event.photo_path}` : '/assets/placeholder.png'}
                                                    alt={event.event_name || 'Event'}
                                                    style={{ width: '117px', height: '77px' }}
                                                />
                                            </Box>
                                            <Box sx={{ p: 2, width: '80%' }}>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        mt: -1,
                                                    }}
                                                >
                                                    <Typography variant="h6" fontWeight="medium">
                                                        {event.event_name || 'N/A'}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mt: -1 }}>
                                                        <Box component="span" fontWeight="bold" color="text.primary">
                                                            {event.price_per_person ? `${event.price_per_person} RS.` : 'N/A'}
                                                        </Box>
                                                        /{event.pricing_type || 'person'}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mt: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <LocationOnIcon fontSize="small" sx={{ color: '#666', mr: 0.5 }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            {event.location || 'N/A'}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <PeopleIcon fontSize="small" sx={{ color: '#666', mr: 0.5 }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            {event.max_capacity ? `${event.max_capacity} Capacity` : 'N/A'}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <AccessTimeIcon fontSize="small" sx={{ color: '#666', mr: 0.5 }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            {event.date_time ? dayjs(event.date_time).format('MMM D, YYYY, h:mm A') : 'N/A'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>

                        <Row className="align-items-center mt-5 mb-3">
                            <Col>
                                <Typography variant="h6" component="h2" style={{ color: '#000000', fontWeight: 500, fontSize: '24px' }}>
                                    Recently Booking
                                    {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
                                </Typography>
                            </Col>
                            <Col xs="auto" className="d-flex gap-3">
                                <div style={{ position: 'relative', width: '400px', border: '1px solid #121212' }}>
                                    <Form.Control
                                        placeholder="Search"
                                        aria-label="Search"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{
                                            paddingLeft: '2rem',
                                            borderColor: '#ced4da',
                                            borderRadius: '4px',
                                            height: '38px',
                                            fontSize: '0.9rem',
                                        }}
                                    />
                                    <Search
                                        style={{
                                            position: 'absolute',
                                            left: '8px',
                                            top: '53%',
                                            transform: 'translateY(-50%)',
                                            color: '#adb5bd',
                                            fontSize: '1.5rem',
                                            pointerEvents: 'none',
                                        }}
                                    />
                                </div>
                                <Button
                                    variant="outline-secondary"
                                    className="d-flex align-items-center gap-1"
                                    style={{
                                        border: '1px solid #063455',
                                        borderRadius: '0px',
                                        backgroundColor: 'transparent',
                                        color: '#495057',
                                    }}
                                    onClick={handleFilterShow}
                                >
                                    <FilterAlt fontSize="small" /> Filter
                                </Button>
                            </Col>
                        </Row>
                        {filteredBookings.map((booking, index) => {
                            const durationInDays = booking.checkin && booking.checkout
                                ? dayjs(booking.checkout).diff(dayjs(booking.checkin), 'day')
                                : null;

                            return (
                                <Card key={index} className="mb-2" style={{ border: '1px solid #e0e0e0' }} onClick={() => handleShowInvoice(booking)}>
                                    <Card.Body className="p-2">
                                        <Row>
                                            <Col md={2} className="d-flex justify-content-center">
                                                <img
                                                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-IuCtZ2a4wrWMZXu6pYSfLcMMwigfuK.png"
                                                    alt={booking.booking_type}
                                                    style={{
                                                        width: '100%',
                                                        objectFit: 'cover',
                                                    }}
                                                />
                                            </Col>
                                            <Col md={10}>
                                                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
                                                    <div>
                                                        <Typography style={{ fontWeight: 500, fontSize: '20px', color: '#121212' }}>
                                                            {booking.booking_type ? booking.booking_type.charAt(0).toUpperCase() + booking.booking_type.slice(1) : 'Booking'}
                                                        </Typography>
                                                        <Typography variant="body2" style={{ color: '#7F7F7F', fontSize: '14px', fontWeight: 400 }}>
                                                            Created on {booking.created_at ? dayjs(booking.created_at).format('MMMM D, YYYY') : 'N/A'}
                                                        </Typography>
                                                    </div>
                                                    <Badge
                                                        bg=""
                                                        style={{
                                                            backgroundColor: booking.status === 'confirmed' ? '#0e5f3c' : '#842029',
                                                            color: 'white',
                                                            padding: '6px 14px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 500,
                                                            minWidth: '100px',
                                                            textAlign: 'center',
                                                            borderRadius: '0px',
                                                        }}
                                                    >
                                                        {booking.status || 'N/A'}
                                                    </Badge>
                                                </div>
                                                <Row className="text-start mt-2">
                                                    <Col md={3} sm={6} className="mb-2">
                                                        <Typography variant="body2" style={{ color: '#7F7F7F', fontSize: '12px' }}>
                                                            Booking ID
                                                        </Typography>
                                                        <Typography variant="body1" style={{ fontWeight: 400, color: '#121212', fontSize: '12px' }}>
                                                            # {booking.booking_id || 'N/A'}
                                                        </Typography>
                                                    </Col>
                                                    <Col md={4} sm={6} className="mb-2">
                                                        <Typography variant="body2" style={{ color: '#7F7F7F', fontSize: '12px' }}>
                                                            Duration
                                                        </Typography>
                                                        <Typography variant="body1" style={{ fontWeight: 400, color: '#121212', fontSize: '12px' }}>
                                                            {booking.checkin ? dayjs(booking.checkin).format('MMMM D, YYYY') : 'N/A'}
                                                        </Typography>
                                                    </Col>
                                                    <Col md={2} sm={6} className="mb-2">
                                                        <Typography variant="body2" style={{ color: '#7F7F7F', fontSize: '12px' }}>
                                                            Event
                                                        </Typography>
                                                        <Typography variant="body1" style={{ fontWeight: 400, color: '#121212', fontSize: '12px' }}>
                                                            {booking.typeable?.event_name || 'N/A'}
                                                        </Typography>
                                                    </Col>
                                                    <Col md={2} sm={6} className="mb-2">
                                                        <Typography variant="body2" style={{ color: '#7F7F7F', fontSize: '12px' }}>
                                                            Price Per Person
                                                        </Typography>
                                                        <Typography variant="body1" style={{ fontWeight: 400, color: '#121212', fontSize: '12px' }}>
                                                            {booking.typeable?.price_per_person ? `${booking.typeable.price_per_person} RS.` : 'N/A'}
                                                        </Typography>
                                                    </Col>
                                                    <Col md={2} sm={6} className="mb-2">
                                                        <Typography variant="body2" style={{ color: '#7F7F7F', fontSize: '12px' }}>
                                                            Total Payment
                                                        </Typography>
                                                        <Typography variant="body1" style={{ fontWeight: 400, color: '#121212', fontSize: '12px' }}>
                                                            {booking.total_payment ? `${booking.total_payment} RS.` : 'N/A'}
                                                        </Typography>
                                                    </Col>
                                                    <Col md={2} sm={6} className="mb-2">
                                                        <Typography variant="body2" style={{ color: '#7F7F7F', fontSize: '12px' }}>
                                                            Adults
                                                        </Typography>
                                                        <Typography variant="body1" style={{ fontWeight: 400, color: '#121212', fontSize: '12px' }}>
                                                            {booking.persons || 'N/A'}
                                                        </Typography>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            );
                        })}
                        <Modal show={showFilter} onHide={handleFilterClose} dialogClassName="custom-dialog-right" backdrop={true} keyboard={true}>
                            <Modal.Body style={{ padding: 0, height: '100vh', overflowY: 'auto' }}>
                                <EventBookingFilter />
                            </Modal.Body>
                        </Modal>
                    </Container>
                </ThemeProvider>
            </div>
        </>
    );
};

export default EventScreen;
