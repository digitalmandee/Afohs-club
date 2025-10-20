import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { ArrowBack } from '@mui/icons-material';
import { Button, TextField, Checkbox, Pagination, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Select, MenuItem, Snackbar, Alert, Box, Typography } from '@mui/material';
import axios from 'axios';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import SideNav from '@/components/App/AdminSideBar/SideNav';
// import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const ManageAttendance = () => {
    const [open, setOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [date, setDate] = useState(dayjs());

    const [attendances, setAttendances] = useState([]);
    const [leavecategories, setLeaveCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(10);
    const [loadingRows, setLoadingRows] = useState({});
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const getAttendances = async (page = 1) => {
        setIsLoading(true);
        try {
            const res = await axios.get('/api/attendances', {
                params: { page, limit, date: date.format('YYYY-MM-DD') },
            });

            if (res.data.success) {
                setAttendances(res.data.attendance.data);
                setTotalPages(res.data.attendance.last_page);
                setCurrentPage(res.data.attendance.current_page);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getAttendances(currentPage);
    }, [currentPage, limit, date]);

    const getLeaveCatgories = async () => {
        try {
            const res = await axios.get('/api/leave-categories');
            if (res.data.success) {
                setLeaveCategories(res.data.categories);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getLeaveCatgories();
    }, []);

    const handleSearch = () => {
        console.log('Searching:', searchQuery);
    };

    // Handle check-in, check-out, and leave category updates
    const handleUpdate = async (id, updatedData) => {
        setLoadingRows((prev) => ({ ...prev, [id]: true })); // loading for the specific row
        try {
            await axios.put(`/api/attendances/${id}`, updatedData);
            // getAttendances(currentPage);
            setSnackbar({ open: true, message: 'Attendance updated successfully!', severity: 'success' });
        } catch (error) {
            // console.log("Error updating attendance:", error);
            setSnackbar({ open: true, message: error.response.data.message ?? 'Something went wrong', severity: 'error' });
        } finally {
            setLoadingRows((prev) => ({ ...prev, [id]: false })); // Reset only that row’s loading state
        }
    };

    const handleInputChange = (id, field, value) => {
        setAttendances((prev) =>
            prev.map((att) => {
                if (att.id === id) {
                    let updatedStatus = att.status;

                    if (field === 'attendance') {
                        // If checked, set "present" by default, allow "late" later
                        updatedStatus = value ? 'present' : 'absent';
                    }

                    if (field === 'leave_category_id') {
                        updatedStatus = value ? 'leave' : 'absent'; // If leave is selected, status = "leave", else "absent"
                    }

                    return { ...att, [field]: value, status: updatedStatus };
                }
                return att;
            }),
        );
    };

    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                    backgroundColor: '#F6F6F6',
                }}
            >
                <Box sx={{ px: 2, py: 2 }}>
                    <div style={{ paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                                Manage Attendance
                            </Typography>
                            <Button startIcon={<ArrowBack />} onClick={() => router.visit(route('employees.attendances.report'))} variant="outlined" size="small">
                                Back
                            </Button>
                        </div>

                        <Box sx={{ backgroundColor: '#FFFFFF', padding: 2, borderRadius: 2 }}>
                            {/* Search Input */}
                            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                {/* Search Field */}
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField size="small" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} sx={{ backgroundColor: 'white' }} />
                                    <Button variant="contained" onClick={handleSearch} sx={{ backgroundColor: '#063455', color: 'white', textTransform: 'none', minWidth: '80px' }}>
                                        Go
                                    </Button>
                                </Box>

                                {/* Date Picker on the Right */}
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker label="Select Date" value={date} onChange={(newValue) => setDate(newValue)} renderInput={(params) => <TextField {...params} size="small" />} />
                                </LocalizationProvider>
                            </Box>

                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead style={{ backgroundColor: '#f8f9fa' }}>
                                        <TableRow>
                                            <TableCell>#</TableCell>
                                            <TableCell>Employee Name</TableCell>
                                            <TableCell>Designation</TableCell>
                                            <TableCell>Attendance</TableCell>
                                            <TableCell>Leave Category</TableCell>
                                            <TableCell>Check-In</TableCell>
                                            <TableCell>Check-Out</TableCell>
                                            <TableCell>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={8} align="center">
                                                    <CircularProgress sx={{ color: '#E0E8F0' }} />
                                                </TableCell>
                                            </TableRow>
                                        ) : attendances.length > 0 ? (
                                            attendances.map((row, index) => (
                                                <TableRow key={row.id}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>{row.employee.user.name}</TableCell>
                                                    <TableCell>{row.employee.user.designation}</TableCell>
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={['present', 'late'].includes(row.status)} // If present or late, show checked
                                                            onChange={(e) => handleInputChange(row.id, 'attendance', e.target.checked)}
                                                            disabled={row.status === 'leave'} // Disable if on leave
                                                            color="primary"
                                                        />
                                                    </TableCell>

                                                    <TableCell>
                                                        <Select value={row.leave_category_id || ''} onChange={(e) => handleInputChange(row.id, 'leave_category_id', e.target.value)} size="small" style={{ minWidth: '120px' }}>
                                                            <MenuItem value="">Select</MenuItem>
                                                            {leavecategories.map((category) => (
                                                                <MenuItem key={category.id} value={category.id}>
                                                                    {category.name}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </TableCell>

                                                    <TableCell>
                                                        <TextField size="small" type="time" value={row.check_in || ''} onChange={(e) => handleInputChange(row.id, 'check_in', e.target.value)} style={{ width: '100px' }} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <TextField size="small" type="time" value={row.check_out || ''} onChange={(e) => handleInputChange(row.id, 'check_out', e.target.value)} style={{ width: '100px' }} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            onClick={() =>
                                                                handleUpdate(row.id, {
                                                                    leave_category_id: row.leave_category_id ?? '',
                                                                    check_in: row.check_in,
                                                                    check_out: row.check_out,
                                                                    status: row.status,
                                                                })
                                                            }
                                                            variant="contained"
                                                            size="small"
                                                            disabled={loadingRows[row.id] || false} // Disable only if that row is loading
                                                            style={{
                                                                backgroundColor: row.check_in && row.check_out ? '#e3f2fd' : colors.primary,
                                                                color: row.check_in && row.check_out ? colors.primary : 'white',
                                                                textTransform: 'none',
                                                            }}
                                                        >
                                                            {loadingRows[row.id] ? <CircularProgress size={20} color="inherit" /> : row.check_in && row.check_out ? 'Update' : 'Save'}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={8} align="center">
                                                    No attendances found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* Pagination */}
                            <Box sx={{ display: 'flex', justifyContent: 'end', mt: 3 }}>
                                <Pagination count={totalPages} page={currentPage} onChange={(e, page) => setCurrentPage(page)} shape="rounded" />
                            </Box>
                        </Box>
                    </div>
                </Box>
            </div>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
                    {snackbar.message}
                    {snackbar.action && (
                        <Button onClick={snackbar.action.onClick} color="inherit" size="small">
                            {snackbar.action.label}
                        </Button>
                    )}
                </Alert>
            </Snackbar>
        </>
    );
};

export default ManageAttendance;
