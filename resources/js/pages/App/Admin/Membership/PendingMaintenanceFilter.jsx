import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem, Chip, Box, TextField, Grid } from '@mui/material';
import { router, usePage } from '@inertiajs/react';

const PendingMaintenanceFilter = ({ open, onClose, filters }) => {
    const { all_statuses, all_categories } = usePage().props;
    
    const [localFilters, setLocalFilters] = useState({
        status: filters?.status || [],
        categories: filters?.categories || [],
        date_from: filters?.date_from || '',
        date_to: filters?.date_to || '',
    });

    useEffect(() => {
        setLocalFilters({
            status: filters?.status || [],
            categories: filters?.categories || [],
            date_from: filters?.date_from || '',
            date_to: filters?.date_to || '',
        });
    }, [filters]);

    const handleReset = () => {
        setLocalFilters({ 
            status: [], 
            categories: [], 
            date_from: '', 
            date_to: '' 
        });
        router.get(route('membership.pending-maintenance-report'));
        onClose();
    };

    const handleApply = () => {
        router.get(route('membership.pending-maintenance-report'), localFilters, {
            preserveState: true,
            preserveScroll: true,
        });
        onClose();
    };

    const handleStatusChange = (event) => {
        const value = typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value;
        setLocalFilters(prev => ({ ...prev, status: value }));
    };

    const handleCategoryChange = (event) => {
        const value = typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value;
        setLocalFilters(prev => ({ ...prev, categories: value }));
    };

    const handleDateChange = (field, value) => {
        setLocalFilters(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 600, color: '#063455' }}>
                Filter Pending Maintenance Report
            </DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 2 }}>
                    <Grid container spacing={3}>
                        {/* Status Filter */}
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Member Status</InputLabel>
                                <Select
                                    multiple
                                    value={localFilters.status}
                                    onChange={handleStatusChange}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip key={value} label={value} size="small" />
                                            ))}
                                        </Box>
                                    )}
                                >
                                    {all_statuses && all_statuses.map((status) => (
                                        <MenuItem key={status} value={status}>
                                            {status}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Category Filter */}
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Member Category</InputLabel>
                                <Select
                                    multiple
                                    value={localFilters.categories}
                                    onChange={handleCategoryChange}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => {
                                                const category = all_categories?.find(cat => cat.id === value);
                                                return (
                                                    <Chip key={value} label={category?.name || value} size="small" />
                                                );
                                            })}
                                        </Box>
                                    )}
                                >
                                    {all_categories && all_categories.map((category) => (
                                        <MenuItem key={category.id} value={category.id}>
                                            {category.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Date From */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="date"
                                label="From Date"
                                value={localFilters.date_from}
                                onChange={(e) => handleDateChange('date_from', e.target.value)}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>

                        {/* Date To */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="date"
                                label="To Date"
                                value={localFilters.date_to}
                                onChange={(e) => handleDateChange('date_to', e.target.value)}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button 
                    onClick={handleReset}
                    sx={{ 
                        color: '#6B7280',
                        textTransform: 'none',
                        '&:hover': {
                            backgroundColor: '#f3f4f6',
                        },
                    }}
                >
                    Reset
                </Button>
                <Button 
                    onClick={onClose}
                    sx={{ 
                        color: '#6B7280',
                        textTransform: 'none',
                        '&:hover': {
                            backgroundColor: '#f3f4f6',
                        },
                    }}
                >
                    Cancel
                </Button>
                <Button 
                    onClick={handleApply}
                    variant="contained"
                    sx={{
                        backgroundColor: '#063455',
                        textTransform: 'none',
                        '&:hover': {
                            backgroundColor: '#052d47',
                        },
                    }}
                >
                    Apply Filters
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PendingMaintenanceFilter;
