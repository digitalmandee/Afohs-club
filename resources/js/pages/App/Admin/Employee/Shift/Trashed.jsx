import { router } from '@inertiajs/react';
import { Box, Button, Dialog, DialogActions, DialogContent, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography, IconButton } from '@mui/material';
import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { MdRestore } from 'react-icons/md';
import { RiDeleteBin6Line } from 'react-icons/ri';

const Trashed = ({ shifts }) => {
    const { enqueueSnackbar } = useSnackbar();
    const { data, total, per_page, current_page } = shifts;

    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const handleRestore = (id) => {
        router.post(
            route('shifts.restore', id),
            {},
            {
                onSuccess: () => enqueueSnackbar('Shift restored successfully', { variant: 'success' }),
                onError: () => enqueueSnackbar('Failed to restore shift', { variant: 'error' }),
            },
        );
    };

    const handleForceDelete = () => {
        router.delete(route('shifts.force-delete', selectedId), {
            onSuccess: () => {
                enqueueSnackbar('Shift permanently deleted', { variant: 'success' });
                setOpenDeleteModal(false);
            },
            onError: () => enqueueSnackbar('Failed to delete shift', { variant: 'error' }),
        });
    };

    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" sx={{ color: '#063455', fontWeight: 600 }}>
                    Trashed Shifts
                </Typography>
                <Button variant="outlined" onClick={() => router.visit(route('shifts.index'))}>
                    Back to List
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center">
                                    No trashed shifts found
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>
                                        {item.start_time} - {item.end_time}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleRestore(item.id)} color="primary" title="Restore">
                                            <MdRestore />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => {
                                                setSelectedId(item.id);
                                                setOpenDeleteModal(true);
                                            }}
                                            color="error"
                                            title="Delete Permanently"
                                        >
                                            <RiDeleteBin6Line />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination component="div" count={total} page={current_page - 1} onPageChange={(e, p) => router.visit(route('shifts.trashed', { page: p + 1 }))} rowsPerPage={per_page} rowsPerPageOptions={[10]} />

            <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
                <DialogContent>
                    <Typography>Are you sure you want to permanently delete this shift?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteModal(false)}>Cancel</Button>
                    <Button onClick={handleForceDelete} color="error" variant="contained">
                        Delete Forever
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Trashed;
