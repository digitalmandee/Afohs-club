import React from 'react'
import { ContentCopy, KeyboardArrowUp, ArrowForward, Delete, Notifications } from "@mui/icons-material"
import { Paper, Box, Typography, Button, Badge, IconButton, Avatar, Divider, List, ListItem } from "@mui/material"
import CloseIcon from '@mui/icons-material/Close';
const OrderSaved = () => {
    return (
        <>
            {/* Order ID */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 1,
                }}
            >
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                    Order Id:
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    #001
                    <IconButton size="small" sx={{ ml: 0.5, p: 0.5 }}>
                        <ContentCopy fontSize="small" />
                    </IconButton>
                </Typography>
            </Box>

            {/* Customer Info */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 3,
                }}
            >
                <Avatar
                    sx={{
                        bgcolor: "#1976d2",
                        width: 36,
                        height: 36,
                        mr: 1,
                    }}
                >
                    T2
                </Avatar>
                <Box sx={{ mr: "auto" }}>
                    <Typography variant="caption" color="text.secondary">
                        Customer Name
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Ravi Kamil
                    </Typography>
                </Box>
                <IconButton size="small">
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            {/* Empty State */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    py: 4,
                    flex: 1,
                }}
            >
                <Avatar
                    sx={{
                        width: 80,
                        height: 80,
                        bgcolor: "#f5f5f5",
                        mb: 2,
                    }}
                >
                    <Box component="img" src="/placeholder.svg?height=40&width=40" alt="Shopping bag" />
                </Avatar>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                    No products have been selected yet
                </Typography>
            </Box>

            {/* Order Summary */}
            <Paper
                sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    mt: "auto",
                }}
            >
                <Box
                    sx={{
                        bgcolor: "#e3f2fd",
                        p: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Typography
                        variant="subtitle1"
                        sx={{
                            fontWeight: 500,
                            color: "#0c3b5c",
                        }}
                    >
                        Order Summary
                    </Typography>
                    <IconButton size="small" sx={{ color: "#0c3b5c" }}>
                        <KeyboardArrowUp />
                    </IconButton>
                </Box>

                <Divider sx={{ borderStyle: "dashed" }} />

                <Box sx={{ bgcolor: "#e3f2fd", px: 2, py: 1 }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Subtotal
                        </Typography>
                        <Typography variant="body2">Rs 0</Typography>
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography variant="body2" color="text.secondary">
                                Discount
                            </Typography>
                            <IconButton size="small" sx={{ ml: 0.5, p: 0.5 }}>
                                <ContentCopy fontSize="small" />
                            </IconButton>
                        </Box>
                        <Typography variant="body2">Rs 0</Typography>
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography variant="body2" color="text.secondary">
                                Tax 12%
                            </Typography>
                            <IconButton size="small" sx={{ ml: 0.5, p: 0.5 }}>
                                <ContentCopy fontSize="small" />
                            </IconButton>
                        </Box>
                        <Typography variant="body2">Rs 0</Typography>
                    </Box>

                    <Divider sx={{ borderStyle: "dashed", my: 1 }} />

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                        }}
                    >
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 500,
                                color: "#0c3b5c",
                            }}
                        >
                            Total Bill
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 500,
                                color: "#0c3b5c",
                            }}
                        >
                            Rs 0
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                        <Button
                            variant="outlined"
                            fullWidth
                            sx={{
                                borderColor: "#0c3b5c",
                                color: "#0c3b5c",
                                textTransform: "none",
                            }}
                        >
                            Save Order
                        </Button>
                        <Button
                            variant="contained"
                            fullWidth
                            endIcon={<ArrowForward />}
                            sx={{
                                bgcolor: "#0c3b5c",
                                textTransform: "none",
                                "&:hover": {
                                    bgcolor: "#072a42",
                                },
                            }}
                        // onClick={() => setShowPayment(true)}
                        >
                            Payment
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </>
    )
}

export default OrderSaved