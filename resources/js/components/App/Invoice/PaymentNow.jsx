import { router } from '@inertiajs/react';
import { AccountBalance as AccountBalanceIcon, ArrowForward as ArrowForwardIcon, Backspace as BackspaceIcon, CreditCard as CreditCardIcon } from '@mui/icons-material';
import { Box, Button, Dialog, Grid, InputAdornment, MenuItem, Select, TextField, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import Receipt from './Receipt';

const PaymentNow = ({ invoiceData, openSuccessPayment, openPaymentModal, handleClosePayment, setSelectedOrder }) => {
    // Payment state
    const [inputAmount, setInputAmount] = useState('0');
    const [customerChanges, setCustomerChanges] = useState('0');
    const [activePaymentMethod, setActivePaymentMethod] = useState('cash');
    const [selectedBank, setSelectedBank] = useState('mcb');
    // Bank transfer form state
    const [accountNumber, setAccountNumber] = useState('');
    const [cardHolderName, setCardHolderName] = useState('');
    const [cvvCode, setCvvCode] = useState('');

    // Credit card states
    const [creditCardType, setCreditCardType] = useState('visa');
    const [receiptFile, setReceiptFile] = useState(null);

    // Split Payment
    const [cashAmount, setCashAmount] = useState('0');
    const [creditCardAmount, setCreditCardAmount] = useState('0');
    const [bankTransferAmount, setBankTransferAmount] = useState('0');

    const handlePaymentMethodChange = (method) => {
        setActivePaymentMethod(method);
    };

    const handleBankSelection = (bank) => {
        setSelectedBank(bank);
    };

    const handleQuickAmountClick = (amount) => {
        setInputAmount(amount);
        // Calculate customer changes
        const total = invoiceData.total_price;
        setCustomerChanges((amount - total).toFixed(2));
    };

    const handleNumberClick = (number) => {
        let newAmount;
        if (inputAmount === invoiceData.total_price) {
            newAmount = number;
        } else {
            newAmount = inputAmount + number;
        }
        setInputAmount(newAmount);

        // Calculate customer changes
        const total = invoiceData.total_price;
        setCustomerChanges((Number.parseFloat(newAmount) - total).toFixed(2));
    };

    const handleDeleteClick = () => {
        if (inputAmount.length > 1) {
            const newAmount = inputAmount.slice(0, -1);
            setInputAmount(newAmount);

            // Calculate customer changes
            const total = invoiceData.total_price;
            setCustomerChanges((Number.parseFloat(newAmount) - total).toFixed(2));
        } else {
            setInputAmount('0');
            setCustomerChanges((0 - invoiceData.total_price).toFixed(2));
        }
    };

    const handleDecimalClick = () => {
        if (!inputAmount.includes('.')) {
            const newAmount = inputAmount + '.';
            setInputAmount(newAmount);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setReceiptFile(e.target.files[0]);
        } else {
            setReceiptFile(null);
        }
    };

    const handlePayNow = () => {
        // Amount validation
        if (parseFloat(inputAmount) < invoiceData.total_price) {
            enqueueSnackbar('Please enter the correct amount or greater', { variant: 'warning' });
            return;
        }

        if (activePaymentMethod === 'credit_card' && !receiptFile) {
            enqueueSnackbar('Please upload the receipt', { variant: 'warning' });
            return;
        }

        // Prepare form data for credit card (with file)
        if (activePaymentMethod === 'credit_card') {
            const formData = new FormData();
            formData.append('order_id', invoiceData.id);
            formData.append('paid_amount', inputAmount);
            formData.append('payment_method', 'credit_card');
            formData.append('credit_card_type', creditCardType);
            formData.append('receipt', receiptFile);
            console.log(formData);

            router.post(route('order.payment'), formData, {
                onSuccess: () => {
                    enqueueSnackbar('Payment successful', { variant: 'success' });
                    setSelectedOrder((prev) => ({ ...prev, paid_amount: inputAmount, payment_status: 'paid' }));
                    openSuccessPayment();
                },
                onError: (errors) => {
                    enqueueSnackbar(
                        typeof errors === 'object' && errors !== null
                            ? Object.entries(errors)
                                  .map(([field, message]) => message)
                                  .join(', ')
                            : 'Something went wrong',
                        { variant: 'error' },
                    );
                },
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        } else {
            // For other payment methods (cash, bank) use regular payload
            const paidAmount = activePaymentMethod === 'split_payment' ? (parseFloat(cashAmount || 0) + parseFloat(creditCardAmount || 0) + parseFloat(bankTransferAmount || 0)).toFixed(2) : inputAmount;

            const payload = {
                order_id: invoiceData?.id,
                paid_amount: paidAmount,
                customer_changes: customerChanges,
                payment_method: activePaymentMethod,
                ...(activePaymentMethod === 'split_payment' && {
                    cash: cashAmount,
                    credit_card: creditCardAmount,
                    bank_transfer: bankTransferAmount,
                }),
            };

            router.post(route('order.payment'), payload, {
                onSuccess: () => {
                    setSelectedOrder((prev) => ({ ...prev, paid_amount: inputAmount, payment_status: 'paid' }));
                    enqueueSnackbar('Payment successful', { variant: 'success' });
                    openSuccessPayment();
                },
                onError: (errors) => {
                    enqueueSnackbar(
                        typeof errors === 'object' && errors !== null
                            ? Object.entries(errors)
                                  .map(([field, message]) => message)
                                  .join(', ')
                            : 'Something went wrong',
                        { variant: 'error' },
                    );
                },
            });
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key.toLowerCase() === 'enter') {
                e.preventDefault(); // Optional: prevent browser behavior
                handlePayNow();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [router]);

    useEffect(() => {
        if (activePaymentMethod === 'split_payment') {
            const totalPaid = Number(cashAmount) + Number(creditCardAmount) + Number(bankTransferAmount);
            const change = totalPaid - Number(invoiceData?.total_price);
            setCustomerChanges(change);
            setInputAmount(totalPaid); // Optional: track total paid in inputAmount too
        }
    }, [cashAmount, creditCardAmount, bankTransferAmount, invoiceData?.total_price, activePaymentMethod]);

    return (
        <Dialog
            open={openPaymentModal}
            onClose={handleClosePayment}
            fullWidth
            maxWidth="md"
            PaperProps={{
                style: {
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    margin: 0,
                    height: '100vh',
                    maxHeight: '100vh',
                    width: '100%',
                    maxWidth: '1000px',
                    borderRadius: 0,
                    overflow: 'auto',
                },
            }}
        >
            <Box sx={{ display: 'flex', height: '100vh' }}>
                {/* Left Side - Receipt */}
                <Receipt invoiceId={invoiceData?.id} openModal={openPaymentModal} showButtons={false} />

                {/* Right Side - Payment */}
                <Box sx={{ flex: 1, p: 3 }}>
                    <Typography variant="h5" fontWeight="bold" mb={4}>
                        Payment
                    </Typography>

                    {/* Payment Method Tabs */}
                    <Box
                        sx={{
                            display: 'flex',
                            borderBottom: '1px solid #e0e0e0',
                            mb: 3,
                        }}
                    >
                        <Box sx={activePaymentMethod === 'cash' ? styles.activePaymentMethodTab : styles.paymentMethodTab} onClick={() => handlePaymentMethodChange('cash')}>
                            <CreditCardIcon
                                sx={{
                                    fontSize: 24,
                                    mb: 1,
                                    color: activePaymentMethod === 'cash' ? '#0a3d62' : '#666',
                                }}
                            />
                            <Typography variant="body1" fontWeight={activePaymentMethod === 'cash' ? 'medium' : 'normal'}>
                                Cash
                            </Typography>
                        </Box>

                        {/* New Credit Card Tab */}
                        <Box sx={activePaymentMethod === 'credit_card' ? styles.activePaymentMethodTab : styles.paymentMethodTab} onClick={() => handlePaymentMethodChange('credit_card')}>
                            <CreditCardIcon
                                sx={{
                                    fontSize: 24,
                                    mb: 1,
                                    color: activePaymentMethod === 'credit_card' ? '#0a3d62' : '#666',
                                }}
                            />
                            <Typography variant="body1" fontWeight={activePaymentMethod === 'credit_card' ? 'medium' : 'normal'}>
                                Credit Card
                            </Typography>
                        </Box>

                        <Box sx={activePaymentMethod === 'bank' ? styles.activePaymentMethodTab : styles.paymentMethodTab} onClick={() => handlePaymentMethodChange('bank')}>
                            <AccountBalanceIcon
                                sx={{
                                    fontSize: 24,
                                    mb: 1,
                                    color: activePaymentMethod === 'bank' ? '#0a3d62' : '#666',
                                }}
                            />
                            <Typography variant="body1" fontWeight={activePaymentMethod === 'bank' ? 'medium' : 'normal'}>
                                Bank Transfer
                            </Typography>
                        </Box>

                        <Box sx={activePaymentMethod === 'split_payment' ? styles.activePaymentMethodTab : styles.paymentMethodTab} onClick={() => handlePaymentMethodChange('split_payment')}>
                            <AccountBalanceIcon
                                sx={{
                                    fontSize: 24,
                                    mb: 1,
                                    color: activePaymentMethod === 'split_payment' ? '#0a3d62' : '#666',
                                }}
                            />
                            <Typography variant="body1" fontWeight={activePaymentMethod === 'split_payment' ? 'medium' : 'normal'}>
                                Split Payment
                            </Typography>
                        </Box>
                    </Box>

                    {/* Cash Payment Form */}
                    {activePaymentMethod === 'cash' && (
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" mb={1}>
                                    Input Amount
                                </Typography>
                                <WholeNumberInput value={inputAmount} onChange={handleQuickAmountClick} />

                                <Typography variant="subtitle1" mb={1}>
                                    Customer Changes
                                </Typography>
                                <Box
                                    sx={{
                                        mb: 3,
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Typography variant="h5" fontWeight="bold" color={Number.parseFloat(customerChanges) < 0 ? '#f44336' : '#333'}>
                                        Rs {customerChanges}
                                    </Typography>
                                </Box>

                                {/* Quick Amount Buttons */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        gap: 1,
                                        mb: 3,
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    <Button variant="outlined" onClick={() => handleQuickAmountClick(invoiceData.total_price.toString())} sx={styles.quickAmountButton}>
                                        Exact money
                                    </Button>
                                    <Button variant="outlined" onClick={() => handleQuickAmountClick('10.00')} sx={styles.quickAmountButton}>
                                        Rs 10.00
                                    </Button>
                                    <Button variant="outlined" onClick={() => handleQuickAmountClick('20.00')} sx={styles.quickAmountButton}>
                                        Rs 20.00
                                    </Button>
                                    <Button variant="outlined" onClick={() => handleQuickAmountClick('50.00')} sx={styles.quickAmountButton}>
                                        Rs 50.00
                                    </Button>
                                    <Button variant="outlined" onClick={() => handleQuickAmountClick('100.00')} sx={styles.quickAmountButton}>
                                        Rs 100.00
                                    </Button>
                                </Box>

                                {/* Numpad */}
                                <Grid container spacing={1}>
                                    <Grid item xs={4}>
                                        <Button fullWidth sx={styles.numpadButton} onClick={() => handleNumberClick('1')}>
                                            1
                                        </Button>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Button fullWidth sx={styles.numpadButton} onClick={() => handleNumberClick('2')}>
                                            2
                                        </Button>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Button fullWidth sx={styles.numpadButton} onClick={() => handleNumberClick('3')}>
                                            3
                                        </Button>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Button fullWidth sx={styles.numpadButton} onClick={() => handleNumberClick('4')}>
                                            4
                                        </Button>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Button fullWidth sx={styles.numpadButton} onClick={() => handleNumberClick('5')}>
                                            5
                                        </Button>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Button fullWidth sx={styles.numpadButton} onClick={() => handleNumberClick('6')}>
                                            6
                                        </Button>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Button fullWidth sx={styles.numpadButton} onClick={() => handleNumberClick('7')}>
                                            7
                                        </Button>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Button fullWidth sx={styles.numpadButton} onClick={() => handleNumberClick('8')}>
                                            8
                                        </Button>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Button fullWidth sx={styles.numpadButton} onClick={() => handleNumberClick('9')}>
                                            9
                                        </Button>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Button fullWidth sx={styles.numpadButton} onClick={handleDecimalClick}>
                                            .
                                        </Button>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Button fullWidth sx={styles.numpadButton} onClick={() => handleNumberClick('0')}>
                                            0
                                        </Button>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Button
                                            fullWidth
                                            sx={{
                                                ...styles.numpadButton,
                                                backgroundColor: '#ffebee',
                                                color: '#f44336',
                                                '&:hover': {
                                                    backgroundColor: '#ffcdd2',
                                                },
                                            }}
                                            onClick={handleDeleteClick}
                                        >
                                            <BackspaceIcon />
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    )}

                    {/* Bank Transfer Form */}
                    {activePaymentMethod === 'bank' && (
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" mb={2}>
                                    Choose Bank
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        gap: 1,
                                        mb: 3,
                                    }}
                                >
                                    <Button variant="outlined" onClick={() => handleBankSelection('mcb')} sx={selectedBank === 'mcb' ? styles.activeBankButton : styles.bankButton}>
                                        MCB Bank
                                    </Button>
                                    <Button variant="outlined" onClick={() => handleBankSelection('ubl')} sx={selectedBank === 'ubl' ? styles.activeBankButton : styles.bankButton}>
                                        UBL Bank
                                    </Button>
                                    <Button variant="outlined" onClick={() => handleBankSelection('hbl')} sx={selectedBank === 'hbl' ? styles.activeBankButton : styles.bankButton}>
                                        HBL Bank
                                    </Button>
                                </Box>

                                <Typography variant="subtitle1" mb={1}>
                                    Account Number
                                </Typography>
                                <TextField fullWidth placeholder="e.g. 222-29863902-2" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} sx={{ mb: 3 }} />

                                <Typography variant="subtitle1" mb={1}>
                                    Card Holder Name
                                </Typography>
                                <TextField fullWidth placeholder="e.g. Zahid Ullah" value={cardHolderName} onChange={(e) => setCardHolderName(e.target.value)} sx={{ mb: 3 }} />

                                <Typography variant="subtitle1" mb={1}>
                                    CVV Code
                                </Typography>
                                <TextField fullWidth placeholder="e.g. 234" value={cvvCode} onChange={(e) => setCvvCode(e.target.value)} sx={{ mb: 3 }} type="password" />
                            </Grid>
                        </Grid>
                    )}

                    {/* Credit Card Form */}
                    {/* Bank Transfer Form */}
                    {activePaymentMethod === 'credit_card' && (
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" mb={1}>
                                    Amount
                                </Typography>
                                <WholeNumberInput value={inputAmount} onChange={setInputAmount} />

                                <Typography variant="subtitle1" mb={1}>
                                    Credit Card Type
                                </Typography>
                                <Select fullWidth value={creditCardType} onChange={(e) => setCreditCardType(e.target.value)} sx={{ mb: 3 }}>
                                    <MenuItem value="visa">Visa</MenuItem>
                                    <MenuItem value="mastercard">MasterCard</MenuItem>
                                </Select>

                                <Typography variant="subtitle1" mb={1}>
                                    Upload Receipt
                                </Typography>
                                <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} />
                            </Grid>
                        </Grid>
                    )}

                    {/* Split Payment */}
                    {activePaymentMethod === 'split_payment' && (
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" mb={1}>
                                    Cash
                                </Typography>
                                <WholeNumberInput value={cashAmount} onChange={setCashAmount} />

                                <Typography variant="subtitle1" mb={1}>
                                    Credit Card
                                </Typography>
                                <WholeNumberInput value={creditCardAmount} onChange={setCreditCardAmount} />

                                <Typography variant="subtitle1" mb={1}>
                                    Bank Transfer
                                </Typography>
                                <WholeNumberInput value={bankTransferAmount} onChange={setBankTransferAmount} />
                                <Typography variant="subtitle1" mb={1}>
                                    Customer Changes
                                </Typography>
                                <Box
                                    sx={{
                                        mb: 3,
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Typography variant="h5" fontWeight="bold" color={Number.parseInt(customerChanges, 10) < 0 ? '#f44336' : '#333'}>
                                        Rs {customerChanges}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    )}

                    {/* Footer Buttons */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mt: 4,
                        }}
                    >
                        <Button
                            variant="outlined"
                            onClick={handleClosePayment}
                            sx={{
                                color: '#333',
                                borderColor: '#ddd',
                                textTransform: 'none',
                            }}
                        >
                            Cancel
                        </Button>
                        <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={handlePayNow} sx={styles.payNowButton}>
                            Pay Now
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Dialog>
    );
};

export default PaymentNow;

// Custom CSS
const styles = {
    numpadButton: {
        width: '100%',
        height: '60px',
        fontSize: '24px',
        borderRadius: '4px',
        border: '1px solid #e0e0e0',
        backgroundColor: 'white',
        color: '#333',
        '&:hover': {
            backgroundColor: '#f5f5f5',
        },
    },
    quickAmountButton: {
        borderRadius: '4px',
        border: '1px solid #e0e0e0',
        backgroundColor: 'white',
        color: '#333',
        padding: '8px 16px',
        textTransform: 'none',
        '&:hover': {
            backgroundColor: '#f5f5f5',
        },
    },
    payNowButton: {
        backgroundColor: '#0a3d62',
        color: 'white',
        borderRadius: '4px',
        padding: '12px 24px',
        textTransform: 'none',
        '&:hover': {
            backgroundColor: '#083352',
        },
    },
    paymentMethodTab: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '15px',
        cursor: 'pointer',
        borderBottom: '2px solid transparent',
    },
    activePaymentMethodTab: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '15px',
        cursor: 'pointer',
        borderBottom: '2px solid #0a3d62',
        backgroundColor: '#e3f2fd',
    },
    bankButton: {
        borderRadius: '4px',
        border: '1px solid #e0e0e0',
        backgroundColor: 'white',
        color: '#333',
        padding: '8px 16px',
        margin: '4px',
        textTransform: 'none',
        '&:hover': {
            backgroundColor: '#f5f5f5',
        },
    },
    activeBankButton: {
        borderRadius: '4px',
        border: '1px solid #0a3d62',
        backgroundColor: '#e3f2fd',
        color: '#0a3d62',
        padding: '8px 16px',
        margin: '4px',
        textTransform: 'none',
    },
};

function WholeNumberInput({ label, value, onChange, sx = {} }) {
    const handleChange = (e) => {
        const val = e.target.value;
        if (/^\d*$/.test(val)) {
            onChange(val);
        }
    };

    return (
        <TextField
            fullWidth
            type="number"
            label={label}
            value={value}
            onChange={handleChange}
            onKeyDown={(e) => {
                if (e.key === '.' || e.key === ',' || e.key === 'e') {
                    e.preventDefault();
                }
            }}
            inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
                min: '0',
                step: '1',
            }}
            InputProps={{
                startAdornment: <InputAdornment position="start">Rs</InputAdornment>,
            }}
            sx={{ mb: 3, ...sx }}
        />
    );
}
