import React, { useState } from "react";
import SideNav from "@/Components/SideBar/SideNav";
import {
    Box,
    IconButton,
    Typography,
    Paper,
    ToggleButtonGroup,
    ToggleButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Radio,
    Button,
} from "@mui/material";
import TakeAwayDialog from "./Takeaway";
import DineDialog from "./Dine";
import ReservationDialog from "./Reservation";
import FoodIcon from "@/Components/Icons/Food";
import ShopIcon from "@/Components/Icons/ShoppingBag";
import SofaIcon from "@/Components/Icons/Sofa";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const NewOrderDialog = ({ onClose }) => {
    const [orderType, setOrderType] = useState("dineIn");
    const [open, setOpen] = useState(false);
    const [seatingArea, setSeatingArea] = useState("indoor");
    const [filterOption, setFilterOption] = useState("all");
    const [selectedTable, setSelectedTable] = useState("T8");
    const [selectedWeek, setSelectedWeek] = useState(2);

    const weeks = [
        { id: 1, label: "Week 1", dateRange: "01 - 06 July" },
        { id: 2, label: "Week 2", dateRange: "07 - 13 July" },
        { id: 3, label: "Week 3", dateRange: "14 - 20 July" },
        { id: 4, label: "Week 4", dateRange: "21 - 27 July" },
        { id: 5, label: "Week 5", dateRange: "28 July - 03 August" },
    ];

    const handleOrderTypeChange = (event, newOrderType) => {
        if (newOrderType !== null) {
            setOrderType(newOrderType);
        }
    };

    const handleWeekChange = (weekId) => {
        setSelectedWeek(weekId);
    };

    const tables = [
        { id: "T8", capacity: 4, available: true },
        { id: "T9", capacity: 2, available: true },
        { id: "T10", capacity: 2, available: true },
        { id: "T11", capacity: 2, available: true },
        { id: "T12", capacity: 2, available: true },
        { id: "T2", capacity: 4, available: false },
        { id: "T5", capacity: 2, available: false },
        { id: "T6", capacity: 4, available: false },
        { id: "T7", capacity: 2, available: false },
    ];

    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open
                        ? `${drawerWidthOpen}px`
                        : `${drawerWidthClosed}px`,
                    transition: "margin-left 0.3s ease-in-out",
                    marginTop: "7rem",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        maxWidth:
                            orderType === "reservation" ? "1000px" : "732px",
                        mx: "auto",
                        mt: 5,
                        mb: 5,
                    }}
                >
                    {/* Select Week Panel - Only shown when reservation is selected */}
                    {orderType === "reservation" && (
                        <Box sx={{ width: "240px", flexShrink: 0 }}>
                            <Paper
                                elevation={2}
                                sx={{
                                    width: "100%",
                                    borderRadius: 1,
                                    overflow: "hidden",
                                }}
                            >
                                {/* Header */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        px: 2.5,
                                        py: 2,
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: "medium",
                                            fontSize: "1rem",
                                        }}
                                    >
                                        Select Week
                                    </Typography>
                                    <IconButton size="small">
                                        <HelpOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Box>

                                {/* Week List */}
                                <List disablePadding>
                                    {weeks.map((week) => (
                                        <ListItem
                                            key={week.id}
                                            disablePadding
                                            onClick={() =>
                                                handleWeekChange(week.id)
                                            }
                                            sx={{
                                                px: 2.5,
                                                py: 1.5,
                                                bgcolor:
                                                    selectedWeek === week.id
                                                        ? "#e3f2fd"
                                                        : "transparent",
                                                borderTop: "1px solid #f0f0f0",
                                                cursor: "pointer",
                                                "&:hover": {
                                                    bgcolor:
                                                        selectedWeek === week.id
                                                            ? "#e3f2fd"
                                                            : "#f5f5f5",
                                                },
                                            }}
                                        >
                                            <ListItemText
                                                primary={
                                                    <Typography
                                                        variant="body1"
                                                        sx={{
                                                            fontWeight:
                                                                "medium",
                                                        }}
                                                    >
                                                        {week.label}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            fontSize: "0.75rem",
                                                        }}
                                                    >
                                                        {week.dateRange}
                                                    </Typography>
                                                }
                                            />
                                            <ListItemSecondaryAction>
                                                <Radio
                                                    checked={
                                                        selectedWeek === week.id
                                                    }
                                                    onChange={() =>
                                                        handleWeekChange(
                                                            week.id
                                                        )
                                                    }
                                                    size="small"
                                                    sx={{
                                                        "&.Mui-checked": {
                                                            color: "#1976d2",
                                                        },
                                                    }}
                                                />
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>

                                {/* Select Button */}
                                <Box sx={{ p: 2 }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        sx={{
                                            bgcolor: "#0c3b5c",
                                            color: "white",
                                            py: 1.5,
                                            textTransform: "none",
                                            "&:hover": {
                                                bgcolor: "#072a42",
                                            },
                                        }}
                                    >
                                        Select
                                    </Button>
                                </Box>
                            </Paper>
                        </Box>
                    )}

                    {/* Main Content */}
                    <Paper
                        elevation={0}
                        sx={{
                            width: "100%",
                            maxWidth: "732px",
                            overflow: "hidden",
                            p: 2,
                            border: "2px solid #E3E3E3",
                            flexGrow: 1,
                        }}
                    >
                        <Box sx={{ px: 2, mb: 2 }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    mb: 1,
                                    color: "#121212",
                                    fontSize: "14px",
                                }}
                            >
                                Choose Order Type
                            </Typography>
                            <ToggleButtonGroup
                                value={orderType}
                                exclusive
                                onChange={handleOrderTypeChange}
                                aria-label="order type"
                                sx={{
                                    width: "100%",
                                    height: "100px",
                                    gap: 2,
                                    "& .MuiToggleButtonGroup-grouped:not(:first-of-type)":
                                        {
                                            borderLeft: "1px solid #063455",
                                        },
                                }}
                            >
                                <ToggleButton
                                    value="dineIn"
                                    aria-label="dine in"
                                    sx={{
                                        flex: 1,
                                        py: 1.5,
                                        flexDirection: "column",
                                        textTransform: "none",
                                        border: "1px solid #063455",
                                        backgroundColor:
                                            orderType === "dineIn"
                                                ? "#B0DEFF"
                                                : "transparent",
                                        color:
                                            orderType === "dineIn"
                                                ? "#1976d2"
                                                : "inherit",
                                        "&.Mui-selected": {
                                            backgroundColor: "#B0DEFF",
                                            color: "#1976d2",
                                            "&:hover": {
                                                backgroundColor: "#B0DEFF",
                                            },
                                        },
                                    }}
                                >
                                    <FoodIcon
                                        sx={{
                                            mb: 0.5,
                                            color:
                                                orderType === "dineIn"
                                                    ? "#063455"
                                                    : "inherit",
                                        }}
                                    />
                                    <Typography variant="body2">
                                        Dine In
                                    </Typography>
                                </ToggleButton>

                                <ToggleButton
                                    value="takeaway"
                                    aria-label="takeaway"
                                    sx={{
                                        flex: 1,
                                        py: 1.5,
                                        flexDirection: "column",
                                        textTransform: "none",
                                        border: "1px solid #063455",
                                        "&.Mui-selected": {
                                            backgroundColor: "#B0DEFF",
                                            color: "#1976d2",
                                            "&:hover": {
                                                backgroundColor: "#B0DEFF",
                                            },
                                        },
                                    }}
                                >
                                    <ShopIcon
                                        sx={{
                                            mb: 0.5,
                                            fill:
                                                orderType === "takeaway"
                                                    ? "#063455"
                                                    : "inherit",
                                        }}
                                    />
                                    <Typography variant="body2">
                                        Takeaway
                                    </Typography>
                                </ToggleButton>

                                <ToggleButton
                                    value="reservation"
                                    aria-label="reservation"
                                    sx={{
                                        flex: 1,
                                        py: 1.5,
                                        flexDirection: "column",
                                        textTransform: "none",
                                        border: "1px solid #063455",
                                        "&.Mui-selected": {
                                            backgroundColor: "#B0DEFF",
                                            color: "#1976d2",
                                            "&:hover": {
                                                backgroundColor: "#B0DEFF",
                                            },
                                        },
                                    }}
                                >
                                    <SofaIcon
                                        sx={{
                                            mb: 0.5,
                                            fill:
                                                orderType === "reservation"
                                                    ? "#063455"
                                                    : "inherit",
                                        }}
                                    />
                                    <Typography variant="body2">
                                        Reservation
                                    </Typography>
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Box>
                        {orderType === "dineIn" && <DineDialog />}
                        {orderType === "takeaway" && <TakeAwayDialog />}
                        {orderType === "reservation" && <ReservationDialog />}
                    </Paper>
                </Box>
            </div>
        </>
    );
};

export default NewOrderDialog;
