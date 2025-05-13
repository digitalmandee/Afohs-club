import { Box, Paper, Typography } from '@mui/material';

export default function AppAuthLayout({ children }) {
    return (
        <Box
            sx={{
                display: 'flex',
                height: '100vh',
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
                backgroundImage: `url(/assets/bgimage1.png)`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                },
            }}
        >
            {/* Left side with text */}
            <Box
                sx={{
                    flex: 1,
                    display: { xs: 'none', md: 'flex' },
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    p: 4,
                    zIndex: 2,
                }}
            >
                <Typography
                    variant="h5"
                    component="div"
                    sx={{
                        color: 'white',
                        maxWidth: '70%',
                        mb: 6,
                        fontWeight: 500,
                        lineHeight: 1.5,
                    }}
                >
                    AFOHS Club was established in Pakistan Air Force Falcon Complex. A total of 25.5 Kanal of land was demarcated by Air Headquarters
                    in PAF Falcon Complex for the establishment of "Community Centre and Club".
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        gap: 1,
                    }}
                >
                    {[1, 2, 3, 4, 5].map((_, index) => (
                        <Box
                            key={index}
                            sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: index === 0 ? 'white' : 'rgba(255, 255, 255, 0.5)',
                            }}
                        />
                    ))}
                </Box>
            </Box>

            {/* Right side with login form */}
            <Box
                sx={{
                    width: { xs: '100%', md: '500px' },
                    display: 'flex',
                    flexDirection: 'column',
                    mt: { xs: 1, md: 2 },
                    mb: { xs: 1, md: 2 },
                    mr: { xs: 1, md: 10 },
                    zIndex: 1,
                }}
            >
                    <Box
                        sx={{
                            width: '100%',
                            maxWidth: 540,
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            p: 4,
                            borderRadius: 1,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                            border: '1px solid #e0e0e0',
                            overflow:'hidden'
                        }}
                    >
                        {children}
                    </Box>
            </Box>
        </Box>
    );
}
