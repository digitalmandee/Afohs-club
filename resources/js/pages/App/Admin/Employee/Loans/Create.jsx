import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AdminLayout from '@/layouts/AdminLayout';
import { Box, Card, CardContent, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem, Grid, IconButton, Alert, Slider } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon, Calculate as CalculateIcon } from '@mui/icons-material';
import axios from 'axios';

const formatCurrency = (amount) => `Rs ${parseFloat(amount || 0).toLocaleString()}`;

const Create = ({ employees = [] }) => {
    const [formData, setFormData] = useState({
        employee_id: '',
        amount: '',
        loan_date: new Date().toISOString().split('T')[0],
        reason: '',
        installments: 12,
        notes: '',
    });
    const [errors, setErrors] = useState({});
    const [employeeSalary, setEmployeeSalary] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchEmployeeSalary = async (empId) => {
        if (!empId) return;
        setLoading(true);
        try {
            const response = await axios.get(route('employees.loans.salary', empId));
            if (response.data.success) {
                setEmployeeSalary(response.data.salary);
            }
        } catch (error) {
            console.error('Error fetching salary:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (formData.employee_id) {
            fetchEmployeeSalary(formData.employee_id);
        }
    }, [formData.employee_id]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: null }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post(route('employees.loans.store'), formData, {
            onError: (errors) => setErrors(errors),
        });
    };

    const monthlyDeduction = formData.amount && formData.installments ? (parseFloat(formData.amount) / parseInt(formData.installments)).toFixed(2) : 0;
    const maxRecommended = employeeSalary * 0.5;

    return (
        <AdminLayout>
            <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <IconButton onClick={() => router.visit(route('employees.loans.index'))}>
                        <ArrowBackIcon sx={{ color: '#063455' }} />
                    </IconButton>
                    <Typography variant="h5" sx={{ color: '#063455', fontWeight: 700, ml: 1 }}>
                        New Loan Application
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
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
                                        <TextField fullWidth type="date" label="Loan Date *" value={formData.loan_date} onChange={(e) => handleChange('loan_date', e.target.value)} error={!!errors.loan_date} helperText={errors.loan_date} InputLabelProps={{ shrink: true }} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth type="number" label="Loan Amount *" value={formData.amount} onChange={(e) => handleChange('amount', e.target.value)} error={!!errors.amount} helperText={errors.amount || (employeeSalary > 0 && formData.amount > maxRecommended ? `Warning: Exceeds 50% of salary (${formatCurrency(maxRecommended)})` : '')} InputProps={{ inputProps: { min: 1 } }} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Reason" value={formData.reason} onChange={(e) => handleChange('reason', e.target.value)} error={!!errors.reason} helperText={errors.reason} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography gutterBottom>Number of Installments: {formData.installments} months</Typography>
                                        <Slider
                                            value={formData.installments}
                                            onChange={(e, val) => handleChange('installments', val)}
                                            min={1}
                                            max={60}
                                            step={1}
                                            marks={[
                                                { value: 1, label: '1' },
                                                { value: 12, label: '12' },
                                                { value: 24, label: '24' },
                                                { value: 36, label: '36' },
                                                { value: 48, label: '48' },
                                                { value: 60, label: '60' },
                                            ]}
                                            valueLabelDisplay="auto"
                                            sx={{ color: '#063455' }}
                                        />
                                        {errors.installments && (
                                            <Typography variant="caption" color="error">
                                                {errors.installments}
                                            </Typography>
                                        )}
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField fullWidth multiline rows={3} label="Notes" value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Button type="submit" variant="contained" startIcon={<SaveIcon />} sx={{ backgroundColor: '#063455' }}>
                                                Submit Application
                                            </Button>
                                            <Button variant="outlined" onClick={() => router.visit(route('employees.loans.index'))} sx={{ borderColor: '#063455', color: '#063455' }}>
                                                Cancel
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </form>
                        </Card>
                    </Grid>

                    {/* Loan Summary */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ borderRadius: '12px', p: 3, backgroundColor: '#063455', color: '#fff' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <CalculateIcon sx={{ mr: 1 }} />
                                <Typography variant="h6">Loan Calculator</Typography>
                            </Box>
                            {employeeSalary > 0 && (
                                <Box sx={{ mb: 2, p: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                                    <Typography variant="body2" sx={{ color: '#ccc' }}>
                                        Employee Salary
                                    </Typography>
                                    <Typography variant="h6">{formatCurrency(employeeSalary)}</Typography>
                                </Box>
                            )}
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" sx={{ color: '#ccc' }}>
                                    Loan Amount
                                </Typography>
                                <Typography variant="h5">{formatCurrency(formData.amount)}</Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" sx={{ color: '#ccc' }}>
                                    Number of Installments
                                </Typography>
                                <Typography variant="h5">{formData.installments} months</Typography>
                            </Box>
                            <Box sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 1 }}>
                                <Typography variant="body2" sx={{ color: '#ccc' }}>
                                    Monthly Deduction
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {formatCurrency(monthlyDeduction)}
                                </Typography>
                            </Box>
                            {formData.amount > maxRecommended && employeeSalary > 0 && (
                                <Alert severity="warning" sx={{ mt: 2 }}>
                                    Loan amount exceeds 50% of monthly salary!
                                </Alert>
                            )}
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </AdminLayout>
    );
};

export default Create;
