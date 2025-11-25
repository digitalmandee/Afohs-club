import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AdminLayout from '@/layouts/AdminLayout';
import { Box, Card, CardContent, Typography, Button, TextField, Grid, FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Alert, Snackbar, Divider, InputAdornment, Chip, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon, Person as PersonIcon, Edit as EditIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const EditSalaryStructure = ({ employee, allowanceTypes = [], deductionTypes = [] }) => {
    const [loading, setLoading] = useState(false);

    // Helper function to get salary structure (handles both camelCase and snake_case)
    const getSalaryStructure = () => {
        return employee?.salaryStructure || employee?.salary_structure;
    };
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const [formData, setFormData] = useState({
        basic_salary: '',
        effective_from: new Date(),
        effective_to: null,
        allowances: [],
        deductions: [],
    });

    const [showAllowanceDialog, setShowAllowanceDialog] = useState(false);
    const [showDeductionDialog, setShowDeductionDialog] = useState(false);
    const [selectedAllowanceType, setSelectedAllowanceType] = useState('');
    const [selectedDeductionType, setSelectedDeductionType] = useState('');
    const [allowanceAmount, setAllowanceAmount] = useState('');
    const [deductionAmount, setDeductionAmount] = useState('');
    const [editingAllowanceIndex, setEditingAllowanceIndex] = useState(null);
    const [editingDeductionIndex, setEditingDeductionIndex] = useState(null);

    useEffect(() => {
        // Initialize form data from props
        const salaryStructure = getSalaryStructure();
        if (salaryStructure) {
            setFormData({
                basic_salary: salaryStructure.basic_salary,
                effective_from: new Date(salaryStructure.effective_from),
                effective_to: salaryStructure.effective_to ? new Date(salaryStructure.effective_to) : null,
                allowances: employee.allowances || [],
                deductions: employee.deductions || [],
            });
        }
    }, [employee]);

    const handleSave = async () => {
        if (!formData.basic_salary) {
            showSnackbar('Please enter basic salary', 'error');
            return;
        }

        setSaving(true);
        try {
            const response = await axios.put(route('api.payroll.employees.salary-structure.update', employee.id), formData);

            if (response.data.success) {
                showSnackbar('Salary structure updated successfully!', 'success');
                setTimeout(() => {
                    router.visit(route('employees.payroll.salaries'));
                }, 1500);
            }
        } catch (error) {
            console.error('Error updating salary structure:', error);
            if (error.response?.data?.errors) {
                const errorMessages = Object.values(error.response.data.errors).flat().join(', ');
                showSnackbar(`Validation errors: ${errorMessages}`, 'error');
            } else {
                showSnackbar('Error updating salary structure', 'error');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleAddAllowance = () => {
        if (!selectedAllowanceType || !allowanceAmount) {
            showSnackbar('Please select allowance type and enter amount', 'error');
            return;
        }

        const allowanceType = (allowanceTypes || []).find((a) => a.id === selectedAllowanceType);
        const newAllowance = {
            allowance_type_id: selectedAllowanceType,
            allowance_type: allowanceType,
            amount: parseFloat(allowanceAmount),
            type: allowanceType.type,
        };

        if (editingAllowanceIndex !== null) {
            const updatedAllowances = [...formData.allowances];
            updatedAllowances[editingAllowanceIndex] = newAllowance;
            setFormData((prev) => ({ ...prev, allowances: updatedAllowances }));
            setEditingAllowanceIndex(null);
        } else {
            setFormData((prev) => ({
                ...prev,
                allowances: [...prev.allowances, newAllowance],
            }));
        }

        setSelectedAllowanceType('');
        setAllowanceAmount('');
        setShowAllowanceDialog(false);
    };

    const handleAddDeduction = () => {
        if (!selectedDeductionType || !deductionAmount) {
            showSnackbar('Please select deduction type and enter amount', 'error');
            return;
        }

        const deductionType = (deductionTypes || []).find((d) => d.id === selectedDeductionType);
        const newDeduction = {
            deduction_type_id: selectedDeductionType,
            deduction_type: deductionType,
            amount: parseFloat(deductionAmount),
            type: deductionType.type,
        };

        if (editingDeductionIndex !== null) {
            const updatedDeductions = [...formData.deductions];
            updatedDeductions[editingDeductionIndex] = newDeduction;
            setFormData((prev) => ({ ...prev, deductions: updatedDeductions }));
            setEditingDeductionIndex(null);
        } else {
            setFormData((prev) => ({
                ...prev,
                deductions: [...prev.deductions, newDeduction],
            }));
        }

        setSelectedDeductionType('');
        setDeductionAmount('');
        setShowDeductionDialog(false);
    };

    const handleEditAllowance = (index) => {
        const allowance = formData.allowances[index];
        setSelectedAllowanceType(allowance.allowance_type_id);
        setAllowanceAmount(allowance.amount.toString());
        setEditingAllowanceIndex(index);
        setShowAllowanceDialog(true);
    };

    const handleEditDeduction = (index) => {
        const deduction = formData.deductions[index];
        setSelectedDeductionType(deduction.deduction_type_id);
        setDeductionAmount(deduction.amount.toString());
        setEditingDeductionIndex(index);
        setShowDeductionDialog(true);
    };

    const handleRemoveAllowance = (index) => {
        setFormData((prev) => ({
            ...prev,
            allowances: prev.allowances.filter((_, i) => i !== index),
        }));
    };

    const handleRemoveDeduction = (index) => {
        setFormData((prev) => ({
            ...prev,
            deductions: prev.deductions.filter((_, i) => i !== index),
        }));
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
        })
            .format(amount || 0)
            .replace('PKR', 'Rs');
    };

    const calculateTotalAllowances = () => {
        return formData.allowances.reduce((total, allowance) => total + allowance.amount, 0);
    };

    const calculateTotalDeductions = () => {
        return formData.deductions.reduce((total, deduction) => total + deduction.amount, 0);
    };

    const calculateGrossSalary = () => {
        return parseFloat(formData.basic_salary || 0) + calculateTotalAllowances();
    };

    const calculateNetSalary = () => {
        return calculateGrossSalary() - calculateTotalDeductions();
    };

    const handleCloseAllowanceDialog = () => {
        setShowAllowanceDialog(false);
        setSelectedAllowanceType('');
        setAllowanceAmount('');
        setEditingAllowanceIndex(null);
    };

    const handleCloseDeductionDialog = () => {
        setShowDeductionDialog(false);
        setSelectedDeductionType('');
        setDeductionAmount('');
        setEditingDeductionIndex(null);
    };

    return (
        <AdminLayout>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Box sx={{ p: 3 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Button startIcon={<ArrowBackIcon />} onClick={() => router.visit(route('employees.payroll.salaries'))} sx={{ color: '#063455' }}>
                                Back to Salaries
                            </Button>
                            <Typography variant="h4" sx={{ color: '#063455', fontWeight: 600 }}>
                                Edit Salary Structure
                            </Typography>
                        </Box>
                        <Button
                            startIcon={<SaveIcon />}
                            onClick={handleSave}
                            variant="contained"
                            disabled={saving}
                            sx={{
                                backgroundColor: '#063455',
                                '&:hover': { backgroundColor: '#052d45' },
                            }}
                        >
                            {saving ? 'Updating...' : 'Update Structure'}
                        </Button>
                    </Box>

                    <Grid container spacing={4}>
                        {/* Employee Information */}
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                        <PersonIcon sx={{ color: '#063455', mr: 1 }} />
                                        <Typography variant="h6" sx={{ color: '#063455', fontWeight: 600 }}>
                                            Employee Information
                                        </Typography>
                                    </Box>

                                    {employee && (
                                        <Box>
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" color="textSecondary">
                                                    Name
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                    {employee.name}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" color="textSecondary">
                                                    Employee ID
                                                </Typography>
                                                <Typography variant="body1">{employee.employee_id}</Typography>
                                            </Box>
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" color="textSecondary">
                                                    Department
                                                </Typography>
                                                <Typography variant="body1">{employee.department?.name || 'N/A'}</Typography>
                                            </Box>
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" color="textSecondary">
                                                    Designation
                                                </Typography>
                                                <Typography variant="body1">{employee.designation || 'N/A'}</Typography>
                                            </Box>

                                            <Box>
                                                <Typography variant="subtitle2" color="textSecondary">
                                                    Current Status
                                                </Typography>
                                                <Chip label={employee.salary_structure ? 'Active' : 'No Structure'} size="small" color={employee.salary_structure ? 'success' : 'error'} />
                                            </Box>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Salary Summary */}
                            <Card sx={{ mt: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ color: '#063455', fontWeight: 600, mb: 3 }}>
                                        Updated Salary Summary
                                    </Typography>

                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">Basic Salary</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {formatCurrency(formData.basic_salary)}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">Total Allowances</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                                                {formatCurrency(calculateTotalAllowances())}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">Total Deductions</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#d32f2f' }}>
                                                {formatCurrency(calculateTotalDeductions())}
                                            </Typography>
                                        </Box>
                                        <Divider sx={{ my: 1 }} />
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                Gross Salary
                                            </Typography>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                {formatCurrency(calculateGrossSalary())}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#063455' }}>
                                                Net Salary
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#063455' }}>
                                                {formatCurrency(calculateNetSalary())}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Salary Structure Form */}
                        <Grid item xs={12} md={8}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" sx={{ color: '#063455', fontWeight: 600, mb: 3 }}>
                                        Salary Structure Details
                                    </Typography>

                                    <Grid container spacing={3} sx={{ mb: 4 }}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Basic Salary"
                                                type="number"
                                                value={formData.basic_salary}
                                                onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start">Rs</InputAdornment>,
                                                }}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <DatePicker label="Effective From" value={formData.effective_from} onChange={(date) => setFormData({ ...formData, effective_from: date })} renderInput={(params) => <TextField {...params} fullWidth required />} />
                                        </Grid>
                                    </Grid>

                                    {/* Allowances Section */}
                                    <Box sx={{ mb: 4 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Typography variant="h6" sx={{ color: '#063455', fontWeight: 600 }}>
                                                Allowances ({formData.allowances.length})
                                            </Typography>
                                            <Button startIcon={<AddIcon />} onClick={() => setShowAllowanceDialog(true)} variant="outlined" size="small" sx={{ color: '#2e7d32', borderColor: '#2e7d32' }}>
                                                Add Allowance
                                            </Button>
                                        </Box>

                                        {formData.allowances.length > 0 ? (
                                            <TableContainer component={Paper}>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Allowance Type</TableCell>
                                                            <TableCell>Type</TableCell>
                                                            <TableCell>Amount</TableCell>
                                                            <TableCell>Actions</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {formData.allowances.map((allowance, index) => (
                                                            <TableRow key={index}>
                                                                <TableCell>{allowance.allowance_type?.name || 'N/A'}</TableCell>
                                                                <TableCell>
                                                                    <Chip label={allowance.allowance_type?.type || allowance.type || 'N/A'} size="small" color="primary" />
                                                                </TableCell>
                                                                <TableCell>{formatCurrency(allowance.amount)}</TableCell>
                                                                <TableCell>
                                                                    <IconButton size="small" onClick={() => handleEditAllowance(index)} sx={{ color: '#ed6c02', mr: 1 }}>
                                                                        <EditIcon fontSize="small" />
                                                                    </IconButton>
                                                                    <IconButton size="small" onClick={() => handleRemoveAllowance(index)} sx={{ color: '#d32f2f' }}>
                                                                        <DeleteIcon fontSize="small" />
                                                                    </IconButton>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        ) : (
                                            <Box sx={{ textAlign: 'center', py: 3, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                                                <Typography color="textSecondary">No allowances added yet</Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    {/* Deductions Section */}
                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Typography variant="h6" sx={{ color: '#063455', fontWeight: 600 }}>
                                                Deductions ({formData.deductions.length})
                                            </Typography>
                                            <Button startIcon={<AddIcon />} onClick={() => setShowDeductionDialog(true)} variant="outlined" size="small" sx={{ color: '#d32f2f', borderColor: '#d32f2f' }}>
                                                Add Deduction
                                            </Button>
                                        </Box>

                                        {formData.deductions.length > 0 ? (
                                            <TableContainer component={Paper}>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Deduction Type</TableCell>
                                                            <TableCell>Type</TableCell>
                                                            <TableCell>Amount</TableCell>
                                                            <TableCell>Actions</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {formData.deductions.map((deduction, index) => (
                                                            <TableRow key={index}>
                                                                <TableCell>{deduction.deduction_type?.name}</TableCell>
                                                                <TableCell>
                                                                    <Chip label={deduction.deduction_type?.type || deduction.type || 'N/A'} size="small" color="secondary" />
                                                                </TableCell>
                                                                <TableCell>{formatCurrency(deduction.amount)}</TableCell>
                                                                <TableCell>
                                                                    <IconButton size="small" onClick={() => handleEditDeduction(index)} sx={{ color: '#ed6c02', mr: 1 }}>
                                                                        <EditIcon fontSize="small" />
                                                                    </IconButton>
                                                                    <IconButton size="small" onClick={() => handleRemoveDeduction(index)} sx={{ color: '#d32f2f' }}>
                                                                        <DeleteIcon fontSize="small" />
                                                                    </IconButton>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        ) : (
                                            <Box sx={{ textAlign: 'center', py: 3, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                                                <Typography color="textSecondary">No deductions added yet</Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Add/Edit Allowance Dialog */}
                    <Dialog open={showAllowanceDialog} onClose={handleCloseAllowanceDialog} maxWidth="sm" fullWidth>
                        <DialogTitle>{editingAllowanceIndex !== null ? 'Edit Allowance' : 'Add Allowance'}</DialogTitle>
                        <DialogContent>
                            <Grid container spacing={3} sx={{ mt: 1 }}>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>Allowance Type</InputLabel>
                                        <Select value={selectedAllowanceType} label="Allowance Type" onChange={(e) => setSelectedAllowanceType(e.target.value)}>
                                            {(allowanceTypes || []).map((type) => (
                                                <MenuItem key={type.id} value={type.id}>
                                                    {type.name} ({type.type})
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Amount"
                                        type="number"
                                        value={allowanceAmount}
                                        onChange={(e) => setAllowanceAmount(e.target.value)}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">Rs</InputAdornment>,
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseAllowanceDialog}>Cancel</Button>
                            <Button onClick={handleAddAllowance} variant="contained">
                                {editingAllowanceIndex !== null ? 'Update' : 'Add'}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Add/Edit Deduction Dialog */}
                    <Dialog open={showDeductionDialog} onClose={handleCloseDeductionDialog} maxWidth="sm" fullWidth>
                        <DialogTitle>{editingDeductionIndex !== null ? 'Edit Deduction' : 'Add Deduction'}</DialogTitle>
                        <DialogContent>
                            <Grid container spacing={3} sx={{ mt: 1 }}>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>Deduction Type</InputLabel>
                                        <Select value={selectedDeductionType} label="Deduction Type" onChange={(e) => setSelectedDeductionType(e.target.value)}>
                                            {(deductionTypes || []).map((type) => (
                                                <MenuItem key={type.id} value={type.id}>
                                                    {type.name} ({type.type})
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Amount"
                                        type="number"
                                        value={deductionAmount}
                                        onChange={(e) => setDeductionAmount(e.target.value)}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">Rs</InputAdornment>,
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDeductionDialog}>Cancel</Button>
                            <Button onClick={handleAddDeduction} variant="contained">
                                {editingDeductionIndex !== null ? 'Update' : 'Add'}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Snackbar for notifications */}
                    <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                            {snackbar.message}
                        </Alert>
                    </Snackbar>
                </Box>
            </LocalizationProvider>
        </AdminLayout>
    );
};

export default EditSalaryStructure;
