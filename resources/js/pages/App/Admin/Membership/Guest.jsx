import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    TextField,
    Button,
    Modal,
    Box,
    Typography,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    Container,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    InputAdornment,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterAlt as FilterIcon,
    Print as PrintIcon,
    ArrowBack as ArrowBackIcon,
    Close as CloseIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon,
    CalendarMonth as CalendarMonthIcon
} from '@mui/icons-material';
import { router } from '@inertiajs/react';


const GuestHistory = () => {
    // const [open, setOpen] = useState(true);
    // State for search input
    const [searchTerm, setSearchTerm] = useState('');

    // State for filter modal
    const [openFilter, setOpenFilter] = useState(false);

    // State for selected filter options
    const [selectedMembershipType, setSelectedMembershipType] = useState('All Type');
    const [selectedStatusType, setSelectedStatusType] = useState('All Type');
    const [selectedDate, setSelectedDate] = useState('');

    // Sample data for members
    const [members, setMembers] = useState([
        {
            id: 'AFOHS-1235',
            name: 'Zahid Ullah',
            phone: '0323423342',
            clubname: 'Member Club',
            authorized_by: 'Ahad',
            check_in: '12:43 AM',
            check_out: '04:02 AM',
            status:'completed',
            action:'View'
        },
        {
            id: 'AFOHS-1235',
            name: 'Zahid Ullah',
            phone: '0323423342',
            clubname: 'Member Club',
            authorized_by: 'Ahad',
            check_in: '12:43 AM',
            check_out: '04:02 AM',
            status:'completed',
            action:'View'
        },
        {
            id: 'AFOHS-1235',
            name: 'Zahid Ullah',
            phone: '0323423342',
            clubname: 'Member Club',
            authorized_by: 'Ahad',
            check_in: '12:43 AM',
            check_out: '04:02 AM',
            status:'completed',
            action:'View'
        },
    ]);

    // Filter members based on search term
    const filteredMembers = members.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle opening and closing filter modal
    const handleOpenFilter = () => setOpenFilter(true);
    const handleCloseFilter = () => setOpenFilter(false);

    // Handle applying filters
    const handleApplyFilters = () => {
        // In a real app, you would filter the data here
        handleCloseFilter();
    };

    // Handle resetting filters
    const handleResetFilter = () => {
        setSelectedMembershipType('All Type');
        setSelectedDate('');
    };

    // Membership type options
    const membershipTypes = ['All Type', 'Member', 'Affiliated Member', 'VIP Guest'];
    const statusTypes = ['All Type', 'Active', 'Completed'];

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
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',   // keeps extreme left / extreme right
                            flexWrap: 'wrap',
                            mb: 4,
                        }}
                    >
                        {/* ◀️ LEFT  – back + title */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, md: 0 } }}>
                            <ArrowBackIcon sx={{ mr: 1, cursor: 'pointer' }} />
                            <Typography variant="h5" sx={{ fontWeight: 500, color: '#333' }}>
                                Guest History
                            </Typography>
                        </Box>

                        {/* ▶️ RIGHT – everything that should sit on the right  */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,           // space between search / filter / print
                                ml: 'auto',       // <-- pushes this group to the far right
                                flexWrap: 'wrap',
                            }}
                        >
                            <TextField
                                placeholder="Search by name, member type etc"
                                variant="outlined"
                                size="small"
                                sx={{ width: { xs: '220px', sm: '300px', md: '350px' } }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Button
                                variant="outlined"
                                startIcon={<FilterIcon />}
                                onClick={handleOpenFilter}
                                sx={{
                                    textTransform: 'none',
                                    borderColor: '#ccc',
                                    color: '#333',
                                }}
                            >
                                Filter
                            </Button>

                            <Button
                                variant="contained"
                                startIcon={<span>+</span>}
                                style={{
                                    backgroundColor: "#0a3d62",
                                    textTransform: "none",
                                    borderRadius: "4px",
                                    px: "16px",
                                    height:'35px'
                                }}
                                onClick={() => router.visit('/admin/membership/add/guest')}
                            >
                                Add Member
                            </Button>
                        </Box>
                    </Box>


                    {/* Members table */}
                    <TableContainer component={Paper} style={{ boxShadow: 'none', borderRadius: '4px' }}>
                        <Table>
                            <TableHead>
                                <TableRow style={{ backgroundColor: '#f0f0f5' }}>
                                    <TableCell style={{ fontWeight: 'bold', color: '#333' }}>Guest Name</TableCell>
                                    <TableCell style={{ fontWeight: 'bold', color: '#333' }}>Phone</TableCell>
                                    <TableCell style={{ fontWeight: 'bold', color: '#333' }}>Club Name</TableCell>
                                    <TableCell style={{ fontWeight: 'bold', color: '#333' }}>Auhorized By</TableCell>
                                    <TableCell style={{ fontWeight: 'bold', color: '#333' }}>Check-In</TableCell>
                                    <TableCell style={{ fontWeight: 'bold', color: '#333' }}>Check-Out</TableCell>
                                    <TableCell style={{ fontWeight: 'bold', color: '#333' }}>Status</TableCell>
                                    <TableCell style={{ fontWeight: 'bold', color: '#333' }}>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredMembers.map((member, index) => (
                                    <TableRow key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                        {/* <TableCell>{member.id}</TableCell> */}
                                        <TableCell>
                                            <div className="d-flex align-items-center">
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{member.name}</div>
                                                    {/* <div style={{ color: '#666', fontSize: '0.85rem' }}>{member.email}</div> */}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{member.phone}</TableCell>
                                        <TableCell>{member.clubname}</TableCell>
                                        <TableCell>{member.authorized_by}</TableCell>
                                        <TableCell>{member.check_in}</TableCell>
                                        <TableCell>{member.check_out}</TableCell>
                                        <TableCell>{member.status}</TableCell>
                                        <TableCell>
                                            <Button
                                                style={{
                                                    color: '#0066cc',
                                                    textTransform: 'none',
                                                    padding: '2px 8px',
                                                    fontWeight: 500
                                                }}
                                                onClick={() => router.visit('/admin/guest/visit/detail')}
                                            >
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Filter Modal */}
                    <Modal
                        open={openFilter}
                        onClose={handleCloseFilter}
                        aria-labelledby="filter-modal-title"
                        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}
                    >
                        <Box
                            sx={{
                                width: 600,
                                bgcolor: 'background.paper',
                                boxShadow: 24,
                                p: 3,
                                mt: 2,
                                mr: 2,
                                borderRadius: 1,
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <Typography id="filter-modal-title" variant="h6" component="h2">
                                    Guest History Filter
                                </Typography>
                                <IconButton onClick={handleCloseFilter} size="small">
                                    <CloseIcon />
                                </IconButton>
                            </div>

                            {/* Membership Type Filter */}
                            <Accordion
                                elevation={0}
                                style={{
                                    border: '1px solid #e0e0e0',
                                    marginBottom: '20px',
                                    borderRadius: '4px',
                                    '&:before': {
                                        display: 'none',
                                    },
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<KeyboardArrowDownIcon />}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                >
                                    <Typography>Membership Type</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <div className="d-flex flex-wrap gap-2">
                                        {membershipTypes.map((type) => (
                                            <Chip
                                                key={type}
                                                label={type}
                                                onClick={() => setSelectedMembershipType(type)}
                                                style={{
                                                    backgroundColor: selectedMembershipType === type ?
                                                        (type === 'All Type' ? '#003366' : '#cce5ff') :
                                                        (type === 'All Type' ? '#003366' : '#f0f0f0'),
                                                    color: selectedMembershipType === type ?
                                                        (type === 'All Type' ? 'white' : '#0066cc') :
                                                        (type === 'All Type' ? 'white' : '#333'),
                                                    border: 'none',
                                                    marginRight: '8px',
                                                    marginBottom: '8px',
                                                    fontWeight: 400,
                                                }}
                                            />
                                        ))}
                                    </div>
                                </AccordionDetails>
                            </Accordion>

                            <Accordion
                                elevation={0}
                                style={{
                                    border: '1px solid #e0e0e0',
                                    marginBottom: '20px',
                                    borderRadius: '4px',
                                    '&:before': {
                                        display: 'none',
                                    },
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<KeyboardArrowDownIcon />}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                >
                                    <Typography>By Status</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <div className="d-flex flex-wrap gap-2">
                                        {statusTypes.map((type) => (
                                            <Chip
                                                key={type}
                                                label={type}
                                                onClick={() => setSelectedStatusType(type)}
                                                style={{
                                                    backgroundColor: selectedStatusType === type ?
                                                        (type === 'All Type' ? '#003366' : '#cce5ff') :
                                                        (type === 'All Type' ? '#003366' : '#f0f0f0'),
                                                    color: selectedStatusType === type ?
                                                        (type === 'All Type' ? 'white' : '#0066cc') :
                                                        (type === 'All Type' ? 'white' : '#333'),
                                                    border: 'none',
                                                    marginRight: '8px',
                                                    marginBottom: '8px',
                                                    fontWeight: 400,
                                                }}
                                            />
                                        ))}
                                    </div>
                                </AccordionDetails>
                            </Accordion>

                            {/* Date Filter */}
                            <Accordion
                                elevation={0}
                                style={{
                                    border: '1px solid #e0e0e0',
                                    marginBottom: '20px',
                                    borderRadius: '4px',
                                    '&:before': {
                                        display: 'none',
                                    },
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<KeyboardArrowDownIcon />}
                                    aria-controls="panel2a-content"
                                    id="panel2a-header"
                                >
                                    <Typography>Check by Date</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography variant="body2" color="text.secondary" style={{ marginBottom: '10px' }}>
                                        Select your target date
                                    </Typography>
                                    <TextField
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <CalendarMonthIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        fullWidth
                                    />
                                </AccordionDetails>
                            </Accordion>

                            {/* Action Buttons */}
                            <div className="d-flex justify-content-end mt-4">
                                <Button
                                    onClick={handleCloseFilter}
                                    style={{
                                        marginRight: '10px',
                                        textTransform: 'none',
                                        color: '#333',
                                        border: '1px solid #ccc'
                                    }}
                                    variant="outlined"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleResetFilter}
                                    style={{
                                        marginRight: '10px',
                                        textTransform: 'none',
                                        color: '#333',
                                        border: '1px solid #ccc'
                                    }}
                                    variant="outlined"
                                >
                                    Reset Filter
                                </Button>
                                <Button
                                    onClick={handleApplyFilters}
                                    style={{
                                        textTransform: 'none',
                                        backgroundColor: '#003366',
                                        color: 'white'
                                    }}
                                    variant="contained"
                                >
                                    Apply Filters
                                </Button>
                            </div>
                        </Box>
                    </Modal>
                </Container>
            {/* </div> */}
        </>
    );
};

export default GuestHistory;