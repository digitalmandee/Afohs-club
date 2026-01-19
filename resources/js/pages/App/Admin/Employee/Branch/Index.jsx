import { router } from '@inertiajs/react';
import AddIcon from '@mui/icons-material/Add';
import { FaRegEdit } from 'react-icons/fa';
import { RiDeleteBin6Line } from 'react-icons/ri';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Button, IconButton, TextField, DialogActions, Dialog, DialogContent, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, MenuItem, Select, FormControl, InputLabel, TablePagination } from '@mui/material';
import { useState } from 'react';
import { useSnackbar } from 'notistack';

const BranchIndex = ({ branches: initialData }) => {
    const { enqueueSnackbar } = useSnackbar();
    const { data: branchesData, current_page, per_page, total } = initialData;
    const [search, setSearch] = useState('');

    // Modal States
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        status: true,
    });

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            router.visit(route('branches.index'), {
                data: { search: search },
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const handlePageChange = (event, newPage) => {
        router.visit(route('branches.index'), {
            data: { page: newPage + 1, search },
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleOpen = () => {
        setFormData({ name: '', address: '', status: true });
        setEditMode(false);
        setOpenAddModal(true);
    };

    const handleEdit = (branch) => {
        setFormData({
            name: branch.name,
            address: branch.address || '',
            status: branch.status,
        });
        setSelectedBranch(branch);
        setEditMode(true);
        setOpenAddModal(true);
    };

    const handleClose = () => {
        setOpenAddModal(false);
        setEditMode(false);
        setSelectedBranch(null);
    };

    const handleSubmit = () => {
        if (!formData.name) {
            enqueueSnackbar('Name is required', { variant: 'error' });
            return;
        }

        const url = editMode ? route('branches.update', selectedBranch.id) : route('branches.store');
        const method = editMode ? 'put' : 'post';

        router[method](url, formData, {
            onSuccess: () => {
                enqueueSnackbar(editMode ? 'Branch updated successfully' : 'Branch created successfully', { variant: 'success' });
                handleClose();
            },
            onError: (errors) => {
                enqueueSnackbar('Operation failed. Check inputs.', { variant: 'error' });
            },
        });
    };

    const handleDeleteClick = (branch) => {
        setSelectedBranch(branch);
        setOpenDeleteModal(true);
    };

    const confirmDelete = () => {
        router.delete(route('branches.destroy', selectedBranch.id), {
            onSuccess: () => {
                enqueueSnackbar('Branch deleted successfully', { variant: 'success' });
                setOpenDeleteModal(false);
            },
            onError: () => {
                enqueueSnackbar('Failed to delete branch', { variant: 'error' });
            },
        });
    };

    return (
        <Box sx={{ px: 4, py: 2 }}>
            <div style={{ paddingTop: '1rem', backgroundColor: 'transparent' }}>
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <Typography sx={{ fontWeight: 500, fontSize: '30px', color: '#063455' }}>Branch Management</Typography>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginLeft: 'auto' }}>
                        <div style={{ width: '350px', backgroundColor: '#FFFFFF' }}>
                            <TextField
                                fullWidth
                                placeholder="Search branch..."
                                size="small"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearch}
                                InputProps={{
                                    startAdornment: <SearchIcon style={{ color: '#121212', marginRight: '8px' }} />,
                                    style: { backgroundColor: '#FFFFFF' },
                                }}
                            />
                        </div>

                        <Button style={{ color: 'white', width: '180px', backgroundColor: '#063455', textTransform: 'none' }} startIcon={<AddIcon />} onClick={handleOpen}>
                            Add Branch
                        </Button>
                        <Button color="error" onClick={() => router.visit(route('branches.trashed'))} sx={{ minWidth: 'auto', p: 1 }}>
                            <RiDeleteBin6Line style={{ width: 20, height: 20 }} />
                        </Button>
                    </div>
                </div>

                <TableContainer component={Paper} style={{ width: '100%', backgroundColor: '#FFFFFF', borderRadius: '1rem', boxShadow: 'none', border: '1px solid #ccc', marginBottom: '24px' }}>
                    <Table>
                        <TableHead style={{ backgroundColor: '#E5E5EA' }}>
                            <TableRow>
                                <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '18px' }}>Name</TableCell>
                                <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '18px' }}>Address</TableCell>
                                <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '18px' }}>Status</TableCell>
                                <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '18px' }} align="right">
                                    Action
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {branchesData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        No branches found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                branchesData.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell style={{ fontSize: '16px', color: '#6C6C6C' }}>{item.name}</TableCell>
                                        <TableCell style={{ fontSize: '16px', color: '#6C6C6C' }}>{item.address || '-'}</TableCell>
                                        <TableCell style={{ fontSize: '16px', color: item.status ? 'green' : 'red' }}>{item.status ? 'Active' : 'Inactive'}</TableCell>
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

                <TablePagination rowsPerPageOptions={[10, 25, 50]} component="div" count={total} rowsPerPage={per_page} page={current_page - 1} onPageChange={handlePageChange} />

                {/* Add/Edit Modal */}
                <Dialog open={openAddModal} onClose={handleClose} maxWidth="sm" fullWidth>
                    <DialogContent sx={{ pt: 3, pb: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                            {editMode ? 'Edit Branch' : 'Add Branch'}
                        </Typography>

                        <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                            Name
                        </Typography>
                        <TextField fullWidth value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} variant="outlined" sx={{ mb: 2 }} />

                        <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                            Address
                        </Typography>
                        <TextField fullWidth value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} variant="outlined" multiline rows={2} sx={{ mb: 2 }} />

                        <FormControl fullWidth>
                            <InputLabel id="status-label">Status</InputLabel>
                            <Select labelId="status-label" value={formData.status} label="Status" onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                <MenuItem value={true}>Active</MenuItem>
                                <MenuItem value={false}>Inactive</MenuItem>
                            </Select>
                        </FormControl>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button onClick={handleSubmit} variant="contained" sx={{ backgroundColor: '#063455' }}>
                            {editMode ? 'Update' : 'Add'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Modal */}
                <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)} maxWidth="xs">
                    <DialogContent sx={{ pt: 3 }}>
                        <Typography variant="h6" align="center" sx={{ mb: 2 }}>
                            Delete Branch?
                        </Typography>
                        <Typography variant="body2" align="center" color="textSecondary">
                            This action cannot be undone.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                        <Button onClick={() => setOpenDeleteModal(false)} variant="outlined">
                            Close
                        </Button>
                        <Button onClick={confirmDelete} variant="contained" color="error">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </Box>
    );
};

export default BranchIndex;
