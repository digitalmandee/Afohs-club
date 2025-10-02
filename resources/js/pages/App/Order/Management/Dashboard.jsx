import SideNav from '@/components/App/SideBar/SideNav';
import { AccessTime, FilterAlt as FilterIcon } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import { Avatar, Box, Button, Drawer, FormControl, Grid, InputBase, InputLabel, List, ListItem, ListItemText, MenuItem, Pagination, Paper, Select, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import CancelOrder from './Cancel';
import EditOrderModal from './EditModal';
import OrderFilter from './Filter';
import { router } from '@inertiajs/react';
import { enqueueSnackbar } from 'notistack';
import debounce from 'lodash.debounce';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const Dashboard = ({ orders, allrestaurants, filters }) => {
    const [open, setOpen] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    // Search Order
    const [search, setSearch] = useState(filters.search || '');
    const [filteredOrders, setFilteredOrders] = useState(orders.data);
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

        const subtotal = Math.round(activeItems.reduce((acc, item) => acc + item.order_item.total_price, 0));

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

    // Debounced function to trigger search after user stops typing
    const triggerSearch = useMemo(
        () =>
            debounce((value) => {
                router.get(route('order.management'), { ...filters, search: value, page: 1 }, { preserveState: true });
            }, 500), // 500ms delay
        [],
    );

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        triggerSearch(value); // call debounced function
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
                            {/* Category Filter dropdown */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    border: '1px solid #121212',
                                    borderRadius: '0px',
                                    width: '300px',
                                    height: '40px',
                                    padding: '4px 8px',
                                    backgroundColor: '#FFFFFF',
                                }}
                            >
                                <SearchIcon style={{ color: '#121212', marginRight: '8px' }} />
                                <InputBase placeholder="Search by order ID, client name, or member ID" fullWidth sx={{ fontSize: '14px' }} inputProps={{ style: { padding: 0 } }} value={search} onChange={handleSearchChange} />
                            </div>

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
                                                {card.member ? `${card.member?.full_name} (${card.member?.membership_no})` : `${card.customer?.name}`}
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
                                        search,
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

export default Dashboard;
