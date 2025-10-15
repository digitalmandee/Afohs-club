import { useState } from 'react';
import { Box, Button, Container, FormControl, Grid, IconButton, MenuItem, Radio, Select, TextField, Typography, Checkbox, FormControlLabel, InputLabel, Dialog, DialogTitle, DialogContent } from '@mui/material';
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
    const [openFamilyMember, setOpenFamilyMember] = useState(false);
    const [selectedKinshipUser, setSelectedKinshipUser] = useState(null);
    const [submitError, setSubmitError] = useState('');
    const [familyMemberErrors, setFamilyMemberErrors] = useState({});
    const [fieldErrors, setFieldErrors] = useState({});

    const handleFamilyMemberChange = (field, value) => {
        setCurrentFamilyMember({
            ...currentFamilyMember,
            [field]: value,
        });
    };

    const handleFamilyPictureDelete = () => {
        setCurrentFamilyMember({
            ...currentFamilyMember,
            picture: null,
            picture_preview: null,
        });
    };

    const AddFamilyMember = () => {
        const maxApplicationNo = data.family_members.length ? Math.max(...data.family_members.map((f) => f.application_no)) : data.application_no;

        const existingCount = data.family_members.length;
        const suffix = String.fromCharCode(65 + existingCount); // A, B, C...
        const uniqueId = `new-${existingCount + 1}`;

        setCurrentFamilyMember((prev) => ({
            ...prev,
            id: uniqueId,
            family_suffix: suffix,
            application_no: Number(maxApplicationNo) + 1,
            member_type_id: data.member_type_id,
            membership_category: data.membership_category,
            card_issue_date: data.card_issue_date,
            card_expiry_date: data.card_expiry_date,
        }));
        setShowFamilyMember(true);
    };

    const handleSaveFamilyMember = () => {
        const errors = {};

        const isEdit = data.family_members.some((fm) => fm.id === currentFamilyMember.id);

        // --- Validation ---
        if (!currentFamilyMember.full_name) {
            errors.full_name = 'Full Name is required';
        }
        if (!currentFamilyMember.relation) {
            errors.relation = 'Relation is required';
        }
        // if (!currentFamilyMember.email) {
        //     errors.email = 'Email is required';
        // }
        if (!currentFamilyMember.date_of_birth) {
            errors.date_of_birth = 'Date of Birth is required';
        }
        if (currentFamilyMember.cnic && !/^\d{5}-\d{7}-\d{1}$/.test(currentFamilyMember.cnic)) {
            errors.cnic = 'CNIC must be in the format XXXXX-XXXXXXX-X';
        }
        if (currentFamilyMember.cnic && currentFamilyMember.cnic === data.cnic_no) {
            errors.cnic = 'Family member CNIC must not be the same as the primary member CNIC';
        }

        if (!currentFamilyMember.status) {
            errors.status = 'Status is required';
        }

        // Email uniqueness
        if (!currentFamilyMember.email) {
            delete errors.email;
        } else {
            const mainEmail = data.personal_email?.trim().toLowerCase() || '';
            const memberEmail = currentFamilyMember.email?.trim().toLowerCase();

            if (memberEmail === mainEmail) {
                errors.email = 'Family member email must not be same as member email';
            }

            const emailAlreadyUsed = data.family_members.some((fm) => {
                if (!fm.email) return false;

                const fmEmail = fm.email.trim().toLowerCase();
                console.log(isEdit, fm.id, currentFamilyMember.id);
                if (isEdit && fm.id === currentFamilyMember.id) return false;
                return fmEmail === memberEmail;
            });

            if (emailAlreadyUsed) {
                errors.email = 'This email is already used by another family member';
            }
        }

        // Date validations
        const issueDate = new Date(data.card_issue_date);
        const expiryDate = new Date(data.card_expiry_date);

        // if (!currentFamilyMember.start_date || currentFamilyMember.end_date) {
        //     errors.date = 'Start and End dates are beyond card expiry';
        // }

        if (Object.keys(errors).length > 0) {
            setFamilyMemberErrors(errors);
            return;
        }

        // --- Save or Update Logic ---
        let updatedMember = { ...currentFamilyMember };

        // Assign ID if it's new
        if (!currentFamilyMember.id) {
            const newId = `new-${data.family_members.length + 1}`;
            updatedMember.id = newId;
        }

        let updatedFamilyMembers;

        if (isEdit) {
            updatedFamilyMembers = data.family_members.map((fm) => (fm.id === currentFamilyMember.id ? updatedMember : fm));
        } else {
            updatedFamilyMembers = [...data.family_members, updatedMember];
        }

        handleChangeData('family_members', updatedFamilyMembers);

        // Reset form
        setCurrentFamilyMember({
            application_no: '',
            family_suffix: '',
            full_name: '',
            barcode_no: '',
            relation: '',
            cnic: '',
            phone_number: '',
            email: '',
            member_type_id: '',
            date_of_birth: '',
            membership_category: '',
            start_date: '',
            end_date: '',
            card_issue_date: '',
            card_expiry_date: '',
            status: 'active',
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

    const handleDeleteFamilyMember = (family, index) => {
        if (family.id) {
            // Existing record → mark for deletion
            const updatedDeleted = [...data.deleted_family_members, family.id];
            handleChangeData('deleted_family_members', updatedDeleted);
        }

        // Remove from UI regardless
        const updatedMembers = [...data.family_members];
        updatedMembers.splice(index, 1);
        handleChangeData('family_members', updatedMembers);

        // Reset form
        setCurrentFamilyMember({
            application_no: '',
            family_suffix: '',
            full_name: '',
            barcode_no: '',
            relation: '',
            cnic: '',
            phone_number: '',
            email: '',
            member_type_id: '',
            date_of_birth: '',
            membership_category: '',
            start_date: '',
            end_date: '',
            card_issue_date: '',
            card_expiry_date: '',
            status: 'active',
            picture: null,
            picture_preview: null,
            is_document_missing: false,
            documents: '',
        });
    };

    const handleEditFamilyMember = (index) => {
        const family = data.family_members[index];
        setCurrentFamilyMember({ ...family, picture_preview: family.picture });
        setShowFamilyMember(true);
    };

    const handleCancelFamilyMember = () => {
        setCurrentFamilyMember({
            application_no: '',
            family_suffix: '',
            full_name: '',
            relation: '',
            cnic: '',
            phone_number: '',
            email: '',
            member_type_id: '',
            date_of_birth: '',
            membership_category: '',
            start_date: '',
            end_date: '',
            card_issue_date: '',
            card_expiry_date: '',
            status: 'active',
            picture: null,
            picture_preview: null,
            is_document_missing: false,
            documents: '',
        });
        setShowFamilyMember(false);
    };

    // Upload documents
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        handleChangeData('documents', [...(data.documents || []), ...files]);
        handleChangeData('previewFiles', [...(data.previewFiles || []), ...files]);
    };

    const handleFileRemove = (index) => {
        const updatedFiles = [...(data.previewFiles || [])];
        updatedFiles.splice(index, 1);
        handleChangeData('previewFiles', updatedFiles);
        handleChangeData('documents', updatedFiles);
    };

    const handleSubmit = async () => {
        const errors = {};
        const allowedMemberTypes = memberTypesData.map((type) => type.id);

        // Member Type validation
        if (!data.member_type_id || !allowedMemberTypes.includes(Number(data.member_type_id))) {
            errors.member_type_id = `Member Type is required.`;
        }

        // Category example (add your real logic here)
        if (!data.membership_category) {
            errors.membership_category = 'Member Category is required.';
        }

        // Document logic
        if (data.is_document_missing && !data.missing_documents) {
            errors.missing_documents = 'Please specify the missing document(s).';
        }

        // Membership date
        if (!data.membership_date) {
            errors.membership_date = 'Membership Date is required.';
        } else {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(data.membership_date)) {
                errors.membership_date = 'Membership Date must be in YYYY-MM-DD format.';
            }
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        try {
            await onSubmit();
            setFieldErrors({});
        } catch (error) {
            console.error('Submission Error:', error);
            enqueueSnackbar('Submission failed. Please try again.', { variant: 'error' });
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
                            <Grid item xs={12} md={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="h6" component="h2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                        Membership Information
                                    </Typography>
                                    <Box sx={{ borderBottom: '1px dashed #ccc', flexGrow: 1, ml: 2 }}></Box>
                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        sx={{
                                            bgcolor: '#0c4b6e',
                                            '&:hover': {
                                                bgcolor: '#083854',
                                            },
                                            textTransform: 'none',
                                            ml: 2,
                                        }}
                                        onClick={() => setOpenFamilyMember(true)}
                                    >
                                        Add Family Member
                                    </Button>
                                </Box>
                                {/* Membership Details */}
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Box>
                                            <Typography sx={{ mb: 1, fontWeight: 500 }}>Member Type *</Typography>
                                            <Grid container spacing={2}>
                                                {memberTypesData.map((type) => (
                                                    <Grid item xs={6} sm={4} md={3} key={type.id}>
                                                        <Box
                                                            sx={{
                                                                border: '1px solid #ccc',
                                                                borderRadius: 1,
                                                                p: 1,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                bgcolor: data.member_type_id == type.id ? '#fff' : 'transparent',
                                                            }}
                                                        >
                                                            <Radio checked={data.member_type_id == type.id} onChange={handleChange} value={type.id} name="member_type_id" sx={{ color: '#1976d2' }} />
                                                            <Typography>{type.name}</Typography>
                                                        </Box>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                            {fieldErrors.member_type_id && (
                                                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                                                    {fieldErrors.member_type_id}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Box>
                                            <Typography sx={{ mb: 1, fontWeight: 500 }}>Membership Category *</Typography>
                                            <FormControl fullWidth variant="outlined">
                                                <Select
                                                    name="membership_category"
                                                    value={data.membership_category}
                                                    onChange={(e) => {
                                                        const selectedCategoryId = e.target.value;
                                                        const selectedCategory = membercategories.find((item) => item.id === Number(selectedCategoryId));
                                                        const categoryName = selectedCategory?.name || '';

                                                        handleChange({
                                                            target: {
                                                                name: 'membership_category',
                                                                value: selectedCategoryId,
                                                            },
                                                        });

                                                        if (!selectedKinshipUser) {
                                                            const membershipNoParts = data.membership_no.split(' ');
                                                            const newMembershipNo = membershipNoParts.length > 1 ? `${categoryName} ${membershipNoParts[1]}` : `${categoryName} ${data.membership_no}`;

                                                            handleChange({
                                                                target: {
                                                                    name: 'membership_no',
                                                                    value: newMembershipNo,
                                                                },
                                                            });
                                                        }
                                                    }}
                                                    displayEmpty
                                                    renderValue={(selected) => {
                                                        if (!selected) {
                                                            return <span style={{ color: '#757575', fontSize: '14px' }}>Choose Category</span>;
                                                        }
                                                        const item = membercategories.find((item) => item.id == Number(selected));
                                                        return item ? item.description + ' (' + item.name + ')' : '';
                                                    }}
                                                    SelectProps={{
                                                        displayEmpty: true,
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
                                                            {item.description} ({item.name})
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                {fieldErrors.membership_category && (
                                                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                                                        {fieldErrors.membership_category}
                                                    </Typography>
                                                )}
                                            </FormControl>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Box>
                                            <Typography sx={{ mb: 1, fontWeight: 500 }}>Kinship</Typography>
                                            <AsyncSearchTextField
                                                label=""
                                                name="kinship"
                                                value={data.kinship}
                                                onChange={async (e) => {
                                                    const kinshipUser = e.target.value;
                                                    setSelectedKinshipUser(kinshipUser);
                                                    handleChange({ target: { name: 'kinship', value: e.target.value } });

                                                    const selectedCategory = membercategories.find((item) => item.id === Number(data.membership_category));
                                                    const prefix = selectedCategory?.name || '';

                                                    if (kinshipUser && kinshipUser.membership_no) {
                                                        const kinshipParts = kinshipUser.membership_no.split(' ');
                                                        const kinshipNum = kinshipParts[1]?.split('-')[0];

                                                        const existingMembers = [];
                                                        let suffix = kinshipUser.total_kinships + 1;
                                                        while (existingMembers.includes(`${prefix} ${kinshipNum}-${suffix}`)) {
                                                            suffix++;
                                                        }

                                                        const newMembershipNo = `${prefix} ${kinshipNum}-${suffix}`;

                                                        handleChange({
                                                            target: {
                                                                name: 'membership_no',
                                                                value: newMembershipNo,
                                                            },
                                                        });
                                                    }
                                                }}
                                                endpoint="admin.api.search-users"
                                                placeholder="Search Kinship..."
                                                disabled={!data.membership_category}
                                            />
                                        </Box>
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Box>
                                            <Typography sx={{ mb: 1, fontWeight: 500 }}>Membership Number *</Typography>
                                            <TextField
                                                fullWidth
                                                placeholder="e.g. 12345-24"
                                                variant="outlined"
                                                name="membership_no"
                                                value={data.membership_no}
                                                onChange={(e) => {
                                                    handleChange(e);
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
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Box>
                                            <Typography sx={{ mb: 1, fontWeight: 500 }}>Barcode Number</Typography>
                                            <TextField
                                                fullWidth
                                                placeholder="e.g. 12345-24"
                                                variant="outlined"
                                                name="barcode_no"
                                                value={data.barcode_no}
                                                onChange={(e) => {
                                                    handleChange(e);
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
                                        <Box>
                                            <Typography sx={{ mb: 1, fontWeight: 500 }}>Membership Date *</Typography>
                                            <TextField
                                                fullWidth
                                                type="date"
                                                InputLabelProps={{ shrink: true }}
                                                placeholder="dd/mm/yyyy"
                                                variant="outlined"
                                                name="membership_date"
                                                value={data.membership_date}
                                                onChange={handleChange}
                                                sx={{
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#ccc',
                                                    },
                                                }}
                                            />
                                            {fieldErrors.membership_date && (
                                                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                                                    {fieldErrors.membership_date}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Box>
                                            <Typography sx={{ mb: 1, fontWeight: 500 }}>Status of Card</Typography>
                                            <FormControl fullWidth variant="outlined">
                                                <Select
                                                    name="card_status"
                                                    value={data.card_status}
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
                                                    {['In-Process', 'Printed', 'Received', 'Issued', 'Re-Printed', 'E-Card Issued', 'Expired'].map((status) => (
                                                        <MenuItem key={status} value={status}>
                                                            {status}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Box sx={{ mb: 1 }}>
                                            <Typography sx={{ mb: 1, fontWeight: 500 }}>Card Issue Date</Typography>
                                            <TextField
                                                fullWidth
                                                type="date"
                                                InputLabelProps={{ shrink: true }}
                                                placeholder="dd/mm/yyyy"
                                                variant="outlined"
                                                name="card_issue_date"
                                                value={data.card_issue_date}
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
                                                name="card_expiry_date"
                                                value={data.card_expiry_date}
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
                                        <Box>
                                            <Typography sx={{ mb: 1, fontWeight: 500 }}>Membership Status</Typography>
                                            <FormControl fullWidth variant="outlined">
                                                <Select
                                                    name="status"
                                                    value={data.status}
                                                    onChange={handleChange}
                                                    displayEmpty
                                                    renderValue={() => {
                                                        const status = data.status;
                                                        const label = status ? status.replace(/_/g, ' ') : '';
                                                        return status ? <Typography sx={{ textTransform: 'capitalize' }}>{label}</Typography> : <Typography sx={{ color: '#757575' }}>Choose Status</Typography>;
                                                    }}
                                                    sx={{
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#ccc',
                                                        },
                                                    }}
                                                >
                                                    {['active', 'inactive', 'suspended', 'cancelled', 'absent', 'expired', 'terminated', 'not_assign', 'in_suspension_process'].map((status) => {
                                                        const label = status.replace(/_/g, ' ');
                                                        return (
                                                            <MenuItem key={status} value={status} sx={{ textTransform: 'capitalize' }}>
                                                                {label}
                                                            </MenuItem>
                                                        );
                                                    })}
                                                </Select>
                                            </FormControl>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <InputLabel>Upload Documents (PDF or Images)</InputLabel>
                                        <input type="file" multiple accept=".pdf,image/*" name="documents" onChange={handleFileChange} style={{ marginTop: 8, marginBottom: 8 }} />
                                        <Grid container spacing={1}>
                                            {[...(data.previewFiles || [])].map((file, idx) => {
                                                // If it's a string (path from DB), extract filename
                                                const fileName = typeof file === 'string' ? file.split('/').pop() : (file?.name ?? '');

                                                return (
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
                                                                {fileName}
                                                            </Typography>
                                                            <IconButton size="small" onClick={() => handleFileRemove(idx)}>
                                                                <CloseIcon fontSize="small" />
                                                            </IconButton>
                                                        </Box>
                                                    </Grid>
                                                );
                                            })}
                                        </Grid>
                                    </Grid>

                                    {/* Document Missing */}
                                    <Grid item xs={6}>
                                        <Box sx={{ mb: 2 }}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={data.is_document_missing || false}
                                                        onChange={(e) =>
                                                            handleChange({
                                                                target: {
                                                                    name: 'is_document_missing',
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
                                        {data.is_document_missing && (
                                            <Box>
                                                <Typography sx={{ mb: 1, fontWeight: 500 }}>Which document is missing?</Typography>
                                                <TextField
                                                    fullWidth
                                                    multiline
                                                    rows={4}
                                                    placeholder="Enter missing documents"
                                                    variant="outlined"
                                                    name="missing_documents"
                                                    value={data.missing_documents || ''}
                                                    onChange={handleChange}
                                                    sx={{
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#ccc',
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        )}
                                        {fieldErrors.missing_documents && (
                                            <Typography variant="caption" color="error">
                                                {fieldErrors.missing_documents}
                                            </Typography>
                                        )}
                                    </Grid>
                                </Grid>
                            </Grid>

                            {/* FamilyMember Popup */}

                            <Dialog open={openFamilyMember} onClose={() => setOpenFamilyMember(false)} fullWidth maxWidth="lg">
                                <DialogTitle
                                    sx={{
                                        fontWeight: 600,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        pr: 2,
                                    }}
                                >
                                    Family Member Information
                                    <IconButton
                                        onClick={() => setOpenFamilyMember(false)}
                                        sx={{
                                            color: '#666',
                                            '&:hover': { color: '#000' },
                                        }}
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                </DialogTitle>
                                <DialogContent>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={showFamilyMember ? 4 : 12}>
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
                                                    {data.family_members.map((family, index) => (
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
                                                                {family.full_name} ({family.relation})
                                                            </Typography>
                                                            <Box>
                                                                <IconButton size="small" onClick={() => handleEditFamilyMember(index)} sx={{ mr: 1 }}>
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                                <IconButton size="small" onClick={() => handleDeleteFamilyMember(family, index)}>
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Box>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            )}
                                        </Grid>
                                        <Grid item xs={12} md={showFamilyMember ? 8 : 0}>
                                            {showFamilyMember && (
                                                <>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                                        <Typography variant="h6" component="h2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                                            Family Member Information
                                                        </Typography>
                                                        <Box sx={{ borderBottom: '1px dashed #ccc', flexGrow: 1, ml: 2 }}></Box>
                                                    </Box>

                                                    <Box sx={{ mb: 3, display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
                                                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                                                            <Box component="span" sx={{ mr: 1, fontWeight: 500 }}>
                                                                Family Membership Number :
                                                            </Box>
                                                            <Box component="span" sx={{ color: '#666' }}>
                                                                {data.membership_no}-{currentFamilyMember.family_suffix}
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
                                                                        <IconButton size="small" sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f5f5f5' } }} onClick={handleFamilyPictureDelete}>
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
                                                                        {['Father', 'Son', 'Daughter', 'Wife', 'Mother', 'Grand Son', 'Grand Daughter', 'Second Wife', 'Husband', 'Sister', 'Brother', 'Nephew', 'Niece', 'Father in law', 'Mother in Law'].map((item, index) => (
                                                                            <MenuItem key={index} value={item} sx={{ textTransform: 'capitalize' }}>
                                                                                {item}
                                                                            </MenuItem>
                                                                        ))}
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
                                                                <Typography sx={{ mb: 1, fontWeight: 500 }}>Email</Typography>
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
                                                                <Typography sx={{ mb: 1, fontWeight: 500 }}>Barcode Number</Typography>
                                                                <TextField
                                                                    fullWidth
                                                                    placeholder="e.g. 12345-24"
                                                                    variant="outlined"
                                                                    value={currentFamilyMember.barcode_no}
                                                                    onChange={(e) => handleFamilyMemberChange('barcode_no', e.target.value)}
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
                                                        </Grid>
                                                    </Grid>

                                                    <Grid container spacing={2}>
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
                                                    </Grid>

                                                    <Grid container spacing={2}>
                                                        <Grid item xs={6}>
                                                            <Box sx={{ mb: 3 }}>
                                                                <Typography sx={{ mb: 1, fontWeight: 500 }}>Date of Birth *</Typography>
                                                                <TextField
                                                                    fullWidth
                                                                    type="date"
                                                                    InputLabelProps={{ shrink: true }}
                                                                    placeholder="dd/mm/yyyy"
                                                                    variant="outlined"
                                                                    name="date_of_birth"
                                                                    error={!!familyMemberErrors.date_of_birth}
                                                                    helperText={familyMemberErrors.date_of_birth}
                                                                    value={currentFamilyMember.date_of_birth}
                                                                    onChange={(e) => handleFamilyMemberChange('date_of_birth', e.target.value)}
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
                                                                <Typography sx={{ mb: 1, fontWeight: 500 }}>Card Issue Date</Typography>
                                                                <TextField
                                                                    fullWidth
                                                                    type="date"
                                                                    InputLabelProps={{ shrink: true }}
                                                                    placeholder="Select date"
                                                                    variant="outlined"
                                                                    value={currentFamilyMember.card_issue_date}
                                                                    onChange={(e) => handleFamilyMemberChange('card_issue_date', e.target.value)}
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
                                                                    placeholder="Select date"
                                                                    variant="outlined"
                                                                    value={currentFamilyMember.card_expiry_date}
                                                                    onChange={(e) => handleFamilyMemberChange('card_expiry_date', e.target.value)}
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
                                                                <Typography sx={{ mb: 1, fontWeight: 500 }}>Card Status</Typography>
                                                                <Select
                                                                    name="status"
                                                                    value={currentFamilyMember.status}
                                                                    onChange={(e) => handleFamilyMemberChange('status', e.target.value)}
                                                                    displayEmpty
                                                                    renderValue={() => {
                                                                        const status = currentFamilyMember.status;
                                                                        const label = status ? status.replace(/_/g, ' ') : '';
                                                                        return status ? <Typography sx={{ textTransform: 'capitalize' }}>{status}</Typography> : <Typography sx={{ color: '#757575' }}>Choose Status</Typography>;
                                                                    }}
                                                                    sx={{
                                                                        width: '100%',
                                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                                            borderColor: '#ccc',
                                                                        },
                                                                    }}
                                                                >
                                                                    {['active', 'inactive', 'suspended', 'cancelled', 'absent', 'expired', 'terminated', 'not_assign', 'in_suspension_process'].map((status) => {
                                                                        const label = status.replace(/_/g, ' ');
                                                                        return (
                                                                            <MenuItem key={status} value={status} sx={{ textTransform: 'capitalize' }}>
                                                                                {label}
                                                                            </MenuItem>
                                                                        );
                                                                    })}
                                                                </Select>
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
                                                </>
                                            )}
                                        </Grid>
                                    </Grid>
                                </DialogContent>
                            </Dialog>
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
