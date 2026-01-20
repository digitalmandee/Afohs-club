import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Box, Card, CardContent, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Autocomplete, TextField, Chip, LinearProgress, ThemeProvider, createTheme, Typography, Grid } from '@mui/material';
import { Search, Visibility } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const theme = createTheme({
    palette: {
        primary: {
            main: '#0e3c5f',
        },
        secondary: {
            main: '#063455',
        },
    },
});

export default function History() {
    const { auth } = usePage().props;
    const { enqueueSnackbar } = useSnackbar();

    // Filters
    const [employee, setEmployee] = useState(null);
    const [fromDate, setFromDate] = useState(dayjs().startOf('year'));
    const [toDate, setToDate] = useState(dayjs().endOf('year'));

    // Data
    const [loading, setLoading] = useState(false);
    const [employeesList, setEmployeesList] = useState([]);
    const [historyData, setHistoryData] = useState(null); // { employee, payslips, totals }

    useEffect(() => {
        axios
            .get(route('employees.list'))
            .then((res) => {
                if (res.data.success) {
                    setEmployeesList(res.data.employees || []);
                }
            })
            .catch((err) => console.error('Failed to load employees', err));
    }, []);

    const fetchHistory = () => {
        if (!employee) {
            enqueueSnackbar('Please select an employee first', { variant: 'warning' });
            return;
        }

        setLoading(true);
        const params = {
            from_date: fromDate ? fromDate.format('YYYY-MM-DD') : null,
            to_date: toDate ? toDate.format('YYYY-MM-DD') : null,
        };

        axios
            .get(route('api.payroll.history', { employeeId: employee.id }), { params })
            .then((res) => {
                if (res.data.success) {
                    setHistoryData({
                        employee: res.data.employee,
                        payslips: res.data.payslips,
                        totals: res.data.totals,
                    });
                }
            })
            .catch((err) => {
                console.error(err);
                enqueueSnackbar('Failed to fetch payroll history', { variant: 'error' });
            })
            .finally(() => setLoading(false));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return 'success';
            case 'approved':
                return 'info';
            case 'draft':
                return 'warning';
            default:
                return 'default';
        }
    };

    return (
        <>
            <Head title="Employee Payroll History" />
            <ThemeProvider theme={theme}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Container
                        fluid
                        className="p-4"
                        style={{
                            backgroundColor: '#F6F6F6',
                            minHeight: '100vh',
                        }}
                    >
                        {/* Header */}
                        <Row className="align-items-center mt-2 mb-3">
                            <Col>
                                <Typography style={{ color: '#063455', fontWeight: 700, fontSize: '30px' }}>Employee Payroll History</Typography>
                            </Col>
                            <Col xs="auto"></Col>
                            <Typography style={{ color: '#063455', fontSize: '15px', fontWeight: '600' }}>View detailed payroll records, salary history, and status for individual employees</Typography>
                        </Row>

                        {/* Filters */}
                        <Card sx={{ mb: 3, borderRadius: '12px', bgcolor:'transparent', boxShadow: 'none' }}>
                            <CardContent>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} md={3}>
                                        <Autocomplete options={employeesList} getOptionLabel={(option) => `${option.name} (${option.employee_id})`} value={employee} onChange={(event, newValue) => setEmployee(newValue)} renderInput={(params) => <TextField {...params} label="Select Employee" fullWidth size="small" />} />
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <DatePicker label="From Date" value={fromDate} onChange={(newValue) => setFromDate(newValue)} slotProps={{ textField: { fullWidth: true, size: 'small' } }} format="DD/MM/YYYY" />
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <DatePicker label="To Date" value={toDate} onChange={(newValue) => setToDate(newValue)} slotProps={{ textField: { fullWidth: true, size: 'small' } }} format="DD/MM/YYYY" />
                                    </Grid>
                                    <Grid item xs={12} md={1.5}>
                                        <Button variant="contained" startIcon={<Search />} onClick={fetchHistory} fullWidth disabled={loading} sx={{ textTransform: 'none !important', fontWeight: 'bold', borderRadius:'16px' }}>
                                            {loading ? 'Fetching...' : 'Search'}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        {loading && <LinearProgress sx={{ mb: 2 }} />}

                        {/* Results */}
                        {historyData && (
                            <>
                                {/* Summary Cards */}
                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Card sx={{ bgcolor: '#e3f2fd', borderRadius: '12px', boxShadow: 'none', mb: 2 }}>
                                            <CardContent>
                                                <Typography color="textSecondary" gutterBottom>
                                                    Total Basic Salary
                                                </Typography>
                                                <Typography variant="h4" sx={{ fontWeight: 600, color: '#0d47a1' }}>
                                                    {parseFloat(historyData.totals?.total_basic_salary || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Col>
                                    <Col md={4}>
                                        <Card sx={{ bgcolor: '#fff3e0', borderRadius: '12px', boxShadow: 'none', mb: 2 }}>
                                            <CardContent>
                                                <Typography color="textSecondary" gutterBottom>
                                                    Total Deductions
                                                </Typography>
                                                <Typography variant="h4" sx={{ fontWeight: 600, color: '#e65100' }}>
                                                    {parseFloat(historyData.totals?.total_deductions || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Col>
                                    <Col md={4}>
                                        <Card sx={{ bgcolor: '#e8f5e9', borderRadius: '12px', boxShadow: 'none', mb: 2 }}>
                                            <CardContent>
                                                <Typography color="textSecondary" gutterBottom>
                                                    Total Net Paid
                                                </Typography>
                                                <Typography variant="h4" sx={{ color: '#1b5e20', fontWeight: 600 }}>
                                                    {parseFloat(historyData.totals?.total_net_salary || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Col>
                                </Row>

                                {/* Data Table */}
                                <TableContainer component={Paper} style={{ boxShadow: 'none', borderRadius: '12px', overflowX: 'auto' }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow style={{ backgroundColor: '#063455', height: '45px' }}>
                                                <TableCell sx={{ fontWeight: 600, color: '#fff' }}>Period</TableCell>
                                                <TableCell sx={{ fontWeight: 600, color: '#fff' }}>Dates</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 600, color: '#fff' }}>
                                                    Basic
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 600, color: '#fff' }}>
                                                    Allowances
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 600, color: '#fff' }}>
                                                    Deductions
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 600, color: '#fff' }}>
                                                    Net Salary
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 600, color: '#fff' }}>
                                                    Status
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 600, color: '#fff' }}>
                                                    Actions
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {historyData.payslips.length > 0 ? (
                                                historyData.payslips.map((payslip) => (
                                                    <TableRow key={payslip.id} style={{ borderBottom: '1px solid #eee' }} hover>
                                                        <TableCell sx={{ color: '#000', fontWeight: 600, fontSize: '14px' }}>{payslip.period_name}</TableCell>
                                                        <TableCell>
                                                            <Typography variant="caption" display="block" color="textSecondary">
                                                                start: {payslip.start_date}
                                                            </Typography>
                                                            <Typography variant="caption" display="block" color="textSecondary">
                                                                end: {payslip.end_date}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ color: '#7F7F7F', fontSize: '14px' }}>
                                                            {parseFloat(payslip.basic_salary).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ color: 'green', fontSize: '14px' }}>
                                                            +{parseFloat(payslip.total_allowances).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ color: 'red', fontSize: '14px' }}>
                                                            -{parseFloat(payslip.total_deductions).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '14px', color: '#000' }}>
                                                            {parseFloat(payslip.net_salary).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Chip label={payslip.status.toUpperCase()} color={getStatusColor(payslip.status)} size="small" variant="filled" sx={{ fontWeight: 500 }} />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Button variant="outlined" size="small" color="primary" onClick={() => (window.location.href = route('employees.payroll.payslip.view', payslip.id))} sx={{ textTransform: 'none' }}>
                                                                View
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                                        <Typography color="textSecondary">No payroll records found for the selected period.</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </Container>
                </LocalizationProvider>
            </ThemeProvider>
        </>
    );
}
