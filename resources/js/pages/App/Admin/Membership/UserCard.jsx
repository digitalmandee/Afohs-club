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
    // maxWidth: 560,
    // width: '100%',
    // margin: '0 auto',   // center the card horizontally
    // borderRadius: 12,
    // boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
    // overflow: 'hidden',
}));

const MembershipFooter = styled(Box)(() => ({
    backgroundColor: '#0a3d62',
    color: 'white',
    padding: 10,
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
                    padding: 10px;
                    display: flex;
                    justify-content: center;
                    background-color: #f5f5f5;
                }

                .membership-card {
                    width: 400px;
                    border: 1px solid #e3e3e3;
                    border-radius: 12px;
                    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
                    background-color: white;
                    overflow: hidden;
                }

                .content {
                    padding: 16px 0;
                }

                .row {
                    display: flex;
                    width: 100%;
                }

                .col {
                    width: 33.33%;
                    display: flex;
                    flex-direction: column;
                }

                /* LEFT COLUMN (Avatar + Name) */
                .left {
                    padding-left: 20px;
                    padding-top: 56px;
                    align-items: flex-start;
                }

                .avatar {
                    width: 70px;
                    height: 70px;
                    border-radius: 4px;
                    border: 1px solid #0a3d62;
                    object-fit: cover;
                }

                .name {
                    font-size: 14px;
                    font-weight: bold;
                    color: #0a3d62;
                    margin-top: 8px;
                }

                /* CENTER COLUMN (Logo + Membership ID) */
                .center {
                    justify-content: center;
                    align-items: center;
                }

                .logo {
                    height: 100px;
                }

                .label {
                    margin-top: 32px;
                    font-size: 12px;
                    color: gray;
                }

                .value {
                    font-size: 16px;
                    font-weight: bold;
                    color: #0a3d62;
                }

                /* RIGHT COLUMN (QR + Valid Until) */
                .right {
    padding-right: 20px;
    padding-top: 56px;
    align-items: flex-end;
}

.qr {
    width: 60px;
    height: 60px;
    border-radius: 4px;
    border: 'none';
    object-fit: contain;
}

/* Global label style */
.label {
    font-size: 12px;
    color: gray;
}

/* Only this label (under QR) gets spacing */
.label-valid-until {
    margin-top: 16px;   /* <-- your required padding from top */
}

.value {
    font-size: 16px;
    font-weight: bold;
    color: #0a3d62;
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
                <div class="content">
                    <div class="row">

                        <!-- LEFT COLUMN -->
                        <div class="col left">
                            <img class="avatar" src="${member?.profile_photo?.file_path || "/placeholder.svg"}" />
                            <div class="name">${member?.full_name || "N/A"}</div>
                        </div>

                        <!-- CENTER COLUMN -->
                        <div class="col center">
                            <img src="/assets/Logo.png" class="logo" />
                            <div class="label">Membership ID</div>
                            <div class="value">${member?.membership_no || "N/A"}</div>
                        </div>

                        <!-- RIGHT COLUMN -->
                        <div class="col right">
                            <img src="/${member?.qr_code || ""}" class="qr" />
                            <div class="label label-valid-until">Valid Until</div>
                            <div class="value">
                                ${member?.card_expiry_date
            ? new Date(member.card_expiry_date).toLocaleDateString()
            : "N/A"}
                            </div>
                        </div>

                    </div>
                </div>

                <div class="footer">
                    ${member?.parent_id ? "Supplementary Member" : "Primary Member"}
                </div>
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
                    width: 500,
                    borderRadius: '8px',
                },
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <MembershipCard>
                    <CardContent sx={{ py: 2 }}>
                        <Grid container spacing={0} sx={{ width: "100%", m: 0 }}>
                            <Grid item xs={12} sm={4}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', pt: 7, pl: 1 }}>
                                    <Avatar src={member?.profile_photo?.file_path} alt="Member Photo" sx={{
                                        width: 100, height: 100, borderRadius: 1, border: '1px solid #0a3d62', objectFit: 'cover', objectPosition: 'center'}} variant="square" />
                                    <Typography sx={{ fontSize: "14px", fontWeight: "bold" }} color="#0a3d62">
                                        {member?.full_name || 'N/A'}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                                        <img src="/assets/Logo.png" alt="AFOHS CLUB" style={{ height: 120 }} />
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ pt: 4 }}>
                                        Membership ID
                                    </Typography>
                                    <Typography variant="subtitle1" fontWeight="bold" color="#0a3d62">
                                        {member?.membership_no || 'N/A'}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', pr: 1, pt: 7 }}>
                                    <img src={'/' + member?.qr_code} alt="QR Code" style={{ width: 80, height: 80, p: 1, borderRadius: 1 }} />
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                                        Valid Until
                                    </Typography>
                                    <Typography variant="subtitle1" fontWeight="bold" color="#0a3d62">
                                        {member?.card_expiry_date
                                            ? (() => {
                                                const d = new Date(member.card_expiry_date);
                                                const month = String(d.getMonth() + 1).padStart(2, '0');
                                                const year = d.getFullYear();
                                                return `${month}/${year}`;
                                            })()
                                            : 'N/A'}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                    <MembershipFooter>
                        <Typography variant="h6" fontWeight="medium">
                            {member?.parent_id ? 'Supplementary Member' : 'Primary Member'}
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
