import { Head } from '@inertiajs/react';
import CreateTransaction from '@/components/App/Transactions/Create';

export default function TransactionCreate({ subscriptionTypes = [], subscriptionCategories = [] }) {
    return (
        <>
            <Head title="Create Transaction" />

            <div
                style={{
                    backgroundColor: '#f5f5f5',
                    minHeight: '100vh',
                }}
            >
                <CreateTransaction subscriptionTypes={subscriptionTypes} subscriptionCategories={subscriptionCategories} />
            </div>
        </>
    );
}
