import React, { useCallback, useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Tabs, Tab, TextField, Button, Typography, Box, Paper, InputAdornment, Select, MenuItem, FormControl, Autocomplete } from '@mui/material';
import { ArrowBack as ArrowBackIcon, KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import SearchIcon from '@mui/icons-material/Search';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const AddSubscriptionInformation = ({ subscriberTypes, categories, invoice_no }) => {
    const [open, setOpen] = useState(true);

    const today = new Date().toISOString().split('T')[0];

    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [members, setMembers] = useState([]);
    const [tabIndex, setTabIndex] = useState(0);

    const [formData, setFormData] = useState({
        customer: {},
        email: '',
        phone: '',
        subscriberType: '',
        category: '',
        subscriptionType: '',
        startDate: today,
        expiryDate: '',
        amount: 0,
    });

    const [errors, setErrors] = useState({});

    const handleTabChange = (event, newValue) => setTabIndex(newValue);

    const subscriptionTypes = [
        { label: 'One Time', value: 'one_time' },
        { label: 'Monthly', value: 'monthly' },
        { label: 'Quarter', value: 'quarter' },
        { label: 'Annual', value: 'annual' },
    ];

    const searchUser = useCallback(async (query) => {
        if (!query) return []; // Don't make a request if the query is empty.
        setSearchLoading(true);
        try {
            const response = {
                data: {
                    results: []
                }
            };
            setMembers(response.data.results);
        } catch (error) {
            console.error('Error fetching search results:', error);
            return [];
        } finally {
            setSearchLoading(false);
        }
    }, []);

    const handleSearch = async (event) => {
        const query = event?.target?.value;
        if (query) {
            await searchUser(query);
        } else {
            setMembers([]);
        }
    };
    const handleSearchChange = (event, value) => {
        setFormData((prev) => ({
            ...prev,
            email: value?.email || '',
            phone: value?.phone_number || '',
            customer: value || {},
        }));
    };

    const calculateExpiry = (startDate, type) => {
        const date = new Date(startDate);
        if (type === 'monthly') {
            date.setMonth(date.getMonth() + 1);
        } else if (type === 'quarter') {
            // 3 months
            date.setMonth(date.getMonth() + 3);
        } else if (type === 'annual') {
            date.setFullYear(date.getFullYear() + 1);
        } else {
            return '';
        }
        return date.toISOString().split('T')[0];
    };

    useEffect(() => {
        if (formData.startDate && formData.subscriptionType && formData.subscriptionType !== 'one_time') {
            const newExpiry = calculateExpiry(formData.startDate, formData.subscriptionType);
            setFormData((prev) => ({
                ...prev,
                expiryDate: newExpiry,
            }));
        }
    }, []);

    useEffect(() => {
        if (formData.startDate && formData.subscriptionType !== 'one_time') {
            const newExpiry = calculateExpiry(formData.startDate, formData.subscriptionType);
            setFormData((prev) => ({
                ...prev,
                expiryDate: newExpiry,
            }));
        }
    }, [formData.startDate, formData.subscriptionType]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        let updatedData = { ...formData, [name]: value };

        if (name === 'subscriberType') {
            updatedData.category = '';
        }

        if (name === 'subscriptionType') {
            if (value === 'one_time') {
                updatedData.expiryDate = '';
            } else if (formData.startDate) {
                const newDate = new Date(formData.startDate);
                if (value === 'monthly') {
                    newDate.setMonth(newDate.getMonth() + 1);
                } else if (value === 'quarter') {
                    newDate.setMonth(newDate.getMonth() + 3);
                } else if (value === 'annual') {
                    newDate.setFullYear(newDate.getFullYear() + 1);
                }
                updatedData.expiryDate = newDate.toISOString().split('T')[0];
            }
        }

        if (name === 'startDate' && formData.subscriptionType !== 'one_time') {
            const newDate = new Date(value);
            if (formData.subscriptionType === 'monthly') {
                newDate.setMonth(newDate.getMonth() + 1);
            } else if (formData.subscriptionType === 'quarter') {
                newDate.setMonth(newDate.getMonth() + 3);
            } else if (formData.subscriptionType === 'annual') {
                newDate.setFullYear(newDate.getFullYear() + 1);
            }
            updatedData.expiryDate = newDate.toISOString().split('T')[0];
        }

        // compute total if category and subscriptionType exist
        const selectedCategory = categories.find((cat) => cat.id == (name === 'category' ? value : formData.category));
        const subscriptionType = name === 'subscriptionType' ? value : formData.subscriptionType;

        if (selectedCategory && subscriptionType) {
            const baseFee = parseFloat(selectedCategory.fee || 0);
            const subFee = parseFloat(selectedCategory.subscription_fee || 0);

            if (subscriptionType === 'one_time') {
                updatedData.amount = baseFee;
            } else if (subscriptionType === 'monthly') {
                updatedData.amount = subFee;
            } else if (subscriptionType === 'quarter') {
                updatedData.amount = subFee * 3;
            } else if (subscriptionType === 'annual') {
                updatedData.amount = subFee * 12;
            }
        }

        setFormData(updatedData);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Simple front-end validation
        const newErrors = {};
        if (!formData.customer) newErrors.customer = 'Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.phone) newErrors.phone = 'Phone is required';
        if (!formData.subscriberType) newErrors.subscriberType = 'Subscriber type is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.subscriptionType) newErrors.subscriptionType = 'Subscription type is required';
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (formData.subscriptionType !== 'one_time') {
            if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            setLoading(true);
            axios
                .post(route('subscriptions.store'), formData)
                .then((response) => {
                    enqueueSnackbar('Form submitted successfully.', { variant: 'success' });
                    router.visit(route('subscriptions.payment', { invoice_no: response.data.invoice_no }));
                })
                .catch((error) => {
                    enqueueSnackbar('Failed to submit form.', { variant: 'error' });
                    console.error('Error submitting form:', error);
                })
                .finally(() => {
                    setLoading(false);
                });
            // Add your submit logic (e.g. Inertia POST)
        }
    };

    const filteredCategories = formData.subscriberType ? categories.filter((cat) => cat.subscription_type_id === parseInt(formData.subscriberType)) : [];

    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                    backgroundColor: '#F6F6F6',
                }}
            >
                <div
                    style={{
                        fontFamily: 'Arial, sans-serif',
                        padding: '20px',
                        backgroundColor: '#f5f5f5',
                        minHeight: '100vh',
                    }}
                >
                    {/* Header with back button and title */}
                    <div className="d-flex align-items-center mb-4">
                        <ArrowBackIcon
                            style={{
                                cursor: 'pointer',
                                marginRight: '10px',
                                color: '#555',
                                fontSize: '24px',
                            }}
                        />
                        <Typography
                            variant="h5"
                            style={{
                                fontWeight: 500,
                                color: '#333',
                                fontSize: '24px',
                            }}
                        >
                            Add New Subscription
                        </Typography>
                    </div>
                    {/* Form Card */}
                    <Paper
                        elevation={1}
                        style={{
                            maxWidth: '630px',
                            margin: '0 auto',
                            padding: '30px',
                            borderRadius: '4px',
                        }}
                    >
                        <form onSubmit={handleSubmit}>
                            <Box
                                mb={2}
                                sx={{
                                    bgcolor: '#F6F6F6',
                                    border: '1px solid #E3E3E3',
                                    display: 'flex',
                                    justifyContent: 'flex-start',
                                    alignItems: 'center',
                                    px: 2,
                                    py: 1,
                                }}
                            >
                                <Typography
                                    sx={{
                                        color: '#7F7F7F',
                                        fontSize: '16px',
                                        fontWeight: 400,
                                    }}
                                >
                                    Invoice Number :
                                </Typography>
                                <Typography
                                    sx={{
                                        color: '#063455',
                                        fontSize: '16px',
                                        fontWeight: 500,
                                        ml: 1,
                                    }}
                                >
                                    #{invoice_no}
                                </Typography>
                            </Box>
                            {/* Guest Name */}
                            <Box mb={2}>
                                <Autocomplete
                                    fullWidth
                                    freeSolo
                                    size="small"
                                    options={members}
                                    value={formData.customer}
                                    name="customer"
                                    loading={searchLoading}
                                    getOptionLabel={(option) => [option?.first_name, option?.middle_name, option?.last_name].filter(Boolean).join(' ') || ''}
                                    isOptionEqualToValue={(option, value) => option?.user_id === value?.user_id}
                                    onInputChange={handleSearch}
                                    onChange={handleSearchChange}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            placeholder="Search by name, ID, or email"
                                            variant="outlined"
                                            size="small"
                                            name="customer"
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon sx={{ fontSize: 20, color: '#999' }} />
                                                    </InputAdornment>
                                                ),
                                                style: { fontSize: '14px' },
                                            }}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <li {...props}>
                                            <span>
                                                {option.first_name} ({option.user_id})
                                            </span>
                                            <span style={{ color: 'gray', fontSize: '0.875rem', marginLeft: '8px' }}>{option.email}</span>
                                        </li>
                                    )}
                                />
                            </Box>

                            {/* Phone */}
                            <Box mb={2} className="d-flex gap-3">
                                <div style={{ flex: 1 }}>
                                    <Typography
                                        variant="body1"
                                        style={{
                                            marginBottom: '8px',
                                            color: '#333',
                                            fontSize: '14px',
                                            fontWeight: 500,
                                        }}
                                    >
                                        Email
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter Email"
                                        variant="outlined"
                                        size="small"
                                        style={{ marginBottom: '8px' }}
                                        error={!!errors.email}
                                        helperText={errors.email}
                                        disabled={true}
                                        InputProps={{
                                            readOnly: true,
                                            style: { fontSize: '14px' },
                                        }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Typography
                                        variant="body1"
                                        style={{
                                            marginBottom: '8px',
                                            color: '#333',
                                            fontSize: '14px',
                                            fontWeight: 500,
                                        }}
                                    >
                                        Contact Number
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Enter you contact number"
                                        variant="outlined"
                                        size="small"
                                        style={{ marginBottom: '8px' }}
                                        error={!!errors.phone}
                                        helperText={errors.phone}
                                        disabled={true}
                                        InputProps={{
                                            readOnly: true,
                                            style: { fontSize: '14px' },
                                        }}
                                    />
                                </div>
                            </Box>

                            {/* Club Name */}
                            <Box mb={2}>
                                <Typography variant="body1" style={{ marginBottom: '8px', color: '#333', fontSize: '14px', fontWeight: 500 }}>
                                    Subscribers Type
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <TextField
                                        select
                                        fullWidth
                                        name="subscriberType"
                                        value={formData.subscriberType}
                                        onChange={handleChange}
                                        placeholder="Choose Subscriber Type"
                                        variant="outlined"
                                        size="small"
                                        error={!!errors.subscriberType}
                                        helperText={errors.subscriberType}
                                        SelectProps={{
                                            displayEmpty: true,
                                            renderValue: (selected) => {
                                                if (!selected) {
                                                    return <span style={{ color: '#757575', fontSize: '14px' }}>Choose Subscriber Type</span>;
                                                }
                                                const item = subscriberTypes.find((item) => item.id == selected);
                                                return item ? item.name : '';
                                            },
                                            IconComponent: KeyboardArrowDownIcon,
                                        }}
                                        InputProps={{
                                            style: { fontSize: '14px' },
                                        }}
                                    >
                                        <MenuItem value="">
                                            <em>None</em>
                                        </MenuItem>
                                        {subscriberTypes.map((item) => (
                                            <MenuItem key={item.id} value={item.id}>
                                                {item.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </FormControl>
                            </Box>

                            <Box mb={2}>
                                <Typography
                                    variant="body1"
                                    style={{
                                        marginBottom: '8px',
                                        color: '#333',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                    }}
                                >
                                    Subscribers Category
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <TextField
                                        select
                                        fullWidth
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        placeholder="Choose Category"
                                        variant="outlined"
                                        size="small"
                                        style={{ marginBottom: '8px' }}
                                        error={!!errors.category}
                                        helperText={errors.category}
                                        SelectProps={{
                                            displayEmpty: true,
                                            renderValue: (selected) => {
                                                if (!selected) {
                                                    return <span style={{ color: '#757575', fontSize: '14px' }}>Choose Category</span>;
                                                }
                                                const item = categories.find((item) => item.id == Number(selected));
                                                return item ? item.name : '';
                                            },
                                            IconComponent: KeyboardArrowDownIcon,
                                        }}
                                        InputProps={{
                                            style: { fontSize: '14px' },
                                        }}
                                    >
                                        <MenuItem value="">
                                            <em>None</em>
                                        </MenuItem>
                                        {filteredCategories.length > 0 &&
                                            filteredCategories.map((item, index) => (
                                                <MenuItem key={index} value={item.id}>
                                                    {item.name}
                                                </MenuItem>
                                            ))}
                                    </TextField>
                                </FormControl>
                            </Box>

                            {/* Authorized By */}
                            <Box mb={2}>
                                <Typography
                                    variant="body1"
                                    style={{
                                        marginBottom: '8px',
                                        color: '#333',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                    }}
                                >
                                    Selection Type
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <TextField
                                        select
                                        fullWidth
                                        name="subscriptionType"
                                        value={formData.subscriptionType}
                                        onChange={handleChange}
                                        placeholder="Choose type"
                                        variant="outlined"
                                        size="small"
                                        style={{ marginBottom: '8px' }}
                                        error={!!errors.subscriptionType}
                                        helperText={errors.subscriptionType}
                                        SelectProps={{
                                            displayEmpty: true,
                                            renderValue: (selected) => {
                                                if (!selected) {
                                                    return <span style={{ color: '#757575', fontSize: '14px' }}>Choose Type</span>;
                                                }
                                                const item = subscriptionTypes.find((item) => item.value == selected);
                                                return item ? item.label : '';
                                            },
                                            IconComponent: KeyboardArrowDownIcon,
                                        }}
                                        InputProps={{
                                            style: { fontSize: '14px' },
                                        }}
                                    >
                                        <MenuItem value="">
                                            <em>None</em>
                                        </MenuItem>
                                        {subscriptionTypes.map((item, index) => (
                                            <MenuItem key={index} value={item.value}>
                                                {item.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </FormControl>
                            </Box>

                            {/* Check-In Date and Time */}
                            <Box mb={2} className="d-flex gap-3">
                                <div style={{ flex: 1 }}>
                                    <Typography
                                        variant="body1"
                                        style={{
                                            marginBottom: '8px',
                                            color: '#333',
                                            fontSize: '14px',
                                            fontWeight: 500,
                                        }}
                                    >
                                        Start Date
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        placeholder="Default"
                                        variant="outlined"
                                        size="small"
                                        error={!!errors.startDate}
                                        helperText={errors.startDate}
                                        inputProps={{
                                            min: new Date().toISOString().split('T')[0], // Disable past dates
                                        }}
                                        InputProps={{
                                            style: { fontSize: '14px' },
                                        }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Typography
                                        variant="body1"
                                        style={{
                                            marginBottom: '8px',
                                            color: '#333',
                                            fontSize: '14px',
                                            fontWeight: 500,
                                        }}
                                    >
                                        Expire Date
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="expiryDate"
                                        type="date"
                                        value={formData.expiryDate}
                                        onChange={handleChange}
                                        placeholder="Default"
                                        variant="outlined"
                                        size="small"
                                        error={!!errors.expiryDate}
                                        helperText={errors.expiryDate}
                                        inputProps={{
                                            min: formData.startDate || new Date().toISOString().split('T')[0], // Disable past dates
                                        }}
                                    />
                                </div>
                            </Box>
                            {/* Action Buttons */}
                            <Box className="d-flex justify-content-between">
                                <Box
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        fontSize: '20px',
                                        fontWeight: 500,
                                        color: '#333',
                                    }}
                                >
                                    Total Amount: &nbsp;
                                    <span style={{ fontWeight: 'bold' }}>{formData.amount}</span>
                                </Box>
                                <Box className="d-flex justify-content-end">
                                    <Button
                                        variant="text"
                                        style={{
                                            marginRight: '10px',
                                            color: '#333',
                                            textTransform: 'none',
                                            fontSize: '14px',
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={loading}
                                        loading={loading}
                                        loadingPosition="start"
                                        style={{
                                            backgroundColor: '#003366',
                                            color: 'white',
                                            textTransform: 'none',
                                            fontSize: '14px',
                                            padding: '6px 16px',
                                        }}
                                    >
                                        Save & Next
                                    </Button>
                                </Box>
                            </Box>
                        </form>
                    </Paper>
                </div>
            </div>
        </>
    );
};

export default AddSubscriptionInformation;
