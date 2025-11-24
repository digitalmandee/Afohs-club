import AsyncSearchTextField from '@/components/AsyncSearchTextField';
import { useOrderStore } from '@/stores/useOrderStore';
import { router } from '@inertiajs/react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, Button, FormControl, FormControlLabel, Grid, Radio, RadioGroup, TextField, Typography } from '@mui/material';
import { useEffect } from 'react';

const TakeAwayDialog = () => {
    const { orderDetails, handleOrderDetailChange } = useOrderStore();

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
                    <RadioGroup row name="membership-type" value={orderDetails.member_type} onChange={(e) => handleMemberType(e.target.value)}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 1,
                                width: '100%',
                            }}
                        >
                            {[
                                { id: 1, name: 'Member' },
                                { id: 2, name: 'Guest' },
                                { id: 3, name: 'Employee' },
                            ].map((option) => {
                                const isSelected = orderDetails.member_type == option.id;
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
            <Grid container spacing={2} sx={{ px: 2, mb: 2 }}>
                <Grid item xs={12}>
                    <Typography variant="body2" sx={{ mb: 0.5, fontSize: '14px', color: '#121212' }}>
                        Customer Name
                    </Typography>
                    <AsyncSearchTextField placeholder="Enter name or scan member card" name="user" endpoint="user.search" params={{ type: orderDetails.member_type }} onChange={(e) => handleMemberChange(e.target.value)} size="small" />
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
