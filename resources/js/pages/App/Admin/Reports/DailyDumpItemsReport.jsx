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
import { Search } from '@mui/icons-material';
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

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
            {/* <Head title="Daily Dump Items Report" /> */}
            {/* <SideNav open={open} setOpen={setOpen} /> */}

            <div
                style={{
                    minHeight: '100vh',
                    backgroundColor: '#f5f5f5',
                    overflowX: 'hidden'
                }}
            >
                <Box sx={{ p: 2 }}>
                    {/* Header */}
                    <Box sx={{ mb: 2 }}>
                        <Grid container justifyContent="space-between" alignItems="center">
                            <Grid item>
                                <Typography sx={{ fontWeight: '700', fontSize: '30px', color: '#063455' }}>
                                    Daily Dump Items Report
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
                            Cancelled and dumped items tracking report
                        </Typography>
                    </Box>

                    {/* Filters */}
                    <Box sx={{ mb: 2 }}>
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
                        <Grid item xs={12} md={4}>
                            <Card sx={{ borderRadius: '16px', bgcolor: '#063455' }}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography sx={{ fontWeight: '500', fontSize: '16px', color: '#fff' }}>
                                        Dumped Items
                                    </Typography>
                                    <Typography sx={{ fontWeight: '500', fontSize: '20px', color: '#fff' }}>
                                        {dumpItemsData?.length || 0}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ borderRadius: '16px', bgcolor: '#063455' }}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography sx={{ fontWeight: '500', fontSize: '16px', color: '#fff' }}>
                                        Total Quantity
                                    </Typography>
                                    <Typography sx={{ fontWeight: '500', fontSize: '20px', color: '#fff' }}>
                                        {formatCurrency(totalQuantity)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ borderRadius: '16px', bgcolor: '#063455' }}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography sx={{ fontWeight: '500', fontSize: '16px', color: '#fff' }}>
                                        Total Food Value
                                    </Typography>
                                    <Typography sx={{ fontWeight: '500', fontSize: '20px', color: '#fff' }}>
                                        {formatCurrency(totalFoodValue)}
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
                            <TableContainer component={Paper} elevation={1} style={{ overflowX: 'auto' }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: '#063455' }}>
                                            <TableCell sx={{ fontWeight: '600', color:'#fff' }}>
                                                Invoice KOT
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', color:'#fff' }}>
                                                Table
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', color:'#fff' }}>
                                                Date
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', color:'#fff' }}>
                                                Item Code
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', color:'#fff' }}>
                                                Item Name
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', color:'#fff' }}>
                                                Quantity
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', color:'#fff' }}>
                                                Status
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', color:'#fff' }}>
                                                Instructions
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', color:'#fff' }}>
                                                Reason
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', color:'#fff' }}>
                                                Remarks
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', color:'#fff' }}>
                                                Sale Price
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', color:'#fff' }}>
                                                Food Value
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', color:'#fff' }}>
                                                Cancelled By
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
                                        <TableRow sx={{ backgroundColor: '#063455', color: 'white' }}>
                                            <TableCell colSpan={5} sx={{ fontWeight: '600',color: 'white'}}>
                                                GRAND TOTAL:
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', color: 'white', }}>
                                                {formatCurrency(totalQuantity)}
                                            </TableCell>
                                            <TableCell colSpan={5} sx={{ fontWeight: '600', color: 'white'}}>
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', color:'white'}}>
                                                {formatCurrency(totalSalePrice)}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', color: 'white' }}>
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
