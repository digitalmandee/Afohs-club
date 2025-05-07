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
    Alert,
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
    Snackbar,
    Switch,
    TextField,
    Typography,
} from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';

export default function AddCustomer({ users, memberTypes, customer = null, addressTypes = [] }) {
    const drawerWidthOpen = 240;
    const drawerWidthClosed = 110;

    const [open, setOpen] = useState(false);

    const [customers, setCustomers] = useState([]); // Initialize empty for dynamic loading

    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCustomers, setFilteredCustomers] = useState([...customers]);

    const [openAddForm, setOpenAddForm] = useState(!!customer);
    const [isEditMode, setIsEditMode] = useState(!!customer);
    const [currentCustomerIndex, setCurrentCustomerIndex] = useState(null);

    const [newCustomer, setNewCustomer] = useState({
        id: customer?.id || `MEMBER${Math.floor(100 + Math.random() * 900)}`,
        name: customer?.name || '',
        email: customer?.email || '',
        phone_number: customer?.phone_number || '',
        type: customer?.type || 'Regular',
        customer_type: customer?.memberType?.name || 'Silver',
        profile_photo: customer?.profile_photo || null,
        addresses:
            customer?.userDetails?.map((detail) => ({
                type: detail.address_type,
                address: detail.address,
                city: detail.city,
                province: detail.state,
                country: detail.country,
                zipCode: detail.zip,
                isMain: detail.status === 'active',
            })) || [],
    });

    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        type: addressTypes.length > 0 ? addressTypes[0].name : 'House',
        address: '',
        city: '',
        province: '',
        country: '',
        zipCode: '',
        isMain: false,
    });

    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [errors, setErrors] = useState({});

    const [profileImage, setProfileImage] = useState(customer?.profile_photo || null);

    const [phoneCountryCode, setPhoneCountryCode] = useState('+702');

    useEffect(() => {
        const filtered = customers.filter(
            (customer) =>
                customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.type.toLowerCase().includes(searchTerm.toLowerCase()),
        );
        setFilteredCustomers(filtered);
    }, [searchTerm, customers]);

    const handleCloseAddForm = () => {
        setOpenAddForm(false);
        setShowAddressForm(false);
        setErrors({});
        setShowError(false);
        setErrorMessage('');
        setIsEditMode(false);
        setCurrentCustomerIndex(null);
        setNewCustomer({
            id: `MEMBER${Math.floor(100 + Math.random() * 900)}`,
            name: '',
            email: '',
            phone_number: '',
            type: 'Regular',
            customer_type: 'Silver',
            profile_photo: null,
            addresses: [],
        });
        setProfileImage(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCustomer({
            ...newCustomer,
            [name]: value,
        });
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const handleAddressInputChange = (e) => {
        const { name, value } = e.target;
        setNewAddress({
            ...newAddress,
            [name]: value,
        });
    };

    const handlePhoneCountryCodeChange = (e) => {
        setPhoneCountryCode(e.target.value);
    };

    const handleImageUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
            if (errors.profile_photo) {
                setErrors((prev) => ({ ...prev, profile_photo: null }));
            }
        }
    };

    const handleDeleteImage = () => {
        setProfileImage(null);
    };

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

    const handleSaveCustomer = () => {
        // Client-side validation
        if (!newCustomer.name || !newCustomer.email || !newCustomer.phone_number) {
            setErrorMessage('Please fill in all required fields.');
            setShowError(true);
            return;
        }

        if (newCustomer.addresses.length > 0) {
            for (const addr of newCustomer.addresses) {
                if (!addr.type || !addr.address || !addr.city || !addr.province || !addr.country || !addr.zipCode) {
                    console.error('Invalid address:', addr); // Log the problematic address
                    setErrorMessage('All address fields are required.');
                    setShowError(true);
                    return;
                }
            }
        }

        const formData = new FormData();
        formData.append('name', newCustomer.name);
        formData.append('email', newCustomer.email);
        formData.append('phone', `${phoneCountryCode}${newCustomer.phone_number}`);
        formData.append('customer_type', newCustomer.customer_type);
        formData.append('member_type_id', memberTypes.find((mt) => mt.name === newCustomer.customer_type)?.id || ''); // Add member_type_id
        if (profileImage && profileImage.startsWith('data:image')) {
            const blob = base64ToBlob(profileImage);
            formData.append('profile_pic', blob, 'profile.jpg');
        }
        formData.append('addresses', JSON.stringify(newCustomer.addresses));

        const routeName = isEditMode ? 'members.update' : 'members.store';
        const url = isEditMode ? route(routeName, newCustomer.id) : route(routeName);

        router.post(url, formData, {
            onSuccess: (page) => {
                const returnedCustomer = page.props.customer || {
                    ...newCustomer,
                    id: page.props.customer?.id || newCustomer.id,
                    user_id: page.props.customer?.user_id || newCustomer.id,
                    phone_number: `${phoneCountryCode}${newCustomer.phone_number}`,
                    profile_photo: profileImage || newCustomer.profile_photo,
                    userDetails: newCustomer.addresses.map((addr) => ({
                        address_type: addr.type,
                        country: addr.country,
                        state: addr.province,
                        city: addr.city,
                        zip: addr.zipCode,
                        address: addr.address,
                        status: addr.isMain ? 'active' : 'inactive',
                    })),
                };
                if (isEditMode && currentCustomerIndex !== null) {
                    const updatedCustomers = [...customers];
                    updatedCustomers[currentCustomerIndex] = returnedCustomer;
                    setCustomers(updatedCustomers);
                } else {
                    setCustomers([returnedCustomer, ...customers]);
                }
                setSuccessMessage(isEditMode ? 'Customer updated successfully!' : 'Customer added successfully!');
                setShowSuccess(true);
                handleCloseAddForm();
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                setErrors(errors);
                const errorMessages = Object.values(errors).filter(Boolean).join('; ');
                setErrorMessage(errorMessages || 'Failed to add customer. Please check the form.');
                setShowError(true);
            },
        });
    };

    const handleShowAddressForm = () => {
        setNewAddress({
            type: addressTypes.length > 0 ? addressTypes[0].name : 'House',
            address: '',
            city: '',
            province: '',
            country: '',
            zipCode: '',
            isMain: false,
        });
        setShowAddressForm(true);
    };

    const handleSaveAddress = () => {
        const updatedCustomer = { ...newCustomer };
        if (updatedCustomer.addresses.length === 0 || newAddress.isMain) {
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

    const handleSetMainAddress = (index) => {
        const updatedCustomer = { ...newCustomer };
        updatedCustomer.addresses = updatedCustomer.addresses.map((addr, i) => ({
            ...addr,
            isMain: i === index,
        }));
        setNewCustomer(updatedCustomer);
    };

    const lastUserId = users.data.length > 0 ? users.data[0].user_id : 0;
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
                                    {errors.profile_photo && (
                                        <Typography color="error" variant="caption">
                                            {errors.profile_photo}
                                        </Typography>
                                    )}
                                </Box>
                                <Box style={{ display: 'flex', flexDirection: 'column' }}>
                                    {(isEditMode || profileImage) && (
                                        <div style={{ display: 'flex', gap: '5px', padding: '5px' }}>
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
                                                checked={newCustomer.customer_type === memberType.name}
                                                onChange={handleInputChange}
                                                name="customer_type"
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
                            {errors.customer_type && (
                                <Typography color="error" variant="caption">
                                    {errors.customer_type}
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
                                            name="phone_number"
                                            value={newCustomer.phone_number}
                                            onChange={handleInputChange}
                                            margin="normal"
                                            variant="outlined"
                                            error={!!errors.phone}
                                            helperText={errors.phone}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                            {newCustomer.addresses && newCustomer.addresses.length > 0 && (
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
                                                    inputProps={{ 'aria-labelledby': `address-switch-${index}` }}
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
                            {showAddressForm && (
                                <>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="subtitle1">Type</Typography>
                                        <IconButton size="small" onClick={() => setShowAddressForm(false)}>
                                            <CloseIcon />
                                        </IconButton>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                        {addressTypes.length > 0 ? (
                                            addressTypes.map((type) => (
                                                <Button
                                                    key={type.id}
                                                    variant={newAddress.type === type.name ? 'contained' : 'outlined'}
                                                    onClick={() => setNewAddress({ ...newAddress, type: type.name })}
                                                    sx={{
                                                        borderRadius: '20px',
                                                        backgroundColor: newAddress.type === type.name ? '#1976d2' : 'transparent',
                                                        color: newAddress.type === type.name ? 'white' : 'inherit',
                                                    }}
                                                >
                                                    {type.name}
                                                </Button>
                                            ))
                                        ) : (
                                            <Typography color="error">No address types available</Typography>
                                        )}
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
                                                Province / State
                                            </Typography>
                                            <FormControl fullWidth margin="normal" variant="outlined">
                                                <Select
                                                    displayEmpty
                                                    value={newAddress.country}
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
                                    <Button variant="contained" onClick={handleSaveAddress} sx={{ backgroundColor: '#003366', mt: 2 }}>
                                        Save Address
                                    </Button>
                                </>
                            )}
                            {!showAddressForm && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                                    {/* <Button variant="outlined" onClick={handleCloseAddForm}>
                                        Cancel
                                    </Button> */}
                                    <Button variant="contained" onClick={handleSaveCustomer} sx={{ backgroundColor: '#003366' }}>
                                        {isEditMode ? 'Save Changes' : 'Save'}
                                    </Button>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </div>
            </div>
            <Snackbar open={showSuccess} autoHideDuration={6000} onClose={() => setShowSuccess(false)}>
                <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
                    {successMessage}
                </Alert>
            </Snackbar>
            <Snackbar open={showError} autoHideDuration={6000} onClose={() => setShowError(false)}>
                <Alert onClose={() => setShowError(false)} severity="error" sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>
        </>
    );
}
