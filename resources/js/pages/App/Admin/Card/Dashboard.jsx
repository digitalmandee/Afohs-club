import { useState } from 'react';
import { Typography, Button, Card, CardContent, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, InputAdornment } from '@mui/material';
import { Search, FilterAlt, People, CreditCard } from '@mui/icons-material';
import PrintIcon from '@mui/icons-material/Print';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router } from '@inertiajs/react';
import CardFilter from "./Filter";
import UserCardComponent from "./UserCard";
import SubscriptionFilter from '../Subscription/Filter';
import InvoiceSlip from '../Subscription/Invoice';
import SubscriptionCardComponent from '../Subscription/UserCard';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const CardsDashboard = ({ members = [] }) => {
    // Modal state
    const [open, setOpen] = useState(true);
    const [openInvoiceModal, setOpenInvoiceModal] = useState(false);
    const [openCardModal, setOpenCardModal] = useState(false);
    const [openFilterModal, setOpenFilterModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null); // New state for selected member
    console.log('membersData', members);

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
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <Typography sx={{ marginLeft: '10px', fontWeight: 500, color: '#3F4E4F', fontSize: '30px' }}>Card Dashboard</Typography>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="row mb-4 mt-4">
                        <div className="col-md-4 mb-3">
                            <Card style={{ backgroundColor: '#3F4E4F', color: 'white', height: '150px' }}>
                                <CardContent className="text-center py-4">
                                    <div className="mb-2">
                                        <Avatar style={{ backgroundColor: '#202728', margin: '0 auto' }}>
                                            <People />
                                        </Avatar>
                                    </div>
                                    <Typography sx={{ mt: 1, marginBottom: '5px', fontSize: '16px', fontWeight: 400, color: '#C6C6C6' }}>Total Active Member</Typography>
                                    <Typography sx={{ fontWeight: 700, fontSize: '24px', color: '#FFFFFF' }}>320</Typography>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="col-md-4 mb-3">
                            <Card style={{ backgroundColor: '#3F4E4F', color: 'white', height: '150px' }}>
                                <CardContent className="text-center py-4">
                                    <div className="mb-2">
                                        <Avatar style={{ backgroundColor: '#202728', margin: '0 auto' }}>
                                            <CreditCard />
                                        </Avatar>
                                    </div>
                                    <Typography sx={{ mt: 1, marginBottom: '5px', fontSize: '16px', fontWeight: 400, color: '#C6C6C6' }}>New Subscribers Today</Typography>
                                    <Typography sx={{ fontWeight: 700, fontSize: '24px', color: '#FFFFFF' }}>10</Typography>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="col-md-4 mb-3">
                            <Card style={{ backgroundColor: '#3F4E4F', color: 'white', height: '150px' }}>
                                <CardContent className="text-center py-4">
                                    <div className="mb-2">
                                        <Avatar style={{ backgroundColor: '#202728', margin: '0 auto' }}>
                                            <CreditCard />
                                        </Avatar>
                                    </div>
                                    <Typography sx={{ mt: 1, marginBottom: '5px', fontSize: '16px', fontWeight: 400, color: '#C6C6C6' }}>Total Revenue</Typography>
                                    <Typography sx={{ fontWeight: 700, fontSize: '24px', color: '#FFFFFF' }}>300,00</Typography>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Recently Joined Section */}
                    <div className="mx-0">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <Typography style={{ fontWeight: 500, fontSize: '24px', color: '#000000' }}>All Cards</Typography>
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
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Type</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Start Date</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Expiry</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Status</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Card</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {members.map((member) => (
                                        <TableRow key={member.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <TableCell
                                                sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', cursor: 'pointer' }}
                                                onClick={() => {
                                                    setSelectedMember(member); // save the clicked member
                                                    setOpenProfileModal(true); // open the modal
                                                }}
                                            >
                                                {member.user_id}
                                            </TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{member.first_name}</TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{member?.member?.member_type?.name || 'N/A'}</TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{member.type}</TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{member?.member?.card_issue_date}</TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{member?.member?.card_expiry_date}</TableCell>
                                            <TableCell>
                                                <span
                                                    style={{
                                                        color: member?.member?.card_status
                                                            === 'active' ? '#2e7d32' : member.member?.card_status
                                                                === 'inactive' ? '#FFA90B' : '#d32f2f',
                                                        fontWeight: 'medium',
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={(e) => showMemberDetails(member, e)}
                                                >
                                                    {member?.member?.card_status}
                                                    {member.status === 'inactive' && (
                                                        <img
                                                            src="/assets/system-expired.png"
                                                            alt=""
                                                            style={{
                                                                width: 25,
                                                                height: 25,
                                                                marginLeft: 2,
                                                                marginBottom: 5,
                                                            }}
                                                        />
                                                    )}
                                                </span>
                                            </TableCell>

                                            <TableCell>
                                                <Button
                                                    style={{ color: '#0C67AA', textDecoration: 'underline', textTransform: 'none' }}
                                                    onClick={() => {
                                                        setSelectedMember(member); // Set the selected member
                                                        setOpenCardModal(true); // Open the modal
                                                    }}
                                                >
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                    <CardFilter open={openFilterModal} onClose={() => setOpenFilterModal(false)} />
                    <SubscriptionCardComponent member={selectedMember} open={openCardModal} onClose={() => setOpenCardModal(false)} />

                    <UserCardComponent open={openCardModal} onClose={() => setOpenCardModal(false)} member={selectedMember} />

                    <SubscriptionFilter open={openFilterModal} onClose={() => setOpenFilterModal(false)} />

                    {/* <InvoiceSlip open={openInvoiceModal} onClose={() => setOpenInvoiceModal(false)} /> */}
                </div>
            </div>
        </>
    );
};

export default CardsDashboard;
