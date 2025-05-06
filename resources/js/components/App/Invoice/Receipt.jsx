import { usePage } from '@inertiajs/react';
import { Print as PrintIcon } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';

// Receipt component for reuse
const Receipt = ({ invoiceId = null, openModal = false, showButtons = true, closeModal, printReceipt }) => {
    const { auth } = usePage().props;
    const user = auth.user;

    const [loading, setLoading] = useState(true);

    const [paymentData, setPaymentData] = useState(null);

    useEffect(() => {
        if (openModal && invoiceId) {
            setLoading(true);
            axios.get(`/payment-order-data/${invoiceId}`).then((response) => {
                setPaymentData(response.data);
                setLoading(false);
            });
        }
    }, [openModal, invoiceId]); // Trigger on modal open and invoiceId change

    if (loading) {
        return <div>Loading...</div>; // Display loading state until data is fetched
    }

    return (
        <Box sx={styles.receiptContainer}>
            <Box sx={styles.receiptHeader}>
                <Typography variant="caption">{paymentData.order.start_date}</Typography>
            </Box>

            <Box sx={styles.receiptOrderId}>
                <Typography variant="caption" color="text.secondary">
                    Order Id
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                    {paymentData.order.order_number}
                </Typography>
            </Box>

            <Box sx={styles.receiptRow}>
                <Typography variant="caption" color="text.secondary">
                    Cashier
                </Typography>
                <Typography variant="caption">{user.name}</Typography>
            </Box>

            <Box sx={styles.receiptDivider} />

            <Box sx={styles.receiptRow}>
                <Typography variant="caption" color="text.secondary">
                    Customer Name
                </Typography>
                <Typography variant="caption">{paymentData.user.name}</Typography>
            </Box>

            <Box sx={styles.receiptRow}>
                <Typography variant="caption" color="text.secondary">
                    Member Id Card
                </Typography>
                <Typography variant="caption">-</Typography>
            </Box>

            <Box sx={styles.receiptRow}>
                <Typography variant="caption" color="text.secondary">
                    Order Type
                </Typography>
                <Typography variant="caption">{paymentData.order.order_type}</Typography>
            </Box>

            <Box sx={styles.receiptRow}>
                <Typography variant="caption" color="text.secondary">
                    Table Number
                </Typography>
                <Typography variant="caption">{paymentData.order?.table?.table_no}</Typography>
            </Box>

            <Box sx={styles.receiptDivider} />

            {paymentData.order.order_items.map((item, index) => (
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

            <Box sx={styles.receiptLogo}>
                <Typography variant="h6" fontWeight="bold" color="#0a3d62">
                    IMAJI Coffee.
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
                    <Button variant="contained" startIcon={<PrintIcon />} onClick={printReceipt} sx={styles.printReceiptButton}>
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
        fontWeight: 'bold',
        fontSize: '16px',
        textAlign: 'center',
        marginTop: '10px',
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
