import SideNav from '@/components/App/AdminSideBar/SideNav';
import InputError from '@/components/input-error';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Typography } from '@mui/material';
import { Alert, Col, Container, Row } from 'react-bootstrap';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const Password = () => {
    const [open, setOpen] = useState(false);
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
                            <Typography style={{ color: '#3F4E4F', fontWeight: 500, fontSize: '30px' }}>Password</Typography>
                        </Col>
                    </Row>

                    <div
                        style={{
                            borderRadius: '20px',
                            border: '1px solid #ccc',
                            backgroundColor: '#fff',
                            padding: '2rem',
                            boxShadow: '0 0 10px rgba(0,0,0,0.05)',
                        }}
                    >
                        <HeadingSmall title="Update Password" description="Ensure your account is using a long, random password to stay secure." />

                        <form onSubmit={updatePassword} style={{ marginTop: '1.5rem' }}>
                            <div className="mb-3">
                                <Label htmlFor="current_password">Current Password</Label>
                                <Input
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    type="password"
                                    value={data.current_password}
                                    onChange={(e) => setData('current_password', e.target.value)}
                                    autoComplete="current-password"
                                    placeholder="Current password"
                                />
                                <InputError message={errors.current_password} />
                            </div>

                            <div className="mb-3">
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    ref={passwordInput}
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="new-password"
                                    placeholder="New password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="mb-4">
                                <Label htmlFor="password_confirmation">Confirm Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    autoComplete="new-password"
                                    placeholder="Confirm password"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Button type="submit" disabled={processing}>
                                    Save Password
                                </Button>
                                {recentlySuccessful && (
                                    <Alert variant="success" style={{ padding: '0.25rem 0.75rem', marginBottom: 0 }}>
                                        Saved
                                    </Alert>
                                )}
                            </div>
                        </form>
                    </div>
                </Container>
            </div>
        </>
    );
};

export default Password;
