import SideNav from '@/components/App/SideBar/SideNav';
import { useState } from 'react';
import CancelOrder from './DelModal';
import NewSelfOrder from './NewOrder';
import ReservationOrder from './Reserve';
// import "./style.css"
import { router } from '@inertiajs/react';
import { Add } from '@mui/icons-material';
import { Box, Button, Chip, Grid, IconButton, Modal, Paper, Typography } from '@mui/material';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const Dashboard = () => {
    const [open, setOpen] = useState(false);
    const [showReserve, setShowReserve] = useState(false);
    const [showOrder, setShowOrder] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isNotificationVisible, setIsNotificationVisible] = useState(false);
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

    const handleCancelOrder = () => {
        setIsModalVisible(false); // Close the cancel order modal
        setIsNotificationVisible(true); // Show the notification

        // Auto-hide the notification after 3 seconds
        setTimeout(() => {
            setIsNotificationVisible(false);
        }, 3000);
    };

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
                                            Sales up to <strong>56%</strong> compared to yesterday
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
                                                    Rs 559,102.00
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
                                                        label="+ 40.0%"
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
                                                    Rs 223,640.80
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
                                            <Typography variant="h6">40%</Typography>
                                            <Typography variant="caption">Dine In</Typography>
                                        </Grid>
                                        <Grid item xs={3} textAlign="center">
                                            <Typography variant="h6">15%</Typography>
                                            <Typography variant="caption">Takeaway</Typography>
                                        </Grid>
                                        <Grid item xs={3} textAlign="center">
                                            <Typography variant="h6">35%</Typography>
                                            <Typography variant="caption">Delivery</Typography>
                                        </Grid>
                                        <Grid item xs={3} textAlign="center">
                                            <Typography variant="h6">10%</Typography>
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
                                <Modal
                                    open={showReserve}
                                    onClose={() => setShowReserve(false)}
                                    aria-labelledby="reservation-order-modal"
                                    sx={{ zIndex: 1300 }}
                                >
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
                                    {['Sun', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, index) => (
                                        <Grid
                                            item
                                            key={index}
                                            xs={12 / 7}
                                            sx={{
                                                textAlign: 'center',
                                                p: 1,
                                                borderRight: '1px solid #e0e0e0',
                                                borderTop: '1px solid #e0e0e0',
                                                borderBottom: '1px solid #e0e0e0',
                                                borderLeft: index === 0 ? '1px solid #e0e0e0' : 'none',
                                                bgcolor: index === 0 ? '#e6f0fa' : 'white',
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: '#6b7280',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {day}
                                            </Typography>

                                            <Box sx={{ mt: 1 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {7 + index}
                                                </Typography>
                                            </Box>

                                            {[0, 1, 2, 5].includes(index) && (
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
                                                    2
                                                </Box>
                                            )}
                                        </Grid>
                                    ))}
                                </Grid>

                                {/* Reservation List */}
                                <Box sx={{ mt: 3 }}>
                                    {/* Reservation 1 */}
                                    <Box
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
                                                    T12
                                                </Button>
                                            </Box>

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
                                                            Qafi Latif
                                                        </Typography>
                                                        <img
                                                            src="/assets/Diamond.png"
                                                            alt=""
                                                            style={{
                                                                width: 24,
                                                                height: 24,
                                                                marginLeft: '0.5rem',
                                                            }}
                                                        />
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
                                                        <Typography variant="caption">10:00 AM</Typography>
                                                    </Box>
                                                </Box>

                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: '#7F7F7F',
                                                        fontSize: '12px',
                                                    }}
                                                >
                                                    5 Person • 12 Items
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
                                                <Chip
                                                    label="#001"
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
                                                />
                                                <Chip
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
                                                />
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
                                                Process Order
                                            </Button>
                                        </Box>
                                    </Box>

                                    {/* Reservation 2 */}

                                    <Box
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
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    mr: 2,
                                                }}
                                            >
                                                <Button
                                                    variant="contained"
                                                    sx={{
                                                        bgcolor: '#0C67AA',
                                                        color: 'white',
                                                        borderRadius: '50%',
                                                        minWidth: 40,
                                                        height: 40,
                                                        p: 0,
                                                        fontWeight: '500',
                                                        fontSize: '0.875rem',
                                                    }}
                                                >
                                                    T32
                                                </Button>
                                            </Box>

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
                                                            Annette Black
                                                        </Typography>
                                                        <img
                                                            src="/assets/Diamond.png"
                                                            alt=""
                                                            style={{
                                                                height: 24,
                                                                width: 24,
                                                                marginLeft: '0.5rem',
                                                            }}
                                                        />
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
                                                        <Typography variant="caption">10:00 AM</Typography>
                                                    </Box>
                                                </Box>

                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: '#7F7F7F',
                                                        fontSize: '12px',
                                                    }}
                                                >
                                                    2 Person • Menu not yet added
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
                                                <Chip
                                                    label="#001"
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                        mr: 1,
                                                        bgcolor: '#E3E3E3',
                                                        color: 'black',
                                                        borderRadius: 1,
                                                        height: 24,
                                                        fontSize: '0.75rem',
                                                        fontWeight: 'medium',
                                                    }}
                                                />
                                                <Chip
                                                    label="DP • 50%"
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                        mr: 1,
                                                        bgcolor: '#E3E3E3',
                                                        color: 'black',
                                                        borderRadius: 1,
                                                        height: 24,
                                                        fontSize: '0.75rem',
                                                    }}
                                                />
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
                                                Process Order
                                            </Button>
                                        </Box>
                                    </Box>

                                    {/* Reservation 3 */}
                                    <Box
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
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    mr: 2,
                                                }}
                                            >
                                                <Button
                                                    variant="contained"
                                                    sx={{
                                                        bgcolor: '#0C67AA',
                                                        color: 'white',
                                                        borderRadius: '50%',
                                                        minWidth: 40,
                                                        height: 40,
                                                        p: 0,
                                                        fontWeight: '500',
                                                        fontSize: '0.875rem',
                                                    }}
                                                >
                                                    T14
                                                </Button>
                                            </Box>

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
                                                            Ronald Richards
                                                        </Typography>
                                                        <img
                                                            src="/assets/Diamond.png"
                                                            alt=""
                                                            style={{
                                                                height: 24,
                                                                width: 24,
                                                                marginLeft: '0.5rem',
                                                            }}
                                                        />
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
                                                        <Typography variant="caption">15:00 PM</Typography>
                                                    </Box>
                                                </Box>

                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: '#7F7F7F',
                                                        fontSize: '12px',
                                                    }}
                                                >
                                                    8 Person • 12 Items
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
                                                <Chip
                                                    label="#001"
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                        mr: 1,
                                                        bgcolor: '#E3E3E3',
                                                        color: 'black',
                                                        borderRadius: 1,
                                                        height: 24,
                                                        fontSize: '0.75rem',
                                                        fontWeight: 'medium',
                                                    }}
                                                />
                                                <Chip
                                                    label="DP • 50%"
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                        mr: 1,
                                                        bgcolor: '#E3E3E3',
                                                        color: 'black',
                                                        borderRadius: 1,
                                                        height: 24,
                                                        fontSize: '0.75rem',
                                                    }}
                                                />
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
                                                Process Order
                                            </Button>
                                        </Box>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                        {/* second column */}
                        <Grid item xs={12} md={3.4}>
                            {/* Top Right - Order Stats */}
                            <Grid item xs={12}>
                                <Grid container spacing={1.5}>
                                    {/* Total Transactions Card */}
                                    <Grid item xs={12}>
                                        <Paper
                                            sx={{
                                                bgcolor: '#3F4E4F',
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
                                                        bgcolor: '#202728',
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
                                                            width: 20,
                                                            height: 20,
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
                                                        320
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
                                                        280
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
                                                        40
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    </Grid>

                                    {/* Product Sold and Total Order Cards */}
                                    <Grid item xs={6}>
                                        <Paper
                                            sx={{
                                                bgcolor: '#3F4E4F',
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
                                                        bgcolor: '#202728',
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
                                                            height: 20,
                                                            width: 20,
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
                                                500{' '}
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
                                                bgcolor: '#3F4E4F',
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
                                                        bgcolor: '#202728',
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
                                                            height: 20,
                                                            width: 20,
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
                                                380{' '}
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
                                <Modal
                                    open={showOrder}
                                    onClose={() => setShowOrder(false)}
                                    aria-labelledby="reservation-order-modal"
                                    sx={{ zIndex: 1300 }}
                                >
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
                                    <Box
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
                                                        Miles Esther
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
                                                    2 items
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
                                                    label="#001"
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
                                                {isModalVisible && (
                                                    <CancelOrder onClose={() => setIsModalVisible(false)} onConfirm={handleCancelOrder} />
                                                )}
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
                                                Process Order
                                            </Button>
                                        </Box>
                                    </Box>

                                    {/* Order 2 */}

                                    <Box
                                        sx={{
                                            bgcolor: '#F6F6F6',
                                            borderRadius: 1,
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                            overflow: 'hidden',
                                            mt: 2,
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
                                                        Annette Black
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
                                                    2 items
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
                                                    label="#001"
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
                                            </Box>
                                            <img
                                                src="/assets/trash.png"
                                                alt=""
                                                style={{
                                                    height: 20,
                                                    width: 20,
                                                    marginLeft: '1rem',
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
                                                Process Order
                                            </Button>
                                        </Box>
                                    </Box>

                                    {/* Order 3 */}

                                    <Box
                                        sx={{
                                            bgcolor: '#F6F6F6',
                                            borderRadius: 1,
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                            overflow: 'hidden',
                                            mt: 2,
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
                                                        Bessie Cooper
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
                                                    2 items
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
                                                    label="#001"
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
                                            </Box>
                                            <img
                                                src="/assets/trash.png"
                                                alt=""
                                                style={{
                                                    height: 20,
                                                    width: 20,
                                                    marginLeft: '1rem',
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
                                                Process Order
                                            </Button>
                                        </Box>
                                    </Box>
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
                                                fontSize: '18px',
                                            }}
                                        >
                                            Order Queue
                                        </Typography>
                                        <img
                                            src="/assets/arrowicon.png"
                                            alt=""
                                            style={{
                                                height: '30px',
                                                width: '30px',
                                                marginLeft: '10px',
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
                                    <Paper
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
                                                    T2
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
                                                    Qafi Latif
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
                                                    4 items (
                                                    <Typography
                                                        component="span"
                                                        variant="caption"
                                                        sx={{
                                                            color: '#22D7A6',
                                                        }}
                                                    >
                                                        1 Complete
                                                    </Typography>
                                                    )
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
                                                    47.00
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Chip
                                                label="#001"
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    bgcolor: '#f5f5f5',
                                                    borderRadius: 1,
                                                    height: 24,
                                                }}
                                            />
                                            <Chip
                                                label="Ready to serve"
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
                                        </Box>
                                    </Paper>

                                    {/* Customer 2 */}
                                    <Paper
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
                                                    T3
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
                                                <img
                                                    src="/assets/camera.png"
                                                    alt=""
                                                    style={{
                                                        height: 46,
                                                        width: 46,
                                                    }}
                                                />
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
                                                    Hamid Indra
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
                                                    4 items (
                                                    <Typography
                                                        component="span"
                                                        variant="caption"
                                                        sx={{
                                                            color: '#22D7A6',
                                                        }}
                                                    >
                                                        1 Complete
                                                    </Typography>
                                                    )
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
                                                    47.00
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Chip
                                                    label="#003"
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                        bgcolor: '#f5f5f5',
                                                        borderRadius: 1,
                                                        height: 24,
                                                    }}
                                                />
                                                <Chip
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
                                                />
                                            </Box>
                                        </Box>
                                    </Paper>

                                    {/* Customer 3 */}
                                    <Paper
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
                                                    T4
                                                </Button>
                                                <Button
                                                    sx={{
                                                        bgcolor: '#E3E3E3',
                                                        height: 40,
                                                        minWidth: 40,
                                                        borderRadius: '50%',
                                                        // p: 0
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
                                                <img
                                                    src="/assets/camera.png"
                                                    alt=""
                                                    style={{
                                                        height: 46,
                                                        width: 46,
                                                    }}
                                                />
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
                                                    Miles Esther
                                                    <img
                                                        src="/assets/Guest.png"
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
                                                    4 items (
                                                    <Typography
                                                        component="span"
                                                        variant="caption"
                                                        sx={{
                                                            color: '#22D7A6',
                                                        }}
                                                    >
                                                        1 Complete
                                                    </Typography>
                                                    )
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
                                                    47.00
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Chip
                                                    label="#004"
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                        bgcolor: '#f5f5f5',
                                                        borderRadius: 1,
                                                        height: 24,
                                                    }}
                                                />
                                                <Chip
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
                                                />
                                            </Box>
                                        </Box>
                                    </Paper>
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
