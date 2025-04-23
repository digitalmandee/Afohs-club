import SideNav from '@/components/App/SideBar/SideNav';
import { router } from '@inertiajs/react';
import {
    Add as AddIcon,
    Apartment as ApartmentIcon,
    ArrowBack as ArrowBackIcon,
    Business as BusinessIcon,
    Close as CloseIcon,
    Home as HomeIcon,
    KeyboardArrowRight as KeyboardArrowRightIcon,
    LocationOn as LocationOnIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box,
    Button,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Modal,
    Radio,
    Select,
    Snackbar,
    Switch,
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

const CustomerManagement = () => {
    const [open, setOpen] = useState(false);
    // State for customer list
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

    // State for search
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCustomers, setFilteredCustomers] = useState([...customers]);

    // State for add/edit customer form
    const [openAddForm, setOpenAddForm] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentCustomerIndex, setCurrentCustomerIndex] = useState(null);
    const [newCustomer, setNewCustomer] = useState({
        id: 'MEMBER520',
        name: '',
        email: '',
        phone: '',
        type: 'Regular',
        address: '',
        customerType: 'Silver',
        profilePic: null,
        addresses: [],
    });

    // State for address form
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        type: 'House',
        address: '',
        city: '',
        province: '',
        country: '',
        zipCode: '',
        isMain: false,
    });

    // State for success message
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [profileImage, setProfileImage] = useState(null);

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

    // Handle opening add customer form
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

    // Handle opening edit customer form
    const handleOpenEditForm = (index) => {
        const customer = { ...customers[index] };
        setCurrentCustomerIndex(index);
        setIsEditMode(true);
        setNewCustomer(customer);
        setProfileImage(customer.profilePic);
        setOpenAddForm(true);
    };

    // Handle closing add/edit customer form
    const handleCloseAddForm = () => {
        setOpenAddForm(false);
        setShowAddressForm(false);
    };

    // Handle input change in add/edit customer form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCustomer({
            ...newCustomer,
            [name]: value,
        });
    };

    // Handle address input change
    const handleAddressInputChange = (e) => {
        const { name, value } = e.target;
        setNewAddress({
            ...newAddress,
            [name]: value,
        });
    };

    // Handle profile image upload
    const handleImageUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onloadend = () => {
                setProfileImage(reader.result);
            };

            reader.readAsDataURL(file);
        }
    };

    // Handle delete profile image
    const handleDeleteImage = () => {
        setProfileImage(null);
    };

    // Handle save customer
    const handleSaveCustomer = () => {
        const updatedCustomer = {
            ...newCustomer,
            profilePic: profileImage || 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Hnn6JyFbqTjwloItCmZtl1a4IypuX3.png',
        };

        if (isEditMode && currentCustomerIndex !== null) {
            // Update existing customer
            const updatedCustomers = [...customers];
            updatedCustomers[currentCustomerIndex] = updatedCustomer;
            setCustomers(updatedCustomers);
            setSuccessMessage('Customer updated successfully!');
        } else {
            // Add new customer
            const customer = {
                ...updatedCustomer,
                id: `AFOHS-${Math.floor(10000 + Math.random() * 90000)}`,
            };
            setCustomers([customer, ...customers]);
            setSuccessMessage('Customer added successfully!');
        }

        setShowSuccess(true);
        setOpenAddForm(false);

        // Reset form
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
        setIsEditMode(false);
        setCurrentCustomerIndex(null);
    };

    // Handle show address form
    const handleShowAddressForm = () => {
        setNewAddress({
            type: 'House',
            address: '',
            city: '',
            province: '',
            country: '',
            zipCode: '',
            isMain: false,
        });
        setShowAddressForm(true);
    };

    // Handle save address
    const handleSaveAddress = () => {
        const updatedCustomer = { ...newCustomer };

        // If this is the first address or marked as main, set it as main
        if (updatedCustomer.addresses.length === 0 || newAddress.isMain) {
            // Set all existing addresses to not main
            updatedCustomer.addresses = updatedCustomer.addresses.map((addr) => ({
                ...addr,
                isMain: false,
            }));
        }

        updatedCustomer.addresses.push(newAddress);
        setNewCustomer(updatedCustomer);
        setShowAddressForm(false);
        setSuccessMessage('Address added successfully!');
        setShowSuccess(true);
    };

    // Handle set main address
    const handleSetMainAddress = (index) => {
        const updatedCustomer = { ...newCustomer };
        updatedCustomer.addresses = updatedCustomer.addresses.map((addr, i) => ({
            ...addr,
            isMain: i === index,
        }));
        setNewCustomer(updatedCustomer);
    };

    // Handle close success message
    const handleCloseSuccess = () => {
        setShowSuccess(false);
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
                    {/* Main Customer List View */}
                    {!openAddForm && (
                        <>
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
                                <Typography variant="h5" style={{}}>
                                    70 Customer
                                </Typography>
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
                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={handleOpenAddForm}
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
                                            <TableRow key={index} hover onClick={() => handleOpenEditForm(index)} style={{ cursor: 'pointer' }}>
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
                                                            e.stopPropagation(); // Prevent row click
                                                            handleCreateOrder(customer);
                                                        }}
                                                        style={{
                                                            backgroundColor: '#063455',
                                                            fontSize: '12px ',
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
                        </>
                    )}

                    {/* Add/Edit Customer Form */}
                    {openAddForm && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                                <IconButton onClick={handleCloseAddForm}>
                                    <ArrowBackIcon />
                                </IconButton>
                                <Typography variant="h6" style={{ marginLeft: '10px' }}>
                                    {isEditMode ? 'Edit Customer Information' : 'Add Customer Information'}
                                </Typography>
                            </div>

                            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px' }}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ p: 2, backgroundColor: '#F6F6F6', border: '1px solid #e0e0e0', borderRadius: '4px', mb: 2 }}>
                                            <Typography variant="body1">
                                                Member Id: <strong>{newCustomer.id}</strong>
                                            </Typography>
                                        </Box>
                                        <Box style={{ display: 'flex', gap: '10px' }}>
                                            <Box sx={{ mb: 2 }}>
                                                {profileImage ? (
                                                    <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                                                        <img
                                                            src={profileImage || '/placeholder.svg'}
                                                            alt="Profile"
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <Box>
                                                        <input
                                                            accept="image/*"
                                                            style={{ display: 'none' }}
                                                            id="profile-image-upload-add"
                                                            type="file"
                                                            onChange={handleImageUpload}
                                                        />
                                                        <label htmlFor="profile-image-upload-add">
                                                            <AddIcon
                                                                sx={{
                                                                    p: 2,
                                                                    border: '1px dashed #1976d2',
                                                                    borderRadius: '4px',
                                                                    height: '80px',
                                                                    width: '80px',
                                                                    cursor: 'pointer',
                                                                }}
                                                                color="primary"
                                                            />
                                                        </label>
                                                    </Box>
                                                )}
                                            </Box>
                                            <Box style={{ display: 'flex', flexDirection: 'column' }}>
                                                {(isEditMode || profileImage) && (
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            gap: '5px',
                                                            padding: '5px',
                                                        }}
                                                    >
                                                        <label htmlFor="profile-image-upload-edit">
                                                            <Button size="small" sx={{ minWidth: 'auto', fontSize: '14px' }} component="span">
                                                                Choose Photo
                                                            </Button>
                                                        </label>
                                                        <input
                                                            accept="image/*"
                                                            style={{ display: 'none' }}
                                                            id="profile-image-upload-edit"
                                                            type="file"
                                                            onChange={handleImageUpload}
                                                        />
                                                        <Button
                                                            size="small"
                                                            color="error"
                                                            onClick={handleDeleteImage}
                                                            sx={{ minWidth: 'auto', fontSize: '14px' }}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                )}
                                                {!isEditMode && (
                                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                                        Profile Picture
                                                    </Typography>
                                                )}
                                                <Typography variant="caption" color="textSecondary">
                                                    Click upload to change profile picture (4 MB max)
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                            Customer Type
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                            <FormControlLabel
                                                sx={{ border: '1px dashed #E3E3E3', p: 1 }}
                                                control={
                                                    <Radio
                                                        checked={newCustomer.customerType === 'Silver'}
                                                        onChange={handleInputChange}
                                                        name="customerType"
                                                        value="Silver"
                                                    />
                                                }
                                                label={
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <img
                                                            src="https://img.icons8.com/ios-filled/50/000000/silver-medal.png"
                                                            width="24"
                                                            height="24"
                                                            alt="Silver"
                                                            style={{ marginRight: '8px' }}
                                                        />
                                                        Silver
                                                    </Box>
                                                }
                                            />
                                            <FormControlLabel
                                                sx={{ border: '1px dashed #E3E3E3', p: 1 }}
                                                control={
                                                    <Radio
                                                        checked={newCustomer.customerType === 'Gold'}
                                                        onChange={handleInputChange}
                                                        name="customerType"
                                                        value="Gold"
                                                    />
                                                }
                                                label={
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <img
                                                            src="https://img.icons8.com/ios-filled/50/FFD700/gold-medal.png"
                                                            width="24"
                                                            height="24"
                                                            alt="Gold"
                                                            style={{ marginRight: '8px' }}
                                                        />
                                                        Gold
                                                    </Box>
                                                }
                                            />
                                        </Box>
                                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                            Customer Name
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            placeholder="e.g. Dianne Russell"
                                            name="name"
                                            value={newCustomer.name}
                                            onChange={handleInputChange}
                                            margin="normal"
                                            variant="outlined"
                                            sx={{ mb: 2 }}
                                        />
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                                    Email
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    placeholder="e.g. dianne.russell@gmail.com"
                                                    name="email"
                                                    value={newCustomer.email}
                                                    onChange={handleInputChange}
                                                    margin="normal"
                                                    variant="outlined"
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                                    Phone Number
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    placeholder="e.g. 123 456 7890"
                                                    name="phone"
                                                    value={newCustomer.phone}
                                                    onChange={handleInputChange}
                                                    margin="normal"
                                                    variant="outlined"
                                                    InputProps={{
                                                        startAdornment: (
                                                            <Select
                                                                native
                                                                value="+702"
                                                                variant="standard"
                                                                disableUnderline
                                                                sx={{ mr: 1, width: '90px' }}
                                                            >
                                                                <option value="+702">+702</option>
                                                                <option value="+1"> +1 </option>
                                                                <option value="+44">+44</option>
                                                                <option value="+91">+91</option>
                                                            </Select>
                                                        ),
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>

                                        {/* Address List */}
                                        {isEditMode && newCustomer.addresses && newCustomer.addresses.length > 0 && (
                                            <Box sx={{ mt: 3 }}>
                                                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                                    Address ({newCustomer.addresses.length})
                                                </Typography>
                                                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                                                    {newCustomer.addresses.map((address, index) => (
                                                        <ListItem key={index}>
                                                            <ListItemIcon>
                                                                {address.type === 'House' ? (
                                                                    <HomeIcon />
                                                                ) : address.type === 'Apartment' ? (
                                                                    <ApartmentIcon />
                                                                ) : (
                                                                    <BusinessIcon />
                                                                )}
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary={address.type}
                                                                secondary={
                                                                    <>
                                                                        <Typography component="span" variant="body2" color="text.primary">
                                                                            {address.address}
                                                                        </Typography>
                                                                        <br />
                                                                        {`${address.country}, ${address.province}, ${address.city}, ${address.zipCode}`}
                                                                    </>
                                                                }
                                                            />
                                                            <Switch
                                                                edge="end"
                                                                checked={address.isMain}
                                                                onChange={() => handleSetMainAddress(index)}
                                                                inputProps={{
                                                                    'aria-labelledby': `address-switch-${index}`,
                                                                }}
                                                            />
                                                            <Typography variant="body2" color="primary" sx={{ ml: 1 }}>
                                                                {address.isMain ? 'Main Address' : ''}
                                                            </Typography>
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </Box>
                                        )}
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        {/* Add Address Button */}
                                        {!showAddressForm && (
                                            <Box
                                                sx={{
                                                    p: 2,
                                                    bgcolor: '#e3f2fd',
                                                    borderRadius: '4px',
                                                    mb: 3,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    cursor: 'pointer',
                                                }}
                                                onClick={handleShowAddressForm}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                                                    <Box>
                                                        <Typography variant="subtitle1">Add Address</Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Click to add new address for delivery order
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <KeyboardArrowRightIcon />
                                            </Box>
                                        )}

                                        {/* Address Form */}
                                        {showAddressForm && (
                                            <>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                    <Typography variant="subtitle1">Type</Typography>
                                                    <IconButton size="small" onClick={() => setShowAddressForm(false)}>
                                                        <CloseIcon />
                                                    </IconButton>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                                    <Button
                                                        variant={newAddress.type === 'House' ? 'contained' : 'outlined'}
                                                        onClick={() => setNewAddress({ ...newAddress, type: 'House' })}
                                                        sx={{
                                                            borderRadius: '20px',
                                                            backgroundColor: newAddress.type === 'House' ? '#1976d2' : 'transparent',
                                                            color: newAddress.type === 'House' ? 'white' : 'inherit',
                                                        }}
                                                    >
                                                        House
                                                    </Button>
                                                    <Button
                                                        variant={newAddress.type === 'Apartment' ? 'contained' : 'outlined'}
                                                        onClick={() => setNewAddress({ ...newAddress, type: 'Apartment' })}
                                                        sx={{
                                                            borderRadius: '20px',
                                                            backgroundColor: newAddress.type === 'Apartment' ? '#1976d2' : 'transparent',
                                                            color: newAddress.type === 'Apartment' ? 'white' : 'inherit',
                                                        }}
                                                    >
                                                        Apartment
                                                    </Button>
                                                    <Button
                                                        variant={newAddress.type === 'Office' ? 'contained' : 'outlined'}
                                                        onClick={() => setNewAddress({ ...newAddress, type: 'Office' })}
                                                        sx={{
                                                            borderRadius: '20px',
                                                            backgroundColor: newAddress.type === 'Office' ? '#1976d2' : 'transparent',
                                                            color: newAddress.type === 'Office' ? 'white' : 'inherit',
                                                        }}
                                                    >
                                                        Office
                                                    </Button>
                                                </Box>

                                                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                                    Country
                                                </Typography>
                                                <FormControl fullWidth margin="normal" variant="outlined">
                                                    <Select
                                                        displayEmpty
                                                        value={newAddress.country}
                                                        name="country"
                                                        onChange={handleAddressInputChange}
                                                        renderValue={(selected) => {
                                                            if (!selected) {
                                                                return <em>Select country</em>;
                                                            }
                                                            return selected;
                                                        }}
                                                    >
                                                        <MenuItem value="">
                                                            <em>Select country</em>
                                                        </MenuItem>
                                                        <MenuItem value="Pakistan">Pakistan</MenuItem>
                                                        <MenuItem value="United States">United States</MenuItem>
                                                        <MenuItem value="United Kingdom">United Kingdom</MenuItem>
                                                        <MenuItem value="Indonesia">Indonesia</MenuItem>
                                                    </Select>
                                                </FormControl>

                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} sm={6}>
                                                        <Typography variant="subtitle1" sx={{ mb: 1, mt: 2 }}>
                                                            Province / Street
                                                        </Typography>
                                                        <FormControl fullWidth margin="normal" variant="outlined">
                                                            <Select
                                                                displayEmpty
                                                                value={newAddress.province}
                                                                name="province"
                                                                onChange={handleAddressInputChange}
                                                                renderValue={(selected) => {
                                                                    if (!selected) {
                                                                        return <em>Select province</em>;
                                                                    }
                                                                    return selected;
                                                                }}
                                                            >
                                                                <MenuItem value="">
                                                                    <em>Select province</em>
                                                                </MenuItem>
                                                                <MenuItem value="Punjab">Punjab</MenuItem>
                                                                <MenuItem value="Sindh">Sindh</MenuItem>
                                                                <MenuItem value="KPK">KPK</MenuItem>
                                                                <MenuItem value="East Java">East Java</MenuItem>
                                                                <MenuItem value="Jakarta">Jakarta</MenuItem>
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <Typography variant="subtitle1" sx={{ mb: 1, mt: 2 }}>
                                                            City
                                                        </Typography>
                                                        <FormControl fullWidth margin="normal" variant="outlined">
                                                            <Select
                                                                displayEmpty
                                                                value={newAddress.city}
                                                                name="city"
                                                                onChange={handleAddressInputChange}
                                                                renderValue={(selected) => {
                                                                    if (!selected) {
                                                                        return <em>Select city</em>;
                                                                    }
                                                                    return selected;
                                                                }}
                                                            >
                                                                <MenuItem value="">
                                                                    <em>Select city</em>
                                                                </MenuItem>
                                                                <MenuItem value="Lahore">Lahore</MenuItem>
                                                                <MenuItem value="Karachi">Karachi</MenuItem>
                                                                <MenuItem value="Islamabad">Islamabad</MenuItem>
                                                                <MenuItem value="Malang">Malang</MenuItem>
                                                                <MenuItem value="Jakarta">Jakarta</MenuItem>
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                </Grid>

                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} sm={6}>
                                                        <Typography variant="subtitle1" sx={{ mb: 1, mt: 2 }}>
                                                            Zip Code / Postal Code
                                                        </Typography>
                                                        <TextField
                                                            fullWidth
                                                            placeholder="e.g. 10101"
                                                            name="zipCode"
                                                            value={newAddress.zipCode}
                                                            onChange={handleAddressInputChange}
                                                            margin="normal"
                                                            variant="outlined"
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <Typography variant="subtitle1" sx={{ mb: 1, mt: 2 }}>
                                                            Main Address
                                                        </Typography>
                                                        <FormControlLabel
                                                            control={
                                                                <Switch
                                                                    checked={newAddress.isMain}
                                                                    onChange={(e) => setNewAddress({ ...newAddress, isMain: e.target.checked })}
                                                                    name="isMain"
                                                                />
                                                            }
                                                            label="Set as main address"
                                                        />
                                                    </Grid>
                                                </Grid>

                                                <Typography variant="subtitle1" sx={{ mb: 1, mt: 2 }}>
                                                    Full Address / Street
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    placeholder="e.g. 1901 Thornridge Cir. Shiloh, Hawaii 81063"
                                                    name="address"
                                                    value={newAddress.address}
                                                    onChange={handleAddressInputChange}
                                                    margin="normal"
                                                    variant="outlined"
                                                />

                                                {newAddress.type === 'Apartment' && (
                                                    <>
                                                        <Typography variant="subtitle1" sx={{ mb: 1, mt: 2 }}>
                                                            Apartment Details
                                                        </Typography>
                                                        <TextField
                                                            fullWidth
                                                            placeholder="Apartment number, floor, etc."
                                                            name="apartmentDetails"
                                                            value={newAddress.apartmentDetails || ''}
                                                            onChange={handleAddressInputChange}
                                                            margin="normal"
                                                            variant="outlined"
                                                        />
                                                    </>
                                                )}

                                                {newAddress.type === 'Office' && (
                                                    <>
                                                        <Typography variant="subtitle1" sx={{ mb: 1, mt: 2 }}>
                                                            Office Details
                                                        </Typography>
                                                        <TextField
                                                            fullWidth
                                                            placeholder="Company name, office number, etc."
                                                            name="officeDetails"
                                                            value={newAddress.officeDetails || ''}
                                                            onChange={handleAddressInputChange}
                                                            margin="normal"
                                                            variant="outlined"
                                                        />
                                                    </>
                                                )}

                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                                                    <Button variant="contained" onClick={handleSaveAddress} sx={{ backgroundColor: '#003366' }}>
                                                        Save
                                                    </Button>
                                                </Box>
                                            </>
                                        )}

                                        {!showAddressForm && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                                                <Button variant="outlined" onClick={handleCloseAddForm}>
                                                    Cancel
                                                </Button>
                                                <Button variant="contained" onClick={handleSaveCustomer} sx={{ backgroundColor: '#003366' }}>
                                                    {isEditMode ? 'Save Changes' : 'Save'}
                                                </Button>
                                            </Box>
                                        )}
                                    </Grid>
                                </Grid>
                            </div>
                        </div>
                    )}
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
                                overflowY: 'auto',
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

export default CustomerManagement;
