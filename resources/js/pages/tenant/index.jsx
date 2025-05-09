import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router } from '@inertiajs/react';
import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useState } from 'react';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const Index = ({ tenants }) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                    backgroundColor: '#F6F6F6',
                    minHeight: '100vh',
                    padding: '2rem',
                }}
            >
                {/* Page Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#3F4E4F' }}>
                        Tenant Management
                    </Typography>
                    <Button
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
                        onClick={() => router.visit(route('tenant.create'))}
                    >
                        Create Tenant
                    </Button>
                </Box>

                {/* Tenant Table */}
                <TableContainer
                    component={Paper}
                    sx={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: 2,
                        boxShadow: 'none',
                        border: '1px solid #ccc',
                    }}
                >
                    <Table>
                        <TableHead sx={{ backgroundColor: '#E5E5EA' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, fontSize: '16px' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '16px' }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '16px' }}>Domain(s)</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '16px' }}>Action</TableCell>
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
                                        <TableCell sx={{ fontSize: '15px', color: '#6C6C6C' }}>{tenant.name}</TableCell>
                                        <TableCell sx={{ fontSize: '15px', color: '#6C6C6C' }}>{tenant.email}</TableCell>
                                        <TableCell sx={{ fontSize: '15px', color: '#6C6C6C' }}>
                                            {tenant.domains.map((d) => d.domain).join(', ')}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                variant="text"
                                                sx={{
                                                    textTransform: 'none',
                                                    color: '#0D2B4E',
                                                    fontWeight: 500,
                                                }}
                                                onClick={() => router.visit(route('tenant.edit', tenant.id))}
                                            >
                                                Edit
                                            </Button>
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
