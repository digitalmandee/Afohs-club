import { useState } from 'react';
import { Typography, Button, Box, Dialog, IconButton, TextField, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { router, usePage } from '@inertiajs/react';

const FamilyFilter = ({ openFilterModal, setOpenFilterModal, members }) => {
    const props = usePage().props;

    const [filters, setFilters] = useState({
        sort: props.filters?.sort || 'asc',
        sortBy: props.filters?.sortBy || 'id',
        membership_no: props.filters?.membership_no || '',
        name: props.filters?.name || '',
        cnic: props.filters?.cnic || '',
        contact: props.filters?.contact || '',
        status: props.filters?.status || 'all',
        member_type: props.filters?.member_type || 'all',
        parent_name: props.filters?.parent_name || '',
        relation: props.filters?.relation || 'all',
        card_status: props.filters?.card_status || 'all',
        min_age: props.filters?.min_age || '',
        max_age: props.filters?.max_age || '',
        age_over_25: props.filters?.age_over_25 || false,
    });

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleResetFilters = () => {
        const reset = {
            sort: 'asc',
            sortBy: 'id',
            membership_no: '',
            name: '',
            cnic: '',
            contact: '',
            status: 'all',
            member_type: 'all',
            parent_name: '',
            relation: 'all',
            card_status: 'all',
            min_age: '',
            max_age: '',
            age_over_25: false,
        };
        setFilters(reset);
        router.get(route('membership.family-members'));
    };

    const handleApplyFilters = () => {
        router.get(route('membership.family-members'), filters, {
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
                    <Typography sx={{ color: '#121212', fontWeight: 500, fontSize: '32px' }}>Member Filter</Typography>
                    <IconButton edge="end" onClick={() => setOpenFilterModal(false)}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Box display="flex" flexDirection="column" gap={2} mb={2}>
                    <TextField label="Membership #" size="small" value={filters.membership_no} onChange={(e) => handleFilterChange('membership_no', e.target.value)} />
                    <TextField label="Name" size="small" value={filters.name} onChange={(e) => handleFilterChange('name', e.target.value)} />
                    <TextField label="CNIC" size="small" value={filters.cnic} onChange={(e) => handleFilterChange('cnic', e.target.value)} />
                    <TextField label="Contact" size="small" value={filters.contact} onChange={(e) => handleFilterChange('contact', e.target.value)} />
                    <TextField label="Member Name" size="small" value={filters.parent_name} onChange={(e) => handleFilterChange('parent_name', e.target.value)} />
                    <TextField label="Min Age" type="number" size="small" value={filters.min_age} onChange={(e) => handleFilterChange('min_age', e.target.value)} />
                    <TextField label="Max Age" type="number" size="small" value={filters.max_age} onChange={(e) => handleFilterChange('max_age', e.target.value)} />
                    <FormControlLabel control={<Checkbox checked={filters.age_over_25} onChange={(e) => handleFilterChange('age_over_25', e.target.checked)} />} label="Show only age over 25" />
                    <TextField select label="Relation" size="small" value={filters.relation} onChange={(e) => handleFilterChange('relation', e.target.value)}>
                        <MenuItem value="all">All</MenuItem>
                        {[...new Set(members.map((m) => m?.relation).filter(Boolean))].map((relation, idx) => (
                            <MenuItem key={idx} value={relation}>
                                {relation}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField select label="Card Status" size="small" value={filters.card_status} onChange={(e) => handleFilterChange('card_status', e.target.value)}>
                        <MenuItem value="all">All</MenuItem>
                        {['In-Process', 'Printed', 'Received', 'Issued', 'Applied', 'Re-Printed', 'Not Applied', 'Expired', 'Not Applicable', 'E-Card Issued'].map((status, idx) => (
                            <MenuItem key={idx} value={status}>
                                {status}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField select label="Status" size="small" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="suspended">Suspended</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                        <MenuItem value="pause">Pause</MenuItem>
                    </TextField>
                    <TextField select label="Member Type" size="small" value={filters.member_type} onChange={(e) => handleFilterChange('member_type', e.target.value)}>
                        <MenuItem value="all">All</MenuItem>
                        {[...new Set(members.map((m) => m?.member_type?.name).filter(Boolean))].map((type, idx) => (
                            <MenuItem key={idx} value={type}>
                                {type}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>

                <Box display="flex" justifyContent="flex-end" gap={1} mt={3}>
                    <Button variant="outlined" onClick={handleResetFilters} sx={{ color: '#333', borderColor: '#ddd', textTransform: 'none' }}>
                        Reset Filter
                    </Button>
                    <Button variant="contained" onClick={handleApplyFilters} sx={{ backgroundColor: '#0a3d62', color: 'white', textTransform: 'none', '&:hover': { backgroundColor: '#083352' } }}>
                        Apply Filters
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
};

export default FamilyFilter;
