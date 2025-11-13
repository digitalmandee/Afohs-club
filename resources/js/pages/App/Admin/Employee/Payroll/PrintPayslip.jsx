import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
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
    Divider,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Print as PrintIcon,
    ArrowBack as ArrowBackIcon,
    GetApp as GetAppIcon
} from '@mui/icons-material';

const PrintPayslip = ({ payslip }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Auto-print after 1 second delay
        const timer = setTimeout(() => {
            window.print();
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR'
        }).format(amount || 0).replace('PKR', 'Rs');
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-PK', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const numberToWords = (num) => {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

        if (num === 0) return 'Zero';
        if (num < 0) return 'Negative ' + numberToWords(-num);

        let words = '';

        if (Math.floor(num / 10000000) > 0) {
            words += numberToWords(Math.floor(num / 10000000)) + ' Crore ';
            num %= 10000000;
        }

        if (Math.floor(num / 100000) > 0) {
            words += numberToWords(Math.floor(num / 100000)) + ' Lakh ';
            num %= 100000;
        }

        if (Math.floor(num / 1000) > 0) {
            words += numberToWords(Math.floor(num / 1000)) + ' Thousand ';
            num %= 1000;
        }

        if (Math.floor(num / 100) > 0) {
            words += numberToWords(Math.floor(num / 100)) + ' Hundred ';
            num %= 100;
        }

        if (num > 0) {
            if (num < 10) {
                words += ones[num];
            } else if (num >= 10 && num < 20) {
                words += teens[num - 10];
            } else {
                words += tens[Math.floor(num / 10)];
                if (num % 10 > 0) {
                    words += ' ' + ones[num % 10];
                }
            }
        }

        return words.trim();
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error || 'Payslip not found'}</Alert>
            </Box>
        );
    }

    return (
        <>
            <Head title="Payslip Print" />
            
            <style jsx global>{`
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                        font-family: Arial, sans-serif;
                    }
                    
                    @page {
                        margin: 0.5in;
                        size: A4;
                    }
                    
                    * {
                        -webkit-print-color-adjust: exact !important;
                        color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>

            <Box sx={{ 
                p: 3, 
                backgroundColor: 'white',
                minHeight: '100vh',
                '@media print': {
                    p: 0,
                }
            }}>

            {/* Payslip Content */}
            <Card sx={{ 
                maxWidth: '210mm',
                margin: '0 auto',
                '@media print': {
                    boxShadow: 'none',
                    border: 'none',
                    maxWidth: 'none',
                    margin: 0
                }
            }}>
                <CardContent sx={{ p: 4 }}>
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#063455', mb: 1 }}>
                            AFOHS CLUB
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#063455', mb: 1 }}>
                            SALARY SLIP
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Pay Period: {payslip.payroll_period?.period_name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Generated on: {formatDate(new Date())}
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {/* Employee Information */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={6}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#063455', mb: 2 }}>
                                Employee Information
                            </Typography>
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="body2" color="textSecondary" component="span">Name: </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }} component="span">
                                    {payslip.employee?.name}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="body2" color="textSecondary" component="span">Employee ID: </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }} component="span">
                                    {payslip.employee?.employee_id}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="body2" color="textSecondary" component="span">Department: </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }} component="span">
                                    {payslip.employee?.department?.name || 'N/A'}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="body2" color="textSecondary" component="span">Designation: </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }} component="span">
                                    {payslip.employee?.designation || 'N/A'}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#063455', mb: 2 }}>
                                Pay Period Details
                            </Typography>
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="body2" color="textSecondary" component="span">Period: </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }} component="span">
                                    {payslip.payroll_period?.period_name}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="body2" color="textSecondary" component="span">From: </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }} component="span">
                                    {formatDate(payslip.payroll_period?.start_date)}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="body2" color="textSecondary" component="span">To: </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }} component="span">
                                    {formatDate(payslip.payroll_period?.end_date)}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="body2" color="textSecondary" component="span">Status: </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: payslip.status === 'approved' ? '#2e7d32' : '#ed6c02' }} component="span">
                                    {payslip.status?.toUpperCase()}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    <Divider sx={{ mb: 3 }} />

                    {/* Salary Details */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        {/* Earnings */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#063455', mb: 2 }}>
                                Earnings
                            </Typography>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Basic Salary</TableCell>
                                            <TableCell align="right">{formatCurrency(payslip.basic_salary)}</TableCell>
                                        </TableRow>
                                        {payslip.allowances && payslip.allowances.map((allowance, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{allowance.allowance_type?.name}</TableCell>
                                                <TableCell align="right">{formatCurrency(allowance.amount)}</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                            <TableCell sx={{ fontWeight: 600 }}>Total Earnings</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                                                {formatCurrency(payslip.gross_salary)}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>

                        {/* Deductions */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#063455', mb: 2 }}>
                                Deductions
                            </Typography>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {payslip.deductions && payslip.deductions.length > 0 ? (
                                            payslip.deductions.map((deduction, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{deduction.deduction_type?.name}</TableCell>
                                                    <TableCell align="right">{formatCurrency(deduction.amount)}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={2} align="center" sx={{ py: 2, color: 'textSecondary' }}>
                                                    No deductions
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                            <TableCell sx={{ fontWeight: 600 }}>Total Deductions</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                                                {formatCurrency(payslip.total_deductions)}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                    </Grid>

                    <Divider sx={{ mb: 3 }} />

                    {/* Net Salary */}
                    <Box sx={{ backgroundColor: '#f8f9fa', p: 3, borderRadius: 1, mb: 3 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6}>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#063455' }}>
                                    NET SALARY
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                                    {formatCurrency(payslip.net_salary)}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                    Amount in Words:
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, fontStyle: 'italic' }}>
                                    {numberToWords(Math.floor(payslip.net_salary))} Rupees Only
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {/* Footer */}
                    <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #eee' }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="textSecondary">
                                    This is a computer-generated payslip and does not require a signature.
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
                                <Typography variant="body2" color="textSecondary">
                                    Generated by AFOHS Club Payroll System
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {formatDate(new Date())}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </CardContent>
            </Card>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                        font-size: 12px;
                    }
                    
                    .MuiCard-root {
                        box-shadow: none !important;
                        border: none !important;
                    }
                    
                    .MuiTableContainer-root {
                        box-shadow: none !important;
                    }
                    
                    .no-print {
                        display: none !important;
                    }
                    
                    @page {
                        margin: 1cm;
                        size: A4;
                    }
                }
            `}</style>
            </Box>
        </>
    );
};

PrintPayslip.layout = (page) => page;

export default PrintPayslip;
