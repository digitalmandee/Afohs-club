import { useState } from 'react';
import { Typography, Button, Card, CardContent, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, InputAdornment, Tooltip, Box, MenuItem, Tabs, Tab, CircularProgress, LinearProgress, Chip } from '@mui/material';
import { router } from '@inertiajs/react';
import { Search, FilterAlt, People, CreditCard, ExpandMore, ExpandLess } from '@mui/icons-material';
import PrintIcon from '@mui/icons-material/Print';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import CardFilter from './Filter';
import UserCardComponent from './UserCard';
import SubscriptionFilter from '../Subscription/Filter';
import SubscriptionCardComponent from '../Subscription/UserCard';
import MembershipCardComponent from '../Membership/UserCard';
import MembershipDashboardFilter from '../Membership/MembershipDashboardFilter';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const CardsDashboard = ({ members, total_active_members, total_active_family_members, filters, memberCategories }) => {
    // Modal state
    const [open, setOpen] = useState(true);
    const [openCardModal, setOpenCardModal] = useState(false);
    const [selectMember, setSelectMember] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [filteredMembers, setFilteredMembers] = useState(members.data);
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [activeTab, setActiveTab] = useState(
        filters?.member_type_filter === 'family' ? 1 : 0
    ); // 0 = Members, 1 = Family Members
    const [isLoading, setIsLoading] = useState(false);
    
    // Filter states
    const [filterValues, setFilterValues] = useState({
        card_status: filters?.card_status || 'all',
        status: filters?.status || 'all',
        member_category: filters?.member_category || 'all',
    });

    // Extract unique status and member type values from members
    const statusOptions = [
        { label: 'All type', value: 'all', icon: null },
        { label: 'Active', value: 'active', icon: null },
        { label: 'Suspended', value: 'suspended', icon: null },
        { label: 'Cancelled', value: 'cancelled', icon: null },
        { label: 'Pause', value: 'pause', icon: null },
    ];

    const memberTypeOptions = [
        { label: 'All types', value: 'all' },
        ...[...new Set(members.data.map((member) => member.member?.member_type?.name).filter((name) => name))].map((name) => ({
            label: name,
            value: name,
        })),
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
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <Typography sx={{ marginLeft: '10px', fontWeight: 500, color: '#063455', fontSize: '30px' }}>Card Dashboard</Typography>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="row mb-4 mt-4">
                        <div className="col-md-4 mb-3">
                            <Card style={{ backgroundColor: '#063455', color: 'white', height: '150px' }}>
                                <CardContent className="text-center py-4">
                                    <div className="mb-2">
                                        <Avatar style={{ backgroundColor: '#202728', margin: '0 auto' }}>
                                            <People />
                                        </Avatar>
                                    </div>
                                    <Typography sx={{ mt: 1, marginBottom: '5px', fontSize: '16px', fontWeight: 400, color: '#C6C6C6' }}>Total Active Members</Typography>
                                    <Typography sx={{ fontWeight: 700, fontSize: '24px', color: '#FFFFFF' }}>{total_active_members}</Typography>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="col-md-4 mb-3">
                            <Card style={{ backgroundColor: '#063455', color: 'white', height: '150px' }}>
                                <CardContent className="text-center py-4">
                                    <div className="mb-2">
                                        <Avatar style={{ backgroundColor: '#202728', margin: '0 auto' }}>
                                            <People />
                                        </Avatar>
                                    </div>
                                    <Typography sx={{ mt: 1, marginBottom: '5px', fontSize: '16px', fontWeight: 400, color: '#C6C6C6' }}>Active Family Members</Typography>
                                    <Typography sx={{ fontWeight: 700, fontSize: '24px', color: '#FFFFFF' }}>{total_active_family_members || 0}</Typography>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="col-md-4 mb-3">
                            <Card style={{ backgroundColor: '#063455', color: 'white', height: '150px' }}>
                                <CardContent className="text-center py-4">
                                    <div className="mb-2">
                                        <Avatar style={{ backgroundColor: '#202728', margin: '0 auto' }}>
                                            <CreditCard />
                                        </Avatar>
                                    </div>
                                    <Typography sx={{ mt: 1, marginBottom: '5px', fontSize: '16px', fontWeight: 400, color: '#C6C6C6' }}>Total Revenue</Typography>
                                    <Typography sx={{ fontWeight: 700, fontSize: '24px', color: '#FFFFFF' }}>0</Typography>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Recently Joined Section */}
                    <div className="mx-0">
                        {/* Tabs for Members and Family Members */}
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                            <Tabs 
                                value={activeTab} 
                                onChange={(e, newValue) => {
                                    setActiveTab(newValue);
                                    setIsLoading(true);
                                    const params = new URLSearchParams(window.location.search);
                                    
                                    // Set member_type_filter based on tab
                                    if (newValue === 0) {
                                        params.set('member_type_filter', 'primary');
                                    } else {
                                        params.set('member_type_filter', 'family');
                                    }
                                    
                                    router.visit(`${window.location.pathname}?${params.toString()}`, {
                                        preserveState: true,
                                        preserveScroll: true,
                                        onFinish: () => setIsLoading(false),
                                    });
                                }}
                                sx={{
                                    '& .MuiTab-root': {
                                        textTransform: 'none',
                                        fontSize: '16px',
                                        fontWeight: 500,
                                        minWidth: 120,
                                    },
                                    '& .Mui-selected': {
                                        color: '#063455',
                                    },
                                    '& .MuiTabs-indicator': {
                                        backgroundColor: '#063455',
                                    },
                                }}
                            >
                                <Tab label="Member Cards" />
                                <Tab label="Family Member Cards" />
                            </Tabs>
                        </Box>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <Typography style={{ fontWeight: 500, fontSize: '24px', color: '#000000' }}>
                                {activeTab === 0 ? 'Member Cards' : 'Family Member Cards'}
                            </Typography>
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

                        {/* Filter Section - Always Visible */}
                        <Box sx={{ mb: 3, p: 2, backgroundColor: 'white', borderRadius: 1, boxShadow: 1 }}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
                                <TextField
                                    placeholder="Search by name, membership no, contact"
                                    variant="outlined"
                                    size="small"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        const params = new URLSearchParams(window.location.search);
                                        if (e.target.value) {
                                            params.set('search', e.target.value);
                                        } else {
                                            params.delete('search');
                                        }
                                        router.visit(`${window.location.pathname}?${params.toString()}`, {
                                            preserveState: true,
                                            preserveScroll: true,
                                        });
                                    }}
                                    fullWidth
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                    <TextField
                                        select
                                        label="Card Status"
                                        size="small"
                                        value={filterValues.card_status}
                                        onChange={(e) => setFilterValues({ ...filterValues, card_status: e.target.value })}
                                        fullWidth
                                    >
                                        <MenuItem value="all">All</MenuItem>
                                        {['In-Process', 'Printed', 'Received', 'Issued', 'Applied', 'Re-Printed', 'Not Applied', 'Expired', 'Not Applicable', 'E-Card Issued'].map((status, idx) => (
                                            <MenuItem key={idx} value={status}>
                                                {status}
                                            </MenuItem>
                                        ))}
                                    </TextField>

                                    <TextField
                                        select
                                        label="Member Status"
                                        size="small"
                                        value={filterValues.status}
                                        onChange={(e) => setFilterValues({ ...filterValues, status: e.target.value })}
                                        fullWidth
                                    >
                                        <MenuItem value="all">All Member Status</MenuItem>
                                        <MenuItem value="active">Active</MenuItem>
                                        <MenuItem value="suspended">Suspended</MenuItem>
                                        <MenuItem value="cancelled">Cancelled</MenuItem>
                                        <MenuItem value="pause">Pause</MenuItem>
                                    </TextField>

                                    <TextField
                                        select
                                        label="Member Category"
                                        size="small"
                                        value={filterValues.member_category}
                                        onChange={(e) => setFilterValues({ ...filterValues, member_category: e.target.value })}
                                        fullWidth
                                    >
                                        <MenuItem value="all">All Member Categories</MenuItem>
                                        {memberCategories?.map((category) => (
                                            <MenuItem key={category.id} value={category.id}>
                                                {category.description}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => {
                                            setFilterValues({
                                                card_status: 'all',
                                                status: 'all',
                                                member_category: 'all',
                                            });
                                            router.visit(window.location.pathname, {
                                                preserveState: false,
                                            });
                                        }}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => {
                                            const params = new URLSearchParams(window.location.search);
                                            
                                            // Add filters to URL
                                            Object.keys(filterValues).forEach(key => {
                                                if (filterValues[key] && filterValues[key] !== 'all') {
                                                    params.set(key, filterValues[key]);
                                                } else {
                                                    params.delete(key);
                                                }
                                            });
                                            
                                            router.visit(`${window.location.pathname}?${params.toString()}`, {
                                                preserveState: true,
                                                preserveScroll: true,
                                            });
                                            // Filter applied, no need to close since it's always visible
                                        }}
                                        sx={{ 
                                            backgroundColor: '#063455',
                                            textTransform: 'none',
                                            '&:hover': { backgroundColor: '#052d45' }
                                        }}
                                    >
                                        Apply Filters
                                    </Button>
                                </Box>
                        </Box>

                        {/* Loading Indicator */}
                        {isLoading && (
                            <Box sx={{ width: '100%', mb: 2 }}>
                                <LinearProgress sx={{ 
                                    backgroundColor: '#e0e0e0',
                                    '& .MuiLinearProgress-bar': {
                                        backgroundColor: '#063455'
                                    }
                                }} />
                            </Box>
                        )}

                        {/* Members Table */}
                        <TableContainer component={Paper} style={{ boxShadow: 'none', position: 'relative' }}>
                            <Table>
                                <TableHead>
                                    <TableRow style={{ backgroundColor: '#E5E5EA', height: '60px' }}>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 500 }}>Membership No</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 500 }}>Member Name</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 500 }}>Category</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 500 }}>Type</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 500 }}>Card Status</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 500 }}>Member Status</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 500 }}>Card Issue Date</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 500 }}>Card Expiry</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 500 }}>Card</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody sx={{ opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.3s' }}>
                                    {members.data.map((member) => (
                                        <TableRow key={member.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', cursor: 'pointer' }}>
                                                {member.membership_no || 'N/A'}
                                                {member.parent_id && member.parent && (
                                                    <Typography sx={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
                                                        (Parent: {member.parent.membership_no})
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="d-flex align-items-center">
                                                    <Avatar src={member.profile_photo || '/placeholder.svg?height=40&width=40'} alt={member.full_name} style={{ marginRight: '10px' }} />
                                                    <div>
                                                        <Typography sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }} className="d-flex align-items-center gap-2">
                                                            {member.full_name}
                                                            {member.parent_id && <span style={{ fontSize: '12px', color: '#999' }}>(Family)</span>}

                                                            {member.is_document_enabled && (
                                                                <Tooltip title="Documents missing" arrow>
                                                                    <WarningAmberIcon color="warning" fontSize="small" />
                                                                </Tooltip>
                                                            )}
                                                        </Typography>

                                                        <Typography sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                            {member.mobile_number_a || 'N/A'}
                                                            {member.parent_id && member.parent && (
                                                                <span style={{ fontSize: '12px', color: '#999', marginLeft: '8px' }}>
                                                                    • Parent: {member.parent.full_name}
                                                                </span>
                                                            )}
                                                        </Typography>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{member.member_category?.name || 'N/A'}</TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{member.member_type?.name || 'N/A'}</TableCell>
                                            <TableCell>
                                                {member.card_status ? (
                                                    <Chip 
                                                        label={member.card_status}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: 
                                                                member.card_status === 'Issued' ? '#4caf50' :
                                                                member.card_status === 'E-Card Issued' ? '#2196f3' :
                                                                member.card_status === 'Printed' ? '#9c27b0' :
                                                                member.card_status === 'Received' ? '#ff9800' :
                                                                member.card_status === 'In-Process' ? '#ffc107' :
                                                                member.card_status === 'Applied' ? '#00bcd4' :
                                                                member.card_status === 'Re-Printed' ? '#673ab7' :
                                                                member.card_status === 'Expired' ? '#f44336' :
                                                                member.card_status === 'Not Applied' ? '#9e9e9e' :
                                                                member.card_status === 'Not Applicable' ? '#607d8b' :
                                                                '#757575',
                                                            color: '#fff',
                                                            fontWeight: 500,
                                                            fontSize: '12px'
                                                        }}
                                                    />
                                                ) : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {member.status ? (
                                                    <Chip 
                                                        label={member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: 
                                                                member.status === 'active' ? '#4caf50' :
                                                                member.status === 'suspended' ? '#ff9800' :
                                                                member.status === 'cancelled' ? '#f44336' :
                                                                member.status === 'pause' ? '#2196f3' :
                                                                '#757575',
                                                            color: '#fff',
                                                            fontWeight: 500,
                                                            fontSize: '12px'
                                                        }}
                                                    />
                                                ) : 'N/A'}
                                            </TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{member.card_issue_date || 'N/A'}</TableCell>
                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{member.card_expiry_date || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Button
                                                    style={{ color: '#0C67AA', textDecoration: 'underline', textTransform: 'none' }}
                                                    onClick={() => {
                                                        setSelectMember(member);
                                                        setOpenCardModal(true);
                                                    }}
                                                >
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {!isLoading && members.data.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4 }}>
                                                <Typography sx={{ color: '#999', fontSize: '14px' }}>
                                                    No {activeTab === 0 ? 'primary members' : 'family members'} found
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {isLoading && (
                                        <TableRow>
                                            <TableCell colSpan={9} sx={{ textAlign: 'center', py: 8 }}>
                                                <CircularProgress sx={{ color: '#063455' }} />
                                                <Typography sx={{ color: '#999', fontSize: '14px', mt: 2 }}>
                                                    Loading {activeTab === 0 ? 'member' : 'family member'} cards...
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            <Box display="flex" justifyContent="center" mt={2}>
                                {members.links?.map((link, index) => (
                                    <Button
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

                    <MembershipCardComponent 
                        open={openCardModal} 
                        onClose={() => {
                            setOpenCardModal(false);
                            setSelectMember(null); // ✅ Clear selected member when closing
                        }} 
                        member={selectMember} 
                        memberData={members.data} 
                    />
                </div>
            </div>
        </>
    );
};

export default CardsDashboard;
