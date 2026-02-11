// import SideNav from '@/components/App/SideBar/SideNav';
import { AccessTime, FilterAlt as FilterIcon } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import { Avatar, Box, Button, Drawer, FormControl, Grid, InputBase, InputLabel, List, ListItem, ListItemText, MenuItem, Pagination, Paper, Select, Typography, Autocomplete, TextField, Chip, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import CancelOrder from './Cancel';
import EditOrderModal from './EditModal';
import OrderFilter from './Filter';
import { router } from '@inertiajs/react';
import { enqueueSnackbar } from 'notistack';
import debounce from 'lodash.debounce';
import axios from 'axios';
import PaymentNow from '@/components/App/Invoice/PaymentNow';
import Receipt from '@/components/App/Invoice/Receipt';
import POSLayout from "@/components/POSLayout";

// const drawerWidthOpen = 240;
// const drawerWidthClosed = 110;

const Dashboard = ({ allrestaurants, filters, initialOrders }) => {
    // Orders State loaded via Axios
    const [orders, setOrders] = useState(initialOrders || { data: [], current_page: 1, last_page: 1 });
    const [loading, setLoading] = useState(true);

    // const [open, setOpen] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Search Order State
    const [searchId, setSearchId] = useState(filters.search_id || '');
    const [searchName, setSearchName] = useState(filters.search_name || '');
    const [searchMembership, setSearchMembership] = useState(filters.search_membership || '');
    const [customerType, setCustomerType] = useState(filters.customer_type || 'all');
    const [type, setType] = useState(filters.type || 'all');
    const [time, setTime] = useState(filters.time || 'all');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

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

        let subtotal = 0;
        let totalval = 0;
        let totalTax = 0;
        const taxRate = Number(selectedCard.tax) || 0;

        activeItems.forEach((item) => {
            const itemPrice = Number(item.order_item.price || 0);
            const itemQty = Number(item.order_item.quantity || 1);
            const itemTotal = itemPrice * itemQty;
            const itemDiscount = Number(item.order_item.discount_amount || 0);
            const netItemAmount = itemTotal - itemDiscount;

            // Check is_taxable from the order_item object (saved from OrderMenu)
            // If strictly not present, assume false or check product logic if available.
            // Better to rely on the saved flag.
            const isTaxable = item.order_item.is_taxable === true || item.order_item.is_taxable === 'true' || item.order_item.is_taxable === 1;

            const itemTax = isTaxable ? netItemAmount * taxRate : 0;

            subtotal += itemTotal;
            totalTax += itemTax;
        });

        // Global discount (from Order card) - typically applied before tax?
        // Logic in OrderMenu applies per-item discount.
        // Here `selectedCard.discount` seems to be an order-level discount.
        // If order-level discount exists, it complicates tax if it's not distributed.
        // However, the previous logic: `discountedSubtotal = subtotal - discount`.
        // If we have a global discount, we should probably distribute it or deduct it from taxable base?
        // For simplicity and consistency with previous turn, we'll assume the tax calculation from items is primary.
        // But wait, `selectedCard.discount` might be the SUM of item discounts?
        // line 111: `const discount = Number(selectedCard.discount) || 0;`
        // If it's a fixed value, we subtract it.

        // Let's stick to the previous logic structure but refine tax:
        // Use the per-item tax calculation if possible.
        // But if `selectedCard.discount` is a global fixed value, we might calculate tax on (Subtotal - GlobalDiscount).
        // If `is_taxable` varies, we can't easily apply global discount to tax base without distributing it.

        // RE-EVALUATION:
        // The backend `update` calculates tax per item (netAmount * taxRate).
        // `netAmount` is `subTotal - itemDiscountAmount`.
        // So global `discount` field on Order might just be a cached sum?
        // If `selectedCard.discount` is editable in this modal? No, it's not editable in the modal, only `tax_rate` is.
        // Wait, `EditModal` might allow editing items.

        const finalSubtotal = Math.round(subtotal);
        const finalDiscount = Number(selectedCard.discount) || 0;

        // Recalculate tax:
        // Since we can edit items in `EditModal`, we should rely on the item-level tax summation.
        // `totalTax` calculated above respects `is_taxable`.

        const total = Math.round(finalSubtotal - finalDiscount + totalTax);

        const payload = {
            updated_items: updatedItems,
            new_items: newItems,
            subtotal: finalSubtotal,
            discount: finalDiscount,
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
    // ------------- Data Fetching Logic -------------

    const fetchOrders = (page = 1) => {
        setLoading(true);
        axios
            .get(route('order.management'), {
                params: {
                    page,
                    search_id: searchId,
                    search_name: searchName,
                    search_membership: searchMembership,
                    time: time,
                    type: type === 'all' ? undefined : type,
                    customer_type: customerType === 'all' ? undefined : customerType,
                    start_date: startDate,
                    end_date: endDate,
                },
                headers: {
                    Accept: 'application/json', // Force JSON response
                },
            })
            .then((res) => {
                setOrders(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
                enqueueSnackbar('Failed to load orders', { variant: 'error' });
            });
    };

    useEffect(() => {
        // Initial load
        fetchOrders();
    }, []); // Only on mount

    const handleApply = () => {
        fetchOrders(1);
    };

    const handleReset = () => {
        setSearchId('');
        setSearchName('');
        setSearchMembership('');
        setCustomerType('all');
        setType('all');
        setTime('all');
        setStartDate('');
        setEndDate('');
        setLoading(true);
        axios.get(route('order.management')).then((res) => {
            setOrders(res.data);
            setLoading(false);
        });
    };

    const handleSuggestionFetch = useMemo(
        () =>
            debounce((inputValue, type) => {
                if (!inputValue) return;
                setLoadingSuggestions(true);
                axios
                    .get(route('api.orders.search-customers'), { params: { query: inputValue, type } })
                    .then((response) => {
                        const formatted = response.data.map((item) => ({
                            ...item,
                            label: item.name || item.full_name,
                        }));
                        if (type === 'membership') {
                            setMembershipSuggestions(formatted);
                        } else {
                            setSuggestions(formatted);
                        }
                    })
                    .catch((error) => console.error(error))
                    .finally(() => setLoadingSuggestions(false));
            }, 300),
        [],
    );

    useEffect(() => {
        if (searchName) handleSuggestionFetch(searchName, customerType);
        else setSuggestions([]);
    }, [searchName, customerType]);

    useEffect(() => {
        if (searchMembership)
            handleSuggestionFetch(searchMembership, 'all'); // Assuming membership search is for all types
        else setMembershipSuggestions([]);
    }, [searchMembership]);

    // ------------------------------------------------

    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [billModalOpen, setBillModalOpen] = useState(false); // For Bill/Receipt Print
    const [selectedInvoice, setSelectedInvoice] = useState(null); // For PaymentNow

    // For Receipt Component
    const getReceiptData = (order) => {
        if (!order) return null;
        // If order has invoice attach it or map data
        // For Generate Invoice print -> show "Bill" / "Unpaid Invoice"
        return {
            id: order.id,
            order_no: order.id,
            start_date: order.start_date,
            date: order.paid_at || new Date().toISOString(),
            amount: order.amount || 0, // subtotal
            discount: order.discount || 0,
            tax: order.tax_rate || order.tax || 0,
            total_price: order.total_price, // grand total
            order_type: order.order_type,
            member: order.member,
            customer: order.customer,
            employee: order.employee,
            table: order.table,
            // Items need to be mapped if structure differs
            order_items: order.order_items?.map((item) => ({
                order_item: item.order_item || item, // handle structure variations
                name: (item.order_item || item).name,
                quantity: (item.order_item || item).quantity,
                price: (item.order_item || item).price,
                total_price: (item.order_item || item).total_price,
            })),
            invoice_no: order.invoice?.invoice_no || 'DRAFT', // Show invoice no if exists
            status: order.payment_status === 'paid' ? 'Paid' : 'Unpaid',
        };
    };

    const handleGenerateInvoice = (order) => {
        axios
            .post(route('order.generate-invoice', { id: order.id }))
            .then((response) => {
                const { invoice, order: updatedOrder } = response.data;
                enqueueSnackbar('Invoice generated successfully!', { variant: 'success' });

                // Update local state without reload
                fetchOrders(orders.current_page);

                // Show Print Modal
                setSelectedCard({ ...updatedOrder, invoice }); // Ensure updated order is selected
                setBillModalOpen(true);
            })
            .catch((error) => {
                console.error(error);
                enqueueSnackbar('Failed to generate invoice.', { variant: 'error' });
            });
    };

    const handlePayNow = (order) => {
        if (!order.invoice) {
            enqueueSnackbar('No invoice found for this order.', { variant: 'error' });
            return;
        }
        // Prepare data for PaymentNow
        // PaymentNow expects `invoiceData` which matches FinancialInvoice structure
        // PaymentNow expects the Order object (or object with Order ID)
        const invoiceData = {
            ...order,
            invoice_no: order.invoice?.invoice_no, // Attach invoice no specifically
        };
        setSelectedInvoice(invoiceData);
        setPaymentModalOpen(true);
    };

    // Riders State
    const [riders, setRiders] = useState([]);
    const [assignRiderOpen, setAssignRiderOpen] = useState(false);
    const [selectedOrderForRider, setSelectedOrderForRider] = useState(null);
    const [selectedRider, setSelectedRider] = useState('');

    useEffect(() => {
        // Fetch riders on mount
        axios
            .get(route('riders.all'))
            .then((res) => {
                if (res.data.success) {
                    setRiders(res.data.riders);
                }
            })
            .catch((err) => console.error('Failed to fetch riders', err));
    }, []);

    const handleAssignRiderClick = (order) => {
        setSelectedOrderForRider(order);
        setSelectedRider(order.rider_id || ''); // Pre-select if already assigned
        setAssignRiderOpen(true);
    };

    const handleSaveRider = () => {
        if (!selectedOrderForRider) return;

        router.post(
            route('orders.update', { id: selectedOrderForRider.id }),
            {
                rider_id: selectedRider,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    enqueueSnackbar('Rider assigned successfully!', { variant: 'success' });
                    setAssignRiderOpen(false);
                    setSelectedOrderForRider(null);
                    setSelectedRider('');
                    fetchOrders(orders.current_page); // Refresh orders
                },
                onError: () => enqueueSnackbar('Failed to assign rider.', { variant: 'error' }),
            },
        );
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        if (timeStr.match(/AM|PM/i)) return timeStr;
        const date = new Date(`2000-01-01 ${timeStr}`);
        if (isNaN(date.getTime())) return timeStr;
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            {/* <SideNav open={open} setOpen={setOpen} /> */}
            {/* <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                }}
            > */}
                <Box
                    sx={{
                        p: 2,
                        bgcolor:'#f5f5f5',
                        minHeight:'100vh'
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        {/* Left - Heading */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography style={{ color: '#063455', fontSize: '30px', fontWeight:600 }}>
                                Order Management
                            </Typography>
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
                                        <MenuItem value="employee">Employee</MenuItem>
                                        <MenuItem value="guest">Guest</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Search by Name with Autocomplete */}
                            <Grid item xs={12} md={3}>
                                <Autocomplete
                                    freeSolo
                                    disablePortal
                                    filterOptions={(x) => x}
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
                                    filterOptions={(x) => x}
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

                    {/* Orders Grid */}
                    {/* Add Loading Indicator */}
                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                            <Typography variant="h6" color="text.secondary">
                                Loading orders...
                            </Typography>
                        </Box>
                    )}

                    {!loading && (
                        <Grid
                            container
                            spacing={3}
                            sx={{
                                mt: 2,
                            }}
                        >
                            {orders.data && orders.data.length > 0 ? (
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
                                            {/* Header - Color Logic: RED=in kitchen/pending, BLUE=completed/awaiting payment */}
                                            <Box
                                                sx={{
                                                    bgcolor:
                                                        card.status === 'cancelled'
                                                            ? '#FF0000'
                                                            : card.status === 'refund'
                                                              ? '#FFA500'
                                                              : card.status === 'completed' || card.payment_status === 'awaiting'
                                                                ? '#1976D2' // BLUE - invoice generated, awaiting payment
                                                                : '#D32F2F', // RED - in kitchen / active
                                                    color: '#FFFFFF',
                                                    p: 2,
                                                    position: 'relative',
                                                }}
                                            >
                                                <Typography sx={{ fontWeight: 500, mb: 0.5, fontSize: '18px' }}>#{card.id}</Typography>
                                                <Typography sx={{ fontWeight: 500, mb: 2, fontSize: '18px' }}>
                                                    {card.member ? `${card.member?.full_name} (${card.member?.membership_no})` : `${card.customer ? card.customer.name : card.employee?.name}`}
                                                    <Typography component="span" variant="body2" textTransform="capitalize" sx={{ ml: 0.3, opacity: 0.8 }}>
                                                        ({card.order_type})
                                                    </Typography>
                                                </Typography>
                                                <Typography sx={{ mb: 2, fontSize: '14px', opacity: 0.9 }}>
                                                    Location: <strong>{card.tenant?.name || 'Unknown'}</strong>
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
                                                        {formatTime(card.start_time)}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                                                    <Typography sx={{ fontWeight: 500, mb: 1, fontSize: '18px' }}>{card.member ? 'Member' : card.customer ? 'Guest' : card.employee ? 'Employee' : 'Guest'}</Typography>
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

                                                {/* Totals Section */}
                                                <ListItem sx={{ py: 1, px: 2, display: 'flex', justifyContent: 'space-between', bgcolor: '#f5f5f5' }}>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        Discount:
                                                    </Typography>
                                                    <Typography variant="body2">{Number(card.discount || 0).toFixed(2)}</Typography>
                                                </ListItem>
                                                <ListItem sx={{ py: 1, px: 2, display: 'flex', justifyContent: 'space-between', bgcolor: '#e0e0e0' }}>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        Total:
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {Number(card.total_price || 0).toLocaleString()}
                                                    </Typography>
                                                </ListItem>
                                                {card.waiter && (
                                                    <ListItem sx={{ py: 0.5, px: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Waiter: {card.waiter.name}
                                                        </Typography>
                                                    </ListItem>
                                                )}

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
                                            <Box sx={{ display: 'flex', flexDirection: 'column', p: 2, gap: 1 }}>
                                                <Box sx={{ display: 'flex', gap: 2 }}>
                                                    <Button
                                                        variant="outlined"
                                                        fullWidth
                                                        disabled={card.status === 'cancelled' || card.status === 'completed'} // Disable cancel if completed
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
                                                        disabled={card.status === 'completed' || card.status === 'cancelled'} // Disable Edit if completed/cancelled
                                                        sx={{
                                                            px: 0,
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
                                                    {/* Generate Invoice / Pay Now Buttons */}
                                                    {card.status !== 'cancelled' && card.status !== 'refund' && (
                                                        <>
                                                            {!card.invoice ? (
                                                                <Button variant="contained" fullWidth color="secondary" sx={{ textTransform: 'none', px: 0, py: 1, bgcolor: '#003153', '&:hover': { bgcolor: '#00254d' } }} onClick={() => handleGenerateInvoice(card)}>
                                                                    Generate Invoice
                                                                </Button>
                                                            ) : (
                                                                <Button variant="contained" fullWidth color="success" sx={{ textTransform: 'none', px: 0, py: 1, bgcolor: '#003153', '&:hover': { bgcolor: '#00254d' } }} onClick={() => handlePayNow(card)}>
                                                                    Pay Now
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}
                                                </Box>
                                                {/* Assign Rider Button for Delivery Orders */}
                                                {card.order_type === 'delivery' && card.status !== 'cancelled' && card.status !== 'completed' && (
                                                    <Button variant="outlined" fullWidth color="info" sx={{ textTransform: 'none', mt: 1 }} onClick={() => handleAssignRiderClick(card)}>
                                                        {card.rider ? `Rider: ${card.rider.name}` : 'Assign Rider'}
                                                    </Button>
                                                )}
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
                    )}

                    {!loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'end', py: 4 }}>
                            <Pagination count={orders.last_page || 1} page={orders.current_page || 1} onChange={(e, page) => fetchOrders(page)} />
                        </Box>
                    )}
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

                    {/* PaymentModal */}
                    {paymentModalOpen && selectedInvoice && (
                        <PaymentNow
                            invoiceData={selectedInvoice}
                            openPaymentModal={paymentModalOpen}
                            handleClosePayment={() => setPaymentModalOpen(false)}
                            openSuccessPayment={() => {
                                setPaymentModalOpen(false);
                                fetchOrders(orders.current_page); /* Reload current page */
                            }}
                            setSelectedOrder={setSelectedCard}
                        />
                    )}

                    {/* Receipt/Bill Modal */}
                    {billModalOpen && selectedCard && (
                        <Dialog open={billModalOpen} onClose={() => setBillModalOpen(false)} maxWidth="sm" fullWidth>
                            <Box sx={{ p: 2 }}>
                                <Receipt invoiceRoute={'transaction.invoice'} invoiceData={getReceiptData(selectedCard)} openModal={true} />
                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                    <Button onClick={() => setBillModalOpen(false)} variant="outlined">
                                        Close
                                    </Button>
                                </Box>
                            </Box>
                        </Dialog>
                    )}

                    {/* Assign Rider Dialog */}
                    <Dialog open={assignRiderOpen} onClose={() => setAssignRiderOpen(false)}>
                        <DialogTitle>Assign Delivery Rider</DialogTitle>
                        <DialogContent sx={{ minWidth: 300, py: 2 }}>
                            <FormControl fullWidth margin="dense">
                                <InputLabel>Select Rider</InputLabel>
                                <Select value={selectedRider} label="Select Rider" onChange={(e) => setSelectedRider(e.target.value)}>
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                    {riders.map((rider) => (
                                        <MenuItem key={rider.id} value={rider.id}>
                                            {rider.name} ({rider.employee_id})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <Button onClick={() => setAssignRiderOpen(false)}>Cancel</Button>
                                <Button variant="contained" onClick={handleSaveRider} disabled={!selectedRider}>
                                    Assign
                                </Button>
                            </Box>
                        </DialogContent>
                    </Dialog>
                </Box>
            {/* </div> */}
        </>
    );
};
Dashboard.layout = (page) => <POSLayout>{page}</POSLayout>;
// Dashboard.layout = null;
export default Dashboard;
