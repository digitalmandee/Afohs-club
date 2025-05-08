import React from 'react'
import { Grid, Typography, Box, TableCell, TableHead, TableContainer, Table, TableBody, TableRow, Paper } from "@mui/material";
const AttendanceReport = () => {

    const paymentInfo = [
        {
            id: 1,
            method: "Bank transfer",
            accountNumber: "1234 5678 9012",
            date: "Dec 01, 2024",
            status: "Paid",
        },
        {
            id: 2,
            method: "Online transfer",
            accountNumber: "1234 5678 9012",
            date: "Oct 01, 2024",
            status: "Un Paid",
        },
    ]
    return (
        <>
            <Grid item xs={12} sx={{
                px: 2
            }}>
                <Box sx={{
                    width: '100%',
                    bgcolor: '#E3E3E3',
                    height: '52px',
                    px: 2,
                    py: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    mt: 2
                }}>
                    <Typography sx={{
                        color: '#063455',
                        fontWeight: 700,
                        fontSize: '16px'
                    }}>
                        Payment Detail
                    </Typography>
                </Box>

                <TableContainer
                    component={Paper}
                    elevation={0}
                    style={{
                        marginTop: "1rem",
                    }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ backgroundColor: "#FCF7EF" }}>Emp ID</TableCell>
                                <TableCell sx={{ backgroundColor: "#FCF7EF" }}>Date</TableCell>
                                <TableCell sx={{ backgroundColor: "#FCF7EF" }}>Check-In</TableCell>
                                <TableCell sx={{ backgroundColor: "#FCF7EF" }}>Check-Out</TableCell>
                                <TableCell sx={{ backgroundColor: "#FCF7EF" }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paymentInfo.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell>{payment.id}</TableCell>
                                    <TableCell>{payment.method}</TableCell>
                                    <TableCell>{payment.accountNumber}</TableCell>
                                    <TableCell>{payment.date}</TableCell>
                                    <TableCell>{payment.status}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </>
    )
}

export default AttendanceReport
