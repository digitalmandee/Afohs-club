import SideNav from '@/components/App/AdminSideBar/SideNav';
import InputError from '@/components/input-error';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Typography } from '@mui/material';
import { Col, Row } from 'react-bootstrap';

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
                className="transition-all duration-300"
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    marginTop: '5rem',
                }}
            >
                <div className="mx-auto max-w-2xl px-4 py-6">
                    <Row className="align-items-center mb-4">
                        <Col>
                            <Typography style={{ color: '#3F4E4F', fontWeight: 500, fontSize: '30px' }}>Password</Typography>
                        </Col>
                    </Row>
                    {/* Card Wrapper */}
                    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                        <HeadingSmall title="Update Password" description="Ensure your account is using a long, random password to stay secure." />

                        <form onSubmit={updatePassword} className="mt-6 space-y-6">
                            <div>
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
                                <InputError className="mt-2" message={errors.current_password} />
                            </div>

                            <div>
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
                                <InputError className="mt-2" message={errors.password} />
                            </div>

                            <div>
                                <Label htmlFor="password_confirmation">Confirm Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    autoComplete="new-password"
                                    placeholder="Confirm password"
                                />
                                <InputError className="mt-2" message={errors.password_confirmation} />
                            </div>

                            <div className="flex items-center gap-4">
                                <Button disabled={processing}>Save Password</Button>
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
                </div>
            </div>
        </>
    );
};

export default Password;
