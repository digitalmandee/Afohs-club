import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Button, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, CircularProgress, Pagination, IconButton, FormControl, InputLabel, Select, MenuItem, TextField, Grid, Box, Chip } from '@mui/material';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';

// const drawerWidthOpen = 240;
// const drawerWidthClosed = 110;

const EmployeeDashboard = () => {
    const { props } = usePage();
    const { employees, stats, departments, filters } = props; // coming from Laravel
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [selectedDepartments, setSelectedDepartments] = useState(filters?.department_ids || []);
    const [isLoading, setIsLoading] = useState(false);
    // const [open, setOpen] = useState(true);

    const handleFilter = () => {
        setIsLoading(true);
        router.get(
            route('employees.dashboard'),
            {
                search: searchTerm,
                department_ids: selectedDepartments,
                page: 1, // Reset to first page when filtering
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
        setSelectedDepartments([]);
        setSearchTerm('');
        router.get(
            route('employees.dashboard'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleSearch = () => {
        router.get(
            route('employees.dashboard'),
            {
                search: searchTerm,
                department_ids: selectedDepartments,
                page: 1, // Reset to first page when searching
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        router.get(
            route('employees.dashboard'),
            {
                department_ids: selectedDepartments,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            {/* <SideNav open={open} setOpen={setOpen} /> */}
            <div
                style={{
                    minHeight: '100vh',
                    backgroundColor: '#f5f5f5',
                }}
            >
                <Box sx={{ px: 2, py: 2 }}>
                    <div style={{ paddingTop: '1rem' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <Typography variant="h5" style={{ color: '#0a3d62', fontWeight: '600' }}>
                                Employee Management
                            </Typography>
                            <Button style={{ color: 'white', backgroundColor: '#0a3d62' }} onClick={() => router.visit(route('employees.create'))}>
                                Add Employee
                            </Button>
                        </div>

                        {/* Stats Cards */}
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '24px' }}>
                            {[
                                { title: 'Total Employees', value: stats.total_employees, icon: EventSeatIcon },
                                { title: 'Total Present', value: stats.total_present, icon: PeopleIcon },
                                { title: 'Total Absent', value: stats.total_absent, icon: AssignmentIcon },
                                { title: 'Late Arrival', value: stats.total_late, icon: PrintIcon },
                            ].map((item, idx) => (
                                <Card key={idx} style={{ flex: 1, border: '1px solid #ccc', borderRadius: '8px' }}>
                                    <CardContent>
                                        <Typography variant="body2" color="text.secondary">
                                            {item.title}
                                        </Typography>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                                                {item.value}
                                            </Typography>
                                            <div style={{ backgroundColor: '#0a3d62', borderRadius: '8px', padding: '0.5rem' }}>
                                                <item.icon style={{ color: '#fff', width: '40px', height: '40px' }} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Filter Section */}
                        <Box sx={{ mb: 3, p: 3, backgroundColor: 'white', borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            <Typography sx={{ fontWeight: 600, fontSize: '18px', color: '#063455', mb: 3 }}>Search & Filter Options</Typography>

                            {/* Search Fields */}
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Search by name, ID, email, or designation..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleFilter();
                                            }
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                            },
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Departments</InputLabel>
                                        <Select
                                            multiple
                                            value={selectedDepartments}
                                            label="Departments"
                                            onChange={(e) => setSelectedDepartments(e.target.value)}
                                            renderValue={(selected) => (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {selected.map((value) => {
                                                        const dept = departments?.find((d) => d.id === value);
                                                        return (
                                                            <Chip
                                                                key={value}
                                                                label={dept?.name || value}
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: '#063455',
                                                                    color: 'white',
                                                                    '& .MuiChip-deleteIcon': {
                                                                        color: 'white',
                                                                    },
                                                                }}
                                                            />
                                                        );
                                                    })}
                                                </Box>
                                            )}
                                            sx={{
                                                borderRadius: 2,
                                            }}
                                        >
                                            {departments?.map((dept) => (
                                                <MenuItem key={dept.id} value={dept.id}>
                                                    {dept.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={handleFilter}
                                        disabled={isLoading}
                                        sx={{
                                            backgroundColor: '#063455',
                                            color: 'white',
                                            textTransform: 'none',
                                            borderRadius: 2,
                                            height: '40px',
                                            '&:hover': {
                                                backgroundColor: '#052d45',
                                            },
                                            '&:disabled': {
                                                backgroundColor: '#ccc',
                                                color: '#666',
                                            },
                                        }}
                                    >
                                        {isLoading ? (
                                            <>
                                                <CircularProgress size={16} sx={{ mr: 1, color: 'inherit' }} />
                                                Loading...
                                            </>
                                        ) : (
                                            'Filter'
                                        )}
                                    </Button>
                                </Grid>
                            </Grid>

                            {/* Clear Filter Button */}
                            {(selectedDepartments.length > 0 || searchTerm) && (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={2}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            onClick={handleClearFilters}
                                            sx={{
                                                color: '#063455',
                                                borderColor: '#063455',
                                                textTransform: 'none',
                                                borderRadius: 2,
                                                height: '40px',
                                                '&:hover': {
                                                    borderColor: '#052d45',
                                                    backgroundColor: 'rgba(6, 52, 85, 0.04)',
                                                },
                                            }}
                                        >
                                            Clear Filters
                                        </Button>
                                    </Grid>
                                </Grid>
                            )}
                        </Box>

                        {/* Employees Table */}
                        <TableContainer component={Paper} style={{ borderRadius: '1rem', border: '1px solid #ccc' }}>
                            <Table>
                                <TableHead style={{ backgroundColor: '#E5E5EA' }}>
                                    <TableRow>
                                        <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '14px' }}>EMP ID</TableCell>
                                        <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '14px' }}>Name</TableCell>
                                        <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '14px' }}>Department</TableCell>
                                        <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '14px' }}>Designation</TableCell>
                                        <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '14px' }}>Joining Date</TableCell>
                                        <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '14px' }}>Email Address</TableCell>
                                        <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '14px' }}>Employee Status</TableCell>
                                        <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '14px' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {employees.data.length > 0 ? (
                                        employees.data.map((emp) => {
                                            // Check if department is deleted (has deleted_at field)
                                            const isDepartmentDeleted = emp.department?.deleted_at !== null;

                                            const rowStyle = isDepartmentDeleted
                                                ? {
                                                      backgroundColor: '#ffebee', // Light red background
                                                      color: '#d32f2f', // Red text
                                                      opacity: 0.7,
                                                  }
                                                : {};

                                            return (
                                                <TableRow key={emp.id} style={rowStyle}>
                                                    <TableCell style={isDepartmentDeleted ? { color: '#d32f2f' } : {}}>#{emp.employee_id}</TableCell>
                                                    <TableCell style={isDepartmentDeleted ? { color: '#d32f2f' } : {}}>{emp.name}</TableCell>
                                                    <TableCell style={isDepartmentDeleted ? { color: '#d32f2f' } : {}}>
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
                                                    <TableCell style={isDepartmentDeleted ? { color: '#d32f2f' } : {}}>{emp.designation}</TableCell>
                                                    <TableCell style={isDepartmentDeleted ? { color: '#d32f2f' } : {}}>{emp.joining_date}</TableCell>
                                                    <TableCell style={isDepartmentDeleted ? { color: '#d32f2f' } : {}}>{emp.email}</TableCell>
                                                    <TableCell style={isDepartmentDeleted ? { color: '#d32f2f' } : {}}>
                                                        {isDepartmentDeleted ? (
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
                                                                Needs Attention (Department)
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
                                                                '&:hover': {
                                                                    backgroundColor: '#f5f5f5',
                                                                },
                                                            }}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={9} align="center">
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
                                count={employees.last_page}
                                page={employees.current_page}
                                onChange={(e, page) =>
                                    router.get(route('employees.dashboard'), {
                                        page,
                                        search: searchTerm,
                                        department_ids: selectedDepartments,
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
