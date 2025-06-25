import React from 'react';
import { usePage, router } from '@inertiajs/react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    IconButton,
    Dialog,
    Button,
} from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { enqueueSnackbar } from 'notistack';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const AllEvents = ({ events }) => {
    const [open, setOpen] = React.useState(false);
    const [confirmDialog, setConfirmDialog] = React.useState({ open: false, eventId: null });

    const handleEdit = (id) => {
        router.visit(`/events/edit/${id}`);
    };

    const handleDelete = (id) => {
        setConfirmDialog({ open: true, eventId: id });
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
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <IconButton
                            sx={{ color: '#063455', mr: 1 }}
                            onClick={() => window.history.back()}
                        >
                            <ArrowBack />
                        </IconButton>
                        <Typography variant="h5" component="h1" sx={{ fontWeight: 500, fontSize: '30px', color: '#063455' }}>
                            All Events
                        </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                        <Grid container spacing={2}>
                            {events.map((event) => (
                                <Grid item xs={12} key={event.id}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            borderRadius: 1,
                                            overflow: 'hidden',
                                            display: 'flex',
                                            height: '100px',
                                            bgcolor: '#FFFFFF',
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                                            <img src={event.photo_path ? `/${event.photo_path}` : '/assets/room-img.png'} alt={event.event_name} style={{ width: '117px', height: '77px' }} />
                                        </Box>
                                        <Box sx={{ p: 2, flexGrow: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Typography variant="h6" fontWeight="medium">
                                                    {event.event_name}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                                                        <Box component="span" fontWeight="bold" color="text.primary">
                                                            {event.price_per_person}$
                                                        </Box>
                                                        /{event.pricing_type}
                                                    </Typography>
                                                    <IconButton
                                                        onClick={() => handleEdit(event.id)}
                                                        sx={{ color: '#0a3d62' }}
                                                    >
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={() => handleDelete(event.id)}
                                                        sx={{ color: '#f44336' }}
                                                    >
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <LocationOnIcon fontSize="small" sx={{ color: '#666', mr: 0.5 }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {event.location}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <PeopleIcon fontSize="small" sx={{ color: '#666', mr: 0.5 }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {event.max_capacity} Capacity
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <AccessTimeIcon fontSize="small" sx={{ color: '#666', mr: 0.5 }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {new Date(event.date_time).toLocaleString()}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </div>
            </div>

            <Dialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ open: false, eventId: null })}
            >
                <Box sx={{ p: 3, width: 300 }}>
                    <Typography variant="h6" gutterBottom>
                        Confirm Deletion
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Are you sure you want to delete this event?
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                            onClick={() => setConfirmDialog({ open: false, eventId: null })}
                            color="inherit"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => {
                                router.delete(`/events/${confirmDialog.eventId}`, {
                                    preserveScroll: true,
                                    onSuccess: () => {
                                        enqueueSnackbar('Event deleted successfully', { variant: 'success' });
                                        setConfirmDialog({ open: false, eventId: null });
                                    },
                                    onError: () => {
                                        enqueueSnackbar('Failed to delete event', { variant: 'error' });
                                        setConfirmDialog({ open: false, eventId: null });
                                    },
                                });
                            }}
                        >
                            Delete
                        </Button>
                    </Box>
                </Box>
            </Dialog>
        </>
    );
};

export default AllEvents;
