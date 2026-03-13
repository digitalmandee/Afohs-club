import POSLayout from '@/components/POSLayout';
import { routeNameForContext } from '@/lib/utils';
import { router, usePage } from '@inertiajs/react';
import { Add, ContentCopy, Delete, Edit, Refresh } from '@mui/icons-material';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Paper } from '@mui/material';
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

export default function PrintDevices({ devices = [], lastToken = null, lastTokenDeviceId = null }) {
    const { url } = usePage();

    const [createOpen, setCreateOpen] = useState(false);
    const [createDeviceId, setCreateDeviceId] = useState('');
    const [createName, setCreateName] = useState('');

    const [tokenOpen, setTokenOpen] = useState(Boolean(lastToken));
    const tokenValue = lastToken;
    const tokenDeviceId = lastTokenDeviceId;

    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [editingStatus, setEditingStatus] = useState('active');

    const rows = useMemo(() => devices || [], [devices]);

    const openEdit = (d) => {
        setEditingId(d.id);
        setEditingName(d.name || '');
        setEditingStatus(d.status || 'active');
    };

    const closeEdit = () => {
        setEditingId(null);
        setEditingName('');
        setEditingStatus('active');
    };

    const submitCreate = () => {
        if (!createDeviceId.trim()) {
            enqueueSnackbar('Device ID is required', { variant: 'error' });
            return;
        }

        router.post(
            route(routeNameForContext('printer.devices.store', url)),
            {
                device_id: createDeviceId.trim(),
                name: createName.trim() || null,
            },
            {
                onSuccess: () => {
                    setCreateOpen(false);
                    setCreateDeviceId('');
                    setCreateName('');
                    setTokenOpen(true);
                    enqueueSnackbar('Device created. Copy token now (shown only once).', { variant: 'success' });
                },
                onError: () => enqueueSnackbar('Failed to create device', { variant: 'error' }),
            },
        );
    };

    const submitEdit = () => {
        if (!editingId) return;

        router.put(
            route(routeNameForContext('printer.devices.update', url), { device: editingId }),
            {
                name: editingName.trim() || null,
                status: editingStatus,
            },
            {
                onSuccess: () => {
                    closeEdit();
                    enqueueSnackbar('Device updated', { variant: 'success' });
                },
                onError: () => enqueueSnackbar('Failed to update device', { variant: 'error' }),
            },
        );
    };

    const rotateToken = (id) => {
        router.post(
            route(routeNameForContext('printer.devices.rotate', url), { device: id }),
            {},
            {
                onSuccess: () => {
                    setTokenOpen(true);
                    enqueueSnackbar('Token rotated. Copy token now (shown only once).', { variant: 'success' });
                },
                onError: () => enqueueSnackbar('Failed to rotate token', { variant: 'error' }),
            },
        );
    };

    const deleteDevice = (id) => {
        router.delete(route(routeNameForContext('printer.devices.destroy', url), { device: id }), {
            onSuccess: () => enqueueSnackbar('Device deleted', { variant: 'success' }),
            onError: () => enqueueSnackbar('Failed to delete device', { variant: 'error' }),
        });
    };

    const copyToken = async () => {
        if (!tokenValue) return;
        try {
            await navigator.clipboard.writeText(tokenValue);
            enqueueSnackbar('Token copied', { variant: 'success' });
        } catch (_) {
            enqueueSnackbar('Copy failed', { variant: 'error' });
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Print Devices
                </Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)} sx={{ backgroundColor: '#063455' }}>
                    Add Device
                </Button>
            </Box>

            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead sx={{ backgroundColor: '#063455' }}>
                            <TableRow>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Device ID</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Name</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Last Seen</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Created</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }} align="right">
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.length ? (
                                rows.map((d) => (
                                    <TableRow key={d.id} hover>
                                        <TableCell>{d.device_id}</TableCell>
                                        <TableCell>{d.name || '-'}</TableCell>
                                        <TableCell>{d.status}</TableCell>
                                        <TableCell>{formatDateTime(d.last_seen_at)}</TableCell>
                                        <TableCell>{formatDateTime(d.created_at)}</TableCell>
                                        <TableCell align="right">
                                            <Button size="small" variant="outlined" startIcon={<Edit />} onClick={() => openEdit(d)} sx={{ mr: 1 }}>
                                                Edit
                                            </Button>
                                            <Button size="small" variant="outlined" startIcon={<Refresh />} onClick={() => rotateToken(d.id)} sx={{ mr: 1 }}>
                                                Rotate Token
                                            </Button>
                                            <Button size="small" variant="outlined" color="error" startIcon={<Delete />} onClick={() => deleteDevice(d.id)}>
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 3, color: '#999' }}>
                                        No devices found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Add Print Device</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <TextField label="Device ID" fullWidth value={createDeviceId} onChange={(e) => setCreateDeviceId(e.target.value)} placeholder="e.g. KITCHEN-PC-01" />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Name" fullWidth value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder="e.g. Kitchen PC 1" />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={submitCreate} sx={{ backgroundColor: '#063455' }}>
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={Boolean(editingId)} onClose={closeEdit} fullWidth maxWidth="sm">
                <DialogTitle>Edit Print Device</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <TextField label="Name" fullWidth value={editingName} onChange={(e) => setEditingName(e.target.value)} />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select label="Status" value={editingStatus} onChange={(e) => setEditingStatus(e.target.value)}>
                                    <MenuItem value="active">active</MenuItem>
                                    <MenuItem value="inactive">inactive</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeEdit}>Cancel</Button>
                    <Button variant="contained" onClick={submitEdit} sx={{ backgroundColor: '#063455' }}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={tokenOpen && Boolean(tokenValue)} onClose={() => setTokenOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Device Token</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>
                        Token for <strong>{tokenDeviceId || '-'}</strong>. Copy and save it now. This token is not shown again.
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField fullWidth value={tokenValue || ''} InputProps={{ readOnly: true }} />
                        <IconButton onClick={copyToken} title="Copy token">
                            <ContentCopy />
                        </IconButton>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTokenOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

PrintDevices.layout = (page) => <POSLayout>{page}</POSLayout>;
