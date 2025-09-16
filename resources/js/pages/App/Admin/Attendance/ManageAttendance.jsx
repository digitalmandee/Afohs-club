import React, { useEffect, useState } from "react";
import TopNavbar from "../../components/topNavbar";
import Sidebar from "../../components/leftSideBar";
import { useNavigate } from "react-router-dom";
import { MdArrowBackIos } from "react-icons/md";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, TextField, Checkbox, Pagination, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Select, MenuItem, Snackbar, Alert } from "@mui/material";
import axiosInstance from "@/utils/axiosInstance";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import colors from "@/assets/styles/color";
// import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const ManageAttendance = () => {
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState("");
	const [date, setDate] = useState(dayjs());

	const [attendances, setAttendances] = useState([]);
	const [leavecategories, setLeaveCategories] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [limit, setLimit] = useState(10);
	const [loadingRows, setLoadingRows] = useState({});
	const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

	const handleCloseSnackbar = () => {
		setSnackbar({ ...snackbar, open: false });
	};

	const getAttendances = async (page = 1) => {
		setIsLoading(true);
		try {
			const res = await axiosInstance.get("employees/attendances", {
				params: { page, limit, date: date.format("YYYY-MM-DD") },
			});

			if (res.data.success) {
				setAttendances(res.data.attendance.data);
				setTotalPages(res.data.attendance.last_page);
				setCurrentPage(res.data.attendance.current_page);
			}
		} catch (error) {
			console.log(error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		getAttendances(currentPage);
	}, [currentPage, limit, date]);

	const getLeaveCatgories = async () => {
		try {
			const res = await axiosInstance.get("employees/leavecategories");
			if (res.data.success) {
				setLeaveCategories(res.data.leave_categories);
			}
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		getLeaveCatgories();
	}, []);

	const handleSearch = () => {
		console.log("Searching:", searchQuery);
	};

	// Handle check-in, check-out, and leave category updates
	const handleUpdate = async (id, updatedData) => {
		setLoadingRows((prev) => ({ ...prev, [id]: true })); // loading for the specific row
		try {
			await axiosInstance.put(`employees/attendances/${id}`, updatedData);
			// getAttendances(currentPage);
			setSnackbar({ open: true, message: "Attendance updated successfully!", severity: "success" });
		} catch (error) {
			// console.log("Error updating attendance:", error);
			setSnackbar({ open: true, message: error.response.data.message ?? "Something went wrong", severity: "error" });
		} finally {
			setLoadingRows((prev) => ({ ...prev, [id]: false })); // Reset only that row’s loading state
		}
	};

	const handleInputChange = (id, field, value) => {
		setAttendances((prev) =>
			prev.map((att) => {
				if (att.id === id) {
					let updatedStatus = att.status;

					if (field === "attendance") {
						// If checked, set "present" by default, allow "late" later
						updatedStatus = value ? "present" : "absent";
					}

					if (field === "leave_category_id") {
						updatedStatus = value ? "leave" : "absent"; // If leave is selected, status = "leave", else "absent"
					}

					return { ...att, [field]: value, status: updatedStatus };
				}
				return att;
			})
		);
	};

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
						<h3 style={{ margin: 0 }}>Manage Attendance</h3>
					</div>

					{/* Search Input */}
					<div className="d-flex mb-4" style={{ alignItems: "center", justifyContent: "space-between" }}>
						{/* Search Field */}
						<div style={{ display: "flex", gap: "10px" }}>
							<TextField size="small" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ backgroundColor: "white" }} />
							<Button variant="contained" onClick={handleSearch} style={{ backgroundColor: colors.primary, color: "white", textTransform: "none", minWidth: "80px" }}>
								Go
							</Button>
						</div>

						{/* Date Picker on the Right */}
						<LocalizationProvider dateAdapter={AdapterDayjs}>
							<DatePicker label="Select Date" value={date} onChange={(newValue) => setDate(newValue)} renderInput={(params) => <TextField {...params} size="small" />} />
						</LocalizationProvider>

						{/* <LocalizationProvider dateAdapter={AdapterDayjs}>
							<DemoContainer components={["DatePicker"]}>
								<DatePicker label="Select Date" value={date} onChange={(newDate) => setDate(newDate.toISOString().split("T")[0])} renderInput={(params) => <TextField {...params} size="small" />} />
							</DemoContainer>
						</LocalizationProvider> */}
					</div>

					<TableContainer component={Paper}>
						<Table>
							<TableHead style={{ backgroundColor: "#f8f9fa" }}>
								<TableRow>
									<TableCell>#</TableCell>
									<TableCell>Employee Name</TableCell>
									<TableCell>Designation</TableCell>
									<TableCell>Attendance</TableCell>
									<TableCell>Leave Category</TableCell>
									<TableCell>Check-In</TableCell>
									<TableCell>Check-Out</TableCell>
									<TableCell>Action</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{isLoading ? (
									<TableRow>
										<TableCell colSpan={8} align="center">
											<CircularProgress sx={{ color: "#FFCC16" }} />
										</TableCell>
									</TableRow>
								) : attendances.length > 0 ? (
									attendances.map((row, index) => (
										<TableRow key={row.id}>
											<TableCell>{index + 1}</TableCell>
											<TableCell>{row.employee.user.name}</TableCell>
											<TableCell>{row.employee.user.designation}</TableCell>
											<TableCell>
												<Checkbox
													checked={["present", "late"].includes(row.status)} // If present or late, show checked
													onChange={(e) => handleInputChange(row.id, "attendance", e.target.checked)}
													disabled={row.status === "leave"} // Disable if on leave
													color="primary"
												/>
											</TableCell>

											<TableCell>
												<Select value={row.leave_category_id || ""} onChange={(e) => handleInputChange(row.id, "leave_category_id", e.target.value)} size="small" style={{ minWidth: "120px" }}>
													<MenuItem value="">Select</MenuItem>
													{leavecategories.map((category) => (
														<MenuItem key={category.id} value={category.id}>
															{category.name}
														</MenuItem>
													))}
												</Select>
											</TableCell>

											<TableCell>
												<TextField size="small" type="time" value={row.check_in || ""} onChange={(e) => handleInputChange(row.id, "check_in", e.target.value)} style={{ width: "100px" }} />
											</TableCell>
											<TableCell>
												<TextField size="small" type="time" value={row.check_out || ""} onChange={(e) => handleInputChange(row.id, "check_out", e.target.value)} style={{ width: "100px" }} />
											</TableCell>
											<TableCell>
												<Button
													onClick={() =>
														handleUpdate(row.id, {
															leave_category_id: row.leave_category_id ?? "",
															check_in: row.check_in,
															check_out: row.check_out,
															status: row.status,
														})
													}
													variant="contained"
													size="small"
													disabled={loadingRows[row.id] || false} // Disable only if that row is loading
													style={{
														backgroundColor: row.check_in && row.check_out ? "#e3f2fd" : colors.primary,
														color: row.check_in && row.check_out ? colors.primary : "white",
														textTransform: "none",
													}}>
													{loadingRows[row.id] ? <CircularProgress size={20} color="inherit" /> : row.check_in && row.check_out ? "Update" : "Save"}
												</Button>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={8} align="center">
											No attendances found.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</TableContainer>

					{/* Pagination */}
					<div className="d-flex justify-content-end mt-4">
						<Pagination count={totalPages} page={currentPage} onChange={(e, page) => setCurrentPage(page)} shape="rounded" style={{ color: colors.primary }} />
					</div>
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

export default ManageAttendance;
