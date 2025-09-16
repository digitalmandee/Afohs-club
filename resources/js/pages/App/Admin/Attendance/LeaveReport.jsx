import React, { useEffect, useState } from "react";
import TopNavbar from "../../components/topNavbar";
import Sidebar from "../../components/leftSideBar";
import { useNavigate } from "react-router-dom";
import { MdArrowBackIos } from "react-icons/md";
import { CircularProgress, FormControl, InputAdornment, MenuItem, Select } from "@mui/material";
import { Search } from "@mui/icons-material";
import { Table, TableBody, TableCell, TableContainer, TableHead, Button, TableRow, Paper, Pagination, IconButton, TextField, Box, Typography } from "@mui/material";
import { Edit as EditIcon, ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import "bootstrap/dist/css/bootstrap.min.css";
import axiosInstance from "@/utils/axiosInstance";
import colors from "@/assets/styles/color";
const LeaveReport = () => {
	const navigate = useNavigate();
	const [searchTerm, setSearchTerm] = useState("");

	const currentDate = new Date();
	const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
	const [month, setMonth] = useState(currentMonth);
	const [employees, setEmployees] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [limit, setLimit] = useState(10);

	const getMonthlyReport = async (page = 1) => {
		setIsLoading(true);
		try {
			const res = await axiosInstance.get("employees/leaves/reports", {
				params: { page, limit, month },
			});
			if (res.data.success) {
				setEmployees(res.data.report_data.employees);
				setTotalPages(res.data.report_data.last_page);
				setCurrentPage(res.data.report_data.current_page);
			}
		} catch (error) {
			console.log(error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		getMonthlyReport(currentPage);
	}, [currentPage, limit, month]);

	// Generate months dynamically
	const months = Array.from({ length: 12 }, (_, i) => {
		const monthValue = `${currentDate.getFullYear()}-${String(i + 1).padStart(2, "0")}`;
		return { value: monthValue, label: new Date(currentDate.getFullYear(), i, 1).toLocaleString("en-US", { month: "long" }) };
	});

	return (
		<>
			<TopNavbar />
			<div className="main">
				<div className="sideBarWrapper">
					<Sidebar />
				</div>
				<div className="content">
					<div style={{ paddingTop: "1rem", display: "flex", alignItems: "center", marginBottom: "20px" }}>
						<div onClick={() => navigate(-1)} style={{ cursor: "pointer", marginTop: "5px", display: "flex", alignItems: "center" }}>
							<MdArrowBackIos style={{ fontSize: "20px", cursor: "pointer" }} />
						</div>
						<h3 style={{ margin: 0 }}>Leave Report</h3>
					</div>
					<Box sx={{ backgroundColor: "#FFFFFF", padding: 2, borderRadius: 2 }}>
						<Box className="mb-4 d-flex justify-content-between">
							<Box className="d-flex align-items-center">
								<TextField
									variant="outlined"
									placeholder="Search..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									size="small"
									sx={{ width: "100%" }}
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<Search color="action" />
											</InputAdornment>
										),
									}}
								/>
								<Button
									variant="contained"
									sx={{
										backgroundColor: colors.primary,
										color: "white",
										textTransform: "none",
										marginLeft: "2rem",
										padding: "6px 16px",
										"&:hover": { backgroundColor: colors.primary }, // Slightly darker shade on hover
									}}>
									Go
								</Button>
							</Box>
							<Box>
								<FormControl size="small">
									<Select value={month} onChange={(e) => setMonth(e.target.value)} sx={{ minWidth: 120 }}>
										{months.map((m) => (
											<MenuItem key={m.value} value={m.value}>
												{m.label}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Box>
						</Box>

						<TableContainer component={Paper}>
							<Table>
								<TableHead>
									<TableRow style={{ backgroundColor: "#FFF2C6" }}>
										<TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
										<TableCell sx={{ fontWeight: "bold" }}>Employ Name</TableCell>
										<TableCell sx={{ fontWeight: "bold" }}>Casual Leave</TableCell>
										<TableCell sx={{ fontWeight: "bold" }}>Sick Leave</TableCell>
										<TableCell sx={{ fontWeight: "bold" }}>Advance Leave</TableCell>
										<TableCell sx={{ fontWeight: "bold" }}>Total Attendance</TableCell>
										<TableCell sx={{ fontWeight: "bold" }}>Total Absence</TableCell>
										<TableCell sx={{ fontWeight: "bold" }}>Total Leave</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{isLoading ? (
										<TableRow>
											<TableCell colSpan={7} align="center">
												<CircularProgress sx={{ color: "#FFCC16" }} />
											</TableCell>
										</TableRow>
									) : employees.length > 0 ? (
										employees.map((employee) => (
											<TableRow key={employee.employee_id}>
												<TableCell>{employee.employee_id}</TableCell>
												<TableCell>{employee.employee_name}</TableCell>
												<TableCell>{employee.leave_categories?.Casual_Leave}</TableCell>
												<TableCell>{employee.leave_categories?.Sick_Leave}</TableCell>
												<TableCell>{employee.advanceLeave}</TableCell>
												<TableCell>{employee.total_attendance}</TableCell>
												<TableCell>{employee.total_absence}</TableCell>
												<TableCell>{employee.total_leave}</TableCell>
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell colSpan={7} align="center">
												No invoices found.
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</TableContainer>

						{/* Pagination */}
						<Box sx={{ display: "flex", justifyContent: "end", mt: 3 }}>
							<Pagination count={totalPages} page={currentPage} onChange={(e, page) => setCurrentPage(page)} />
						</Box>
					</Box>
				</div>
			</div>
		</>
	);
};

export default LeaveReport;
