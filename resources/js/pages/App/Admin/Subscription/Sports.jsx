import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Card, CardContent, Typography, IconButton, Box, Menu, MenuItem, Grid } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Add as AddIcon, MoreVert as MoreVertIcon, Check as CheckIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router } from '@inertiajs/react';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const SportsCategory = () => {
    const [open, setOpen] = useState(true);

    const categories = [
        {
            title: 'Swimming Pool',
            fee: '20.00',
            duration: '1 Year',
            status: 'Active',
            feeCyclic: 'Monthly',
        },
        {
            title: 'Billiard',
            fee: '20.00',
            duration: '1 Year',
            status: 'Active',
            feeCyclic: 'Monthly',
        },
        {
            title: 'Squared Court',
            fee: '20.00',
            duration: '1 Year',
            status: 'Active',
            feeCyclic: 'Monthly',
        },
    ];

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
                        {/* <IconButton>
                            <ArrowBackIcon sx={{ color: '#555', fontSize: '24px' }} />
                        </IconButton> */}
                        <Typography variant="h5" sx={{ fontWeight: 500, color: '#333', fontSize: '24px' }}>
                            Sports Category
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
                        onClick={()=>router.visit('/admin/subscription/add/sports/category')}
                    >
                        Add Category
                    </Button>
                </Box>

                <Grid container spacing={3}>
                    {categories.map((type, index) => (
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
                                    <IconButton size="small">
                                        <MoreVertIcon sx={{ color: '#555' }} />
                                    </IconButton>
                                </Box>
                                <CardContent sx={{ pt: 2, pb: 3, px: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography sx={{ fontSize: '14px', color: '#777' }}>
                                            <strong>Fee:</strong> {type.fee}
                                        </Typography>
                                        <Typography sx={{ fontSize: '14px', color: '#777' }}>
                                            <strong>Duration:</strong> {type.duration}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography sx={{ fontSize: '14px', color: '#777' }}>
                                            <strong>Status:</strong> {type.status}
                                        </Typography>
                                        <Typography sx={{ fontSize: '14px', color: '#777' }}>
                                            <strong>Fee Cyclic:</strong> {type.feeCyclic}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </>
    );
};

export default SportsCategory;
