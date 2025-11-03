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
    Stack
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';

export default function DailyDumpItemsReport({ 
    dumpItemsData, 
    startDate, 
    endDate, 
    totalQuantity, 
    totalSalePrice, 
    totalFoodValue, 
    filters 
}) {
    const [open, setOpen] = useState(true);
    const [dateFilters, setDateFilters] = useState({
        start_date: filters?.start_date || startDate,
        end_date: filters?.end_date || endDate
    });

    const handleFilterChange = (field, value) => {
        setDateFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const applyFilters = () => {
        router.get(route('admin.reports.pos.daily-dump-items-report'), dateFilters);
    };

    const handlePrint = () => {
        const printUrl = route('admin.reports.pos.daily-dump-items-report.print', dateFilters);
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
        return new Intl.NumberFormat('en-US', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <>
            <Head title="Daily Dump Items Report" />
            {/* <SideNav open={open} setOpen={setOpen} /> */}

            <div
                style={{
                    minHeight: '100vh',
                    backgroundColor:'#f5f5f5',
                    overflowX:'hidden'
                }}
            >
                <Box sx={{ p: 3 }}>
                    {/* Header */}
                    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                        <Grid container justifyContent="space-between" alignItems="center">
                            <Grid item>
                                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    Daily Dump Items Report
                                </Typography>
                                <Typography variant="h6" color="text.secondary">
                                    Cancelled and dumped items tracking report
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
                            <Stack direction="row" spacing={2} alignItems="center">
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
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="error.main" sx={{ fontWeight: 'bold' }}>
                                        {dumpItemsData?.length || 0}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Dumped Items
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                                        {formatCurrency(totalQuantity)}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Total Quantity
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="error.main" sx={{ fontWeight: 'bold' }}>
                                        {formatCurrency(totalFoodValue)}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Total Food Value
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Dump Items Report */}
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
                            AFOHS - DAILY DUMP ITEMS REPORT
                        </Typography>

                        <Divider sx={{ mb: 3 }} />

                        {dumpItemsData && Array.isArray(dumpItemsData) && dumpItemsData.length > 0 ? (
                            <TableContainer component={Paper} elevation={1} style={{overflowX:'auto'}}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', borderRight: '1px solid #ddd', width: '80px' }}>
                                                INVOICE KOT #
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', textAlign: 'center', borderRight: '1px solid #ddd', width: '60px' }}>
                                                TABLE #
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', textAlign: 'center', borderRight: '1px solid #ddd', width: '80px' }}>
                                                DATE
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', textAlign: 'center', borderRight: '1px solid #ddd', width: '70px' }}>
                                                ITEM CODE
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', borderRight: '1px solid #ddd', width: '150px' }}>
                                                ITEM NAME
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', textAlign: 'center', borderRight: '1px solid #ddd', width: '50px' }}>
                                                QTY
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', textAlign: 'center', borderRight: '1px solid #ddd', width: '80px' }}>
                                                STATUS
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', textAlign: 'center', borderRight: '1px solid #ddd', width: '100px' }}>
                                                INSTRUCTIONS
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', textAlign: 'center', borderRight: '1px solid #ddd', width: '120px' }}>
                                                REASON
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', textAlign: 'center', borderRight: '1px solid #ddd', width: '100px' }}>
                                                REMARKS
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', textAlign: 'center', borderRight: '1px solid #ddd', width: '80px' }}>
                                                SALE PRICE
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', textAlign: 'center', borderRight: '1px solid #ddd', width: '80px' }}>
                                                FOOD VALUE
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', textAlign: 'center', width: '100px' }}>
                                                CANCELLED BY
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {dumpItemsData.map((item, index) => (
                                            <TableRow 
                                                key={index}
                                                sx={{ 
                                                    '&:nth-of-type(odd)': { 
                                                        backgroundColor: '#fafafa' 
                                                    },
                                                    '&:hover': {
                                                        backgroundColor: '#ffebee'
                                                    }
                                                }}
                                            >
                                                <TableCell sx={{ fontSize: '0.7rem', borderRight: '1px solid #ddd' }}>
                                                    {item.invoice_kot}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.7rem', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                                                    {item.table_no}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.7rem', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                                                    {item.date}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.7rem', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                                                    {item.item_code}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.7rem', borderRight: '1px solid #ddd' }}>
                                                    {item.item_name}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.7rem', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                                                    {item.qty}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.7rem', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                                                    <Typography variant="caption" sx={{ 
                                                        backgroundColor: '#ffcdd2', 
                                                        color: '#c62828', 
                                                        px: 1, 
                                                        py: 0.5, 
                                                        borderRadius: 1,
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {item.status}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.7rem', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                                                    {item.instructions}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.7rem', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                                                    {item.reason}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.7rem', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                                                    {item.remarks}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.7rem', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                                                    {formatCurrency(item.sale_price)}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.7rem', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                                                    {formatCurrency(item.food_value)}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.7rem', textAlign: 'center' }}>
                                                    {item.cancelled_by}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        
                                        {/* Grand Total Row */}
                                        <TableRow sx={{ backgroundColor: '#0a3d62', color: 'white' }}>
                                            <TableCell colSpan={5} sx={{ fontWeight: 'bold', fontSize: '0.8rem', color: 'white', borderRight: '1px solid #fff' }}>
                                                GRAND TOTAL:
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', color: 'white', borderRight: '1px solid #fff' }}>
                                                {formatCurrency(totalQuantity)}
                                            </TableCell>
                                            <TableCell colSpan={5} sx={{ fontWeight: 'bold', fontSize: '0.8rem', color: 'white', borderRight: '1px solid #fff' }}>
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', color: 'white', borderRight: '1px solid #fff' }}>
                                                {formatCurrency(totalSalePrice)}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', color: 'white' }}>
                                                {formatCurrency(totalFoodValue)}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <DeleteIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary">
                                    No dumped items found for the selected date range
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Box>
            </div>
        </>
    );
}
