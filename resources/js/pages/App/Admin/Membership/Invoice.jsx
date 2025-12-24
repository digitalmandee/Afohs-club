import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Drawer, Grid, Container } from '@mui/material';
import { Print, Close, Send } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { toWords } from 'number-to-words';
import dayjs from 'dayjs';

const handlePrintReceipt = (invoice) => {
    if (!invoice) return;

    const isSingleInvoiceWithItems = invoice.data?.items && invoice.data.items.length > 0;
    const itemsList = isSingleInvoiceWithItems ? invoice.data.items : invoice.related_invoices && invoice.related_invoices.length > 0 ? invoice.related_invoices : [invoice];

    let subTotal = 0,
        taxTotal = 0,
        overdueTotal = 0,
        additionalTotal = 0,
        grandTotal = 0,
        paidTotal = 0,
        remainingTotal = 0,
        discountTotal = 0;

    if (itemsList.length > 0) {
        // Calculate Subtotal (Gross Sum of Original Amounts)
        subTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.original_amount || item.amount) || 0), 0);

        // Calculate Discount Total
        discountTotal = itemsList.reduce((sum, item) => {
            const original = parseFloat(item.original_amount || item.amount) || 0;
            const net = parseFloat(item.amount) || 0;
            return sum + (original - net);
        }, 0);

        if (isSingleInvoiceWithItems) {
            const itemsNetSum = itemsList.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

            taxTotal = parseFloat(invoice.tax_amount || 0);
            overdueTotal = parseFloat(invoice.overdue_amount || 0);
            additionalTotal = parseFloat(invoice.additional_charges || 0);

            // Grand Total = Items Net + Tax + Overdue + Additional
            grandTotal = itemsNetSum + taxTotal + overdueTotal + additionalTotal;
            // Check if backend provided total_price differs (e.g. strict equality), but calculated is safer for display consistency
            // grandTotal = parseFloat(invoice.total_price);

            paidTotal = parseFloat(invoice.paid_amount || 0);
            remainingTotal = parseFloat(invoice.customer_charges || 0);
        } else {
            // Legacy Multi-Invoice
            taxTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.tax_amount) || 0), 0);
            overdueTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.overdue_amount) || 0), 0);
            additionalTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.additional_charges) || 0), 0);
            grandTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);
            paidTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.paid_amount) || 0), 0);
            remainingTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.customer_charges) || 0), 0);
        }
    } else {
        grandTotal = parseFloat(invoice.total_price || 0);
        subTotal = parseFloat(invoice.amount || 0);
        paidTotal = parseFloat(invoice.paid_amount || 0);
        remainingTotal = parseFloat(invoice.customer_charges || 0);
    }

    // Map data to invoiceData for consistency with JSX
    const invoiceData = {
        billTo: {
            name: invoice.member?.full_name || 'N/A',
            category: invoice.member?.member_type?.name || 'Member',
            membershipId: invoice.member?.membership_no || 'N/A',
            contactNumber: invoice.member?.mobile_number_a || 'N/A',
            city: invoice.member?.current_city || 'N/A',
            familyMember: 'Non',
        },
        details: {
            invoiceNumber: invoice.invoice_no || 'N/A',
            issueDate: invoice.issue_date,
            paymentMethod: invoice.payment_method,
            validFrom: invoice.fee_type === 'subscription_fee' || invoice.fee_type === 'maintenance_fee' ? invoice.valid_from : null,
            validTo: invoice.fee_type === 'subscription_fee' || invoice.fee_type === 'maintenance_fee' ? invoice.valid_to : null,
        },
        items: itemsList.map((item, index) => ({
            srNo: index + 1,
            description: item.description || item.invoice_type,
            subscriptionType: item.subscriptionType?.name || item.subscription_type_name || 'N/A',
            subscriptionCategory: item.subscriptionCategory?.name || item.subscription_category_name || 'N/A',
            originalAmount: item.original_amount || item.amount,
            discount: item.original_amount && item.amount ? parseFloat(item.original_amount) - parseFloat(item.amount) : 0,
            invoiceAmount: item.amount,
            remainingAmount: isSingleInvoiceWithItems ? invoice.customer_charges : item.customer_charges,
            paidAmount: isSingleInvoiceWithItems ? (invoice.status === 'paid' ? item.amount : 0) : item.status === 'paid' || item.status === 'overdue' ? item.paid_amount : 0,
            itemType: item.fee_type || item.invoice_type,
        })),
        summary: {
            subTotal: subTotal,
            discountTotal: discountTotal,
            grandTotal: grandTotal,
            remainingAmount: remainingTotal,
            paidAmount: paidTotal,
            taxAmount: taxTotal,
            taxPercentage: invoice.tax_percentage || 0,
            overdueAmount: overdueTotal,
            overduePercentage: invoice.overdue_percentage || 0,
            additionalCharges: additionalTotal,
            remarks: invoice.remarks || '',
        },
        note: 'This is a computer-generated receipt. It does not require any signature or stamp.',
        paymentNote: 'If paid by credit card or cheque, 5% surcharge will be added to the total amount.',
        amountInWords: toWords(grandTotal),
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
                  <div class="grid-item-right">
                    <div style="text-align: right;">
                        <div class="typography-h6" style="color: #333;">Invoice</div>
                        <div style="
                            margin-top: 4px;
                            font-size: 14px;
                            font-weight: bold;
                            color: ${invoice.status === 'paid' ? '#155724' : invoice.status === 'checked_in' ? '#004085' : invoice.status === 'checked_out' ? '#0c5460' : '#721c24'};
                            background-color: ${invoice.status === 'paid' ? '#d4edda' : invoice.status === 'checked_in' ? '#cce5ff' : invoice.status === 'checked_out' ? '#d1ecf1' : '#f8d7da'};
                            text-transform: uppercase;
                            border: 1px solid ${invoice.status === 'paid' ? '#c3e6cb' : invoice.status === 'checked_in' ? '#b8daff' : invoice.status === 'checked_out' ? '#bee5eb' : '#f5c6cb'};
                            padding: 2px 8px;
                            display: inline-block;
                            border-radius: 4px;
                        ">
                            ${(invoice.status || 'Unpaid').replace(/_/g, ' ')}
                        </div>
                    </div>
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
                        <span style="font-weight: bold;">Membership #: </span>${invoiceData.billTo.membershipId}
                      </div>
                      <div class="typography-body2" style="margin-bottom: 4px;">
                        <span style="font-weight: bold;">Contact #: </span>${invoiceData.billTo.contactNumber}
                      </div>
                      <div class="typography-body2" style="margin-bottom: 4px;">
                        <span style="font-weight: bold;">City: </span>${invoiceData.billTo.city}
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
                      ${
                          invoiceData.details.validFrom
                              ? `
                      <div class="typography-body2" style="margin-bottom: 4px;">
                        <span style="font-weight: bold;">From: </span>${new Date(invoiceData.details.validFrom).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>`
                              : ''
                      }
                      ${
                          invoiceData.details.validTo
                              ? `
                      <div class="typography-body2" style="margin-bottom: 4px;">
                        <span style="font-weight: bold;">To: </span>
                        <span style="color: ${new Date(invoiceData.details.validTo) > new Date() ? '#28a745' : '#dc3545'}; font-weight: 500;">
                          ${new Date(invoiceData.details.validTo).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>`
                              : ''
                      }
                      ${
                          invoiceData.details.validFrom && invoiceData.details.validTo
                              ? `
                      <div class="typography-body2" style="margin-bottom: 4px;">
                        <span style="font-weight: bold;">Number of days: </span>${dayjs(invoiceData.details.validTo).diff(dayjs(invoiceData.details.validFrom), 'day') + 1}
                      </div>`
                              : ''
                      }
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
                        ${
                            invoice.fee_type === 'subscription_fee'
                                ? `
                        <th class="table-cell">Type</th>
                        <th class="table-cell">Category</th>
                        <th class="table-cell">Fee</th>
                        <th class="table-cell">Disc</th>
                        `
                                : ''
                        }
                        <th class="table-cell">Net Amount</th>
                        <th class="table-cell">Remaining Amount</th>
                        <th class="table-cell">Paid Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                        ${invoiceData.items
                            .map(
                                (item) => `
                        <tr>
                          <td class="table-body-cell">${item.srNo}</td>
                          <td class="table-body-cell">${item.description}</td>
                          ${
                              invoice.fee_type === 'subscription_fee'
                                  ? `
                          <td class="table-body-cell">${item.subscriptionType}</td>
                          <td class="table-body-cell">${item.subscriptionCategory}</td>
                          <td class="table-body-cell">${item.originalAmount}</td>
                          <td class="table-body-cell">${item.discount}</td>
                          `
                                  : ''
                          }
                          <td class="table-body-cell">${item.invoiceAmount}</td>
                          <td class="table-body-cell">${item.remainingAmount}</td>
                          <td class="table-body-cell">${item.paidAmount}</td>
                        </tr>
                        `,
                            )
                            .join('')}
                    </tbody>
                  </table>
                </div>

                <!-- Summary Section -->
                <div class="summary-container">
                  <div class="summary-box">
                    <div class="summary-row">
                      <span class="typography-body2-bold">Subtotal</span>
                      <span class="typography-body2">Rs ${invoiceData.summary.subTotal}</span>
                    </div>
                    ${
                        invoiceData.summary.discountTotal > 0
                            ? `
                    <div class="summary-row">
                      <span class="typography-body2-bold">Discount</span>
                      <span class="typography-body2" style="color: #d32f2f;">- Rs ${invoiceData.summary.discountTotal}</span>
                    </div>`
                            : ''
                    }
                    <div class="summary-row">
                      <span class="typography-body2-bold">Grand Total</span>
                      <span class="typography-body2">Rs ${invoiceData.summary.grandTotal}</span>
                    </div>
                    ${
                        invoiceData.summary.taxAmount > 0
                            ? `
                    <div class="summary-row">
                      <span class="typography-body2-bold">Tax (${invoiceData.summary.taxPercentage}%)</span>
                      <span class="typography-body2">Rs ${invoiceData.summary.taxAmount}</span>
                    </div>`
                            : ''
                    }
                    ${
                        invoiceData.summary.overdueAmount > 0
                            ? `
                    <div class="summary-row">
                      <span class="typography-body2-bold">Overdue (${invoiceData.summary.overduePercentage}%)</span>
                      <span class="typography-body2">Rs ${invoiceData.summary.overdueAmount}</span>
                    </div>`
                            : ''
                    }
                    ${
                        invoiceData.summary.additionalCharges > 0
                            ? `
                    <div class="summary-row">
                      <span class="typography-body2-bold">Additional Charges</span>
                      <span class="typography-body2">Rs ${invoiceData.summary.additionalCharges}</span>
                    </div>`
                            : ''
                    }
                    <div class="summary-row">
                      <span class="typography-body2-bold">Remaining Amount</span>
                      <span class="typography-body2">Rs ${invoiceData.summary.remainingAmount}</span>
                    </div>
                    <div class="summary-row">
                      <span class="typography-body2-bold">Paid Amount</span>
                      <span class="typography-body2">Rs ${invoiceData.summary.paidAmount}</span>
                    </div>
                  </div>
                </div>

                <!-- Notes Section -->
                <div class="notes-container">
                  <div class="notes-item">
                    <div class="typography-body2-bold" style="margin-bottom: 4px;">Note:</div>
                    <div class="typography-body2">This is a computer-generated receipt. It does not require any signature or stamp.</div>
                    ${
                        invoiceData.summary.remarks
                            ? `
                    <div class="typography-body2-bold" style="margin-top: 8px; margin-bottom: 4px;">Remarks:</div>
                    <div class="typography-body2">${invoiceData.summary.remarks}</div>
                    `
                            : ''
                    }
                    <div style="margin-top: 16px;">
                      <div class="typography-body2-bold" style="margin-bottom: 4px;">Sent By: Admin</div>
                    </div>
                  </div>
                  <div class="notes-item">
                    <div class="typography-body2">If paid by credit card or cheque, 5% surcharge will be added to the total amount.</div>
                    <div class="amount-in-words">AMOUNT IN WORDS: ${invoiceData.amountInWords}</div>
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

const InvoiceSlip = ({ open, onClose, invoiceNo, invoiceId = null }) => {
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch invoice data
    useEffect(() => {
        if (open && (invoiceNo || invoiceId)) {
            setLoading(true);

            // If invoiceId is provided, use it directly; otherwise use member ID (invoiceNo)
            const idToUse = invoiceId || invoiceNo;

            axios
                .get(route('financial-invoice', idToUse))
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
        }
    }, [open, invoiceNo, invoiceId]);

    const isSingleInvoiceWithItems = invoice?.data?.items && invoice.data.items.length > 0;
    const itemsList = isSingleInvoiceWithItems ? invoice.data.items : invoice ? (invoice.related_invoices && invoice.related_invoices.length > 0 ? invoice.related_invoices : [invoice]) : [];

    let subTotal = 0,
        taxTotal = 0,
        overdueTotal = 0,
        additionalTotal = 0,
        grandTotal = 0,
        paidTotal = 0,
        remainingTotal = 0,
        discountTotal = 0;

    if (itemsList.length > 0) {
        // Calculate Subtotal (Gross Sum of Original Amounts)
        subTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.original_amount || item.amount) || 0), 0);

        // Calculate Discount Total
        discountTotal = itemsList.reduce((sum, item) => {
            const original = parseFloat(item.original_amount || item.amount) || 0;
            const net = parseFloat(item.amount) || 0;
            return sum + (original - net);
        }, 0);

        if (isSingleInvoiceWithItems) {
            const itemsNetSum = itemsList.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

            taxTotal = parseFloat(invoice.tax_amount || 0);
            overdueTotal = parseFloat(invoice.overdue_amount || 0);
            additionalTotal = parseFloat(invoice.additional_charges || 0);

            grandTotal = itemsNetSum + taxTotal + overdueTotal + additionalTotal;

            paidTotal = parseFloat(invoice.paid_amount || 0);
            remainingTotal = parseFloat(invoice.customer_charges || 0);
        } else {
            taxTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.tax_amount) || 0), 0);
            overdueTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.overdue_amount) || 0), 0);
            additionalTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.additional_charges) || 0), 0);
            grandTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);
            paidTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.paid_amount) || 0), 0);
            remainingTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.customer_charges) || 0), 0);
        }
    } else if (invoice) {
        grandTotal = parseFloat(invoice.total_price || 0);
        subTotal = parseFloat(invoice.amount || 0);
        paidTotal = parseFloat(invoice.paid_amount || 0);
        remainingTotal = parseFloat(invoice.customer_charges || 0);
    }

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
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', fontSize: '18px' }}>
                                    Invoice
                                </Typography>
                                {invoice && (
                                    <div
                                        style={{
                                            marginTop: '4px',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            color: invoice.status === 'paid' ? '#155724' : invoice.status === 'checked_in' ? '#004085' : invoice.status === 'checked_out' ? '#0c5460' : '#721c24',
                                            backgroundColor: invoice.status === 'paid' ? '#d4edda' : invoice.status === 'checked_in' ? '#cce5ff' : invoice.status === 'checked_out' ? '#d1ecf1' : '#f8d7da',
                                            textTransform: 'uppercase',
                                            border: `1px solid ${invoice.status === 'paid' ? '#c3e6cb' : invoice.status === 'checked_in' ? '#b8daff' : invoice.status === 'checked_out' ? '#bee5eb' : '#f5c6cb'}`,
                                            padding: '2px 8px',
                                            display: 'inline-block',
                                            borderRadius: '4px',
                                        }}
                                    >
                                        {(invoice.status || 'Unpaid').replace(/_/g, ' ')}
                                    </div>
                                )}
                            </Box>
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
                                        Bill To {invoice.member.membership_no}
                                    </Typography>
                                    <Box sx={{ ml: 0 }}>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '13px' }}>
                                            <span style={{ fontWeight: 'bold' }}>Name: </span>
                                            {invoice.member.full_name}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '13px' }}>
                                            <span style={{ fontWeight: 'bold' }}>Membership #: </span>
                                            {invoice.member.membership_no}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '13px' }}>
                                            <span style={{ fontWeight: 'bold' }}>Contact #: </span>
                                            {invoice.member.mobile_number_a}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '13px' }}>
                                            <span style={{ fontWeight: 'bold' }}>City: </span>
                                            {invoice.member?.current_city}
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

                                        {/* Show validity dates for subscription and maintenance fees */}
                                        {(invoice.fee_type === 'subscription_fee' || invoice.fee_type === 'maintenance_fee') && (
                                            <>
                                                {invoice.valid_from && (
                                                    <Typography variant="body2" sx={{ mb: 0.5, fontSize: '13px' }}>
                                                        <span style={{ fontWeight: 'bold' }}>From: </span>
                                                        {new Date(invoice.valid_from).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </Typography>
                                                )}
                                                {invoice.valid_to && (
                                                    <Typography variant="body2" sx={{ mb: 0.5, fontSize: '13px' }}>
                                                        <span style={{ fontWeight: 'bold' }}>To: </span>
                                                        <span
                                                            style={{
                                                                color: new Date(invoice.valid_to) > new Date() ? '#28a745' : '#dc3545',
                                                                fontWeight: 500,
                                                            }}
                                                        >
                                                            {new Date(invoice.valid_to).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                            })}
                                                        </span>
                                                    </Typography>
                                                )}
                                                {invoice.valid_from && invoice.valid_to && (
                                                    <Typography variant="body2" sx={{ mb: 0.5, fontSize: '13px' }}>
                                                        <span style={{ fontWeight: 'bold' }}>Number of days: </span>
                                                        {dayjs(invoice.valid_to).diff(dayjs(invoice.valid_from), 'day') + 1}
                                                    </Typography>
                                                )}
                                            </>
                                        )}
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
                                            {invoice.fee_type === 'subscription_fee' && (
                                                <>
                                                    <TableCell sx={{ fontWeight: 'bold', fontSize: '13px', py: 1.5 }}>Type</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold', fontSize: '13px', py: 1.5 }}>Category</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold', fontSize: '13px', py: 1.5 }}>Fee</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold', fontSize: '13px', py: 1.5 }}>Disc</TableCell>
                                                </>
                                            )}
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '13px', py: 1.5 }}>Net Amount</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '13px', py: 1.5 }}>Remaining Amount</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '13px', py: 1.5 }}>Paid Amount</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {itemsList.map((item, index) => (
                                            <TableRow key={item.id || index}>
                                                <TableCell sx={{ fontSize: '13px', py: 1.5 }}>{index + 1}</TableCell>
                                                <TableCell sx={{ fontSize: '13px', py: 1.5, textTransform: 'capitalize' }}>{item.description || item.invoice_type}</TableCell>
                                                {invoice.fee_type === 'subscription_fee' && (
                                                    <>
                                                        <TableCell sx={{ fontSize: '13px', py: 1.5 }}>{item.subscriptionType?.name || item.subscription_type_name || 'N/A'}</TableCell>
                                                        <TableCell sx={{ fontSize: '13px', py: 1.5 }}>{item.subscriptionCategory?.name || item.subscription_category_name || 'N/A'}</TableCell>
                                                        <TableCell sx={{ fontSize: '13px', py: 1.5 }}>{item.original_amount || item.amount}</TableCell>
                                                        <TableCell sx={{ fontSize: '13px', py: 1.5 }}>{item.original_amount && item.amount ? parseFloat(item.original_amount) - parseFloat(item.amount) : 0}</TableCell>
                                                    </>
                                                )}
                                                <TableCell sx={{ fontSize: '13px', py: 1.5 }}>{item.amount}</TableCell>
                                                <TableCell sx={{ fontSize: '13px', py: 1.5 }}>{isSingleInvoiceWithItems ? (invoice.status === 'paid' ? 0 : item.amount) : item.customer_charges}</TableCell>
                                                <TableCell sx={{ fontSize: '13px', py: 1.5 }}>{isSingleInvoiceWithItems ? (invoice.status === 'paid' ? item.amount : 0) : item.status === 'paid' || item.status === 'overdue' ? item.paid_amount : 0}</TableCell>
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
                                                Subtotal
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontSize: '13px' }}>
                                                Rs {subTotal}
                                            </Typography>
                                        </Box>
                                        {discountTotal > 0 && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, borderBottom: '1px solid #eee' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '13px' }}>
                                                    Discount
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontSize: '13px', color: '#d32f2f' }}>
                                                    - Rs {discountTotal}
                                                </Typography>
                                            </Box>
                                        )}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, borderBottom: '1px solid #eee' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '13px' }}>
                                                Grand Total
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontSize: '13px' }}>
                                                Rs {grandTotal}
                                            </Typography>
                                        </Box>
                                        {taxTotal > 0 && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, borderBottom: '1px solid #eee' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '13px' }}>
                                                    Tax ({invoice.tax_percentage}%)
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontSize: '13px' }}>
                                                    Rs {taxTotal}
                                                </Typography>
                                            </Box>
                                        )}
                                        {overdueTotal > 0 && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, borderBottom: '1px solid #eee' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '13px' }}>
                                                    Overdue ({invoice.overdue_percentage}%)
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontSize: '13px' }}>
                                                    Rs {overdueTotal}
                                                </Typography>
                                            </Box>
                                        )}
                                        {additionalTotal > 0 && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, borderBottom: '1px solid #eee' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '13px' }}>
                                                    Additional Charges
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontSize: '13px' }}>
                                                    Rs {additionalTotal}
                                                </Typography>
                                            </Box>
                                        )}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, borderBottom: '1px solid #eee' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '13px' }}>
                                                Remaining Amount
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontSize: '13px' }}>
                                                Rs {remainingTotal}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, borderBottom: '1px solid #eee' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '13px' }}>
                                                Paid Amount
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontSize: '13px' }}>
                                                Rs {paidTotal}
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
                                    {invoice.remarks && (
                                        <>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5, mt: 2, fontSize: '13px' }}>
                                                Remarks:
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontSize: '13px' }}>
                                                {invoice.remarks}
                                            </Typography>
                                        </>
                                    )}
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
                                        AMOUNT IN WORDS: {toWords(grandTotal)}
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
