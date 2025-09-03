'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Box, Button, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';
import { debounce } from 'lodash';
import { router, usePage } from '@inertiajs/react';
import SearchIcon from '@mui/icons-material/Search';
import FilterAlt from '@mui/icons-material/FilterAlt';
import ReservationFilter from '@/components/App/Reservation/Filter';

const Reservations = () => {
    const { reservations, filters } = usePage().props;

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [filteredReservations, setFilteredReservations] = useState(reservations.data || []);
    const [showFilter, setShowFilter] = useState(false);

    const debouncedSearch = useMemo(
        () =>
            debounce((value) => {
                router.get(route('reservations.index'), { search: value }, { preserveState: true });
            }, 500),
        [],
    );

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        debouncedSearch(e.target.value);
    };

    const handleFilterClose = () => setShowFilter(false);
    const handleFilterShow = () => setShowFilter(true);

    useEffect(() => {
        setFilteredReservations(reservations.data || []);
    }, [reservations]);

    return (
        <Box sx={{ padding: '20px' }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Reservations</Typography>
                <Box display="flex" gap={2}>
                    <Box sx={{ position: 'relative', width: '300px' }}>
                        <input
                            type="text"
                            name="search"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Search by member name..."
                            style={{
                                width: '100%',
                                padding: '10px 35px 10px 10px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                            }}
                        />
                        <SearchIcon sx={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                    </Box>
                    <Button variant="outlined" startIcon={<FilterAlt />} onClick={handleFilterShow}>
                        Filter
                    </Button>
                </Box>
            </Box>

            {/* Table */}
            <Paper>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Member</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell>Persons</TableCell>
                            <TableCell>Table</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredReservations.length > 0 ? (
                            filteredReservations.map((reservation) => (
                                <TableRow key={reservation.id}>
                                    <TableCell>#{reservation.id}</TableCell>
                                    <TableCell>{reservation.member?.full_name || 'N/A'}</TableCell>
                                    <TableCell>{reservation.date}</TableCell>
                                    <TableCell>
                                        {reservation.start_time} - {reservation.end_time}
                                    </TableCell>
                                    <TableCell>{reservation.person_count}</TableCell>
                                    <TableCell>{reservation.table?.name || 'N/A'}</TableCell>
                                    <TableCell>{reservation.status}</TableCell>
                                    <TableCell>
                                        <Button size="small" variant="outlined" onClick={() => alert('View details')}>
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    No reservations found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>

            {/* Pagination */}
            <Box display="flex" justifyContent="center" mt={2}>
                {reservations.links.map((link, index) => (
                    <Button key={index} onClick={() => link.url && router.visit(link.url)} disabled={!link.url} variant={link.active ? 'contained' : 'outlined'} size="small" sx={{ mx: 1 }}>
                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                    </Button>
                ))}
            </Box>

            {/* Filter Drawer */}
            {showFilter && <ReservationFilter onClose={handleFilterClose} />}
        </Box>
    );
};

export default Reservations;
