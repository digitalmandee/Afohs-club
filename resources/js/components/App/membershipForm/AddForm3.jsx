import React from 'react';

export default function AddForm3({ memberTypesData }) {
    return (
        <div className="min-vh-100 bg-danger text-white p-4">
            <pre>{JSON.stringify(memberTypesData, null, 2)}</pre>
        </div>
    );
}
