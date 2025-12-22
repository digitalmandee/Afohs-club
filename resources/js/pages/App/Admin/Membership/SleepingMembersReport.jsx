import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { router, usePage } from '@inertiajs/react';
import { TextField, Chip, Box, IconButton, Paper, Table, Autocomplete, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Button, InputAdornment, Grid, FormControl, InputLabel, Select, MenuItem, Pagination } from '@mui/material';
import { Search, Print, ArrowBack } from '@mui/icons-material';

const SleepingMembersReport = () => {
    // Get props first
    const { categories, primary_members, statistics, filters, all_categories, all_member_statuses } = usePage().props;

    // Modal state
    // const [open, setOpen] = useState(true);
    const [allFilters, setAllFilters] = useState({
        categories: filters?.categories || [],
        status: filters?.status || []
    });

    const handleSearch = () => {
        router.get(route('membership.sleeping-members-report'), allFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePageChange = (event, page) => {
        router.get(route('membership.sleeping-members-report'), {
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
            categories: [],
            status: []
        });
        router.get(route('membership.sleeping-members-report'));
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return '#059669'; // Green
            case 'suspended':
                return '#dc2626'; // Red
            case 'cancelled':
                return '#6b7280'; // Gray
            case 'absent':
                return '#f59e0b'; // Orange
            case 'expired':
                return '#dc2626'; // Red
            case 'terminated':
                return '#374151'; // Dark Gray
            case 'not_assign':
                return '#9ca3af'; // Light Gray
            case 'in_suspension_process':
                return '#d97706'; // Orange
            default:
                return '#6b7280';
        }
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-GB');
    };

    const handlePrint = () => {
        // Build query string with current filters and page
        const params = new URLSearchParams();

        if (allFilters.categories && allFilters.categories.length > 0) {
            allFilters.categories.forEach(cat => params.append('categories[]', cat));
        }

        if (allFilters.status && allFilters.status.length > 0) {
            allFilters.status.forEach(status => params.append('status[]', status));
        }

        // Add current page number
        if (primary_members?.current_page) {
            params.append('page', primary_members.current_page);
        }

        // Open print page in new window
        const printUrl = route('membership.sleeping-members-report.print') + (params.toString() ? '?' + params.toString() : '');
        window.open(printUrl, '_blank');
    };

    return (
        <>
            {/* <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                    backgroundColor: '#F6F6F6',
                }}
            > */}
            <div className="container-fluid px-4 py-4" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', overflowX: 'hidden' }}>
                {/* Top Bar */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center">
                        <IconButton onClick={() => window.history.back()}>
                            <ArrowBack sx={{ color: '#063455' }} />
                        </IconButton>
                        <Typography sx={{ fontWeight: 600, fontSize: '24px', color: '#063455' }}>
                            Sleeping Members Report
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
                            {/* <FormControl fullWidth size="small">
                                    <InputLabel>Member Category</InputLabel>
                                    <Select
                                        multiple
                                        value={allFilters.categories}
                                        onChange={(e) => handleFilterChange('categories', e.target.value)}
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
                                </FormControl> */}
                            <Autocomplete
                                multiple
                                value={all_categories?.filter(cat => allFilters.categories?.includes(cat.id)) || []}
                                onChange={(event, newValue) => {
                                    const categoryIds = newValue.map(cat => cat.id);
                                    handleFilterChange('categories', categoryIds);
                                }}
                                options={all_categories || []}
                                getOptionLabel={(option) => option.name || ''}
                                isOptionEqualToValue={(option, value) => option.id === value?.id}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            key={option.id}
                                            label={option.name}
                                            size="small"
                                            {...getTagProps({ index })}
                                        />
                                    ))
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Member Category"
                                        placeholder="Select categories"
                                        size="small"
                                        fullWidth
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            {/* <FormControl fullWidth size="small">
                                <InputLabel>Member Status</InputLabel>
                                <Select
                                    multiple
                                    value={allFilters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip
                                                    key={value}
                                                    label={value.replace('_', ' ').toUpperCase()}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: `${getStatusColor(value)}20`,
                                                        color: getStatusColor(value),
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    )}
                                >
                                    {all_member_statuses && all_member_statuses.map((status) => (
                                        <MenuItem key={status} value={status}>
                                            {status.replace('_', ' ').toUpperCase()}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl> */}
                            <Autocomplete
                                multiple
                                value={all_member_statuses?.filter(status => allFilters.status?.includes(status)) || []}
                                onChange={(event, newValue) => {
                                    const statusValues = newValue.map(status => status);
                                    handleFilterChange('status', statusValues);
                                }}
                                options={all_member_statuses || []}
                                getOptionLabel={(option) => option.replace('_', ' ').toUpperCase()}
                                isOptionEqualToValue={(option, value) => option === value}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            key={option}
                                            label={option.replace('_', ' ').toUpperCase()}
                                            size="small"
                                            {...getTagProps({ index })}
                                            sx={{
                                                backgroundColor: `${getStatusColor(option)}20`,
                                                color: getStatusColor(option),
                                            }}
                                        />
                                    ))
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Member Status"
                                        placeholder="Select statuses"
                                        size="small"
                                        fullWidth
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                    variant="contained"
                                    onClick={handleSearch}
                                    sx={{
                                        backgroundColor: '#059669',
                                        textTransform: 'none',
                                        '&:hover': {
                                            backgroundColor: '#047857',
                                        },
                                    }}
                                >
                                    Apply Filters
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

                {/* Members Detail Table */}
                <Box sx={{ mb: 3 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '20px', color: '#063455', mb: 2 }}>
                        Sleeping Members Details
                    </Typography>
                    <TableContainer component={Paper} sx={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderRadius: 2, overflowX: 'auto' }}>
                        <Table>
                            <TableHead>
                                <TableRow style={{ backgroundColor: '#063455' }}>
                                    <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>SR #</TableCell>
                                    <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>ID</TableCell>
                                    <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Membership No</TableCell>
                                    <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Member Name</TableCell>
                                    <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Category</TableCell>
                                    <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Membership Date</TableCell>
                                    <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Member Type</TableCell>
                                    <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Status</TableCell>
                                    <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Last Updated</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {primary_members?.data && primary_members.data.length > 0 ? (
                                    primary_members.data.map((member, index) => (
                                        <TableRow
                                            key={member.id}
                                            sx={{
                                                '&:nth-of-type(odd)': { backgroundColor: '#f9fafb' },
                                                '&:hover': { backgroundColor: '#f3f4f6' },
                                                borderBottom: '1px solid #e5e7eb'
                                            }}
                                        >
                                            <TableCell sx={{ color: '#374151', fontWeight: 500, fontSize: '14px' }}>
                                                {index + 1}
                                            </TableCell>
                                            <TableCell sx={{ color: '#374151', fontWeight: 600, fontSize: '14px' }}>
                                                {member.id}
                                            </TableCell>
                                            <TableCell sx={{ color: '#374151', fontWeight: 500, fontSize: '14px' }}>
                                                {member.membership_no}
                                            </TableCell>
                                            <TableCell sx={{ color: '#374151', fontWeight: 600, fontSize: '14px' }}>
                                                {member.full_name}
                                            </TableCell>
                                            <TableCell sx={{ color: '#6B7280', fontWeight: 400, fontSize: '14px' }}>
                                                {member.member_category?.name || 'N/A'}
                                            </TableCell>
                                            <TableCell sx={{ color: '#6B7280', fontWeight: 400, fontSize: '14px' }}>
                                                {formatDate(member.created_at)}
                                            </TableCell>
                                            <TableCell sx={{ color: '#6B7280', fontWeight: 400, fontSize: '14px' }}>
                                                Provisional
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={member.status?.replace('_', ' ').toUpperCase()}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: `${getStatusColor(member.status)}20`,
                                                        color: getStatusColor(member.status),
                                                        fontWeight: 600,
                                                        textTransform: 'uppercase'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ color: '#6B7280', fontWeight: 400, fontSize: '14px' }}>
                                                {formatDate(member.updated_at)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                                            <Typography color="textSecondary">
                                                No sleeping members found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {/* Footer Row */}
                                {primary_members?.data && primary_members.data.length > 0 && (
                                    <TableRow sx={{ backgroundColor: '#063455', borderTop: '2px solid #374151' }}>
                                        <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '16px' }} colSpan={4}>
                                            TOTAL ({statistics?.total_members || 0} Members)
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '14px' }}>
                                            Active: {statistics?.active || 0}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '14px' }}>
                                            Suspended: {statistics?.suspended || 0}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '14px' }}>
                                            Expired: {statistics?.expired || 0}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '14px' }}>
                                            Others: {(statistics?.cancelled || 0) + (statistics?.absent || 0) + (statistics?.terminated || 0)}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '14px' }}>
                                            In Process: {statistics?.in_suspension_process || 0}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination */}
                    {primary_members?.data && primary_members.data.length > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <Pagination
                                count={primary_members.last_page}
                                page={primary_members.current_page}
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
                    {primary_members?.data && primary_members.data.length > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <Typography variant="body2" color="textSecondary">
                                Showing {primary_members.from} to {primary_members.to} of {primary_members.total} results
                            </Typography>
                        </Box>
                    )}
                </Box>
            </div>
            {/* </div> */}
        </>
    );
};

export default SleepingMembersReport;
