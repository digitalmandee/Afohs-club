import SideNav from '@/Components/App/SideBar/SideNav';
import { tenantAsset } from '@/helpers/asset';
import { router, useForm, usePage } from '@inertiajs/react';
import { Add as AddIcon, Close as CloseIcon, Delete as DeleteIcon, Edit as EditIcon, Search as SearchIcon } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Select, Snackbar, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import { enqueueSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

export default function Category({ categoriesList }) {
    const [open, setOpen] = useState(false);
    const [openAddMenu, setOpenAddMenu] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [reassignCategoryId, setReassignCategoryId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [pendingDeleteCategory, setPendingDeleteCategory] = useState(null);
    const { flash } = usePage().props;
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('lg'));

    const { data, setData, post, reset, errors, processing } = useForm({
        name: '',
        image: null,
        existingImage: null,
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handleAddMenuOpen = useCallback(() => {
        setOpenAddMenu(true);
        reset();
        setEditingCategoryId(null);
    }, [reset]);

    const handleAddMenuClose = useCallback(() => {
        setOpenAddMenu(false);
        setEditingCategoryId(null);
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

    const handleImageChange = useCallback(
        (e) => {
            const file = e.target.files[0];
            if (file) {
                setData('image', file);
            }
        },
        [setData],
    );

    const handleSave = useCallback(
        (e) => {
            e.preventDefault();

            // Basic frontend validation
            if (!data.name.trim()) {
                setErrorMessage('Category name is required.');
                setShowError(true);
                return;
            }

            // Check image presence (new image or existing image)
            if (!data.image && !data.existingImage) {
                setErrorMessage('Category image is required.');
                setShowError(true);
                return;
            }

            const formData = new FormData();
            formData.append('name', data.name);
            if (data.image) {
                formData.append('image', data.image);
            } else if (data.existingImage) {
                formData.append('existingImage', data.existingImage);
            }

            if (editingCategoryId) {
                formData.append('_method', 'PUT');
                router.post(route('category.update', editingCategoryId), formData, {
                    forceFormData: true,
                    onSuccess: () => {
                        setShowConfirmation(true);
                        handleAddMenuClose();
                        router.visit(route('inventory.category'));
                    },
                    onError: (errors) => {
                        setErrorMessage(errors.name || errors.image || 'An error occurred while updating the category.');
                        setShowError(true);
                    },
                });
                setSnackbar({ open: true, message: 'Category updated successfully!', severity: 'success' });
            } else {
                post(route('inventory.category.store'), {
                    data: formData,
                    onSuccess: () => {
                        setShowConfirmation(true);
                        handleAddMenuClose();
                        router.visit(route('inventory.category'));
                    },
                    onError: (errors) => {
                        setErrorMessage(errors.name || errors.image || errors.message || 'An error occurred while creating the category.');
                        setShowError(true);
                    },
                });
            }
        },
        [data, editingCategoryId, post, handleAddMenuClose],
    );

    const handleEdit = useCallback(
        (category) => {
            setData({
                name: category.name,
                image: null,
                existingImage: category.image,
            });
            setEditingCategoryId(category.id);
            setOpenAddMenu(true);
        },
        [setData],
    );

    const handleDeleteClick = useCallback((category) => {
        setPendingDeleteCategory(category);
        setReassignCategoryId(null); // reset on each delete open
    }, []);

    const handleConfirmDelete = useCallback(() => {
        if (pendingDeleteCategory) {
            setDeleting(true);

            router.delete(route('category.destroy', { category: pendingDeleteCategory.id }), {
                data: {
                    new_category_id: reassignCategoryId || null,
                },
                onSuccess: () => {
                    enqueueSnackbar('Category deleted successfully', { variant: 'success' });
                    setPendingDeleteCategory(null);
                    setReassignCategoryId(null);
                    setDeleting(false);
                    router.visit(route('inventory.category'));
                },
                onError: (errors) => {
                    setErrorMessage(errors.message || 'An error occurred while deleting the category.');
                    setShowError(true);
                    setPendingDeleteCategory(null);
                    setReassignCategoryId(null);
                    setDeleting(false);
                },
            });
        }
    }, [pendingDeleteCategory, reassignCategoryId]);

    const handleCancelDelete = useCallback(() => {
        setPendingDeleteCategory(null);
    }, []);

    // const handleCloseConfirmation = useCallback(() => {
    //     setTimeout(() => {
    //       setShowConfirmation(false);  // Close the Snackbar after 10 seconds
    //     }, 10000);
    //   }, []);
    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    useEffect(() => {
        if (flash?.success) {
            setShowConfirmation(true);
        }
        if (flash?.error) {
            setErrorMessage(flash.error);
            setShowError(true);
        }
    }, [flash]);

    const filteredCategories = categoriesList.filter((category) => category.name.toLowerCase().includes(searchTerm.toLowerCase()));

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
                <div className="container-fluid bg-light py-4">
                    <div style={{ background: '#ffff', padding: '20px', borderRadius: '10px' }}>
                        <div className="d-flex align-items-center mb-4">
                            <Typography variant="h4" sx={{ mr: 2 }}>
                                {filteredCategories.length}
                            </Typography>
                            <Typography variant="body1" color="#7F7F7F">
                                Categories
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
                                    Add Category
                                </Button>
                            </Box>
                        </div>

                        {filteredCategories.map((category) => (
                            <Card
                                key={category.id}
                                sx={{
                                    mb: 1,
                                    borderRadius: 1,
                                    border: '1px solid #E3E3E3',
                                    boxShadow: 'none',
                                    '&:hover': { background: '#F6F6F6' },
                                }}
                            >
                                <CardContent sx={{ p: 3 }} onClick={() => router.visit(route('inventory.index', { category_id: category.id }))}>
                                    <Grid container alignItems="center" justifyContent="space-between">
                                        <Grid item xs={12} sm={9} md={9} sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Box sx={{ width: 70, height: 70, mr: 2 }}>
                                                <img
                                                    src={category.image ? tenantAsset(category.image) : '/assets/dish.png'}
                                                    alt={category.name}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'contain',
                                                        borderRadius: '50%',
                                                    }}
                                                />
                                            </Box>
                                            <Box>
                                                <Typography sx={{ fontSize: '18px', fontWeight: 500, color: '#121212' }}>{category.name}</Typography>
                                                <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#121212' }}>Products ({category.products_count ?? 0})</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item>
                                            <IconButton onClick={() => handleEdit(category)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleDeleteClick(category)}>
                                                <DeleteIcon color="error" />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Dialog
                open={openAddMenu}
                onClose={handleAddMenuClose}
                fullWidth
                maxWidth="sm"
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
                        {editingCategoryId ? 'Edit Category' : 'Add Category'}
                    </Typography>
                    <IconButton onClick={handleAddMenuClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <DialogContent sx={{ p: 0 }}>
                    <Box sx={{ px: 3, pb: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    Category Name
                                </Typography>
                                <TextField fullWidth placeholder="Enter category name" name="name" value={data.name} onChange={handleInputChange} variant="outlined" size="small" error={!!errors.name} helperText={errors.name} />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    Category Image
                                </Typography>
                                <Button variant="outlined" component="label" size="medium" fullWidth>
                                    {data.image || data.existingImage ? 'Replace Image' : 'Upload Image'}
                                    <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                                </Button>
                                {errors.image && (
                                    <Typography color="error" variant="caption">
                                        {errors.image}
                                    </Typography>
                                )}
                                {(data.image || data.existingImage) && (
                                    <Box sx={{ mb: 1, mt: 2 }}>
                                        <img src={data.image ? URL.createObjectURL(data.image) : tenantAsset(data.existingImage)} alt="Preview" style={{ width: '100%', height: 100, objectFit: 'contain', borderRadius: 8 }} />
                                    </Box>
                                )}
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
            <Dialog fullScreen={fullScreen} open={!!pendingDeleteCategory} onClose={handleCancelDelete}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete the category "{pendingDeleteCategory?.name}"?
                        <br />
                        You can optionally move its products to another category:
                    </DialogContentText>

                    <FormControl fullWidth>
                        <InputLabel id="delete-category">Reassign Products To</InputLabel>
                        <Select labelId="delete-category" id="demo-delete-category" value={reassignCategoryId || ''} onChange={(e) => setReassignCategoryId(e.target.value)} label="Reassign Products To">
                            <MenuItem value=" ">— Leave products uncategorized —</MenuItem>
                            {categoriesList
                                .filter((cat) => cat.id !== pendingDeleteCategory?.id)
                                .map((cat) => (
                                    <MenuItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} sx={{ color: '#c62828' }} disabled={deleting} loading={deleting} loadingPosition="start">
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
