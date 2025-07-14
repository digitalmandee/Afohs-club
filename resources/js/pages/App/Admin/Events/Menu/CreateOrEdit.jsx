import React, { useEffect, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Box, Grid, TextField, Select, MenuItem, FormControl, InputLabel, Typography, Button, IconButton } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import SideNav from '@/components/App/AdminSideBar/SideNav';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const CreateOrEditMenu = ({ eventMenu = null, menuItems }) => {
    const [open, setOpen] = useState(true);

    const [allItems, setAllItems] = useState(menuItems || []);

    const { data, setData, post, put, processing, errors } = useForm({
        name: eventMenu?.name || '',
        status: eventMenu?.status || 'active',
        amount: eventMenu?.amount || '',
        items: eventMenu?.items || [{ id: '', name: '' }],
    });

    const handleItemChange = (index, id) => {
        const item = allItems.find((i) => i.id === id);
        const updated = [...data.items];
        updated[index] = item;
        setData('items', updated);
    };

    const addItem = () => setData('items', [...data.items, { id: '', name: '' }]);
    const removeItem = (index) => {
        if (index === 0) return;
        const updated = [...data.items];
        updated.splice(index, 1);
        setData('items', updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (eventMenu) {
            put(route('event-menu.update', { id: eventMenu.id }));
        } else {
            post(route('event-menu.store'));
        }
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
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }} onClick={() => router.visit(route('events.dashboard'))}>
                    <IconButton>
                        <ArrowBackIcon sx={{ color: '#555' }} />
                    </IconButton>
                    <Typography variant="h5" sx={{ fontWeight: 500, color: '#333' }}>
                        {eventMenu ? 'Edit Event Menu' : 'Create Event Menu'}
                    </Typography>
                </Box>
                <Box sx={{ p: 3 }}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Menu Name" fullWidth value={data.name} onChange={(e) => setData('name', e.target.value)} error={!!errors.name} helperText={errors.name} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Amount" type="number" fullWidth value={data.amount} onChange={(e) => setData('amount', e.target.value)} error={!!errors.amount} helperText={errors.amount} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Status</InputLabel>
                                    <Select value={data.status} onChange={(e) => setData('status', e.target.value)}>
                                        <MenuItem value="active">Active</MenuItem>
                                        <MenuItem value="inactive">Inactive</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="h6" sx={{ mt: 2 }}>
                                    Menu Items
                                </Typography>
                                {data.items.map((item, index) => (
                                    <Grid container spacing={1} key={index} alignItems="center" sx={{ mb: 1 }}>
                                        <Grid item xs={11}>
                                            <FormControl fullWidth>
                                                <InputLabel>Select Item</InputLabel>
                                                <Select value={item.id || ''} onChange={(e) => handleItemChange(index, e.target.value)}>
                                                    {allItems.map((opt) => (
                                                        <MenuItem key={opt.id} value={opt.id}>
                                                            {opt.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={1}>
                                            {index > 0 && (
                                                <IconButton onClick={() => removeItem(index)}>
                                                    <CloseIcon />
                                                </IconButton>
                                            )}
                                        </Grid>
                                    </Grid>
                                ))}
                                <Button onClick={addItem} variant="outlined" sx={{ mt: 1 }}>
                                    Add More
                                </Button>
                            </Grid>

                            <Grid item xs={12}>
                                <Button type="submit" variant="contained" style={{ backgroundColor: '#003366', textTransform: 'none' }} disabled={processing} size="large" sx={{ mt: 2 }}>
                                    {eventMenu ? 'Update' : 'Create'}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Box>
            </Box>
        </>
    );
};

export default CreateOrEditMenu;
