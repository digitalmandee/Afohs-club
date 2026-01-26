import SideNav from '@/components/App/SideBar/SideNav';
import { AccessTime, FilterAlt as FilterIcon } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import { Avatar, Box, Button, Drawer, FormControl, Grid, InputBase, InputLabel, List, ListItem, ListItemText, MenuItem, Pagination, Paper, Select, Typography, Autocomplete, TextField, Chip } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import CancelOrder from './Cancel';
import EditOrderModal from './EditModal';
import OrderFilter from './Filter';
import { router } from '@inertiajs/react';
import { enqueueSnackbar } from 'notistack';
import debounce from 'lodash.debounce';
import axios from 'axios';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const Dashboard = ({ orders, allrestaurants, filters }) => {
    const [open, setOpen] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Search Order State
    const [searchId, setSearchId] = useState(filters.search_id || '');
    const [searchName, setSearchName] = useState(filters.search_name || '');
    const [searchMembership, setSearchMembership] = useState(filters.search_membership || '');
    const [customerType, setCustomerType] = useState(filters.customer_type || 'all');

    // Suggestions State
    const [suggestions, setSuggestions] = useState([]);
    const [membershipSuggestions, setMembershipSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    // Add state for category filtering
    const [activeCategory, setActiveCategory] = useState('All Menus');

    const openFilter = () => setIsFilterOpen(true);
    const closeFilter = () => setIsFilterOpen(false);
    const [orderItems, setOrderItems] = useState([]);
    const [showCancelModal, setShowCancelModal] = useState(false);

    const handleOpenCancelModal = () => setShowCancelModal(true);
    const handleCloseCancelModal = () => {
        setSelectedCard(null);
        setShowCancelModal(false);
    };

    const handleConfirmCancel = (cancelData) => {
        const payload = {
            status: 'cancelled',
            remark: cancelData.remark,
            instructions: cancelData.instructions,
            cancelType: cancelData.cancelType,
        };

        router.post(route('orders.update', { id: selectedCard.id }), payload, {
            preserveScroll: true,
            onSuccess: () => {
                enqueueSnackbar('Order updated successfully!', { variant: 'success' });
                setSelectedCard(null);
                setShowCancelModal(false);
            },
            onError: (errors) => {
                enqueueSnackbar('Something went wrong: ' + JSON.stringify(errors), { variant: 'error' });
            },
        });
    };

    const onSave = (status) => {
        const updatedItems = orderItems.filter((item) => typeof item.id === 'string' && item.id.startsWith('update-'));
        const newItems = orderItems.filter((item) => item.id === 'new');

        // Exclude canceled items
        const activeItems = orderItems.filter((item) => item.status !== 'cancelled');

        const subtotal = Math.round(activeItems.reduce((acc, item) => acc + Number(item.order_item.total_price || 0), 0));

        const discount = Number(selectedCard.discount) || 0;
        const discountedSubtotal = subtotal - discount;

        // Now apply tax on the discounted amount
        const taxRate = Number(selectedCard.tax) || 0;
        const taxAmount = Math.round(discountedSubtotal * taxRate);

        // Final total
        const total = Math.round(discountedSubtotal + taxAmount);

        const payload = {
            updated_items: updatedItems,
            new_items: newItems,
            subtotal,
            discount,
            tax_rate: taxRate,
            total_price: total,
            status,
        };

        return new Promise((resolve, reject) => {
            router.post(route('orders.update', { id: selectedCard.id }), payload, {
                preserveScroll: true,
                onSuccess: () => {
                    enqueueSnackbar('Order updated successfully!', { variant: 'success' });
                    setOpenModal(false);
                    resolve(); // <-- resolve the promise
                },
                onError: (errors) => {
                    enqueueSnackbar('Something went wrong: ' + JSON.stringify(errors), { variant: 'error' });
                    reject(errors); // <-- reject the promise
                },
            });
        });
    };

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
                    const response = await axios.get(route('api.orders.search-customers'), {
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

    // Fetch Membership Suggestions
    const fetchMembershipSuggestions = useMemo(
        () =>
            debounce(async (query) => {
                if (!query) {
                    setMembershipSuggestions([]);
                    return;
                }
                try {
                    const response = await axios.get(route('api.orders.search-customers'), {
                        params: { query, type: 'all' },
                    });
                    setMembershipSuggestions(response.data);
                } catch (error) {
                    console.error('Error fetching membership suggestions:', error);
                }
            }, 300),
        [],
    );

    useEffect(() => {
        if (searchName) {
            fetchSuggestions(searchName, customerType);
        } else {
            setSuggestions([]);
        }
    }, [searchName, customerType]);

    useEffect(() => {
        if (searchMembership) {
            fetchMembershipSuggestions(searchMembership);
        } else {
            setMembershipSuggestions([]);
        }
    }, [searchMembership]);

    const handleApply = () => {
        router.get(
            route('order.management'),
            {
                ...filters,
                search_id: searchId,
                search_name: searchName,
                search_membership: searchMembership,
                customer_type: customerType,
                page: 1,
            },
            { preserveState: true },
        );
    };

    const handleReset = () => {
        setSearchId('');
        setSearchName('');
        setSearchMembership('');
        setCustomerType('all');
        router.get(route('order.management'), {}, { preserveState: true });
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
                <Box
                    sx={{
                        px: 3,
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            pt: 5,
                        }}
                    >
                        {/* Left - Heading */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <h2 className="fw-normal mb-0" style={{ color: '#063455', fontSize: '30px' }}>
                                Order Management
                            </h2>
                        </Box>

                        {/* Right - Search + Filter */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<FilterIcon />}
                                style={{
                                    borderRadius: '0px',
                                    color: '#063455',
                                    border: '1px solid #063455',
                                    textTransform: 'none',
                                    height: '40px',
                                }}
                                onClick={openFilter}
                            >
                                Filter
                            </Button>
                        </Box>
                    </Box>

                    {/* New Filter Design */}
                    <Box sx={{ mb: 3, mt: 3, boxShadow: 'none' }}>
                        <Grid container spacing={2} alignItems="center">
                            {/* Customer Type Selection */}
                            <Grid item xs={12} md={2}>
                                <FormControl
                                    size="small"
                                    sx={{
                                        width: '100%',
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '16px',
                                        },
                                    }}
                                >
                                    <Select
                                        value={customerType}
                                        onChange={(e) => setCustomerType(e.target.value)}
                                        displayEmpty
                                        MenuProps={{
                                            sx: {
                                                '& .MuiPaper-root': {
                                                    borderRadius: '16px',
                                                    boxShadow: 'none !important',
                                                    marginTop: '4px',
                                                    maxHeight: '180px',
                                                    overflowY: 'auto',
                                                },
                                                '& .MuiMenuItem-root': {
                                                    borderRadius: '16px',
                                                    '&:hover': {
                                                        backgroundColor: '#063455 !important',
                                                        color: '#fff !important',
                                                    },
                                                },
                                            },
                                        }}
                                    >
                                        <MenuItem value="all">All Types</MenuItem>
                                        <MenuItem value="member">Member</MenuItem>
                                        <MenuItem value="corporate">Corporate</MenuItem>
                                        <MenuItem value="guest">Guest</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Search by Name with Autocomplete */}
                            <Grid item xs={12} md={3}>
                                <Autocomplete
                                    freeSolo
                                    disablePortal
                                    options={suggestions}
                                    getOptionLabel={(option) => option.value || option}
                                    inputValue={searchName}
                                    onInputChange={(event, newInputValue) => {
                                        setSearchName(newInputValue);
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

                            {/* Search by Membership Number */}
                            <Grid item xs={12} md={2}>
                                <Autocomplete
                                    freeSolo
                                    disablePortal
                                    options={membershipSuggestions}
                                    getOptionLabel={(option) => option.membership_no || option.customer_no || option.value || option}
                                    inputValue={searchMembership}
                                    onInputChange={(event, newInputValue) => {
                                        setSearchMembership(newInputValue);
                                    }}
                                    renderInput={(params) => <TextField {...params} fullWidth size="small" label="Membership #" placeholder="Number..." sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }} />}
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
                                <TextField fullWidth size="small" label="Order ID" placeholder="Order ID..." value={searchId} onChange={(e) => setSearchId(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }} />
                            </Grid>

                            {/* Action Buttons */}
                            <Grid item xs={12} md={3} sx={{ display: 'flex', gap: 2 }}>
                                <Button variant="outlined" onClick={handleReset} sx={{ borderRadius: '16px', textTransform: 'none', color: '#063455', border: '1px solid #063455', paddingLeft: 4, paddingRight: 4 }}>
                                    Reset
                                </Button>
                                <Button variant="contained" startIcon={<SearchIcon />} onClick={handleApply} sx={{ borderRadius: '16px', backgroundColor: '#063455', textTransform: 'none', paddingLeft: 4, paddingRight: 4 }}>
                                    Search
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>

                    <Grid
                        container
                        spacing={3}
                        sx={{
                            mt: 2,
                        }}
                    >
                        {orders.data.length > 0 ? (
                            orders.data.map((card, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <Paper
                                        elevation={1}
                                        sx={{
                                            maxWidth: 360,
                                            mx: 'auto',
                                            borderRadius: 1,
                                            overflow: 'hidden',
                                            border: '1px solid #E3E3E3',
                                        }}
                                    >
                                        {/* Header */}
                                        <Box sx={{ bgcolor: card.status === 'cancelled' ? '#FF0000' : card.status === 'refund' ? '#FFA500' : card.status === 'in_progress' ? '#E6E6E6' : card.status === 'completed' ? '#4BB543' : '#063455', color: card.status === 'cancelled' ? '#FFFFFF' : card.status === 'refund' ? '#FFFFFF' : card.status === 'in_progress' ? '#000000' : card.status === 'completed' ? '#FFFFFF' : '#FFFFFF', p: 2, position: 'relative' }}>
                                            <Typography sx={{ fontWeight: 500, mb: 0.5, fontSize: '18px' }}>#{card.id}</Typography>
                                            <Typography sx={{ fontWeight: 500, mb: 2, fontSize: '18px' }}>
                                                {card.member ? `${card.member?.full_name} (${card.member?.membership_no})` : `${card.customer ? card.customer.name : card.employee?.name}`}
                                                <Typography component="span" variant="body2" textTransform="capitalize" sx={{ ml: 0.3, opacity: 0.8 }}>
                                                    ({card.order_type})
                                                </Typography>
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    bgcolor: '#0066cc',
                                                    width: 'fit-content',
                                                    px: 1,
                                                    py: 0.5,
                                                    borderRadius: 0.5,
                                                }}
                                            >
                                                <AccessTime fontSize="small" sx={{ fontSize: 16, color: '#fff', mr: 0.5 }} />
                                                <Typography variant="caption" sx={{ color: '#fff' }}>
                                                    {card.start_time}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                                                <Typography sx={{ fontWeight: 500, mb: 1, fontSize: '18px' }}>{card.member?.member_type?.name}</Typography>
                                                <Box display="flex">
                                                    <Avatar sx={{ bgcolor: '#1976D2', width: 36, height: 36, fontSize: 14, fontWeight: 500, mr: 1 }}>{card.table?.table_no}</Avatar>
                                                    <Avatar sx={{ bgcolor: '#E3E3E3', width: 36, height: 36, color: '#666' }}>
                                                        <img
                                                            src="/assets/food-tray.png"
                                                            alt=""
                                                            style={{
                                                                width: 24,
                                                                height: 24,
                                                            }}
                                                        />
                                                    </Avatar>
                                                </Box>
                                            </Box>
                                        </Box>

                                        {/* Order Items */}
                                        <List sx={{ py: 0 }}>
                                            {card.order_items.slice(0, 4).map((item, index) => (
                                                <ListItem key={index} divider={index < card.order_items.length - 1} sx={{ py: 1, px: 2, textDecoration: item.status === 'cancelled' ? 'line-through' : 'none', opacity: item.status === 'cancelled' ? 0.6 : 1 }}>
                                                    <ListItemText
                                                        sx={{
                                                            color: '#121212',
                                                            fontWeight: 500,
                                                            fontSize: '14px',
                                                        }}
                                                        primary={item.order_item.name}
                                                    />
                                                    <Typography variant="body2" sx={{ color: '#121212', fontWeight: 500, fontSize: '14px' }}>
                                                        {item.order_item.quantity}x
                                                    </Typography>
                                                </ListItem>
                                            ))}

                                            {/* Show More */}
                                            {card.order_items.length > 4 && (
                                                <ListItem sx={{ py: 1.5, px: 2, color: '#1976d2', cursor: 'pointer' }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        Show More ({card.order_items.length - 4})
                                                    </Typography>
                                                </ListItem>
                                            )}
                                        </List>

                                        {/* Action Buttons */}
                                        <Box sx={{ display: 'flex', p: 2, gap: 2 }}>
                                            <Button
                                                variant="outlined"
                                                fullWidth
                                                disabled={card.status === 'cancelled'}
                                                sx={{ borderColor: '#003153', color: '#003153', bgcolor: card.status === 'cancelled' ? '#E3E3E3' : 'transparent', textTransform: 'none', py: 1 }}
                                                onClick={() => {
                                                    setSelectedCard(card);
                                                    handleOpenCancelModal();
                                                }}
                                            >
                                                {card.status === 'cancelled' ? 'Cancelled' : 'Cancel'}
                                            </Button>
                                            <Button
                                                variant="contained"
                                                fullWidth
                                                sx={{
                                                    bgcolor: '#003153',
                                                    '&:hover': { bgcolor: '#00254d' },
                                                    textTransform: 'none',
                                                    py: 1,
                                                }}
                                                onClick={() => {
                                                    setSelectedCard(card);
                                                    setOrderItems(card.order_items);
                                                    setOpenModal(true);
                                                }}
                                            >
                                                Edit
                                            </Button>
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))
                        ) : (
                            <Grid item xs={12}>
                                <Typography variant="body1" sx={{ textAlign: 'center', mt: 3 }}>
                                    No orders found.
                                </Typography>
                            </Grid>
                        )}
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'end', py: 4 }}>
                        <Pagination
                            count={orders.last_page}
                            page={orders.current_page}
                            onChange={(e, page) =>
                                router.get(
                                    route('order.management'),
                                    {
                                        page,
                                        search_id: searchId,
                                        search_name: searchName,
                                        search_membership: searchMembership,
                                        ...filters,
                                    },
                                    { preserveState: true },
                                )
                            }
                        />
                    </Box>
                    {showCancelModal && <CancelOrder order={selectedCard} onClose={handleCloseCancelModal} onConfirm={handleConfirmCancel} />}
                    <Drawer
                        anchor="right"
                        open={isFilterOpen}
                        onClose={closeFilter}
                        PaperProps={{
                            sx: { width: 600, px: 2, top: 15, right: 15, height: 416 }, // Customize drawer width and padding
                        }}
                    >
                        <OrderFilter onClose={closeFilter} />
                    </Drawer>
                    <EditOrderModal
                        open={openModal}
                        allrestaurants={allrestaurants}
                        onClose={() => {
                            setOpenModal(false);
                            setOrderItems([]);
                        }}
                        order={selectedCard}
                        orderItems={orderItems}
                        setOrderItems={setOrderItems}
                        onSave={(status) => onSave(status)}
                    />
                </Box>
            </div>
        </>
    );
};
Dashboard.layout = (page) => page;
export default Dashboard;
