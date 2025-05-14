import { useState } from 'react';
import { Box, Button, Container, FormControl, Grid, IconButton, MenuItem, Radio, Select, TextField, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router } from '@inertiajs/react';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const AddForm3 = ({ onSubmit, onBack }) => {
    const [open, setOpen] = useState(false);
    const [memberType, setMemberType] = useState('Silver');
    const [showFamilyMemberForm, setShowFamilyMemberForm] = useState(false);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [currentFamilyMember, setCurrentFamilyMember] = useState({
        fullName: 'Ayesha Khan',
        relation: 'Mother',
        cnic: '42201-1234567-0',
        phoneNumber: '03451234567',
        email: 'ayesha.khan@example.com',
        membershipType: 'Silver',
        membershipCategory: 'Family',
        startDate: '2025-04-15',
        endDate: '2026-04-15',
        picture: null,
        picturePreview: 'https://via.placeholder.com/150',
    });

    const [membershipData, setMembershipData] = useState({
        membershipCategory: 'Family',
        membershipNumber: 'FM-2025-001',
        membershipDate: '2025-05-01',
        statusOfCard: 'Active',
        cardIssueDate: '2025-05-01',
        cardExpiryDate: '2026-05-01',
        fromDate: '2025-05-01',
        toDate: '2026-05-01',
        password: '',
        password_confirmation: '',
    });

    const [submitError, setSubmitError] = useState('');

    const handleMemberTypeChange = (event) => {
        setMemberType(event.target.value);
    };

    const handleMembershipDataChange = (e) => {
        const { name, value } = e.target;
        setMembershipData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFamilyMemberChange = (field, value) => {
        setCurrentFamilyMember({
            ...currentFamilyMember,
            [field]: value,
        });
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCurrentFamilyMember({
                    ...currentFamilyMember,
                    picture: file,
                    picturePreview: reader.result,
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddFamilyMember = () => {
        if (!currentFamilyMember.fullName || !currentFamilyMember.relation || !currentFamilyMember.email) {
            alert('Please fill required family member fields: Full Name, Relation, and Email');
            return;
        }
        setFamilyMembers([...familyMembers, currentFamilyMember]);
        setCurrentFamilyMember({
            fullName: '',
            relation: '',
            cnic: '',
            phoneNumber: '',
            email: '',
            membershipType: '',
            membershipCategory: '',
            startDate: '',
            endDate: '',
            picture: null,
            picturePreview: null,
        });
        setShowFamilyMemberForm(false);
    };

    const handleDeleteFamilyMember = (index) => {
        const updatedMembers = [...familyMembers];
        updatedMembers.splice(index, 1);
        setFamilyMembers(updatedMembers);
    };

    const handleEditFamilyMember = (index) => {
        setCurrentFamilyMember(familyMembers[index]);
        handleDeleteFamilyMember(index);
        setShowFamilyMemberForm(true);
    };

    const handleSubmit = async () => {
        const missingFields = [];
        if (!membershipData.membershipNumber) missingFields.push('Membership Number');
        if (!membershipData.membershipDate) missingFields.push('Membership Date');
        if (!membershipData.password) missingFields.push('Password');
        if (!membershipData.password_confirmation) missingFields.push('Password Confirmation');

        if (missingFields.length > 0) {
            alert(`Please fill all required fields: ${missingFields.join(', ')}`);
            return;
        }

        const dataToSave = {
            memberType,
            ...membershipData,
            familyMembers,
            password: membershipData.password,
            password_confirmation: membershipData.password_confirmation,
        };
        console.log('AddForm3 Data:', dataToSave);

        try {
            await onSubmit(dataToSave);
            setSubmitError('');
        } catch (error) {
            console.error('Submission Error:', error);
            const errorMessage = error.response?.data?.message || JSON.stringify(error.response?.data || 'An error occurred during submission');
            setSubmitError(`Submission failed: ${errorMessage}. Please check the Personal Information form for errors (e.g., Date of Birth).`);
        }
    };

    return (
        <>
            <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '20px' }}>
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
                        <IconButton onClick={onBack} sx={{ color: '#000' }}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h5" component="h1" sx={{ ml: 1, fontWeight: 500, color: '#333' }}>
                            Membership Information
                        </Typography>
                    </Box>

                    <Box
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
                                <CheckCircleIcon fontSize="small" />
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
                                <CheckCircleIcon fontSize="small" />
                            </Box>
                            <Typography sx={{ fontWeight: 500 }}>Contact Information</Typography>
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
                                3
                            </Box>
                            <Typography sx={{ fontWeight: 500 }}>Membership Information</Typography>
                        </Box>
                    </Box>

                    {submitError && (
                        <Box sx={{ mb: 2, p: 2, bgcolor: '#ffebee', borderRadius: '4px', border: '1px solid #ef5350' }}>
                            <Typography variant="body2" sx={{ color: '#d32f2f' }}>
                                {submitError}
                            </Typography>
                        </Box>
                    )}

                    <Box sx={{ p: 3, bgcolor: '#FFFFFF', border: '1px solid #e0e0e0' }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="h6" component="h2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                        Membership Information
                                    </Typography>
                                    <Box sx={{ borderBottom: '1px dashed #ccc', flexGrow: 1, ml: 2 }}></Box>
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <Typography sx={{ mb: 1, fontWeight: 500 }}>Password *</Typography>
                                    <TextField
                                        fullWidth
                                        type="password"
                                        placeholder="Enter password"
                                        variant="outlined"
                                        name="password"
                                        value={membershipData.password}
                                        onChange={handleMembershipDataChange}
                                        sx={{
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#ccc',
                                            },
                                        }}
                                    />
                                </Box>
                                <Box sx={{ mb: 3 }}>
                                    <Typography sx={{ mb: 1, fontWeight: 500 }}>Confirm Password *</Typography>
                                    <TextField
                                        fullWidth
                                        type="password"
                                        placeholder="Confirm password"
                                        variant="outlined"
                                        name="password_confirmation"
                                        value={membershipData.password_confirmation}
                                        onChange={handleMembershipDataChange}
                                        sx={{
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#ccc',
                                            },
                                        }}
                                    />
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <Typography sx={{ mb: 1, fontWeight: 500 }}>Member Type</Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6} sm={6}>
                                            <Box
                                                sx={{
                                                    border: '1px solid #ccc',
                                                    borderRadius: 1,
                                                    p: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    bgcolor: memberType === 'Silver' ? '#fff' : 'transparent',
                                                }}
                                            >
                                                <Radio checked={memberType === 'Silver'} onChange={handleMemberTypeChange} value="Silver" name="member-type" sx={{ color: '#1976d2' }} />
                                                <Typography>Silver</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6} sm={6}>
                                            <Box
                                                sx={{
                                                    border: '1px solid #ccc',
                                                    borderRadius: 1,
                                                    p: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    bgcolor: memberType === 'Gold' ? '#fff' : 'transparent',
                                                }}
                                            >
                                                <Radio checked={memberType === 'Gold'} onChange={handleMemberTypeChange} value="Gold" name="member-type" sx={{ color: '#1976d2' }} />
                                                <Typography>Gold</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6} sm={6}>
                                            <Box
                                                sx={{
                                                    border: '1px solid #ccc',
                                                    borderRadius: 1,
                                                    p: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    bgcolor: memberType === 'Corporate Member' ? '#fff' : 'transparent',
                                                }}
                                            >
                                                <Radio checked={memberType === 'Corporate Member'} onChange={handleMemberTypeChange} value="Corporate Member" name="member-type" sx={{ color: '#1976d2' }} />
                                                <Typography>Corporate Member</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6} sm={6}>
                                            <Box
                                                sx={{
                                                    border: '1px solid #ccc',
                                                    borderRadius: 1,
                                                    p: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    bgcolor: memberType === 'Applied Member' ? '#fff' : 'transparent',
                                                }}
                                            >
                                                <Radio checked={memberType === 'Applied Member'} onChange={handleMemberTypeChange} value="Applied Member" name="member-type" sx={{ color: '#1976d2' }} />
                                                <Typography>Applied Member</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6} sm={6}>
                                            <Box
                                                sx={{
                                                    border: '1px solid #ccc',
                                                    borderRadius: 1,
                                                    p: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    bgcolor: memberType === 'Affiliated Member' ? '#fff' : 'transparent',
                                                }}
                                            >
                                                <Radio checked={memberType === 'Affiliated Member'} onChange={handleMemberTypeChange} value="Affiliated Member" name="member-type" sx={{ color: '#1976d2' }} />
                                                <Typography>Affiliated Member</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6} sm={6}>
                                            <Box
                                                sx={{
                                                    border: '1px solid #ccc',
                                                    borderRadius: 1,
                                                    p: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    bgcolor: memberType === 'VIP Guest' ? '#fff' : 'transparent',
                                                }}
                                            >
                                                <Radio checked={memberType === 'VIP Guest'} onChange={handleMemberTypeChange} value="VIP Guest" name="member-type" sx={{ color: '#1976d2' }} />
                                                <Typography>VIP Guest</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6} sm={6}>
                                            <Box
                                                sx={{
                                                    border: '1px solid #ccc',
                                                    borderRadius: 1,
                                                    p: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    bgcolor: memberType === 'Employee' ? '#fff' : 'transparent',
                                                }}
                                            >
                                                <Radio checked={memberType === 'Employee'} onChange={handleMemberTypeChange} value="Employee" name="member-type" sx={{ color: '#1976d2' }} />
                                                <Typography>Employee</Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <Typography sx={{ mb: 1, fontWeight: 500 }}>Membership Category</Typography>
                                    <FormControl fullWidth variant="outlined">
                                        <Select
                                            name="membershipCategory"
                                            value={membershipData.membershipCategory}
                                            onChange={handleMembershipDataChange}
                                            displayEmpty
                                            renderValue={(selected) => {
                                                if (!selected) {
                                                    return <Typography sx={{ color: '#757575' }}>Choose Category</Typography>;
                                                }
                                                return selected;
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#ccc',
                                                },
                                            }}
                                        >
                                            <MenuItem value="Category 1">Category 1</MenuItem>
                                            <MenuItem value="Category 2">Category 2</MenuItem>
                                            <MenuItem value="Category 3">Category 3</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <Typography sx={{ mb: 1, fontWeight: 500 }}>Membership Number *</Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="Enter membership number"
                                        variant="outlined"
                                        name="membershipNumber"
                                        value={membershipData.membershipNumber}
                                        onChange={handleMembershipDataChange}
                                        sx={{
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#ccc',
                                            },
                                        }}
                                    />
                                </Box>

                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Box sx={{ mb: 3 }}>
                                            <Typography sx={{ mb: 1, fontWeight: 500 }}>Membership Date *</Typography>
                                            <TextField
                                                fullWidth
                                                type="date"
                                                InputLabelProps={{ shrink: true }}
                                                placeholder="dd/mm/yyyy"
                                                variant="outlined"
                                                name="membershipDate"
                                                value={membershipData.membershipDate}
                                                onChange={handleMembershipDataChange}
                                                sx={{
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#ccc',
                                                    },
                                                }}
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Box sx={{ mb: 3 }}>
                                            <Typography sx={{ mb: 1, fontWeight: 500 }}>Status of Card</Typography>
                                            <FormControl fullWidth variant="outlined">
                                                <Select
                                                    name="statusOfCard"
                                                    value={membershipData.statusOfCard}
                                                    onChange={handleMembershipDataChange}
                                                    displayEmpty
                                                    renderValue={(selected) => {
                                                        if (!selected) {
                                                            return <Typography sx={{ color: '#757575' }}>Choose Status</Typography>;
                                                        }
                                                        return selected;
                                                    }}
                                                    sx={{
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#ccc',
                                                        },
                                                    }}
                                                >
                                                    <MenuItem value="Active">Active</MenuItem>
                                                    <MenuItem value="Inactive">Inactive</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Box>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Box sx={{ mb: 3 }}>
                                            <Typography sx={{ mb: 1, fontWeight: 500 }}>Card Issue Date</Typography>
                                            <TextField
                                                fullWidth
                                                type="date"
                                                InputLabelProps={{ shrink: true }}
                                                placeholder="dd/mm/yyyy"
                                                variant="outlined"
                                                name="cardIssueDate"
                                                value={membershipData.cardIssueDate}
                                                onChange={handleMembershipDataChange}
                                                sx={{
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#ccc',
                                                    },
                                                }}
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Box sx={{ mb: 3 }}>
                                            <Typography sx={{ mb: 1, fontWeight: 500 }}>Card Expiry Date</Typography>
                                            <TextField
                                                fullWidth
                                                type="date"
                                                InputLabelProps={{ shrink: true }}
                                                placeholder="dd/mm/yyyy"
                                                variant="outlined"
                                                name="cardExpiryDate"
                                                value={membershipData.cardExpiryDate}
                                                onChange={handleMembershipDataChange}
                                                sx={{
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#ccc',
                                                    },
                                                }}
                                            />
                                        </Box>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Box sx={{ mb: 3 }}>
                                            <Typography sx={{ mb: 1, fontWeight: 500 }}>From</Typography>
                                            <TextField
                                                fullWidth
                                                type="date"
                                                InputLabelProps={{ shrink: true }}
                                                placeholder="dd/mm/yyyy"
                                                variant="outlined"
                                                name="fromDate"
                                                value={membershipData.fromDate}
                                                onChange={handleMembershipDataChange}
                                                sx={{
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#ccc',
                                                    },
                                                }}
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Box sx={{ mb: 3 }}>
                                            <Typography sx={{ mb: 1, fontWeight: 500 }}>To</Typography>
                                            <TextField
                                                fullWidth
                                                type="date"
                                                InputLabelProps={{ shrink: true }}
                                                placeholder="dd/mm/yyyy"
                                                variant="outlined"
                                                name="toDate"
                                                value={membershipData.toDate}
                                                onChange={handleMembershipDataChange}
                                                sx={{
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#ccc',
                                                    },
                                                }}
                                            />
                                        </Box>
                                    </Grid>
                                </Grid>

                                <Button
                                    variant="contained"
                                    sx={{
                                        mt: 2,
                                        bgcolor: showFamilyMemberForm ? '#90caf9' : '#e3f2fd',
                                        color: '#000',
                                        textTransform: 'none',
                                        '&:hover': {
                                            bgcolor: '#90caf9',
                                        },
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        width: '100%',
                                        py: 1.5,
                                    }}
                                    onClick={() => setShowFamilyMemberForm(true)}
                                >
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                        <Typography sx={{ fontWeight: 500 }}>Add Family Member</Typography>
                                        <Typography variant="body2" sx={{ color: '#666' }}>
                                            If you add family members then click
                                        </Typography>
                                    </Box>
                                    <ChevronRightIcon />
                                </Button>

                                {familyMembers.length > 0 && (
                                    <Box sx={{ mt: 3 }}>
                                        <Typography sx={{ mb: 1, fontWeight: 500 }}>Added Family Members</Typography>
                                        {familyMembers.map((member, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    p: 1,
                                                    border: '1px solid #ccc',
                                                    borderRadius: 1,
                                                    mb: 1,
                                                }}
                                            >
                                                <Typography>
                                                    {member.fullName} ({member.relation})
                                                </Typography>
                                                <Box>
                                                    <IconButton size="small" onClick={() => handleEditFamilyMember(index)} sx={{ mr: 1 }}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={() => handleDeleteFamilyMember(index)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Grid>

                            {showFamilyMemberForm && (
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                        <Typography variant="h6" component="h2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                            Family Member Information
                                        </Typography>
                                        <Box sx={{ borderBottom: '1px dashed #ccc', flexGrow: 1, ml: 2 }}></Box>
                                    </Box>

                                    <Box sx={{ mb: 3 }}>
                                        <TextField
                                            fullWidth
                                            label="Application Number :"
                                            value="7171"
                                            variant="outlined"
                                            InputProps={{
                                                readOnly: true,
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#ccc',
                                                },
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{ mb: 3, display: 'flex', gap: '10px' }}>
                                        <Box
                                            sx={{
                                                border: '1px dashed #90caf9',
                                                borderRadius: 1,
                                                p: 2,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: '#e3f2fd',
                                                height: '100px',
                                                width: '100px',
                                                position: 'relative',
                                            }}
                                        >
                                            {currentFamilyMember.picturePreview ? (
                                                <>
                                                    <img src={currentFamilyMember.picturePreview} alt="Family member" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    <Box sx={{ position: 'absolute', top: 0, right: 0 }}>
                                                        <IconButton size="small" sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f5f5f5' } }} onClick={() => handleFamilyMemberChange('picturePreview', null)}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                </>
                                            ) : (
                                                <>
                                                    <input accept="image/*" type="file" id="upload-family-picture" style={{ display: 'none' }} onChange={handleImageUpload} />
                                                    <label htmlFor="upload-family-picture">
                                                        <IconButton component="span" sx={{ color: '#90caf9' }}>
                                                            <AddIcon />
                                                        </IconButton>
                                                    </label>
                                                </>
                                            )}
                                        </Box>
                                        <Box>
                                            <Typography sx={{ mb: 1, fontWeight: 500 }}>Family Member Picture</Typography>
                                            <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                                                Click upload to profile picture (4 MB max)
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Box sx={{ mb: 3 }}>
                                                <Typography sx={{ mb: 1, fontWeight: 500 }}>Full Name*</Typography>
                                                <TextField
                                                    fullWidth
                                                    placeholder="Enter Full Name"
                                                    variant="outlined"
                                                    value={currentFamilyMember.fullName}
                                                    onChange={(e) => handleFamilyMemberChange('fullName', e.target.value)}
                                                    sx={{
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#ccc',
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Box sx={{ mb: 3 }}>
                                                <Typography sx={{ mb: 1, fontWeight: 500 }}>Relation with Primary*</Typography>
                                                <FormControl fullWidth variant="outlined">
                                                    <Select
                                                        displayEmpty
                                                        value={currentFamilyMember.relation}
                                                        onChange={(e) => handleFamilyMemberChange('relation', e.target.value)}
                                                        renderValue={(selected) => {
                                                            if (!selected) {
                                                                return <Typography sx={{ color: '#757575' }}>Choose Relation</Typography>;
                                                            }
                                                            return selected;
                                                        }}
                                                        sx={{
                                                            '& .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: '#ccc',
                                                            },
                                                        }}
                                                    >
                                                        <MenuItem value="Spouse">Spouse</MenuItem>
                                                        <MenuItem value="Child">Child</MenuItem>
                                                        <MenuItem value="Parent">Parent</MenuItem>
                                                        <MenuItem value="Sibling">Sibling</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Box>
                                        </Grid>
                                    </Grid>

                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Box sx={{ mb: 3 }}>
                                                <Typography sx={{ mb: 1, fontWeight: 500 }}>Email*</Typography>
                                                <TextField
                                                    fullWidth
                                                    placeholder="Enter Email"
                                                    variant="outlined"
                                                    value={currentFamilyMember.email}
                                                    onChange={(e) => handleFamilyMemberChange('email', e.target.value)}
                                                    sx={{
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#ccc',
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Box sx={{ mb: 3 }}>
                                                <Typography sx={{ mb: 1, fontWeight: 500 }}>Phone Number</Typography>
                                                <TextField
                                                    fullWidth
                                                    placeholder="Enter Phone Number"
                                                    variant="outlined"
                                                    value={currentFamilyMember.phoneNumber}
                                                    onChange={(e) => handleFamilyMemberChange('phoneNumber', e.target.value)}
                                                    sx={{
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#ccc',
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        </Grid>
                                    </Grid>

                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Box sx={{ mb: 3 }}>
                                                <Typography sx={{ mb: 1, fontWeight: 500 }}>CNIC</Typography>
                                                <TextField
                                                    fullWidth
                                                    placeholder="Enter cnic number"
                                                    variant="outlined"
                                                    value={currentFamilyMember.cnic}
                                                    onChange={(e) => handleFamilyMemberChange('cnic', e.target.value)}
                                                    sx={{
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#ccc',
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Box sx={{ mb: 3 }}>
                                                <Typography sx={{ mb: 1, fontWeight: 500 }}>Membership Type</Typography>
                                                <FormControl fullWidth variant="outlined">
                                                    <Select
                                                        displayEmpty
                                                        value={currentFamilyMember.membershipType}
                                                        onChange={(e) => handleFamilyMemberChange('membershipType', e.target.value)}
                                                        renderValue={(selected) => {
                                                            if (!selected) {
                                                                return <Typography sx={{ color: '#757575' }}>Choose Type</Typography>;
                                                            }
                                                            return selected;
                                                        }}
                                                        sx={{
                                                            '& .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: '#ccc',
                                                            },
                                                        }}
                                                    >
                                                        <MenuItem value="Silver">Silver</MenuItem>
                                                        <MenuItem value="Gold">Gold</MenuItem>
                                                        <MenuItem value="Corporate Member">Corporate Member</MenuItem>
                                                        <MenuItem value="Applied Member">Applied Member</MenuItem>
                                                        <MenuItem value="Affiliated Member">Affiliated Member</MenuItem>
                                                        <MenuItem value="VIP Guest">VIP Guest</MenuItem>
                                                        <MenuItem value="Employee">Employee</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Box>
                                        </Grid>
                                    </Grid>

                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Box sx={{ mb: 3 }}>
                                                <Typography sx={{ mb: 1, fontWeight: 500 }}>Membership Category</Typography>
                                                <FormControl fullWidth variant="outlined">
                                                    <Select
                                                        displayEmpty
                                                        value={currentFamilyMember.membershipCategory}
                                                        onChange={(e) => handleFamilyMemberChange('membershipCategory', e.target.value)}
                                                        renderValue={(selected) => {
                                                            if (!selected) {
                                                                return <Typography sx={{ color: '#757575' }}>Choose Category</Typography>;
                                                            }
                                                            return selected;
                                                        }}
                                                        sx={{
                                                            '& .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: '#ccc',
                                                            },
                                                        }}
                                                    >
                                                        <MenuItem value="Category 1">Category 1</MenuItem>
                                                        <MenuItem value="Category 2">Category 2</MenuItem>
                                                        <MenuItem value="Category 3">Category 3</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Box sx={{ mb: 3 }}>
                                                <Typography sx={{ mb: 1, fontWeight: 500 }}>Start Date</Typography>
                                                <TextField
                                                    fullWidth
                                                    type="date"
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                    placeholder="Select date"
                                                    variant="outlined"
                                                    value={currentFamilyMember.startDate}
                                                    onChange={(e) => handleFamilyMemberChange('startDate', e.target.value)}
                                                    sx={{
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#ccc',
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        </Grid>
                                    </Grid>

                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Box sx={{ mb: 3 }}>
                                                <Typography sx={{ mb: 1, fontWeight: 500 }}>End Date</Typography>
                                                <TextField
                                                    fullWidth
                                                    type="date"
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                    placeholder="Select date"
                                                    variant="outlined"
                                                    value={currentFamilyMember.endDate}
                                                    onChange={(e) => handleFamilyMemberChange('endDate', e.target.value)}
                                                    sx={{
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#ccc',
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        </Grid>
                                    </Grid>

                                    <Button
                                        variant="contained"
                                        sx={{
                                            mt: 2,
                                            bgcolor: '#f5f5f5',
                                            color: '#000',
                                            textTransform: 'none',
                                            '&:hover': {
                                                bgcolor: '#e0e0e0',
                                            },
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            width: '100%',
                                            py: 1.5,
                                            borderRadius: 1,
                                        }}
                                        onClick={handleAddFamilyMember}
                                    >
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                            <Typography sx={{ fontWeight: 500 }}>Add Another Family Member</Typography>
                                            <Typography variant="body2" sx={{ color: '#666' }}>
                                                If you add another family members then click
                                            </Typography>
                                        </Box>
                                        <ChevronRightIcon />
                                    </Button>

                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                                        <Button
                                            variant="outlined"
                                            sx={{
                                                mr: 2,
                                                textTransform: 'none',
                                                borderColor: '#ccc',
                                                color: '#333',
                                                '&:hover': { borderColor: '#999', backgroundColor: '#f5f5f5' },
                                            }}
                                            onClick={() => setShowFamilyMemberForm(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="contained"
                                            sx={{
                                                bgcolor: '#0c4b6e',
                                                '&:hover': {
                                                    bgcolor: '#083854',
                                                },
                                                textTransform: 'none',
                                            }}
                                            onClick={handleSubmit}
                                        >
                                            Save & Submit
                                        </Button>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                </Container>
            </div>
        </>
    );
};

export default AddForm3;
