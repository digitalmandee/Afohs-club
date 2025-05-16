import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    TextField,
    Button,
    Typography,
    Box,
    Paper,
    InputAdornment,
    IconButton,
    Select,
    styled,
    Grid,
    FormControl
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {
    ArrowBack as ArrowBackIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon
} from '@mui/icons-material';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router } from '@inertiajs/react';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const AddMemberInformation = () => {
    const [open, setOpen] = useState(false);
    // State for form fields
    const [formData, setFormData] = useState({
        guestName: '',
        phone: '',
        clubName: '',
        authorizedBy: '',
        checkInDate: '',
        checkInTime: ''
    });

    const FormContainer = styled(Paper)(({ theme }) => ({
        padding: theme.spacing(3),
        maxWidth: 500,
        margin: '0 auto',
        borderRadius: 4,
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)'
    }));

    const FormField = styled(TextField)(({ theme }) => ({
        marginBottom: theme.spacing(2),
        '& .MuiOutlinedInput-root': {
            borderRadius: 4
        }
    }));

    const ActionButton = styled(Button)(({ theme }) => ({
        borderRadius: 4,
        padding: theme.spacing(1, 3),
        textTransform: 'none',
        fontWeight: 500
    }));

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // Add your form submission logic here
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
                }}
            >
                <div style={{
                    fontFamily: 'Arial, sans-serif',
                    padding: '20px',
                    backgroundColor: '#f5f5f5',
                    minHeight: '100vh'
                }}>
                    {/* Header with back button and title */}
                    <div className="d-flex align-items-center mb-4">
                        <ArrowBackIcon style={{
                            cursor: 'pointer',
                            marginRight: '10px',
                            color: '#555',
                            fontSize: '24px'
                        }} />
                        <Typography variant="h5" style={{
                            fontWeight: 500,
                            color: '#333',
                            fontSize: '24px'
                        }}>
                            Add Membership Type
                        </Typography>
                    </div>

                    {/* Form Card */}
                    <FormContainer>
                        <Box component="form" noValidate autoComplete="off">
                            <Box mb={2}>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Name of type
                                </Typography>
                                <FormField
                                    fullWidth
                                    placeholder="e.g: Affiliated"
                                    variant="outlined"
                                    size="small"
                                />
                            </Box>

                            <Box mb={2}>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Duration
                                </Typography>
                                <FormField
                                    fullWidth
                                    placeholder="e.g: 1 Year"
                                    variant="outlined"
                                    size="small"
                                />
                            </Box>

                            <Box mb={2}>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Fee
                                </Typography>
                                <FormField
                                    fullWidth
                                    placeholder="e.g: 15,000"
                                    variant="outlined"
                                    size="small"
                                />
                            </Box>

                            <Box mb={2}>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Maintenance Fee
                                </Typography>
                                <FormField
                                    fullWidth
                                    placeholder="e.g: Monthly"
                                    variant="outlined"
                                    size="small"
                                />
                            </Box>

                            <Grid container spacing={2} mb={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        Discount (Rs)
                                    </Typography>
                                    <FormField
                                        fullWidth
                                        placeholder="e.g: 30 Rs"
                                        variant="outlined"
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        Discount (%)
                                    </Typography>
                                    <FormField
                                        fullWidth
                                        placeholder="e.g: 30%"
                                        variant="outlined"
                                        size="small"
                                    />
                                </Grid>
                            </Grid>

                            <Box mb={2}>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Discount Authorized by
                                </Typography>
                                <FormField
                                    fullWidth
                                    placeholder="e.g: Bilal Ahmad"
                                    variant="outlined"
                                    size="small"
                                />
                            </Box>

                            <Box mb={3}>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Benefit
                                </Typography>
                                <FormField
                                    fullWidth
                                    placeholder="e.g: Room Discount (30%)"
                                    variant="outlined"
                                    size="small"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton edge="end" size="small">
                                                    <AddIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>

                            <Box display="flex" justifyContent="flex-end" gap={1}>
                                <ActionButton variant="outlined" color="inherit">
                                    Cancel
                                </ActionButton>
                                <ActionButton
                                    variant="contained"
                                    sx={{
                                        bgcolor: '#0a3d62',
                                        '&:hover': { bgcolor: '#0c2461' }
                                    }}
                                >
                                    Create
                                </ActionButton>
                            </Box>
                        </Box>
                    </FormContainer>
                </div>
            </div>
        </>
    );
};

export default AddMemberInformation;