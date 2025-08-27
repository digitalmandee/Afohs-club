import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Modal as MuiModal } from '@mui/material';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import RoomCheckInModal from '@/components/App/Rooms/CheckInModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal } from 'react-bootstrap'; // Using react-bootstrap for invoice modal
import { generateInvoiceContent, JSONParse } from '@/helpers/generateTemplate';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const RoomCheckIn = () => {
    const { bookings } = usePage().props;
    const [open, setOpen] = useState(true);

    // ✅ Modal states
    const [showCheckInModal, setShowCheckInModal] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const handleOpenInvoiceModal = (booking) => {
        setSelectedBooking(booking);
        setShowInvoiceModal(true);
    };

    const handleCloseInvoice = () => {
        setShowInvoiceModal(false);
        setSelectedBooking(null);
    };

    const handleOpenCheckInModal = (booking) => {
        setSelectedBooking(booking);
        setShowCheckInModal(true);
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
                <Box sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between">
                        <div className="d-flex align-items-center">
                            <Typography sx={{ marginLeft: '10px', fontWeight: 500, color: '#063455', fontSize: '30px' }}>Room Booking Requests</Typography>
                        </div>
                        <Button
                            variant="contained"
                            startIcon={<span>+</span>}
                            style={{
                                backgroundColor: '#063455',
                                textTransform: 'none',
                                borderRadius: '4px',
                                height: 40,
                            }}
                            onClick={() => router.visit(route('rooms.request.create'))}
                        >
                            Add Room Request
                        </Button>
                    </Box>

                    {/* ✅ Table */}
                    <TableContainer sx={{ marginTop: '20px' }} component={Paper} style={{ boxShadow: 'none' }}>
                        <Table>
                            <TableHead>
                                <TableRow style={{ backgroundColor: '#E5E5EA', height: '60px' }}>
                                    <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Booking Date</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Member / Guest</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Room</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Persons</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Per Day Charge</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {bookings
                                    .filter((booking) => booking.status === 'confirmed') // ✅ Only confirmed bookings
                                    .map((booking) => (
                                        <TableRow key={booking.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <TableCell>{booking.id}</TableCell>
                                            <TableCell>{booking.booking_date}</TableCell>
                                            <TableCell>{booking.customer ? booking.customer.name : booking.member ? booking.member.full_name : ''}</TableCell>
                                            <TableCell>{booking.room?.name}</TableCell>
                                            <TableCell>{booking.persons}</TableCell>
                                            <TableCell>{booking.per_day_charge}</TableCell>
                                            <TableCell>{booking.status}</TableCell>
                                            <TableCell>
                                                <Button variant="outlined" size="small" style={{ marginRight: '8px' }} onClick={() => router.visit(route('rooms.booking.edit', { id: booking.id }))}>
                                                    Edit
                                                </Button>
                                                <Button variant="contained" size="small" color="primary" style={{ marginRight: '8px' }} onClick={() => handleOpenCheckInModal(booking)}>
                                                    Check-In
                                                </Button>
                                                <Button variant="outlined" size="small" color="secondary" onClick={() => handleOpenInvoiceModal(booking)}>
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </div>

            {/* ✅ Invoice Modal */}
            <Modal show={showInvoiceModal} onHide={handleCloseInvoice} className="custom-dialog-right" size="lg" aria-labelledby="invoice-modal-title">
                <Modal.Body>
                    <div
                        dangerouslySetInnerHTML={{
                            __html: selectedBooking ? generateInvoiceContent(selectedBooking) : '',
                        }}
                    />

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

                    {/* ✅ Print Button */}
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

            {/* ✅ Check-In Modal */}
            {showCheckInModal && (
                <RoomCheckInModal
                    open={showCheckInModal}
                    onClose={(status) => {
                        setShowCheckInModal(false);

                        // ✅ If success, update the booking status in local state (better to use state copy)
                        if (status === 'success' && selectedBooking) {
                            bookings.find((b) => b.id === selectedBooking.id).status = 'checked-in';
                        }
                    }}
                    bookingId={selectedBooking?.id} // ✅ Pass booking ID to modal
                />
            )}
        </>
    );
};

export default RoomCheckIn;
