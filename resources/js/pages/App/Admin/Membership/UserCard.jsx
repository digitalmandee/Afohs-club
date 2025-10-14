import React from 'react';
import { Box, Card, CardContent, Typography, Avatar, Button, Grid, styled, Drawer } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';

const MembershipCard = styled(Card)(() => ({
    width: '100%',
    marginLeft: 20,
    marginRight: 20,
    borderRadius: 12,
    boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
}));

const MembershipFooter = styled(Box)(() => ({
    backgroundColor: '#0a3d62',
    color: 'white',
    padding: 16,
    textAlign: 'center',
}));

const handlePrintMembershipCard = (member) => {
    if (!member) return;

    const printWindow = window.open('', '_blank');

    const content = `
        <!doctype html>
        <html>
        <head>
            <title>Membership Card</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    display: flex;
                    justify-content: center;
                    background-color: #f5f5f5;
                }
                .membership-card {
                    width: 560px;
                    border: 1px solid #e3e3e3;
                    border-radius: 12px;
                    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
                    background-color: white;
                    overflow: hidden;
                }
                .card-content {
                    padding: 24px;
                }
                .logo {
                    height: 40px;
                    margin-bottom: 16px;
                }
                .info-grid {
                    display: flex;
                    justify-content: space-between;
                    gap: 20px;
                }
                .avatar-section {
                    max-width: 100px;
                }
                .avatar {
                    width: 100px;
                    height: 120px;
                    border-radius: 4px;
                    border: 1px solid #eee;
                    object-fit: cover;
                }
                .qr-code {
                    width: 100px;
                    height: 100px;
                    object-fit: contain;
                    margin-top: 8px;
                }
                .label {
                    font-size: 12px;
                    color: #757575;
                    margin-bottom: 4px;
                }
                .value {
                    font-size: 16px;
                    font-weight: bold;
                    color: #0a3d62;
                    margin-bottom: 16px;
                }
                .footer {
                    background-color: #0a3d62;
                    color: white;
                    padding: 16px;
                    text-align: center;
                    font-size: 20px;
                    font-weight: 500;
                }
                @media print {
                    body {
                        background-color: white;
                        padding: 0;
                    }
                    .membership-card {
                        box-shadow: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="membership-card">
                <div class="card-content">
                    <img src="/assets/Logo.png" alt="AFOHS CLUB" class="logo" />
                    <div class="info-grid">
                        <div class="avatar-section">
                            <img src="${member?.profile_photo || '/placeholder.svg'}" alt="Member Photo" class="avatar" />
                        </div>
                        <div>
                            <div class="label">Name</div>
                            <div class="value">${member?.full_name || 'N/A'}</div>
                            <div class="label">Membership ID</div>
                            <div class="value">${member?.membership_no || 'N/A'}</div>
                        </div>
                        <div>
                            <div class="label">Valid Until</div>
                            <div class="value">${member?.card_expiry_date ? new Date(member.card_expiry_date).toLocaleDateString() : 'N/A'}</div>
                            <img src="/${member?.qr_code || ''}" alt="QR Code" class="qr-code" />
                        </div>
                    </div>
                </div>
                <div class="footer">Primary Member</div>
            </div>
        </body>
        </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
};

const MembershipCardComponent = ({ open, onClose, member }) => {
    return (
        <Drawer
            anchor="top"
            open={open}
            onClose={onClose}
            ModalProps={{ keepMounted: true }}
            PaperProps={{
                sx: {
                    margin: '20px auto 0',
                    width: 600,
                    borderRadius: '8px',
                },
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <MembershipCard>
                    <CardContent sx={{ px: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                            <img src="/assets/Logo.png" alt="AFOHS CLUB" style={{ height: 40 }} />
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={4}>
                                <Avatar src={member?.profile_photo} alt="Member Photo" sx={{ width: 100, height: 120, borderRadius: 1, border: '1px solid #eee' }} variant="square" />
                            </Grid>
                            <Grid item xs={4}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Name
                                    </Typography>
                                    <Typography variant="subtitle1" fontWeight="bold" color="#0a3d62">
                                        {member?.full_name || 'N/A'}
                                    </Typography>
                                </Box>
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Membership ID
                                    </Typography>
                                    <Typography variant="subtitle1" fontWeight="bold" color="#0a3d62">
                                        {member?.membership_no || 'N/A'}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={4}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Valid Until
                                    </Typography>
                                    <Typography variant="subtitle1" fontWeight="bold" color="#0a3d62">
                                        {member?.card_expiry_date ? new Date(member.card_expiry_date).toLocaleDateString() : 'N/A'}
                                    </Typography>
                                </Box>
                                <Box sx={{ mt: 1 }}>
                                    <img src={'/' + member?.qr_code} alt="QR Code" style={{ width: 100, height: 100, objectFit: 'contain' }} />
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                    <MembershipFooter>
                        <Typography variant="h6" fontWeight="medium">
                            Primary Member
                        </Typography>
                    </MembershipFooter>
                </MembershipCard>
            </Box>

            {member?.is_document_enabled && (
                <Typography display="flex" justifyContent="center" alignItems="center" variant="caption" color="error">
                    Document is Missing
                </Typography>
            )}

            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="text" color="inherit" onClick={onClose}>
                    Close
                </Button>
                <Button variant="text" color="primary" disabled={member?.card_status !== 'Expired' && member?.card_status !== 'Suspend'}>
                    Send Remind
                </Button>
                <Button onClick={() => handlePrintMembershipCard(member)} variant="contained" disabled={member?.is_document_enabled} startIcon={<PrintIcon />} sx={{ bgcolor: '#0a3d62', '&:hover': { bgcolor: '#0c2461' } }}>
                    Print
                </Button>
            </Box>
        </Drawer>
    );
};

export default MembershipCardComponent;
