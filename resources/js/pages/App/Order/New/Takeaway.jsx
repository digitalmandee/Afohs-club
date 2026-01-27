import { useOrderStore } from '@/stores/useOrderStore';
import { router } from '@inertiajs/react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Autocomplete, Box, Button, CircularProgress, FormControl, FormControlLabel, Grid, Radio, RadioGroup, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';

const TakeAwayDialog = ({ guestTypes }) => {
    const { orderDetails, handleOrderDetailChange } = useOrderStore();
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (event, query) => {
        if (!query) {
            setOptions([]);
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get(route('admin.api.search-users'), {
                params: {
                    q: query,
                    type: orderDetails.member_type,
                },
            });
            setOptions(response.data.results || []);
        } catch (error) {
            console.error('Error fetching members:', error);
            setOptions([]);
        } finally {
            setLoading(false);
        }
    };

    const isMemberSelected = !!orderDetails.member && Object.keys(orderDetails.member).length > 0;
    const requiresAddress = orderDetails.order_type === 'delivery';
    const isDisabled = !isMemberSelected || (requiresAddress && !orderDetails.address);

    const handleMemberType = (value) => {
        handleOrderDetailChange('member_type', value);
        handleOrderDetailChange('member', {});
    };

    const handleMemberChange = (value) => {
        handleOrderDetailChange('member', value);
        handleOrderDetailChange('address', value?.address || '');
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F10' && !isDisabled) {
                e.preventDefault();
                router.visit(route('order.menu'));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isDisabled]);

    return (
        <Box>
            {/* Order Header */}
            <Box sx={{ px: 2, mb: 2 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
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

            {/* Customer Search */}
            <Box sx={{ px: 2, mb: 2 }}>
                <FormControl component="fieldset">
                    <Grid container spacing={2} sx={{ px: 2, mb: 2 }}>
                        <Grid item xs={12}>
                            <RadioGroup
                                row
                                value={orderDetails.member_type}
                                onChange={(e) => {
                                    handleOrderDetailChange('member_type', e.target.value);
                                    handleOrderDetailChange('member', {});
                                    setOptions([]);
                                }}
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
                        <Grid item xs={12}>
                            <Autocomplete
                                id="customer-search-takeaway"
                                open={open}
                                onOpen={() => setOpen(true)}
                                onClose={() => setOpen(false)}
                                isOptionEqualToValue={(option, value) => option.id === value?.id}
                                getOptionLabel={(option) => option.label || ''}
                                options={options}
                                loading={loading}
                                value={orderDetails.member && orderDetails.member.id ? orderDetails.member : null}
                                onInputChange={(event, newInputValue, reason) => {
                                    if (reason === 'input') {
                                        handleSearch(event, newInputValue);
                                    }
                                }}
                                onChange={(event, newValue) => {
                                    handleOrderDetailChange('member', newValue || {});
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Member / Guest Name"
                                        placeholder="Search by Name, Membership No, or CNIC..."
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Delivery Address */}
                        {requiresAddress && (
                            <Grid item xs={12}>
                                <Typography variant="body2" sx={{ mb: 0.5, fontSize: '14px', color: '#121212' }}>
                                    Delivery Address
                                </Typography>
                                <TextField placeholder="Enter delivery address" fullWidth size="small" value={orderDetails.address || ''} onChange={(e) => handleOrderDetailChange('address', e.target.value)} />
                            </Grid>
                        )}
                    </Grid>
                </FormControl>
            </Box>

            {/* Footer */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
                <Button sx={{ color: '#666', textTransform: 'none', mr: 1 }}>Cancel</Button>
                <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                        bgcolor: '#0c3b5c',
                        '&:hover': { bgcolor: '#072a42' },
                        textTransform: 'none',
                    }}
                    disabled={isDisabled}
                    onClick={() =>
                        router.visit(
                            route('order.menu', {
                                member_id: orderDetails.member.id,
                                member_type: orderDetails.member_type,
                                order_type: orderDetails.order_type,
                                address: orderDetails.address || null,
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
TakeAwayDialog.layout = (page) => page;
export default TakeAwayDialog;
