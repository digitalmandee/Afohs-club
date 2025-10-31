import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, MenuItem, Select } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import 'bootstrap/dist/css/bootstrap.min.css';

// const drawerWidthOpen = 240;
// const drawerWidthClosed = 110;

const BookingRequests = () => {
    const { props } = usePage();
    const { requests } = props;

    // const [open, setOpen] = useState(true);

    const handleStatusChange = (id, newStatus) => {
        router.put(
            route('rooms.request.update.status', id),
            { status: newStatus },
            {
                onSuccess: () => enqueueSnackbar('Status updated successfully', { variant: 'success' }),
                onError: () => enqueueSnackbar('Error updating status', { variant: 'error' }),
            },
        );
    };

    return (
        <>
            {/* <SideNav open={open} setOpen={setOpen} />

            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                }}
            > */}
                <Box sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between">
                        <div className="d-flex align-items-center">
                            <Typography sx={{ marginLeft: '10px', fontWeight: 500, color: '#063455', fontSize: '30px' }}>Room Booking Requests</Typography>
                        </div>
                        <Button
                            variant="contained"
                            startIcon={<span>+</span>}
                            style={{
                                backgroundColor: '#063455',
                                textTransform: 'none',
                                borderRadius: '4px',
                                height: 40,
                            }}
                            onClick={() => router.visit(route('rooms.request.create'))}
                        >
                            Add Room Request
                        </Button>
                    </Box>

                    <TableContainer sx={{ marginTop: '20px' }} component={Paper} style={{ boxShadow: 'none' }}>
                        <Table>
                            <TableHead>
                                <TableRow style={{ backgroundColor: '#E5E5EA', height: '60px' }}>
                                    <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>ID</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Booking Date</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Type</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Guest/Member</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Room</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Persons</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Per Day Charge</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Status</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {requests.map((req) => (
                                    <TableRow key={req.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <TableCell>{req.id}</TableCell>
                                        <TableCell>{req.booking_date}</TableCell>
                                        <TableCell>{req.booking_type}</TableCell>
                                        <TableCell>{req.booking_type.startsWith('guest-') ? req.customer?.name : req.member?.full_name}</TableCell>
                                        <TableCell>{req.room?.name}</TableCell>
                                        <TableCell>{req.persons}</TableCell>
                                        <TableCell>{req.per_day_charge}</TableCell>
                                        <TableCell>
                                            <Select value={req.status} onChange={(e) => handleStatusChange(req.id, e.target.value)} size="small">
                                                <MenuItem value="pending">Pending</MenuItem>
                                                <MenuItem value="approved">Approved</MenuItem>
                                                <MenuItem value="rejected">Rejected</MenuItem>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="contained" size="small" onClick={() => router.get(route('rooms.request.edit', req.id))}>
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            {/* </div> */}
        </>
    );
};

export default BookingRequests;
