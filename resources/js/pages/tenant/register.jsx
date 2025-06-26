import SideNav from '@/components/App/AdminSideBar/SideNav';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material'; // MUI components
import { Col, Container, Row } from 'react-bootstrap'; // Bootstrap Grid System

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const Register = () => {
    const [open, setOpen] = useState(true);
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        name: '',
        email: '',
        domain_name: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('tenant.store'));
    };

    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'all 0.3s ease',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '100vh',
                        paddingTop: '5rem', // optional, remove if perfect vertical center is needed
                        paddingBottom: '2rem',
                    }}
                >
                    <Container style={{ maxWidth: '700px', width: '100%' }}>
                        <Row className="align-items-center mb-4">
                            <Col>
                                <Typography variant="h4" style={{ color: '#063455', fontWeight: 500 }}>
                                    Tenant Registration
                                </Typography>
                            </Col>
                        </Row>
                        <Box
                            sx={{
                                borderRadius: '20px',
                                border: '1px solid #ccc',
                                backgroundColor: '#fff',
                                padding: '2rem',
                                boxShadow: '0 0 10px rgba(0,0,0,0.05)',
                            }}
                        >
                            <form onSubmit={submit}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <TextField
                                        label="Name"
                                        type="text"
                                        required
                                        fullWidth
                                        autoFocus
                                        autoComplete="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        disabled={processing}
                                        placeholder="Full name"
                                        error={!!errors.name}
                                        helperText={errors.name}
                                        variant="outlined"
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <TextField
                                        label="Email address"
                                        type="email"
                                        required
                                        fullWidth
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        disabled={processing}
                                        placeholder="email@example.com"
                                        error={!!errors.email}
                                        helperText={errors.email}
                                        variant="outlined"
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <TextField
                                        label="Domain Name"
                                        type="text"
                                        required
                                        fullWidth
                                        autoComplete="domain_name"
                                        value={data.domain_name}
                                        onChange={(e) => setData('domain_name', e.target.value)}
                                        disabled={processing}
                                        placeholder="example"
                                        error={!!errors.domain_name}
                                        helperText={errors.domain_name}
                                        variant="outlined"
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <TextField
                                        label="Password"
                                        type="password"
                                        required
                                        fullWidth
                                        autoComplete="new-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        disabled={processing}
                                        placeholder="Password"
                                        error={!!errors.password}
                                        helperText={errors.password}
                                        variant="outlined"
                                    />
                                </div>

                                <div style={{ marginBottom: '2rem' }}>
                                    <TextField
                                        label="Confirm Password"
                                        type="password"
                                        required
                                        fullWidth
                                        autoComplete="new-password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        disabled={processing}
                                        placeholder="Confirm password"
                                        error={!!errors.password_confirmation}
                                        helperText={errors.password_confirmation}
                                        variant="outlined"
                                    />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <Button type="submit" variant="contained" color="primary" disabled={processing} fullWidth>
                                        {processing && <CircularProgress size={24} style={{ marginRight: '10px' }} />}
                                        Create Tenant
                                    </Button>
                                </div>

                                {recentlySuccessful && (
                                    <Alert variant="filled" severity="success" style={{ marginTop: '1rem' }}>
                                        Tenant created successfully.
                                    </Alert>
                                )}
                            </form>
                        </Box>
                    </Container>
                </div>
            </div>
        </>
    );
};

export default Register;
