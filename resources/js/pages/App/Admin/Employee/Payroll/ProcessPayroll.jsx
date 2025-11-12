import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Checkbox,
    FormControlLabel,
    LinearProgress,
    Alert,
    Snackbar,
    Divider,
    Step,
    Stepper,
    StepLabel,
    StepContent,
    CircularProgress
} from '@mui/material';
import {
    PlayArrow as PlayArrowIcon,
    Preview as PreviewIcon,
    ArrowBack as ArrowBackIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    People as PeopleIcon,
    AccountBalance as AccountBalanceIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import axios from 'axios';

const ProcessPayroll = () => {
    const [currentPeriod, setCurrentPeriod] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [previewData, setPreviewData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [previewing, setPreviewing] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [showPreviewDialog, setShowPreviewDialog] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const steps = [
        'Select Payroll Period',
        'Select Employees',
        'Preview Calculations',
        'Process Payroll'
    ];

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            // Fetch current period and employees
            const [periodResponse, employeesResponse] = await Promise.all([
                axios.get('/api/payroll/periods?status=draft'),
                axios.get('/api/payroll/employees/salaries')
            ]);

            if (periodResponse.data.success && periodResponse.data.periods.data.length > 0) {
                setCurrentPeriod(periodResponse.data.periods.data[0]);
                setActiveStep(1);
            }

            if (employeesResponse.data.success) {
                const employeesWithSalary = employeesResponse.data.employees.data.filter(
                    emp => emp.salary_structure
                );
                setEmployees(employeesWithSalary);
                setSelectedEmployees(employeesWithSalary.map(emp => emp.id));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            showSnackbar('Error loading data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePreviewPayroll = async () => {
        if (!currentPeriod || selectedEmployees.length === 0) {
            showSnackbar('Please select a period and employees', 'warning');
            return;
        }

        setPreviewing(true);
        try {
            const response = await axios.get(`/api/payroll/periods/${currentPeriod.id}/preview`, {
                params: { employee_ids: selectedEmployees }
            });

            if (response.data.success) {
                setPreviewData(response.data.preview);
                setShowPreviewDialog(true);
                setActiveStep(2);
            }
        } catch (error) {
            console.error('Error previewing payroll:', error);
            showSnackbar('Error generating preview', 'error');
        } finally {
            setPreviewing(false);
        }
    };

    const handleProcessPayroll = async () => {
        if (!currentPeriod || selectedEmployees.length === 0) {
            showSnackbar('Please select a period and employees', 'warning');
            return;
        }

        setProcessing(true);
        try {
            const response = await axios.post(`/api/payroll/periods/${currentPeriod.id}/process`, {
                employee_ids: selectedEmployees
            });

            if (response.data.success) {
                showSnackbar(`Payroll processed successfully for ${response.data.data.total_employees} employees!`, 'success');
                setActiveStep(3);
                setShowPreviewDialog(false);
                
                // Redirect to payslips after successful processing
                setTimeout(() => {
                    router.visit(route('employees.payroll.payslips'));
                }, 2000);
            } else {
                showSnackbar(response.data.message || 'Error processing payroll', 'error');
            }
        } catch (error) {
            console.error('Error processing payroll:', error);
            showSnackbar('Error processing payroll', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handleEmployeeSelection = (employeeId, checked) => {
        if (checked) {
            setSelectedEmployees(prev => [...prev, employeeId]);
        } else {
            setSelectedEmployees(prev => prev.filter(id => id !== employeeId));
        }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedEmployees(employees.map(emp => emp.id));
        } else {
            setSelectedEmployees([]);
        }
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
            currency: 'PKR'
        }).format(amount || 0).replace('PKR', 'Rs');
    };

    const getTotalPreviewAmount = () => {
        return previewData.reduce((total, emp) => total + (emp.net_salary || 0), 0);
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
                            Process Payroll
                        </Typography>
                    </Box>
                </Box>

                <Grid container spacing={4}>
                    {/* Stepper */}
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" sx={{ color: '#063455', fontWeight: 600, mb: 3 }}>
                                    Process Steps
                                </Typography>
                                <Stepper activeStep={activeStep} orientation="vertical">
                                    {steps.map((label, index) => (
                                        <Step key={label}>
                                            <StepLabel
                                                StepIconProps={{
                                                    sx: {
                                                        color: index <= activeStep ? '#063455' : '#ccc',
                                                        '&.Mui-active': { color: '#063455' },
                                                        '&.Mui-completed': { color: '#2e7d32' }
                                                    }
                                                }}
                                            >
                                                {label}
                                            </StepLabel>
                                        </Step>
                                    ))}
                                </Stepper>
                            </CardContent>
                        </Card>

                        {/* Summary Card */}
                        {currentPeriod && (
                            <Card sx={{ mt: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ color: '#063455', fontWeight: 600, mb: 2 }}>
                                        Current Period
                                    </Typography>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            Period Name
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                            {currentPeriod.period_name}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            Date Range
                                        </Typography>
                                        <Typography variant="body2">
                                            {new Date(currentPeriod.start_date).toLocaleDateString()} - {new Date(currentPeriod.end_date).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            Selected Employees
                                        </Typography>
                                        <Typography variant="h6" sx={{ color: '#063455', fontWeight: 600 }}>
                                            {selectedEmployees.length} / {employees.length}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        )}
                    </Grid>

                    {/* Main Content */}
                    <Grid item xs={12} md={8}>
                        {!currentPeriod ? (
                            <Card>
                                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                                    <WarningIcon sx={{ fontSize: 64, color: '#ed6c02', mb: 2 }} />
                                    <Typography variant="h6" sx={{ mb: 2 }}>
                                        No Active Payroll Period
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                                        Please create a payroll period before processing payroll.
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        onClick={() => router.visit(route('employees.payroll.periods.create'))}
                                        sx={{ 
                                            backgroundColor: '#063455',
                                            '&:hover': { backgroundColor: '#052d45' }
                                        }}
                                    >
                                        Create Payroll Period
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                        <Typography variant="h6" sx={{ color: '#063455', fontWeight: 600 }}>
                                            Select Employees ({selectedEmployees.length} selected)
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={selectedEmployees.length === employees.length}
                                                        indeterminate={selectedEmployees.length > 0 && selectedEmployees.length < employees.length}
                                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                                        sx={{ color: '#063455' }}
                                                    />
                                                }
                                                label="Select All"
                                            />
                                            <Button
                                                startIcon={<PreviewIcon />}
                                                onClick={handlePreviewPayroll}
                                                disabled={selectedEmployees.length === 0 || previewing}
                                                variant="outlined"
                                                sx={{ 
                                                    color: '#063455',
                                                    borderColor: '#063455',
                                                    '&:hover': { borderColor: '#052d45' }
                                                }}
                                            >
                                                {previewing ? 'Generating Preview...' : 'Preview Payroll'}
                                            </Button>
                                        </Box>
                                    </Box>

                                    <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
                                        <Table stickyHeader>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell padding="checkbox">
                                                        <Checkbox
                                                            checked={selectedEmployees.length === employees.length}
                                                            indeterminate={selectedEmployees.length > 0 && selectedEmployees.length < employees.length}
                                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                                            sx={{ color: '#063455' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 600, color: '#063455' }}>Employee</TableCell>
                                                    <TableCell sx={{ fontWeight: 600, color: '#063455' }}>Department</TableCell>
                                                    <TableCell sx={{ fontWeight: 600, color: '#063455' }}>Basic Salary</TableCell>
                                                    <TableCell sx={{ fontWeight: 600, color: '#063455' }}>Status</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {employees.map((employee) => (
                                                    <TableRow key={employee.id}>
                                                        <TableCell padding="checkbox">
                                                            <Checkbox
                                                                checked={selectedEmployees.includes(employee.id)}
                                                                onChange={(e) => handleEmployeeSelection(employee.id, e.target.checked)}
                                                                sx={{ color: '#063455' }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                                    {employee.name}
                                                                </Typography>
                                                                <Typography variant="caption" color="textSecondary">
                                                                    ID: {employee.employee_id}
                                                                </Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            {employee.department?.name || 'N/A'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                                {formatCurrency(employee.salary_structure?.basic_salary)}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label="Ready"
                                                                size="small"
                                                                color="success"
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        )}
                    </Grid>
                </Grid>

                {/* Preview Dialog */}
                <Dialog
                    open={showPreviewDialog}
                    onClose={() => setShowPreviewDialog(false)}
                    maxWidth="lg"
                    fullWidth
                >
                    <DialogTitle>
                        <Typography variant="h6" sx={{ color: '#063455', fontWeight: 600 }}>
                            Payroll Preview - {currentPeriod?.period_name}
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ mb: 3 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={4}>
                                    <Card sx={{ textAlign: 'center', p: 2 }}>
                                        <PeopleIcon sx={{ fontSize: 40, color: '#063455', mb: 1 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {previewData.length}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Employees
                                        </Typography>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Card sx={{ textAlign: 'center', p: 2 }}>
                                        <AccountBalanceIcon sx={{ fontSize: 40, color: '#2e7d32', mb: 1 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {formatCurrency(previewData.reduce((sum, emp) => sum + (emp.gross_salary || 0), 0))}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Total Gross
                                        </Typography>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Card sx={{ textAlign: 'center', p: 2 }}>
                                        <TrendingUpIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {formatCurrency(getTotalPreviewAmount())}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Total Net
                                        </Typography>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Box>

                        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Basic Salary</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Allowances</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Deductions</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Gross Salary</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Net Salary</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {previewData.map((employee) => (
                                        <TableRow key={employee.employee_id}>
                                            <TableCell>
                                                <Typography variant="subtitle2">
                                                    {employee.employee_name}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {employee.employee_number}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{formatCurrency(employee.basic_salary)}</TableCell>
                                            <TableCell>{formatCurrency(employee.total_allowances)}</TableCell>
                                            <TableCell>{formatCurrency(employee.total_deductions)}</TableCell>
                                            <TableCell>{formatCurrency(employee.gross_salary)}</TableCell>
                                            <TableCell>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                    {formatCurrency(employee.net_salary)}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowPreviewDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleProcessPayroll}
                            variant="contained"
                            disabled={processing}
                            startIcon={processing ? <CircularProgress size={20} /> : <PlayArrowIcon />}
                            sx={{ 
                                backgroundColor: '#063455',
                                '&:hover': { backgroundColor: '#052d45' }
                            }}
                        >
                            {processing ? 'Processing...' : 'Process Payroll'}
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

export default ProcessPayroll;
