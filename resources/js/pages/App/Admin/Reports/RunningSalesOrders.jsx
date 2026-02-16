import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Card,
    CardContent,
    Chip
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RefreshIcon from '@mui/icons-material/Refresh';
import { format } from 'date-fns';

export default function RunningSalesOrders({ runningOrders, totalOrders, totalAmount, reportDate }) {

    const handlePrint = () => {
        const printUrl = route('admin.reports.pos.running-sales-orders.print');
        window.open(printUrl, '_blank');
    };

    const handleRefresh = () => {
        router.get(route('admin.reports.pos.running-sales-orders'));
    };

    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'dd/MM/yyyy');
        } catch (error) {
            return dateString;
        }
    };

    const formatTime = (dateString) => {
        try {
            return format(new Date(dateString), 'HH:mm:ss');
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

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'warning';
            case 'preparing':
                return 'info';
            case 'ready':
                return 'success';
            case 'served':
                return 'primary';
            default:
                return 'default';
        }
    };

    return (
        <>
            {/* <Head title="Running Sales Orders" /> */}
            {/* <SideNav open={open} setOpen={setOpen} /> */}

            <div
                style={{
                    minHeight: '100vh',
                    backgroundColor: '#f5f5f5'
                }}
            >
                <Box sx={{ p: 2 }}>
                    {/* Header */}
                    <Box sx={{ mb: 2 }}>
                        <Grid container justifyContent="space-between" alignItems="center">
                            <Grid item>
                                <Typography sx={{ fontWeight: '700', fontSize: '30px', color: '#063455' }}>
                                    Running Sales Orders
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    {/* <Button
                                        variant="outlined"
                                        startIcon={<RefreshIcon />}
                                        onClick={handleRefresh}
                                        sx={{ 
                                            borderColor: '#0a3d62',
                                            color: '#0a3d62',
                                            '&:hover': { borderColor: '#083049', backgroundColor: '#f5f5f5' }
                                        }}
                                    >
                                        Refresh
                                    </Button> */}
                                    <Button
                                        variant="contained"
                                        startIcon={<PrintIcon />}
                                        onClick={handlePrint}
                                        sx={{
                                            backgroundColor: '#063455',
                                            color: 'white',
                                            borderRadius: '16px',
                                            textTransform: 'none',
                                            '&:hover': { backgroundColor: '#063455' }
                                        }}
                                    >
                                        Print
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                        <Typography sx={{ fontWeight: '600', fontSize: '15px', color: '#063455' }}>
                            Today's Active Orders - {formatDate(reportDate)}
                        </Typography>
                    </Box>

                    {/* Summary Stats */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ bgcolor: '#063455', borderRadius: '16px' }}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography sx={{ fontWeight: '500', fontSize: '16px', color: '#fff' }}>
                                        Running Orders
                                    </Typography>
                                    <Typography sx={{ fontWeight: '500', fontSize: '20px', color: '#fff' }}>
                                        {totalOrders}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ bgcolor: '#063455', borderRadius: '16px' }}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography sx={{ fontWeight: '500', fontSize: '16px', color: '#fff' }}>
                                        Total Amount
                                    </Typography>
                                    <Typography sx={{ fontWeight: '500', fontSize: '20px', color: '#fff' }}>
                                        {formatCurrency(totalAmount)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ bgcolor: '#063455', borderRadius: '16px' }}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography sx={{ fontWeight: '500', fontSize: '16px', color: '#fff' }}>
                                        Live Report
                                    </Typography>
                                    <AccessTimeIcon sx={{ fontSize: 25, color: '#fff' }} />
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Orders Table */}
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: '600', textAlign: 'center' }}>
                            RUNNING SALES ORDERS
                        </Typography>

                        {runningOrders && Array.isArray(runningOrders) && runningOrders.length > 0 ? (
                            <TableContainer component={Paper} elevation={1}>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{bgcolor:'#063455'}}>
                                            <TableCell sx={{ fontWeight: '600', color:'#fff' }}>
                                                SR
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', color:'#fff' }}>
                                                Order
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', color:'#fff' }}>
                                                Date
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', color:'#fff' }}>
                                                Time
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', color:'#fff' }}>
                                                Table
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', color:'#fff' }}>
                                                Restaurant
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', color:'#fff' }}>
                                                Customer Name
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', color:'#fff' }}>
                                                Customer
                                            </TableCell>
                                            {/* <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', textAlign: 'center' }}>
                                                ITEMS
                                            </TableCell> */}
                                            <TableCell sx={{ fontWeight: '600', color:'#fff' }}>
                                                Total Amount
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', color:'#fff' }}>
                                                Cashier
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', color:'#fff' }}>
                                                Status
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {runningOrders.map((order, index) => (
                                            <TableRow
                                                key={order.id}
                                                sx={{
                                                    '&:nth-of-type(odd)': {
                                                        backgroundColor: '#fafafa'
                                                    }
                                                }}
                                            >
                                                <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', fontWeight: 'bold' }}>
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', fontWeight: 'bold', color: '#0a3d62' }}>
                                                    {order.invoice_no || order.id}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center' }}>
                                                    {formatDate(order.created_at)}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center' }}>
                                                    {formatTime(order.created_at)}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', fontWeight: 'bold' }}>
                                                    {order.table?.name || order.table_id || 'N/A'}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.8rem' }}>
                                                    {order.tenant?.name || 'N/A'}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center' }}>
                                                    {order.member?.full_name || 'N/A'}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center' }}>
                                                    {order.member?.membership_no || 'N/A'}
                                                </TableCell>
                                                {/* <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', fontWeight: 'bold' }}>
                                                    {order.total_items || 'N/A'}
                                                </TableCell> */}
                                                <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', fontWeight: 'bold', color: '#4caf50' }}>
                                                    {formatCurrency(order.total_price || 0)}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center' }}>
                                                    {order.cashier_name || 'N/A'}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center' }}>
                                                    <Chip
                                                        label={order.status || 'Pending'}
                                                        color={getStatusColor(order.status)}
                                                        size="small"
                                                        sx={{ fontWeight: 'bold' }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <RestaurantIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary">
                                    No running orders found for today
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    All orders have been completed or there are no orders yet.
                                </Typography>
                            </Box>
                        )}

                        {/* Summary Footer */}
                        {runningOrders && runningOrders.length > 0 && (
                            <Box sx={{ mt: 4, p: 3, bgcolor: '#f0f7ff', borderRadius: 2, border: '2px solid #0a3d62' }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        textAlign: 'center',
                                        fontWeight: 'bold',
                                        color: '#0a3d62'
                                    }}
                                >
                                    TOTAL RUNNING ORDERS: {totalOrders} | TOTAL AMOUNT: {formatCurrency(totalAmount)}
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Box>
            </div>
        </>
    );
}
