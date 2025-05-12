import { useState } from "react"
import { TextField, Button, Paper, Typography, Grid, Box, IconButton } from "@mui/material"
import { ArrowBack } from "@mui/icons-material"
import "bootstrap/dist/css/bootstrap.min.css"
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router } from '@inertiajs/react';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const PersonalInformationForm = () => {
    const [open, setOpen] = useState(false);
    const [gender, setGender] = useState("")
    const [genderOpen, setGenderOpen] = useState(false)

    const handleGenderChange = (event) => {
        setGender(event.target.value)
        setGenderOpen(false)
    }

    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                    backgroundColor: '#F6F6F6',
                }}
            >
                <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", padding: "20px" }}>
                    {/* Header */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2, mt: 2 }}>
                        <IconButton sx={{ color: "#000" }}>
                            <ArrowBack />
                        </IconButton>
                        <Typography variant="h5" component="h1" sx={{ ml: 1, fontWeight: 500, color: "#333" }}>
                            Personal Information
                        </Typography>
                    </Box>

                    {/* Progress Steps */}
                    <Paper
                        elevation={0}
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: 2,
                            mb: 3,
                            backgroundColor: "#f0f0f0",
                            borderRadius: "4px",
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Box
                                sx={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: "50%",
                                    backgroundColor: "#2c3e50",
                                    color: "white",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    mr: 2,
                                }}
                            >
                                1
                            </Box>
                            <Typography sx={{ fontWeight: 500 }}>Personal Information</Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Box
                                sx={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: "50%",
                                    backgroundColor: "#e0e0e0",
                                    color: "#333",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    mr: 2,
                                }}
                            >
                                2
                            </Box>
                            <Typography sx={{ fontWeight: 500 }}>Membership Information</Typography>
                        </Box>
                    </Paper>

                    {/* Main Form */}
                    <Grid container >
                        {/* Contact Information Section */}
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3, mb: 3, boxShadow: "none", border: "1px solid #e0e0e0" }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                                    <Typography variant="h6" component="h2" sx={{ fontWeight: 500, color: "#2c3e50" }}>
                                        Contact Information
                                    </Typography>
                                    <Box sx={{ borderBottom: "1px dashed #ccc", flexGrow: 1, ml: 2 }}></Box>
                                </Box>

                                <Grid container spacing={3}>
                                    {/* Mobile Number (A) */}
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            Mobile Number (A)
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            placeholder="03XXXXXXXX"
                                            size="small"
                                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "4px" } }}
                                        />
                                    </Grid>

                                    {/* Mobile Number (B) */}
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            Mobile Number (B)
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            placeholder="03XXXXXXXX"
                                            size="small"
                                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "4px" } }}
                                        />
                                    </Grid>

                                    {/* Mobile Number (C) */}
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            Mobile Number (C)
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            placeholder="03XXXXXXXX"
                                            size="small"
                                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "4px" } }}
                                        />
                                    </Grid>

                                    {/* Telephone Number */}
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            Telephone Number
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            placeholder="Enter telephone number"
                                            size="small"
                                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "4px" } }}
                                        />
                                    </Grid>

                                    {/* Personal Email */}
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            Personal Email
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            placeholder="member1@gmail.com"
                                            size="small"
                                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "4px" } }}
                                        />
                                    </Grid>

                                    {/* Critical Email */}
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            Critical Email
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            placeholder="member2@gmail.com"
                                            size="small"
                                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "4px" } }}
                                        />
                                    </Grid>
                                </Grid>
                                {/* In Case of Emergency Section */}

                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, mt: 3 }}>
                                    <Typography variant="h6" component="h2" sx={{ fontWeight: 500, color: "#2c3e50" }}>
                                        In Case of Emergency
                                    </Typography>
                                    <Box sx={{ borderBottom: "1px dashed #ccc", flexGrow: 1, ml: 2 }}></Box>
                                </Box>

                                <Grid container spacing={3}>
                                    {/* Name */}
                                    <Grid item xs={12}>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            Name
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            placeholder="Enter Full Name"
                                            size="small"
                                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "4px" } }}
                                        />
                                    </Grid>

                                    {/* Relation */}
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            Relation
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            placeholder="Enter Relationship"
                                            size="small"
                                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "4px" } }}
                                        />
                                    </Grid>

                                    {/* Contact Number */}
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            Contact Number
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            placeholder="03XXXXXXXX"
                                            size="small"
                                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "4px" } }}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* Current Address and Permanent Address Sections */}
                        <Grid item xs={12} md={6}>
                            <Paper
                                sx={{
                                    p: 3,
                                    mb: 3,
                                    boxShadow: "none",
                                    border: "1px solid #e0e0e0"
                                }}
                            >
                                {/* Current Address Section */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        mb: 3
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        component="h2"
                                        sx={{ fontWeight: 500, color: "#2c3e50" }}
                                    >
                                        Current Address
                                    </Typography>
                                    <Box
                                        sx={{
                                            borderBottom: "1px dashed #ccc",
                                            flexGrow: 1,
                                            ml: 2
                                        }}
                                    ></Box>
                                </Box>

                                <Grid container spacing={3}>
                                    {/* Address */}
                                    <Grid item xs={12}>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            Address
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            placeholder="Enter complete address"
                                            size="small"
                                            sx={{
                                                "& .MuiOutlinedInput-root": { borderRadius: "4px" }
                                            }}
                                        />
                                    </Grid>

                                    {/* City */}
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            City
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            placeholder="Enter city name"
                                            size="small"
                                            sx={{
                                                "& .MuiOutlinedInput-root": { borderRadius: "4px" }
                                            }}
                                        />
                                    </Grid>

                                    {/* Country */}
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            Country
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            placeholder="Enter country name e.g. Pakistan"
                                            size="small"
                                            sx={{
                                                "& .MuiOutlinedInput-root": { borderRadius: "4px" }
                                            }}
                                        />
                                    </Grid>
                                </Grid>

                                {/* Permanent Address Section */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        mb: 3,
                                        mt: 3
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        component="h2"
                                        sx={{ fontWeight: 500, color: "#2c3e50" }}
                                    >
                                        Permanent Address
                                    </Typography>
                                    <Box
                                        sx={{
                                            borderBottom: "1px dashed #ccc",
                                            flexGrow: 1,
                                            ml: 2
                                        }}
                                    ></Box>
                                </Box>

                                <Grid container spacing={3}>
                                    {/* Address */}
                                    <Grid item xs={12}>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            Address
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            placeholder="Enter complete address"
                                            size="small"
                                            sx={{
                                                "& .MuiOutlinedInput-root": { borderRadius: "4px" }
                                            }}
                                        />
                                    </Grid>

                                    {/* City */}
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            City
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            placeholder="Enter city name"
                                            size="small"
                                            sx={{
                                                "& .MuiOutlinedInput-root": { borderRadius: "4px" }
                                            }}
                                        />
                                    </Grid>

                                    {/* Country */}
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            Country
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            placeholder="Enter country name e.g. Pakistan"
                                            size="small"
                                            sx={{
                                                "& .MuiOutlinedInput-root": { borderRadius: "4px" }
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                                {/* Action Buttons */}
                                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mb: 3, mt: 4, }}>
                                    <Button
                                        variant="outlined"
                                        sx={{
                                            textTransform: "none",
                                            borderColor: "#ccc",
                                            color: "#333",
                                            "&:hover": {
                                                borderColor: "#999",
                                                backgroundColor: "#f5f5f5",
                                            },
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="contained"
                                        sx={{
                                            textTransform: "none",
                                            backgroundColor: "#0c4b6e",
                                            "&:hover": {
                                                backgroundColor: "#083854",
                                            },
                                        }}
                                        onClick={()=>router.visit('/admin/add/membership/information')}
                                    >
                                        Save & Next
                                    </Button>
                                </Box>
                            </Paper>
                        </Grid>

                    </Grid>

                </div>
            </div>
        </>
    )
}

export default PersonalInformationForm
