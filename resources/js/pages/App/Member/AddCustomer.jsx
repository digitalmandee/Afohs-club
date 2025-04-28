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
} from '@mui/icons-material';
import {
    Box,
    Button,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Radio,
    Select,
    Switch,
    TextField,
    Typography,
} from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';

export default function AddCustomer({ users, memberTypes }) {
    const drawerWidthOpen = 240;
    const drawerWidthClosed = 110;

    // State for drawer
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

    // State for errors
    const [errors, setErrors] = useState({});

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

    // State for phone country code
    const [phoneCountryCode, setPhoneCountryCode] = useState('+702');

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

    // Handle closing add/edit customer form
    const handleCloseAddForm = () => {
        setOpenAddForm(false);
        setShowAddressForm(false);
        setErrors({});
    };

    // Handle input change in add/edit customer form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCustomer({
            ...newCustomer,
            [name]: value,
        });
        // Clear error for the field when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    // Handle address input change
    const handleAddressInputChange = (e) => {
        const { name, value } = e.target;
        setNewAddress({
            ...newAddress,
            [name]: value,
        });
    };

    // Handle phone country code change
    const handlePhoneCountryCodeChange = (e) => {
        setPhoneCountryCode(e.target.value);
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
            // Clear profilePic error if any
            if (errors.profilePic) {
                setErrors((prev) => ({ ...prev, profilePic: null }));
            }
        }
    };

    // Handle delete profile image
    const handleDeleteImage = () => {
        setProfileImage(null);
    };

    // Convert base64 to Blob for profile image
    const base64ToBlob = (base64) => {
        const byteString = atob(base64.split(',')[1]);
        const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    };

    // Handle save customer
    const handleSaveCustomer = () => {
        const formData = new FormData();

        // Append customer fields
        formData.append('name', newCustomer.name);
        formData.append('email', newCustomer.email);
        formData.append('phone', `${phoneCountryCode}${newCustomer.phone}`);
        formData.append('type', newCustomer.type);
        formData.append('address', newCustomer.address);
        formData.append('customer_type', newCustomer.customerType);

        // Append profile image if available
        if (profileImage) {
            const blob = base64ToBlob(profileImage);
            formData.append('profile_pic', blob, 'profile.jpg');
        }

        // Append addresses as JSON
        formData.append('addresses', JSON.stringify(newCustomer.addresses));

        // Send request based on mode (create or update)
        if (isEditMode && currentCustomerIndex !== null) {
            // Update existing customer
            formData.append('_method', 'PUT'); // Laravel expects this for PUT requests via FormData
            router.post(route('customers.update', customers[currentCustomerIndex].id), formData, {
                onSuccess: () => {
                    const updatedCustomer = {
                        ...newCustomer,
                        id: customers[currentCustomerIndex].id,
                        phone: `${phoneCountryCode}${newCustomer.phone}`,
                        profilePic: profileImage || customers[currentCustomerIndex].profilePic,
                    };
                    const updatedCustomers = [...customers];
                    updatedCustomers[currentCustomerIndex] = updatedCustomer;
                    setCustomers(updatedCustomers);
                    setSuccessMessage('Customer updated successfully!');
                    setShowSuccess(true);
                    setOpenAddForm(false);
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
                    setPhoneCountryCode('+702');
                    setErrors({});
                },
                onError: (errors) => {
                    setErrors(errors);
                },
            });
        } else {
            // Add new customer
            router.post(route('customers.store'), formData, {
                onSuccess: () => {
                    const newCustomerData = {
                        ...newCustomer,
                        id: `AFOHS-${Math.floor(10000 + Math.random() * 90000)}`, // Temporary ID until backend returns actual ID
                        phone: `${phoneCountryCode}${newCustomer.phone}`,
                        profilePic:
                            profileImage || 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Hnn6JyFbqTjwloItCmZtl1a4IypuX3.png',
                    };
                    setCustomers([newCustomerData, ...customers]);
                    setSuccessMessage('Customer added successfully!');
                    setShowSuccess(true);
                    setOpenAddForm(false);
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
                    setPhoneCountryCode('+702');
                    setErrors({});
                },
                onError: (errors) => {
                    setErrors(errors);
                },
            });
        }
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

    // Get the last user id
    const lastUserId =
        users.data.length > 0
            ? users.data[0].user_id // latest user first because of ->latest() in query
            : 0; // if no user, start from 0

    const newMemberId = lastUserId + 1;

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
                                    Member Id: <strong>MEMBER{newMemberId}</strong>
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
                                    {errors.profilePic && (
                                        <Typography color="error" variant="caption">
                                            {errors.profilePic}
                                        </Typography>
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
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, width: '100%' }}>
                                {memberTypes.map((memberType, key) => (
                                    <FormControlLabel
                                        key={key}
                                        sx={{
                                            border: '1px dashed #E3E3E3',
                                            p: 1,
                                            minWidth: '150px',
                                            flexBasis: 'calc(33.333% - 16px)',
                                            boxSizing: 'border-box',
                                        }}
                                        control={
                                            <Radio
                                                checked={newCustomer.customerType === memberType.name}
                                                onChange={handleInputChange}
                                                name="customerType"
                                                value={memberType.name}
                                            />
                                        }
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <img
                                                    src="https://img.icons8.com/ios-filled/50/FFD700/gold-medal.png"
                                                    width="24"
                                                    height="24"
                                                    alt={memberType.name}
                                                    style={{ marginRight: '8px' }}
                                                />
                                                {memberType.name}
                                            </Box>
                                        }
                                    />
                                ))}
                            </Box>
                            {errors.customerType && (
                                <Typography color="error" variant="caption">
                                    {errors.customerType}
                                </Typography>
                            )}
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
                                error={!!errors.name}
                                helperText={errors.name}
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
                                        error={!!errors.email}
                                        helperText={errors.email}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                        Phone Number
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <FormControl variant="outlined" margin="normal" sx={{ minWidth: '90px' }}>
                                            <Select value={phoneCountryCode} onChange={handlePhoneCountryCodeChange} native>
                                                <option value="+702">+702</option>
                                                <option value="+1">+1</option>
                                                <option value="+44">+44</option>
                                                <option value="+91">+91</option>
                                            </Select>
                                        </FormControl>
                                        <TextField
                                            fullWidth
                                            placeholder="e.g. 123 456 7890"
                                            name="phone"
                                            value={newCustomer.phone}
                                            onChange={handleInputChange}
                                            margin="normal"
                                            variant="outlined"
                                            error={!!errors.phone}
                                            helperText={errors.phone}
                                        />
                                    </Box>
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
                                    {errors.addresses && (
                                        <Typography color="error" variant="caption">
                                            {errors.addresses}
                                        </Typography>
                                    )}
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
        </>
    );
}
