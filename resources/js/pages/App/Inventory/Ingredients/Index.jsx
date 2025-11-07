import React, { useState } from 'react';
import { Box, Typography, Button, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, TextField, MenuItem, Grid, InputAdornment, IconButton, Tooltip } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon, AddBox as AddStockIcon, Warning as WarningIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { router } from '@inertiajs/react';
import SideNav from '@/components/App/SideBar/SideNav';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const IngredientsIndex = ({ ingredients, stats, filters }) => {
    const [open, setOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const [stockFilter, setStockFilter] = useState(filters?.stock_level || 'all');

    // Handle search
    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (stockFilter !== 'all') params.set('stock_level', stockFilter);

        router.visit(`${route('ingredients.index')}?${params.toString()}`);
    };

    // Handle filter reset
    const handleReset = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setStockFilter('all');
        router.visit(route('ingredients.index'));
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
            default:
                return 'default';
        }
    };

    // Get stock level color and icon
    const getStockInfo = (remaining, total) => {
        const percentage = (remaining / total) * 100;
        if (remaining <= 0) {
            return { color: 'error', icon: <WarningIcon />, text: 'Out of Stock' };
        } else if (percentage <= 20) {
            return { color: 'warning', icon: <WarningIcon />, text: 'Low Stock' };
        } else {
            return { color: 'success', icon: <CheckCircleIcon />, text: 'In Stock' };
        }
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

    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                    padding: '2rem',
                }}
            >
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" fontWeight="bold">
                        Ingredients Management
                    </Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => router.visit(route('ingredients.create'))} sx={{ backgroundColor: '#063455' }}>
                        Add Ingredient
                    </Button>
                </Box>

                {/* Statistics Cards */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Total Ingredients
                                </Typography>
                                <Typography variant="h4" component="div">
                                    {stats.total_ingredients}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Active Ingredients
                                </Typography>
                                <Typography variant="h4" component="div" color="success.main">
                                    {stats.active_ingredients}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Low Stock
                                </Typography>
                                <Typography variant="h4" component="div" color="warning.main">
                                    {stats.low_stock}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Out of Stock
                                </Typography>
                                <Typography variant="h4" component="div" color="error.main">
                                    {stats.out_of_stock}
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
                                    placeholder="Search ingredients..."
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
                                <TextField fullWidth select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                    <MenuItem value="all">All Status</MenuItem>
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="inactive">Inactive</MenuItem>
                                    <MenuItem value="expired">Expired</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <TextField fullWidth select label="Stock Level" value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
                                    <MenuItem value="all">All Stock</MenuItem>
                                    <MenuItem value="available">Available</MenuItem>
                                    <MenuItem value="low">Low Stock</MenuItem>
                                    <MenuItem value="out">Out of Stock</MenuItem>
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

                {/* Ingredients Table */}
                <Card>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableCell>
                                        <strong>Name</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Total Quantity</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Used</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Remaining</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Unit</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Cost/Unit</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Stock Status</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Status</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Actions</strong>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {ingredients.data.map((ingredient) => {
                                    const stockInfo = getStockInfo(ingredient.remaining_quantity, ingredient.total_quantity);
                                    return (
                                        <TableRow key={ingredient.id} hover>
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight="bold">
                                                        {ingredient.name}
                                                    </Typography>
                                                    {ingredient.description && (
                                                        <Typography variant="caption" color="textSecondary">
                                                            {ingredient.description}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>{ingredient.total_quantity}</TableCell>
                                            <TableCell>{ingredient.used_quantity}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {stockInfo.icon}
                                                    <Typography color={`${stockInfo.color}.main`}>{ingredient.remaining_quantity}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{ingredient.unit}</TableCell>
                                            <TableCell>{ingredient.cost_per_unit ? formatCurrency(ingredient.cost_per_unit) : 'N/A'}</TableCell>
                                            <TableCell>
                                                <Chip label={stockInfo.text} color={stockInfo.color} size="small" />
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={ingredient.status} color={getStatusColor(ingredient.status)} size="small" sx={{ textTransform: 'capitalize' }} />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Tooltip title="View Details">
                                                        <IconButton size="small" onClick={() => router.visit(route('ingredients.show', ingredient.id))}>
                                                            <ViewIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Edit">
                                                        <IconButton size="small" onClick={() => router.visit(route('ingredients.edit', ingredient.id))}>
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Add Stock">
                                                        <IconButton
                                                            size="small"
                                                            color="success"
                                                            onClick={() => router.visit(route('ingredients.add-stock.form', ingredient.id))}
                                                        >
                                                            <AddStockIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => {
                                                                if (confirm('Are you sure you want to delete this ingredient?')) {
                                                                    router.delete(route('ingredients.destroy', ingredient.id));
                                                                }
                                                            }}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {ingredients.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4 }}>
                                            <Typography color="textSecondary">No ingredients found</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination */}
                    {ingredients.links && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                            {ingredients.links.map((link, index) => (
                                <Button key={index} onClick={() => link.url && router.visit(link.url)} disabled={!link.url} variant={link.active ? 'contained' : 'outlined'} size="small" sx={{ mx: 0.5, minWidth: '36px' }}>
                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                </Button>
                            ))}
                        </Box>
                    )}
                </Card>
            </div>
        </>
    );
};

IngredientsIndex.layout = (page) => page;
export default IngredientsIndex;
