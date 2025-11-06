import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { CircularProgress, FormControl, InputAdornment, MenuItem, Select } from '@mui/material';
import { Search, ArrowBack } from '@mui/icons-material';
import { Table, TableBody, TableCell, TableContainer, TableHead, Button, TableRow, Paper, Pagination, TextField, Box, Typography } from '@mui/material';
import axios from 'axios';

const LeaveReport = () => {
    // const [open, setOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const [month, setMonth] = useState(currentMonth);
    const [employees, setEmployees] = useState([]);
    const [leaveCategories, setLeaveCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(10);

    const getMonthlyReport = async (page = 1) => {
        setIsLoading(true);
        try {
            const res = await axios.get('/api/employees/leaves/reports', {
                params: { page, limit, month, search: searchTerm },
            });
            if (res.data.success) {
                setEmployees(res.data.report_data.employees);
                setLeaveCategories(res.data.report_data.leave_categories || []);
                setTotalPages(res.data.report_data.last_page);
                setCurrentPage(res.data.report_data.current_page);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1); // Reset to first page when searching
        getMonthlyReport(1);
    };

    const handleClearSearch = async () => {
        setSearchTerm('');
        setCurrentPage(1);
        // Directly call API with empty search term
        setIsLoading(true);
        try {
            const res = await axios.get('/api/employees/leaves/reports', {
                params: { page: 1, limit, month, search: '' }, // Explicitly pass empty search
            });
            if (res.data.success) {
                setEmployees(res.data.report_data.employees);
                setTotalPages(res.data.report_data.last_page);
                setCurrentPage(res.data.report_data.current_page);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    useEffect(() => {
        getMonthlyReport(currentPage);
    }, [currentPage, limit, month]);

    // Auto-search when search term is cleared
    useEffect(() => {
        if (searchTerm === '') {
            const timeoutId = setTimeout(() => {
                getMonthlyReport(1);
            }, 300); // Debounce for 300ms
            return () => clearTimeout(timeoutId);
        }
    }, [searchTerm]);

    // Generate months dynamically
    const months = Array.from({ length: 12 }, (_, i) => {
        const monthValue = `${currentDate.getFullYear()}-${String(i + 1).padStart(2, '0')}`;
        return { value: monthValue, label: new Date(currentDate.getFullYear(), i, 1).toLocaleString('en-US', { month: 'long' }) };
    });

    return (
        <>
            {/* <SideNav open={open} setOpen={setOpen} /> */}
            <div
                style={{
                    minHeight:'100vh',
                    backgroundColor: '#f5f5f5',
                }}
            >
                <Box sx={{ px: 2, py: 2 }}>
                    <div style={{ paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                                Leave Report
                            </Typography>
                        </div>
                        <Box sx={{ backgroundColor: '#FFFFFF', padding: 2, borderRadius: 2, mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <TextField
                                        variant="outlined"
                                        placeholder="Search by name or employee ID..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        size="small"
                                        sx={{ width: 350 }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Search color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={handleSearch}
                                        sx={{
                                            backgroundColor: '#063455',
                                            color: 'white',
                                            textTransform: 'none',
                                            '&:hover': {
                                                backgroundColor: '#052d45',
                                            },
                                        }}
                                    >
                                        Search
                                    </Button>
                                    {searchTerm && (
                                        <Button
                                            variant="outlined"
                                            onClick={handleClearSearch}
                                            sx={{
                                                color: '#063455',
                                                borderColor: '#063455',
                                                textTransform: 'none',
                                                '&:hover': {
                                                    borderColor: '#052d45',
                                                    backgroundColor: 'rgba(6, 52, 85, 0.04)',
                                                },
                                            }}
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </Box>
                                <FormControl size="small">
                                    <Select value={month} onChange={(e) => setMonth(e.target.value)} sx={{ minWidth: 150 }}>
                                        {months.map((m) => (
                                            <MenuItem key={m.value} value={m.value}>
                                                {m.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Box>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow style={{ backgroundColor: '#063455' }}>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>#</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Employee Name</TableCell>
                                        {leaveCategories.map((category) => (
                                            <TableCell key={category.id} sx={{ fontWeight: 'bold', color: 'white' }}>
                                                {category.name}
                                            </TableCell>
                                        ))}
                                        <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Total Attendance</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Total Absence</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Total Leave</TableCell>
                                    </TableRow>
                                </TableHead>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5 + leaveCategories.length} align="center">
                                            <CircularProgress sx={{ color: '#063455' }} />
                                        </TableCell>
                                    </TableRow>
                                ) : employees.length > 0 ? (
                                    employees.map((employee, index) => (
                                        <TableRow key={employee.employee_id}>
                                            <TableCell>{employee.employee_id}</TableCell>
                                            <TableCell>{employee.employee_name}</TableCell>
                                            {leaveCategories.map((category) => {
                                                const categoryKey = category.name.replace(/\s+/g, '_');
                                                return (
                                                    <TableCell key={category.id}>
                                                        {employee.leave_categories?.[categoryKey] || 0}
                                                    </TableCell>
                                                );
                                            })}
                                            <TableCell>{employee.total_attendance}</TableCell>
                                            <TableCell>{employee.total_absence}</TableCell>
                                            <TableCell>{employee.total_leave}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5 + leaveCategories.length} align="center">
                                            No employees found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        <Box sx={{ display: 'flex', justifyContent: 'end', mt: 3 }}>
                            <Pagination count={totalPages} page={currentPage} onChange={(e, page) => setCurrentPage(page)} />
                        </Box>
                    </div>
                </Box>
            </div>
        </>
    );
};

export default LeaveReport;
