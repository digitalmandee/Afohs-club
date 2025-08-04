import { useState } from 'react';
import { Typography, Button, Box, Dialog, Collapse, Chip, IconButton, TextField, MenuItem } from '@mui/material';
import { Close as CloseIcon, KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material';
import { router, usePage } from '@inertiajs/react';

const styles = {
    root: {
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
    },
    tabButton: {
        borderRadius: '20px',
        margin: '0 5px',
        textTransform: 'none',
        fontWeight: 'normal',
        padding: '6px 16px',
        border: '1px solid #00274D',
        color: '#00274D',
    },
    activeTabButton: {
        backgroundColor: '#0a3d62',
        color: 'white',
        borderRadius: '20px',
        margin: '0 5px',
        textTransform: 'none',
        fontWeight: 'normal',
        padding: '6px 16px',
    },
    filterSection: {
        mb: 3,
        border: '1px solid #eee',
        borderRadius: '8px',
        p: 2,
        backgroundColor: '#fff',
        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.05)',
    },
    filterHeader: {
        p: 0,
        mb: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
};

const MembershipDashboardFilter = ({ openFilterModal, setOpenFilterModal, members }) => {
    const props = usePage().props;

    const [filters, setFilters] = useState({
        sort: props.filters?.sort || 'asc',
        sortBy: props.filters?.sortBy || 'id',
        orderType: props.filters?.orderType || 'all',
        memberStatus: props.filters?.memberStatus || 'all',
        orderStatus: props.filters?.orderStatus || 'all',
        targetDate: props.filters?.targetDate || '',
        membership_no: props.filters?.membership_no || '',
        name: props.filters?.name || '',
        cnic: props.filters?.cnic || '',
        contact: props.filters?.contact || '',
        card_status: props.filters?.card_status || 'all',
        status: props.filters?.status || 'all',
        member_type: props.filters?.member_type || 'all',
    });

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleResetFilters = () => {
        const reset = {
            sort: 'asc',
            sortBy: 'id',
            orderType: 'all',
            memberStatus: 'all',
            orderStatus: 'all',
            targetDate: '',
            membership_no: '',
            name: '',
            cnic: '',
            contact: '',
            status: 'all',
            member_type: 'all',
        };
        setFilters(reset);

        router.get(route('membership.members'));
    };

    const handleApplyFilters = () => {
        router.get(route('membership.members'), filters, {
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
                        {props.memberTypes.map((type, idx) => (
                            <MenuItem key={idx} value={type.name}>
                                {type.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>

                {/* Sorting and chip filter sections remain as they are... */}

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

export default MembershipDashboardFilter;
