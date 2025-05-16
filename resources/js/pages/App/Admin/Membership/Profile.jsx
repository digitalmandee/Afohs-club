import React, { useState } from 'react';
import {
    Box,
    Typography,
    Avatar,
    IconButton,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    Paper,
    Grid,
    Switch,
    Drawer,
    Card,
    CardContent,
} from '@mui/material';
import {
    Close as CloseIcon,
    Edit as EditIcon,
    MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';

const MemberProfileModal = ({ open, onClose, member }) => {
    // State for radio buttons
    const [memberType, setMemberType] = useState('Member');
    const [memberStatus, setMemberStatus] = useState('Active');

    // Handle member type change
    const handleMemberTypeChange = (event) => {
        setMemberType(event.target.value);
    };

    // Handle member status change
    const handleMemberStatusChange = (event) => {
        setMemberStatus(event.target.value);
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            ModalProps={{
                keepMounted: true, // improves performance
            }}
            PaperProps={{
                sx: {
                    width: 600,
                    marginTop: '20px',
                    marginBottom: '20px', // bottom margin
                    marginRight: '20px',  // right margin
                    borderRadius: '8px',  // optional: rounded corners
                    height: 'auto',
                    maxHeight: 'calc(100% - 40px)', // account for top + bottom margins
                }
            }}
        >
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width:'100%',
                px:2,
                py:2
            }}>
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 2,
                        overflow: 'hidden',
                        position: 'relative'
                    }}
                >
                    {/* Header with profile info */}
                    <Box sx={{ px: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar
                                    src="https://randomuser.me/api/portraits/men/32.jpg"
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        border: '2px solid #e0e0e0',
                                        mr: 2
                                    }}
                                />
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 500, mb: 0.5 }}>
                                        Zahid Ullah
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Member ID : AFOHS-12345
                                    </Typography>
                                </Box>
                            </Box>
                            <Box>
                                <IconButton size="small" sx={{ mr: 1 }}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small">
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>

                        {/* Contact Information */}
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            <Grid item xs={4}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Email
                                </Typography>
                                <Typography variant="body1">
                                    user@gmail.com
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Phone number
                                </Typography>
                                <Typography variant="body1">
                                    (702) 555-0122
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Joined
                                </Typography>
                                <Typography variant="body1">
                                    Apr 7, 2025
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Member Type Section */}
                    <Box sx={{ px: 3, py: 2 }}>
                        <Typography variant="body1" sx={{ mb: 1.5, fontWeight: 500 }}>
                            Member Type
                        </Typography>
                        <RadioGroup
                            row
                            name="member-type-radio-group"
                            value={memberType}
                            onChange={handleMemberTypeChange}
                        >
                            <FormControlLabel
                                value="Member"
                                control={
                                    <Radio
                                        sx={{
                                            '&.Mui-checked': {
                                                color: '#1976d2',
                                            },
                                        }}
                                    />
                                }
                                label="Member"
                                sx={{
                                    mr: 2,
                                    border: '1px solid #e0e0e0',
                                    borderRadius: 1,
                                    px: 1,
                                    backgroundColor: memberType === 'Member' ? '#f8f9fa' : 'transparent',
                                }}
                            />
                            <FormControlLabel
                                value="Affiliated Member"
                                control={
                                    <Radio
                                        sx={{
                                            '&.Mui-checked': {
                                                color: '#1976d2',
                                            },
                                        }}
                                    />
                                }
                                label="Affiliated Member"
                                sx={{
                                    mr: 2,
                                    border: '1px solid #e0e0e0',
                                    borderRadius: 1,
                                    px: 1,
                                    backgroundColor: memberType === 'Affiliated Member' ? '#f8f9fa' : 'transparent',
                                }}
                            />
                            <FormControlLabel
                                value="Applied Member"
                                control={
                                    <Radio
                                        sx={{
                                            '&.Mui-checked': {
                                                color: '#1976d2',
                                            },
                                        }}
                                    />
                                }
                                label="Applied Member"
                                sx={{
                                    border: '1px solid #e0e0e0',
                                    borderRadius: 1,
                                    px: 1,
                                    backgroundColor: memberType === 'Applied Member' ? '#f8f9fa' : 'transparent',
                                }}
                            />
                        </RadioGroup>
                    </Box>

                    {/* Member Status Section */}
                    <Box sx={{ px: 3, py: 2, }}>
                        <Card variant="outlined" sx={{ borderRadius: 1 }}>
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: "flex", }}>
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
                                    <RadioGroup
                                        row
                                        name="member-status-radio-group"
                                        value={memberStatus}
                                        onChange={handleMemberStatusChange}
                                        sx={{ ml: 1 }}
                                    >
                                        <FormControlLabel
                                            value="Active"
                                            control={<Radio size="small" />}
                                            label="Active"
                                            sx={{ mr: 2 }}
                                        />
                                        <FormControlLabel
                                            value="In Active"
                                            control={<Radio size="small" />}
                                            label="In Active"
                                            sx={{ mr: 2 }}
                                        />
                                        <FormControlLabel
                                            value="Expired"
                                            control={<Radio size="small" />}
                                            label="Expired"
                                        />
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
                            Jl. Gubeng Kertajaya 5c / 45
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Pakistan, Panjab, Lahore
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Drawer>
    );
};

export default MemberProfileModal;