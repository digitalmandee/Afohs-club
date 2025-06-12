import React from 'react';
import { Box, Card, CardContent, Typography, Avatar, Button, Stack, Drawer, Grid, styled } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';

const MembershipCard = styled(Card)(({ theme }) => ({
    maxWidth: 450,
    borderRadius: 12,
    boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
}));

const MembershipFooter = styled(Box)(({ theme }) => ({
    backgroundColor: '#0a3d62',
    color: 'white',
    padding: theme.spacing(2),
    textAlign: 'center',
}));

const SubscriptionCardComponent = ({ open, onClose, subscription }) => {
    if (!subscription) return null; // optionally handle null case
    // Debug: Log the member prop to verify its structure

    return (
        <Drawer
            anchor="top"
            open={open}
            onClose={onClose}
            ModalProps={{
                keepMounted: true, // Improves performance
            }}
            PaperProps={{
                sx: {
                    margin: '20px auto 0',
                    width: 600,
                    borderRadius: '8px',
                },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    py: 2,
                }}
            >
                <MembershipCard
                    sx={{
                        width: '100%',
                        maxWidth: 560,
                        border: '1px solid #E3E3E3',
                    }}
                >
                    <CardContent sx={{ px: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                            <img src="/assets/Logo.png" alt="AFOHS CLUB" style={{ height: 40 }} />
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={4}>
                                {/* <Avatar
                                    src={member?.profile_photo || '/placeholder.svg?height=120&width=100'}
                                    alt={member?.first_name || 'Member Photo'}
                                    sx={{
                                        width: 100,
                                        height: 120,
                                        borderRadius: 1,
                                        border: '1px solid #eee',
                                    }}
                                    variant="square"
                                /> */}
                                <Avatar
                                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1.PNG-DAILsdTgi3B4Lf6K9sR35Uu3o71eJ6.png"
                                    alt="Member Photo"
                                    sx={{
                                        width: 100,
                                        height: 120,
                                        borderRadius: 1,
                                        border: '1px solid #eee',
                                    }}
                                    variant="square"
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Name
                                    </Typography>
                                    <Typography variant="subtitle1" fontWeight="bold" color="#0a3d62">
                                        {subscription.user?.first_name ? subscription.user?.first_name + ' ' + subscription.user?.last_name : 'N/A'}
                                    </Typography>
                                </Box>
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Membership ID
                                    </Typography>
                                    <Typography variant="subtitle1" fontWeight="bold" color="#0a3d62">
                                        {subscription.user?.user_id || 'N/A'}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={4}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Valid Until
                                    </Typography>
                                    <Typography variant="subtitle1" fontWeight="bold" color="#0a3d62">
                                        {subscription?.expiry_date ? new Date(subscription?.expiry_date).toLocaleDateString() : 'N/A'}
                                    </Typography>
                                </Box>
                                <Box sx={{ mt: 1 }}>
                                    <img
                                        src={'/' + subscription?.qr_code}
                                        alt="QR Code"
                                        style={{
                                            width: 100,
                                            height: 100,
                                            objectFit: 'contain',
                                        }}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>

                    <MembershipFooter>
                        <Typography variant="h6" fontWeight="medium">
                            {subscription.category?.name || 'Member'} Subscription
                        </Typography>
                    </MembershipFooter>
                </MembershipCard>
            </Box>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="text" color="inherit" onClick={onClose}>
                    Close
                </Button>
                <Button variant="text" color="primary" disabled={subscription.status !== 'Expired' && subscription.status !== 'Suspend'}>
                    Send Remind
                </Button>
                <Button
                    variant="contained"
                    startIcon={<PrintIcon />}
                    sx={{
                        bgcolor: '#0a3d62',
                        '&:hover': {
                            bgcolor: '#0c2461',
                        },
                    }}
                >
                    Print
                </Button>
            </Box>
        </Drawer>
    );
};

export default SubscriptionCardComponent;
