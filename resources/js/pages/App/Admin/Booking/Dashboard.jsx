import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Button, Form, Badge, Card, Col, Modal } from 'react-bootstrap'; // Added Modal import for popup
import { Search, FilterAlt } from '@mui/icons-material';
import { ThemeProvider, createTheme, Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { router } from '@inertiajs/react';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import DatePicker from 'react-multi-date-picker';
import { DateObject } from 'react-multi-date-picker';
import AvailableRooms from './Rooms';
import axios from 'axios';
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

// TODO: Remove invoice popup logic and revert to original handlePrintReceipt after testing
const generateInvoiceContent = (booking) => {
    if (!booking) return '';

    const durationInDays = booking.booking_type === 'room' ? dayjs(booking.checkout).diff(dayjs(booking.checkin), 'day') : null;

    return `<!doctype html>
<html>
    <head>
        <title>Booking Invoice</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                padding: 20px;
                max-width: 930px;
                margin: 0 auto;
            }
            .container {
                margin-top: 16px;

            }
            .paper {
                border-radius: 4px;
                position: relative;
                overflow: hidden;
            }
            .grid-container {
                display: flex;
                flex-wrap: wrap;
                margin-bottom: 32px;
                padding-bottom: 16px;
                border-bottom: 1px solid #f0f0f0;
            }
            .grid-item-left {
                flex: 0 0 33.33%;
                display: flex;
                align-items: center;
            }
            .grid-item-center {
                flex: 0 0 33.33%;
                text-align: center;
            }
            .logo {
                height: 60px;
            }
            .typography-h6 {
                font-size: 18px;
                font-weight: bold;
            }
            .typography-body3 {
                font-size: 12px;
                color: #555;
                line-height: 1.4;
            }
            .typography-body2 {
                font-size: 12px;
                color: #555;
                line-height: 0.6;
            }
            .typography-body2-bold {
                font-size: 13px;
                font-weight: bold;
            }
            .subtitle1 {
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 12px;
            }
            .summary-container {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 24px;
            }
            .summary-box {
                width: 33.33%;
                padding-top: 8px;
            }
            .summary-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 16px;
                border-bottom: 1px solid #eee;
            }
            .notes-container {
                display: flex;
                gap: 16px;
                margin-bottom: 24px;
            }
            .notes-item {
                flex: 0 0 50%;
            }
            .amount-in-words {
                font-size: 13px;
                font-weight: bold;
                margin-top: 4px;
                text-transform: uppercase;
            }
            .two-column {
                display: flex;
                flex-wrap: wrap;
                gap: 16px;
            }
            .two-column > div {
                flex: 0 0 48%;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="paper">
                <!-- Header -->
                <div class="grid-container">
                    <div class="grid-item-left">
                        <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1c95d02f2c4a986d4f386920c76ff57c18c81985-YeMq5tNsLWF62HBaZY1Gz1HsT7RyLX.png" alt="Afohs Club Logo" class="logo" />
                    </div>
                    <div class="grid-item-center">
                        <div class="typography-h6" style="color: #003366">Afohs Club</div>
                        <div class="typography-body3">
                            PAF Falcon complex, Gulberg III,<br />
                            Lahore, Pakistan
                        </div>
                    </div>
                    <div class="grid-item-center"><div class="typography-h6" style="color: #333; margin-top: 20px">${(booking.booking_type || 'Booking').charAt(0).toUpperCase() + (booking.booking_type || 'Booking').slice(1)} Booking</div></div>
                </div>

                <!-- Bill To Section -->
                <div style="margin-bottom: 20px">
                    <div class="subtitle1">Bill To - ${booking.booking_id || 'N/A'}</div>
                    <div class="two-column">
                        <div class="typography-body2"><span style="font-weight: bold">Guest Name: </span>${booking.user?.name || 'N/A'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Membership ID: </span>${booking.user?.user_id || 'N/A'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Phone Number: </span>${booking.user?.phone_number || 'N/A'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Email: </span>${booking.user?.email || 'N/A'}</div>
                    </div>
                </div>

                <!-- Booking Details Section -->
                <div style="margin-bottom: 2px">
                    <div class="subtitle1">Booking Details</div>
                    <div class="two-column">
                        <div class="typography-body2"><span style="font-weight: bold">Booking ID: </span>INV-${booking.booking_id ? booking.booking_id.padStart(6, '0') : 'N/A'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Booking For: </span>${(booking.booking_For || 'N/A').replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Issue Date: </span>${booking.created_at ? dayjs(booking.created_at).format('MMMM D, YYYY') : 'N/A'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Booking Type: </span>${booking.booking_type || 'N/A'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">${booking.booking_type === 'room' ? 'Room Name' : 'Event Name'}: </span>${booking.typeable?.name || booking.typeable?.event_name || 'N/A'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Max Capacity: </span>${booking.typeable?.max_capacity || 'N/A'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">${booking.booking_type === 'room' ? 'Number of Beds' : 'location'}: </span>${booking.typeable?.number_of_beds || booking.typeable?.location || 'N/A'}</div>
                        ${
                            booking.booking_type === 'room' && booking.typeable?.number_of_bathrooms
                                ? `
                        <div class="typography-body2"><span style="font-weight: bold">No of Bathrooms: </span>${booking.typeable?.number_of_bathrooms}</div>
                        `
                                : ''
                        } ${
                            booking.booking_type === 'room'
                                ? `
                        <div class="typography-body2"><span style="font-weight: bold">Check-in: </span>${booking.checkin ? dayjs(booking.checkin).format('MMMM D, YYYY') : 'N/A'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Check-out: </span>${booking.checkout ? dayjs(booking.checkout).format('MMMM D, YYYY') : 'N/A'}</div>
                        `
                                : booking.booking_type === 'event'
                                  ? `
                        <div class="typography-body2"><span style="font-weight: bold">Event Date: </span>${booking.typeable?.date_time ? dayjs(booking.typeable?.date_time).format('MMMM D, YYYY') : 'N/A'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Event Time: </span>${booking.typeable?.date_time ? dayjs(booking.typeable?.date_time).format('h:mm A') : 'N/A'}</div>
                        `
                                  : ''
                        }
                        <div class="typography-body2"><span style="font-weight: bold">Guests: </span>${booking.persons || 'N/A'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Status: </span>${booking.status || 'N/A'}</div>
                    </div>
                </div>

                <!-- Summary and Notes sections remain unchanged -->
                 <div class="summary-container">
            <div class="summary-box">
                <div class="summary-row">
                    <span class="typography-body2-bold">Total Amount</span>
                    <span class="typography-body2">Rs ${booking.total_payment || '0'}</span>
                </div>
                <div class="summary-row">
                    <span class="typography-body2-bold">Balance Due</span>
                    <span class="typography-body2">Rs ${booking.remaining_amount || '0'}</span>
                </div>
                <div class="summary-row">
                    <span class="typography-body2-bold">Amount Paid</span>
                    <span class="typography-body2">Rs ${booking.paid_amount || booking.total_payment || '0'}</span>
                </div>
            </div>
        </div>

        <div class="notes-container">
            <div class="notes-item">
                <div class="typography-body2-bold" style="margin-bottom: 4px">Note:</div>
                <div class="typography-body3">This is a computer-generated receipt. It does not require any signature or stamp.</div>
                <div style="margin-top: 16px">
                    <div class="typography-body2-bold" style="margin-bottom: 4px">Sent By: Admin</div>
                </div>
            </div>
            <div class="notes-item">
                <div class="amount-in-words">AMOUNT IN WORDS: ${numberToWords(booking.total_payment || 0)} RUPEES ONLY</div>
            </div>
            </div>
        </div>
    </body>
</html>
`;
};

// TODO: Remove this utility function when reverting to original print functionality
const numberToWords = (num) => {
    const units = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
    const teens = ['TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
    const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
    const thousands = ['', 'THOUSAND', 'MILLION', 'BILLION'];

    if (num === 0) return 'ZERO';
    let word = '';
    let i = 0;

    while (num > 0) {
        let chunk = num % 1000;
        if (chunk) {
            let chunkWord = '';
            if (chunk >= 100) {
                chunkWord += units[Math.floor(chunk / 100)] + ' HUNDRED ';
                chunk %= 100;
            }
            if (chunk >= 20) {
                chunkWord += tens[Math.floor(chunk / 10)] + ' ';
                chunk %= 10;
            }
            if (chunk >= 10) {
                chunkWord += teens[chunk - 10] + ' ';
            } else if (chunk > 0) {
                chunkWord += units[chunk] + ' ';
            }
            word = chunkWord + thousands[i] + (word ? ' ' : '') + word;
        }
        num = Math.floor(num / 1000);
        i++;
    }
    return word.trim();
};

const CustomDateRangePicker = ({ adults, setAdults, onSearch, clearFilter }) => {
    const [bookingType, setBookingType] = useState('room');
    const [values, setValues] = useState([new DateObject(), new DateObject().add(1, 'days')]);
    const [filterApplied, setFilterApplied] = useState(false);
    const [initialAdults] = useState(adults);

    const handleRangeSelect = (newValues) => {
        setValues(newValues);
    };

    const handleSearch = () => {
        const checkin = values[0]?.format?.('YYYY-MM-DD');
        const checkout = values[1]?.format?.('YYYY-MM-DD');
        onSearch({ bookingType, checkin, checkout, persons: adults });
        setFilterApplied(true);
    };

    const handleClear = () => {
        setBookingType('room');
        setValues([new DateObject(), new DateObject().add(1, 'days')]);
        setAdults(initialAdults);
        setFilterApplied(false);
        clearFilter(false);
        onSearch({ bookingType: 'room', checkin: '', checkout: '', persons: initialAdults });
    };

    return (
        <div style={{ padding: '10px', borderRadius: '4px' }}>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '200px 1fr 1fr 120px 60px',
                    gap: '10px',
                    alignItems: 'center',
                    marginBottom: '10px',
                }}
            >
                <FormControl>
                    <InputLabel id="booking-label">Booking Type</InputLabel>
                    <Select labelId="booking-label" id="booking-select" value={bookingType} label="Booking Type" onChange={(e) => setBookingType(e.target.value)}>
                        <MenuItem value="room">Room</MenuItem>
                        <MenuItem value="event">Event</MenuItem>
                    </Select>
                </FormControl>

                <div
                    style={{
                        flex: '1',
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
                    <DatePicker placeholder="CheckIn to CheckOut" value={values} dateSeparator=" to " onChange={handleRangeSelect} range rangeHover style={{ width: '100%', height: '40px', fontSize: '16px' }} />
                </div>

                {/* 👤 Direct Input for Person */}
                <div
                    style={{
                        flex: '1',
                        backgroundColor: '#fff',
                        padding: '5px 10px',
                        borderRadius: '4px',
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
                            width: '80px',
                            padding: '5px 8px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                        }}
                        placeholder="0"
                    />
                </div>

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

                <Button variant="danger" style={{ padding: '10px', borderRadius: '4px' }} onClick={handleClear}>
                    <HighlightOffIcon />
                </Button>
            </div>
        </div>
    );
};

const BookingDashboard = ({ data }) => {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
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
            const response = await axios.get(route('booking.search'), {
                params: searchParams,
            });
            setBookingType(searchParams.bookingType);
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
                            <Col md={4}>
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

                            <Col md={4}>
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

                            <Col md={4}>
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
                                                    {data?.totalEventBookings || 0}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <hr className="border-top" style={{ marginTop: 13 }} />
                                        <Typography sx={{ color: '#C6C6C6', fontSize: '12px' }}>Available Event</Typography>
                                        <Typography variant="h6">{data?.availableEventsToday || 0}</Typography>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        <Row className="mb-4 align-items-center">
                            <Col>
                                <CustomDateRangePicker adults={adults} setAdults={setAdults} onSearch={handleSearch} clearFilter={setSearchResultsFilter} />
                            </Col>
                        </Row>

                        {/* TODO: Remove invoice modal when reverting to original print functionality */}
                        <Modal show={showInvoiceModal} onHide={handleCloseInvoice} className="custom-dialog-right" size="lg" aria-labelledby="invoice-modal-title">
                            <Modal.Body>
                                <div dangerouslySetInnerHTML={{ __html: selectedBooking ? generateInvoiceContent(selectedBooking) : '' }} />
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleCloseInvoice}>
                                    Close
                                </Button>
                                {/* TODO: Optional - Keep print button if needed during testing */}
                                <Button
                                    variant="primary"
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
                                    Save in PDF
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

                                {!searchResultsFilter && data.bookingsData.length > 0 ? (
                                    data.bookingsData.map((booking, index) => {
                                        const durationInDays = dayjs(booking.checkout).diff(dayjs(booking.checkin), 'day');

                                        return (
                                            <Card key={index} className="mb-2" style={{ border: '1px solid #e0e0e0', cursor: 'pointer' }} onClick={() => handleShowInvoice(booking)}>
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
                                                                    <Typography style={{ fontWeight: 500, fontSize: '20px', color: '#121212' }}>{booking.booking_type ? booking.booking_type.charAt(0).toUpperCase() + booking.booking_type.slice(1) : 'Booking'}</Typography>
                                                                    <Typography variant="body2" style={{ color: '#7F7F7F', fontSize: '14px', fontWeight: 400 }}>
                                                                        Created on {booking.checkin}
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
                                                                        # {booking.booking_id}
                                                                    </Typography>
                                                                </Col>
                                                                <Col md={4} sm={6} className="mb-2">
                                                                    <Typography variant="body2" style={{ color: '#7F7F7F', fontSize: '12px' }}>
                                                                        Duration
                                                                    </Typography>
                                                                    <Typography variant="body1" style={{ fontWeight: 400, color: '#121212', fontSize: '12px' }}>
                                                                        {booking.booking_type === 'room' ? durationInDays + ' Days' : booking.checkin}
                                                                    </Typography>
                                                                </Col>
                                                                <Col md={2} sm={6} className="mb-2">
                                                                    <Typography variant="body2" style={{ color: '#7F7F7F', fontSize: '12px' }}>
                                                                        {booking.booking_type === 'room' ? 'Room' : 'Event'}
                                                                    </Typography>
                                                                    <Typography variant="body1" style={{ fontWeight: 400, color: '#121212', fontSize: '12px' }}>
                                                                        {booking.booking_type === 'room' ? booking.typeable?.name : booking.typeable?.event_name}
                                                                    </Typography>
                                                                </Col>
                                                                <Col md={2} sm={6} className="mb-2">
                                                                    <Typography variant="body2" style={{ color: '#7F7F7F', fontSize: '12px' }}>
                                                                        {booking.booking_type === 'room' ? 'Price Per Night' : 'Price Per Person'}
                                                                    </Typography>
                                                                    <Typography variant="body1" style={{ fontWeight: 400, color: '#121212', fontSize: '12px' }}>
                                                                        {booking.booking_type === 'room' ? booking.typeable?.price_per_night : booking.typeable?.price_per_person}
                                                                    </Typography>
                                                                </Col>
                                                                <Col md={2} sm={6} className="mb-2">
                                                                    <Typography variant="body2" style={{ color: '#7F7F7F', fontSize: '12px' }}>
                                                                        Total Payment
                                                                    </Typography>
                                                                    <Typography variant="body1" style={{ fontWeight: 400, color: '#121212', fontSize: '12px' }}>
                                                                        {booking.total_payment}
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
