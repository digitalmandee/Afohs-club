'use client';
import { useState, useMemo, useEffect } from 'react';
import { Box, Button, TextField, FormControl, Select, MenuItem, Grid, Chip, Autocomplete, Typography, Checkbox, ListItemText } from '@mui/material';
import axios from 'axios';
import { Search } from '@mui/icons-material';
import { router, usePage } from '@inertiajs/react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { styled } from '@mui/material/styles';
import debounce from 'lodash.debounce';

const RoundedTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '16px',
    },
});

const RoomBookingFilter = ({ routeName = 'rooms.manage', showStatus = true, showRoomType = true, showDates = { booking: true, checkIn: true, checkOut: true } }) => {
    const { props } = usePage();
    const { filters, roomTypes, rooms } = props; // Receive rooms prop

    // Local state for filters
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [searchId, setSearchId] = useState(filters.search_id || '');
    const [customerType, setCustomerType] = useState(filters.customer_type || 'all');

    const [bookingDateFrom, setBookingDateFrom] = useState(filters.booking_date_from ? dayjs(filters.booking_date_from) : null);
    const [bookingDateTo, setBookingDateTo] = useState(filters.booking_date_to ? dayjs(filters.booking_date_to) : null);

    const [checkInFrom, setCheckInFrom] = useState(filters.check_in_from || '');
    const [checkInTo, setCheckInTo] = useState(filters.check_in_to || '');

    const [checkOutFrom, setCheckOutFrom] = useState(filters.check_out_from || '');
    const [checkOutTo, setCheckOutTo] = useState(filters.check_out_to || '');

    const [selectedRoomTypes, setSelectedRoomTypes] = useState(filters.room_type ? filters.room_type.split(',') : []);
    const [selectedRooms, setSelectedRooms] = useState(filters.room_ids ? filters.room_ids.split(',') : []); // New State
    const [selectedStatus, setSelectedStatus] = useState(filters.booking_status ? filters.booking_status.split(',') : []);

    // Suggestions State
    const [suggestions, setSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    // Fetch Suggestions
    const fetchSuggestions = useMemo(
        () =>
            debounce(async (query, type) => {
                if (!query) {
                    setSuggestions([]);
                    return;
                }
                setLoadingSuggestions(true);
                try {
                    const response = await axios.get(route('api.bookings.search-customers'), {
                        params: { query, type },
                    });
                    setSuggestions(response.data);
                } catch (error) {
                    console.error('Error fetching suggestions:', error);
                } finally {
                    setLoadingSuggestions(false);
                }
            }, 300),
        [],
    );

    useEffect(() => {
        if (searchTerm) {
            fetchSuggestions(searchTerm, customerType);
        } else {
            setSuggestions([]);
        }
    }, [searchTerm, customerType]); // Re-fetch if type changes while searching

    const handleApply = () => {
        const filterParams = {};

        if (searchTerm) filterParams.search = searchTerm;
        if (searchId) filterParams.search_id = searchId;
        if (customerType && customerType !== 'all') filterParams.customer_type = customerType;

        if (bookingDateFrom) filterParams.booking_date_from = bookingDateFrom.format('YYYY-MM-DD');
        if (bookingDateTo) filterParams.booking_date_to = bookingDateTo.format('YYYY-MM-DD');

        if (checkInFrom) filterParams.check_in_from = checkInFrom;
        if (checkInTo) filterParams.check_in_to = checkInTo;

        if (checkOutFrom) filterParams.check_out_from = checkOutFrom;
        if (checkOutTo) filterParams.check_out_to = checkOutTo;

        if (selectedRoomTypes.length > 0) filterParams.room_type = selectedRoomTypes.join(',');
        if (selectedRooms.length > 0) filterParams.room_ids = selectedRooms.join(',');
        if (selectedStatus.length > 0) filterParams.booking_status = selectedStatus.join(',');

        router.get(route(routeName), filterParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearchTerm('');
        setSearchId('');
        setCustomerType('all');
        setBookingDateFrom(null);
        setBookingDateTo(null);
        setCheckInFrom('');
        setCheckInTo('');
        setCheckOutFrom('');
        setCheckOutTo('');
        setSelectedRoomTypes([]);
        setSelectedRooms([]);
        setSelectedStatus([]);

        router.get(route(routeName), {}, { preserveState: true, preserveScroll: true });
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ mb: 3, mt: 3, boxShadow: 'none' }}>
                <Grid container spacing={2} alignItems="center">
                    {/* Customer Type Selection */}
                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}>
                            <Select value={customerType} onChange={(e) => setCustomerType(e.target.value)} displayEmpty>
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="member">Member</MenuItem>
                                <MenuItem value="corporate">Corporate Member</MenuItem>
                                <MenuItem value="guest">Guest</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Search by Name with Autocomplete */}
                    <Grid item xs={12} md={2}>
                        <Autocomplete
                            freeSolo
                            options={suggestions}
                            getOptionLabel={(option) => option.value || option} // Use value (name) for input text
                            inputValue={searchTerm}
                            onInputChange={(event, newInputValue) => {
                                setSearchTerm(newInputValue);
                            }}
                            renderInput={(params) => <TextField {...params} fullWidth size="small" label="Search Name" placeholder="Guest Name..." sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }} />}
                            renderOption={(props, option) => (
                                <li {...props} key={option.id || option.label}>
                                    <Box sx={{ width: '100%' }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography variant="body2" fontWeight="bold">
                                                {option.membership_no || option.customer_no || option.employee_id}
                                            </Typography>
                                            {option.status && (
                                                <Chip
                                                    label={option.status}
                                                    size="small"
                                                    sx={{
                                                        height: '20px',
                                                        fontSize: '10px',
                                                        backgroundColor: option.status === 'active' ? '#e8f5e9' : option.status === 'suspended' ? '#fff3e0' : '#ffebee',
                                                        color: option.status === 'active' ? '#2e7d32' : option.status === 'suspended' ? '#ef6c00' : '#c62828',
                                                        textTransform: 'capitalize',
                                                        ml: 1,
                                                    }}
                                                />
                                            )}
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            {option.name || option.label}
                                        </Typography>
                                    </Box>
                                </li>
                            )}
                        />
                    </Grid>

                    {/* Search by ID */}
                    <Grid item xs={12} md={2}>
                        <TextField fullWidth size="small" label="Booking ID" placeholder="Booking ID..." value={searchId} onChange={(e) => setSearchId(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }} />
                    </Grid>

                    {/* Booking Date Range */}
                    {showDates.booking && (
                        <>
                            <Grid item xs={12} md={2}>
                                <DatePicker label="Booking From" format="DD-MM-YYYY" value={bookingDateFrom ? dayjs(bookingDateFrom) : null} onChange={(newValue) => setBookingDateFrom(newValue ? newValue.format('YYYY-MM-DD') : '')} enableAccessibleFieldDOMStructure={false} slots={{ textField: RoundedTextField }} slotProps={{ textField: { size: 'small', fullWidth: true, sx: { minWidth: '150px' } } }} />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <DatePicker label="Booking To" format="DD-MM-YYYY" value={bookingDateTo ? dayjs(bookingDateTo) : null} onChange={(newValue) => setBookingDateTo(newValue ? newValue.format('YYYY-MM-DD') : '')} enableAccessibleFieldDOMStructure={false} slots={{ textField: RoundedTextField }} slotProps={{ textField: { size: 'small', fullWidth: true, sx: { minWidth: '150px' } } }} />
                            </Grid>
                        </>
                    )}

                    {/* Check In Date Range */}
                    {showDates.checkIn && (
                        <>
                            <Grid item xs={12} md={2}>
                                <DatePicker label="Check-In From" format="DD-MM-YYYY" value={checkInFrom ? dayjs(checkInFrom) : null} onChange={(newValue) => setCheckInFrom(newValue ? newValue.format('YYYY-MM-DD') : '')} enableAccessibleFieldDOMStructure={false} slots={{ textField: RoundedTextField }} slotProps={{ textField: { size: 'small', fullWidth: true, sx: { minWidth: '150px' } } }} />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <DatePicker label="Check-In To" format="DD-MM-YYYY" value={checkInTo ? dayjs(checkInTo) : null} onChange={(newValue) => setCheckInTo(newValue ? newValue.format('YYYY-MM-DD') : '')} enableAccessibleFieldDOMStructure={false} slots={{ textField: RoundedTextField }} slotProps={{ textField: { size: 'small', fullWidth: true, sx: { minWidth: '150px' } } }} />
                            </Grid>
                        </>
                    )}

                    {/* Check Out Date Range */}
                    {showDates.checkOut && (
                        <>
                            <Grid item xs={12} md={2}>
                                <DatePicker label="Check-Out From" format="DD-MM-YYYY" value={checkOutFrom ? dayjs(checkOutFrom) : null} onChange={(newValue) => setCheckOutFrom(newValue ? newValue.format('YYYY-MM-DD') : '')} enableAccessibleFieldDOMStructure={false} slots={{ textField: RoundedTextField }} slotProps={{ textField: { size: 'small', fullWidth: true, sx: { minWidth: '150px' } } }} />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <DatePicker label="Check-Out To" format="DD-MM-YYYY" value={checkOutTo ? dayjs(checkOutTo) : null} onChange={(newValue) => setCheckOutTo(newValue ? newValue.format('YYYY-MM-DD') : '')} enableAccessibleFieldDOMStructure={false} slots={{ textField: RoundedTextField }} slotProps={{ textField: { size: 'small', fullWidth: true, sx: { minWidth: '150px' } } }} />
                            </Grid>
                        </>
                    )}

                    {/* Room Type Filter */}
                    {showRoomType && roomTypes && (
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}>
                                <Select
                                    multiple
                                    value={selectedRoomTypes}
                                    onChange={(e) => setSelectedRoomTypes(e.target.value)}
                                    displayEmpty
                                    renderValue={(selected) => {
                                        if (selected.length === 0) return <em style={{ color: '#999' }}>Room Type</em>;
                                        return (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => {
                                                    const type = roomTypes.find((rt) => rt.id == value);
                                                    return <Chip key={value} label={type ? type.name : value} size="small" />;
                                                })}
                                            </Box>
                                        );
                                    }}
                                >
                                    {roomTypes.map((type) => (
                                        <MenuItem key={type.id} value={type.id.toString()}>
                                            {type.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    )}
                    {/* Room Selection */}
                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}>
                            <Select
                                multiple
                                value={selectedRooms}
                                onChange={(e) => setSelectedRooms(e.target.value)}
                                displayEmpty
                                renderValue={(selected) => {
                                    if (selected.length === 0) return <Typography color="text.secondary">Select Room</Typography>;
                                    return (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => {
                                                const room = rooms.find((r) => r.id == value);
                                                return <Chip key={value} label={room ? room.name : value} size="small" />;
                                            })}
                                        </Box>
                                    );
                                }}
                            >
                                {rooms &&
                                    rooms.map((room) => (
                                        <MenuItem key={room.id} value={String(room.id)}>
                                            {room.name}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Status Filter */}
                    {showStatus && (
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}>
                                <Select
                                    multiple
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    displayEmpty
                                    renderValue={(selected) => {
                                        if (selected.length === 0) return <em style={{ color: '#999' }}>Status</em>;
                                        return (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => (
                                                    <Chip key={value} label={value.replace('_', ' ').toUpperCase()} size="small" />
                                                ))}
                                            </Box>
                                        );
                                    }}
                                >
                                    {['confirmed', 'checked_in', 'checked_out', 'cancelled'].map((status) => (
                                        <MenuItem key={status} value={status}>
                                            {status.replace('_', ' ').toUpperCase()}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    )}

                    {/* Action Buttons */}
                    <Grid item xs={12} md={2} sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="outlined" onClick={handleReset} sx={{ borderRadius: '16px', textTransform: 'none' }}>
                            Reset
                        </Button>
                        <Button variant="contained" startIcon={<Search />} onClick={handleApply} sx={{ borderRadius: '16px', backgroundColor: '#063455', textTransform: 'none' }}>
                            Search
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </LocalizationProvider>
    );
};

export default RoomBookingFilter;
