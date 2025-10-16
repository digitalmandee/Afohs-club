import React, { useState } from 'react';
import { Typography, Button, TextField, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper, IconButton, Avatar, InputAdornment, Box } from '@mui/material';
import { Search, FilterAlt, ExpandMore, ExpandLess } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import FamilyFilter from './Family/Filter';
import MembershipCardComponent from './UserCard';
import { router } from '@inertiajs/react';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const FamilyMembersArchive = ({ familyGroups }) => {
    const [open, setOpen] = useState(true);
    const [expandedRow, setExpandedRow] = useState(null);
    const [openCardModal, setOpenCardModal] = useState(false);
    const [selectMember, setSelectMember] = useState(null);

    const calculateAge = (dob) => {
        if (!dob) return null;
        const birthDate = new Date(dob);
        const ageDiffMs = Date.now() - birthDate.getTime();
        return Math.floor(ageDiffMs / (365.25 * 24 * 60 * 60 * 1000));
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
                    {/* Header */}
                    {/* <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <Typography sx={{ marginLeft: '10px', fontWeight: 500, color: '#063455', fontSize: '30px' }}>
                                Family Members Archive
                            </Typography>
                        </div>
                    </div> */}

                    {/* Recently Joined Section */}
                    <div className="mx-0">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <Typography style={{ fontWeight: 500, fontSize: '24px', color: '#000000' }}>Family Members Archive</Typography>
                        </div>

                        {/* Filter */}
                        <FamilyFilter />

                        {/* Members Table */}
                        <TableContainer component={Paper} style={{ boxShadow: 'none' }}>
                            <Table>
                                <TableHead>
                                    <TableRow style={{ backgroundColor: '#E5E5EA', height: '40px' }}>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Card No</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Name</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Member Name</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Age</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Relationship</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Cnic</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Phone Number</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Date of Birth</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Card Issue Date</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Card Status</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Status</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Card</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {familyGroups.data.map((user, index) => (
                                        <React.Fragment key={user.id}>
                                            <TableRow style={{ borderBottom: '1px solid #eee' }}>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.membership_no}</TableCell>
                                                <TableCell>
                                                    <Typography sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.full_name}</Typography>
                                                    <Typography sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.personal_email}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.parent.full_name}</TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{calculateAge(user.date_of_birth) ?? 'N/A'}</TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.relation}</TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.cnic_no}</TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.mobile_number_a}</TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : 'N/A'}</TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.card_issue_date || 'N/A'}</TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.card_status || 'N/A'}</TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.status || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        style={{
                                                            color: '#0C67AA',
                                                            textDecoration: 'underline',
                                                            textTransform: 'none',
                                                        }}
                                                        onClick={() => {
                                                            setSelectMember(user);
                                                            setOpenCardModal(true);
                                                        }}
                                                    >
                                                        View
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    ))}
                                </TableBody>
                            </Table>

                            <Box display="flex" justifyContent="center" mt={2}>
                                {familyGroups.links?.map((link, index) => (
                                    <Button
                                        key={index}
                                        onClick={() => link.url && router.visit(link.url)}
                                        disabled={!link.url}
                                        variant={link.active ? 'contained' : 'outlined'}
                                        size="small"
                                        style={{
                                            margin: '0 5px',
                                            minWidth: '36px',
                                            padding: '6px 10px',
                                            fontWeight: link.active ? 'bold' : 'normal',
                                            backgroundColor: link.active ? '#333' : '#fff',
                                        }}
                                    >
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    </Button>
                                ))}
                            </Box>
                        </TableContainer>
                    </div>
                </div>
            </div>

            {/* Member Details Modal */}
            <MembershipCardComponent 
                open={openCardModal} 
                onClose={() => setOpenCardModal(false)} 
                member={selectMember} 
                memberData={familyGroups} 
            />
        </>
    );
};

export default FamilyMembersArchive;
