import SideNav from '@/components/App/AdminSideBar/SideNav';
import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Button,
    TextField,
    InputAdornment,
    MenuItem,
    List,
    ListItem,
    ListItemText,
    Divider
} from '@mui/material';
import {
    CalendarToday as CalendarIcon,
    Print as PrintIcon,
    People as PeopleIcon,
    ShoppingBag as ShoppingBagIcon,
    CreditCard as CreditCardIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const Dashboard = () => {
    const [open, setOpen] = useState(false);
    const currentMonth = new Date().toLocaleString('default', {
        month: 'short',
    });
    const currentYear = new Date().getFullYear();

    // Available months for the dropdown
    const months = [
        'Jan-2025', 'Feb-2025', 'Mar-2025', 'Apr-2025',
        'May-2025', 'Jun-2025', 'Jul-2025', 'Aug-2025',
        'Sep-2025', 'Oct-2025', 'Nov-2025', 'Dec-2025'
    ];
    const [selectedMonth, setSelectedMonth] = useState(`${currentMonth}-${currentYear}`);
    const [revenueType, setRevenueType] = useState('Revenue');
    const [chartYear, setChartYear] = useState('2025');

    // Chart data
    const chartData = [
        { name: 'Jan', income: 800, expenses: 500, profit: 300 },
        { name: 'Feb', income: 1000, expenses: 600, profit: 400 },
        { name: 'Mar', income: 900, expenses: 500, profit: 400 },
        { name: 'Apr', income: 1100, expenses: 600, profit: 500 },
        { name: 'May', income: 1200, expenses: 700, profit: 500 },
        { name: 'Jun', income: 1000, expenses: 600, profit: 400 },
        { name: 'Jul', income: 900, expenses: 500, profit: 400 },
        { name: 'Aug', income: 1300, expenses: 700, profit: 600 },
        { name: 'Sep', income: 800, expenses: 500, profit: 300 },
        { name: 'Oct', income: 1000, expenses: 600, profit: 400 },
        { name: 'Nov', income: 1100, expenses: 600, profit: 500 },
        { name: 'Dec', income: 1300, expenses: 700, profit: 600 },
    ];

    // Recent activity data
    const recentActivities = [
        { text: 'Zahid Ullah added a subscription', time: '10 min ago' },
        { text: 'Bilal paid monthly fee', time: '20 min ago' },
        { text: 'Member invoice sent', time: '50 min ago' },
        { text: 'Event booking by confirmed by fahad malik', time: '1 hour ago' },
        { text: 'Event booking by confirmed by fahad malik', time: '1 hour ago' },
        { text: 'Membership card issued to hira Qureshi', time: '2 hour ago' },
        { text: 'New package created "Summer Fitness 2025"', time: '3 hour ago' },
        { text: 'Family member added under waleed khan subscription', time: '5 hour ago' },
    ];
    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                }}
            >
                <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography sx={{ fontSize: '30px', fontWeight: 500, color: '#3F4E4F' }}>
                            Dashboard
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                select
                                size="small"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                sx={{
                                    width: '255px',
                                    bgcolor: 'white',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '4px',
                                        '& .MuiSelect-select': {
                                            color: '#7F7F7F',
                                        },
                                    }
                                }}
                                SelectProps={{
                                    IconComponent: () => null,
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <CalendarIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                            >
                                {months.map((month) => (
                                    <MenuItem key={month} value={month}>
                                        {month}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <Button
                                variant="contained"
                                startIcon={<PrintIcon />}
                                sx={{
                                    bgcolor: '#063455',
                                    '&:hover': { bgcolor: '#063455' },
                                    textTransform: 'none',
                                    borderRadius: '4px'
                                }}
                            >
                                Print
                            </Button>
                        </Box>
                    </Box>

                    <Grid container spacing={1}>
                        {/* Left side content - 8/12 width */}
                        <Grid item xs={12} md={9}>
                            <Grid container spacing={2}>
                                {/* Revenue and Profit */}
                                <Grid item xs={7}>
                                    <Card
                                        sx={{
                                            bgcolor: '#063455',
                                            color: 'white',
                                            borderRadius: '4px',
                                            height: '166px',
                                        }}
                                    >
                                        <CardContent
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                px: 1,
                                                py: 3
                                            }}
                                        >
                                            {/* Total Revenue */}
                                            <Box sx={{ flex: 1, textAlign: 'flex-start' }}>
                                                <Typography
                                                    sx={{ mb: 1, fontWeight: 400, fontSize: '14px', color: '#FFFFFF' }}
                                                >
                                                    Total Revenue
                                                </Typography>
                                                <Typography
                                                    sx={{ fontWeight: 500, fontSize: '36px', color: '#FFFFFF' }}
                                                >
                                                    Rs 559,102.00
                                                </Typography>
                                            </Box>

                                            {/* Divider */}
                                            <Divider
                                                orientation="vertical"
                                                flexItem
                                                sx={{ bgcolor: '#7F7F7F', mx: 1 }}
                                            />

                                            {/* Total Profit */}
                                            <Box sx={{ flex: 1, textAlign: 'right' }}>
                                                <Typography
                                                    sx={{ mb: 1, fontWeight: 400, fontSize: '14px', color: '#FFFFFF' }}
                                                >
                                                    Total Profit
                                                </Typography>
                                                <Typography
                                                    sx={{ fontWeight: 500, fontSize: '36px', color: '#FFFFFF' }}
                                                >
                                                    Rs 223,640.80
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* Bookings */}
                                <Grid item xs={5}>
                                    <Card sx={{
                                        bgcolor: '#3F4E4F',
                                        color: 'white',
                                        borderRadius: '4px',
                                        height: '166px'
                                    }}>
                                        <CardContent sx={{ px: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <Box sx={{
                                                    bgcolor: '#202728',
                                                    width: 46,
                                                    height: 46,
                                                    borderRadius: '50%',
                                                    p: 2,
                                                    mr: 2,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <img src="/assets/calendar.png" alt="" style={{
                                                        width: 20,
                                                        height: 20
                                                    }} />
                                                </Box>
                                                <Box>
                                                    <Typography sx={{ fontSize: '14px', fontWeight: 400, color: '#C6C6C6' }}>
                                                        Total Booking
                                                    </Typography>
                                                    <Typography sx={{ fontWeight: 500, fontSize: '20px', color: '#FFFFFF' }}>
                                                        320
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Divider
                                                orientation="horizontal"
                                                flexItem
                                                sx={{ bgcolor: '#7F7F7F', height: '2px' }}
                                            />
                                            <Box sx={{ display: 'flex', mt: 2 }}>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography sx={{ fontWeight: 400, fontSize: '12px', color: '#C6C6C6' }}>
                                                        Room Booking
                                                    </Typography>
                                                    <Typography sx={{ fontWeight: 500, fontSize: '18px', color: '#FFFFFF' }}>
                                                        280
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography sx={{ fontWeight: 400, fontSize: '12px', color: '#C6C6C6' }}>
                                                        Event Booking
                                                    </Typography>
                                                    <Typography sx={{ fontWeight: 500, fontSize: '18px', color: '#FFFFFF' }}>
                                                        40
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* Middle row with 3 cards */}
                                <Grid item xs={12} sm={7}>
                                    <Card sx={{
                                        bgcolor: '#3F4E4F',
                                        color: 'white',
                                        height: '100%',
                                        borderRadius: '4px',
                                        height: '166px'
                                    }}>
                                        <CardContent sx={{ px: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <Box sx={{
                                                    bgcolor: '#202728',
                                                    height: 46,
                                                    width: 46,
                                                    borderRadius: '50%',
                                                    p: 1,
                                                    mr: 2,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <PeopleIcon />
                                                </Box>
                                                <Box>
                                                    <Typography sx={{ color: '#C6C6C6', fontSize: '14px', fontWeight: 400 }}>
                                                        Total Members
                                                    </Typography>
                                                    <Typography sx={{ fontWeight: 500, fontSize: '20px', color: '#FFFFFF' }}>
                                                        320
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Divider
                                                orientation="horizontal"
                                                flexItem
                                                sx={{ bgcolor: '#7F7F7F', height: '2px' }}
                                            />
                                            <Box sx={{ display: 'flex', mt: 2 }}>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography sx={{ color: '#C6C6C6', fontSize: '12px', fontWeight: 400 }}>
                                                        Total Customer
                                                    </Typography>
                                                    <Typography sx={{ fontWeight: 500, fontSize: '18px', color: '#FFFFFF' }}>
                                                        280
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography sx={{ color: '#C6C6C6', fontSize: '12px', fontWeight: 400 }}>
                                                        Total Employee
                                                    </Typography>
                                                    <Typography sx={{ fontWeight: 500, fontSize: '18px', color: '#FFFFFF' }}>
                                                        40
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                <Grid item xs={12} sm={2.5}>
                                    <Card
                                        sx={{
                                            bgcolor: '#3F4E4F',
                                            color: 'white',
                                            borderRadius: '4px',
                                            height: '166px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-start',
                                        }}
                                    >
                                        <CardContent sx={{ p: 2, textAlign: 'left' }}>
                                            {/* Icon Circle */}
                                            <Box
                                                sx={{
                                                    bgcolor: '#202728',
                                                    height: 46,
                                                    width: 46,
                                                    borderRadius: '50%',
                                                    p: 1,
                                                    mb: 2,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <img
                                                    src="/assets/box.png"
                                                    alt=""
                                                    style={{
                                                        height: 20,
                                                        width: 20,
                                                    }}
                                                />
                                            </Box>

                                            {/* Text Content */}
                                            <Typography sx={{ color: '#C6C6C6', fontWeight: 400, fontSize: '14px', mb: 1 }}>
                                                Total Product Order
                                            </Typography>
                                            <Typography sx={{ fontWeight: 500, fontSize: '20px', color: '#FFFFFF', display: 'inline' }}>
                                                500
                                            </Typography>
                                            <Typography sx={{ color: '#C6C6C6', fontWeight: 400, fontSize: '14px', display: 'inline', ml: 1 }}>
                                                Items
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                <Grid item xs={12} sm={2.5}>
                                    <Card
                                        sx={{
                                            bgcolor: '#3F4E4F',
                                            color: 'white',
                                            borderRadius: '4px',
                                            height: '166px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-start',
                                        }}
                                    >
                                        <CardContent sx={{ p: 2, textAlign: 'left' }}>
                                            {/* Icon Circle */}
                                            <Box
                                                sx={{
                                                    bgcolor: '#202728',
                                                    height: 46,
                                                    width: 46,
                                                    borderRadius: '50%',
                                                    p: 1,
                                                    mb: 2,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <CreditCardIcon />
                                            </Box>

                                            {/* Text Content */}
                                            <Typography sx={{ color: '#C6C6C6', fontWeight: 400, fontSize: '14px', mb: 1 }}>
                                                Total Subscription Order
                                            </Typography>
                                            <Typography sx={{ fontWeight: 500, fontSize: '20px', color: '#FFFFFF', display: 'inline' }}>
                                                380
                                            </Typography>
                                            <Typography sx={{ color: '#C6C6C6', fontWeight: 400, fontSize: '14px', display: 'inline', ml: 1 }}>
                                                Order
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* Chart */}
                                <Grid item xs={12}>
                                    <Card sx={{ borderRadius: '4px' }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Box>
                                                    <Typography sx={{ fontWeight: 600, fontSize:'20px', color:'#1D1F2C' }}>
                                                        Revenue
                                                    </Typography>
                                                    <Typography sx={{ color: '#777980', fontWeight:500, fontSize:'14px' }}>
                                                        Your Revenue 2025 Year
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 2 }}>
                                                    <TextField
                                                        select
                                                        size="small"
                                                        value={revenueType}
                                                        onChange={(e) => setRevenueType(e.target.value)}
                                                        sx={{ width: '160px' }}
                                                    >
                                                        <MenuItem value="Revenue">Revenue</MenuItem>
                                                        <MenuItem value="Profit">Profit</MenuItem>
                                                        <MenuItem value="Expenses">Expenses</MenuItem>
                                                    </TextField>
                                                    <TextField
                                                        size="small"
                                                        value={chartYear}
                                                        onChange={(e) => setChartYear(e.target.value)}
                                                        InputProps={{
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <CalendarIcon fontSize="small" />
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                        sx={{ width: '160px' }}
                                                    />
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Box sx={{
                                                        width: 12,
                                                        height: 12,
                                                        borderRadius: '50%',
                                                        bgcolor: '#0d3c61',
                                                        mr: 1
                                                    }} />
                                                    <Typography sx={{color:'#667085', fontWeight:400, fontSize:'14px'}}>
                                                        Income
                                                    </Typography>
                                                    <Typography sx={{ ml: 1, fontWeight: 500, fontSize:'16px', color:'#1D1F2C' }}>
                                                        $26,000
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Box sx={{
                                                        width: 12,
                                                        height: 12,
                                                        borderRadius: '50%',
                                                        bgcolor: '#e74c3c',
                                                        mr: 1
                                                    }} />
                                                    <Typography sx={{color:'#667085', fontWeight:400, fontSize:'14px'}}>
                                                        Expenses
                                                    </Typography>
                                                    <Typography sx={{ ml: 1, fontWeight: 500, fontSize:'16px', color:'#1D1F2C' }}>
                                                        $18,000
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Box sx={{
                                                        width: 12,
                                                        height: 12,
                                                        borderRadius: '50%',
                                                        bgcolor: '#2ecc71',
                                                        mr: 1
                                                    }} />
                                                    <Typography sx={{color:'#667085', fontWeight:400, fontSize:'14px'}}>
                                                        Profit
                                                    </Typography>
                                                    <Typography sx={{ ml: 1, fontWeight: 500, fontSize:'16px', color:'#1D1F2C' }}>
                                                        $8,000
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ height: 300 }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart
                                                        data={chartData}
                                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                        <XAxis dataKey="name" />
                                                        <YAxis
                                                            tickFormatter={(value) => `$${value}`}
                                                            ticks={[0, 200, 400, 600, 800, 1000, 1200, 1400]}
                                                        />
                                                        <Tooltip formatter={(value) => [`$${value}`, '']} />
                                                        <Bar dataKey="income" fill="#0d3c61" barSize={10} />
                                                        <Bar dataKey="expenses" fill="#e74c3c" barSize={10} />
                                                        <Bar dataKey="profit" fill="#2ecc71" barSize={10} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Right side - Recent Activity - 4/12 width */}
                        <Grid item xs={12} md={3}>
                            <Card sx={{ borderRadius: '4px', height: '100%' }}>
                                <CardContent sx={{ p: 0 }}>
                                    <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
                                        Recent Activity
                                    </Typography>
                                    <List sx={{ p: 0 }}>
                                        {recentActivities.map((activity, index) => (
                                            <React.Fragment key={index}>
                                                <ListItem sx={{ px: 2, py: 1.5 }}>
                                                    <ListItemText
                                                        primary={activity.text}
                                                        secondary={activity.time}
                                                        primaryTypographyProps={{
                                                            variant: 'body2',
                                                            sx: { fontWeight: 500 }
                                                        }}
                                                        secondaryTypographyProps={{
                                                            variant: 'caption',
                                                            sx: { color: '#666' }
                                                        }}
                                                    />
                                                </ListItem>
                                                {index < recentActivities.length - 1 && <Divider />}
                                            </React.Fragment>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            </div>
        </>
    );
};

export default Dashboard;
