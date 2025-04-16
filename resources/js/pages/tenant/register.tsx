import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';

type RegisterForm = {
    name: string;
    email: string;
    domain_name: string;
    password: string;
    password_confirmation: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tenants',
        href: '/tenants',
    },
    {
        title: 'Add Tenant',
        href: '/tenant/register',
    },
];

export default function Register() {
    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        domain_name: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('tenant.store'), {
            // onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Register" />
            <form className="flex flex-col gap-6 p-4" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Full name"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="domain_name">Domain Name</Label>
                        <Input
                            id="domain_name"
                            type="text"
                            required
                            tabIndex={2}
                            autoComplete="domain_name"
                            value={data.domain_name}
                            onChange={(e) => setData('domain_name', e.target.value)}
                            disabled={processing}
                            placeholder="example"
                        />
                        <InputError message={errors.domain_name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Confirm password"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" className="mt-2 w-full" tabIndex={5} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Create tenant
                    </Button>
                    <Transition
                        show={recentlySuccessful}
                        enter="transition duration-300 ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition duration-300 ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-neutral-600">Saved</p>
                    </Transition>
                </div>
            </form>
        </AppLayout>
    );
}
