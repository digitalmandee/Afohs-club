import { router } from '@inertiajs/react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { Box, Button, Grid, IconButton, InputAdornment, Paper, Radio, TextField, Typography } from '@mui/material';
import { useState } from 'react';

const ReservationDialog = () => {
    const [orderType, setOrderType] = useState('reservation');
    const [paymentType, setPaymentType] = useState('percentage');
    const [selectedDate, setSelectedDate] = useState(7);
    const [selectedTime, setSelectedTime] = useState('10:00 am');
    const [customTime, setCustomTime] = useState(false);
    const [selectedWeek, setSelectedWeek] = useState(2);

    const weeks = [
        { id: 1, label: 'Week 1', dateRange: '01 - 06 July' },
        { id: 2, label: 'Week 2', dateRange: '07 - 13 July' },
        { id: 3, label: 'Week 3', dateRange: '14 - 20 July' },
        { id: 4, label: 'Week 4', dateRange: '21 - 27 July' },
        { id: 5, label: 'Week 5', dateRange: '28 July - 03 August' },
    ];

    const handleWeekChange = (weekId) => {
        setSelectedWeek(weekId);
    };

    const handleTimeChange = (event, newTime) => {
        if (newTime) {
            setSelectedTime(newTime);
            setCustomTime(newTime === 'custom');
        }
    };

    const handleOrderTypeChange = (newType) => {
        setOrderType(newType);
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
                                    #RSV001
                                </Typography>
                            </Box>
                        </Paper>
                    </Box>

                    {/* Customer Name */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '14px', color: '#121212' }}>
                            Customer Name or Scan Member Card
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Entry name"
                            variant="outlined"
                            sx={{
                                bgcolor: '#FFFFFF',
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        border: '1px solid #121212 !important',
                                    },
                                    '&:hover fieldset': {
                                        border: '1px solid #121212 !important',
                                    },
                                    '&.Mui-focused fieldset': {
                                        border: '1px solid #121212 !important',
                                    },
                                },
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton edge="end">
                                            <QrCodeScannerIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    {/* Customer Qty and Down Payment */}
                    <Grid container spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
                        {/* Customer Qty Grid */}
                        <Grid item xs={6}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Typography variant="body2" sx={{ mb: 1, fontSize: '14px', color: '#121212' }}>
                                    Customer Qty
                                </Typography>
                                <Box sx={{ display: 'flex', width: '100%' }}>
                                    <TextField
                                        size="small"
                                        type="number"
                                        defaultValue="10"
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

                        {/* Down Payment Grid */}
                        <Grid item xs={6}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        mb: 0.2,
                                    }}
                                >
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
                                    defaultValue="10"
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
                                                    m: 0, // Remove default margin from InputAdornment
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
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 1,
                            }}
                        >
                            <Typography variant="body2" color="#121212">
                                Select Date
                            </Typography>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                }}
                            >
                                <Typography variant="body2" color="#063455">
                                    July 2024
                                </Typography>
                                <KeyboardArrowDownIcon fontSize="small" />
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 1,
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: '#B0DEFF',
                                    p: 0.5,
                                    borderRadius: 1,
                                }}
                            >
                                <CalendarTodayIcon fontSize="small" sx={{ color: '#1976d2' }} />
                                <Typography variant="caption" sx={{ ml: 0.5, color: '#1976d2' }}>
                                    Week 2
                                </Typography>
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                display: 'flex',
                                width: '100%',
                                border: '1px solid #e0e0e0',
                                borderRadius: 1,
                                overflow: 'hidden',
                            }}
                        >
                            {['Sun', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, index) => (
                                <Box
                                    key={day}
                                    sx={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        p: 1,
                                        bgcolor: selectedDate === index + 7 ? '#B0DEFF' : '#FFFFFF',
                                        cursor: 'pointer',
                                        borderRight: index < 6 ? '1px solid #063455' : '#E3E3E3',
                                    }}
                                    onClick={() => setSelectedDate(index + 7)}
                                >
                                    <Typography variant="caption" color="text.secondary">
                                        {day}
                                    </Typography>
                                    <Typography variant="body2" fontWeight={selectedDate === index + 7 ? 'medium' : 'normal'}>
                                        {index + 7}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
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
                    </Box>

                    {/* Custom Time Selection */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6}>
                            <Typography variant="body2" color="#121212" sx={{ mb: 1 }}>
                                Select Custom Time
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Select time"
                                sx={{
                                    border: '1px solid #121212',
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AccessTimeIcon fontSize="small" color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                disabled={!customTime}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2" color="#121212" sx={{ mb: 1 }}>
                                Selected Custom Time
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
                                    23 Person
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Footer Buttons */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 1,
                        }}
                    >
                        <Button
                            variant="text"
                            sx={{
                                color: '#666',
                                textTransform: 'none',
                            }}
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
                        >
                            Save Order
                        </Button>
                        <Button
                            variant="contained"
                            endIcon={<ArrowForwardIcon />}
                            sx={{
                                bgcolor: '#0c3b5c',
                                '&:hover': {
                                    bgcolor: '#072a42',
                                },
                                textTransform: 'none',
                            }}
                            onClick={() => router.visit('/all/order')}
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
