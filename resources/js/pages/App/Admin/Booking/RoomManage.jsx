import SideNav from '@/components/App/AdminSideBar/SideNav';
import { Link, router } from '@inertiajs/react';
import { Add, ArrowBack, Bathroom, Bed, FilterAlt, Person, Search } from '@mui/icons-material';
import { Avatar, Box, Button, Grid, IconButton, Paper, ThemeProvider, Typography, createTheme } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { Badge, Card, Col, Container, Form, Modal, Row } from 'react-bootstrap';
import RoomBookingFilter from './BookingFilter';
import dayjs from 'dayjs'; // Added for duration calculation
import RoomCheckInModal from '@/components/App/Rooms/CheckInModal';

import { generateInvoiceContent, JSONParse } from '@/helpers/generateTemplate';

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

const RoomScreen = ({ rooms, data }) => {
    const [open, setOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
    const [showResultsModal, setShowResultsModal] = useState(false);
    const [showAvailableRooms, setShowAvailableRooms] = useState(false);
    const [showFilter, setShowFilter] = useState(false);

    const [showCheckInModal, setShowCheckInModal] = useState(false);
    // TODO: Remove invoice modal state when reverting to original print functionality
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    // TODO: Remove selected booking state when reverting to original print functionality
    const [selectedBooking, setSelectedBooking] = useState(null);
    // console.log('rooms', data);

    // TODO: Replaced static bookingsData with data.bookingsData from props
    const filteredBookings = data.bookingsData.filter((booking) => (booking.room?.name || '').toLowerCase().includes(searchTerm.toLowerCase()));

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
                        {/* Search and Filter */}
                        <Row className="align-items-center mt-2 mb-3">
                            <Col>
                                <Typography variant="h4" component="h2" style={{ color: '#000000', fontWeight: 500, fontSize: '32px' }}>
                                    Room Bookings
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
                        {/* TODO: Updated to use filteredBookings from data.bookingsData */}
                        {filteredBookings.length > 0 ? (
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

                        {/* Room Checkin Modal  */}
                        <RoomCheckInModal open={showCheckInModal} onClose={() => setShowCheckInModal(false)} bookingId={selectedBooking?.id} />

                        <Modal show={showFilter} onHide={handleFilterClose} dialogClassName="custom-dialog-right" backdrop={true} keyboard={true}>
                            <Modal.Body style={{ padding: 0, height: '100vh', overflowY: 'auto' }}>
                                <RoomBookingFilter />
                            </Modal.Body>
                        </Modal>
                    </Container>
                </ThemeProvider>
            </div>
        </>
    );
};

export default RoomScreen;
