import { Head, router } from '@inertiajs/react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BackspaceIcon from '@mui/icons-material/Backspace';
import { Box, Button, Container, Grid, Link, Paper, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';

const SignIn = () => {
    const [companyId, setCompanyId] = useState('');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleNumberClick = (number) => {
        setCompanyId(companyId + number);
    };

    const handleBackspace = () => {
        setCompanyId(companyId.slice(0, -1));
    };

    return (
        <>
            <Head title="SignIn" />

            <Box
                sx={{
                    display: 'flex',
                    height: '100vh',
                    width: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundImage: `url('/assets/bgimage.png')`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        //   backgroundColor: "rgba(0, 0, 0, 0.3)",
                        //   backdropFilter: "blur(1px)",
                        //   zIndex: 1,
                    },
                }}
            >
                {/* Left side with text */}
                <Box
                    sx={{
                        flex: 1,
                        display: { xs: 'none', md: 'flex' },
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        p: 4,
                        zIndex: 2,
                    }}
                >
                    <Typography
                        variant="h5"
                        component="div"
                        sx={{
                            color: 'white',
                            maxWidth: '70%',
                            mb: 6,
                            fontWeight: 500,
                            lineHeight: 1.5,
                        }}
                    >
                        AFOHS Club was established in Pakistan Air Force Falcon Complex. A total of 25.5 Kanal of land was demarcated by Air
                        Headquarters in PAF Falcon Complex for the establishment of "Community Centre and Club".
                    </Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 1,
                        }}
                    >
                        {[1, 2, 3, 4, 5].map((_, index) => (
                            <Box
                                key={index}
                                sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    backgroundColor: index === 0 ? 'white' : 'rgba(255, 255, 255, 0.5)',
                                }}
                            />
                        ))}
                    </Box>
                </Box>

                {/* Right side with login form */}
                <Box
                    sx={{
                        width: { xs: '100%', md: '540px' },
                        display: 'flex',
                        flexDirection: 'column',
                        p: 1,
                        //   m: { xs: 1, md: 1 },
                        mt: { xs: 1, md: 1 },
                        mb: { xs: 1, md: 1 },
                        mr: { xs: 1, md: 1 },
                        zIndex: 1,
                    }}
                >
                    <Paper
                        elevation={4}
                        sx={{
                            pb: 4,
                            borderRadius: 2,
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)',
                            overflow: 'auto',
                            scrollbarWidth: 'none', // Firefox
                            '&::-webkit-scrollbar': {
                                display: 'none', // Chrome, Safari, Edge
                            },
                        }}
                    >
                        <Container
                            maxWidth="sm"
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100vh',
                                p: 2,
                            }}
                        >
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
                                    placeholder="Your company id"
                                    value={companyId}
                                    onChange={(e) => setCompanyId(e.target.value)}
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1,
                                        },
                                    }}
                                />
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
                                onClick={() => router.visit('/employee/sign-in')}
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
                        </Container>
                    </Paper>
                </Box>
            </Box>
        </>
    );
};

export default SignIn;
