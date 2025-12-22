import { useState, useEffect } from 'react';
import { Typography, Button, TextField, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper, IconButton, Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Tooltip, Autocomplete, CircularProgress, Chip } from '@mui/material';
import { router, usePage } from '@inertiajs/react';
import { useSnackbar } from 'notistack';
import { FaEdit } from 'react-icons/fa';
import { Delete } from '@mui/icons-material';
import axios from 'axios';

import 'bootstrap/dist/css/bootstrap.min.css';

const PartnersAffiliatesIndex = ({ partners, filters = {} }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // Filter State
    const [filterValues, setFilterValues] = useState({
        search: filters.search || '',
        type: filters.type || 'all',
        status: filters.status || 'all',
    });

    const handleFilterChange = (key, value) => {
        setFilterValues({ ...filterValues, [key]: value });
    };

    const handleApplyFilters = () => {
        router.get(route('admin.membership.partners-affiliates.index'), filterValues, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleResetFilters = () => {
        setFilterValues({
            search: '',
            type: 'all',
            status: 'all',
        });
        router.get(
            route('admin.membership.partners-affiliates.index'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleDeleteClick = (item) => {
        setItemToDelete(item);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            router.delete(route('admin.membership.partners-affiliates.destroy', itemToDelete.id), {
                onSuccess: () => {
                    enqueueSnackbar('Partner/Affiliate deleted successfully', { variant: 'success' });
                    setDeleteDialogOpen(false);
                    setItemToDelete(null);
                },
                onError: () => {
                    enqueueSnackbar('Failed to delete.', { variant: 'error' });
                },
            });
        }
    };

    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Debounce function to fetch partners
    useEffect(() => {
        const timer = setTimeout(() => {
            if (open) {
                if (filterValues.search) {
                    fetchPartners(filterValues.search);
                }
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [filterValues.search, open]);

    const fetchPartners = async (query) => {
        setLoading(true);
        try {
            const response = await axios.get(route('admin.membership.partners-affiliates.search'), {
                params: { query },
            });
            setOptions(response.data.partners || []);
        } catch (error) {
            console.error('Failed to fetch partners', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid px-4 pt-4" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', overflowX: 'hidden' }}>
            <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <Typography sx={{ fontWeight: 600, fontSize: '24px', color: '#063455' }}>Partners & Affiliates</Typography>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Button
                            variant="outlined"
                            onClick={() => router.get(route('admin.membership.partners-affiliates.trashed'))}
                            sx={{
                                color: '#d32f2f',
                                borderColor: '#d32f2f',
                                '&:hover': {
                                    backgroundColor: '#ffebee',
                                    borderColor: '#d32f2f',
                                },
                            }}
                        >
                            Deleted Partners
                        </Button>
                        <Button variant="contained" style={{ backgroundColor: '#063455', color: '#fff' }} onClick={() => router.visit(route('admin.membership.partners-affiliates.create'))}>
                            Add New
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Box component={Paper} elevation={0} sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Autocomplete
                        sx={{ minWidth: 250 }}
                        open={open}
                        onOpen={() => setOpen(true)}
                        onClose={() => setOpen(false)}
                        isOptionEqualToValue={(option, value) => option.organization_name === value.organization_name}
                        getOptionLabel={(option) => option.organization_name || ''}
                        options={options}
                        loading={loading}
                        value={options.find((opt) => opt.organization_name === filterValues.search) || (filterValues.search ? { organization_name: filterValues.search } : null)}
                        onInputChange={(event, newInputValue) => {
                            handleFilterChange('search', newInputValue);
                        }}
                        onChange={(event, newValue) => {
                            handleFilterChange('search', newValue ? newValue.organization_name : '');
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Search..."
                                size="small"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                        renderOption={(props, option) => (
                            <li {...props} key={option.id}>
                                <Box sx={{ width: '100%' }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2" fontWeight="bold">
                                            {option.organization_name}
                                        </Typography>
                                        <Chip
                                            component="span"
                                            label={option.status}
                                            size="small"
                                            sx={{
                                                height: '20px',
                                                fontSize: '10px',
                                                backgroundColor: option.status === 'Active' ? '#e8f5e9' : '#ffebee',
                                                color: option.status === 'Active' ? '#2e7d32' : '#c62828',
                                                textTransform: 'capitalize',
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                        {option.email} | {option.focal_person_name}
                                    </Typography>
                                </Box>
                            </li>
                        )}
                    />
                    <TextField select size="small" label="Type" value={filterValues.type} onChange={(e) => handleFilterChange('type', e.target.value)} sx={{ minWidth: 150 }} SelectProps={{ native: true }}>
                        <option value="all">All Types</option>
                        <option value="Club">Club</option>
                        <option value="Company">Company</option>
                        <option value="Other">Other</option>
                    </TextField>
                    <TextField select size="small" label="Status" value={filterValues.status} onChange={(e) => handleFilterChange('status', e.target.value)} sx={{ minWidth: 150 }} SelectProps={{ native: true }}>
                        <option value="all">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </TextField>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button variant="outlined" size="small" onClick={handleResetFilters} sx={{ color: '#333', borderColor: '#ddd', textTransform: 'none' }}>
                            Reset
                        </Button>
                        <Button variant="contained" size="small" onClick={handleApplyFilters} sx={{ backgroundColor: '#0a3d62', color: 'white', textTransform: 'none', '&:hover': { backgroundColor: '#083352' } }}>
                            Search
                        </Button>
                    </div>
                </Box>

                <TableContainer component={Paper} style={{ boxShadow: 'none', overflowX: 'auto' }}>
                    <Table>
                        <TableHead>
                            <TableRow style={{ backgroundColor: '#000', height: '50px' }}>
                                <TableCell sx={{ color: '#fff', fontSize: '12px', fontWeight: 700, padding: '6px' }}>SR #</TableCell>
                                <TableCell sx={{ color: '#fff', fontSize: '12px', fontWeight: 700, padding: '6px' }}>ID</TableCell>
                                <TableCell sx={{ color: '#fff', fontSize: '12px', fontWeight: 700, padding: '6px' }}>PARTNER / AFFILIATE</TableCell>
                                <TableCell sx={{ color: '#fff', fontSize: '12px', fontWeight: 700, padding: '6px' }}>ADDRESS</TableCell>
                                <TableCell sx={{ color: '#fff', fontSize: '12px', fontWeight: 700, padding: '6px' }}>TELEPHONE</TableCell>
                                <TableCell sx={{ color: '#fff', fontSize: '12px', fontWeight: 700, padding: '6px' }}>EMAIL</TableCell>
                                <TableCell sx={{ color: '#fff', fontSize: '12px', fontWeight: 700, padding: '6px' }}>FOCAL PERSON</TableCell>
                                <TableCell sx={{ color: '#fff', fontSize: '12px', fontWeight: 700, padding: '6px' }}>MOBILE</TableCell>
                                <TableCell sx={{ color: '#fff', fontSize: '12px', fontWeight: 700, padding: '6px' }}>EMAIL</TableCell>
                                <TableCell sx={{ color: '#fff', fontSize: '12px', fontWeight: 700, padding: '6px' }}>STATUS</TableCell>
                                <TableCell sx={{ color: '#fff', fontSize: '12px', fontWeight: 700, padding: '6px' }}>EDIT</TableCell>
                                <TableCell sx={{ color: '#fff', fontSize: '12px', fontWeight: 700, padding: '6px' }}>DELETE</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {partners.data.length > 0 ? (
                                partners.data.map((partner, index) => (
                                    <TableRow key={partner.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>{index + 1}</TableCell>
                                        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>{partner.id}</TableCell>
                                        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>
                                            <Typography sx={{ fontSize: '12px', fontWeight: 600 }}>{partner.organization_name}</Typography>
                                            <Typography sx={{ fontSize: '10px', color: '#666' }}>({partner.type})</Typography>
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>{partner.address}</TableCell>
                                        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>{partner.telephone}</TableCell>
                                        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>{partner.email}</TableCell>
                                        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>{partner.focal_person_name}</TableCell>
                                        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>{partner.focal_mobile_a}</TableCell>
                                        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>{partner.focal_email}</TableCell>
                                        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>
                                            <span
                                                style={{
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    fontSize: '10px',
                                                    fontWeight: 600,
                                                    backgroundColor: partner.status === 'Active' ? '#e8f5e9' : '#ffebee',
                                                    color: partner.status === 'Active' ? '#2e7d32' : '#c62828',
                                                }}
                                            >
                                                {partner.status}
                                            </span>
                                        </TableCell>
                                        <TableCell sx={{ padding: '6px' }}>
                                            <Tooltip title="Edit">
                                                <IconButton size="small" onClick={() => router.visit(route('admin.membership.partners-affiliates.edit', partner.id))} sx={{ color: '#f57c00' }}>
                                                    <FaEdit size={14} />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell sx={{ padding: '6px' }}>
                                            <Tooltip title="Delete">
                                                <IconButton size="small" onClick={() => handleDeleteClick(partner)} sx={{ color: '#d32f2f' }}>
                                                    <Delete size={14} />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={12} align="center" sx={{ py: 3 }}>
                                        No partners or affiliates found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    <Box display="flex" justifyContent="center" mt={2} mb={2}>
                        {partners.links?.map((link, index) => (
                            <Button
                                key={index}
                                onClick={() => link.url && router.visit(link.url)}
                                disabled={!link.url}
                                variant={link.active ? 'contained' : 'outlined'}
                                size="small"
                                style={{
                                    margin: '0 5px',
                                    minWidth: '36px',
                                    padding: '6px 10px',
                                    fontWeight: link.active ? 'bold' : 'normal',
                                    backgroundColor: link.active ? '#333' : '#fff',
                                    color: link.active ? '#fff' : '#333',
                                    borderColor: '#ccc',
                                }}
                            >
                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                            </Button>
                        ))}
                    </Box>
                </TableContainer>

                <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                    <DialogTitle>{'Confirm Deletion'}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>Are you sure you want to delete this record?</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={confirmDelete} color="error" autoFocus>
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
};

export default PartnersAffiliatesIndex;
