import { useEffect, useState } from 'react';
import { TextField, Button, Paper, Typography, Box, IconButton, MenuItem } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';

const AddEditMembershipCategory = ({ onBack }) => {
    // const [open, setOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const { props } = usePage();
    const csrfToken = props._token;
    const memberCategory = props.memberCategory ?? null;

    const isEditMode = Boolean(memberCategory);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        fee: '',
        subscription_fee: '',
        status: 'active',
    });

    useEffect(() => {
        if (isEditMode) {
            setFormData({
                name: memberCategory.name || '',
                description: memberCategory.description || '',
                fee: memberCategory.fee ?? '',
                subscription_fee: memberCategory.subscription_fee ?? '',
                status: memberCategory.status || 'active',
            });
        }
    }, [memberCategory]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const dataToSubmit = {
            name: formData.name,
            description: formData.description || null,
            fee: formData.fee ? parseInt(formData.fee, 10) : 0,
            subscription_fee: formData.subscription_fee ? parseInt(formData.subscription_fee, 10) : 0,
            status: formData.status,
        };

        try {
            setLoading(true);

            if (isEditMode) {
                console.log(route('member-categories.update', memberCategory.id));

                await axios.put(route('member-categories.update', memberCategory.id), dataToSubmit, {
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                    },
                });
                enqueueSnackbar('Membership category updated successfully.', { variant: 'success' });
            } else {
                await axios.post(route('member-categories.store'), dataToSubmit, {
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                    },
                });
                enqueueSnackbar('Membership category created successfully.', { variant: 'success' });
            }

            router.visit(route('member-categories.index'));
        } catch (error) {
            enqueueSnackbar('Failed to save membership category.', { variant: 'error' });
            console.error(error.response?.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    marginTop: '5rem',
                    backgroundColor: '#F6F6F6',
                    
                }}
            > */}
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2, width: '600px' }}>
                    <IconButton onClick={onBack} sx={{ color: '#000' }}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h5" sx={{ ml: 1 }}>
                        {isEditMode ? 'Edit Membership Category' : 'Add Membership Category'}
                    </Typography>
                </Box>
                <Paper sx={{ p: 3, maxWidth: '600px', width: '100%' }}>
                    <form onSubmit={handleSubmit}>
                        <Box sx={{ mb: 2 }}>
                            <Typography>Name</Typography>
                            <TextField fullWidth size="small" name="name" value={formData.name} onChange={handleInputChange} required />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography>Description</Typography>
                            <TextField fullWidth size="small" name="description" value={formData.description} onChange={handleInputChange} multiline rows={2} />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography>Fee</Typography>
                            <TextField fullWidth size="small" name="fee" value={formData.fee} onChange={handleInputChange} type="number" required />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography>Subscription Fee</Typography>
                            <TextField fullWidth size="small" name="subscription_fee" value={formData.subscription_fee} onChange={handleInputChange} type="number" required />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography>Status</Typography>
                            <TextField select fullWidth size="small" name="status" value={formData.status} onChange={handleInputChange}>
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                            </TextField>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button variant="outlined" onClick={onBack}>
                                Cancel
                            </Button>
                            <Button disabled={loading} variant="contained" type="submit" sx={{ backgroundColor: '#0c4b6e', '&:hover': { backgroundColor: '#083854' } }}>
                                {loading ? 'Saving...' : 'Save'}
                            </Button>
                        </Box>
                    </form>
                </Paper>
            </div>
        </>
    );
};

export default AddEditMembershipCategory;
