'use client';

import { useOrderStore } from '@/stores/useOrderStore';
import { router } from '@inertiajs/react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import SearchIcon from '@mui/icons-material/Search';
import { Autocomplete, Box, Button, FormControl, FormControlLabel, Grid, IconButton, InputAdornment, InputBase, InputLabel, MenuItem, Paper, Radio, RadioGroup, Select, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

const DineDialog = ({ memberTypes, floorTables }) => {
    const { orderDetails, handleOrderDetailChange } = useOrderStore();

    const [filterOption, setFilterOption] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [members, setMembers] = useState([]);
    const [waiters, setWaiters] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);

    // Search Members
    const searchUser = useCallback(async (query, role, member_type) => {
        if (!query) return []; // Don't make a request if the query is empty.
        setSearchLoading(true);
        if (member_type === '') {
            alert('Please select membership type');
            return [];
        }
        try {
            const response = await axios.get(route('user.search'), {
                params: { query, role, member_type },
            });
            if (response.data.success) {
                return response.data.results;
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error fetching search results:', error);
            return [];
        } finally {
            setSearchLoading(false);
        }
    }, []);

    const handleSearch = async (event, role) => {
        const query = event?.target?.value;
        if (query) {
            const results = await searchUser(query, role, orderDetails.membership_type);
            if (role === 'user') setMembers(results);
            else setWaiters(results);
        } else {
            if (role === 'user') setMembers([]);
            else setWaiters([]);
        }
    };

    const handleAutocompleteChange = (event, value, field) => {
        handleOrderDetailChange(field, value);
        // setErrors({ ...errors, [field]: '' }); // Clear error on change
    };

    const handleMembershipType = (value) => {
        handleOrderDetailChange('membership_type', value);
        handleOrderDetailChange('member', {});
        setMembers([]);
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
        axios.get(route('waiters.all')).then((res) => setWaiters(res.data.waiters));
    }, ['']);

    const currentFloor = floorTables.find((f) => f.id === orderDetails.floor);

    const filteredTables = currentFloor?.tables?.length
        ? currentFloor.tables.filter((table) => {
              if (filterOption === 'available' && !table.is_available) return false;
              const keyword = searchTerm.toLowerCase();
              return table.table_no.toLowerCase().includes(keyword) || String(table.capacity).includes(keyword);
          })
        : [];

    const isDisabled = !orderDetails.member || !orderDetails.waiter || !orderDetails.table;

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F10' && !isDisabled) {
                e.preventDefault();
                router.visit(route('order.menu'));
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

            {/* Membership Type Selection */}
            <Box sx={{ px: 2, mb: 2 }}>
                <FormControl component="fieldset">
                    <RadioGroup row name="membership-type" value={orderDetails.membership_type} onChange={(e) => handleMembershipType(e.target.value)}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 1,
                                width: '100%',
                            }}
                        >
                            {memberTypes.map((option) => {
                                const isSelected = orderDetails.membership_type === option.id;
                                return (
                                    <Box
                                        key={option.id}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            border: `1px solid ${isSelected ? '#A27B5C' : '#E3E3E3'}`,
                                            bgcolor: isSelected ? '#FCF7EF' : 'transparent',
                                            borderRadius: 1,
                                            px: 2,
                                            py: 1,
                                            width: 'calc(33.33% - 8px)',
                                            transition: 'all 0.2s ease-in-out',
                                        }}
                                    >
                                        <FormControlLabel
                                            value={option.id}
                                            control={<Radio size="small" />}
                                            label={<Typography variant="body2">{option.name}</Typography>}
                                            sx={{
                                                m: 0,
                                                width: '100%',
                                                '& .MuiFormControlLabel-label': {
                                                    flexGrow: 1,
                                                },
                                            }}
                                        />
                                    </Box>
                                );
                            })}
                        </Box>
                    </RadioGroup>
                </FormControl>
            </Box>

            {/* Customer Information */}
            <Grid container spacing={2} sx={{ px: 2, mb: 2 }}>
                <Grid item xs={8}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Customer Name
                    </Typography>
                    <Autocomplete
                        fullWidth
                        freeSolo
                        size="small"
                        options={members}
                        value={orderDetails.member}
                        getOptionLabel={(option) => option?.name || ''}
                        onInputChange={(event, value) => handleSearch(event, 'user')}
                        onChange={(event, value) => handleAutocompleteChange(event, value, 'member')}
                        loading={searchLoading}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                fullWidth
                                sx={{ p: 0 }}
                                placeholder="Enter name or scan member card"
                                variant="outlined"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <QrCodeScannerIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        )}
                        renderOption={(props, option) => (
                            <li {...props}>
                                <span>{option.name}</span>
                                <span style={{ color: 'gray', fontSize: '0.875rem' }}> ({option.email})</span>
                            </li>
                        )}
                    />
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

            {/* Seating Area */}
            <Box sx={{ px: 2, mb: 2 }}>
                <Autocomplete
                    fullWidth
                    freeSolo
                    size="small"
                    options={waiters}
                    value={orderDetails.waiter}
                    getOptionLabel={(option) => option?.name || ''}
                    // onInputChange={(event, value) => handleSearch(event, 'waiter')}
                    onChange={(event, value) => handleAutocompleteChange(event, value, 'waiter')}
                    loading={searchLoading}
                    renderInput={(params) => <TextField {...params} fullWidth sx={{ p: 0 }} placeholder="Select Waiter" variant="outlined" />}
                    filterOptions={(options, state) => options.filter((option) => `${option.name} ${option.email}`.toLowerCase().includes(state.inputValue.toLowerCase()))}
                    renderOption={(props, option) => (
                        <li {...props}>
                            <span>{option.name}</span>
                            <span style={{ color: 'gray', fontSize: '0.875rem' }}> ({option.email})</span>
                        </li>
                    )}
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
                <RadioGroup value={orderDetails.table} onChange={(e) => handleOrderDetailChange('table', e.target.value)}>
                    <Grid container spacing={1}>
                        {filteredTables.length > 0 &&
                            filteredTables.map((table) => (
                                <Grid item xs={6} key={table.id}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 1.5,
                                            bgcolor: table.id === orderDetails.table ? '#FCF7EF' : table.available ? 'white' : '#f5f5f5',
                                            border: table.id === orderDetails.table ? '1px solid #A27B5C' : '1px solid #e0e0e0',
                                            borderRadius: 1,
                                            opacity: table.available ? 1 : 0.7,
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
                                                        value={table.id}
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
                    onClick={() => router.visit(route('order.menu'))}
                >
                    Choose Menu
                </Button>
            </Box>
        </Box>
    );
};

export default DineDialog;
