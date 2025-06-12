import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Card, Button, Form, Badge, Modal } from 'react-bootstrap';
import { Search, FilterAlt } from '@mui/icons-material';
import { ThemeProvider, createTheme, Box, Typography } from '@mui/material';
import { router } from '@inertiajs/react';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import DatePicker from "react-multi-date-picker";
import { DateObject } from "react-multi-date-picker";
import RoomEventModal from './RoomEvent';
import BookingFilter from './Filter';
import AvailableRooms from './Rooms';
import { useEffect } from 'react';
import axios from 'axios';

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

const bookingsData = [
    {
        id: 1,
        type: 'Deluxe Room',
        created: 'March 25th 2025, 3:30 PM',
        bookingId: 'ROM0232',
        duration: 'March 25th 2025 to March 26th 2025',
        startDate: new DateObject('2025-03-25'),
        endDate: new DateObject('2025-03-26'),
        adults: 3,
        rooms: 2,
        nights: 1,
        status: 'Confirmed',
    },
    {
        id: 2,
        type: 'Standard Room',
        created: 'March 25th 2025, 3:30 PM',
        bookingId: 'ROM0233',
        duration: 'March 25th 2025 to March 27th 2025',
        startDate: new DateObject('2025-03-25'),
        endDate: new DateObject('2025-03-27'),
        adults: 1,
        rooms: 1,
        nights: 2,
        status: 'Confirmed',
    },
    {
        id: 3,
        type: 'Suite Room',
        created: 'March 25th 2025, 3:30 PM',
        bookingId: 'ROM0234',
        duration: 'June 7th 2025 to June 9th 2025',
        startDate: new DateObject('2025-06-07'),
        endDate: new DateObject('2025-06-09'),
        adults: 3,
        rooms: 1,
        nights: 2,
        status: 'Pending',
    },
    {
        id: 4,
        type: 'Executive Room',
        created: 'June 1st 2025, 10:00 AM',
        bookingId: 'ROM0235',
        duration: 'June 10th 2025 to June 12th 2025',
        startDate: new DateObject('2025-06-10'),
        endDate: new DateObject('2025-06-12'),
        adults: 2,
        rooms: 1,
        nights: 2,
        status: 'Confirmed',
    },
];

