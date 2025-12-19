import FoodIcon from '@/components/App/Icons/Food';
import ShopIcon from '@/components/App/Icons/ShoppingBag';
import SofaIcon from '@/components/App/Icons/Sofa';
import SideNav from '@/components/App/SideBar/SideNav';
import { useOrderStore } from '@/stores/useOrderStore';
import { Box, Button, List, ListItem, ListItemSecondaryAction, ListItemText, Paper, Radio, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import DineDialog from './Dine';
import ReservationDialog from './Reservation';
import TakeAwayDialog from './Takeaway';
import RoomDialog from './RoomDialog';
import axios from 'axios';
import { CiDeliveryTruck } from 'react-icons/ci';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const NewOrder = ({ orderNo, memberTypes }) => {
    const { orderDetails, weeks, initWeeks, selectedWeek, monthYear, setInitialOrder, handleOrderTypeChange, handleWeekChange, resetOrderDetails, handleOrderDetailChange } = useOrderStore();

    const [open, setOpen] = useState(true);
    const [floorTables, setFloorTables] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);

    // get weeks in month
    useEffect(() => {
        initWeeks();
    }, [monthYear]);

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const table = query.get('table');
        const floor = query.get('floor');

        resetOrderDetails();

        setInitialOrder({
            orderNo,
            memberTypes,
            floorTables: floor ? [{ id: floor }] : floorTables,
            table: table ? table : null,
            time: dayjs().format('HH:mm'),
        });
    }, []);

    const loadFloorTables = async () => {
        try {
            const response = await axios.get(route('api.floors-with-tables'));
            setFloorTables(response.data);
            if (response.data.length > 0) {
                handleOrderDetailChange('floor', response.data[0].id);
                handleOrderDetailChange('table', '');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const loadRooms = async () => {
        try {
            const response = await axios.get(route('rooms.order'));
            setRoomTypes(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    // Call when user selects DineIn or Reservation or Room
    useEffect(() => {
        if (orderDetails.order_type === 'dineIn' || orderDetails.order_type === 'reservation') {
            loadFloorTables();
        } else if (orderDetails.order_type === 'room') {
            loadRooms();
        }
    }, [orderDetails.order_type]);

    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    paddingTop: '5rem',
                    backgroundColor: '#f5f5f5',
                }}
            >
                {/* Order Detailss */}
                <Box
                    sx={{
                        display: 'flex',
                        gap: 2,
                        maxWidth: orderDetails.order_type === 'reservation' ? '1000px' : '732px',
                        mx: 'auto',
                        mt: 5,
                        mb: 5,
                    }}
                >
                    {/* Select Week Panel - Only shown when reservation is selected */}
                    {orderDetails.order_type === 'reservation' && (
                        <Box sx={{ width: '320px', flexShrink: 0, mt: 35 }}>
                            <Paper
                                elevation={5}
                                sx={{
                                    width: '100%',
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                    px: 2,
                                    py: 1,
                                }}
                            >
                                {/* Header */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        // px: 1,
                                        py: 2,
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 'medium',
                                            fontSize: '20px',
                                            color: '#121212',
                                        }}
                                    >
                                        Select Week
                                    </Typography>
                                    <img
                                        src="/assets/angle-right-circle.png"
                                        alt=""
                                        style={{
                                            height: 20,
                                            width: 20,
                                        }}
                                    />
                                </Box>

                                {/* Week List */}
                                <List disablePadding>
                                    {weeks.length > 0 &&
                                        weeks.map((week) => (
                                            <ListItem
                                                key={week.id}
                                                disablePadding
                                                onClick={() => handleWeekChange(week.id)}
                                                sx={{
                                                    px: 2.5,
                                                    py: 1.5,
                                                    borderRadius: '4px',
                                                    bgcolor: selectedWeek === week.id ? '#B0DEFF' : 'transparent',

                                                    border: selectedWeek === week.id ? '1px solid #063455' : '1px solid #E3E3E3',
                                                    cursor: 'pointer',
                                                    mb: 1.5,
                                                    '&:last-child': {
                                                        mb: 0,
                                                    },
                                                    '&:hover': {
                                                        bgcolor: selectedWeek === week.id ? '#B0DEFF' : '#FFFFFF',
                                                    },
                                                }}
                                            >
                                                <ListItemText
                                                    primary={
                                                        <Typography
                                                            variant="body1"
                                                            sx={{
                                                                fontWeight: 'medium',
                                                            }}
                                                        >
                                                            {week.label}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{
                                                                fontSize: '0.75rem',
                                                            }}
                                                        >
                                                            {week.dateRange}
                                                        </Typography>
                                                    }
                                                />
                                                <ListItemSecondaryAction>
                                                    <Radio
                                                        checked={selectedWeek === week.id}
                                                        onChange={() => handleWeekChange(week.id)}
                                                        size="small"
                                                        sx={{
                                                            '&.Mui-checked': {
                                                                color: '#1976d2',
                                                            },
                                                        }}
                                                    />
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        ))}
                                </List>

                                {/* Select Button */}
                                <Box sx={{ p: 2 }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        sx={{
                                            bgcolor: '#063455',
                                            color: 'white',
                                            py: 1.5,
                                            textTransform: 'none',
                                            '&:hover': {
                                                bgcolor: '#063455',
                                            },
                                        }}
                                    >
                                        Select
                                    </Button>
                                </Box>
                            </Paper>
                        </Box>
                    )}

                    {/* Main Content */}
                    <Paper
                        elevation={0}
                        sx={{
                            width: '100%',
                            maxWidth: '732px',
                            overflow: 'hidden',
                            p: 2,
                            border: '2px solid #E3E3E3',
                            flexGrow: 1,
                        }}
                    >
                        <Box sx={{ px: 2, mb: 2 }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    mb: 1,
                                    color: '#121212',
                                    fontSize: '14px',
                                }}
                            >
                                Choose Order Type
                            </Typography>
                            <ToggleButtonGroup
                                value={orderDetails.order_type}
                                exclusive
                                onChange={(e, value) => handleOrderTypeChange(value)}
                                aria-label="order type"
                                sx={{
                                    width: '100%',
                                    height: '100px',
                                    gap: 2,
                                    '& .MuiToggleButtonGroup-grouped:not(:first-of-type)': {
                                        borderLeft: '1px solid #063455',
                                    },
                                }}
                            >
                                <ToggleButton
                                    value="dineIn"
                                    aria-label="dine in"
                                    sx={{
                                        flex: 1,
                                        py: 1.5,
                                        flexDirection: 'column',
                                        textTransform: 'none',
                                        border: '1px solid #063455',
                                        backgroundColor: orderDetails.order_type === 'dineIn' ? '#B0DEFF' : 'transparent',
                                        color: orderDetails.order_type === 'dineIn' ? '#1976d2' : 'inherit',
                                        '&.Mui-selected': {
                                            backgroundColor: '#B0DEFF',
                                            color: '#1976d2',
                                            '&:hover': {
                                                backgroundColor: '#B0DEFF',
                                            },
                                        },
                                    }}
                                >
                                    <FoodIcon
                                        sx={{
                                            mb: 0.5,
                                            color: orderDetails.order_type === 'dineIn' ? '#063455' : 'inherit',
                                        }}
                                    />
                                    <Typography variant="body2">Dine In</Typography>
                                </ToggleButton>

                                <ToggleButton
                                    value="delivery"
                                    aria-label="delivery"
                                    sx={{
                                        flex: 1,
                                        py: 1.5,
                                        flexDirection: 'column',
                                        textTransform: 'none',
                                        border: '1px solid #063455',
                                        '&.Mui-selected': {
                                            backgroundColor: '#B0DEFF',
                                            color: '#1976d2',
                                            '&:hover': {
                                                backgroundColor: '#B0DEFF',
                                            },
                                        },
                                    }}
                                >
                                    {/* <ShopIcon
                                        sx={{
                                            mb: 0.5,
                                            fill: orderDetails.order_type === 'delivery' ? '#063455' : 'inherit',
                                        }}
                                    /> */}
                                    <CiDeliveryTruck
                                        style={{
                                            height: '35px',
                                            width: '35px',
                                            // marginBottom: "2px",
                                            fill: orderDetails.order_type === 'delivery' ? '#063455' : 'inherit',
                                        }}
                                    />
                                    <Typography variant="body2">Delivery</Typography>
                                </ToggleButton>

                                <ToggleButton
                                    value="takeaway"
                                    aria-label="takeaway"
                                    sx={{
                                        flex: 1,
                                        py: 1.5,
                                        flexDirection: 'column',
                                        textTransform: 'none',
                                        border: '1px solid #063455',
                                        '&.Mui-selected': {
                                            backgroundColor: '#B0DEFF',
                                            color: '#1976d2',
                                            '&:hover': {
                                                backgroundColor: '#B0DEFF',
                                            },
                                        },
                                    }}
                                >
                                    <ShopIcon
                                        sx={{
                                            mb: 0.5,
                                            fill: orderDetails.order_type === 'takeaway' ? '#063455' : 'inherit',
                                        }}
                                    />
                                    <Typography variant="body2">Takeaway</Typography>
                                </ToggleButton>

                                <ToggleButton
                                    value="reservation"
                                    aria-label="reservation"
                                    sx={{
                                        flex: 1,
                                        py: 1.5,
                                        flexDirection: 'column',
                                        textTransform: 'none',
                                        border: '1px solid #063455',
                                        '&.Mui-selected': {
                                            backgroundColor: '#B0DEFF',
                                            color: '#1976d2',
                                            '&:hover': {
                                                backgroundColor: '#B0DEFF',
                                            },
                                        },
                                    }}
                                >
                                    <SofaIcon
                                        sx={{
                                            mb: 0.5,
                                            fill: orderDetails.order_type === 'reservation' ? '#063455' : 'inherit',
                                        }}
                                    />
                                    <Typography variant="body2">Reservation</Typography>
                                </ToggleButton>

                                <ToggleButton
                                    value="room"
                                    aria-label="room"
                                    sx={{
                                        flex: 1,
                                        py: 1.5,
                                        flexDirection: 'column',
                                        textTransform: 'none',
                                        border: '1px solid #063455',
                                        '&.Mui-selected': {
                                            backgroundColor: '#B0DEFF',
                                            color: '#1976d2',
                                            '&:hover': {
                                                backgroundColor: '#B0DEFF',
                                            },
                                        },
                                    }}
                                >
                                    <MeetingRoomIcon
                                        sx={{
                                            mb: 0.5,
                                            color: orderDetails.order_type === 'room' ? '#063455' : 'inherit',
                                        }}
                                    />
                                    <Typography variant="body2">Room</Typography>
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Box>

                        {/* =====  */}
                        {orderDetails.order_type === 'dineIn' && <DineDialog memberTypes={memberTypes} floorTables={floorTables} />}
                        {(orderDetails.order_type === 'takeaway' || orderDetails.order_type === 'delivery') && <TakeAwayDialog />}
                        {orderDetails.order_type === 'reservation' && <ReservationDialog />}
                        {orderDetails.order_type === 'room' && <RoomDialog roomTypes={roomTypes} />}
                    </Paper>
                </Box>
            </div>

            {/* <div
                style={{
                    position: 'fixed',
                    bottom: '0',
                    left: '0',
                    backgroundColor: 'white',
                    zIndex: '9999',
                    maxWidth: '300px',
                    overflow: 'auto',
                    border: '1px solid #ccc',
                }}
            >
                <div style={{ width: '40px', height: '40px', backgroundColor: 'red', borderRadius: '50%', cursor: 'pointer' }} onClick={() => setShowData(!showData)}></div>
                {showData && <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(orderDetails, null, 2)}</pre>}
            </div> */}
        </>
    );
};
NewOrder.layout = (page) => page;
export default NewOrder;
