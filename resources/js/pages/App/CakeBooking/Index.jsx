import React, { useState, useEffect } from 'react';
import SideNav from '@/components/App/SideBar/SideNav';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Box, Paper, Typography, Button, Grid, TextField, MenuItem, Select, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, InputAdornment, Chip, Pagination } from '@mui/material';
import { Add, Search, Edit, Delete, Print, Visibility } from '@mui/icons-material';
import dayjs from 'dayjs';
import { debounce } from 'lodash';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

export default function Index({ bookings, filters }) {
    const { props } = usePage();
    const [open, setOpen] = React.useState(true);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [dateRange, setDateRange] = useState({
        start: filters.start_date || '',
        end: filters.end_date || '',
    });

    // Debounced search
    const handleSearch = (val) => {
        setSearchTerm(val);
        applyFilters(val, statusFilter, dateRange);
    };

    const applyFilters = debounce((search, status, dates) => {
        router.get(
            route('cake-bookings.index'),
            {
                search: search,
                status: status,
                start_date: dates.start,
                end_date: dates.end,
                page: 1,
            },
            { preserveState: true, replace: true },
        );
    }, 500);

    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
        applyFilters(searchTerm, e.target.value, dateRange);
    };

    const handleDateChange = (field, value) => {
        const newRange = { ...dateRange, [field]: value };
        setDateRange(newRange);
        applyFilters(searchTerm, statusFilter, newRange);
    };

    const handlePageChange = (event, value) => {
        router.get(
            route('cake-bookings.index'),
            {
                search: searchTerm,
                status: statusFilter,
                start_date: dateRange.start,
                end_date: dateRange.end,
                page: value,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Cake Bookings" />
            <SideNav open={open} setOpen={setOpen} />
            <Box
                sx={{
                    p: 3,
                }}
            >
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#003B5C' }}>
                        Cake Bookings
                    </Typography>
                    <Button component={Link} href={route('cake-bookings.create')} variant="contained" startIcon={<Add />} sx={{ bgcolor: '#003B5C', '&:hover': { bgcolor: '#002a41' } }}>
                        New Booking
                    </Button>
                </Box>

                {/* Filters */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                placeholder="Search by Booking #, Name, Phone..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                }}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Status</InputLabel>
                                <Select value={statusFilter} label="Status" onChange={handleStatusChange}>
                                    <MenuItem value="">All Statuses</MenuItem>
                                    <MenuItem value="pending">Pending</MenuItem>
                                    <MenuItem value="completed">Completed</MenuItem>
                                    <MenuItem value="cancelled">Cancelled</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField fullWidth type="date" label="From Date" InputLabelProps={{ shrink: true }} value={dateRange.start} onChange={(e) => handleDateChange('start', e.target.value)} size="small" />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField fullWidth type="date" label="To Date" InputLabelProps={{ shrink: true }} value={dateRange.end} onChange={(e) => handleDateChange('end', e.target.value)} size="small" />
                        </Grid>
                    </Grid>
                </Paper>

                {/* Table */}
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell>
                                    <strong>Booking #</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Date</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Customer</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Cake Type</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Status</strong>
                                </TableCell>
                                <TableCell align="right">
                                    <strong>Total</strong>
                                </TableCell>
                                <TableCell align="right">
                                    <strong>Advance</strong>
                                </TableCell>
                                <TableCell align="right">
                                    <strong>Balance</strong>
                                </TableCell>
                                <TableCell align="center">
                                    <strong>Actions</strong>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {bookings.data.length > 0 ? (
                                bookings.data.map((booking) => (
                                    <TableRow key={booking.id} hover>
                                        <TableCell>{booking.booking_number}</TableCell>
                                        <TableCell>
                                            <Box display="flex" flexDirection="column">
                                                <Typography variant="body2" fontWeight="bold">
                                                    {dayjs(booking.booking_date).format('DD/MM/YYYY')}
                                                </Typography>
                                                {booking.delivery_date && (
                                                    <Typography variant="caption" color="textSecondary">
                                                        Del: {dayjs(booking.delivery_date).format('DD/MM/YYYY')}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="500">
                                                {booking.customer_name || booking.member?.full_name || 'N/A'}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {booking.customer_type}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{booking.cake_type?.name || 'Unknown'}</TableCell>
                                        <TableCell>
                                            <Chip label={booking.status.toUpperCase()} size="small" color={booking.status === 'completed' ? 'success' : booking.status === 'cancelled' ? 'error' : 'warning'} />
                                        </TableCell>
                                        <TableCell align="right">{parseFloat(booking.total_price).toLocaleString()}</TableCell>
                                        <TableCell align="right">{parseFloat(booking.advance_amount).toLocaleString()}</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold', color: booking.balance_amount > 0 ? 'error.main' : 'success.main' }}>
                                            {parseFloat(booking.balance_amount).toLocaleString()}
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton component={Link} href={route('cake-bookings.edit', booking.id)} size="small" color="primary" title="Edit">
                                                <Edit fontSize="small" />
                                            </IconButton>
                                            <a href={route('cake-bookings.print', booking.id)} target="_blank" rel="noreferrer">
                                                <IconButton size="small" color="info" title="Print Invoice">
                                                    <Print fontSize="small" />
                                                </IconButton>
                                            </a>
                                            {/* Delete? */}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                                        No bookings found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                {bookings.last_page > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Pagination count={bookings.last_page} page={bookings.current_page} onChange={handlePageChange} color="primary" shape="rounded" />
                    </Box>
                )}
            </Box>
        </>
    );
}
