import AppAuthLayout from '@/layouts/app/app-auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { Box, Button, Typography } from '@mui/material';

const SelectRestaurant = ({ restaurants }) => {
    const { data, setData, post, processing } = useForm({
        restaurant_id: '',
    });

    const handleSelect = (restaurantId) => {
        setData('restaurant_id', restaurantId);
        post(route('pos.set-restaurant'));
    };

    return (
        <>
            <Head title="Select Restaurant" />
            <AppAuthLayout>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box
                        component="img"
                        src="/assets/Logo.png"
                        alt="AFOHS Club Logo"
                        sx={{
                            width: 150,
                            height: 114,
                            mb: 1,
                            ml: -1,
                        }}
                    />

                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 500,
                            color: '#063455',
                            fontSize: '30px',
                        }}
                    >
                        Select Restaurant
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mt: 1 }}>
                        {(restaurants || []).map((restaurant) => (
                            <Button
                                key={restaurant.id}
                                variant={data.restaurant_id === restaurant.id ? 'contained' : 'outlined'}
                                onClick={() => handleSelect(restaurant.id)}
                                disabled={processing}
                                sx={{
                                    justifyContent: 'space-between',
                                    borderRadius: 1,
                                    textTransform: 'none',
                                    bgcolor: data.restaurant_id === restaurant.id ? '#063455' : undefined,
                                    borderColor: '#063455',
                                    color: data.restaurant_id === restaurant.id ? '#FFFFFF' : '#063455',
                                    '&:hover': {
                                        bgcolor: data.restaurant_id === restaurant.id ? '#083654' : 'rgba(6,52,85,0.06)',
                                        borderColor: '#063455',
                                    },
                                }}
                            >
                                {restaurant.name}
                            </Button>
                        ))}
                    </Box>
                </Box>
            </AppAuthLayout>
        </>
    );
};

SelectRestaurant.layout = (page) => page;
export default SelectRestaurant;

