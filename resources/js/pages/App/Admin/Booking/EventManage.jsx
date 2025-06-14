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
  scrollbar-width: none;         /* Firefox */
  -ms-overflow-style: none;      /* IE 10+ */
}

.custom-dialog-right .modal-content::-webkit-scrollbar {
  display: none;                 /* Chrome, Safari */
}
  .dialog-top-right {
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    margin: 0 !important;
    transform: none !important;
    height: auto;
    max-height: calc(100vh - 40px); /* prevent going off screen */
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
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none;  /* IE 10+ */
  }

  .dialog-top-right .modal-content::-webkit-scrollbar {
    display: none; /* Chrome, Safari */
  }

  @media (max-width: 600px) {
    .dialog-top-right .modal-dialog {
      width: 90% !important;
      max-width: 90% !important;
    }
  }
`;

const bookingsData = [
    {
        id: 1,
        type: 'Deluxe Room',
        created: 'March 25th 2025, 3:30 PM',
        bookingId: 'ROM0232',
        duration: 'March 25th 2025 to March 26th 2025',
        rooms: 2,
        nights: 1,
        status: 'Confirmed',
    },
    {
        id: 2,
        type: 'Standard Room',
        created: 'March 25th 2025, 3:30 PM',
        bookingId: 'ROM0232',
        duration: 'March 25th 2025 to March 26th 2025',
        rooms: 1,
        nights: 1,
        status: 'Confirmed',
    },
];

const roomTypes = [
    {
        type: 'Annual Gala',
        image: '/assets/room-img.png',
        area: 'Main Hall',
        capacity: 100,
        time: 'May 20, 10:00 AM',
        price: 150,
        color: '#0B4837',
    },
    {
        type: 'Sports Night',
        image: '/assets/room-img.png',
        area: 'Ground Area',
        capacity: 80,
        time: 'March 25, 06:00 PM',
        price: 150,
        color: '#129BFF',
    },
];

const EventScreen = ({ events }) => {
    const [open, setOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
    const [showResultsModal, setShowResultsModal] = useState(false);
    const [showAvailableRooms, setShowAvailableRooms] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    console.log('events', events);

    const filteredBookings = bookingsData.filter((booking) => booking.type.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleOpenBookingModal = () => {
        setShowAvailabilityModal(true);
    };

    const handleCloseAvailabilityModal = () => {
        setShowAvailabilityModal(false);
        setShowAvailableRooms(false); // reset view on close
    };

    const handleShowAvailableRooms = () => {
        setShowAvailableRooms(true);
    };

    const handleFilterClose = () => setShowFilter(false);
    const handleFilterShow = () => setShowFilter(true);

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
                                <IconButton sx={{ mr: 1, color: '#3F4E4F' }}>
                                    <ArrowBack />
                                </IconButton>
                                <Typography
                                    sx={{
                                        color: '#3F4E4F',
                                        fontSize: '30px',
                                        fontWeight: 500,
                                    }}
                                >
                                    Events
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
                            <Box textAlign="right" pb={2} >
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
                                {events.slice(0, 4).map((events, index) => {
                                    return (
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
                                                {/* Image */}
                                                {/* <img src="/assets/room-img.png" alt="" style={{ width: '117px', height: '77px' }} /> */}
                                                {/* <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                                                    <img src={'/' + events?.photo_path} alt="" style={{ width: '117px', height: '77px' }} />
                                                </Box> */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                                                    <img src={'/' + events?.photo_path} alt="" style={{ width: '117px', height: '77px' }} />
                                                </Box>

                                                {/* Content */}
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
                                                            {events.event_name}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mt: -1 }}>
                                                            <Box component="span" fontWeight="bold" color="text.primary">
                                                                {events.price_per_person} RS.
                                                            </Box>
                                                            /{events.pricing_type}
                                                        </Typography>
                                                    </Box>



                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mt: 2 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <LocationOnIcon fontSize="small" sx={{ color: '#666', mr: 0.5 }} />
                                                            <Typography variant="body2" color="text.secondary">
                                                                {events.location}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <PeopleIcon fontSize="small" sx={{ color: '#666', mr: 0.5 }} />
                                                            <Typography variant="body2" color="text.secondary">
                                                                {events.max_capacity} Capacity
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <AccessTimeIcon fontSize="small" sx={{ color: '#666', mr: 0.5 }} />
                                                            <Typography variant="body2" color="text.secondary">
                                                                {events.date_time}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Box>

                        {/* Search and Filter */}
                        <Row className="align-items-center mt-5 mb-3">
                            <Col>
                                <Typography variant="h6" component="h2" style={{ color: '#000000', fontWeight: 500, fontSize: '24px' }}>
                                    Recently Booking
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
                                        border: '1px solid #3F4E4F',
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
                        {filteredBookings.map((booking, index) => (
                            <Card key={index} className="mb-2" style={{ border: '1px solid #e0e0e0' }}>
                                <Card.Body className="p-2">
                                    <Row>
                                        {/* Room Image */}
                                        <Col md={2} className="d-flex justify-content-center">
                                            <img
                                                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-IuCtZ2a4wrWMZXu6pYSfLcMMwigfuK.png"
                                                alt={booking.type}
                                                style={{
                                                    width: '100%',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                        </Col>

                                        {/* Booking Info */}
                                        <Col md={10}>
                                            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
                                                <div>
                                                    <Typography style={{ fontWeight: 500, fontSize: '20px', color: '#121212' }}>
                                                        {booking.type}
                                                    </Typography>
                                                    <Typography variant="body2" style={{ color: '#7F7F7F', fontSize: '14px', fontWeight: 400 }}>
                                                        Created on {booking.created}
                                                    </Typography>
                                                </div>
                                                <Badge
                                                    onClick={() => router.visit('/booking/details')}
                                                    bg=""
                                                    style={{
                                                        backgroundColor: booking.status === 'Confirmed' ? '#0e5f3c' : '#842029',
                                                        color: 'white',
                                                        padding: '6px 14px',
                                                        borderRadius: '6px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 500,
                                                        minWidth: '100px',
                                                        textAlign: 'center',
                                                        cursor: 'pointer',
                                                        borderRadius: '0px',
                                                    }}
                                                >
                                                    {booking.status}
                                                </Badge>
                                            </div>

                                            {/* Booking Details */}
                                            <Row className="mt-2 text-start">
                                                <Col md={3} sm={6} className="mb-2">
                                                    <Typography variant="body2" style={{ color: '#7F7F7F', fontSize: '12px' }}>
                                                        Booking ID
                                                    </Typography>
                                                    <Typography variant="body1" style={{ fontWeight: 400, color: '#121212', fontSize: '12px' }}>
                                                        {booking.bookingId}
                                                    </Typography>
                                                </Col>
                                                <Col md={4} sm={6} className="mb-2">
                                                    <Typography variant="body2" style={{ color: '#7F7F7F', fontSize: '12px' }}>
                                                        Duration
                                                    </Typography>
                                                    <Typography variant="body1" style={{ fontWeight: 400, color: '#121212', fontSize: '12px' }}>
                                                        {booking.duration}
                                                    </Typography>
                                                </Col>
                                                <Col md={2} sm={6} className="mb-2">
                                                    <Typography variant="body2" style={{ color: '#7F7F7F', fontSize: '12px' }}>
                                                        Room
                                                    </Typography>
                                                    <Typography variant="body1" style={{ fontWeight: 400, color: '#121212', fontSize: '12px' }}>
                                                        {booking.rooms}
                                                    </Typography>
                                                </Col>
                                                <Col md={2} sm={6} className="mb-2">
                                                    <Typography variant="body2" style={{ color: '#7F7F7F', fontSize: '12px' }}>
                                                        Night
                                                    </Typography>
                                                    <Typography variant="body1" style={{ fontWeight: 400, color: '#121212', fontSize: '12px' }}>
                                                        {booking.nights}
                                                    </Typography>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        ))}

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
