import SideNav from '@/components/App/SideBar/SideNav';
import { useEffect, useState } from 'react';
import CancelOrder from './DelModal';
import NewSelfOrder from './NewOrder';
import ReservationOrder from './Reserve';
import { router, usePage } from '@inertiajs/react';
import { Add } from '@mui/icons-material';
import { Box, Button, Chip, CircularProgress, Grid, IconButton, Modal, Paper, Typography } from '@mui/material';
import axios from 'axios';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const Dashboard = () => {
    const { auth, today_revenue = 0, products_sold = 0, sales_change = 0, today_profit = 0, today_profit_margin = 0, total_transactions, total_orders, order_types } = usePage().props;

    const [open, setOpen] = useState(true);
    const [showReserve, setShowReserve] = useState(false);
    const [showOrder, setShowOrder] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isNotificationVisible, setIsNotificationVisible] = useState(false);

    // Orders
    const [weekDays, setWeekDays] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [orderReservtions, setOrderReservtions] = useState([]);
    const [selfOrders, setSelfOrders] = useState([]);
    const [queueOrders, setQueueOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [orderLoading, setOrderLoading] = useState(false);
    const [queueOrderLoading, setQueueOrderLoading] = useState(false);

    const handleCancelOrder = () => {
        setIsModalVisible(false); // Close the cancel order modal
        setIsNotificationVisible(true); // Show the notification

        // Auto-hide the notification after 3 seconds
        setTimeout(() => {
            setIsNotificationVisible(false);
        }, 3000);
    };

    // Format Time
    function formatTime(timeStr) {
        if (!timeStr) return '';
        const [hour, minute] = timeStr.split(':');
        const date = new Date();
        date.setHours(parseInt(hour), parseInt(minute));

        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    // Fetch orders for selected date
    const getAllOrders = async (date, order_type) => {
        try {
            const { data } = await axios.get(route('order.all', { date, order_type }));
            return data.orders; // return orders without setting state here
        } catch (err) {
            console.log(err);
            return []; // return empty array on error to avoid undefined
        }
    };

    useEffect(() => {
        // Generate next 7 days from today
        axios.get(route('order.weekly-overview')).then((res) => {
            setWeekDays(res.data.week_days);
            // default select first day (today)
            setSelectedDate(new Date(res.data.week_days[0].date));
        });
        setOrderLoading(true); // start loader
        getAllOrders(selectedDate.toISOString().split('T')[0], 'takeaway').then((orders) => {
            setSelfOrders(orders); // set orders here after data returned
            setOrderLoading(false); // stop loader
        });
        setQueueOrderLoading(true); // start loader
        getAllOrders(selectedDate.toISOString().split('T')[0], 'all').then((orders) => {
            setQueueOrders(orders); // set orders here after data returned
            setQueueOrderLoading(false); // stop loader
        });
    }, []);

    // Fetch Reservation orders for selected date
    const getOrderReservtions = (date) => {
        setLoading(true); // start loader
        axios
            .get(route('order.reservations', { date, limit: 5 }))
            .then((res) => setOrderReservtions(res.data.orders))
            .catch((err) => console.log(err))
            .finally(() => setLoading(false)); // stop loader
    };

    useEffect(() => {
        getOrderReservtions(selectedDate.toISOString().split('T')[0]);
    }, [selectedDate]);

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
                <Box sx={{ flexGrow: 1, p: 2, bgcolor: '#f5f7fa' }}>
                    <Grid container spacing={2}>
                        {/* first column */}
                        {auth.role == 'super-admin' && (
                            <Grid item xs={12} md={5.3}>
                                <Paper
                                    sx={{
                                        bgcolor: '#0e3151',
                                        color: 'white',
                                        height: '326px',
                                        borderRadius: '8px',
                                    }}
                                >
                                    <Box>
                                        <Box
                                            sx={{
                                                bgcolor: '#456880',
                                                p: 1.5,
                                                borderRadius: '4px',
                                                mb: 2,
                                                position: 'relative',
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: '400',
                                                    color: 'white',
                                                    ml: 1,
                                                }}
                                            >
                                                Sales up to <strong>{sales_change ?? 0}%</strong> compared to yesterday
                                            </Typography>
                                            <Box
                                                sx={{
                                                    height: '1px',
                                                    bgcolor: '#ccc',
                                                    position: 'absolute',
                                                    bottom: '0',
                                                    left: '0',
                                                    right: '0',
                                                }}
                                            />
                                        </Box>
                                        <Box
                                            sx={{
                                                backgroundColor: '#083152',
                                                color: '#fff',
                                                px: 1,
                                                borderRadius: 2,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                {/* Left Section - Revenue */}
                                                <Box
                                                    sx={{
                                                        flex: 1,
                                                        textAlign: 'left',
                                                        pl: 2,
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: '#FFFFFF',
                                                            fontSize: '14px',
                                                            fontWeight: 400,
                                                        }}
                                                    >
                                                        Today Revenue
                                                    </Typography>
                                                    <Typography
                                                        variant="h5"
                                                        sx={{
                                                            fontWeight: 'bold',
                                                            mt: 1,
                                                            fontSize: '34px',
                                                            color: '#FFFFFF',
                                                        }}
                                                    >
                                                        Rs {Number(today_revenue).toFixed(2)}
                                                    </Typography>
                                                </Box>

                                                {/* Vertical Divider */}
                                                <Box
                                                    sx={{
                                                        width: '1.5px',
                                                        height: '70px',
                                                        bgcolor: '#B89274',
                                                        // mx: 4,
                                                    }}
                                                />

                                                {/* Right Section - Profit */}
                                                <Box
                                                    sx={{
                                                        flex: 1,
                                                        textAlign: 'right',
                                                        pr: 2,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: 'flex-end',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                        }}
                                                    >
                                                        <Chip
                                                            label={`${today_profit_margin} %`}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: '#ffffff33',
                                                                color: '#fff',
                                                                fontWeight: 500,
                                                                height: 22,
                                                                fontSize: '0.7rem',
                                                                borderRadius: 0,
                                                            }}
                                                        />
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: '#FFFFFF',
                                                                fontSize: '14px',
                                                            }}
                                                        >
                                                            Today Profit
                                                        </Typography>
                                                    </Box>
                                                    <Typography
                                                        variant="h5"
                                                        sx={{
                                                            fontWeight: 'bold',
                                                            mt: 1,
                                                            fontSize: '34px',
                                                            color: '#FFFFFF',
                                                        }}
                                                    >
                                                        Rs {Number(today_profit).toFixed(2)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Grid
                                            container
                                            spacing={2}
                                            sx={{
                                                mt: 1,
                                            }}
                                        >
                                            <Grid item xs={3} textAlign="center">
                                                <Typography variant="h6">{order_types?.dineIn?.percentage ?? 0}%</Typography>
                                                <Typography variant="caption">Dine In</Typography>
                                            </Grid>
                                            <Grid item xs={3} textAlign="center">
                                                <Typography variant="h6">{order_types?.takeway?.percentage ?? 0}%</Typography>
                                                <Typography variant="caption">Takeaway</Typography>
                                            </Grid>
                                            <Grid item xs={3} textAlign="center">
                                                <Typography variant="h6">{order_types?.delivery?.percentage ?? 0}%</Typography>
                                                <Typography variant="caption">Delivery</Typography>
                                            </Grid>
                                            <Grid item xs={3} textAlign="center">
                                                <Typography variant="h6">{order_types?.pickup?.percentage ?? 0}%</Typography>
                                                <Typography variant="caption">Pick Up</Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Paper>
                                <Paper elevation={0} sx={{ p: 2, mt: 2 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mb: 2,
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle1"
                                            sx={{
                                                fontWeight: '500',
                                                fontSize: '20px',
                                                color: '#121212',
                                            }}
                                        >
                                            Reservation Order
                                        </Typography>
                                        <img
                                            src="/assets/arrowicon.png"
                                            alt=""
                                            style={{
                                                height: '32px',
                                                width: '32px',
                                                // marginLeft:'10px',
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => setShowReserve(true)}
                                        />
                                    </Box>
                                    <Modal open={showReserve} onClose={() => setShowReserve(false)} aria-labelledby="reservation-order-modal" sx={{ zIndex: 1300 }}>
                                        <Box
                                            sx={{
                                                position: 'fixed',
                                                top: '10px',
                                                bottom: '10px',
                                                right: 10,
                                                width: { xs: '100%', sm: 600 },
                                                bgcolor: '#fff',
                                                boxShadow: 4,
                                                zIndex: 1300,
                                                overflowY: 'auto',
                                                borderRadius: 2,
                                                scrollbarWidth: 'none',
                                                '&::-webkit-scrollbar': {
                                                    display: 'none',
                                                },
                                            }}
                                        >
                                            {/* Replace this with your actual component */}
                                            <ReservationOrder />
                                        </Box>
                                    </Modal>

                                    {/* Calendar Days */}
                                    <Grid container spacing={0} sx={{ mb: 2 }}>
                                        {weekDays.map((day, index) => {
                                            const isSelected = selectedDate.toDateString() === new Date(day.date).toDateString();

                                            return (
                                                <Grid
                                                    item
                                                    key={index}
                                                    xs={12 / 7}
                                                    onClick={() => setSelectedDate(new Date(day.date))}
                                                    sx={{
                                                        cursor: 'pointer',
                                                        textAlign: 'center',
                                                        p: 1,
                                                        border: '1px solid #e0e0e0',
                                                        bgcolor: isSelected ? '#e6f0fa' : 'white',
                                                    }}
                                                >
                                                    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>
                                                        {day.label}
                                                    </Typography>
                                                    <Box sx={{ mt: 1 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                            {day.dayNum}
                                                        </Typography>
                                                    </Box>

                                                    {day.orders_count > 0 && (
                                                        <Box
                                                            sx={{
                                                                mt: 1,
                                                                mx: 'auto',
                                                                width: 24,
                                                                height: 24,
                                                                bgcolor: '#1976d2',
                                                                color: 'white',
                                                                borderRadius: '50%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 'bold',
                                                            }}
                                                        >
                                                            {day.orders_count}
                                                        </Box>
                                                    )}
                                                </Grid>
                                            );
                                        })}
                                    </Grid>

                                    {/* Reservation List */}
                                    <Box sx={{ mt: 3 }}>
                                        {/* Reservation 1 */}
                                        {loading ? (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                                <CircularProgress />
                                            </Box>
                                        ) : orderReservtions.length > 0 ? (
                                            orderReservtions.map((item, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        bgcolor: '#F6F6F6',
                                                        borderRadius: 1,
                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                                        overflow: 'hidden',
                                                        mb: 2,
                                                    }}
                                                >
                                                    {/* Customer info section */}
                                                    <Box
                                                        sx={{
                                                            p: 2,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        {item.table_id && (
                                                            <Box
                                                                sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    mr: 1,
                                                                }}
                                                            >
                                                                <Button
                                                                    variant="contained"
                                                                    sx={{
                                                                        bgcolor: '#0C67AA',
                                                                        color: 'white',
                                                                        borderRadius: '50%',
                                                                        minWidth: 45,
                                                                        height: 45,
                                                                        p: 0,
                                                                        fontWeight: '500',
                                                                        fontSize: '0.875rem',
                                                                    }}
                                                                >
                                                                    {item.table?.table_no}
                                                                </Button>
                                                            </Box>
                                                        )}

                                                        <Box
                                                            sx={{
                                                                mr: 2,
                                                                bgcolor: '#E3E3E3',
                                                                borderRadius: '50%',
                                                                width: 45,
                                                                height: 45,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                            }}
                                                        >
                                                            <img
                                                                src="/assets/sofa.png"
                                                                alt=""
                                                                style={{
                                                                    height: 22,
                                                                    width: 22,
                                                                }}
                                                            />
                                                        </Box>

                                                        <Box sx={{ flexGrow: 1 }}>
                                                            <Box
                                                                sx={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                }}
                                                            >
                                                                <Box
                                                                    sx={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                    }}
                                                                >
                                                                    <Typography
                                                                        variant="subtitle1"
                                                                        sx={{
                                                                            fontWeight: '500',
                                                                            fontSize: '16px',
                                                                            color: '#121212',
                                                                            mr: 1,
                                                                        }}
                                                                    >
                                                                        {item.member?.full_name} ({item.member?.membership_no})
                                                                    </Typography>
                                                                </Box>
                                                                <Box
                                                                    sx={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                    }}
                                                                >
                                                                    <Box
                                                                        component="span"
                                                                        sx={{
                                                                            mr: 0.5,
                                                                            fontSize: '1rem',
                                                                        }}
                                                                    >
                                                                        🕙
                                                                    </Box>
                                                                    <Typography variant="caption">
                                                                        {formatTime(item.start_time)} - {formatTime(item.end_time)}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>

                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    color: '#7F7F7F',
                                                                    fontSize: '12px',
                                                                }}
                                                            >
                                                                {item.person_count} Person
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    {/* Order actions section */}
                                                    <Box
                                                        sx={{
                                                            // borderTop: '1px solid #f0f0f0',
                                                            p: 2,
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                            }}
                                                        >
                                                            {/* <Chip
                                                            label={`#${item.order_number}`}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{
                                                                mr: 1,
                                                                color: '#121212',
                                                                bgcolor: '#E3E3E3',
                                                                borderRadius: 1,
                                                                height: 24,
                                                                fontSize: '0.75rem',
                                                                fontWeight: 'medium',
                                                            }}
                                                        /> */}
                                                            {/* <Chip
                                                            label="DP : 50%"
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{
                                                                mr: 1,
                                                                bgcolor: '#E3E3E3',
                                                                color: '#121212',
                                                                borderRadius: 1,
                                                                height: 24,
                                                                fontSize: '0.75rem',
                                                            }}
                                                        /> */}
                                                        </Box>
                                                        <Box sx={{ ml: 'auto', mr: 2 }}>
                                                            <img
                                                                src="/assets/trash.png"
                                                                alt=""
                                                                style={{
                                                                    height: 20,
                                                                    width: 20,
                                                                }}
                                                            />
                                                        </Box>
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            startIcon={
                                                                <Box
                                                                    component="span"
                                                                    sx={{
                                                                        fontSize: '0.875rem',
                                                                    }}
                                                                >
                                                                    ✓
                                                                </Box>
                                                            }
                                                            sx={{
                                                                bgcolor: '#0e3151',
                                                                color: 'white',
                                                                textTransform: 'none',
                                                                borderRadius: 0,
                                                                px: 2,
                                                                py: 0.5,
                                                                fontSize: '0.875rem',
                                                                '&:hover': {
                                                                    bgcolor: '#0a2540',
                                                                },
                                                            }}
                                                        >
                                                            {item.status === 'saved' ? 'Process Order' : item.status === 'cancelled' ? 'Cancelled' : item.status === 'completed' ? 'Completed' : item.status === 'in_progress' ? 'Cooking process' : 'Pending'}
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            ))
                                        ) : (
                                            <Typography>No reservations found for this date.</Typography>
                                        )}
                                    </Box>
                                </Paper>
                            </Grid>
                        )}
                        {/* second column */}
                        <Grid item xs={12} md={auth.role == 'super-admin' ? 3.4 : 8.7}>
                            {/* Top Right - Order Stats */}
                            {auth.role == 'super-admin' && (
                                <Grid item xs={12}>
                                    <Grid container spacing={1.5}>
                                        {/* Total Transactions Card */}
                                        <Grid item xs={12}>
                                            <Paper
                                                sx={{
                                                    bgcolor: '#083152',
                                                    color: 'white',
                                                    p: 0,
                                                    // width: '320px',
                                                    height: '166px',
                                                    overflow: 'hidden',
                                                    borderRadius: 1,
                                                }}
                                            >
                                                {/* Top section - Total Transactions */}
                                                <Box
                                                    sx={{
                                                        p: 2,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            bgcolor: 'transparent',
                                                            p: 1.5,
                                                            borderRadius: '50%',
                                                            mr: 2,
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        <img
                                                            src="/assets/invoice.png"
                                                            alt=""
                                                            style={{
                                                                width: 30,
                                                                height: 30,
                                                            }}
                                                        />
                                                    </Box>
                                                    <Box>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: '#C6C6C6',
                                                                fontSize: '14px',
                                                            }}
                                                        >
                                                            Total Transactions
                                                        </Typography>
                                                        <Typography
                                                            variant="h4"
                                                            sx={{
                                                                fontWeight: 'bold',
                                                                mt: 0.5,
                                                                color: '#FFFFFF',
                                                                fontSize: '20px',
                                                            }}
                                                        >
                                                            {total_transactions}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Box
                                                    sx={{
                                                        height: '1.5px',
                                                        backgroundColor: '#566364',
                                                        mx: 2, // Horizontal margin (left and right spacing)
                                                        // my: 2
                                                    }}
                                                />
                                                {/* Bottom section - Self Order and Mobile App */}
                                                <Grid container sx={{ mt: 1 }}>
                                                    <Grid
                                                        item
                                                        xs={6}
                                                        sx={{
                                                            p: 1,
                                                            // ml:1
                                                            // borderRight: '1px solid rgba(255,255,255,0.1)'
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: '#C6C6C6',
                                                                fontSize: '12px',
                                                                ml: 2,
                                                            }}
                                                        >
                                                            Self Order
                                                        </Typography>
                                                        <Typography
                                                            variant="h5"
                                                            sx={{
                                                                fontWeight: 'bold',
                                                                mt: 0.5,
                                                                color: '#FFFFFF',
                                                                fontSize: '18px',
                                                                ml: 2,
                                                            }}
                                                        >
                                                            0
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6} sx={{ p: 1 }}>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: '#C6C6C6',
                                                                fontSize: '12px',
                                                            }}
                                                        >
                                                            Mobile App
                                                        </Typography>
                                                        <Typography
                                                            variant="h5"
                                                            sx={{
                                                                fontWeight: 'bold',
                                                                mt: 0.5,
                                                                color: '#FFFFFF',
                                                                fontSize: '18px',
                                                            }}
                                                        >
                                                            0
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </Paper>
                                        </Grid>

                                        {/* Product Sold and Total Order Cards */}
                                        <Grid item xs={6}>
                                            <Paper
                                                sx={{
                                                    bgcolor: '#083152',
                                                    color: 'white',
                                                    p: 2,
                                                    height: '148px',
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        mb: 2,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            bgcolor: 'transparent',
                                                            p: 1.5,
                                                            borderRadius: '50%',
                                                            mr: 2,
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        <img
                                                            src="/assets/box.png"
                                                            alt=""
                                                            style={{
                                                                height: 30,
                                                                width: 30,
                                                            }}
                                                        />
                                                    </Box>
                                                </Box>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: '#C6C6C6',
                                                        fontSize: '14px',
                                                    }}
                                                >
                                                    Product Sold
                                                </Typography>
                                                <Typography
                                                    variant="h5"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        mt: 1,
                                                        color: '#FFFFFF',
                                                        fontSize: '20px',
                                                    }}
                                                >
                                                    {products_sold ?? 0}
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            fontSize: '12px',
                                                            color: '#C6C6C6',
                                                            fontWeight: 'normal',
                                                        }}
                                                    >
                                                        Items
                                                    </Box>
                                                </Typography>
                                            </Paper>
                                        </Grid>

                                        <Grid item xs={6}>
                                            <Paper
                                                sx={{
                                                    bgcolor: '#083152',
                                                    color: 'white',
                                                    p: 2,
                                                    height: '148px',
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        mb: 2,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            bgcolor: 'transparent',
                                                            p: 1.5,
                                                            borderRadius: '50%',
                                                            mr: 2,
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        <img
                                                            src="/assets/receipt-list.png"
                                                            alt=""
                                                            style={{
                                                                height: 30,
                                                                width: 30,
                                                            }}
                                                        />
                                                    </Box>
                                                </Box>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: '#C6C6C6',
                                                        fontSize: '14px',
                                                    }}
                                                >
                                                    Total Order
                                                </Typography>

                                                <Typography
                                                    variant="h5"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        mt: 1,
                                                        color: '#FFFFFF',
                                                        fontSize: '20px',
                                                    }}
                                                >
                                                    {total_orders}
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            fontSize: '12px',
                                                            color: '#C6C6C6',
                                                            fontWeight: 'normal',
                                                        }}
                                                    >
                                                        Order
                                                    </Box>
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            )}

                            <Paper
                                sx={{
                                    p: 0,
                                    mt: 2,
                                    boxShadow: 'none',
                                    bgcolor: '#FFFFFF',
                                }}
                            >
                                {/* Header */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        p: 2,
                                        pb: 3,
                                    }}
                                >
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            color: '#121212',
                                            fontSize: '20px',
                                        }}
                                    >
                                        New Self Order
                                    </Typography>
                                    <img
                                        src="/assets/arrowicon.png"
                                        alt=""
                                        style={{
                                            height: '32px',
                                            width: '32px',
                                            // marginLeft: '10px',
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => setShowOrder(true)}
                                    />
                                </Box>
                                <Modal open={showOrder} onClose={() => setShowOrder(false)} aria-labelledby="reservation-order-modal" sx={{ zIndex: 1300 }}>
                                    <Box
                                        sx={{
                                            position: 'fixed',
                                            top: '10px',
                                            bottom: '10px',
                                            right: 10,
                                            width: { xs: '100%', sm: 600 },
                                            bgcolor: '#fff',
                                            boxShadow: 4,
                                            zIndex: 1300,
                                            overflowY: 'auto',
                                            borderRadius: 2,
                                            scrollbarWidth: 'none',
                                            '&::-webkit-scrollbar': {
                                                display: 'none',
                                            },
                                        }}
                                    >
                                        {/* Replace this with your actual component */}
                                        <NewSelfOrder />
                                    </Box>
                                </Modal>

                                {/* Self Order List */}
                                <Box
                                    sx={{
                                        p: 2,
                                    }}
                                >
                                    {/* Order 1 */}
                                    {orderLoading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                            <CircularProgress />
                                        </Box>
                                    ) : selfOrders.length > 0 ? (
                                        selfOrders.map((order, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    bgcolor: '#F6F6F6',
                                                    borderRadius: 1,
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {/* Customer info section */}
                                                <Box
                                                    sx={{
                                                        p: 2,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            mr: 2,
                                                            bgcolor: '#E3E3E3',
                                                            borderRadius: '50%',
                                                            width: 40,
                                                            height: 40,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        <img
                                                            src="/assets/truck.png"
                                                            alt=""
                                                            style={{
                                                                height: 27,
                                                                width: 27,
                                                            }}
                                                        />
                                                    </Box>

                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                mb: 0.5,
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="subtitle1"
                                                                sx={{
                                                                    fontWeight: '500',
                                                                    fontSize: '16px',
                                                                    color: '#121212',
                                                                    mr: 1,
                                                                }}
                                                            >
                                                                {order.member?.full_name}
                                                            </Typography>
                                                            <img
                                                                src="/assets/Diamond.png"
                                                                alt=""
                                                                style={{
                                                                    height: 24,
                                                                    width: 24,
                                                                    marginLeft: '10px',
                                                                }}
                                                            />
                                                        </Box>

                                                        <Typography variant="caption" sx={{ color: '#666' }}>
                                                            {order.order_items_count} items
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                {/* Order actions section */}
                                                <Box
                                                    sx={{
                                                        p: 2,
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        <Chip
                                                            label={`#${order.order_number}`}
                                                            size="small"
                                                            color="#121212"
                                                            variant="outlined"
                                                            sx={{
                                                                mr: 1,
                                                                bgcolor: '#E3E3E3',
                                                                borderRadius: 1,
                                                                height: 24,
                                                                fontSize: '0.75rem',
                                                                fontWeight: 'medium',
                                                            }}
                                                        />
                                                        {isModalVisible && <CancelOrder onClose={() => setIsModalVisible(false)} onConfirm={handleCancelOrder} />}
                                                        {isNotificationVisible && (
                                                            <Box
                                                                sx={{
                                                                    position: 'fixed',
                                                                    top: '5%',
                                                                    right: '2%',
                                                                    zIndex: 2000,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    bgcolor: '#E6FAE6',
                                                                    color: '#333',
                                                                    borderRadius: 2,
                                                                    p: 2,
                                                                    boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
                                                                    minWidth: 300,
                                                                }}
                                                            >
                                                                <Typography
                                                                    sx={{
                                                                        fontWeight: 'bold',
                                                                        mr: 1,
                                                                    }}
                                                                >
                                                                    ✅ Order Canceled!
                                                                </Typography>
                                                                <Typography
                                                                    sx={{
                                                                        fontSize: '0.875rem',
                                                                    }}
                                                                >
                                                                    Order id <b>#Order002</b> has been canceled
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                    <img
                                                        src="/assets/trash.png"
                                                        alt=""
                                                        onClick={() => setIsModalVisible(true)}
                                                        style={{
                                                            height: 20,
                                                            width: 20,
                                                            marginLeft: '1rem',
                                                            cursor: 'pointer',
                                                        }}
                                                    />
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        startIcon={
                                                            <Box
                                                                component="span"
                                                                sx={{
                                                                    fontSize: '0.875rem',
                                                                }}
                                                            >
                                                                ✓
                                                            </Box>
                                                        }
                                                        sx={{
                                                            bgcolor: '#0e3151',
                                                            color: 'white',
                                                            textTransform: 'none',
                                                            borderRadius: 0,
                                                            px: 2,
                                                            py: 0.5,
                                                            fontSize: '0.875rem',
                                                            '&:hover': {
                                                                bgcolor: '#0a2540',
                                                            },
                                                        }}
                                                    >
                                                        {order.status === 'cancelled' ? 'Cancelled' : order.status === 'completed' ? 'Completed' : order.status === 'in_progress' ? 'Cooking process' : 'Pending'}
                                                    </Button>
                                                </Box>
                                            </Box>
                                        ))
                                    ) : (
                                        <Typography>No order found.</Typography>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>

                        {/* third column */}
                        <Grid item xs={12} md={3.3}>
                            <Box
                                sx={{
                                    height: '100%',
                                    bgcolor: '#E3F2FD',
                                    borderRadius: '5px',
                                }}
                            >
                                {/* Header */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        p: 1,
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                fontWeight: '500',
                                                color: '#121212',
                                                fontSize: drawerWidthOpen ? '16px' : '18px',
                                            }}
                                        >
                                            Order Queue
                                        </Typography>
                                        <img
                                            src="/assets/arrowicon.png"
                                            alt=""
                                            style={{
                                                height: '22px',
                                                width: '22px',
                                                marginLeft: drawerWidthOpen ? '5px' : '0px',
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => router.visit('/order/queue')}
                                        />
                                    </Box>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            width: '145px',
                                            height: '48px',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Button
                                            variant="outlined"
                                            sx={{
                                                width: '100%',

                                                bgcolor: 'transparent',
                                                borderRadius: 20,
                                                borderColor: '#063455',
                                                color: '#333',
                                                textTransform: 'none',
                                                // px: 2
                                            }}
                                        >
                                            Order Saved
                                            <Box
                                                component="span"
                                                sx={{
                                                    ml: 1,
                                                    bgcolor: '#1976d2',
                                                    color: 'white',
                                                    borderRadius: '50%',
                                                    width: 20,
                                                    height: 20,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.75rem',
                                                }}
                                            >
                                                1
                                            </Box>
                                        </Button>
                                    </Box>
                                </Box>

                                {/* Customer Cards */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        bgcolor: '#FFFFFF',
                                        flexDirection: 'column',
                                        gap: 2,
                                        p: 1,
                                    }}
                                >
                                    {/* Customer 1 */}
                                    {queueOrderLoading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                            <CircularProgress />
                                        </Box>
                                    ) : queueOrders.length > 0 ? (
                                        queueOrders.map((order, index) => (
                                            <Paper
                                                key={index}
                                                elevation={0}
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 1,
                                                    border: '1px solid #E3E3E3',
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        mb: 2,
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Button
                                                            variant="contained"
                                                            sx={{
                                                                bgcolor: '#0C67AA',
                                                                color: 'white',
                                                                borderRadius: '50%',
                                                                minWidth: 40,
                                                                height: 40,
                                                                p: 0,
                                                            }}
                                                        >
                                                            {order.table?.table_no}
                                                        </Button>
                                                        <Button
                                                            sx={{
                                                                bgcolor: '#E3E3E3',
                                                                height: 40,
                                                                minWidth: 40,
                                                                borderRadius: '50%',
                                                                p: 0,
                                                            }}
                                                        >
                                                            <img
                                                                src="/assets/food-tray.png"
                                                                alt=""
                                                                style={{
                                                                    height: 21,
                                                                    width: 21,
                                                                }}
                                                            />
                                                        </Button>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <IconButton
                                                            size="small"
                                                            sx={{
                                                                bgcolor: '#0e3151',
                                                                color: 'white',
                                                                height: 46,
                                                                width: 46,
                                                                borderRadius: '0px',
                                                            }}
                                                        >
                                                            <Add fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                    }}
                                                >
                                                    <Box>
                                                        <Typography
                                                            variant="subtitle1"
                                                            sx={{
                                                                fontWeight: '500',
                                                                fontSize: '20px',
                                                                color: '#121212',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                mb: 0.5,
                                                            }}
                                                        >
                                                            {order.member?.full_name}
                                                            <img
                                                                src="/assets/Diamond.png"
                                                                alt=""
                                                                style={{
                                                                    height: 24,
                                                                    width: 24,
                                                                    marginLeft: '0.7rem',
                                                                }}
                                                            />
                                                        </Typography>

                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                mb: 1,
                                                                display: 'block',
                                                                fontSize: '14px',
                                                                color: '#7F7F7F',
                                                            }}
                                                        >
                                                            {order.order_items_count} items{' '}
                                                            {order.completed_order_items_count > 0 && (
                                                                <Typography
                                                                    component="span"
                                                                    variant="caption"
                                                                    sx={{
                                                                        color: '#22D7A6',
                                                                    }}
                                                                >
                                                                    ({order.completed_order_items_count} Complete)
                                                                </Typography>
                                                            )}
                                                        </Typography>
                                                    </Box>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        <Typography
                                                            component="span"
                                                            variant="caption"
                                                            sx={{
                                                                color: '#7F7F7F',
                                                                fontWeight: 'normal',
                                                                mr: 0.5,
                                                                fontSize: '14px',
                                                            }}
                                                        >
                                                            Rs
                                                        </Typography>
                                                        <Typography
                                                            component="span"
                                                            sx={{
                                                                color: '#121212',
                                                                fontSize: '20px',
                                                                fontWeight: 'bold',
                                                            }}
                                                        >
                                                            {order.total_price}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Chip
                                                        label={`#${order.id}`}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{
                                                            bgcolor: '#f5f5f5',
                                                            borderRadius: 1,
                                                            height: 24,
                                                        }}
                                                    />
                                                    <Chip
                                                        label={order.status === 'cancelled' ? 'Cancelled' : order.status === 'completed' ? 'Ready To Serve' : order.status === 'in_progress' ? 'Cooking process' : 'Pending'}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: '#f5f5f5',
                                                            borderRadius: 1,
                                                            height: 24,
                                                        }}
                                                        icon={
                                                            <Box
                                                                component="span"
                                                                sx={{
                                                                    fontSize: '0.75rem',
                                                                    ml: 1,
                                                                }}
                                                            >
                                                                ✓
                                                            </Box>
                                                        }
                                                    />
                                                    {/* <Chip
                                                        label="Cooking process"
                                                        size="small"
                                                        sx={{
                                                            bgcolor: '#f5f5f5',
                                                            borderRadius: 1,
                                                            height: 24,
                                                        }}
                                                        icon={
                                                            <Box
                                                                component="span"
                                                                sx={{
                                                                    fontSize: '0.75rem',
                                                                    ml: 1,
                                                                }}
                                                            >
                                                                <img
                                                                    src="/assets/stopwatch-alt.png"
                                                                    alt=""
                                                                    style={{
                                                                        height: 18,
                                                                        width: 18,
                                                                    }}
                                                                />
                                                            </Box>
                                                        }
                                                    /> */}
                                                    {/* <Chip
                                                    label="Waiting to payment"
                                                    size="small"
                                                    sx={{
                                                        bgcolor: '#f5f5f5',
                                                        borderRadius: 1,
                                                        height: 24,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                    icon={
                                                        <Box
                                                            component="span"
                                                            sx={{
                                                                fontSize: '0.75rem',
                                                                ml: 2,
                                                            }}
                                                        >
                                                            <img
                                                                src="/assets/receipt-list.png"
                                                                style={{
                                                                    height: 14,
                                                                    width: 14,
                                                                    filter: 'invert(1)',
                                                                }}
                                                            />
                                                        </Box>
                                                    }
                                                /> */}
                                                </Box>
                                            </Paper>
                                        ))
                                    ) : (
                                        <Typography>No order found.</Typography>
                                    )}
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </div>
        </>
    );
};

export default Dashboard;
