import SideNav from '@/components/App/SideBar/SideNav';
import { router } from '@inertiajs/react';
import { Add as AddIcon, Close as CloseIcon, KeyboardArrowRight as KeyboardArrowRightIcon, Search as SearchIcon } from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Grid,
    IconButton,
    InputAdornment,
    Menu,
    MenuItem,
    Modal,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const CustomerLists = () => {
    // State for search
    const [searchTerm, setSearchTerm] = useState('');
    const [open, setOpen] = useState(false);

    const [customers, setCustomers] = useState([
        {
            id: 'AFOHS-12345',
            name: 'Zahid Ullah',
            email: 'user@gmail.com',
            phone: '03434343534',
            type: 'VIP',
            address: 'Lahore, Pakistan',
            customerType: 'Silver',
            profilePic: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Hnn6JyFbqTjwloItCmZtl1a4IypuX3.png',
            addresses: [
                {
                    type: 'House',
                    address: 'Jl. Gubeng Kertajaya 5c / 45',
                    city: 'Malang',
                    province: 'East Java',
                    country: 'Indonesia',
                    zipCode: '10101',
                    isMain: true,
                },
                {
                    type: 'Apartment',
                    address: 'Jl Kayoon 24',
                    city: 'Malang',
                    province: 'East Java',
                    country: 'Indonesia',
                    zipCode: '10101',
                    isMain: false,
                },
                {
                    type: 'Office',
                    address: 'Jl Letjen South Parman 22, DKI Jakarta',
                    city: 'Jakarta',
                    province: 'Jakarta',
                    country: 'Indonesia',
                    zipCode: '10101',
                    isMain: false,
                },
            ],
        },
        {
            id: 'AFOHS-12346',
            name: 'Dianne Russell',
            email: 'dianne.russell@mail.com',
            phone: '(702) 555-0122',
            type: 'Premium',
            address: 'Lahore, Pakistan',
            customerType: 'Gold',
            profilePic: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-9WOBgZCgNYa1UDTjpD8AIo01bwat1M.png',
            addresses: [
                {
                    type: 'House',
                    address: 'Jl. Gubeng Kertajaya 5c / 45',
                    city: 'Malang',
                    province: 'East Java',
                    country: 'Indonesia',
                    zipCode: '10101',
                    isMain: true,
                },
            ],
        },
        {
            id: 'AFOHS-12347',
            name: 'Zahid Ullah',
            email: 'user@gmail.com',
            phone: '03434343534',
            type: 'Regular',
            address: 'Lahore, Pakistan',
            customerType: 'Silver',
            profilePic: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Hnn6JyFbqTjwloItCmZtl1a4IypuX3.png',
            addresses: [
                {
                    type: 'House',
                    address: 'Jl. Gubeng Kertajaya 5c / 45',
                    city: 'Malang',
                    province: 'East Java',
                    country: 'Indonesia',
                    zipCode: '10101',
                    isMain: true,
                },
            ],
        },
        {
            id: 'AFOHS-12348',
            name: 'Zahid Ullah',
            email: 'user@gmail.com',
            phone: '03434343534',
            type: 'Premium',
            address: 'Lahore, Pakistan',
            customerType: 'Gold',
            profilePic: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Hnn6JyFbqTjwloItCmZtl1a4IypuX3.png',
            addresses: [
                {
                    type: 'House',
                    address: 'Jl. Gubeng Kertajaya 5c / 45',
                    city: 'Malang',
                    province: 'East Java',
                    country: 'Indonesia',
                    zipCode: '10101',
                    isMain: true,
                },
            ],
        },
        {
            id: 'AFOHS-12349',
            name: 'Zahid Ullah',
            email: 'user@gmail.com',
            phone: '03434343534',
            type: 'VIP',
            address: 'Lahore, Pakistan',
            customerType: 'Silver',
            profilePic: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Hnn6JyFbqTjwloItCmZtl1a4IypuX3.png',
            addresses: [
                {
                    type: 'House',
                    address: 'Jl. Gubeng Kertajaya 5c / 45',
                    city: 'Malang',
                    province: 'East Java',
                    country: 'Indonesia',
                    zipCode: '10101',
                    isMain: true,
                },
            ],
        },
    ]);
    const [filteredCustomers, setFilteredCustomers] = useState([...customers]);

    const handleOpenAddForm = () => {
        setIsEditMode(false);
        setNewCustomer({
            id: `MEMBER${Math.floor(100 + Math.random() * 900)}`,
            name: '',
            email: '',
            phone: '',
            type: 'Regular',
            address: '',
            customerType: 'Silver',
            profilePic: null,
            addresses: [],
        });
        setProfileImage(null);
        setOpenAddForm(true);
    };
    // State for success message
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // State for order modal
    const [orderModalOpen, setOrderModalOpen] = useState(false);
    const [currentOrder, setCurrentOrder] = useState({
        customer: null,
        dishCategory: '',
        amount: '110.00',
        favoriteItems: [],
    });

    // State for dish category menu
    const [dishCategoryMenuAnchor, setDishCategoryMenuAnchor] = useState(null);
    const [selectedDish, setSelectedDish] = useState('');

    // Dishes data
    const dishes = ['Tea', 'Coffee', 'Chicken', 'Cake', 'Biryani', 'Burger', 'Pizza', 'Pasta'];

    // Filter customers when search term changes
    useEffect(() => {
        const filtered = customers.filter(
            (customer) =>
                customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.type.toLowerCase().includes(searchTerm.toLowerCase()),
        );
        setFilteredCustomers(filtered);
    }, [searchTerm, customers]);

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Handle create order
    const handleCreateOrder = (customer) => {
        setCurrentOrder({
            customer,
            dishCategory: '',
            amount: '110.00',
            favoriteItems: [],
        });
        setOrderModalOpen(true);
    };

    // Handle close order modal
    const handleCloseOrderModal = () => {
        setOrderModalOpen(false);
        setDishCategoryMenuAnchor(null);
    };

    // Handle open dish category menu
    const handleOpenDishCategoryMenu = (event) => {
        setDishCategoryMenuAnchor(event.currentTarget);
    };

    // Handle close dish category menu
    const handleCloseDishCategoryMenu = () => {
        setDishCategoryMenuAnchor(null);
    };

    // Handle select dish
    const handleSelectDish = (dish) => {
        setSelectedDish(dish);
        setCurrentOrder({
            ...currentOrder,
            dishCategory: dish,
        });
        setDishCategoryMenuAnchor(null);
    };

    // Handle save order
    const handleSaveOrder = () => {
        setSuccessMessage('Order saved successfully!');
        setShowSuccess(true);
        setOrderModalOpen(false);
    };

    // Handle close success message
    const handleCloseSuccess = () => {
        setShowSuccess(false);
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
                <div style={{ backgroundColor: '#F6F6F6', padding: '20px' }}>
                    <div
                        style={{
                            display: 'flex',
                            backgroundColor: '#f0f0f0',
                            padding: '10px',
                            borderRadius: '10px',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px',
                        }}
                    >
                        <Typography variant="h5">70 Customer</Typography>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <TextField
                                placeholder="Search name or membership type"
                                variant="outlined"
                                size="small"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                style={{ width: '400px', backgroundColor: 'white' }}
                            />
                            {/* <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleOpenAddForm}
                                style={{ backgroundColor: '#003366', color: 'white' }}
                            >
                                Add Customer
                            </Button> */}
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => router.get(route('members.create'))}
                                style={{ backgroundColor: '#003366', color: 'white' }}
                            >
                                Add Customer
                            </Button>
                        </div>
                    </div>

                    <Box>
                        <Table>
                            <TableHead style={{ backgroundColor: '#f0f0f0' }}>
                                <TableRow>
                                    <TableCell style={{ fontWeight: 'bold' }}>Membership ID</TableCell>
                                    <TableCell style={{ fontWeight: 'bold' }}>Members</TableCell>
                                    <TableCell style={{ fontWeight: 'bold' }}>Type</TableCell>
                                    <TableCell style={{ fontWeight: 'bold' }}>Address</TableCell>
                                    <TableCell style={{ fontWeight: 'bold' }}>Create Order</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredCustomers.map((customer, index) => (
                                    <TableRow key={index} hover onClick={() => handleOpenAddForm(true, index)} style={{ cursor: 'pointer' }}>
                                        <TableCell>{customer.id}</TableCell>
                                        <TableCell>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar src={customer.profilePic} alt={customer.name} style={{ marginRight: '10px' }} />
                                                <div>
                                                    <Typography variant="body1">{customer.name}</Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {customer.email}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {customer.phone}
                                                    </Typography>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{customer.type}</TableCell>
                                        <TableCell>{customer.address}</TableCell>
                                        <TableCell>
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCreateOrder(customer);
                                                }}
                                                style={{
                                                    backgroundColor: '#063455',
                                                    fontSize: '12px',
                                                    borderRadius: '20px',
                                                    color: 'white',
                                                }}
                                            >
                                                Order
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>

                    {/* Order Modal */}
                    <Modal
                        open={orderModalOpen}
                        onClose={handleCloseOrderModal}
                        aria-labelledby="order-modal-title"
                        aria-describedby="order-modal-description"
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                right: '0px',
                                width: '500px',
                                bgcolor: '#e3f2fd',
                                borderRadius: '8px',
                                boxShadow: 24,
                                p: 4,
                                height: '100vh',
                                overfloswY: 'auto',
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    {currentOrder.customer && (
                                        <>
                                            <Avatar
                                                src={currentOrder.customer.profilePic}
                                                alt={currentOrder.customer.name}
                                                sx={{ width: 56, height: 56, mr: 2 }}
                                            />
                                            <Box>
                                                <Typography variant="h6" component="h2">
                                                    {currentOrder.customer.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    ID : {currentOrder.customer.id}
                                                </Typography>
                                            </Box>
                                        </>
                                    )}
                                </Box>
                                <IconButton onClick={handleCloseOrderModal}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>

                            <Grid container spacing={2} sx={{ mt: 2 }}>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Email
                                    </Typography>
                                    <Typography variant="body1">{currentOrder.customer ? currentOrder.customer.email : ''}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Phone number
                                    </Typography>
                                    <Typography variant="body1">{currentOrder.customer ? currentOrder.customer.phone : ''}</Typography>
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 3 }}>
                                <Box
                                    sx={{
                                        p: 2,
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        bgcolor: 'background.paper',
                                    }}
                                    onClick={handleOpenDishCategoryMenu}
                                >
                                    <Typography variant="body1">{selectedDish || 'Dish Category'}</Typography>
                                    <KeyboardArrowRightIcon />
                                </Box>
                                <Menu anchorEl={dishCategoryMenuAnchor} open={Boolean(dishCategoryMenuAnchor)} onClose={handleCloseDishCategoryMenu}>
                                    <MenuItem onClick={() => handleSelectDish('Tea')}>Tea</MenuItem>
                                    <MenuItem onClick={() => handleSelectDish('Coffee')}>Coffee</MenuItem>
                                    <MenuItem onClick={() => handleSelectDish('Chicken')}>Chicken</MenuItem>
                                    <MenuItem onClick={() => handleSelectDish('Cake')}>Cake</MenuItem>
                                </Menu>
                            </Box>

                            <Box sx={{ mt: 3 }}>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    Amount
                                </Typography>
                                <TextField
                                    fullWidth
                                    value={currentOrder.amount}
                                    InputProps={{
                                        readOnly: true,
                                        startAdornment: <InputAdornment position="start">Rs</InputAdornment>,
                                    }}
                                    variant="outlined"
                                />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        handleSaveOrder();
                                        router.visit('/customers/list');
                                    }}
                                    sx={{ backgroundColor: '#003366' }}
                                >
                                    Save
                                </Button>
                            </Box>
                        </Box>
                    </Modal>

                    {/* Success Snackbar */}
                    <Snackbar
                        open={showSuccess}
                        autoHideDuration={3000}
                        onClose={handleCloseSuccess}
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    >
                        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
                            {successMessage}
                        </Alert>
                    </Snackbar>
                </div>
            </div>
        </>
    );
};

export default CustomerLists;
