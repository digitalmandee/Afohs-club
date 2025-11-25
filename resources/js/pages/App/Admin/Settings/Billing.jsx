import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Box, Typography, TextField, Grid, Paper, Button, Alert } from '@mui/material';
import { enqueueSnackbar } from 'notistack';


export default function Billing({ settings }) {
    // const [open, setOpen] = useState(true);

    const { data, setData, post, processing, errors } = useForm({
        overdue_charge_pct: settings.overdue_charge_pct ?? 0,
        penalty_quarter_pct: {
            Q1: settings.penalty_quarter_pct?.Q1 ?? 0,
            Q2: settings.penalty_quarter_pct?.Q2 ?? 0,
            Q3: settings.penalty_quarter_pct?.Q3 ?? 0,
            Q4: settings.penalty_quarter_pct?.Q4 ?? 0,
        },
        reinstatement_fees: {
            Q1: settings.reinstatement_fees?.Q1 ?? 0,
            Q2: settings.reinstatement_fees?.Q2 ?? 0,
            Q3: settings.reinstatement_fees?.Q3 ?? 0,
            Q4: settings.reinstatement_fees?.Q4 ?? 0,
        },
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        const numericValue = value === '' ? 0 : parseFloat(value);

        if (name.startsWith('penalty_')) {
            const q = name.split('_')[1];
            setData('penalty_quarter_pct', {
                ...data.penalty_quarter_pct,
                [q]: numericValue,
            });
        } else if (name.startsWith('reinstatement_')) {
            const q = name.split('_')[1];
            setData('reinstatement_fees', {
                ...data.reinstatement_fees,
                [q]: numericValue,
            });
        } else {
            setData(name, numericValue);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route('admin.billing-settings.update'), {
            onSuccess: () => {
                enqueueSnackbar('Billing settings updated.', { variant: 'success' });
            },
            onError: () => {
                enqueueSnackbar('Something went wrong. Please check your input.', { variant: 'error' });
            },
        });
    };

    return (
        <>
            {/* <SideNav open={open} setOpen={setOpen} /> */}
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
                <Typography variant="h4" sx={{ fontWeight: 500, color: '#063455', ml:4, pt:3 }}>
                    Billing Settings
                </Typography>
                <Paper sx={{ p: 2, maxWidth: "800px", mx: "auto", mt:5 }}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            {/* Penalty Per Quarter */}
                            <Grid item xs={12}>
                                <Typography variant="h6" mt={4}>
                                    One-time Penalty per Quarter (%)
                                </Typography>
                                <Grid container spacing={2} mt={1}>
                                    {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
                                        <Grid item xs={6} md={3} key={`penalty-${q}`}>
                                            <TextField label={`Penalty ${q}`} name={`penalty_${q}`} type="number" fullWidth value={data.penalty_quarter_pct[q] || ''} onChange={handleChange} error={!!errors[`penalty_quarter_pct.${q}`]} helperText={errors[`penalty_quarter_pct.${q}`]} />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Grid>

                            {/* Reinstatement Fees Per Quarter */}
                            <Grid item xs={12}>
                                <Typography variant="h6" mt={4}>
                                    Reinstatement Fees (PKR)
                                </Typography>
                                <Grid container spacing={2} mt={1}>
                                    {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
                                        <Grid item xs={6} md={3} key={`reinstatement-${q}`}>
                                            <TextField label={`Reinstatement ${q}`} name={`reinstatement_${q}`} type="number" fullWidth value={data.reinstatement_fees[q] || ''} onChange={handleChange} error={!!errors[`reinstatement_fees.${q}`]} helperText={errors[`reinstatement_fees.${q}`]} />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Grid>

                            <Grid item xs={12} mt={4}>
                                <Box mt={2} display="flex" justifyContent="flex-end">
                                    <Button variant="contained" color="primary" type="submit" disabled={processing}>
                                        Save Settings
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </div>
        </>
    );
}
