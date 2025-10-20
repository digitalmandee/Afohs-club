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
import ReceiptIcon from '@mui/icons-material/Receipt';
import { format } from 'date-fns';
import SideNav from '@/components/App/AdminSideBar/SideNav';

export default function SalesSummaryWithItems({ salesData, startDate, endDate, grandTotalQty, grandTotalAmount, grandTotalDiscount, grandTotalSale, filters }) {
    const [open, setOpen] = useState(false);
    const [dateFilters, setDateFilters] = useState({
        start_date: filters?.start_date || startDate,
        end_date: filters?.end_date || endDate
    });

    const drawerWidthOpen = 280;
    const drawerWidthClosed = 110;

    const handleFilterChange = (field, value) => {
        setDateFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const applyFilters = () => {
        router.get(route('admin.reports.pos.sales-summary-with-items'), dateFilters);
    };

    const handlePrint = () => {
        const printUrl = route('admin.reports.pos.sales-summary-with-items.print', dateFilters);
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
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR'
        }).format(amount).replace('PKR', 'Rs');
    };

    return (
        <>
            <Head title="Sales Summary (With Items)" />
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
                <Box sx={{ p: 3 }}>
                    {/* Header */}
                    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                        <Grid container justifyContent="space-between" alignItems="center">
                            <Grid item>
                                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    Sales Summary (With Items)
                                </Typography>
                                <Typography variant="h6" color="text.secondary">
                                    Invoice-wise detailed sales report with item breakdown
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
                        <Grid item xs={12} md={3}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                                        {salesData?.length || 0}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Total Invoices
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                                        {grandTotalQty}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Total Quantity
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                                        {formatCurrency(grandTotalDiscount)}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Total Discount
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
                                        Total Sale
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Sales Report */}
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
                            AFOHS - SALES SUMMARY (WITH ITEMS)
                        </Typography>
                        
                        <Typography variant="subtitle1" sx={{ mb: 2, textAlign: 'center', color: 'text.secondary' }}>
                            Date = Between {formatDate(startDate)} To {formatDate(endDate)}
                        </Typography>

                        <Divider sx={{ mb: 3 }} />

                        {salesData && Array.isArray(salesData) && salesData.length > 0 ? (
                            <Box>
                                {salesData.map((invoice, index) => (
                                    <Box key={index} sx={{ mb: 4, border: '1px solid #ddd', borderRadius: 2 }}>
                                        {/* Invoice Header */}
                                        <Box sx={{ 
                                            p: 2, 
                                            backgroundColor: '#f5f5f5',
                                            borderBottom: '1px solid #ddd',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <Box>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                    INVOICE#: {invoice.invoice_no}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    DATE: {invoice.date} | CUSTOMER: {invoice.customer} | ORDER VIA: {invoice.order_via}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    WAITER: {invoice.waiter} | TABLE#: {invoice.table} | COVERS: {invoice.covers}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    KOT: {invoice.kot}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    TIME: {invoice.time}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Items Table */}
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>ITEM CODE</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>ITEM NAME</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center' }}>QTY SOLD</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center' }}>SALE PRICE</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center' }}>SUB TOTAL</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center' }}>DISCOUNT</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center' }}>TOTAL SALE</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {invoice.items.map((item, itemIndex) => (
                                                        <TableRow key={itemIndex}>
                                                            <TableCell sx={{ fontSize: '0.75rem' }}>{item.code}</TableCell>
                                                            <TableCell sx={{ fontSize: '0.75rem' }}>{item.name}</TableCell>
                                                            <TableCell sx={{ fontSize: '0.75rem', textAlign: 'center' }}>{item.qty}</TableCell>
                                                            <TableCell sx={{ fontSize: '0.75rem', textAlign: 'center' }}>{formatCurrency(item.sale_price)}</TableCell>
                                                            <TableCell sx={{ fontSize: '0.75rem', textAlign: 'center' }}>{formatCurrency(item.sub_total)}</TableCell>
                                                            <TableCell sx={{ fontSize: '0.75rem', textAlign: 'center' }}>{formatCurrency(item.discount)}</TableCell>
                                                            <TableCell sx={{ fontSize: '0.75rem', textAlign: 'center', fontWeight: 'bold' }}>{formatCurrency(item.total_sale)}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                    {/* Invoice Total Row */}
                                                    <TableRow sx={{ backgroundColor: '#f0f7ff' }}>
                                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>TOTAL:</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}></TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center' }}>{invoice.total_qty}</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center' }}></TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center' }}>{formatCurrency(invoice.total_amount)}</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center' }}>{formatCurrency(invoice.total_discount)}</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center' }}>{formatCurrency(invoice.total_sale)}</TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                ))}

                                {/* Grand Total */}
                                <Box sx={{ mt: 4, p: 3, bgcolor: '#0a3d62', color: 'white', borderRadius: 2 }}>
                                    <Typography 
                                        variant="h6" 
                                        sx={{ 
                                            textAlign: 'center',
                                            fontWeight: 'bold',
                                            mb: 2
                                        }}
                                    >
                                        GRAND TOTALS
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={3}>
                                            <Typography variant="body1" sx={{ textAlign: 'center' }}>
                                                <strong>Invoices: {salesData.length}</strong>
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <Typography variant="body1" sx={{ textAlign: 'center' }}>
                                                <strong>Quantity: {grandTotalQty}</strong>
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <Typography variant="body1" sx={{ textAlign: 'center' }}>
                                                <strong>Discount: {formatCurrency(grandTotalDiscount)}</strong>
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <Typography variant="body1" sx={{ textAlign: 'center' }}>
                                                <strong>Total Sale: {formatCurrency(grandTotalSale)}</strong>
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Box>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <ReceiptIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary">
                                    No sales data found for the selected date range
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Box>
            </div>
        </>
    );
}
