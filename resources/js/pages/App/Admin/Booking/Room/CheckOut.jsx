import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Modal } from '@mui/material';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import 'bootstrap/dist/css/bootstrap.min.css';

import { generateInvoiceContent, JSONParse } from '@/helpers/generateTemplate';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const RoomCheckOut = () => {
    const { bookings } = usePage().props;
    const [open, setOpen] = useState(true);

    // ✅ State for Invoice Modal
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    // ✅ Open Invoice Modal
    const handleOpenInvoice = (booking) => {
        setSelectedBooking(booking);
        setShowInvoiceModal(true);
    };

    // ✅ Close Invoice Modal
    const handleCloseInvoice = () => {
        setShowInvoiceModal(false);
        setSelectedBooking(null);
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
                            <Typography
                                sx={{
                                    marginLeft: '10px',
                                    fontWeight: 500,
                                    color: '#063455',
                                    fontSize: '30px',
                                }}
                            >
                                Room Booking Requests
                            </Typography>
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
                                    .filter((booking) => booking.status === 'checked_in') // ✅ Show only checked-in bookings
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
                                                <Button variant="outlined" size="small" style={{ marginRight: '8px' }} onClick={() => router.visit(route('rooms.booking.edit', { id: booking.id, type: 'checkout' }))}>
                                                    Check Out
                                                </Button>
                                                <Button variant="outlined" size="small" color="secondary" onClick={() => handleOpenInvoice(booking)}>
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
            <Modal
                open={showInvoiceModal}
                onClose={handleCloseInvoice}
                aria-labelledby="invoice-modal-title"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Box
                    sx={{
                        width: '80%',
                        bgcolor: 'white',
                        p: 3,
                        borderRadius: 2,
                        maxHeight: '90vh',
                        overflowY: 'auto',
                    }}
                >
                    {/* ✅ Render Invoice HTML */}
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
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                        <Button variant="outlined" onClick={handleCloseInvoice}>
                            Close
                        </Button>
                        {selectedBooking?.invoice?.status === 'unpaid' && (
                            <Button variant="contained" color="success" onClick={() => router.visit(route('booking.payment', { invoice_no: selectedBooking?.invoice?.id }))}>
                                Pay Now
                            </Button>
                        )}
                        {selectedBooking?.invoice?.status === 'paid' && (
                            <Button variant="outlined" color="success" disabled>
                                Paid
                            </Button>
                        )}
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
                    </Box>
                </Box>
            </Modal>
        </>
    );
};

export default RoomCheckOut;
