import React from 'react';
import { 
    Box, 
    Card, 
    CardContent, 
    Typography, 
    Avatar, 
    Grid, 
    Chip,
    Divider,
    Paper
} from '@mui/material';
import { format } from 'date-fns';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PersonIcon from '@mui/icons-material/Person';
import CategoryIcon from '@mui/icons-material/Category';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

export default function SubscriptionDetails({ subscription }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return '#4caf50';
            case 'expired':
                return '#f44336';
            case 'pending':
                return '#ff9800';
            default:
                return '#757575';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active':
                return <CheckCircleIcon />;
            case 'expired':
                return <CancelIcon />;
            case 'pending':
                return <PendingIcon />;
            default:
                return <PendingIcon />;
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', py: 4, px: 2 }}>
            <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #063455 0%, #0a4a73 100%)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 600, mb: 1 }}>
                                Subscription Details
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
                                AFOHS Club Subscription Information
                            </Typography>
                        </Box>
                        <QrCode2Icon sx={{ fontSize: 60, color: '#fff', opacity: 0.8 }} />
                    </Box>
                </Paper>

                <Grid container spacing={3}>
                    {/* Member Information */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={2}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <PersonIcon sx={{ color: '#063455', mr: 1 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#063455' }}>
                                        Member Information
                                    </Typography>
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <Avatar 
                                        src={subscription.member?.profile_photo || '/placeholder.svg'} 
                                        alt={subscription.member?.full_name}
                                        sx={{ width: 80, height: 80, mr: 2, border: '3px solid #063455' }}
                                    />
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {subscription.member?.full_name || 'N/A'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {subscription.member?.membership_no || 'N/A'}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">Email:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {subscription.member?.personal_email || 'N/A'}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">Phone:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {subscription.member?.mobile_number_a || 'N/A'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Subscription Information */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={2}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <CategoryIcon sx={{ color: '#063455', mr: 1 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#063455' }}>
                                        Subscription Information
                                    </Typography>
                                </Box>
                                <Divider sx={{ mb: 2 }} />

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            Status
                                        </Typography>
                                        <Chip 
                                            icon={getStatusIcon(subscription.status)}
                                            label={subscription.status?.toUpperCase() || 'N/A'}
                                            sx={{
                                                backgroundColor: getStatusColor(subscription.status),
                                                color: '#fff',
                                                fontWeight: 600,
                                                fontSize: '14px'
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">Category:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {subscription.subscription_category?.name || 'N/A'}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">Type:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {subscription.subscription_type?.name || 'N/A'}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">Fee:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#063455' }}>
                                            Rs. {subscription.subscription_category?.fee?.toLocaleString() || '0'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Validity Period */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={2}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <CalendarTodayIcon sx={{ color: '#063455', mr: 1 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#063455' }}>
                                        Validity Period
                                    </Typography>
                                </Box>
                                <Divider sx={{ mb: 2 }} />

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">Valid From:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {subscription.valid_from ? format(new Date(subscription.valid_from), 'dd MMM yyyy') : 'N/A'}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">Valid To:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {subscription.valid_to ? format(new Date(subscription.valid_to), 'dd MMM yyyy') : 'N/A'}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">Created At:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {subscription.created_at ? format(new Date(subscription.created_at), 'dd MMM yyyy HH:mm') : 'N/A'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Invoice Information */}
                    {subscription.invoice && (
                        <Grid item xs={12} md={6}>
                            <Card elevation={2}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <ReceiptIcon sx={{ color: '#063455', mr: 1 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#063455' }}>
                                            Payment Information
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ mb: 2 }} />

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">Invoice No:</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {subscription.invoice.invoice_no || 'N/A'}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">Amount Paid:</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                                                Rs. {subscription.invoice.total_price?.toLocaleString() || '0'}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">Payment Method:</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {subscription.invoice.payment_method?.toUpperCase() || 'N/A'}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">Payment Date:</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {subscription.invoice.payment_date ? format(new Date(subscription.invoice.payment_date), 'dd MMM yyyy') : 'N/A'}
                                            </Typography>
                                        </Box>

                                        <Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                Payment Status:
                                            </Typography>
                                            <Chip 
                                                label={subscription.invoice.status?.toUpperCase() || 'N/A'}
                                                size="small"
                                                sx={{
                                                    backgroundColor: subscription.invoice.status === 'paid' ? '#4caf50' : '#ff9800',
                                                    color: '#fff',
                                                    fontWeight: 500
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}

                    {/* QR Code */}
                    {subscription.qr_code && (
                        <Grid item xs={12}>
                            <Card elevation={2}>
                                <CardContent>
                                    <Box sx={{ textAlign: 'center', py: 2 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#063455', mb: 2 }}>
                                            Subscription QR Code
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                            <img 
                                                src={`/${subscription.qr_code}`} 
                                                alt="Subscription QR Code"
                                                style={{ 
                                                    maxWidth: '300px', 
                                                    border: '3px solid #063455',
                                                    borderRadius: '8px',
                                                    padding: '10px',
                                                    backgroundColor: '#fff'
                                                }}
                                            />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                            Scan this QR code to view subscription details
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                </Grid>
            </Box>
        </Box>
    );
}
