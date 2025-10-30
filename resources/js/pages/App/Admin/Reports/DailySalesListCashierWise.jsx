import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Box,
    Paper,
    Typography,
    Button,
    TextField,
    Grid,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Card,
    CardContent,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import FilterListIcon from '@mui/icons-material/FilterList';
import PersonIcon from '@mui/icons-material/Person';
import { format } from 'date-fns';

export default function DailySalesListCashierWise({ 
    cashierData, 
    allCashiers = [],
    startDate, 
    endDate, 
    grandTotalSale, 
    grandTotalDiscount, 
    grandTotalSTax, 
    grandTotalCash, 
    grandTotalCredit, 
    grandTotalPaid, 
    grandTotalUnpaid, 
    grandTotal, 
    filters 
}) {
    // const [open, setOpen] = useState(true);
    const [dateFilters, setDateFilters] = useState({
        start_date: filters?.start_date || startDate,
        end_date: filters?.end_date || endDate,
        cashier_id: filters?.cashier_id || ''
    });

    const handleFilterChange = (field, value) => {
        setDateFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const applyFilters = () => {
        router.get(route('admin.reports.pos.daily-sales-list-cashier-wise'), dateFilters);
    };

    const handlePrint = () => {
        const printUrl = route('admin.reports.pos.daily-sales-list-cashier-wise.print', dateFilters);
        window.open(printUrl, '_blank');
    };

    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'dd/MM/yyyy');
        } catch (error) {
            return dateString;
        }
    };

    const formatCurrency = (amount) => {
        return 'Rs ' + new Intl.NumberFormat('en-PK', {
            style: 'decimal',
            minimumFractionDigits: 1,
            maximumFractionDigits: 2
        }).format(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    return (
        <>
            <Head title="Daily Sales List (Cashier-Wise)" />
            {/* <SideNav open={open} setOpen={setOpen} /> */}

            <div
                style={{
                    minHeight: '100vh',
                }}
            >
                <Box sx={{ p: 3 }}>
                    {/* Header */}
                    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                        <Grid container justifyContent="space-between" alignItems="center">
                            <Grid item>
                                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    Daily Sales List (Cashier-Wise)
                                </Typography>
                                <Typography variant="h6" color="text.secondary">
                                    Sales summary grouped by cashier with payment details
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="contained"
                                    startIcon={<PrintIcon />}
                                    onClick={handlePrint}
                                    sx={{ 
                                        backgroundColor: '#0a3d62',
                                        color: 'white',
                                        '&:hover': { backgroundColor: '#083049' }
                                    }}
                                >
                                    Print Report
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Filters */}
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                                <FilterListIcon color="primary" />
                                <Typography variant="h6">Filters</Typography>
                                <TextField
                                    label="Start Date"
                                    type="date"
                                    size="small"
                                    value={dateFilters.start_date}
                                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    label="End Date"
                                    type="date"
                                    size="small"
                                    value={dateFilters.end_date}
                                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                />
                                <FormControl size="small" sx={{ minWidth: 200 }}>
                                    <InputLabel>Cashier</InputLabel>
                                    <Select
                                        value={dateFilters.cashier_id}
                                        onChange={(e) => handleFilterChange('cashier_id', e.target.value)}
                                        label="Cashier"
                                    >
                                        <MenuItem value="">
                                            <em>All Cashiers</em>
                                        </MenuItem>
                                        {allCashiers.map((cashier) => (
                                            <MenuItem key={cashier.id} value={cashier.id}>
                                                {cashier.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <Button
                                    variant="contained"
                                    onClick={applyFilters}
                                    sx={{ 
                                        backgroundColor: '#0a3d62',
                                        color: 'white',
                                        '&:hover': { backgroundColor: '#083049' }
                                    }}
                                >
                                    Apply Filters
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>

                    {/* Summary Stats */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={3}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                                        {cashierData?.length || 0}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Active Cashiers
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                                        {formatCurrency(grandTotalSale)}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Total Sales
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                                        {formatCurrency(grandTotalPaid)}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Total Paid
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                                        {formatCurrency(grandTotalUnpaid)}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Total Unpaid
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Cashier Sales Report */}
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
                            AFOHS - DAILY SALES LIST (CASHIER-WISE)
                        </Typography>

                        <Divider sx={{ mb: 3 }} />

                        {cashierData && Array.isArray(cashierData) && cashierData.length > 0 ? (
                            <TableContainer component={Paper} elevation={1}>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', borderRight: '1px solid #ddd' }}>
                                                CASHIER NAME
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                                                SALE
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                                                DISC.
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                                                S.TAX AMT
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                                                Cash
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                                                Credit
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                                                Paid
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                                                Unpaid
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', textAlign: 'center' }}>
                                                TOTAL
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {cashierData.map((cashier, index) => (
                                            <TableRow 
                                                key={index}
                                                sx={{ 
                                                    '&:nth-of-type(odd)': { 
                                                        backgroundColor: '#fafafa' 
                                                    },
                                                    '&:hover': {
                                                        backgroundColor: '#f0f7ff'
                                                    }
                                                }}
                                            >
                                                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 'bold', borderRight: '1px solid #ddd' }}>
                                                    {cashier.name}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                                                    {formatCurrency(cashier.sale)}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                                                    {formatCurrency(cashier.discount)}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                                                    {formatCurrency(cashier.s_tax_amt)}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                                                    {formatCurrency(cashier.cash)}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                                                    {formatCurrency(cashier.credit)}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', fontWeight: 'bold', color: '#4caf50', borderRight: '1px solid #ddd' }}>
                                                    {formatCurrency(cashier.paid)}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', fontWeight: 'bold', color: '#ff9800', borderRight: '1px solid #ddd' }}>
                                                    {formatCurrency(cashier.unpaid)}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', fontWeight: 'bold', color: '#0a3d62' }}>
                                                    {formatCurrency(cashier.total)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        
                                        {/* Grand Total Row */}
                                        <TableRow sx={{ backgroundColor: '#0a3d62', color: 'white' }}>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'white', borderRight: '1px solid #fff' }}>
                                                GRAND TOTAL:
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', color: 'white', borderRight: '1px solid #fff' }}>
                                                {formatCurrency(grandTotalSale)}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', color: 'white', borderRight: '1px solid #fff' }}>
                                                {formatCurrency(grandTotalDiscount)}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', color: 'white', borderRight: '1px solid #fff' }}>
                                                {formatCurrency(grandTotalSTax)}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', color: 'white', borderRight: '1px solid #fff' }}>
                                                {formatCurrency(grandTotalCash)}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', color: 'white', borderRight: '1px solid #fff' }}>
                                                {formatCurrency(grandTotalCredit)}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', color: 'white', borderRight: '1px solid #fff' }}>
                                                {formatCurrency(grandTotalPaid)}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', color: 'white', borderRight: '1px solid #fff' }}>
                                                {formatCurrency(grandTotalUnpaid)}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', color: 'white' }}>
                                                {formatCurrency(grandTotal)}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <PersonIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary">
                                    No cashier sales data found for the selected date range
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Box>
            </div>
        </>
    );
}
