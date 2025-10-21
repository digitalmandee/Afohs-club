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
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { format } from 'date-fns';
import SideNav from '@/components/App/AdminSideBar/SideNav';

export default function RestaurantWisePosReport({ allReportsData, tenants, startDate, endDate, grandTotal, grandSubTotal, grandDiscount, grandTotalSale, filters }) {
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
        router.get(route('admin.reports.pos.restaurant-wise'), dateFilters);
    };

    const handlePrintAll = () => {
        const printUrl = route('admin.reports.pos.restaurant-wise.print', dateFilters);
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
            <Head title="Restaurant-Wise POS Reports" />
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
                                Restaurant-Wise POS Reports
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                Dish Breakdown Summary with Financial Details
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="contained"
                                startIcon={<PrintIcon />}
                                onClick={handlePrintAll}
                                sx={{ 
                                    backgroundColor: '#0a3d62',
                                    color: 'white',
                                    '&:hover': { backgroundColor: '#083049' }
                                }}
                            >
                                Print All Reports
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
                <Grid container spacing={3} sx={{ mb: 3, mt: 2 }}>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                                    {grandTotal}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Total Items Sold
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                                    {formatCurrency(grandSubTotal)}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Total Sub Total
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                                    {formatCurrency(grandDiscount)}
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
                                <Typography variant="h4" color="error.main" sx={{ fontWeight: 'bold' }}>
                                    {formatCurrency(grandTotalSale)}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Total Sale
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Restaurants List */}
                <Paper elevation={2} sx={{ p: 3 }}>
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
                        Restaurant-Wise Financial Summary
                    </Typography>
                    
                    <Typography variant="subtitle1" sx={{ mb: 2, textAlign: 'center', color: 'text.secondary' }}>
                        Report Date: {formatDate(startDate)} {startDate !== endDate ? `to ${formatDate(endDate)}` : ''}
                    </Typography>

                    <Divider sx={{ mb: 3 }} />

                    {allReportsData && Array.isArray(allReportsData) && allReportsData.length > 0 ? (
                        allReportsData.map((restaurantData, index) => (
                            <Box key={index} sx={{ mb: 6 }}>
                                {/* Restaurant Header */}
                                <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    mb: 2,
                                    p: 2,
                                    backgroundColor: '#0a3d62',
                                    color: 'white',
                                    borderRadius: 1
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <RestaurantIcon sx={{ fontSize: 30 }} />
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                                                {restaurantData.tenant_name}
                                            </Typography>
                                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                                Total Sale: {formatCurrency(restaurantData.report_data.total_sale)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Financial Table for Restaurant */}
                                <TableContainer component={Paper} elevation={2}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', width: '100px', textAlign: 'center' }}>
                                                    ITEM CODE
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                                                    ITEM NAME
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', width: '80px', textAlign: 'center' }}>
                                                    QTY SOLD
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', width: '100px', textAlign: 'center' }}>
                                                    SALE PRICE
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', width: '100px', textAlign: 'center' }}>
                                                    SUB TOTAL
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', width: '100px', textAlign: 'center' }}>
                                                    DISCOUNT
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', width: '100px', textAlign: 'center' }}>
                                                    TOTAL SALE
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {restaurantData.report_data && Array.isArray(restaurantData.report_data.categories) && restaurantData.report_data.categories.map((category, categoryIndex) => (
                                                <React.Fragment key={categoryIndex}>
                                                    {/* Category Header Row */}
                                                    <TableRow sx={{ bgcolor: '#f8f8f8' }}>
                                                        <TableCell 
                                                            colSpan={7} 
                                                            sx={{ 
                                                                fontWeight: 'bold', 
                                                                fontSize: '0.95rem',
                                                                textTransform: 'uppercase',
                                                                py: 1.5,
                                                                borderTop: '2px solid #ddd'
                                                            }}
                                                        >
                                                            {category.category_name}
                                                        </TableCell>
                                                    </TableRow>
                                                    
                                                    {/* Category Items */}
                                                    {Array.isArray(category.items) && category.items.map((item, itemIndex) => (
                                                        <TableRow 
                                                            key={itemIndex}
                                                            sx={{ 
                                                                '&:nth-of-type(odd)': { 
                                                                    backgroundColor: '#fafafa' 
                                                                }
                                                            }}
                                                        >
                                                            <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', fontWeight: 'bold' }}>
                                                                {item.menu_code || 'N/A'}
                                                            </TableCell>
                                                            <TableCell sx={{ fontSize: '0.8rem' }}>
                                                                {item.name}
                                                            </TableCell>
                                                            <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', fontWeight: 'bold', color: '#0a3d62' }}>
                                                                {item.quantity}
                                                            </TableCell>
                                                            <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', fontWeight: 'bold' }}>
                                                                {formatCurrency(item.price)}
                                                            </TableCell>
                                                            <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', fontWeight: 'bold' }}>
                                                                {formatCurrency(item.sub_total)}
                                                            </TableCell>
                                                            <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', fontWeight: 'bold', color: '#ff9800' }}>
                                                                {formatCurrency(item.discount)}
                                                            </TableCell>
                                                            <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', fontWeight: 'bold', color: '#4caf50' }}>
                                                                {formatCurrency(item.total_sale)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                    
                                                    {/* Category Total Row */}
                                                    <TableRow sx={{ bgcolor: '#e3f2fd', borderTop: '2px solid #0a3d62' }}>
                                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                                                            {category.category_name.toUpperCase()} TOTAL:
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.85rem', textAlign: 'center', color: '#0a3d62' }}>
                                                            {category.total_quantity}
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.85rem', textAlign: 'center' }}>
                                                            -
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.85rem', textAlign: 'center' }}>
                                                            {formatCurrency(category.total_sub_total)}
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.85rem', textAlign: 'center', color: '#ff9800' }}>
                                                            {formatCurrency(category.total_discount)}
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.85rem', textAlign: 'center', color: '#4caf50' }}>
                                                            {formatCurrency(category.total_sale)}
                                                        </TableCell>
                                                    </TableRow>
                                                </React.Fragment>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        ))
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <RestaurantIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">
                                No restaurant data available for the selected date range
                            </Typography>
                        </Box>
                    )}

                    {/* Grand Total */}
                    {allReportsData && allReportsData.length > 0 && (
                        <Box sx={{ mt: 4, p: 3, bgcolor: '#f0f7ff', borderRadius: 2, border: '2px solid #0a3d62' }}>
                            <Typography 
                                variant="h5" 
                                sx={{ 
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                    color: '#0a3d62',
                                    mb: 2
                                }}
                            >
                                GRAND TOTALS ACROSS ALL RESTAURANTS
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={3}>
                                    <Typography variant="body1" sx={{ textAlign: 'center' }}>
                                        <strong>Items: {grandTotal}</strong>
                                    </Typography>
                                </Grid>
                                <Grid item xs={3}>
                                    <Typography variant="body1" sx={{ textAlign: 'center' }}>
                                        <strong>Sub Total: {formatCurrency(grandSubTotal)}</strong>
                                    </Typography>
                                </Grid>
                                <Grid item xs={3}>
                                    <Typography variant="body1" sx={{ textAlign: 'center' }}>
                                        <strong>Discount: {formatCurrency(grandDiscount)}</strong>
                                    </Typography>
                                </Grid>
                                <Grid item xs={3}>
                                    <Typography variant="body1" sx={{ textAlign: 'center' }}>
                                        <strong>Total Sale: {formatCurrency(grandTotalSale)}</strong>
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </Paper>
                </Box>
            </div>
        </>
    );
}
