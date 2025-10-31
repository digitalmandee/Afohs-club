import React, { useState } from 'react';
import { Typography, Button, TextField, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper, IconButton, Avatar, InputAdornment, Box, Card, CardContent, Grid, Chip, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel } from '@mui/material';
import { Search, FilterAlt, ExpandMore, ExpandLess, Warning, CheckCircle, Schedule, Extension, Group, PersonOff, AccessTime, SupervisorAccount } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import FamilyFilter from './Family/Filter';
import MembershipCardComponent from './UserCard';
import { router } from '@inertiajs/react';
import { enqueueSnackbar } from 'notistack';
import axios from 'axios';


const FamilyMembersArchive = ({ familyGroups, stats, auth }) => {
    // const [open, setOpen] = useState(true);
    const [expandedRow, setExpandedRow] = useState(null);
    const [openCardModal, setOpenCardModal] = useState(false);
    const [selectMember, setSelectMember] = useState(null);
    const [openExtensionModal, setOpenExtensionModal] = useState(false);
    const [selectedMemberForExtension, setSelectedMemberForExtension] = useState(null);
    const [extensionDate, setExtensionDate] = useState('');
    const [extensionReason, setExtensionReason] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Check if user is super admin
    const isSuperAdmin = auth?.user?.roles?.some(role => role.name === 'super-admin') || false;

    const calculateAge = (dob) => {
        if (!dob) return null;
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleExtendExpiry = async () => {
        if (!selectedMemberForExtension || !extensionDate || !extensionReason) {
            enqueueSnackbar('Please fill all required fields', { variant: 'error' });
            return;
        }

        setLoading(true);
        try {
            await axios.post(`/admin/membership/family-members-archive/member/${selectedMemberForExtension.id}/extend`, {
                extension_date: extensionDate,
                reason: extensionReason
            });

            enqueueSnackbar('Expiry date extended successfully', { variant: 'success' });
            setOpenExtensionModal(false);
            setExtensionDate('');
            setExtensionReason('');
            setSelectedMemberForExtension(null);
            
            // Refresh the page to show updated data
            router.reload();
        } catch (error) {
            enqueueSnackbar(error.response?.data?.error || 'Failed to extend expiry date', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleBulkExpire = async () => {
        if (selectedMembers.length === 0) {
            enqueueSnackbar('Please select members to expire', { variant: 'error' });
            return;
        }

        if (!confirm(`Are you sure you want to expire ${selectedMembers.length} selected member(s)?`)) {
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('/admin/membership/family-members-archive/bulk-expire', {
                member_ids: selectedMembers
            });

            enqueueSnackbar(response.data.message, { variant: 'success' });
            setSelectedMembers([]);
            
            // Refresh the page to show updated data
            router.reload();
        } catch (error) {
            enqueueSnackbar(error.response?.data?.error || 'Failed to expire members', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSelectMember = (memberId) => {
        setSelectedMembers(prev => 
            prev.includes(memberId) 
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const getAgeStatusColor = (age, shouldExpire, hasExtension) => {
        if (hasExtension) return '#27ae60'; // Green for extended
        if (age >= 25) return '#e74c3c'; // Red for should expire
        if (age >= 23) return '#ff6b35'; // Orange for warning
        return '#063455'; // Blue for normal
    };

    const getAgeStatusIcon = (age, shouldExpire, hasExtension) => {
        if (hasExtension) return <Extension color='white' fontSize="small" />;
        if (shouldExpire) return <Warning color='white' fontSize="small" />;
        if (age >= 23) return <Schedule color='white' fontSize="small" />;
        return <CheckCircle color='white' fontSize="small" />;
    };

    const getAgeStatusText = (age, shouldExpire, hasExtension) => {
        if (hasExtension) return 'Extended';
        if (shouldExpire) return 'Should Expire';
        if (age >= 23) return 'Warning';
        return 'Active';
    };

    const getMemberStatusConfig = (status) => {
        const statusMap = {
            'active': { color: '#27ae60', label: 'Active', bgColor: '#d4edda' },
            'suspended': { color: '#e67e22', label: 'Suspended', bgColor: '#fff3cd' },
            'cancelled': { color: '#e74c3c', label: 'Cancelled', bgColor: '#f8d7da' },
            'absent': { color: '#95a5a6', label: 'Absent', bgColor: '#e2e3e5' },
            'expired': { color: '#c0392b', label: 'Expired', bgColor: '#f8d7da' },
            'terminated': { color: '#8e44ad', label: 'Terminated', bgColor: '#e7d6f0' },
            'not_assign': { color: '#7f8c8d', label: 'Not Assigned', bgColor: '#d6d8db' },
            'in_suspension_process': { color: '#f39c12', label: 'In Suspension', bgColor: '#fff3cd' }
        };
        return statusMap[status] || { color: '#063455', label: status || 'N/A', bgColor: '#cfe2ff' };
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
                    {/* Header */}
                    {/* <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <Typography sx={{ marginLeft: '10px', fontWeight: 500, color: '#063455', fontSize: '30px' }}>
                                Family Members Archive
                            </Typography>
                        </div>
                    </div> */}

                    {/* Stats Cards */}
                    {stats && (
                        <div className="row mb-3 mt-4">
                            <div className="col-lg-3 col-md-6 mb-3">
                                <Card sx={{ 
                                    background: 'linear-gradient(135deg, #063455 0%, #0a4a6b 100%)', 
                                    color: 'white', 
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 20px rgba(6, 52, 85, 0.3)',
                                    transition: 'transform 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 6px 25px rgba(6, 52, 85, 0.4)'
                                    }
                                }}>
                                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                                        <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                                            <Group sx={{ fontSize: '32px', mr: 1 }} />
                                            <Typography variant="h3" sx={{ fontWeight: 'bold', fontSize: '28px' }}>
                                                {stats.total_family_members}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{ fontSize: '13px', opacity: 0.9 }}>
                                            Total Family Members
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="col-lg-3 col-md-6 mb-3">
                                <Card sx={{ 
                                    background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)', 
                                    color: 'white', 
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 20px rgba(255, 107, 53, 0.3)',
                                    transition: 'transform 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 6px 25px rgba(255, 107, 53, 0.4)'
                                    }
                                }}>
                                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                                        <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                                            <Warning sx={{ fontSize: '32px', mr: 1 }} />
                                            <Typography variant="h3" sx={{ fontWeight: 'bold', fontSize: '28px' }}>
                                                {stats.total_over_25}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{ fontSize: '13px', opacity: 0.9 }}>
                                            Members Over 25 Years
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="col-lg-3 col-md-6 mb-3">
                                <Card sx={{ 
                                    background: 'linear-gradient(135deg, #e74c3c 0%, #ec7063 100%)', 
                                    color: 'white', 
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 20px rgba(231, 76, 60, 0.3)',
                                    transition: 'transform 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 6px 25px rgba(231, 76, 60, 0.4)'
                                    }
                                }}>
                                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                                        <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                                            <PersonOff sx={{ fontSize: '32px', mr: 1 }} />
                                            <Typography variant="h3" sx={{ fontWeight: 'bold', fontSize: '28px' }}>
                                                {stats.expired_by_age}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{ fontSize: '13px', opacity: 0.9 }}>
                                            Expired by Age
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="col-lg-3 col-md-6 mb-3">
                                <Card sx={{ 
                                    background: 'linear-gradient(135deg, #27ae60 0%, #58d68d 100%)', 
                                    color: 'white', 
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 20px rgba(39, 174, 96, 0.3)',
                                    transition: 'transform 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 6px 25px rgba(39, 174, 96, 0.4)'
                                    }
                                }}>
                                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                                        <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                                            <Extension sx={{ fontSize: '32px', mr: 1 }} />
                                            <Typography variant="h3" sx={{ fontWeight: 'bold', fontSize: '28px' }}>
                                                {stats.with_extensions}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{ fontSize: '13px', opacity: 0.9 }}>
                                            Extended Memberships
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center">
                            <Typography sx={{ marginLeft: '10px', fontWeight: 500, color: '#063455', fontSize: '30px' }}>Family Members Archive</Typography>
                        </div>
                        {isSuperAdmin && selectedMembers.length > 0 && (
                            <Button
                                variant="contained"
                                onClick={handleBulkExpire}
                                disabled={loading}
                                startIcon={<PersonOff />}
                                style={{
                                    backgroundColor: '#e74c3c',
                                    textTransform: 'none',
                                    borderRadius: '4px',
                                    height: 40,
                                }}
                            >
                                Expire Selected ({selectedMembers.length})
                            </Button>
                        )}
                    </div>

                    {/* Recently Joined Section */}
                    <div className="mx-0">

                        {/* Filter */}
                        <FamilyFilter />

                        {/* Members Table */}
                        <TableContainer component={Paper} style={{ boxShadow: 'none' }}>
                            <Table>
                                <TableHead>
                                    <TableRow style={{ backgroundColor: '#E5E5EA', height: '40px' }}>
                                        {isSuperAdmin && (
                                            <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600, width: '50px' }}>
                                                <Checkbox
                                                    checked={selectedMembers.length === familyGroups.data.length && familyGroups.data.length > 0}
                                                    indeterminate={selectedMembers.length > 0 && selectedMembers.length < familyGroups.data.length}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedMembers(familyGroups.data.map(member => member.id));
                                                        } else {
                                                            setSelectedMembers([]);
                                                        }
                                                    }}
                                                />
                                            </TableCell>
                                        )}
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Card No</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Name</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Member Name</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Age Status</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Relationship</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Cnic</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Phone Number</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Date of Birth</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Card Status</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Status</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Card</TableCell>
                                        <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {familyGroups.data.map((user, index) => {
                                        const rawAge = user.calculated_age || calculateAge(user.date_of_birth);
                                        const age = rawAge ? Math.floor(rawAge) : null; // Always convert to whole number
                                        const shouldExpire = user.should_expire;
                                        const hasExtension = user.has_extension;
                                        const statusColor = getAgeStatusColor(age, shouldExpire, hasExtension);
                                        const statusIcon = getAgeStatusIcon(age, shouldExpire, hasExtension);
                                        const statusText = getAgeStatusText(age, shouldExpire, hasExtension);
                                        
                                        return (
                                            <React.Fragment key={user.id}>
                                                <TableRow style={{ borderBottom: '1px solid #eee', backgroundColor: shouldExpire ? '#fff3e0' : 'transparent' }}>
                                                    {isSuperAdmin && (
                                                        <TableCell>
                                                            <Checkbox
                                                                checked={selectedMembers.includes(user.id)}
                                                                onChange={() => handleSelectMember(user.id)}
                                                                disabled={!shouldExpire}
                                                            />
                                                        </TableCell>
                                                    )}
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.membership_no}</TableCell>
                                                    <TableCell>
                                                        <Typography sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.full_name}</Typography>
                                                        <Typography sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.personal_email}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.parent?.full_name}</TableCell>
                                                    <TableCell>
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Box display="flex" alignItems="center" gap={1}>
                                                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#333' }}>
                                                                    {age || 'N/A'} years
                                                                </Typography>
                                                                <Chip
                                                                    icon={statusIcon}
                                                                    label={statusText}
                                                                    size="small"
                                                                    sx={{
                                                                        backgroundColor: statusColor,
                                                                        color: 'white',
                                                                        fontWeight: 'bold',
                                                                        fontSize: '11px'
                                                                    }}
                                                                />
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.relation}</TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.cnic_no}</TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.mobile_number_a}</TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : 'N/A'}</TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{user.card_status || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={getMemberStatusConfig(user.status).label}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: getMemberStatusConfig(user.status).bgColor,
                                                                color: getMemberStatusConfig(user.status).color,
                                                                fontWeight: 'bold',
                                                                fontSize: '12px',
                                                                border: `1px solid ${getMemberStatusConfig(user.status).color}`
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                            <Button
                                                                size="small"
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
                                                    <TableCell>
                                                        <Box display="flex" gap={1}>
                                                            {isSuperAdmin && (age >= 25 || shouldExpire) && (
                                                                <Button
                                                                    size="small"
                                                                    variant="contained"
                                                                    startIcon={<Extension />}
                                                                    onClick={() => {
                                                                        setSelectedMemberForExtension(user);
                                                                        setOpenExtensionModal(true);
                                                                    }}
                                                                    sx={{ 
                                                                        textTransform: 'none',
                                                                        background: 'linear-gradient(45deg, #27ae60 30%, #2ecc71 90%)',
                                                                        color: 'white',
                                                                        fontSize: '11px',
                                                                        fontWeight: 'bold',
                                                                        px: 2,
                                                                        py: 0.5,
                                                                        boxShadow: '0 2px 8px rgba(39, 174, 96, 0.3)',
                                                                        '&:hover': {
                                                                            background: 'linear-gradient(45deg, #229954 30%, #27ae60 90%)',
                                                                            boxShadow: '0 4px 12px rgba(39, 174, 96, 0.4)',
                                                                            transform: 'translateY(-1px)'
                                                                        }
                                                                    }}
                                                                >
                                                                    Extend
                                                                </Button>
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            </React.Fragment>
                                        );
                                    })}
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
            {/* </div> */}

            {/* Member Details Modal */}
            <MembershipCardComponent 
                open={openCardModal} 
                onClose={() => setOpenCardModal(false)} 
                member={selectMember} 
                memberData={familyGroups} 
            />

            {/* Extension Modal */}
            <Dialog open={openExtensionModal} onClose={() => setOpenExtensionModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <SupervisorAccount color="primary" />
                        <Typography variant="h6">Extend Family Member Expiry</Typography>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedMemberForExtension && (
                        <Box sx={{ pt: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                <strong>Member:</strong> {selectedMemberForExtension.full_name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                <strong>Age:</strong> {Math.floor(selectedMemberForExtension.calculated_age || calculateAge(selectedMemberForExtension.date_of_birth))} years
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom sx={{ mb: 3 }}>
                                <strong>Current Status:</strong> {selectedMemberForExtension.status}
                            </Typography>
                            
                            <TextField
                                fullWidth
                                type="date"
                                label="Extension Date"
                                value={extensionDate}
                                onChange={(e) => setExtensionDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ min: new Date().toISOString().split('T')[0] }}
                                sx={{ mb: 2 }}
                            />
                            
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Reason for Extension"
                                value={extensionReason}
                                onChange={(e) => setExtensionReason(e.target.value)}
                                placeholder="Please provide a detailed reason for extending this member's expiry date..."
                                helperText="Minimum 10 characters required"
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenExtensionModal(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleExtendExpiry} 
                        variant="contained" 
                        disabled={loading || !extensionDate || !extensionReason || extensionReason.length < 10}
                        startIcon={<Extension />}
                        sx={{
                            backgroundColor: '#063455',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: '#083352'
                            }
                        }}
                    >
                        {loading ? 'Extending...' : 'Extend Expiry'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default FamilyMembersArchive;
