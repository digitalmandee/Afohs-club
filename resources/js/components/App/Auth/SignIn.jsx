import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BackspaceIcon from '@mui/icons-material/Backspace';
import { Box, Button, Grid, Link, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';

const SignIn = ({ setActiveTab, post, errors, data, setData, processing }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleNumberClick = (number) => {
        setData({ user_id: data.user_id + number });
    };

    const handleBackspace = () => {
        setData({ user_id: data.user_id.slice(0, -1) });
    };

    const handleSubmit = () => {
        post(route('check-user-id'), {
            onSuccess: () => {
                setActiveTab('employee-signin');
            },
        });
    };

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    // mb: 1,
                }}
            >
                <Box
                    component="img"
                    src="/assets/Logo.png"
                    alt="AFOHS Club Logo"
                    sx={{
                        width: 150,
                        height: 114,
                        mb: 2,
                    }}
                />
                <Typography
                    variant="h5"
                    component="h1"
                    sx={{
                        fontWeight: 500,
                        fontSize: '30px',
                        mb: 1,
                        color: '#3F4E4F',
                    }}
                >
                    Sign In
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        color: '#7F7F7F',
                        textAlign: 'flex-start',
                        mb: 2,
                        fontSize: '16px',
                    }}
                >
                    Get started now, enter your company Id to access your account
                </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography
                    variant="subtitle2"
                    sx={{
                        mb: 1,
                        fontWeight: 500,
                        color: '#121212',
                        fontSize: '14px',
                    }}
                >
                    Company Id
                </Typography>
                <TextField
                    fullWidth
                    placeholder="Your employee id"
                    value={data.user_id}
                    onChange={(e) => setData('user_id', e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 1,
                        },
                    }}
                />
                {errors.user_id && (
                    <Typography variant="body2" sx={{ color: 'red', mt: 1 }}>
                        {errors.user_id}
                    </Typography>
                )}
            </Box>

            <Button
                variant="contained"
                fullWidth
                endIcon={<ArrowForwardIcon />}
                sx={{
                    // mt: 1,
                    mb: 1,
                    py: 1.5,
                    backgroundColor: '#063455',
                    '&:hover': {
                        backgroundColor: '#0D3B66',
                    },
                    borderRadius: 1,
                    textTransform: 'none',
                }}
                onClick={() => handleSubmit()}
                disabled={processing}
                loading={processing}
                loadingPosition="start"
            >
                Next
            </Button>

            <Typography
                variant="body2"
                sx={{
                    textAlign: 'center',
                    mb: 2,
                    mt: 1,
                    color: '#7F7F7F',
                }}
            >
                Don't have account?{' '}
                <Link href="#" underline="none" sx={{ color: '#063455', fontWeight: 500 }}>
                    Sign Up
                </Link>
            </Typography>

            {/* Numeric keypad */}
            <Box>
                <Grid container spacing={1}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                        <Grid item xs={4} key={number}>
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => handleNumberClick(number.toString())}
                                sx={{
                                    py: 1.5,
                                    borderColor: 'rgba(0, 0, 0, 0.1)',
                                    color: 'text.primary',
                                    '&:hover': {
                                        borderColor: 'rgba(0, 0, 0, 0.2)',
                                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                    },
                                }}
                            >
                                {number}
                            </Button>
                        </Grid>
                    ))}
                    <Grid item xs={4}>
                        <Button
                            variant="outlined"
                            fullWidth
                            sx={{
                                py: 1.5,
                                borderColor: 'rgba(0, 0, 0, 0.1)',
                                color: 'text.primary',
                                '&:hover': {
                                    borderColor: 'rgba(0, 0, 0, 0.2)',
                                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                },
                            }}
                        >
                            .
                        </Button>
                    </Grid>
                    <Grid item xs={4}>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => handleNumberClick('0')}
                            sx={{
                                py: 1.5,
                                borderColor: 'rgba(0, 0, 0, 0.1)',
                                color: 'text.primary',
                                '&:hover': {
                                    borderColor: 'rgba(0, 0, 0, 0.2)',
                                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                },
                            }}
                        >
                            0
                        </Button>
                    </Grid>
                    <Grid item xs={4}>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={handleBackspace}
                            sx={{
                                py: 1.5,
                                borderColor: 'rgba(0, 0, 0, 0.1)',
                                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                                color: 'error.main',
                                '&:hover': {
                                    borderColor: 'error.light',
                                    backgroundColor: 'rgba(255, 0, 0, 0.15)',
                                },
                            }}
                        >
                            <BackspaceIcon />
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </>
    );
};

export default SignIn;
