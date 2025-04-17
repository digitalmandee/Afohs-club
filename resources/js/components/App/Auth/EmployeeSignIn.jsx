import { router } from '@inertiajs/react';
import { ArrowBack as ArrowBackIcon, ArrowForward as ArrowForwardIcon, KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material';
import { Box, Button, Link, MenuItem, Select, TextField, Typography } from '@mui/material';
import { useState } from 'react';

const EmployeeSignIn = ({ setActiveTab, data, setData, post, processing, errors, transform }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handlePinChange = (index, value) => {
        if (value.length <= 1) {
            const newPin = [...data.password];
            newPin[index] = value || '';
            setData((prevData) => ({ ...prevData, password: newPin }));

            // Move to next input if value is entered
            if (value && index < 5) {
                setCurrentIndex(index + 1);
            }
        }
    };

    const handleSignIn = () => {
        transform((data) => ({
            ...data,
            password: data.password.join(''),
        }));
        console.log(data);

        post(route('login'), {
            onSuccess: () => {
                console.log('yes');

                router.visit(route('dashboard'));
            },
            onError: (errors) => {
                console.log(errors);
            },
        });
    };

    return (
        <>
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
                        {data.password &&
                            data.password.map((digit, index) => (
                                <TextField
                                    key={index}
                                    variant="outlined"
                                    type={'password'}
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
                                    autoFocus={index === currentIndex}
                                    onChange={(e) => handlePinChange(index, e.target.value)}
                                />
                            ))}
                    </Box>
                    {errors.password && (
                        <Typography variant="body2" sx={{ color: 'red', mt: 1 }}>
                            {errors.password}
                        </Typography>
                    )}
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
                        onClick={handleSignIn}
                    >
                        Sign In
                    </Button>
                </Box>
            </Box>
        </>
    );
};

export default EmployeeSignIn;
