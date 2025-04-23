import { router } from '@inertiajs/react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { Box, Button, Grid, InputAdornment, TextField, Typography } from '@mui/material';

const TakeAwayDialog = () => {
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
                        #001
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={2} sx={{ px: 2, mb: 2 }}>
                <Grid item xs={12}>
                    <Typography variant="body2" sx={{ mb: 0.5, color: '#121212', fontSize: '14px' }}>
                        Customer Name
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Entry name or scan member card"
                        sx={{
                            width: '100%',
                            '& .MuiOutlinedInput-root': {
                                border: '1px solid #063455',
                                borderRadius: '4px',
                                '&:hover fieldset': {
                                    border: 'none',
                                },
                                '&.Mui-focused fieldset': {
                                    border: 'none',
                                },
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                border: 'none', // removes the default border
                            },
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <QrCodeScannerIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
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
                    onClick={() => router.visit('/all/order')}
                >
                    Choose Menu
                </Button>
            </Box>
        </Box>
    );
};

export default TakeAwayDialog;
