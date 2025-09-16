import React, { useEffect, useState } from "react";
import TopNavbar from "../../components/topNavbar";
import Sidebar from "../../components/leftSideBar";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { MdArrowBackIos } from "react-icons/md";
import { CircularProgress, InputAdornment } from "@mui/material";
import { Search } from "@mui/icons-material";
import { Table, TableBody, TableCell, Button, TableContainer, TableHead, TableRow, Paper, Pagination, IconButton, TextField, Box, Typography } from "@mui/material";
import { Edit as EditIcon, ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import "bootstrap/dist/css/bootstrap.min.css";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import axiosInstance from "@/utils/axiosInstance";
import dayjs from "dayjs";
import colors from "@/assets/styles/color";

const LeaveManage = () => {
	const navigate = useNavigate();
	const { branch } = useParams();

	const [searchTerm, setSearchTerm] = useState("");
	const [date, setDate] = useState(dayjs());

	const [applications, setApplications] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [limit] = useState(10);
	const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

	useEffect(() => {
		fetchApplicaitons(currentPage);
	}, [currentPage, limit, date]);

	const fetchApplicaitons = async (page = 1) => {
		setIsLoading(true);
		try {
			const res = await axiosInstance.get("employees/leaves", { params: { page, limit, date: date.format("YYYY-MM-DD") } });
			if (res.data.success) {
				setApplications(res.data.applications.data);
				setTotalPages(res.data.applications.last_page);
				setCurrentPage(res.data.applications.current_page);
			}
		} catch (error) {
			setSnackbar({ open: true, message: "Error fetching applications!", severity: "error" });
		} finally {
			setIsLoading(false);
		}
	};

	const handleCloseSnackbar = () => {
		setSnackbar({ ...snackbar, open: false });
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
						<h3 style={{ margin: 0 }}>Leave Application</h3>
					</div>
					<Box sx={{ backgroundColor: "#FFFFFF", padding: 2, borderRadius: 2 }}>
						<Box className="mb-4 d-flex">
							<Box className="mb-4" sx={{ flexGrow: 1 }}>
								<TextField
									variant="outlined"
									placeholder="Search..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									size="small"
									sx={{ width: "20%" }}
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
									onClick={() => navigate(`/${branch}/branch/employee/leave/application/new`)}
									sx={{
										backgroundColor: colors.primary,
										color: "white",
										textTransform: "none",
										marginLeft: "2rem",
										padding: "6px 16px",
										"&:hover": { backgroundColor: colors.primary }, // Slightly darker shade on hover
									}}>
									Add
								</Button>
							</Box>

							{/* Date Picker on the Right */}
							<LocalizationProvider dateAdapter={AdapterDayjs}>
								<DatePicker label="Select Date" value={date} onChange={(newValue) => setDate(newValue)} renderInput={(params) => <TextField {...params} size="small" />} />
							</LocalizationProvider>
						</Box>

						<TableContainer component={Paper}>
							<Table>
								<TableHead>
									<TableRow style={{ backgroundColor: "#FFF2C6" }}>
										<TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
										<TableCell sx={{ fontWeight: "bold" }}>Employ Name</TableCell>
										<TableCell sx={{ fontWeight: "bold" }}>Start date</TableCell>
										<TableCell sx={{ fontWeight: "bold" }}>End Date</TableCell>
										<TableCell sx={{ fontWeight: "bold" }}>Leaves Days</TableCell>
										<TableCell sx={{ fontWeight: "bold" }}>Leave Category</TableCell>
										<TableCell sx={{ fontWeight: "bold" }}>Created At</TableCell>
										<TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{isLoading ? (
										<TableRow>
											<TableCell colSpan={9} align="center">
												<CircularProgress sx={{ color: "#FFCC16" }} />
											</TableCell>
										</TableRow>
									) : applications.length > 0 ? (
										applications.map((application) => (
											<TableRow key={application.id}>
												<TableCell>{application.id}</TableCell>
												<TableCell>{application.employee?.user?.name}</TableCell>
												<TableCell>{application.start_date}</TableCell>
												<TableCell>{application.end_date}</TableCell>
												<TableCell>{application.number_of_days}</TableCell>
												<TableCell>{application.leave_category.name}</TableCell>
												<TableCell>{dayjs(application.created_at).format("YYYY-MM-DD")}</TableCell>
												<TableCell>
													<span
														style={{
															backgroundColor: application.status === "approved" ? colors.primary : "#C5DCF7AB",
															color: application.status === "approved" ? "white" : "black",
															padding: "6px 12px",
															borderRadius: "50px",
															display: "inline-block",
															textTransform: "capitalize",
														}}>
														{application.status}
													</span>
												</TableCell>
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell colSpan={9} align="center">
												No applications found.
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
					</Box>
				</div>
			</div>
		</>
	);
};

export default LeaveManage;
