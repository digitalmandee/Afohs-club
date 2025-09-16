import React, { useEffect, useState } from "react";
import TopNavbar from "../../components/topNavbar";
import Sidebar from "../../components/leftSideBar";
import { Button, Typography, CircularProgress, Pagination } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import CategoryIcon from "@mui/icons-material/Category";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SettingsIcon from "@mui/icons-material/Settings";
import BarChartIcon from "@mui/icons-material/BarChart";
import DescriptionIcon from "@mui/icons-material/Description";
import EventNoteIcon from "@mui/icons-material/EventNote";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
import { Box } from "@mui/system";
import colors from "@/assets/styles/color";

const AttendanceDashboard = () => {
	const navigate = useNavigate();

	const { branch } = useParams();

	const [employees, setEmployees] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [limit, setLimit] = useState(10);

	const getEmployees = async (page = 1) => {
		setIsLoading(true);
		try {
			const res = await axiosInstance.get("employees", {
				params: { page, limit },
			});

			if (res.data.success) {
				setEmployees(res.data.employees.data);
				setTotalPages(res.data.employees.last_page);
				setCurrentPage(res.data.employees.current_page);
			}
		} catch (error) {
			console.log(error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		getEmployees(currentPage);
	}, [currentPage, limit]);

	return (
		<>
			<TopNavbar />
			<div className="main">
				<div className="sideBarWrapper">
					<Sidebar />
				</div>
				<div className="content">
					<div style={{ paddingTop: "1rem", backgroundColor: "transparent" }}>
						<div style={{ display: "flex", width: "98%", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
							<Typography variant="text" style={{ fontWeight: "500", fontSize: "24px" }}>
								Application Dashboard
							</Typography>
							<Button style={{ color: "white", backgroundColor: colors.primary }} onClick={() => navigate(`/${branch}/branch/employee/leave/application/new`)}>
								New Application
							</Button>
						</div>
						<div
							style={{
								display: "flex",
								flexWrap: "wrap",
								justifyContent: "center",
								gap: "50px",
								width: "98%",
								marginBottom: "24px",
							}}>
							{[
								{
									label: "Leave Category",
									icon: <CategoryIcon style={{ color: "#FF9933" }} />,
									bgColor: "#FFF2E5",
									borderColor: "#FFE0C2",
									path: "/branch/employee/leave/category",
								},
								{
									label: "Leave Application",
									icon: <AssignmentIcon style={{ color: "#FF66B2" }} />,
									bgColor: "#FFE5F1",
									borderColor: "#FCCFEF",
									path: "/branch/employee/leave/application",
								},
								{
									label: "Leave Management",
									icon: <SettingsIcon style={{ color: "#33CC33" }} />,
									bgColor: "#E5FFE5",
									borderColor: "#A4FFBF",
									path: "/branch/employee/leave/management",
								},
								{
									label: "Leave Report",
									icon: <BarChartIcon style={{ color: "#6666FF" }} />,
									bgColor: "#E5E5FF",
									borderColor: "#BEC0FF",
									path: "/branch/employee/leave/report",
								},
								{
									label: "Manage Attendance",
									icon: <AssignmentIcon style={{ color: "#FF9933" }} />,
									bgColor: "#FFF2E5",
									borderColor: "#F8EF91",
									path: "/branch/employee/manage/attendance",
								},
								{
									label: "Monthly Report",
									icon: <DescriptionIcon style={{ color: "#33CC33" }} />,
									bgColor: "#F2FFF2",
									borderColor: "#A6FFD7",
									path: "/branch/employee/attendance/monthly/report",
								},
								{
									label: "Attendance Report",
									icon: <EventNoteIcon style={{ color: "#33CC33" }} />,
									bgColor: "#F0FFF0",
									borderColor: "#B8FF8F",
									path: "/branch/employee/attendance/report",
								},
								{
									label: "Leave Reports",
									icon: <BarChartIcon style={{ color: "#6666FF" }} />,
									bgColor: "#E5E5FF",
									borderColor: "#BEC0FF",
									path: "",
								},
							].map((card, index) => (
								<div
									key={index}
									style={{
										flex: "1 1 calc(25% - 50px)", // 4 items per row
										maxWidth: "220px",
										maxHeight: "160px",
										padding: "20px",
										backgroundColor: "white",
										borderRadius: "12px",
										border: `2px solid ${card.borderColor}`,
										cursor: "pointer",
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										justifyContent: "center",
										textAlign: "center",
									}}
									onClick={() => card.path && navigate("/" + branch + card.path)}>
									<div
										style={{
											width: "40px",
											height: "40px",
											borderRadius: "50%",
											backgroundColor: card.bgColor,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											marginBottom: "12px",
										}}>
										{card.icon}
									</div>
									<div style={{ fontSize: "14px", color: "#333" }}>{card.label}</div>
								</div>
							))}
						</div>

						{/* Employee List Section */}
						<div style={{ backgroundColor: "white", width: "98%", borderRadius: "12px", padding: "24px" }}>
							<div style={{ marginBottom: "24px" }}>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										padding: "0 1rem",
									}}>
									<div style={{ fontSize: "18px", fontWeight: "500" }}>Employee List</div>
									<div style={{ position: "relative", width: "250px" }}>
										<input
											type="text"
											placeholder="Find by name"
											style={{
												width: "100%",
												padding: "8px 16px 8px 40px",
												border: "1px solid #E0E0E0",
												borderRadius: "8px",
												fontSize: "14px",
											}}
										/>
										<SearchIcon
											style={{
												position: "absolute",
												left: "1.5rem",
												top: "50%",
												transform: "translateY(-50%)",
												color: "#666",
											}}
										/>
									</div>
								</div>
							</div>

							<div style={{ overflowX: "auto" }}>
								<table style={{ width: "100%", borderCollapse: "collapse" }}>
									<thead>
										<tr style={{ borderBottom: "1px solid #E0E0E0" }}>
											<th style={{ padding: "12px 16px", textAlign: "left", color: "#666", fontWeight: "500" }}>EMP ID</th>
											<th style={{ padding: "12px 16px", textAlign: "left", color: "#666", fontWeight: "500" }}>Name</th>
											<th style={{ padding: "12px 16px", textAlign: "left", color: "#666", fontWeight: "500" }}>Department</th>
											<th style={{ padding: "12px 16px", textAlign: "left", color: "#666", fontWeight: "500" }}>Designation</th>
											<th style={{ padding: "12px 16px", textAlign: "left", color: "#666", fontWeight: "500" }}>Joining Date</th>
											<th style={{ padding: "12px 16px", textAlign: "left", color: "#666", fontWeight: "500" }}>Email Address</th>
										</tr>
									</thead>
									<tbody>
										{isLoading ? (
											<tr>
												<td colSpan={6} align="center" style={{ padding: "12px 16px", color: "#333" }}>
													<CircularProgress sx={{ color: "#FFCC16" }} />
												</td>
											</tr>
										) : employees.length > 0 ? (
											employees.map((row, index) => (
												<tr key={index}>
													<td style={{ cursor: "pointer", fontWeight: "bold", padding: "12px 16px", color: "#333" }} onClick={() => navigate(`/${branch}/branch/employee/details/${row.employee_id}`, { state: { employee: row } })}>
														#{row.employee_id}
													</td>
													<td style={{ padding: "12px 16px", color: "#333" }}>{row.user?.name}</td>
													<td style={{ padding: "12px 16px", color: "#333" }}>{row.department?.name}</td>
													<td style={{ padding: "12px 16px", color: "#333" }}>{row.user?.designation}</td>
													<td style={{ padding: "12px 16px", color: "#333" }}>{row.joining_date}</td>
													<td style={{ padding: "12px 16px", color: "#333" }}>{row.user.email}</td>
												</tr>
											))
										) : (
											<tr>
												<td colSpan={6} align="center">
													No invoices found.
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>

							<Box sx={{ display: "flex", justifyContent: "end", mt: 3, paddingBottom: "10px" }}>
								<Pagination count={totalPages} page={currentPage} onChange={(e, page) => setCurrentPage(page)} />
							</Box>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default AttendanceDashboard;
