import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router, usePage } from '@inertiajs/react';
import { TextField, Chip, Box, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Button, InputAdornment, Grid, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { Search, Print, ArrowBack } from '@mui/icons-material';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const MemberCardDetailReport = () => {
    // Get props first
    const { categories, statistics, filters, all_categories, all_card_statuses } = usePage().props;

    // Modal state
    const [open, setOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [allFilters, setAllFilters] = useState({
        categories: filters?.categories || [],
        card_status: filters?.card_status || []
    });

    // Ensure categories is always an array
    const safeCategories = Array.isArray(categories) ? categories : [];
    const safeAllCategories = Array.isArray(all_categories) ? all_categories : [];
    const safeAllCardStatuses = Array.isArray(all_card_statuses) ? all_card_statuses : [];

    const handleSearch = () => {
        setLoading(true);
        router.get(route('membership.member-card-detail-report'), allFilters, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false),
        });
    };


    const handleFilterChange = (field, value) => {
        setAllFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleReset = () => {
        setLoading(true);
        setAllFilters({
            categories: [],
            card_status: []
        });
        router.get(route('membership.member-card-detail-report'), {}, {
            onFinish: () => setLoading(false),
        });
    };

    const getCardStatusColor = (status) => {
        switch (status) {
            case 'Issued':
                return '#059669'; // Green
            case 'Printed':
                return '#0ea5e9'; // Blue
            case 'In-Process':
                return '#f59e0b'; // Orange
            case 'Applied':
                return '#8b5cf6'; // Purple
            case 'Received':
                return '#06b6d4'; // Cyan
            case 'Re-Printed':
                return '#3b82f6'; // Blue
            case 'Expired':
                return '#dc2626'; // Red
            case 'Not Applied':
                return '#6b7280'; // Gray
            case 'Not Applicable':
                return '#9ca3af'; // Light Gray
            case 'E-Card Issued':
                return '#10b981'; // Emerald
            default:
                return '#6b7280';
        }
    };

    const handlePrint = () => {
        // Build query string with current filters
        const params = new URLSearchParams();

        if (allFilters.categories && allFilters.categories.length > 0) {
            allFilters.categories.forEach(cat => params.append('categories[]', cat));
        }

        if (allFilters.card_status && allFilters.card_status.length > 0) {
            allFilters.card_status.forEach(status => params.append('card_status[]', status));
        }

        // Open print page in new window
        const printUrl = route('membership.member-card-detail-report.print') + (params.toString() ? '?' + params.toString() : '');
        window.open(printUrl, '_blank');
    };

    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                    backgroundColor: '#F6F6F6',
                }}
            >
                <div className="container-fluid px-4 py-4" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
                    {/* Top Bar */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="d-flex align-items-center">
                            <IconButton onClick={() => window.history.back()}>
                                <ArrowBack />
                            </IconButton>
                            <Typography sx={{ fontWeight: 500, fontSize: '30px', color: '#063455' }}>
                                Member Card Detail Report
                            </Typography>
                        </div>
                        <Button
                            variant="contained"
                            startIcon={<Print />}
                            onClick={handlePrint}
                            sx={{
                                backgroundColor: '#063455',
                                color: 'white',
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: '#052d47',
                                },
                            }}
                        >
                            Print
                        </Button>
                    </div>

                    {/* Filter Options */}
                    <Box sx={{ mb: 3, p: 3, backgroundColor: 'white', borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '18px', color: '#063455', mb: 3 }}>
                            Filter Options
                        </Typography>

                        {/* Filter Fields */}
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Member Category</InputLabel>
                                    <Select
                                        multiple
                                        value={allFilters.categories}
                                        onChange={(e) => handleFilterChange('categories', e.target.value)}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => {
                                                    const category = safeAllCategories.find(cat => cat.id === value);
                                                    return (
                                                        <Chip key={value} label={category?.name || value} size="small" />
                                                    );
                                                })}
                                            </Box>
                                        )}
                                    >
                                        {safeAllCategories.map((category) => (
                                            <MenuItem key={category.id} value={category.id}>
                                                {category.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Card Status</InputLabel>
                                    <Select
                                        multiple
                                        value={allFilters.card_status}
                                        onChange={(e) => handleFilterChange('card_status', e.target.value)}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => (
                                                    <Chip
                                                        key={value}
                                                        label={value}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: `${getCardStatusColor(value)}20`,
                                                            color: getCardStatusColor(value),
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        )}
                                    >
                                        {safeAllCardStatuses.map((status) => (
                                            <MenuItem key={status} value={status}>
                                                {status}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleSearch}
                                        disabled={loading}
                                        sx={{
                                            backgroundColor: '#059669',
                                            textTransform: 'none',
                                            '&:hover': {
                                                backgroundColor: '#047857',
                                            },
                                        }}
                                    >
                                        {loading ? <CircularProgress size={20} color="inherit" /> : 'Apply Filters'}
                                    </Button>
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
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Member Card Statistics Table */}
                    <Box sx={{ mb: 3 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '20px', color: '#063455', mb: 2 }}>
                            AFOHS Member Card Detail Report
                        </Typography>
                        <TableContainer component={Paper} sx={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderRadius: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow style={{ backgroundColor: '#063455' }}>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Category</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Total Cards Applied</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Issued Primary Members</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Printed Primary Members</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Re-Printed Primary Members</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>E-Card Issued Primary Members</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Pending Cards</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {safeCategories.length > 0 ? (
                                        safeCategories.map((category) => (
                                            <TableRow
                                                key={category.id}
                                                sx={{
                                                    '&:nth-of-type(odd)': { backgroundColor: '#f9fafb' },
                                                    '&:hover': { backgroundColor: '#f3f4f6' },
                                                    borderBottom: '1px solid #e5e7eb'
                                                }}
                                            >
                                                <TableCell sx={{ color: '#374151', fontWeight: 600, fontSize: '14px' }}>
                                                    {category.name}
                                                </TableCell>
                                                <TableCell sx={{ color: '#374151', fontWeight: 500, fontSize: '14px', textAlign: 'center' }}>
                                                    {category.total_cards_applied}
                                                </TableCell>
                                                <TableCell sx={{ color: '#059669', fontWeight: 600, fontSize: '14px', textAlign: 'center' }}>
                                                    {category.issued_primary_members}
                                                </TableCell>
                                                <TableCell sx={{ color: '#0ea5e9', fontWeight: 600, fontSize: '14px', textAlign: 'center' }}>
                                                    {category.printed_primary_members}
                                                </TableCell>
                                                <TableCell sx={{ color: '#3b82f6', fontWeight: 600, fontSize: '14px', textAlign: 'center' }}>
                                                    {category.re_printed_primary_members}
                                                </TableCell>
                                                <TableCell sx={{ color: '#10b981', fontWeight: 600, fontSize: '14px', textAlign: 'center' }}>
                                                    {category.e_card_issued_primary_members}
                                                </TableCell>
                                                <TableCell sx={{ color: '#f59e0b', fontWeight: 600, fontSize: '14px', textAlign: 'center' }}>
                                                    {category.pending_cards}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                                <Typography color="textSecondary">
                                                    {loading ? (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                                                            <CircularProgress size={20} />
                                                            Loading data...
                                                        </Box>
                                                    ) : (
                                                        'No categories found'
                                                    )}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {/* Footer Row */}
                                    {safeCategories.length > 0 && (
                                        <TableRow sx={{ backgroundColor: '#063455', borderTop: '2px solid #374151' }}>
                                            <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '16px' }}>
                                                GRAND TOTAL
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '16px', textAlign: 'center' }}>
                                                {statistics?.total_cards_applied || 0}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '16px', textAlign: 'center' }}>
                                                {statistics?.issued_primary_members || 0}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '16px', textAlign: 'center' }}>
                                                {statistics?.printed_primary_members || 0}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '16px', textAlign: 'center' }}>
                                                {statistics?.re_printed_primary_members || 0}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '16px', textAlign: 'center' }}>
                                                {statistics?.e_card_issued_primary_members || 0}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '16px', textAlign: 'center' }}>
                                                {statistics?.pending_cards || 0}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </div>
            </div>
        </>
    );
};

export default MemberCardDetailReport;
