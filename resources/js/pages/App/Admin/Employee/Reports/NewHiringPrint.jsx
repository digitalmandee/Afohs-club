import { useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';

const NewHiringPrint = ({ employees = [], filters = {}, generatedAt = '' }) => {
    useEffect(() => {
        setTimeout(() => window.print(), 500);
    }, []);

    return (
        <Box sx={{ p: 3, backgroundColor: '#fff' }}>
            <style>{`@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`}</style>

            <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    New Hiring Report
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Period: {filters.date_from} to {filters.date_to}
                </Typography>
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
                            <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Designation</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Joining Date</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Employment Type</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {employees.map((employee, index) => (
                            <TableRow key={employee.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{employee.employee_id || employee.id}</TableCell>
                                <TableCell>{employee.name}</TableCell>
                                <TableCell>{employee.department?.name || '-'}</TableCell>
                                <TableCell>{employee.designation || '-'}</TableCell>
                                <TableCell>{employee.joining_date || '-'}</TableCell>
                                <TableCell>
                                    <Chip label={employee.employment_type?.replace('_', ' ') || 'Full Time'} size="small" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Typography variant="body2" color="textSecondary">
                    Total New Hires: {employees.length}
                </Typography>
            </Box>
        </Box>
    );
};

export default NewHiringPrint;
