import { router } from '@inertiajs/react';
import axios from 'axios';
import { AccountBalance as AccountBalanceIcon, ArrowForward as ArrowForwardIcon, Backspace as BackspaceIcon, CreditCard as CreditCardIcon } from '@mui/icons-material';
import { Box, Button, Dialog, Grid, InputAdornment, MenuItem, Select, Switch, TextField, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import Receipt from './Receipt';

const PaymentNow = ({ invoiceData, openSuccessPayment, openPaymentModal, handleClosePayment, setSelectedOrder, isLoading, mode = 'payment', handleSendToKitchen }) => {
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

    // ENT - Now as toggle, not payment method
    const [entEnabled, setEntEnabled] = useState(false);
    const [entReason, setEntReason] = useState('');
    const [entComment, setEntComment] = useState('');
    const [selectedEntItems, setSelectedEntItems] = useState([]);
    const [entAmount, setEntAmount] = useState('0');

    // CTS - Now as toggle, not payment method
    const [ctsEnabled, setCtsEnabled] = useState(false);
    const [ctsComment, setCtsComment] = useState('');
    const [ctsAmount, setCtsAmount] = useState('0');

    // Bank Charges
    const [bankChargesEnabled, setBankChargesEnabled] = useState(false);
    const [bankChargesType, setBankChargesType] = useState('percentage');
    const [bankChargesValue, setBankChargesValue] = useState(0);
    const [bankChargesAmount, setBankChargesAmount] = useState('0');

    // Fetch Settings
    useEffect(() => {
        axios
            .get(route('setting.financial'))
            .then((response) => {
                setBankChargesType(response.data.bank_charges_type || 'percentage');
                setBankChargesValue(parseFloat(response.data.bank_charges_value || 0));
            })
            .catch((error) => {
                console.error('Failed to load financial settings:', error);
            });
    }, []);

    // Calculate Bank Charges Amount
    useEffect(() => {
        if (bankChargesEnabled && bankChargesValue > 0) {
            let charges = 0;
            if (bankChargesType === 'percentage') {
                const grandTotal = parsePrice(invoiceData?.total_price || 0);
                charges = grandTotal * (bankChargesValue / 100);
            } else {
                charges = bankChargesValue;
            }
            setBankChargesAmount(charges.toFixed(2));
        } else {
            setBankChargesAmount('0');
        }
    }, [bankChargesEnabled, bankChargesType, bankChargesValue, invoiceData]);

    // Helper to parse price safely
    const parsePrice = (price) => {
        if (typeof price === 'number') return price;
        if (!price) return 0;
        return parseFloat(price.toString().replace(/,/g, ''));
    };

    // Calculate ENT Amount when items selected
    useEffect(() => {
        if (entEnabled && invoiceData?.order_items) {
            const selected = invoiceData.order_items.filter((item) => selectedEntItems.includes(item.id));
            const totalEnt = selected.reduce((sum, item) => {
                const itemTotal = item.order_item?.total_price || (item.order_item?.quantity || item.quantity) * (item.order_item?.price || item.price);
                return sum + parseFloat(itemTotal || 0);
            }, 0);
            setEntAmount(totalEnt.toFixed(2));
        } else {
            setEntAmount('0');
        }
    }, [selectedEntItems, invoiceData, entEnabled]);

    // Calculate Remaining Balance or Total with Charges
    useEffect(() => {
        const grandTotal = parsePrice(invoiceData?.total_price);
        const entDeduction = entEnabled ? parseFloat(entAmount || 0) : 0;
        const ctsDeduction = ctsEnabled ? parseFloat(ctsAmount || 0) : 0;

        let targetAmount = 0;

        if (entEnabled || ctsEnabled) {
            const remainder = grandTotal - entDeduction - ctsDeduction;
            targetAmount = remainder < 0 ? 0 : remainder;
        } else {
            // If bank charges enabled, add to total
            const bankCharge = bankChargesEnabled ? parseFloat(bankChargesAmount || 0) : 0;
            targetAmount = grandTotal + bankCharge;
        }

        // Update input amount
        setInputAmount(targetAmount.toFixed(2));
        setCustomerChanges('0');
    }, [entAmount, ctsAmount, entEnabled, ctsEnabled, bankChargesEnabled, bankChargesAmount, invoiceData]);

    const handlePaymentMethodChange = (method) => {
        setActivePaymentMethod(method);
        // No special handling needed - due amount is calculated based on ENT/CTS toggles
    };

    const handleBankSelection = (bank) => {
        setSelectedBank(bank);
    };

    const handleQuickAmountClick = (amount) => {
        // Sanitize the input amount (remove commas if present)
        const cleanAmount = parsePrice(amount).toString();
        setInputAmount(cleanAmount);

        // Calculate customer changes based on remaining after ENT/CTS and including Bank Charges
        const grandTotal = parsePrice(invoiceData.total_price);
        const entDeduction = entEnabled ? parseFloat(entAmount || 0) : 0;
        const ctsDeduction = ctsEnabled ? parseFloat(ctsAmount || 0) : 0;
        const bankCharges = bankChargesEnabled ? parseFloat(bankChargesAmount || 0) : 0;
        const dueAmount = grandTotal + bankCharges - entDeduction - ctsDeduction;

        const changes = parseFloat(cleanAmount) - dueAmount;
        setCustomerChanges((changes < 0 ? 0 : changes).toFixed(2));
    };

    const handleNumberClick = (number) => {
        let newAmount;
        const grandTotal = parsePrice(invoiceData.total_price);
        const entDeduction = entEnabled ? parseFloat(entAmount || 0) : 0;
        const ctsDeduction = ctsEnabled ? parseFloat(ctsAmount || 0) : 0;
        const bankCharges = bankChargesEnabled ? parseFloat(bankChargesAmount || 0) : 0;
        const dueAmount = grandTotal + bankCharges - entDeduction - ctsDeduction;

        if (parseFloat(inputAmount) === 0 && !inputAmount.includes('.')) {
            newAmount = number;
        } else if (parseFloat(inputAmount) === dueAmount) {
            // If currently equal to total, start fresh
            newAmount = number;
        } else {
            newAmount = inputAmount + number;
        }

        setInputAmount(newAmount);

        // Calculate customer changes
        const changes = parseFloat(newAmount) - dueAmount;
        setCustomerChanges((changes < 0 ? 0 : changes).toFixed(2));
    };

    const handleDeleteClick = () => {
        const grandTotal = parsePrice(invoiceData.total_price);
        const entDeduction = entEnabled ? parseFloat(entAmount || 0) : 0;
        const ctsDeduction = ctsEnabled ? parseFloat(ctsAmount || 0) : 0;
        const bankCharges = bankChargesEnabled ? parseFloat(bankChargesAmount || 0) : 0;
        const dueAmount = grandTotal + bankCharges - entDeduction - ctsDeduction;

        if (inputAmount.length > 1) {
            const newAmount = inputAmount.slice(0, -1);
            setInputAmount(newAmount);

            const changes = parseFloat(newAmount) - dueAmount;
            setCustomerChanges((changes < 0 ? 0 : changes).toFixed(2));
        } else {
            setInputAmount('0');
            const changes = 0 - dueAmount;
            setCustomerChanges((changes < 0 ? 0 : changes).toFixed(2));
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

    const handleOrderAndPay = async () => {
        const grandTotal = parsePrice(invoiceData.total_price);
        const entDeduction = entEnabled ? parseFloat(entAmount || 0) : 0;
        const ctsDeduction = ctsEnabled ? parseFloat(ctsAmount || 0) : 0;
        const bcAmount = bankChargesEnabled ? parseFloat(bankChargesAmount || 0) : 0;
        const remainingBalance = grandTotal + bcAmount - entDeduction - ctsDeduction;

        // Amount validation - input should cover remaining balance
        // Note: Using a small epsilon for float comparison safety, though simple < works usually
        if (remainingBalance > 0 && parseFloat(inputAmount) < remainingBalance - 0.01) {
            enqueueSnackbar('Please enter amount to cover remaining balance of Rs ' + remainingBalance.toFixed(2), { variant: 'warning' });
            return;
        }

        if (activePaymentMethod === 'credit_card' && !receiptFile) {
            enqueueSnackbar('Please upload the receipt', { variant: 'warning' });
            return;
        }

        let payload = {};

        // Prepare form data for credit card (with file)
        if (activePaymentMethod === 'credit_card') {
            payload = {
                payment: {
                    paid_amount: inputAmount,
                    payment_method: 'credit_card',
                    credit_card_type: creditCardType,
                },
                receipt: receiptFile,
            };
        } else {
            // For other payment methods (cash, bank) use regular payload
            const paidAmount = activePaymentMethod === 'split_payment' ? (parseFloat(cashAmount || 0) + parseFloat(creditCardAmount || 0) + parseFloat(bankTransferAmount || 0)).toFixed(2) : inputAmount;

            payload = {
                payment: {
                    paid_amount: paidAmount,
                    customer_changes: customerChanges,
                    payment_method: activePaymentMethod,
                    ...(activePaymentMethod === 'split_payment' && {
                        cash: cashAmount,
                        credit_card: creditCardAmount,
                        bank_transfer: bankTransferAmount,
                    }),
                },
            };
        }

        // Add ENT data if enabled
        if (entEnabled) {
            payload.payment.ent_enabled = true;
            payload.payment.ent_reason = entReason;
            payload.payment.ent_comment = entComment;
            payload.payment.ent_items = selectedEntItems;
            payload.payment.ent_amount = entDeduction;
        }

        // Add CTS data if enabled
        if (ctsEnabled) {
            payload.payment.cts_enabled = true;
            payload.payment.cts_comment = ctsComment;
            payload.payment.cts_amount = ctsDeduction;
        }

        // Add Bank Charges data if enabled
        if (bankChargesEnabled) {
            payload.payment.bank_charges_enabled = true;
            payload.payment.bank_charges_type = bankChargesType;
            payload.payment.bank_charges_value = bankChargesValue;
            payload.payment.bank_charges_amount = bankChargesAmount;
        }

        await handleSendToKitchen(payload);
    };

    const handlePayNow = () => {
        const grandTotal = parsePrice(invoiceData.total_price);
        const entDeduction = entEnabled ? parseFloat(entAmount || 0) : 0;
        const ctsDeduction = ctsEnabled ? parseFloat(ctsAmount || 0) : 0;
        const bcAmount = bankChargesEnabled ? parseFloat(bankChargesAmount || 0) : 0;
        const remainingBalance = grandTotal + bcAmount - entDeduction - ctsDeduction;

        // Amount validation - input should cover remaining balance
        if (remainingBalance > 0 && parseFloat(inputAmount) < remainingBalance - 0.01) {
            enqueueSnackbar('Please enter amount to cover remaining balance of Rs ' + remainingBalance.toFixed(2), { variant: 'warning' });
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

            // Add ENT/CTS data to FormData
            if (entEnabled) {
                formData.append('ent_enabled', 'true');
                formData.append('ent_reason', entReason);
                formData.append('ent_comment', entComment);
                formData.append('ent_amount', entDeduction);
                selectedEntItems.forEach((item, idx) => formData.append(`ent_items[${idx}]`, item));
            }
            if (ctsEnabled) {
                formData.append('cts_enabled', 'true');
                formData.append('cts_comment', ctsComment);
                formData.append('cts_amount', ctsDeduction);
            }
            if (bankChargesEnabled) {
                formData.append('bank_charges_enabled', 'true');
                formData.append('bank_charges_percentage', bankChargesPercentage);
                formData.append('bank_charges_amount', bankChargesAmount);
            }

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

            // Add ENT data if enabled
            if (entEnabled) {
                payload.ent_enabled = true;
                payload.ent_reason = entReason;
                payload.ent_comment = entComment;
                payload.ent_items = selectedEntItems;
                payload.ent_amount = entDeduction;
            }

            // Add CTS data if enabled
            if (ctsEnabled) {
                payload.cts_enabled = true;
                payload.cts_comment = ctsComment;
                payload.cts_amount = ctsDeduction;
            }

            // Add Bank Charges data if enabled
            if (bankChargesEnabled) {
                payload.bank_charges_enabled = true;
                payload.bank_charges_type = bankChargesType;
                payload.bank_charges_value = bankChargesValue;
                payload.bank_charges_amount = bankChargesAmount;
            }

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
            const total = parsePrice(invoiceData?.total_price);
            const change = totalPaid - total;
            setCustomerChanges((change < 0 ? 0 : change).toFixed(2));
            setInputAmount(totalPaid.toString()); // Optional: track total paid in inputAmount too
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
                {mode === 'payment' && <Receipt invoiceId={invoiceData?.id} openModal={openPaymentModal} showButtons={false} />}
                {mode === 'order' && <Receipt invoiceData={invoiceData} openModal={openPaymentModal} showButtons={false} />}

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
                            mb: 2,
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

                    {/* ENT/CTS/Bank Charges Toggles - Deductions & Adjustments Section */}
                    <Box sx={{ mb: 3, pt: 2, borderTop: '1px dashed #e0e0e0' }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Deductions & Adjustments
                        </Typography>

                        {/* ENT, CTS, Bank Charges Toggles */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                            {/* Bank Charges Toggle */}
                            <Box
                                sx={{
                                    flex: 1,
                                    p: 1.5,
                                    border: '1px solid #e0e0e0',
                                    borderRadius: 1,
                                    backgroundColor: bankChargesEnabled ? '#e3f2fd' : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    minWidth: '150px',
                                }}
                            >
                                <Switch
                                    checked={bankChargesEnabled}
                                    onChange={(e) => {
                                        setBankChargesEnabled(e.target.checked);
                                    }}
                                    size="small"
                                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#0a3d62' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#0a3d62' } }}
                                />
                                <Box>
                                    <Typography variant="body2" fontWeight="medium">
                                        Bank Charges
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {bankChargesType === 'percentage' ? `${bankChargesValue}%` : `Rs. ${bankChargesValue}`}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* ENT Toggle */}
                            <Box
                                sx={{
                                    flex: 1,
                                    p: 1.5,
                                    border: '1px solid #e0e0e0',
                                    borderRadius: 1,
                                    backgroundColor: entEnabled ? '#f5f9fc' : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    minWidth: '150px',
                                }}
                            >
                                <Switch
                                    checked={entEnabled}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setEntEnabled(checked);
                                        if (checked) {
                                            setCtsEnabled(false);
                                            setCtsAmount('0');
                                        } else {
                                            setSelectedEntItems([]);
                                        }
                                    }}
                                    size="small"
                                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#0a3d62' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#0a3d62' } }}
                                />
                                <Typography variant="body2" fontWeight="medium">
                                    ENT
                                </Typography>
                            </Box>

                            {/* CTS Toggle - Only for employees */}
                            {(invoiceData?.employee_id || invoiceData?.member?.booking_type === 'employee') && (
                                <Box
                                    sx={{
                                        flex: 1,
                                        p: 1.5,
                                        border: '1px solid #e0e0e0',
                                        borderRadius: 1,
                                        backgroundColor: ctsEnabled ? '#f5f9fc' : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        minWidth: '150px',
                                    }}
                                >
                                    <Switch
                                        checked={ctsEnabled}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setCtsEnabled(checked);
                                            if (checked) {
                                                setEntEnabled(false);
                                                setSelectedEntItems([]);
                                                setCtsAmount(parsePrice(invoiceData.total_price).toString());
                                            } else {
                                                setCtsAmount('0');
                                            }
                                        }}
                                        size="small"
                                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#0a3d62' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#0a3d62' } }}
                                    />
                                    <Typography variant="body2" fontWeight="medium">
                                        CTS
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        {/* ENT Item Selection - Shows when enabled */}
                        {entEnabled && invoiceData?.order_items && (
                            <Box sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: '#f5f9fc' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Select Items for ENT:
                                    </Typography>
                                    <Typography variant="body2" color="success.main" fontWeight="bold">
                                        Rs {entAmount}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedEntItems.length === invoiceData.order_items.length}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedEntItems(invoiceData.order_items.map((item) => item.id));
                                            } else {
                                                setSelectedEntItems([]);
                                            }
                                        }}
                                        style={{ marginRight: 8 }}
                                    />
                                    <Typography variant="body2" fontWeight="medium">
                                        Select All
                                    </Typography>
                                </Box>
                                {invoiceData.order_items.map((item) => (
                                    <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedEntItems.includes(item.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedEntItems([...selectedEntItems, item.id]);
                                                    } else {
                                                        setSelectedEntItems(selectedEntItems.filter((id) => id !== item.id));
                                                    }
                                                }}
                                                style={{ marginRight: 8 }}
                                            />
                                            <Typography variant="body2">
                                                {item.order_item?.product?.name || item.name} (x{item.order_item?.quantity || item.quantity})
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" fontWeight="medium">
                                            Rs {item.order_item?.total_price || (item.order_item?.quantity || item.quantity) * (item.order_item?.price || item.price)}
                                        </Typography>
                                    </Box>
                                ))}
                                <Select fullWidth value={entReason} onChange={(e) => setEntReason(e.target.value)} size="small" sx={{ mt: 2 }} displayEmpty>
                                    <MenuItem value="" disabled>
                                        Select ENT Reason
                                    </MenuItem>
                                    <MenuItem value="Marketing">Marketing</MenuItem>
                                    <MenuItem value="Director/CEO">Director/CEO</MenuItem>
                                    <MenuItem value="Club Guest">Club Guest</MenuItem>
                                    <MenuItem value="Rooms Guest">Rooms Guest</MenuItem>
                                    <MenuItem value="Others">Others</MenuItem>
                                    <MenuItem value="Discover Pakistan">Discover Pakistan</MenuItem>
                                    <MenuItem value="FnB Management">FnB Management</MenuItem>
                                    <MenuItem value="Front Office">Front Office</MenuItem>
                                    <MenuItem value="Front Vouchers">Front Vouchers</MenuItem>
                                    <MenuItem value="Labour ENT">Labour ENT</MenuItem>
                                    <MenuItem value="iTRIP ENT">iTRIP ENT</MenuItem>
                                    <MenuItem value="Food Complain">Food Complain</MenuItem>
                                </Select>
                                <TextField fullWidth label="ENT Comment" value={entComment} onChange={(e) => setEntComment(e.target.value)} size="small" multiline rows={2} sx={{ mt: 1 }} />
                            </Box>
                        )}

                        {/* CTS Amount Input - Shows when enabled */}
                        {ctsEnabled && (
                            <Box sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: '#f5f9fc' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        CTS Amount:
                                    </Typography>
                                    <Typography variant="body2" color="success.main" fontWeight="bold">
                                        Rs {ctsAmount}
                                    </Typography>
                                </Box>
                                <WholeNumberInput value={ctsAmount} onChange={(val) => setCtsAmount(val)} sx={{ mb: 1 }} />
                                <TextField fullWidth label="CTS Comment" value={ctsComment} onChange={(e) => setCtsComment(e.target.value)} size="small" multiline rows={2} sx={{ mt: 1 }} />
                            </Box>
                        )}

                        {/* Bank Charges Information */}
                        {bankChargesEnabled && (
                            <Box sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: '#e3f2fd' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Bank Charges ({bankChargesType === 'percentage' ? `${bankChargesValue}%` : 'Fixed'}):
                                    </Typography>
                                    <Typography variant="body2" color="primary.main" fontWeight="bold">
                                        + Rs {bankChargesAmount}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary" fontStyle="italic">
                                    Added to the payable amount.
                                </Typography>
                            </Box>
                        )}

                        {/* Remaining Balance Display */}
                        {(entEnabled || ctsEnabled) && (
                            <Box sx={{ p: 2, backgroundColor: '#fff3e0', borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body1" fontWeight="medium">
                                    Remaining Balance to Pay:
                                </Typography>
                                <Typography variant="h6" fontWeight="bold" color="warning.main">
                                    Rs {(parsePrice(invoiceData?.total_price) - (entEnabled ? parseFloat(entAmount || 0) : 0) - (ctsEnabled ? parseFloat(ctsAmount || 0) : 0)).toFixed(2)}
                                </Typography>
                            </Box>
                        )}
                        {/* Total With Bank Charges Display */}
                        {bankChargesEnabled && !entEnabled && !ctsEnabled && (
                            <Box sx={{ p: 2, backgroundColor: '#e3f2fd', borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body1" fontWeight="medium">
                                    Total Payable:
                                </Typography>
                                <Typography variant="h6" fontWeight="bold" color="primary.main">
                                    Rs {(parsePrice(invoiceData?.total_price) + parseFloat(bankChargesAmount)).toFixed(2)}
                                </Typography>
                            </Box>
                        )}
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
                                    <Button
                                        variant="outlined"
                                        onClick={() => {
                                            const grandTotal = parsePrice(invoiceData.total_price);
                                            const entDeduction = entEnabled ? parseFloat(entAmount || 0) : 0;
                                            const ctsDeduction = ctsEnabled ? parseFloat(ctsAmount || 0) : 0;
                                            const bcAmount = bankChargesEnabled ? parseFloat(bankChargesAmount || 0) : 0;
                                            const remainingBalance = grandTotal + bcAmount - entDeduction - ctsDeduction;
                                            handleQuickAmountClick(remainingBalance.toString());
                                        }}
                                        sx={styles.quickAmountButton}
                                    >
                                        Exact money
                                    </Button>
                                    <Button variant="outlined" onClick={() => handleQuickAmountClick('100')} sx={styles.quickAmountButton}>
                                        Rs 100
                                    </Button>
                                    <Button variant="outlined" onClick={() => handleQuickAmountClick('500')} sx={styles.quickAmountButton}>
                                        Rs 500
                                    </Button>
                                    <Button variant="outlined" onClick={() => handleQuickAmountClick('1000')} sx={styles.quickAmountButton}>
                                        Rs 1000
                                    </Button>
                                    <Button variant="outlined" onClick={() => handleQuickAmountClick('5000')} sx={styles.quickAmountButton}>
                                        Rs 5000
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
                            py: 4,
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
                        <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={mode === 'payment' ? handlePayNow : handleOrderAndPay} sx={styles.payNowButton} disabled={isLoading} loading={isLoading} loadingPosition="start">
                            {mode === 'payment' ? 'Pay Now' : 'Order & Pay'}
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
        padding: '8px 10px',
        cursor: 'pointer',
        borderBottom: '2px solid transparent',
    },
    activePaymentMethodTab: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 10px',
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
