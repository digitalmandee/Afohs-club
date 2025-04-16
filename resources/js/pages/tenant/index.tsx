import { Head, router, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

type RegisterForm = {
    name: string;
    email: string;
    domain_name: string;
    password: string;
    password_confirmation: string;
};

type Tenants = {
    name: string;
    email: string;
    domain_name: string;
    domains: { domain: string }[];
    password: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tenants',
        href: '/tenants',
    },
];

export default function Index({ tenants }: { tenants: Tenants[] }) {
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
            <Head title="Tenants" />

            <div>
                <div className="flex justify-end p-4">
                    <Button onClick={() => router.visit(route('tenant.create'))}>Create Tenant</Button>
                </div>

                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                    <table className="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
                        <thead className="bg-gray-50 text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Name
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Email
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Domain
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {tenants.length === 0 ? (
                                <tr className="border-b border-gray-200 odd:bg-white even:bg-gray-50 dark:border-gray-700 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                    <td className="px-6 py-4 text-center" colSpan={4}>
                                        No tenants found.
                                    </td>
                                </tr>
                            ) : (
                                tenants.map((tenant) => (
                                    <tr className="border-b border-gray-200 odd:bg-white even:bg-gray-50 dark:border-gray-700 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th scope="row" className="px-6 py-4 font-medium whitespace-nowrap text-gray-900 dark:text-white">
                                            {tenant.name}
                                        </th>
                                        <td className="px-6 py-4">{tenant.email}</td>
                                        <td className="px-6 py-4">{tenant.domains.map((domain) => domain.domain).join(', ')}</td>
                                        <td className="px-6 py-4">
                                            <a href="#" className="font-medium text-blue-600 hover:underline dark:text-blue-500">
                                                Edit
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
