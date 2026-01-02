import React, { useState, useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { usePage, router } from '@inertiajs/react';
import { Box, Typography, Paper, Grid, IconButton, Button, TextField, FormLabel, RadioGroup, FormControlLabel, Radio, MenuItem, Select, InputLabel, FormControl, Chip } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { enqueueSnackbar } from 'notistack';
import AsyncSearchTextField from '@/components/AsyncSearchTextField';

const RoomBookingRequestForm = ({ mode }) => {
    const { props } = usePage();
    const { rooms, roomCategories, errors, request } = props;

    // const [open, setOpen] = useState(true);
    const [familyMembers, setFamilyMembers] = useState([]);

    const [formData, setFormData] = useState({
        bookingDate: request?.booking_date || new Date().toISOString().split('T')[0], // Auto-select current date
        checkInDate: request?.check_in_date || '',
        checkOutDate: request?.check_out_date || '',
        bookingType: request?.booking_type || '',
        guest: request?.member || request?.customer || request?.corporate_member || '',
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
            check_in_date: formData.checkInDate,
            check_out_date: formData.checkOutDate,
            booking_type: formData.bookingType,
            room_id: formData.roomId,
            booking_category: formData.bookingCategory,
            persons: formData.persons,
            security_deposit: formData.securityDeposit,
            per_day_charge: formData.perDayCharge,
        };
        console.log(formData.guest);

        if (formData.bookingType.startsWith('guest-')) {
            payload.customer_id = formData.guest?.id || null;
        } else if (formData.bookingType == '2') {
            payload.corporate_member_id = formData.guest?.id || null;
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
                    <Typography sx={{ fontWeight: 700, fontSize: '30px', color: '#063455' }}>{mode === 'create' ? 'Add Room Booking Request' : 'Edit Room Booking Request'}</Typography>
                </Box>

                <Paper
                    sx={{
                        width: '70%',
                        mx: 'auto',
                        my: 4,
                        p: 4,
                        bgcolor: '#fff',
                        borderRadius: 2,
                        border: '1px solid #e0e0e0',
                    }}
                >
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            {/* Booking Date - Auto-selected, read-only */}
                            <Grid item xs={12} sm={4}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Booking Date"
                                        format="DD-MM-YYYY"
                                        value={formData.bookingDate ? dayjs(formData.bookingDate) : null}
                                        onChange={(newValue) => handleChange({ target: { name: 'bookingDate', value: newValue ? newValue.format('YYYY-MM-DD') : '' } })}
                                        disabled
                                        slotProps={{
                                            textField: { fullWidth: true, name: 'bookingDate', error: !!errors.booking_date, helperText: errors.booking_date || "Auto-selected to today's date" },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>

                            {/* Check-In Date */}
                            <Grid item xs={12} sm={4}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Check-In Date"
                                        format="DD-MM-YYYY"
                                        value={formData.checkInDate ? dayjs(formData.checkInDate) : null}
                                        onChange={(newValue) => handleChange({ target: { name: 'checkInDate', value: newValue ? newValue.format('YYYY-MM-DD') : '' } })}
                                        minDate={dayjs()}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                name: 'checkInDate',
                                                error: !!errors.check_in_date,
                                                helperText: errors.check_in_date,
                                                onClick: (e) => e.target.closest('.MuiFormControl-root').querySelector('button')?.click(),
                                            },
                                            actionBar: { actions: ['clear', 'today', 'cancel', 'accept'] },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>

                            {/* Check-Out Date */}
                            <Grid item xs={12} sm={4}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Check-Out Date"
                                        format="DD-MM-YYYY"
                                        value={formData.checkOutDate ? dayjs(formData.checkOutDate) : null}
                                        onChange={(newValue) => handleChange({ target: { name: 'checkOutDate', value: newValue ? newValue.format('YYYY-MM-DD') : '' } })}
                                        minDate={formData.checkInDate ? dayjs(formData.checkInDate) : dayjs()}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                name: 'checkOutDate',
                                                error: !!errors.check_out_date,
                                                helperText: errors.check_out_date,
                                                onClick: (e) => e.target.closest('.MuiFormControl-root').querySelector('button')?.click(),
                                            },
                                            actionBar: { actions: ['clear', 'today', 'cancel', 'accept'] },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>

                            {/* Booking Type */}
                            <Grid item xs={12}>
                                <FormLabel>Booking Type</FormLabel>
                                {mode === 'edit' ? (
                                    <TextField value={formData.bookingType == 0 ? 'Member' : formData.bookingType == 2 ? 'Corporate Member' : formData.bookingType == 'guest-1' ? 'Applied Member' : formData.bookingType == 'guest-2' ? 'Affiliated Member' : 'VIP Guest'} fullWidth InputProps={{ readOnly: true }} disabled sx={{ mt: 1 }} />
                                ) : (
                                    <RadioGroup
                                        row
                                        name="bookingType"
                                        value={formData.bookingType}
                                        onChange={(e) => {
                                            handleChange(e);
                                            setFormData((prev) => ({ ...prev, bookingType: e.target.value, guest: '' }));
                                            setFamilyMembers([]);
                                        }}
                                    >
                                        <FormControlLabel value="0" control={<Radio />} label="Member" />
                                        <FormControlLabel value="2" control={<Radio />} label="Corporate Member" />
                                        <FormControlLabel value="guest-1" control={<Radio />} label="Applied Member" />
                                        <FormControlLabel value="guest-2" control={<Radio />} label="Affiliated Member" />
                                        <FormControlLabel value="guest-3" control={<Radio />} label="VIP Guest" />
                                    </RadioGroup>
                                )}
                                {errors.booking_type && <Typography color="error">{errors.booking_type}</Typography>}
                            </Grid>

                            {/* Member / Guest Search */}
                            <Grid item xs={12}>
                                {mode === 'edit' ? (
                                    <TextField label="Member / Guest Name" value={request?.member ? `${request.member.full_name} (${request.member.membership_no})` : request?.customer ? `${request.customer.name} (ID: ${request.customer.customer_no})` : request?.corporate_member ? `${request.corporate_member.full_name} (${request.corporate_member.membership_no})` : 'No member/guest selected'} fullWidth InputProps={{ readOnly: true }} disabled />
                                ) : (
                                    <AsyncSearchTextField
                                        label="Member / Guest Name"
                                        name="guest"
                                        value={formData.guest}
                                        onChange={(guest) => handleGuestSelect(guest.target.value)}
                                        params={{ type: formData.bookingType }}
                                        endpoint="admin.api.search-users"
                                        placeholder="Search members..."
                                        resultFormat={(option) => (
                                            <Box sx={{ width: '100%' }}>
                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {option.membership_no || option.customer_no || option.employee_id}
                                                    </Typography>
                                                    {option.status && (
                                                        <Chip
                                                            label={option.status}
                                                            size="small"
                                                            sx={{
                                                                height: '20px',
                                                                fontSize: '10px',
                                                                backgroundColor: option.status === 'active' ? '#e8f5e9' : option.status === 'suspended' ? '#fff3e0' : '#ffebee',
                                                                color: option.status === 'active' ? '#2e7d32' : option.status === 'suspended' ? '#ef6c00' : '#c62828',
                                                                textTransform: 'capitalize',
                                                                ml: 1,
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    {option.name}
                                                </Typography>
                                            </Box>
                                        )}
                                    />
                                )}
                            </Grid>

                            {/* Select Room */}
                            <Grid item xs={4}>
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
                            <Grid item xs={4}>
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
                            <Grid item xs={4}>
                                <TextField type="number" label="Number of Persons" name="persons" value={formData.persons} onChange={handleChange} fullWidth />
                            </Grid>

                            {/* Per Day Charge */}
                            <Grid item xs={4}>
                                <TextField label="Per Day Room Charges" name="perDayCharge" value={formData.perDayCharge} fullWidth InputProps={{ readOnly: true }} disabled />
                            </Grid>

                            {/* Security Deposit */}
                            <Grid item xs={4}>
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
