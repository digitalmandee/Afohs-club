import React, { useState, useEffect } from 'react';
import { Typography, Button, TextField, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper, IconButton, Avatar, Box, InputAdornment, Chip } from '@mui/material';
import axios from 'axios';
import { Search, RestoreFromTrash } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import { router, usePage } from '@inertiajs/react';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';

const TrashedCorporateMembers = ({ members }) => {
    const props = usePage().props;
    const { enqueueSnackbar } = useSnackbar();

    const [filteredMembers, setFilteredMembers] = useState(members.data);
    const [search, setSearch] = useState(props.filters?.search || '');

    useEffect(() => {
        setFilteredMembers(members.data);
    }, [members.data]);

    const handleSearch = () => {
        router.get(
            route('corporate-membership.trashed'),
            { search },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleRestore = (id) => {
        axios
            .post(route('corporate-membership.restore', id))
            .then(() => {
                setFilteredMembers((prev) => prev.filter((m) => m.id !== id));
                enqueueSnackbar('Corporate member restored successfully', { variant: 'success' });
            })
            .catch((error) => {
                console.error('Error restoring member:', error);
                enqueueSnackbar('Failed to restore member. Please try again.', { variant: 'error' });
            });
    };

    return (
        <div className="container-fluid p-4 pt-4" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', overflowX: 'hidden' }}>
            <div className="mx-3">
                <div className="d-flex justify-content-between align-items-center">
                    <Typography sx={{ fontWeight: 700, fontSize: '30px', color: '#063455' }}>Deleted Corporate Members</Typography>
                    <Button
                        variant="outlined"
                        onClick={() => router.get(route('corporate-membership.members'))}
                        sx={{
                            color: '#063455',
                            borderColor: '#063455',
                            borderRadius: '16px',
                            '&:hover': { backgroundColor: '#e3f2fd', borderColor: '#063455' },
                        }}
                    >
                        Back to All Members
                    </Button>
                </div>
                <Typography style={{ color: '#063455', fontSize: '15px', fontWeight: '600' }}>View and restore deleted corporate members</Typography>

                {/* Search */}
                <Box sx={{ display: 'flex', gap: 2, my: 3 }}>
                    <TextField
                        size="small"
                        placeholder="Search by name or membership no..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ width: 300 }}
                    />
                    <Button variant="contained" onClick={handleSearch} sx={{ backgroundColor: '#063455' }}>
                        Search
                    </Button>
                </Box>

                {/* Trashed Members Table */}
                <TableContainer component={Paper} style={{ boxShadow: 'none', overflowX: 'auto', borderRadius: '16px' }}>
                    <Table>
                        <TableHead>
                            <TableRow style={{ backgroundColor: '#d32f2f', height: '60px' }}>
                                <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Membership No</TableCell>
                                <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Member</TableCell>
                                <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Type</TableCell>
                                <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>CNIC</TableCell>
                                <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Deleted At</TableCell>
                                <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredMembers.map((user) => (
                                <TableRow key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 600, fontSize: '14px' }}>{user.membership_no || 'N/A'}</TableCell>
                                    <TableCell>
                                        <div className="d-flex align-items-center">
                                            <Avatar src={user.profile_photo?.file_path || '/placeholder.svg?height=40&width=40'} alt={user.full_name} style={{ marginRight: '10px' }} />
                                            <div>
                                                <Typography sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.full_name}</Typography>
                                                <Typography sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '12px' }}>{user.personal_email}</Typography>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label="Corporate" size="small" sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 600, fontSize: '11px' }} />
                                    </TableCell>
                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', whiteSpace: 'nowrap' }}>{user.cnic_no || 'N/A'}</TableCell>
                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.deleted_at ? dayjs(user.deleted_at).format('DD-MM-YYYY HH:mm') : 'N/A'}</TableCell>
                                    <TableCell>
                                        <Button variant="contained" size="small" startIcon={<RestoreFromTrash />} onClick={() => handleRestore(user.id)} sx={{ backgroundColor: '#2e7d32', '&:hover': { backgroundColor: '#1b5e20' } }}>
                                            Restore
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredMembers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                        No deleted corporate members found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <Box display="flex" justifyContent="center" mt={2} pb={2}>
                        {members.links?.map((link, index) => (
                            <Button
                                key={index}
                                onClick={() => link.url && router.visit(link.url)}
                                disabled={!link.url}
                                variant={link.active ? 'contained' : 'outlined'}
                                size="small"
                                style={{
                                    margin: '0 5px',
                                    minWidth: '36px',
                                    padding: '6px 10px',
                                    fontWeight: link.active ? 'bold' : 'normal',
                                    backgroundColor: link.active ? '#d32f2f' : '#fff',
                                }}
                            >
                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                            </Button>
                        ))}
                    </Box>
                </TableContainer>
            </div>
        </div>
    );
};

export default TrashedCorporateMembers;
