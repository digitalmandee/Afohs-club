import { useState } from 'react';
import { Box, Button, Container, FormControl, Grid, IconButton, MenuItem, Radio, Select, TextField, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import 'bootstrap/dist/css/bootstrap.min.css';
import { router } from '@inertiajs/react';

const AddForm3 = ({ setData, data, handleChange, handleChangeData, onSubmit, onBack, memberTypesData, userNo, loading, membercategories, setCurrentFamilyMember, currentFamilyMember }) => {
    const [showFamilyMember, setShowFamilyMember] = useState(false);

    const [submitError, setSubmitError] = useState('');

    const handleFamilyMemberChange = (field, value) => {
        setCurrentFamilyMember({
            ...currentFamilyMember,
            [field]: value,
        });
    };

    const AddFamilyMember = () => {
        const maxUserId = data.family_members.length ? Math.max(...data.family_members.map((f) => f.user_id)) : userNo;

        setCurrentFamilyMember((prev) => ({
            ...prev,
            user_id: maxUserId + 1,
            member_type_id: data.member.member_type_id,
            membership_category: data.member.membership_category,
            start_date: data.member.card_issue_date,
            end_date: data.member.card_expire_date,
        }));
        setShowFamilyMember(true);
    };

    const handleSaveFamilyMember = () => {
        if (!currentFamilyMember.full_name || !currentFamilyMember.relation || !currentFamilyMember.email) {
            alert('Please fill required family member fields: Full Name, Relation, and Email');
            return;
        }
        handleChangeData('family_members', [...data.family_members, currentFamilyMember]);
        // setFamilyMembers([...familyMembers, currentFamilyMember]);
        setCurrentFamilyMember({
            user_id: userNo + 1,
            full_name: '',
            relation: '',
            cnic: '',
            phone_number: '',
            email: '',
            member_type_id: '',
            membership_category: '',
            start_date: '',
            end_date: '',
            picture: null,
            picture_preview: null,
        });
        setShowFamilyMember(false);
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) {
                alert('Image size must be less than 4MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setCurrentFamilyMember({
                    ...currentFamilyMember,
                    picture: file,
                    picture_preview: reader.result,
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteFamilyMember = (index) => {
        const updatedMembers = [...data.family_members];
        updatedMembers.splice(index, 1);
        handleChangeData('family_members', updatedMembers);
    };

    const handleEditFamilyMember = (index) => {
        setCurrentFamilyMember(data.family_members[index]);
        handleDeleteFamilyMember(index);
        setShowFamilyMember(true);
    };

    const handleCancelFamilyMember = () => {
        setShowFamilyMember(false);
        // handleChangeData('family_members', []);
        // setFamilyMembers([]); // Clear family members on cancel
    };

    const handleSubmit = async () => {
        const missingFields = [];
        const allowedMemberTypes = memberTypesData.map((type) => type.id);

        // Validate required fields
        if (!data.member.member_type_id || !allowedMemberTypes.includes(Number(data.member.member_type_id))) {
            missingFields.push('Member Type (must be one of: ' + allowedMemberTypes.join(', ') + ')');
        }
        if (!data.member.membership_number) {
            missingFields.push('Membership Number');
        }
        if (!data.member.membership_date) {
            missingFields.push('Membership Date');
        } else {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(data.member.membership_date)) {
                missingFields.push('Membership Date (must be in YYYY-MM-DD format)');
            }
        }

        if (missingFields.length > 0) {
            alert(`Please fill all required fields correctly: ${missingFields.join(', ')}`);
            return;
        }

        // Validate family members
        const validFamilyMembers = data.family_members.filter((member) => member.full_name && member.relation && member.email);

        const dataToSave = {
            member_type: data.member.member_type_id,
            membership_category: data.member.membership_category || '',
            membership_number: String(data.member.membership_number),
            membership_date: data.member.membership_date,
            card_status: data.member.card_status || '',
            card_issue_date: data.member.card_issue_date || '',
            card_expiry_date: data.member.card_expiry_date || '',
            from_date: data.member.from_date || '',
            to_date: data.member.to_date || '',
            family_members: validFamilyMembers,
        };

        try {
            await onSubmit(dataToSave);
            setSubmitError('');
            // router.visit('/admin/membership/all/payments');
        } catch (error) {
            console.error('Submission Error:', error);
            const errorMessage = error.response?.data?.message || JSON.stringify(error.response?.data || 'An error occurred during submission');
            setSubmitError(`Submission failed: ${errorMessage}. Please check all form fields.`);
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
                                {/* <pre>{JSON.stringify(memberTypesData, null, 2)}</pre> */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography sx={{ mb: 1, fontWeight: 500 }}>Member Type</Typography>
                                    <Grid container spacing={2}>
                                        {memberTypesData.map((type) => (
                                            <Grid item xs={6} sm={6} key={type.id}>
                                                <Box
                                                    sx={{
                                                        border: '1px solid #ccc',
                                                        borderRadius: 1,
                                                        p: 1,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        bgcolor: data.member.member_type_id == type.id ? '#fff' : 'transparent',
                                                    }}
                                                >
                                                    <Radio checked={data.member.member_type_id == type.id} onChange={handleChange} value={type.id} name="member.member_type_id" sx={{ color: '#1976d2' }} />
                                                    <Typography>{type.name}</Typography>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <Typography sx={{ mb: 1, fontWeight: 500 }}>Membership Category</Typography>
                                    <FormControl fullWidth variant="outlined">
                                        <Select
                                            name="member.membership_category"
                                            value={data.member.membership_category}
                                            onChange={handleChange}
                                            displayEmpty
                                            SelectProps={{
                                                displayEmpty: true,
                                                renderValue: (selected) => {
                                                    if (!selected) {
                                                        return <span style={{ color: '#757575', fontSize: '14px' }}>Choose Category</span>;
                                                    }
                                                    const item = membercategories.find((item) => item.id == Number(selected));

                                                    return item ? item.name : '';
                                                },
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#ccc',
                                                },
                                            }}
                                        >
                                            <MenuItem value="">
                                                <em>None</em>
                                            </MenuItem>
                                            {membercategories?.map((item) => (
                                                <MenuItem value={item.id} key={item.id}>
                                                    {item.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <Typography sx={{ mb: 1, fontWeight: 500 }}>Membership Number *</Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="Enter membership number"
                                        variant="outlined"
                                        name="membership_number"
                                        value={userNo}
                                        readOnly
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
                                                name="member.membership_date"
                                                value={data.member.membership_date}
                                                onChange={handleChange}
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
                                                    name="member.card_status"
                                                    value={data.member.card_status}
                                                    onChange={handleChange}
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
                                                    <MenuItem value="active">Active</MenuItem>
                                                    <MenuItem value="inactive">Inactive</MenuItem>
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
                                                name="member.card_issue_date"
                                                value={data.member.card_issue_date}
                                                onChange={handleChange}
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
                                                name="member.card_expiry_date"
                                                value={data.member.card_expiry_date}
                                                onChange={handleChange}
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
                                                name="member.from_date"
                                                value={data.member.from_date}
                                                onChange={handleChange}
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
                                                name="member.to_date"
                                                value={data.member.to_date}
                                                onChange={handleChange}
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
                                        bgcolor: showFamilyMember ? '#90caf9' : '#e3f2fd',
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
                                    onClick={AddFamilyMember}
                                >
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                        <Typography sx={{ fontWeight: 500 }}>Add Family Member</Typography>
                                        <Typography variant="body2" sx={{ color: '#666' }}>
                                            If you add family members then click
                                        </Typography>
                                    </Box>
                                    <ChevronRightIcon />
                                </Button>

                                {data.family_members.length > 0 && (
                                    <Box sx={{ mt: 3 }}>
                                        <Typography sx={{ mb: 1, fontWeight: 500 }}>Added Family Members</Typography>
                                        {data.family_members.map((member, index) => (
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
                                                    {member.full_name} ({member.relation})
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

                            {showFamilyMember && (
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
                                            value={currentFamilyMember.user_id}
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
                                            {currentFamilyMember.picture_preview ? (
                                                <>
                                                    <img src={currentFamilyMember.picture_preview} alt="Family member" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    <Box sx={{ position: 'absolute', top: 0, right: 0 }}>
                                                        <IconButton size="small" sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f5f5f5' } }} onClick={() => handleFamilyMemberChange('picture_preview', null)}>
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
                                                    value={currentFamilyMember.full_name}
                                                    onChange={(e) => handleFamilyMemberChange('full_name', e.target.value)}
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
                                                    value={currentFamilyMember.phone_number}
                                                    onChange={(e) => handleFamilyMemberChange('phone_number', e.target.value)}
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
                                                        value={currentFamilyMember.member_type_id}
                                                        readOnly
                                                        // onChange={(e) => handleFamilyMemberChange('member_type_id', e.target.value)}
                                                        renderValue={(selected) => {
                                                            if (!selected) {
                                                                return <Typography sx={{ color: '#757575' }}>Choose Type</Typography>;
                                                            }
                                                            const item = memberTypesData.find((item) => item.id == Number(selected));
                                                            return item ? item.name : '';
                                                        }}
                                                        sx={{
                                                            '& .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: '#ccc',
                                                            },
                                                        }}
                                                    >
                                                        {memberTypesData.map((type) => (
                                                            <MenuItem key={type.id} value={type.id}>
                                                                {type.name}
                                                            </MenuItem>
                                                        ))}
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
                                                        value={currentFamilyMember.membership_category}
                                                        onChange={(e) => handleFamilyMemberChange('membership_category', e.target.value)}
                                                        renderValue={(selected) => {
                                                            if (!selected) {
                                                                return <Typography sx={{ color: '#757575' }}>Choose Category</Typography>;
                                                            }
                                                            const item = membercategories.find((item) => item.id == Number(selected));
                                                            return item ? item.name : '';
                                                        }}
                                                        sx={{
                                                            '& .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: '#ccc',
                                                            },
                                                        }}
                                                    >
                                                        {membercategories
                                                            ?.filter((item) => item.id === data.member.membership_category)
                                                            .map((item) => (
                                                                <MenuItem value={item.id} key={item.id}>
                                                                    {item.name}
                                                                </MenuItem>
                                                            ))}
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
                                                    InputLabelProps={{ shrink: true }}
                                                    placeholder="Select date"
                                                    variant="outlined"
                                                    value={currentFamilyMember.start_date}
                                                    onChange={(e) => handleFamilyMemberChange('start_date', e.target.value)}
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
                                                    InputLabelProps={{ shrink: true }}
                                                    placeholder="Select date"
                                                    variant="outlined"
                                                    value={currentFamilyMember.end_date}
                                                    onChange={(e) => handleFamilyMemberChange('end_date', e.target.value)}
                                                    sx={{
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#ccc',
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        </Grid>
                                    </Grid>

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
                                            onClick={handleCancelFamilyMember}
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
                                            onClick={handleSaveFamilyMember}
                                        >
                                            Save Members
                                        </Button>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
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
                                loading={loading}
                                disabled={loading}
                                loadingPosition="start"
                            >
                                Save & Submit
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </div>
        </>
    );
};

export default AddForm3;
