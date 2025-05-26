import React, { useState } from 'react'
import {
    Box,
    Button,
    Table,
    TableContainer,
    TableHead,
    Paper,
    TableRow,
    TableCell,
    TableBody,
    InputBase,
    IconButton,
    Typography
} from "@mui/material"
import { Add, CalendarToday, FilterAlt, ArrowBack } from "@mui/icons-material"
import SideNav from '@/components/App/AdminSideBar/SideNav'
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { router } from '@inertiajs/react';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;
const SalaryComponent = () => {
    const [open, setOpen] = useState(false);

    const employeeData = [
        {
            component: 'Basic Salary',
            unit: 'Fixed Salary',
            deduction: 'In-Active',
            status: "Active"
        },
        {
            component: 'Basic Salary',
            unit: 'Fixed Salary',
            deduction: 'In-Active',
            status: "In-Active"
        },
        {
            component: 'Basic Salary',
            unit: 'Fixed Salary',
            deduction: 'In-Active',
            status: "Active"
        },
        {
            component: 'Basic Salary',
            unit: 'Fixed Salary',
            deduction: 'In-Active',
            status: "Active"
        },
        {
            component: 'Basic Salary',
            unit: 'Fixed Salary',
            deduction: 'In-Active',
            status: "In-Active"
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
                    backgroundColor: '#F6F6F6'
                }}
            >
                <Box sx={{
                    px: 3,
                    pt: 2
                }}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            pt: 2
                        }}
                    >
                        {/* Left: Back + Title */}
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <IconButton style={{ color: "#3F4E4F" }} onClick={() => window.history.back()}>
                                <ArrowBack />
                            </IconButton>
                            <Typography sx={{ color: '#3F4E4F', fontWeight: 500, fontSize: '30px' }}>
                                Salary Component
                            </Typography>
                        </Box>

                        {/* Right: Search + Filter */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {/* Search Bar */}
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    border: "1px solid #121212",
                                    borderRadius: "4px",
                                    width: "350px",
                                    height: '40px',
                                    padding: "4px 8px",
                                    backgroundColor: '#FFFFFF',
                                    mr: 2  // <-- Add margin to the right of search bar
                                }}
                            >
                                <SearchIcon style={{ color: "#121212", marginRight: "8px" }} />
                                <InputBase
                                    placeholder="Search employee member here"
                                    fullWidth
                                    sx={{ fontSize: "14px" }}
                                    inputProps={{ style: { padding: 0 } }}
                                />
                            </Box>

                            {/* Filter Button */}
                            <Button
                                variant="outlined"
                                style={{
                                    border: '1px solid #3F4E4F',
                                    color: '#333',
                                    textTransform: 'none',
                                    backgroundColor: 'transparent',
                                    minWidth: '40px', // optional: makes it more icon-sized
                                    padding: '7px',    // optional: tighter padding for icon-only button
                                }}
                                onClick={() => router.visit('/employee/payroll/add/salary/component')}
                            >
                                <AddIcon />
                            </Button>
                        </Box>
                    </Box>
                    <div style={{ marginTop: '2rem' }}>
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
                                        <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '16px' }}>Component Name</TableCell>
                                        <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '16px' }}>Unit Type</TableCell>
                                        <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '16px' }}>Deduction</TableCell>
                                        <TableCell style={{ color: '#000000', fontWeight: '500', fontSize: '16px' }}>Status</TableCell>
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
                                                <TableCell style={{ cursor: 'pointer', fontWeight: 500, fontSize: '16px', color: '#6C6C6C' }}>
                                                    {employee.component}
                                                </TableCell>
                                                <TableCell style={{ fontWeight: 500, fontSize: '16px', color: '#6C6C6C' }}>
                                                    {employee.unit}
                                                </TableCell>

                                                {/* Deduction with red pill */}
                                                <TableCell>
                                                    <span
                                                        style={{
                                                            backgroundColor: '#F14C35',
                                                            color: '#fff',
                                                            borderRadius: '12px',
                                                            padding: '2px 12px',
                                                            fontSize: '12px',
                                                            fontWeight: '500',
                                                            display: 'inline-block',
                                                        }}
                                                    >
                                                        {employee.deduction}
                                                    </span>
                                                </TableCell>

                                                {/* Status with conditional pill */}
                                                <TableCell>
                                                    <span
                                                        style={{
                                                            backgroundColor:
                                                                employee.status === 'Active' ? '#063455' : '#B0DEFF',
                                                            color:
                                                                employee.status === 'Active' ? '#fff' : 'black',
                                                            borderRadius: '12px',
                                                            padding: '2px 12px',
                                                            fontSize: '12px',
                                                            fontWeight: '500',
                                                            display: 'inline-block',
                                                        }}
                                                    >
                                                        {employee.status}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                </Box>
            </div>
        </>
    )
}

export default SalaryComponent
