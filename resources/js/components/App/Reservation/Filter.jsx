import { useState } from 'react';
import { Box, Typography, Button, TextField, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { router, usePage } from '@inertiajs/react';

const ReservationFilter = ({ onClose }) => {
    const { filters } = usePage().props;

    const [status, setStatus] = useState(filters.status || 'all');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const applyFilters = () => {
        router.get(
            route('reservations.index'),
            {
                status: status !== 'all' ? status : '',
                start_date: startDate,
                end_date: endDate,
            },
            { preserveScroll: true, preserveState: true, replace: true },
        );
        if (onClose) onClose();
    };

    const resetFilters = () => {
        setStatus('all');
        setStartDate('');
        setEndDate('');
        router.get(route('reservations.index'), {}, { preserveScroll: true, preserveState: true, replace: true });
    };

    return (
        <Box sx={{ padding: 3, width: '300px', background: '#fff', border: '1px solid #ddd' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Filter Reservations</Typography>
                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* Status Filter */}
            <Box mb={2}>
                <Typography>Status</Typography>
                <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: '100%', padding: '8px' }}>
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </Box>

            {/* Date Range */}
            <Box mb={2}>
                <Typography>Start Date</Typography>
                <TextField type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} fullWidth size="small" />
            </Box>
            <Box mb={2}>
                <Typography>End Date</Typography>
                <TextField type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} fullWidth size="small" />
            </Box>

            <Box display="flex" justifyContent="flex-end" gap={1}>
                <Button variant="outlined" onClick={resetFilters}>
                    Reset
                </Button>
                <Button variant="contained" onClick={applyFilters}>
                    Apply
                </Button>
            </Box>
        </Box>
    );
};

export default ReservationFilter;
