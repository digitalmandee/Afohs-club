'use client';

import UserAutocomplete from '@/components/UserAutocomplete';
import { useOrderStore } from '@/stores/useOrderStore';
import { router } from '@inertiajs/react';
import { routeNameForContext } from '@/lib/utils';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import SearchIcon from '@mui/icons-material/Search';
import { Autocomplete, Box, Button, CircularProgress, FormControl, FormControlLabel, Grid, IconButton, InputAdornment, InputBase, InputLabel, MenuItem, Paper, Radio, RadioGroup, Select, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

const DineDialog = ({ guestTypes, floorTables }) => {
    const { orderDetails, handleOrderDetailChange } = useOrderStore();

    const [filterOption, setFilterOption] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [waiters, setWaiters] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);

    const handleAutocompleteChange = (event, value, field) => {
        handleOrderDetailChange(field, value);
        // setErrors({ ...errors, [field]: '' }); // Clear error on change
    };

    const handleMembershipType = (value) => {
        handleOrderDetailChange('membership_type', value);
        handleOrderDetailChange('member', {});
    };
    const handleMemberType = (value) => {
        handleOrderDetailChange('member_type', value);
        handleOrderDetailChange('member', {});
    };

    const handleFilterOptionChange = (event, newFilterOption) => {
        if (newFilterOption !== null) {
            setFilterOption(newFilterOption);
        }
    };

    const handleFloorChange = (value) => {
        handleOrderDetailChange('floor', value);
        handleOrderDetailChange('table', '');
    };

    useEffect(() => {
        axios.get(route(routeNameForContext('waiters.all'))).then((res) => setWaiters(res.data.waiters));
    }, ['']);

    const currentFloor = floorTables.find((f) => f.id === orderDetails.floor);

    const filteredTables = currentFloor?.tables?.length
        ? currentFloor.tables.filter((table) => {
              if (filterOption === 'available' && !table.is_available) return false;
              const keyword = searchTerm.toLowerCase();
              return table.table_no.toLowerCase().includes(keyword) || String(table.capacity).includes(keyword);
          })
        : [];

    const isDisabled = !orderDetails.member || Object.keys(orderDetails.member).length === 0 || !orderDetails.waiter || typeof orderDetails.waiter !== 'object' || !orderDetails.waiter.id || !orderDetails.table;

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F10' && !isDisabled) {
                e.preventDefault();
                router.visit(route(routeNameForContext('order.menu')));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isDisabled, router]);

    return (
        <Box>
            <Box sx={{ px: 2, mb: 2 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: '',
                        bgcolor: '#F6F6F6',
                        px: 2,
                        py: 1.5,
                        borderRadius: 1,
                    }}
                >
                    <Typography sx={{ fontSize: '14px', color: '#7F7F7F' }}>Order ID</Typography>
                    <Typography
                        sx={{
                            fontWeight: 'bold',
                            fontSize: '14px',
                            color: '#063455',
                            marginLeft: 2,
                        }}
                    >
                        #{orderDetails.order_no}
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ px: 2, mb: 2 }}>
                <FormControl component="fieldset">
                    <Grid item xs={12}>
                        <RadioGroup
                            row
                            value={orderDetails.member_type}
                            onChange={(e) => {
                                handleOrderDetailChange('member_type', e.target.value);
                                handleOrderDetailChange('member', {}); // Clear member on type change
                                setOptions([]); // Clear options
                            }}
                            sx={{ gap: 1 }}
                        >
                            <FormControlLabel value="0" control={<Radio />} label="Member" sx={{ border: orderDetails.member_type == '0' ? '1px solid #A27B5C' : '1px solid #E3E3E3', borderRadius: 1, px: 1, m: 0, bgcolor: orderDetails.member_type == '0' ? '#FCF7EF' : 'transparent' }} />
                            <FormControlLabel value="2" control={<Radio />} label="Corporate Member" sx={{ border: orderDetails.member_type == '2' ? '1px solid #A27B5C' : '1px solid #E3E3E3', borderRadius: 1, px: 1, m: 0, bgcolor: orderDetails.member_type == '2' ? '#FCF7EF' : 'transparent' }} />
                            <FormControlLabel value="3" control={<Radio />} label="Employee" sx={{ border: orderDetails.member_type == '3' ? '1px solid #A27B5C' : '1px solid #E3E3E3', borderRadius: 1, px: 1, m: 0, bgcolor: orderDetails.member_type == '3' ? '#FCF7EF' : 'transparent' }} />
                            {guestTypes.map((type) => (
                                <FormControlLabel
                                    key={type.id}
                                    value={`guest-${type.id}`}
                                    control={<Radio />}
                                    label={type.name}
                                    sx={{
                                        border: orderDetails.member_type == `guest-${type.id}` ? '1px solid #A27B5C' : '1px solid #E3E3E3',
                                        borderRadius: 1,
                                        px: 1,
                                        m: 0,
                                        bgcolor: orderDetails.member_type == `guest-${type.id}` ? '#FCF7EF' : 'transparent',
                                    }}
                                />
                            ))}
                        </RadioGroup>
                    </Grid>
                </FormControl>
            </Box>

            {/* Customer Information */}
            <Grid container spacing={2} sx={{ px: 2, mb: 2 }}>
                <Grid item xs={12}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Customer Name
                    </Typography>
                    <UserAutocomplete routeUri={route(routeNameForContext('api.users.global-search'))} memberType={orderDetails.member_type} value={orderDetails.member && orderDetails.member.id ? orderDetails.member : null} onChange={(newValue) => handleOrderDetailChange('member', newValue || {})} label="Member / Guest Name" placeholder="Search by Name, ID, or CNIC..." />
                </Grid>
                <Grid item xs={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Customer Qty
                    </Typography>
                    <Box sx={{ display: 'flex' }}>
                        <TextField size="small" value={orderDetails.person_count} onChange={(e) => handleOrderDetailChange('person_count', e.target.value)} min={1} type="number" sx={{ width: '60%' }} />
                        <Button
                            variant="outlined"
                            sx={{
                                ml: 1,
                                textTransform: 'none',
                                color: '#666',
                                borderColor: '#ddd',
                            }}
                        >
                            Person
                        </Button>
                    </Box>
                </Grid>
            </Grid>

            {/* Waiters */}
            <Box sx={{ px: 2, mb: 2 }}>
                <Autocomplete
                    fullWidth
                    size="small"
                    options={waiters}
                    value={orderDetails.waiter}
                    getOptionLabel={(option) => option?.name || ''}
                    onChange={(event, value) => handleAutocompleteChange(event, value, 'waiter')}
                    loading={searchLoading}
                    renderInput={(params) => <TextField {...params} fullWidth sx={{ p: 0 }} placeholder="Select Waiter" variant="outlined" />}
                    filterOptions={(options, state) => options.filter((option) => `${option.name} ${option.email} ${option.employee_id}`.toLowerCase().includes(state.inputValue.toLowerCase()))}
                    renderOption={(props, option) => {
                        const getStatusChipStyles = (status) => {
                            const s = (status || '').toLowerCase();
                            if (s === 'active') return { backgroundColor: '#e8f5e9', color: '#2e7d32' };
                            if (s === 'suspended' || s === 'inactive') return { backgroundColor: '#fff3e0', color: '#ef6c00' };
                            return { backgroundColor: '#ffebee', color: '#c62828' };
                        };
                        return (
                            <li {...props} key={option.id}>
                                <Box sx={{ width: '100%' }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2" fontWeight="bold">
                                            {option.employee_id}
                                        </Typography>
                                        {option.status && (
                                            <Box
                                                component="span"
                                                sx={{
                                                    height: '20px',
                                                    fontSize: '10px',
                                                    px: 1,
                                                    borderRadius: '10px',
                                                    ...getStatusChipStyles(option.status),
                                                    textTransform: 'capitalize',
                                                    ml: 1,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                {option.status}
                                            </Box>
                                        )}
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                        {option.name}
                                    </Typography>
                                    {(option.department_name || option.subdepartment_name || option.company) && (
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '10px' }}>
                                            {[option.department_name, option.subdepartment_name, option.company].filter(Boolean).join(' • ')}
                                        </Typography>
                                    )}
                                </Box>
                            </li>
                        );
                    }}
                />
            </Box>

            {/* Search and Filter */}
            <Box sx={{ px: 2, mb: 2, display: 'flex' }}>
                <Paper
                    component="form"
                    sx={{
                        p: '2px 4px',
                        display: 'flex',
                        alignItems: 'center',
                        flex: 1,
                        border: '1px solid #ddd',
                        boxShadow: 'none',
                    }}
                >
                    <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Search" inputProps={{ 'aria-label': 'search tables' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                        <SearchIcon />
                    </IconButton>
                </Paper>
                {/* Select Floor */}
                <FormControl sx={{ marginLeft: 1 }}>
                    <InputLabel id="select-floor">Floor</InputLabel>
                    <Select labelId="select-floor" id="floor" value={orderDetails.floor} label="Floor" onChange={(e) => handleFloorChange(e.target.value)}>
                        {floorTables.map((item, index) => (
                            <MenuItem value={item.id} key={index}>
                                {item.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <ToggleButtonGroup value={filterOption} exclusive onChange={handleFilterOptionChange} aria-label="filter option" size="small" sx={{ ml: 1 }}>
                    <ToggleButton
                        value="all"
                        aria-label="all"
                        sx={{
                            textTransform: 'none',
                            '&.Mui-selected': {
                                backgroundColor: '#063455',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#063455',
                                },
                            },
                        }}
                    >
                        All
                    </ToggleButton>
                    <ToggleButton
                        value="available"
                        aria-label="available"
                        sx={{
                            textTransform: 'none',
                            '&.Mui-selected': {
                                backgroundColor: '#063455',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#063455',
                                },
                            },
                        }}
                    >
                        Available
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Table Selection */}
            <Box sx={{ px: 2, mb: 2 }}>
                <RadioGroup
                    value={orderDetails.table ? JSON.stringify(orderDetails.table) : orderDetails.table}
                    onChange={(e) => {
                        console.log(e.target.value);
                        handleOrderDetailChange('table', JSON.parse(e.target.value));
                    }}
                >
                    <Grid container spacing={1}>
                        {filteredTables.length > 0 &&
                            filteredTables.map((table) => (
                                <Grid item xs={6} key={table.id}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 1.5,
                                            bgcolor: table.id === orderDetails.table?.id ? '#FCF7EF' : table.is_available ? 'white' : '#f5f5f5',
                                            border: table.id === orderDetails.table?.id ? '1px solid #A27B5C' : '1px solid #e0e0e0',
                                            borderRadius: 1,
                                            opacity: table.is_available ? 1 : 0.7,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                                {table.table_no}
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                                    {table.capacity} person
                                                </Typography>
                                                {table.is_available ? (
                                                    <FormControlLabel
                                                        value={JSON.stringify(table)}
                                                        control={<Radio size="small" />}
                                                        label=""
                                                        sx={{
                                                            m: 0,
                                                            color: '#063455',
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography variant="caption" sx={{ color: '#063455' }}>
                                                        {table.table_no.split('-')[0]} - Full
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))}
                    </Grid>
                </RadioGroup>
            </Box>

            {/* Footer */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    p: 2,
                    borderTop: '1px solid #e0e0e0',
                }}
            >
                <Button
                    sx={{
                        color: '#666',
                        textTransform: 'none',
                        mr: 1,
                    }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                        bgcolor: '#0c3b5c',
                        '&:hover': {
                            bgcolor: '#072a42',
                        },
                        textTransform: 'none',
                    }}
                    disabled={isDisabled}
                    onClick={() =>
                        router.visit(
                            route(routeNameForContext('order.menu'), {
                                table_id: orderDetails.table.id,
                                member_id: orderDetails.member.id,
                                member_type: orderDetails.member_type,
                                waiter_id: orderDetails.waiter.id,
                                person_count: orderDetails.person_count,
                                floor_id: orderDetails.floor,
                                order_type: 'dineIn',
                            }),
                        )
                    }
                >
                    Choose Menu
                </Button>
            </Box>
        </Box>
    );
};
DineDialog.layout = (page) => page;
export default DineDialog;
