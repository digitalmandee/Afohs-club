import { useState } from 'react';
import { Box, Button, Container, FormControl, Grid, IconButton, MenuItem, Radio, Select, TextField, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteIcon from '@mui/icons-material/Delete';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router } from '@inertiajs/react';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const AddForm3 = ({ onSubmit, onBack }) => {
    const [open, setOpen] = useState(false);
    const [memberType, setMemberType] = useState('Member');
    const [showFamilyMemberForm, setShowFamilyMemberForm] = useState(false);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [currentFamilyMember, setCurrentFamilyMember] = useState({
        fullName: '',
        relation: '',
        cnic: '',
        phoneNumber: '',
        membershipType: '',
        membershipCategory: '',
        startDate: '',
        endDate: '',
        picture: null,
        picturePreview: null,
    });

    const handleMemberTypeChange = (event) => {
        setMemberType(event.target.value);
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
        setFamilyMembers([...familyMembers, currentFamilyMember]);
        setCurrentFamilyMember({
            fullName: '',
            relation: '',
            cnic: '',
            phoneNumber: '',
            membershipType: '',
            membershipCategory: '',
            startDate: '',
            endDate: '',
            picture: null,
            picturePreview: null,
        });
    };

    const handleDeleteFamilyMember = (index) => {
        const updatedMembers = [...familyMembers];
        updatedMembers.splice(index, 1);
        setFamilyMembers(updatedMembers);
    };

    const handleEditFamilyMember = (index) => {
        setCurrentFamilyMember(familyMembers[index]);
        handleDeleteFamilyMember(index);
    };

    return (
        <>
            {/* <SideNav open={open} setOpen={setOpen} /> */}
            <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '20px' }}>
                <div maxWidth="lg" sx={{ py: 4 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <IconButton onClick={onBack} sx={{ mr: 2 }}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h5" component="h1" sx={{ fontWeight: 500, color: '#333' }}>
                            Membership Information
                        </Typography>
                    </Box>

                    {/* Progress Bar */}
                    <Box sx={{ mb: 3, p: 2, bgcolor: '#E7E7E7' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        bgcolor: '#3F4E4F',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                    }}
                                >
                                    <CheckCircleIcon />
                                </Box>
                                <Typography sx={{ ml: 1, fontWeight: 500 }}>Personal Information</Typography>
                            </Box>

                            <Box
                                sx={{
                                    height: '2px',
                                    bgcolor: '#063455',
                                    flexGrow: 1,
                                    mx: 2,
                                }}
                            />

                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        bgcolor: '#063455',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                    }}
                                >
                                    <Typography>2</Typography>
                                </Box>
                                <Typography sx={{ ml: 1, fontWeight: 500 }}>Membership Information</Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Main Content */}
                    <Box sx={{ p: 3, bgcolor: '#FFFFFF', border: 'solid 1px #E3E3E3' }}>
                        <Grid container spacing={3}>
                            {/* Left Column - Membership Information */}
                            <Grid item xs={12} md={6}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="h6" component="h2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                        Membership Information
                                    </Typography>
                                    <Box sx={{ borderBottom: '1px dashed #ccc', flexGrow: 1, ml: 2 }}></Box>
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
                                                    bgcolor: memberType === 'Member' ? '#fff' : 'transparent',
                                                }}
                                            >
                                                <Radio checked={memberType === 'Member'} onChange={handleMemberTypeChange} value="Member" name="member-type" sx={{ color: '#1976d2' }} />
                                                <Typography>Member</Typography>
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
                                                }}
                                            >
                                                <Radio checked={memberType === 'Corporate Member'} onChange={handleMemberTypeChange} value="Corporate Member" name="member-type" />
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
                                                }}
                                            >
                                                <Radio checked={memberType === 'Applied Member'} onChange={handleMemberTypeChange} value="Applied Member" name="member-type" />
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
                                                }}
                                            >
                                                <Radio checked={memberType === 'Affiliated Member'} onChange={handleMemberTypeChange} value="Affiliated Member" name="member-type" />
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
                                                }}
                                            >
                                                <Radio checked={memberType === 'VIP Guest'} onChange={handleMemberTypeChange} value="VIP Guest" name="member-type" />
                                                <Typography>VIP Guest</Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <Typography sx={{ mb: 1, fontWeight: 500 }}>Membership Category</Typography>
                                    <FormControl fullWidth variant="outlined">
                                        <Select
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
                                                placeholder="dd/mm/yyyy"
                                                variant="outlined"
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
                                            <Typography sx={{ mb: 1, fontWeight: 500 }}>Card issue date</Typography>
                                            <TextField
                                                fullWidth
                                                placeholder="dd/mm/yyyy"
                                                variant="outlined"
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
                                            <Typography sx={{ mb: 1, fontWeight: 500 }}>Card expiry date</Typography>
                                            <TextField
                                                fullWidth
                                                placeholder="dd/mm/yyyy"
                                                variant="outlined"
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
                                                placeholder="dd/mm/yyyy"
                                                variant="outlined"
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
                                                placeholder="dd/mm/yyyy"
                                                variant="outlined"
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
                                        <Typography sx={{ fontWeight: 500 }}>Add family Member</Typography>
                                        <Typography variant="body2" sx={{ color: '#666' }}>
                                            If you add family members then click
                                        </Typography>
                                    </Box>
                                    <ChevronRightIcon />
                                </Button>
                            </Grid>

                            {/* Right Column - Family Member Information */}
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
                                                    <img src={currentFamilyMember.picturePreview || '/placeholder.svg'} alt="Family member" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                                        <box>
                                            <Typography sx={{ mb: 1, fontWeight: 500 }}>Family Member Picture</Typography>
                                            <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                                                Click upload to profile picture (4 MB max)
                                            </Typography>
                                        </box>
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
                                                <Typography sx={{ mb: 1, fontWeight: 500 }}>Relation with Primary</Typography>
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
                                                        <MenuItem value="Regular">Regular</MenuItem>
                                                        <MenuItem value="Premium">Premium</MenuItem>
                                                        <MenuItem value="VIP">VIP</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Box>
                                        </Grid>
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
                                    </Grid>

                                    <Grid container spacing={2}>
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
                                            <Typography sx={{ fontWeight: 500 }}>Add Another family Member</Typography>
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
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="contained"
                                            sx={{
                                                bgcolor: '#1e3a8a',
                                                '&:hover': {
                                                    bgcolor: '#152a60',
                                                },
                                                textTransform: 'none',
                                            }}
                                        >
                                            Save
                                        </Button>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                </div>
            </div>
        </>
    );
};

export default AddForm3;
