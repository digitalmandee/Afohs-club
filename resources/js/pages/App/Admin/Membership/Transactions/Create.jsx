import React, { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Box, Card, CardContent, Typography, Grid, TextField, Button, FormControl, Select, MenuItem, Autocomplete, Chip, Alert, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, FormHelperText, Pagination, InputAdornment } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enqueueSnackbar } from 'notistack';
import axios from 'axios';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { Person, Receipt, Search } from '@mui/icons-material';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;
export default function CreateTransaction({ subscriptionTypes = [], subscriptionCategories = [] }) {
    const [open, setOpen] = useState(true);
    const [selectedMember, setSelectedMember] = useState(null);
    const [memberTransactions, setMemberTransactions] = useState([]);
    const [membershipFeePaid, setMembershipFeePaid] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [dateValidation, setDateValidation] = useState({ isValid: true, message: '' });

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

    const { data, setData, post, processing, errors, reset } = useForm({
        member_id: '',
        fee_type: '',
        payment_frequency: 'quarterly',
        discount_type: '',
        discount_value: '',
        payment_method: 'cash',
        amount: '',
        valid_from: '',
        valid_to: '',
        starting_quarter: 1,
        credit_card_type: '',
        receipt_file: null,
        subscription_type_id: '',
        subscription_category_id: '',
        family_member_relation: 'SELF',
    });

    // Auto-update payment suggestions when member changes
    useEffect(() => {
        if (selectedMember && data.fee_type === 'maintenance_fee') {
            const currentFrequency = data.payment_frequency || 'quarterly';
            suggestMaintenancePeriod(currentFrequency);
        }
    }, [selectedMember, memberTransactions]); // Trigger when member or their transactions change

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
                const hasOverlap = (txStart <= monthEnd && txEnd >= monthStart);
                
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
            paidMonthsInFirstYear.forEach(month => {
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
                if (latestPaymentMonth === 11) { // December
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
                        return (txStart.getFullYear() <= analysisYear && txEnd.getFullYear() >= analysisYear) ||
                               (txStart.getFullYear() === analysisYear || txEnd.getFullYear() === analysisYear);
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
                
                const paidMonthsInQuarter = monthsInQuarter.filter(month => {
                    const monthKey = `${currentAnalysisYear}-${month}`;
                    return paidMonthsInYear.has(monthKey);
                });
                
                const allMonthsPaid = paidMonthsInQuarter.length === 3;
                const someMonthsPaid = paidMonthsInQuarter.length > 0;
                
                
                if (allMonthsPaid) {
                    paidQuarters.push(quarter);
                } else if (someMonthsPaid) {
                    // Track partial quarter info
                    const unpaidMonths = monthsInQuarter.filter(month => {
                        const monthKey = `${currentAnalysisYear}-${month}`;
                        return !paidMonthsInYear.has(monthKey);
                    });
                    
                    partialQuarters[quarter] = {
                        paidMonths: paidMonthsInQuarter,
                        unpaidMonths: unpaidMonths,
                        nextUnpaidMonth: Math.min(...unpaidMonths)
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
                    const hasOverlap = (txStart <= monthEnd && txEnd >= monthStart);
                    
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
                const nextMonth = monthsInFirstYear.find(month => !paidMonths.includes(month));
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
            const response = await axios.get(route('membership.transactions.search'), {
                params: { query }
            });
            setSearchResults(response.data.members || []);
        } catch (error) {
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleMemberSelect = async (member) => {
        setSelectedMember(member);
        setData('member_id', member.id);
        setLoadingTransactions(true);

        try {
            const response = await axios.get(route('membership.transactions.member', member.id));
            setMemberTransactions(response.data.transactions);
            setFilteredTransactions(response.data.transactions);
            setMembershipFeePaid(response.data.membership_fee_paid);
            setCurrentPage(1); // Reset pagination
            setSearchInvoice(''); // Reset search

            // Analyze quarter payment status
            const quarterAnalysis = analyzeQuarterStatus(response.data.transactions, member.membership_date);
            setQuarterStatus(quarterAnalysis);

            enqueueSnackbar(`Selected member: ${member.full_name}`, { variant: 'info' });
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error loading member data', { variant: 'error' });
        } finally {
            setLoadingTransactions(false);
        }
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
        setData('fee_type', feeType);

        // Reset fields when changing fee type
        setData('amount', '');
        setData('valid_from', '');
        setData('valid_to', '');
        setData('subscription_type_id', '');
        setData('subscription_category_id', '');

        // Update amount based on fee type and selected member
        if (selectedMember && selectedMember.member_category) {
            if (feeType === 'membership_fee') {
                setData('amount', selectedMember.member_category.fee);
                // Auto-suggest 4 years validity for membership fee
                const today = new Date();
                const fourYearsLater = new Date(today.getFullYear() + 4, today.getMonth(), today.getDate());
                setData('valid_from', today.toISOString().split('T')[0]);
                setData('valid_to', fourYearsLater.toISOString().split('T')[0]);
            } else if (feeType === 'maintenance_fee') {
                setData('amount', selectedMember.member_category.subscription_fee);
                // Auto-suggest quarterly period based on member joining date
                suggestMaintenancePeriod('quarterly');
            } else if (feeType === 'subscription_fee') {
                // For subscription fees, user will select type and category manually
                // Set default start date to today
                const today = new Date();
                setData('valid_from', today.toISOString().split('T')[0]);
            } else if (feeType === 'reinstating_fee') {
                // For reinstating fees, set a standard amount (can be customized)
                setData('amount', 25000); // Standard reinstating fee amount
                // No validity period needed for reinstating fees
                setData('valid_from', '');
                setData('valid_to', '');
            }
        }
    };

    const suggestMaintenancePeriod = (frequency) => {
        if (!selectedMember) {
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
        const maintenanceTransactions = memberTransactions.filter(t => t.fee_type === 'maintenance_fee' && t.status === 'paid');
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
                const hasOverlap = (txStart <= monthEnd && txEnd >= monthStart);
                
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
            } else { // annually
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
            const monthlyFee = selectedMember.member_category.subscription_fee / 3; // Quarterly fee / 3 months
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
            } else { // annually
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

            // Calculate amount based on frequency and partial quarter logic
            if (frequency === 'monthly') {
                const monthlyFee = selectedMember.member_category.subscription_fee / 3; // Quarterly fee / 3 months
                amount = Math.round(monthlyFee);
            } else if (currentPartialQuarter && frequency === 'quarterly') {
                // For partial quarter completion, charge only for remaining months
                const monthlyFee = selectedMember.member_category.subscription_fee / 3;
                amount = Math.round(monthlyFee * monthsToAdd);
            } else {
                const quarterlyAmount = selectedMember.member_category.subscription_fee;
                amount = quarterlyAmount * quartersToAdd;
            }
        }

        
        setData('valid_from', startDate.toISOString().split('T')[0]);
        setData('valid_to', endDate.toISOString().split('T')[0]);
        setData('starting_quarter', quarterStatus.nextAvailableQuarter);
        setData('amount', amount);
    };

    const calculateTotal = () => {
        const amount = parseFloat(data.amount) || 0;
        const discountValue = parseFloat(data.discount_value) || 0;

        let total;
        if (data.discount_type === 'percent') {
            total = amount - (amount * discountValue) / 100;
        } else if (data.discount_type === 'fixed') {
            total = amount - discountValue;
        } else {
            total = amount;
        }

        return Math.round(total);
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
            console.log(`Original ${field} value:`, value);
            
            if (field === 'valid_from') {
                // Always set to first day of selected month
                const correctedValue = getFirstDayOfMonth(value);
                console.log(`Corrected ${field} value:`, correctedValue);
                value = correctedValue;
            } else if (field === 'valid_to') {
                // Always set to last day of selected month
                const correctedValue = getLastDayOfMonth(value);
                console.log(`Corrected ${field} value:`, correctedValue);
                value = correctedValue;
            }
        }
        
        setData(field, value);

        // Update validation after a short delay
        setTimeout(() => {
            const validation = validateDateOverlap();
            setDateValidation(validation);
            
            // Recalculate amount if both dates are present and fee type is maintenance
            if (data.fee_type === 'maintenance_fee' && selectedMember && data.valid_from && data.valid_to) {
                const fromDate = new Date(field === 'valid_from' ? value : data.valid_from);
                const toDate = new Date(field === 'valid_to' ? value : data.valid_to);
                
                if (fromDate && toDate && toDate > fromDate) {
                    // Calculate number of months between dates
                    const monthsDiff = (toDate.getFullYear() - fromDate.getFullYear()) * 12 + 
                                     (toDate.getMonth() - fromDate.getMonth()) + 1;
                    
                    // Calculate quarters (round up to nearest quarter)
                    const quarters = Math.ceil(monthsDiff / 3);
                    
                    // Calculate amount based on quarters
                    const quarterlyFee = selectedMember.member_category.subscription_fee;
                    const newAmount = quarterlyFee * quarters;
                    
                    setData('amount', newAmount);
                    
                    enqueueSnackbar(`Amount updated to Rs ${newAmount.toLocaleString()} for ${quarters} quarters (${monthsDiff} months)`, { 
                        variant: 'info' 
                    });
                }
            }
        }, 100);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

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
                } else if (data[key] !== null && data[key] !== '') {
                    formData.append(key, data[key]);
                }
            });

            const response = await axios.post(route('membership.transactions.store'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                // Reset form
                setData({
                    member_id: '',
                    fee_type: 'maintenance_fee',
                    payment_frequency: 'quarterly',
                    amount: '',
                    discount_type: '',
                    discount_value: '',
                    payment_method: 'cash',
                    valid_from: '',
                    valid_to: '',
                    starting_quarter: 1,
                    credit_card_type: '',
                    receipt_file: null,
                });
                setSelectedMember(null);
                setMemberTransactions([]);
                setMembershipFeePaid(false);
                setFormErrors({});
                setDateValidation({ isValid: true });
                setQuarterStatus({
                    paidQuarters: [],
                    nextAvailableQuarter: 1,
                    currentYear: new Date().getFullYear(),
                });

                // Show success message
                enqueueSnackbar('Transaction created successfully!', { variant: 'success' });

                // Optionally redirect to transaction details
                // window.location.href = route('membership.transactions.show', response.data.transaction.id);
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                // Validation errors
                setFormErrors(error.response.data.errors || {});
                enqueueSnackbar('Please check the form for validation errors.', { variant: 'error' });
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(Math.round(amount));
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-PK', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
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

    return (
        <>
            <Head title="Create Transaction" />
            <SideNav open={open} setOpen={setOpen} />

            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                    backgroundColor: '#f8fafc',
                    minHeight: '100vh',
                }}
            >
                <Box sx={{ p: 4 }}>
                    {/* Header */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                            Create New Transaction
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Search for a member and create a new transaction
                        </Typography>
                    </Box>

                    <Grid container spacing={3}>
                        {/* Step 1: Member Search */}
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

                                    {selectedMember && (
                                        <Box
                                            sx={{
                                                mt: 2,
                                                p: 2,
                                                bgcolor: 'success.50',
                                                borderRadius: 2,
                                                border: '1px solid',
                                                borderColor: 'success.200',
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <Person sx={{ mr: 1, color: 'success.main' }} />
                                                <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                                                    Selected Member
                                                </Typography>
                                            </Box>
                                            <Grid container spacing={1}>
                                                <Grid item xs={12} sm={6} lg={4}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                        Full Name
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                        {selectedMember.full_name}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6} lg={4}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                        Membership No
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                        {selectedMember.membership_no}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6} lg={4}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                        Membership Date
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                        {formatDate(selectedMember.membership_date)}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6} lg={4}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                        Membership Fee
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 500, color: '#059669' }}>
                                                        Rs {selectedMember.member_category?.fee?.toLocaleString() || 'N/A'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6} lg={4}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                        Maintenance Fee (Quarterly)
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 500, color: '#dc2626' }}>
                                                        Rs {selectedMember.member_category?.subscription_fee?.toLocaleString() || 'N/A'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6} lg={4}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                        Monthly Rate
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 500, color: '#7c3aed' }}>
                                                        Rs {selectedMember.member_category?.subscription_fee ? Math.round(selectedMember.member_category.subscription_fee / 3).toLocaleString() : 'N/A'}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Step 2: Transaction Form */}
                        <Grid item xs={12}>
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
                                                        <Select value={data.fee_type} onChange={(e) => handleFeeTypeChange(e.target.value)} error={!!errors.fee_type} sx={{ borderRadius: 2 }}>
                                                            <MenuItem value="membership_fee" disabled={membershipFeePaid}>
                                                                Membership Fee {membershipFeePaid && '(Already Paid)'}
                                                            </MenuItem>
                                                            <MenuItem value="maintenance_fee">Maintenance Fee</MenuItem>
                                                            <MenuItem value="subscription_fee">Subscription Fee</MenuItem>
                                                            <MenuItem value="reinstating_fee">Reinstating Fee</MenuItem>
                                                        </Select>
                                                        {errors.fee_type && (
                                                            <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                                                                {errors.fee_type}
                                                            </Typography>
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
                                                                    const isFirstYear = !quarterStatus.latestEndDate || new Date(quarterStatus.latestEndDate) <= firstYearEnd;
                                                                    
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
                                                                                        memberTransactions.filter(t => t.fee_type === 'maintenance_fee' && t.status === 'paid').forEach((transaction) => {
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
                                                                                                const hasOverlap = (txStart <= monthEnd && txEnd >= monthStart);
                                                                                                
                                                                                                if (hasOverlap && year === membershipYear && monthsInFirstYear.includes(month) && !paidMonths.includes(month)) {
                                                                                                    paidMonths.push(month);
                                                                                                }
                                                                                                
                                                                                                currentDate.setMonth(currentDate.getMonth() + 1);
                                                                                            }
                                                                                        });
                                                                                        
                                                                                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                                                                        
                                                                                        return (
                                                                                            <Typography variant="body2" color="text.secondary">
                                                                                                <strong>Paid Months:</strong> {paidMonths.length > 0 ? paidMonths.map(m => monthNames[m]).join(', ') : 'None'} 
                                                                                                <br />
                                                                                                <strong>Remaining:</strong> {monthsInFirstYear.filter(m => !paidMonths.includes(m)).map(m => monthNames[m]).join(', ') || 'All paid!'}
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
                                                                                <strong>Next payment:</strong> {isFirstYear ? 'Monthly payment system' : `Quarter ${quarterStatus.nextAvailableQuarter}`}
                                                                                {!isFirstYear && quarterStatus.latestEndDate && (
                                                                                    <span> (Last payment ended: {formatDate(quarterStatus.latestEndDate)})</span>
                                                                                )}
                                                                                {!quarterStatus.latestEndDate && !isFirstYear && (
                                                                                    <span> (No previous maintenance payments found)</span>
                                                                                )}
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
                                                                    <strong>Next suggested payment:</strong> Quarter {quarterStatus.nextAvailableQuarter} 
                                                                    <br />
                                                                    Select your desired payment period using the dates below. Amount will calculate automatically.
                                                                </Typography>
                                                            </Alert>
                                                            
                                                            {/* Quick Payment Period Buttons */}
                                                            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                                                <Button 
                                                                    size="small" 
                                                                    variant="outlined" 
                                                                    onClick={() => suggestMaintenancePeriod('monthly')}
                                                                    sx={{ borderRadius: 2 }}
                                                                >
                                                                    1 Month
                                                                </Button>
                                                                <Button 
                                                                    size="small" 
                                                                    variant="outlined" 
                                                                    onClick={() => suggestMaintenancePeriod('quarterly')}
                                                                    sx={{ borderRadius: 2 }}
                                                                >
                                                                    1 Quarter (3 months)
                                                                </Button>
                                                                <Button 
                                                                    size="small" 
                                                                    variant="outlined" 
                                                                    onClick={() => suggestMaintenancePeriod('half_yearly')}
                                                                    sx={{ borderRadius: 2 }}
                                                                >
                                                                    6 Months
                                                                </Button>
                                                                <Button 
                                                                    size="small" 
                                                                    variant="outlined" 
                                                                    onClick={() => suggestMaintenancePeriod('annually')}
                                                                    sx={{ borderRadius: 2 }}
                                                                >
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
                                                                            label={selectedMember.status} 
                                                                            size="small" 
                                                                            sx={{ 
                                                                                ml: 1,
                                                                                backgroundColor: selectedMember.status === 'active' ? '#dcfce7' : '#fecaca',
                                                                                color: selectedMember.status === 'active' ? '#166534' : '#dc2626'
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
                                                                        <Alert severity="warning">
                                                                            This member's current status ({selectedMember.status}) may not require reinstatement. Reinstating fees are typically for cancelled, expired, suspended, or terminated members.
                                                                        </Alert>
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
                                                            }}
                                                        >
                                                            <Grid container spacing={3}>
                                                                <Grid item xs={6}>
                                                                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#374151' }}>
                                                                        Subscription Type
                                                                    </Typography>
                                                                    <FormControl fullWidth>
                                                                        <Select
                                                                            value={data.subscription_type_id}
                                                                            onChange={(e) => {
                                                                                setData('subscription_type_id', e.target.value);
                                                                                setData('subscription_category_id', ''); // Reset category when type changes
                                                                                setData('amount', ''); // Reset amount
                                                                            }}
                                                                            error={!!errors.subscription_type_id}
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
                                                                        {errors.subscription_type_id && (
                                                                            <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                                                                                {errors.subscription_type_id}
                                                                            </Typography>
                                                                        )}
                                                                    </FormControl>
                                                                </Grid>

                                                                <Grid item xs={6}>
                                                                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#374151' }}>
                                                                        Subscription Category
                                                                    </Typography>
                                                                    <FormControl fullWidth>
                                                                        <Select
                                                                            value={data.subscription_category_id}
                                                                            onChange={(e) => {
                                                                                const categoryId = e.target.value;
                                                                                setData('subscription_category_id', categoryId);
                                                                                
                                                                                // Auto-populate amount from selected category
                                                                                const selectedCategory = subscriptionCategories?.find(cat => cat.id == categoryId);
                                                                                if (selectedCategory) {
                                                                                    setData('amount', selectedCategory.fee);
                                                                                }
                                                                            }}
                                                                            error={!!errors.subscription_category_id}
                                                                            sx={{ borderRadius: 2 }}
                                                                            displayEmpty
                                                                            disabled={!data.subscription_type_id}
                                                                        >
                                                                            <MenuItem value="">Select Category</MenuItem>
                                                                            {subscriptionCategories
                                                                                ?.filter(cat => cat.subscription_type_id == data.subscription_type_id)
                                                                                ?.map((category) => (
                                                                                    <MenuItem key={category.id} value={category.id}>
                                                                                        {category.name} - Rs. {category.fee}
                                                                                    </MenuItem>
                                                                                ))}
                                                                        </Select>
                                                                        {errors.subscription_category_id && (
                                                                            <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                                                                                {errors.subscription_category_id}
                                                                            </Typography>
                                                                        )}
                                                                    </FormControl>
                                                                </Grid>

                                                                {/* Family Member Relation */}
                                                                <Grid item xs={12}>
                                                                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#374151' }}>
                                                                        Family Member Relation
                                                                    </Typography>
                                                                    <FormControl fullWidth>
                                                                        <Select
                                                                            value={data.family_member_relation}
                                                                            onChange={(e) => setData('family_member_relation', e.target.value)}
                                                                            error={!!errors.family_member_relation}
                                                                            sx={{ borderRadius: 2 }}
                                                                            displayEmpty
                                                                        >
                                                                            <MenuItem value="SELF">SELF</MenuItem>
                                                                            {['Father', 'Son', 'Daughter', 'Wife', 'Mother', 'Grand Son', 'Grand Daughter', 'Second Wife', 'Husband', 'Sister', 'Brother', 'Nephew', 'Niece', 'Father in law', 'Mother in Law'].map((relation) => (
                                                                                <MenuItem key={relation} value={relation}>
                                                                                    {relation}
                                                                                </MenuItem>
                                                                            ))}
                                                                        </Select>
                                                                        {errors.family_member_relation && (
                                                                            <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                                                                                {errors.family_member_relation}
                                                                            </Typography>
                                                                        )}
                                                                    </FormControl>
                                                                </Grid>
                                                            </Grid>
                                                        </Box>
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
                                                                fullWidth
                                                                label="Amount (PKR)"
                                                                type="number"
                                                                value={data.amount}
                                                                onChange={(e) => setData('amount', e.target.value)}
                                                                error={!!errors.amount}
                                                                helperText={errors.amount}
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                                                }}
                                                                InputProps={{
                                                                    startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>Rs</Typography>,
                                                                }}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <FormControl fullWidth>
                                                                <Select value={data.discount_type} onChange={(e) => setData('discount_type', e.target.value)} displayEmpty sx={{ borderRadius: 2 }}>
                                                                    <MenuItem value="">No Discount</MenuItem>
                                                                    <MenuItem value="percent">Percentage</MenuItem>
                                                                    <MenuItem value="fixed">Fixed Amount</MenuItem>
                                                                </Select>
                                                            </FormControl>
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <TextField
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
                                                    </Grid>
                                                </Grid>

                                                {/* Payment Method Section */}
                                                <Grid item xs={12}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                                                        Payment Method
                                                    </Typography>
                                                    <FormControl fullWidth>
                                                        <Select value={data.payment_method} onChange={(e) => setData('payment_method', e.target.value)} sx={{ borderRadius: 2 }}>
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
                                                                        <Select value={data.credit_card_type} onChange={(e) => setData('credit_card_type', e.target.value)} error={!!formErrors.credit_card_type} displayEmpty sx={{ borderRadius: 2 }}>
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
                                                                        fullWidth
                                                                        label={data.fee_type === 'maintenance_fee' ? "Valid From (1st of month)" : "Valid From"}
                                                                        type="date"
                                                                        value={data.valid_from}
                                                                        onChange={(e) => handleDateChange('valid_from', e.target.value)}
                                                                        InputLabelProps={{ shrink: true }}
                                                                        error={!!(errors.valid_from || formErrors.valid_from || !dateValidation.isValid)}
                                                                        helperText={
                                                                            errors.valid_from || 
                                                                            formErrors.valid_from?.[0] || 
                                                                            (!dateValidation.isValid ? 'Date conflict detected' : '') ||
                                                                            (data.fee_type === 'maintenance_fee' ? 'Will auto-set to 1st of selected month' : '')
                                                                        }
                                                                        sx={{
                                                                            '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                                                        }}
                                                                    />
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <TextField
                                                                        fullWidth
                                                                        label={data.fee_type === 'maintenance_fee' ? "Valid To (last day of month)" : "Valid To"}
                                                                        type="date"
                                                                        value={data.valid_to}
                                                                        onChange={(e) => handleDateChange('valid_to', e.target.value)}
                                                                        InputLabelProps={{ shrink: true }}
                                                                        error={!!(errors.valid_to || formErrors.valid_to || !dateValidation.isValid)}
                                                                        helperText={
                                                                            errors.valid_to || 
                                                                            formErrors.valid_to?.[0] || 
                                                                            (!dateValidation.isValid ? 'Date conflict detected' : '') ||
                                                                            (data.fee_type === 'maintenance_fee' ? 'Will auto-set to last day of selected month' : '')
                                                                        }
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

                                                {/* Subscription Validity Period Section */}
                                                {selectedMember && data.fee_type === 'subscription_fee' && (
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
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                                                Set Subscription Period
                                                            </Typography>

                                                            <Grid container spacing={3}>
                                                                <Grid item xs={6}>
                                                                    <TextField
                                                                        fullWidth
                                                                        label="Valid From"
                                                                        type="date"
                                                                        value={data.valid_from}
                                                                        onChange={(e) => setData('valid_from', e.target.value)}
                                                                        error={!!errors.valid_from}
                                                                        helperText={errors.valid_from || 'Subscription start date'}
                                                                        sx={{
                                                                            '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                                                        }}
                                                                        InputLabelProps={{ shrink: true }}
                                                                    />
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <TextField
                                                                        fullWidth
                                                                        label="Valid To"
                                                                        type="date"
                                                                        value={data.valid_to}
                                                                        onChange={(e) => setData('valid_to', e.target.value)}
                                                                        error={!!errors.valid_to}
                                                                        helperText={errors.valid_to || 'Leave empty for unlimited validity'}
                                                                        sx={{
                                                                            '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                                                        }}
                                                                        InputLabelProps={{ shrink: true }}
                                                                    />
                                                                </Grid>
                                                            </Grid>

                                                            {data.valid_from && (
                                                                <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                                                                    <strong>Subscription Period:</strong> {formatDate(data.valid_from)} 
                                                                    {data.valid_to ? ` to ${formatDate(data.valid_to)}` : ' (Unlimited)'}
                                                                </Alert>
                                                            )}
                                                        </Box>
                                                    </Grid>
                                                )}

                                                {/* Total Amount Summary */}
                                                {data.amount && (
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
                                                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#0a3d62' }}>
                                                                Total Amount: {formatCurrency(calculateTotal())}
                                                            </Typography>
                                                            {data.discount_value && (
                                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                                    Original: {formatCurrency(data.amount)} | Discount: {data.discount_type === 'percent' ? `${data.discount_value}%` : formatCurrency(data.discount_value)}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </Grid>
                                                )}

                                                {/* Submit Button */}
                                                <Grid item xs={12}>
                                                    <Button
                                                        type="submit"
                                                        variant="contained"
                                                        size="large"
                                                        fullWidth
                                                        disabled={
                                                            submitting || 
                                                            !data.fee_type || 
                                                            !data.amount || 
                                                            (data.fee_type === 'maintenance_fee' && (!data.valid_from || !data.valid_to || !dateValidation.isValid)) ||
                                                            (data.fee_type === 'subscription_fee' && (!data.valid_from || !data.subscription_type_id || !data.subscription_category_id))
                                                        }
                                                        sx={{
                                                            mt: 3,
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
                                                        {submitting ? (
                                                            <>
                                                                <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                                                                Creating Transaction...
                                                            </>
                                                        ) : !dateValidation.isValid ? (
                                                            <>⚠️ Fix Date Conflict First</>
                                                        ) : (
                                                            <>
                                                                <Receipt sx={{ mr: 1 }} />
                                                                Create Transaction
                                                            </>
                                                        )}
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </form>
                                    ) : (
                                        <Alert severity="info">Please search and select a member to create a transaction.</Alert>
                                    )}
                                </CardContent>
                            </Card>
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
                                                                <TableCell>Receipt</TableCell>
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
                                                                            <Chip 
                                                                                label={transaction.fee_type?.replace('_', ' ').toUpperCase()} 
                                                                                color={
                                                                                    transaction.fee_type === 'membership_fee' ? 'primary' : 
                                                                                    transaction.fee_type === 'subscription_fee' ? 'success' : 
                                                                                    'secondary'
                                                                                } 
                                                                                size="small" 
                                                                            />
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
                                                                            <Chip 
                                                                                label={transaction.payment_method === 'credit_card' ? `💳 ${transaction.credit_card_type?.toUpperCase() || 'CARD'}` : '💵 CASH'} 
                                                                                color={transaction.payment_method === 'credit_card' ? 'info' : 'default'} 
                                                                                size="small" 
                                                                            />
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {transaction.receipt ? (
                                                                                <Button
                                                                                    size="small"
                                                                                    variant="outlined"
                                                                                    startIcon={<Receipt />}
                                                                                    onClick={() => window.open(`${transaction.receipt}`, '_blank')}
                                                                                    sx={{ fontSize: '11px', py: 0.5, px: 1 }}
                                                                                >
                                                                                    View
                                                                                </Button>
                                                                            ) : (
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    No Receipt
                                                                                </Typography>
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
            </div>
        </>
    );
}
