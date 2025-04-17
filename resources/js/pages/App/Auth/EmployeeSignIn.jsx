import { router } from '@inertiajs/react';
import { ArrowBack as ArrowBackIcon, ArrowForward as ArrowForwardIcon, KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material';
import { Box, Button, Link, MenuItem, Paper, Select, TextField, Typography } from '@mui/material';
import { useState } from 'react';

const EmployeeSignIn = () => {
    const [pin, setPin] = useState(['•', '', '', '', '', '']);
    const [currentIndex, setCurrentIndex] = useState(1);

    const handlePinChange = (index, value) => {
        if (value.length <= 1) {
            const newPin = [...pin];
            newPin[index] = value || '';
            setPin(newPin);

            // Move to next input if value is entered
            if (value && index < 5) {
                setCurrentIndex(index + 1);
            }
        }
    };
    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    height: '100vh',
                    width: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundImage: `url(/assets/bgimage1.png)`,
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
                            // p:2,
                            borderRadius: 2,
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)',
                            overflow: 'hidden',
                        }}
                    >
                        <Box
                            sx={{
                                width: '100%',
                                maxWidth: 540,
                                p: 2,
                                // bgcolor: 'white',
                                borderRadius: 1,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                                border: '1px solid #e0e0e0',
                            }}
                        >
                            {/* Logo */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'flex-start',
                                    mb: 1,
                                }}
                            >
                                <Box
                                    component="img"
                                    src="/assets/Logo.png"
                                    alt="AFOHS Club Logo"
                                    sx={{
                                        width: 150,
                                        height: 114,
                                    }}
                                />
                            </Box>

                            {/* Heading */}
                            <Box
                                sx={{
                                    p: 2,
                                }}
                            >
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 500,
                                        color: '#3F4E4F',
                                        fontSize: '30px',
                                        mb: 0.5,
                                    }}
                                >
                                    Employee Sign In
                                </Typography>

                                <Typography
                                    sx={{
                                        color: '#7F7F7F',
                                        fontSize: '16px',
                                        mb: 3,
                                        mt: 1,
                                    }}
                                >
                                    Employee of{' '}
                                    <Box
                                        component="span"
                                        sx={{
                                            color: '#063455',
                                            fontWeight: 500,
                                            fontSize: '16px',
                                        }}
                                    >
                                        Imaji Coffee Shop (IMAJI101010)
                                    </Box>
                                </Typography>

                                {/* Account Selection */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography
                                        sx={{
                                            color: '#121212',
                                            mb: 1,
                                            fontSize: '14px',
                                        }}
                                    >
                                        Choose your account to start your shift
                                    </Typography>
                                    <Select
                                        fullWidth
                                        defaultValue="kasa"
                                        sx={{
                                            height: 56,
                                            width: '100%',
                                            '.MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#121212',
                                            },
                                        }}
                                        IconComponent={KeyboardArrowDownIcon}
                                    >
                                        <MenuItem
                                            sx={{
                                                fontSize: '14px',
                                                color: '#121212',
                                            }}
                                            value="kasa"
                                        >
                                            Kasa Aksa (10:00 am - 15:00 pm)
                                        </MenuItem>
                                    </Select>
                                </Box>

                                {/* PIN Entry */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography
                                        sx={{
                                            color: '#121212',
                                            mb: 1,
                                            fontSize: '14px',
                                        }}
                                    >
                                        Enter PIN
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            gap: 2,
                                            width: '100%',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        {pin.map((digit, index) => (
                                            <TextField
                                                key={index}
                                                variant="outlined"
                                                type={index === 0 ? 'text' : 'password'}
                                                value={digit}
                                                inputProps={{
                                                    maxLength: 1,
                                                    style: {
                                                        textAlign: 'center',
                                                        // bgcolor:'black',
                                                        padding: '1rem',
                                                        fontSize: '1rem',
                                                        // width:'200%'
                                                    },
                                                }}
                                                sx={{
                                                    width: 60,
                                                    height: 70,
                                                    '.MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#063455',
                                                    },
                                                }}
                                                InputProps={{
                                                    readOnly: index === 0,
                                                }}
                                                autoFocus={index === currentIndex}
                                                onChange={(e) => handlePinChange(index, e.target.value)}
                                            />
                                        ))}
                                    </Box>
                                    <Link
                                        href="#"
                                        underline="hover"
                                        sx={{
                                            color: '#129BFF',
                                            fontSize: '0.875rem',
                                            mt: 1.5,
                                            display: 'inline-block',
                                        }}
                                        onClick={() => router.visit('/forget-pin')}
                                    >
                                        Forgot Pin?
                                    </Link>
                                </Box>

                                {/* Navigation Buttons */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        width: '100%',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <Button
                                        startIcon={<ArrowBackIcon />}
                                        sx={{
                                            borderRadius: '0',
                                            width: '215px',
                                            height: '48px',
                                            bgcolor: '#FFFFFF',
                                            color: '#121212',
                                            border: '1px solid #E3E3E3',
                                            '&:hover': {
                                                bgcolor: 'rgba(0,0,0,0.04)',
                                            },
                                        }}
                                        onClick={() => router.visit('/')}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        variant="contained"
                                        endIcon={<ArrowForwardIcon />}
                                        sx={{
                                            borderRadius: '0',
                                            width: '215px',
                                            height: '46px',
                                            color: '#FFFFFF',
                                            bgcolor: '#063455',
                                            '&:hover': {
                                                bgcolor: '#083654',
                                            },
                                            px: 3,
                                        }}
                                        onClick={() => router.visit('/dashboard')}
                                    >
                                        Sign In
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Box>
            </Box>
        </>
    );
};

export default EmployeeSignIn;
