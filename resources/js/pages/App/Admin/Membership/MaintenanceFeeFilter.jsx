import { useState } from 'react';
import { Box, Typography, TextField, MenuItem, Button, Grid, FormControl, InputLabel, Select, Chip } from '@mui/material';
import { Search } from '@mui/icons-material';
import { router, usePage } from '@inertiajs/react';

const MaintenanceFeeFilter = ({ filters: initialFilters }) => {
    const { all_statuses, all_categories } = usePage().props;
    
    const [filters, setFilters] = useState({
        status: initialFilters?.status || [],
        categories: initialFilters?.categories || [],
        date_from: initialFilters?.date_from || '',
        date_to: initialFilters?.date_to || '',
    });

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleReset = () => {
        setFilters({ 
            status: [], 
            categories: [],
            date_from: '',
            date_to: '',
        });
        router.get(route('membership.maintanance-fee-revenue'));
    };

    const handleApply = () => {
        router.get(route('membership.maintanance-fee-revenue'), filters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <Box sx={{ mb: 3, p: 3, backgroundColor: 'white', borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <Typography sx={{ fontWeight: 600, fontSize: '18px', color: '#063455', mb: 3 }}>
                Search & Filter Options
            </Typography>
            
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                    <TextField
                        fullWidth
                        size="small"
                        type="date"
                        label="From Date"
                        value={filters.date_from}
                        onChange={(e) => handleFilterChange('date_from', e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            },
                        }}
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <TextField
                        fullWidth
                        size="small"
                        type="date"
                        label="To Date"
                        value={filters.date_to}
                        onChange={(e) => handleFilterChange('date_to', e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            },
                        }}
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Member Status</InputLabel>
                        <Select
                            multiple
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
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
                <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Member Categories</InputLabel>
                        <Select
                            multiple
                            value={filters.categories}
                            onChange={(e) => handleFilterChange('categories', e.target.value)}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => {
                                        const category = all_categories?.find(cat => cat.id === value);
                                        return <Chip key={value} label={category?.name || value} size="small" />;
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
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                <Button
                    variant="outlined"
                    onClick={handleReset}
                    sx={{
                        borderColor: '#dc2626',
                        color: '#dc2626',
                        textTransform: 'none',
                        '&:hover': {
                            backgroundColor: '#fef2f2',
                            borderColor: '#dc2626',
                        },
                    }}
                >
                    Reset
                </Button>
                <Button
                    variant="contained"
                    startIcon={<Search />}
                    onClick={handleApply}
                    sx={{
                        backgroundColor: '#063455',
                        textTransform: 'none',
                        '&:hover': {
                            backgroundColor: '#047857',
                        },
                    }}
                >
                    Search
                </Button>
            </Box>
        </Box>
    );
};

export default MaintenanceFeeFilter;
