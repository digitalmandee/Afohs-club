import { useState } from "react";
import { router } from "@inertiajs/react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    Paper,
    Container,
    Link,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Head } from "@inertiajs/react";

const AdminLogin = () => {
    const [companyId, setCompanyId] = useState("");
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center", // 👈 center vertically
                    justifyContent: "center", // 👈 center horizontally
                    height: "100vh",
                    width: "100%",
                    position: "relative",
                    overflow: "hidden",
                    backgroundImage: `url('/assets/bgimage.png')`,
                    backgroundSize: "cover", // 👈 this ensures it covers the entire area
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    },
                }}
            >
                <Box
                    sx={{
                        width: { xs: "100%", md: "540px" },
                        display: "flex",
                        flexDirection: "column",
                        p: 1,
                        // m: { xs: 1, md: 1 },
                        mt: { xs: 1, md: 1 },
                        mb: { xs: 1, md: 1 },
                        mr: { xs: 1, md: 1 },
                        zIndex: 1,
                    }}
                >
                    <Paper
                        elevation={4}
                        sx={{
                            pb: 4,
                            borderRadius: 2,
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            backdropFilter: "blur(10px)",
                            overflow: "auto",
                            scrollbarWidth: "none", // Firefox
                            "&::-webkit-scrollbar": {
                                display: "none", // Chrome, Safari, Edge
                            },
                        }}
                    >
                        <Container
                            maxWidth="sm"
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                height: "75vh",
                                px: 4,
                                py: 2
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    // mb: 1,
                                }}
                            >
                                <Box
                                    component="img"
                                    src="/assets/Logo.png"
                                    alt="AFOHS Club Logo"
                                    sx={{
                                        width: 100,
                                        height: 80,
                                        mb: 3,
                                    }}
                                />
                                <Typography
                                    variant="h5"
                                    component="h1"
                                    sx={{
                                        fontWeight: 500,
                                        fontSize: "30px",
                                        mb: 1,
                                        color: "#3F4E4F",
                                    }}
                                >
                                    Admin Login
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: "#7F7F7F",
                                        textAlign: "flex-start",
                                        // mt:1,
                                        mb: 2,
                                        fontSize: "16px",
                                    }}
                                >
                                    Enter your details here to login into Dashboard
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 3, px: 2 }}>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        mb: 1,
                                        fontWeight: 500,
                                        color: "#121212",
                                        fontSize: "14px",
                                    }}
                                >
                                    Email
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Enter admin email"
                                    value={companyId}
                                    onChange={(e) =>
                                        setCompanyId(e.target.value)
                                    }
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 1,
                                        },
                                    }}
                                />
                            </Box>

                            <Box sx={{ mb: 3, px: 2 }}>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        mb: 1,
                                        fontWeight: 500,
                                        color: "#121212",
                                        fontSize: "14px",
                                    }}
                                >
                                    Password
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Enter password"
                                    value={companyId}
                                    onChange={(e) =>
                                        setCompanyId(e.target.value)
                                    }
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 1,
                                        },
                                    }}
                                />
                            </Box>
                            <Box sx={{
                                mt:1,
                                px:2
                            }}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    // endIcon={<ArrowForwardIcon />}
                                    sx={{
                                        // mt: 1,
                                        mb: 1,
                                        py: 1.5,
                                        // px: 14,
                                        backgroundColor: "#063455",
                                        "&:hover": {
                                            backgroundColor: "#0D3B66",
                                        },
                                        borderRadius: 1,
                                        textTransform: "none",
                                    }}
                                    onClick={() =>
                                        router.visit("/admin/dashboard")
                                    }
                                >
                                    Login
                                </Button>
                            </Box>
                        </Container>
                    </Paper>
                </Box>
            </Box>
        </>
    );
};

export default AdminLogin;