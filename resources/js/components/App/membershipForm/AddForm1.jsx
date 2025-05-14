import { useState, useRef } from 'react';
import { TextField, Button, Select, MenuItem, FormControl, Paper, Typography, Grid, Box, IconButton, InputAdornment, OutlinedInput } from '@mui/material';
import { ArrowBack, Add, Delete, Edit, KeyboardArrowRight, KeyboardArrowDown } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';

const AddForm1 = ({ onNext }) => {
    const [memberImage, setMemberImage] = useState(null);
    const [showImageButtons, setShowImageButtons] = useState(false);
    // const [title, setTitle] = useState('');
    // const [gender, setGender] = useState('');
    const [titleOpen, setTitleOpen] = useState(false);
    const [genderOpen, setGenderOpen] = useState(false);
    const [dateError, setDateError] = useState(''); // New state for date validation
    const fileInputRef = useRef(null);
    // const [formData, setFormData] = useState({
    //     coaAccount: '',
    //     firstName: '',
    //     middleName: '',
    //     lastName: '',
    //     nameComments: '',
    //     fatherHusbandName: '',
    //     fatherMembershipNo: '',
    //     nationality: '',
    //     cnicNo: '',
    //     passportNo: '',
    //     ntn: '',
    //     dateOfBirth: '',
    //     education: '',
    //     membershipReason: '',
    // });
    const [title, setTitle] = useState('Mr');
    const [gender, setGender] = useState('Male');

    const [formData, setFormData] = useState({
        coaAccount: 'COA123456',
        firstName: '',
        middleName: '',
        lastName: '',
        nameComments: 'Preferred name: John W. Doe',
        fatherHusbandName: 'Michael Doe',
        fatherMembershipNo: 'MEM789',
        nationality: 'Pakistan',
        cnicNo: '4210112345678',
        passportNo: 'AB1234567',
        ntn: '1234567-8',
        dateOfBirth: '1990-05-15', // Changed to YYYY-MM-DD and past date
        education: 'Bachelor’s in Computer Science, University of Karachi, 2012',
        membershipReason: 'Interested in networking opportunities and professional development through the organization.',
    });

    const handleImageUpload = (event) => {
        if (event.target.files && event.target.files[0]) {
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

    const handleTitleChange = (event) => {
        setTitle(event.target.value);
        setTitleOpen(false);
    };

    const handleGenderChange = (event) => {
        setGender(event.target.value);
        setGenderOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Validate dateOfBirth
        if (name === 'dateOfBirth') {
            if (!value) {
                setDateError('Date of Birth is required');
                return;
            }
            const date = new Date(value);
            const today = new Date();
            if (isNaN(date.getTime())) {
                setDateError('Please enter a valid date');
            } else if (date > today) {
                setDateError('Date of Birth cannot be in the future');
            } else {
                setDateError('');
            }
        }
    };

    const handleSubmit = () => {
        // Basic validation
        const missingFields = [];
        if (!formData.coaAccount) missingFields.push('COA Account');
        if (!formData.firstName) missingFields.push('First Name');
        if (!formData.lastName) missingFields.push('Last Name');
        if (!formData.fatherHusbandName) missingFields.push('Father/Husband Name');
        if (!formData.cnicNo) missingFields.push('CNIC No');
        if (!formData.passportNo) missingFields.push('Passport No');
        if (!formData.dateOfBirth) missingFields.push('Date of Birth');

        if (missingFields.length > 0) {
            alert(`Please fill all required fields: ${missingFields.join(', ')}`);
            return;
        }

        if (dateError) {
            alert(dateError);
            return;
        }

        const dataToSave = {
            ...formData,
            title,
            gender,
            memberImage,
        };
        console.log('AddForm1 Data:', dataToSave); // Debug log

        onNext(dataToSave);
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
                                7171
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
                                <TextField fullWidth variant="outlined" placeholder="Enter to search" size="small" name="coaAccount" value={formData.coaAccount} onChange={handleInputChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                            </Grid>

                            {/* Title */}
                            <Grid item xs={6}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Title
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        open={titleOpen}
                                        onOpen={() => setTitleOpen(true)}
                                        onClose={() => setTitleOpen(false)}
                                        onClick={() => setTitleOpen(!titleOpen)}
                                        value={title}
                                        onChange={handleTitleChange}
                                        displayEmpty
                                        input={<OutlinedInput />}
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
                                <TextField fullWidth variant="outlined" placeholder="Enter first name" size="small" name="firstName" value={formData.firstName} onChange={handleInputChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                            </Grid>

                            {/* Middle Name */}
                            <Grid item xs={4}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Middle Name
                                </Typography>
                                <TextField fullWidth variant="outlined" placeholder="Enter middle name" size="small" name="middleName" value={formData.middleName} onChange={handleInputChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                            </Grid>

                            {/* Last Name */}
                            <Grid item xs={4}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Last Name*
                                </Typography>
                                <TextField fullWidth variant="outlined" placeholder="Enter last name" size="small" name="lastName" value={formData.lastName} onChange={handleInputChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                            </Grid>

                            {/* Name Comments */}
                            <Grid item xs={12}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Name Comments
                                </Typography>
                                <TextField fullWidth multiline rows={3} placeholder="Enter your comments" variant="outlined" size="small" name="nameComments" value={formData.nameComments} onChange={handleInputChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                            </Grid>

                            {/* Father/Husband Name */}
                            <Grid item xs={4}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Father/Husband Name*
                                </Typography>
                                <TextField fullWidth variant="outlined" placeholder="Enter name" size="small" name="fatherHusbandName" value={formData.fatherHusbandName} onChange={handleInputChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                            </Grid>

                            {/* Father Membership No */}
                            <Grid item xs={8}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    If father is a member then membership No
                                </Typography>
                                <TextField fullWidth variant="outlined" placeholder="Enter membership Number" size="small" name="fatherMembershipNo" value={formData.fatherMembershipNo} onChange={handleInputChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                            </Grid>
                        </Grid>

                        {/* Right Column */}
                        <Grid item xs={12} md={6} container spacing={3}>
                            {/* Nationality */}
                            <Grid item xs={6}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Nationality
                                </Typography>
                                <TextField fullWidth variant="outlined" placeholder="Enter Nationality e.g. Pakistan" size="small" name="nationality" value={formData.nationality} onChange={handleInputChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                            </Grid>

                            {/* CNIC No */}
                            <Grid item xs={6}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    CNIC No*
                                </Typography>
                                <TextField fullWidth variant="outlined" placeholder="Enter CNIC Number (13 digits)" size="small" name="cnicNo" value={formData.cnicNo} onChange={handleInputChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                            </Grid>

                            {/* Passport No */}
                            <Grid item xs={6}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Passport No*
                                </Typography>
                                <TextField fullWidth variant="outlined" placeholder="Enter passport number" size="small" name="passportNo" value={formData.passportNo} onChange={handleInputChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                            </Grid>

                            {/* Gender */}
                            <Grid item xs={6}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Gender
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        open={genderOpen}
                                        onOpen={() => setGenderOpen(true)}
                                        onClose={() => setGenderOpen(false)}
                                        onClick={() => setGenderOpen(!genderOpen)}
                                        value={gender}
                                        onChange={handleGenderChange}
                                        displayEmpty
                                        input={<OutlinedInput />}
                                        renderValue={(selected) => {
                                            if (!selected) {
                                                return 'Choose Gender';
                                            }
                                            return selected;
                                        }}
                                        IconComponent={() => <KeyboardArrowDown sx={{ position: 'absolute', right: 8, pointerEvents: 'none' }} />}
                                    >
                                        <MenuItem value="Male">Male</MenuItem>
                                        <MenuItem value="Female">Female</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* NTN */}
                            <Grid item xs={6}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    NTN (if any)
                                </Typography>
                                <TextField fullWidth variant="outlined" placeholder="Enter national NTN number" size="small" name="ntn" value={formData.ntn} onChange={handleInputChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                            </Grid>

                            {/* Date of Birth */}
                            <Grid item xs={6}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Date of Birth*
                                </Typography>
                                <TextField fullWidth type="date" InputLabelProps={{ shrink: true }} variant="outlined" size="small" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} error={!!dateError} helperText={dateError} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
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
                                    name="education"
                                    value={formData.education}
                                    onChange={handleInputChange}
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
                                <TextField fullWidth multiline rows={3} placeholder="Enter Detail" variant="outlined" size="small" name="membershipReason" value={formData.membershipReason} onChange={handleInputChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
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
