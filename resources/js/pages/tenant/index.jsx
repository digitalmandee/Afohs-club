import { router } from '@inertiajs/react';
import { Box, Button, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { FaEdit, FaToggleOff, FaToggleOn, FaTrash, FaUndo } from 'react-icons/fa';

const Index = ({ tenants, showTrashed }) => {
    // const [open, setOpen] = useState(true);
    const isTrashedView = Boolean(showTrashed);

    return (
        <>
            {/* <SideNav open={open} setOpen={setOpen} /> */}
            <div
                style={{
                    minHeight: '100vh',
                    padding: '2rem',
                    backgroundColor: '#f5f5f5'
                }}
            >
                {/* Page Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography sx={{ fontWeight: 700, fontSize: '30px', color: '#063455' }}>
                        Restaurant Dashboard
                    </Typography>
                    <Box display="flex" gap={1}>
                        <Button
                            variant="outlined"
                            sx={{ textTransform: 'none' }}
                            onClick={() => router.visit(isTrashedView ? route('locations.index') : route('locations.trashed'))}
                        >
                            {isTrashedView ? 'Back to Active' : 'Trashed'}
                        </Button>
                    </Box>
                </Box>

                {/* Tenant Table */}
                <TableContainer
                    // component={Paper}
                    sx={{
                        // backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        boxShadow: 'none',
                        border: '1px solid #ccc',
                    }}
                >
                    <Table>
                        <TableHead sx={{ backgroundColor: '#063455' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, fontSize: '16px', color: '#fff' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '16px', color: '#fff' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '16px', color: '#fff' }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tenants.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center" sx={{ padding: '2rem' }}>
                                        No tenants found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tenants.map((tenant) => (
                                    <TableRow key={tenant.id}>
                                        <TableCell sx={{ fontSize: '14px', color: '#7f7f7f' }}>{tenant.name}</TableCell>
                                        <TableCell sx={{ fontSize: '14px', color: '#7f7f7f' }}>{tenant.status ?? '-'}</TableCell>
                                        <TableCell>
                                            {isTrashedView ? (
                                                <MenuItem
                                                    onClick={() => {
                                                        if (!confirm('Restore this restaurant?')) return;
                                                        router.post(route('locations.restore', tenant.id));
                                                    }}
                                                >
                                                    <FaUndo size={16} style={{ marginRight: 20, color: '#2e7d32' }} />
                                                    Restore
                                                </MenuItem>
                                            ) : (
                                                <>
                                                    <MenuItem onClick={() => router.visit(route('locations.edit', tenant.id))}>
                                                        <FaEdit size={16} style={{ marginRight: 20, color: '#f57c00' }} />
                                                        Edit
                                                    </MenuItem>
                                                    <MenuItem
                                                        onClick={() => {
                                                            router.put(route('locations.status', tenant.id));
                                                        }}
                                                    >
                                                        {tenant.status === 'active' ? (
                                                            <FaToggleOn size={18} style={{ marginRight: 20, color: '#2e7d32' }} />
                                                        ) : (
                                                            <FaToggleOff size={18} style={{ marginRight: 20, color: '#d32f2f' }} />
                                                        )}
                                                        {tenant.status === 'active' ? 'Deactivate' : 'Activate'}
                                                    </MenuItem>
                                                    <MenuItem
                                                        onClick={() => {
                                                            if (!confirm('Delete this restaurant?')) return;
                                                            router.delete(route('locations.destroy', tenant.id));
                                                        }}
                                                    >
                                                        <FaTrash size={16} style={{ marginRight: 20, color: '#d32f2f' }} />
                                                        Delete
                                                    </MenuItem>
                                                </>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </>
    );
};

export default Index;
