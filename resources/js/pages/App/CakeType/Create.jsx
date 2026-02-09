import React from 'react';
import SideNav from '@/components/App/SideBar/SideNav';
import { Head, useForm, Link } from '@inertiajs/react';
import { Box, Paper, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, Grid, InputAdornment } from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

function Create({ cakeType, isEdit, units }) {
    const [open, setOpen] = React.useState(true);
    const { data, setData, post, put, processing, errors } = useForm({
        name: cakeType?.name || '',
        price: cakeType?.price || '',
        unit_id: cakeType?.unit_id || '',
        status: cakeType?.status || 'active',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('cake-types.update', cakeType.id));
        } else {
            post(route('cake-types.store'));
        }
    };

    return (
        <>
            <Head title={isEdit ? 'Edit Cake Type' : 'Add Cake Type'} />
            <SideNav open={open} setOpen={setOpen} />
            <Box
                sx={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5.5rem',
                    p: 3,
                }}
            >
                <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Button startIcon={<ArrowBack />} component={Link} href={route('cake-types.index')} sx={{ mr: 2 }}>
                            Back
                        </Button>
                        <Typography variant="h5" fontWeight="bold" sx={{ color: '#003B5C' }}>
                            {isEdit ? 'Edit Cake Type' : 'Add Cake Type'}
                        </Typography>
                    </Box>

                    <Paper sx={{ p: 4 }} component="form" onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" sx={{ mb: 2, color: '#666' }}>
                                    Details
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField label="Cake Type Name" fullWidth required value={data.name} onChange={(e) => setData('name', e.target.value)} error={!!errors.name} helperText={errors.name} />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Price"
                                    fullWidth
                                    required
                                    type="number"
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">Rs</InputAdornment>,
                                    }}
                                    error={!!errors.price}
                                    helperText={errors.price}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth required error={!!errors.unit_id}>
                                    <InputLabel>Unit of Measurement</InputLabel>
                                    <Select value={data.unit_id} label="Unit of Measurement" onChange={(e) => setData('unit_id', e.target.value)}>
                                        {units.map((unit) => (
                                            <MenuItem key={unit.id} value={unit.id}>
                                                {unit.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <FormControl fullWidth required>
                                    <InputLabel>Status</InputLabel>
                                    <Select value={data.status} label="Status" onChange={(e) => setData('status', e.target.value)}>
                                        <MenuItem value="active">Active</MenuItem>
                                        <MenuItem value="inactive">Inactive</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <Button type="submit" variant="contained" size="large" startIcon={<Save />} disabled={processing} sx={{ bgcolor: '#003B5C', '&:hover': { bgcolor: '#002a41' } }}>
                                    {isEdit ? 'Update' : 'Save'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Box>
            </Box>
        </>
    );
}

Create.layout = (page) => page;
export default Create;
