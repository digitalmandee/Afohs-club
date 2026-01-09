'use client';
import { useState } from 'react';
import { Box, Typography, IconButton, Chip, Button, Dialog, Collapse, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Close as CloseIcon, KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material';

const styles = {
    filterSection: {
        marginBottom: '24px',
        border: '1px solid #eee',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#fff',
        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.05)',
    },
    filterHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer',
    },
};

const TransactionFilter = ({ open, onClose, currentFilters, onApply }) => {
    const [expandedSections, setExpandedSections] = useState({
        status: true,
        type: true,
        date: true,
    });

    const [filters, setFilters] = useState({
        status: currentFilters?.status || 'all',
        type: currentFilters?.type || 'all',
        start_date: currentFilters?.start_date || null,
        end_date: currentFilters?.end_date || null,
    });

    const toggleSection = (section) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleApply = () => {
        // Convert dates to standard format if they are Dayjs objects
        const appliedFilters = {
            ...filters,
            start_date: filters.start_date ? dayjs(filters.start_date).format('YYYY-MM-DD') : '',
            end_date: filters.end_date ? dayjs(filters.end_date).format('YYYY-MM-DD') : '',
        };
        onApply(appliedFilters);
        onClose();
    };

    const handleReset = () => {
        const resetFilters = {
            status: 'all',
            type: 'all',
            start_date: null,
            end_date: null,
        };
        setFilters(resetFilters);
        // Optional: auto-apply reset or wait for user to click Apply
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                style: {
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    margin: 0,
                    width: '600px',
                    borderRadius: 8,
                    padding: 16,
                },
            }}
        >
            <Box sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography sx={{ color: '#121212', fontWeight: 500, fontSize: '24px' }}>Filter Transactions</Typography>
                    <IconButton onClick={onClose} edge="end">
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Status Section */}
                <Box style={styles.filterSection}>
                    <Box style={styles.filterHeader} onClick={() => toggleSection('status')}>
                        <Typography sx={{ color: '#121212', fontSize: '14px', fontWeight: 500 }}>Status</Typography>
                        <KeyboardArrowDownIcon
                            sx={{
                                transform: expandedSections.status ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s',
                            }}
                        />
                    </Box>
                    <Collapse in={expandedSections.status}>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {['all', 'paid', 'unpaid', 'cancelled'].map((status) => (
                                <Chip
                                    key={status}
                                    label={status.charAt(0).toUpperCase() + status.slice(1)}
                                    onClick={() => handleFilterChange('status', status)}
                                    sx={{
                                        backgroundColor: filters.status === status ? '#063455' : '#e0e0e0',
                                        color: filters.status === status ? '#fff' : '#000',
                                        cursor: 'pointer',
                                    }}
                                />
                            ))}
                        </Box>
                    </Collapse>
                </Box>

                {/* Type Section */}
                <Box style={styles.filterSection}>
                    <Box style={styles.filterHeader} onClick={() => toggleSection('type')}>
                        <Typography sx={{ color: '#121212', fontSize: '14px', fontWeight: 500 }}>Transaction Type</Typography>
                        <KeyboardArrowDownIcon
                            sx={{
                                transform: expandedSections.type ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s',
                            }}
                        />
                    </Box>
                    <Collapse in={expandedSections.type}>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {[
                                { label: 'All', value: 'all' },
                                { label: 'Membership', value: 'membership_fee' },
                                { label: 'Subscription', value: 'subscription_fee' },
                                { label: 'Maintenance', value: 'maintenance_fee' },
                                { label: 'Event', value: 'event_booking' },
                                { label: 'Room', value: 'room_booking' },
                            ].map((type) => (
                                <Chip
                                    key={type.value}
                                    label={type.label}
                                    onClick={() => handleFilterChange('type', type.value)}
                                    sx={{
                                        backgroundColor: filters.type === type.value ? '#063455' : '#e0e0e0',
                                        color: filters.type === type.value ? '#fff' : '#000',
                                        cursor: 'pointer',
                                    }}
                                />
                            ))}
                        </Box>
                    </Collapse>
                </Box>

                {/* Date Range Section */}
                <Box style={styles.filterSection}>
                    <Box style={styles.filterHeader} onClick={() => toggleSection('date')}>
                        <Typography sx={{ color: '#121212', fontSize: '14px', fontWeight: 500 }}>Date Range</Typography>
                        <KeyboardArrowDownIcon
                            sx={{
                                transform: expandedSections.date ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s',
                            }}
                        />
                    </Box>
                    <Collapse in={expandedSections.date}>
                        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker label="Start Date" value={filters.start_date ? dayjs(filters.start_date) : null} onChange={(newValue) => handleFilterChange('start_date', newValue)} format="DD-MM-YYYY" slotProps={{ textField: { fullWidth: true, size: 'small' } }} />
                                <DatePicker label="End Date" value={filters.end_date ? dayjs(filters.end_date) : null} onChange={(newValue) => handleFilterChange('end_date', newValue)} format="DD-MM-YYYY" slotProps={{ textField: { fullWidth: true, size: 'small' } }} />
                            </LocalizationProvider>
                        </Box>
                    </Collapse>
                </Box>

                {/* Footer Buttons */}
                <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                    <Button variant="outlined" onClick={handleReset} sx={{ color: '#333', borderColor: '#ddd' }}>
                        Reset
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleApply}
                        sx={{
                            backgroundColor: '#0a3d62',
                            color: 'white',
                            '&:hover': { backgroundColor: '#083352' },
                        }}
                    >
                        Apply Filters
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
};

export default TransactionFilter;
