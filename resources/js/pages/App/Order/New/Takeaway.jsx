import { useOrderStore } from '@/stores/useOrderStore';
import { router } from '@inertiajs/react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { Autocomplete, Box, Button, Grid, InputAdornment, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

const TakeAwayDialog = () => {
    const { orderDetails, handleOrderDetailChange } = useOrderStore();

    const [members, setMembers] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);

    // Search Members
    const searchUser = useCallback(async (query, role) => {
        if (!query) return []; // Don't make a request if the query is empty.
        setSearchLoading(true);

        try {
            const response = await axios.get(route('user.search'), {
                params: { query, role },
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
            const results = await searchUser(query, role);
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

    const isDisabled = !orderDetails.member || Object.keys(orderDetails.member).length === 0;

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F10' && !isDisabled) {
                e.preventDefault(); // Optional: prevent browser behavior
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

            <Grid container spacing={2} sx={{ px: 2, mb: 2 }}>
                <Grid item xs={12}>
                    <Typography variant="body2" sx={{ mb: 0.5, color: '#121212', fontSize: '14px' }}>
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
            </Grid>

            {/* Footer */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    p: 2,
                    // borderTop: '1px solid #e0e0e0'
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

export default TakeAwayDialog;
