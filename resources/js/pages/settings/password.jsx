import SideNav from '@/components/App/AdminSideBar/SideNav';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

import { Alert, Box, Button, TextField, Typography } from '@mui/material'; // MUI components
import { Col, Container, Row } from 'react-bootstrap'; // Bootstrap Grid System

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const Password = () => {
    const [open, setOpen] = useState(true);
    const passwordInput = useRef(null);
    const currentPasswordInput = useRef(null);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    marginTop: '5rem',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '80vh',
                }}
            >
                <Container style={{ maxWidth: '600px', padding: '2rem' }}>
                    <Row className="align-items-center mb-4">
                        <Col>
                            <Typography variant="h4" style={{ color: '#3F4E4F', fontWeight: 500 }}>
                                Password
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
                        <header>
                            <h3>Update Password</h3>
                            <p>Ensure your account is using a long, random password to stay secure.</p>
                        </header>

                        <form onSubmit={updatePassword} style={{ marginTop: '1.5rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <TextField
                                    id="current_password"
                                    label="Current Password"
                                    ref={currentPasswordInput}
                                    type="password"
                                    value={data.current_password}
                                    onChange={(e) => setData('current_password', e.target.value)}
                                    autoComplete="current-password"
                                    fullWidth
                                    error={!!errors.current_password}
                                    helperText={errors.current_password}
                                    variant="outlined"
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <TextField
                                    id="password"
                                    label="New Password"
                                    ref={passwordInput}
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="new-password"
                                    fullWidth
                                    error={!!errors.password}
                                    helperText={errors.password}
                                    variant="outlined"
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <TextField
                                    id="password_confirmation"
                                    label="Confirm Password"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    autoComplete="new-password"
                                    fullWidth
                                    error={!!errors.password_confirmation}
                                    helperText={errors.password_confirmation}
                                    variant="outlined"
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Button type="submit" variant="contained" color="primary" disabled={processing}>
                                    Save Password
                                </Button>
                                {recentlySuccessful && (
                                    <Alert variant="filled" severity="success" style={{ padding: '0.25rem 0.75rem', marginBottom: 0 }}>
                                        Saved
                                    </Alert>
                                )}
                            </div>
                        </form>
                    </Box>
                </Container>
            </div>
        </>
    );
};

export default Password;
