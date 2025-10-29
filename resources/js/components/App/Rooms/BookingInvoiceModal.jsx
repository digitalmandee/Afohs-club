import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Stack } from '@mui/material';
import { Button } from 'react-bootstrap'; // Added Modal import for popup

import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { generateInvoiceContent, JSONParse } from '@/helpers/generateTemplate';
import RoomCheckInModal from './CheckInModal';
import { router } from '@inertiajs/react';

const BookingInvoiceModal = ({ open, onClose, bookingId, setBookings }) => {
    const [loading, setLoading] = useState(false);
    const [showCheckInModal, setShowCheckInModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        if (!bookingId || !open) return;

        setLoading(true);
        axios
            .get(route('rooms.invoice', { id: bookingId }))
            .then((res) => {
                setSelectedBooking(res.data.booking);
            })
            .catch((error) => {
                enqueueSnackbar('Failed to load booking data.', { variant: 'error' });
            })
            .finally(() => setLoading(false));
    }, [bookingId, open]);

    const handleStatusUpdate = (newStatus) => {
        if (!selectedBooking) return;

        setSelectedBooking((prev) => ({ ...prev, status: newStatus }));

        if (setBookings) {
            setBookings((prev) => prev.map((booking) => (booking.id === selectedBooking.id ? { ...booking, status: newStatus } : booking)));
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
                <DialogContent>
                    {loading ? (
                        <Stack alignItems="center" py={3}>
                            <CircularProgress />
                        </Stack>
                    ) : (
                        <>
                            {selectedBooking && (
                                <>
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
                                </>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                    {selectedBooking?.status === 'confirmed' && (
                        <Button variant="secondary" onClick={() => setShowCheckInModal(true)}>
                            Check In
                        </Button>
                    )}
                    {selectedBooking?.status === 'checked_in' && (
                        <Button variant="secondary" onClick={() => router.visit(route('rooms.edit.booking', { id: selectedBooking.id, type: 'checkout' }))}>
                            Check Out
                        </Button>
                    )}
                    {!['checked_out', 'cancelled', 'no_show', 'refunded'].includes(selectedBooking?.status) ? (
                        <Button variant="secondary" onClick={() => router.visit(route('rooms.edit.booking', { id: selectedBooking?.id }))}>
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
                </DialogActions>
            </Dialog>

            {/* Room Checkin Modal  */}
            <RoomCheckInModal
                open={showCheckInModal}
                onClose={(status) => {
                    setShowCheckInModal(false);
                    if (status === 'success') {
                        handleStatusUpdate('checked_in');
                    }
                }}
                bookingId={selectedBooking?.id}
            />
        </>
    );
};

export default BookingInvoiceModal;
