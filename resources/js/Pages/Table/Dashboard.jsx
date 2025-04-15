import React, { useState } from "react";
import SideNav from "@/Components/SideBar/SideNav";
import {
    Box,
    Typography,
    IconButton,
    Button,
    Paper,
    Tabs,
    Tab,
    Grid,
    Divider,
    Badge,
} from "@mui/material";
import {
    ArrowBack,
    HelpOutline,
    Settings,
    KeyboardArrowDown,
} from "@mui/icons-material";
import Table1Icon from "@/Components/Icons/Table1";
import TableIcon from "@/Components/Icons/BTable";
import Table2Icon from "@/Components/Icons/CTable";

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const TableManagement = () => {
    const [open, setOpen] = useState(false);
    const [selectedFloor, setSelectedFloor] = useState(1);
    const [selectedDate, setSelectedDate] = useState(7);

    const handleFloorChange = (event, newValue) => {
        setSelectedFloor(newValue);
    };

    const handleDateClick = (date) => {
        setSelectedDate(date);
    };

    // Days of the week with dates and reservation indicators
    const days = [
        { day: "Sun", date: 7, hasReservations: true },
        { day: "Mo", date: 8, hasReservations: true },
        { day: "Tu", date: 9, hasReservations: true },
        { day: "We", date: 10, hasReservations: false },
        { day: "Th", date: 11, hasReservations: false },
        { day: "Fr", date: 12, hasReservations: true },
        { day: "Sa", date: 13, hasReservations: false },
    ];

    // Floor options
    const floors = [
        { id: 0, name: "Floor 1", area: "Indoor Area", capacity: "62-Person" },
        { id: 1, name: "Floor 1", area: "Outdoor Area", capacity: "62-Person" },
        { id: 2, name: "Floor 2", area: "Indoor Area", capacity: "50-Person" },
    ];

    // Table data
    const tables = [
        {
            id: "T12",
            x: 148,
            y: 180,
            width: 80,
            height: 60,
            status: "available",
        },
        {
            id: "T13",
            x: 265,
            y: 180,
            width: 80,
            height: 60,
            status: "reserved",
            reservation: { number: "#RSV002", name: "Hanna Rose" },
        },
        {
            id: "T14",
            x: 370,
            y: 180,
            width: 80,
            height: 60,
            status: "reserved",
            reservation: { number: "#RSV002", name: "Hanna Rose" },
        },
        {
            id: "T15",
            x: 475,
            y: 180,
            width: 80,
            height: 60,
            status: "reserved",
            reservation: { number: "#RSV002", name: "Hanna Rose" },
        },
        {
            id: "T16",
            x: 630,
            y: 180,
            width: 80,
            height: 60,
            status: "reserved",
            reservation: { number: "#RSV012", name: "Ammar Maulana" },
        },
        {
            id: "T11",
            x: 148,
            y: 290,
            width: 170,
            height: 60,
            status: "available",
        },
        {
            id: "T10",
            x: 370,
            y: 290,
            width: 170,
            height: 60,
            status: "available",
        },
        {
            id: "T9",
            x: 590,
            y: 290,
            width: 170,
            height: 60,
            status: "available",
        },
        {
            id: "T6",
            x: 148,
            y: 380,
            width: 170,
            height: 60,
            status: "available",
        },
        {
            id: "T7",
            x: 370,
            y: 380,
            width: 170,
            height: 60,
            status: "available",
        },
        {
            id: "T8",
            x: 590,
            y: 380,
            width: 170,
            height: 60,
            status: "available",
        },
        {
            id: "T5",
            x: 148,
            y: 480,
            width: 80,
            height: 60,
            status: "available",
        },
        {
            id: "T4",
            x: 265,
            y: 480,
            width: 80,
            height: 60,
            status: "available",
        },
        {
            id: "T3",
            x: 370,
            y: 480,
            width: 80,
            height: 60,
            status: "available",
        },
        {
            id: "T2",
            x: 475,
            y: 480,
            width: 80,
            height: 60,
            status: "available",
        },
        {
            id: "T1",
            x: 630,
            y: 430,
            width: 80,
            height: 60,
            status: "available",
        },
        { id: "BAR", x: 720, y: 380, width: 30, height: 150, status: "fixed" },
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
                    marginTop: "5rem",
                }}
            >
                <Box
                    sx={{
                        height: "100vh",
                        bgcolor: "#F6F6F6",
                        display: "flex",
                        flexDirection: "column",
                        px: 3,
                        pt: 2,
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            // p: 2,
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: "500",
                                    fontSize: "30px",
                                    color: "#3F4E4F",
                                }}
                            >
                                Table Management
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            {/* <IconButton sx={{ mr: 1 }}>
                                <HelpOutline />
                            </IconButton> */}
                            <img
                                src="/assets/qbutton.png"
                                alt=""
                                style={{
                                    width: 40,
                                    height: 40,
                                    marginRight: 10,
                                }}
                            />
                            <Button
                                variant="outlined"
                                startIcon={<Settings />}
                                sx={{
                                    border: "1px solid #3F4E4F",
                                    color: "#3F4E4F",
                                    textTransform: "none",
                                    height: 40,
                                    borderRadius: "0",
                                    fontSize: "14px",
                                }}
                            >
                                Table Settings
                            </Button>
                        </Box>
                    </Box>

                    {/* Main Content */}
                    <Box
                        sx={{
                            display: "flex",
                            mt: 2,
                            flexGrow: 1,
                            justifyContent: "center",
                            bgcolor: "transparent",
                        }}
                    >
                        {/* Left Sidebar - Calendar */}
                        <Box
                            sx={{
                                width: 115,
                                display: "flex",
                                flexDirection: "column",
                                pr: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    mb: 2,
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: "500",
                                        fontSize: "14px",
                                        color: "#121212",
                                    }}
                                >
                                    May 2024
                                </Typography>
                                <KeyboardArrowDown
                                    fontSize="small"
                                    sx={{ ml: 0.5 }}
                                />
                            </Box>

                            {days.map((day, index) => (
                                <Box
                                    key={index}
                                    onClick={() => handleDateClick(day.date)}
                                    sx={{
                                        height: "120px",
                                        py: 3,
                                        alignItems: "center",
                                        textAlign: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        bgcolor:
                                            selectedDate === day.date
                                                ? "#B0DEFF"
                                                : "#FFFFFF",
                                        border:
                                            selectedDate === day.date
                                                ? "1px solid #063455"
                                                : "1px solid #E3E3E3",
                                        "&:hover": {
                                            bgcolor:
                                                selectedDate === day.date
                                                    ? "#B0DEFF"
                                                    : "#FFFFFF",
                                        },
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            display: "block",
                                            color: "#7F7F7F",
                                            fontSize: "16px",
                                        }}
                                    >
                                        {day.day}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontWeight: "medium",
                                            my: 0.5,
                                            color: "#121212",
                                            fontSize: "22px",
                                        }}
                                    >
                                        {day.date}
                                    </Typography>
                                    {day.hasReservations && (
                                        <Box
                                            sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: "50%",
                                                bgcolor: "#1976d2",
                                                mx: "auto",
                                            }}
                                        />
                                    )}
                                </Box>
                            ))}
                        </Box>

                        {/* Right Content - Floor Plan */}
                        <Box
                            sx={{
                                flexGrow: 1,
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            {/* Floor Tabs */}
                            <Box
                                sx={{
                                    position: "relative",
                                    width: "100%",
                                    height: 150, // Adjust height to accommodate all tabs
                                    // mb: -1
                                }}
                            >
                                {/* Floor 1 Indoor Area - White background (bottom layer) */}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        p: 1.5,
                                        bgcolor: "#FFFFFF",
                                        height: 100,
                                        zIndex: 1,
                                        borderTopLeftRadius: "24px",
                                        borderTopRightRadius: "24px",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            mt: -7,
                                            width: "100%",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 30,
                                                    height: 30,
                                                    borderRadius: "50%",
                                                    bgcolor: "transparent",
                                                    // color: '#333333',
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    mr: 1.5,
                                                    fontSize: "0.75rem",
                                                    fontWeight: "bold",
                                                    border: "1px solid #E3E3E3",
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
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: "#333333",
                                                    fontWeight: "medium",
                                                }}
                                            >
                                                Floor 1 • Indoor Area
                                            </Typography>
                                        </Box>
                                        <Typography
                                            variant="body2"
                                            sx={{ color: "#333333" }}
                                        >
                                            Available for 62-Person
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Floor 1 Outdoor Area - Blue background (middle layer) */}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: 40, // Offset to create layered effect
                                        left: 0,
                                        right: 0,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        p: 1.5,
                                        bgcolor: "#0C67AA",
                                        height: 70,
                                        zIndex: 2,
                                        borderTopLeftRadius: "24px",
                                        borderTopRightRadius: "24px",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            mt: -4,
                                            width: "100%",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 30,
                                                    height: 30,
                                                    borderRadius: "50%",
                                                    bgcolor: "white",
                                                    // color: '#3F4E4F',
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    mr: 1.5,
                                                    fontSize: "0.75rem",
                                                    fontWeight: "bold",
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
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: "white",
                                                    fontWeight: "medium",
                                                }}
                                            >
                                                Floor 2 • Indoor Area
                                            </Typography>
                                        </Box>

                                        {/* This will now stay on the right side */}
                                        <Typography
                                            variant="body2"
                                            sx={{ color: "white" }}
                                        >
                                            Available for 50-Person
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Floor 2 Indoor Area - Dark gray/green background (top layer) */}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: 80,
                                        left: 0,
                                        right: 0,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        p: 1.5,
                                        bgcolor: "#3F4E4F",
                                        height: 50,
                                        zIndex: 3,
                                        borderTopLeftRadius: "24px",
                                        borderTopRightRadius: "24px",
                                    }}
                                >
                                    {/* ✅ Removed 'position: absolute' from this Box */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 30,
                                                height: 30,
                                                borderRadius: "50%",
                                                bgcolor: "white",
                                                // color: '#3F4E4F',
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                mr: 1.5,
                                                fontSize: "0.75rem",
                                                fontWeight: "bold",
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
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: "white",
                                                fontWeight: "medium",
                                            }}
                                        >
                                            Floor 2 • Indoor Area
                                        </Typography>
                                    </Box>

                                    {/* This will now stay on the right side */}
                                    <Typography
                                        variant="body2"
                                        sx={{ color: "white" }}
                                    >
                                        Available for 50-Person
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Floor Plan */}
                            <Box
                                sx={{
                                    flexGrow: 1,
                                    bgcolor: "#3F4E4F",
                                    position: "relative",
                                    // mt: -5,
                                    overflow: "auto",
                                    height: "100%",
                                    minHeight: 500,
                                }}
                            >
                                {/* First row of tables - stretched and aligned */}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: 10,
                                        left: 0,
                                        right: 0,
                                        display: "flex",
                                        justifyContent: "space-around",
                                        // px: 1,
                                        width: "100%",
                                        gap: "10px",
                                    }}
                                >
                                    {/* Table T12 */}
                                    <Box
                                        sx={{
                                            width: 130,
                                            height: 120,
                                            position: "relative",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Table1Icon
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                fill: "white",
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                zIndex: 2,
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: "medium",
                                                    color: "#6b7280",
                                                }}
                                            >
                                                T12
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Table T13 */}
                                    <Box
                                        sx={{
                                            width: 130,
                                            height: 120,
                                            position: "relative",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Table1Icon
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                fill: "white",
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                zIndex: 2,
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: "medium",
                                                    color: "#6b7280",
                                                }}
                                            >
                                                T13
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Table T14 - Reserved */}
                                    <Box
                                        sx={{
                                            width: 130,
                                            height: 120,
                                            position: "relative",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Table1Icon
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                fill: "#d1fae5",
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                zIndex: 2,
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: "medium",
                                                    color: "#059669",
                                                }}
                                            >
                                                T14
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: "#059669",
                                                    fontWeight: "medium",
                                                }}
                                            >
                                                #RSV002
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: "#6b7280",
                                                    fontSize: "0.65rem",
                                                }}
                                            >
                                                Hanna Rose
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Table T15 */}
                                    <Box
                                        sx={{
                                            width: 130,
                                            height: 120,
                                            position: "relative",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Table1Icon
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                fill: "white",
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                zIndex: 2,
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: "medium",
                                                    color: "#6b7280",
                                                }}
                                            >
                                                T15
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Table T16 - Reserved (wider) */}
                                    <Box
                                        sx={{
                                            width: 220,
                                            height: 120,
                                            position: "relative",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <TableIcon
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                fill: "#cfe7ff",
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                zIndex: 2,
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: "medium",
                                                    color: "#3b82f6",
                                                }}
                                            >
                                                T16
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: "#3b82f6",
                                                    fontWeight: "medium",
                                                }}
                                            >
                                                #RSV012
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: "#6b7280",
                                                    fontSize: "0.65rem",
                                                }}
                                            >
                                                Ahman Maulana
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Rest of the tables would go here */}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: 190,
                                        left: 0,
                                        right: 0,
                                        display: "flex",
                                        justifyContent: "space-around",
                                        // px: 1,
                                        width: "80%",
                                        // gap: '10px'
                                    }}
                                >
                                    {/* Table T12 */}
                                    <Box
                                        sx={{
                                            width: 230,
                                            height: 120,
                                            position: "relative",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Table2Icon
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                fill: "white",
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                zIndex: 2,
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: "medium",
                                                    color: "#6b7280",
                                                }}
                                            >
                                                T12
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Table T13 */}
                                    <Box
                                        sx={{
                                            width: 230,
                                            height: 120,
                                            position: "relative",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Table2Icon
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                fill: "white",
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                zIndex: 2,
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: "medium",
                                                    color: "#6b7280",
                                                }}
                                            >
                                                T13
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Table T14 - Reserved */}
                                    <Box
                                        sx={{
                                            width: 230,
                                            height: 120,
                                            position: "relative",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Table2Icon
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                fill: "#d1fae5",
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                zIndex: 2,
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: "medium",
                                                    color: "#059669",
                                                }}
                                            >
                                                T14
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: "#059669",
                                                    fontWeight: "medium",
                                                }}
                                            >
                                                #RSV002
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: "#6b7280",
                                                    fontSize: "0.65rem",
                                                }}
                                            >
                                                Hanna Rose
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: 360,
                                        left: 0,
                                        right: 0,
                                        display: "flex",
                                        justifyContent: "space-around",
                                        // px: 1,
                                        width: "80%",
                                        // gap: '10px'
                                    }}
                                >
                                    {/* Table T12 */}
                                    <Box
                                        sx={{
                                            width: 230,
                                            height: 120,
                                            position: "relative",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Table2Icon
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                fill: "white",
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                zIndex: 2,
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: "medium",
                                                    color: "#6b7280",
                                                }}
                                            >
                                                T12
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Table T13 */}
                                    <Box
                                        sx={{
                                            width: 230,
                                            height: 120,
                                            position: "relative",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Table2Icon
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                fill: "white",
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                zIndex: 2,
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: "medium",
                                                    color: "#6b7280",
                                                }}
                                            >
                                                T13
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Table T14 - Reserved */}
                                    <Box
                                        sx={{
                                            width: 230,
                                            height: 120,
                                            position: "relative",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Table2Icon
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                fill: "#d1fae5",
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                zIndex: 2,
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: "medium",
                                                    color: "#059669",
                                                }}
                                            >
                                                T14
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: "#059669",
                                                    fontWeight: "medium",
                                                }}
                                            >
                                                #RSV002
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: "#6b7280",
                                                    fontSize: "0.65rem",
                                                }}
                                            >
                                                Hanna Rose
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                                {/* Bar/Counter */}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        right: 40,
                                        top: 380,
                                        width: 30,
                                        height: 150,
                                        bgcolor: "#e5e7eb",
                                        borderRadius: 1,
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </div>
        </>
    );
};

export default TableManagement;
