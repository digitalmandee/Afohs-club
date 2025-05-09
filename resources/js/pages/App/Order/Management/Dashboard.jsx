import React, { useState } from 'react'
import SideNav from '@/components/App/SideBar/SideNav';
import {
    Drawer,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Grid,
    Button,
    List,
    ListItem,
    ListItemText,
    Avatar,
    Paper,
    InputBase,
} from "@mui/material"
import { Container, Row, Col, Card, Form, Badge, Modal } from "react-bootstrap"
import { Add, Remove, CalendarToday, ArrowBack, FilterAlt as FilterIcon, } from "@mui/icons-material"
import SearchIcon from '@mui/icons-material/Search';
import { Notifications } from "@mui/icons-material"
import { AccessTime } from "@mui/icons-material"
import EditOrderModal from './EditModal';
import OrderFilter from './Filter';
import CancelOrder from './Cancel';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const Dashboard = () => {
    const [open, setOpen] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const openFilter = () => setIsFilterOpen(true);
    const closeFilter = () => setIsFilterOpen(false);
    const [orderItems, setOrderItems] = useState([
        { id: 1, name: "Cappuccino", quantity: 2, removed: false },
        { id: 2, name: "Soda Beverage", quantity: 3, removed: false },
        { id: 3, name: "French Toast Sugar", quantity: 2, removed: true },
        { id: 4, name: "Chocolate Croissant", quantity: 1, removed: false },
        { id: 5, name: "French Toast Sugar", quantity: 2, removed: false },
    ]);
    const [showCancelModal, setShowCancelModal] = useState(false);

    const handleOpenCancelModal = () => setShowCancelModal(true);
    const handleCloseCancelModal = () => setShowCancelModal(false);

    const handleConfirmCancel = () => {
        // Do your cancel logic here (API call, state update, etc.)
        console.log('Order cancelled');
        setShowCancelModal(false);
    };
    const handleFilterClose = () => setShowFilter(false);
    const handleFilterShow = () => setShowFilter(true);

    const cardData = [
        {
            id: "#001",
            membership: "Gold",
            type: "Member",
            time: "02:02",
            orderItems: [
                { name: "Cappucino", quantity: 2 },
                { name: "Soda Beverage", quantity: 3 },
                { name: "French Toast Sugar", quantity: 3 },
                { name: "Chocolate Croissant", quantity: 2 },
                { name: "Green Tea", quantity: 1 },
            ],
        },
        {
            id: "#002",
            membership: "Silver",
            type: "Member",
            time: "01:45",
            orderItems: [
                { name: "Latte", quantity: 2 },
                { name: "Donut", quantity: 4 },
                { name: "Espresso", quantity: 1 },
                { name: "Bagel", quantity: 2 },
            ],
        },
        {
            id: "#003",
            membership: "Platinum",
            type: "VIP",
            time: "03:15",
            orderItems: [
                { name: "Americano", quantity: 1 },
                { name: "Muffin", quantity: 2 },
                { name: "Iced Tea", quantity: 3 },
                { name: "Croissant", quantity: 2 },
            ],
        },
        {
            id: "#004",
            membership: "Affiliated",
            type: "Corporate",
            time: "06:35",
            orderItems: [
                { name: "Americano", quantity: 1 },
                { name: "Muffin", quantity: 2 },
                { name: "Iced Tea", quantity: 3 },
                { name: "Croissant", quantity: 2 },
            ],
        },
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
                <Box sx={{
                    px: 3
                }}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            pt: 5
                        }}
                    >
                        {/* Left - Heading */}
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <h2 className="mb-0 fw-normal" style={{ color: "#3F4E4F", fontSize: '30px' }}>
                                Order Management
                            </h2>
                        </Box>

                        {/* Right - Search + Filter */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    border: "1px solid #121212",
                                    borderRadius: "0px",
                                    width: "350px",
                                    height: '40px',
                                    padding: "4px 8px",
                                    backgroundColor: '#FFFFFF'
                                }}
                            >
                                <SearchIcon style={{ color: "#121212", marginRight: "8px" }} />
                                <InputBase
                                    placeholder="Search employee member here"
                                    fullWidth
                                    sx={{ fontSize: "14px" }}
                                    inputProps={{ style: { padding: 0 } }}
                                />
                            </div>

                            <Button
                                variant="outlined"
                                startIcon={<FilterIcon />}
                                style={{
                                    borderRadius: '0px',
                                    color: '#063455',
                                    border: '1px solid #063455',
                                    textTransform: 'none',
                                    height: '40px'
                                }}
                                onClick={openFilter}
                            >
                                Filter
                            </Button>
                        </Box>
                    </Box>
                    <Grid container spacing={3} sx={{
                        mt: 2
                    }}>
                        {cardData.map((card, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Paper
                                    elevation={1}
                                    sx={{
                                        maxWidth: 360,
                                        mx: "auto",
                                        borderRadius: 1,
                                        overflow: "hidden",
                                        border: '1px solid #E3E3E3'
                                    }}
                                >
                                    {/* Header */}
                                    <Box sx={{ bgcolor: "#063455", color: "white", p: 2, position: "relative" }}>
                                        <Typography sx={{ fontWeight: 500, mb: 0.5, fontSize: '18px', color: '#FFFFFF' }}>
                                            {card.id}
                                        </Typography>
                                        <Typography sx={{ fontWeight: 500, mb: 2, fontSize: '18px', color: '#FFFFFF' }}>
                                            {card.membership}{" "}
                                            <Typography component="span" variant="body2" sx={{ opacity: 0.8 }}>
                                                ({card.type})
                                            </Typography>
                                        </Typography>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                bgcolor: "#0066cc",
                                                width: "fit-content",
                                                px: 1,
                                                py: 0.5,
                                                borderRadius: 0.5,
                                            }}
                                        >
                                            <AccessTime fontSize="small" sx={{ fontSize: 16, mr: 0.5 }} />
                                            <Typography variant="caption">{card.time}</Typography>
                                        </Box>
                                        <Box sx={{ position: "absolute", top: 45, right: 16, display: "flex" }}>
                                            <Avatar sx={{ bgcolor: "#1976D2", width: 36, height: 36, fontSize: 14, fontWeight: 500, mr: 1 }}>
                                                T2
                                            </Avatar>
                                            <Avatar sx={{ bgcolor: "#E3E3E3", width: 36, height: 36, color: "#666" }}>
                                                <img src="/assets/food-tray.png" alt="" style={{
                                                    width: 24,
                                                    height: 24
                                                }} />
                                            </Avatar>
                                        </Box>
                                    </Box>

                                    {/* Order Items */}
                                    <List sx={{ py: 0 }}>
                                        {card.orderItems.slice(0, 4).map((item, index) => (
                                            <ListItem key={index} divider={index < card.orderItems.length - 1} sx={{ py: 1, px: 2 }}>
                                                <ListItemText sx={{
                                                    color: '#121212', fontWeight: 500, fontSize: '14px'
                                                }} primary={item.name} />
                                                <Typography variant="body2" sx={{ color: "#121212", fontWeight: 500, fontSize: '14px' }}>
                                                    {item.quantity}x
                                                </Typography>
                                            </ListItem>
                                        ))}

                                        {/* Show More */}
                                        {card.orderItems.length > 4 && (
                                            <ListItem sx={{ py: 1.5, px: 2, color: "#1976d2", cursor: "pointer" }}>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    Show More ({card.orderItems.length - 4})
                                                </Typography>
                                            </ListItem>
                                        )}
                                    </List>

                                    {/* Action Buttons */}
                                    <Box sx={{ display: "flex", p: 2, gap: 2 }}>
                                        <Button
                                            variant="outlined"
                                            fullWidth
                                            sx={{ borderColor: "#003153", color: "#003153", textTransform: "none", py: 1 }}
                                            onClick={handleOpenCancelModal}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            sx={{
                                                bgcolor: "#003153",
                                                "&:hover": { bgcolor: "#00254d" },
                                                textTransform: "none",
                                                py: 1,
                                            }}
                                            onClick={() => {
                                                setSelectedCard(card);
                                                setOpenModal(true);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                    </Box>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                    {showCancelModal && (
                        <CancelOrder
                            onClose={handleCloseCancelModal}
                            onConfirm={handleConfirmCancel}
                        />
                    )}
                    <Drawer
                        anchor="right"
                        open={isFilterOpen}
                        onClose={closeFilter}
                        PaperProps={{
                            sx: { width: 600, px: 2, top:15, right:15, height:416 } // Customize drawer width and padding
                        }}
                    >
                        <OrderFilter onClose={closeFilter} />
                    </Drawer>
                    <EditOrderModal
                        open={openModal}
                        onClose={() => setOpenModal(false)}
                        orderItems={orderItems}
                        setOrderItems={setOrderItems}
                    />
                </Box>
            </div>
        </>
    )
}

export default Dashboard
