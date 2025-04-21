import { router } from '@inertiajs/react';
import { Add, ArrowBack } from '@mui/icons-material';
import { Box, Button, IconButton, Paper, Switch, Typography } from '@mui/material';

const TableSetting = ({ floorsdata }) => {
    return (
        <>
            <Box
                sx={{
                    bgcolor: '#FFFFFF',
                    minHeight: '100vh', // Keep for full viewport height
                    maxWidth: '450px',
                    mx: 'auto',
                    p: 1,
                    mt: 1,
                    display: 'flex', // Ensure proper flex layout
                    flexDirection: 'column', // Stack children vertically
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton sx={{ mr: 1 }}>
                        <ArrowBack fontSize="small" />
                    </IconButton>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500, fontSize: '18px', color: '#121212' }}>
                        Table Settings
                    </Typography>
                </Box>

                <Box
                    sx={{
                        p: 1.5,
                        mt: 1,
                        flexGrow: 1, // Allow this box to grow and fill available space
                        overflowY: 'auto', // Enable vertical scrolling for the floor list
                        maxHeight: 'calc(100vh - 120px)', // Adjust height to fit within viewport, accounting for header and button
                    }}
                >
                    <Typography variant="body2" sx={{ mb: 1.5, color: '#7F7F7F' }}>
                        Floor Plan List
                    </Typography>

                    {/* Add New Floor Button */}
                    <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Add />}
                        onClick={() => router.visit('/add/newfloor')}
                        sx={{
                            mb: 2,
                            py: 1.5,
                            color: '#063455',
                            borderColor: '#063455',
                            borderStyle: 'dashed',
                            borderWidth: '1px',
                            borderRadius: 1,
                            bgcolor: '#B0DEFF',
                            textTransform: 'none',
                            justifyContent: 'flex-start',
                            '&:hover': {
                                bgcolor: '#d6eafc',
                                borderColor: '#063455',
                            },
                        }}
                    >
                        Add New Floor
                    </Button>

                    {/* Render floor cards dynamically */}
                    {floorsdata?.map((floor, index) => (
                        <Paper
                            key={index}
                            elevation={0}
                            sx={{
                                mb: 1,
                                p: 2,
                                display: 'flex',
                                alignItems: 'center',
                                borderRadius: 1,
                                bgcolor: '#F6F6F6',
                                border: '1px solid #F1F1F2',
                            }}
                        >
                            <Box
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    bgcolor: '#FFFFFF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 2,
                                }}
                            >
                                <img src="/assets/home-roof.png" alt="" style={{ width: 18, height: 18 }} />
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '0.9rem', color: '#121212' }}>
                                    {floor.name || `Floor ${index + 1}`}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#666' }}>
                                    {floor.area || 'No area defined'}
                                </Typography>
                            </Box>
                            <Switch defaultChecked size="small" />
                            <img src="/assets/edit.png" alt="Edit" style={{ width: 20, height: 20, marginLeft: 15 }} />
                        </Paper>
                    ))}
                </Box>
            </Box>
        </>
    );
};

export default TableSetting;
