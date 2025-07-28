import { useState } from 'react';
import { Box, Button, Container, FormControl, Grid, IconButton, MenuItem, Radio, Select, TextField, Typography, Checkbox, FormControlLabel, InputLabel } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import 'bootstrap/dist/css/bootstrap.min.css';
import { router } from '@inertiajs/react';
import AsyncSearchTextField from '@/components/AsyncSearchTextField';
import { enqueueSnackbar } from 'notistack';

const AddForm3 = ({ data, handleChange, handleChangeData, onSubmit, onBack, memberTypesData, loading, membercategories, setCurrentFamilyMember, currentFamilyMember }) => {
    const [showFamilyMember, setShowFamilyMember] = useState(false);
    const [selectedKinshipUser, setSelectedKinshipUser] = useState(null);
    const [submitError, setSubmitError] = useState('');
    const [familyMemberErrors, setFamilyMemberErrors] = useState({});

    const handleFamilyMemberChange = (field, value) => {
        setCurrentFamilyMember({
            ...currentFamilyMember,
            [field]: value,
        });
    };

    const AddFamilyMember = () => {
        const maxApplicationNo = data.family_members.length ? Math.max(...data.family_members.map((f) => f.application_no)) : data.member.application_no;

        const existingCount = data.family_members.length;
        const suffix = String.fromCharCode(65 + existingCount); // 65 = 'A'

        setCurrentFamilyMember((prev) => ({
            ...prev,
            family_suffix: suffix,
            application_no: Number(maxApplicationNo) + 1,
            member_type_id: data.member.member_type_id,
            membership_category: data.member.membership_category,
            start_date: data.member.card_issue_date,
            end_date: data.member.card_expiry_date,
        }));
        setShowFamilyMember(true);
    };

    const handleSaveFamilyMember = () => {
        const errors = {};

        // Required fields
        if (!currentFamilyMember.full_name) {
            errors.full_name = 'Full Name is required';
        }
        if (!currentFamilyMember.relation) {
            errors.relation = 'Relation is required';
        }
        if (!currentFamilyMember.email) {
            errors.email = 'Email is required';
        }
        if (currentFamilyMember.cnic && !/^\d{5}-\d{7}-\d{1}$/.test(currentFamilyMember.cnic)) {
            errors.cnic = 'CNIC must be in the format XXXXX-XXXXXXX-X';
        }
        if (currentFamilyMember.cnic && currentFamilyMember.cnic === data.user_details.cnic_no) {
            errors.cnic = 'Family member CNIC must not be the same as the primary member CNIC';
        }

        // Email uniqueness check
        const mainEmail = data.email?.trim().toLowerCase();
        const memberEmail = currentFamilyMember.email?.trim().toLowerCase();

        if (memberEmail === mainEmail) {
            errors.email = 'Family member email must not be same as member email';
        }

        const emailAlreadyUsed = data.family_members.some((fm) => fm.email?.trim().toLowerCase() === memberEmail);

        if (emailAlreadyUsed) {
            errors.email = 'This email is already added to another family member';
        }

        // Date validations
        const issueDate = new Date(data.member.card_issue_date);
        const expiryDate = new Date(data.member.card_expiry_date);
        const start = new Date(currentFamilyMember.start_date);
        const end = new Date(currentFamilyMember.end_date);

        if (currentFamilyMember.start_date && currentFamilyMember.end_date && start > expiryDate && end > expiryDate) {
            errors.date = 'Start and End dates are beyond card expiry';
        } else if (currentFamilyMember.start_date && currentFamilyMember.end_date && !(start >= issueDate && end <= expiryDate)) {
            errors.date = 'Family member dates are outside the valid card date range';
        }

        if (Object.keys(errors).length > 0) {
            setFamilyMemberErrors(errors);
            return;
        }

        // Update family member list
        handleChangeData('family_members', [...data.family_members, currentFamilyMember]);

        // Reset form
        setCurrentFamilyMember({
            application_no: '',
            family_suffix: '',
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
            is_document_missing: false,
            documents: '',
        });
        setShowFamilyMember(false);
        setFamilyMemberErrors({});
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
    };

    // Upload documents
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        handleChangeData('member.documents', [...(data.member.documents || []), ...files]);
        handleChangeData('member.previewFiles', [...(data.member.previewFiles || []), ...files]);
    };

    const handleFileRemove = (index) => {
        const updatedFiles = [...(data.member.previewFiles || [])];
        updatedFiles.splice(index, 1);
        handleChangeData('member.previewFiles', updatedFiles);
        handleChangeData('member.documents', updatedFiles);
    };

    const handleSubmit = async () => {
        const missingFields = [];
        const allowedMemberTypes = memberTypesData.map((type) => type.id);

        // Validate required fields
        if (!data.member.member_type_id || !allowedMemberTypes.includes(Number(data.member.member_type_id))) {
            missingFields.push('Member Type (must be one of: ' + allowedMemberTypes.join(', ') + ')');
        }

        if (data.member.is_document_missing && !data.member.missing_documents) {
            missingFields.push('Missing Document is required.');
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
            enqueueSnackbar(`Please fill all required fields correctly: ${missingFields.join(', ')}`, { variant: 'error' });
            // alert(`Please fill all required fields correctly: ${missingFields.join(', ')}`);
            return;
        }

        try {
            await onSubmit();
            setSubmitError('');
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
                                            onChange={(e) => {
                                                const selectedCategoryId = e.target.value;
                                                const selectedCategory = membercategories.find((item) => item.id === Number(selectedCategoryId));
                                                const categoryName = selectedCategory?.name || '';

                                                handleChange({
                                                    target: {
                                                        name: 'member.membership_category',
                                                        value: selectedCategoryId,
                                                    },
                                                });

                                                if (!selectedKinshipUser) {
                                                    handleChange({
                                                        target: {
                                                            name: 'member.membership_no',
                                                            value: `${categoryName} ${data.member.membership_no}`,
                                                        },
                                                    });
                                                }
                                            }}
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
                                    <AsyncSearchTextField
                                        label="Kinship"
                                        name="member.kinship"
                                        value={data.member.kinship}
                                        onChange={async (e) => {
                                            const kinshipUser = e.target.value;
                                            setSelectedKinshipUser(kinshipUser);
                                            handleChange({ target: { name: 'member.kinship', value: e.target.value } });

                                            const selectedCategory = membercategories.find((item) => item.id === Number(data.member.membership_category));
                                            const prefix = selectedCategory?.name || '';

                                            if (kinshipUser && kinshipUser.membership_no) {
                                                const kinshipParts = kinshipUser.membership_no.split(' ');
                                                const kinshipNum = kinshipParts[1]?.split('-')[0];

                                                const existingMembers = [];
                                                let suffix = 1;
                                                while (existingMembers.includes(`${prefix} ${kinshipNum}-${suffix}`)) {
                                                    suffix++;
                                                }

                                                const newMembershipNo = `${prefix} ${kinshipNum}-${suffix}`;

                                                handleChange({
                                                    target: {
                                                        name: 'member.membership_no',
                                                        value: newMembershipNo,
                                                    },
                                                });
                                            }
                                        }}
                                        endpoint="/admin/api/search-users"
                                        placeholder="Search Kinship..."
                                        disabled={!data.member.membership_category}
                                    />
                                </Box>
                                <Box sx={{ mb: 3 }}>
                                    <Typography sx={{ mb: 1, fontWeight: 500 }}>Membership Number *</Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="e.g. 12345-24"
                                        variant="outlined"
                                        name="member.membership_no"
                                        value={data.member.membership_no}
                                        onChange={(e) => {
                                            const input = e.target.value;

                                            const validPattern = /^[0-9]{0,10}-?[0-9]{0,2}$/;

                                            if (input === '' || validPattern.test(input)) {
                                                handleChange(e);
                                            }
                                        }}
                                        inputProps={{
                                            maxLength: 12,
                                            inputMode: 'numeric',
                                        }}
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
                                                    {['In-Process', 'Printed', 'Received', 'Issued', 'Re-Printed', 'E-Card Issued'].map((status) => (
                                                        <MenuItem key={status} value={status}>
                                                            {status}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Box>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Box sx={{ mb: 1 }}>
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
                                        <Box sx={{ mb: 1 }}>
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
                                    <Grid item xs={12}>
                                        <Box sx={{ mb: 2 }}>
                                            <Typography sx={{ mb: 1, fontWeight: 500 }}>Membership Status</Typography>
                                            <FormControl fullWidth variant="outlined">
                                                <Select
                                                    name="member.status"
                                                    value={data.member.status}
                                                    onChange={handleChange}
                                                    displayEmpty
                                                    renderValue={() => {
                                                        const status = data.member.status;
                                                        return status ? <Typography sx={{ textTransform: 'capitalize' }}>{status}</Typography> : <Typography sx={{ color: '#757575' }}>Choose Status</Typography>;
                                                    }}
                                                    sx={{
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#ccc',
                                                        },
                                                    }}
                                                >
                                                    {['active', 'inactive', 'suspended', 'cancelled', 'pause'].map((status) => (
                                                        <MenuItem key={status} value={status} sx={{ textTransform: 'capitalize' }}>
                                                            {status}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <InputLabel>Upload Documents (PDF or Images)</InputLabel>
                                        <input type="file" multiple accept=".pdf,image/*" name="member.documents" onChange={handleFileChange} style={{ marginTop: 8 }} />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Grid container spacing={1}>
                                            {[...(data.previewFiles || [])].map((file, idx) => (
                                                <Grid item key={idx}>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            border: '1px solid #ccc',
                                                            borderRadius: 1,
                                                            px: 1,
                                                            py: 0.5,
                                                            backgroundColor: '#f9f9f9',
                                                        }}
                                                    >
                                                        <Typography variant="body2" sx={{ mr: 1 }}>
                                                            {file.name}
                                                        </Typography>
                                                        <IconButton size="small" onClick={() => handleFileRemove(idx)}>
                                                            <CloseIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Grid>
                                    {/* Document Missing */}
                                    <Grid item xs={12}>
                                        <Box sx={{ mb: 3 }}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={data.member.is_document_missing || false}
                                                        onChange={(e) =>
                                                            handleChange({
                                                                target: {
                                                                    name: 'member.is_document_missing',
                                                                    value: e.target.checked,
                                                                },
                                                            })
                                                        }
                                                        sx={{ color: '#1976d2' }}
                                                    />
                                                }
                                                label="Document Missing"
                                            />
                                        </Box>
                                        {data.member.is_document_missing && (
                                            <Box sx={{ mb: 3 }}>
                                                <Typography sx={{ mb: 1, fontWeight: 500 }}>Which document is missing?</Typography>
                                                <TextField
                                                    fullWidth
                                                    multiline
                                                    rows={4}
                                                    placeholder="Enter missing documents"
                                                    variant="outlined"
                                                    name="member.missing_documents"
                                                    value={data.member.missing_documents || ''}
                                                    onChange={handleChange}
                                                    sx={{
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#ccc',
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        )}
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

                                    <Box sx={{ mb: 3, display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
                                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                                            <Box component="span" sx={{ mr: 1, fontWeight: 500 }}>
                                                Application Number :
                                            </Box>
                                            <Box component="span" sx={{ color: '#666' }}>
                                                #{currentFamilyMember.application_no} <br />
                                            </Box>
                                        </Box>
                                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                                            <Box component="span" sx={{ mr: 1, fontWeight: 500 }}>
                                                Membership Number :
                                            </Box>
                                            <Box component="span" sx={{ color: '#666' }}>
                                                {data.member?.membership_no}-{currentFamilyMember.family_suffix}
                                            </Box>
                                        </Box>
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
                                                    error={!!familyMemberErrors.full_name}
                                                    helperText={familyMemberErrors.full_name}
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
                                                <FormControl fullWidth variant="outlined" error={!!familyMemberErrors.relation}>
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
                                                    {!!familyMemberErrors.relation && (
                                                        <Typography variant="caption" color="error">
                                                            {familyMemberErrors.relation}
                                                        </Typography>
                                                    )}
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
                                                    error={!!familyMemberErrors.email}
                                                    helperText={familyMemberErrors.email}
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
                                                    placeholder="XXXXX-XXXXXXX-X"
                                                    variant="outlined"
                                                    value={currentFamilyMember.cnic}
                                                    error={!!familyMemberErrors.cnic}
                                                    helperText={familyMemberErrors.cnic}
                                                    onChange={(e) => {
                                                        let value = e.target.value;
                                                        value = value.replace(/[^\d-]/g, '');
                                                        if (value.length > 5 && value[5] !== '-') value = value.slice(0, 5) + '-' + value.slice(5);
                                                        if (value.length > 13 && value[13] !== '-') value = value.slice(0, 13) + '-' + value.slice(13);
                                                        if (value.length > 15) value = value.slice(0, 15);
                                                        handleFamilyMemberChange('cnic', value);
                                                    }}
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
                                                        renderValue={(selected) => {
                                                            if (!selected) {
                                                                return <Typography sx={{ color: '#757575' }}>Choose Type</Typography>;
                                                            }
                                                            const item = memberTypesData.find((item) => item.id == Number(selected));
                                                            return item ? item.name + ' - ' + currentFamilyMember.relation : '';
                                                        }}
                                                        sx={{
                                                            '& .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: '#ccc',
                                                            },
                                                        }}
                                                    >
                                                        {memberTypesData.map((type) => (
                                                            <MenuItem key={type.id} value={type.id}>
                                                                {type.name} - {currentFamilyMember.relation}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Box>
                                        </Grid>
                                    </Grid>

                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <Box sx={{ mb: 3 }}>
                                                <Typography sx={{ mb: 1, fontWeight: 500 }}>Membership Category</Typography>
                                                <FormControl fullWidth variant="outlined">
                                                    <Select
                                                        displayEmpty
                                                        value={currentFamilyMember.membership_category}
                                                        onChange={(e) => handleFamilyMemberChange('membership_category', e.target.value)}
                                                        readOnly
                                                        renderValue={(selected) => {
                                                            if (!selected) {
                                                                return <Typography sx={{ color: '#757575' }}>Choose Category</Typography>;
                                                            }
                                                            const item = membercategories.find((item) => item.id == Number(selected));
                                                            return item ? item.name + ' - ' + currentFamilyMember.relation : '';
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
                                                                    {item.name} - {currentFamilyMember.relation}
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

                                    {familyMemberErrors.date && (
                                        <Typography color="error" variant="body2">
                                            {familyMemberErrors.date}
                                        </Typography>
                                    )}

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
                                loadingPosition="start"
                                disabled={loading}
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
