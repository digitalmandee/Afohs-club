import { useState } from 'react';
import axios from 'axios';
import { Box, Typography, TextField, Button, Dialog, DialogContent, DialogActions, IconButton, Snackbar } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const MembershipCancellationDialog = ({ open, onClose, memberId, onSuccess }) => {
    const [cancelReason, setCancelReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', error: false });
    const [error, setError] = useState('');

    const handleCancel = async () => {
        if (!cancelReason.trim()) {
            setError('Cancellation reason is required.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const payload = {
                member_id: memberId,
                status: 'cancelled',
                reason: cancelReason,
            };

            await axios.post(route('membership.update-status'), payload); // Adjust route if needed

            setSnackbar({ open: true, message: 'Membership cancelled successfully', error: false });
            onClose();
            onSuccess?.('cancelled'); // Send back updated status
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to cancel membership', error: true });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    position: 'absolute',
                    m: 0,
                    width: '600px',
                    borderRadius: 2,
                    p: 2,
                },
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 500, fontSize: 28 }}>
                    Membership Cancellation
                </Typography>
                <IconButton size="large" sx={{ p: 0 }} onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </Box>

            <DialogContent sx={{ p: 0 }}>
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                    Reason For Cancellation
                </Typography>
                <TextField
                    fullWidth
                    placeholder="Enter cancellation reason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    variant="outlined"
                    error={!!error}
                    helperText={error}
                    sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 1,
                        },
                    }}
                />
            </DialogContent>

            <DialogActions sx={{ p: 0, mt: 4, justifyContent: 'flex-end' }}>
                <Button
                    variant="outlined"
                    onClick={onClose}
                    sx={{
                        borderColor: '#003153',
                        color: '#003153',
                        textTransform: 'none',
                        px: 3,
                        py: 1,
                        mr: 1,
                        borderRadius: 0.5,
                    }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    disabled={loading}
                    onClick={handleCancel}
                    sx={{
                        bgcolor: '#003153',
                        '&:hover': { bgcolor: '#00254d' },
                        textTransform: 'none',
                        px: 3,
                        py: 1,
                        borderRadius: 0.5,
                    }}
                >
                    {loading ? 'Processing...' : 'Confirm Cancellation'}
                </Button>
            </DialogActions>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                ContentProps={{
                    sx: {
                        bgcolor: snackbar.error ? 'error.main' : 'success.main',
                        color: '#fff',
                    },
                }}
            />
        </Dialog>
    );
};

export default MembershipCancellationDialog;
