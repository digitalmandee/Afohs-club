import React, { useState } from 'react';
import { Typography, Button, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper, InputAdornment, TextField } from '@mui/material';
import { Search, FilterAlt } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import { router } from '@inertiajs/react';
import AppliedMemberInvoice from './AppliedMemberInvoice';
import AppliedMemberForm from './AppliedMemberForm';
import AppliedMemberFilter from './AppliedMemberFilter';
import dayjs from 'dayjs';

const AppliedMember = ({ familyGroups = [], memberData = null, mode = 'list' }) => {
    const [open, setOpen] = useState(true);
    const [openInvoiceModal, setOpenInvoiceModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const formatCnic = (cnic) => {
        if (!cnic || cnic.length !== 13) return 'N/A';
        return `${cnic.slice(0, 5)}- ${cnic.slice(5, 12)}- ${cnic.slice(12)}`;
    };

    const handleViewInvoice = (member) => {
        if (member.invoice) {
            // Attach member details to invoice object for the modal
            const invoiceWithMember = {
                ...member.invoice,
                invoiceable: member,
            };
            setSelectedInvoice(invoiceWithMember);
            setOpenInvoiceModal(true);
        } else {
            alert('No invoice found for this member.');
        }
    };

    return (
        <>
            {/* <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                    backgroundColor: '#F6F6F6',
                }}
            > */}
            <div className="container-fluid p-4" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
                {mode === 'create' || mode === 'edit' ? (
                    <AppliedMemberForm memberData={memberData} />
                ) : (
                    <>
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <Typography sx={{ marginLeft: '10px', fontWeight: 700, color: '#063455', fontSize: '30px' }}>Applied Member</Typography>
                                {/* <pre>{JSON.stringify(familyGroups, null, 2)}</pre> */}
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <Button
                                    variant="outlined"
                                    onClick={() => router.get(route('applied-member.trashed'))}
                                    sx={{
                                        color: '#d32f2f',
                                        borderColor: '#d32f2f',
                                        borderRadius:'16px',
                                        '&:hover': {
                                            backgroundColor: '#ffebee',
                                            borderColor: '#d32f2f',
                                        },
                                    }}
                                >
                                    Deleted Applied Members
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<span style={{ fontSize: '1.5rem', marginBottom:5 }}>+</span>}
                                    style={{
                                        backgroundColor: '#063455',
                                        textTransform: 'none',
                                        borderRadius: '4px',
                                        height: 40,
                                        width: 200,
                                        borderRadius:'16px',
                                    }}
                                    onClick={() => router.visit(route('applied-member.index'), { data: { mode: 'create' } })}
                                >
                                    Add Applied Member
                                </Button>
                            </div>
                        </div>

                        <div className="mb-4 mt-5">
                            <AppliedMemberFilter open={true} />

                            <div style={{ overflowX: 'auto', width: '100%' }}>
                                <TableContainer component={Paper} style={{ boxShadow: 'none', minWidth: '1000px', borderRadius:'16px' }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow style={{ backgroundColor: '#063455', height: '60px' }}>
                                                <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>ID</TableCell>
                                                <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Name</TableCell>
                                                <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Email</TableCell>
                                                <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Phone Number</TableCell>
                                                <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Address</TableCell>
                                                <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>CNIC</TableCell>
                                                <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Amount Paid</TableCell>
                                                <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Start Date</TableCell>
                                                <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>End Date</TableCell>
                                                <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Invoice</TableCell>
                                                <TableCell sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {familyGroups.map((member, index) => (
                                                <TableRow key={member.id} style={{ borderBottom: '1px solid #eee' }}>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{member.id}</TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{member.name}</TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{member.email}</TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{member.phone_number || 'N/A'}</TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{member.address || 'N/A'}</TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{member.cnic}</TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{member.amount_paid}</TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{member.start_date ? dayjs(member.start_date).format('DD-MM-YYYY') : 'N/A'}</TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{member.end_date ? dayjs(member.end_date).format('DD-MM-YYYY') : 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <Button variant="text" onClick={() => handleViewInvoice(member)}>
                                                            View
                                                        </Button>
                                                    </TableCell>
                                                    {member.is_permanent_member ? (
                                                        <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>Permanent Member</TableCell>
                                                    ) : (
                                                        <TableCell>
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                <Button
                                                                    variant="text"
                                                                    disabled={member.is_permanent_member}
                                                                    onClick={() =>
                                                                        router.visit(route('applied-member.index'), {
                                                                            data: { mode: 'edit', id: member.id },
                                                                        })
                                                                    }
                                                                >
                                                                    Edit
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </div>
                        </div>
                    </>
                )}
                <AppliedMemberInvoice open={openInvoiceModal} onClose={() => setOpenInvoiceModal(false)} invoice={selectedInvoice} />
            </div>
            {/* </div> */}
        </>
    );
};

export default AppliedMember;
