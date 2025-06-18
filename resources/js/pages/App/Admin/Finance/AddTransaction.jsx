import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    TextField,
    Button,
    Typography,
    Box,
    Paper,
    MenuItem,
    FormControl
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon
} from '@mui/icons-material';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import SearchIcon from '@mui/icons-material/Search';
import { router } from '@inertiajs/react';

const drawerWidthOpen = 260;
const drawerWidthClosed = 120;

// Define payment methods from financial_invoices table enum
const paymentMethods = ['cash', 'credit_card', 'bank', 'split_payment'];

// Define subscription types
const subscriptionTypes = [
    { label: 'One Time', value: 'one_time' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Annual', value: 'annual' },
];

const AddTransactionInformation = ({ categories2 }) => {
    const [open, setOpen] = useState(true);
    const today = new Date().toISOString().split('T')[0];

    // State for form fields
    const [formData, setFormData] = useState({
        customer: { id: 2, user_id: 1212, name: 'test2', email: 'test@example.com', phone: '1234567890' },
        guestName: 'test2',
        phone: '1234567890',
        category: '',
        subscriptionType: '',
        paymentType: '',
        startDate: today,
        expiryDate: '',
        amount: 0,
    });
    const [errors, setErrors] = useState({});

    // Calculate expiry date based on start date and subscription type
    const calculateExpiry = (startDate, type) => {
        const date = new Date(startDate);
        if (type === 'monthly') {
            date.setMonth(date.getMonth() + 1);
        } else if (type === 'annual') {
            date.setFullYear(date.getFullYear() + 1);
        } else {
            return '';
        }
        return date.toISOString().split('T')[0];
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        let updatedData = { ...formData, [name]: value };

        // Update expiry date for monthly/annual subscriptions
        if (name === 'subscriptionType') {
            if (value === 'one_time') {
                updatedData.expiryDate = '';
            } else if (value === 'monthly' && formData.startDate) {
                updatedData.expiryDate = calculateExpiry(formData.startDate, 'monthly');
            } else if (value === 'annual' && formData.startDate) {
                updatedData.expiryDate = calculateExpiry(formData.startDate, 'annual');
            }
        }

        // Update expiry date when start date changes
        if (name === 'startDate' && formData.subscriptionType !== 'one_time') {
            updatedData.expiryDate = calculateExpiry(value, formData.subscriptionType);
        }

        // Compute total amount based on category and subscription type
        const selectedCategory = categories2.find((cat) => cat.id === Number(name === 'category' ? value : formData.category));
        const subscriptionType = name === 'subscriptionType' ? value : formData.subscriptionType;

        if (selectedCategory && subscriptionType) {
            const baseFee = parseFloat(selectedCategory.fee || 0);
            const subFee = parseFloat(selectedCategory.subscription_fee || 0);

            if (subscriptionType === 'one_time') {
                updatedData.amount = baseFee;
            } else if (subscriptionType === 'monthly') {
                updatedData.amount = subFee;
            } else if (subscriptionType === 'annual') {
                updatedData.amount = subFee * 12;
            }
        }

        setFormData(updatedData);
    };

    // Update expiry date when subscription type or start date changes
    useEffect(() => {
        if (formData.startDate && formData.subscriptionType !== 'one_time') {
            const newExpiry = calculateExpiry(formData.startDate, formData.subscriptionType);
            setFormData((prev) => ({
                ...prev,
                expiryDate: newExpiry,
            }));
        }
    }, [formData.startDate, formData.subscriptionType]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Simple front-end validation
        const newErrors = {};
        if (!formData.guestName) newErrors.guestName = 'Name is required';
        if (!formData.phone) newErrors.phone = 'Contact number is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.subscriptionType) newErrors.subscriptionType = 'Selection type is required';
        if (!formData.paymentType) newErrors.paymentType = 'Payment type is required';
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (formData.subscriptionType !== 'one_time' && !formData.expiryDate) {
            newErrors.expiryDate = 'Expiry date is required';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            try {
                const response = await axios.post('/finance/add/transaction', formData);
                router.visit('/finance/dashboard');
                console.log('Transaction added successfully:', response.data);
                // Optionally redirect or reset form
                setFormData({
                    guestName: '',
                    phone: '',
                    category: '',
                    subscriptionType: '',
                    paymentType: '',
                    startDate: today,
                    expiryDate: '',
                    amount: 0,
                });
            } catch (error) {
                console.error('Error adding transaction:', error.response?.data || error.message);
                setErrors(error.response?.data?.errors || { general: 'Failed to add transaction' });
            }
        }
    };

    // Set up CSRF token for axios
    useEffect(() => {
        const token = document.querySelector('meta[name="csrf-token"]')?.content;
        if (token) {
            axios.defaults.headers.common['X-CSRF-Token'] = token;
        }
    }, []);

    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '2rem',
                    backgroundColor: '#F6F6F6',
                }}
            >
                <div
                    style={{
                        fontFamily: 'Arial, sans-serif',
                        padding: '20px',
                        backgroundColor: '#FFF',
                        minHeight: '100vh'
                    }}
                >
                    {/* Header with back button and title */}
                    <div className="d-flex align-items-center mb-4">
                        <ArrowBackIcon
                            onClick={() => window.history.back()}
                            style={{
                                cursor: 'pointer',
                                marginRight: '10px',
                                color: '#555',
                                fontSize: '24px'
                            }}
                        />
                        <Typography
                            variant="h5"
                            style={{
                                fontWeight: '600',
                                color: '#555',
                                fontSize: '24px'
                            }}
                        >
                            Add New Transaction
                        </Typography>
                    </div>

                    {/* Form Card */}
                    <Paper
                        elevation={1}
                        style={{
                            maxWidth: '630px',
                            margin: '0 auto',
                            padding: '30px',
                            borderRadius: '4px'
                        }}
                    >
                        <form onSubmit={handleSubmit}>
                            {/* Name and Contact Number */}
                            <div className="mb-3">
                                <div className="d-flex gap-3">
                                    <div style={{ flex: 1 }}>
                                        <Typography
                                            variant="body1"
                                            style={{
                                                marginBottom: '8px',
                                                color: '#333',
                                                fontSize: '14px',
                                                fontWeight: '500'
                                            }}
                                        >
                                            Name
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            name="guestName"
                                            value={formData.guestName}
                                            onChange={handleChange}
                                            placeholder="Enter Name"
                                            variant="outlined"
                                            size="small"
                                            style={{ marginBottom: '8px' }}
                                            // error={!!errors.guestName}
                                            // helperText={errors.guestName}
                                            InputProps={{
                                                style: { fontSize: '14px' }
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
                                                fontWeight: '500'
                                            }}
                                        >
                                            Contact Number
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Enter your contact number"
                                            variant="outlined"
                                            size="small"
                                            style={{ marginBottom: '8px' }}
                                            error={!!errors.phone}
                                            helperText={errors.phone}
                                            InputProps={{
                                                style: { fontSize: '14px' }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Category */}
                            <Box mb={1}>
                                <Typography
                                    variant="body1"
                                    style={{
                                        marginBottom: '8px',
                                        color: '#333',
                                        fontSize: '14px',
                                        fontWeight: 500
                                    }}
                                >
                                    Category
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <TextField
                                        select
                                        fullWidth
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        variant="outlined"
                                        size="small"
                                        style={{ marginBottom: '8px' }}
                                        error={!!errors.category}
                                        helperText={errors.category}
                                        SelectProps={{
                                            displayEmpty: true,
                                            renderValue: (selected) => {
                                                if (!selected) {
                                                    return <span style={{ color: '#757575', fontSize: '14px' }}>e.g. Select category</span>;
                                                }
                                                const item = categories2.find((item) => item.id === Number(selected));
                                                return item ? item.name : '';
                                            },
                                            IconComponent: KeyboardArrowDownIcon
                                        }}
                                        InputProps={{
                                            style: { fontSize: '14px' }
                                        }}
                                    >
                                        <MenuItem value="">
                                            <em>None</em>
                                        </MenuItem>
                                        {categories2.map((item) => (
                                            <MenuItem key={item.id} value={item.id}>
                                                {item.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </FormControl>
                            </Box>

                            {/* Selection Type */}
                            <Box mb={1}>
                                <Typography
                                    variant="body1"
                                    style={{
                                        marginBottom: '8px',
                                        color: '#333',
                                        fontSize: '14px',
                                        fontWeight: 500
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
                                                    return <span style={{ color: '#757575', fontSize: '14px' }}>e.g. Select type</span>;
                                                }
                                                const item = subscriptionTypes.find((item) => item.value === selected);
                                                return item ? item.label : '';
                                            },
                                            IconComponent: KeyboardArrowDownIcon
                                        }}
                                        InputProps={{
                                            style: { fontSize: '14px' }
                                        }}
                                    >
                                        <MenuItem value="">
                                            <em>None</em>
                                        </MenuItem>
                                        {subscriptionTypes.map((item) => (
                                            <MenuItem key={item.value} value={item.value}>
                                                {item.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </FormControl>
                            </Box>

                            {/* Payment Type */}
                            <Box mb={1}>
                                <Typography
                                    variant="body1"
                                    style={{
                                        marginBottom: '8px',
                                        color: '#333',
                                        fontSize: '14px',
                                        fontWeight: 500
                                    }}
                                >
                                    Payment Type
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <TextField
                                        select
                                        fullWidth
                                        name="paymentType"
                                        value={formData.paymentType}
                                        onChange={handleChange}
                                        placeholder="Choose type"
                                        variant="outlined"
                                        size="small"
                                        style={{ marginBottom: '8px' }}
                                        error={!!errors.paymentType}
                                        helperText={errors.paymentType}
                                        SelectProps={{
                                            displayEmpty: true,
                                            renderValue: (selected) => {
                                                if (!selected) {
                                                    return <span style={{ color: '#757575', fontSize: '14px' }}>e.g. Select payment type</span>;
                                                }
                                                return selected.replace('_', ' ').toUpperCase();
                                            },
                                            IconComponent: KeyboardArrowDownIcon
                                        }}
                                        InputProps={{
                                            style: { fontSize: '14px' }
                                        }}
                                    >
                                        <MenuItem value="">
                                            <em>None</em>
                                        </MenuItem>
                                        {paymentMethods.map((method) => (
                                            <MenuItem key={method} value={method}>
                                                {method.replace('_', ' ').toUpperCase()}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </FormControl>
                            </Box>

                            {/* Start Date and Expiry Date */}
                            <Box mb={2} className="d-flex gap-3">
                                <div style={{ flex: 1 }}>
                                    <Typography
                                        variant="body1"
                                        style={{
                                            marginBottom: '8px',
                                            color: '#333',
                                            fontSize: '14px',
                                            fontWeight: 500
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
                                        variant="outlined"
                                        size="small"
                                        error={!!errors.startDate}
                                        helperText={errors.startDate}
                                        inputProps={{
                                            min: today
                                        }}
                                        InputProps={{
                                            style: { fontSize: '14px' }
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
                                            fontWeight: 500
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
                                        variant="outlined"
                                        size="small"
                                        error={!!errors.expiryDate}
                                        helperText={errors.expiryDate}
                                        inputProps={{
                                            min: formData.startDate || today
                                        }}
                                        InputProps={{
                                            style: { fontSize: '14px' }
                                        }}
                                    />
                                </div>
                            </Box>

                            {/* Total Amount */}
                            <Box mb={1}>
                                <Typography
                                    variant="body1"
                                    style={{
                                        marginBottom: '8px',
                                        color: '#333',
                                        fontSize: '14px',
                                        fontWeight: 500
                                    }}
                                >
                                    Total Amount
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <TextField
                                        fullWidth
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        placeholder="Enter Amount"
                                        variant="outlined"
                                        size="small"
                                        style={{ marginBottom: '8px' }}
                                        error={!!errors.amount}
                                        helperText={errors.amount}
                                        InputProps={{
                                            style: { fontSize: '14px' }
                                        }}
                                    />
                                </FormControl>
                            </Box>

                            {/* Action Buttons */}
                            <Box className="d-flex justify-content-end">
                                <Button
                                    variant="text"
                                    style={{
                                        marginRight: '10px',
                                        color: '#333',
                                        textTransform: 'none',
                                        fontSize: '14px'
                                    }}
                                    onClick={() => window.history.back()}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    style={{
                                        backgroundColor: '#003366',
                                        color: 'white',
                                        textTransform: 'none',
                                        fontSize: '14px',
                                        padding: '6px 16px'
                                    }}
                                >
                                    Add Transaction
                                </Button>
                            </Box>
                        </form>
                    </Paper>
                </div>
            </div>
        </>
    );
};

export default AddTransactionInformation;
