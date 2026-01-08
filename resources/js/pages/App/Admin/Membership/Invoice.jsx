import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Drawer, Grid, Container } from '@mui/material';
import { Print, Close, Send } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { toWords } from 'number-to-words';
import dayjs from 'dayjs';

const handlePrintReceipt = (invoice) => {
    if (!invoice) return;

    const hasInvoiceItems = invoice?.items && invoice.items.length > 0;
    const hasDataItems = invoice?.data?.items && invoice.data.items.length > 0;

    let itemsList = [];

    if (hasInvoiceItems) {
        itemsList = invoice.items;
    } else if (hasDataItems) {
        itemsList = invoice.data.items;
    } else if (invoice?.related_invoices && invoice.related_invoices.length > 0) {
        itemsList = invoice.related_invoices;
    } else if (invoice) {
        itemsList = [invoice];
    }

    let subTotal = 0,
        taxTotal = 0,
        overdueTotal = 0,
        additionalTotal = 0,
        grandTotal = 0,
        paidTotal = 0,
        remainingTotal = 0,
        discountTotal = 0;

    if (itemsList.length > 0) {
        if (hasInvoiceItems) {
            // New System
            subTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.sub_total || item.amount) || 0), 0);
            discountTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.discount_amount) || 0), 0);
            taxTotal = parseFloat(invoice.tax_amount || 0);
            if (taxTotal === 0) {
                taxTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.tax_amount) || 0), 0);
            }

            grandTotal = parseFloat(invoice.total_price || 0);
            paidTotal = parseFloat(invoice.paid_amount || 0);
            remainingTotal = parseFloat(invoice.customer_charges || 0);
            overdueTotal = parseFloat(invoice.overdue_amount || 0);
            additionalTotal = parseFloat(invoice.additional_charges || 0);
        } else if (hasDataItems) {
            // Legacy Data Blob
            subTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.original_amount || item.amount) || 0), 0);
            discountTotal = itemsList.reduce((sum, item) => {
                const original = parseFloat(item.original_amount || item.amount) || 0;
                const net = parseFloat(item.amount) || 0;
                return sum + (original - net);
            }, 0);

            const itemsNetSum = itemsList.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
            taxTotal = parseFloat(invoice.tax_amount || 0);
            overdueTotal = parseFloat(invoice.overdue_amount || 0);
            additionalTotal = parseFloat(invoice.additional_charges || 0);
            grandTotal = itemsNetSum + taxTotal + overdueTotal + additionalTotal;

            paidTotal = parseFloat(invoice.paid_amount || 0);
            remainingTotal = parseFloat(invoice.customer_charges || 0);
        } else {
            // Legacy Multi-Invoice
            if (invoice?.related_invoices?.length > 0) {
                taxTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.tax_amount) || 0), 0);
                overdueTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.overdue_amount) || 0), 0);
                additionalTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.additional_charges) || 0), 0);
                grandTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);
                paidTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.paid_amount) || 0), 0);
                remainingTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.customer_charges) || 0), 0);
            } else {
                grandTotal = parseFloat(invoice.total_price || 0);
                subTotal = parseFloat(invoice.amount || 0);
                paidTotal = parseFloat(invoice.paid_amount || 0);
                remainingTotal = parseFloat(invoice.customer_charges || 0);
            }
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
            name: invoice.member?.full_name || invoice.member?.name || invoice.corporate_member?.full_name || invoice.customer?.name || 'N/A',
            category: invoice.member?.member_type?.name || 'Member',
            membershipId: invoice.member?.membership_no || invoice.corporate_member?.membership_no || invoice.customer?.customer_no || 'N/A',
            contactNumber: invoice.member?.mobile_number_a || invoice.corporate_member?.mobile_number_a || invoice.customer?.contact || 'N/A',
            city: invoice.member?.current_city || invoice.corporate_member?.current_city || invoice.customer?.address || 'N/A',
            familyMember: 'Non',
        },
        details: {
            invoiceNumber: invoice.invoice_no || 'N/A',
            issueDate: invoice.issue_date,
            paymentMethod: invoice.payment_method,
            validFrom: invoice.fee_type === 'subscription_fee' || invoice.fee_type === 'maintenance_fee' ? invoice.valid_from : null,
            validTo: invoice.fee_type === 'subscription_fee' || invoice.fee_type === 'maintenance_fee' ? invoice.valid_to : null,
        },
        items: itemsList.map((item, index) => {
            const description = item.description || item.invoice_type;
            let originalAmount = 0;
            let discount = 0;
            let netAmount = 0;
            let remainingAmount = 0;
            let paidAmount = 0;

            if (hasInvoiceItems) {
                originalAmount = parseFloat(item.sub_total || item.amount || 0);
                discount = parseFloat(item.discount_amount || 0);
                netAmount = parseFloat(item.total || item.amount || 0);

                if (invoice.status === 'paid') {
                    paidAmount = netAmount;
                    remainingAmount = 0;
                } else {
                    paidAmount = parseFloat(item.paid_amount || 0);
                    remainingAmount = netAmount - paidAmount;
                }
            } else {
                originalAmount = parseFloat(item.original_amount || item.amount || 0);
                netAmount = parseFloat(item.amount || 0);
                discount = originalAmount && netAmount ? originalAmount - netAmount : 0;

                if (hasDataItems) {
                    if (invoice.status === 'paid') {
                        paidAmount = netAmount;
                        remainingAmount = 0;
                    } else {
                        paidAmount = 0;
                        remainingAmount = netAmount;
                    }
                } else {
                    // Multi-invoice legacy object
                    paidAmount = parseFloat(item.paid_amount || 0);
                    remainingAmount = parseFloat(item.customer_charges || 0);
                }
            }

            return {
                srNo: index + 1,
                description: description,
                subscriptionType: item.subscriptionType?.name || item.subscription_type_name || 'N/A',
                subscriptionCategory: item.subscriptionCategory?.name || item.subscription_category_name || 'N/A',
                originalAmount: originalAmount,
                discount: discount,
                invoiceAmount: netAmount,
                remainingAmount: remainingAmount,
                paidAmount: paidAmount,
                itemType: item.fee_type || item.invoice_type,
            };
        }),
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

    // ... template generation ...

    const content = `
        <html>
          <!-- ... styles ... -->
          <body>
            <div class="container">
              <div class="paper">
                <!-- ... Headers ... -->

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

    const hasInvoiceItems = invoice?.items && invoice.items.length > 0;
    const hasDataItems = invoice?.data?.items && invoice.data.items.length > 0;

    let itemsList = [];
    let isMultiItem = false;

    if (hasInvoiceItems) {
        itemsList = invoice.items;
        isMultiItem = true;
    } else if (hasDataItems) {
        itemsList = invoice.data.items;
        isMultiItem = true;
    } else if (invoice?.related_invoices && invoice.related_invoices.length > 0) {
        itemsList = invoice.related_invoices;
    } else if (invoice) {
        itemsList = [invoice];
    }

    let subTotal = 0,
        taxTotal = 0,
        overdueTotal = 0,
        additionalTotal = 0,
        grandTotal = 0,
        paidTotal = 0,
        remainingTotal = 0,
        discountTotal = 0;

    if (itemsList.length > 0) {
        if (hasInvoiceItems) {
            // New System: FinancialInvoiceItem models
            subTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.sub_total || item.amount) || 0), 0);
            discountTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.discount_amount) || 0), 0);
            taxTotal = parseFloat(invoice.tax_amount || 0); // Header tax is usually sum of items tax

            // If header tax is 0 but items have tax, sum them up
            if (taxTotal === 0) {
                taxTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.tax_amount) || 0), 0);
            }

            // Using header totals if available as they are authoritative
            grandTotal = parseFloat(invoice.total_price || 0);
            paidTotal = parseFloat(invoice.paid_amount || 0);
            remainingTotal = parseFloat(invoice.customer_charges || 0); // Or header remaining column if exists

            overdueTotal = parseFloat(invoice.overdue_amount || 0);
            additionalTotal = parseFloat(invoice.additional_charges || 0);
        } else if (hasDataItems) {
            // Legacy Data Blob
            subTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.original_amount || item.amount) || 0), 0);
            discountTotal = itemsList.reduce((sum, item) => {
                const original = parseFloat(item.original_amount || item.amount) || 0;
                const net = parseFloat(item.amount) || 0;
                return sum + (original - net);
            }, 0);

            const itemsNetSum = itemsList.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
            taxTotal = parseFloat(invoice.tax_amount || 0);
            overdueTotal = parseFloat(invoice.overdue_amount || 0);
            additionalTotal = parseFloat(invoice.additional_charges || 0);
            grandTotal = itemsNetSum + taxTotal + overdueTotal + additionalTotal;
            paidTotal = parseFloat(invoice.paid_amount || 0);
            remainingTotal = parseFloat(invoice.customer_charges || 0);
        } else {
            // Legacy Multi-Invoice or Single Simple Invoice
            if (invoice?.related_invoices?.length > 0) {
                // Multi invoice logic
                taxTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.tax_amount) || 0), 0);
                overdueTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.overdue_amount) || 0), 0);
                additionalTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.additional_charges) || 0), 0);
                grandTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);
                paidTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.paid_amount) || 0), 0);
                remainingTotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.customer_charges) || 0), 0);
            } else {
                // Fallback for single object in list
                grandTotal = parseFloat(invoice.total_price || 0);
                subTotal = parseFloat(invoice.amount || 0);
                paidTotal = parseFloat(invoice.paid_amount || 0);
                remainingTotal = parseFloat(invoice.customer_charges || 0);
            }
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
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#063455', fontSize: '18px' }}>
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
                                        Bill To {invoice.member?.membership_no || invoice.corporate_member?.membership_no || invoice.customer?.customer_no}
                                    </Typography>
                                    <Box sx={{ ml: 0 }}>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '13px' }}>
                                            <span style={{ fontWeight: 'bold' }}>Name: </span>
                                            {invoice.member?.full_name || invoice.corporate_member?.full_name || invoice.customer?.name}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '13px' }}>
                                            <span style={{ fontWeight: 'bold' }}>Membership #: </span>
                                            {invoice.member?.membership_no || invoice.corporate_member?.membership_no || invoice.customer?.customer_no}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '13px' }}>
                                            <span style={{ fontWeight: 'bold' }}>Contact #: </span>
                                            {invoice.member?.mobile_number_a || invoice.corporate_member?.mobile_number_a || invoice.customer?.contact}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '13px' }}>
                                            <span style={{ fontWeight: 'bold' }}>City: </span>
                                            {invoice.member?.current_city || invoice.corporate_member?.current_city || invoice.customer?.address}
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
                                            {invoice.payment_method ? invoice.payment_method.replace(/_/g, ' ').toUpperCase() : 'Cash'}
                                        </Typography>
                                        {invoice.payment_date && (
                                            <Typography variant="body2" sx={{ mb: 0.5, fontSize: '13px' }}>
                                                <span style={{ fontWeight: 'bold' }}>Payment Date: </span>
                                                {new Date(invoice.payment_date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </Typography>
                                        )}

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
                                        {itemsList.map((item, index) => {
                                            const description = item.description || item.invoice_type;

                                            // Determine values based on source (New Model vs Legacy JSON)
                                            let originalAmount = 0;
                                            let discount = 0;
                                            let netAmount = 0;
                                            let paidAmount = 0;
                                            let remainingAmount = 0;

                                            if (hasInvoiceItems) {
                                                // New System
                                                originalAmount = parseFloat(item.sub_total || item.amount || 0);
                                                discount = parseFloat(item.discount_amount || 0);
                                                netAmount = parseFloat(item.total || item.amount || 0);

                                                // Basic paid logic (can be refined if items have individual status)
                                                // For now assuming if header is paid, item is fully paid, unless item has paid_amount
                                                if (invoice.status === 'paid') {
                                                    paidAmount = netAmount;
                                                    remainingAmount = 0;
                                                } else {
                                                    paidAmount = parseFloat(item.paid_amount || 0);
                                                    remainingAmount = netAmount - paidAmount;
                                                }
                                            } else {
                                                // Legacy
                                                originalAmount = parseFloat(item.original_amount || item.amount || 0);
                                                netAmount = parseFloat(item.amount || 0);
                                                discount = originalAmount && netAmount ? originalAmount - netAmount : 0;

                                                if (hasDataItems) {
                                                    if (invoice.status === 'paid') {
                                                        paidAmount = netAmount;
                                                        remainingAmount = 0;
                                                    } else {
                                                        paidAmount = 0;
                                                        remainingAmount = netAmount;
                                                    }
                                                } else {
                                                    // Multi-invoice legacy object
                                                    paidAmount = parseFloat(item.paid_amount || 0);
                                                    remainingAmount = parseFloat(item.customer_charges || 0);
                                                }
                                            }

                                            return (
                                                <TableRow key={item.id || index}>
                                                    <TableCell sx={{ fontSize: '13px', py: 1.5 }}>{index + 1}</TableCell>
                                                    <TableCell sx={{ fontSize: '13px', py: 1.5, textTransform: 'capitalize' }}>{description}</TableCell>
                                                    {invoice.fee_type === 'subscription_fee' && (
                                                        <>
                                                            <TableCell sx={{ fontSize: '13px', py: 1.5 }}>{item.subscriptionType?.name || item.subscription_type_name || 'N/A'}</TableCell>
                                                            <TableCell sx={{ fontSize: '13px', py: 1.5 }}>{item.subscriptionCategory?.name || item.subscription_category_name || 'N/A'}</TableCell>
                                                            <TableCell sx={{ fontSize: '13px', py: 1.5 }}>{originalAmount}</TableCell>
                                                            <TableCell sx={{ fontSize: '13px', py: 1.5 }}>{discount}</TableCell>
                                                        </>
                                                    )}
                                                    <TableCell sx={{ fontSize: '13px', py: 1.5 }}>{netAmount}</TableCell>
                                                    <TableCell sx={{ fontSize: '13px', py: 1.5 }}>{remainingAmount}</TableCell>
                                                    <TableCell sx={{ fontSize: '13px', py: 1.5 }}>{paidAmount}</TableCell>
                                                </TableRow>
                                            );
                                        })}
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
                                        backgroundColor: '#063455',
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
