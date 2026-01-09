import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Box, Button, Chip, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Tooltip } from '@mui/material';
import { RestoreFromTrash, DeleteForever, ArrowBack, Restaurant, Lock, LockOpen } from '@mui/icons-material';
import AdminLayout from '@/layouts/AdminLayout';

export default function Trashed({ types }) {
    const handleRestore = (id) => {
        if (confirm('Are you sure you want to restore this charge type?')) {
            router.post(route('finance.charge-types.restore', id));
        }
    };

    const handleForceDelete = (id) => {
        if (confirm('This action cannot be undone. Are you sure you want to permanently delete this charge type?')) {
            router.delete(route('finance.charge-types.force-delete', id));
        }
    };

    return (
        <AdminLayout>
            <Head title="Trashed Charge Types" />
            <Box sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box>
                        <Typography variant="h5" fontWeight="bold" color="#1e293b">
                            Trashed Charge Types
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Restore or permanently delete removed charge types.
                        </Typography>
                    </Box>
                    <Link href={route('finance.charge-types.index')}>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBack />}
                            sx={{
                                textTransform: 'none',
                                borderRadius: 2,
                            }}
                        >
                            Back to List
                        </Button>
                    </Link>
                </Box>

                <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: '#fee2e2' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600, color: '#991b1b' }}>Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#991b1b' }}>Default Amount</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#991b1b' }}>Pricing Mode</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#991b1b' }}>Status</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600, color: '#991b1b' }}>
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {types.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                            <Box sx={{ color: 'text.secondary' }}>
                                                <Restaurant sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                                                <Typography>No trashed items found.</Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    types.data.map((type) => (
                                        <TableRow key={type.id} hover>
                                            <TableCell>
                                                <Typography variant="subtitle2" fontWeight={600} color="#1e293b">
                                                    {type.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {type.type || 'Generic'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {type.default_amount > 0 ? (
                                                    <Typography variant="body2" fontWeight={600} color="primary.main">
                                                        Rs {parseFloat(type.default_amount).toLocaleString()}
                                                    </Typography>
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">
                                                        -
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>{type.is_fixed ? <Chip icon={<Lock sx={{ fontSize: '14px !important' }} />} label="Fixed Price" size="small" color="warning" variant="outlined" sx={{ borderRadius: 1, height: 24 }} /> : <Chip icon={<LockOpen sx={{ fontSize: '14px !important' }} />} label="Dynamic / Editable" size="small" color="success" variant="outlined" sx={{ borderRadius: 1, height: 24 }} />}</TableCell>
                                            <TableCell>
                                                <Chip label="Deleted" size="small" color="error" sx={{ textTransform: 'capitalize', height: 24 }} />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Box display="flex" justifyContent="flex-end" gap={1}>
                                                    <Tooltip title="Restore">
                                                        <IconButton size="small" color="success" onClick={() => handleRestore(type.id)}>
                                                            <RestoreFromTrash fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete Permanently">
                                                        <IconButton size="small" color="error" onClick={() => handleForceDelete(type.id)}>
                                                            <DeleteForever fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>
        </AdminLayout>
    );
}
