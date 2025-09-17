import { usePage } from '@inertiajs/react';
import { Print as PrintIcon } from '@mui/icons-material';
import { Avatar, Box, Button, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';

// Receipt component for reuse
const Receipt = ({ invoiceId = null, openModal = false, showButtons = true, closeModal }) => {
    const { auth } = usePage().props;
    const user = auth.user;

    const [loading, setLoading] = useState(true);

    const [paymentData, setPaymentData] = useState(null);

    useEffect(() => {
        if (openModal && invoiceId) {
            setLoading(true);
            axios.get(route('transaction.invoice', { invoiceId: invoiceId })).then((response) => {
                console.log('response', response.data);

                setPaymentData(response.data);
                setLoading(false);
            });
        }
    }, [openModal, invoiceId]); // Trigger on modal open and invoiceId change

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '40%' }}>
                <CircularProgress />
            </Box>
        ); // Display loading state until data is fetched
    }

    const handlePrintReceipt = (data) => {
        if (!data) return;

        const printWindow = window.open('', '_blank');

        const content = `
        <html>
          <head>
            <title>Receipt</title>
            <style>
              body { font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 10px; }
              .order-id { border: 1px dashed #ccc; padding: 10px; text-align: center; margin: 15px 0; }
              .divider { border-top: 1px dashed #ccc; margin: 10px 0; }
              .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
              .total { font-weight: bold; margin-top: 10px; }
              .footer { text-align: center; margin-top: 20px; font-size: 11px; }
              .logo { width: 80px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div><img src='/assets/Logo.png' class="logo"/></div>
            </div>
            <div class="header">
              <div>${data.start_date || ''}</div>
            </div>

            <div class="order-id">
              <div>Order Id</div>
              <div><strong>#${data.id}</strong></div>
            </div>

            <div class="row">
              <div>Cashier</div>
              <div>${data.cashier ? data.cashier.name : user.name}</div>
            </div>

            <div class="divider"></div>

            <div class="row">
              <div>Customer Name</div>
              <div>${data.member.full_name}</div>
            </div>

            <div class="row">
              <div>Member Id Card</div>
              <div>-</div>
            </div>

            <div class="row">
              <div>Order Type</div>
              <div>${data.order_type}</div>
            </div>

            <div class="row">
              <div>Table Number</div>
              <div>${data.table?.table_no ?? '-'}</div>
            </div>

            <div class="divider"></div>

            ${data.order_items
                .map(
                    (item) => `
              <div style="margin-bottom: 10px;">
                <div><strong>${item.order_item.name}</strong></div>
                <div class="row">
                  <div>${item.order_item.quantity} x Rs ${item.order_item.price.toFixed(2)}</div>
                  <div>Rs ${(item.order_item.quantity * item.order_item.price).toFixed(2)}</div>
                </div>
              </div>
            `,
                )
                .join('')}

            <div class="divider"></div>

            <div class="row">
              <div>Subtotal</div>
              <div>Rs ${data.amount}</div>
            </div>

            <div class="row">
              <div>Discount</div>
              <div>Rs ${data.discount}</div>
            </div>

            <div class="row">
              <div>Tax (12%)</div>
              <div>Rs ${data.amount * 0.12}</div>
            </div>

            <div class="divider"></div>

            <div class="row total">
              <div>Total Amount</div>
              <div>Rs ${data.total_price}</div>
            </div>

            <div class="footer">
              <p>Thanks for having our passion. Drop by again. If your orders aren't still visible, you're always welcome here!</p>
            </div>

            <div class="logo">
              IMAJI Coffee.
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

    return (
        <Box sx={styles.receiptContainer}>
            <Box sx={styles.receiptHeader}>
                <img src={'/assets/Logo.png'} style={styles.receiptLogo} />
            </Box>
            <Box sx={styles.receiptHeader}>
                <Typography variant="caption">{paymentData.start_date}</Typography>
            </Box>

            <Box sx={styles.receiptOrderId}>
                <Typography variant="caption" color="text.secondary">
                    Order Id
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                    #{paymentData.id}
                </Typography>
            </Box>

            <Box sx={styles.receiptRow}>
                <Typography variant="caption" color="text.secondary">
                    Cashier
                </Typography>
                <Typography variant="caption">{paymentData.cashier ? paymentData.cashier.name : user.name}</Typography>
            </Box>

            <Box sx={styles.receiptDivider} />

            <Box sx={styles.receiptRow}>
                <Typography variant="caption" color="text.secondary">
                    Customer Name
                </Typography>
                <Typography variant="caption">{paymentData.member?.full_name}</Typography>
            </Box>

            <Box sx={styles.receiptRow}>
                <Typography variant="caption" color="text.secondary">
                    Member Id Card
                </Typography>
                <Typography variant="caption">{paymentData.member?.membership_no}</Typography>
            </Box>

            <Box sx={styles.receiptRow}>
                <Typography variant="caption" color="text.secondary">
                    Order Type
                </Typography>
                <Typography variant="caption">{paymentData.order_type}</Typography>
            </Box>

            <Box sx={styles.receiptRow}>
                <Typography variant="caption" color="text.secondary">
                    Table Number
                </Typography>
                <Typography variant="caption">{paymentData?.table?.table_no}</Typography>
            </Box>

            <Box sx={styles.receiptDivider} />

            {paymentData.order_items.map((item, index) => (
                <Box key={index} mb={1.5}>
                    <Typography variant="caption" fontWeight="medium">
                        {item.order_item.name}
                    </Typography>
                    <Box sx={styles.receiptRow}>
                        <Typography variant="caption" color="text.secondary">
                            {item.order_item.quantity} x Rs {item.order_item.price}
                        </Typography>
                        <Typography variant="caption">Rs {item.order_item.price}</Typography>
                    </Box>
                </Box>
            ))}

            <Box sx={styles.receiptDivider} />

            <Box sx={styles.receiptRow}>
                <Typography variant="caption" color="text.secondary">
                    Subtotal
                </Typography>
                <Typography variant="caption">Rs {paymentData.amount}</Typography>
            </Box>

            <Box sx={styles.receiptRow}>
                <Typography variant="caption" color="text.secondary">
                    Discount
                </Typography>
                <Typography variant="caption">Rs {paymentData.discount}</Typography>
            </Box>

            <Box sx={styles.receiptRow}>
                <Typography variant="caption" color="text.secondary">
                    Tax (12%)
                </Typography>
                <Typography variant="caption">Rs {(paymentData.amount * 0.12).toFixed(2)}</Typography>
            </Box>
            <Box sx={styles.receiptDivider} />
            <Box sx={styles.receiptRow}>
                <Typography variant="caption" color="text.secondary">
                    Total Cash
                </Typography>
                <Typography variant="caption">Rs{paymentData.paid_amount}</Typography>
            </Box>
            <Box sx={styles.receiptRow}>
                <Typography variant="caption" color="text.secondary">
                    Customer Changes
                </Typography>
                <Typography variant="caption">Rs{paymentData.paid_amount - paymentData.total_price}</Typography>
            </Box>

            <Box sx={styles.receiptTotal}>
                <Typography variant="body2" fontWeight="bold" color="#0a3d62">
                    Total Amount
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="#0a3d62">
                    Rs {paymentData.total_price}
                </Typography>
            </Box>

            <Box sx={styles.receiptFooter}>
                <Typography variant="caption" fontSize="0.65rem">
                    Thanks for having our passion. Drop by again. If your orders aren't still visible, you're always welcome here!
                </Typography>
            </Box>

            {showButtons && (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mt: 3,
                    }}
                >
                    <Button
                        variant="outlined"
                        onClick={closeModal}
                        sx={{
                            color: '#333',
                            borderColor: '#ddd',
                            textTransform: 'none',
                        }}
                    >
                        Close
                    </Button>
                    <Button variant="contained" startIcon={<PrintIcon />} onClick={() => handlePrintReceipt(paymentData)} sx={styles.printReceiptButton}>
                        Print Receipt
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default Receipt;

const styles = {
    receiptContainer: {
        width: '40%',
        backgroundColor: '#f5f5f5',
        padding: '20px',
        borderRight: '1px solid #ddd',
        fontFamily: 'monospace',
        fontSize: '12px',
        overflowY: 'auto',
        height: '100vh',
    },
    receiptHeader: {
        textAlign: 'center',
        marginBottom: '10px',
    },
    receiptOrderId: {
        border: '1px dashed #ccc',
        padding: '10px',
        textAlign: 'center',
        marginBottom: '15px',
    },
    receiptDivider: {
        borderTop: '1px dashed #ccc',
        margin: '10px 0',
    },
    receiptFooter: {
        textAlign: 'center',
        marginTop: '20px',
        fontSize: '11px',
    },
    receiptLogo: {
        width: '80px',
    },
    receiptRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '5px',
    },
    receiptTotal: {
        fontWeight: 'bold',
        marginTop: '10px',
        borderTop: '1px dashed #ccc',
        paddingTop: '10px',
    },
};
