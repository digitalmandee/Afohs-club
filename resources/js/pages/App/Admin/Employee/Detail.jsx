import React, { useEffect, useState } from "react";
import { Grid, Typography, Box, Radio, RadioGroup, Select, Chip, FormControl, CardContent, TableCell, TableHead, Link, TableContainer, Table, TableBody, TableRow, Avatar, Button, Divider, List, ListItem, ListItemText, Paper, TextField, MenuItem, Snackbar, Alert } from "@mui/material";
import AttendanceReport from "./Attendance";
import PersonalDetails from "./Personal";
import SalaryDetail from "./Salary";
import NoticeDetail from "./Notice";

const EmployeeDetail = () => {
    const [selectedTab, setSelectedTab] = useState("personal");
    const menuOptions = [
        { key: "personal", label: "Personal Details" },
        { key: "salary", label: "Salary" },
        { key: "notice", label: "Notice Period" },
        { key: "attendance", label: "Attendance" },
    ];

    return (
        <>
            <div>
                <Grid
                    container
                    spacing={0}
                    style={{
                        display: "flex",
                        width: "100%",
                        height: "100vh",
                        alignItems: "stretch",
                    }}>
                    {/* Left Panel - Profile Section */}
                    <Grid
                        item
                        xs={12}
                        md={3.5}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                        }}>
                        <Paper style={{ paddingTop: "2rem", textAlign: "center", height: "100%", display: "flex", flexDirection: "column" }}>
                            <Avatar src={'/assets/userimg.png'} alt="Profile" sx={{ width: 100, height: 100, margin: "auto" }} />
                            <Typography variant="text" sx={{ mt: 2, fontWeight: "600", fontSize: "20px", font: "Nunito Sans" }}>
                                Coddy Daniel
                            </Typography>
                            {/* Navigation Menu */}
                            <List sx={{ flexGrow: 1, mt: 1 }}>
                                {menuOptions.map((option) => (
                                    <ListItem
                                        button
                                        key={option.key}
                                        onClick={() => setSelectedTab(option.key)}
                                        selected={selectedTab === option.key}
                                        sx={{
                                            width: "100%",
                                            height: '40px',
                                            background: selectedTab === option.key ? "linear-gradient(to right, silver 98%, #0D2B4E 2%)" : "transparent",
                                            paddingLeft: "2rem", // Remove any horizontal padding
                                            // paddingBottom: "1rem",
                                            cursor: "pointer",
                                        }}>
                                        <ListItemText primary={option.label} />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Grid>

                    {/* Right Panel - Dynamic Form Section */}
                    <Grid item xs={12} md={8} style={{ display: "flex", flexDirection: "column", height: "100%", width: '100%', marginBottom: "1rem" }}>
                        <div style={{
                            height: "100%",
                            width: "100%", // or any value less than 100%
                            margin: "3rem auto 0 auto", // Top: 3rem, Left & Right: auto
                            display: "flex",
                            flexDirection: "column",
                            marginLeft: '1rem'
                        }}>
                            {selectedTab === "personal" && <PersonalDetails />}
                            {selectedTab === "salary" && <SalaryDetail />}
                            {selectedTab === "notice" && <NoticeDetail />}
                            {selectedTab === "attendance" && <AttendanceReport />}
                        </div>
                    </Grid>
                </Grid>
            </div>
        </>
    );
};

export default EmployeeDetail;
