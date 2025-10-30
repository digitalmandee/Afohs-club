import React, { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Box, Typography, Paper, Grid, IconButton, Button, TextField, FormLabel, RadioGroup, FormControlLabel, Radio, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { enqueueSnackbar } from 'notistack';
import AsyncSearchTextField from '@/components/AsyncSearchTextField';

const RoomBookingRequestForm = ({ mode }) => {
    const { props } = usePage();
    const { rooms, roomCategories, errors, request } = props;

    // const [open, setOpen] = useState(true);
    const [familyMembers, setFamilyMembers] = useState([]);

    const [formData, setFormData] = useState({
        bookingDate: request?.booking_date || '',
        bookingType: request?.booking_type || '',
        guest: request?.member || request?.customer || '',
        roomId: request?.room_id || '',
        bookingCategory: request?.booking_category || '',
        persons: request?.persons || '',
        securityDeposit: request?.security_deposit || '',
        perDayCharge: request?.per_day_charge || 0,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleGuestSelect = (guest) => {
        setFormData({ ...formData, guest });
        if (guest?.family_members) {
            const formattedMembers = guest.family_members.map((member) => ({
                id: member.id,
                label: `${member.name} (${member.relation})`,
            }));
            setFamilyMembers(formattedMembers);
        } else {
            setFamilyMembers([]);
        }
    };

    // Auto update per day charge based on room & category
    useEffect(() => {
        if (formData.roomId && formData.bookingCategory) {
            const selectedRoom = rooms.find((r) => r.id == formData.roomId);
            if (selectedRoom) {
                const matchedCharge = selectedRoom.category_charges.find((charge) => charge.room_category_id == formData.bookingCategory);
                setFormData((prev) => ({
                    ...prev,
                    perDayCharge: matchedCharge ? matchedCharge.amount : 0,
                }));
            }
        }
    }, [formData.roomId, formData.bookingCategory]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            booking_date: formData.bookingDate,
            booking_type: formData.bookingType,
            room_id: formData.roomId,
            booking_category: formData.bookingCategory,
            persons: formData.persons,
            security_deposit: formData.securityDeposit,
            per_day_charge: formData.perDayCharge,
        };

        if (formData.bookingType.startsWith('guest-')) {
            payload.customer_id = formData.guest?.id || null;
        } else {
            payload.member_id = formData.guest?.id || null;
        }

        if (mode === 'create') {
            router.post(route('rooms.request.store'), payload, {
                onSuccess: () => enqueueSnackbar('Booking Request Created!', { variant: 'success' }),
                onError: () => enqueueSnackbar('Please check the errors', { variant: 'error' }),
            });
        } else {
            router.put(route('rooms.request.update', request.id), payload, {
                onSuccess: () => enqueueSnackbar('Booking Request Updated!', { variant: 'success' }),
                onError: () => enqueueSnackbar('Please check the errors', { variant: 'error' }),
            });
        }
    };

    return (
        <>
            {/* <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                }}
            > */}
                <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <IconButton sx={{ color: '#063455', mr: 1 }} onClick={() => window.history.back()}>
                            <ArrowBack />
                        </IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 500, fontSize: '30px', color: '#063455' }}>
                            {mode === 'create' ? 'Add Room Booking Request' : 'Edit Room Booking Request'}
                        </Typography>
                    </Box>

                    <Paper sx={{ p: 3 }}>
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={2}>
                                {/* Booking Date */}
                                <Grid item xs={12} sm={6}>
                                    <TextField label="Booking Date" name="bookingDate" type="date" value={formData.bookingDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} error={!!errors.booking_date} helperText={errors.booking_date} />
                                </Grid>

                                {/* Booking Type */}
                                <Grid item xs={12}>
                                    <FormLabel>Booking Type</FormLabel>
                                    <RadioGroup row name="bookingType" value={formData.bookingType} onChange={handleChange}>
                                        <FormControlLabel value="member" control={<Radio />} label="Member" />
                                        <FormControlLabel value="corporate" control={<Radio />} label="Corporate Member" />
                                        <FormControlLabel value="guest-1" control={<Radio />} label="Applied Member" />
                                        <FormControlLabel value="guest-2" control={<Radio />} label="Affiliated Member" />
                                        <FormControlLabel value="guest-3" control={<Radio />} label="VIP Guest" />
                                    </RadioGroup>
                                    {errors.booking_type && <Typography color="error">{errors.booking_type}</Typography>}
                                </Grid>

                                {/* Member / Guest Search */}
                                <Grid item xs={12}>
                                    <AsyncSearchTextField label="Member / Guest Name" name="guest" value={formData.guest} onChange={handleGuestSelect} params={{ type: formData.bookingType }} endpoint="admin.api.search-users" placeholder="Search members..." />
                                </Grid>

                                {/* Select Room */}
                                <Grid item xs={6}>
                                    <FormControl fullWidth error={!!errors.room_id}>
                                        <InputLabel>Select Room</InputLabel>
                                        <Select name="roomId" value={formData.roomId} onChange={handleChange}>
                                            <MenuItem value="">Select Room</MenuItem>
                                            {rooms.map((room) => (
                                                <MenuItem key={room.id} value={room.id}>
                                                    {room.name} (Max: {room.max_capacity})
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Room Category */}
                                <Grid item xs={6}>
                                    <FormControl fullWidth error={!!errors.booking_category}>
                                        <InputLabel>Booking Category</InputLabel>
                                        <Select name="bookingCategory" value={formData.bookingCategory} onChange={handleChange}>
                                            <MenuItem value="">Select Category</MenuItem>
                                            {roomCategories.map((cat) => (
                                                <MenuItem key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Persons */}
                                <Grid item xs={6}>
                                    <TextField type="number" label="Number of Persons" name="persons" value={formData.persons} onChange={handleChange} fullWidth />
                                </Grid>

                                {/* Per Day Charge */}
                                <Grid item xs={6}>
                                    <TextField label="Per Day Room Charges" name="perDayCharge" value={formData.perDayCharge} fullWidth InputProps={{ readOnly: true }} disabled />
                                </Grid>

                                {/* Security Deposit */}
                                <Grid item xs={12}>
                                    <TextField type="number" label="Security Deposit" name="securityDeposit" value={formData.securityDeposit} onChange={handleChange} fullWidth />
                                </Grid>

                                {/* Submit */}
                                <Grid item xs={12}>
                                    <Button type="submit" variant="contained" color="primary" disabled={router.processing}>
                                        {router.processing ? 'Saving...' : mode === 'create' ? 'Submit Request' : 'Update Request'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </Box>
            {/* </div> */}
        </>
    );
};

export default RoomBookingRequestForm;
