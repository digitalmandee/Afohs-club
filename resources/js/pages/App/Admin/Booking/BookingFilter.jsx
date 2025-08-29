'use client';
import { useState } from 'react';
import { Box, Typography, IconButton, Chip, TextField, Button, DialogContent, DialogActions, Collapse } from '@mui/material';
import { Close as CloseIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import { router, usePage } from '@inertiajs/react';

const RoomBookingFilter = ({ onClose }) => {
    const { roomTypes, filters } = usePage().props;

    const [open, setOpen] = useState(true);

    // ✅ Initialize from backend filters
    const [roomType, setRoomType] = useState(filters.room_type || '');
    const [bookingStatus, setBookingStatus] = useState(filters.booking_status || 'all');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const [expanded, setExpanded] = useState({
        roomType: true,
        bookingStatus: true,
        dateRange: true,
    });

    const handleClose = () => {
        setOpen(false);
        if (onClose) onClose();
    };

    const handleRoomTypeChange = (type) => {
        setRoomType((prev) => (prev === type ? '' : type));
    };

    const handleBookingStatusChange = (status) => setBookingStatus(status);

    /** ✅ Apply Filters (backend call using Inertia) */
    const handleApplyFilters = () => {
        router.get(
            route('rooms.manage'),
            {
                room_type: roomType || '',
                booking_status: bookingStatus !== 'all' ? bookingStatus : '',
                start_date: startDate,
                end_date: endDate,
            },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
        handleClose();
    };

    /** ✅ Reset Filters */
    const handleResetFilter = () => {
        setRoomType('');
        setBookingStatus('all');
        setStartDate('');
        setEndDate('');

        router.get(route('rooms.manage'), {}, { preserveScroll: true, preserveState: true, replace: true });
    };

    const toggleSection = (section) => {
        setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    return (
        <Box sx={{ px: 2, py: 1 }}>
            <Box sx={{ px: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="500" fontSize="32px" sx={{ color: '#121212' }}>
                    Room Booking Filter
                </Typography>
                <IconButton onClick={handleClose} size="small">
                    <CloseIcon />
                </IconButton>
            </Box>

            <DialogContent sx={{ p: 2 }}>
                {/* ✅ Room Type Filter */}
                <Box sx={{ mb: 3, px: 2, py: 2, border: '1px solid #E3E3E3' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: expanded.roomType ? 1.5 : 0,
                            cursor: 'pointer',
                        }}
                        onClick={() => toggleSection('roomType')}
                    >
                        <Typography variant="body1" fontWeight="medium">
                            Room Type
                        </Typography>
                        {expanded.roomType ? <ExpandMoreIcon fontSize="small" sx={{ color: '#999' }} /> : <ExpandLessIcon fontSize="small" sx={{ color: '#999' }} />}
                    </Box>
                    <Collapse in={expanded.roomType}>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {roomTypes.map((type) => (
                                <Chip
                                    key={type.id}
                                    label={type.name}
                                    onClick={() => handleRoomTypeChange(type.id)}
                                    sx={{
                                        bgcolor: roomType == type.id ? '#0a3d62' : '#e3f2fd',
                                        color: roomType == type.id ? 'white' : '#333',
                                        '&:hover': {
                                            bgcolor: roomType == type.id ? '#0a3d62' : '#d0e8fd',
                                        },
                                    }}
                                />
                            ))}
                        </Box>
                    </Collapse>
                </Box>

                {/* ✅ Booking Status Filter */}
                <Box sx={{ mb: 3, px: 2, py: 2, border: '1px solid #E3E3E3' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: expanded.bookingStatus ? 1.5 : 0,
                            cursor: 'pointer',
                        }}
                        onClick={() => toggleSection('bookingStatus')}
                    >
                        <Typography variant="body1" fontWeight="medium">
                            Booking Status
                        </Typography>
                        {expanded.bookingStatus ? <ExpandMoreIcon fontSize="small" sx={{ color: '#999' }} /> : <ExpandLessIcon fontSize="small" sx={{ color: '#999' }} />}
                    </Box>
                    <Collapse in={expanded.bookingStatus}>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {['all', 'confirmed', 'pending', 'checked_in', 'checked_out'].map((status) => (
                                <Chip
                                    key={status}
                                    label={status.replace('_', ' ').toUpperCase()}
                                    onClick={() => handleBookingStatusChange(status)}
                                    sx={{
                                        bgcolor: bookingStatus === status ? '#0a3d62' : '#e3f2fd',
                                        color: bookingStatus === status ? 'white' : '#333',
                                        borderRadius: 1,
                                        fontWeight: bookingStatus === status ? 500 : 400,
                                        '&:hover': { bgcolor: bookingStatus === status ? '#0a3d62' : '#d0e8fd' },
                                    }}
                                />
                            ))}
                        </Box>
                    </Collapse>
                </Box>

                {/* ✅ Date Range */}
                <Box sx={{ px: 2, py: 2, border: '1px solid #E3E3E3' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: expanded.dateRange ? 1.5 : 0,
                            cursor: 'pointer',
                        }}
                        onClick={() => toggleSection('dateRange')}
                    >
                        <Typography variant="body1" fontWeight="medium">
                            Date Range
                        </Typography>
                        {expanded.dateRange ? <ExpandMoreIcon fontSize="small" sx={{ color: '#999' }} /> : <ExpandLessIcon fontSize="small" sx={{ color: '#999' }} />}
                    </Box>
                    <Collapse in={expanded.dateRange}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* Start Date */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ width: 80 }}>
                                    Start date
                                </Typography>
                                <TextField type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} fullWidth size="small" sx={{ maxWidth: 300 }} />
                            </Box>
                            {/* End Date */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ width: 80 }}>
                                    End date
                                </Typography>
                                <TextField type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} fullWidth size="small" sx={{ maxWidth: 300 }} />
                            </Box>
                        </Box>
                    </Collapse>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={handleResetFilter} sx={{ borderColor: '#ccc', color: '#333', borderRadius: 1, textTransform: 'none', mr: 1 }}>
                    Reset Filter
                </Button>
                <Button
                    variant="contained"
                    onClick={handleApplyFilters}
                    sx={{
                        bgcolor: '#0a3d62',
                        color: 'white',
                        borderRadius: 1,
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#0c2461' },
                    }}
                >
                    Apply Filters
                </Button>
            </DialogActions>
        </Box>
    );
};

export default RoomBookingFilter;
