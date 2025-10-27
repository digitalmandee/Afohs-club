import React, { useState, useRef, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import CreateRoom from '@/components/App/Rooms/Create';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const AddRoom = () => {
    const [open, setOpen] = useState(true);
    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                }}
            >
                <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '20px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <IconButton sx={{ color: '#063455' }} onClick={() => router.visit(route('rooms.manage'))}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h5" component="h1" sx={{ ml: 1, fontWeight: 500, fontSize: '30px', color: '#063455' }}>
                            Add Room
                        </Typography>
                    </Box>
                    <Box sx={{ maxWidth: 600, margin: '0 auto', border: '1px solid #E3E3E3', bgcolor: '#FFFFFF' }}>
                        <Paper sx={{ p: 3 }}>
                            {/* Form Fields */}
                            <CreateRoom />
                        </Paper>
                    </Box>
                </div>
            </div>
        </>
    );
};

export default AddRoom;
