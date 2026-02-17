import { router } from '@inertiajs/react';
import AddIcon from '@mui/icons-material/Add';
import { Box, Button, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useState } from 'react';
import { FaEdit } from 'react-icons/fa';

const Index = ({ tenants }) => {
    // const [open, setOpen] = useState(true);

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
                    {/* <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{
                            backgroundColor: '#0D2B4E',
                            textTransform: 'none',
                            color: '#FFFFFF',
                            '&:hover': {
                                backgroundColor: '#063455',
                            },
                        }}
                        onClick={() => router.visit(route('locations.create'))}
                    >
                        Create Restaurant
                    </Button> */}
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
                                <TableCell sx={{ fontWeight: 600, fontSize: '16px', color: '#fff' }}>Domain(s)</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '16px', color: '#fff' }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tenants.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ padding: '2rem' }}>
                                        No tenants found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tenants.map((tenant, index) => (
                                    <TableRow key={index}>
                                        <TableCell sx={{ fontSize: '14px', color: '#7f7f7f' }}>{tenant.name}</TableCell>
                                        <TableCell sx={{ fontSize: '14px', color: '#7f7f7f' }}>{tenant.domains.map((d) => d.domain).join(', ')}</TableCell>
                                        <TableCell>
                                            {/* <Button
                                                size="small"
                                                variant="text"
                                                sx={{
                                                    textTransform: 'none',
                                                    color: '#0D2B4E',
                                                    fontWeight: 500,
                                                }}
                                                
                                            >
                                                Edit
                                            </Button> */}
                                            <MenuItem onClick={() => router.visit(route('locations.edit', tenant.id))}>
                                                <FaEdit size={16} style={{ marginRight: 20, color: '#f57c00' }} />
                                            </MenuItem>
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