const CustomDateRangePicker = ({ adults, setAdults, onSearch }) => {
    const [values, setValues] = useState([
        new DateObject().subtract(4, "days"),
        new DateObject().add(4, "days")
    ]);
    const [showGuestsModal, setShowGuestsModal] = useState(false);

    const handleRangeSelect = (values) => {
        setValues(values);
    };

    const handleGuestsClick = () => {
        setShowGuestsModal(true);
    };

    const handleCloseGuestsModal = () => {
        setShowGuestsModal(false);
    };

    const handleSearch = () => {
        onSearch(values, adults);
    };

    return (
        <div style={{ padding: '10px', borderRadius: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <div
                    style={{
                        flex: 1,
                        backgroundColor: '#fff',
                        padding: '5px',
                        borderRadius: '4px',
                        marginRight: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    <span>📅</span>
                    <DatePicker
                        value={values}
                        onChange={handleRangeSelect}
                        range
                        rangeHover
                        style={{ width: '100%', height: '40px', fontSize: '16px' }}
                    />
                </div>

                <div style={{ flex: 1, backgroundColor: '#fff', padding: '9px', borderRadius: '4px', position: 'relative' }} onClick={handleGuestsClick}>
                    <span style={{ marginRight: '5px' }}>👤</span>
                    <span
                        style={{ cursor: 'pointer', display: 'inline-block', padding: '5px' }}
                    >
                        {`Total Person: ${adults}`}
                    </span>
                    <span style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)' }}>▼</span>
                </div>
                <Button
                    style={{
                        backgroundColor: '#063455',
                        borderColor: '#063455',
                        color: '#fff',
                        padding: '10px 15px',
                        borderRadius: '4px',
                        marginLeft: '10px',
                    }}
                    onClick={handleSearch}
                >
                    Search
                </Button>
            </div>
            <Modal show={showGuestsModal} onHide={handleCloseGuestsModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Guests</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formAdults">
                            <Form.Label>Adults</Form.Label>
                            <Form.Control
                                type="number"
                                value={adults}
                                onChange={(e) => setAdults(Math.max(0, parseInt(e.target.value) || 0))}
                                min="0"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseGuestsModal}>
                        Done
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

const BookingDashboard = () => {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
    const [showAvailableRooms, setShowAvailableRooms] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [adults, setAdults] = useState(2);
    const [filteredBookings, setFilteredBookings] = useState(bookingsData);

    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        axios.get('/booking/dashboard')
            .then(res => {
                console.log('Fetched bookings:', res.data);
                setBookings(res.data);
            })
            .catch(error => {
                console.error('Error fetching bookings:', error);
            });
    }, []);

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

    const handleSearch = (dateRange, adults) => {
        const [startDate, endDate] = dateRange;
        if (!startDate || !endDate) return;

        const filtered = bookingsData.filter((booking) => {
            const bookingStart = booking.startDate;
            const bookingEnd = booking.endDate;

            // Convert DateObject to JavaScript Date for comparison
            const searchStart = startDate.toDate();
            const searchEnd = endDate.toDate();
            const bookStart = bookingStart.toDate();
            const bookEnd = bookingEnd.toDate();

            // Check for date overlap
            const dateMatch = (
                searchStart <= bookEnd && searchEnd >= bookStart
            );
            const adultsMatch = booking.adults === adults;
            return dateMatch && adultsMatch;
        });
        setFilteredBookings(filtered);
    };

    const searchedBookings = filteredBookings.filter((booking) =>
        booking.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <Container fluid className="p-4 bg-light">
                        <Row className="mb-4 align-items-center">
                            <Col>
                                <Typography style={{ color: '#3F4E4F', fontWeight: 500, fontSize: '30px' }}>Dashboard</Typography>
                            </Col>
                            <Col xs="auto" className="d-flex gap-2">
                                <Button
                                    style={{
                                        backgroundColor: '#063455',
                                        borderColor: '#063455',
                                        borderRadius: '0px',
                                    }}
                                    onClick={handleOpenBookingModal}
                                >Booking
                                    {/* <h1>Booking Dashboard</h1> */}
                                    {/*<pre>{JSON.stringify(bookings, null, 2)}</pre> */}
                                </Button>
                            </Col>
                        </Row>

                        <Row className="mb-4">
                            <Col md={4}>
                                <Card
                                    style={{
                                        backgroundColor: '#3F4E4F',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '2px',
                                        height: '150px',
                                    }}
                                >
                                    <Card.Body
                                        className="p-4"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            height: '100%',
                                        }}
                                    >
                                        <Box className="d-flex align-items-center gap-3">
                                            <Box
                                                sx={{
                                                    backgroundColor: '#202728',
                                                    borderRadius: '50%',
                                                    width: 60,
                                                    height: 60,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <img
                                                    src="/assets/Frame.png"
                                                    alt=""
                                                    style={{
                                                        width: '35px',
                                                        height: '35px',
                                                    }}
                                                />
                                            </Box>
                                            <Box>
                                                <Typography sx={{ color: '#C6C6C6', fontSize: '14px' }}>Total Booking</Typography>
                                                <Typography sx={{ fontSize: '24px' }} className="m-0">
                                                    320
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={4}>
                                <Card
                                    style={{
                                        backgroundColor: '#3F4E4F',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '2px',
                                        height: '150px',
                                    }}
                                >
                                    <Card.Body
                                        className="px-3 py-2"
                                        style={{
                                            height: '100%',
                                        }}
                                    >
                                        <Box className="d-flex align-items-center gap-3">
                                            <Box
                                                sx={{
                                                    backgroundColor: '#202728',
                                                    borderRadius: '50%',
                                                    width: '45px',
                                                    height: '45px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <img
                                                    src="/assets/receipt2.png"
                                                    alt=""
                                                    style={{
                                                        width: '25px',
                                                        height: '25px',
                                                    }}
                                                />
                                            </Box>
                                            <Box>
                                                <Typography sx={{ color: '#C6C6C6', fontSize: '14px' }}>Total Room Booking</Typography>
                                                <Typography sx={{ fontSize: '24px' }} className="m-0">
                                                    320
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <hr className="border-top mt-2" />
                                        <Row>
                                            <Col>
                                                <Typography sx={{ color: '#C6C6C6', fontSize: '12px' }}>Available Rooms</Typography>
                                                <Typography variant="h6">280</Typography>
                                            </Col>
                                            <Col>
                                                <Typography sx={{ color: '#C6C6C6', fontSize: '12px' }}>Total Rooms</Typography>
                                                <Typography variant="h6">40</Typography>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={4}>
                                <Card
                                    style={{
                                        backgroundColor: '#3F4E4F',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '2px',
                                        height: '150px',
                                    }}
                                >
                                    <Card.Body
                                        className="px-3 py-2"
                                        style={{
                                            height: '100%',
                                        }}
                                    >
                                        <Box className="d-flex align-items-center gap-3">
                                            <Box
                                                sx={{
                                                    backgroundColor: '#202728',
                                                    borderRadius: '50%',
                                                    width: '48px',
                                                    height: '48px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <img
                                                    src="/assets/check.png"
                                                    alt=""
                                                    style={{
                                                        width: '25px',
                                                        height: '25px',
                                                    }}
                                                />
                                            </Box>
                                            <Box>
                                                <Typography sx={{ color: '#C6C6C6', fontSize: '14px' }}>Total Event Booking</Typography>
                                                <Typography variant="h5" className="m-0">
                                                    320
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <hr className="border-top" style={{ marginTop: 13 }} />
                                        <Typography sx={{ color: '#C6C6C6', fontSize: '12px' }}>Available Event</Typography>
                                        <Typography variant="h6">2</Typography>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        <Row className="mb-4 align-items-center">
                            <Col>
                                <CustomDateRangePicker
                                    adults={adults}
                                    setAdults={setAdults}
                                    onSearch={handleSearch}
                                />
                            </Col>
                        </Row>

                        <Row className="mb-3 align-items-center">
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

                        {searchedBookings.length > 0 ? (
                            searchedBookings.map((booking, index) => (
                                <Card key={index} className="mb-2" style={{ border: '1px solid #e0e0e0' }}>
                                    <Card.Body className="p-2">
                                        <Row>
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
                                            <Col md={10}>
                                                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
                                                    <div>
                                                        <Typography style={{ fontWeight: 500, fontSize: '20px', color: '#121212' }}>{booking.type}</Typography>
                                                        <Typography variant="body2" style={{ color: '#7F7F7F', fontSize: '14px', fontWeight: 400 }}>
                                                            Created on {booking.created}
                                                        </Typography>
                                                    </div>
                                                    <Badge
                                                        onClick={() => router.visit(route('rooms.dashboard'))}
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
                                                <Row className="text-start mt-2">
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
                                                    <Col md={2} sm={6} className="mb-2">
                                                        <Typography variant="body2" style={{ color: '#7F7F7F', fontSize: '12px' }}>
                                                            Adults
                                                        </Typography>
                                                        <Typography variant="body1" style={{ fontWeight: 400, color: '#121212', fontSize: '12px' }}>
                                                            {booking.adults}
                                                        </Typography>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            ))
                        ) : (
                            <Typography>No bookings found for the selected criteria.</Typography>
                        )}

                        <Modal show={showFilter} onHide={handleFilterClose} dialogClassName="custom-dialog-right" backdrop={true} keyboard={true}>
                            <Modal.Body style={{ padding: 0, height: '100vh', overflowY: 'auto' }}>
                                <BookingFilter />
                            </Modal.Body>
                        </Modal>

                        <Modal show={showAvailabilityModal} onHide={handleCloseAvailabilityModal} dialogClassName="custom-dialog-right">
                            <Modal.Body style={{ padding: 0, height: '100vh', overflowY: 'auto' }}>
                                {showAvailableRooms ? <AvailableRooms /> : <RoomEventModal onFind={handleShowAvailableRooms} />}
                            </Modal.Body>
                        </Modal>
                    </Container>
                </ThemeProvider>
            </div >
        </>
    );
};

export default BookingDashboard;
