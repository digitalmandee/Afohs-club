import React from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Drawer,
    Grid,
    Container
} from '@mui/material';
import { Print, Close, Send } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';

const InvoiceSlip = ({ open, onClose, data }) => {
    // Use data prop or fallback to empty object to prevent errors
    const invoiceData = data ? {
        billTo: {
            name: data.user?.name || 'N/A', // Fallback if member name isn't provided
            category: data.subscription_type || 'Member',
            membershipId: data.member_id || 'N/A',
            contactNumber: data.user?.phone_number || 'N/A',
            city: data.city || 'N/A',
            familyMember: data.family_member || 'Non'
        },
        details: {
            invoiceNumber: data.invoice_no || 'N/A',
            issueDate: data.payment_date ? new Date(data.payment_date).toLocaleDateString() : 'N/A',
            paymentMethod: data.payment_method || 'N/A'
        },
        items: [
            {
                srNo: 1,
                description: data.subscription_type || 'Invoice Charges',
                invoiceAmount: data.amount || 0,
                remainingAmount: data.remaining_amount || 0, // Placeholder, adjust if available
                paidAmount: data.paid_amount || data.amount || 0 // Assume full amount paid if not specified
            }
        ],
        summary: {
            grandTotal: data.amount || 0,
            remainingAmount: data.remaining_amount || 0,
            paidAmount: data.paid_amount || data.amount || 0
        },
        note: 'This is the computer generated receipt. It does not require any signature or stamp.',
        paymentNote: 'If paid by credit card or cheque, 5% sub charges will be added to the total amount.',
        amountInWords: data.amount_in_words || 'N/A', // Fallback if not provided
        sentBy: data.sent_by || 'Admin'
    } : {
        billTo: {
            name: 'N/A',
            category: 'Member',
            membershipId: 'N/A',
            contactNumber: 'N/A',
            city: 'N/A',
            familyMember: 'Non'
        },
        details: {
            invoiceNumber: 'N/A',
            issueDate: 'N/A',
            paymentMethod: 'N/A'
        },
        items: [
            {
                srNo: 1,
                description: 'N/A',
                invoiceAmount: 0,
                remainingAmount: 0,
                paidAmount: 0
            }
        ],
        summary: {
            grandTotal: 0,
            remainingAmount: 0,
            paidAmount: 0
        },
        note: 'This is the computer generated receipt. It does not require any signature or stamp.',
        paymentNote: 'If paid by credit card or cheque, 5% sub charges will be added to the total amount.',
        amountInWords: 'N/A',
        sentBy: 'Admin'
    };

    return (
        <Drawer
            anchor="top"
            open={open}
            onClose={onClose}
            ModalProps={{
                keepMounted: true, // improves performance
            }}
            PaperProps={{
                sx: {
                    margin: '10px auto 0',
                    width: 930,
                    borderRadius: '8px',
                }
            }}
        >
            <Container maxWidth="md" sx={{ mt: 2, mb: 4 }}>
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: '4px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Header */}
                    <Grid container spacing={2} sx={{ mb: 4, pb: 2, borderBottom: '1px solid #f0f0f0' }}>
                        <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center' }}>
                            <img
                                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1c95d02f2c4a986d4f386920c76ff57c18c81985-YeMq5tNsLWF62HBaZY1Gz1HsT7RyLX.png"
                                alt="Afohs Club Logo"
                                style={{ height: '60px' }}
                            />
                        </Grid>
                        <Grid item xs={4} sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#003366', fontSize: '18px' }}>
                                Afohs Club
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#555', fontSize: '12px', lineHeight: 1.4 }}>
                                PAF Falcon complex, Gulberg III,<br />
                                Lahore, Pakistan
                            </Typography>
                        </Grid>
                        <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', fontSize: '18px' }}>
                                Invoice
                            </Typography>
                        </Grid>
                    </Grid>

                    {/* Bill To and Details Section */}
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={6}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, fontSize: '14px' }}>
                                Bill To
                            </Typography>
                            <Box sx={{ ml: 0 }}>
                                <Typography variant="body2" sx={{ mb: 0.5, fontSize: '13px' }}>
                                    <span style={{ fontWeight: 'bold' }}>Name : </span>{invoiceData.billTo.name}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 0.5, fontSize: '13px' }}>
                                    <span style={{ fontWeight: 'bold' }}>Category : </span>{invoiceData.billTo.category}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 0.5, fontSize: '13px' }}>
                                    <span style={{ fontWeight: 'bold' }}>Membership # : </span>{invoiceData.billTo.membershipId}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 0.5, fontSize: '13px' }}>
                                    <span style={{ fontWeight: 'bold' }}>Contact # : </span>{invoiceData.billTo.contactNumber}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 0.5, fontSize: '13px' }}>
                                    <span style={{ fontWeight: 'bold' }}>City : </span>{invoiceData.billTo.city}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 0.5, fontSize: '13px' }}>
                                    <span style={{ fontWeight: 'bold' }}>Family Member : </span>{invoiceData.billTo.familyMember}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, fontSize: '14px' }}>
                                DETAILS
                            </Typography>
                            <Box sx={{ ml: 0 }}>
                                <Typography variant="body2" sx={{ mb: 0.5, fontSize: '13px' }}>
                                    <span style={{ fontWeight: 'bold' }}>Invoice # : </span>{invoiceData.details.invoiceNumber}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 0.5, fontSize: '13px' }}>
                                    <span style={{ fontWeight: 'bold' }}>Issue Date : </span>{invoiceData.details.issueDate}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 0.5, fontSize: '13px' }}>
                                    <span style={{ fontWeight: 'bold' }}>Payment Method : </span>{invoiceData.details.paymentMethod}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Invoice Table */}
                    <TableContainer component={Paper} elevation={0} sx={{ mb: 3 }}>
                        <Table sx={{ minWidth: 650 }} size="small">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f9f9f9' }}>
                                    <TableCell sx={{ fontWeight: 'bold', fontSize: '13px', py: 1.5 }}>SR #</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', fontSize: '13px', py: 1.5 }}>Description</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', fontSize: '13px', py: 1.5 }}>Invoice Amount</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', fontSize: '13px', py: 1.5 }}>Remaining Amount</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', fontSize: '13px', py: 1.5 }}>Paid Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {invoiceData.items.map((item) => (
                                    <TableRow key={item.srNo}>
                                        <TableCell sx={{ fontSize: '13px', py: 1.5 }}>{item.srNo}</TableCell>
                                        <TableCell sx={{ fontSize: '13px', py: 1.5 }}>{item.description}</TableCell>
                                        <TableCell sx={{ fontSize: '13px', py: 1.5 }}>{item.invoiceAmount}</TableCell>
                                        <TableCell sx={{ fontSize: '13px', py: 1.5 }}>{item.remainingAmount}</TableCell>
                                        <TableCell sx={{ fontSize: '13px', py: 1.5 }}>{item.paidAmount}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Summary Section */}
                    <Grid container justifyContent="flex-end" sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ pt: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, borderBottom: '1px solid #eee', }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '13px' }}>
                                        Grand Total
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontSize: '13px' }}>
                                        Rs {invoiceData.summary.grandTotal.toFixed(0)}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, borderBottom: '1px solid #eee', }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '13px' }}>
                                        Remaining Amount
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontSize: '13px' }}>
                                        Rs {invoiceData.summary.remainingAmount.toFixed(2)}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, borderBottom: '1px solid #eee', }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '13px' }}>
                                        Paid Amount
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontSize: '13px' }}>
                                        Rs {invoiceData.summary.paidAmount}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Notes Section */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: '13px' }}>
                                Note:
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '13px' }}>
                                {invoiceData.note}
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: '13px' }}>
                                    Send By : {invoiceData.sentBy}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2" sx={{ fontSize: '13px' }}>
                                {invoiceData.paymentNote}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 0.5, fontSize: '13px' }}>
                                AMOUNT IN WORDS : {invoiceData.amountInWords}
                            </Typography>
                        </Grid>
                    </Grid>

                    {/* Action Buttons */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 1,
                        borderTop: '1px solid #eee',
                        pt: 2
                    }}>
                        <Button
                            variant="outlined"
                            sx={{
                                textTransform: 'none',
                                borderColor: '#ddd',
                                color: '#555',
                                '&:hover': {
                                    borderColor: '#bbb',
                                    backgroundColor: '#f5f5f5'
                                }
                            }}
                            onClick={onClose}
                        >
                            Close
                        </Button>
                        <Button
                            variant="outlined"
                            sx={{
                                textTransform: 'none',
                                borderColor: '#ddd',
                                color: '#555',
                                '&:hover': {
                                    borderColor: '#bbb',
                                    backgroundColor: '#f5f5f5'
                                }

                            }}
                        >
                            Send Remind
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Print />}
                            sx={{
                                textTransform: 'none',
                                backgroundColor: '#003366',
                                '&:hover': {
                                    backgroundColor: '#002244'
                                }

                            }}
                        >
                            Print
                        </Button>
                    </Box>
                </Paper>
            </Container >
        </Drawer >
    );
};

export default InvoiceSlip;
