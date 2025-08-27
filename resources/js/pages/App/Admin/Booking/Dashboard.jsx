import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Button, Form, Badge, Card, Col, Modal } from 'react-bootstrap'; // Added Modal import for popup
import { Search, FilterAlt } from '@mui/icons-material';
import { ThemeProvider, createTheme, Box, Typography, FormControl, InputLabel, Select, MenuItem, Popper } from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { router } from '@inertiajs/react';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import DatePicker from 'react-multi-date-picker';
import { DateObject } from 'react-multi-date-picker';
import AvailableRooms from './Rooms';
import axios from 'axios';
import dayjs from 'dayjs';
import { DateRange, DateRangePicker } from 'react-date-range';

import { generateInvoiceContent, JSONParse } from '@/helpers/generateTemplate';

import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { addDays, format } from 'date-fns';
import RoomCheckInModal from '@/components/App/Rooms/CheckInModal';

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
  box-shadow: 0 5px 15px rgba(0, 0,0, 0.3);
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

const CustomDateRangePicker = ({ adults, setAdults, onSearch, clearFilter, roomTypes }) => {
    const [bookingType, setBookingType] = useState('room');
    const [roomType, setRoomType] = useState('');
    const [filterApplied, setFilterApplied] = useState(false);
    const [errors, setErrors] = useState({
        date: '',
        persons: '',
    });

    const [initialAdults] = useState(adults);
    const [open, setOpen] = useState(false);
    const anchorRef = useRef(null);
    const popperRef = useRef(null);

    const [range, setRange] = useState([
        {
            startDate: null,
            endDate: null,
            key: 'selection',
        },
    ]);

    const handleClick = () => setOpen((prev) => !prev);

    const handleClickAway = (event) => {
        if (popperRef.current && !popperRef.current.contains(event.target) && anchorRef.current && !anchorRef.current.contains(event.target)) {
            setOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickAway);
        return () => document.removeEventListener('mousedown', handleClickAway);
    }, []);

    const handleSearch = () => {
        const checkin = range[0]?.startDate;
        const checkout = range[0]?.endDate;

        const newErrors = {
            date: '',
            persons: '',
        };

        let hasError = false;

        if (!checkin || !checkout) {
            newErrors.date = 'Please select both check-in and check-out dates.';
            hasError = true;
        }

        if (adults <= 0) {
            newErrors.persons = 'Please enter at least 1 person.';
            hasError = true;
        }

        setErrors(newErrors);

        if (hasError) return;

        const payload = {
            bookingType,
            checkin: checkin.toLocaleDateString('en-CA'),
            checkout: checkout.toLocaleDateString('en-CA'),
            persons: adults,
        };

        onSearch(payload);
        setFilterApplied(true);
    };

    const handleClear = () => {
        setBookingType('room');
        setErrors({ date: '', persons: '' });
        setRoomType('');
        setRange([]);
        setAdults(initialAdults);
        setFilterApplied(false);
        clearFilter(false);
        onSearch({ bookingType: 'room', checkin: '', checkout: '', persons: initialAdults });
    };

    const startDate = range[0]?.startDate;
    const endDate = range[0]?.endDate;

    const displayText = startDate && endDate ? `${format(startDate, 'dd MMM yyyy')} — ${format(endDate, 'dd MMM yyyy')}` : 'Check-in date — Check-out date';

    return (
        <div style={{ padding: '10px', borderRadius: '4px' }}>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 120px 60px',
                    gap: '6px',
                    alignItems: 'center',
                    marginBottom: '10px',
                }}
            >
                {/* Calendar Range */}
                <Box
                    style={{
                        flex: '1',
                        backgroundColor: '#fff',
                        padding: '5px',
                        borderRadius: '4px',
                        marginRight: '10px',
                    }}
                >
                    <Box
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        <span>📅</span>
                        <div className="date-range" style={{ width: '100%' }}>
                            <Box>
                                <Box>
                                    <Button ref={anchorRef} onClick={handleClick} variant="outlined">
                                        {displayText}
                                    </Button>
                                </Box>

                                <Popper open={open} anchorEl={anchorRef.current} placement="bottom-start">
                                    <Box ref={popperRef} sx={{ bgcolor: 'background.paper', p: 2, zIndex: 1300 }}>
                                        <DateRange editableDateInputs={true} onChange={(item) => setRange([item.selection])} moveRangeOnFirstSelection={false} ranges={range} months={2} showSelectionPreview={false} showDateDisplay={false} direction="horizontal" />
                                    </Box>
                                </Popper>
                            </Box>
                        </div>
                    </Box>
                    {errors.date && (
                        <Typography color="error" variant="caption" sx={{ ml: 1, display: 'block' }}>
                            {errors.date}
                        </Typography>
                    )}
                </Box>

                {/* Persons Input */}
                <div style={{ flex: '1', backgroundColor: '#fff', padding: '5px 10px', borderRadius: '4px' }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        <span>👤</span>
                        <span style={{ whiteSpace: 'nowrap' }}>Total Person:</span>
                        <input
                            type="number"
                            min="0"
                            value={adults}
                            onChange={(e) => setAdults(Math.max(0, parseInt(e.target.value) || 0))}
                            style={{
                                width: '100%',
                                padding: '5px 8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                            }}
                            placeholder="0"
                        />
                    </div>
                    {errors.persons && (
                        <Typography color="error" variant="caption" sx={{ ml: 1 }}>
                            {errors.persons}
                        </Typography>
                    )}
                </div>

                {/* Search Button */}
                <Button
                    style={{
                        backgroundColor: '#063455',
                        color: '#fff',
                        padding: '10px 15px',
                        borderRadius: '4px',
                        marginLeft: '10px',
                    }}
                    onClick={handleSearch}
                >
                    Search
                </Button>

                {/* Clear Filter */}
                <Button variant="danger" style={{ padding: '10px', borderRadius: '4px' }} onClick={handleClear}>
                    <HighlightOffIcon />
                </Button>
            </div>
        </div>
    );
};

const BookingDashboard = ({ data, roomTypes }) => {
    const [open, setOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
    const [showCheckInModal, setShowCheckInModal] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchResultsFilter, setSearchResultsFilter] = useState(false);
    const [adults, setAdults] = useState(2);
    const [checkin, setCheckIn] = useState('');
    const [checkout, setCheckOut] = useState('');
    const [bookingType, setBookingType] = useState('room');
    const [searchResults, setSearchResults] = useState([]);
    // TODO: Remove invoice modal state when reverting to original print functionality
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    // TODO: Remove selected booking state when reverting to original print functionality
    const [selectedBooking, setSelectedBooking] = useState(null);

    const filteredBookings = data.bookingsData.filter((booking) => (booking.room?.name || '').toLowerCase().includes(searchTerm.toLowerCase()));

    const handleOpenBookingModal = () => {
        setShowAvailabilityModal(true);
    };

    const handleFilterShow = () => setShowFilter(true);

    // TODO: Remove invoice modal handler when reverting to original print functionality
    const handleShowInvoice = (booking) => {
        setSelectedBooking(booking);
        setShowInvoiceModal(true);
    };

    // TODO: Remove invoice modal close handler when reverting to original print functionality
    const handleCloseInvoice = () => {
        setShowInvoiceModal(false);
        setSelectedBooking(null);
    };

    const handleSearch = async (searchParams) => {
        setLoading(true);
        try {
            const response = await axios.get(route('rooms.booking.search'), {
                params: searchParams,
            });
            setBookingType(searchParams.bookingType);
            console.log(searchParams.checkin, searchParams.checkout);

            setCheckIn(searchParams.checkin);
            setCheckOut(searchParams.checkout);
            setSearchResultsFilter(true);
            setSearchResults(response.data);
        } catch (error) {
            console.error('Error fetching search results', error);
        } finally {
            setLoading(false);
        }
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
                    <Container fluid className="p-4 bg-light">
                        <Row className="mb-4 align-items-center">
                            <Col>
                                <Typography style={{ color: '#063455', fontWeight: 500, fontSize: '30px' }}>Dashboard</Typography>
                            </Col>
                        </Row>

                        <Row className="mb-4">
                            <Col md={6}>
                                <Card
                                    style={{
                                        backgroundColor: '#063455',
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
                                                    {data?.totalBookings || 0}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={6}>
                                <Card
                                    style={{
                                        backgroundColor: '#063455',
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
                                                    {data?.totalRoomBookings || 0}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <hr className="border-top mt-2" />
                                        <Row>
                                            <Col>
                                                <Typography sx={{ color: '#C6C6C6', fontSize: '12px' }}>Available Rooms</Typography>
                                                <Typography variant="h6">{data?.availableRoomsToday || 0}</Typography>
                                            </Col>
                                            <Col>
                                                <Typography sx={{ color: '#C6C6C6', fontSize: '12px' }}>Total Rooms</Typography>
                                                <Typography variant="h6">{data?.totalRooms || 0}</Typography>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        <Row className="mb-4 align-items-center">
                            <Col>
                                <CustomDateRangePicker adults={adults} setAdults={setAdults} onSearch={handleSearch} clearFilter={setSearchResultsFilter} roomTypes={roomTypes} />
                            </Col>
                        </Row>

                        {/* Room Checkin Modal  */}
                        <RoomCheckInModal open={showCheckInModal} onClose={() => setShowCheckInModal(false)} bookingId={selectedBooking?.id} />

                        {/* TODO: Remove invoice modal when reverting to original print functionality */}
                        <Modal show={showInvoiceModal} onHide={handleCloseInvoice} className="custom-dialog-right" size="lg" aria-labelledby="invoice-modal-title">
                            <Modal.Body>
                                <div dangerouslySetInnerHTML={{ __html: selectedBooking ? generateInvoiceContent(selectedBooking) : '' }} />

                                {/* ✅ Documents Preview */}
                                {JSONParse(selectedBooking?.booking_docs) && JSONParse(selectedBooking?.booking_docs).length > 0 && (
                                    <div style={{ marginTop: '20px' }}>
                                        <h5>Attached Documents</h5>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                                            {JSONParse(selectedBooking?.booking_docs).map((doc, index) => {
                                                const ext = doc.split('.').pop().toLowerCase();

                                                // ✅ For images
                                                if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
                                                    return (
                                                        <div key={index} style={{ width: '100px', textAlign: 'center' }}>
                                                            <img src={doc} alt={`Document ${index + 1}`} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer' }} onClick={() => window.open(doc, '_blank')} />
                                                            <p style={{ fontSize: '12px', marginTop: '5px' }}>Image</p>
                                                        </div>
                                                    );
                                                }

                                                // ✅ For PDF
                                                if (ext === 'pdf') {
                                                    return (
                                                        <div key={index} style={{ width: '100px', textAlign: 'center' }}>
                                                            <img
                                                                src="/assets/pdf-icon.png" // You can use a static icon
                                                                alt="PDF"
                                                                style={{ width: '60px', cursor: 'pointer' }}
                                                                onClick={() => window.open(doc, '_blank')}
                                                            />
                                                            <p style={{ fontSize: '12px', marginTop: '5px' }}>PDF</p>
                                                        </div>
                                                    );
                                                }

                                                // ✅ For DOCX
                                                if (ext === 'docx' || ext === 'doc') {
                                                    return (
                                                        <div key={index} style={{ width: '100px', textAlign: 'center' }}>
                                                            <img
                                                                src="/assets/word-icon.png" // Use a static Word icon
                                                                alt="DOCX"
                                                                style={{ width: '60px', cursor: 'pointer' }}
                                                                onClick={() => window.open(doc, '_blank')}
                                                            />
                                                            <p style={{ fontSize: '12px', marginTop: '5px' }}>Word</p>
                                                        </div>
                                                    );
                                                }

                                                return null; // For unknown file types
                                            })}
                                        </div>
                                    </div>
                                )}
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleCloseInvoice}>
                                    Close
                                </Button>
                                {selectedBooking?.status === 'confirmed' && (
                                    <Button variant="secondary" onClick={() => setShowCheckInModal(true)}>
                                        Check In
                                    </Button>
                                )}
                                {selectedBooking?.status === 'checked_in' && (
                                    <Button variant="secondary" onClick={() => router.visit(route('rooms.booking.edit', { id: selectedBooking.id, type: 'checkout' }))}>
                                        Check Out
                                    </Button>
                                )}
                                {!['checked_out', 'cancelled', 'no_show', 'refunded'].includes(selectedBooking?.status) ? (
                                    <Button variant="secondary" onClick={() => router.visit(route('rooms.booking.edit', { id: selectedBooking?.id }))}>
                                        Edit
                                    </Button>
                                ) : (
                                    ''
                                )}
                                {selectedBooking?.invoice?.status === 'unpaid' ? (
                                    <Button variant="success" onClick={() => router.visit(route('booking.payment', { invoice_no: selectedBooking?.invoice?.id }))}>
                                        Pay Now
                                    </Button>
                                ) : selectedBooking?.invoice?.status === 'paid' ? (
                                    <Button variant="outline-success" disabled>
                                        Paid
                                    </Button>
                                ) : null}

                                {/* TODO: Optional - Keep print button if needed during testing */}
                                <Button
                                    style={{ backgroundColor: '#003366', color: 'white' }}
                                    onClick={() => {
                                        const printWindow = window.open('', '_blank');
                                        printWindow.document.write(`${generateInvoiceContent(selectedBooking)}`);
                                        printWindow.document.close();
                                        printWindow.focus();
                                        setTimeout(() => {
                                            printWindow.print();
                                            printWindow.close();
                                        }, 250);
                                    }}
                                >
                                    Print
                                </Button>
                            </Modal.Footer>
                        </Modal>

                        {loading && (
                            <div className="p-4">
                                <Typography>Loading...</Typography>
                            </div>
                        )}

                        {!loading && !searchResultsFilter && (
                            <>
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

                                {!searchResultsFilter && filteredBookings.length > 0 ? (
                                    filteredBookings.map((booking, index) => {
                                        const durationInDays = dayjs(booking.check_out_date).diff(dayjs(booking.check_in_date), 'day');

                                        return (
                                            <Card key={index} className="mb-2" style={{ border: '1px solid #e0e0e0', cursor: 'pointer' }} onClick={() => handleShowInvoice(booking)}>
                                                <Card.Body className="p-3">
                                                    <Row>
                                                        <Col md={12}>
                                                            <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap">
                                                                <div>
                                                                    <Typography style={{ fontWeight: 500, fontSize: '20px', color: '#121212' }}>{booking.customer ? booking.customer.name : booking.member ? booking.member.full_name : ''}</Typography>
                                                                    <Typography variant="body2" style={{ color: '#7F7F7F', fontSize: '14px', fontWeight: 400 }}>
                                                                        Created on {booking.booking_date}
                                                                    </Typography>
                                                                </div>
                                                                <Badge
                                                                    onClick={() => router.visit(route('rooms.dashboard'))}
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
                                                                        # {booking.booking_no}
                                                                    </Typography>
                                                                </Col>
                                                                <Col md={4} sm={6} className="mb-2">
                                                                    <Typography variant="body2" style={{ color: '#7F7F7F', fontSize: '12px' }}>
                                                                        Duration
                                                                    </Typography>
                                                                    <Typography variant="body1" style={{ fontWeight: 400, color: '#121212', fontSize: '12px' }}>
                                                                        {durationInDays}
                                                                    </Typography>
                                                                </Col>
                                                                <Col md={2} sm={6} className="mb-2">
                                                                    <Typography variant="body2" style={{ color: '#7F7F7F', fontSize: '12px' }}>
                                                                        Room
                                                                    </Typography>
                                                                    <Typography variant="body1" style={{ fontWeight: 400, color: '#121212', fontSize: '12px' }}>
                                                                        {booking.room?.name}
                                                                    </Typography>
                                                                </Col>
                                                                <Col md={2} sm={6} className="mb-2">
                                                                    <Typography variant="body2" style={{ color: '#7F7F7F', fontSize: '12px' }}>
                                                                        {booking.booking_type === 'room' ? 'Price Per Night' : 'Price Per Person'}
                                                                    </Typography>
                                                                    <Typography variant="body1" style={{ fontWeight: 400, color: '#121212', fontSize: '12px' }}>
                                                                        {booking.per_day_charge}
                                                                    </Typography>
                                                                </Col>
                                                                <Col md={2} sm={6} className="mb-2">
                                                                    <Typography variant="body2" style={{ color: '#7F7F7F', fontSize: '12px' }}>
                                                                        Total Payment
                                                                    </Typography>
                                                                    <Typography variant="body1" style={{ fontWeight: 400, color: '#121212', fontSize: '12px' }}>
                                                                        {booking.grand_total}
                                                                    </Typography>
                                                                </Col>
                                                                <Col md={2} sm={6} className="mb-2">
                                                                    <Typography variant="body2" style={{ color: '#7F7F7F', fontSize: '12px' }}>
                                                                        Adults
                                                                    </Typography>
                                                                    <Typography variant="body1" style={{ fontWeight: 400, color: '#121212', fontSize: '12px' }}>
                                                                        {booking.persons}
                                                                    </Typography>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                </Card.Body>
                                            </Card>
                                        );
                                    })
                                ) : (
                                    <Typography>No bookings found for the selected criteria.</Typography>
                                )}
                            </>
                        )}

                        {!loading && searchResultsFilter && <AvailableRooms data={searchResults} type={bookingType} checkin={checkin} checkout={checkout} persons={adults} />}
                    </Container>
                </ThemeProvider>
            </div>
        </>
    );
};

export default BookingDashboard;
