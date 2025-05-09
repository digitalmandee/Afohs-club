import { Box, Button, Chip, Paper, Typography } from '@mui/material';

const CancelOrder = ({ onClose, onConfirm }) => {
    return (
        <Box
            sx={{
                position: 'fixed', // Ensures it's positioned relative to the viewport
                top: '1px',
                left: '50%',
                transform: 'translate(-50%, 0)', // Centers it horizontally
                zIndex: 2000, // Ensures it appears above other content
                bgcolor: 'rgba(0,0,0,0.5)', // Semi-transparent background
                width: '100vw',
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start', // Aligns it near the top
                pt: 5, // Adds padding to move it slightly down
            }}
        >
            <Paper
                sx={{
                    width: '100%',
                    maxWidth: 400,
                    borderRadius: 1,
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
            >
                {/* Header */}
                <Box sx={{ p: 3, pb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color:'#121212' }}>
                        Cancel Order
                    </Typography>

                    <Typography variant="body2" sx={{ color: '#121212', fontWeight:700, fontSize:'20px', mt: 1 }}>
                        Are you sure, you want to cancel this order
                    </Typography>
                </Box>

                {/* Action Buttons */}
                <Box
                    sx={{
                        display: 'flex',
                        borderTop: '1px solid #f0f0f0',
                        //   width:'99%',
                        p: 2,
                        justifyContent: 'space-evenly',
                    }}
                >
                    <Button
                        fullWidth
                        sx={{
                            py: 1.5,
                            width: '150px',
                            border: '1px solid black',
                            borderRadius: 0,
                            color: '#4b5563',
                            textTransform: 'none',
                            fontSize: '0.875rem',
                            fontWeight: 'medium',
                            '&:hover': {
                                bgcolor: '#f8f9fa',
                            },
                        }}
                        onClick={onClose}
                    >
                        No
                    </Button>

                    {/* <Divider orientation="vertical" flexItem /> */}

                    <Button
                        fullWidth
                        sx={{
                            py: 1.5,
                            width: '150px',
                            bgcolor: '#f44336',
                            color: 'white',
                            borderRadius: 0,
                            textTransform: 'none',
                            fontSize: '0.875rem',
                            fontWeight: 'medium',
                            '&:hover': {
                                bgcolor: '#e53935',
                            },
                        }}
                        onClick={onConfirm}
                    >
                        Confirm Cancel
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default CancelOrder;
