import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, CircularProgress, Stack } from '@mui/material';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';

const RoomCheckInModal = ({ open, onClose, bookingId }) => {
    const [loading, setLoading] = useState(false);
    const [checkInDate, setCheckInDate] = useState('');
    const [checkInTime, setCheckInTime] = useState(new Date().toISOString().slice(11, 16));
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!bookingId || !open) return;

        setLoading(true);
        axios
            .get(route('api.room.booking.show', { id: bookingId }))
            .then((res) => {
                setCheckInDate(res.data.booking.check_in_date || '');
            })
            .catch(() => {
                enqueueSnackbar('Failed to load check-in date.', { variant: 'error' });
            })
            .finally(() => setLoading(false));
    }, [bookingId, open]);

    const handleSubmit = () => {
        if (!checkInTime) return enqueueSnackbar('Check-in time is required.', { variant: 'warning' });

        setSubmitting(true);
        axios
            .post(route('api.room.booking.checkin'), {
                booking_id: bookingId,
                check_in_date: checkInDate,
                check_in_time: checkInTime,
            })
            .then((res) => {
                enqueueSnackbar('Check-in successful.', { variant: 'success' });
                onClose(); // close modal after success
            })
            .catch((err) => {
                if (err.response?.data?.message) {
                    alert(err.response.data.message);
                } else {
                    alert('Check-in failed.');
                }
            })
            .finally(() => setSubmitting(false));
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Check In Guest</DialogTitle>
            <DialogContent>
                {loading ? (
                    <Stack alignItems="center" py={3}>
                        <CircularProgress />
                    </Stack>
                ) : (
                    <Stack spacing={2} mt={1}>
                        <TextField label="Check In Date" value={checkInDate} disabled fullWidth />
                        <TextField label="Select Check In Time" type="time" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
                    </Stack>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="outlined" disabled={submitting}>
                    Cancel
                </Button>
                <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading || submitting}>
                    {submitting ? 'Submitting...' : 'Submit'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RoomCheckInModal;
