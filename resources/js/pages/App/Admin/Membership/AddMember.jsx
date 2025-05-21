import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { TextField, Button, Typography, Box, Paper, InputAdornment, IconButton, Select, styled, Grid, FormControl } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ArrowBack as ArrowBackIcon, KeyboardArrowDown as KeyboardArrowDownIcon, Delete as DeleteIcon } from '@mui/icons-material';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router } from '@inertiajs/react';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const AddMemberInformation = () => {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        duration: '',
        fee: '',
        maintenance_fee: '',
        discount: '',
        discount_authorized: '',
    });
    const [benefits, setBenefits] = useState([{ id: Date.now(), value: '' }]); // Use objects with unique IDs
    const [errors, setErrors] = useState({});

    const FormContainer = styled(Paper)(({ theme }) => ({
        padding: theme.spacing(3),
        maxWidth: 500,
        margin: '0 auto',
        borderRadius: 4,
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
    }));

    const FormField = styled(TextField)(({ theme }) => ({
        marginBottom: theme.spacing(2),
        '& .MuiOutlinedInput-root': {
            borderRadius: 4,
        },
    }));

    const ActionButton = styled(Button)(({ theme }) => ({
        borderRadius: 4,
        padding: theme.spacing(1, 3),
        textTransform: 'none',
        fontWeight: 500,
    }));

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleBenefitChange = (id, value) => {
        setBenefits((prev) => prev.map((benefit) => (benefit.id === id ? { ...benefit, value } : benefit)));
        setErrors((prev) => ({ ...prev, benefit: '' }));
    };

    const handleAddBenefit = () => {
        setBenefits((prev) => [...prev, { id: Date.now(), value: '' }]);
    };

    const handleRemoveBenefit = (id) => {
        const newBenefits = benefits.filter((benefit) => benefit.id !== id);
        setBenefits(newBenefits.length ? newBenefits : [{ id: Date.now(), value: '' }]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (formData.name.length > 255) newErrors.name = 'Name must not exceed 255 characters';
        if (benefits.every((b) => !b.value.trim())) newErrors.benefit = 'At least one benefit is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        router.post(
            '/members/member-types/store',
            { ...formData, benefit: benefits.map((b) => b.value).filter((b) => b.trim()) },
            {
                onSuccess: () => {
                    router.visit(route('member-types.index'));
                },
                onError: (errors) => {
                    setErrors(errors);
                },
            },
        );
    };

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
                            Add Membership Type
                        </Typography>
                    </div>

                    <FormContainer>
                        <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
                            <Box mb={2}>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Name of type
                                </Typography>
                                <FormField fullWidth placeholder="e.g: Affiliated" variant="outlined" size="small" name="name" value={formData.name} onChange={handleChange} error={!!errors.name} helperText={errors.name} />
                            </Box>

                            <Box mb={2}>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Duration
                                </Typography>
                                <FormField fullWidth placeholder="e.g: 1 Year" variant="outlined" size="small" name="duration" value={formData.duration} onChange={handleChange} error={!!errors.duration} helperText={errors.duration} />
                            </Box>

                            <Box mb={2}>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Fee
                                </Typography>
                                <FormField fullWidth placeholder="e.g: 15,000" variant="outlined" size="small" name="fee" value={formData.fee} onChange={handleChange} error={!!errors.fee} helperText={errors.fee} />
                            </Box>

                            <Box mb={2}>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Maintenance Fee
                                </Typography>
                                <FormField fullWidth placeholder="e.g: Monthly" variant="outlined" size="small" name="maintenance_fee" value={formData.maintenance_fee} onChange={handleChange} error={!!errors.maintenance_fee} helperText={errors.maintenance_fee} />
                            </Box>

                            <Grid container spacing={2} mb={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        Discount (Rs)
                                    </Typography>
                                    <FormField fullWidth placeholder="e.g: 30 Rs" variant="outlined" size="small" name="discount" value={formData.discount} onChange={handleChange} error={!!errors.discount} helperText={errors.discount} />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        Discount Authorized
                                    </Typography>
                                    <FormField fullWidth placeholder="e.g: 15" variant="outlined" size="small" name="discount_authorized" value={formData.discount_authorized} onChange={handleChange} error={!!errors.discount_authorized} helperText={errors.discount_authorized} />
                                </Grid>
                            </Grid>

                            <Box mb={3}>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Benefit
                                </Typography>
                                {benefits.map((benefit) => (
                                    <Box key={benefit.id} display="flex" alignItems="center" mb={1}>
                                        <FormField fullWidth placeholder={`e.g: Benefit ${benefits.indexOf(benefit) + 1}`} variant="outlined" size="small" value={benefit.value} onChange={(e) => handleBenefitChange(benefit.id, e.target.value)} error={!!errors.benefit} helperText={benefits.indexOf(benefit) === 0 ? errors.benefit : ''} />
                                        {benefits.length > 1 && (
                                            <IconButton size="small" onClick={() => handleRemoveBenefit(benefit.id)} sx={{ ml: 1 }}>
                                                <DeleteIcon />
                                            </IconButton>
                                        )}
                                    </Box>
                                ))}
                                <IconButton color="primary" onClick={handleAddBenefit} sx={{ mt: 1 }}>
                                    <AddIcon />
                                </IconButton>
                            </Box>

                            <Box display="flex" justifyContent="flex-end" gap={1}>
                                <ActionButton variant="outlined" color="inherit">
                                    Cancel
                                </ActionButton>
                                <ActionButton
                                    variant="contained"
                                    sx={{
                                        bgcolor: '#0a3d62',
                                        '&:hover': { bgcolor: '#0c2461' },
                                    }}
                                    type="submit"
                                >
                                    Create
                                </ActionButton>
                            </Box>
                        </Box>
                    </FormContainer>
                </div>
            </div>
        </>
    );
};

export default AddMemberInformation;
