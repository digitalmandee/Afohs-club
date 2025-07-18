import { useEffect, useState } from 'react';
import { TextField, Button, Paper, Typography, Box, IconButton, Checkbox, FormControlLabel } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

export default function AppliedMemberForm({ memberData = null, onBack }) {
    const [open, setOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const { props } = usePage();
    const csrfToken = props._token;

    const isEditMode = Boolean(memberData);

    const [formData, setFormData] = useState({
        member_id: '',
        name: '',
        email: '',
        phone_number: '',
        address: '',
        cnic: '',
        amount_paid: '',
        start_date: '',
        end_date: '',
        is_permanent_member: false,
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEditMode) {
            setFormData({
                member_id: memberData.member_id || '',
                name: memberData.name || '',
                email: memberData.email || '',
                phone_number: memberData.phone_number || '',
                address: memberData.address || '',
                cnic: memberData.cnic || '',
                amount_paid: memberData.amount_paid !== null ? memberData.amount_paid.toString() : '',
                start_date: memberData.start_date || '',
                end_date: memberData.end_date || '',
                is_permanent_member: memberData.is_permanent_member || false,
            });
        }
    }, [memberData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        if (value.length <= 11 && /^[0-9]*$/.test(value)) {
            setFormData((prev) => ({ ...prev, phone_number: value }));
            setErrors((prev) => ({ ...prev, phone_number: '' }));
        } else {
            setErrors((prev) => ({ ...prev, phone_number: 'Phone number must be exactly 11 digits.' }));
        }
    };

    const handleCnicChange = (e) => {
        let value = e.target.value.replace(/[^0-9]/g, '');

        if (value.length > 13) {
            value = value.slice(0, 13);
        }

        let formatted = value;
        if (value.length >= 6 && value.length <= 12) {
            formatted = `${value.slice(0, 5)}-${value.slice(5)}`;
        } else if (value.length === 13) {
            formatted = `${value.slice(0, 5)}-${value.slice(5, 12)}-${value.slice(12)}`;
        }

        setFormData((prev) => ({ ...prev, cnic: formatted }));
        setErrors((prev) => ({ ...prev, cnic: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('handleSubmit called', { formData, isEditMode, route: isEditMode ? route('applied-member.update', memberData.id) : route('applied-member.store') });

        // Validate phone number
        if (formData.phone_number.length !== 11) {
            setErrors((prev) => ({ ...prev, phone_number: 'Phone number must be exactly 11 digits.' }));
            enqueueSnackbar('Phone number must be exactly 11 digits.', { variant: 'error' });
            return;
        }

        // Validate CNIC
        const cnicDigits = formData.cnic.replace(/[^0-9]/g, '');
        if (formData.cnic && cnicDigits.length !== 13) {
            setErrors((prev) => ({ ...prev, cnic: 'CNIC must be exactly 13 digits.' }));
            enqueueSnackbar('CNIC must be exactly 13 digits.', { variant: 'error' });
            return;
        }

        // Validate amount paid
        if (formData.amount_paid === '' || isNaN(parseFloat(formData.amount_paid))) {
            setErrors((prev) => ({ ...prev, amount_paid: 'Amount paid is required and must be a valid number.' }));
            enqueueSnackbar('Amount paid is required and must be a valid number.', { variant: 'error' });
            return;
        }

        // Validate member_id (optional, but must be numeric if provided)
        if (formData.member_id && (isNaN(parseInt(formData.member_id)) || parseInt(formData.member_id) <= 0)) {
            setErrors((prev) => ({ ...prev, member_id: 'Member ID must be a valid positive number.' }));
            enqueueSnackbar('Member ID must be a valid positive number.', { variant: 'error' });
            return;
        }

        const dataToSubmit = {
            member_id: formData.member_id ? parseInt(formData.member_id) : null,
            name: formData.name,
            email: formData.email,
            phone_number: formData.phone_number,
            address: formData.address || null,
            cnic: formData.cnic, // Use formatted CNIC directly
            amount_paid: formData.amount_paid ? parseFloat(formData.amount_paid) : 0,
            start_date: formData.start_date,
            end_date: formData.end_date,
            is_permanent_member: formData.is_permanent_member,
        };

        try {
            setLoading(true);
            setErrors({});

            if (isEditMode) {
                await axios.put(route('applied-member.update', memberData.id), dataToSubmit, {
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                    },
                });
                enqueueSnackbar('Applied member updated successfully.', { variant: 'success' });
            } else {
                await axios.post(route('applied-member.store'), dataToSubmit, {
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                    },
                });
                enqueueSnackbar('Applied member created successfully.', { variant: 'success' });
            }

            router.visit(route('applied-member.index'));
        } catch (error) {
            console.error('Submission error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });

            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
                // Display the first server-side validation error
                const firstError = Object.values(error.response.data.errors)[0][0];
                enqueueSnackbar(firstError, { variant: 'error' });
            } else if (error.response?.status === 419) {
                enqueueSnackbar('CSRF token mismatch. Please refresh the page.', { variant: 'error' });
            } else if (error.response?.status === 404) {
                enqueueSnackbar('API route not found. Please check the backend configuration.', { variant: 'error' });
            } else {
                enqueueSnackbar('Failed to save applied member: ' + (error.response?.data?.error || error.message), { variant: 'error' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div
                style={{
                    backgroundColor: '#F6F6F6',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2, width: '600px' }}>
                    <IconButton onClick={() => router.get(route('applied-member.index'))} sx={{ color: '#000' }}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h5" sx={{ ml: 1 }}>
                        {isEditMode ? 'Edit Applied Member' : 'Add Applied Member'}
                    </Typography>
                </Box>
                <Paper sx={{ p: 3, maxWidth: '600px', width: '100%' }}>
                    <form onSubmit={handleSubmit}>
                        <Box sx={{ mb: 2 }}>
                            <Typography>Member ID</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                name="member_id"
                                value={formData.member_id}
                                onChange={handleInputChange}
                                type="number"
                                error={!!errors.member_id}
                                helperText={errors.member_id || 'Must be unique if provided'}
                            />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography>Name *</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                error={!!errors.name}
                                helperText={errors.name}
                            />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography>Email *</Typography>
                            <TextField
                                type="email"
                                fullWidth
                                size="small"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                error={!!errors.email}
                                helperText={errors.email}
                            />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography>Phone Number *</Typography>
                            <TextField
                                type="tel"
                                inputProps={{ maxLength: 11 }}
                                fullWidth
                                size="small"
                                name="phone_number"
                                placeholder="Enter 11-digit phone number"
                                value={formData.phone_number}
                                onChange={handlePhoneChange}
                                required
                                error={!!errors.phone_number}
                                helperText={errors.phone_number}
                            />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography>Address</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                error={!!errors.address}
                                helperText={errors.address}
                            />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography>CNIC *</Typography>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="XXXXX-XXXXXXX-X"
                                size="small"
                                name="cnic"
                                value={formData.cnic}
                                error={!!errors.cnic}
                                helperText={errors.cnic}
                                onChange={handleCnicChange}
                                inputProps={{ maxLength: 15 }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }}
                            />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography>Amount Paid *</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                name="amount_paid"
                                value={formData.amount_paid}
                                onChange={handleInputChange}
                                type="number"
                                inputProps={{ min: 0, step: '0.01' }}
                                required
                                error={!!errors.amount_paid}
                                helperText={errors.amount_paid}
                            />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography>Start Date *</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                name="start_date"
                                disabled={isEditMode}
                                value={formData.start_date}
                                onChange={handleInputChange}
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                required
                                error={!!errors.start_date}
                                helperText={errors.start_date}
                            />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography>End Date *</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                name="end_date"
                                value={formData.end_date}
                                onChange={handleInputChange}
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                required
                                error={!!errors.end_date}
                                helperText={errors.end_date}
                            />
                        </Box>
                        {isEditMode &&
                            <Box sx={{ mb: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            name="is_permanent_member"
                                            checked={formData.is_permanent_member}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    is_permanent_member: e.target.checked,
                                                }))
                                            }
                                        />
                                    }
                                    label="Make Permanent Member"
                                />
                            </Box>
                        }
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button variant="outlined" onClick={() => router.get(route('applied-member.index'))}>
                                Cancel
                            </Button>
                            <Button
                                disabled={loading}
                                variant="contained"
                                type="submit"
                                sx={{ backgroundColor: '#0c4b6e', '&:hover': { backgroundColor: '#083854' } }}
                            >
                                {isEditMode ? (loading ? 'Updating...' : 'Update') : (loading ? 'Saving...' : 'Save')}

                            </Button>
                        </Box>
                    </form>
                </Paper>
            </div>
        </>
    );
}
