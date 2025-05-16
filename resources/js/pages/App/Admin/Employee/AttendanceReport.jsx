import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    Grid,
    Button,
    Typography,
    Box,
    Card,
    InputBase,
    CardContent,
    Paper,
    Avatar,
    Divider,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon
} from '@mui/icons-material';
import { FilterAlt, ArrowBack } from "@mui/icons-material"
import SearchIcon from '@mui/icons-material/Search';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router } from '@inertiajs/react';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const AttendanceReport = () => {
    const [open, setOpen] = useState(false);

    const employees = [
        {
            id: 20,
            name: 'John Doe',
            position: 'Designer',
            photo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1.PNG-DCX6Sx2PGC9f35Hp0i4JH2AL1oxzpX.png', // Replace with actual photo URL
            stats: {
                totalLeave: 6,
                totalAttendance: 30,
                totalAbsent: 10,
                totalLet: 0
            }
        },
        {
            id: 21,
            name: 'Jane Smith',
            position: 'Developer',
            photo: 'https://randomuser.me/api/portraits/women/44.jpg',
            stats: {
                totalLeave: 4,
                totalAttendance: 32,
                totalAbsent: 8,
                totalLet: 2
            }
        },
        {
            id: 22,
            name: 'Mike Johnson',
            position: 'Project Manager',
            photo: 'https://randomuser.me/api/portraits/men/32.jpg',
            stats: {
                totalLeave: 3,
                totalAttendance: 35,
                totalAbsent: 5,
                totalLet: 1
            }
        }
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
                <Box sx={{
                    px:4,
                    py:2
                }}>
                    {/* Header with back button and title */}
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
                            {/* <IconButton style={{ color: "#3F4E4F" }} onClick={() => window.history.back()}>
                                <ArrowBack />
                            </IconButton> */}
                            <h2
                                className="mb-0"
                                style={{
                                    color: "#3F4E4F",
                                    fontSize: '30px',
                                    fontWeight: 500
                                }}
                            >
                                Attendance Report
                            </h2>
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
                                startIcon={<FilterAlt />}
                                style={{
                                    border: '1px solid #3F4E4F',
                                    color: '#333',
                                    textTransform: 'none',
                                    backgroundColor: 'transparent',
                                }}
                                onClick={() => {
                                    setOpenFilter(true);
                                }}
                            >
                                Filter
                            </Button>
                        </Box>
                    </Box>

                    {/* Form Card */}
                    <div className="row">
                        {employees.map((employee, index) => (
                            <div className="col-md-4 mb-4" key={index}>
                                <Card
                                    sx={{
                                        maxWidth: 320,
                                        borderRadius: 3,
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                                        overflow: 'visible',
                                        position: 'relative',
                                        pb: 1
                                    }}
                                >
                                    <CardContent sx={{ p: 0 }}>
                                        {/* Profile Photo */}
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                mt: 2
                                            }}
                                        >
                                            <Avatar
                                                src={employee.photo}
                                                sx={{
                                                    width: 80,
                                                    height: 80,
                                                    border: '3px solid white',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                        </Box>

                                        {/* Employee ID */}
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            align="center"
                                            sx={{ mt: 1 }}
                                        >
                                            Employ ID : {employee.id}
                                        </Typography>

                                        {/* Divider */}
                                        <Divider
                                            sx={{
                                                my: 2,
                                                borderStyle: 'dotted',
                                                borderColor: '#ddd'
                                            }}
                                        />

                                        {/* Name and Position */}
                                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                                            <Typography variant="h6" fontWeight="bold">
                                                {employee.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {employee.position}
                                            </Typography>
                                        </Box>

                                        {/* Stats Grid */}
                                        <Grid container spacing={2} sx={{ px: 2, mb: 2 }}>
                                            <Grid item xs={6}>
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        bgcolor: '#f9f9f9',
                                                        p: 1.5,
                                                        textAlign: 'center',
                                                        borderRadius: 2
                                                    }}
                                                >
                                                    <Typography variant="h6" fontWeight="bold">
                                                        {employee.totalLeave}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" fontSize="12px">
                                                        Total Leave
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        bgcolor: '#f9f9f9',
                                                        p: 1.5,
                                                        textAlign: 'center',
                                                        borderRadius: 2
                                                    }}
                                                >
                                                    <Typography variant="h6" fontWeight="bold">
                                                        {employee.totalAttendance}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" fontSize="12px">
                                                        Total Attendance
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        bgcolor: '#f9f9f9',
                                                        p: 1.5,
                                                        textAlign: 'center',
                                                        borderRadius: 2
                                                    }}
                                                >
                                                    <Typography variant="h6" fontWeight="bold">
                                                        {employee.totalAbsent}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" fontSize="12px">
                                                        Total Absent
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        bgcolor: '#f9f9f9',
                                                        p: 1.5,
                                                        textAlign: 'center',
                                                        borderRadius: 2
                                                    }}
                                                >
                                                    <Typography variant="h6" fontWeight="bold">
                                                        {employee.totalLet}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" fontSize="12px">
                                                        Total Let
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                        </Grid>

                                        {/* Bottom Bar */}
                                        <Box
                                            sx={{
                                                height: 10,
                                                bgcolor: '#0a3d62',
                                                borderBottomLeftRadius: 12,
                                                borderBottomRightRadius: 12,
                                                position: 'absolute',
                                                bottom: 0,
                                                width: '100%'
                                            }}
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                </Box>
            </div>
        </>
    );
};

export default AttendanceReport;