import { useState } from 'react';
import { Typography, Button, Box, Dialog, IconButton, TextField, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { router, usePage } from '@inertiajs/react';

const FamilyFilter = () => {
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
    };

    return (
        <Box backgroundColor="white" mb={3} p={2}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(5, 1fr)' } }} gap={2} mb={2}>
                <TextField label="Membership #" size="small" value={filters.membership_no} onChange={(e) => handleFilterChange('membership_no', e.target.value)} fullWidth />
                <TextField label="Name" size="small" value={filters.name} onChange={(e) => handleFilterChange('name', e.target.value)} fullWidth />
                <TextField label="CNIC" size="small" value={filters.cnic} onChange={(e) => handleFilterChange('cnic', e.target.value)} fullWidth />
                <TextField label="Contact" size="small" value={filters.contact} onChange={(e) => handleFilterChange('contact', e.target.value)} fullWidth />
                <TextField label="Member Name" size="small" value={filters.parent_name} onChange={(e) => handleFilterChange('parent_name', e.target.value)} fullWidth />
                <TextField label="Min Age" type="number" size="small" value={filters.min_age} onChange={(e) => handleFilterChange('min_age', e.target.value)} fullWidth />
                <TextField label="Max Age" type="number" size="small" value={filters.max_age} onChange={(e) => handleFilterChange('max_age', e.target.value)} fullWidth />
                <FormControlLabel control={<Checkbox checked={filters.age_over_25} onChange={(e) => handleFilterChange('age_over_25', e.target.checked)} />} label="Age over 25" />
                <TextField select label="Relation" size="small" value={filters.relation} onChange={(e) => handleFilterChange('relation', e.target.value)} fullWidth>
                    <MenuItem value="all">All</MenuItem>
                    {['Father', 'Son', 'Daughter', 'Wife', 'Mother', 'Grand Son', 'Grand Daughter', 'Second Wife', 'Husband', 'Sister', 'Brother', 'Nephew', 'Niece', 'Father in law', 'Mother in Law'].map((relation, idx) => (
                        <MenuItem key={idx} value={relation}>
                            {relation}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField select label="Card Status" size="small" value={filters.card_status} onChange={(e) => handleFilterChange('card_status', e.target.value)} fullWidth>
                    <MenuItem value="all">All</MenuItem>
                    {['In-Process', 'Printed', 'Received', 'Issued', 'Applied', 'Re-Printed', 'Not Applied', 'Expired', 'Not Applicable', 'E-Card Issued'].map((status, idx) => (
                        <MenuItem key={idx} value={status}>
                            {status}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField select label="Status" size="small" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} fullWidth>
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                    <MenuItem value="pause">Pause</MenuItem>
                </TextField>
                <TextField select label="Member Type" size="small" value={filters.member_type} onChange={(e) => handleFilterChange('member_type', e.target.value)} fullWidth>
                    <MenuItem value="all">All</MenuItem>
                    {props.memberTypes.map((type, idx) => (
                        <MenuItem key={idx} value={type.id}>
                            {type.name}
                        </MenuItem>
                    ))}
                </TextField>
                <Box display="flex" justifyContent="flex-end" gap={1}>
                    <Button variant="outlined" size="small" onClick={handleResetFilters} sx={{ width: '100%', color: '#333', borderColor: '#ddd', textTransform: 'none' }}>
                        Reset
                    </Button>
                    <Button variant="contained" size="small" onClick={handleApplyFilters} sx={{ width: '100%', backgroundColor: '#0a3d62', color: 'white', textTransform: 'none', '&:hover': { backgroundColor: '#083352' } }}>
                        Sort
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default FamilyFilter;
