import { useState } from 'react';
import { Typography, Button, Card, CardContent, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, InputAdornment, Pagination } from '@mui/material';
import { Search, FilterAlt, People, CreditCard } from '@mui/icons-material';
import PrintIcon from '@mui/icons-material/Print';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router } from '@inertiajs/react';
import TransactionFilter from './Filter';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const Transaction = ({ FinancialData }) => {
    // Modal state
    const [open, setOpen] = useState(true);
    const [openFilterModal, setOpenFilterModal] = useState(false);
    const [page, setPage] = useState(1);
    const rowsPerPage = 6;

    console.log("FinancialData", FinancialData);

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

    // Calculate total pages
    const totalPages = Math.ceil((FinancialData || []).length / rowsPerPage);

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
                <div className="container-fluid p-4" style={{ backgroundColor: '#f5f5f5', minHeight: 'auto' }}>
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
                                    {(FinancialData || []).slice((page - 1) * rowsPerPage, page * rowsPerPage).map((member) => (
                                        <TableRow key={member.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <TableCell
                                                sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', cursor: 'pointer' }}
                                                onClick={() => {
                                                    setSelectMember(member); // save the clicked member
                                                    setOpenProfileModal(true); // open the modal
                                                }}
                                            >
                                                {member.invoice_no}
                                            </TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{member.member_id}</TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{member.subscription_type}</TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{member.payment_method.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}</TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{member.amount}</TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}> {new Date(member.payment_date).toLocaleDateString()}</TableCell>
                                            <TableCell
                                                style={{
                                                    color: '#7F7F7F',
                                                    fontWeight: 500,
                                                    fontSize: '14px',
                                                }}
                                            >
                                                {member.user?.phone_number}
                                            </TableCell>
                                            <TableCell
                                                style={{
                                                    color: '#7F7F7F',
                                                    fontWeight: 500,
                                                    fontSize: '14px',
                                                }}
                                            >
                                                {member.user?.name}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    style={{
                                                        color: "#0C67AA",
                                                        textDecoration: "underline",
                                                        cursor: "pointer"
                                                    }}
                                                    onClick={() => setOpenCardModal(true)}
                                                >
                                                    view
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={(event, value) => setPage(value)}
                                color="primary"
                            />
                        </div>
                    </div>
                    <TransactionFilter open={openFilterModal} onClose={() => setOpenFilterModal(false)} />
                </div>
            </div>
        </>
    );
};

export default Transaction;
