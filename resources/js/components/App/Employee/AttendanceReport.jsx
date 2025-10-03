import React, { useEffect, useState } from "react";
import { Grid, Typography, FormControlLabel, Radio, RadioGroup, Select, Chip, FormControl, CardContent, TableCell, TableHead, TableContainer, Table, TableBody, TableRow, Button, Divider, Paper, MenuItem } from "@mui/material";
import { FileDownload } from "@mui/icons-material";
import axiosInstance from "@/utils/axiosInstance";
import colors from "@/assets/styles/color";
const AttendanceReport = ({ employeeId }) => {
	const currentDate = new Date();
	const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
	const [month, setMonth] = useState(currentMonth);
	const [filter, setFilter] = useState("all");
	const [attendance, setAttendance] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	const getStatusChipColor = (status) => {
		return {
			backgroundColor: status === "Present" ? "#E2E8F0" : "#FFF3E0",
			color: status === "Present" ? "#64748B" : "#ED6C02",
		};
	};

	const getAttendanceMonth = async () => {
		setIsLoading(true);
		try {
			const res = await axiosInstance.get(`employees/attendances/profile/report/${employeeId}`, {
				params: { month },
			});

			if (res.data.success) {
				setAttendance(res.data.report);
			}
		} catch (error) {
			console.log(error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		getAttendanceMonth();
	}, [month]);

	// Generate months dynamically
	const months = Array.from({ length: 12 }, (_, i) => {
		const monthValue = `${currentDate.getFullYear()}-${String(i + 1).padStart(2, "0")}`;
		return { value: monthValue, label: new Date(currentDate.getFullYear(), i, 1).toLocaleString("en-US", { month: "long" }) };
	});

	return (
		<>
			<Grid container justifyContent="center">
				<Grid item xs={12}>
					<CardContent>
						{/* Header */}
						<Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
							<Grid item>
								<Typography variant="h6">Attendance Report</Typography>
							</Grid>
							<Grid item>
								<FormControl size="small">
									<Select value={month} onChange={(e) => setMonth(e.target.value)} sx={{ minWidth: 120 }}>
										{months.map((m) => (
											<MenuItem key={m.value} value={m.value}>
												{m.label}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Grid>
						</Grid>
						<Divider sx={{ backgroundColor: "black", height: 0.01 }} />

						{/* Filter Options */}
						<Grid container spacing={2} style={{ justifyContent: "flex-end" }}>
							<Grid item>
								<FormControl>
									<RadioGroup row value={filter} onChange={(e) => setFilter(e.target.value)}>
										<FormControlLabel value="all" control={<Radio size="small" />} label="All" />
										<FormControlLabel value="present" control={<Radio size="small" />} label="Present" />
										<FormControlLabel value="absent" control={<Radio size="small" />} label="Absent" />
									</RadioGroup>
								</FormControl>
							</Grid>
						</Grid>

						{/* Table */}
						<TableContainer component={Paper} elevation={0}>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell sx={{ backgroundColor: "#DDEAFB" }}>#</TableCell>
										<TableCell sx={{ backgroundColor: "#DDEAFB" }}>Date</TableCell>
										<TableCell sx={{ backgroundColor: "#DDEAFB" }}>Check-in</TableCell>
										<TableCell sx={{ backgroundColor: "#DDEAFB" }}>Check-out</TableCell>
										<TableCell sx={{ backgroundColor: "#DDEAFB" }}>Status</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{attendance.map((row, index) => (
										<TableRow key={row.id + row.checkIn}>
											<TableCell>{index + 1}</TableCell>
											<TableCell>{row.date}</TableCell>
											<TableCell>{row.check_in}</TableCell>
											<TableCell>{row.check_out}</TableCell>
											<TableCell>
												<Chip
													label={row.status}
													size="small"
													sx={{
														...getStatusChipColor(row.status),
														borderRadius: "4px",
														fontWeight: 500,
													}}
												/>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>

						{/* Export Button */}
						<Grid container justifyContent="flex-end" sx={{ mt: 3 }}>
							<Button
								variant="contained"
								startIcon={<FileDownload />}
								sx={{
									bgcolor: colors.primary,
									"&:hover": {
										bgcolor: colors.primary,
									},
									textTransform: "none",
								}}>
								Export
							</Button>
						</Grid>
					</CardContent>
				</Grid>
			</Grid>
		</>
	);
};

export default AttendanceReport;
