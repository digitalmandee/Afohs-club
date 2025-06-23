import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import {
    TextField,
    Checkbox,
    FormControlLabel,
    Button,
    Typography,
    Box,
    Link,
    Paper
} from '@mui/material';

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
        <>
            <Head title="Admin Login" />
            <Box
                sx={{
                    minHeight: '100vh',
                    width: '100%',
                    backgroundImage: 'url("/assets/bgimage.png")', // Replace with your actual background image path
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 2,
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        width: '100%',
                        maxWidth: 500,
                        bgcolor: '#fff',
                        px: 4,
                        py: 5,
                        borderRadius: 2,
                        textAlign: 'center',
                    }}
                >
                    {/* Logo */}
                    <Box mb={2}>
                        <img src="/assets/logo.png" alt="Logo" style={{ height: 80, width:110 }} />
                    </Box>

                    {/* Heading */}
                    <Typography style={{ fontSize:'36px', fontWeight:500}}>
                        Admin Login
                    </Typography>
                    <Typography mb={3} style={{fontSize:18, fontWeight:400, color:'#7F7F7F'}}>
                        Hello, Enter your details here to login into dashboard
                    </Typography>

                    {/* Form */}
                    <Box component="form" onSubmit={submit} display="flex" flexDirection="column" gap={2}>
                        <TextField
                            label="Email"
                            placeholder="Enter admin email"
                            fullWidth
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            error={!!errors.email}
                            helperText={errors.email}
                        />

                        <TextField
                            label="Password"
                            type="password"
                            placeholder="Enter password"
                            fullWidth
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            error={!!errors.password}
                            helperText={errors.password}
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={data.remember}
                                    onClick={() => setData('remember', !data.remember)}
                                />
                            }
                            label="Remember me"
                            sx={{ textAlign: 'left' }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={processing}
                            sx={{
                                bgcolor: '#063455',
                                color: '#fff',
                                textTransform: 'none',
                                '&:hover': {
                                    bgcolor: '#001B30',
                                },
                            }}
                            startIcon={processing ? <LoaderCircle className="animate-spin" size={20} /> : null}
                        >
                            Log in
                        </Button>

                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                underline="hover"
                                sx={{ fontSize: '0.875rem', mt: 1, display: 'block', textAlign: 'right' }}
                            >
                                Forgot password?
                            </Link>
                        )}

                        {status && (
                            <Typography variant="body2" color="success.main" align="center" sx={{ mt: 2 }}>
                                {status}
                            </Typography>
                        )}
                    </Box>
                </Paper>
            </Box>
        </>
    );
}