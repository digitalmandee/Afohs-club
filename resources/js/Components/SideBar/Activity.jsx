import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const LoginActivityScreen = ({ setProfileView }) => {
    const loginActivities = [
        { date: '10 Aug, 2024', activity: 'Login', time: '09:50 am' },
        { date: '10 Aug, 2024', activity: 'Logout', time: '15:02 pm' },
        { date: '09 Aug, 2024', activity: 'Login', time: '09:50 am' },
        { date: '09 Aug, 2024', activity: 'Logout', time: '15:02 pm' },
        { date: '09 Aug, 2024', activity: 'Login', time: '09:50 am' },
        { date: '09 Aug, 2024', activity: 'Logout', time: '15:02 pm' },
        { date: '09 Aug, 2024', activity: 'Login', time: '09:50 am' },
        { date: '09 Aug, 2024', activity: 'Logout', time: '15:02 pm' },
    ];

    return (
        <Box sx={{
            bgcolor: '#e6f2f5',
            minHeight: '100vh',
            // p: 2,
            pt: 1
        }}>
            <Paper
                elevation={0}
                sx={{
                    width: '100%',
                    // maxWidth: 500,
                    mx: 'auto',
                    bgcolor: 'transparent',
                    boxShadow: 'none',
                    // p:2
                }}
            >
                {/* Header */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2
                }}>
                    <IconButton
                        size="small"
                        sx={{
                            mr: 1,
                            color: '#333'
                        }}
                        onClick={() => setProfileView("profile")}
                    >
                        <ArrowBackIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                        Login Activity
                    </Typography>
                </Box>

                {/* Activity Table */}
                <TableContainer component={Box} sx={{ p: 2 }}>
                    <Table sx={{ minWidth: '100%' }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#0c4a6e' }}>
                                <TableCell
                                    sx={{
                                        color: 'white',
                                        fontWeight: 'medium',
                                        py: 1.5,
                                        width: '33%'
                                    }}
                                >
                                    Date
                                </TableCell>
                                <TableCell
                                    sx={{
                                        color: 'white',
                                        fontWeight: 'medium',
                                        py: 1.5,
                                        width: '33%'
                                    }}
                                >
                                    Activity
                                </TableCell>
                                <TableCell
                                    sx={{
                                        color: 'white',
                                        fontWeight: 'medium',
                                        py: 1.5,
                                        width: '33%'
                                    }}
                                >
                                    Login Time
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loginActivities.map((activity, index) => {
                                const isLogout = activity.activity === 'Logout';
                                const showDivider = isLogout && index < loginActivities.length - 1;

                                return (
                                    <TableRow
                                        key={index}
                                        sx={{
                                            bgcolor: 'transparent',
                                            '&:last-child td, &:last-child th': { border: 0 }
                                        }}
                                    >
                                        <TableCell
                                            sx={{
                                                py: 1.5,
                                                borderBottom: showDivider ? '1px solid #ccd7dd' : 'none',
                                                color: '#333'
                                            }}
                                        >
                                            {activity.date}
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                py: 1.5,
                                                borderBottom: showDivider ? '1px solid #ccd7dd' : 'none',
                                                color: isLogout ? '#ef4444' : '#1976d2',
                                                fontWeight: 'medium'
                                            }}
                                        >
                                            {activity.activity}
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                py: 1.5,
                                                borderBottom: showDivider ? '1px solid #ccd7dd' : 'none',
                                                color: '#333'
                                            }}
                                        >
                                            {activity.time}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default LoginActivityScreen;