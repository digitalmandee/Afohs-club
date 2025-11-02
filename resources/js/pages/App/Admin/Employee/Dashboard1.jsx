import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Button, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, CircularProgress, Pagination } from '@mui/material';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PrintIcon from '@mui/icons-material/Print';
import { Box } from '@mui/system';

// const drawerWidthOpen = 240;
// const drawerWidthClosed = 110;

const EmployeeDashboard = () => {
    const { props } = usePage();
    const { employees, stats } = props; // coming from Laravel
    // const [open, setOpen] = useState(true);

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
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <Typography variant="h5" style={{ fontWeight: 'bold' }}>
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

                        {/* Employees Table */}
                        <TableContainer component={Paper} style={{ borderRadius: '1rem', border: '1px solid #ccc' }}>
                            <Table>
                                <TableHead style={{ backgroundColor: '#E5E5EA' }}>
                                    <TableRow>
                                        <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '14px' }}>EMP ID</TableCell>
                                        <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '14px' }}>Name</TableCell>
                                        <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '14px' }}>Type</TableCell>
                                        <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '14px' }}>Department</TableCell>
                                        <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '14px' }}>Designation</TableCell>
                                        <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '14px' }}>Joining Date</TableCell>
                                        <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '14px' }}>Email Address</TableCell>
                                        <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '14px' }}>Employee Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {employees.data.length > 0 ? (
                                        employees.data.map((emp) => (
                                            <TableRow key={emp.id}>
                                                <TableCell>#{emp.employee_id}</TableCell>
                                                <TableCell>{emp.name}</TableCell>
                                                <TableCell>{emp.employee_type?.name}</TableCell>
                                                <TableCell>{emp.department?.name}</TableCell>
                                                <TableCell>{emp.designation}</TableCell>
                                                <TableCell>{emp.joining_date}</TableCell>
                                                <TableCell>{emp.email}</TableCell>
                                                <TableCell>{emp.status ?? 'Active'}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                No employees found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        <Box sx={{ display: 'flex', justifyContent: 'end', mt: 3 }}>
                            <Pagination count={employees.last_page} page={employees.current_page} onChange={(e, page) => router.get(route('employees.dashboard'), { page })} />
                        </Box>
                    </div>
                </Box>
            </div>
        </>
    );
};

export default EmployeeDashboard;
