import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router } from '@inertiajs/react';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import PeopleIcon from '@mui/icons-material/People';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Button, Card, CircularProgress, InputBase, Modal, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useState } from 'react';
import EmployeeDetail from './Detail';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const EmployeeDashboard = () => {
    const [open, setOpen] = useState(true);
    const [openDetails, setOpenDetails] = useState(false);

    const handleOpenDetails = () => setOpenDetails(true);
    const handleCloseDetails = () => setOpenDetails(false);

    const employeeData = [
        {
            employee_id: 'EMP001',
            name: 'John Doe',
            departmentname: 'Engineering',
            designation: 'Software Engineer',
            joining_date: '2021-06-15',
            email: 'john.doe@example.com',
            status: 'Active',
        },
        {
            employee_id: 'EMP002',
            name: 'Jane Smith',
            departmentname: 'Human Resources',
            designation: 'HR Manager',
            joining_date: '2020-03-10',
            email: 'jane.smith@example.com',
            status: 'Not Active',
        },
        {
            employee_id: 'EMP003',
            name: 'Robert Brown',
            departmentname: 'Finance',
            designation: 'Accountant',
            joining_date: '2019-08-22',
            email: 'robert.brown@example.com',
            status: 'Active',
        },
    ];
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
                <Box
                    sx={{
                        px: 2,
                        py: 2,
                    }}
                >
                    <div style={{ paddingTop: '1rem', backgroundColor: 'transparent' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <Typography
                                sx={{
                                    fontWeight: 500,
                                    fontSize: '30px',
                                    color: '#063455',
                                }}
                            >
                                Employee Management Dashboard
                            </Typography>
                            <Button style={{ color: 'white', width: '180px', backgroundColor: '#0D2B4E', textTransform: 'none' }} startIcon={<AddIcon />} onClick={() => router.visit('/add/employee')}>
                                Add Employee
                            </Button>
                        </div>

                        {/* Metric Cards */}
                        <div
                            style={{
                                display: 'flex',
                                width: '100%',
                                justifyContent: 'space-between',
                                gap: '1rem',
                                marginBottom: '24px',
                            }}
                        >
                            {[
                                { title: 'Total Employee', value: 320, icon: EventSeatIcon },
                                { title: 'Total Present', value: 200, icon: PeopleIcon },
                                { title: 'Total Absent', value: 120, icon: AssignmentIcon },
                                { title: 'Late Arrival', value: 120, icon: PrintIcon },
                            ].map((item, index) => (
                                <div key={index} style={{ flex: 1 }}>
                                    <Card
                                        style={{
                                            backgroundColor: '#063455',
                                            color: '#fff',
                                            borderRadius: '2px',
                                            height: '120px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '1rem',
                                            boxShadow: 'none',
                                            border: 'none',
                                        }}
                                    >
                                        <div
                                            style={{
                                                backgroundColor: '#1E2C2F',
                                                borderRadius: '50%',
                                                width: '50px',
                                                height: '50px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: '1rem',
                                            }}
                                        >
                                            <item.icon style={{ color: '#fff', fontSize: '28px' }} />
                                        </div>
                                        <div>
                                            <Typography variant="body2" style={{ color: '#DDE6E8' }}>
                                                {item.title}
                                            </Typography>
                                            <Typography variant="h6" style={{ fontWeight: 'bold', color: '#fff' }}>
                                                {item.value}
                                            </Typography>
                                        </div>
                                    </Card>
                                </div>
                            ))}
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '24px',
                            }}
                        >
                            {/* Search Field with Icon */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    border: '1px solid #121212',
                                    borderRadius: '4px',
                                    width: '350px',
                                    padding: '4px 8px',
                                    backgroundColor: '#FFFFFF',
                                }}
                            >
                                <SearchIcon style={{ color: '#121212', marginRight: '8px' }} />
                                <InputBase placeholder="Search employee member here" fullWidth sx={{ fontSize: '14px' }} inputProps={{ style: { padding: 0 } }} />
                            </div>
                            {/* View All Link */}
                            <div style={{ textDecoration: 'underline', cursor: 'pointer', color: '#063455', fontWeight: 500, fontSize: '16px' }} onClick={() => router.visit(route('employee.employeeList'))}>
                                View all
                            </div>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            {/* Booking Table */}
                            <TableContainer
                                component={Paper}
                                style={{
                                    width: '100%',
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: '1rem',
                                    boxShadow: 'none',
                                    border: '1px solid #ccc',
                                    marginBottom: '24px',
                                }}
                            >
                                <Table>
                                    <TableHead style={{ backgroundColor: '#E5E5EA' }}>
                                        <TableRow>
                                            <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '16px' }}>EMP ID</TableCell>
                                            <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '16px' }}>Name</TableCell>
                                            <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '16px' }}>Department</TableCell>
                                            <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '16px' }}>Designation</TableCell>
                                            <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '16px' }}>Joining Date</TableCell>
                                            <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '16px' }}>Email Address</TableCell>
                                            <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '16px' }}>Employee Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {employeeData.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} align="center">
                                                    <CircularProgress sx={{ color: '#0F172A' }} />
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            employeeData.map((employee, index) => (
                                                <TableRow key={index}>
                                                    <TableCell
                                                        onClick={handleOpenDetails}
                                                        style={{
                                                            cursor: 'pointer',
                                                            fontWeight: 500,
                                                            fontSize: '16px',
                                                            color: '#6C6C6C',
                                                        }}
                                                    >
                                                        {employee.employee_id}
                                                    </TableCell>
                                                    <TableCell style={{ fontWeight: 500, fontSize: '16px', color: '#6C6C6C' }}>{employee.name}</TableCell>
                                                    <TableCell style={{ fontWeight: 500, fontSize: '16px', color: '#6C6C6C' }}>{employee.departmentname}</TableCell>
                                                    <TableCell style={{ fontWeight: 500, fontSize: '16px', color: '#6C6C6C' }}>{employee.designation}</TableCell>
                                                    <TableCell style={{ fontWeight: 500, fontSize: '16px', color: '#6C6C6C' }}>{employee.joining_date}</TableCell>
                                                    <TableCell style={{ fontWeight: 500, fontSize: '16px', color: '#6C6C6C' }}>{employee.email}</TableCell>
                                                    <TableCell style={{ fontWeight: 500, fontSize: '16px', color: '#6C6C6C' }}>{employee.status}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Modal open={openDetails} onClose={handleCloseDetails} aria-labelledby="employee-detail-modal" aria-describedby="employee-detail-description">
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 15,
                                        right: 10,
                                        height: 'calc(100% - 30px)',
                                        width: 900,
                                        bgcolor: 'background.paper',
                                        borderRadius: '2px',
                                        // p: 3,
                                        overflowY: 'auto',
                                        outline: 'none',
                                        border: 'none',
                                    }}
                                >
                                    <EmployeeDetail />
                                </Box>
                            </Modal>

                            {/* Pagination */}
                            {/* <Box sx={{ display: "flex", justifyContent: "end", mt: 3, paddingBottom: "10px" }}>
                            <Pagination count={totalPages} page={currentPage} onChange={(e, page) => setCurrentPage(page)} />
                        </Box> */}
                        </div>
                    </div>
                </Box>
            </div>
        </>
    );
};

export default EmployeeDashboard;
