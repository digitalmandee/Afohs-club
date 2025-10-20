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
import SideNav from '@/components/App/AdminSideBar/SideNav';

export default function RunningSalesOrders({ runningOrders, totalOrders, totalAmount, reportDate }) {
    const [open, setOpen] = useState(false);

    const drawerWidthOpen = 280;
    const drawerWidthClosed = 110;

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
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
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
            <Head title="Running Sales Orders" />
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
                                    Running Sales Orders
                                </Typography>
                                <Typography variant="h6" color="text.secondary">
                                    Today's Active Orders - {formatDate(reportDate)}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button
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
                                    </Button>
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
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Summary Stats */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                                        {totalOrders}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Running Orders
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                                        {formatCurrency(totalAmount)}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Total Amount
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <AccessTimeIcon sx={{ fontSize: 40, color: '#0a3d62', mb: 1 }} />
                                    <Typography variant="body1" color="text.secondary">
                                        Live Report
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Orders Table */}
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
                            RUNNING SALES ORDERS
                        </Typography>

                        {runningOrders && Array.isArray(runningOrders) && runningOrders.length > 0 ? (
                            <TableContainer component={Paper} elevation={1}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', textAlign: 'center' }}>
                                                SR
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', textAlign: 'center' }}>
                                                ORDER#
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', textAlign: 'center' }}>
                                                DATE
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', textAlign: 'center' }}>
                                                TIME
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', textAlign: 'center' }}>
                                                TABLE
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                                                RESTAURANT
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', textAlign: 'center' }}>
                                                CUSTOMER NAME
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', textAlign: 'center' }}>
                                                CUSTOMER #
                                            </TableCell>
                                            {/* <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', textAlign: 'center' }}>
                                                ITEMS
                                            </TableCell> */}
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', textAlign: 'center' }}>
                                                TOTAL AMOUNT
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', textAlign: 'center' }}>
                                                CASHIER
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', textAlign: 'center' }}>
                                                STATUS
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
