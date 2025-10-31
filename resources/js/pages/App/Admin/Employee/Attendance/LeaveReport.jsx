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

    const handleClearSearch = () => {
        setSearchTerm('');
        setCurrentPage(1);
        // Trigger search with empty term
        setTimeout(() => {
            getMonthlyReport(1);
        }, 100);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    useEffect(() => {
        getMonthlyReport(currentPage);
    }, [currentPage, limit, month]);

    // Generate months dynamically
    const months = Array.from({ length: 12 }, (_, i) => {
        const monthValue = `${currentDate.getFullYear()}-${String(i + 1).padStart(2, '0')}`;
        return { value: monthValue, label: new Date(currentDate.getFullYear(), i, 1).toLocaleString('en-US', { month: 'long' }) };
    });

    return (
        <>
            {/* <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                    backgroundColor: '#F6F6F6',
                }}
            > */}
                <Box sx={{ px: 2, py: 2 }}>
                    <div style={{ paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                                Leave Report
                            </Typography>
                            <Button startIcon={<ArrowBack />} onClick={() => router.visit(route('employees.leaves.application.index'))} variant="outlined" size="small">
                                Back
                            </Button>
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
                                        <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Casual Leave</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Sick Leave</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Annual Leave</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Total Attendance</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Total Absence</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Total Leave</TableCell>
                                    </TableRow>
                                </TableHead>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            <CircularProgress sx={{ color: '#063455' }} />
                                        </TableCell>
                                    </TableRow>
                                ) : employees.length > 0 ? (
                                    employees.map((employee, index) => (
                                        <TableRow key={employee.employee_id}>
                                            <TableCell>{employee.employee_id}</TableCell>
                                            <TableCell>{employee.employee_name}</TableCell>
                                            <TableCell>{employee.leave_categories?.Casual_Leave || 0}</TableCell>
                                            <TableCell>{employee.leave_categories?.Sick_Leave || 0}</TableCell>
                                            <TableCell>{employee.leave_categories?.Annual_Leave || 0}</TableCell>
                                            <TableCell>{employee.total_attendance}</TableCell>
                                            <TableCell>{employee.total_absence}</TableCell>
                                            <TableCell>{employee.total_leave}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
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
            {/* </div> */}
        </>
    );
};

export default LeaveReport;
