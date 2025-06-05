import React, { useState, useRef } from 'react';
import { router } from '@inertiajs/react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    IconButton,
    MenuItem,
    Select,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const EditEvent = ({ event, locations }) => {
    const [open, setOpen] = useState(false);
    const [photoUrl, setPhotoUrl] = useState(event.photo_path ? `/${event.photo_path}` : null);
    const fileInputRef = useRef(null);

    const [eventForm, setEventForm] = useState({
        event_name: event.event_name || '',
        date_time: event.date_time ? dayjs(event.date_time) : null,
        max_capacity: event.max_capacity || '',
        price_per_person: event.price_per_person || '',
        pricing_type: event.pricing_type || 'per person',
        status: event.status || '',
        location: event.location || '',
        photo: null,
    });

    const [eventErrors, setEventErrors] = useState({
        event_name: '',
        date_time: '',
        max_capacity: '',
        price_per_person: '',
        pricing_type: '',
        status: '',
        location: '',
    });

    const handleEventInputChange = (e) => {
        const { name, value } = e.target;
        setEventForm({ ...eventForm, [name]: value });
        setEventErrors({ ...eventErrors, [name]: '' });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setPhotoUrl(e.target.result);
            reader.readAsDataURL(file);
            setEventForm({ ...eventForm, photo: file });
        }
    };

    const handleEventSubmit = (e) => {
        e.preventDefault();

        const newErrors = {};
        let hasErrors = false;

        if (!eventForm.event_name.trim()) {
            newErrors.event_name = 'Event name is required';
            hasErrors = true;
        }
        if (!eventForm.date_time) {
            newErrors.date_time = 'Date and time are required';
            hasErrors = true;
        }
        if (!eventForm.max_capacity || isNaN(parseInt(eventForm.max_capacity)) || parseInt(eventForm.max_capacity) < 1) {
            newErrors.max_capacity = 'Max capacity is required and must be a positive number';
            hasErrors = true;
        }
        if (!eventForm.price_per_person || isNaN(parseFloat(eventForm.price_per_person)) || parseFloat(eventForm.price_per_person) < 0) {
            newErrors.price_per_person = 'Price is required and must be a non-negative number';
            hasErrors = true;
        }
        if (!eventForm.pricing_type) {
            newErrors.pricing_type = 'Pricing type is required';
            hasErrors = true;
        }
        if (!eventForm.status) {
            newErrors.status = 'Status is required';
            hasErrors = true;
        }
        if (!eventForm.location.trim()) {
            newErrors.location = 'Location is required';
            hasErrors = true;
        }

        if (hasErrors) {
            setEventErrors(newErrors);
            return;
        }

        const data = new FormData();
        data.append('event_name', eventForm.event_name);
        data.append('date_time', eventForm.date_time.format('YYYY-MM-DD HH:mm:ss'));
        data.append('max_capacity', parseInt(eventForm.max_capacity));
        data.append('price_per_person', parseFloat(eventForm.price_per_person));
        data.append('pricing_type', eventForm.pricing_type);
        data.append('status', eventForm.status);
        data.append('location', eventForm.location);
        if (eventForm.photo) data.append('photo', eventForm.photo);

        data.append('_method', 'PUT');

        router.post(`/events/${event.id}`, data, {
            onSuccess: () => {
                setPhotoUrl(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                setEventErrors({
                    event_name: '',
                    date_time: '',
                    max_capacity: '',
                    price_per_person: '',
                    pricing_type: '',
                    status: '',
                    location: '',
                });
            },
            onError: (serverErrors) => {
                setEventErrors({ ...eventErrors, ...serverErrors });
            },
        });
    };

    const handleChoosePhoto = () => {
        fileInputRef.current.click();
    };

    const handleDeletePhoto = () => {
        setPhotoUrl(null);
        setEventForm({ ...eventForm, photo: null });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
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
                }}
            >
                <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '20px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <IconButton
                            sx={{ color: '#3F4E4F' }}
                            onClick={() => window.history.back()}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h5" component="h1" sx={{ ml: 1, fontWeight: 500, fontSize: '30px', color: '#3F4E4F' }}>
                            Edit Event
                        </Typography>
                    </Box>
                    <Box sx={{ maxWidth: 600, margin: '0 auto', border: '1px solid #E3E3E3', bgcolor: '#FFFFFF' }}>
                        <Paper sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Box
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        backgroundColor: '#d4a88e',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {photoUrl ? (
                                        <img src={photoUrl} alt="Uploaded" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                border: '2px solid white',
                                                borderRadius: '50%',
                                                position: 'relative',
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 20,
                                                    height: 20,
                                                    border: '2px solid white',
                                                    borderRadius: '50%',
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                }}
                                            />
                                        </Box>
                                    )}
                                </Box>
                                <Box sx={{ ml: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Button
                                            variant="text"
                                            onClick={handleChoosePhoto}
                                            sx={{
                                                color: '#1976d2',
                                                textTransform: 'none',
                                                p: 0,
                                                minWidth: 'auto',
                                                fontWeight: 'normal',
                                                fontSize: '0.9rem',
                                            }}
                                        >
                                            Choose Photo
                                        </Button>
                                        <Typography sx={{ mx: 1, color: '#ccc' }}>|</Typography>
                                        <Button
                                            variant="text"
                                            onClick={handleDeletePhoto}
                                            sx={{
                                                color: '#f44336',
                                                textTransform: 'none',
                                                p: 0,
                                                minWidth: 'auto',
                                                fontWeight: 'normal',
                                                fontSize: '0.9rem',
                                            }}
                                        >
                                            Delete
                                        </Button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handlePhotoChange}
                                            style={{ display: 'none' }}
                                            accept="image/*"
                                        />
                                    </Box>
                                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem' }}>
                                        Click upload to event image (4 MB max)
                                    </Typography>
                                </Box>
                            </Box>
                            <Box component="form" onSubmit={handleEventSubmit}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography sx={{ mb: 1, color: '#121212', fontWeight: 400, fontSize: '14px' }}>
                                        Event Name
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="event_name"
                                        value={eventForm.event_name}
                                        onChange={handleEventInputChange}
                                        placeholder="e.g : Annual Gala"
                                        variant="outlined"
                                        size="small"
                                        error={!!eventErrors.event_name}
                                        helperText={eventErrors.event_name}
                                    />
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                    <Typography sx={{ mb: 1, color: '#121212', fontWeight: 400, fontSize: '14px' }}>
                                        Date & Time
                                    </Typography>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DateTimePicker
                                            value={eventForm.date_time}
                                            onChange={(newValue) => setEventForm({ ...eventForm, date_time: newValue })}
                                            slotProps={{
                                                textField: {
                                                    size: 'small',
                                                    error: !!eventErrors.date_time,
                                                    helperText: eventErrors.date_time,
                                                },
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                    <Typography sx={{ mb: 1, color: '#121212', fontWeight: 400, fontSize: '14px' }}>
                                        Max Capacity
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="max_capacity"
                                        value={eventForm.max_capacity}
                                        onChange={handleEventInputChange}
                                        placeholder="e.g : 50 People"
                                        variant="outlined"
                                        size="small"
                                        error={!!eventErrors.max_capacity}
                                        helperText={eventErrors.max_capacity}
                                        type="number"
                                    />
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                    <Typography sx={{ mb: 1, color: '#121212', fontWeight: 400, fontSize: '14px' }}>
                                        Pricing Type
                                    </Typography>
                                    <Select
                                        fullWidth
                                        name="pricing_type"
                                        value={eventForm.pricing_type}
                                        onChange={handleEventInputChange}
                                        variant="outlined"
                                        size="small"
                                        error={!!eventErrors.pricing_type}
                                    >
                                        <MenuItem value="per person">Per Person</MenuItem>
                                        <MenuItem value="fixed">Fixed</MenuItem>
                                    </Select>
                                    {!!eventErrors.pricing_type && (
                                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                            {eventErrors.pricing_type}
                                        </Typography>
                                    )}
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                    <Typography sx={{ mb: 1, color: '#121212', fontWeight: 400, fontSize: '14px' }}>
                                        {eventForm.pricing_type === 'fixed' ? 'Fixed Price' : 'Price Per Person'}
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="price_per_person"
                                        value={eventForm.price_per_person}
                                        onChange={handleEventInputChange}
                                        placeholder={eventForm.pricing_type === 'fixed' ? 'e.g : 1000$' : 'e.g : 100'}
                                        variant="outlined"
                                        size="small"
                                        error={!!eventErrors.price_per_person}
                                        helperText={eventErrors.price_per_person}
                                        type="number"
                                    />
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                    <Typography sx={{ mb: 1, color: '#121212', fontWeight: 400, fontSize: '14px' }}>
                                        Status
                                    </Typography>
                                    <Select
                                        fullWidth
                                        name="status"
                                        value={eventForm.status}
                                        onChange={handleEventInputChange}
                                        variant="outlined"
                                        size="small"
                                        error={!!eventErrors.status}
                                    >
                                        <MenuItem value="pending">Pending</MenuItem>
                                        <MenuItem value="upcomming">Upcoming</MenuItem>
                                        <MenuItem value="completed">Completed</MenuItem>
                                    </Select>
                                    {!!eventErrors.status && (
                                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                            {eventErrors.status}
                                        </Typography>
                                    )}
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                    <Typography sx={{ mb: 1, color: '#121212', fontWeight: 400, fontSize: '14px' }}>
                                        Location
                                    </Typography>
                                    <Select
                                        fullWidth
                                        name="location"
                                        value={eventForm.location}
                                        onChange={handleEventInputChange}
                                        variant="outlined"
                                        size="small"
                                        error={!!eventErrors.location}
                                    >
                                        {locations.map((loc) => (
                                            <MenuItem key={loc.id} value={loc.name}>{loc.name}</MenuItem>
                                        ))}
                                    </Select>
                                    {!!eventErrors.location && (
                                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                            {eventErrors.location}
                                        </Typography>
                                    )}
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                                    <Button
                                        variant="text"
                                        sx={{
                                            color: '#000',
                                            mr: 2,
                                            textTransform: 'none',
                                            fontWeight: 'normal',
                                        }}
                                        onClick={() => window.history.back()}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        sx={{
                                            backgroundColor: '#0a3d62',
                                            color: 'white',
                                            textTransform: 'none',
                                            '&:hover': {
                                                backgroundColor: '#0c2d48',
                                            },
                                            fontWeight: 'normal',
                                            px: 4,
                                        }}
                                    >
                                        Save
                                    </Button>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                </div>
            </div>
        </>
    );
};

export default EditEvent;
