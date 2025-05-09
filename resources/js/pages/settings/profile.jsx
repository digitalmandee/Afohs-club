import SideNav from '@/components/App/AdminSideBar/SideNav';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Typography } from '@mui/material';
import { Col, Row } from 'react-bootstrap';

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
                className="transition-all duration-300"
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    marginTop: '5rem',
                }}
            >
                <div className="mx-auto max-w-2xl px-4 py-6">
                    <Row className="align-items-center mb-4">
                        <Col>
                            <Typography style={{ color: '#3F4E4F', fontWeight: 500, fontSize: '30px' }}>Profile Information</Typography>
                        </Col>
                    </Row>
                    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    autoComplete="name"
                                    placeholder="Your full name"
                                    disabled={processing}
                                />
                                <InputError className="mt-2" message={errors.name} />
                            </div>

                            <div>
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    autoComplete="email"
                                    placeholder="your@email.com"
                                    disabled={processing}
                                />
                                <InputError className="mt-2" message={errors.email} />
                            </div>

                            {mustVerifyEmail && auth.user.email_verified_at === null && (
                                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="text-blue-600 underline dark:text-blue-400"
                                    >
                                        Click here to resend the verification email.
                                    </Link>
                                    {status === 'verification-link-sent' && (
                                        <p className="mt-2 text-green-600 dark:text-green-400">
                                            A new verification link has been sent to your email address.
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <Button disabled={processing}>Save</Button>
                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition-opacity duration-300"
                                    enterFrom="opacity-0"
                                    leave="transition-opacity duration-300"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-green-600 dark:text-green-400">Saved</p>
                                </Transition>
                            </div>
                        </form>
                    </div>
                    <div className="mt-8">
                        <DeleteUser />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;
