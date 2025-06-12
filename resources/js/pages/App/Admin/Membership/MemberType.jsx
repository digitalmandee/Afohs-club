import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Card, CardContent, Typography, IconButton, Box, Menu, MenuItem, Grid } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Add as AddIcon, MoreVert as MoreVertIcon, Check as CheckIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { usePage } from '@inertiajs/react';
import { enqueueSnackbar } from 'notistack';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const MembersType = ({ memberTypesData }) => {
    const [open, setOpen] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [memberTypes, setMemberTypes] = useState(memberTypesData || []); // State to manage member types dynamically
    const { props } = usePage();
    const csrfToken = props._token;

    const formattedMemberTypes = memberTypes.map((type) => ({
        title: type.name || 'N/A',
        fee: type.fee ? `${type.fee.toLocaleString()}` : 'N/A',
        duration: type.duration ? `${type.duration} month${type.duration > 1 ? 's' : ''}` : 'N/A',
        discountPercent: type.fee && type.discount ? `${((type.discount / type.fee) * 100).toFixed(0)}%` : 'N/A',
        discountAmount: type.discount ? `${type.discount} Rs` : 'N/A',
        maintenanceFee: type.maintenance_fee ? `${type.maintenance_fee.toLocaleString()}` : 'N/A',
        benefits: type.benefit || [],
        id: type.id,
        discountAuthorized: type.discount_authorized || 'N/A',
    }));

    const handleMenuOpen = (event, member) => {
        setAnchorEl(event.currentTarget);
        setSelectedMember(member);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedMember(null);
    };

    const handleEdit = () => {
        if (selectedMember) {
            router.visit(route('member-types.edit', selectedMember.id));
        }
        handleMenuClose();
    };

    const handleDelete = async () => {
        if (selectedMember) {
            try {
                // await axios.delete(`/members/member-types/${selectedMember.id}//delete`, {
                await axios.delete(`/members/member-types/${selectedMember.id}/delete`, {
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                    },
                });
                // Update the state to remove the deleted member type
                setMemberTypes((prev) => prev.filter((type) => type.id !== selectedMember.id));
                enqueueSnackbar('Member Type deleted successfully.', { variant: 'success' });
            } catch (error) {
                console.error('Failed to delete:', error.response?.data);
                enqueueSnackbar('Failed to delete Member Type: ' + (error.response?.data?.message || error.message), { variant: 'error' });
            }
        }
        handleMenuClose();
    };

    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <Box
                sx={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                    backgroundColor: '#F6F6F6',
                    minHeight: '100vh',
                    padding: '20px',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 4,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton>
                            <ArrowBackIcon sx={{ color: '#555', fontSize: '24px' }} />
                        </IconButton>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 500,
                                color: '#333',
                                fontSize: '24px',
                            }}
                        >
                            Members Type
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{
                            backgroundColor: '#003366',
                            textTransform: 'none',
                            color: 'white',
                            borderRadius: '4px',
                            padding: '8px 16px',
                            fontSize: '14px',
                            '&:hover': { backgroundColor: '#002244' },
                        }}
                        onClick={() => router.visit('/admin/membership/add/membertype')}
                    >
                        Add Type
                    </Button>
                </Box>
                <Grid container spacing={3}>
                    {formattedMemberTypes.map((type, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card
                                sx={{
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    height: '100%',
                                    border: '1px solid #E3E3E3',
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'scale(1.02)' },
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        p: 2,
                                        borderBottom: '1px dashed #E0E0E0',
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontWeight: 500,
                                            color: '#003366',
                                            fontSize: '16px',
                                        }}
                                    >
                                        {type.title}
                                    </Typography>
                                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, type)}>
                                        <MoreVertIcon sx={{ color: '#555' }} />
                                    </IconButton>
                                </Box>
                                <CardContent sx={{ pt: 2, pb: 3, px: 2 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            mb: 1,
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography sx={{ color: '#777', fontSize: '12px', mr: 1 }}>Fee:</Typography>
                                            <Typography sx={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>{type.fee}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography sx={{ color: '#777', fontSize: '12px', mr: 1 }}>Duration:</Typography>
                                            <Typography sx={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>{type.duration}</Typography>
                                        </Box>
                                    </Box>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            mb: 1,
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography sx={{ color: '#777', fontSize: '12px', mr: 1 }}>Discount:</Typography>
                                            <Typography sx={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>{type.discountPercent}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography sx={{ color: '#777', fontSize: '12px', mr: 1 }}>Discount:</Typography>
                                            <Typography sx={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>{type.discountAmount}</Typography>
                                        </Box>
                                    </Box>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            mb: 1,
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography sx={{ color: '#777', fontSize: '12px', mr: 1 }}>Maintenance Fee:</Typography>
                                            <Typography sx={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>{type.maintenanceFee}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography sx={{ color: '#777', fontSize: '12px', mr: 1 }}>Discount Authorized:</Typography>
                                            <Typography sx={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>{type.discountAuthorized}</Typography>
                                        </Box>
                                    </Box>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            flexWrap: 'wrap',
                                            gap: 3,
                                        }}
                                    >
                                        <Box sx={{ flex: 1, minWidth: '250px' }}>
                                            <Typography sx={{ color: '#777', fontSize: '12px', mb: 1 }}>Benefits:</Typography>
                                            {type.benefits.map((benefit, i) => (
                                                <Box
                                                    key={i}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        mb: 1,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: '20px',
                                                            height: '20px',
                                                            borderRadius: '4px',
                                                            backgroundColor: '#003366',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            mr: 1,
                                                        }}
                                                    >
                                                        <CheckIcon sx={{ color: 'white', fontSize: '16px' }} />
                                                    </Box>
                                                    <Typography sx={{ color: '#555', fontSize: '14px' }}>{benefit}</Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    <MenuItem onClick={handleEdit}>
                        <EditIcon sx={{ mr: 1 }} />
                        Edit
                    </MenuItem>
                    <MenuItem onClick={handleDelete}>
                        <DeleteIcon sx={{ mr: 1 }} />
                        Delete
                    </MenuItem>
                </Menu>
            </Box>
        </>
    );
};

export default MembersType;
