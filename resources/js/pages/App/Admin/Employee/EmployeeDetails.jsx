import React, { useEffect, useState } from "react";
import TopNavbar from "@/components/topNavbar";
import Sidebar from "@/components/leftSideBar";
import { useLocation, useParams } from "react-router-dom";
import { Grid, Typography, Card, IconButton, FormControlLabel, Radio, RadioGroup, Select, Chip, FormControl, CardContent, TableCell, TableHead, Link, TableContainer, Table, TableBody, TableRow, Avatar, Button, Divider, List, ListItem, ListItemText, Paper, TextField, MenuItem, Snackbar, Alert } from "@mui/material";
import user from "../../assets/profile user.png";
import { FileDownload } from "@mui/icons-material";
import axiosInstance from "@/utils/axiosInstance";
import PersonalDetails from "@/components/employee/PersonalDetails";
import AttendanceReport from "@/components/employee/AttendanceReport";
import colors from "@/assets/styles/color";
const EmployeeDetails = () => {
	const location = useLocation();
	const { employeeId } = useParams(); // Get invoice ID from URL

	const [selectedTab, setSelectedTab] = useState("personal");
	const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
	const [employee, setEmployee] = useState("");

	const getEmployeeData = async () => {
		try {
			const res = await axiosInstance.get("employees/show/" + employeeId);

			if (res.data.success) {
				setEmployee(res.data.employee);
			}
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		getEmployeeData();
	}, []);

	const handleCloseSnackbar = () => {
		setSnackbar({ ...snackbar, open: false });
	};

	return (
		<>
			<TopNavbar />
			<div className="main d-flex">
				<div className="sideBarWrapper">
					<Sidebar />
				</div>
				<div className="content">
					{/* <div style={{ display: "flex", padding: "2rem", backgroundColor:'white', width: "100%", height: "100vh" }}> */}
					<Grid
						container
						spacing={0}
						style={{
							padding: "3rem",
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
								<Avatar src={user} alt="Profile" sx={{ width: 100, height: 100, margin: "auto" }} />
								<Typography variant="text" sx={{ mt: 2, fontWeight: "600", fontSize: "20px", font: "Nunito Sans" }}>
									{employee.user?.name}
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
												background: selectedTab === option.key ? "linear-gradient(to right, silver 98%, #FFCC16 2%)" : "transparent",
												paddingLeft: "2rem", // Remove any horizontal padding
												paddingBottom: "1rem",
												cursor: "pointer",
											}}>
											<ListItemText primary={option.label} />
										</ListItem>
									))}
								</List>
							</Paper>
						</Grid>

						{/* Right Panel - Dynamic Form Section */}
						<Grid item xs={12} md={8} style={{ display: "flex", flexDirection: "column", height: "100%", marginBottom: "1rem" }}>
							<Paper style={{ padding: "1.5rem", height: "100%", display: "flex", flexDirection: "column" }}>
								<div style={{ flexGrow: 1, overflowY: "auto", paddingRight: "1rem" }}>
									{selectedTab === "personal" && <PersonalDetails employeeId={employeeId} />}

									{selectedTab === "salary" && (
										<>
											<Grid container justifyContent="center">
												<Grid item xs={12}>
													{/* Salary Detail Section */}

													<CardContent>
														<Typography variant="h6" gutterBottom>
															Salary Detail
														</Typography>
														<Divider sx={{ backgroundColor: "black", height: 0.01, marginTop: 1 }} />

														<TableContainer component={Paper} elevation={0} sx={{ marginTop: "1rem" }}>
															<Table>
																{/* Table Header */}
																<TableHead>
																	<TableRow sx={{ backgroundColor: "#DDEAFB" }}>
																		<TableCell sx={{ fontWeight: "bold", border: "1px solid #B0BEC5" }}>Category</TableCell>
																		<TableCell sx={{ fontWeight: "bold", border: "1px solid #B0BEC5" }} align="left">
																			Amount
																		</TableCell>
																	</TableRow>
																</TableHead>

																{/* Table Body */}
																<TableBody>
																	{salaryDetails.map((row) => (
																		<TableRow key={row.category}>
																			<TableCell
																				component="th"
																				scope="row"
																				sx={{
																					width: "50%",
																					border: "1px solid #B0BEC5",
																				}}>
																				{row.category}
																			</TableCell>
																			<TableCell align="left" sx={{ border: "1px solid #B0BEC5" }}>
																				{row.amount.toLocaleString()}
																			</TableCell>
																		</TableRow>
																	))}
																</TableBody>
															</Table>
														</TableContainer>
													</CardContent>

													{/* Payment Information Section */}
													<Grid item xs={12}>
														<CardContent>
															<Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
																<Grid item>
																	<Typography variant="h6">Payment Information</Typography>
																</Grid>
																<Grid item>
																	<Link href="#" underline="show" sx={{ color: "black" }}>
																		View all
																	</Link>
																</Grid>
															</Grid>
															<Divider sx={{ backgroundColor: "black", height: 0.01, marginTop: 1 }} />

															<TableContainer
																component={Paper}
																elevation={0}
																style={{
																	marginTop: "1rem",
																}}>
																<Table>
																	<TableHead>
																		<TableRow>
																			<TableCell sx={{ backgroundColor: "#DDEAFB" }}>Payment Method</TableCell>
																			<TableCell sx={{ backgroundColor: "#DDEAFB" }}>Bank Account</TableCell>
																			<TableCell sx={{ backgroundColor: "#DDEAFB" }}>Payment Date</TableCell>
																			<TableCell sx={{ backgroundColor: "#DDEAFB" }}>Status</TableCell>
																		</TableRow>
																	</TableHead>
																	<TableBody>
																		<TableRow>
																			<TableCell>{paymentInfo.method}</TableCell>
																			<TableCell>{paymentInfo.accountNumber}</TableCell>
																			<TableCell>{paymentInfo.date}</TableCell>
																			<TableCell>{paymentInfo.status}</TableCell>
																		</TableRow>
																	</TableBody>
																</Table>
															</TableContainer>

															<Grid container justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
																<Grid item>
																	<Button variant="outlined" sx={{ textTransform: "none" }}>
																		Export
																	</Button>
																</Grid>
																<Grid item>
																	<Button
																		variant="contained"
																		sx={{
																			bgcolor: colors.primary,
																			"&:hover": {
																				bgcolor: colors.primary,
																			},
																			textTransform: "none",
																		}}>
																		Save
																	</Button>
																</Grid>
															</Grid>
														</CardContent>
													</Grid>
												</Grid>
											</Grid>
										</>
									)}

									{selectedTab === "notice" && (
										<Grid container justifyContent="center">
											<Grid item xs={12}>
												<CardContent>
													<Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
														<Grid item>
															<Typography variant="h6">Notice</Typography>
														</Grid>
													</Grid>
													<Divider sx={{ backgroundColor: "black", height: 0.01, marginTop: 1 }} />

													<TableContainer
														component={Paper}
														elevation={0}
														style={{
															marginTop: "1rem",
														}}>
														<Table>
															<TableHead>
																<TableRow>
																	<TableCell sx={{ backgroundColor: "#DDEAFB" }}>Notice</TableCell>
																	<TableCell sx={{ backgroundColor: "#DDEAFB" }}>Date</TableCell>
																	<TableCell sx={{ backgroundColor: "#DDEAFB" }}>Status</TableCell>
																</TableRow>
															</TableHead>
															<TableBody>
																<TableRow>
																	<TableCell>{noticeInfo.method}</TableCell>
																	<TableCell>{noticeInfo.date}</TableCell>
																	<TableCell>{paymentInfo.status}</TableCell>
																</TableRow>
															</TableBody>
														</Table>
													</TableContainer>
												</CardContent>
											</Grid>
										</Grid>
									)}

									{selectedTab === "attendance" && <AttendanceReport employeeId={employeeId} />}
								</div>
							</Paper>
						</Grid>
					</Grid>
				</div>
			</div>

			<Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar}>
				<Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
					{snackbar.message}
				</Alert>
			</Snackbar>
		</>
	);
};

export default EmployeeDetails;

const menuOptions = [
	{ key: "personal", label: "Personal Details" },
	{ key: "salary", label: "Salary" },
	// { key: "notice", label: "Notice Period" },
	{ key: "attendance", label: "Attendance" },
];

const salaryDetails = [
	{ category: "Basic Salary", amount: 30000 },
	{ category: "Bonus", amount: 200 },
	{ category: "Deductions", amount: -100 },
	{ category: "Net Salary", amount: 30000 },
];

const paymentInfo = {
	method: "Bank transfer",
	accountNumber: "1234 5678 9012",
	date: "Dec 01, 2024",
	status: "Paid",
};

const noticeInfo = {
	method: "Bank Transfer Problem",
	date: "Dec 01, 2024",
	status: "Read",
};
