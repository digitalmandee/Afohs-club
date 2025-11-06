import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowBack } from '@mui/icons-material';
import { Alert, Box, Button, Paper, IconButton, CircularProgress, TextField, Typography } from '@mui/material';
import { Col, Container, Row } from 'react-bootstrap';
import { enqueueSnackbar } from 'notistack';


const Register = ({ tenant }) => {
    // const [open, setOpen] = useState(true);
    const isEdit = !!tenant;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: tenant?.name || '',
        domain_name: tenant?.id || '',
        printer_ip: tenant?.printer_ip || '',
        printer_port: tenant?.printer_port || '',
    });

    const slugify = (value) =>
        value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');

    const handleNameChange = (e) => {
        const nameValue = e.target.value;
        setData('name', nameValue);

        // Only auto-update domain on create
        if (!isEdit) {
            setData('domain_name', slugify(nameValue));
        }
    };

    const submit = (e) => {
        e.preventDefault();

        if (isEdit) {
            put(route('locations.update', tenant.id), {
                preserveScroll: true,
                onSuccess: () => enqueueSnackbar('Tenant updated successfully!', { variant: 'success' }),
            });
        } else {
            post(route('locations.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    enqueueSnackbar('Kitchen created successfully!', { variant: 'success' });
                    reset(['name', 'domain_name', 'printer_ip', 'printer_port']);
                },
            });
        }
    };

    return (
        <>
            {/* <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'all 0.3s ease',
                }}
            > */}
            <div
                style={{
                    minHeight: '100vh',
                    backgroundColor: "#f5f5f5",
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '20px',
                }}
            >
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    // maxWidth: '600px',
                    justifyContent: 'flex-start',
                    mb: 2,
                    mt: 2
                }}>
                    <IconButton onClick={() => window.history.back()} sx={{ color: '#000' }}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h5" style={{ color: '#063455', fontWeight: 500 }}>
                        Create New Kitchen
                    </Typography>
                </Box>
                <Paper sx={{ p: 3, maxWidth: '600px', width: '100%' }}>
                    <form onSubmit={submit}>
                        {/* Name */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <TextField label="Name" type="text" required fullWidth autoFocus autoComplete="name" value={data.name} onChange={handleNameChange} disabled={processing} placeholder="Full name" error={!!errors.name} helperText={errors.name} variant="outlined" />
                        </div>

                        {/* Domain Name (auto-filled, but editable if needed) */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <TextField label="Domain Name" type="text" required fullWidth autoComplete="domain_name" value={data.domain_name} onChange={(e) => setData('domain_name', slugify(e.target.value))} disabled={isEdit || processing} placeholder="example" error={!!errors.domain_name} helperText={errors.domain_name} variant="outlined" />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <TextField label="Printer IP*" fullWidth placeholder="e.g. 192.168.1.100" name="printer_ip" value={data.printer_ip} onChange={(e) => setData('printer_ip', e.target.value)} error={!!errors.printer_ip} helperText={errors.printer_ip} />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <TextField label="Printer Port*" fullWidth placeholder="e.g. 9100" name="printer_port" value={data.printer_port} onChange={(e) => setData('printer_port', e.target.value)} error={!!errors.printer_port} helperText={errors.printer_port} />
                        </div>

                        {/* Submit */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#003366', textTransform: 'none' }} disabled={processing} fullWidth>
                                {processing && <CircularProgress size={24} style={{ marginRight: '10px' }} />}
                                {isEdit ? 'Update Kitchen' : 'Create Kitchen'}
                            </Button>
                        </div>
                    </form>
                </Paper>
            </div >
            {/* </div> */}
        </>
    );
};

export default Register;
