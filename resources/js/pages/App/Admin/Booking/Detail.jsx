"use client"

import { useState } from "react"
import {
    Box,
    Button,
    Container,
    Dialog,
    DialogContent,
    Grid,
    IconButton,
    InputAdornment,
    Paper,
    TextField,
    Typography,
    Divider,
} from "@mui/material"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import CloseIcon from "@mui/icons-material/Close"
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"
import PriceChangeIcon from "@mui/icons-material/PriceChange"
import "bootstrap/dist/css/bootstrap.min.css"
import SideNav from '@/components/App/AdminSideBar/SideNav'

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const BookingDetail = () => {
    const [open, setOpen] = useState(false);
    const [openPrice, setOpenPrice] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    const handleClickOpen = () => {
        setOpenPrice(true)
    }

    const handleClose = () => {
        setOpenPrice(false)
    }

    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
        // Add your search functionality here
        console.log("Searching for:", e.target.value)
    }

    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                }}
            >
                <Container maxWidth="md" sx={{ py: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <IconButton edge="start" sx={{ mr: 1 }}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            Booking Detail
                        </Typography>
                    </Box>

                    <Paper elevation={0} sx={{ mb: 2, border: "1px solid #eee", borderRadius: "4px" }}>
                        <Box sx={{ p: 2, bgcolor: "#f9f9f9", borderBottom: "1px solid #eee" }}>
                            <Typography variant="body2" sx={{ color: "#666" }}>
                                Booking ID: <span style={{ color: "#000", fontWeight: 500 }}>ROMG2323</span>
                            </Typography>
                        </Box>

                        <Grid container spacing={3} sx={{ p: 2 }}>
                            <Grid item xs={3}>
                                <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                                    Check In
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    20th March 2023
                                </Typography>
                            </Grid>
                            <Grid item xs={3}>
                                <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                                    Check Out
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    25th March 2023
                                </Typography>
                            </Grid>
                            <Grid item xs={3}>
                                <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                                    Total Nights
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    5
                                </Typography>
                            </Grid>
                            <Grid item xs={3}>
                                <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                                    Rooms
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    1
                                </Typography>
                            </Grid>
                        </Grid>

                        <Grid container spacing={3} sx={{ p: 2, pt: 0 }}>
                            <Grid item xs={4}>
                                <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                                    Adults
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    1
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                                    Children
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    0
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                                    Infants
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    0
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>

                    <Paper elevation={0} sx={{ mb: 2, border: "1px solid #eee", borderRadius: "4px" }}>
                        <Box sx={{ p: 2, bgcolor: "#f9f9f9", borderBottom: "1px solid #eee" }}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                Customer Detail
                            </Typography>
                        </Box>

                        <Box sx={{ p: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        Customer Name
                                    </Typography>
                                    <TextField fullWidth size="small" placeholder="Please input" variant="outlined" sx={{ mb: 2 }} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        Phone Number
                                    </Typography>
                                    <TextField fullWidth size="small" placeholder="000-000-000-0" variant="outlined" sx={{ mb: 2 }} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        Email
                                    </Typography>
                                    <TextField fullWidth size="small" placeholder="dummy@email.com" variant="outlined" sx={{ mb: 2 }} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        Phone Number
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="000 000 000 000"
                                        variant="outlined"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            border: "1px solid #ccc",
                                                            borderRadius: "4px",
                                                            px: 1,
                                                            py: 0.5,
                                                            mr: 1,
                                                            fontSize: "0.75rem",
                                                        }}
                                                    >
                                                        +92
                                                    </Box>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{ mb: 2 }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>

                    <Paper
                        elevation={0}
                        sx={{
                            mb: 2,
                            border: "1px solid #eee",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                        onClick={handleClickOpen}
                    >
                        <Box
                            sx={{
                                p: 2,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <PriceChangeIcon sx={{ mr: 1, color: "#003366" }} />
                                <Box>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        Price Detail
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "#666" }}>
                                        View total price details
                                    </Typography>
                                </Box>
                            </Box>
                            <KeyboardArrowRightIcon />
                        </Box>
                    </Paper>

                    <Box sx={{ display: "flex", justifyContent: "end", gap: "10px", mt: 4 }}>
                        <Button
                            variant="outlined"
                            sx={{
                                px: 4,
                                borderColor: "#ccc",
                                color: "#333",
                                textTransform: "none",
                                "&:hover": {
                                    borderColor: "#999",
                                    backgroundColor: "transparent",
                                },
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            sx={{
                                px: 4,
                                bgcolor: "#003366",
                                "&:hover": {
                                    bgcolor: "#002244",
                                },
                                textTransform: "none",
                            }}
                        >
                            Save Change
                        </Button>
                    </Box>
                    {/* Price Detail Modal */}
                    <Dialog
                        open={openPrice}
                        onClose={handleClose}
                        maxWidth="sm"
                        fullWidth
                        PaperProps={{
                            sx: {
                                position: "absolute",
                                right: 0,
                                top: 0,
                                m: 0,
                                height: "100%",
                                maxHeight: "100%",
                                borderRadius: 0,
                            },
                        }}
                    >
                        <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="h4" component="h2" sx={{ fontWeight: "bold" }}>
                                Price Detail
                            </Typography>
                            <IconButton onClick={handleClose} sx={{ p: 1 }}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <DialogContent sx={{ p: 0 }}>
                            <Paper elevation={0} sx={{ mx: 3, mb: 3, bgcolor: "#f9f9f9", p: 3, borderRadius: "4px" }}>
                                <Typography variant="body1" sx={{ color: "#666" }}>
                                    Hotel : <span style={{ color: "#003366", fontWeight: "bold" }}>Afohs Club</span>
                                </Typography>
                            </Paper>

                            <Box sx={{ px: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                                    Sub Total
                                </Typography>

                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                    <Typography variant="body1">Room Price</Typography>
                                    <Typography variant="body1">Rs 20,10</Typography>
                                </Box>

                                <Divider sx={{ my: 3 }} />

                                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                                    Extra
                                </Typography>

                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                    <Typography variant="body1">Service Fees</Typography>
                                    <Typography variant="body1">Rs 100</Typography>
                                </Box>

                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                    <Typography variant="body1">Payment Charges</Typography>
                                    <Typography variant="body1">Rs 100</Typography>
                                </Box>

                                <Divider sx={{ my: 3 }} />

                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                        Total
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                        Rs 5,110
                                    </Typography>
                                </Box>

                                <Divider sx={{ my: 3 }} />
                            </Box>

                            <Box sx={{ display: "flex", justifyContent: "flex-end", p: 3, mt: "auto" }}>
                                <Button
                                    variant="outlined"
                                    onClick={handleClose}
                                    sx={{
                                        mr: 2,
                                        px: 4,
                                        borderColor: "#ccc",
                                        color: "#333",
                                        textTransform: "none",
                                        "&:hover": {
                                            borderColor: "#999",
                                            backgroundColor: "transparent",
                                        },
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    sx={{
                                        px: 4,
                                        bgcolor: "#003366",
                                        "&:hover": {
                                            bgcolor: "#002244",
                                        },
                                        textTransform: "none",
                                    }}
                                >
                                    Continue
                                </Button>
                            </Box>
                        </DialogContent>
                    </Dialog>
                </Container>
            </div>
        </>
    )
}

export default BookingDetail
