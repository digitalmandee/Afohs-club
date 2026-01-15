import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import axios from 'axios';
import AdminLayout from '@/layouts/AdminLayout';
import { Box, Card, CardContent, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem, Grid, IconButton, Alert } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';

const formatCurrency = (amount) => `Rs ${parseFloat(amount || 0).toLocaleString()}`;

const Create = ({ employees = [] }) => {
    const [formData, setFormData] = useState({
        employee_id: '',
        amount: '',
        advance_date: new Date().toISOString().split('T')[0],
        reason: '',
        deduction_months: 1,
        deduction_start_date: '',
        notes: '',
    });
    const [errors, setErrors] = useState({});
    const [employeeSalary, setEmployeeSalary] = useState(0);

    const fetchEmployeeSalary = async (empId) => {
        if (!empId) {
            setEmployeeSalary(0);
            return;
        }
        try {
            const response = await axios.get(route('employees.advances.salary', empId));
            if (response.data.success) {
                setEmployeeSalary(response.data.salary);
            }
        } catch (error) {
            console.error('Error fetching salary:', error);
        }
    };

    useEffect(() => {
        fetchEmployeeSalary(formData.employee_id);
    }, [formData.employee_id]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: null }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post(route('employees.advances.store'), formData, {
            onError: (errors) => setErrors(errors),
        });
    };

    const monthlyDeduction = formData.amount && formData.deduction_months ? (parseFloat(formData.amount) / parseInt(formData.deduction_months)).toFixed(2) : 0;

    return (
        <AdminLayout>
            <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <IconButton onClick={() => router.visit(route('employees.advances.index'))}>
                        <ArrowBackIcon sx={{ color: '#063455' }} />
                    </IconButton>
                    <Typography variant="h5" sx={{ color: '#063455', fontWeight: 700, ml: 1 }}>
                        New Advance Request
                    </Typography>
                </Box>

                <Card sx={{ borderRadius: '12px', p: 3 }}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth error={!!errors.employee_id}>
                                    <InputLabel>Employee *</InputLabel>
                                    <Select value={formData.employee_id} label="Employee *" onChange={(e) => handleChange('employee_id', e.target.value)}>
                                        <MenuItem value="">Select Employee</MenuItem>
                                        {employees.map((emp) => (
                                            <MenuItem key={emp.id} value={emp.id}>
                                                {emp.name} ({emp.employee_id || emp.id})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.employee_id && (
                                        <Typography variant="caption" color="error">
                                            {errors.employee_id}
                                        </Typography>
                                    )}
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth type="number" label="Advance Amount *" value={formData.amount} onChange={(e) => handleChange('amount', e.target.value)} error={!!errors.amount || (employeeSalary > 0 && parseFloat(formData.amount) > employeeSalary)} helperText={errors.amount || (employeeSalary > 0 ? (parseFloat(formData.amount) > employeeSalary ? `Error: Exceeds salary (${formatCurrency(employeeSalary)})` : `Max allowed: ${formatCurrency(employeeSalary)}`) : '')} InputProps={{ inputProps: { min: 1 } }} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth type="date" label="Advance Date *" value={formData.advance_date} onChange={(e) => handleChange('advance_date', e.target.value)} error={!!errors.advance_date} helperText={errors.advance_date} InputLabelProps={{ shrink: true }} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Reason" value={formData.reason} onChange={(e) => handleChange('reason', e.target.value)} error={!!errors.reason} helperText={errors.reason} />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField fullWidth type="number" label="Deduction Months *" value={formData.deduction_months} onChange={(e) => handleChange('deduction_months', e.target.value)} error={!!errors.deduction_months} helperText={errors.deduction_months || 'Number of months to deduct'} InputProps={{ inputProps: { min: 1, max: 24 } }} />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField fullWidth type="date" label="Deduction Start Date" value={formData.deduction_start_date} onChange={(e) => handleChange('deduction_start_date', e.target.value)} InputLabelProps={{ shrink: true }} helperText="Leave empty for next payroll" />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Card sx={{ p: 2, backgroundColor: '#e3f2fd', textAlign: 'center' }}>
                                    <Typography variant="body2" color="textSecondary">
                                        Monthly Deduction
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                                        Rs {monthlyDeduction}
                                    </Typography>
                                </Card>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth multiline rows={3} label="Notes" value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} />
                            </Grid>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button type="submit" variant="contained" startIcon={<SaveIcon />} sx={{ backgroundColor: '#063455' }}>
                                        Submit Request
                                    </Button>
                                    <Button variant="outlined" onClick={() => router.visit(route('employees.advances.index'))} sx={{ borderColor: '#063455', color: '#063455' }}>
                                        Cancel
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Card>
            </Box>
        </AdminLayout>
    );
};

export default Create;
