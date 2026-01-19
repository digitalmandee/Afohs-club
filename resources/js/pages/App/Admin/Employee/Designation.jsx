import { router } from '@inertiajs/react';
import AddIcon from '@mui/icons-material/Add';
import { FaRegEdit } from 'react-icons/fa';
import { RiDeleteBin6Line } from 'react-icons/ri';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Button, IconButton, TextField, DialogActions, InputBase, Dialog, DialogContent, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, CircularProgress, MenuItem, Select, FormControl, InputLabel, TablePagination, Autocomplete } from '@mui/material';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const Designation = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [designations, setDesignations] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});

    // Modal States
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedDesignation, setSelectedDesignation] = useState(null);

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'active',
    });

    const fetchDesignations = () => {
        setLoading(true);
        axios
            .get(route('designations.data'), {
                params: {
                    search: search,
                    page: page,
                },
            })
            .then((res) => {
                if (res.data.success) {
                    setDesignations(res.data.data.data);
                    setPagination(res.data.data);
                }
            })
            .catch((err) => {
                console.error(err);
                enqueueSnackbar('Failed to fetch designations', { variant: 'error' });
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchDesignations();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, page]);

    const handleOpen = () => {
        setFormData({ name: '', description: '', status: 'active' });
        setEditMode(false);
        setOpenAddModal(true);
    };

    const handleEdit = (designation) => {
        setFormData({
            name: designation.name,
            description: designation.description || '',
            status: designation.status,
        });
        setSelectedDesignation(designation);
        setEditMode(true);
        setOpenAddModal(true);
    };

    const handleClose = () => {
        setOpenAddModal(false);
        setEditMode(false);
        setSelectedDesignation(null);
    };

    const handleSubmit = () => {
        if (!formData.name) {
            enqueueSnackbar('Name is required', { variant: 'error' });
            return;
        }

        const url = editMode ? route('designations.update', selectedDesignation.id) : route('designations.store');

        const method = editMode ? 'put' : 'post';

        axios[method](url, formData)
            .then((res) => {
                if (res.data.success) {
                    enqueueSnackbar(res.data.message, { variant: 'success' });
                    fetchDesignations();
                    handleClose();
                }
            })
            .catch((err) => {
                const message = err.response?.data?.message || 'Operation failed';
                enqueueSnackbar(message, { variant: 'error' });
            });
    };

    const handleDeleteClick = (designation) => {
        setSelectedDesignation(designation);
        setOpenDeleteModal(true);
    };

    const confirmDelete = () => {
        axios
            .delete(route('designations.destroy', selectedDesignation.id))
            .then((res) => {
                if (res.data.success) {
                    enqueueSnackbar(res.data.message, { variant: 'success' });
                    fetchDesignations();
                    setOpenDeleteModal(false);
                }
            })
            .catch((err) => {
                enqueueSnackbar('Failed to delete designation', { variant: 'error' });
            });
    };

    const [searchOptions, setSearchOptions] = useState([]);

    // Fetch options for Autocomplete
    useEffect(() => {
        axios.get(route('designations.list')).then((res) => {
            if (res.data.success) {
                setSearchOptions(res.data.data.slice(0, 30)); // Limit to 30 as requested
            }
        });
    }, []);

    return (
        <Box sx={{ px: 4, py: 2 }}>
            <div style={{ paddingTop: '1rem', backgroundColor: 'transparent' }}>
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <Typography sx={{ fontWeight: 500, fontSize: '30px', color: '#063455' }}>Designation List</Typography>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginLeft: 'auto' }}>
                        <div style={{ width: '350px', backgroundColor: '#FFFFFF' }}>
                            <Autocomplete
                                freeSolo
                                options={searchOptions.map((option) => option.name)}
                                value={search}
                                onChange={(event, newValue) => {
                                    setSearch(newValue || '');
                                    setPage(1);
                                }}
                                onInputChange={(event, newInputValue) => {
                                    setSearch(newInputValue || '');
                                    setPage(1);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Search designation..."
                                        size="small"
                                        InputProps={{
                                            ...params.InputProps,
                                            startAdornment: <SearchIcon style={{ color: '#121212', marginRight: '8px' }} />,
                                            style: { backgroundColor: '#FFFFFF' },
                                        }}
                                    />
                                )}
                            />
                        </div>

                        <Button style={{ color: 'white', width: '180px', backgroundColor: '#063455', textTransform: 'none' }} startIcon={<AddIcon />} onClick={handleOpen}>
                            Add Designation
                        </Button>
                        <Button color="error" onClick={() => router.visit(route('designations.trashed'))} sx={{ minWidth: 'auto', p: 1 }}>
                            <RiDeleteBin6Line style={{ width: 20, height: 20 }} />
                        </Button>
                    </div>
                </div>

                <TableContainer component={Paper} style={{ width: '100%', backgroundColor: '#FFFFFF', borderRadius: '1rem', boxShadow: 'none', border: '1px solid #ccc', marginBottom: '24px' }}>
                    <Table>
                        <TableHead style={{ backgroundColor: '#E5E5EA' }}>
                            <TableRow>
                                <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '18px' }}>Name</TableCell>
                                <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '18px' }}>Description</TableCell>
                                <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '18px' }}>Employees</TableCell>
                                <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '18px' }}>Status</TableCell>
                                <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '18px' }} align="right">
                                    Action
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : designations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        No designations found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                designations.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell style={{ fontSize: '16px', color: '#6C6C6C' }}>{item.name}</TableCell>
                                        <TableCell style={{ fontSize: '16px', color: '#6C6C6C' }}>{item.description || '-'}</TableCell>
                                        <TableCell style={{ fontSize: '16px', color: '#6C6C6C', fontWeight: 'bold' }}>{item.employees_count || 0}</TableCell>
                                        <TableCell style={{ fontSize: '16px', color: item.status === 'active' ? 'green' : 'red', textTransform: 'capitalize' }}>{item.status}</TableCell>
                                        <TableCell align="right">
                                            <IconButton onClick={() => handleEdit(item)}>
                                                <FaRegEdit style={{ width: 15, height: 15 }} />
                                            </IconButton>
                                            <IconButton onClick={() => handleDeleteClick(item)}>
                                                <RiDeleteBin6Line style={{ width: 15, height: 15 }} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={pagination.total || 0}
                    rowsPerPage={pagination.per_page || 10}
                    page={(pagination.current_page || 1) - 1} // MUI uses 0-based page
                    onPageChange={(e, newPage) => setPage(newPage + 1)} // Backend uses 1-based page
                    onRowsPerPageChange={(e) => {
                        // For now we don't have dynamic per_page in backend, but we can restart to page 1
                        setPage(1);
                        // Optional: update backend fetch to accept per_page if needed
                    }}
                />

                {/* Add/Edit Modal */}
                <Dialog open={openAddModal} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 1, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)' } }}>
                    <DialogContent sx={{ pt: 3, pb: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                            {editMode ? 'Edit Designation' : 'Add Designation'}
                        </Typography>

                        <Typography variant="body1" sx={{ mb: 1, fontWeight: 500, color: '#121212' }}>
                            Name
                        </Typography>
                        <TextField fullWidth placeholder="e.g. Senior Developer" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} variant="outlined" sx={{ mb: 2 }} />

                        <Typography variant="body1" sx={{ mb: 1, fontWeight: 500, color: '#121212' }}>
                            Description
                        </Typography>
                        <TextField fullWidth placeholder="Optional description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} variant="outlined" multiline rows={3} sx={{ mb: 2 }} />

                        <FormControl fullWidth>
                            <InputLabel id="status-label">Status</InputLabel>
                            <Select labelId="status-label" value={formData.status} label="Status" onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                            </Select>
                        </FormControl>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={handleClose} sx={{ color: '#666' }}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} sx={{ backgroundColor: '#063455', color: 'white', '&:hover': { backgroundColor: '#052c47' } }}>
                            {editMode ? 'Update' : 'Add'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Modal */}
                <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)} maxWidth="xs" PaperProps={{ sx: { borderRadius: 1, width: '300px' } }}>
                    <DialogContent sx={{ pt: 3 }}>
                        <Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 500, mb: 2 }}>
                            Delete Designation?
                        </Typography>
                        <Typography variant="body2" sx={{ textAlign: 'center', color: '#666' }}>
                            This action cannot be undone.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ px: 2, pb: 2, justifyContent: 'center', gap: 1 }}>
                        <Button onClick={() => setOpenDeleteModal(false)} variant="outlined" sx={{ flex: 1 }}>
                            Close
                        </Button>
                        <Button onClick={confirmDelete} variant="contained" sx={{ backgroundColor: '#f44336', color: 'white', flex: 1, '&:hover': { backgroundColor: '#d32f2f' } }}>
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </Box>
    );
};

export default Designation;
