import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router, usePage } from '@inertiajs/react';
import { TextField, Chip, Box, Paper, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Button, InputAdornment, Grid, FormControl, InputLabel, Select, MenuItem, Pagination } from '@mui/material';
import { Search, Print, ArrowBack } from '@mui/icons-material';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const SportsSubscriptionsReport = () => {
    // Get props first
    const { transactions, statistics, filters, all_cities, all_payment_methods, all_categories, all_genders, all_family_members } = usePage().props;

    // Modal state
    const [open, setOpen] = useState(true);
    const [allFilters, setAllFilters] = useState({
        member_search: filters?.member_search || '',
        invoice_search: filters?.invoice_search || '',
        date_from: filters?.date_from || '',
        date_to: filters?.date_to || '',
        city: filters?.city || '',
        payment_method: filters?.payment_method || '',
        categories: filters?.categories || [],
        gender: filters?.gender || '',
        family_member: filters?.family_member || '',
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
        router.get(route('membership.sports-subscriptions-report'), allFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePageChange = (event, page) => {
        router.get(route('membership.sports-subscriptions-report'), {
            ...allFilters,
            page: page
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleFilterChange = (field, value) => {
        setAllFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleReset = () => {
        setAllFilters({
            member_search: '',
            invoice_search: '',
            date_from: '',
            date_to: '',
            city: '',
            payment_method: '',
            categories: [],
            gender: '',
            family_member: '',
        });
        router.get(route('membership.sports-subscriptions-report'));
    };

    const getPaymentMethodColor = (method) => {
        switch (method?.toLowerCase()) {
            case 'cash':
                return '#059669'; // Green
            case 'credit card':
                return '#0ea5e9'; // Blue
            case 'bank transfer':
                return '#8b5cf6'; // Purple
            case 'cheque':
                return '#f59e0b'; // Orange
            default:
                return '#6b7280';
        }
    };

    const getFamilyMemberColor = (relation) => {
        switch (relation) {
            case 'SELF':
                return '#059669'; // Green
            case 'Son':
            case 'Daughter':
                return '#0ea5e9'; // Blue
            case 'Wife':
            case 'Husband':
                return '#8b5cf6'; // Purple
            case 'Father':
            case 'Mother':
                return '#f59e0b'; // Orange
            default:
                return '#6b7280'; // Gray
        }
    };

    const handlePrint = () => {
        // Build query string with current filters and page
        const params = new URLSearchParams();

        if (allFilters.member_search) {
            params.append('member_search', allFilters.member_search);
        }

        if (allFilters.invoice_search) {
            params.append('invoice_search', allFilters.invoice_search);
        }

        if (allFilters.date_from) {
            params.append('date_from', allFilters.date_from);
        }

        if (allFilters.date_to) {
            params.append('date_to', allFilters.date_to);
        }

        if (allFilters.city) {
            params.append('city', allFilters.city);
        }

        if (allFilters.payment_method) {
            params.append('payment_method', allFilters.payment_method);
        }

        if (allFilters.gender) {
            params.append('gender', allFilters.gender);
        }

        if (allFilters.family_member) {
            params.append('family_member', allFilters.family_member);
        }

        if (allFilters.categories && allFilters.categories.length > 0) {
            allFilters.categories.forEach(cat => params.append('categories[]', cat));
        }

        // Add current page number
        if (transactions?.current_page) {
            params.append('page', transactions.current_page);
        }

        // Open print page in new window
        const printUrl = route('membership.sports-subscriptions-report.print') + (params.toString() ? '?' + params.toString() : '');
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
                            <Typography sx={{ fontWeight: 500, fontSize: '30px', color: '#063455' }}>Sports Subscriptions Report</Typography>
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

                    {/* Search and Filters */}
                    <Box sx={{ mb: 3, p: 3, backgroundColor: 'white', borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '18px', color: '#063455', mb: 3 }}>Search & Filter Options</Typography>

                        {/* Search Fields */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} md={2}>
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
                            <Grid item xs={12} md={2}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Search by Invoice No"
                                    value={allFilters.invoice_search}
                                    onChange={(e) => handleFilterChange('invoice_search', e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="date"
                                    label="Begin Date"
                                    value={allFilters.date_from}
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
                            <Grid item xs={12} md={2}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="date"
                                    label="End Date"
                                    value={allFilters.date_to}
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
                            <Grid item xs={12} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>All Genders</InputLabel>
                                    <Select
                                        value={allFilters.gender}
                                        onChange={(e) => handleFilterChange('gender', e.target.value)}
                                    >
                                        <MenuItem value="">All Genders</MenuItem>
                                        {all_genders && all_genders.map((gender) => (
                                            <MenuItem key={gender} value={gender}>
                                                {gender}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Details</InputLabel>
                                    <Select
                                        value={allFilters.family_member}
                                        onChange={(e) => handleFilterChange('family_member', e.target.value)}
                                    >
                                        <MenuItem value="">All</MenuItem>
                                        {all_family_members && all_family_members.map((member) => (
                                            <MenuItem key={member} value={member}>
                                                {member}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        {/* Filter Fields Row 2 */}
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={2.4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Choose Payment Method</InputLabel>
                                    <Select
                                        value={allFilters.payment_method}
                                        onChange={(e) => handleFilterChange('payment_method', e.target.value)}
                                    >
                                        <MenuItem value="">All Methods</MenuItem>
                                        {all_payment_methods && all_payment_methods.map((method) => (
                                            <MenuItem key={method} value={method}>
                                                {method}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={2.4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Choose Categories</InputLabel>
                                    <Select
                                        multiple
                                        value={allFilters.categories}
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
                            <Grid item xs={12} md={2.4}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={handleSearch}
                                    sx={{
                                        backgroundColor: '#059669',
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
                            <Grid item xs={12} md={2.4}>
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

                    {/* Sports Subscriptions Table */}
                    <Box sx={{ mb: 3 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '20px', color: '#063455', mb: 2 }}>Sports Subscriptions List</Typography>
                        <TableContainer component={Paper} sx={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderRadius: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow style={{ backgroundColor: '#063455' }}>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Invoice #</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Subscriber Name</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Member Name</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Type</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Family Member</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Start Date</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>End Date</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Amount</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Membership #</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Payment Method</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Category</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>User</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {transactions?.data && transactions.data.length > 0 ? (
                                        transactions.data.map((transaction, index) => (
                                            <TableRow
                                                key={transaction.id}
                                                sx={{
                                                    '&:nth-of-type(odd)': { backgroundColor: '#f9fafb' },
                                                    '&:hover': { backgroundColor: '#f3f4f6' },
                                                    borderBottom: '1px solid #e5e7eb',
                                                }}
                                            >
                                                <TableCell sx={{ color: '#374151', fontWeight: 600, fontSize: '14px' }}>{transaction.invoice_no}</TableCell>
                                                <TableCell sx={{ color: '#374151', fontWeight: 600, fontSize: '14px' }}>{transaction.member?.full_name}</TableCell>
                                                <TableCell sx={{ color: '#374151', fontWeight: 500, fontSize: '14px' }}>{transaction.member?.full_name}</TableCell>
                                                <TableCell sx={{ color: '#6B7280', fontWeight: 400, fontSize: '14px' }}>
                                                    {transaction.data?.subscription_type_name || 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={transaction.data?.family_member_relation || 'SELF'}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: `${getFamilyMemberColor(transaction.data?.family_member_relation)}20`,
                                                            color: getFamilyMemberColor(transaction.data?.family_member_relation),
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ color: '#6B7280', fontWeight: 400, fontSize: '14px' }}>{formatDate(transaction.valid_from)}</TableCell>
                                                <TableCell sx={{ color: '#6B7280', fontWeight: 400, fontSize: '14px' }}>{formatDate(transaction.valid_to)}</TableCell>
                                                <TableCell sx={{ color: '#059669', fontWeight: 600, fontSize: '14px' }}>{formatCurrency(transaction.total_price).replace('PKR', 'Rs.')}</TableCell>
                                                <TableCell sx={{ color: '#374151', fontWeight: 500, fontSize: '14px' }}>{transaction.member?.membership_no}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={transaction.payment_method}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: `${getPaymentMethodColor(transaction.payment_method)}20`,
                                                            color: getPaymentMethodColor(transaction.payment_method),
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ color: '#6B7280', fontWeight: 400, fontSize: '14px' }}>
                                                    {transaction.data?.subscription_category_name || 'N/A'}
                                                </TableCell>
                                                <TableCell sx={{ color: '#6B7280', fontWeight: 400, fontSize: '14px' }}>
                                                    System
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
                                                <Typography color="textSecondary">
                                                    No sports subscription records found
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {/* Footer Row */}
                                    {transactions?.data && transactions.data.length > 0 && (
                                        <TableRow sx={{ backgroundColor: '#063455', borderTop: '2px solid #374151' }}>
                                            <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '16px' }} colSpan={7}>
                                                TOTAL ({statistics?.total_transactions || 0} Subscriptions)
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '16px' }}>
                                                {formatCurrency(statistics?.total_amount || 0).replace('PKR', 'Rs.')}
                                            </TableCell>
                                            <TableCell colSpan={4} sx={{ fontWeight: 700, color: 'white', fontSize: '14px' }}>
                                                Sports Subscriptions Collection Report
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        {transactions?.data && transactions.data.length > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                <Pagination
                                    count={transactions.last_page}
                                    page={transactions.current_page}
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
                        {transactions?.data && transactions.data.length > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                <Typography variant="body2" color="textSecondary">
                                    Showing {transactions.from} to {transactions.to} of {transactions.total} results
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </div>
            </div>
        </>
    );
};

export default SportsSubscriptionsReport;
