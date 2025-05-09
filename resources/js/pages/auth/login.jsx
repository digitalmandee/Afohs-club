import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import AuthLayout from '@/layouts/auth-layout';

import { TextField, Checkbox, FormControlLabel, Button, Typography, Box, Link } from '@mui/material';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Log in to your account" description="Enter your email and password below to log in">
            <Head title="Log in" />

            <Box component="form" onSubmit={submit} display="flex" flexDirection="column" gap={3}>
                <Box>
                    <Typography variant="body1" component="label" htmlFor="email">
                        Email address
                    </Typography>
                    <TextField id="email" type="email" required autoFocus tabIndex={1} autoComplete="email" fullWidth value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="email@example.com" error={!!errors.email} helperText={errors.email} margin="dense" />
                </Box>

                <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body1" component="label" htmlFor="password">
                            Password
                        </Typography>
                        {canResetPassword && (
                            <Link href={route('password.request')} tabIndex={5} style={{ fontSize: '0.875rem' }}>
                                Forgot password?
                            </Link>
                        )}
                    </Box>
                    <TextField id="password" type="password" required tabIndex={2} autoComplete="current-password" fullWidth value={data.password} onChange={(e) => setData('password', e.target.value)} placeholder="Password" error={!!errors.password} helperText={errors.password} margin="dense" />
                </Box>

                <FormControlLabel control={<Checkbox id="remember" name="remember" checked={data.remember} onClick={() => setData('remember', !data.remember)} tabIndex={3} />} label="Remember me" />

                <Button type="submit" tabIndex={4} fullWidth variant="contained" color="primary" disabled={processing} startIcon={processing ? <LoaderCircle className="animate-spin" size={20} /> : null}>
                    Log in
                </Button>

                {status && (
                    <Typography variant="body2" color="success.main" align="center" sx={{ mt: 2 }}>
                        {status}
                    </Typography>
                )}
            </Box>
        </AuthLayout>
    );
}
