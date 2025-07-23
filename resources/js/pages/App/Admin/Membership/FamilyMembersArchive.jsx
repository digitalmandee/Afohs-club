import React, { useState } from 'react';
import { Typography, Button, TextField, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper, IconButton, Avatar, InputAdornment } from '@mui/material';
import { Search, FilterAlt, ExpandMore, ExpandLess } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideNav from '@/components/App/AdminSideBar/SideNav';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const FamilyMembersArchive = ({ familyGroups = [] }) => {
    const [open, setOpen] = useState(true);
    const [openFilterModal, setOpenFilterModal] = useState(false);
    const [expandedRow, setExpandedRow] = useState(null);

    const toggleRow = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
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

                            <div className="d-flex">
                                <TextField
                                    placeholder="Search by name, member type etc"
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

                        {/* Members Table */}
                        <TableContainer component={Paper} style={{ boxShadow: 'none' }}>
                            <Table>
                                <TableHead>
                                    <TableRow style={{ backgroundColor: '#E5E5EA', height: '60px' }}>
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Membership ID</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Member</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Member Type</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Phone Number</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Family Members</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {familyGroups.map((user, index) => (
                                        <React.Fragment key={user.id}>
                                            <TableRow style={{ borderBottom: '1px solid #eee' }}>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.member.membership_no}</TableCell>
                                                <TableCell>
                                                    <div className="d-flex align-items-center">
                                                        <Avatar src={user.profile_photo || '/placeholder.svg?height=40&width=40'} alt={user.name} style={{ marginRight: '10px' }} />
                                                        <div>
                                                            <Typography sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.first_name}</Typography>
                                                            <Typography sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.email}</Typography>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.member_type?.name || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <Typography sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.phone_number || 'N/A'}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="d-flex align-items-center">
                                                        <Typography sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.family_members.length}</Typography>
                                                        {user.family_members.length > 0 && (
                                                            <IconButton size="small" onClick={() => toggleRow(user.id)}>
                                                                {expandedRow === user.id ? <ExpandLess /> : <ExpandMore />}
                                                            </IconButton>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>

                                            {/* Collapsible Family Members */}
                                            {user.family_members.length > 0 && expandedRow === user.id && (
                                                <TableRow>
                                                    <TableCell colSpan={5} style={{ backgroundColor: '#f9f9f9', padding: 0 }}>
                                                        <Table size="small">
                                                            <TableHead>
                                                                <TableRow style={{ backgroundColor: '#f0f0f0', height: '50px' }}>
                                                                    <TableCell sx={{ fontWeight: 500, fontSize: '16px' }}>Membership ID</TableCell>
                                                                    <TableCell sx={{ fontWeight: 500, fontSize: '16px' }}>Member</TableCell>
                                                                    <TableCell sx={{ fontWeight: 500, fontSize: '16px' }}>Member Type</TableCell>
                                                                    <TableCell sx={{ fontWeight: 500, fontSize: '16px' }}>Phone Number</TableCell>
                                                                    <TableCell sx={{ fontWeight: 500, fontSize: '16px' }}>Parent ID</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {user.family_members.map((fm, subIndex) => (
                                                                    <TableRow key={fm.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                                        <TableCell sx={{ fontSize: '14px', color: '#555' }}>{`${index + 1}.${subIndex + 1}`}</TableCell>
                                                                        <TableCell>
                                                                            <div className="d-flex align-items-center">
                                                                                <Avatar src={fm.profile_photo || '/placeholder.svg?height=40&width=40'} alt={fm.first_name} style={{ marginRight: '10px' }} />
                                                                                <div>
                                                                                    <Typography sx={{ fontSize: '14px', color: '#555' }}>{fm.first_name}</Typography>
                                                                                    <Typography sx={{ fontSize: '14px', color: '#777' }}>{fm.email}</Typography>
                                                                                </div>
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell sx={{ fontSize: '14px', color: '#555' }}>{user.member_type?.name || 'N/Aa'}</TableCell>
                                                                        <TableCell sx={{ fontSize: '14px', color: '#555' }}>{fm.phone_number || 'N/A'}</TableCell>
                                                                        <TableCell sx={{ fontSize: '14px', color: '#555' }}>{fm.parent_user_id || 'N/A'}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FamilyMembersArchive;
