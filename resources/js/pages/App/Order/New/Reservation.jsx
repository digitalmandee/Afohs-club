import AsyncSearchTextField from '@/components/AsyncSearchTextField';
import { useOrderStore } from '@/stores/useOrderStore';
import { router, usePage } from '@inertiajs/react';
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
import { useCallback, useEffect, useState } from 'react';

const ReservationDialog = () => {
    const { selectedFloor, selectedTable } = usePage().props;

    const { orderDetails, weeks, selectedWeek, monthYear, setMonthYear, handleOrderDetailChange } = useOrderStore();
    const [availableSlots, setAvailableSlots] = useState([]);

    const [paymentType, setPaymentType] = useState('percentage');
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

    const handleSaveOrder = async () => {
        // Client-side validation
        const newErrors = {};
        if (!orderDetails.member?.id) newErrors['member.id'] = 'Please select a member.';
        if (!orderDetails.date) newErrors.date = 'Please select a date.';
        if (!orderDetails.start_time) newErrors.start_time = 'Please select start time.';
        if (!orderDetails.end_time) newErrors.end_time = 'Please select end time.';
        else if (orderDetails.start_time >= orderDetails.end_time) newErrors.end_time = 'End time must be after start time.';
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
            setErrors({});
            router.visit(route('order.new')); // Redirect after success
        } catch (error) {
            if (error.response?.status === 422) {
                console.log(error.response);

                setErrors(error.response.data.errors);
                enqueueSnackbar('Validation error: Please fix the form fields.', { variant: 'error' });
            } else {
                console.error('Error saving order:', error);
                enqueueSnackbar('Failed to save order. Please try again.', { variant: 'error' });
            }
        }
    };

    const isDisabled = !orderDetails.member || Object.keys(orderDetails.member).length === 0;

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F10' && !isDisabled) {
                e.preventDefault(); // Optional: prevent browser behavior
                router.visit(route('order.menu'));
            }
            if (e.key === 'F9') {
                e.preventDefault(); // Optional: prevent browser behavior
                handleSaveOrder();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isDisabled, router]);

    useEffect(() => {
        if (orderDetails.date && selectedTable?.id) {
            axios
                .get(route('tables.available-times', selectedTable.id), {
                    params: { date: dayjs(orderDetails.date).format('YYYY-MM-DD') },
                })
                .then((res) => setAvailableSlots(res.data))
                .catch((err) => console.error('Error fetching slots:', err));
        }
    }, [orderDetails.date, selectedTable?.id]);

    const handleStartTimeChange = (newValue) => {
        const newStart = newValue ? newValue.format('HH:mm') : '';

        // ✅ Restrict to end_time
        if (orderDetails.end_time && newStart > orderDetails.end_time) {
            enqueueSnackbar('Start time cannot be after end time', { variant: 'error' });
            return;
        }

        // ✅ Check if within available slots
        const isValid = availableSlots.some((slot) => newStart >= slot.start && newStart < slot.end);
        if (!isValid) {
            enqueueSnackbar('Selected start time is not in available slots', { variant: 'error' });
            return;
        }

        handleOrderDetailChange('start_time', newStart);
    };

    const handleEndTimeChange = (newValue) => {
        const newEnd = newValue ? newValue.format('HH:mm') : '';

        // ✅ Restrict to start_time
        if (orderDetails.start_time && formattedTime <= orderDetails.start_time) {
            enqueueSnackbar('End time cannot be before start time', { variant: 'error' });
            return;
        }

        // ✅ Check if within available slots
        const isValid = availableSlots.some((slot) => newEnd >= slot.start && newEnd <= slot.end);
        if (!isValid) {
            enqueueSnackbar('Selected end time is not in available slots', { variant: 'error' });
            return;
        }

        handleOrderDetailChange('end_time', newEnd);
    };

    // Disable invalid start times
    const disableStartTime = (time, clockType) => {
        const formattedTime = time.format('HH:mm');
        if (orderDetails.end_time && formattedTime >= orderDetails.end_time) {
            return true;
        }
        return !availableSlots.some((slot) => formattedTime >= slot.start && formattedTime < slot.end);
    };

    const disableEndTime = (time, clockType) => {
        const formattedTime = time.format('HH:mm');
        if (orderDetails.start_time && formattedTime <= orderDetails.start_time) {
            return true;
        }
        return !availableSlots.some((slot) => formattedTime > slot.start && formattedTime <= slot.end);
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
                                display: 'flex',
                                gap: 2,
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
                            {selectedFloor?.id && (
                                <>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mr: 1, fontSize: '16px', color: '#7F7F7F' }}>
                                            Floor:
                                        </Typography>
                                        <Typography variant="body1" fontWeight="600" color="#063455">
                                            {selectedFloor.name}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mr: 1, fontSize: '16px', color: '#7F7F7F' }}>
                                            Table:
                                        </Typography>
                                        <Typography variant="body1" fontWeight="600" color="#063455">
                                            {selectedTable.table_no}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mr: 1, fontSize: '16px', color: '#7F7F7F' }}>
                                            Capacity:
                                        </Typography>
                                        <Typography variant="body1" fontWeight="600" color="#063455">
                                            {selectedTable.capacity} Persons
                                        </Typography>
                                    </Box>
                                </>
                            )}
                        </Paper>
                    </Box>

                    {/* Customer Name */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '14px', color: '#121212' }}>
                            Customer Name or Scan Member Card
                        </Typography>
                        <AsyncSearchTextField placeholder="Enter name or scan member card" name="user" endpoint="user.search" onChange={(e) => handleOrderDetailChange('member', e.target.value)} size="small" />
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
                                        Reservation Advance
                                    </Typography>
                                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                                        <Radio checked={paymentType === 'percentage'} onChange={() => setPaymentType('percentage')} size="small" sx={{ p: 0.5 }} />
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
                        <Grid item xs={6}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.2 }}>
                                    <Typography variant="body2" color="#121212">
                                        Nature of Function
                                    </Typography>
                                </Box>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="text"
                                    value={orderDetails.nature_of_function}
                                    onChange={(e) => handleOrderDetailChange('nature_of_function', e.target.value)}
                                    error={!!errors.nature_of_function}
                                    helperText={errors.nature_of_function}
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
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.2 }}>
                                    <Typography variant="body2" color="#121212">
                                        Theme of Function
                                    </Typography>
                                </Box>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="text"
                                    value={orderDetails.theme_of_function}
                                    onChange={(e) => handleOrderDetailChange('theme_of_function', e.target.value)}
                                    error={!!errors.theme_of_function}
                                    helperText={errors.theme_of_function}
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
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.2 }}>
                                    <Typography variant="body2" color="#121212">
                                        Arrangement Detials / Special Instructions
                                    </Typography>
                                </Box>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="text"
                                    value={orderDetails.special_request}
                                    onChange={(e) => handleOrderDetailChange('special_request', e.target.value)}
                                    error={!!errors.special_request}
                                    helperText={errors.special_request}
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
                                            <StaticDatePicker views={['year', 'month']} value={dayjs(monthYear)} onChange={handleDateChange} minDate={dayjs().add(1, 'day')} maxDate={dayjs().add(5, 'year')} disablePast={true} />
                                        </LocalizationProvider>
                                    </Box>
                                </ClickAwayListener>
                            </Popper>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#B0DEFF', p: 0.5, borderRadius: 1 }}>
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
                                    <Typography variant="body2" fontWeight={day && orderDetails.date?.toDateString() === day.toDateString() ? 'medium' : 'normal'}>
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

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="#121212" sx={{ mb: 1 }}>
                            Available Time Slots
                        </Typography>
                        <Grid container spacing={1}>
                            {availableSlots.length > 0 ? (
                                availableSlots.slice(0, 4).map(
                                    (
                                        slot,
                                        index, // ✅ Only first 4 slots
                                    ) => (
                                        <Grid item xs={3} key={index}>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                fullWidth
                                                onClick={() => {
                                                    handleOrderDetailChange('start_time', slot.start);
                                                    handleOrderDetailChange('end_time', slot.end);
                                                }}
                                            >
                                                {slot.start} - {slot.end}
                                            </Button>
                                        </Grid>
                                    ),
                                )
                            ) : (
                                <Typography variant="caption" color="error">
                                    No available slots for this date.
                                </Typography>
                            )}
                        </Grid>
                    </Box>

                    {/* Custom Time Selection */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={4}>
                            <Typography variant="body2" color="#121212" sx={{ mb: 1 }}>
                                Start Time
                            </Typography>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <TimePicker
                                    label="Start Time"
                                    sx={{ width: '100%' }}
                                    value={orderDetails.start_time ? dayjs(orderDetails.start_time, 'HH:mm') : null}
                                    onChange={handleStartTimeChange}
                                    // onChange={(newValue) => handleOrderDetailChange('start_time', newValue ? newValue.format('HH:mm') : '')}
                                    shouldDisableTime={disableStartTime}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            size="small"
                                            error={!!errors.start_time}
                                            helperText={errors.start_time}
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

                        <Grid item xs={4}>
                            <Typography variant="body2" color="#121212" sx={{ mb: 1 }}>
                                End Time
                            </Typography>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <TimePicker
                                    sx={{ width: '100%' }}
                                    label="End Time"
                                    value={orderDetails.end_time ? dayjs(orderDetails.end_time, 'HH:mm') : null}
                                    onChange={handleEndTimeChange}
                                    // onChange={(newValue) => handleOrderDetailChange('end_time', newValue ? newValue.format('HH:mm') : '')}
                                    shouldDisableTime={disableEndTime}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            size="small"
                                            error={!!errors.end_time}
                                            helperText={errors.end_time}
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

                        <Grid item xs={4}>
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
                            disabled={isDisabled}
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
