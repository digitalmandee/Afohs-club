import { router } from '@inertiajs/react';
import { FilterAlt, Search, Visibility } from '@mui/icons-material';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, ThemeProvider, Typography, createTheme } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useMemo, useState } from 'react';
import { Badge, Col, Container, Form, Modal, Row } from 'react-bootstrap';
import RoomBookingFilter from './BookingFilter';
import dayjs from 'dayjs'; // Added for duration calculation
import BookingInvoiceModal from '@/components/App/Rooms/BookingInvoiceModal';
import ViewDocumentsModal from '@/components/App/Rooms/ViewDocumentsModal';
import debounce from 'lodash.debounce';

// const drawerWidthOpen = 240;
// const drawerWidthClosed = 110;

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

const RoomScreen = ({ bookings }) => {
    // const [open, setOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilter, setShowFilter] = useState(false);

    const [filteredBookings, setFilteredBookings] = useState(bookings.data || []); // Initialize with all bookings

    // TODO: Remove invoice modal state when reverting to original print functionality
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    // TODO: Remove selected booking state when reverting to original print functionality
    const [selectedBooking, setSelectedBooking] = useState(null);

    // View Documents Modal state
    const [showDocsModal, setShowDocsModal] = useState(false);
    const [selectedBookingForDocs, setSelectedBookingForDocs] = useState(null);

    const debouncedSearch = useMemo(
        () =>
            debounce((value) => {
                router.get(route('rooms.manage'), { search: value }, { preserveState: true });
            }, 500), // 500ms delay
        [],
    );

    // ✅ Handle input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        debouncedSearch(e.target.value);
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

    const handleFilterClose = () => setShowFilter(false);
    const handleFilterShow = () => setShowFilter(true);

    // View Documents handlers
    const handleShowDocs = (booking) => {
        setSelectedBookingForDocs(booking);
        setShowDocsModal(true);
    };

    const handleCloseDocs = () => {
        setShowDocsModal(false);
        setSelectedBookingForDocs(null);
    };

    useEffect(() => {
        setFilteredBookings(bookings.data || []);
    }, [bookings]);

    return (
        <>
            {/* <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                }}
            > */}
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
                                    onChange={handleSearchChange}
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

                    {/* TODO: Updated to use filteredBookings from data.bookings */}

                    <TableContainer sx={{ marginTop: '20px' }} component={Paper} style={{ boxShadow: 'none', overflowX: 'auto' }}>
                        <Table>
                            <TableHead>
                                <TableRow style={{ backgroundColor: '#E5E5EA', height: '60px' }}>
                                    <TableCell sx={{ fontWeight: 600 }}>Booking ID</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Member / Guest</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Booking Date</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Check-In</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Check-Out</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Room</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Persons</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Per Day Charge</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Total Amount</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredBookings.length > 0 ? (
                                    filteredBookings.map((booking, index) => {
                                        const durationInDays = dayjs(booking.check_out_date).diff(dayjs(booking.check_in_date), 'day');

                                        return (
                                            <TableRow key={booking.id} style={{ borderBottom: '1px solid #eee' }}>
                                                <TableCell>#{booking.booking_no}</TableCell>
                                                <TableCell>{booking.customer ? booking.customer.name : booking.member ? booking.member.full_name : ''}</TableCell>
                                                <TableCell>{booking.booking_date ? dayjs(booking.booking_date).format('DD-MM-YYYY') : ''}</TableCell>
                                                <TableCell>{booking.check_in_date ? dayjs(booking.check_in_date).format('DD-MM-YYYY') : ''}</TableCell>
                                                <TableCell>{booking.check_out_date ? dayjs(booking.check_out_date).format('DD-MM-YYYY') : ''}</TableCell>
                                                <TableCell>{booking.room?.name}</TableCell>
                                                <TableCell>{booking.persons}</TableCell>
                                                <TableCell>{durationInDays}</TableCell>
                                                <TableCell>{booking.per_day_charge}</TableCell>
                                                <TableCell>{booking.grand_total}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        bg=""
                                                        style={{
                                                            backgroundColor: booking.status.replace(/_/g, '').toLowerCase() === 'confirmed' ? '#0e5f3c' : '#842029',
                                                            color: 'white',
                                                            padding: '5px 10px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 500,
                                                            minWidth: '100px',
                                                            textAlign: 'center',
                                                            borderRadius: '10px',
                                                            textTransform: 'capitalize',
                                                        }}
                                                    >
                                                        {booking.status.replace(/_/g, ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                        <Button variant="outlined" size="small" color="info" onClick={() => handleShowDocs(booking)} title="View Documents" sx={{ minWidth: 'auto', p: '4px' }}>
                                                            <Visibility fontSize="small" />
                                                        </Button>
                                                        <Button variant="outlined" size="small" color="secondary" onClick={() => handleShowInvoice(booking)}>
                                                            View
                                                        </Button>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={11} align="center">
                                            No bookings found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box display="flex" justifyContent="center" mt={2}>
                        {bookings.links?.map((link, index) => (
                            <Button
                                key={index}
                                onClick={() => link.url && router.visit(link.url)}
                                disabled={!link.url}
                                variant={link.active ? 'contained' : 'outlined'}
                                size="small"
                                style={{
                                    margin: '0 5px',
                                    minWidth: '36px',
                                    padding: '6px 10px',
                                    fontWeight: link.active ? 'bold' : 'normal',
                                    backgroundColor: link.active ? '#333' : '#fff',
                                }}
                            >
                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                            </Button>
                        ))}
                    </Box>

                    {/* Booking Invoice Modal */}
                    <BookingInvoiceModal open={showInvoiceModal} onClose={() => handleCloseInvoice()} bookingId={selectedBooking?.id} setBookings={setFilteredBookings} />

                    {/* View Documents Modal */}
                    <ViewDocumentsModal open={showDocsModal} onClose={handleCloseDocs} bookingId={selectedBookingForDocs?.id} />

                    <Modal show={showFilter} onHide={handleFilterClose} dialogClassName="custom-dialog-right" backdrop={true} keyboard={true}>
                        <Modal.Body style={{ padding: 0, height: '100vh', overflowY: 'auto' }}>
                            <RoomBookingFilter onClose={handleFilterClose} />
                        </Modal.Body>
                    </Modal>
                </Container>
            </ThemeProvider>
            {/* </div> */}
        </>
    );
};

export default RoomScreen;
