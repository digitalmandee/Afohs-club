'use client';
import SideNav from '@/components/App/Sidebar/SideNav';
import { router, useForm, usePage } from '@inertiajs/react';
import { Add as AddIcon, Close as CloseIcon, Delete as DeleteIcon, Edit as EditIcon, Search as SearchIcon } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, IconButton, InputAdornment, Snackbar, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useCallback, useEffect, useRef, useState } from 'react';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

export default function AddressType({ addressTypes }) {
    const [open, setOpen] = useState(true);
    const [openAddMenu, setOpenAddMenu] = useState(false);
    const [editingAddressTypeId, setEditingAddressTypeId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [pendingDeleteAddressType, setPendingDeleteAddressType] = useState(null);
    const { flash } = usePage().props;
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const dialogContentRef = useRef(null);

    const { data, setData, post, reset, errors, processing } = useForm({
        name: '',
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handleAddMenuOpen = useCallback(() => {
        setOpenAddMenu(true);
        reset();
        setEditingAddressTypeId(null);
    }, [reset]);

    const handleAddMenuClose = useCallback(() => {
        setOpenAddMenu(false);
        setEditingAddressTypeId(null);
        reset();
        setShowError(false);
        setErrorMessage('');
    }, [reset]);

    const handleInputChange = useCallback(
        (e) => {
            const { name, value } = e.target;
            setData(name, value);
        },
        [setData],
    );

    const handleSave = useCallback(
        (e) => {
            e.preventDefault();

            // Basic frontend validation
            if (!data.name.trim()) {
                setErrorMessage('Address type name is required.');
                setShowError(true);
                return;
            }
            if (data.name.length > 255) {
                setErrorMessage('Address type name must be 255 characters or less.');
                setShowError(true);
                return;
            }

            const formData = new FormData();
            formData.append('name', data.name);

            if (editingAddressTypeId) {
                // Update existing address type
                formData.append('_method', 'PUT');
                router.post(route('address-types.update', editingAddressTypeId), formData, {
                    forceFormData: true,
                    onSuccess: () => {
                        setShowConfirmation(true);
                        handleAddMenuClose();
                        router.visit(route('address-types.index'));
                    },
                    onError: (errors) => {
                        setErrorMessage(errors.name || 'An error occurred while updating the address type.');
                        setShowError(true);
                    },
                });
                setSnackbar({ open: true, message: 'Successfully Updated Address Type', severity: 'success' });
            } else {
                // Create new address type
                post(route('address-types.store'), {
                    data: formData,
                    onSuccess: () => {
                        setShowConfirmation(true);
                        handleAddMenuClose();
                        router.visit(route('address-types.index'));
                    },
                    onError: (errors) => {
                        setErrorMessage(errors.name || errors.message || 'An error occurred while creating the address type.');
                        setShowError(true);
                    },
                });
                setSnackbar({ open: true, message: 'Successfully Created Address Type', severity: 'success' });
            }
        },
        [data, editingAddressTypeId, post, handleAddMenuClose],
    );

    const handleEdit = useCallback(
        (addressType) => {
            setData({
                name: addressType.name,
            });
            setEditingAddressTypeId(addressType.id);
            setOpenAddMenu(true);
        },
        [setData],
    );

    const handleDeleteClick = useCallback((addressType) => {
        setPendingDeleteAddressType(addressType);
    }, []);

    const handleConfirmDelete = useCallback(() => {
        if (pendingDeleteAddressType) {
            router.delete(route('address-types.destroy', pendingDeleteAddressType.id), {
                onSuccess: () => {
                    setShowDeleteSuccess(true);
                    setPendingDeleteAddressType(null);
                    router.visit(route('address-types.index'));
                },
                onError: (errors) => {
                    setErrorMessage(errors.message || 'An error occurred while deleting the address type.');
                    setShowError(true);
                    setPendingDeleteAddressType(null);
                },
            });
        }
    }, [pendingDeleteAddressType]);

    const handleCancelDelete = useCallback(() => {
        setPendingDeleteAddressType(null);
    }, []);

    const handleCloseConfirmation = () => {
        setShowConfirmation(false);
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleErrorClose = useCallback(() => {
        setShowError(false);
        setErrorMessage('');
    }, []);

    useEffect(() => {
        if (flash?.success) {
            setShowConfirmation(true);
        }
        if (flash?.error) {
            setErrorMessage(flash.error);
            setShowError(true);
        }
    }, [flash]);

    useEffect(() => {
        if (openAddMenu && dialogContentRef.current) {
            dialogContentRef.current.focus();
        }
    }, [openAddMenu]);

    const filteredAddressTypes = (addressTypes || []).filter((addressType) => addressType.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                }}
                aria-hidden={openAddMenu ? 'true' : undefined}
            >
                <div className="container-fluid bg-light py-4">
                    <div style={{ background: '#ffff', padding: '20px', borderRadius: '10px' }}>
                        <div className="d-flex align-items-center mb-4">
                            <Typography variant="h4" sx={{ mr: 2 }}>
                                {filteredAddressTypes.length}
                            </Typography>
                            <Typography variant="body1" color="#7F7F7F">
                                Address Types
                            </Typography>
                            <TextField
                                placeholder="Search"
                                variant="outlined"
                                size="small"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                sx={{
                                    ml: 3,
                                    width: 450,
                                    '& .MuiOutlinedInput-root': { borderRadius: 1 },
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={handleAddMenuOpen}
                                    sx={{
                                        borderRadius: 1,
                                        backgroundColor: '#003B5C',
                                        '&:hover': { backgroundColor: '#002A41' },
                                    }}
                                >
                                    Add Address Type
                                </Button>
                            </Box>
                        </div>

                        {filteredAddressTypes.length === 0 ? (
                            <Typography>No address types found.</Typography>
                        ) : (
                            filteredAddressTypes.map((addressType) => (
                                <Card
                                    key={addressType.id}
                                    sx={{
                                        mb: 1,
                                        borderRadius: 1,
                                        border: '1px solid #E3E3E3',
                                        boxShadow: 'none',
                                        '&:hover': { background: '#F6F6F6' },
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Grid container alignItems="center" justifyContent="space-between">
                                            <Grid item xs={12} sm={9} md={9} sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Typography sx={{ fontSize: '18px', fontWeight: 500, color: '#121212' }}>{addressType.name}</Typography>
                                            </Grid>
                                            <Grid item>
                                                <IconButton onClick={() => handleEdit(addressType)}>
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton onClick={() => handleDeleteClick(addressType)}>
                                                    <DeleteIcon color="error" />
                                                </IconButton>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Dialog
                open={openAddMenu}
                onClose={handleAddMenuClose}
                fullWidth
                maxWidth="sm"
                disableEnforceFocus
                PaperProps={{
                    sx: {
                        borderRadius: 1,
                        m: 0,
                        position: 'fixed',
                        right: 0,
                        top: 0,
                        height: '100%',
                        maxHeight: '100%',
                    },
                }}
            >
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" fontWeight="bold">
                        {editingAddressTypeId ? 'Edit Address Type' : 'Add Address Type'}
                    </Typography>
                    <IconButton onClick={handleAddMenuClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <DialogContent sx={{ p: 0 }} tabIndex={-1} ref={dialogContentRef}>
                    <Box sx={{ px: 3, pb: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    Address Type Name
                                </Typography>
                                <TextField fullWidth placeholder="Enter address type name" name="name" value={data.name} onChange={handleInputChange} variant="outlined" size="small" error={!!errors.name} helperText={errors.name} />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
                    <Button onClick={handleAddMenuClose}>Cancel</Button>
                    <Button
                        variant="contained"
                        disabled={processing || !data.name.trim()}
                        onClick={handleSave}
                        sx={{
                            backgroundColor: '#003B5C',
                            '&:hover': { backgroundColor: '#002A41' },
                        }}
                    >
                        {processing ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog fullScreen={fullScreen} open={!!pendingDeleteAddressType} onClose={handleCancelDelete} aria-labelledby="delete-dialog-title" disableEnforceFocus>
                <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure you want to delete the address type "{pendingDeleteAddressType?.name || ''}"? This action cannot be undone.</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} sx={{ color: '#c62828' }}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar: Success */}
            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}
