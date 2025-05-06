import { useOrderStore } from '@/stores/useOrderStore';
import { router } from '@inertiajs/react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { Autocomplete, Box, Button, ClickAwayListener, Grid, InputAdornment, Paper, Popper, Radio, TextField, Typography } from '@mui/material';
import { StaticDatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import axios from 'axios';
import dayjs from 'dayjs';
import { enqueueSnackbar } from 'notistack';
import { useCallback, useState } from 'react';

const ReservationDialog = () => {
    const { orderDetails, weeks, selectedWeek, monthYear, setMonthYear, handleOrderDetailChange } = useOrderStore();

    const [paymentType, setPaymentType] = useState('percentage');
    const [selectedTime, setSelectedTime] = useState('10:00 am');
    const [customTime, setCustomTime] = useState(false);
    const [members, setMembers] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [Form, setForm] = useState({});

    // Day Labels and Open Calendar
    const [anchorEl, setAnchorEl] = useState(null);
    const dayLabels = ['Sun', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const weekDays = weeks.find((w) => w.id === selectedWeek)?.days ?? [];

    const handleClick = (event) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const handleDateChange = (newValue) => {
        setMonthYear(newValue);
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'month-year-picker' : undefined;

    // Search Members
    const searchUser = useCallback(async (query, role) => {
        if (!query) return [];
        setSearchLoading(true);

        try {
            const response = await axios.get(route('user.search'), {
                params: { query, role },
            });
            if (response.data.success) {
                return response.data.results;
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error fetching search results:', error);
            return [];
        } finally {
            setSearchLoading(false);
        }
    }, []);

    const handleSearch = async (event, role) => {
        const query = event?.target?.value;
        if (query) {
            const results = await searchUser(query, role);
            if (role === 'user') setMembers(results);
        } else {
            if (role === 'user') setMembers([]);
        }
    };

    const handleAutocompleteChange = (event, value, field) => {
        handleOrderDetailChange(field, value);
        setErrors({ ...errors, [field]: '' });
    };

    const handleSaveOrder = async () => {
        // Client-side validation
        const newErrors = {};
        if (!orderDetails.member?.id) newErrors['member.id'] = 'Please select a member.';
        if (!orderDetails.date) newErrors.date = 'Please select a date.';
        if (!selectedTime && !orderDetails.custom_time) newErrors.time = 'Please select a time.';
        if (!orderDetails.person_count || orderDetails.person_count < 1) newErrors.person_count = 'Please enter a valid number of persons.';
        if (orderDetails.down_payment !== undefined && orderDetails.down_payment < 0) newErrors.down_payment = 'Please enter a valid down payment.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            enqueueSnackbar('Please fix the errors in the form.', { variant: 'error' });
            return;
        }

        try {
            const response = await axios.post(route('order.reservation'), orderDetails);
            enqueueSnackbar(response.data.message || 'Order placed successfully!', { variant: 'success' });
            // Reset unused Form state (preserved as per request)
            setForm({
                member: null,
                date: '',
                time: '',
                custom_time: '',
                person_count: '',
                down_payment: '',
                note: '',
            });
            // Reset orderDetails fields
            handleOrderDetailChange('member', null);
            handleOrderDetailChange('date', null);
            handleOrderDetailChange('custom_time', '');
            handleOrderDetailChange('person_count', '');
            handleOrderDetailChange('down_payment', '');
            handleOrderDetailChange('price', '');
            // Reset local state
            setSelectedTime('10:00 am');
            setCustomTime(false);
            setMembers([]);
            setErrors({});
            router.visit(route('order.new')); // Redirect after success
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
                enqueueSnackbar('Validation error: Please fix the form fields.', { variant: 'error' });
            } else {
                console.error('Error saving order:', error);
                enqueueSnackbar('Failed to save order. Please try again.', { variant: 'error' });
            }
        }
    };

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    width: '100%',
                    maxWidth: '900px',
                    mx: 'auto',
                    p: 2,
                    gap: 2,
                }}
            >
                <Box sx={{ flexGrow: 1 }}>
                    {/* Order ID */}
                    <Box sx={{ mb: 2 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                bgcolor: '#F6F6F6',
                                p: 1.5,
                                borderRadius: 1,
                                border: '1px solid #E3E3E3',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mr: 1, fontSize: '16px', color: '#7F7F7F' }}>
                                    Order id:
                                </Typography>
                                <Typography variant="body1" fontWeight="600" color="#063455">
                                    #{orderDetails.order_no}
                                </Typography>
                            </Box>
                        </Paper>
                    </Box>

                    {/* Customer Name */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '14px', color: '#121212' }}>
                            Customer Name or Scan Member Card
                        </Typography>
                        <Autocomplete
                            fullWidth
                            freeSolo
                            size="small"
                            options={members}
                            value={orderDetails.member || null} // Ensure value is null if member is not set
                            getOptionLabel={(option) => (option && typeof option === 'object' ? option.name || '' : option || '')} // Handle null or string
                            onInputChange={(event, value) => handleSearch(event, 'user')}
                            onChange={(event, value) => handleAutocompleteChange(event, value, 'member')}
                            loading={searchLoading}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    fullWidth
                                    sx={{ p: 0 }}
                                    placeholder="Enter name or scan member card"
                                    variant="outlined"
                                    error={!!errors['member.id']}
                                    helperText={errors['member.id']}
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <QrCodeScannerIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            )}
                            renderOption={(props, option) => (
                                <li {...props}>
                                    <span>{option.name}</span>
                                    <span style={{ color: 'gray', fontSize: '0.875rem' }}> ({option.email})</span>
                                </li>
                            )}
                        />
                    </Box>

                    {/* Customer Qty and Down Payment */}
                    <Grid container spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
                        <Grid item xs={6}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Typography variant="body2" sx={{ mb: 1, fontSize: '14px', color: '#121212' }}>
                                    Customer Qty
                                </Typography>
                                <Box sx={{ display: 'flex', width: '100%' }}>
                                    <TextField
                                        size="small"
                                        type="number"
                                        value={orderDetails.person_count}
                                        onChange={(e) => handleOrderDetailChange('person_count', e.target.value)}
                                        error={!!errors.person_count}
                                        helperText={errors.person_count}
                                        sx={{
                                            width: '60%',
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 0,
                                            },
                                            '& fieldset': {
                                                borderColor: '#121212',
                                            },
                                        }}
                                    />
                                    <Button
                                        variant="outlined"
                                        sx={{
                                            textTransform: 'none',
                                            color: '#666',
                                            bgcolor: '#EEEEEE',
                                            borderColor: '#121212',
                                            borderRadius: 0,
                                            width: '20%',
                                            borderLeft: 'none',
                                        }}
                                    >
                                        Person
                                    </Button>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.2 }}>
                                    <Typography variant="body2" color="#121212">
                                        Down Payment
                                    </Typography>
                                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                                        <Radio
                                            checked={paymentType === 'percentage'}
                                            onChange={() => setPaymentType('percentage')}
                                            size="small"
                                            sx={{ p: 0.5 }}
                                        />
                                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                                            Percentage
                                        </Typography>
                                    </Box>
                                </Box>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    value={orderDetails.down_payment}
                                    onChange={(e) => handleOrderDetailChange('down_payment', e.target.value)}
                                    error={!!errors.down_payment}
                                    helperText={errors.down_payment}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 0,
                                            padding: 0,
                                            alignItems: 'stretch',
                                        },
                                        '& fieldset': {
                                            borderColor: '#121212',
                                        },
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment
                                                position="start"
                                                sx={{
                                                    m: 0,
                                                    height: '200%',
                                                    display: 'flex',
                                                    alignItems: 'stretch',
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        bgcolor: '#EEEEEE',
                                                        border: '1px solid #121212',
                                                        borderRadius: 0,
                                                        px: 1,
                                                        py: 0.5,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        height: '200%',
                                                        marginRight: 2,
                                                    }}
                                                >
                                                    <Typography variant="body2" sx={{ lineHeight: 2.2 }}>
                                                        Rs
                                                    </Typography>
                                                </Box>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Select Date */}
                    <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2" color="#121212" mb={1}>
                                Select Date
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleClick}>
                                <Typography variant="body2" color="#063455">
                                    {new Date(monthYear).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                </Typography>
                                <KeyboardArrowDownIcon fontSize="small" sx={{ ml: 1 }} />
                            </Box>
                            <Popper id={id} open={open} anchorEl={anchorEl} placement="bottom-start">
                                <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
                                    <Box sx={{ mt: 1, p: 2, bgcolor: '#fff', boxShadow: 3, borderRadius: 1 }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <StaticDatePicker
                                                views={['year', 'month']}
                                                value={dayjs(monthYear)}
                                                onChange={handleDateChange}
                                                minDate={dayjs().add(1, 'day')}
                                                maxDate={dayjs().add(5, 'year')}
                                                disablePast={true}
                                            />
                                        </LocalizationProvider>
                                    </Box>
                                </ClickAwayListener>
                            </Popper>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box
                                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#B0DEFF', p: 0.5, borderRadius: 1 }}
                            >
                                <CalendarTodayIcon fontSize="small" sx={{ color: '#1976d2' }} />
                                <Typography variant="caption" sx={{ ml: 0.5, color: '#1976d2' }}>
                                    {weeks.find((w) => w.id === selectedWeek)?.label}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', width: '100%', border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
                            {weekDays.map((day, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        p: 1,
                                        bgcolor: day && orderDetails.date?.toDateString() === day.toDateString() ? '#B0DEFF' : '#FFFFFF',
                                        color: day ? '#121212' : '#C0C0C0',
                                        cursor: day ? 'pointer' : 'not-allowed',
                                        borderRight: index < 6 ? '1px solid #063455' : '#E3E3E3',
                                    }}
                                    onClick={() => {
                                        if (day) {
                                            handleOrderDetailChange('date', day);
                                        }
                                    }}
                                >
                                    <Typography variant="caption" color="text.secondary">
                                        {dayLabels[index]}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        fontWeight={day && orderDetails.date?.toDateString() === day.toDateString() ? 'medium' : 'normal'}
                                    >
                                        {day ? day.getDate() : ''}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                        {errors.date && (
                            <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                                {errors.date}
                            </Typography>
                        )}
                    </Box>

                    {/* Select Time of Attendance */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="#121212" sx={{ mb: 1 }}>
                            Select Time of Attendance
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {['10:00 am', '13:00 pm', '14:00 pm', '18:00 pm', 'Custom'].map((time) => (
                                <Box
                                    key={time}
                                    onClick={() => {
                                        setSelectedTime(time.toLowerCase());
                                        setCustomTime(time === 'Custom');
                                        if (time !== 'Custom') {
                                            handleOrderDetailChange('custom_time', '');
                                        }
                                    }}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: 1,
                                        p: 1,
                                        flex: 1,
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Radio
                                        checked={selectedTime === time.toLowerCase() || (customTime && time === 'Custom')}
                                        size="small"
                                        sx={{ p: 0.5, mr: 0.5 }}
                                    />
                                    <Typography variant="body2">{time}</Typography>
                                </Box>
                            ))}
                        </Box>
                        {errors.time && (
                            <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                                {errors.time}
                            </Typography>
                        )}
                    </Box>

                    {/* Custom Time Selection */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6}>
                            <Typography variant="body2" color="#121212" sx={{ mb: 1 }}>
                                Select Custom Time
                            </Typography>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <TimePicker
                                    label="Select Custom Time"
                                    value={orderDetails.custom_time ? dayjs(orderDetails.custom_time, 'HH:mm') : null}
                                    onChange={(newValue) => handleOrderDetailChange('custom_time', newValue ? newValue.format('HH:mm') : '')}
                                    disabled={!customTime}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            size="small"
                                            error={!!errors.time}
                                            helperText={errors.time}
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <AccessTimeIcon fontSize="small" color="action" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2" color="#121212" sx={{ mb: 1 }}>
                                Total Persons
                            </Typography>
                            <Box
                                sx={{
                                    border: 'transparent',
                                    borderRadius: 1,
                                    p: 1,
                                    height: 40,
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <Typography variant="body1" fontWeight="medium">
                                    {orderDetails.person_count} Person
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Footer Buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                            variant="text"
                            sx={{ color: '#666', textTransform: 'none' }}
                            onClick={() => router.visit(route('order.cancel'))} // Optional: Define a cancel route
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="outlined"
                            sx={{
                                textTransform: 'none',
                                border: '1px solid #063455',
                                color: '#333',
                            }}
                            onClick={handleSaveOrder}
                        >
                            Save Order
                        </Button>
                        <Button
                            variant="contained"
                            endIcon={<ArrowForwardIcon />}
                            sx={{
                                bgcolor: '#0c3b5c',
                                '&:hover': { bgcolor: '#072a42' },
                                textTransform: 'none',
                            }}
                            onClick={() => router.visit(route('order.menu'))}
                        >
                            Choose Menu
                        </Button>
                    </Box>
                </Box>
            </Box>
        </>
    );
};

export default ReservationDialog;
