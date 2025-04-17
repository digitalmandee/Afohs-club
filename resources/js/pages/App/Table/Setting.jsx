import { router } from '@inertiajs/react';
import { Add, ArrowBack } from '@mui/icons-material';
import { Box, Button, IconButton, Paper, Switch, Typography } from '@mui/material';

const TableSetting = () => {
    return (
        <Box
            sx={{
                bgcolor: '#FFFFFF',
                minHeight: '100vh',
                maxWidth: '450px',
                mx: 'auto',
                p: 1,
                mt: 1,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    //   p: 2,
                    bgcolor: 'white',
                    //   borderBottom: "1px solid #f0f0f0",
                }}
            >
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
                    onClick={() => router.visit('/add/newfloor')} // 👈 This is the key part
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

                {/* Floor 1 - Indoor */}
                <Paper
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
                        <img
                            src="/assets/home-roof.png"
                            alt=""
                            style={{
                                width: 18,
                                height: 18,
                            }}
                        />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '0.9rem', color: '#121212' }}>
                            Floor 1
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                            Indoor Area
                        </Typography>
                    </Box>
                    <Switch defaultChecked size="small" />
                    <img
                        src="/assets/edit.png"
                        alt=""
                        style={{
                            width: 20,
                            height: 20,
                            marginLeft: 15,
                        }}
                    />
                </Paper>

                {/* Floor 1 - Outdoor */}
                <Paper
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
                        <img
                            src="/assets/tree.png"
                            alt=""
                            style={{
                                width: 18,
                                height: 18,
                            }}
                        />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
                            Floor 1
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                            Outdoor Area
                        </Typography>
                    </Box>
                    <Switch defaultChecked size="small" />
                    {/* <IconButton size="small" sx={{ ml: 1 }}>
                        <Edit fontSize="small" sx={{ color: "#999" }} />
                    </IconButton> */}
                    <img
                        src="/assets/edit.png"
                        alt=""
                        style={{
                            width: 20,
                            height: 20,
                            marginLeft: 15,
                        }}
                    />
                </Paper>

                {/* Floor 2 */}
                <Paper
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
                        <img
                            src="/assets/home-roof-activity.png"
                            alt=""
                            style={{
                                width: 18,
                                height: 18,
                            }}
                        />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
                            Floor 2
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                            Indoor Area
                        </Typography>
                    </Box>
                    <Switch defaultChecked size="small" />
                    <img
                        src="/assets/edit.png"
                        alt=""
                        style={{
                            width: 20,
                            height: 20,
                            marginLeft: 15,
                        }}
                    />
                </Paper>
            </Box>
        </Box>
    );
};

export default TableSetting;
