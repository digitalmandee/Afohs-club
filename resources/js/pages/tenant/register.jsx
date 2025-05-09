import SideNav from '@/components/App/AdminSideBar/SideNav';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, Typography } from '@mui/material';
import { Col, Container, Form, Row, Spinner } from 'react-bootstrap';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const Register = () => {
    const [open, setOpen] = useState(false);
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
                                <Typography style={{ color: '#3F4E4F', fontWeight: 500, fontSize: '30px' }}>Tenant Registration</Typography>
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
                            <Form onSubmit={submit}>
                                <Form.Group className="mb-3" controlId="name">
                                    <Label>Name</Label>
                                    <Input
                                        type="text"
                                        required
                                        autoFocus
                                        autoComplete="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        disabled={processing}
                                        placeholder="Full name"
                                    />
                                    <InputError message={errors.name} />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="email">
                                    <Label>Email address</Label>
                                    <Input
                                        type="email"
                                        required
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        disabled={processing}
                                        placeholder="email@example.com"
                                    />
                                    <InputError message={errors.email} />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="domain_name">
                                    <Label>Domain Name</Label>
                                    <Input
                                        type="text"
                                        required
                                        autoComplete="domain_name"
                                        value={data.domain_name}
                                        onChange={(e) => setData('domain_name', e.target.value)}
                                        disabled={processing}
                                        placeholder="example"
                                    />
                                    <InputError message={errors.domain_name} />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="password">
                                    <Label>Password</Label>
                                    <Input
                                        type="password"
                                        required
                                        autoComplete="new-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        disabled={processing}
                                        placeholder="Password"
                                    />
                                    <InputError message={errors.password} />
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="password_confirmation">
                                    <Label>Confirm Password</Label>
                                    <Input
                                        type="password"
                                        required
                                        autoComplete="new-password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        disabled={processing}
                                        placeholder="Confirm password"
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </Form.Group>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <Button type="submit" disabled={processing}>
                                        {processing && <Spinner animation="border" role="status" size="sm" className="me-2" />}
                                        Create Tenant
                                    </Button>
                                    {recentlySuccessful && (
                                        <Alert variant="success" style={{ padding: '0.25rem 0.75rem', marginBottom: 0 }}>
                                            Tenant created successfully.
                                        </Alert>
                                    )}
                                </div>
                            </Form>
                        </div>
                    </Container>
                </div>
            </div>
        </>
    );
};

export default Register;
