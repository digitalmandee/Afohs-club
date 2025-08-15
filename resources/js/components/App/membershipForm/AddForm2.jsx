import { useState } from 'react';
import { TextField, Button, Paper, Typography, Grid, Box, IconButton, Checkbox, FormControlLabel, Autocomplete } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import { countries } from '@/constants/countries';

const AddForm2 = ({ data, handleChange, onNext, onBack, setSameAsCurrent, sameAsCurrent }) => {
    const [formErrors, setFormErrors] = useState({});

    const handleSameAddress = (e) => {
        const checked = e.target.checked;
        setSameAsCurrent(checked);

        if (checked) {
            handleChange({
                target: {
                    name: 'permanent_address',
                    value: data.current_address || '',
                },
            });
            handleChange({
                target: {
                    name: 'permanent_city',
                    value: data.current_city || '',
                },
            });
            handleChange({
                target: {
                    name: 'permanent_country',
                    value: data.current_country || '',
                },
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission
        // Basic validation
        const errors = {};
        if (!data.mobile_number_a) errors.mobile_number_a = 'Mobile Number (A) is required';
        // if (!data.personal_email) errors.personal_email = 'Personal Email is required';
        if (!data.current_address) errors.current_address = 'Address is required';
        if (!data.current_city) errors.current_city = 'City is required';
        if (!data.current_country) errors.current_country = 'Country is required';

        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            return; // Stop submission if errors exist
        }

        onNext();
    };

    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '20px' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
                <IconButton onClick={onBack} sx={{ color: '#000' }}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h5" component="h1" sx={{ ml: 1, fontWeight: 500, color: '#333' }}>
                    Contact Information
                </Typography>
            </Box>

            {/* Progress Steps */}
            <Paper
                elevation={0}
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    mb: 3,
                    backgroundColor: '#f0f0f0',
                    borderRadius: '4px',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                        sx={{
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            backgroundColor: '#e0e0e0',
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                        }}
                    >
                        1
                    </Box>
                    <Typography sx={{ fontWeight: 500 }}>Personal Information</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                        sx={{
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            backgroundColor: '#2c3e50',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                        }}
                    >
                        2
                    </Box>
                    <Typography sx={{ fontWeight: 500 }}>Contact Information</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                        sx={{
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            backgroundColor: '#e0e0e0',
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                        }}
                    >
                        3
                    </Box>
                    <Typography sx={{ fontWeight: 500 }}>Membership Information</Typography>
                </Box>
            </Paper>

            {/* Main Form */}
            <form>
                <Grid container>
                    {/* Contact Information Section */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, mb: 3, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" component="h2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                    Contact Information
                                </Typography>
                                <Box sx={{ borderBottom: '1px dashed #ccc', flexGrow: 1, ml: 2 }}></Box>
                            </Box>

                            <Grid container spacing={3}>
                                {/* Mobile Number (A) */}
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        Mobile Number (A)*
                                    </Typography>
                                    <TextField fullWidth variant="outlined" type="number" placeholder="03XXXXXXXX" size="small" name="mobile_number_a" value={data.mobile_number_a} error={!!formErrors.mobile_number_a} helperText={formErrors.mobile_number_a} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                                </Grid>

                                {/* Mobile Number (B) */}
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        Mobile Number (B)
                                    </Typography>
                                    <TextField fullWidth variant="outlined" type="number" placeholder="03XXXXXXXX" size="small" name="mobile_number_b" value={data.mobile_number_b} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                                </Grid>

                                {/* Mobile Number (C) */}
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        Mobile Number (C)
                                    </Typography>
                                    <TextField fullWidth variant="outlined" type="number" placeholder="03XXXXXXXX" size="small" name="mobile_number_c" value={data.mobile_number_c} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                                </Grid>

                                {/* Telephone Number */}
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        Telephone Number
                                    </Typography>
                                    <TextField fullWidth variant="outlined" type="number" placeholder="Enter telephone number" size="small" name="telephone_number" value={data.telephone_number} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                                </Grid>

                                {/* Personal Email */}
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        Personal Email*
                                    </Typography>
                                    <TextField fullWidth variant="outlined" type="email" placeholder="member1@gmail.com" size="small" name="personal_email" value={data.personal_email} error={!!formErrors.personal_email} helperText={formErrors.personal_email} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                                </Grid>

                                {/* Critical Email */}
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        Critical Email
                                    </Typography>
                                    <TextField fullWidth variant="outlined" placeholder="member2@gmail.com" size="small" name="critical_email" value={data.critical_email} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                                </Grid>
                            </Grid>

                            {/* In Case of Emergency Section */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, mt: 3 }}>
                                <Typography variant="h6" component="h2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                    In Case of Emergency
                                </Typography>
                                <Box sx={{ borderBottom: '1px dashed #ccc', flexGrow: 1, ml: 2 }}></Box>
                            </Box>

                            <Grid container spacing={3}>
                                {/* Name */}
                                <Grid item xs={12}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        Name
                                    </Typography>
                                    <TextField fullWidth variant="outlined" placeholder="Enter Full Name" size="small" name="emergency_name" value={data.emergency_name} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                                </Grid>

                                {/* Relation */}
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        Relation
                                    </Typography>
                                    <TextField fullWidth variant="outlined" placeholder="Enter Relationship" size="small" name="emergency_relation" value={data.emergency_relation} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                                </Grid>

                                {/* Contact Number */}
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        Contact Number
                                    </Typography>
                                    <TextField fullWidth type="number" variant="outlined" placeholder="03XXXXXXXX" size="small" name="emergency_contact" value={data.emergency_contact} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Current Address and Permanent Address Sections */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, mb: 3, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                            {/* Current Address Section */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" component="h2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                    Current Address
                                </Typography>
                                <Box sx={{ borderBottom: '1px dashed #ccc', flexGrow: 1, ml: 2 }}></Box>
                            </Box>

                            <Grid container spacing={3}>
                                {/* Address */}
                                <Grid item xs={12}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        Address*
                                    </Typography>
                                    <TextField fullWidth variant="outlined" placeholder="Enter complete address" size="small" name="current_address" value={data.current_address} error={!!formErrors.current_address} helperText={formErrors.current_address} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                                </Grid>

                                {/* City */}
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        City*
                                    </Typography>
                                    <TextField fullWidth variant="outlined" placeholder="Enter city name" size="small" name="current_city" value={data.current_city} error={!!formErrors.current_city} helperText={formErrors.current_city} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                                </Grid>

                                {/* Country */}
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        Country*
                                    </Typography>
                                    <Autocomplete
                                        size="small"
                                        fullWidth
                                        options={countries}
                                        getOptionLabel={(option) => option.label}
                                        value={countries.find((c) => c.label === data.current_country) || null}
                                        onChange={(e, newValue) => {
                                            handleChange({
                                                target: {
                                                    name: 'current_country',
                                                    value: newValue ? newValue.label : '',
                                                },
                                            });
                                        }}
                                        renderInput={(params) => <TextField {...params} label="Country*" error={!!formErrors.current_country} helperText={formErrors.current_country} />}
                                    />
                                </Grid>
                            </Grid>

                            {/* Permanent Address Section */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, mt: 3 }}>
                                <Typography variant="h6" component="h2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                    Permanent Address
                                </Typography>
                                <Box sx={{ borderBottom: '1px dashed #ccc', flexGrow: 1, ml: 2 }}></Box>
                                <Box>
                                    <FormControlLabel control={<Checkbox checked={sameAsCurrent} onChange={handleSameAddress} />} label="Same as Current Address" />
                                </Box>
                            </Box>

                            <Grid container spacing={3}>
                                {/* Address */}
                                <Grid item xs={12}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        Address
                                    </Typography>
                                    <TextField fullWidth variant="outlined" placeholder="Enter complete address" size="small" name="permanent_address" value={data.permanent_address} onChange={handleChange} disabled={sameAsCurrent} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                                </Grid>

                                {/* City */}
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        City
                                    </Typography>
                                    <TextField fullWidth variant="outlined" placeholder="Enter city name" size="small" name="permanent_city" value={data.permanent_city} onChange={handleChange} disabled={sameAsCurrent} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                                </Grid>

                                {/* Country */}
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        Country
                                    </Typography>
                                    <Autocomplete
                                        size="small"
                                        fullWidth
                                        options={countries}
                                        getOptionLabel={(option) => option.label}
                                        value={countries.find((c) => c.label === data.permanent_country) || null}
                                        onChange={(e, newValue) => {
                                            handleChange({
                                                target: {
                                                    name: 'permanent_country',
                                                    value: newValue ? newValue.label : '',
                                                },
                                            });
                                        }}
                                        disabled={sameAsCurrent}
                                        renderInput={(params) => <TextField {...params} label="Country" />}
                                    />
                                </Grid>
                            </Grid>

                            {/* Action Buttons */}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 3, mt: 4 }}>
                                <Button
                                    variant="outlined"
                                    sx={{
                                        textTransform: 'none',
                                        borderColor: '#ccc',
                                        color: '#333',
                                        '&:hover': { borderColor: '#999', backgroundColor: '#f5f5f5' },
                                    }}
                                    onClick={onBack}
                                >
                                    Back
                                </Button>
                                <Button
                                    variant="contained"
                                    sx={{
                                        textTransform: 'none',
                                        backgroundColor: '#0c4b6e',
                                        '&:hover': { backgroundColor: '#083854' },
                                    }}
                                    onClick={handleSubmit}
                                >
                                    Save & Next
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </form>
        </div>
    );
};

export default AddForm2;
