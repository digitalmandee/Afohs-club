import React from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Box, Paper, Typography, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Chip } from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';
import SideNav from '@/components/App/SideBar/SideNav';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

function Index({ cakeTypes, filters }) {
    const [open, setOpen] = React.useState(true);
    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('cake-types.index'), { preserveState: true });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this cake type?')) {
            router.delete(route('cake-types.destroy', id));
        }
    };

    return (
        <>
            <Head title="Cake Types" />
            <SideNav open={open} setOpen={setOpen} />
            <Box
                sx={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5.5rem',
                    p: 3,
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#003B5C' }}>
                        Cake Types List
                    </Typography>
                    <Box>
                        <Button variant="outlined" color="error" startIcon={<Delete />} component={Link} href={route('cake-types.trashed')} sx={{ mr: 2 }}>
                            Trash
                        </Button>
                        <Button variant="contained" startIcon={<Add />} component={Link} href={route('cake-types.create')} sx={{ bgcolor: '#003B5C', '&:hover': { bgcolor: '#002a41' } }}>
                            Add Cake Type
                        </Button>
                    </Box>
                </Box>

                <Paper sx={{ p: 2, mb: 3 }}>
                    <form onSubmit={handleSearch}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField label="Search by Name" size="small" value={data.search} onChange={(e) => setData('search', e.target.value)} sx={{ flexGrow: 1 }} />
                            <Button variant="outlined" startIcon={<Search />} type="submit" disabled={processing}>
                                Search
                            </Button>
                        </Box>
                    </form>
                </Paper>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {cakeTypes.data.length > 0 ? (
                                cakeTypes.data.map((type) => (
                                    <TableRow key={type.id}>
                                        <TableCell>{type.name}</TableCell>
                                        <TableCell>Rs {type.base_price}</TableCell>
                                        <TableCell>
                                            <Chip label={type.status} color={type.status === 'active' ? 'success' : 'default'} size="small" variant="outlined" sx={{ textTransform: 'capitalize' }} />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton component={Link} href={route('cake-types.edit', type.id)} size="small" color="primary">
                                                <Edit />
                                            </IconButton>
                                            <IconButton onClick={() => handleDelete(type.id)} size="small" color="error">
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                        No cake types found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                {/* Pagination can be added here if needed */}
            </Box>
        </>
    );
}

Index.layout = (page) => page;
export default Index;
