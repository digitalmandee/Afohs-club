import POSLayout from '@/components/POSLayout';
import { routeNameForContext } from '@/lib/utils';
import { router, usePage } from '@inertiajs/react';
import { Close, ContentCopy, Refresh } from '@mui/icons-material';
import { Box, Button, Chip, Dialog, DialogContent, DialogTitle, FormControl, Grid, IconButton, InputLabel, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useMemo, useState } from 'react';

function formatDateTime(iso) {
    if (!iso) return '-';
    try {
        return new Date(iso).toLocaleString('en-GB');
    } catch (_) {
        return '-';
    }
}

function statusChip(status) {
    const s = status || '-';
    const map = {
        pending: { label: 'pending', color: 'default' },
        printing: { label: 'printing', color: 'warning' },
        printed: { label: 'printed', color: 'success' },
        failed: { label: 'failed', color: 'error' },
    };
    const cfg = map[s] || { label: s, color: 'default' };
    return <Chip size="small" label={cfg.label} color={cfg.color} />;
}

export default function PrintJobs({ jobs, devices = [], categories = [], filters = {} }) {
    const { url } = usePage();
    const jobsList = jobs?.data || [];

    const [status, setStatus] = useState(filters.status || '');
    const [deviceId, setDeviceId] = useState(filters.device_id || '');
    const [orderId, setOrderId] = useState(filters.order_id || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');

    const [payloadOpen, setPayloadOpen] = useState(false);
    const [payloadText, setPayloadText] = useState('');
    const [payloadTitle, setPayloadTitle] = useState('');

    const deviceOptions = useMemo(() => devices || [], [devices]);
    const categoryOptions = useMemo(() => categories || [], [categories]);

    const applyFilters = () => {
        router.get(
            route(routeNameForContext('printer.jobs.index', url)),
            {
                status: status || null,
                device_id: deviceId || null,
                order_id: orderId || null,
                category_id: categoryId || null,
            },
            { preserveState: true, replace: true },
        );
    };

    const resetFilters = () => {
        setStatus('');
        setDeviceId('');
        setOrderId('');
        setCategoryId('');
        router.get(route(routeNameForContext('printer.jobs.index', url)), {}, { preserveState: false, replace: true });
    };

    const openPayload = (job) => {
        const text = JSON.stringify(job?.payload ?? {}, null, 2);
        setPayloadTitle(`Job #${job?.id}`);
        setPayloadText(text);
        setPayloadOpen(true);
    };

    const copyPayload = async () => {
        try {
            await navigator.clipboard.writeText(payloadText);
            enqueueSnackbar('Copied', { variant: 'success' });
        } catch (_) {
            enqueueSnackbar('Copy failed', { variant: 'error' });
        }
    };

    const retryJob = (id) => {
        router.post(route(routeNameForContext('printer.jobs.retry', url), { job: id }), {}, { onError: () => enqueueSnackbar('Retry failed', { variant: 'error' }) });
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Print Jobs
                </Typography>
            </Box>

            <Paper variant="outlined" sx={{ borderRadius: 2, p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="pending">pending</MenuItem>
                                <MenuItem value="printing">printing</MenuItem>
                                <MenuItem value="printed">printed</MenuItem>
                                <MenuItem value="failed">failed</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Device</InputLabel>
                            <Select label="Device" value={deviceId} onChange={(e) => setDeviceId(e.target.value)}>
                                <MenuItem value="">All</MenuItem>
                                {deviceOptions.map((d) => (
                                    <MenuItem key={d.device_id} value={d.device_id}>
                                        {d.device_id}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Category</InputLabel>
                            <Select label="Category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                                <MenuItem value="">All</MenuItem>
                                {categoryOptions.map((c) => (
                                    <MenuItem key={c.id} value={String(c.id)}>
                                        {c.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField fullWidth size="small" label="Order ID" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="contained" onClick={applyFilters} sx={{ backgroundColor: '#063455' }}>
                            Apply
                        </Button>
                        <Button variant="outlined" onClick={resetFilters}>
                            Reset
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead sx={{ backgroundColor: '#063455' }}>
                            <TableRow>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>ID</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Order</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Category</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Device</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Printer</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Attempts</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Created</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Printed</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Failed</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }} align="right">
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {jobsList.length ? (
                                jobsList.map((j) => (
                                    <TableRow key={j.id} hover>
                                        <TableCell>#{j.id}</TableCell>
                                        <TableCell>{statusChip(j.status)}</TableCell>
                                        <TableCell>{j.order_id}</TableCell>
                                        <TableCell>
                                            {(() => {
                                                const groupsCount = Array.isArray(j?.payload?.groups) ? j.payload.groups.length : 0;
                                                const payloadCategory = j?.payload?.category_name || null;
                                                return j?.category?.name || (payloadCategory ? (payloadCategory === 'Multiple' && groupsCount ? `Multiple (${groupsCount})` : payloadCategory) : groupsCount ? `Multiple (${groupsCount})` : '-');
                                            })()}
                                        </TableCell>
                                        <TableCell>{j.printer_device_id}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{j.printer_name || '-'}</Typography>
                                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                                {j.printer_type || '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{j.attempts}</TableCell>
                                        <TableCell>{formatDateTime(j.created_at)}</TableCell>
                                        <TableCell>{formatDateTime(j.printed_at)}</TableCell>
                                        <TableCell>
                                            {j.failed_at ? (
                                                <Tooltip title={j.last_error || ''}>
                                                    <span>{formatDateTime(j.failed_at)}</span>
                                                </Tooltip>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button size="small" variant="outlined" onClick={() => openPayload(j)} sx={{ mr: 1 }}>
                                                Payload
                                            </Button>
                                            {j.status === 'failed' && (
                                                <Button size="small" variant="outlined" startIcon={<Refresh />} onClick={() => retryJob(j.id)}>
                                                    Retry
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={11} align="center" sx={{ py: 3, color: '#999' }}>
                                        No print jobs found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={payloadOpen} onClose={() => setPayloadOpen(false)} fullWidth maxWidth="md">
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontWeight: 700 }}>{payloadTitle}</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton onClick={copyPayload} title="Copy">
                            <ContentCopy />
                        </IconButton>
                        <IconButton onClick={() => setPayloadOpen(false)} title="Close">
                            <Close />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, backgroundColor: '#0b1020', color: '#fff' }}>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{payloadText}</pre>
                    </Paper>
                </DialogContent>
            </Dialog>
        </Box>
    );
}

PrintJobs.layout = (page) => <POSLayout>{page}</POSLayout>;
