import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { router, usePage } from '@inertiajs/react';
import { Autocomplete, TextField, Chip, Box, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Button, Grid } from '@mui/material';
import { toWords } from 'number-to-words';
import MaintenanceFeeFilter from './MaintenanceFeeFilter';
import { Print, ArrowBack } from '@mui/icons-material';

const MaintenanceFeeRevenue = () => {
    // Modal state
    // const [open, setOpen] = useState(true);

    const { categories, statistics, filters } = usePage().props;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    return (
        <>
            {/* <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                    backgroundColor: '#F6F6F6',
                }}
            > */}
                <div className="container-fluid px-4 py-4" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
                    {/* Top Bar */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        {/* Left section (Arrow + Title) */}
                        <div className="d-flex align-items-center">
                            <IconButton onClick={() => window.history.back()}>
                                <ArrowBack />
                            </IconButton>
                            <Typography
                                sx={{
                                    fontWeight: 500,
                                    fontSize: '30px',
                                    color: '#063455',
                                    ml: 1, // adds left margin for spacing between icon and text
                                }}
                            >
                                Maintenance Fee Revenue
                            </Typography>
                        </div>

                        {/* Right section (Print button) */}
                        <Button
                            variant="contained"
                            startIcon={<Print />}
                            onClick={() => {
                                const currentUrl = new URL(window.location.href);
                                const printUrl = currentUrl.pathname + '/print' + currentUrl.search;
                                window.open(printUrl, '_blank');
                            }}
                            sx={{
                                backgroundColor: '#063455',
                                color: 'white',
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: '#052d47',
                                },
                            }}
                        >
                            Print
                        </Button>
                    </div>

                    {/* Filter Modal */}
                    <MaintenanceFeeFilter filters={filters} />

                    {/* Revenue Details Table */}
                    <Box sx={{ mb: 3 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '20px', color: '#063455', mb: 2 }}>
                            Maintenance Fee Revenue Details
                        </Typography>
                        <TableContainer component={Paper} sx={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderRadius: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow style={{ backgroundColor: '#063455' }}>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>SR #</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Category</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Code</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Total Members</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Paying Members</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Payment Rate</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Total Revenue</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Avg per Member</TableCell>
                                        <TableCell sx={{ color: 'white', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Amount In Words</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {categories.map((categoryFee, index) => {
                                        const paymentRate = categoryFee.total_members > 0
                                            ? ((categoryFee.members_with_maintenance / categoryFee.total_members) * 100).toFixed(1)
                                            : 0;

                                        return (
                                            <TableRow
                                                key={categoryFee.id}
                                                sx={{
                                                    '&:nth-of-type(odd)': { backgroundColor: '#f9fafb' },
                                                    '&:hover': { backgroundColor: '#f3f4f6' },
                                                    borderBottom: '1px solid #e5e7eb'
                                                }}
                                            >
                                                <TableCell sx={{ color: '#374151', fontWeight: 500, fontSize: '14px' }}>
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell sx={{ color: '#374151', fontWeight: 600, fontSize: '14px' }}>
                                                    {categoryFee.name}
                                                </TableCell>
                                                <TableCell sx={{ color: '#6B7280', fontWeight: 400, fontSize: '14px' }}>
                                                    {categoryFee.code}
                                                </TableCell>
                                                <TableCell sx={{ color: '#374151', fontWeight: 500, fontSize: '14px' }}>
                                                    {categoryFee.total_members}
                                                </TableCell>
                                                <TableCell sx={{ color: '#059669', fontWeight: 600, fontSize: '14px' }}>
                                                    {categoryFee.members_with_maintenance}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '14px' }}>
                                                    <Chip
                                                        label={`${paymentRate}%`}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: paymentRate >= 80 ? '#dcfce7' : paymentRate >= 50 ? '#fef3c7' : '#fecaca',
                                                            color: paymentRate >= 80 ? '#059669' : paymentRate >= 50 ? '#d97706' : '#dc2626',
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ color: '#dc2626', fontWeight: 700, fontSize: '14px' }}>
                                                    {formatCurrency(categoryFee.total_maintenance_fee).replace('PKR', 'Rs.')}
                                                </TableCell>
                                                <TableCell sx={{ color: '#7c3aed', fontWeight: 600, fontSize: '14px' }}>
                                                    {formatCurrency(categoryFee.average_fee_per_member).replace('PKR', 'Rs.')}
                                                </TableCell>
                                                <TableCell sx={{ color: '#6B7280', fontWeight: 400, fontSize: '12px', fontStyle: 'italic' }}>
                                                    {categoryFee.total_maintenance_fee > 0 ? toWords(categoryFee.total_maintenance_fee) : 'Zero'}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}

                                    {/* Footer Row */}
                                    <TableRow sx={{ backgroundColor: '#063455', borderTop: '2px solid #374151' }}>
                                        <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '16px' }} colSpan={3}>
                                            TOTAL
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '16px' }}>
                                            {statistics?.total_members || 0}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '16px' }}>
                                            {statistics?.total_members_with_maintenance || 0}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '16px' }}>
                                            {statistics?.total_members > 0
                                                ? `${((statistics.total_members_with_maintenance / statistics.total_members) * 100).toFixed(1)}%`
                                                : '0%'
                                            }
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '16px' }}>
                                            {formatCurrency(statistics?.total_maintenance_revenue || 0).replace('PKR', 'Rs.')}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '16px' }}>
                                            {formatCurrency(statistics?.average_revenue_per_member || 0).replace('PKR', 'Rs.')}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '14px', textTransform: 'capitalize', fontStyle: 'italic' }}>
                                            {statistics?.total_maintenance_revenue > 0 ? toWords(statistics.total_maintenance_revenue) : 'Zero'}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>


                    {/* Statistics Cards */}
                    <Box sx={{ mb: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={3}>
                                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#dbeafe', borderRadius: 2 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#0ea5e9' }}>
                                        {statistics?.total_members || 0}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#0284c7', fontWeight: 600 }}>
                                        Total Members
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#dcfce7', borderRadius: 2 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#059669' }}>
                                        {statistics?.total_members_with_maintenance || 0}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#047857', fontWeight: 600 }}>
                                        Paying Members
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#fef3c7', borderRadius: 2 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                                        {statistics?.total_members > 0
                                            ? `${((statistics.total_members_with_maintenance / statistics.total_members) * 100).toFixed(1)}%`
                                            : '0%'
                                        }
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#d97706', fontWeight: 600 }}>
                                        Payment Rate
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#fecaca', borderRadius: 2 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#dc2626' }}>
                                        {formatCurrency(statistics?.total_maintenance_revenue || 0).replace('PKR', 'Rs.')}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#b91c1c', fontWeight: 600 }}>
                                        Total Revenue
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </div>
            {/* </div> */}
        </>
    );
};

export default MaintenanceFeeRevenue;
