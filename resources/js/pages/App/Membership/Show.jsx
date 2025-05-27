import React from 'react';
import { Head } from '@inertiajs/react';

export default function MemberProfile({ user }) {
    const fullName = `${user.first_name} ${user.middle_name ?? ''} ${user.last_name ?? ''}`.trim();

    return (
        <>
            <Head title="Member Profile" />
            <div className="container mx-auto p-4">
                <h2 className="text-2xl font-semibold mb-4">Member Profile</h2>

                <div className="space-y-2">
                    <p>
                        <strong>Name:</strong> {fullName}
                    </p>
                    <p>
                        <strong>Email:</strong> {user.email}
                    </p>
                    <p>
                        <strong>Phone:</strong> {user.phone_number}
                    </p>

                    {user.member && (
                        <>
                            <p>
                                <strong>Membership Number:</strong> {user.member.membership_number}
                            </p>
                            <p>
                                <strong>Member Type:</strong> {user.member.member_type?.name || 'N/A'}
                            </p>

                            {user.member.qr_code && (
                                <div>
                                    <p>
                                        <strong>QR Code:</strong>
                                    </p>
                                    <img src={`/storage/${user.member.qr_code}`} alt="QR Code" className="w-48 h-auto" />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
