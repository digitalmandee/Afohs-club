import React, { useState } from 'react';
import { Box, Typography, Button, Card, CardContent, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, TextField, MenuItem, InputAdornment, IconButton, Tooltip, Alert } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon, AccessTime as AccessTimeIcon } from '@mui/icons-material';
import { router } from '@inertiajs/react';

const VoucherDashboard = ({ vouchers, stats, filters }) => {
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [typeFilter, setTypeFilter] = useState(filters?.type || 'all');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');

    // Handle search
    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (typeFilter !== 'all') params.set('type', typeFilter);
        if (statusFilter !== 'all') params.set('status', statusFilter);

        router.visit(`${route('vouchers.dashboard')}?${params.toString()}`);
    };

    // Handle filter reset
    const handleReset = () => {
        setSearchQuery('');
        setTypeFilter('all');
        setStatusFilter('all');
        router.visit(route('vouchers.dashboard'));
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'success';
            case 'inactive':
                return 'default';
            case 'expired':
                return 'error';
            case 'used':
                return 'info';
            default:
                return 'default';
        }
    };

    // Get voucher type color
    const getTypeColor = (type) => {
        return type === 'member' ? 'primary' : 'secondary';
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
        })
            .format(amount)
            .replace('PKR', 'Rs');
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Mark voucher as used
    const handleMarkAsUsed = (voucherId) => {
        if (confirm('Are you sure you want to mark this voucher as used?')) {
            router.post(route('vouchers.mark-used', voucherId));
        }
    };

    // Delete voucher
    const handleDelete = (voucherId) => {
        if (confirm('Are you sure you want to delete this voucher?')) {
            router.delete(route('vouchers.destroy', voucherId));
        }
    };

    return (
        <Box sx={{ p: 3 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5" sx={{color:'#063455', fontWeight:'600'}}>
                            Voucher Management
                        </Typography>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => router.visit(route('vouchers.create'))} sx={{ backgroundColor: '#063455' }}>
                            Create Voucher
                        </Button>
                    </Box>

                    {/* Statistics Cards */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Total Vouchers
                                    </Typography>
                                    <Typography variant="h4" component="div">
                                        {stats.total_vouchers}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Active Vouchers
                                    </Typography>
                                    <Typography variant="h4" component="div" color="success.main">
                                        {stats.active_vouchers}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Used Vouchers
                                    </Typography>
                                    <Typography variant="h4" component="div" color="info.main">
                                        {stats.used_vouchers}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Total Value
                                    </Typography>
                                    <Typography variant="h4" component="div" color="primary.main">
                                        {formatCurrency(stats.total_value)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Additional Stats */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Member Vouchers
                                    </Typography>
                                    <Typography variant="h5" component="div" color="primary.main">
                                        {stats.member_vouchers}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Employee Vouchers
                                    </Typography>
                                    <Typography variant="h5" component="div" color="secondary.main">
                                        {stats.employee_vouchers}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Expired Vouchers
                                    </Typography>
                                    <Typography variant="h5" component="div" color="error.main">
                                        {stats.expired_vouchers}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Active Value
                                    </Typography>
                                    <Typography variant="h5" component="div" color="success.main">
                                        {formatCurrency(stats.active_value)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Filters */}
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        placeholder="Search vouchers..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <TextField fullWidth select label="Type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                                        <MenuItem value="all">All Types</MenuItem>
                                        <MenuItem value="member">Member</MenuItem>
                                        <MenuItem value="employee">Employee</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <TextField fullWidth select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                        <MenuItem value="all">All Status</MenuItem>
                                        <MenuItem value="active">Active</MenuItem>
                                        <MenuItem value="inactive">Inactive</MenuItem>
                                        <MenuItem value="expired">Expired</MenuItem>
                                        <MenuItem value="used">Used</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <Button fullWidth variant="contained" onClick={handleSearch} sx={{ backgroundColor: '#063455' }}>
                                        Search
                                    </Button>
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <Button fullWidth variant="outlined" onClick={handleReset}>
                                        Reset
                                    </Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Vouchers Table */}
                    <Card>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                        <TableCell><strong>Voucher Code</strong></TableCell>
                                        <TableCell><strong>Name</strong></TableCell>
                                        <TableCell><strong>Type</strong></TableCell>
                                        <TableCell><strong>Recipient</strong></TableCell>
                                        <TableCell><strong>Amount</strong></TableCell>
                                        <TableCell><strong>Valid Period</strong></TableCell>
                                        <TableCell><strong>Status</strong></TableCell>
                                        <TableCell><strong>Actions</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {vouchers.data.map((voucher) => (
                                        <TableRow key={voucher.id} hover>
                                            <TableCell>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    {voucher.voucher_code}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {voucher.voucher_name}
                                                </Typography>
                                                {voucher.description && (
                                                    <Typography variant="caption" color="textSecondary">
                                                        {voucher.description}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={voucher.voucher_type} 
                                                    color={getTypeColor(voucher.voucher_type)} 
                                                    size="small" 
                                                    sx={{ textTransform: 'capitalize' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {voucher.recipient}
                                                </Typography>
                                                {voucher.voucher_type === 'member' && voucher.member && (
                                                    <Typography variant="caption" color="textSecondary">
                                                        ID: {voucher.member.membership_no || 'N/A'}
                                                    </Typography>
                                                )}
                                                {voucher.voucher_type === 'employee' && voucher.employee && (
                                                    <Typography variant="caption" color="textSecondary">
                                                        ID: {voucher.employee.employee_id || 'N/A'}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="bold" color="primary">
                                                    {formatCurrency(voucher.amount)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" color="textSecondary">
                                                    {formatDate(voucher.valid_from)} - {formatDate(voucher.valid_to)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={voucher.status} 
                                                    color={getStatusColor(voucher.status)} 
                                                    size="small" 
                                                    sx={{ textTransform: 'capitalize' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Tooltip title="View Details">
                                                        <IconButton size="small" onClick={() => router.visit(route('vouchers.show', voucher.id))}>
                                                            <ViewIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Edit">
                                                        <IconButton size="small" onClick={() => router.visit(route('vouchers.edit', voucher.id))}>
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {voucher.status === 'active' && !voucher.is_used && (
                                                        <Tooltip title="Mark as Used">
                                                            <IconButton
                                                                size="small"
                                                                color="success"
                                                                onClick={() => handleMarkAsUsed(voucher.id)}
                                                            >
                                                                <CheckCircleIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    <Tooltip title="Delete">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleDelete(voucher.id)}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {vouchers.data.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                                                <Typography color="textSecondary">No vouchers found</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        {vouchers.links && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                {vouchers.links.map((link, index) => (
                                    <Button 
                                        key={index} 
                                        onClick={() => link.url && router.visit(link.url)} 
                                        disabled={!link.url} 
                                        variant={link.active ? 'contained' : 'outlined'} 
                                        size="small" 
                                        sx={{ mx: 0.5, minWidth: '36px' }}
                                    >
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    </Button>
                                ))}
                            </Box>
                        )}
                    </Card>
        </Box>
    );
};

export default VoucherDashboard;
