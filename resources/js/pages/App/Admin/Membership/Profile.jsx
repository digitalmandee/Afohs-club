import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, IconButton, Radio, RadioGroup, FormControlLabel, FormControl, Paper, Grid, Switch, Drawer, Card, CardContent } from '@mui/material';
import { Close as CloseIcon, Edit as EditIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

const MemberProfileModal = ({ open, onClose, member, memberData, memberTypesData }) => {
    // State for radio buttons, initialized with member data if available
    const [memberType, setMemberType] = useState(member?.user_detail?.members?.[0]?.member_type?.name || 'Member');
    const [memberStatus, setMemberStatus] = useState(member?.user_detail?.members?.[0]?.card_status || 'Active');
    const [memberTypes, setMemberTypes] = useState([]); // State for dynamic member types

    // Derive member types from memberData
    useEffect(() => {
        if (open && memberData) {
            // Extract unique member types from memberData
            const types = [
                ...new Set(
                    memberData.map((m) => m?.user_detail?.members?.[0]?.member_type?.name).filter((name) => name), // Remove null/undefined
                ),
            ].map((name, index) => ({
                id: index + 1, // Generate a unique ID
                name,
            }));
            setMemberTypes(
                types.length > 0
                    ? types
                    : [
                        { id: 1, name: 'Member' },
                        { id: 2, name: 'Affiliated Member' },
                        { id: 3, name: 'Applied Member' },
                    ],
            );
        }
    }, [open, memberData]);

    // Handle member type change
    const handleMemberTypeChange = async (event) => {
        const newType = event.target.value;
        setMemberType(newType);
        // Optionally, send an API request to update the member type
        try {
            await axios.put(`/api/members/${member?.user_detail?.members?.[0]?.id}/type`, {
                member_type: newType,
            });
            console.log('Member type updated successfully');
        } catch (err) {
            console.error('Error updating member type:', err);
        }
    };

    // Handle member status change
    const handleMemberStatusChange = async (event) => {
        const newStatus = event.target.value;
        setMemberStatus(newStatus);
        const memberId = member?.user_detail?.members?.[0]?.id;
        if (!memberId) {
            console.error('Error: Member ID is undefined');
            console.log('Member data:', JSON.stringify(member, null, 2));
            return;
        }
        try {
            console.log('Member ID:', memberId);
            console.log('Request URL:', `/api/members/${memberId}/status`);
            const csrfTokenElement = document.querySelector('meta[name="csrf-token"]');
            const headers = csrfTokenElement
                ? {
                    'X-CSRF-TOKEN': csrfTokenElement.getAttribute('content'),
                }
                : {};
            await axios.put(
                `/api/members/${memberId}/status`,
                {
                    card_status: newStatus,
                },
                { headers },
            );
            console.log('Member status updated successfully');
        } catch (err) {
            console.error('Error updating member status:', err);
        }
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            ModalProps={{
                keepMounted: true,
            }}
            PaperProps={{
                sx: {
                    width: 600,
                    marginTop: '20px',
                    marginBottom: '20px',
                    marginRight: '20px',
                    borderRadius: '8px',
                    height: 'auto',
                    maxHeight: 'calc(100% - 40px)',
                },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    px: 2,
                    py: 2,
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 2,
                        overflow: 'hidden',
                        position: 'relative',
                    }}
                >
                    {/* Header with profile info */}
                    <Box sx={{ px: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar
                                    src={member?.profile_photo || '/placeholder.svg?height=40&width=40'}
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        border: '2px solid #e0e0e0',
                                        mr: 2,
                                    }}
                                />
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 500, mb: 0.5 }}>
                                        {/* {JSON.stringify(memberTypesData, null, 2)} */}
                                        {member?.first_name || 'N/A'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Member ID: {member?.user_detail?.members?.[0]?.membership_number || 'N/A'}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box>
                                <IconButton size="small" sx={{ mr: 1 }}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" onClick={onClose}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>

                        {/* Contact Information */}
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Email
                                </Typography>
                                <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                                    {member?.email || 'N/A'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Phone number
                                </Typography>
                                <Typography variant="body1">{member?.phone_number || '(Not Provided)'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Joined
                                </Typography>
                                <Typography variant="body1">{member?.user_detail?.members?.[0]?.created_at ? new Date(member.user_detail.members[0].created_at).toLocaleDateString() : 'N/A'}</Typography>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Member Type Section */}
                    <Box sx={{ px: 3, py: 2 }}>
                        <Typography variant="body1" sx={{ mb: 1.5, fontWeight: 500 }}>
                            Member Type{member?.user_detail?.members?.[0]?.member_type?.name}
                        </Typography>
                        {memberTypes.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No member types available
                            </Typography>
                        ) : (
                            <RadioGroup row name="member-type-radio-group" value={member?.user_detail?.members?.[0]?.member_type?.name} onChange={handleMemberTypeChange}>
                                {/* {memberTypes.map((type) => ( */}
                                <FormControlLabel
                                    key={member?.user_detail?.members?.[0]?.member_type?.id}
                                    value={member?.user_detail?.members?.[0]?.member_type?.name}
                                    control={
                                        <Radio
                                            sx={{
                                                '&.Mui-checked': {
                                                    color: '#1976d2',
                                                },
                                            }}
                                        />
                                    }
                                    label={member?.user_detail?.members?.[0]?.member_type?.name}
                                    sx={{
                                        mr: 2,
                                        border: '1px solid #e0e0e0',
                                        borderRadius: 1,
                                        px: 1,
                                        backgroundColor: memberType === member?.user_detail?.members?.[0]?.member_type?.name ? '#f8f9fa' : 'transparent',
                                    }}
                                />
                                {/* ))} */}
                            </RadioGroup>
                        )}
                    </Box>

                    {/* Member Status Section */}
                    <Box sx={{ px: 3, py: 2 }}>
                        <Card variant="outlined" sx={{ borderRadius: 1 }}>
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex' }}>
                                <div style={{ width: '250px' }}>
                                    <Typography variant="body1" sx={{ mb: 0.5, fontWeight: 500 }}>
                                        Member Status
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.8rem' }}>
                                        If deactivated, member will not get membership facilities
                                    </Typography>
                                </div>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Switch
                                        checked={memberStatus === 'Active'}
                                        onChange={(e) => setMemberStatus(e.target.checked ? 'Active' : 'In Active')}
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                color: '#1976d2',
                                            },
                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                backgroundColor: '#1976d2',
                                            },
                                        }}
                                    />
                                    <RadioGroup row name="member-status-radio-group" value={memberStatus} onChange={handleMemberStatusChange} sx={{ ml: 1 }}>
                                        <FormControlLabel value="Active" control={<Radio size="small" />} label="Active" sx={{ mr: 2 }} />
                                        <FormControlLabel value="In Active" control={<Radio size="small" />} label="In Active" sx={{ mr: 2 }} />
                                    </RadioGroup>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>

                    {/* Address Section */}
                    <Box sx={{ px: 3, py: 2, pb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                Address
                            </Typography>
                            <IconButton size="small">
                                <MoreVertIcon fontSize="small" />
                            </IconButton>
                        </Box>
                        <Typography variant="body1" sx={{ mb: 0.5 }}>
                            {member?.user_detail?.address?.street || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {member?.user_detail?.address?.city ? `${member.user_detail.address.city}, ${member.user_detail.address.state}, ${member.user_detail.address.country}` : 'Not Provided'}
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Drawer>
    );
};

export default MemberProfileModal;
