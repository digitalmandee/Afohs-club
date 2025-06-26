'use client';
import SideNav from '@/components/App/Sidebar/SideNav';
import { router, usePage } from '@inertiajs/react';
import { Alert, Box, Button, IconButton, Snackbar, TextField, Typography, CircularProgress, Paper } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useRef, useState } from 'react';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';
import axios from 'axios';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

export default function AddressType() {
    const [open, setOpen] = useState(true);
    const { flash } = usePage().props;
    const dialogContentRef = useRef(null);

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    useEffect(() => {
        if (flash?.success) {
            setShowConfirmation(true);
        }
        if (flash?.error) {
            setErrorMessage(flash.error);
            setShowError(true);
        }
    }, [flash]);

    // useEffect(() => {
    //     if (openAddMenu && dialogContentRef.current) {
    //         dialogContentRef.current.focus();
    //     }
    // }, [openAddMenu]);

    const [tax, setTax] = useState('');
    const [originalTax, setOriginalTax] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Fetch tax value from database
    useEffect(() => {
        axios
            .get(route('setting.index'))
            .then((response) => {
                const taxValue = response.data.tax?.toString() || '12';
                setTax(taxValue);
                setOriginalTax(taxValue);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Failed to load tax setting:', error);
                enqueueSnackbar('Failed to load tax setting.', { variant: 'error' });
                setLoading(false);
            });
    }, []);

    // Handle tax input change
    const handleTaxChange = (e) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
            setTax(value);
        }
    };

    // Handle save action
    const handleSave = () => {
        const newTax = parseFloat(tax);
        if (isNaN(newTax) || newTax < 0 || newTax > 100) {
            enqueueSnackbar('Tax must be a number between 0 and 100.', { variant: 'error' });
            return;
        }

        setSaving(true);
        axios
            .put(route('setting.update'), { tax: newTax })
            .then(() => {
                setOriginalTax(tax);
                enqueueSnackbar('Tax updated successfully!', { variant: 'success' });
                setSaving(false);
            })
            .catch((error) => {
                console.error('Failed to update tax:', error);
                enqueueSnackbar('Failed to update tax.', { variant: 'error' });
                setSaving(false);
            });
    };

    // Handle Enter key press
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSave();
        }
    };
    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                }}
                // aria-hidden={openAddMenu ? 'true' : undefined}
            >
                <div className="container-fluid bg-light py-4">
                    <div style={{ background: '#ffff', padding: '20px', borderRadius: '10px' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                            <Paper elevation={0} sx={{ width: '100%', maxWidth: 500, borderRadius: 1, overflow: 'hidden', p: 3 }}>
                                {/* Header */}
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <IconButton onClick={() => router.visit(route('dashboard'))} sx={{ mr: 1 }}>
                                        <ArrowBackIcon fontSize="small" />
                                    </IconButton>
                                    <Typography variant="h6" sx={{ fontWeight: 500, color: '#063455' }}>
                                        Edit Tax Rate
                                    </Typography>
                                </Box>

                                {/* Loading State */}
                                {loading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                        <CircularProgress size={24} />
                                    </Box>
                                ) : (
                                    <Box>
                                        {/* Tax Input Field */}
                                        <Box sx={{ mb: 3 }}>
                                            <Typography variant="body1" sx={{ mb: 1, fontSize: '14px', fontWeight: 500, color: '#063455' }}>
                                                Tax Rate (%)
                                            </Typography>
                                            <TextField size="small" value={tax} onChange={handleTaxChange} onKeyDown={handleKeyDown} fullWidth placeholder="Enter tax percentage" inputProps={{ style: { textAlign: 'left' } }} sx={{ bgcolor: '#fff' }} />
                                        </Box>

                                        {/* Action Buttons */}
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1 }}>
                                            <Button
                                                variant="contained"
                                                onClick={handleSave}
                                                disabled={saving || tax === originalTax}
                                                sx={{
                                                    bgcolor: '#003366',
                                                    color: '#FFFFFF',
                                                    textTransform: 'none',
                                                    fontSize: '14px',
                                                    px: 3,
                                                    '&:hover': { bgcolor: '#002244' },
                                                    '&.Mui-disabled': { bgcolor: '#cccccc' },
                                                }}
                                            >
                                                {saving ? <CircularProgress size={20} color="inherit" /> : 'Save'}
                                            </Button>
                                        </Box>
                                    </Box>
                                )}
                            </Paper>
                        </Box>
                    </div>
                </div>
            </div>

            {/* Snackbar: Success */}
            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}
