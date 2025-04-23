import { Close as CloseIcon, CreditCard as CreditCardIcon, Edit as EditIcon, Print as PrintIcon, Receipt as ReceiptIcon } from '@mui/icons-material';
import { Avatar, Box, Button, Chip, Divider, Grid, IconButton, Paper, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

const OrderSaved = () => {
    return (
        <>
            {/* Order ID */}
            <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: '100vh' }}>
                <Paper
                    elevation={0}
                    sx={{
                        width: '100%',
                        maxWidth: 500,
                        borderRadius: 1,
                        overflow: 'hidden',
                    }}
                >
                    {/* Header */}
                    <Box sx={{ border: '1px solid #E3E3E3', p: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Member
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                    <Avatar sx={{ width: 24, height: 24, bgcolor: '#e0e0e0', fontSize: 12, mr: 1 }}>Q</Avatar>
                                    <Typography variant="body2" fontWeight="medium">
                                        Qafi Latif
                                    </Typography>
                                    <Box
                                        component="span"
                                        sx={{
                                            display: 'inline-block',
                                            width: 16,
                                            height: 16,
                                            borderRadius: '50%',
                                            bgcolor: '#ffc107',
                                            ml: 1,
                                        }}
                                    />
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Avatar sx={{ width: 28, height: 28, bgcolor: '#1976d2', fontSize: 12 }}>TH</Avatar>
                                <IconButton size="small" sx={{ width: 28, height: 28, bgcolor: '#f5f5f5' }}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" sx={{ width: 28, height: 28, bgcolor: '#f5f5f5' }}>
                                    <ReceiptIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" sx={{ width: 28, height: 28, bgcolor: '#f5f5f5' }}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={4}>
                                <Typography variant="caption" color="text.secondary">
                                    Order Date
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    12, Jun 2024
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="caption" color="text.secondary">
                                    Waiter
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                    <Avatar sx={{ width: 20, height: 20, mr: 0.5, fontSize: 10 }}>T</Avatar>
                                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                        Tymika Obey
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="caption" color="text.secondary">
                                    Order Time
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    22:30pm
                                </Typography>
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 2 }}>
                            <Chip
                                label="Order Id : #123"
                                size="small"
                                sx={{
                                    bgcolor: '#f5f5f5',
                                    color: '#555',
                                    height: '24px',
                                    fontSize: '0.75rem',
                                    borderRadius: '4px',
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Order Items */}
                    <Box sx={{ mt: 1, p: 1 }}>
                        {/* Cappuccino */}
                        <Box sx={{ mb: 2, borderBottom: '1px solid #E3E3E3' }}>
                            <Box sx={{ display: 'flex', mb: 1 }}>
                                <Avatar
                                    src="/placeholder.svg?height=40&width=40"
                                    variant="rounded"
                                    sx={{ width: 36, height: 36, mr: 1.5, bgcolor: '#f8c291' }}
                                />
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="body2" fontWeight="medium">
                                        Cappuccino
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Coffee & Beverage
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Qty : 1 x Rs 5.00
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium">
                                        Rs. 5.00
                                    </Typography>
                                </Box>
                            </Box>
                            <ToggleButtonGroup
                                size="small"
                                exclusive
                                sx={{
                                    '& .MuiToggleButtonGroup-grouped': {
                                        border: '1px solid #e0e0e0 !important',
                                        borderRadius: '4px !important',
                                        mb: 2,
                                        mx: 0.5,
                                        fontSize: '0.7rem',
                                        py: 0.5,
                                        px: 1.5,
                                        color: '#555',
                                    },
                                }}
                            >
                                <ToggleButton value="ice">Ice</ToggleButton>
                                <ToggleButton value="hot">Hot</ToggleButton>
                                <ToggleButton value="s">S</ToggleButton>
                                <ToggleButton value="m">M</ToggleButton>
                                <ToggleButton value="l">L</ToggleButton>
                            </ToggleButtonGroup>
                        </Box>

                        {/* Soda Beverage */}
                        <Box sx={{ mb: 2, borderBottom: '1px solid #E3E3E3' }}>
                            <Box sx={{ display: 'flex', mb: 1 }}>
                                <Avatar
                                    src="/placeholder.svg?height=40&width=40"
                                    variant="rounded"
                                    sx={{ width: 36, height: 36, mr: 1.5, bgcolor: '#fab1a0' }}
                                />
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="body2" fontWeight="medium">
                                        Soda Beverage
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Coffee & Beverage
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Qty : 1 x Rs 15.00
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium">
                                        Rs. 15.00
                                    </Typography>
                                </Box>
                            </Box>
                            <ToggleButtonGroup
                                size="small"
                                exclusive
                                sx={{
                                    '& .MuiToggleButtonGroup-grouped': {
                                        border: '1px solid #e0e0e0 !important',
                                        borderRadius: '4px !important',
                                        mb: 2,
                                        mx: 0.5,
                                        fontSize: '0.7rem',
                                        py: 0.5,
                                        px: 1.5,
                                        color: '#555',
                                    },
                                }}
                            >
                                <ToggleButton value="ice">Ice</ToggleButton>
                                <ToggleButton value="hot">Hot</ToggleButton>
                                <ToggleButton value="s">S</ToggleButton>
                                <ToggleButton value="m">M</ToggleButton>
                                <ToggleButton value="l">L</ToggleButton>
                            </ToggleButtonGroup>
                        </Box>
                    </Box>

                    {/* Order Summary */}
                    <Box sx={{ px: 1, py: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Subtotal
                            </Typography>
                            <Typography variant="body2">Rs 19.00</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Discount
                            </Typography>
                            <Typography variant="body2" color="#4caf50">
                                Rs 0% (0)
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Tax 12%
                            </Typography>
                            <Typography variant="body2">Rs 2.28</Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle2">Total</Typography>
                            <Typography variant="subtitle2">Rs 16.72</Typography>
                        </Box>
                    </Box>

                    {/* Payment Info */}
                    <Box
                        sx={{
                            border: '1px solid #E3E3E3',
                            borderRadius: 1,
                            overflow: 'hidden', // ensures borders align perfectly
                        }}
                    >
                        <Grid container>
                            <Grid
                                item
                                xs={4}
                                sx={{
                                    borderRight: '1px solid #E3E3E3',
                                    p: 1.5,
                                }}
                            >
                                <Typography variant="caption" color="text.secondary">
                                    Payment
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                    <CreditCardIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                    <Typography variant="body2" fontWeight="medium">
                                        Cash
                                    </Typography>
                                </Box>
                            </Grid>

                            <Grid
                                item
                                xs={4}
                                sx={{
                                    borderRight: '1px solid #E3E3E3',
                                    p: 1.5,
                                }}
                            >
                                <Typography variant="caption" color="text.secondary">
                                    Cash Total
                                </Typography>
                                <Typography variant="body2" fontWeight="medium" mt={0.5}>
                                    Rs 20.00
                                </Typography>
                            </Grid>

                            <Grid item xs={4} sx={{ p: 1.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Customer Change
                                </Typography>
                                <Typography variant="body2" fontWeight="medium" mt={0.5}>
                                    Rs 3.28
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            sx={{
                                flex: 1,
                                borderColor: '#e0e0e0',
                                color: '#555',
                                textTransform: 'none',
                            }}
                        >
                            Close
                        </Button>
                        <Button
                            variant="outlined"
                            sx={{
                                flex: 2,
                                borderColor: '#e0e0e0',
                                color: '#555',
                                textTransform: 'none',
                            }}
                        >
                            Send to kitchen
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<PrintIcon />}
                            sx={{
                                flex: 2,
                                bgcolor: '#0a3d62',
                                '&:hover': { bgcolor: '#0c2461' },
                                textTransform: 'none',
                            }}
                        >
                            Print Receipt
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </>
    );
};

export default OrderSaved;
