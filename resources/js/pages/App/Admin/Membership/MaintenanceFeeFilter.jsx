import { useState } from 'react';
import { Dialog, Box, Typography, TextField, MenuItem, IconButton, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { router } from '@inertiajs/react';

const MaintenanceFeeFilter = ({ openFilterModal, setOpenFilterModal, filters: initialFilters }) => {
    const [filters, setFilters] = useState({
        category: initialFilters?.category || '',
        status: initialFilters?.status || '',
    });

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleReset = () => {
        setFilters({ category: '', status: '' });
        router.get(route('admin.maintenance.fee.revenue')); // Adjust to your route name
    };

    const handleApply = () => {
        router.get(route('admin.maintenance.fee.revenue'), filters, {
            preserveState: true,
            preserveScroll: true,
        });
        setOpenFilterModal(false);
    };

    return (
        <Dialog
            open={openFilterModal}
            onClose={() => setOpenFilterModal(false)}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                style: {
                    position: 'absolute',
                    top: 0,
                    right: 20,
                    m: 0,
                    width: '600px',
                    borderRadius: 2,
                    p: 2,
                },
            }}
        >
            <Box sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography sx={{ fontSize: 24, fontWeight: 500 }}>Filter Revenue</Typography>
                    <IconButton onClick={() => setOpenFilterModal(false)}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Box display="flex" flexDirection="column" gap={2}>
                    <TextField label="Category" size="small" value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)} />

                    <TextField select label="Status" size="small" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="suspended">Suspended</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                        <MenuItem value="absent">Absent</MenuItem>
                    </TextField>
                </Box>

                <Box display="flex" justifyContent="flex-end" gap={1} mt={4}>
                    <Button variant="outlined" onClick={handleReset}>
                        Reset
                    </Button>
                    <Button variant="contained" onClick={handleApply}>
                        Apply Filters
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
};

export default MaintenanceFeeFilter;
