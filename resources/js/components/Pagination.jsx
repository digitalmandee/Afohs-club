import React from 'react';
import { Pagination as MuiPagination, Stack, Typography } from '@mui/material';
import { router } from '@inertiajs/react';

const Pagination = ({ data }) => {
    if (!data || !data.last_page || data.last_page <= 1) return null;

    const handleChange = (event, value) => {
        const url = new URL(window.location.href);
        url.searchParams.set('page', value);
        router.visit(url.toString(), { preserveScroll: true, preserveState: true });
    };

    return (
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2, p: 2, bgcolor: '#fff', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
                Showing {data.from || 0} to {data.to || 0} of {data.total} results
            </Typography>
            <MuiPagination count={data.last_page} page={data.current_page} onChange={handleChange} color="primary" shape="rounded" showFirstButton showLastButton />
        </Stack>
    );
};

export default Pagination;
