import { useState } from 'react';
import { Typography, Button, Card, CardContent, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, InputAdornment } from '@mui/material';
import { Search, FilterAlt, People, CreditCard } from '@mui/icons-material';
import PrintIcon from '@mui/icons-material/Print';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router } from '@inertiajs/react';
import TransactionFilter from './Filter';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const Transaction = () => {
    // Modal state
    const [open, setOpen] = useState(true);
    const [openFilterModal, setOpenFilterModal] = useState(false);

    // Sample data
    const members = [
        {
            id: 'AFOHS-1235',
            name: 'Zahid Ullah',
            category: 'GYM',
            type: 'Cash',
            amount: '5000',
            date: 'Jul 10-2027',
            contact: '0987654321',
            added_by: 'Admin',
            invoice: 'View',
        },
        {
            id: 'AFOHS-1235',
            name: 'Zahid Ullah',
            category: 'GYM',
            type: 'Cash',
            amount: '5000',
            date: 'Jul 10-2027',
            contact: '0987654321',
            added_by: 'Admin',
            invoice: 'View',
        },
        {
            id: 'AFOHS-1235',
            name: 'Zahid Ullah',
            category: 'GYM',
            type: 'Cash',
            amount: '5000',
            date: 'Jul 10-2027',
            contact: '0987654321',
            added_by: 'Admin',
            invoice: 'View',
        },
        {
            id: 'AFOHS-1235',
            name: 'Zahid Ullah',
            category: 'GYM',
            type: 'Cash',
            amount: '5000',
            date: 'Jul 10-2027',
            contact: '0987654321',
            added_by: 'Admin',
            invoice: 'View',
        },
        {
            id: 'AFOHS-1235',
            name: 'Zahid Ullah',
            category: 'GYM',
            type: 'Cash',
            amount: '5000',
            date: 'Jul 10-2027',
            contact: '0987654321',
            added_by: 'Admin',
            invoice: 'View',
        },
    ];

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
                    {/* Recently Joined Section */}
                    <div className="mx-0">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <Typography style={{ fontWeight: 500, fontSize: '30px', color: '#3F4E4F' }}>Transaction</Typography>
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
                                        border: '1px solid #3F4E4F',
                                        color: '#333',
                                        textTransform: 'none',
                                        backgroundColor: 'transparent',
                                        marginRight: 10,
                                    }}
                                    onClick={() => {
                                        setOpenFilterModal(true); // open the modal
                                    }}
                                >
                                    Filter
                                </Button>

                                <Button
                                    variant="contained"
                                    startIcon={<PrintIcon />}
                                    sx={{
                                        backgroundColor: '#003366',
                                        textTransform: 'none',
                                        color: 'white',
                                    }}
                                >
                                    Print
                                </Button>
                            </div>
                        </div>

                        {/* Members Table */}
                        <TableContainer component={Paper} style={{ boxShadow: 'none' }}>
                            <Table>
                                <TableHead>
                                    <TableRow style={{ backgroundColor: '#E5E5EA', height: '60px' }}>
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Invoice ID</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Member</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Category</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Payment Type</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Amount</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Date</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Contact</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Added By</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Invoice</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {members.map((member) => (
                                        <TableRow key={member.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <TableCell
                                                sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', cursor: 'pointer' }}
                                                onClick={() => {
                                                    setSelectMember(member); // save the clicked member
                                                    setOpenProfileModal(true); // open the modal
                                                }}
                                            >
                                                {member.id}
                                            </TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{member.name}</TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{member.category}</TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{member.type}</TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{member.amount}</TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{member.date}</TableCell>
                                            <TableCell
                                                style={{
                                                    color: '#7F7F7F',
                                                    fontWeight: 500,
                                                    fontSize: '14px',
                                                }}
                                            >
                                                {member.contact}
                                            </TableCell>
                                            <TableCell
                                                style={{
                                                    color: '#7F7F7F',
                                                    fontWeight: 500,
                                                    fontSize: '14px',
                                                }}
                                            >
                                                {member.added_by}
                                            </TableCell>

                                            <TableCell>
                                                <span
                                                    style={{
                                                        background: '#063455',
                                                        color: '#FFFFFF',
                                                        // textDecoration: "underline",
                                                        cursor: 'pointer',
                                                        padding: 10,
                                                    }}
                                                    onClick={() => setOpenCardModal(true)}
                                                >
                                                    {member.invoice}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                    <TransactionFilter open={openFilterModal} onClose={() => setOpenFilterModal(false)} />
                </div>
            </div>
        </>
    );
};

export default Transaction;
