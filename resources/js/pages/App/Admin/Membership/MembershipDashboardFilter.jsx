import { useState } from 'react';
import { Typography, Button, Box, Dialog, Collapse, Chip, IconButton, TextField } from '@mui/material';
import { Close as CloseIcon, KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material';

const styles = {
    root: {
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
    },
    tabButton: {
        borderRadius: '20px',
        margin: '0 5px',
        textTransform: 'none',
        fontWeight: 'normal',
        padding: '6px 16px',
        border: '1px solid #00274D',
        color: '#00274D',
    },
    activeTabButton: {
        backgroundColor: '#0a3d62',
        color: 'white',
        borderRadius: '20px',
        margin: '0 5px',
        textTransform: 'none',
        fontWeight: 'normal',
        padding: '6px 16px',
    },
    filterSection: {
        mb: 3,
        border: '1px solid #eee',
        borderRadius: '8px',
        p: 2,
        backgroundColor: '#fff',
        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.05)',
    },
    filterHeader: {
        p: 0,
        mb: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
};

const MembershipDashboardFilter = ({
    openFilterModal,
    setOpenFilterModal,
    members,
    filteredMembers,
    setFilteredMembers,
    statusOptions,
    memberTypeOptions,
}) => {
    const [expandedSections, setExpandedSections] = useState({
        sorting: true,
        orderType: true,
        memberStatus: true,
        orderStatus: true,
    });
    const [filters, setFilters] = useState({
        sort: 'asc',
        sortBy: 'id',
        orderType: 'all',
        memberStatus: 'all',
        orderStatus: 'all',
        targetDate: '',
    });

    const toggleSection = (section) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleResetFilters = () => {
        setFilters({
            sort: 'asc',
            sortBy: 'id',
            orderType: 'all',
            memberStatus: 'all',
            orderStatus: 'all',
            targetDate: '',
        });
        setFilteredMembers(members);
    };

    const handleApplyFilters = () => {
        let filteredData = [...members];

        // Status filter (based on card_status)
        if (filters.orderType !== 'all') {
            filteredData = filteredData.filter((member) => {
                return member.member?.card_status?.toLowerCase() === filters.orderType.toLowerCase();
            });
        }

        // Member type filter
        if (filters.orderStatus !== 'all') {
            filteredData = filteredData.filter(
                (member) => {
                    console.log('member.member?.member_type?.name:', member.member?.member_type?.name);
                    return member.member?.member_type?.name === filters.orderStatus;
                }
            );
        }

        // Date filter
        // if (filters.targetDate) {
        //     filteredData = filteredData.filter(
        //         (member) =>
        //             member.member?.membership_date === filters.targetDate
        //     );
        // }

        // Sorting
        filteredData.sort((a, b) => {
            const field = filters.sortBy === 'id' ? 'membership_no' : 'first_name';
            const valueA = field === 'membership_no' ? (a.member?.membership_no || '') : (a.first_name || '');
            const valueB = field === 'membership_no' ? (b.member?.membership_no || '') : (b.first_name || '');
            return filters.sort === 'asc'
                ? valueA.localeCompare(valueB, undefined, { numeric: true })
                : valueB.localeCompare(valueA, undefined, { numeric: true });
        });

        setFilteredMembers(filteredData);
        setOpenFilterModal(false);
    };

    return (
        <Dialog
            open={openFilterModal}
            onClose={() => setOpenFilterModal(false)}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                style: {
                    position: 'absolute',
                    top: 0,
                    right: 20,
                    m: 0,
                    width: '600px',
                    borderRadius: 2,
                    p: 2,
                },
            }}
        >
            <Box sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography sx={{ color: '#121212', fontWeight: 500, fontSize: '32px' }}>
                        Member Filter
                    </Typography>
                    <IconButton edge="end" onClick={() => setOpenFilterModal(false)}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Sorting Section */}
                <Box
                    className={styles.filterSection}
                    sx={{
                        mb: 3,
                        border: '1px solid #eee',
                        borderRadius: '8px',
                        p: 2,
                        backgroundColor: '#fff',
                        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.05)',
                    }}
                >
                    <Box
                        className={styles.filterHeader}
                        onClick={() => toggleSection('sorting')}
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                        }}
                    >
                        <Typography sx={{ color: '#121212', fontWeight: 500, fontSize: '16px' }}>
                            Sorting
                        </Typography>
                        <KeyboardArrowDownIcon
                            sx={{
                                transform: expandedSections.sorting ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s ease',
                            }}
                        />
                    </Box>
                    <Collapse in={expandedSections.sorting}>
                        <Box
                            sx={{
                                mt: 2,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'baseline',
                            }}
                        >
                            <Typography sx={{ mb: 1, color: '#121212', fontSize: '14px', fontWeight: 400 }}>
                                By Member Id
                            </Typography>
                            <Box display="flex" gap={2}>
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        handleFilterChange('sortBy', 'id');
                                        handleFilterChange('sort', 'asc');
                                    }}
                                    sx={{
                                        backgroundColor: filters.sortBy === 'id' && filters.sort === 'asc' ? '#063455' : '#B0DEFF',
                                        color: filters.sortBy === 'id' && filters.sort === 'asc' ? 'white' : 'black',
                                        borderRadius: '20px',
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        minWidth: '130px',
                                    }}
                                    startIcon={<span style={{ fontSize: '16px' }}>↑</span>}
                                >
                                    Ascending
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        handleFilterChange('sortBy', 'id');
                                        handleFilterChange('sort', 'desc');
                                    }}
                                    sx={{
                                        backgroundColor: filters.sortBy === 'id' && filters.sort === 'desc' ? '#063455' : '#B0DEFF',
                                        color: filters.sortBy === 'id' && filters.sort === 'desc' ? 'white' : 'black',
                                        borderRadius: '20px',
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        minWidth: '130px',
                                    }}
                                    startIcon={<span style={{ fontSize: '16px' }}>↓</span>}
                                >
                                    Descending
                                </Button>
                            </Box>
                        </Box>
                    </Collapse>
                    <Collapse in={expandedSections.sorting}>
                        <Box
                            sx={{
                                mt: 2,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'baseline',
                            }}
                        >
                            <Typography sx={{ mb: 1, color: '#121212', fontSize: '14px', fontWeight: 400 }}>
                                By Member Name
                            </Typography>
                            <Box display="flex" gap={2}>
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        handleFilterChange('sortBy', 'name');
                                        handleFilterChange('sort', 'asc');
                                    }}
                                    sx={{
                                        backgroundColor: filters.sortBy === 'name' && filters.sort === 'asc' ? '#b3e5fc' : '#e3f2fd',
                                        color: '#000',
                                        borderRadius: '20px',
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        '&:hover': {
                                            backgroundColor: '#b3e5fc',
                                        },
                                        minWidth: '130px',
                                    }}
                                    startIcon={<span style={{ fontSize: '16px' }}>↑</span>}
                                >
                                    Ascending
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        handleFilterChange('sortBy', 'name');
                                        handleFilterChange('sort', 'desc');
                                    }}
                                    sx={{
                                        backgroundColor: filters.sortBy === 'name' && filters.sort === 'desc' ? '#b3e5fc' : '#e3f2fd',
                                        color: '#000',
                                        borderRadius: '20px',
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        '&:hover': {
                                            backgroundColor: '#b3e5fc',
                                        },
                                        minWidth: '130px',
                                    }}
                                    startIcon={<span style={{ fontSize: '16px' }}>↓</span>}
                                >
                                    Descending
                                </Button>
                            </Box>
                        </Box>
                    </Collapse>
                </Box>

                {/* Order Type Section */}
                <Box
                    className={styles.filterSection}
                    sx={{
                        mb: 3,
                        border: '1px solid #eee',
                        borderRadius: '8px',
                        p: 2,
                        backgroundColor: '#fff',
                        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.05)',
                    }}
                >
                    <Box
                        className={styles.filterHeader}
                        onClick={() => toggleSection('orderType')}
                        sx={{
                            p: 0,
                            mb: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Typography sx={{ color: '#121212', fontSize: '14px', fontWeight: 500 }}>Choose Status</Typography>
                        <KeyboardArrowDownIcon
                            sx={{
                                cursor: 'pointer',
                                transform: expandedSections.orderType ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s',
                            }}
                        />
                    </Box>
                    <Collapse in={expandedSections.orderType}>
                        <Box sx={{ mb: 1 }}>
                            <Box display="flex" flexWrap="wrap" gap={1}>
                                {statusOptions.map((item) => (
                                    <Chip
                                        key={item.value}
                                        label={item.label}
                                        onClick={() => handleFilterChange('orderType', item.value)}
                                        sx={{
                                            backgroundColor: filters.orderType === item.value ? '#063455' : '#B0DEFF',
                                            color: filters.orderType === item.value ? 'white' : 'black',
                                            fontWeight: 500,
                                            borderRadius: '16px',
                                            px: 2,
                                            py: 0.5,
                                            fontSize: '0.875rem',
                                        }}
                                        icon={item.icon}
                                    />
                                ))}
                            </Box>
                        </Box>
                    </Collapse>
                </Box>

                {/* Order Status Section */}
                <Box
                    className={styles.filterSection}
                    sx={{
                        mb: 3,
                        border: '1px solid #eee',
                        borderRadius: '8px',
                        p: 2,
                        backgroundColor: '#fff',
                        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.05)',
                    }}
                >
                    <Box
                        className={styles.filterHeader}
                        onClick={() => toggleSection('orderStatus')}
                        sx={{
                            p: 0,
                            mb: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Typography sx={{ color: '#121212', fontSize: '14px', fontWeight: 500 }}>Choose by type</Typography>
                        <KeyboardArrowDownIcon
                            sx={{
                                cursor: 'pointer',
                                transform: expandedSections.orderStatus ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s',
                            }}
                        />
                    </Box>
                    <Collapse in={expandedSections.orderStatus}>
                        <Box sx={{ mb: 1 }}>
                            <Box display="flex" flexWrap="wrap" gap={1}>
                                {memberTypeOptions.map((item) => (
                                    <Chip
                                        key={item.value}
                                        label={item.label}
                                        onClick={() => handleFilterChange('orderStatus', item.value)}
                                        sx={{
                                            backgroundColor: filters.orderStatus === item.value ? '#003049' : '#cce5ff',
                                            color: filters.orderStatus === item.value ? 'white' : 'black',
                                            fontWeight: 500,
                                            borderRadius: '20px',
                                            px: 2,
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    </Collapse>
                </Box>

                {/* Member Status Section */}
                {/* <Box
                    className={styles.filterSection}
                    sx={{
                        mb: 3,
                        border: '1px solid #eee',
                        borderRadius: '8px',
                        p: 2,
                        backgroundColor: '#fff',
                        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.05)',
                    }}
                >
                    <Box
                        className={styles.filterHeader}
                        onClick={() => toggleSection('memberStatus')}
                        sx={{
                            p: 0,
                            mb: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Typography sx={{ color: '#121212', fontSize: '14px', fontWeight: 500 }}>Check by date</Typography>
                        <KeyboardArrowDownIcon
                            sx={{
                                cursor: 'pointer',
                                transform: expandedSections.memberStatus ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s',
                            }}
                        />
                    </Box>
                    <Collapse in={expandedSections.memberStatus}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: 2,
                                mt: 2,
                                px: 1,
                            }}
                        >
                            <Typography sx={{ fontWeight: 400, fontSize: '14px' }}>
                                Select your target date
                            </Typography>
                            <TextField
                                type="date"
                                value={filters.targetDate || ''}
                                onChange={(e) => handleFilterChange('targetDate', e.target.value)}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                sx={{ width: 220 }}
                            />
                        </Box>
                    </Collapse>
                </Box> */}

                {/* Footer Buttons */}
                <Box display="flex" justifyContent="flex-end" gap={1} mt={3}>
                    <Button
                        variant="outlined"
                        onClick={handleResetFilters}
                        sx={{
                            color: '#333',
                            borderColor: '#ddd',
                            textTransform: 'none',
                        }}
                    >
                        Reset Filter
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleApplyFilters}
                        sx={{
                            backgroundColor: '#0a3d62',
                            color: 'white',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: '#083352',
                            },
                        }}
                    >
                        Apply Filters
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
};

export default MembershipDashboardFilter;
