import SideNav from '@/components/App/SideBar/SideNav';
import { router } from '@inertiajs/react';
import { Add as AddIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Alert, Box, Button, FormControl, Grid, IconButton, MenuItem, Select, Snackbar, TextField, Typography } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;
export default function AddKitchen({ userNo, customer = null }) {
    const phoneNumber = customer?.phone_number || '';
    const [phoneCountryCodeFromData, phoneNumberWithoutCode] = phoneNumber.includes('-') ? phoneNumber.split('-') : [phoneNumber.match(/^\+\d+/)?.[0] || '+702', phoneNumber.replace(/^\+\d+/, '').trim()];

    const [open, setOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(!!customer);
    const [phoneCountryCode, setPhoneCountryCode] = useState(phoneCountryCodeFromData);

    const [newCustomer, setNewCustomer] = useState({
        id: customer?.id || null,
        name: customer?.name || '',
        email: customer?.email || '',
        phone_number: phoneNumberWithoutCode || '',
        profile_photo: customer?.profile_photo || null,
        printer_ip: customer?.kitchen_detail?.printer_ip || '',
        printer_port: customer?.kitchen_detail?.printer_port || '',
    });

    const [errors, setErrors] = useState({});

    const [profileImage, setProfileImage] = useState(customer?.profile_photo || null);

    const handleCloseAddForm = () => {
        setErrors({});
        setIsEditMode(false);
        setNewCustomer({
            id: null,
            name: '',
            email: '',
            phone_number: '',
            profile_photo: null,
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

    const handlePhoneCountryCodeChange = (e) => {
        setPhoneCountryCode(e.target.value);
    };

    const handleImageUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            setNewCustomer({
                ...newCustomer,
                profile_photo: file,
            });
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

    const handleSaveCustomer = () => {
        // Client-side validation
        if (!newCustomer.name || !newCustomer.email || !newCustomer.phone_number || !newCustomer.printer_ip || !newCustomer.printer_port) {
            enqueueSnackbar('Please fill in all required fields.', { variant: 'error' });
            return;
        }

        const method = isEditMode ? 'put' : 'post';
        const url = isEditMode ? route('kitchens.update', { id: newCustomer.id }) : route('kitchens.store');

        const payload = {
            _method: method,
            ...newCustomer,
            phone: `${phoneCountryCode}-${newCustomer.phone_number}`,
        };

        router.post(url, payload, {
            forceFormData: true,
            onSuccess: () => {
                enqueueSnackbar(isEditMode ? 'Kitchen updated successfully!' : 'Kitchen added successfully!', { variant: 'success' });
                handleCloseAddForm();
                router.visit(route('kitchens.index'));
            },
            onError: (errors) => {
                setErrors(errors);
                const errorMessages = Object.values(errors).filter(Boolean).join('; ');
                enqueueSnackbar(errorMessages || 'Failed to save Kitchen. Please check the form.', { variant: 'error' });
            },
        });
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
                    <IconButton onClick={() => router.visit(route('kitchens.index'))}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" style={{ marginLeft: '10px' }}>
                        {isEditMode ? 'Edit Kitchen Information' : 'Add Kitchen Information'}
                    </Typography>
                </div>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px' }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Box sx={{ p: 2, backgroundColor: '#F6F6F6', border: '1px solid #e0e0e0', borderRadius: '4px', mb: 2 }}>
                                <Typography variant="body1">
                                    Member Id: <strong>#{userNo}</strong>
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
                                    {errors.profile_pic && (
                                        <Typography color="error" variant="caption">
                                            {errors.profile_pic}
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
                                            <input accept="image/*" style={{ display: 'none' }} id="profile-image-upload-edit" type="file" onChange={handleImageUpload} />
                                            <Button size="small" color="error" onClick={handleDeleteImage} sx={{ minWidth: 'auto', fontSize: '14px' }}>
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

                            {errors.customer_type && (
                                <Typography color="error" variant="caption">
                                    {errors.customer_type}
                                </Typography>
                            )}
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                Kitchen Name
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
                                        <TextField fullWidth placeholder="e.g. 123 456 7890" name="phone_number" value={newCustomer.phone_number} onChange={handleInputChange} margin="normal" variant="outlined" error={!!errors.phone} helperText={errors.phone} />
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                        Printer IP
                                    </Typography>
                                    <TextField fullWidth placeholder="e.g. 192.168.1.100" name="printer_ip" value={newCustomer.printer_ip} onChange={handleInputChange} margin="normal" variant="outlined" error={!!errors.printer_ip} helperText={errors.printer_ip} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                        Printer Port
                                    </Typography>
                                    <TextField fullWidth placeholder="e.g. 9100" name="printer_port" value={newCustomer.printer_port} onChange={handleInputChange} margin="normal" variant="outlined" error={!!errors.printer_port} helperText={errors.printer_port} />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 0 }}>
                                <Button variant="contained" onClick={handleSaveCustomer} sx={{ backgroundColor: '#003366' }}>
                                    {isEditMode ? 'Save Changes' : 'Save'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </div>
            </div>
        </>
    );
}
