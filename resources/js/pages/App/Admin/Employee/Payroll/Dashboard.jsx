import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router } from '@inertiajs/react';
import PeopleIcon from '@mui/icons-material/People';
import {
    Box,
    Button,
    Card,
    CircularProgress,
    InputBase,
    Modal,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useState } from 'react';
// import AttendanceFilter from './Filter';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const PayrollDashboard = () => {
    const [open, setOpen] = useState(false);
    const [openFilter, setOpenFilter] = useState(false);

    const employeeData = [
        {
            period: 'Apr-2025',
            total_employee: 80,
            total_salary: 111110,
            total_CTC: 2,
            Gross_salary: 800000,
            total_deduction: 4,
        },
        {
            period: 'Apr-2025',
            total_employee: 80,
            total_salary: 111110,
            total_CTC: 2,
            Gross_salary: 800000,
            total_deduction: 4,
        },
        {
            period: 'Apr-2025',
            total_employee: 80,
            total_salary: 111110,
            total_CTC: 2,
            Gross_salary: 800000,
            total_deduction: 4,
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
                        px: 4,
                        py: 2,
                    }}
                >
                    <div style={{ paddingTop: '1rem', backgroundColor: 'transparent' }}>
                        {/* Header */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                marginBottom: '24px'
                            }}
                        >
                            <Typography
                                sx={{
                                    fontWeight: 500,
                                    fontSize: '30px',
                                    color: '#3F4E4F',
                                }}
                            >
                                Payroll Dashboard
                            </Typography>

                            {/* Right-side buttons container */}
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <Button
                                    style={{
                                        color: '#063455',
                                        width: '160px',
                                        backgroundColor: '#FFFFFF',
                                        textTransform: 'none',
                                        border: '1px solid #7F7F7F',
                                        fontWeight: 500,
                                        fontSize: '16px'
                                    }}
                                    onClick={()=>router.visit('/employee/payroll/salary/component')}
                                >
                                    Salary Component
                                </Button>
                                <Button
                                    style={{
                                        color: 'white',
                                        width: '100px',
                                        backgroundColor: '#063455',
                                        textTransform: 'none'
                                    }}
                                >
                                    Run Payroll
                                </Button>
                            </div>
                        </div>

                        {/* Metric Cards */}
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap', // ✅ Allow wrapping
                                gap: '1rem',
                                marginBottom: '24px',
                                justifyContent: 'flex-start', // optional: makes the cards align left
                            }}
                        >
                            {[
                                { title: 'Total Employee', value: 320, icon: PeopleIcon },
                                { title: 'Total Gross Salary', value: 200, imgSrc: '/assets/ctc.png' },
                                { title: 'Total CTC', value: 120, imgSrc: '/assets/ctc.png' },
                                { title: 'Payable Days', value: 120, imgSrc: '/assets/calendar.png' },
                                { title: 'Total Net Salary', value: 120, imgSrc: '/assets/wallet.png' },
                                { title: 'Total Deduction', value: 120, imgSrc: '/assets/wallet.png' },
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    style={{
                                        flex: '0 0 calc(33.77% - 1rem)',
                                        boxSizing: 'border-box',
                                    }}
                                >
                                    <Card
                                        style={{
                                            backgroundColor: '#3F4E4F',
                                            color: '#fff',
                                            borderRadius: '2px',
                                            height: '160px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '1rem',
                                            boxShadow: 'none',
                                            border: 'none',
                                        }}
                                    >
                                        <div
                                            style={{
                                                backgroundColor: '#202728',
                                                borderRadius: '50%',
                                                width: '50px',
                                                height: '50px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: '1rem',
                                            }}
                                        >
                                            {item.icon ? (
                                                <item.icon style={{ color: '#fff', fontSize: '28px' }} />
                                            ) : item.imgSrc ? (
                                                <img src={item.imgSrc} alt={item.title} style={{ width: '28px', height: '28px' }} />
                                            ) : null}
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
                            {/* Left Group: Search and Filter */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <Typography sx={{ color: '#3F4E4F', fontWeight: 500, fontSize: '30px' }}>
                                    Payroll Summary by Financial Year
                                </Typography>
                            </div>

                            {/* View All Link (Right Side) */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                {/* Input Field with Right-side Dropdown Icon */}
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        border: '1px solid #121212',
                                        // borderRadius: '4px',
                                        width: '200px',
                                        padding: '4px 8px',
                                        backgroundColor: '#FFFFFF',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <InputBase
                                        placeholder="Financial Year 2024-2025"
                                        fullWidth
                                        sx={{ fontSize: '14px' }}
                                        inputProps={{ style: { padding: 0 } }}
                                    />
                                    <ArrowDropDownIcon style={{ color: '#121212', marginLeft: '8px' }} />
                                </div>
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
                                            <TableCell style={{ color: '#000000', fontWeight: 500, fontSize: '16px' }}>Period</TableCell>
                                            <TableCell style={{ color: '#000000', fontWeight: 500, fontSize: '16px' }}>Total Employee</TableCell>
                                            <TableCell style={{ color: '#000000', fontWeight: 500, fontSize: '16px' }}>Total Salary</TableCell>
                                            <TableCell style={{ color: '#000000', fontWeight: 500, fontSize: '16px' }}>Total CTC</TableCell>
                                            <TableCell style={{ color: '#000000', fontWeight: 500, fontSize: '16px' }}>Gross Salary</TableCell>
                                            <TableCell style={{ color: '#000000', fontWeight: 500, fontSize: '16px' }}>Total Deduction</TableCell>
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
                                                        onClick={() => router.visit('/employee/payroll/monthly/summary')}
                                                        style={{
                                                            cursor: 'pointer',
                                                            fontWeight: 500,
                                                            fontSize: '16px',
                                                            color: '#6C6C6C',
                                                        }}
                                                    >
                                                        {employee.period}
                                                    </TableCell>
                                                    <TableCell style={{ fontWeight: 500, fontSize: '16px', color: '#6C6C6C' }}>
                                                        {employee.total_employee}
                                                    </TableCell>
                                                    <TableCell style={{ fontWeight: 500, fontSize: '16px', color: '#6C6C6C' }}>
                                                        {employee.total_salary}
                                                    </TableCell>
                                                    <TableCell style={{ fontWeight: 500, fontSize: '16px', color: '#6C6C6C' }}>
                                                        {employee.total_CTC}
                                                    </TableCell>
                                                    <TableCell style={{ fontWeight: 500, fontSize: '16px', color: '#6C6C6C' }}>
                                                        {employee.Gross_salary}
                                                    </TableCell>
                                                    <TableCell style={{ fontWeight: 500, fontSize: '16px', color: '#6C6C6C' }}>
                                                        {employee.total_deduction}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {/* <AttendanceFilter
                                open={openFilter}
                                onClose={() => setOpenFilter(false)}
                            /> */}
                        </div>
                    </div>
                </Box>
            </div>
        </>
    );
};

export default PayrollDashboard;
