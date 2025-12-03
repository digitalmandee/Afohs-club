import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const MembershipStepper = ({ step }) => {
    const steps = [
        { number: 1, label: 'Personal Information' },
        { number: 2, label: 'Contact Information' },
        { number: 3, label: 'Membership Information' },
        { number: 4, label: 'Payment' },
    ];

    return (
        <Paper
            elevation={0}
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                mb: 3,
                backgroundColor: '#f0f0f0',
                borderRadius: '4px',
            }}
        >
            {steps.map((s) => {
                const isActive = step === s.number;
                const isCompleted = step > s.number;

                return (
                    <Box key={s.number} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                            sx={{
                                width: 30,
                                height: 30,
                                borderRadius: '50%',
                                backgroundColor: isActive || isCompleted ? '#2c3e50' : '#e0e0e0',
                                color: isActive || isCompleted ? 'white' : '#333',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 2,
                            }}
                        >
                            {isCompleted ? <CheckCircleIcon fontSize="small" /> : s.number}
                        </Box>
                        <Typography sx={{ fontWeight: 500 }}>{s.label}</Typography>
                    </Box>
                );
            })}
        </Paper>
    );
};

export default MembershipStepper;
