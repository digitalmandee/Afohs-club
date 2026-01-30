import { useState, useMemo, useEffect, useCallback } from 'react';
import { Box, Button, TextField, FormControl, Select, MenuItem, Grid, Typography, Autocomplete, Chip } from '@mui/material';
import axios from 'axios';
import debounce from 'lodash.debounce';
import { styled } from '@mui/material/styles';

const RoundedTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '16px',
    },
});

const MenuFilter = ({ categories = [], onProductsLoaded, onLoadingChange }) => {
    // Filter states
    const [nameFilter, setNameFilter] = useState('');
    const [menuCodeFilter, setMenuCodeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Debounced fetch function
    const fetchProducts = useCallback(
        debounce(async (filters) => {
            setIsLoading(true);
            onLoadingChange?.(true);

            try {
                const params = {};
                if (filters.name) params.name = filters.name;
                if (filters.menu_code) params.menu_code = filters.menu_code;
                if (filters.status && filters.status !== 'all') params.status = filters.status;
                if (filters.category_ids && filters.category_ids.length > 0) params.category_ids = filters.category_ids.join(',');

                const response = await axios.get(route('api.products.filter'), { params });

                if (response.data.success) {
                    onProductsLoaded?.(response.data.products);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setIsLoading(false);
                onLoadingChange?.(false);
            }
        }, 400),
        [onProductsLoaded, onLoadingChange],
    );

    // Auto-fetch on filter changes
    useEffect(() => {
        fetchProducts({
            name: nameFilter,
            menu_code: menuCodeFilter,
            status: statusFilter,
            category_ids: categoryFilter,
        });
    }, [nameFilter, menuCodeFilter, statusFilter, categoryFilter]);

    // Reset all filters
    const handleReset = () => {
        setNameFilter('');
        setMenuCodeFilter('');
        setStatusFilter('all');
        setCategoryFilter([]);
    };

    return (
        <Box sx={{ mb: 3, mt: 3, boxShadow: 'none' }}>
            <Grid container spacing={2} alignItems="center">
                {/* Name Filter */}
                <Grid item xs={12} md={2.5}>
                    <RoundedTextField fullWidth size="small" label="Product Name" placeholder="Search name..." value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} />
                </Grid>

                {/* Menu Code Filter */}
                <Grid item xs={12} md={2.5}>
                    <RoundedTextField fullWidth size="small" label="Item Code" placeholder="Search code..." value={menuCodeFilter} onChange={(e) => setMenuCodeFilter(e.target.value)} />
                </Grid>

                {/* Status Filter */}
                <Grid item xs={12} md={2}>
                    <FormControl
                        fullWidth
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '16px',
                            },
                        }}
                    >
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            displayEmpty
                            MenuProps={{
                                sx: {
                                    '& .MuiPaper-root': {
                                        borderRadius: '16px',
                                        boxShadow: 'none !important',
                                        marginTop: '4px',
                                    },
                                    '& .MuiMenuItem-root': {
                                        borderRadius: '16px',
                                        '&:hover': {
                                            backgroundColor: '#063455 !important',
                                            color: '#fff !important',
                                        },
                                    },
                                },
                            }}
                        >
                            <MenuItem value="all">All Status</MenuItem>
                            <MenuItem value="active">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#2e7d32' }} />
                                    Active
                                </Box>
                            </MenuItem>
                            <MenuItem value="inactive">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#d32f2f' }} />
                                    Inactive
                                </Box>
                            </MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={2.5}>
                    <Autocomplete
                        multiple
                        size="small"
                        options={categories}
                        getOptionLabel={(option) => option.name || ''}
                        value={categories.filter((cat) => categoryFilter.includes(cat.id))}
                        onChange={(event, newValue) => {
                            setCategoryFilter(newValue.map((cat) => cat.id));
                        }}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    {...getTagProps({ index })}
                                    key={option.id}
                                    label={option.name}
                                    size="small"
                                    sx={{
                                        backgroundColor: '#063455',
                                        color: '#fff',
                                        '& .MuiChip-deleteIcon': {
                                            color: '#fff',
                                        },
                                    }}
                                />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder={categoryFilter.length === 0 ? 'All Categories' : ''}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '16px',
                                    },
                                }}
                            />
                        )}
                        sx={{
                            '& .MuiAutocomplete-tag': {
                                margin: '2px',
                            },
                        }}
                    />
                </Grid>

                {/* Reset Button */}
                <Grid item xs={12} md={2.5} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button
                        variant="outlined"
                        onClick={handleReset}
                        disabled={isLoading}
                        sx={{
                            borderRadius: '16px',
                            textTransform: 'none',
                            color: '#063455',
                            border: '1px solid #063455',
                            px: 4,
                            '&:hover': {
                                backgroundColor: 'rgba(6, 52, 85, 0.04)',
                            },
                        }}
                    >
                        Reset
                    </Button>
                    {isLoading && (
                        <Typography variant="caption" color="text.secondary">
                            Loading...
                        </Typography>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
};

export default MenuFilter;
