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
import { Search } from '@mui/icons-material';
import PrintIcon from '@mui/icons-material/Print';
import FilterListIcon from '@mui/icons-material/FilterList';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { format } from 'date-fns';
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

export default function SalesSummaryWithItems({ salesData, startDate, endDate, grandTotalQty, grandTotalAmount, grandTotalDiscount, grandTotalSale, filters }) {
    // const [open, setOpen] = useState(true);
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
            {/* <Head title="Sales Summary (With Items)" /> */}
            {/* <SideNav open={open} setOpen={setOpen} /> */}

            <div
                style={{
                    minHeight: '100vh',
                    backgroundColor: "#f5f5f5"
                }}
            >
                <Box sx={{ p: 2 }}>
                    {/* Header */}
                    <Box sx={{ mb: 2 }}>
                        <Grid container justifyContent="space-between" alignItems="center">
                            <Grid item>
                                <Typography sx={{ fontWeight: '700', fontSize: '30px', color: '#063455' }}>
                                    Sales Summary (With Items)
                                </Typography>
                            </Grid>
                            <Grid item>
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
                            </Grid>
                        </Grid>
                        <Typography sx={{ fontWeight: '600', fontSize: '15px', color: '#063455' }}>
                            Invoice-wise detailed sales report with item breakdown
                        </Typography>
                    </Box>

                    {/* Filters */}
                    <Box sx={{ mt: 4, mb: 2 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            {/* <FilterListIcon color="primary" />
                            <Typography variant="h6">Filters</Typography> */}
                            {/* <TextField
                                label="Start Date"
                                type="date"
                                size="small"
                                value={dateFilters.start_date}
                                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            /> */}
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Start Date"
                                    format="DD/MM/YYYY"
                                    value={
                                        dateFilters.start_date
                                            ? dayjs(dateFilters.start_date)
                                            : null
                                    }
                                    onChange={(newValue) =>
                                        handleFilterChange(
                                            "start_date",
                                            newValue ? newValue.format("YYYY-MM-DD") : ""
                                        )
                                    }
                                    slotProps={{
                                        textField: {
                                            size: "small",
                                            InputProps: {
                                                sx: {
                                                    borderRadius: "16px",
                                                    "& fieldset": {
                                                        borderRadius: "16px",
                                                    },
                                                },
                                            },
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                            {/* <TextField
                                label="End Date"
                                type="date"
                                size="small"
                                value={dateFilters.end_date}
                                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            /> */}
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="End Date"
                                    format="DD/MM/YYYY"
                                    value={
                                        dateFilters.end_date
                                            ? dayjs(dateFilters.end_date)
                                            : null
                                    }
                                    onChange={(newValue) =>
                                        handleFilterChange(
                                            "end_date",
                                            newValue ? newValue.format("YYYY-MM-DD") : ""
                                        )
                                    }
                                    slotProps={{
                                        textField: {
                                            size: "small",
                                            InputProps: {
                                                sx: {
                                                    borderRadius: "16px",
                                                    "& fieldset": {
                                                        borderRadius: "16px",
                                                    },
                                                },
                                            },
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                            <Button
                                variant="contained"
                                startIcon={<Search />}
                                onClick={applyFilters}
                                sx={{
                                    backgroundColor: '#063455',
                                    color: 'white',
                                    borderRadius: '16px',
                                    textTransform: 'none',
                                    '&:hover': { backgroundColor: '#063455' }
                                }}
                            >
                                Search
                            </Button>
                        </Stack>
                    </Box>

                    {/* Summary Stats */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={3}>
                            <Card sx={{ borderRadius: '16px', bgcolor: '#063455' }}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography sx={{ fontWeight: '500', fontSize: '16px', color: '#fff' }}>
                                        Total Invoices
                                    </Typography>
                                    <Typography sx={{ fontWeight: '500', fontSize: '20px', color: '#fff' }}>
                                        {salesData?.length || 0}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Card sx={{ borderRadius: '16px', bgcolor: '#063455' }}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography sx={{ fontWeight: '500', fontSize: '16px', color: '#fff' }}>
                                        Total Quantity
                                    </Typography>
                                    <Typography sx={{ fontWeight: '500', fontSize: '20px', color: '#fff' }}>
                                        {grandTotalQty}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Card sx={{ borderRadius: '16px', bgcolor: '#063455' }}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography sx={{ fontWeight: '500', fontSize: '16px', color: '#fff' }}>
                                        Total Discount
                                    </Typography>
                                    <Typography sx={{ fontWeight: '500', fontSize: '20px', color: '#fff' }}>
                                        {formatCurrency(grandTotalDiscount)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Card sx={{ borderRadius: '16px', bgcolor: '#063455' }}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography sx={{ fontWeight: '500', fontSize: '16px', color: '#fff' }}>
                                        Total Sale
                                    </Typography>
                                    <Typography sx={{ fontWeight: '500', fontSize: '20px', color: '#fff' }}>
                                        {formatCurrency(grandTotalSale)}
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
                                                    <TableRow sx={{bgcolor:'#063455'}}>
                                                        <TableCell sx={{ fontWeight: '600', color:'#fff' }}>Item Code</TableCell>
                                                        <TableCell sx={{ fontWeight: '600', color:'#fff' }}>Item Name</TableCell>
                                                        <TableCell sx={{ fontWeight: '600', color:'#fff', }}>QTY Sold</TableCell>
                                                        <TableCell sx={{ fontWeight: '600', color:'#fff' }}>Sale Price</TableCell>
                                                        <TableCell sx={{ fontWeight: '600', color:'#fff' }}>Sub Total</TableCell>
                                                        <TableCell sx={{ fontWeight: '600', color:'#fff' }}>Discount</TableCell>
                                                        <TableCell sx={{ fontWeight: '600', color:'#fff' }}>Total Sale</TableCell>
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
                                                    <TableRow sx={{ backgroundColor: '#063455' }}>
                                                        <TableCell sx={{ fontWeight: '600', color:'#fff' }}>TOTAL:</TableCell>
                                                        <TableCell sx={{ fontWeight: '600', color:'#fff' }}></TableCell>
                                                        <TableCell sx={{ fontWeight: '600', color:'#fff' }}>{invoice.total_qty}</TableCell>
                                                        <TableCell sx={{ fontWeight: '600', color:'#fff' }}></TableCell>
                                                        <TableCell sx={{ fontWeight: '600', color:'#fff' }}>{formatCurrency(invoice.total_amount)}</TableCell>
                                                        <TableCell sx={{ fontWeight: '600', color:'#fff' }}>{formatCurrency(invoice.total_discount)}</TableCell>
                                                        <TableCell sx={{ fontWeight: '600', color:'#fff' }}>{formatCurrency(invoice.total_sale)}</TableCell>
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
