import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, TextField, Grid, Divider, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import dayjs from 'dayjs';

const BookingActionModal = ({ open, onClose, booking, action, onConfirm }) => {
    const [reason, setReason] = useState('');

    if (!booking) return null;

    const isCancel = action === 'cancel';
    const title = isCancel ? 'Cancel Booking' : 'Undo Cancellation';
    const confirmText = isCancel ? 'Confirm Cancel' : 'Confirm Undo';
    const confirmColor = isCancel ? 'error' : 'primary';

    const handleConfirm = () => {
        onConfirm(booking.id, reason);
        setReason('');
        onClose();
    };

    const guestName = booking.customer ? booking.customer.name : booking.member ? booking.member.full_name : booking.corporateMember ? booking.corporateMember.full_name : 'N/A';

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
                <Typography variant="h6" component="div" fontWeight="bold" color="#063455">
                    {title}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                        Booking Details:
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                                Booking ID:
                            </Typography>
                            <Typography variant="body1" fontWeight="500">
                                #{booking.booking_no || booking.id}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                                Guest Name:
                            </Typography>
                            <Typography variant="body1" fontWeight="500">
                                {guestName}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                                Room:
                            </Typography>
                            <Typography variant="body1" fontWeight="500">
                                {booking.room?.name || 'N/A'}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                                Dates:
                            </Typography>
                            <Typography variant="body2" fontWeight="500">
                                {dayjs(booking.check_in_date).format('DD/MM/YYYY')} - {dayjs(booking.check_out_date).format('DD/MM/YYYY')}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body1" sx={{ mb: 2 }}>
                    {isCancel ? 'Are you sure you want to cancel this booking? This action can be undone later.' : 'Are you sure you want to undo the cancellation and restore this booking?'}
                </Typography>

                {isCancel && <TextField fullWidth label="Cancellation Reason" multiline rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter reason for cancellation..." variant="outlined" sx={{ mt: 1 }} />}
            </DialogContent>
            <DialogActions sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                <Button onClick={onClose} variant="outlined" color="inherit" sx={{ borderRadius: '8px', textTransform: 'none' }}>
                    Close
                </Button>
                <Button onClick={handleConfirm} variant="contained" color={confirmColor} sx={{ borderRadius: '8px', textTransform: 'none' }}>
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BookingActionModal;
