import { useState, useRef } from 'react';
import { TextField, Button, Select, MenuItem, FormControl, Paper, Typography, Grid, Box, IconButton, InputAdornment, OutlinedInput } from '@mui/material';
import { ArrowBack, Add, Delete, Edit, KeyboardArrowRight, KeyboardArrowDown } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const AddForm1 = ({ setData, data, handleChange, onNext, userNo }) => {
    const [memberImage, setMemberImage] = useState(null);
    const [showImageButtons, setShowImageButtons] = useState(false);
    const [dateError, setDateError] = useState(''); // New state for date validation
    const fileInputRef = useRef(null);
    const [formErrors, setFormErrors] = useState({});

    const handleImageUpload = (event) => {
        if (event.target.files && event.target.files[0]) {
            setData((prev) => ({ ...prev, profile_photo: event.target.files[0] }));
            const reader = new FileReader();
            reader.onload = (e) => {
                setMemberImage(e.target.result);
                setShowImageButtons(true);
            };
            reader.readAsDataURL(event.target.files[0]);
        }
    };

    const handleDeleteImage = () => {
        setMemberImage(null);
        setShowImageButtons(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleChangeImage = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleSubmit = () => {
        const errors = {};

        if (!data.user_details.coa_account) errors.coa_account = 'COA Account is required';
        if (!data.first_name) errors.first_name = 'First Name is required';
        if (!data.last_name) errors.last_name = 'Last Name is required';
        if (!data.user_details.guardian_name) errors.guardian_name = 'Father/Husband Name is required';
        if (!data.user_details.nationality) errors.nationality = 'Nationality is required';
        if (!data.user_details.gender) errors.gender = 'Gender is required';
        if (!data.user_details.cnic_no) errors.cnic_no = 'CNIC No is required';
        if (!data.user_details.date_of_birth) errors.date_of_birth = 'Date of Birth is required';
        else if (dateError) errors.date_of_birth = dateError;

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
                <IconButton sx={{ color: '#000' }}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h5" component="h1" sx={{ ml: 1, fontWeight: 500, color: '#333' }}>
                    Personal Information
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
                            backgroundColor: '#2c3e50',
                            color: 'white',
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
                            backgroundColor: '#e0e0e0',
                            color: '#333',
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
            <Paper sx={{ p: 3, mb: 3, boxShadow: 'none' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                        Personal Information
                    </Typography>
                    <Box sx={{ borderBottom: '1px dashed #ccc', flexGrow: 1, ml: 2 }}></Box>
                </Box>

                <Grid container spacing={3}>
                    {/* Application Number */}
                    <Grid item xs={6}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: '#f5f5f5',
                                borderRadius: '8px',
                                padding: '12px 16px',
                                border: '1px solid #ddd',
                            }}
                        >
                            <Typography variant="body1" sx={{ color: '#777' }}>
                                Application Number :
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#0a2b4f' }}>
                                #{userNo}
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Two column layout */}
                    <Grid item xs={12} container spacing={3}>
                        {/* Left Column */}
                        <Grid item xs={12} md={6} container spacing={3}>
                            {/* Member Picture */}
                            <Grid item xs={12}>
                                <Box sx={{ mb: 1, display: 'flex', gap: '10px' }}>
                                    <Box
                                        sx={{
                                            border: '2px dashed #a5d8ff',
                                            borderRadius: '4px',
                                            width: 120,
                                            height: 120,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'relative',
                                            backgroundColor: memberImage ? 'transparent' : '#e6f7ff',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => !memberImage && fileInputRef.current?.click()}
                                    >
                                        {memberImage ? <img src={memberImage || '/placeholder.svg'} alt="Member" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Add sx={{ color: '#a5d8ff', fontSize: 30 }} />}
                                        <input type="file" hidden ref={fileInputRef} onChange={handleImageUpload} accept="image/*" />
                                    </Box>
                                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#666' }}>
                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            Member Picture
                                        </Typography>
                                        Click upload to profile picture (4 MB max)
                                    </Typography>
                                    {showImageButtons && (
                                        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                            <Button size="small" variant="outlined" startIcon={<Edit />} onClick={handleChangeImage} sx={{ textTransform: 'none', borderColor: '#ccc', color: '#333' }}>
                                                Change
                                            </Button>
                                            <Button size="small" variant="outlined" color="error" startIcon={<Delete />} onClick={handleDeleteImage} sx={{ textTransform: 'none' }}>
                                                Delete
                                            </Button>
                                        </Box>
                                    )}
                                </Box>
                            </Grid>

                            {/* COA Account */}
                            <Grid item xs={6}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    COA Account*
                                </Typography>
                                <TextField fullWidth variant="outlined" placeholder="Enter to search" size="small" name="user_details.coa_account" value={data.user_details.coa_account} error={!!formErrors.coa_account} helperText={formErrors.coa_account} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                            </Grid>

                            {/* Title */}
                            <Grid item xs={6}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Title
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        // open={titleOpen}
                                        // onOpen={() => setTitleOpen(true)}
                                        // onClose={() => setTitleOpen(false)}
                                        // onClick={() => setTitleOpen(!titleOpen)}
                                        value={data.user_details.title}
                                        name="user_details.title"
                                        onChange={handleChange}
                                        displayEmpty
                                        renderValue={(selected) => {
                                            if (!selected) {
                                                return 'Choose Option';
                                            }
                                            return selected;
                                        }}
                                        IconComponent={() => <KeyboardArrowDown sx={{ position: 'absolute', right: 8, pointerEvents: 'none' }} />}
                                    >
                                        <MenuItem value="Mr">Mr.</MenuItem>
                                        <MenuItem value="Mrs">Mrs.</MenuItem>
                                        <MenuItem value="Ms">Ms.</MenuItem>
                                        <MenuItem value="Dr">Dr.</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* First Name */}
                            <Grid item xs={4}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    First Name*
                                </Typography>
                                <TextField fullWidth variant="outlined" placeholder="Enter first name" size="small" name="first_name" value={data.first_name} error={!!formErrors.first_name} helperText={formErrors.first_name} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                            </Grid>

                            {/* Middle Name */}
                            <Grid item xs={4}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Middle Name
                                </Typography>
                                <TextField fullWidth variant="outlined" placeholder="Enter middle name" size="small" name="middle_name" value={data.middle_name} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                            </Grid>

                            {/* Last Name */}
                            <Grid item xs={4}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Last Name*
                                </Typography>
                                <TextField fullWidth variant="outlined" placeholder="Enter last name" size="small" name="last_name" value={data.last_name} error={!!formErrors.last_name} helperText={formErrors.last_name} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                            </Grid>

                            {/* Name Comments */}
                            <Grid item xs={12}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Name Comments
                                </Typography>
                                <TextField fullWidth multiline rows={3} placeholder="Enter your comments" variant="outlined" size="small" name="user_details.name_comments" value={data.user_details.name_comments} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                            </Grid>

                            {/* Father/Husband Name */}
                            <Grid item xs={4}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Father/Husband Name*
                                </Typography>
                                <TextField fullWidth variant="outlined" placeholder="Enter name" size="small" name="user_details.guardian_name" value={data.user_details.guardian_name} error={!!formErrors.guardian_name} helperText={formErrors.guardian_name} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                            </Grid>

                            {/* Father Membership No */}
                            <Grid item xs={8}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    If father is a member then membership No
                                </Typography>
                                <TextField fullWidth variant="outlined" placeholder="Enter membership Number" size="small" name="user_details.guardian_membership" value={data.user_details.fatherMembershipNo} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                            </Grid>
                        </Grid>

                        {/* Right Column */}
                        <Grid item xs={12} md={6} container spacing={3}>
                            {/* Nationality */}
                            <Grid item xs={6}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Nationality*
                                </Typography>
                                <TextField fullWidth variant="outlined" placeholder="Enter Nationality e.g. Pakistan" size="small" name="user_details.nationality" value={data.user_details.nationality} error={!!formErrors.nationality} helperText={formErrors.nationality} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                            </Grid>

                            {/* CNIC No */}
                            <Grid item xs={6}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    CNIC No*
                                </Typography>
                                <TextField fullWidth variant="outlined" type="number" placeholder="Enter CNIC Number (13 digits)" size="small" name="user_details.cnic_no" value={data.user_details.cnic_no} error={!!formErrors.cnic_no} helperText={formErrors.cnic_no} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                            </Grid>

                            {/* Passport No */}
                            <Grid item xs={6}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Passport No
                                </Typography>
                                <TextField fullWidth variant="outlined" placeholder="Enter passport number" size="small" name="user_details.passport_no" value={data.user_details.passport_no} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                            </Grid>

                            {/* Gender */}
                            <Grid item xs={6}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Gender
                                </Typography>
                                <FormControl fullWidth size="small" error={!!formErrors.gender}>
                                    <Select
                                        value={data.user_details.gender || ''}
                                        name="user_details.gender"
                                        onChange={handleChange}
                                        displayEmpty
                                        renderValue={(selected) => {
                                            if (!selected) {
                                                return 'Choose Gender';
                                            }
                                            return selected;
                                        }}
                                        inputProps={{ 'aria-label': 'Without label' }}
                                        IconComponent={() => <KeyboardArrowDown sx={{ position: 'absolute', right: 8, pointerEvents: 'none' }} />}
                                    >
                                        <MenuItem value="" disabled>
                                            Choose Gender
                                        </MenuItem>
                                        <MenuItem value="Male">Male</MenuItem>
                                        <MenuItem value="Female">Female</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                    {formErrors.gender && (
                                        <Typography variant="caption" color="error">
                                            {formErrors.gender}
                                        </Typography>
                                    )}
                                </FormControl>
                            </Grid>

                            {/* NTN */}
                            <Grid item xs={6}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    NTN (if any)
                                </Typography>
                                <TextField fullWidth variant="outlined" placeholder="Enter national NTN number" size="small" name="user_details.ntn" value={data.user_details.ntn} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                            </Grid>

                            {/* Date of Birth */}
                            <Grid item xs={6}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Date of Birth*
                                </Typography>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Date of Birth"
                                        format="YYYY-MM-DD"
                                        value={data.user_details.date_of_birth ? dayjs(data.user_details.date_of_birth) : null}
                                        onChange={(newValue) =>
                                            handleChange({
                                                target: {
                                                    name: 'user_details.date_of_birth',
                                                    value: newValue ? newValue.format('YYYY-MM-DD') : '',
                                                },
                                            })
                                        }
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                variant: 'outlined',
                                                size: 'small',
                                                name: 'user_details.date_of_birth',
                                                error: !!formErrors.date_of_birth || !!dateError,
                                                helperText: formErrors.date_of_birth || dateError,
                                                sx: { '& .MuiOutlinedInput-root': { borderRadius: '4px' } },
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>

                            {/* Education */}
                            <Grid item xs={12}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Education
                                </Typography>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Enter complete education of the applicant"
                                    size="small"
                                    name="user_details.education"
                                    value={data.user_details.education}
                                    onChange={handleChange}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton edge="end" sx={{ color: '#666' }}>
                                                    <KeyboardArrowRight />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            {/* Reason for Seeking Membership */}
                            <Grid item xs={12}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Reason for Seeking Membership
                                </Typography>
                                <TextField fullWidth multiline rows={3} placeholder="Enter Detail" variant="outlined" size="small" name="user_details.membership_reason" value={data.user_details.membership_reason} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                    variant="outlined"
                    sx={{
                        textTransform: 'none',
                        borderColor: '#ccc',
                        color: '#333',
                        '&:hover': { borderColor: '#999', backgroundColor: '#f5f5f5' },
                    }}
                >
                    Cancel
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
        </div>
    );
};

export default AddForm1;
