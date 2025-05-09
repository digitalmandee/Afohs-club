import SideNav from '@/components/App/AdminSideBar/SideNav';
import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Transition } from '@headlessui/react';
import { Typography } from '@mui/material';
import { Col, Row } from 'react-bootstrap';

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
                className="transition-all duration-300"
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    marginTop: '5rem',
                }}
            >
                <div className="mx-auto max-w-2xl px-4 py-6">
                    <Row className="align-items-center mb-4">
                        <Col>
                            <Typography style={{ color: '#3F4E4F', fontWeight: 500, fontSize: '30px' }}>Tenant Registration</Typography>
                        </Col>
                    </Row>
                    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    autoComplete="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    disabled={processing}
                                    placeholder="Full name"
                                />
                                <InputError className="mt-2" message={errors.name} />
                            </div>

                            <div>
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    disabled={processing}
                                    placeholder="email@example.com"
                                />
                                <InputError className="mt-2" message={errors.email} />
                            </div>

                            <div>
                                <Label htmlFor="domain_name">Domain Name</Label>
                                <Input
                                    id="domain_name"
                                    type="text"
                                    required
                                    autoComplete="domain_name"
                                    value={data.domain_name}
                                    onChange={(e) => setData('domain_name', e.target.value)}
                                    disabled={processing}
                                    placeholder="example"
                                />
                                <InputError className="mt-2" message={errors.domain_name} />
                            </div>

                            <div>
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    disabled={processing}
                                    placeholder="Password"
                                />
                                <InputError className="mt-2" message={errors.password} />
                            </div>

                            <div>
                                <Label htmlFor="password_confirmation">Confirm Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    disabled={processing}
                                    placeholder="Confirm password"
                                />
                                <InputError className="mt-2" message={errors.password_confirmation} />
                            </div>

                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing && <LoaderCircle className="mr-2 inline h-4 w-4 animate-spin" />}
                                    Create Tenant
                                </Button>
                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition-opacity duration-300"
                                    enterFrom="opacity-0"
                                    leave="transition-opacity duration-300"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-green-600 dark:text-green-400">Tenant created successfully.</p>
                                </Transition>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Register;
