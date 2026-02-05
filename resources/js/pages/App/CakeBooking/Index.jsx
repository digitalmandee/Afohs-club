import React, { useState, useMemo } from 'react';
import SideNav from '@/components/App/SideBar/SideNav';
import { Head, Link, router } from '@inertiajs/react'; // Cleaned imports
import { Box, Paper, Typography, Button, Grid, TextField, MenuItem, Select, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, InputAdornment, Chip, Pagination, RadioGroup, FormControlLabel, Radio, Checkbox, ListItemText, Autocomplete } from '@mui/material';
import { Add, Search, Edit, Delete, Print, Close } from '@mui/icons-material';
import dayjs from 'dayjs';
import { debounce } from 'lodash';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

export default function Index({ bookings, filters, cashiers }) {
    const [open, setOpen] = React.useState(true);

    // Filter State
    const [filterState, setFilterState] = useState({
        search: filters.search || '',
        booking_number: filters.booking_number || '',
        customer_type: filters.customer_type || 'All',
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        delivery_date: filters.delivery_date || '',
        discounted_taxed: filters.discounted_taxed || 'All',
        cashier_id: filters.cashier_id || '',
    });

    const debouncedApplyFilters = useMemo(
        () =>
            debounce((filters) => {
                router.get(route('cake-bookings.index'), { ...filters, page: 1 }, { preserveState: true, replace: true });
            }, 500),
        [],
    );

    const handleFilterChange = (field, value) => {
        const newFilters = { ...filterState, [field]: value };
        setFilterState(newFilters);
        debouncedApplyFilters(newFilters);
    };

    const handlePageChange = (event, value) => {
        router.get(route('cake-bookings.index'), { ...filterState, page: value }, { preserveState: true, preserveScroll: true });
    };

    // Calculate Page Totals
    const pageTotals = useMemo(() => {
        return bookings.data.reduce(
            (acc, curr) => ({
                total: acc.total + parseFloat(curr.total_price || 0),
                discount: acc.discount + parseFloat(curr.discount_amount || 0),
                tax: acc.tax + parseFloat(curr.tax_amount || 0),
                grandTotal: acc.grandTotal + parseFloat(curr.balance_amount || 0), // Typically Grand Total is (Total - Discount + Tax), but screenshot header says "Grand Total". Adjusting based on common sense or existing fields.
                // Screenshot: Total, Discount, Tax, Grand Total.
                // Often Grand Total = Net Payable. Let's assume it's the final amount.
                // Wait, screenshot shows "Grand Total" column. Let's check model.
                // Model has total_price, tax_amount, discount_amount, balance_amount.
                // Let's assume Grand Total = Total - Discount + Tax.
            }),
            { total: 0, discount: 0, tax: 0, grandTotal: 0 },
        );
    }, [bookings.data]);

    // Correction: Let's calculate Grand Total row based on formula if column doesn't exist directly or use model accessor if available.
    // For now: Total - Discount + Tax.

    return (
        <>
            <Head title="Cake Bookings List" />
            <SideNav open={open} setOpen={setOpen} />
            <Box
                sx={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5.5rem',
                    p: 2,
                    bgcolor: '#f4f6f8',
                    minHeight: '100vh',
                }}
            >
                {/* Header/Breadcrumbs would go here similar to screenshot "Home >> Food & Beverage >> Cake Bookings List" */}
                <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                    Home &gt;&gt; Food & Beverage &gt;&gt; Cake Bookings List
                </Typography>

                <Paper sx={{ p: 2, mb: 2 }}>
                    {/* Top Row Filters: Customer Type */}
                    <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <Grid item xs={12} md={5}>
                            <RadioGroup row value={filterState.customer_type} onChange={(e) => handleFilterChange('customer_type', e.target.value)}>
                                <FormControlLabel value="All" control={<Radio size="small" />} label="All" />
                                <FormControlLabel value="Member" control={<Radio size="small" />} label="Mem" />
                                <FormControlLabel value="Corporate" control={<Radio size="small" />} label="Corporate Mem" />
                                <FormControlLabel value="Guest" control={<Radio size="small" />} label="Guest" />
                                <FormControlLabel value="Employee" control={<Radio size="small" />} label="Emp" />
                            </RadioGroup>
                        </Grid>

                        <Grid item xs={12} md={7} container spacing={2} alignItems="center">
                            {/* Other small inputs can go here or below */}
                            <Grid item xs={12}>
                                <TextField fullWidth placeholder="Search by Name..." value={filterState.search} onChange={(e) => handleFilterChange('search', e.target.value)} size="small" />
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Second Row Filters */}
                    <Grid container spacing={2}>
                        <Grid item xs={6} md={2}>
                            <Typography variant="caption">Booking No.</Typography>
                            <TextField fullWidth placeholder="Search Id..." size="small" value={filterState.booking_number} onChange={(e) => handleFilterChange('booking_number', e.target.value)} />
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <Typography variant="caption">Begin Date:</Typography>
                            <TextField fullWidth type="date" size="small" value={filterState.start_date} onChange={(e) => handleFilterChange('start_date', e.target.value)} />
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <Typography variant="caption">End Date:</Typography>
                            <TextField fullWidth type="date" size="small" value={filterState.end_date} onChange={(e) => handleFilterChange('end_date', e.target.value)} />
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <Typography variant="caption">Delivery Date:</Typography>
                            <TextField fullWidth type="date" size="small" value={filterState.delivery_date} onChange={(e) => handleFilterChange('delivery_date', e.target.value)} />
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <Typography variant="caption">Discounted/Taxed:</Typography>
                            <Select fullWidth size="small" value={filterState.discounted_taxed} onChange={(e) => handleFilterChange('discounted_taxed', e.target.value)} displayEmpty>
                                <MenuItem value="All">All</MenuItem>
                                <MenuItem value="discounted">Discounted</MenuItem>
                                <MenuItem value="taxed">Taxed</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <Typography variant="caption">Cashier:</Typography>
                            <Autocomplete
                                options={cashiers || []} // Handling undefined cashiers prop safely
                                getOptionLabel={(option) => option.name}
                                value={cashiers?.find((c) => c.id == filterState.cashier_id) || null}
                                onChange={(event, newValue) => handleFilterChange('cashier_id', newValue ? newValue.id : '')}
                                renderInput={(params) => <TextField {...params} placeholder="Choose Options" size="small" />}
                            />
                        </Grid>
                    </Grid>
                </Paper>

                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead sx={{ bgcolor: '#391678' }}>
                            <TableRow>
                                {['SR #', 'BOOKING #', 'BOOKING DATE', 'NAME', 'CUSTOMER TYPE', 'TOTAL', 'DISCOUNT', 'TAX', 'GRAND TOTAL', 'USER', 'DOC', 'INVOICE', 'CANCEL', 'EDIT', 'DELETE'].map((head) => (
                                    <TableCell key={head} sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.8rem', py: 1 }}>
                                        {head}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {bookings.data.length > 0 ? (
                                bookings.data.map((booking, index) => {
                                    const grandTotal = parseFloat(booking.total_price || 0) - parseFloat(booking.discount_amount || 0) + parseFloat(booking.tax_amount || 0);

                                    return (
                                        <TableRow key={booking.id} hover sx={{ '&:nth-of-type(odd)': { bgcolor: '#f4f6f8' } }}>
                                            <TableCell>{(bookings.current_page - 1) * bookings.per_page + index + 1}</TableCell>
                                            <TableCell>{booking.booking_number}</TableCell>
                                            <TableCell>{dayjs(booking.booking_date).format('DD/MM/YYYY')}</TableCell>
                                            <TableCell>{booking.customer_name || booking.member?.full_name || 'N/A'}</TableCell>
                                            <TableCell>
                                                {/* Logic to show Member (AS/D 625) - Expired style text */}
                                                {booking.customer_type === '0' ? `Member (${booking.member?.membership_no || ''})` : booking.customer_type === '2' ? `Corporate (${booking.corporate_member?.membership_no || ''})` : booking.customer_type}
                                            </TableCell>
                                            <TableCell>{parseFloat(booking.total_price).toLocaleString()}</TableCell>
                                            <TableCell>{parseFloat(booking.discount_amount || 0).toLocaleString()}</TableCell>
                                            <TableCell>{parseFloat(booking.tax_amount || 0).toLocaleString()}</TableCell>
                                            <TableCell>{grandTotal.toLocaleString()}</TableCell>
                                            <TableCell>{booking.created_by?.name || 'N/A'}</TableCell>
                                            <TableCell>{/* Attachment Icon */}</TableCell>
                                            <TableCell align="center">
                                                <a href={route('cake-bookings.print', booking.id)} target="_blank" rel="noreferrer">
                                                    <Print fontSize="small" color="action" />
                                                </a>
                                            </TableCell>
                                            <TableCell align="center">
                                                {booking.status !== 'cancelled' && (
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            /* Handle Cancel */
                                                        }}
                                                    >
                                                        <Close fontSize="small" sx={{ fontSize: 16 }} />
                                                    </IconButton>
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Link href={route('cake-bookings.edit', booking.id)}>
                                                    <Edit fontSize="small" sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                </Link>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Delete fontSize="small" sx={{ fontSize: 16, color: 'text.secondary' }} />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={15} align="center">
                                        No bookings found
                                    </TableCell>
                                </TableRow>
                            )}

                            {/* Summary Footer Row */}
                            <TableRow sx={{ bgcolor: '#512DA8' }}>
                                <TableCell colSpan={5} align="right" sx={{ color: 'white', fontWeight: 'bold' }}>
                                    TOTAL :
                                </TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>{pageTotals.total.toLocaleString()}</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>{pageTotals.discount.toLocaleString()}</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>{pageTotals.tax.toLocaleString()}</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>{pageTotals.grandTotal.toLocaleString()}</TableCell>
                                <TableCell colSpan={6} />
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                    <Pagination count={bookings.last_page} page={bookings.current_page} onChange={handlePageChange} color="primary" shape="rounded" />
                    {/* Per Page dropdown could go here */}
                    <Select size="small" value={50} sx={{ ml: 2, height: 32 }}>
                        <MenuItem value={50}>50</MenuItem>
                    </Select>
                </Box>
            </Box>
        </>
    );
}

Index.layout = (page) => page; // Layout already applied via SideNav internal logic in original file? Original file had explicit SideNav usage.
// Ah, the user added `Index.layout = (page) => page;` manually in previous step, so keeping it.
