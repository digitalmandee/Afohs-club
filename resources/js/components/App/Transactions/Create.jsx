import React, { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Box, Card, CardContent, Typography, Grid, TextField, Button, FormControl, Select, MenuItem, Autocomplete, Chip, Alert, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, FormHelperText, Pagination, InputAdornment, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enqueueSnackbar } from 'notistack';
import axios from 'axios';
import { Person, Search, Save, Print, Receipt, Visibility, Payment } from '@mui/icons-material';
import MembershipInvoiceSlip from '@/pages/App/Admin/Membership/Invoice';

export default function CreateTransaction({ subscriptionTypes = [], subscriptionCategories = [], preSelectedMember = null, allowedFeeTypes = null }) {
    // const [open, setOpen] = useState(true);
    const [selectedMember, setSelectedMember] = useState(null);
    const [memberTransactions, setMemberTransactions] = useState([]);
    const [membershipFeePaid, setMembershipFeePaid] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [dateValidation, setDateValidation] = useState({ isValid: true, message: '' });
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [createdInvoiceId, setCreatedInvoiceId] = useState(null);
    const [createdMemberId, setCreatedMemberId] = useState(null);
    const [paymentConfirmationOpen, setPaymentConfirmationOpen] = useState(false);
    const [transactionToPay, setTransactionToPay] = useState(null);

    // Pagination and search states
    const [searchInvoice, setSearchInvoice] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [transactionsPerPage] = useState(5);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [quarterStatus, setQuarterStatus] = useState({
        paidQuarters: [],
        nextAvailableQuarter: 1,
        currentYear: new Date().getFullYear(),
    });

    const [subscriptionItems, setSubscriptionItems] = useState([]); // Array to store multiple subscriptions

    const { data, setData, post, processing, errors, reset } = useForm({
        member_id: '',
        fee_type: '',
        payment_frequency: 'monthly',
        discount_type: '',
        discount_value: '',
        payment_method: 'cash',
        amount: '',
        tax_percentage: '',
        overdue_percentage: '',
        additional_charges: '',
        remarks: '',
        valid_from: '',
        valid_to: '',
        starting_quarter: 1,
        credit_card_type: '',
        receipt_file: null,
        // Temporary fields for adding a subscription
        subscription_type_id: '',
        subscription_category_id: '',
        family_member_id: null, // null means SELF (primary member)
        item_amount: '', // Editable amount for the item being added
        item_discount_type: '',
        item_discount_value: '',
        subscriptions: [], // Array to send to backend
        item_amount: '',
        item_discount_type: '',
        item_discount_value: '',
    });

    // Auto-update payment suggestions when member changes
    useEffect(() => {
        if (selectedMember && data.fee_type === 'maintenance_fee') {
            const currentFrequency = data.payment_frequency || 'monthly';
            suggestMaintenancePeriod(currentFrequency);
        }
    }, [selectedMember, memberTransactions]); // Trigger when member or their transactions change

    // Handle pre-selected member
    useEffect(() => {
        if (preSelectedMember) {
            handleMemberSelect(preSelectedMember);
        }
    }, [preSelectedMember]);

    // Auto-set fee type based on member status
    useEffect(() => {
        if (selectedMember) {
            const isAllowed = (type) => !allowedFeeTypes || allowedFeeTypes.includes(type);

            if ((selectedMember.status === 'cancelled' || selectedMember.status === 'expired') && isAllowed('reinstating_fee')) {
                // For cancelled or expired members, automatically set to reinstating fee
                handleFeeTypeChange('reinstating_fee');
            } else if (!membershipFeePaid) {
                if (isAllowed('membership_fee')) {
                    // If membership fee is not paid, force it
                    handleFeeTypeChange('membership_fee');
                }
            } else {
                // For non-cancelled/expired members, clear fee type if it was reinstating fee
                // validation for allowed types on auto-switch
                if (data.fee_type === 'reinstating_fee' || data.fee_type === 'membership_fee') {
                    if (isAllowed('maintenance_fee')) {
                        handleFeeTypeChange('maintenance_fee');
                    } else if (isAllowed('subscription_fee')) {
                        handleFeeTypeChange('subscription_fee');
                    }
                }
            }
        }
    }, [selectedMember?.status, membershipFeePaid, allowedFeeTypes]); // Trigger when member status or payment status changes

    const analyzeQuarterStatus = (transactions, membershipDate) => {
        if (!membershipDate) {
            return {
                paidQuarters: [],
                nextAvailableQuarter: 1,
                currentYear: new Date().getFullYear(),
                isNewCycle: false,
                latestEndDate: null,
            };
        }

        const membershipYear = new Date(membershipDate).getFullYear();
        const membershipMonth = new Date(membershipDate).getMonth(); // 0-based (0 = Jan, 11 = Dec)
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        // Get maintenance fee transactions
        const maintenanceTransactions = transactions.filter((t) => t.fee_type === 'maintenance_fee' && t.status === 'paid');
        // Sort transactions by validity end date (latest first)
        const sortedTransactions = [...maintenanceTransactions].sort((a, b) => new Date(b.valid_to) - new Date(a.valid_to));

        let paidQuarters = [];
        let latestEndDate = null;
        let showCompletedYear = false;
        let isFirstYear = true; // Default to first year
        let completedCycles = 0;

        if (sortedTransactions.length > 0) {
            const mostRecentTransaction = sortedTransactions[0];
            const mostRecentEnd = new Date(mostRecentTransaction.valid_to);

            // Check if we've moved past the first year (December 31st of membership year)
            const firstYearEnd = new Date(membershipYear, 11, 31); // Dec 31 of membership year
            isFirstYear = mostRecentEnd <= firstYearEnd;

            latestEndDate = mostRecentEnd.toISOString().split('T')[0];
        }

        // Check if all first year months are paid to determine which system to use
        const monthsInFirstYear = [];
        for (let month = membershipMonth + 1; month <= 11; month++) {
            monthsInFirstYear.push(month);
        }

        const paidMonthsInFirstYear = [];
        sortedTransactions.forEach((transaction) => {
            const txStart = new Date(transaction.valid_from);
            const txEnd = new Date(transaction.valid_to);

            let currentDate = new Date(txStart.getFullYear(), txStart.getMonth(), 1);
            const endDate = new Date(txEnd.getFullYear(), txEnd.getMonth(), 1);

            while (currentDate <= endDate) {
                const month = currentDate.getMonth();
                const year = currentDate.getFullYear();

                const monthStart = new Date(year, month, 1);
                const monthEnd = new Date(year, month + 1, 0);
                const hasOverlap = txStart <= monthEnd && txEnd >= monthStart;

                if (hasOverlap && year === membershipYear && monthsInFirstYear.includes(month) && !paidMonthsInFirstYear.includes(month)) {
                    paidMonthsInFirstYear.push(month);
                }

                currentDate.setMonth(currentDate.getMonth() + 1);
            }
        });

        const allFirstYearMonthsPaid = paidMonthsInFirstYear.length >= monthsInFirstYear.length;

        if (isFirstYear && !allFirstYearMonthsPaid) {
            // FIRST YEAR: Monthly payment logic (only show if still paying monthly)
            // Map months to quarters for display (approximate)
            paidMonthsInFirstYear.forEach((month) => {
                const quarter = Math.floor(month / 3) + 1; // 0-2->Q1, 3-5->Q2, 6-8->Q3, 9-11->Q4
                if (!paidQuarters.includes(quarter)) {
                    paidQuarters.push(quarter);
                }
            });
        } else {
            // SUBSEQUENT YEARS: Quarterly payment logic (Jan-Mar, Apr-Jun, Jul-Sep, Oct-Dec)
            // Determine the correct analysis year based on latest payment
            let analysisYear = currentYear;

            // If we have payments, use the year after the latest payment end date
            if (sortedTransactions.length > 0) {
                const latestPaymentEnd = new Date(sortedTransactions[0].valid_to);
                const latestPaymentYear = latestPaymentEnd.getFullYear();
                const latestPaymentMonth = latestPaymentEnd.getMonth();

                console.log('Latest payment end:', latestPaymentEnd);
                console.log('Latest payment year:', latestPaymentYear);
                console.log('Current year:', currentYear);

                // Analyze the year of the latest payment to show its quarter status
                analysisYear = latestPaymentYear;

                console.log('Analysis year determined:', analysisYear);
            }

            // For quarter analysis, we need to check if the latest payment year is complete
            // If latest payment ended in December of a future year, show all quarters as paid for that year
            let quarterlyTransactions = [];

            if (sortedTransactions.length > 0) {
                const latestPaymentEnd = new Date(sortedTransactions[0].valid_to);
                const latestPaymentYear = latestPaymentEnd.getFullYear();
                const latestPaymentMonth = latestPaymentEnd.getMonth();

                // If latest payment ended in December of any year, that year is complete
                if (latestPaymentMonth === 11) {
                    // December
                    showCompletedYear = true;
                    analysisYear = latestPaymentYear;
                    // Show all quarters as paid for the completed year
                    paidQuarters = [1, 2, 3, 4];
                } else {
                    // Show partial year progress
                    quarterlyTransactions = sortedTransactions.filter((transaction) => {
                        const txStart = new Date(transaction.valid_from);
                        const txEnd = new Date(transaction.valid_to);

                        // Include transactions that overlap with analysis year
                        return (txStart.getFullYear() <= analysisYear && txEnd.getFullYear() >= analysisYear) || txStart.getFullYear() === analysisYear || txEnd.getFullYear() === analysisYear;
                    });
                }
            } else {
                // No transactions, analyze current year
                quarterlyTransactions = [];
            }

            // Analyze which months are covered by all transactions combined
            const paidMonthsInYear = new Set();

            console.log('Quarterly transactions to analyze:', quarterlyTransactions);
            console.log('Analysis year:', analysisYear);

            quarterlyTransactions.forEach((transaction) => {
                const txStart = new Date(transaction.valid_from);
                const txEnd = new Date(transaction.valid_to);

                console.log(`Analyzing transaction: ${transaction.valid_from} to ${transaction.valid_to}`);

                // Mark each month covered by this transaction
                let currentDate = new Date(txStart.getFullYear(), txStart.getMonth(), 1);
                const endDate = new Date(txEnd.getFullYear(), txEnd.getMonth(), 1);

                while (currentDate <= endDate) {
                    const year = currentDate.getFullYear();
                    const month = currentDate.getMonth();

                    console.log(`Checking month: ${year}-${month}, analysisYear: ${analysisYear}`);

                    // Count months from current analysis year
                    if (year === analysisYear) {
                        const monthKey = `${year}-${month}`;
                        paidMonthsInYear.add(monthKey);
                        console.log(`Added paid month: ${monthKey}`);
                    }

                    currentDate.setMonth(currentDate.getMonth() + 1);
                }
            });

            console.log('Paid months in year:', Array.from(paidMonthsInYear));

            // Now check which quarters are completely covered and track partial quarters
            const currentAnalysisYear = analysisYear; // Use current year for analysis
            const partialQuarters = {}; // Track which quarters are partially paid

            for (let quarter = 1; quarter <= 4; quarter++) {
                const quarterStartMonth = (quarter - 1) * 3; // Q1=0(Jan), Q2=3(Apr), Q3=6(Jul), Q4=9(Oct)
                const monthsInQuarter = [quarterStartMonth, quarterStartMonth + 1, quarterStartMonth + 2];

                const paidMonthsInQuarter = monthsInQuarter.filter((month) => {
                    const monthKey = `${currentAnalysisYear}-${month}`;
                    return paidMonthsInYear.has(monthKey);
                });

                const allMonthsPaid = paidMonthsInQuarter.length === 3;
                const someMonthsPaid = paidMonthsInQuarter.length > 0;

                if (allMonthsPaid) {
                    paidQuarters.push(quarter);
                } else if (someMonthsPaid) {
                    // Track partial quarter info
                    const unpaidMonths = monthsInQuarter.filter((month) => {
                        const monthKey = `${currentAnalysisYear}-${month}`;
                        return !paidMonthsInYear.has(monthKey);
                    });

                    partialQuarters[quarter] = {
                        paidMonths: paidMonthsInQuarter,
                        unpaidMonths: unpaidMonths,
                        nextUnpaidMonth: Math.min(...unpaidMonths),
                    };
                }
            }

            // Store partial quarter info for later use
            window.partialQuarters = partialQuarters;
        }

        paidQuarters.sort((a, b) => a - b);

        // Determine next payment period
        let nextQuarter = 1;
        let isNewCycle = false;

        if (isFirstYear) {
            // For first year, determine next month to pay
            const monthsInFirstYear = [];
            for (let month = membershipMonth + 1; month <= 11; month++) {
                monthsInFirstYear.push(month);
            }

            const paidMonths = [];
            sortedTransactions.forEach((transaction) => {
                const txStart = new Date(transaction.valid_from);
                const txEnd = new Date(transaction.valid_to);

                // More accurate month detection: check each month the transaction spans
                let currentDate = new Date(txStart.getFullYear(), txStart.getMonth(), 1);
                const endDate = new Date(txEnd.getFullYear(), txEnd.getMonth(), 1);

                while (currentDate <= endDate) {
                    const month = currentDate.getMonth();
                    const year = currentDate.getFullYear();

                    // Check if this month overlaps with the transaction period
                    const monthStart = new Date(year, month, 1);
                    const monthEnd = new Date(year, month + 1, 0); // Last day of month

                    // Transaction covers this month if there's any overlap
                    const hasOverlap = txStart <= monthEnd && txEnd >= monthStart;

                    if (hasOverlap && year === membershipYear && monthsInFirstYear.includes(month) && !paidMonths.includes(month)) {
                        paidMonths.push(month);
                    }

                    currentDate.setMonth(currentDate.getMonth() + 1);
                }
            });

            // Check if all first year months are paid
            if (paidMonths.length >= monthsInFirstYear.length) {
                // Move to quarterly system for next year
                nextQuarter = 1;
                isNewCycle = true;
            } else {
                // Still in first year, find next month
                const nextMonth = monthsInFirstYear.find((month) => !paidMonths.includes(month));
                nextQuarter = Math.floor((nextMonth || 0) / 3) + 1;
            }
        } else {
            // Quarterly system logic
            const hasAllQuarters = paidQuarters.includes(1) && paidQuarters.includes(2) && paidQuarters.includes(3) && paidQuarters.includes(4);
            const partialQuarters = window.partialQuarters || {};

            if (hasAllQuarters || showCompletedYear) {
                nextQuarter = 1;
                isNewCycle = true;
                // If showing completed year, reset quarters for display of next year
                if (showCompletedYear) {
                    paidQuarters = [1, 2, 3, 4]; // Keep showing completed year
                } else {
                    paidQuarters = []; // Reset for new cycle display
                }
            } else {
                // Check for partial quarters first (priority)
                let foundPartialQuarter = false;
                for (let i = 1; i <= 4; i++) {
                    if (partialQuarters[i]) {
                        nextQuarter = i;
                        foundPartialQuarter = true;
                        break;
                    }
                }

                // If no partial quarters, find next unpaid quarter
                if (!foundPartialQuarter) {
                    for (let i = 1; i <= 4; i++) {
                        if (!paidQuarters.includes(i)) {
                            nextQuarter = i;
                            break;
                        }
                    }
                }
                isNewCycle = false;
            }
        }

        return {
            paidQuarters,
            nextAvailableQuarter: nextQuarter,
            currentYear: currentYear,
            isNewCycle,
            latestEndDate,
            completedCycles,
        };
    };

    // Search members function
    const searchMembers = async (query) => {
        if (!query || query.length < 2) {
            setSearchResults([]);
            return;
        }

        setSearchLoading(true);
        try {
            const response = await axios.get(route('finance.transaction.search'), {
                params: { query },
            });
            setSearchResults(response.data.members || []);
        } catch (error) {
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    const fetchMemberTransactions = async (memberId) => {
        setLoadingTransactions(true);
        try {
            const response = await axios.get(route('finance.transaction.member', memberId));
            // Only update member details if we are fetching for the currently selected member
            // This prevents overwriting if the user switched members quickly (though unlikely here)
            setSelectedMember(response.data.member);
            setMemberTransactions(response.data.transactions);
            setFilteredTransactions(response.data.transactions);
            setMembershipFeePaid(response.data.membership_fee_paid);

            // Analyze quarter payment status
            const quarterAnalysis = analyzeQuarterStatus(response.data.transactions, response.data.member.membership_date);
            setQuarterStatus(quarterAnalysis);

            return response.data;
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error loading member transactions', { variant: 'error' });
        } finally {
            setLoadingTransactions(false);
        }
    };

    const handleMemberSelect = async (member) => {
        setSelectedMember(member);
        setData('member_id', member.id);

        await fetchMemberTransactions(member.id);
        enqueueSnackbar(`Selected member: ${member.full_name}`, { variant: 'info' });
    };

    // Search function for invoice numbers
    const handleSearchInvoice = (searchTerm) => {
        setSearchInvoice(searchTerm);
        setCurrentPage(1); // Reset to first page when searching

        if (!searchTerm.trim()) {
            setFilteredTransactions(memberTransactions);
        } else {
            const filtered = memberTransactions.filter((transaction) => transaction.invoice_no == searchTerm);
            setFilteredTransactions(filtered);
        }
    };

    // Pagination calculations
    const indexOfLastTransaction = currentPage * transactionsPerPage;
    const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
    const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
    const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

    const handlePageChange = (event, newPage) => {
        setCurrentPage(newPage);
    };

    const handleFeeTypeChange = (feeType) => {
        setData((prevData) => {
            const newData = {
                ...prevData,
                fee_type: feeType,
                amount: '',
                valid_from: '',
                valid_to: '',
                subscription_type_id: '',
                subscription_category_id: '',
                tax_percentage: '',
                overdue_percentage: '',
                remarks: '',
            };

            // Helper to parse amount (remove commas if present)
            const parseAmount = (val) => {
                if (!val) return '';
                return parseFloat(String(val).replace(/,/g, ''));
            };

            // Update amount based on fee type and selected member
            const memberCategory = selectedMember?.member_category || selectedMember?.memberCategory;

            if (selectedMember && memberCategory) {
                if (feeType === 'membership_fee') {
                    newData.amount = parseAmount(memberCategory.fee);
                    // Auto-suggest 4 years validity for membership fee
                    const today = new Date();
                    const fourYearsLater = new Date(today.getFullYear() + 4, today.getMonth(), today.getDate());
                    newData.valid_from = today.toISOString().split('T')[0];
                    newData.valid_to = fourYearsLater.toISOString().split('T')[0];
                } else if (feeType === 'maintenance_fee') {
                    newData.amount = parseAmount(memberCategory.subscription_fee);
                    // Auto-suggest monthly period based on member joining date
                    // Note: suggestMaintenancePeriod needs to be called separately as it depends on state
                    setTimeout(() => suggestMaintenancePeriod('monthly'), 0);
                } else if (feeType === 'subscription_fee') {
                    // For subscription fees, reset items and amount
                    setSubscriptionItems([]);
                    newData.amount = '';
                } else if (feeType === 'reinstating_fee') {
                    // For reinstating fees, set a standard amount (can be customized)
                    newData.amount = 25000; // Standard reinstating fee amount
                    // No validity period needed for reinstating fees
                    newData.valid_from = '';
                    newData.valid_to = '';
                }
            }
            return newData;
        });
    };

    const handleAddSubscription = () => {
        // Validate required fields
        const newErrors = {};
        if (!data.subscription_type_id) newErrors.subscription_type_id = 'Subscription Type is required';
        if (!data.subscription_category_id) newErrors.subscription_category_id = 'Subscription Category is required';
        if (!data.valid_from) newErrors.valid_from = 'Start Date is required';
        if (!data.valid_to) newErrors.valid_to = 'End Date is required';

        if (Object.keys(newErrors).length > 0) {
            setFormErrors((prev) => ({ ...prev, ...newErrors }));
            enqueueSnackbar('Please fill all required subscription fields', { variant: 'error' });
            return;
        }

        // Get details for display
        const type = subscriptionTypes.find((t) => t.id == data.subscription_type_id);
        const category = subscriptionCategories.find((c) => c.id == data.subscription_category_id);

        let familyMemberName = 'SELF';
        let familyMemberRelation = 'Primary Member';
        if (data.family_member_id) {
            const familyMember = selectedMember.family_members.find((f) => f.id == data.family_member_id);
            if (familyMember) {
                familyMemberName = familyMember.full_name;
                familyMemberRelation = familyMember.relation;
            }
        }

        // Calculate net amount for this item
        const baseAmount = parseFloat(data.item_amount) || 0;
        const discountVal = parseFloat(data.item_discount_value) || 0;
        let netAmount = baseAmount;

        if (data.item_discount_type === 'fixed') {
            netAmount = Math.max(0, baseAmount - discountVal);
        } else if (data.item_discount_type === 'percent') {
            netAmount = Math.max(0, baseAmount - (baseAmount * discountVal) / 100);
        }

        const newItem = {
            id: Date.now(), // Temporary ID
            subscription_type_id: data.subscription_type_id,
            subscription_category_id: data.subscription_category_id,
            family_member_id: data.family_member_id,
            valid_from: data.valid_from,
            valid_to: data.valid_to,

            // Financials
            amount: baseAmount,
            discount_type: data.item_discount_type,
            discount_value: data.item_discount_value,
            net_amount: netAmount,

            // Display only props
            type_name: type?.name,
            category_name: category?.name,
            family_member_name: familyMemberName,
            family_member_relation: familyMemberRelation,
        };

        const updatedItems = [...subscriptionItems, newItem];
        setSubscriptionItems(updatedItems);

        // Update total amount (Sum of Net Amounts)
        const totalAmount = updatedItems.reduce((sum, item) => sum + item.net_amount, 0);

        // Reset inputs
        setData((prev) => ({
            ...prev,
            amount: totalAmount,
            subscription_type_id: '',
            subscription_category_id: '',
            family_member_id: null,
            item_amount: '',
            item_discount_type: '',
            item_discount_value: '',
            // valid_from: '', // Optional: keep or reset
            // valid_to: '',
        }));

        enqueueSnackbar('Subscription added to list', { variant: 'success' });
        setFormErrors({});
    };

    const handleRemoveSubscription = (index) => {
        const updatedItems = [...subscriptionItems];
        updatedItems.splice(index, 1);
        setSubscriptionItems(updatedItems);

        // Recalculate total amount
        // Recalculate total amount
        const totalAmount = updatedItems.reduce((sum, item) => sum + item.net_amount, 0);
        setData('amount', totalAmount || '');
    };

    const suggestMaintenancePeriod = (frequency) => {
        if (!selectedMember || !selectedMember.member_category) {
            return;
        }

        const membershipDate = new Date(selectedMember.membership_date);
        const membershipYear = membershipDate.getFullYear();
        const membershipMonth = membershipDate.getMonth(); // 0-based
        const currentYear = new Date().getFullYear();

        // Debug logging
        console.log('=== SUGGEST MAINTENANCE PERIOD DEBUG ===');
        console.log('Member:', selectedMember.full_name);
        console.log('Membership Date:', membershipDate);
        console.log('Membership Year:', membershipYear);
        console.log('Current Year:', currentYear);
        console.log('Transactions:', memberTransactions);
        console.log('Quarter Status:', quarterStatus);

        // Check if we're still in the first year (monthly payment system)
        const firstYearEnd = new Date(Date.UTC(membershipYear, 11, 31)); // Dec 31 of membership year
        const isFirstYear = !quarterStatus.latestEndDate || new Date(quarterStatus.latestEndDate) <= firstYearEnd;

        // Check if all first year months are already paid
        const monthsInFirstYear = [];
        for (let month = membershipMonth + 1; month <= 11; month++) {
            monthsInFirstYear.push(month);
        }

        const paidMonths = [];
        const maintenanceTransactions = memberTransactions.filter((t) => t.fee_type === 'maintenance_fee' && t.status === 'paid');
        maintenanceTransactions.forEach((transaction) => {
            const txStart = new Date(transaction.valid_from);
            const txEnd = new Date(transaction.valid_to);

            let currentDate = new Date(txStart.getFullYear(), txStart.getMonth(), 1);
            const endDate = new Date(txEnd.getFullYear(), txEnd.getMonth(), 1);

            while (currentDate <= endDate) {
                const month = currentDate.getMonth();
                const year = currentDate.getFullYear();

                const monthStart = new Date(year, month, 1);
                const monthEnd = new Date(year, month + 1, 0);
                const hasOverlap = txStart <= monthEnd && txEnd >= monthStart;

                if (hasOverlap && year === membershipYear && monthsInFirstYear.includes(month) && !paidMonths.includes(month)) {
                    paidMonths.push(month);
                }

                currentDate.setMonth(currentDate.getMonth() + 1);
            }
        });

        const allFirstYearMonthsPaid = paidMonths.length >= monthsInFirstYear.length;

        let startDate, endDate, amount;

        if (isFirstYear && !allFirstYearMonthsPaid) {
            // FIRST YEAR: Monthly payment system (only if not all months are paid)
            if (quarterStatus.latestEndDate && paidMonths.length > 0) {
                // Continue from where last payment ended - start from first day of next month
                const lastEndDate = new Date(quarterStatus.latestEndDate);
                // Use UTC to avoid timezone issues and start from first day of next month
                startDate = new Date(Date.UTC(lastEndDate.getUTCFullYear(), lastEndDate.getUTCMonth() + 1, 1));
            } else {
                // Start from the month after membership month (for new members or no payments)
                // Use UTC to avoid timezone issues
                startDate = new Date(Date.UTC(membershipYear, membershipMonth + 1, 1));
            }

            // Calculate how many months to pay based on frequency
            let monthsToAdd;
            if (frequency === 'monthly') {
                monthsToAdd = 1;
            } else if (frequency === 'quarterly') {
                monthsToAdd = 3;
            } else if (frequency === 'half_yearly') {
                monthsToAdd = 6;
            } else if (frequency === 'three_quarters') {
                monthsToAdd = 9;
            } else {
                // annually
                monthsToAdd = 12;
            }

            // Calculate end date using complete months
            endDate = new Date(startDate);
            endDate.setUTCMonth(startDate.getUTCMonth() + monthsToAdd);
            endDate.setUTCDate(0); // Last day of previous month (complete month)

            // Cap at December 31st of membership year
            if (endDate > firstYearEnd) {
                endDate = new Date(firstYearEnd);
            }

            // Calculate amount based on actual months covered
            const actualMonths = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
            const monthlyFee = parseFloat(String(selectedMember.member_category.subscription_fee).replace(/,/g, '')); // Monthly fee (base fee)
            amount = Math.round(monthlyFee * actualMonths);
        } else {
            // SUBSEQUENT YEARS OR FIRST YEAR COMPLETE: Quarterly payment system (Jan-Mar, Apr-Jun, Jul-Sep, Oct-Dec)
            // But also support monthly payments and partial quarter completion
            const partialQuarters = window.partialQuarters || {};
            const currentPartialQuarter = partialQuarters[quarterStatus.nextAvailableQuarter];

            let quartersToAdd, monthsToAdd;

            // Check if we're completing a partial quarter
            if (currentPartialQuarter && frequency === 'quarterly') {
                // For partial quarter completion, only pay remaining months
                monthsToAdd = currentPartialQuarter.unpaidMonths.length;
                quartersToAdd = 1;
            } else if (frequency === 'monthly') {
                monthsToAdd = 1;
                quartersToAdd = 1; // For calculation purposes
            } else if (frequency === 'quarterly') {
                monthsToAdd = 3;
                quartersToAdd = 1;
            } else if (frequency === 'half_yearly') {
                monthsToAdd = 6;
                quartersToAdd = 2;
            } else if (frequency === 'three_quarters') {
                monthsToAdd = 9;
                quartersToAdd = 3;
            } else {
                // annually
                monthsToAdd = 12;
                quartersToAdd = 4;
            }

            if (quarterStatus.latestEndDate && !allFirstYearMonthsPaid) {
                // Continue from where last payment ended - start from first day of next month
                const lastEndDate = new Date(quarterStatus.latestEndDate);
                startDate = new Date(Date.UTC(lastEndDate.getUTCFullYear(), lastEndDate.getUTCMonth() + 1, 1));
            } else if (allFirstYearMonthsPaid || !isFirstYear) {
                // Start from January 1st of the year after membership year, or continue quarterly system
                if (currentPartialQuarter) {
                    // For partial quarters, start from the first unpaid month in that quarter
                    const nextUnpaidMonth = currentPartialQuarter.nextUnpaidMonth;
                    // Use the year from latest payment, not current year
                    const latestPaymentYear = quarterStatus.latestEndDate ? new Date(quarterStatus.latestEndDate).getFullYear() : currentYear;
                    startDate = new Date(Date.UTC(latestPaymentYear, nextUnpaidMonth, 1));
                } else if (quarterStatus.latestEndDate) {
                    const lastEndDate = new Date(quarterStatus.latestEndDate);
                    console.log('Latest end date:', quarterStatus.latestEndDate);
                    console.log('Calculated start date year:', lastEndDate.getUTCFullYear());
                    console.log('Calculated start date month:', lastEndDate.getUTCMonth() + 1);
                    startDate = new Date(Date.UTC(lastEndDate.getUTCFullYear(), lastEndDate.getUTCMonth() + 1, 1));
                    console.log('Final start date:', startDate.toISOString().split('T')[0]);
                } else {
                    // Start from current year if no previous payments
                    startDate = new Date(Date.UTC(currentYear, 0, 1));
                }
            } else {
                // Start from current year if no previous payments
                startDate = new Date(Date.UTC(currentYear, 0, 1));
            }

            // Calculate end date by adding months - complete months
            endDate = new Date(startDate);
            endDate.setUTCMonth(startDate.getUTCMonth() + monthsToAdd);
            endDate.setUTCDate(0); // Last day of previous month (complete month)

            // Calculate amount based on frequency and monthly fee logic
            const monthlyFee = parseFloat(String(selectedMember.member_category.subscription_fee).replace(/,/g, '')); // Monthly fee (base fee)

            if (frequency === 'monthly') {
                amount = Math.round(monthlyFee);
            } else if (currentPartialQuarter && frequency === 'quarterly') {
                // For partial quarter completion, charge only for remaining months
                amount = Math.round(monthlyFee * monthsToAdd);
            } else {
                // For quarterly, half-yearly, or annual payments, multiply monthly fee by number of months
                amount = Math.round(monthlyFee * monthsToAdd);
            }
        }

        setData('valid_from', startDate.toISOString().split('T')[0]);
        setData('valid_to', endDate.toISOString().split('T')[0]);
        setData('starting_quarter', quarterStatus.nextAvailableQuarter);
        setData('amount', amount);
    };

    const calculateBreakdown = () => {
        const amount = parseFloat(data.amount) || 0;
        const discountValue = parseFloat(data.discount_value) || 0;
        const additionalCharges = parseFloat(data.additional_charges) || 0;

        let discountAmount = 0;
        let netAmount = amount;

        if (data.discount_type === 'percent') {
            discountAmount = (amount * discountValue) / 100;
            netAmount = amount - discountAmount;
        } else if (data.discount_type === 'fixed') {
            discountAmount = discountValue;
            netAmount = amount - discountAmount;
        }

        const taxPercentage = parseFloat(data.tax_percentage) || 0;
        const overduePercentage = parseFloat(data.overdue_percentage) || 0;

        const taxAmount = (netAmount * taxPercentage) / 100;
        const overdueAmount = (netAmount * overduePercentage) / 100;

        const totalAmount = Math.round(netAmount + taxAmount + overdueAmount + additionalCharges);

        return {
            grossAmount: amount,
            discountAmount,
            netAmount,
            taxAmount,
            overdueAmount,
            additionalCharges,
            totalAmount,
        };
    };

    const calculateTotal = () => {
        return calculateBreakdown().totalAmount;
    };

    const validateDateOverlap = () => {
        if (!data.valid_from || !data.valid_to || !selectedMember || data.fee_type !== 'maintenance_fee') {
            return { isValid: true };
        }

        const newStart = new Date(data.valid_from);
        const newEnd = new Date(data.valid_to);

        // Get maintenance fee transactions and find the most recent active period
        const maintenanceTransactions = memberTransactions.filter((t) => t.fee_type === 'maintenance_fee' && t.status === 'paid' && t.valid_from && t.valid_to);

        // Sort by end date (latest first) to get the most recent transaction
        const sortedTransactions = [...maintenanceTransactions].sort((a, b) => new Date(b.valid_to) - new Date(a.valid_to));

        // Only check overlap with the most recent transaction (current active period)
        if (sortedTransactions.length > 0) {
            const mostRecentTransaction = sortedTransactions[0];
            const existingStart = new Date(mostRecentTransaction.valid_from);
            const existingEnd = new Date(mostRecentTransaction.valid_to);

            // Check if dates overlap with the current active period
            const hasOverlap = newStart <= existingEnd && newEnd >= existingStart;

            if (hasOverlap) {
                return {
                    isValid: false,
                    message: `Selected period (${formatDate(newStart)} to ${formatDate(newEnd)}) overlaps with current payment period (${formatDate(existingStart)} to ${formatDate(existingEnd)})`,
                };
            }
        }

        return { isValid: true };
    };

    // Helper function to get first day of month from date
    const getFirstDayOfMonth = (dateString) => {
        if (!dateString) return '';
        // Extract year and month from the date string
        const [year, month] = dateString.split('-');
        // Return first day of the same month
        return `${year}-${month}-01`;
    };

    // Helper function to get last day of month from date
    const getLastDayOfMonth = (dateString) => {
        if (!dateString) return '';
        // Extract year and month from the date string
        const [year, month] = dateString.split('-');
        // Create a date object for the first day of next month, then subtract 1 day
        const nextMonth = new Date(parseInt(year), parseInt(month), 1); // This gives us first day of next month
        const lastDay = new Date(nextMonth - 1); // Subtract 1 day to get last day of current month

        // Format as YYYY-MM-DD
        const lastDayFormatted = lastDay.toISOString().split('T')[0];
        return lastDayFormatted;
    };

    // Helper function to calculate period description from dates
    const calculatePeriodDescription = (startDate, endDate) => {
        if (!startDate || !endDate) return '';

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Calculate total months
        const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;

        // Calculate quarters (3 months = 1 quarter)
        const quarters = Math.round((monthsDiff / 3) * 10) / 10; // Round to 1 decimal place

        if (monthsDiff === 1) {
            return '1 Month';
        } else if (monthsDiff < 3) {
            return `${monthsDiff} Months`;
        } else if (quarters === 1) {
            return '1 Quarter';
        } else if (quarters % 1 === 0) {
            return `${quarters} Quarters`;
        } else {
            return `${quarters} Quarters (${monthsDiff} months)`;
        }
    };

    // Real-time validation when dates change
    const handleDateChange = (field, value) => {
        // For maintenance fees, enforce month boundaries
        if (data.fee_type === 'maintenance_fee' && value) {
            if (field === 'valid_from') {
                // Always set to first day of selected month
                const correctedValue = getFirstDayOfMonth(value);
                value = correctedValue;
            } else if (field === 'valid_to') {
                // Always set to last day of selected month
                const correctedValue = getLastDayOfMonth(value);
                value = correctedValue;
            }
        }

        setData(field, value);

        // Update validation after a short delay
        setTimeout(() => {
            const validation = validateDateOverlap();
            setDateValidation(validation);

            // Recalculate amount if both dates are present
            const currentFromDate = field === 'valid_from' ? value : data.valid_from;
            const currentToDate = field === 'valid_to' ? value : data.valid_to;

            if (selectedMember && currentFromDate && currentToDate) {
                const fromDate = new Date(currentFromDate);
                const toDate = new Date(currentToDate);

                if (fromDate && toDate && toDate >= fromDate) {
                    if (data.fee_type === 'maintenance_fee') {
                        // Calculate number of months between dates for maintenance fee
                        const monthsDiff = (toDate.getFullYear() - fromDate.getFullYear()) * 12 + (toDate.getMonth() - fromDate.getMonth()) + 1;

                        // Calculate amount based on monthly fee
                        const monthlyFee = selectedMember.member_category.subscription_fee;
                        const newAmount = monthlyFee * monthsDiff;

                        setData('amount', newAmount);

                        enqueueSnackbar(`Amount updated to Rs ${newAmount.toLocaleString()} for ${monthsDiff} months`, {
                            variant: 'info',
                        });
                    } else if (data.fee_type === 'subscription_fee' && data.subscription_category_id) {
                        // Calculate amount for subscription fee based on selected category and date range
                        const selectedCategory = subscriptionCategories?.find((cat) => cat.id == data.subscription_category_id);

                        if (selectedCategory) {
                            let newAmount;
                            let periodText;

                            // Calculate total days between dates
                            const totalDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

                            // Check if it's full months or partial days
                            const isFullMonths = fromDate.getDate() === 1 && toDate.getDate() === new Date(toDate.getFullYear(), toDate.getMonth() + 1, 0).getDate();

                            if (isFullMonths) {
                                // Full months calculation
                                const monthsDiff = (toDate.getFullYear() - fromDate.getFullYear()) * 12 + (toDate.getMonth() - fromDate.getMonth()) + 1;
                                newAmount = Math.round(selectedCategory.fee * monthsDiff);
                                periodText = `${monthsDiff} month${monthsDiff > 1 ? 's' : ''} (${totalDays} days)`;
                            } else {
                                // Daily calculation - use average month (30 days) for consistency
                                const dailyRate = Math.round(selectedCategory.fee / 30);
                                newAmount = dailyRate * totalDays;
                                periodText = `${totalDays} day${totalDays > 1 ? 's' : ''} (Rs ${dailyRate}/day)`;
                            }

                            setData('amount', newAmount);

                            enqueueSnackbar(`Amount updated to Rs ${newAmount.toLocaleString()} for ${periodText}`, {
                                variant: 'info',
                            });
                        }
                    }
                }
            }
        }, 100);
    };

    const handleSubmit = async (e, targetStatus = 'paid') => {
        if (e) e.preventDefault();

        // Validate date overlap before submitting
        const validation = validateDateOverlap();
        if (!validation.isValid) {
            enqueueSnackbar(`Date Conflict: ${validation.message}`, { variant: 'error' });
            return;
        }

        // Validate credit card fields if credit card is selected
        if (data.payment_method === 'credit_card') {
            if (!data.credit_card_type) {
                enqueueSnackbar('Please select credit card type', { variant: 'error' });
                return;
            }
            if (!data.receipt_file) {
                enqueueSnackbar('Please upload receipt for credit card payment', { variant: 'error' });
                return;
            }
        }

        setSubmitting(true);

        try {
            // Create FormData for file upload
            const formData = new FormData();

            // Add all form fields to FormData
            Object.keys(data).forEach((key) => {
                if (key === 'receipt_file' && data[key]) {
                    formData.append('receipt_file', data[key]);
                } else if (key === 'subscriptions') {
                    // Skip handling here, we'll do it separately for subscription_fee
                } else if (data[key] !== null && data[key] !== '') {
                    formData.append(key, data[key]);
                }
            });

            // Special handling for subscription items
            if (data.fee_type === 'subscription_fee') {
                if (subscriptionItems.length === 0) {
                    enqueueSnackbar('Please add at least one subscription item', { variant: 'error' });
                    setSubmitting(false);
                    return;
                }
                formData.append('subscriptions', JSON.stringify(subscriptionItems));
                // We'll also append the first item's dates as a fallback/reference for the "invoice" if needed,
                // but the backend will iterate over items.
                // Actually, the main amount is already updated in data.amount
            }

            // Append status
            formData.append('status', targetStatus);

            const response = await axios.post(route('finance.transaction.store'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log(response.data);
            if (response.data.success) {
                // Set invoice details for modal
                if (response.data.transaction) {
                    setCreatedInvoiceId(response.data.transaction.id); // For single, or first of many
                    setCreatedMemberId(response.data.transaction.member_id);
                    setShowInvoiceModal(true);
                }

                // If we got multiple transactions (should generally share invoice_no, so we can pick any id for the slip?)
                // The backend response format needs to be checked.
                // Assuming it returns one representative transaction object or a list.
                // We will adjust backend to return the first one or a clear "main" one.

                // Reset form but keep member if pre-selected
                setSubscriptionItems([]); // Clear subscription items
                setData({
                    member_id: preSelectedMember ? preSelectedMember.id : '',
                    fee_type: 'maintenance_fee',
                    payment_frequency: 'monthly',
                    amount: '',
                    discount_type: '',
                    discount_value: '',
                    payment_method: 'cash',
                    valid_from: '',
                    valid_to: '',
                    starting_quarter: 1,
                    credit_card_type: '',
                    receipt_file: null,
                    additional_charges: '',
                    tax_percentage: '',
                    overdue_percentage: '',
                    remarks: '',
                    subscription_type_id: '',
                    subscription_category_id: '',
                    family_member_id: null,
                });

                if (!preSelectedMember) {
                    // Don't clear member immediately so we can show the invoice
                    // setSelectedMember(null);
                    // setMemberTransactions([]);
                    // setMembershipFeePaid(false);
                    // setQuarterStatus({
                    //     paidQuarters: [],
                    //     nextAvailableQuarter: 1,
                    //     currentYear: new Date().getFullYear(),
                    // });
                } else {
                    // Refresh transactions for the pre-selected member
                    handleMemberSelect(preSelectedMember);
                }

                setFormErrors({});
                setDateValidation({ isValid: true });

                fetchMemberTransactions(selectedMember.id);

                // Show success message
                enqueueSnackbar(`Transaction created successfully (${targetStatus})!`, { variant: 'success' });
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                // Validation errors
                const errors = error.response.data.errors || {};
                setFormErrors(errors);

                // Show specific error messages in snackbar
                const errorMessages = Object.values(errors).flat();
                if (errorMessages.length > 0) {
                    errorMessages.forEach((msg) => {
                        enqueueSnackbar(msg, { variant: 'error' });
                    });
                } else {
                    enqueueSnackbar('Please check the form for validation errors.', { variant: 'error' });
                }
            } else if (error.response && error.response.data.error) {
                // Business logic errors
                enqueueSnackbar(error.response.data.error, { variant: 'error' });
            } else {
                // Other errors
                enqueueSnackbar('Failed to create transaction. Please try again.', { variant: 'error' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Helper function to format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })
            .format(Math.round(amount))
            .replace('PKR', 'Rs ');
    };

    // Helper function to format status
    const formatStatus = (status) => {
        if (!status) return '';
        return status
            .replace(/[_-]/g, ' ') // Remove underscores and hyphens
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    // Helper function to format date
    const formatDate = (date) => {
        if (!date) return '';
        try {
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch (error) {
            return date;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return 'success';
            case 'unpaid':
                return 'error';
            case 'partial':
                return 'warning';
            default:
                return 'default';
        }
    };

    // Payment Confirmation Handlers
    const handlePayClick = (transaction) => {
        setTransactionToPay(transaction);
        setPaymentConfirmationOpen(true);
    };

    const handleConfirmPayment = async () => {
        if (!transactionToPay) return;

        try {
            const response = await axios.post(route('finance.transaction.update-status', transactionToPay.id), {
                status: 'paid',
            });
            if (response.data.success) {
                enqueueSnackbar('Invoice marked as paid successfully!', { variant: 'success' });
                // Refresh transactions
                fetchMemberTransactions(selectedMember.id);
                setPaymentConfirmationOpen(false);
                setTransactionToPay(null);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            enqueueSnackbar('Failed to update status', { variant: 'error' });
        }
    };

    return (
        <>
            <Box sx={{ p: 4 }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#063455', mb: 1 }}>
                        Invoice Generation
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Search for a member and create a new transaction
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {/* Step 1: Member Search */}
                    {!preSelectedMember && (
                        <Grid item xs={12}>
                            <Card sx={{ mb: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderRadius: 2 }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                        <Box
                                            sx={{
                                                bgcolor: '#0a3d62',
                                                color: 'white',
                                                borderRadius: '50%',
                                                width: 32,
                                                height: 32,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mr: 2,
                                                fontSize: '14px',
                                                fontWeight: 600,
                                            }}
                                        >
                                            1
                                        </Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                            Select Member
                                        </Typography>
                                    </Box>

                                    <Autocomplete
                                        size="small"
                                        options={searchResults}
                                        getOptionLabel={(option) => `${option.full_name} (${option.membership_no})`}
                                        loading={searchLoading}
                                        onInputChange={(event, value) => {
                                            searchMembers(value);
                                        }}
                                        onChange={(event, value) => {
                                            if (value) handleMemberSelect(value);
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                size="small"
                                                {...params}
                                                label="Search by name, membership no, CNIC, or phone"
                                                variant="outlined"
                                                fullWidth
                                                sx={{ mb: 2 }}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
                                                    endAdornment: (
                                                        <>
                                                            {searchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                            {params.InputProps.endAdornment}
                                                        </>
                                                    ),
                                                }}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <Box component="li" {...props} sx={{ p: 2 }}>
                                                <Person sx={{ mr: 2, color: 'text.secondary' }} />
                                                <Box>
                                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                        {option.full_name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {option.membership_no} • {option.cnic_no} • {option.phone_no}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                    )}

                    {/* Step 2: Transaction Form and Member Details */}
                    <Grid item xs={12}>
                        <Grid container spacing={3}>
                            {/* Left Column: Transaction Form */}
                            <Grid item xs={12} md={8}>
                                <Card sx={{ mb: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderRadius: 2 }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                            <Box
                                                sx={{
                                                    bgcolor: selectedMember ? '#0a3d62' : 'grey.300',
                                                    color: 'white',
                                                    borderRadius: '50%',
                                                    width: 32,
                                                    height: 32,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mr: 2,
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                2
                                            </Box>
                                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                Transaction Details
                                            </Typography>
                                        </Box>
                                        {selectedMember ? (
                                            <form onSubmit={handleSubmit}>
                                                <Grid container spacing={3}>
                                                    {/* Fee Type Selection */}
                                                    <Grid item xs={12}>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                                                            Fee Type
                                                        </Typography>
                                                        <FormControl fullWidth>
                                                            <Select size="small" value={data.fee_type} onChange={(e) => handleFeeTypeChange(e.target.value)} error={!!errors.fee_type} sx={{ borderRadius: 2 }}>
                                                                {(() => {
                                                                    const isAllowed = (type) => !allowedFeeTypes || allowedFeeTypes.includes(type);
                                                                    const options = [];

                                                                    if (selectedMember?.status === 'cancelled' || selectedMember.status === 'expired') {
                                                                        if (isAllowed('reinstating_fee')) {
                                                                            options.push(
                                                                                <MenuItem key="reinstating_fee" value="reinstating_fee">
                                                                                    Reinstating Fee
                                                                                </MenuItem>,
                                                                            );
                                                                        }
                                                                    } else if (!membershipFeePaid) {
                                                                        if (isAllowed('membership_fee')) {
                                                                            options.push(
                                                                                <MenuItem key="membership_fee" value="membership_fee">
                                                                                    Membership Fee
                                                                                </MenuItem>,
                                                                            );
                                                                        }
                                                                        // Strict: No other options if membership fee is unpaid.
                                                                    } else {
                                                                        if (isAllowed('maintenance_fee'))
                                                                            options.push(
                                                                                <MenuItem key="maintenance_fee" value="maintenance_fee">
                                                                                    Maintenance Fee
                                                                                </MenuItem>,
                                                                            );
                                                                        if (isAllowed('subscription_fee'))
                                                                            options.push(
                                                                                <MenuItem key="subscription_fee" value="subscription_fee">
                                                                                    Subscription Fee
                                                                                </MenuItem>,
                                                                            );
                                                                        if (isAllowed('reinstating_fee'))
                                                                            options.push(
                                                                                <MenuItem key="reinstating_fee" value="reinstating_fee">
                                                                                    Reinstating Fee
                                                                                </MenuItem>,
                                                                            );
                                                                    }
                                                                    return options;
                                                                })()}
                                                            </Select>
                                                            {errors.fee_type && (
                                                                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                                                                    {errors.fee_type}
                                                                </Typography>
                                                            )}
                                                            {(selectedMember?.status === 'cancelled' || selectedMember?.status === 'expired') && (
                                                                <Alert severity="info" sx={{ mt: 2 }}>
                                                                    <strong>Member Status: {formatStatus(selectedMember.status)}</strong>
                                                                    <br />
                                                                    Only Reinstating Fee is available for {selectedMember.status} members. This fee will reactivate the member's status upon successful payment.
                                                                </Alert>
                                                            )}
                                                        </FormControl>
                                                    </Grid>

                                                    {/* Maintenance Fee Quarter Status */}
                                                    {data.fee_type === 'maintenance_fee' && (
                                                        <>
                                                            <Grid item xs={12}>
                                                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                                                                    Quarter Payment Status
                                                                </Typography>
                                                                <Box
                                                                    sx={{
                                                                        p: 2,
                                                                        bgcolor: quarterStatus.isNewCycle ? 'info.50' : 'warning.50',
                                                                        borderRadius: 2,
                                                                        border: '1px solid',
                                                                        borderColor: quarterStatus.isNewCycle ? 'info.200' : 'warning.200',
                                                                    }}
                                                                >
                                                                    {(() => {
                                                                        const membershipDate = new Date(selectedMember.membership_date);
                                                                        const membershipYear = membershipDate.getFullYear();
                                                                        const firstYearEnd = new Date(membershipYear, 11, 31);
                                                                        // Only consider first year if there are remaining months (i.e., joined before December)
                                                                        const isFirstYear = (!quarterStatus.latestEndDate || new Date(quarterStatus.latestEndDate) <= firstYearEnd) && membershipDate.getMonth() < 11;

                                                                        return (
                                                                            <>
                                                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                                                                    {isFirstYear ? 'First Year (Monthly Payment)' : 'Quarterly Payment System'}
                                                                                </Typography>

                                                                                {isFirstYear ? (
                                                                                    <Box sx={{ mb: 2 }}>
                                                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                                                            <strong>Payment Method:</strong> Monthly fees for remaining months in {membershipYear}
                                                                                        </Typography>
                                                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                                                            <strong>Membership Month:</strong> {membershipDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} (Free)
                                                                                        </Typography>
                                                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                                                            <strong>Payable Period:</strong> {new Date(membershipYear, membershipDate.getMonth() + 1, 1).toLocaleDateString('en-US', { month: 'long' })} - December {membershipYear}
                                                                                        </Typography>

                                                                                        {/* Debug: Show paid months */}
                                                                                        {(() => {
                                                                                            const membershipMonth = membershipDate.getMonth();
                                                                                            const monthsInFirstYear = [];
                                                                                            for (let month = membershipMonth + 1; month <= 11; month++) {
                                                                                                monthsInFirstYear.push(month);
                                                                                            }

                                                                                            const paidMonths = [];
                                                                                            memberTransactions
                                                                                                .filter((t) => t.fee_type === 'maintenance_fee' && t.status === 'paid')
                                                                                                .forEach((transaction) => {
                                                                                                    const txStart = new Date(transaction.valid_from);
                                                                                                    const txEnd = new Date(transaction.valid_to);

                                                                                                    // More accurate month detection: check each month the transaction spans
                                                                                                    let currentDate = new Date(txStart.getFullYear(), txStart.getMonth(), 1);
                                                                                                    const endDate = new Date(txEnd.getFullYear(), txEnd.getMonth(), 1);

                                                                                                    while (currentDate <= endDate) {
                                                                                                        const month = currentDate.getMonth();
                                                                                                        const year = currentDate.getFullYear();

                                                                                                        // Check if this month overlaps with the transaction period
                                                                                                        const monthStart = new Date(year, month, 1);
                                                                                                        const monthEnd = new Date(year, month + 1, 0); // Last day of month

                                                                                                        // Transaction covers this month if there's any overlap
                                                                                                        const hasOverlap = txStart <= monthEnd && txEnd >= monthStart;

                                                                                                        if (hasOverlap && year === membershipYear && monthsInFirstYear.includes(month) && !paidMonths.includes(month)) {
                                                                                                            paidMonths.push(month);
                                                                                                        }

                                                                                                        currentDate.setMonth(currentDate.getMonth() + 1);
                                                                                                    }
                                                                                                });

                                                                                            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

                                                                                            return (
                                                                                                <Typography variant="body2" color="text.secondary">
                                                                                                    <strong>Paid Months:</strong> {paidMonths.length > 0 ? paidMonths.map((m) => monthNames[m]).join(', ') : 'None'}
                                                                                                    <br />
                                                                                                    <strong>Remaining:</strong>{' '}
                                                                                                    {monthsInFirstYear
                                                                                                        .filter((m) => !paidMonths.includes(m))
                                                                                                        .map((m) => monthNames[m])
                                                                                                        .join(', ') || 'All paid!'}
                                                                                                </Typography>
                                                                                            );
                                                                                        })()}
                                                                                    </Box>
                                                                                ) : (
                                                                                    <>
                                                                                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                                                                            {[1, 2, 3, 4].map((quarter) => (
                                                                                                <Chip key={quarter} label={`Q${quarter}`} color={quarterStatus.paidQuarters.includes(quarter) ? 'success' : 'default'} variant={quarterStatus.paidQuarters.includes(quarter) ? 'filled' : 'outlined'} size="medium" sx={{ minWidth: 50, fontWeight: 600 }} />
                                                                                            ))}
                                                                                        </Box>
                                                                                        <Typography variant="body2" color="text.secondary">
                                                                                            <strong>Quarters:</strong> Q1 (Jan-Mar), Q2 (Apr-Jun), Q3 (Jul-Sep), Q4 (Oct-Dec)
                                                                                        </Typography>
                                                                                    </>
                                                                                )}

                                                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                                                    <strong>Next payment:</strong> Monthly payment system
                                                                                    {!isFirstYear && quarterStatus.latestEndDate && <span> (Last payment ended: {formatDate(quarterStatus.latestEndDate)})</span>}
                                                                                    {!quarterStatus.latestEndDate && !isFirstYear && <span> (No previous maintenance payments found)</span>}
                                                                                </Typography>
                                                                            </>
                                                                        );
                                                                    })()}
                                                                </Box>
                                                            </Grid>

                                                            <Grid item xs={12}>
                                                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                                                                    Payment Period Selection
                                                                </Typography>
                                                                <Alert severity="info" sx={{ mb: 2 }}>
                                                                    <Typography variant="body2">
                                                                        <strong>Next suggested payment:</strong> Monthly maintenance fee
                                                                        <br />
                                                                        Select your desired payment period using the dates below. Amount will calculate automatically.
                                                                    </Typography>
                                                                </Alert>

                                                                {/* Quick Payment Period Buttons */}
                                                                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                                                    <Button size="small" variant="outlined" onClick={() => suggestMaintenancePeriod('monthly')} sx={{ borderRadius: 2 }}>
                                                                        1 Month
                                                                    </Button>
                                                                    <Button size="small" variant="outlined" onClick={() => suggestMaintenancePeriod('quarterly')} sx={{ borderRadius: 2 }}>
                                                                        1 Quarter (3 months)
                                                                    </Button>
                                                                    <Button size="small" variant="outlined" onClick={() => suggestMaintenancePeriod('half_yearly')} sx={{ borderRadius: 2 }}>
                                                                        6 Months
                                                                    </Button>
                                                                    <Button size="small" variant="outlined" onClick={() => suggestMaintenancePeriod('annually')} sx={{ borderRadius: 2 }}>
                                                                        1 Year
                                                                    </Button>
                                                                </Box>
                                                            </Grid>
                                                        </>
                                                    )}

                                                    {/* Reinstating Fee Section */}
                                                    {selectedMember && data.fee_type === 'reinstating_fee' && (
                                                        <Grid item xs={12}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                                                                Member Reinstatement Information
                                                            </Typography>
                                                            <Box sx={{ p: 3, backgroundColor: '#fef3c7', borderRadius: 2, border: '1px solid #f59e0b' }}>
                                                                <Grid container spacing={2}>
                                                                    <Grid item xs={12} md={6}>
                                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#92400e' }}>
                                                                            Current Status:
                                                                            <Chip
                                                                                label={formatStatus(selectedMember.status)}
                                                                                size="small"
                                                                                sx={{
                                                                                    ml: 1,
                                                                                    backgroundColor: selectedMember.status === 'active' ? '#dcfce7' : '#fecaca',
                                                                                    color: selectedMember.status === 'active' ? '#166534' : '#dc2626',
                                                                                }}
                                                                            />
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid item xs={12} md={6}>
                                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#92400e' }}>
                                                                            Member ID: {selectedMember.id}
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid item xs={12}>
                                                                        <Typography variant="body2" sx={{ color: '#92400e' }}>
                                                                            <strong>Reinstating Fee:</strong> This fee is charged to reactivate members whose status is cancelled, expired, suspended, or terminated. Upon successful payment, the member status will be updated to "Active".
                                                                        </Typography>
                                                                    </Grid>
                                                                    {!['cancelled', 'expired', 'suspended', 'terminated'].includes(selectedMember.status) && (
                                                                        <Grid item xs={12}>
                                                                            <Alert severity="warning">This member's current status ({formatStatus(selectedMember.status)}) may not require reinstatement. Reinstating fees are typically for cancelled, expired, suspended, or terminated members.</Alert>
                                                                        </Grid>
                                                                    )}
                                                                </Grid>
                                                            </Box>
                                                        </Grid>
                                                    )}

                                                    {/* Subscription Details Section - Show before Amount & Discount */}
                                                    {selectedMember && data.fee_type === 'subscription_fee' && (
                                                        <Grid item xs={12}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                                                                Subscription Details
                                                            </Typography>
                                                            <Box
                                                                sx={{
                                                                    p: 3,
                                                                    bgcolor: 'grey.50',
                                                                    borderRadius: 2,
                                                                    border: '1px solid',
                                                                    borderColor: 'grey.200',
                                                                    mb: 3,
                                                                }}
                                                            >
                                                                {/* Add New Subscription Form */}
                                                                <Grid container spacing={3}>
                                                                    <Grid item xs={6}>
                                                                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#374151' }}>
                                                                            Subscription Type
                                                                        </Typography>
                                                                        <FormControl fullWidth>
                                                                            <Select
                                                                                size="small"
                                                                                value={data.subscription_type_id}
                                                                                onChange={(e) => {
                                                                                    setData('subscription_type_id', e.target.value);
                                                                                    setData('subscription_category_id', ''); // Reset category when type changes
                                                                                    // Do NOT reset main amount, as it may hold total of other items
                                                                                }}
                                                                                error={!!(errors.subscription_type_id || formErrors.subscription_type_id)}
                                                                                sx={{ borderRadius: 2 }}
                                                                                displayEmpty
                                                                            >
                                                                                <MenuItem value="">Select Subscription Type</MenuItem>
                                                                                {subscriptionTypes?.map((type) => (
                                                                                    <MenuItem key={type.id} value={type.id}>
                                                                                        {type.name}
                                                                                    </MenuItem>
                                                                                ))}
                                                                            </Select>
                                                                        </FormControl>
                                                                    </Grid>

                                                                    <Grid item xs={6}>
                                                                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#374151' }}>
                                                                            Subscription Category
                                                                        </Typography>
                                                                        <FormControl fullWidth>
                                                                            <Select
                                                                                size="small"
                                                                                value={data.subscription_category_id}
                                                                                onChange={(e) => {
                                                                                    const categoryId = e.target.value;
                                                                                    setData('subscription_category_id', categoryId);

                                                                                    // Auto-populate dates from selected category for THIS item (not yet added)
                                                                                    const selectedCategory = subscriptionCategories?.find((cat) => cat.id == categoryId);
                                                                                    if (selectedCategory) {
                                                                                        // Default dates: 1 month from today
                                                                                        const today = new Date();
                                                                                        const startDate = today.toISOString().split('T')[0];

                                                                                        const nextMonth = new Date(today);
                                                                                        nextMonth.setMonth(today.getMonth() + 1);
                                                                                        nextMonth.setDate(today.getDate() - 1);
                                                                                        const endDate = nextMonth.toISOString().split('T')[0];

                                                                                        setData((prev) => ({
                                                                                            ...prev,
                                                                                            valid_from: startDate,
                                                                                            valid_to: endDate,
                                                                                            item_amount: selectedCategory.fee, // Set default amount
                                                                                            item_discount_type: '',
                                                                                            item_discount_value: '',
                                                                                        }));
                                                                                    }
                                                                                }}
                                                                                error={!!(errors.subscription_category_id || formErrors.subscription_category_id)}
                                                                                sx={{ borderRadius: 2 }}
                                                                                displayEmpty
                                                                                disabled={!data.subscription_type_id}
                                                                            >
                                                                                <MenuItem value="">Select Category</MenuItem>
                                                                                {subscriptionCategories
                                                                                    ?.filter((cat) => cat.subscription_type_id == data.subscription_type_id)
                                                                                    ?.map((category) => (
                                                                                        <MenuItem key={category.id} value={category.id}>
                                                                                            {category.name} - Rs. {category.fee}
                                                                                        </MenuItem>
                                                                                    ))}
                                                                            </Select>
                                                                        </FormControl>
                                                                    </Grid>

                                                                    {/* Dates for the item */}
                                                                    <Grid item xs={6}>
                                                                        <TextField size="small" fullWidth label="Valid From" type="date" value={data.valid_from} onChange={(e) => setData('valid_from', e.target.value)} InputLabelProps={{ shrink: true }} error={!!(errors.valid_from || formErrors.valid_from)} />
                                                                    </Grid>
                                                                    <Grid item xs={6}>
                                                                        <TextField size="small" fullWidth label="Valid To" type="date" value={data.valid_to} onChange={(e) => setData('valid_to', e.target.value)} InputLabelProps={{ shrink: true }} error={!!(errors.valid_to || formErrors.valid_to)} />
                                                                    </Grid>

                                                                    <Grid item xs={12}>
                                                                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#374151' }}>
                                                                            Family Member
                                                                        </Typography>
                                                                        <FormControl fullWidth>
                                                                            <Select size="small" value={data.family_member_id || ''} onChange={(e) => setData('family_member_id', e.target.value || null)} sx={{ borderRadius: 2 }} displayEmpty>
                                                                                <MenuItem value="">
                                                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                                        <Person sx={{ mr: 1, fontSize: 18, color: '#1976d2' }} />
                                                                                        <Box>
                                                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                                                {selectedMember?.full_name} (SELF)
                                                                                            </Typography>
                                                                                        </Box>
                                                                                    </Box>
                                                                                </MenuItem>
                                                                                {selectedMember?.family_members?.map((familyMember) => (
                                                                                    <MenuItem key={familyMember.id} value={familyMember.id}>
                                                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                                            <Person sx={{ mr: 1, fontSize: 18, color: '#666' }} />
                                                                                            <Box>
                                                                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                                                    {familyMember.full_name}
                                                                                                </Typography>
                                                                                                <Typography variant="caption" color="text.secondary">
                                                                                                    {familyMember.relation}
                                                                                                </Typography>
                                                                                            </Box>
                                                                                        </Box>
                                                                                    </MenuItem>
                                                                                ))}
                                                                            </Select>
                                                                        </FormControl>
                                                                    </Grid>

                                                                    {/* Override Amount for Item */}
                                                                    {/* Amount and Discount - Compact Row */}
                                                                    <Grid item xs={12} sm={6}>
                                                                        <TextField
                                                                            size="small"
                                                                            fullWidth
                                                                            label="Amount"
                                                                            type="number"
                                                                            value={data.item_amount}
                                                                            onChange={(e) => setData('item_amount', e.target.value)}
                                                                            InputProps={{
                                                                                startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary', fontSize: '0.8rem' }}>Rs</Typography>,
                                                                            }}
                                                                        />
                                                                    </Grid>

                                                                    <Grid item xs={12} sm={6}>
                                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                                            <FormControl fullWidth size="small">
                                                                                <Select
                                                                                    value={data.item_discount_type}
                                                                                    onChange={(e) => {
                                                                                        setData('item_discount_type', e.target.value);
                                                                                        if (!e.target.value) setData('item_discount_value', '');
                                                                                    }}
                                                                                    displayEmpty
                                                                                    sx={{ borderRadius: 2 }}
                                                                                >
                                                                                    <MenuItem value="">Dsc Type</MenuItem>
                                                                                    <MenuItem value="fixed">Fixed</MenuItem>
                                                                                    <MenuItem value="percent">%</MenuItem>
                                                                                </Select>
                                                                            </FormControl>
                                                                            <TextField size="small" fullWidth label="Val" type="number" value={data.item_discount_value} onChange={(e) => setData('item_discount_value', e.target.value)} disabled={!data.item_discount_type} />
                                                                        </Box>
                                                                    </Grid>

                                                                    <Grid item xs={12}>
                                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                                                            {/* Net Calculation Display */}
                                                                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                                                                Net Item:{' '}
                                                                                {formatCurrency(
                                                                                    (() => {
                                                                                        const amt = parseFloat(data.item_amount) || 0;
                                                                                        const dVal = parseFloat(data.item_discount_value) || 0;
                                                                                        if (data.item_discount_type === 'fixed') return Math.max(0, amt - dVal);
                                                                                        if (data.item_discount_type === 'percent') return Math.max(0, amt - (amt * dVal) / 100);
                                                                                        return amt;
                                                                                    })(),
                                                                                )}
                                                                            </Typography>

                                                                            <Button variant="contained" onClick={handleAddSubscription} disabled={!data.subscription_type_id || !data.subscription_category_id}>
                                                                                Add to Invoice
                                                                            </Button>
                                                                        </Box>
                                                                    </Grid>
                                                                </Grid>
                                                            </Box>

                                                            {/* Added Subscriptions List */}
                                                            {subscriptionItems.length > 0 && (
                                                                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                                                                    <Table size="small">
                                                                        <TableHead sx={{ bgcolor: 'grey.100' }}>
                                                                            <TableRow>
                                                                                <TableCell>
                                                                                    <strong>Type</strong>
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    <strong>Member</strong>
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    <strong>Period</strong>
                                                                                </TableCell>
                                                                                <TableCell align="right">
                                                                                    <strong>Amount</strong>
                                                                                </TableCell>
                                                                                <TableCell align="right">
                                                                                    <strong>Action</strong>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        </TableHead>
                                                                        <TableBody>
                                                                            {subscriptionItems.map((item, index) => (
                                                                                <TableRow key={index}>
                                                                                    <TableCell>
                                                                                        {item.type_name}
                                                                                        <Typography variant="caption" display="block" color="text.secondary">
                                                                                            {item.category_name}
                                                                                        </Typography>
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        {item.family_member_name}
                                                                                        <Typography variant="caption" display="block" color="text.secondary">
                                                                                            {item.family_member_relation}
                                                                                        </Typography>
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        {formatDate(item.valid_from)} - {formatDate(item.valid_to)}
                                                                                    </TableCell>
                                                                                    <TableCell align="right">
                                                                                        {formatCurrency(item.amount)}
                                                                                        {item.discount_type && (
                                                                                            <Typography variant="caption" display="block" color="error">
                                                                                                -{item.discount_type === 'percent' ? `${item.discount_value}%` : formatCurrency(item.discount_value)}
                                                                                            </Typography>
                                                                                        )}
                                                                                        {item.discount_type && (
                                                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                                                {formatCurrency(item.net_amount)}
                                                                                            </Typography>
                                                                                        )}
                                                                                    </TableCell>
                                                                                    <TableCell align="right">
                                                                                        <Button size="small" color="error" onClick={() => handleRemoveSubscription(index)}>
                                                                                            Remove
                                                                                        </Button>
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            ))}
                                                                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                                                                <TableCell colSpan={3} align="right">
                                                                                    <strong>Total Subscriptions:</strong>
                                                                                </TableCell>
                                                                                <TableCell align="right">
                                                                                    <strong>{formatCurrency(subscriptionItems.reduce((acc, item) => acc + item.net_amount, 0))}</strong>
                                                                                </TableCell>
                                                                                <TableCell />
                                                                            </TableRow>
                                                                        </TableBody>
                                                                    </Table>
                                                                </TableContainer>
                                                            )}
                                                        </Grid>
                                                    )}

                                                    {/* Amount and Discount Section */}
                                                    <Grid item xs={12}>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                                                            Amount & Discount
                                                        </Typography>
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={12}>
                                                                <TextField
                                                                    size="small"
                                                                    fullWidth
                                                                    label="Amount (PKR)"
                                                                    type="number"
                                                                    value={data.amount}
                                                                    onChange={(e) => setData('amount', e.target.value)}
                                                                    error={!!errors.amount}
                                                                    helperText={errors.amount}
                                                                    disabled={data.fee_type === 'subscription_fee'} // Readonly for subscription fees
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                                                    }}
                                                                    InputProps={{
                                                                        startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>Rs</Typography>,
                                                                    }}
                                                                />
                                                            </Grid>
                                                            {data.fee_type !== 'subscription_fee' && (
                                                                <>
                                                                    <Grid item xs={6}>
                                                                        <FormControl fullWidth>
                                                                            <Select size="small" value={data.discount_type} onChange={(e) => setData('discount_type', e.target.value)} displayEmpty sx={{ borderRadius: 2 }}>
                                                                                <MenuItem value="">No Discount</MenuItem>
                                                                                <MenuItem value="percent">Percentage</MenuItem>
                                                                                <MenuItem value="fixed">Fixed Amount</MenuItem>
                                                                            </Select>
                                                                        </FormControl>
                                                                    </Grid>
                                                                    <Grid item xs={6}>
                                                                        <TextField
                                                                            size="small"
                                                                            fullWidth
                                                                            label="Discount Value"
                                                                            type="number"
                                                                            value={data.discount_value}
                                                                            onChange={(e) => setData('discount_value', e.target.value)}
                                                                            disabled={!data.discount_type}
                                                                            error={!!errors.discount_value}
                                                                            helperText={errors.discount_value}
                                                                            sx={{
                                                                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                                                            }}
                                                                        />
                                                                    </Grid>
                                                                </>
                                                            )}
                                                            <Grid item xs={6}>
                                                                <TextField
                                                                    size="small"
                                                                    fullWidth
                                                                    label="Tax (%)"
                                                                    type="number"
                                                                    value={data.tax_percentage}
                                                                    onChange={(e) => setData('tax_percentage', e.target.value)}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                                                    }}
                                                                    InputProps={{
                                                                        endAdornment: <Typography sx={{ ml: 1, color: 'text.secondary' }}>%</Typography>,
                                                                    }}
                                                                />
                                                            </Grid>
                                                            <Grid item xs={6}>
                                                                <TextField
                                                                    size="small"
                                                                    fullWidth
                                                                    label="Overdue (%)"
                                                                    type="number"
                                                                    value={data.overdue_percentage}
                                                                    onChange={(e) => setData('overdue_percentage', e.target.value)}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                                                    }}
                                                                    InputProps={{
                                                                        endAdornment: <Typography sx={{ ml: 1, color: 'text.secondary' }}>%</Typography>,
                                                                    }}
                                                                />
                                                            </Grid>
                                                            {(data.fee_type === 'membership_fee' || data.fee_type === 'maintenance_fee') && (
                                                                <Grid item xs={12}>
                                                                    <TextField
                                                                        size="small"
                                                                        fullWidth
                                                                        label="Additional Charges (PKR)"
                                                                        type="number"
                                                                        value={data.additional_charges}
                                                                        onChange={(e) => setData('additional_charges', e.target.value)}
                                                                        error={!!errors.additional_charges}
                                                                        helperText={errors.additional_charges}
                                                                        sx={{
                                                                            '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                                                        }}
                                                                        InputProps={{
                                                                            startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>Rs</Typography>,
                                                                        }}
                                                                    />
                                                                </Grid>
                                                            )}
                                                        </Grid>
                                                    </Grid>

                                                    {/* Remarks Section */}
                                                    <Grid item xs={12}>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                                                            Remarks
                                                        </Typography>
                                                        <TextField
                                                            size="small"
                                                            fullWidth
                                                            label="Comments / Remarks"
                                                            multiline
                                                            rows={3}
                                                            value={data.remarks}
                                                            onChange={(e) => setData('remarks', e.target.value)}
                                                            placeholder="Enter any additional notes or comments here..."
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                                            }}
                                                        />
                                                    </Grid>

                                                    {/* Payment Method Section */}
                                                    <Grid item xs={12}>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                                                            Payment Method
                                                        </Typography>
                                                        <FormControl fullWidth>
                                                            <Select size="small" value={data.payment_method} onChange={(e) => setData('payment_method', e.target.value)} sx={{ borderRadius: 2 }}>
                                                                <MenuItem value="cash">Cash Payment</MenuItem>
                                                                <MenuItem value="credit_card">Credit Card</MenuItem>
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>

                                                    {/* Credit Card Additional Fields */}
                                                    {data.payment_method === 'credit_card' && (
                                                        <Grid item xs={12}>
                                                            <Box
                                                                sx={{
                                                                    p: 3,
                                                                    bgcolor: 'primary.50',
                                                                    borderRadius: 2,
                                                                    border: '1px solid',
                                                                    borderColor: 'primary.200',
                                                                }}
                                                            >
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#0a3d62' }}>
                                                                    Credit Card Details
                                                                </Typography>
                                                                <Grid container spacing={2}>
                                                                    <Grid item xs={12} sm={6}>
                                                                        <FormControl fullWidth>
                                                                            <Select size="small" value={data.credit_card_type} onChange={(e) => setData('credit_card_type', e.target.value)} error={!!formErrors.credit_card_type} displayEmpty sx={{ borderRadius: 2 }}>
                                                                                <MenuItem value="">Select Card Type</MenuItem>
                                                                                <MenuItem value="mastercard">MasterCard</MenuItem>
                                                                                <MenuItem value="visa">Visa</MenuItem>
                                                                            </Select>
                                                                            {formErrors.credit_card_type && (
                                                                                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                                                                                    {formErrors.credit_card_type[0]}
                                                                                </Typography>
                                                                            )}
                                                                        </FormControl>
                                                                    </Grid>
                                                                    <Grid item xs={12} sm={6}>
                                                                        <Box>
                                                                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                                                                Upload Receipt
                                                                            </Typography>
                                                                            <input
                                                                                type="file"
                                                                                accept="image/*,.pdf"
                                                                                onChange={(e) => setData('receipt_file', e.target.files[0])}
                                                                                style={{
                                                                                    width: '100%',
                                                                                    padding: '12px',
                                                                                    border: `2px dashed ${formErrors.receipt_file ? '#f44336' : '#d1d5db'}`,
                                                                                    borderRadius: '8px',
                                                                                    fontSize: '14px',
                                                                                    backgroundColor: '#f9fafb',
                                                                                    cursor: 'pointer',
                                                                                }}
                                                                            />
                                                                            {formErrors.receipt_file && (
                                                                                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                                                                                    {formErrors.receipt_file[0]}
                                                                                </Typography>
                                                                            )}
                                                                            {data.receipt_file && (
                                                                                <Box sx={{ mt: 1, p: 1, bgcolor: 'success.50', borderRadius: 1, border: '1px solid', borderColor: 'success.200' }}>
                                                                                    <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>
                                                                                        {data.receipt_file.name}
                                                                                    </Typography>
                                                                                </Box>
                                                                            )}
                                                                        </Box>
                                                                    </Grid>
                                                                </Grid>
                                                            </Box>
                                                        </Grid>
                                                    )}

                                                    {/* Validity Period Section - Only show for maintenance fees */}
                                                    {selectedMember && data.fee_type === 'maintenance_fee' && (
                                                        <Grid item xs={12}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                                                                Validity Period
                                                            </Typography>
                                                            <Box
                                                                sx={{
                                                                    p: 3,
                                                                    bgcolor: 'grey.50',
                                                                    borderRadius: 2,
                                                                    border: '1px solid',
                                                                    borderColor: 'grey.200',
                                                                }}
                                                            >
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                                        Set Payment Period
                                                                    </Typography>
                                                                    <Button size="small" variant="outlined" onClick={() => (data.fee_type === 'membership_fee' ? handleFeeTypeChange('membership_fee') : suggestMaintenancePeriod(data.payment_frequency))} sx={{ borderRadius: 2 }}>
                                                                        Auto-Suggest Dates
                                                                    </Button>
                                                                </Box>

                                                                <Grid container spacing={2}>
                                                                    <Grid item xs={6}>
                                                                        <TextField
                                                                            size="small"
                                                                            fullWidth
                                                                            label={data.fee_type === 'maintenance_fee' ? 'Valid From (1st of month)' : 'Valid From'}
                                                                            type="date"
                                                                            value={data.valid_from}
                                                                            onChange={(e) => handleDateChange('valid_from', e.target.value)}
                                                                            InputLabelProps={{ shrink: true }}
                                                                            error={!!(errors.valid_from || formErrors.valid_from || !dateValidation.isValid)}
                                                                            helperText={errors.valid_from || formErrors.valid_from?.[0] || (!dateValidation.isValid ? 'Date conflict detected' : '') || (data.fee_type === 'maintenance_fee' ? 'Will auto-set to 1st of selected month' : '')}
                                                                            sx={{
                                                                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                                                            }}
                                                                        />
                                                                    </Grid>
                                                                    <Grid item xs={6}>
                                                                        <TextField
                                                                            size="small"
                                                                            fullWidth
                                                                            label={data.fee_type === 'maintenance_fee' ? 'Valid To (last day of month)' : 'Valid To'}
                                                                            type="date"
                                                                            value={data.valid_to}
                                                                            onChange={(e) => handleDateChange('valid_to', e.target.value)}
                                                                            InputLabelProps={{ shrink: true }}
                                                                            error={!!(errors.valid_to || formErrors.valid_to || !dateValidation.isValid)}
                                                                            helperText={errors.valid_to || formErrors.valid_to?.[0] || (!dateValidation.isValid ? 'Date conflict detected' : '') || (data.fee_type === 'maintenance_fee' ? 'Will auto-set to last day of selected month' : '')}
                                                                            sx={{
                                                                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                                                            }}
                                                                        />
                                                                    </Grid>
                                                                </Grid>

                                                                {data.valid_from && data.valid_to && (
                                                                    <>
                                                                        {!dateValidation.isValid && (
                                                                            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                                                                                <strong>Date Conflict:</strong> {dateValidation.message}
                                                                            </Alert>
                                                                        )}

                                                                        <Alert severity={dateValidation.isValid ? 'success' : 'warning'} sx={{ mt: 2, borderRadius: 2 }}>
                                                                            <strong>Selected Period:</strong> {formatDate(data.valid_from)} to {formatDate(data.valid_to)}
                                                                            {data.fee_type === 'membership_fee' && <span> (Membership Fee Validity)</span>}
                                                                            {data.fee_type === 'maintenance_fee' && data.valid_from && data.valid_to && <span> ({calculatePeriodDescription(data.valid_from, data.valid_to)})</span>}
                                                                        </Alert>
                                                                    </>
                                                                )}
                                                            </Box>
                                                        </Grid>
                                                    )}

                                                    {/* Total Amount Summary */}
                                                    {data.amount > 0 && (
                                                        <Grid item xs={12}>
                                                            <Box
                                                                sx={{
                                                                    p: 2,
                                                                    bgcolor: 'primary.50',
                                                                    borderRadius: 2,
                                                                    border: '2px solid',
                                                                    borderColor: 'primary.200',
                                                                }}
                                                            >
                                                                {(() => {
                                                                    const breakdown = calculateBreakdown();
                                                                    return (
                                                                        <>
                                                                            <Grid container spacing={1} sx={{ mb: 1 }}>
                                                                                <Grid item xs={6}>
                                                                                    <Typography variant="body2" color="text.secondary">
                                                                                        Subtotal:
                                                                                    </Typography>
                                                                                </Grid>
                                                                                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                                                                    <Typography variant="body2">{formatCurrency(breakdown.grossAmount)}</Typography>
                                                                                </Grid>

                                                                                {breakdown.discountAmount > 0 && (
                                                                                    <>
                                                                                        <Grid item xs={6}>
                                                                                            <Typography variant="body2" color="text.secondary">
                                                                                                Discount {data.discount_type === 'percent' ? `(${data.discount_value}%)` : ''}:
                                                                                            </Typography>
                                                                                        </Grid>
                                                                                        <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                                                                            <Typography variant="body2" color="error.main">
                                                                                                - {formatCurrency(breakdown.discountAmount)}
                                                                                            </Typography>
                                                                                        </Grid>
                                                                                    </>
                                                                                )}

                                                                                {breakdown.discountAmount > 0 && (
                                                                                    <>
                                                                                        <Grid item xs={6}>
                                                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                                                Net Amount:
                                                                                            </Typography>
                                                                                        </Grid>
                                                                                        <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                                                {formatCurrency(breakdown.netAmount)}
                                                                                            </Typography>
                                                                                        </Grid>
                                                                                    </>
                                                                                )}

                                                                                {breakdown.taxAmount > 0 && (
                                                                                    <>
                                                                                        <Grid item xs={6}>
                                                                                            <Typography variant="body2" color="text.secondary">
                                                                                                Tax ({data.tax_percentage}%):
                                                                                            </Typography>
                                                                                        </Grid>
                                                                                        <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                                                                            <Typography variant="body2">+ {formatCurrency(breakdown.taxAmount)}</Typography>
                                                                                        </Grid>
                                                                                    </>
                                                                                )}

                                                                                {breakdown.overdueAmount > 0 && (
                                                                                    <>
                                                                                        <Grid item xs={6}>
                                                                                            <Typography variant="body2" color="text.secondary">
                                                                                                Overdue ({data.overdue_percentage}%):
                                                                                            </Typography>
                                                                                        </Grid>
                                                                                        <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                                                                            <Typography variant="body2">+ {formatCurrency(breakdown.overdueAmount)}</Typography>
                                                                                        </Grid>
                                                                                    </>
                                                                                )}

                                                                                {breakdown.additionalCharges > 0 && (
                                                                                    <>
                                                                                        <Grid item xs={6}>
                                                                                            <Typography variant="body2" color="text.secondary">
                                                                                                Additional Charges:
                                                                                            </Typography>
                                                                                        </Grid>
                                                                                        <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                                                                            <Typography variant="body2">+ {formatCurrency(breakdown.additionalCharges)}</Typography>
                                                                                        </Grid>
                                                                                    </>
                                                                                )}
                                                                            </Grid>
                                                                            <Box sx={{ borderTop: '1px dashed', borderColor: 'primary.300', pt: 1, mt: 1 }}>
                                                                                <Grid container spacing={1} alignItems="center">
                                                                                    <Grid item xs={6}>
                                                                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0a3d62' }}>
                                                                                            Total Payable:
                                                                                        </Typography>
                                                                                    </Grid>
                                                                                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                                                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0a3d62' }}>
                                                                                            {formatCurrency(breakdown.totalAmount)}
                                                                                        </Typography>
                                                                                    </Grid>
                                                                                </Grid>
                                                                            </Box>
                                                                        </>
                                                                    );
                                                                })()}
                                                            </Box>
                                                        </Grid>
                                                    )}

                                                    {/* Submit Button */}
                                                    <Grid item xs={12}>
                                                        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                                                            <Button
                                                                type="button"
                                                                onClick={(e) => handleSubmit(e, 'unpaid')}
                                                                variant="outlined"
                                                                size="large"
                                                                fullWidth
                                                                disabled={submitting || !data.fee_type || !data.amount || (data.fee_type === 'maintenance_fee' && (!data.valid_from || !data.valid_to || !dateValidation.isValid)) || (data.fee_type === 'subscription_fee' && subscriptionItems.length === 0)}
                                                                sx={{
                                                                    py: 2,
                                                                    borderColor: '#0a3d62',
                                                                    color: '#0a3d62',
                                                                    borderRadius: 2,
                                                                    fontSize: '16px',
                                                                    fontWeight: 600,
                                                                    textTransform: 'none',
                                                                    '&:hover': {
                                                                        borderColor: '#082f4b',
                                                                        bgcolor: 'rgba(10, 61, 98, 0.04)',
                                                                    },
                                                                }}
                                                            >
                                                                {submitting ? <CircularProgress size={20} sx={{ mr: 1 }} /> : <Print sx={{ mr: 1 }} />}
                                                                Save & Print
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                onClick={(e) => handleSubmit(e, 'paid')}
                                                                variant="contained"
                                                                size="large"
                                                                fullWidth
                                                                disabled={submitting || !data.fee_type || !data.amount || (data.fee_type === 'maintenance_fee' && (!data.valid_from || !data.valid_to || !dateValidation.isValid)) || (data.fee_type === 'subscription_fee' && subscriptionItems.length === 0)}
                                                                sx={{
                                                                    py: 2,
                                                                    bgcolor: '#0a3d62',
                                                                    borderRadius: 2,
                                                                    fontSize: '16px',
                                                                    fontWeight: 600,
                                                                    textTransform: 'none',
                                                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                                                    '&:hover': {
                                                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                                                    },
                                                                }}
                                                            >
                                                                {submitting ? <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} /> : <Save sx={{ mr: 1 }} />}
                                                                Save & Receive
                                                            </Button>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </form>
                                        ) : (
                                            <Alert severity="info">Please search and select a member to create a transaction.</Alert>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Right Column: Member Details */}
                            {selectedMember && (
                                <Grid item xs={12} md={4}>
                                    <Card sx={{ mb: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderRadius: 2, position: 'sticky', top: 20 }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <Person sx={{ mr: 1, color: 'success.main' }} />
                                                <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                                                    Selected Member
                                                </Typography>
                                            </Box>
                                            <Box
                                                sx={{
                                                    p: 2,
                                                    bgcolor: 'success.50',
                                                    borderRadius: 2,
                                                    border: '1px solid',
                                                    borderColor: 'success.200',
                                                }}
                                            >
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12}>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                            Full Name
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                            {selectedMember.full_name} ({formatStatus(selectedMember.status)})
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                            Membership No
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                            {selectedMember.membership_no}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                            Membership Date
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                            {formatDate(selectedMember.membership_date)}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                            Membership Fee
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#059669' }}>
                                                            Rs {selectedMember.member_category?.fee?.toLocaleString() || 'N/A'}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                            Maintenance Fee (Monthly)
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#dc2626' }}>
                                                            Rs {selectedMember.member_category?.subscription_fee?.toLocaleString() || 'N/A'}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                            Quarterly Fee
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#7c3aed' }}>
                                                            Rs {selectedMember.member_category?.subscription_fee ? Math.round(selectedMember.member_category.subscription_fee * 3).toLocaleString() : 'N/A'}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )}
                        </Grid>
                    </Grid>

                    {/* Step 3: Transaction History */}
                    {selectedMember && (
                        <Grid item xs={12}>
                            <Card sx={{ mb: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderRadius: 2 }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                        <Box
                                            sx={{
                                                bgcolor: 'secondary.main',
                                                color: 'white',
                                                borderRadius: '50%',
                                                width: 32,
                                                height: 32,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mr: 2,
                                                fontSize: '14px',
                                                fontWeight: 600,
                                            }}
                                        >
                                            3
                                        </Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                            Transaction History - {selectedMember.full_name}
                                        </Typography>
                                    </Box>

                                    {/* Search Bar */}
                                    <Box sx={{ mb: 3 }}>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            placeholder="Search by invoice number..."
                                            value={searchInvoice}
                                            onChange={(e) => handleSearchInvoice(e.target.value)}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Search sx={{ color: 'action.active' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    bgcolor: 'grey.50',
                                                },
                                            }}
                                        />
                                    </Box>

                                    {loadingTransactions ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                            <CircularProgress />
                                        </Box>
                                    ) : (
                                        <>
                                            <TableContainer component={Paper} elevation={0}>
                                                <Table>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Invoice No</TableCell>
                                                            <TableCell>Fee Type</TableCell>
                                                            <TableCell>Details</TableCell>
                                                            <TableCell>Amount</TableCell>
                                                            <TableCell>Payment Method</TableCell>
                                                            <TableCell>Invoice</TableCell>
                                                            <TableCell>Action</TableCell>
                                                            <TableCell>Status</TableCell>
                                                            <TableCell>Payment Date</TableCell>
                                                            <TableCell>Period</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {currentTransactions.length > 0 ? (
                                                            currentTransactions.map((transaction) => (
                                                                <TableRow key={transaction.id}>
                                                                    <TableCell>{transaction.invoice_no}</TableCell>
                                                                    <TableCell>
                                                                        <Chip label={transaction.fee_type?.replace('_', ' ').toUpperCase()} color={transaction.fee_type === 'membership_fee' ? 'primary' : transaction.fee_type === 'subscription_fee' ? 'success' : 'secondary'} size="small" />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {transaction.fee_type === 'subscription_fee' ? (
                                                                            <Box>
                                                                                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                                                                                    {transaction.data?.subscription_type_name || 'Subscription'}
                                                                                </Typography>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    {transaction.data?.subscription_category_name || 'Category'}
                                                                                </Typography>
                                                                            </Box>
                                                                        ) : transaction.fee_type === 'maintenance_fee' ? (
                                                                            <Box>
                                                                                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                                                                                    {transaction.payment_frequency?.toUpperCase() || 'QUARTERLY'}
                                                                                </Typography>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    Q{transaction.quarter_number || 1}
                                                                                </Typography>
                                                                            </Box>
                                                                        ) : (
                                                                            <Typography variant="caption" color="text.secondary">
                                                                                Lifetime Membership
                                                                            </Typography>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell>{formatCurrency(transaction.total_price)}</TableCell>
                                                                    <TableCell>
                                                                        <Chip label={transaction.payment_method === 'credit_card' ? `💳 ${transaction.credit_card_type?.toUpperCase() || 'CARD'}` : '💵 CASH'} color={transaction.payment_method === 'credit_card' ? 'info' : 'default'} size="small" />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Button
                                                                            size="small"
                                                                            variant="outlined"
                                                                            startIcon={<Visibility />}
                                                                            onClick={() => {
                                                                                setCreatedInvoiceId(transaction.id);
                                                                                setCreatedMemberId(transaction.invoice_no);
                                                                                setShowInvoiceModal(true);
                                                                            }}
                                                                            sx={{ fontSize: '11px', py: 0.5, px: 1 }}
                                                                        >
                                                                            View
                                                                        </Button>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {transaction.status === 'unpaid' && (
                                                                            <Button size="small" variant="contained" color="success" startIcon={<Payment />} onClick={() => handlePayClick(transaction)} sx={{ fontSize: '11px', py: 0.5, px: 1, whiteSpace: 'nowrap' }}>
                                                                                Pay Now
                                                                            </Button>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Chip label={transaction.status?.toUpperCase()} color={getStatusColor(transaction.status)} size="small" />
                                                                    </TableCell>
                                                                    <TableCell>{transaction.payment_date ? formatDate(transaction.payment_date) : '-'}</TableCell>
                                                                    <TableCell>{transaction.valid_from && transaction.valid_to ? `${formatDate(transaction.valid_from)} - ${formatDate(transaction.valid_to)}` : '-'}</TableCell>
                                                                </TableRow>
                                                            ))
                                                        ) : (
                                                            <TableRow>
                                                                <TableCell colSpan={9} align="center">
                                                                    <Typography color="textSecondary">{searchInvoice ? `No transactions found matching "${searchInvoice}"` : 'No transactions found for this member'}</Typography>
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>

                                            {/* Pagination */}
                                            {filteredTransactions.length > transactionsPerPage && (
                                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3, gap: 2 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Showing {indexOfFirstTransaction + 1}-{Math.min(indexOfLastTransaction, filteredTransactions.length)} of {filteredTransactions.length} transactions
                                                    </Typography>
                                                    <Pagination
                                                        count={totalPages}
                                                        page={currentPage}
                                                        onChange={handlePageChange}
                                                        color="primary"
                                                        size="medium"
                                                        showFirstButton
                                                        showLastButton
                                                        sx={{
                                                            '& .MuiPaginationItem-root': {
                                                                borderRadius: 2,
                                                            },
                                                        }}
                                                    />
                                                </Box>
                                            )}
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                </Grid>
            </Box>

            {/* Invoice Modal */}
            <MembershipInvoiceSlip
                open={showInvoiceModal}
                onClose={() => {
                    setShowInvoiceModal(false);
                }}
                invoiceNo={createdMemberId}
                invoiceId={createdInvoiceId}
            />

            {/* Payment Confirmation Dialog */}
            <Dialog open={paymentConfirmationOpen} onClose={() => setPaymentConfirmationOpen(false)} aria-labelledby="payment-dialog-title" aria-describedby="payment-dialog-description">
                <DialogTitle id="payment-dialog-title" sx={{ color: '#0a3d62', fontWeight: 600 }}>
                    Confirm Payment
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="payment-dialog-description">Are you sure you want to mark this invoice as paid?</DialogContentText>
                    {transactionToPay && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                            <Grid container spacing={1}>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Invoice No:</strong> {transactionToPay.invoice_no}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Fee Type:</strong> {transactionToPay.fee_type?.replace('_', ' ').toUpperCase()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Amount:</strong> {formatCurrency(transactionToPay.total_price)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Period:</strong> {transactionToPay.valid_from && transactionToPay.valid_to ? `${formatDate(transactionToPay.valid_from)} - ${formatDate(transactionToPay.valid_to)}` : '-'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setPaymentConfirmationOpen(false)} color="inherit">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmPayment} variant="contained" color="success" autoFocus startIcon={<Payment />}>
                        Confirm Payment
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
