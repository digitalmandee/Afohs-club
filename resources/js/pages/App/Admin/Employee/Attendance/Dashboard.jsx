import React, { useEffect, useState } from 'react';
import { Button, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, CircularProgress, Pagination } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CategoryIcon from '@mui/icons-material/Category';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import DescriptionIcon from '@mui/icons-material/Description';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { Box } from '@mui/system';
import { router, usePage } from '@inertiajs/react';

// const drawerWidthOpen = 240;
// const drawerWidthClosed = 110;

const AttendanceDashboard = () => {
    const { props } = usePage();
    const { employees } = props; // coming from Laravel
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
                    <div>
                        <div style={{ paddingTop: '1rem', backgroundColor: 'transparent' }}>
                            <div style={{ display: 'flex', width: '98%', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <Typography variant="text" style={{ fontWeight: '500', fontSize: '24px' }}>
                                    Application Dashboard
                                </Typography>
                                <Button style={{ color: 'white', backgroundColor: '#FF66B2' }} onClick={() => router.push(`/employee/leave/application/new`)}>
                                    New Application
                                </Button>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    justifyContent: 'center',
                                    gap: '50px',
                                    width: '98%',
                                    marginBottom: '24px',
                                }}
                            >
                                {[
                                    {
                                        label: 'Leave Category',
                                        icon: <CategoryIcon style={{ color: '#FF9933' }} />,
                                        bgColor: '#FFF2E5',
                                        borderColor: '#FFE0C2',
                                        path: route('employees.leaves.category.index'),
                                    },
                                    {
                                        label: 'Leave Application',
                                        icon: <AssignmentIcon style={{ color: '#FF66B2' }} />,
                                        bgColor: '#FFE5F1',
                                        borderColor: '#FCCFEF',
                                        path: route('employees.leaves.application.index'),
                                    },
                                    {
                                        label: 'Leave Management',
                                        icon: <SettingsIcon style={{ color: '#33CC33' }} />,
                                        bgColor: '#E5FFE5',
                                        borderColor: '#A4FFBF',
                                        path: '',
                                    },
                                    {
                                        label: 'Leave Report',
                                        icon: <BarChartIcon style={{ color: '#6666FF' }} />,
                                        bgColor: '#E5E5FF',
                                        borderColor: '#BEC0FF',
                                        path: route('employees.leaves.application.report'),
                                    },
                                    {
                                        label: 'Manage Attendance',
                                        icon: <AssignmentIcon style={{ color: '#FF9933' }} />,
                                        bgColor: '#FFF2E5',
                                        borderColor: '#F8EF91',
                                        path: route('employees.attendances.management'),
                                    },
                                    {
                                        label: 'Monthly Report',
                                        icon: <DescriptionIcon style={{ color: '#33CC33' }} />,
                                        bgColor: '#F2FFF2',
                                        borderColor: '#A6FFD7',
                                        path: route('employees.attendances.monthly.report'),
                                    },
                                    {
                                        label: 'Attendance Report',
                                        icon: <EventNoteIcon style={{ color: '#33CC33' }} />,
                                        bgColor: '#F0FFF0',
                                        borderColor: '#B8FF8F',
                                        path: route('employees.attendances.report'),
                                    },
                                    {
                                        label: 'Leave Reports',
                                        icon: <BarChartIcon style={{ color: '#6666FF' }} />,
                                        bgColor: '#E5E5FF',
                                        borderColor: '#BEC0FF',
										path: route('employees.leaves.application.report'),
                                    },
                                ].map((card, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            flex: '1 1 calc(25% - 50px)', // 4 items per row
                                            maxWidth: '220px',
                                            maxHeight: '160px',
                                            padding: '20px',
                                            backgroundColor: 'white',
                                            borderRadius: '12px',
                                            border: `2px solid ${card.borderColor}`,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            textAlign: 'center',
                                        }}
                                        onClick={() => card.path && router.push('/' + card.path)}
                                    >
                                        <div
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                backgroundColor: card.bgColor,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: '12px',
                                            }}
                                        >
                                            {card.icon}
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#333' }}>{card.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Employee List Section */}
                            <div style={{ backgroundColor: 'white', width: '98%', borderRadius: '12px', padding: '24px' }}>
                                <div style={{ marginBottom: '24px' }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '0 1rem',
                                        }}
                                    >
                                        <div style={{ fontSize: '18px', fontWeight: '500' }}>Employee List</div>
                                        <div style={{ position: 'relative', width: '250px' }}>
                                            <input
                                                type="text"
                                                placeholder="Find by name"
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 16px 8px 40px',
                                                    border: '1px solid #E0E0E0',
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                }}
                                            />
                                            <SearchIcon
                                                style={{
                                                    position: 'absolute',
                                                    left: '1.5rem',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    color: '#666',
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

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
                                    <Pagination count={employees.last_page} page={employees.current_page} onChange={(e, page) => router.get(route('employees.attendances.dashboard'), { page })} />
                                </Box>
                            </div>
                        </div>
                    </div>
                </Box>
            </div>
        </>
    );
};

export default AttendanceDashboard;
