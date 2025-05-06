'use client';
import SearchIcon from '@mui/icons-material/Search';
import {
    Avatar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputBase,
    InputLabel,
    List,
    ListItem,
    MenuItem,
    Paper,
    Radio,
    RadioGroup,
    Select,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material';
import axios from 'axios';

import { useEffect, useState } from 'react';
import CancelOrder from '../Dashboard/DelModal';

const OrderSaved = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isNotificationVisible, setIsNotificationVisible] = useState(false);
    const [savedOrders, setSavedOrders] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false); // State for popup
    const [selectedOrder, setSelectedOrder] = useState(null); // State for selected order
    const [formData, setFormData] = useState({
        waiter: '',
        start_time: '',
        start_date: '',
    }); // State for form data

    const [searchTerm, setSearchTerm] = useState('');
    const [filterOption, setFilterOption] = useState('all');
    const [orderDetails, setOrderDetails] = useState({
        floor: '',
        table: '',
    });
    const [floorTables, setFloorTables] = useState([]); // Replace with your actual data
    const [filteredTables, setFilteredTables] = useState([]); // Replace with your actual data

    const handleFloorChange = (value) => {
        setOrderDetails((prev) => ({ ...prev, floor: value }));
        // Add logic to filter tables based on the selected floor
    };

    const handleFilterOptionChange = (event, newValue) => {
        if (newValue !== null) {
            setFilterOption(newValue);
            // Add logic to filter tables based on the selected filter option
        }
    };

    const handleOrderDetailChange = (field, value) => {
        setOrderDetails((prev) => ({ ...prev, [field]: value }));
    };

    const handleCancelOrder = () => {
        setIsModalVisible(false); // Close the cancel order modal
        setIsNotificationVisible(true); // Show the notification

        // Auto-hide the notification after 3 seconds
        setTimeout(() => {
            setIsNotificationVisible(false);
        }, 3000);
    };

    const handleContinueOrderClick = (order) => {
        setSelectedOrder(order); // Set the selected order
        setIsPopupOpen(true); // Open the popup
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false); // Close the popup
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    useEffect(() => {
        axios
            .post(route('order.savedOrder'))
            .then((response) => {
                setSavedOrders(response.data.SavedOrders);
            })
            .catch((error) => {
                console.error('Error fetching saved orders:', error);
            });
    }, []);

    return (
        <Box
            sx={{
                bgcolor: '#FFFFFF',
                mt: 2,
                mx: -2,
                borderRadius: '20px',
                border: '1px solid #E3E3E3',
            }}
        >
            <Box
                sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <Typography
                    sx={{
                        color: '#7F7F7F',
                        fontSize: '12px',
                    }}
                >
                    Order Saved
                </Typography>
                <Typography
                    sx={{
                        color: '#063455',
                        fontWeight: 700,
                        fontSize: '14px',
                        marginLeft: 1,
                    }}
                >
                    {savedOrders.length} Order{savedOrders.length !== 1 ? 's' : ''}
                </Typography>
            </Box>
            <List sx={{ p: 0 }}>
                {savedOrders.map((order, index) => (
                    <ListItem
                        key={index}
                        sx={{
                            px: 2,
                        }}
                    >
                        <Box
                            sx={{
                                width: '100%',
                                bgcolor: '#F6F6F6',
                                border: '1px solid #E3E3E3',
                                p: 2,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Avatar
                                    sx={{
                                        bgcolor: '#0C67AA',
                                        width: 36,
                                        height: 36,
                                        fontSize: '16px',
                                        color: '#FFFFFF',
                                    }}
                                >
                                    {order.table_id}
                                </Avatar>
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
                                <IconButton
                                    size="small"
                                    sx={{
                                        ml: 1,
                                        bgcolor: '#E3E3E3',
                                        width: 36,
                                        height: 36,
                                    }}
                                >
                                    <img src="/assets/food-tray.png" alt="" />
                                </IconButton>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 500, mr: 1 }}>
                                    {order.user.name}
                                </Typography>

                                <img
                                    src="/assets/Diamond.png"
                                    alt=""
                                    style={{
                                        height: 24,
                                        width: 24,
                                    }}
                                />
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box
                                    sx={{
                                        bgcolor: '#E3E3E3',
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        #{order.order_number}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <img
                                        src="/assets/trash.png"
                                        alt=""
                                        style={{
                                            height: 20,
                                            width: 20,
                                            marginRight: 10,
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => setIsModalVisible(true)}
                                    />
                                    <Button
                                        variant="contained"
                                        size="small"
                                        sx={{
                                            bgcolor: '#0c3b5c',
                                            textTransform: 'none',
                                            '&:hover': {
                                                bgcolor: '#072a42',
                                            },
                                        }}
                                        onClick={() => handleContinueOrderClick(order)}
                                    >
                                        Continue Order
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </ListItem>
                ))}
            </List>

            {/* Popup Dialog */}
            <Dialog
                open={isPopupOpen}
                onClose={handleClosePopup}
                maxWidth="md" // Increased the maximum width to 'lg'
                fullWidth // Ensures the dialog takes the full width of the maxWidth
            >
                <DialogTitle>Continue Order</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>Are you sure you want to continue with order #{selectedOrder?.order_number}?</Typography>

                    {/* Select Waiter */}
                    <TextField
                        label="Select Waiter"
                        name="waiter"
                        value={formData.waiter}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{
                            shrink: true, // Ensures the label stays visible when the input is inactive
                        }}
                    />

                    {/* Select Time */}
                    <TextField
                        label="Select Time"
                        name="start_time"
                        type="time"
                        value={formData.start_time}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{
                            shrink: true, // Ensures the label stays visible when the input is inactive
                        }}
                    />

                    {/* Select Date */}
                    <TextField
                        label="Select Date"
                        name="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{
                            shrink: true, // Ensures the label stays visible when the input is inactive
                        }}
                    />

                    {/* Search and Filter */}
                    <Box sx={{ mb: 2, mt: 2, display: 'flex' }}>
                        <Paper
                            component="form"
                            sx={{
                                p: '2px 4px',
                                display: 'flex',
                                alignItems: 'center',
                                flex: 1,
                                border: '1px solid #ddd',
                                boxShadow: 'none',
                            }}
                        >
                            <InputBase
                                sx={{ ml: 1, flex: 1 }}
                                placeholder="Search"
                                inputProps={{ 'aria-label': 'search tables' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                                <SearchIcon />
                            </IconButton>
                        </Paper>
                        <FormControl sx={{ marginLeft: 1, minWidth: 200 }}>
                            {' '}
                            {/* Adjust the minWidth as needed */}
                            <InputLabel id="select-floor">Floor</InputLabel>
                            <Select
                                labelId="select-floor"
                                id="floor"
                                value={orderDetails.floor}
                                label="Floor"
                                onChange={(e) => handleFloorChange(e.target.value)}
                            >
                                {floorTables.map((item, index) => (
                                    <MenuItem value={item.id} key={index}>
                                        {item.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <ToggleButtonGroup
                            value={filterOption}
                            exclusive
                            onChange={handleFilterOptionChange}
                            aria-label="filter option"
                            size="small"
                            sx={{ ml: 1 }}
                        >
                            <ToggleButton
                                value="all"
                                aria-label="all"
                                sx={{
                                    textTransform: 'none',
                                    minWidth: 100,
                                    '&.Mui-selected': {
                                        backgroundColor: '#063455',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: '#063455',
                                        },
                                    },
                                }}
                            >
                                All
                            </ToggleButton>
                            <ToggleButton
                                value="available"
                                aria-label="available"
                                sx={{
                                    textTransform: 'none',
                                    minWidth: 100,
                                    '&.Mui-selected': {
                                        backgroundColor: '#063455',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: '#063455',
                                        },
                                    },
                                }}
                            >
                                Available
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    {/* Table Selection */}
                    <Box sx={{ mb: 2 }}>
                        <RadioGroup value={orderDetails.table} onChange={(e) => handleOrderDetailChange('table', e.target.value)}>
                            <Grid container spacing={1}>
                                {[
                                    { id: 1, table_no: 'T1', capacity: 4, available: true },
                                    { id: 2, table_no: 'T2', capacity: 2, available: true },
                                    { id: 3, table_no: 'T3', capacity: 6, available: true },
                                ].map((table) => (
                                    <Grid item xs={6} key={table.id}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 1.5,
                                                bgcolor: table.id === orderDetails.table ? '#FCF7EF' : table.available ? 'white' : '#f5f5f5',
                                                border: table.id === orderDetails.table ? '1px solid #A27B5C' : '1px solid #e0e0e0',
                                                borderRadius: 1,
                                                opacity: table.available ? 1 : 0.7,
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                                    {table.table_no}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                                        {table.capacity} person
                                                    </Typography>
                                                    {table.available ? (
                                                        <FormControlLabel
                                                            value={table.id}
                                                            control={<Radio size="small" />}
                                                            label=""
                                                            sx={{ m: 0, color: '#063455' }}
                                                        />
                                                    ) : (
                                                        <Typography variant="caption" sx={{ color: '#063455' }}>
                                                            {table.table_no.split('-')[0]} - Full
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </RadioGroup>
                    </Box>
                </DialogContent>
                {/* footer  */}
                <DialogActions>
                    <Button onClick={handleClosePopup} color="primary">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            // Add logic to handle form submission
                            console.log('Form Data:', formData);
                            handleClosePopup();
                        }}
                        color="primary"
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default OrderSaved;
