'use client';

import { router } from '@inertiajs/react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import SearchIcon from '@mui/icons-material/Search';
import {
    Box,
    Button,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    InputBase,
    MenuItem,
    Paper,
    Radio,
    RadioGroup,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material';
import { useState } from 'react';

const DineDialog = ({ orderNo, memberTypes }) => {
    const [orderType, setOrderType] = useState('dineIn');
    // const [orderType, setOrderType] = useState<'dineIn' | 'takeaway' | 'reservation'>('dineIn');
    const [seatingArea, setSeatingArea] = useState('indoor');
    const [filterOption, setFilterOption] = useState('all');
    const [selectedTable, setSelectedTable] = useState('T8');
    const [membershipType, setMembershipType] = useState('member');
    const [selectedWaiter, setSelectedWaiter] = useState('');

    const handleOrderTypeChange = (event, newOrderType) => {
        if (newOrderType !== null) {
            setOrderType(newOrderType);
        }
    };

    const handleSeatingAreaChange = (event, newSeatingArea) => {
        if (newSeatingArea !== null) {
            setSeatingArea(newSeatingArea);
        }
    };

    const handleFilterOptionChange = (event, newFilterOption) => {
        if (newFilterOption !== null) {
            setFilterOption(newFilterOption);
        }
    };

    const tables = [
        { id: 'T8', capacity: 4, available: true },
        { id: 'T9', capacity: 2, available: true },
        { id: 'T10', capacity: 2, available: true },
        { id: 'T11', capacity: 2, available: true },
        { id: 'T12', capacity: 2, available: true },
        { id: 'T2', capacity: 4, available: false },
        { id: 'T5', capacity: 2, available: false },
        { id: 'T6', capacity: 4, available: false },
        { id: 'T7', capacity: 2, available: false },
    ];

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
                        #{orderNo}
                    </Typography>
                </Box>
            </Box>

            {/* Membership Type Selection */}
            <Box sx={{ px: 2, mb: 2 }}>
                <FormControl component="fieldset">
                    <RadioGroup row name="membership-type" value={membershipType} onChange={(e) => setMembershipType(e.target.value)}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 1,
                                width: '100%',
                            }}
                        >
                            {memberTypes.map((option) => {
                                const isSelected = membershipType === option.id;
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
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Entry name or scan member card"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <QrCodeScannerIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Customer Qty
                    </Typography>
                    <Box sx={{ display: 'flex' }}>
                        <TextField size="small" type="number" defaultValue="10" sx={{ width: '60%' }} />
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
                <TextField
                    select
                    fullWidth
                    size="small"
                    value={selectedWaiter}
                    onChange={(e) => setSelectedWaiter(e.target.value)}
                    displayEmpty
                    sx={{
                        backgroundColor: 'transparent',
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 1,
                            '& fieldset': {
                                border: '1px solid #121212',
                            },
                            '&:hover fieldset': {
                                borderColor: '#121212',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#121212',
                            },
                        },
                    }}
                    InputProps={{
                        notched: false,
                    }}
                    SelectProps={{
                        displayEmpty: true,
                        renderValue: (selected) => (selected === '' ? <span style={{ color: '#aaa' }}>Select Waiter</span> : selected),
                    }}
                >
                    <MenuItem value="">Select Waiter</MenuItem>
                    <MenuItem value="waiter1">Waiter 1</MenuItem>
                    <MenuItem value="waiter2">Waiter 2</MenuItem>
                    <MenuItem value="waiter3">Waiter 3</MenuItem>
                </TextField>
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
                    <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Search" inputProps={{ 'aria-label': 'search tables' }} />
                    <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                        <SearchIcon />
                    </IconButton>
                </Paper>
                <ToggleButtonGroup
                    value={filterOption}
                    exclusive
                    onChange={handleFilterOptionChange}
                    aria-label="filter option"
                    size="small"
                    sx={{ ml: 1 }}
                >
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
                <RadioGroup value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)}>
                    <Grid container spacing={1}>
                        {tables.map((table) => (
                            <Grid item xs={6} key={table.id}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 1.5,
                                        bgcolor: table.id === selectedTable ? '#FCF7EF' : table.available ? 'white' : '#f5f5f5',
                                        border: table.id === selectedTable ? '1px solid #A27B5C' : '1px solid #e0e0e0',
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
                                            {table.id}
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
                                            {table.available ? (
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
                                                    {table.id.split('-')[0]} - Full
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
                    onClick={() => router.visit('/all/order')}
                >
                    Choose Menu
                </Button>
            </Box>
        </Box>
    );
};

export default DineDialog;
