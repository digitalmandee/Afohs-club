import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router, usePage } from '@inertiajs/react';
import { TextField, Chip, IconButton, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Button, InputAdornment, Grid, FormControl, InputLabel, Select, MenuItem, Pagination } from '@mui/material';
import { Search, Print, ArrowBack } from '@mui/icons-material';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const PendingMaintenanceReport = () => {
    // Get props first
    const { members, statistics, filters, all_statuses, all_categories } = usePage().props;

    // Modal state
    const [open, setOpen] = useState(true);
    const [allFilters, setAllFilters] = useState({
        member_search: filters?.member_search || '',
        cnic_search: filters?.cnic_search || '',
        contact_search: filters?.contact_search || '',
        status: filters?.status || [],
        categories: filters?.categories || [],
        date_from: filters?.date_from || '',
        date_to: filters?.date_to || '',
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-GB');
    };

    const handleSearch = () => {
        router.get(route('membership.pending-maintenance-report'), allFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePageChange = (event, page) => {
        router.get(
            route('membership.pending-maintenance-report'),
            {
                ...allFilters,
                page: page,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleFilterChange = (field, value) => {
        setAllFilters((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleReset = () => {
        setAllFilters({
            member_search: '',
            cnic_search: '',
            contact_search: '',
            status: [],
            categories: [],
            date_from: '',
            date_to: '',
        });
        router.get(route('membership.pending-maintenance-report'));
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'success';
            case 'suspended':
                return 'error';
            case 'in suspension process':
                return 'warning';
            default:
                return 'default';
        }
    };

    const getPendingQuartersColor = (quarters) => {
        if (quarters >= 4) return '#dc2626'; // Red - Critical
        if (quarters >= 2) return '#d97706'; // Orange - Warning
        return '#059669'; // Green - Normal
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
                            <Typography sx={{ fontWeight: 500, fontSize: '30px', color: '#063455' }}>Pending Maintenance Report</Typography>
                        </div>
                        <Button
                            variant="contained"
                            startIcon={<Print />}
                            onClick={() => {
                                const currentUrl = new URL(window.location.href);
                                const printUrl = currentUrl.pathname + '/print' + currentUrl.search;
                                window.open(printUrl, '_blank');
                            }}
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

                    {/* Search and Filters */}
                    <Box sx={{ mb: 3, p: 3, backgroundColor: 'white', borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '18px', color: '#063455', mb: 3 }}>Search & Filter Options</Typography>

                        {/* Search Fields */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} md={2.5}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Search Member ID"
                                    value={allFilters.member_search}
                                    onChange={(e) => handleFilterChange('member_search', e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search sx={{ color: 'action.active' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={2.5}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Search by Name"
                                    value={allFilters.member_search}
                                    onChange={(e) => handleFilterChange('member_search', e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={2.5}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Search CNIC"
                                    value={allFilters.cnic_search}
                                    onChange={(e) => handleFilterChange('cnic_search', e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={2.5}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Search Contact (Phone)"
                                    value={allFilters.contact_search}
                                    onChange={(e) => handleFilterChange('contact_search', e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={handleSearch}
                                    sx={{
                                        backgroundColor: '#063455',
                                        height: '40px',
                                        textTransform: 'none',
                                        '&:hover': {
                                            backgroundColor: '#047857',
                                        },
                                    }}
                                >
                                    Search
                                </Button>
                            </Grid>
                        </Grid>

                        {/* Filter Fields */}
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={2.5}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Member Status</InputLabel>
                                    <Select
                                        multiple
                                        value={allFilters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => (
                                                    <Chip key={value} label={value} size="small" />
                                                ))}
                                            </Box>
                                        )}
                                    >
                                        {all_statuses &&
                                            all_statuses.map((status) => (
                                                <MenuItem key={status} value={status}>
                                                    {status}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={2.5}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Member Category</InputLabel>
                                    <Select
                                        multiple
                                        value={allFilters.categories}
                                        onChange={(e) => handleFilterChange('categories', e.target.value)}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => {
                                                    const category = all_categories?.find((cat) => cat.id === value);
                                                    return <Chip key={value} label={category?.name || value} size="small" />;
                                                })}
                                            </Box>
                                        )}
                                    >
                                        {all_categories &&
                                            all_categories.map((category) => (
                                                <MenuItem key={category.id} value={category.id}>
                                                    {category.name}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={2.5}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="date"
                                    label="From Date"
                                    value={allFilters.date_from}
                                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={2.5}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="date"
                                    label="To Date"
                                    value={allFilters.date_to}
                                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={handleReset}
                                    sx={{
                                        borderColor: '#dc2626',
                                        color: '#dc2626',
                                        height: '40px',
                                        textTransform: 'none',
                                        '&:hover': {
                                            backgroundColor: '#fef2f2',
                                            borderColor: '#dc2626',
                                        },
                                    }}
                                >
                                    Reset
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Pending Maintenance Table */}
                    <Box sx={{ mb: 3 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '20px', color: '#063455', mb: 2 }}>Pending Maintenance Details</Typography>
                        <TableContainer component={Paper} sx={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderRadius: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow style={{ backgroundColor: '#063455' }}>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>SR #</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>ID</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Membership Date</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Member #</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Name</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Contact</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Address</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Maintenance Per Quarter</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Total Debit</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Total Credit</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Total Balance</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Status</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Print</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {members?.data &&
                                        members.data.length > 0 &&
                                        members.data.map((member, index) => (
                                            <TableRow
                                                key={member.id}
                                                sx={{
                                                    '&:nth-of-type(odd)': { backgroundColor: '#f9fafb' },
                                                    '&:hover': { backgroundColor: '#f3f4f6' },
                                                    borderBottom: '1px solid #e5e7eb',
                                                }}
                                            >
                                                <TableCell sx={{ color: '#374151', fontWeight: 500, fontSize: '14px' }}>{index + 1}</TableCell>
                                                <TableCell sx={{ color: '#374151', fontWeight: 600, fontSize: '14px' }}>{member.id}</TableCell>
                                                <TableCell sx={{ color: '#6B7280', fontWeight: 400, fontSize: '14px' }}>{formatDate(member.membership_date)}</TableCell>
                                                <TableCell sx={{ color: '#374151', fontWeight: 500, fontSize: '14px' }}>{member.membership_no}</TableCell>
                                                <TableCell sx={{ color: '#374151', fontWeight: 600, fontSize: '14px' }}>{member.full_name}</TableCell>
                                                <TableCell sx={{ color: '#6B7280', fontWeight: 400, fontSize: '14px' }}>{member.contact}</TableCell>
                                                <TableCell sx={{ color: '#6B7280', fontWeight: 400, fontSize: '12px' }}>{member.address || 'N/A'}</TableCell>
                                                <TableCell sx={{ color: '#059669', fontWeight: 600, fontSize: '14px' }}>{formatCurrency(member.quarterly_fee).replace('PKR', 'Rs.')}</TableCell>
                                                <TableCell sx={{ color: '#dc2626', fontWeight: 600, fontSize: '14px' }}>{formatCurrency(member.total_debit_amount || 0).replace('PKR', 'Rs.')}</TableCell>
                                                <TableCell sx={{ color: '#059669', fontWeight: 600, fontSize: '14px' }}>{formatCurrency(member.total_paid_amount || 0).replace('PKR', 'Rs.')}</TableCell>
                                                <TableCell
                                                    sx={{
                                                        color: getPendingQuartersColor(member.pending_quarters),
                                                        fontWeight: 700,
                                                        fontSize: '14px',
                                                    }}
                                                >
                                                    {formatCurrency(member.total_pending_amount).replace('PKR', 'Rs.')}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={member.status} color={getStatusColor(member.status)} size="small" sx={{ textTransform: 'capitalize' }} />
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{
                                                            color: '#dc2626',
                                                            borderColor: '#dc2626',
                                                            fontSize: '12px',
                                                            textTransform: 'none',
                                                            '&:hover': {
                                                                backgroundColor: '#fef2f2',
                                                                borderColor: '#dc2626',
                                                            },
                                                        }}
                                                    >
                                                        Unpaid
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}

                                    {/* Footer Row */}
                                    {members?.data && members.data.length > 0 && (
                                        <TableRow sx={{ backgroundColor: '#063455', borderTop: '2px solid #374151' }}>
                                            <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '16px' }} colSpan={7}>
                                                TOTAL ({statistics?.total_members || 0} Members)
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '16px' }}>{formatCurrency(statistics?.average_pending_per_member || 0).replace('PKR', 'Rs.')}</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '16px' }}>Rs. 0</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '16px' }}>Rs. 0</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '16px' }}>{formatCurrency(statistics?.total_pending_amount || 0).replace('PKR', 'Rs.')}</TableCell>
                                            <TableCell colSpan={2} sx={{ fontWeight: 700, color: 'white', fontSize: '14px' }}>
                                                {statistics?.total_pending_quarters || 0} Quarters Pending
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        {members?.data && members.data.length > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                <Pagination
                                    count={members.last_page}
                                    page={members.current_page}
                                    onChange={handlePageChange}
                                    color="primary"
                                    size="large"
                                    showFirstButton
                                    showLastButton
                                    sx={{
                                        '& .MuiPaginationItem-root': {
                                            fontSize: '16px',
                                        },
                                    }}
                                />
                            </Box>
                        )}

                        {/* Pagination Info */}
                        {members?.data && members.data.length > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                <Typography variant="body2" color="textSecondary">
                                    Showing {members.from} to {members.to} of {members.total} results
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </div>
            </div>
        </>
    );
};

export default PendingMaintenanceReport;
