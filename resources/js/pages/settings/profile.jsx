import SideNav from '@/components/App/AdminSideBar/SideNav';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { Button, TextField, Typography } from '@mui/material'; // Using MUI Button
import { Col, Form, Row } from 'react-bootstrap';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const Profile = ({ mustVerifyEmail, status }) => {
    const [open, setOpen] = useState(false);
    const { auth } = usePage().props;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: auth.user.name,
        email: auth.user.email,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    marginTop: '5rem',
                    padding: '24px',
                }}
            >
                <div style={{ maxWidth: '768px', margin: '0 auto' }}>
                    <Row className="align-items-center mb-4">
                        <Col>
                            <Typography variant="h5" style={{ color: '#3F4E4F', fontWeight: 500 }}>
                                Profile Information
                            </Typography>
                        </Col>
                    </Row>

                    <div
                        style={{
                            borderRadius: '16px',
                            border: '1px solid #dee2e6',
                            backgroundColor: '#ffffff',
                            padding: '24px',
                        }}
                    >
                        <Form onSubmit={submit}>
                            <Form.Group className="mb-3">
                                <Typography htmlFor="name">Name</Typography>
                                <TextField
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    fullWidth
                                    autoComplete="name"
                                    placeholder="Your full name"
                                    disabled={processing}
                                    variant="outlined"
                                    margin="normal"
                                />
                                <InputError message={errors.name} />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Typography htmlFor="email">Email address</Typography>
                                <TextField
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    fullWidth
                                    autoComplete="email"
                                    placeholder="your@email.com"
                                    disabled={processing}
                                    variant="outlined"
                                    margin="normal"
                                />
                                <InputError message={errors.email} />
                            </Form.Group>

                            {mustVerifyEmail && auth.user.email_verified_at === null && (
                                <div style={{ fontSize: '14px', color: '#6c757d' }}>
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        style={{
                                            color: '#0d6efd',
                                            textDecoration: 'underline',
                                            background: 'none',
                                            border: 'none',
                                            padding: 0,
                                        }}
                                    >
                                        Click here to resend the verification email.
                                    </Link>
                                    {status === 'verification-link-sent' && (
                                        <p style={{ marginTop: '10px', color: '#198754' }}>
                                            A new verification link has been sent to your email address.
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="d-flex align-items-center mt-3 gap-3">
                                <Button variant="contained" disabled={processing}>
                                    Save
                                </Button>
                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition-opacity duration-300"
                                    enterFrom="opacity-0"
                                    leave="transition-opacity duration-300"
                                    leaveTo="opacity-0"
                                >
                                    <p style={{ fontSize: '14px', color: '#198754' }}>Saved</p>
                                </Transition>
                            </div>
                        </Form>
                    </div>

                    <div style={{ marginTop: '32px' }}>
                        <DeleteUser />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;
