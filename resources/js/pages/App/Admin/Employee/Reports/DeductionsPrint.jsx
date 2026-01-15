import { useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const formatCurrency = (amount) => `Rs ${parseFloat(amount || 0).toLocaleString()}`;

const DeductionsPrint = ({ deductions = [], period = null, generatedAt = '' }) => {
    useEffect(() => {
        setTimeout(() => window.print(), 500);
    }, []);

    return (
        <Box sx={{ p: 3, backgroundColor: '#fff' }}>
            <style>{`@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`}</style>

            <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Deductions Report
                </Typography>
                {period && (
                    <Typography variant="body2" color="textSecondary">
                        Period: {period.name}
                    </Typography>
                )}
                <Typography variant="body2" color="textSecondary">
                    Generated: {generatedAt}
                </Typography>
            </Box>

            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #ddd' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Employee ID</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Employee Name</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Deduction Type</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="right">
                                Amount
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {deductions.map((deduction, index) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{deduction.employee_id_number}</TableCell>
                                <TableCell>{deduction.employee_name}</TableCell>
                                <TableCell>{deduction.department_name || '-'}</TableCell>
                                <TableCell>{deduction.deduction_name}</TableCell>
                                <TableCell align="right" sx={{ color: 'red' }}>
                                    {formatCurrency(deduction.amount)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Typography variant="body2" color="textSecondary">
                    Total Records: {deductions.length}
                </Typography>
            </Box>
        </Box>
    );
};

export default DeductionsPrint;
