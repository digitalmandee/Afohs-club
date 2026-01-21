import React from 'react';
import { usePage, Link } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, Pagination, Chip } from '@mui/material';
import { format } from 'date-fns';

const TransfersIndex = () => {
    const { transfers } = usePage().props;

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#063455' }}>
                    Employee Transfer History
                </Typography>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Transferred From</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Transferred To</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {transfers.data.length > 0 ? (
                            transfers.data.map((transfer) => (
                                <TableRow key={transfer.id}>
                                    <TableCell>{format(new Date(transfer.transfer_date), 'dd MMM yyyy')}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600}>
                                            {transfer.employee?.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            #{transfer.employee?.employee_id}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                Branch: <strong>{transfer.from_branch?.name || '-'}</strong>
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                Dept: <strong>{transfer.from_department?.name || '-'}</strong>
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                Desig: {transfer.from_designation?.name || '-'}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                Shift: {transfer.from_shift?.name || '-'}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                            <Typography variant="caption" sx={{ color: 'success.main' }}>
                                                Branch: <strong>{transfer.to_branch?.name || '-'}</strong>
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'success.main' }}>
                                                Dept: <strong>{transfer.to_department?.name || '-'}</strong>
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'success.main' }}>
                                                Desig: {transfer.to_designation?.name || '-'}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'success.main' }}>
                                                Shift: {transfer.to_shift?.name || '-'}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                            {transfer.reason || 'No reason provided'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                    No transfer records found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination */}
            {transfers.last_page > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Pagination
                        count={transfers.last_page}
                        page={transfers.current_page}
                        onChange={(e, p) => (window.location.href = `${window.location.pathname}?page=${p}`)} // Simple pagination
                        color="primary"
                    />
                </Box>
            )}
        </Box>
    );
};

export default TransfersIndex;
