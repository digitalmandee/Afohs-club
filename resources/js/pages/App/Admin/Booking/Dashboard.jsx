import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Button, Form, Badge, Card, Col } from 'react-bootstrap';
import { Search, FilterAlt } from '@mui/icons-material';
import { ThemeProvider, createTheme, Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { router } from '@inertiajs/react';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import DatePicker from 'react-multi-date-picker';
import { DateObject } from 'react-multi-date-picker';
// import RoomEventModal from './RoomEventModal';
// import BookingFilterModal from './FilterModal';
import AvailableRooms from './Rooms';
// import { useEffect } from 'react';
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

const handlePrintReceipt = (booking) => {
    if (!booking) return;

    const durationInDays = booking.booking_type === 'room' ? dayjs(booking.checkout).diff(dayjs(booking.checkin), 'day') : null;

    const content = `<!DOCTYPE html>
<html>
<head>
    <title>Invoice</title>
    <style>
        /* (your original styles, unchanged) */
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 930px;
            margin: 0 auto;
        }
        .container {
            margin-top: 16px;
            margin-bottom: 32px;
        }
        .paper {
            border-radius: 4px;
            position: relative;
            overflow: hidden;
        }
        .grid-container {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            margin-bottom: 32px;
            padding-bottom: 16px;
            border-bottom: 1px solid #f0f0f0;
        }
        .grid-item {
            flex: 1;
            min-width: 0;
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
        .grid-item-right {
            flex: 0 0 33.33%;
            display: flex;
            justify-content: flex-end;
            align-items: center;
        }
        .logo {
            height: 60px;
        }
        .typography-h6 {
            font-size: 18px;
            font-weight: bold;
        }
        .typography-body2 {
            font-size: 12px;
            color: #555;
            line-height: 1.4;
        }
        .typography-body2-bold {
            font-size: 13px;
            font-weight: bold;
        }
        .grid-container-details {
            display: flex;
            gap: 16px;
            margin-bottom: 32px;
        }
        .grid-item-half {
            flex: 0 0 50%;
        }
        .subtitle1 {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        .table-container {
            margin-bottom: 24px;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }
        .table-head {
            background-color: #f9f9f9;
        }
        .table-cell {
            padding: 12px;
            font-weight: bold;
        }
        .table-body-cell {
            padding: 12px;
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
                    <div class="typography-body2">
                        PAF Falcon complex, Gulberg III,<br />
                        Lahore, Pakistan
                    </div>
                </div>
                <div class="grid-item-right">
                    <div class="typography-h6" style="color: #333">Invoice</div>
                </div>
            </div>

            <!-- Bill To and Details Section -->
            <div class="grid-container-details">
                <div class="grid-item-half">
                    <div class="subtitle1">Bill To - 12345</div>
                    <div>
                        <div class="typography-body2" style="margin-bottom: 4px"><span style="font-weight: bold">Name: </span>John Doe</div>
                        <div class="typography-body2" style="margin-bottom: 4px"><span style="font-weight: bold">Category: </span>Gold</div>
                        <div class="typography-body2" style="margin-bottom: 4px"><span style="font-weight: bold">Membership #: </span>12345</div>
                        <div class="typography-body2" style="margin-bottom: 4px"><span style="font-weight: bold">Contact #: </span>+92-300-1234567</div>
                        <div class="typography-body2" style="margin-bottom: 4px"><span style="font-weight: bold">City: </span>Lahore</div>
                        <div class="typography-body2" style="margin-bottom: 4px"><span style="font-weight: bold">Family Member: </span>Jane Doe</div>
                    </div>
                </div>
                <div class="grid-item-half">
                    <div class="subtitle1">DETAILS</div>
                    <div>
                        <div class="typography-body2" style="margin-bottom: 4px"><span style="font-weight: bold">Invoice #: </span>INV-000123</div>
                        <div class="typography-body2" style="margin-bottom: 4px"><span style="font-weight: bold">Issue Date: </span>June 20, 2025</div>
                        <div class="typography-body2" style="margin-bottom: 4px"><span style="font-weight: bold">Payment Method: </span>Credit Card</div>
                    </div>
                </div>
            </div>

            <!-- Invoice Table -->
            <div class="table-container">
                <table class="table">
                    <thead class="table-head">
                        <tr>
                            <th class="table-cell">SR #</th>
                            <th class="table-cell">Description</th>
                            <th class="table-cell">Invoice Amount</th>
                            <th class="table-cell">Remaining Amount</th>
                            <th class="table-cell">Paid Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="table-body-cell">1</td>
                            <td class="table-body-cell">Membership Fee - Gold</td>
                            <td class="table-body-cell">10,000</td>
                            <td class="table-body-cell">2,000</td>
                            <td class="table-body-cell">8,000</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Summary Section -->
            <div class="summary-container">
                <div class="summary-box">
                    <div class="summary-row">
                        <span class="typography-body2-bold">Grand Total</span>
                        <span class="typography-body2">Rs 10,000</span>
                    </div>
                    <div class="summary-row">
                        <span class="typography-body2-bold">Remaining Amount</span>
                        <span class="typography-body2">Rs 2,000</span>
                    </div>
                    <div class="summary-row">
                        <span class="typography-body2-bold">Paid Amount</span>
                        <span class="typography-body2">Rs 8,000</span>
                    </div>
                </div>
            </div>

            <!-- Notes Section -->
            <div class="notes-container">
                <div class="notes-item">
                    <div class="typography-body2-bold" style="margin-bottom: 4px">Note:</div>
                    <div class="typography-body2">This is a computer-generated receipt. It does not require any signature or stamp.</div>
                    <div style="margin-top: 16px">
                        <div class="typography-body2-bold" style="margin-bottom: 4px">Sent By: Admin</div>
                    </div>
                </div>
                <div class="notes-item">
                    <div class="typography-body2">If paid by credit card or cheque, 5% surcharge will be added to the total amount.</div>
                    <div class="amount-in-words">AMOUNT IN WORDS: TEN THOUSAND RUPEES ONLY</div>
                </div>
            </div>

        </div>
    </div>
</body>
</html>
`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
};

const CustomDateRangePicker = ({ adults, setAdults, onSearch, clearFilter }) => {
    const [bookingType, setBookingType] = useState('room'); // room or event
    const [values, setValues] = useState([new DateObject(), new DateObject().add(1, 'days')]);
    const [showPersonInput, setShowPersonInput] = useState(false);
    const [filterApplied, setFilterApplied] = useState(false);
    const [initialAdults] = useState(adults);

    const handleRangeSelect = (newValues) => {
        setValues(newValues);
    };

    const handleSearch = () => {
        // Prepare dates in proper format
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
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr 120px 60px', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                {/* Booking Type Select */}
                <FormControl>
                    <InputLabel id="booking-label">Booking Type</InputLabel>
                    <Select labelId="booking-label" id="booking-select" value={bookingType} label="Booking Type" onChange={(e) => setBookingType(e.target.value)}>
                        <MenuItem value="room">Room</MenuItem>
                        <MenuItem value="event">Event</MenuItem>
                    </Select>
                </FormControl>

                {/* Date picker range */}
                <div style={{ flex: '1', backgroundColor: '#fff', padding: '5px', borderRadius: '4px', marginRight: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📅</span>
                    <DatePicker placeholder="CheckIn to CheckOut" value={values} dateSeparator=" to " onChange={handleRangeSelect} range rangeHover style={{ width: '100%', height: '40px', fontSize: '16px' }} />
                </div>

                {/* Guests picker with direct input */}
                <div
                    style={{ flex: '1', backgroundColor: '#fff', padding: '9px', borderRadius: '4px', position: 'relative' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowPersonInput((prev) => !prev);
                    }}
                >
                    <span style={{ marginRight: '5px' }}>👤</span>
                    <span style={{ cursor: 'pointer', display: 'inline-block', padding: '5px' }}>{`Total Person: ${adults}`}</span>
                    <span style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)' }}> ▼ </span>

                    {showPersonInput && (
                        <input
                            type="number"
                            min="0"
                            value={adults}
                            onChange={(e) => setAdults(Math.max(0, parseInt(e.target.value) || 0))}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                position: 'absolute',
                                bottom: '-50px',
                                left: '0',
                                padding: '5px',
                                width: '100px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                background: '#fff',
                            }}
                        />
                    )}
                </div>

                {/* Search button */}
                <Button style={{ backgroundColor: '#063455', color: '#fff', padding: '10px 15px', borderRadius: '4px', marginLeft: '10px' }} onClick={handleSearch}>
                    Search
                </Button>

                {/* Clear button (only show if filter applied) */}
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

    const handleOpenBookingModal = () => {
        setShowAvailabilityModal(true);
    };

    const handleFilterShow = () => setShowFilter(true);

    const handleSearch = async (searchParams) => {
        setLoading(true);
        try {
            // Send GET request with search parameters
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
                                <Typography style={{ color: '#3F4E4F', fontWeight: 500, fontSize: '30px' }}>Dashboard</Typography>
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

                        {/* Loading Indicator */}
                        {loading && (
                            <div className="p-4">
                                <Typography> Loading...</Typography>
                            </div>
                        )}

                        {!loading && !searchResultsFilter && (
                            <>
                                <Row className="mb-3 align-items-center">
                                    <Col>
                                        <Typography variant="h6" component="h2" style={{ color: '#000000', fontWeight: 500, fontSize: '24px' }}>
                                            Recently Booking
                                            <pre>{JSON.stringify(data.bookingsData, null, 2)}</pre>
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

                                {!searchResultsFilter && data.bookingsData.length > 0 ? (
                                    data.bookingsData.map((booking, index) => {
                                        const durationInDays = dayjs(booking.checkout).diff(dayjs(booking.checkin), 'day');

                                        return (
                                            <Card key={index} className="mb-2" style={{ border: '1px solid #e0e0e0', cursor: 'pointer' }} onClick={() => handlePrintReceipt(booking)}>
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
                                                                    <Typography style={{ fontWeight: 500, fontSize: '20px', color: '#121212' }}>{booking.booking_type}</Typography>
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
                                                                        {booking.booking_type === 'room' ? durationInDays + " Days" : booking.checkin}
                                                                    </Typography>
                                                                </Col>
                                                                <Col md={2} sm={6} className="mb-2">
                                                                    <Typography variant="body2" style={{ color: '#7F7F7F', fontSize: '12px' }}>
                                                                        {booking.booking_type === 'room' ? 'Room' : 'Event'}
                                                                    </Typography>
                                                                    <Typography variant="body1" style={{ fontWeight: 400, color: '#121212', fontSize: '12px' }}>
                                                                        {booking.booking_type === 'room' ? booking.typeable.name : booking.typeable.event_name}
                                                                    </Typography>
                                                                </Col>
                                                                <Col md={2} sm={6} className="mb-2">
                                                                    <Typography variant="body2" style={{ color: '#7F7F7F', fontSize: '12px' }}>
                                                                        {booking.booking_type === 'room' ? 'Price Per Night' : 'Price Per Person'}
                                                                    </Typography>
                                                                    <Typography variant="body1" style={{ fontWeight: 400, color: '#121212', fontSize: '12px' }}>
                                                                        {booking.booking_type === 'room' ? booking.typeable.price_per_night : booking.typeable.price_per_person}
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
