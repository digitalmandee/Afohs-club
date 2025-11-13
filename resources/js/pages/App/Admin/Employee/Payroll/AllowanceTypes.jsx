import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AdminLayout from '@/layouts/AdminLayout';
import {
    Box,
    Card,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Alert,
    Snackbar,
    Tooltip
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    ArrowBack as ArrowBackIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import axios from 'axios';

const AllowanceTypes = () => {
    const [allowanceTypes, setAllowanceTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const [formData, setFormData] = useState({
        name: '',
        type: 'fixed',
        description: '',
        is_taxable: false,
        is_active: true
    });

    useEffect(() => {
        fetchAllowanceTypes();
    }, []);

    const fetchAllowanceTypes = async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('api.payroll.allowance-types'));
            if (response.data.success) {
                setAllowanceTypes(response.data.allowanceTypes || []);
            } else {
                setAllowanceTypes([]);
                showSnackbar('Failed to load allowance types', 'error');
            }
        } catch (error) {
            console.error('Error fetching allowance types:', error);
            setAllowanceTypes([]);
            showSnackbar('Error loading allowance types', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            let response;
            if (editingType) {
                response = await axios.put(`/api/payroll/allowance-types/${editingType.id}`, formData);
            } else {
                response = await axios.post('/api/payroll/allowance-types', formData);
            }

            if (response.data.success) {
                showSnackbar(
                    editingType ? 'Allowance type updated successfully!' : 'Allowance type created successfully!',
                    'success'
                );
                handleCloseDialog();
                fetchAllowanceTypes();
            }
        } catch (error) {
            console.error('Error saving allowance type:', error);
            if (error.response?.data?.errors) {
                const errorMessages = Object.values(error.response.data.errors).flat().join(', ');
                showSnackbar(`Validation errors: ${errorMessages}`, 'error');
            } else {
                showSnackbar('Error saving allowance type', 'error');
            }
        }
    };

    const handleEdit = (allowanceType) => {
        setEditingType(allowanceType);
        setFormData({
            name: allowanceType.name,
            type: allowanceType.type,
            description: allowanceType.description || '',
            is_taxable: allowanceType.is_taxable,
            is_active: allowanceType.is_active
        });
        setShowDialog(true);
    };

    const handleDelete = async (allowanceType) => {
        if (window.confirm(`Are you sure you want to delete "${allowanceType.name}"?`)) {
            try {
                const response = await axios.delete(`/api/payroll/allowance-types/${allowanceType.id}`);
                if (response.data.success) {
                    showSnackbar('Allowance type deleted successfully!', 'success');
                    fetchAllowanceTypes();
                }
            } catch (error) {
                console.error('Error deleting allowance type:', error);
                showSnackbar('Error deleting allowance type', 'error');
            }
        }
    };

    const handleCloseDialog = () => {
        setShowDialog(false);
        setEditingType(null);
        setFormData({
            name: '',
            type: 'fixed',
            description: '',
            is_taxable: false,
            is_active: true
        });
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'fixed': return 'primary';
            case 'percentage': return 'secondary';
            case 'conditional': return 'warning';
            default: return 'default';
        }
    };

    const getStatusColor = (isActive) => {
        return isActive ? 'success' : 'error';
    };

    return (
        <AdminLayout>
            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => router.visit(route('employees.payroll.dashboard'))}
                            sx={{ color: '#063455' }}
                        >
                            Back to Dashboard
                        </Button>
                        <Typography variant="h4" sx={{ color: '#063455', fontWeight: 600 }}>
                            Allowance Types
                        </Typography>
                    </Box>
                    <Button
                        startIcon={<AddIcon />}
                        onClick={() => setShowDialog(true)}
                        variant="contained"
                        sx={{ 
                            backgroundColor: '#063455',
                            '&:hover': { backgroundColor: '#052d45' }
                        }}
                    >
                        Add Allowance Type
                    </Button>
                </Box>

                {/* Allowance Types Table */}
                <Card>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                                    <TableCell sx={{ fontWeight: 600, color: '#063455' }}>Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#063455' }}>Type</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#063455' }}>Description</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#063455' }}>Taxable</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#063455' }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#063455' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : (allowanceTypes || []).length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <TrendingUpIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                                                <Typography color="textSecondary">
                                                    No allowance types found
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    (allowanceTypes || []).map((allowanceType) => (
                                        <TableRow 
                                            key={allowanceType.id}
                                            sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
                                        >
                                            <TableCell>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                    {allowanceType.name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={allowanceType.type}
                                                    size="small"
                                                    color={getTypeColor(allowanceType.type)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="textSecondary">
                                                    {allowanceType.description || 'No description'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={allowanceType.is_taxable ? 'Yes' : 'No'}
                                                    size="small"
                                                    color={allowanceType.is_taxable ? 'warning' : 'success'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={allowanceType.is_active ? 'Active' : 'Inactive'}
                                                    size="small"
                                                    color={getStatusColor(allowanceType.is_active)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Tooltip title="Edit">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleEdit(allowanceType)}
                                                            sx={{ color: '#ed6c02' }}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDelete(allowanceType)}
                                                            sx={{ color: '#d32f2f' }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>

                {/* Add/Edit Dialog */}
                <Dialog open={showDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                    <DialogTitle>
                        <Typography variant="h6" sx={{ color: '#063455', fontWeight: 600 }}>
                            {editingType ? 'Edit Allowance Type' : 'Add New Allowance Type'}
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Type</InputLabel>
                                    <Select
                                        value={formData.type}
                                        label="Type"
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <MenuItem value="fixed">Fixed Amount</MenuItem>
                                        <MenuItem value="percentage">Percentage</MenuItem>
                                        <MenuItem value="conditional">Conditional</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    multiline
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Taxable</InputLabel>
                                    <Select
                                        value={formData.is_taxable}
                                        label="Taxable"
                                        onChange={(e) => setFormData({ ...formData, is_taxable: e.target.value })}
                                    >
                                        <MenuItem value={false}>No</MenuItem>
                                        <MenuItem value={true}>Yes</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={formData.is_active}
                                        label="Status"
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.value })}
                                    >
                                        <MenuItem value={true}>Active</MenuItem>
                                        <MenuItem value={false}>Inactive</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            variant="contained"
                            sx={{ 
                                backgroundColor: '#063455',
                                '&:hover': { backgroundColor: '#052d45' }
                            }}
                        >
                            {editingType ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar for notifications */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </AdminLayout>
    );
};

export default AllowanceTypes;
