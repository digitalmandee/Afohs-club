import SideNav from '@/components/App/SideBar/SideNav';
import { tenantAsset } from '@/helpers/asset';
import { router } from '@inertiajs/react';
import { Add as AddIcon, Apartment as ApartmentIcon, ArrowBack as ArrowBackIcon, Business as BusinessIcon, Close as CloseIcon, Home as HomeIcon, KeyboardArrowRight as KeyboardArrowRightIcon, LocationOn as LocationOnIcon } from '@mui/icons-material';
import { Alert, Box, Button, FormControl, FormControlLabel, Grid, IconButton, List, ListItem, ListItemIcon, ListItemText, MenuItem, Radio, Select, Snackbar, Switch, TextField, Typography } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';

export default function EditCustomer({ customer, memberTypes, addressTypes = [] }) {
    const drawerWidthOpen = 240;
    const drawerWidthClosed = 110;

    const [open, setOpen] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [errors, setErrors] = useState({});
    const [showData, setShowData] = useState(false);
    const [currentAddressIndex, setCurrentAddressIndex] = useState(null);

    // Extract phone number and country code
    const phoneNumber = customer?.phone_number || '';
    const [phoneCountryCodeFromData, phoneNumberWithoutCode] = phoneNumber.includes('-') ? phoneNumber.split('-') : [phoneNumber.match(/^\+\d+/)?.[0] || '+702', phoneNumber.replace(/^\+\d+/, '').trim()];

    const [phoneCountryCode, setPhoneCountryCode] = useState(phoneCountryCodeFromData);

    // Extract member type name
    const memberTypeName = customer?.member_type?.name || 'Silver';

    const [newCustomer, setNewCustomer] = useState({
        id: customer?.id || '',
        name: customer?.name || '',
        email: customer?.email || '',
        phone_number: phoneNumberWithoutCode,
        type: customer?.type || 'Regular',
        customer_type: memberTypeName,
        profile_photo: customer?.profile_photo || null,
        addresses:
            customer?.userDetails?.map((detail) => ({
                address_type: detail.address_type,
                address: detail.address,
                city: detail.city,
                state: detail.state,
                country: detail.country,
                zip: detail.zip,
                status: detail.status === 'active',
            })) || [],
    });

    const [newAddress, setNewAddress] = useState({
        address_type: addressTypes.length > 0 ? addressTypes[0].name : 'House',
        address: '',
        city: '',
        state: '',
        country: '',
        zip: '',
        status: false,
    });

    const [profileImage, setProfileImage] = useState(customer?.profile_photo ? tenantAsset(customer.profile_photo) : null);

    const handleCloseAddForm = () => {
        router.get(route('members.index'));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCustomer((prev) => ({
            ...prev,
            [name]: value,
        }));
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
        setNewCustomer({ ...newCustomer, profile_photo: null });
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
                if (!addr.address_type || !addr.address || !addr.city || !addr.state || !addr.country || !addr.zip) {
                    setErrorMessage('All address fields are required.');
                    setShowError(true);
                    return;
                }
            }
        }

        const formData = new FormData();
        formData.append('name', newCustomer.name);
        formData.append('email', newCustomer.email);
        // Ensure phone number is concatenated correctly
        const fullPhoneNumber = `${phoneCountryCode}-${newCustomer.phone_number}`;
        formData.append('phone', fullPhoneNumber);
        formData.append('customer_type', newCustomer.customer_type);
        formData.append('member_type_id', memberTypes.find((mt) => mt.name === newCustomer.customer_type)?.id || '');
        if (profileImage && profileImage.startsWith('data:image')) {
            const blob = base64ToBlob(profileImage);
            formData.append('profile_pic', blob, 'profile.jpg');
        } else if (!profileImage) {
            formData.append('profile_pic', '');
        }
        formData.append('addresses', JSON.stringify(newCustomer.addresses));
        formData.append('_method', 'PUT');

        router.post(route('members.update', newCustomer.id), formData, {
            onSuccess: () => {
                setSuccessMessage('Customer updated successfully!');
                setShowSuccess(true);
                setTimeout(() => router.get(route('members.index')), 2000);
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                setErrors(errors);
                const errorMessages = Object.values(errors).filter(Boolean).join('; ');
                setErrorMessage(errorMessages || 'Failed to update customer. Please check the form.');
                setShowError(true);
            },
        });
    };

    const handleShowAddressForm = () => {
        setNewAddress({
            address_type: addressTypes.length > 0 ? addressTypes[0].name : 'House',
            address: '',
            city: '',
            state: '',
            country: '',
            zip: '',
            status: false,
        });
        setCurrentAddressIndex(null);
        setShowAddressForm(true);
    };

    const handleSaveAddress = () => {
        // Validate address fields
        if (!newAddress.address_type || !newAddress.address || !newAddress.city || !newAddress.state || !newAddress.country || !newAddress.zip) {
            setErrorMessage('All address fields are required.');
            setShowError(true);
            return;
        }

        const updatedCustomer = { ...newCustomer };
        if (newAddress.status) {
            updatedCustomer.addresses = updatedCustomer.addresses.map((addr) => ({
                ...addr,
                status: false,
            }));
        }

        if (currentAddressIndex !== null) {
            // Update existing address
            updatedCustomer.addresses[currentAddressIndex] = newAddress;
        } else {
            // Add new address
            updatedCustomer.addresses.push(newAddress);
        }

        setNewCustomer(updatedCustomer);
        setShowAddressForm(false);
        setSuccessMessage(currentAddressIndex !== null ? 'Address updated successfully!' : 'Address added successfully!');
        setShowSuccess(true);
        setCurrentAddressIndex(null);
    };

    const handleSetMainAddress = (index) => {
        const updatedCustomer = { ...newCustomer };
        updatedCustomer.addresses = updatedCustomer.addresses.map((addr, i) => ({
            ...addr,
            status: i === index,
        }));
        setNewCustomer(updatedCustomer);
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
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    <IconButton onClick={handleCloseAddForm}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" style={{ marginLeft: '10px' }}>
                        Edit Customer Information
                    </Typography>
                </div>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px' }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ p: 2, backgroundColor: '#F6F6F6', border: '1px solid #e0e0e0', borderRadius: '4px', mb: 2 }}>
                                <Typography variant="body1">
                                    Member Id: <strong>{customer?.user_id || 'N/A'}</strong>
                                </Typography>
                                <Typography variant="body1">
                                    Member Type: <strong>{memberTypeName}</strong>
                                </Typography>
                            </Box>
                            <Box style={{ display: 'flex', gap: '10px' }}>
                                <Box sx={{ mb: 2 }}>
                                    {profileImage ? (
                                        <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                                            <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                                        </div>
                                    ) : (
                                        <Box>
                                            <input accept="image/*" style={{ display: 'none' }} id="profile-image-upload-add" type="file" onChange={handleImageUpload} />
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
                                    {profileImage && (
                                        <div style={{ display: 'flex', gap: '5px', padding: '5px' }}>
                                            <label htmlFor="profile-image-upload-edit">
                                                <Button size="small" sx={{ minWidth: 'auto', fontSize: '14px' }} component="span">
                                                    Choose Photo
                                                </Button>
                                            </label>
                                            <input accept="image/*" style={{ display: 'none' }} id="profile-image-upload-edit" type="file" onChange={handleImageUpload} />
                                            <Button size="small" color="error" onClick={handleDeleteImage} sx={{ minWidth: 'auto', fontSize: '14px' }}>
                                                Delete
                                            </Button>
                                        </div>
                                    )}
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        Profile Picture
                                    </Typography>
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
                                                onChange={() => {
                                                    setNewCustomer((prev) => ({
                                                        ...prev,
                                                        customer_type: memberType.name,
                                                    }));
                                                }}
                                                name="customer_type"
                                                value={memberType.name}
                                            />
                                        }
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <img src="https://img.icons8.com/ios-filled/50/FFD700/gold-medal.png" width="24" height="24" alt={memberType.name} style={{ marginRight: '8px' }} />
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
                            <TextField fullWidth placeholder="e.g. Dianne Russell" name="name" value={newCustomer.name} onChange={handleInputChange} margin="normal" variant="outlined" sx={{ mb: 2 }} error={!!errors.name} helperText={errors.name} />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                        Email
                                    </Typography>
                                    <TextField fullWidth placeholder="e.g. dianne.russell@gmail.com" name="email" value={newCustomer.email} onChange={handleInputChange} margin="normal" variant="outlined" error={!!errors.email} helperText={errors.email} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                        Phone Number
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <FormControl variant="outlined" margin="normal" sx={{ minWidth: '90px' }}>
                                            <Select value={phoneCountryCode} onChange={handlePhoneCountryCodeChange}>
                                                <MenuItem value="+702">+702</MenuItem>
                                                <MenuItem value="+1">+1</MenuItem>
                                                <MenuItem value="+44">+44</MenuItem>
                                                <MenuItem value="+91">+91</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <TextField fullWidth placeholder="e.g. 1234567890" name="phone_number" value={newCustomer.phone_number} onChange={handleInputChange} margin="normal" variant="outlined" error={!!errors.phone} helperText={errors.phone} />
                                    </Box>
                                </Grid>
                            </Grid>
                            {newCustomer.addresses.length > 0 && (
                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                        Address ({newCustomer.addresses.length})
                                    </Typography>
                                    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                                        {newCustomer.addresses.map((address, index) => (
                                            <ListItem key={index}>
                                                <ListItemIcon>{address.address_type === 'House' ? <HomeIcon /> : address.address_type === 'Apartment' ? <ApartmentIcon /> : <BusinessIcon />}</ListItemIcon>
                                                <ListItemText
                                                    primary={address.address_type}
                                                    secondary={
                                                        <>
                                                            <Typography component="span" variant="body2" color="text.primary">
                                                                {address.address}
                                                            </Typography>
                                                            <br />
                                                            {`${address.country}, ${address.state}, ${address.city}, ${address.zip}`}
                                                        </>
                                                    }
                                                />
                                                <Switch edge="end" checked={address.status} onChange={() => handleSetMainAddress(index)} inputProps={{ 'aria-labelledby': `address-switch-${index}` }} />
                                                <Typography variant="body2" color="primary" sx={{ ml: 1 }}>
                                                    {address.status ? 'Main Address' : ''}
                                                </Typography>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => {
                                                        setNewAddress(address);
                                                        setCurrentAddressIndex(index);
                                                        setShowAddressForm(true);
                                                    }}
                                                >
                                                    Edit
                                                </Button>
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
                                                    variant={newAddress.address_type === type.name ? 'contained' : 'outlined'}
                                                    onClick={() => setNewAddress({ ...newAddress, address_type: type.name })}
                                                    sx={{
                                                        borderRadius: '20px',
                                                        backgroundColor: newAddress.address_type === type.name ? '#1976d2' : 'transparent',
                                                        color: newAddress.address_type === type.name ? 'white' : 'inherit',
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
                                                    value={newAddress.state}
                                                    name="state"
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
                                            <TextField fullWidth placeholder="e.g. 10101" name="zip" value={newAddress.zip} onChange={handleAddressInputChange} margin="normal" variant="outlined" />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle1" sx={{ mb: 1, mt: 2 }}>
                                                Main Address
                                            </Typography>
                                            <FormControlLabel control={<Switch checked={newAddress.status} onChange={(e) => setNewAddress({ ...newAddress, status: e.target.checked })} name="status" />} label="Set as main address" />
                                        </Grid>
                                    </Grid>
                                    <Typography variant="subtitle1" sx={{ mb: 1, mt: 2 }}>
                                        Full Address / Street
                                    </Typography>
                                    <TextField fullWidth placeholder="e.g. 1901 Thornridge Cir. Shiloh, Hawaii 81063" name="address" value={newAddress.address} onChange={handleAddressInputChange} margin="normal" variant="outlined" />
                                    <Button variant="contained" onClick={handleSaveAddress} sx={{ backgroundColor: '#003366', mt: 2 }}>
                                        Save Address
                                    </Button>
                                </>
                            )}
                            {!showAddressForm && (
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                                    <Button variant="contained" onClick={handleSaveCustomer} sx={{ backgroundColor: '#003366' }}>
                                        Save Changes
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
