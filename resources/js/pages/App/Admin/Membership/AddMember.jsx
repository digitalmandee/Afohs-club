import { useState } from 'react';
import { TextField, Button, Paper, Typography, Box, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { usePage } from '@inertiajs/react';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const AddMember = ({ onNext, onBack }) => {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        nameOfType: '',
        duration: '',
        fee: '',
        maintenanceFee: '',
        discountType: 'percentage',
        discountValue: '',
        discountAuthorizedBy: '',
        benefit: '', // Comma-separated string
    });

    const { props } = usePage();
    const csrfToken = props._token;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const dataToSubmit = {
            name: formData.nameOfType,
            duration: formData.duration ? parseInt(formData.duration, 10) : null,
            fee: formData.fee ? parseFloat(formData.fee) : null,
            maintenance_fee: formData.maintenanceFee ? parseFloat(formData.maintenanceFee) : null,
            discount_type: formData.discountType,
            discount_value: formData.discountValue ? parseFloat(formData.discountValue) : 0,
            discount_authorized: formData.discountAuthorizedBy,
            benefit: formData.benefit ? formData.benefit.split(',').map((b) => b.trim()) : [],
        };

        try {
            await axios.post('/members/member-types/store', dataToSubmit, {
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                },
            });

            enqueueSnackbar('Member Type created successfully.', { variant: 'success' });
            setFormData({
                nameOfType: '',
                duration: '',
                fee: '',
                maintenanceFee: '',
                discountType: 'percentage',
                discountValue: '',
                discountAuthorizedBy: '',
                benefit: '',
            });

            window.location.href = '/members/member-types';
        } catch (error) {
            console.error('Failed to save:', error.response?.data);
            enqueueSnackbar('Failed to create Member Type: ' + (error.response?.data?.message || error.message), { variant: 'error' });
        }
    };

    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                    backgroundColor: '#F6F6F6',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2, width: '600px' }}>
                    <IconButton onClick={onBack} sx={{ color: '#000' }}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h5" component="h1" sx={{ ml: 1, fontWeight: 500, color: '#333' }}>
                        Add Membership Type
                    </Typography>
                </Box>
                <Paper sx={{ p: 3, boxShadow: 'none', border: '1px solid #e0e0e0', maxWidth: '600px', width: '100%' }}>
                    <form onSubmit={handleSubmit}>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                Name of type
                            </Typography>
                            <TextField fullWidth variant="outlined" placeholder="e.g. Affiliated" size="small" name="nameOfType" value={formData.nameOfType} onChange={handleInputChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} required />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                Duration (months)
                            </Typography>
                            <TextField fullWidth variant="outlined" placeholder="e.g. 1" size="small" name="duration" value={formData.duration} onChange={handleInputChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} required type="number" />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                Fee
                            </Typography>
                            <TextField fullWidth variant="outlined" placeholder="e.g. 15000" size="small" name="fee" value={formData.fee} onChange={handleInputChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} required />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                Maintenance Fee
                            </Typography>
                            <TextField fullWidth variant="outlined" placeholder="e.g. 1500" size="small" name="maintenanceFee" value={formData.maintenanceFee} onChange={handleInputChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} required type="number" />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Discount Type
                                </Typography>
                                <TextField select SelectProps={{ native: true }} fullWidth size="small" name="discountType" value={formData.discountType} onChange={handleInputChange}>
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="amount">Amount (Rs)</option>
                                </TextField>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Discount Value
                                </Typography>
                                <TextField fullWidth variant="outlined" placeholder="e.g. 30" size="small" name="discountValue" value={formData.discountValue} onChange={handleInputChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} type="number" />
                            </Box>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                Discount Authorized by
                            </Typography>
                            <TextField fullWidth variant="outlined" placeholder="e.g. Bilal Ahmad" size="small" name="discountAuthorizedBy" value={formData.discountAuthorizedBy} onChange={handleInputChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} required />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                Benefits (comma-separated)
                            </Typography>
                            <TextField fullWidth variant="outlined" placeholder="e.g. Free Passes,Discount (10%)" size="small" name="benefit" value={formData.benefit} onChange={handleInputChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} required />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
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
                                type="submit"
                                sx={{
                                    textTransform: 'none',
                                    backgroundColor: '#0c4b6e',
                                    '&:hover': { backgroundColor: '#083854' },
                                }}
                            >
                                Create
                            </Button>
                        </Box>
                    </form>
                </Paper>
            </div>
        </>
    );
};

export default AddMember;
