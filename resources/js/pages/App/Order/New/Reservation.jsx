import React, { useState } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    Paper,
    Radio,
    RadioGroup,
    FormControlLabel,
    InputAdornment,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    ToggleButtonGroup,
    ToggleButton,
} from "@mui/material";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import EventNoteIcon from "@mui/icons-material/EventNote";
import { router } from "@inertiajs/react";

const ReservationDialog = () => {
    const [orderType, setOrderType] = useState("reservation");
    const [paymentType, setPaymentType] = useState("percentage");
    const [selectedDate, setSelectedDate] = useState(7);
    const [selectedTime, setSelectedTime] = useState("10:00 am");
    const [customTime, setCustomTime] = useState(false);
    const [selectedWeek, setSelectedWeek] = useState(2);

    const weeks = [
        { id: 1, label: "Week 1", dateRange: "01 - 06 July" },
        { id: 2, label: "Week 2", dateRange: "07 - 13 July" },
        { id: 3, label: "Week 3", dateRange: "14 - 20 July" },
        { id: 4, label: "Week 4", dateRange: "21 - 27 July" },
        { id: 5, label: "Week 5", dateRange: "28 July - 03 August" },
    ];

    const handleWeekChange = (weekId) => {
        setSelectedWeek(weekId);
    };

    const handleTimeChange = (event, newTime) => {
        if (newTime) {
            setSelectedTime(newTime);
            setCustomTime(newTime === "custom");
        }
    };

    const handleOrderTypeChange = (newType) => {
        setOrderType(newType);
    };

    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    width: "100%",
                    maxWidth: "900px",
                    mx: "auto",
                    p: 2,
                    gap: 2,
                }}
            >
                <Box sx={{ flexGrow: 1 }}>
                    {/* Order ID */}
                    <Box sx={{ mb: 2 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                bgcolor: "#f5f5f5",
                                p: 1.5,
                                borderRadius: 1,
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mr: 1 }}
                                >
                                    Order id:
                                </Typography>
                                <Typography
                                    variant="body1"
                                    fontWeight="medium"
                                    color="#063455"
                                >
                                    #RSVO01
                                </Typography>
                            </Box>
                        </Paper>
                    </Box>

                    {/* Customer Name */}
                    <Box sx={{ mb: 2 }}>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                        >
                            Customer Name or Scan Member Card
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Entry name"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton edge="end">
                                            <QrCodeScannerIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    {/* Customer Qty and Down Payment */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                            >
                                Customer Qty
                            </Typography>
                            <Box sx={{ display: "flex" }}>
                                <TextField
                                    size="small"
                                    type="number"
                                    defaultValue="10"
                                    sx={{ width: "60%" }}
                                />
                                <Button
                                    variant="outlined"
                                    sx={{
                                        ml: 1,
                                        textTransform: "none",
                                        color: "#666",
                                        borderColor: "#ddd",
                                        flexGrow: 1,
                                    }}
                                >
                                    Person
                                </Button>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    mb: 1,
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Down Payment
                                </Typography>
                                <Box
                                    sx={{
                                        ml: "auto",
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    <Radio
                                        checked={paymentType === "percentage"}
                                        onChange={() =>
                                            setPaymentType("percentage")
                                        }
                                        size="small"
                                        sx={{ p: 0.5 }}
                                    />
                                    <Typography
                                        variant="body2"
                                        sx={{ ml: 0.5 }}
                                    >
                                        Percentage
                                    </Typography>
                                </Box>
                            </Box>
                            <TextField
                                fullWidth
                                size="small"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Typography variant="body2">
                                                Rs
                                            </Typography>
                                        </InputAdornment>
                                    ),
                                }}
                                defaultValue="10"
                            />
                        </Grid>
                    </Grid>

                    {/* Select Date */}
                    <Box sx={{ mb: 2 }}>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 1,
                            }}
                        >
                            <Typography variant="body2" color="text.secondary">
                                Select Date
                            </Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    cursor: "pointer",
                                }}
                            >
                                <Typography variant="body2">
                                    July 2024
                                </Typography>
                                <KeyboardArrowDownIcon fontSize="small" />
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1,
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    bgcolor: "#e3f2fd",
                                    p: 0.5,
                                    borderRadius: 1,
                                }}
                            >
                                <CalendarTodayIcon
                                    fontSize="small"
                                    sx={{ color: "#1976d2" }}
                                />
                                <Typography
                                    variant="caption"
                                    sx={{ ml: 0.5, color: "#1976d2" }}
                                >
                                    Week 2
                                </Typography>
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                width: "100%",
                                border: "1px solid #e0e0e0",
                                borderRadius: 1,
                                overflow: "hidden",
                            }}
                        >
                            {["Sun", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(
                                (day, index) => (
                                    <Box
                                        key={day}
                                        sx={{
                                            flex: 1,
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            p: 1,
                                            bgcolor:
                                                selectedDate === index + 7
                                                    ? "#bbdefb"
                                                    : "transparent",
                                            cursor: "pointer",
                                            borderRight:
                                                index < 6
                                                    ? "1px solid #e0e0e0"
                                                    : "none",
                                        }}
                                        onClick={() =>
                                            setSelectedDate(index + 7)
                                        }
                                    >
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            {day}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            fontWeight={
                                                selectedDate === index + 7
                                                    ? "medium"
                                                    : "normal"
                                            }
                                        >
                                            {index + 7}
                                        </Typography>
                                    </Box>
                                )
                            )}
                        </Box>
                    </Box>

                    {/* Select Time of Attendance */}
                    <Box sx={{ mb: 2 }}>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                        >
                            Select Time of Attendance
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1 }}>
                            {[
                                "10:00 am",
                                "13:00 pm",
                                "14:00 pm",
                                "18:00 pm",
                                "Custom",
                            ].map((time) => (
                                <Box
                                    key={time}
                                    onClick={() => {
                                        setSelectedTime(time.toLowerCase());
                                        setCustomTime(time === "Custom");
                                    }}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        border: "1px solid #e0e0e0",
                                        borderRadius: 1,
                                        p: 1,
                                        flex: 1,
                                        cursor: "pointer",
                                    }}
                                >
                                    <Radio
                                        checked={
                                            selectedTime ===
                                                time.toLowerCase() ||
                                            (customTime && time === "Custom")
                                        }
                                        size="small"
                                        sx={{ p: 0.5, mr: 0.5 }}
                                    />
                                    <Typography variant="body2">
                                        {time}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* Custom Time Selection */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6}>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                            >
                                Select Custom Time
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Select time"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AccessTimeIcon
                                                fontSize="small"
                                                color="action"
                                            />
                                        </InputAdornment>
                                    ),
                                }}
                                disabled={!customTime}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                            >
                                Select Custom Time
                            </Typography>
                            <Box
                                sx={{
                                    border: "1px solid #e0e0e0",
                                    borderRadius: 1,
                                    p: 1,
                                    height: 40,
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <Typography variant="body1" fontWeight="medium">
                                    23 Person
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Footer Buttons */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 1,
                        }}
                    >
                        <Button
                            variant="text"
                            sx={{
                                color: "#666",
                                textTransform: "none",
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="outlined"
                            sx={{
                                textTransform: "none",
                                borderColor: "#ddd",
                                color: "#333",
                            }}
                        >
                            Save Order
                        </Button>
                        <Button
                            variant="contained"
                            endIcon={<ArrowForwardIcon />}
                            sx={{
                                bgcolor: "#0c3b5c",
                                "&:hover": {
                                    bgcolor: "#072a42",
                                },
                                textTransform: "none",
                            }}
                            onClick={() => router.visit("/all/order")}
                        >
                            Choose Menu
                        </Button>
                    </Box>
                </Box>
            </Box>
        </>
    );
};

export default ReservationDialog;
