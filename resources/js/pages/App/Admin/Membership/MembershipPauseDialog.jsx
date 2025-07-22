import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { useState } from 'react';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';

const MembershipPauseDialog = ({ open, onClose, memberId, onSuccess }) => {
    const [loading, setLoading] = useState(false);

    const handleConfirmPause = async () => {
        setLoading(true);

        try {
            const payload = {
                member_id: memberId,
                status: 'pause',
            };

            await axios.post(route('membership.update-status'), payload); // Adjust route if needed
            enqueueSnackbar('Membership paused successfully', { variant: 'success' });
            onClose();
            onSuccess?.('pause');
        } catch (err) {
            console.log(err);
            enqueueSnackbar('Failed to pause membership', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Pause Membership</DialogTitle>
            <DialogContent>
                <Typography>Are you sure you want to pause this membership? This member will be charged 50% of their fee during the paused period.</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button disabled={loading} loading={loading} loadingPosition="start" variant="contained" color="primary" onClick={handleConfirmPause}>
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MembershipPauseDialog;
