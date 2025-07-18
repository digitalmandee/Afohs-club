import React, { useState } from 'react';
import {
    Typography, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Paper, InputAdornment,
    TextField
} from '@mui/material';
import { Search, FilterAlt } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router } from '@inertiajs/react';
import AppliedMemberForm from './AppliedMemberForm';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const AppliedMember = ({ familyGroups = [], memberData = null, mode = 'list' }) => {
    const [open, setOpen] = useState(true);
    const [openFilterModal, setOpenFilterModal] = useState(false);
    console.log('familyGroups', familyGroups);

    const formatCnic = (cnic) => {
        if (!cnic || cnic.length !== 13) return 'N/A';
        return `${cnic.slice(0, 5)}- ${cnic.slice(5, 12)}- ${cnic.slice(12)}`;
    };
    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                    backgroundColor: '#F6F6F6',
                }}
            >
                <div className="container-fluid p-4" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
                    {mode === 'create' || mode === 'edit' ? (
                        <AppliedMemberForm memberData={memberData} />
                    ) : (
                        <>
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    <Typography sx={{ marginLeft: '10px', fontWeight: 500, color: '#063455', fontSize: '30px' }}>
                                        Applied Member
                                    </Typography>
                                    {/* <pre>{JSON.stringify(familyGroups, null, 2)}</pre> */}
                                </div>
                                <Button
                                    variant="contained"
                                    startIcon={<span>+</span>}
                                    style={{
                                        backgroundColor: '#063455',
                                        textTransform: 'none',
                                        borderRadius: '4px',
                                        height: 40,
                                        width: 200,
                                    }}
                                    onClick={() => router.visit(route('applied-member.index'), { data: { mode: 'create' } })}
                                >
                                    Add Applied Member
                                </Button>
                            </div>

                            <div className="mb-4 mt-5">
                                <div className="d-flex justify-content-end align-items-center mb-3">
                                    <div className="d-flex">
                                        <TextField
                                            placeholder="Search by name, email, etc."
                                            variant="outlined"
                                            size="small"
                                            style={{ width: '350px', marginRight: '10px' }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Search />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <Button
                                            variant="outlined"
                                            startIcon={<FilterAlt />}
                                            style={{
                                                border: '1px solid #063455',
                                                color: '#333',
                                                textTransform: 'none',
                                                backgroundColor: 'transparent',
                                            }}
                                            onClick={() => setOpenFilterModal(true)}
                                        >
                                            Filter
                                        </Button>
                                    </div>
                                </div>

                                <div style={{ overflowX: 'auto', width: '100%' }}>
                                    <TableContainer component={Paper} style={{ boxShadow: 'none', minWidth: '1000px' }}>
                                        <Table>
                                            <TableHead>
                                                <TableRow style={{ backgroundColor: '#E5E5EA', height: '60px' }}>
                                                    <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Member ID</TableCell>
                                                    <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Name</TableCell>
                                                    <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Email</TableCell>
                                                    <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Phone Number</TableCell>
                                                    <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Address</TableCell>
                                                    <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>CNIC</TableCell>
                                                    <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Amount Paid</TableCell>
                                                    <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Start Date</TableCell>
                                                    <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>End Date</TableCell>
                                                    <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {familyGroups.map((member, index) => (
                                                    <TableRow key={member.id} style={{ borderBottom: '1px solid #eee' }}>
                                                        <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                            {member.member_id}
                                                        </TableCell>
                                                        <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                            {member.name}
                                                        </TableCell>
                                                        <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                            {member.email}
                                                        </TableCell>
                                                        <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                            {member.phone_number || 'N/A'}
                                                        </TableCell>
                                                        <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                            {member.address || 'N/A'}
                                                        </TableCell>
                                                        <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                            {member.cnic ? formatCnic(member.cnic) : 'N/A'}
                                                        </TableCell>
                                                        <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                            {member.amount_paid}
                                                        </TableCell>
                                                        <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                            {member.start_date}
                                                        </TableCell>
                                                        <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                            {member.end_date}
                                                        </TableCell>
                                                        {member.is_permanent_member ? (
                                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                                Permanent Member
                                                            </TableCell>
                                                        ) : (
                                                            <TableCell>
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
                </div>
            </div>
        </>
    );
};

export default AppliedMember;
