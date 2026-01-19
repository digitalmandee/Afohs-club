import React, { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Autocomplete, Button, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, CircularProgress, Pagination, IconButton, FormControl, InputLabel, Select, MenuItem, TextField, Grid, Box, Chip } from '@mui/material';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PrintIcon from '@mui/icons-material/Print';
import Search from '@mui/icons-material/Search';
import { FaEdit } from 'react-icons/fa';
import axios from 'axios';

const EmployeeDashboard = () => {
    const { props } = usePage();
    const { employees, stats, departments: initialDepartments } = props;
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Filter states with Autocomplete
    const [departments, setDepartments] = useState(initialDepartments || []);
    const [subdepartments, setSubdepartments] = useState([]);
    const [branches, setBranches] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [designations, setDesignations] = useState([]);

    const [filters, setFilters] = useState({
        department_id: null,
        subdepartment_id: null,
        branch_id: null,
        shift_id: null,
        designation_id: null,
    });

    // Fetch filter options on mount
    useEffect(() => {
        const fetchFilterData = async () => {
            try {
                const [branchesRes, shiftsRes, designationsRes, departmentsRes] = await Promise.all([axios.get(route('branches.list')), axios.get(route('shifts.list')), axios.get(route('designations.list')), axios.get(route('api.departments.listAll'))]);

                if (branchesRes.data.success) setBranches(branchesRes.data.branches || []);
                if (shiftsRes.data.success) setShifts(shiftsRes.data.shifts || []);
                if (designationsRes.data.success) setDesignations(designationsRes.data.data || []);
                if (departmentsRes.data.results) setDepartments(departmentsRes.data.results || []);
            } catch (error) {
                console.error('Error fetching filter data:', error);
            }
        };
        fetchFilterData();
    }, []);

    // Fetch subdepartments when department changes
    useEffect(() => {
        if (filters.department_id) {
            axios
                .get(route('api.subdepartments.listAll', { department_id: filters.department_id.id }))
                .then((res) => setSubdepartments(res.data.results || []))
                .catch((err) => console.error(err));
        } else {
            setSubdepartments([]);
            setFilters((prev) => ({ ...prev, subdepartment_id: null }));
        }
    }, [filters.department_id]);

    const handleFilter = () => {
        setIsLoading(true);
        router.get(
            route('employees.dashboard'),
            {
                search: searchTerm,
                department_id: filters.department_id?.id,
                subdepartment_id: filters.subdepartment_id?.id,
                branch_id: filters.branch_id?.id,
                shift_id: filters.shift_id?.id,
                designation_id: filters.designation_id?.id,
                page: 1,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsLoading(false),
                onError: () => setIsLoading(false),
            },
        );
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setFilters({
            department_id: null,
            subdepartment_id: null,
            branch_id: null,
            shift_id: null,
            designation_id: null,
        });
        router.get(
            route('employees.dashboard'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const autocompleteStyle = {
        minWidth: 160,
        '& .MuiOutlinedInput-root': {
            borderRadius: '16px',
        },
    };

    return (
        <>
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
                <Box sx={{ px: 2, py: 2 }}>
                    <div style={{ paddingTop: '1rem' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography style={{ color: '#063455', fontWeight: '700', fontSize: '30px' }}>Employee Management</Typography>
                            <Button variant="contained" startIcon={<span style={{ fontSize: '1.5rem', marginBottom: 5 }}>+</span>} style={{ color: 'white', backgroundColor: '#063455', borderRadius: '16px', height: 35 }} onClick={() => router.visit(route('employees.create'))}>
                                Add Employee
                            </Button>
                        </div>
                        <Typography sx={{ color: '#063455', fontSize: '15px', fontWeight: '600' }}>Overview of staff strength, attendance status, and pending HR actions</Typography>

                        {/* Stats Cards */}
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '24px', marginTop: '24px' }}>
                            {[
                                { title: 'Total Employees', value: stats?.total_employees || 0, icon: EventSeatIcon },
                                { title: 'Total Present', value: stats?.total_present || 0, icon: PeopleIcon },
                                { title: 'Total Absent', value: stats?.total_absent || 0, icon: AssignmentIcon },
                                { title: 'Late Arrival', value: stats?.total_late || 0, icon: PrintIcon },
                            ].map((item, idx) => (
                                <Card key={idx} style={{ flex: 1, backgroundColor: '#063455', borderRadius: '16px' }}>
                                    <CardContent>
                                        <Typography variant="body2" color="#fff">
                                            {item.title}
                                        </Typography>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="h5" style={{ fontWeight: 'bold', color: '#fff' }}>
                                                {item.value}
                                            </Typography>
                                            <div style={{ borderRadius: '8px', padding: '0.5rem' }}>
                                                <item.icon style={{ color: '#fff', width: '40px', height: '40px' }} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Filter Section */}
                        <Box sx={{ mb: 3 }}>
                            <Typography sx={{ fontWeight: 600, fontSize: '18px', color: '#063455', mb: 2 }}>Search & Filter Options</Typography>

                            {/* Search and Filters - Single Row */}
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
                                <TextField
                                    size="small"
                                    placeholder="Search by name, ID, or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') handleFilter();
                                    }}
                                    sx={{
                                        minWidth: 220,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '20px',
                                            backgroundColor: '#fff',
                                        },
                                    }}
                                />
                                <Autocomplete
                                    size="small"
                                    options={departments}
                                    getOptionLabel={(option) => option.name || ''}
                                    value={filters.department_id}
                                    onChange={(e, value) => setFilters({ ...filters, department_id: value, subdepartment_id: null })}
                                    renderInput={(params) => <TextField {...params} placeholder="Department" />}
                                    sx={{
                                        minWidth: 140,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '20px',
                                            backgroundColor: '#fff',
                                        },
                                    }}
                                />
                                <Autocomplete
                                    size="small"
                                    options={subdepartments}
                                    getOptionLabel={(option) => option.name || ''}
                                    value={filters.subdepartment_id}
                                    disabled={!filters.department_id}
                                    onChange={(e, value) => setFilters({ ...filters, subdepartment_id: value })}
                                    renderInput={(params) => <TextField {...params} placeholder="SubDept" />}
                                    sx={{
                                        minWidth: 120,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '20px',
                                            backgroundColor: '#fff',
                                        },
                                    }}
                                />
                                <Autocomplete
                                    size="small"
                                    options={branches}
                                    getOptionLabel={(option) => option.name || ''}
                                    value={filters.branch_id}
                                    onChange={(e, value) => setFilters({ ...filters, branch_id: value })}
                                    renderInput={(params) => <TextField {...params} placeholder="Branch" />}
                                    sx={{
                                        minWidth: 120,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '20px',
                                            backgroundColor: '#fff',
                                        },
                                    }}
                                />
                                <Autocomplete
                                    size="small"
                                    options={shifts}
                                    getOptionLabel={(option) => option.name || ''}
                                    value={filters.shift_id}
                                    onChange={(e, value) => setFilters({ ...filters, shift_id: value })}
                                    renderInput={(params) => <TextField {...params} placeholder="Shift" />}
                                    sx={{
                                        minWidth: 100,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '20px',
                                            backgroundColor: '#fff',
                                        },
                                    }}
                                />
                                <Autocomplete
                                    size="small"
                                    options={designations}
                                    getOptionLabel={(option) => option.name || ''}
                                    value={filters.designation_id}
                                    onChange={(e, value) => setFilters({ ...filters, designation_id: value })}
                                    renderInput={(params) => <TextField {...params} placeholder="Designation" />}
                                    sx={{
                                        minWidth: 140,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '20px',
                                            backgroundColor: '#fff',
                                        },
                                    }}
                                />
                                <Button
                                    startIcon={<Search />}
                                    variant="contained"
                                    onClick={handleFilter}
                                    disabled={isLoading}
                                    sx={{
                                        backgroundColor: '#063455',
                                        color: 'white',
                                        textTransform: 'none',
                                        borderRadius: '20px',
                                        height: '40px',
                                        px: 3,
                                        '&:hover': { backgroundColor: '#052d45' },
                                        '&:disabled': { backgroundColor: '#ccc', color: '#666' },
                                    }}
                                >
                                    {isLoading ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : 'Search'}
                                </Button>
                                {(searchTerm || filters.department_id || filters.branch_id || filters.shift_id || filters.designation_id) && (
                                    <Button
                                        variant="outlined"
                                        onClick={handleClearFilters}
                                        sx={{
                                            color: '#063455',
                                            borderColor: '#063455',
                                            textTransform: 'none',
                                            borderRadius: '20px',
                                            height: '40px',
                                            px: 2,
                                            '&:hover': { borderColor: '#052d45', backgroundColor: 'rgba(6,52,85,0.05)' },
                                        }}
                                    >
                                        Reset
                                    </Button>
                                )}
                            </Box>
                        </Box>

                        {/* Employees Table */}
                        <TableContainer component={Paper} style={{ borderRadius: '16px', overflowX: 'auto' }}>
                            <Table>
                                <TableHead style={{ backgroundColor: '#063455', height: 30 }}>
                                    <TableRow>
                                        <TableCell style={{ color: '#fff', fontWeight: '600', fontSize: '16px' }}>EMP ID</TableCell>
                                        <TableCell style={{ color: '#fff', fontWeight: '600', fontSize: '16px' }}>Name</TableCell>
                                        <TableCell style={{ color: '#fff', fontWeight: '600', fontSize: '16px' }}>Department</TableCell>
                                        <TableCell style={{ color: '#fff', fontWeight: '600', fontSize: '16px' }}>Designation</TableCell>
                                        <TableCell style={{ color: '#fff', fontWeight: '600', fontSize: '16px' }}>Joining Date</TableCell>
                                        <TableCell style={{ color: '#fff', fontWeight: '600', fontSize: '16px' }}>Email Address</TableCell>
                                        <TableCell style={{ color: '#fff', fontWeight: '600', fontSize: '16px' }}>Employee Status</TableCell>
                                        <TableCell style={{ color: '#fff', fontWeight: '600', fontSize: '16px' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {employees?.data?.length > 0 ? (
                                        employees.data.map((emp) => {
                                            // Check if department is deleted OR not assigned at all
                                            const isDepartmentDeleted = emp.department?.deleted_at !== null && emp.department?.deleted_at !== undefined;
                                            const hasNoDepartment = !emp.department_id || !emp.department;
                                            const needsAttention = isDepartmentDeleted || hasNoDepartment;

                                            const rowStyle = needsAttention
                                                ? {
                                                      backgroundColor: '#ffebee',
                                                  }
                                                : {};

                                            const cellStyle = needsAttention ? { color: '#d32f2f', fontWeight: 400, fontSize: '14px' } : { color: '#7F7F7F', fontWeight: 400, fontSize: '14px' };

                                            return (
                                                <TableRow key={emp.id} style={rowStyle}>
                                                    <TableCell style={cellStyle}>#{emp.employee_id}</TableCell>
                                                    <TableCell style={cellStyle}>{emp.name}</TableCell>
                                                    <TableCell style={cellStyle}>
                                                        {emp.department?.name ? (
                                                            <>
                                                                {emp.department.name}
                                                                {isDepartmentDeleted && (
                                                                    <Typography
                                                                        variant="caption"
                                                                        style={{
                                                                            color: '#d32f2f',
                                                                            fontStyle: 'italic',
                                                                            display: 'block',
                                                                            fontSize: '0.7rem',
                                                                        }}
                                                                    >
                                                                        (Department Deleted)
                                                                    </Typography>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <Typography variant="caption" style={{ color: '#d32f2f', fontStyle: 'italic' }}>
                                                                No Department
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell style={cellStyle}>{emp.designation?.name || emp.designation || '-'}</TableCell>
                                                    <TableCell style={cellStyle}>{emp.joining_date}</TableCell>
                                                    <TableCell style={cellStyle}>{emp.email}</TableCell>
                                                    <TableCell style={cellStyle}>
                                                        {needsAttention ? (
                                                            <Typography
                                                                variant="caption"
                                                                style={{
                                                                    color: '#d32f2f',
                                                                    fontWeight: 'bold',
                                                                    backgroundColor: '#ffcdd2',
                                                                    padding: '2px 8px',
                                                                    borderRadius: '4px',
                                                                }}
                                                            >
                                                                {hasNoDepartment ? 'No Department' : 'Dept Deleted'}
                                                            </Typography>
                                                        ) : (
                                                            (emp.status ?? 'Active')
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <IconButton
                                                            onClick={() => router.visit(route('employees.edit', emp.id))}
                                                            size="small"
                                                            sx={{
                                                                color: '#0a3d62',
                                                                '&:hover': { backgroundColor: '#f5f5f5' },
                                                            }}
                                                        >
                                                            <FaEdit size={18} style={{ marginRight: 10, color: '#f57c00' }} />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center">
                                                No employees found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        <Box sx={{ display: 'flex', justifyContent: 'end', mt: 3 }}>
                            <Pagination
                                count={employees?.last_page || 1}
                                page={employees?.current_page || 1}
                                onChange={(e, page) =>
                                    router.get(route('employees.dashboard'), {
                                        page,
                                        search: searchTerm,
                                        department_id: filters.department_id?.id,
                                        subdepartment_id: filters.subdepartment_id?.id,
                                        branch_id: filters.branch_id?.id,
                                        shift_id: filters.shift_id?.id,
                                        designation_id: filters.designation_id?.id,
                                    })
                                }
                            />
                        </Box>
                    </div>
                </Box>
            </div>
        </>
    );
};

export default EmployeeDashboard;
