'use client';

import SideNav from '@/components/App/SideBar/SideNav';
import { Add, ArrowBack, Delete, ExpandMore } from '@mui/icons-material';
import { Box, Button, Container, FormControl, Grid, IconButton, MenuItem, Paper, Select, TextField, Typography } from '@mui/material';
import { useState } from 'react';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const AddNewFloor = () => {
    const [open, setOpen] = useState(false);
    const [capacity, setCapacity] = useState('2 Person');
    const [tableNumber, setTableNumber] = useState('T-01');
    const [modalOpen, setModalOpen] = useState(true);

    const handleCapacityChange = (event) => {
        setCapacity(event.target.value);
    };

    const handleTableNumberChange = (event) => {
        setTableNumber(event.target.value);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

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
                <Container maxWidth="xl" sx={{ height: '100vh', py: 1, px: 2 }}>
                    <Box
                        sx={{
                            height: 'calc(100% - 20px)',
                            width: '100%',
                            bgcolor: '#0d3b5c',
                            position: 'relative',
                            overflow: 'hidden',
                            borderRadius: 3,
                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        {/* Header */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                p: 2,
                                display: 'flex',
                                alignItems: 'center',
                                zIndex: 1,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    bgcolor: 'white',
                                    mr: 1.5,
                                }}
                            />
                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                                Untitled Floor • Untitled Area
                            </Typography>
                        </Box>

                        {/* Grid pattern */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
                                backgroundSize: '20px 20px',
                            }}
                        />

                        {/* Center message */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                textAlign: 'center',
                                maxWidth: 250,
                                display: modalOpen ? 'none' : 'block', // Hide when modal is open
                            }}
                        >
                            <Typography variant="body2" sx={{ color: 'white' }}>
                                You need to fill out the properties form to view table at here
                            </Typography>
                        </Box>

                        {/* Right side modal - positioned inside the blue container */}
                        {modalOpen && (
                            <Paper
                                elevation={4}
                                sx={{
                                    position: 'absolute',
                                    top: 5,
                                    right: 10,
                                    bottom: 5,
                                    width: 400,
                                    borderTopLeftRadius: 12,
                                    borderBottomLeftRadius: 12,
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    boxShadow: '-4px 0 10px rgba(0, 0, 0, 0.15)',
                                }}
                            >
                                {/* Header */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        p: 2,
                                        borderBottom: '1px solid #e0e0e0',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <IconButton size="small" sx={{ mr: 1 }} onClick={handleCloseModal}>
                                            <ArrowBack fontSize="small" />
                                        </IconButton>
                                        <Typography variant="subtitle1">Add New Floor</Typography>
                                    </Box>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        sx={{
                                            bgcolor: '#0d3b5c',
                                            '&:hover': { bgcolor: '#0a2e4a' },
                                            textTransform: 'none',
                                            px: 3,
                                        }}
                                    >
                                        Save
                                    </Button>
                                </Box>

                                {/* Table List Section */}
                                <Box sx={{ p: 2 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mb: 2,
                                        }}
                                    >
                                        <Typography variant="subtitle2">Table List</Typography>
                                        <IconButton size="small">
                                            <ExpandMore fontSize="small" />
                                        </IconButton>
                                    </Box>

                                    <Grid container spacing={2} alignItems="center" sx={{ mb: 1 }}>
                                        <Grid item xs={5}>
                                            <Typography variant="body2" color="text.secondary">
                                                Table Number
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={5}>
                                            <Typography variant="body2" color="text.secondary">
                                                Capacity
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={2}></Grid>
                                    </Grid>

                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={5}>
                                            <TextField
                                                size="small"
                                                value={tableNumber}
                                                onChange={handleTableNumberChange}
                                                fullWidth
                                                InputProps={{
                                                    sx: { borderRadius: 1 },
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={5}>
                                            <FormControl fullWidth size="small">
                                                <Select value={capacity} onChange={handleCapacityChange} displayEmpty sx={{ borderRadius: 1 }}>
                                                    <MenuItem value="2 Person">2 Person</MenuItem>
                                                    <MenuItem value="4 Person">4 Person</MenuItem>
                                                    <MenuItem value="6 Person">6 Person</MenuItem>
                                                    <MenuItem value="8 Person">8 Person</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={2} sx={{ textAlign: 'center' }}>
                                            <IconButton size="small">
                                                <Delete fontSize="small" sx={{ color: '#d32f2f' }} />
                                            </IconButton>
                                        </Grid>
                                    </Grid>

                                    <Button
                                        startIcon={<Add />}
                                        sx={{
                                            mt: 2,
                                            color: '#0d3b5c',
                                            textTransform: 'none',
                                            fontWeight: 500,
                                        }}
                                    >
                                        Add Table
                                    </Button>
                                </Box>
                            </Paper>
                        )}
                    </Box>
                </Container>
            </div>
        </>
    );
};

export default AddNewFloor;
