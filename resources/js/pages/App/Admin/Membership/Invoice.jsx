import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Drawer, Grid, Container } from '@mui/material';
import { Print, Close, Send } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { toWords } from 'number-to-words';

const handlePrintReceipt = (invoice) => {
    if (!invoice) return;

    // Map data to invoiceData for consistency with JSX
    const invoiceData = {
        billTo: {
            name: invoice.customer?.first_name || 'N/A',
            category: invoice.customer?.member?.member_type?.name || 'Member',
            membershipId: invoice.customer?.user_id || 'N/A',
            contactNumber: invoice.customer?.phone_number || 'N/A',
            city: invoice.customer.user_detail?.current_city || 'N/A',
            familyMember: 'Non',
        },
        details: {
            invoiceNumber: '7171',
            issueDate: invoice.customer?.member?.card_expiry_date,
            paymentMethod: 'On Cash',
        },
        items: [
            {
                srNo: 0,
                description: 'Member Charges',
                invoiceAmount: 0,
                remainingAmount: 0,
                paidAmount: 0,
            },
        ],
        summary: {
            grandTotal: invoice.total_price,
            remainingAmount: invoice.customer_charges,
            paidAmount: invoice.total_price,
        },
        note: 'This is a computer-generated receipt. It does not require any signature or stamp.',
        paymentNote: 'If paid by credit card or cheque, 5% surcharge will be added to the total amount.',
        amountInWords: 'Zero',
        sentBy: 'Admin',
    };

    const printWindow = window.open('', '_blank');

    const content = `
        <html>
          <head>
            <title>Invoice</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; max-width: 930px; margin: 0 auto; }
              .container { margin-top: 16px; margin-bottom: 32px; }
              .paper { border-radius: 4px; position: relative; overflow: hidden; }
              .grid-container { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 1px solid #f0f0f0; }
              .grid-item { flex: 1; min-width: 0; }
              .grid-item-left { flex: 0 0 33.33%; display: flex; align-items: center; }
              .grid-item-center { flex: 0 0 33.33%; text-align: center; }
              .grid-item-right { flex: 0 0 33.33%; display: flex; justify-content: flex-end; align-items: center; }
              .logo { height: 60px; }
              .typography-h6 { font-size: 18px; font-weight: bold; }
              .typography-body2 { font-size: 12px; color: #555; line-height: 1.4; }
              .typography-body2-bold { font-size: 13px; font-weight: bold; }
              .grid-container-details { display: flex; gap: 16px; margin-bottom: 32px; }
              .grid-item-half { flex: 0 0 50%; }
              .subtitle1 { font-size: 14px; font-weight: bold; margin-bottom: 8px; }
              .table-container { margin-bottom: 24px; }
              .table { width: 100%; border-collapse: collapse; font-size: 13px; }
              .table-head { background-color: #f9f9f9; }
              .table-cell { padding: 12px; font-weight: bold; }
              .table-body-cell { padding: 12px; }
              .summary-container { display: flex; justify-content: flex-end; margin-bottom: 24px; }
              .summary-box { width: 33.33%; padding-top: 8px; }
              .summary-row { display: flex; justify-content: space-between; margin-bottom: 16px; border-bottom: 1px solid #eee; }
              .notes-container { display: flex; gap: 16px; margin-bottom: 24px; }
              .notes-item { flex: 0 0 50%; }
              .amount-in-words { font-size: 13px; font-weight: bold; margin-top: 4px; text-transform: uppercase; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="paper">
                <!-- Header -->
                <div class="grid-container">
                  <div class="grid-item-left">
                    <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1c95d02f2c4a986d4f386920c76ff57c18c81985-YeMq5tNsLWF62HBaZY1Gz1HsT7RyLX.png" alt="Afohs Club Logo" class="logo"/>
                  </div>
                  <div class="grid-item-center">
                    <div class="typography-h6" style="color: #003366;">Afohs Club</div>
                    <div class="typography-body2">
                      PAF Falcon complex, Gulberg III,<br />
                      Lahore, Pakistan
                    </div>
                  </div>
                  <div class="grid-item-center">
                    <div class="typography-h6" style="color: #333;">Invoice</div>
                  </div>
                </div>

                <!-- Bill To and Details Section -->
                <div class="grid-container-details">
                  <div class="grid-item-half">
                    <div class="subtitle1">Bill To ${invoiceData.billTo.membershipId !== 'N/A' ? '- ' + invoiceData.billTo.membershipId : ''}</div>
                    <div>
                      <div class="typography-body2" style="margin-bottom: 4px;">
                        <span style="font-weight: bold;">Name: </span>${invoiceData.billTo.name}
                      </div>
                      <div class="typography-body2" style="margin-bottom: 4px;">
                        <span style="font-weight: bold;">Category: </span>${invoiceData.billTo.category}
                      </div>
                      <div class="typography-body2" style="margin-bottom: 4px;">
                        <span style="font-weight: bold;">Membership #: </span>${invoiceData.billTo.membershipId}
                      </div>
                      <div class="typography-body2" style="margin-bottom: 4px;">
                        <span style="font-weight: bold;">Contact #: </span>${invoiceData.billTo.contactNumber}
                      </div>
                      <div class="typography-body2" style="margin-bottom: 4px;">
                        <span style="font-weight: bold;">City: </span>${invoiceData.billTo.city}
                      </div>
                      <div class="typography-body2" style="margin-bottom: 4px;">
                        <span style="font-weight: bold;">Family Member: </span>${invoiceData.billTo.familyMember}
                      </div>
                    </div>
                  </div>
                  <div class="grid-item-half">
                    <div class="subtitle1">DETAILS</div>
                    <div>
                      <div class="typography-body2" style="margin-bottom: 4px;">
                        <span style="font-weight: bold;">Invoice #: </span>${invoiceData.details.invoiceNumber}
                      </div>
                      <div class="typography-body2" style="margin-bottom: 4px;">
                        <span style="font-weight: bold;">Issue Date: </span>${new Date(invoiceData.details.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                      <div class="typography-body2" style="margin-bottom: 4px;">
                        <span style="font-weight: bold;">Payment Method: </span>${invoiceData.details.paymentMethod}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Invoice Table -->
                <div class="table-container">
                  <table class="table">
                    <thead class="table-head">
                      <tr>
                        <th class="table-cell">SR #</th>
                        <th class="table-cell">Description</th>
                        <th class="table-cell">Invoice Amount</th>
                        <th class="table-cell">Remaining Amount</th>
                        <th class="table-cell">Paid Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                        <tr>
                          <td class="table-body-cell">${invoice.invoice_number}</td>
                          <td class="table-body-cell">${invoice.member_type?.name}</td>
                          <td class="table-body-cell">${invoice.total_amount}</td>
                          <td class="table-body-cell">${invoice.customer_charges}</td>
                          <td class="table-body-cell">${invoice.amount_paid}</td>
                        </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Summary Section -->
                <div class="summary-container">
                  <div class="summary-box">
                    <div class="summary-row">
                      <span class="typography-body2-bold">Grand Total</span>
                      <span class="typography-body2">Rs ${invoice.total_amount}</span>
                    </div>
                    <div class="summary-row">
                      <span class="typography-body2-bold">Remaining Amount</span>
                      <span class="typography-body2">Rs ${invoice.customer_charges}</span>
                    </div>
                    <div class="summary-row">
                      <span class="typography-body2-bold">Paid Amount</span>
                      <span class="typography-body2">Rs ${invoice.amount_paid}</span>
                    </div>
                  </div>
                </div>

                <!-- Notes Section -->
                <div class="notes-container">
                  <div class="notes-item">
                    <div class="typography-body2-bold" style="margin-bottom: 4px;">Note:</div>
                    <div class="typography-body2">This is a computer-generated receipt. It does not require any signature or stamp.</div>
                    <div style="margin-top: 16px;">
                      <div class="typography-body2-bold" style="margin-bottom: 4px;">Sent By: Admin</div>
                    </div>
                  </div>
                  <div class="notes-item">
                    <div class="typography-body2">If paid by credit card or cheque, 5% surcharge will be added to the total amount.</div>
                    <div class="amount-in-words">AMOUNT IN WORDS: ${toWords(invoice.total_amount)}</div>
                  </div>
                </div>
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
    }, 250);
};

const InvoiceSlip = ({ open, onClose, invoiceNo }) => {
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    // Debug member prop
    useEffect(() => {
        if (open && invoiceNo) {
            setLoading(true);
            axios
                .get(route('financial-invoice', invoiceNo))
                .then((response) => {
                    setInvoice(response.data.invoice);
                    console.log('InvoiceSlip response:', response.data.invoice);
                })
                .catch((error) => {
                    console.error('InvoiceSlip error:', error);
                })
                .finally(() => {
                    setLoading(false);
                });
            // console.log('InvoiceSlip member:', JSON.stringify(member, null, 2));
        }
    }, [open, invoiceNo]);

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
                },
            }}
        >
            <Container maxWidth="md" sx={{ mt: 2, mb: 4 }}>
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: '4px',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {/* Header */}
                    <Grid container spacing={2} sx={{ mb: 4, pb: 2, borderBottom: '1px solid #f0f0f0' }}>
                        <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center' }}>
                            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1c95d02f2c4a986d4f386920c76ff57c18c81985-YeMq5tNsLWF62HBaZY1Gz1HsT7RyLX.png" alt="Afohs Club Logo" style={{ height: '60px' }} />
                        </Grid>
                        <Grid item xs={4} sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#003366', fontSize: '18px' }}>
                                Afohs Club
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#555', fontSize: '12px', lineHeight: 1.4 }}>
                                PAF Falcon complex, Gulberg III,
                                <br />
                                Lahore, Pakistan
                            </Typography>
                        </Grid>
                        <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', fontSize: '18px' }}>
                                Invoice
                            </Typography>
                        </Grid>
                    </Grid>

                    {loading ? (
                        'Loading...'
                    ) : invoice ? (
                        <>
                            {/* Bill To and Details Section */}
                            <Grid container spacing={2} sx={{ mb: 4 }}>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, fontSize: '14px' }}>
                                        Bill To {invoice.customer?.user_id ? `- ${invoice.customer.user_id}` : ''}
                                    </Typography>
                                    <Box sx={{ ml: 0 }}>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '13px' }}>
                                            <span style={{ fontWeight: 'bold' }}>Name: </span>
                                            {invoice.customer.first_name} {invoice.customer.middle_name} {invoice.customer.last_name}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '13px' }}>
                                            <span style={{ fontWeight: 'bold' }}>Category: </span>
                                            {invoice.customer?.member?.member_type?.name}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '13px' }}>
                                            <span style={{ fontWeight: 'bold' }}>Membership #: </span>
                                            {invoice.customer.user_id}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '13px' }}>
                                            <span style={{ fontWeight: 'bold' }}>Contact #: </span>
                                            {invoice.customer.phone_number}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '13px' }}>
                                            <span style={{ fontWeight: 'bold' }}>City: </span>
                                            {invoice.customer?.user_detail?.current_city}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '13px' }}>
                                            <span style={{ fontWeight: 'bold' }}>Family Member: </span>
                                            {invoice.customer?.family_members_count ?? 0}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, fontSize: '14px' }}>
                                        DETAILS
                                    </Typography>
                                    <Box sx={{ ml: 0 }}>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '13px' }}>
                                            <span style={{ fontWeight: 'bold' }}>Invoice #: </span>
                                            {invoice.invoice_no}
                                            {/* <pre>{JSON.stringify(invoice, null, 2)}</pre> */}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '13px' }}>
                                            <span style={{ fontWeight: 'bold' }}>Issue Date: </span>
                                            {new Date(invoice.issue_date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '13px' }}>
                                            <span style={{ fontWeight: 'bold' }}>Payment Method: </span>
                                            {invoice.payment_method?.replace('_', ' ') || 'Cash'}
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
                                        {invoice.data.map((item, index) => (
                                            <TableRow>
                                                <TableCell sx={{ fontSize: '13px', py: 1.5 }}>{index + 1}</TableCell>
                                                <TableCell sx={{ fontSize: '13px', py: 1.5 }}>{item?.name || item?.category?.name}</TableCell>
                                                <TableCell sx={{ fontSize: '13px', py: 1.5 }}>{item.amount}</TableCell>
                                                <TableCell sx={{ fontSize: '13px', py: 1.5 }}>{invoice.customer_charges}</TableCell>
                                                <TableCell sx={{ fontSize: '13px', py: 1.5 }}>{invoice.status === 'paid' || invoice.status === 'overdue' ? item.amount : 0}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* Summary Section */}
                            <Grid container justifyContent="flex-end" sx={{ mb: 3 }}>
                                <Grid item xs={12} sm={6} md={4}>
                                    <Box sx={{ pt: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, borderBottom: '1px solid #eee' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '13px' }}>
                                                Grand Total
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontSize: '13px' }}>
                                                Rs {invoice.total_price}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, borderBottom: '1px solid #eee' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '13px' }}>
                                                Remaining Amount
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontSize: '13px' }}>
                                                Rs {invoice.customer_charges}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, borderBottom: '1px solid #eee' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '13px' }}>
                                                Paid Amount
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontSize: '13px' }}>
                                                Rs {invoice.status === 'paid' ? invoice.total_price : 0}
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
                                        This is a computer-generated receipt. It does not require any signature or stamp.
                                    </Typography>
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: '13px' }}>
                                            Admin
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" sx={{ fontSize: '13px' }}>
                                        If paid by credit card or cheque, 5% surcharge will be added to the total amount.
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 0.5, textTransform: 'uppercase', fontSize: '13px' }}>
                                        AMOUNT IN WORDS: {toWords(invoice.total_price)}
                                    </Typography>
                                </Grid>
                            </Grid>

                            {/* Action Buttons */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: 1,
                                    borderTop: '1px solid #eee',
                                    pt: 2,
                                }}
                            >
                                <Button
                                    variant="outlined"
                                    sx={{
                                        textTransform: 'none',
                                        borderColor: '#ddd',
                                        color: '#555',
                                        '&:hover': {
                                            borderColor: '#bbb',
                                            backgroundColor: '#f5f5f5',
                                        },
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
                                            backgroundColor: '#f5f5f5',
                                        },
                                    }}
                                >
                                    Send Remind
                                </Button>
                                <Button
                                    onClick={() => handlePrintReceipt(invoice)}
                                    variant="contained"
                                    startIcon={<Print />}
                                    sx={{
                                        textTransform: 'none',
                                        backgroundColor: '#003366',
                                        '&:hover': {
                                            backgroundColor: '#002244',
                                        },
                                    }}
                                >
                                    Print
                                </Button>
                            </Box>
                        </>
                    ) : (
                        ''
                    )}
                </Paper>
            </Container>
        </Drawer>
    );
};

export default InvoiceSlip;
