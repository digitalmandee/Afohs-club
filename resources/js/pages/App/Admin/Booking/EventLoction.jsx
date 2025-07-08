import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Modal,
    FormControl,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableContainer,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { router } from '@inertiajs/react';
import { enqueueSnackbar } from 'notistack';
import SideNav from '@/components/App/AdminSideBar/SideNav';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const EventLocation = () => {
    const { props } = usePage();
    const locations = props.locations || [];
    const [modalOpen, setModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [newLocation, setNewLocation] = useState('');
    const [editLocation, setEditLocation] = useState({ id: null, name: '' });
    const [deleteLocationId, setDeleteLocationId] = useState(null);
    const [open, setOpen] = useState(true);
    const [locationError, setLocationError] = useState('');
    const [editError, setEditError] = useState('');

    const handleLocationSubmit = (e) => {
        e.preventDefault();
        if (!newLocation.trim()) {
            setLocationError('Location name is required');
            return;
        }

        router.post(route('events.locations.store'), { name: newLocation }, {
            onSuccess: () => {
                setNewLocation('');
                setModalOpen(false);
                setLocationError('');
                enqueueSnackbar('Location added successfully', { variant: 'success' });
            },
            onError: (errors) => {
                setLocationError(errors.name || 'An error occurred');
            },
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editLocation.name.trim()) {
            setEditError('Location name is required');
            return;
        }

        router.put(route('events.locations.update', editLocation.id), { name: editLocation.name }, {
            onSuccess: () => {
                setEditLocation({ id: null, name: '' });
                setEditModalOpen(false);
                setEditError('');
                enqueueSnackbar('Location updated successfully', { variant: 'success' });
            },
            onError: (errors) => {
                setEditError(errors.name || 'An error occurred');
            },
        });
    };

    const handleDeleteConfirm = () => {
        router.delete(route('events.locations.delete', deleteLocationId), {
            onSuccess: () => {
                setDeleteModalOpen(false);
                setDeleteLocationId(null);
                enqueueSnackbar('Location deleted successfully', { variant: 'success' });
            },
            onError: () => {
                enqueueSnackbar('Failed to delete location', { variant: 'error' });
            },
        });
    };

    const openEditModal = (location) => {
        setEditLocation({ id: location.id, name: location.name });
        setEditModalOpen(true);
    };

    const openDeleteModal = (id) => {
        setDeleteLocationId(id);
        setDeleteModalOpen(true);
    };

    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                    backgroundColor: '#F6F6F6',
                    minHeight: '100vh',
                    padding: '2rem',
                }}
            >
                {/* Page Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#063455' }}>
                        Event Locations
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{
                            backgroundColor: '#0D2B4E',
                            textTransform: 'none',
                            color: '#FFFFFF',
                            '&:hover': {
                                backgroundColor: '#063455',
                            },
                        }}
                        onClick={() => setModalOpen(true)}
                    >
                        Add Location
                    </Button>
                </Box>

                {/* Locations Table */}
                <TableContainer
                    component={Paper}
                    sx={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: 2,
                        boxShadow: 'none',
                        border: '1px solid #ccc',
                    }}
                >
                    <Table>
                        <TableHead sx={{ backgroundColor: '#E5E5EA' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, fontSize: '16px' }}>ID</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '16px' }}>Name</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '16px' }}>
                                    Action
                                </TableCell>

                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {locations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center" sx={{ padding: '2rem' }}>
                                        No locations found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                locations.map((loc) => (
                                    <TableRow key={loc.id}>
                                        <TableCell sx={{ fontSize: '15px', color: '#6C6C6C' }}>{loc.id}</TableCell>
                                        <TableCell align="center" sx={{ fontSize: '15px', color: '#6C6C6C' }}>{loc.name}</TableCell>
                                        <TableCell align="center">
                                            <Box display="flex" justifyContent="center" gap={1}>
                                                <Button
                                                    size="small"
                                                    variant="text"
                                                    sx={{
                                                        textTransform: 'none',
                                                        color: '#0D2B4E',
                                                        fontWeight: 500,
                                                    }}
                                                    onClick={() => openEditModal(loc)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="text"
                                                    sx={{
                                                        textTransform: 'none',
                                                        color: '#D32F2F',
                                                        fontWeight: 500,
                                                    }}
                                                    onClick={() => openDeleteModal(loc.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </Box>
                                        </TableCell>

                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Modal for Adding New Location */}
                <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 400,
                            bgcolor: 'background.paper',
                            boxShadow: 24,
                            p: 4,
                            borderRadius: 2,
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#063455' }}>
                            Add New Location
                        </Typography>
                        <form onSubmit={handleLocationSubmit}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <TextField
                                    variant="outlined"
                                    size="small"
                                    value={newLocation}
                                    onChange={(e) => {
                                        setNewLocation(e.target.value);
                                        setLocationError('');
                                    }}
                                    placeholder="Enter location name"
                                    autoFocus
                                    error={!!locationError}
                                    helperText={locationError}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1,
                                        },
                                    }}
                                />
                            </FormControl>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <Button
                                    variant="text"
                                    onClick={() => setModalOpen(false)}
                                    sx={{
                                        textTransform: 'none',
                                        color: '#6C6C6C',
                                        fontWeight: 500,
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{
                                        backgroundColor: '#0D2B4E',
                                        textTransform: 'none',
                                        color: '#FFFFFF',
                                        '&:hover': {
                                            backgroundColor: '#063455',
                                        },
                                    }}
                                >
                                    Add
                                </Button>
                            </Box>
                        </form>
                    </Box>
                </Modal>

                {/* Modal for Editing Location */}
                <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 400,
                            bgcolor: 'background.paper',
                            boxShadow: 24,
                            p: 4,
                            borderRadius: 2,
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#063455' }}>
                            Edit Location
                        </Typography>
                        <form onSubmit={handleEditSubmit}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <TextField
                                    variant="outlined"
                                    size="small"
                                    value={editLocation.name}
                                    onChange={(e) => {
                                        setEditLocation({ ...editLocation, name: e.target.value });
                                        setEditError('');
                                    }}
                                    placeholder="Enter location name"
                                    autoFocus
                                    error={!!editError}
                                    helperText={editError}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1,
                                        },
                                    }}
                                />
                            </FormControl>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <Button
                                    variant="text"
                                    onClick={() => setEditModalOpen(false)}
                                    sx={{
                                        textTransform: 'none',
                                        color: '#6C6C6C',
                                        fontWeight: 500,
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{
                                        backgroundColor: '#0D2B4E',
                                        textTransform: 'none',
                                        color: '#FFFFFF',
                                        '&:hover': {
                                            backgroundColor: '#063455',
                                        },
                                    }}
                                >
                                    Save
                                </Button>
                            </Box>
                        </form>
                    </Box>
                </Modal>

                {/* Modal for Deleting Location */}
                <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 400,
                            bgcolor: 'background.paper',
                            boxShadow: 24,
                            p: 4,
                            borderRadius: 2,
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#063455' }}>
                            Confirm Deletion
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2, color: '#6C6C6C' }}>
                            Are you sure you want to delete this location? This action cannot be undone.
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button
                                variant="text"
                                onClick={() => setDeleteModalOpen(false)}
                                sx={{
                                    textTransform: 'none',
                                    color: '#6C6C6C',
                                    fontWeight: 500,
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleDeleteConfirm}
                                sx={{
                                    backgroundColor: '#D32F2F',
                                    textTransform: 'none',
                                    color: '#FFFFFF',
                                    '&:hover': {
                                        backgroundColor: '#B71C1C',
                                    },
                                }}
                            >
                                Delete
                            </Button>
                        </Box>
                    </Box>
                </Modal>
            </div>
        </>
    );
};

export default EventLocation;
