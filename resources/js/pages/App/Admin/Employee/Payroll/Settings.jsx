import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Box, Card, CardContent, Typography, TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem, Alert, Snackbar, IconButton, Switch, FormControlLabel, InputAdornment, CircularProgress } from '@mui/material';
import { Settings as SettingsIcon, Save as SaveIcon, Refresh as RefreshIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import axios from 'axios';

const PayrollSettings = () => {
    const [settings, setSettings] = useState({
        company_name: 'Afohs Club',
        pay_frequency: 'monthly',
        currency: 'PKR',
        working_days_per_month: 26,
        working_hours_per_day: 8.0,
        overtime_rate_multiplier: 1.5,
        late_deduction_per_minute: 5.0,
        absent_deduction_type: 'full_day',
        absent_deduction_amount: 0.0,
        max_allowed_absents: 3,
        grace_period_minutes: 15,
    });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/payroll/settings');
            if (response.data.success && response.data.settings) {
                setSettings(response.data.settings);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            showSnackbar('Error loading settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await axios.post('/api/payroll/settings', settings);
            if (response.data.success) {
                showSnackbar('Settings saved successfully!', 'success');
                setSettings(response.data.settings);
            } else {
                showSnackbar('Failed to save settings', 'error');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            if (error.response?.data?.errors) {
                const errorMessages = Object.values(error.response.data.errors).flat().join(', ');
                showSnackbar(`Validation errors: ${errorMessages}`, 'error');
            } else {
                showSnackbar('Error saving settings', 'error');
            }
        } finally {
            setSaving(false);
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleInputChange = (field, value) => {
        setSettings((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    if (loading) {
        return (
            <AdminLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                    <CircularProgress size={60} sx={{ color: '#063455' }} />
                </Box>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Box sx={{ bgcolor: '#f5f5f5', p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton edge="start" onClick={() => window.history.back()}>
                            <ArrowBackIcon sx={{color: '#063455'}} />
                        </IconButton>
                        <Typography variant="h5" sx={{ color: '#063455', fontWeight: 600 }}>
                            Payroll Settings
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {/* <Button
                            startIcon={<RefreshIcon />}
                            onClick={fetchSettings}
                            variant="outlined"
                            sx={{ color: '#063455', borderColor: '#063455' }}
                            disabled={loading}
                        >
                            Refresh
                        </Button> */}
                        <Button
                            startIcon={<SaveIcon />}
                            onClick={handleSave}
                            variant="contained"
                            sx={{
                                backgroundColor: '#063455',
                                '&:hover': { backgroundColor: '#052d45' },
                            }}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </Box>
                </Box>

                <Grid container spacing={4}>
                    {/* Company Information */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ height: 'fit-content' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <SettingsIcon sx={{ color: '#063455', mr: 1 }} />
                                    <Typography variant="h6" sx={{ color: '#063455', fontWeight: 600 }}>
                                        Company Information
                                    </Typography>
                                </Box>

                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <TextField fullWidth label="Company Name" value={settings.company_name} onChange={(e) => handleInputChange('company_name', e.target.value)} variant="outlined" />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Pay Frequency</InputLabel>
                                            <Select value={settings.pay_frequency} label="Pay Frequency" onChange={(e) => handleInputChange('pay_frequency', e.target.value)}>
                                                <MenuItem value="monthly">Monthly</MenuItem>
                                                <MenuItem value="bi-weekly">Bi-Weekly</MenuItem>
                                                <MenuItem value="weekly">Weekly</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Currency" value={settings.currency} onChange={(e) => handleInputChange('currency', e.target.value)} variant="outlined" disabled helperText="Currency is fixed to PKR" />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Working Hours Configuration */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ height: 'fit-content' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ color: '#063455', fontWeight: 600, mb: 3 }}>
                                    Working Hours Configuration
                                </Typography>

                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Working Days per Month" type="number" value={settings.working_days_per_month} onChange={(e) => handleInputChange('working_days_per_month', parseInt(e.target.value))} variant="outlined" inputProps={{ min: 20, max: 31 }} />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Working Hours per Day" type="number" value={settings.working_hours_per_day} onChange={(e) => handleInputChange('working_hours_per_day', parseFloat(e.target.value))} variant="outlined" inputProps={{ min: 6, max: 12, step: 0.5 }} />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField fullWidth label="Overtime Rate Multiplier" type="number" value={settings.overtime_rate_multiplier} onChange={(e) => handleInputChange('overtime_rate_multiplier', parseFloat(e.target.value))} variant="outlined" inputProps={{ min: 1, max: 3, step: 0.1 }} helperText="e.g., 1.5 means 150% of regular hourly rate" />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Attendance & Deductions */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" sx={{ color: '#063455', fontWeight: 600, mb: 3 }}>
                                    Attendance & Deductions
                                </Typography>

                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <TextField fullWidth label="Grace Period (Minutes)" type="number" value={settings.grace_period_minutes} onChange={(e) => handleInputChange('grace_period_minutes', parseInt(e.target.value))} variant="outlined" inputProps={{ min: 0, max: 60 }} helperText="Late arrival grace period" />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <TextField
                                            fullWidth
                                            label="Late Deduction per Minute"
                                            type="number"
                                            value={settings.late_deduction_per_minute}
                                            onChange={(e) => handleInputChange('late_deduction_per_minute', parseFloat(e.target.value))}
                                            variant="outlined"
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">Rs</InputAdornment>,
                                            }}
                                            inputProps={{ min: 0, step: 0.01 }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <TextField fullWidth label="Max Allowed Absents" type="number" value={settings.max_allowed_absents} onChange={(e) => handleInputChange('max_allowed_absents', parseInt(e.target.value))} variant="outlined" inputProps={{ min: 0, max: 10 }} helperText="Per month without deduction" />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <FormControl fullWidth>
                                            <InputLabel>Absent Deduction Type</InputLabel>
                                            <Select value={settings.absent_deduction_type} label="Absent Deduction Type" onChange={(e) => handleInputChange('absent_deduction_type', e.target.value)}>
                                                <MenuItem value="full_day">Full Day Salary</MenuItem>
                                                <MenuItem value="hourly">Hourly Rate</MenuItem>
                                                <MenuItem value="fixed_amount">Fixed Amount</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    {settings.absent_deduction_type === 'fixed_amount' && (
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Fixed Absent Deduction Amount"
                                                type="number"
                                                value={settings.absent_deduction_amount}
                                                onChange={(e) => handleInputChange('absent_deduction_amount', parseFloat(e.target.value))}
                                                variant="outlined"
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start">Rs</InputAdornment>,
                                                }}
                                                inputProps={{ min: 0, step: 0.01 }}
                                            />
                                        </Grid>
                                    )}
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Snackbar for notifications */}
                <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                    <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </AdminLayout>
    );
};

export default PayrollSettings;
