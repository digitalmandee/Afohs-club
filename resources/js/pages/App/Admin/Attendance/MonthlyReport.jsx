import React, { useEffect, useState, usestate } from "react";
import TopNavbar from "../../components/topNavbar";
import Sidebar from "../../components/leftSideBar";
import { useNavigate } from "react-router-dom";
import { MdArrowBackIos } from "react-icons/md";
import SearchIcon from "@mui/icons-material/Search";
import axiosInstance from "@/utils/axiosInstance";
import { CircularProgress, FormControl, MenuItem, Pagination, Select } from "@mui/material";
import colors from "@/assets/styles/color";

const MonthlyReport = () => {
	const navigate = useNavigate();

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
			const res = await axiosInstance.get("employees/leaves/reports/monthly", {
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
						<h3 style={{ margin: 0 }}>Attendance Report</h3>
					</div>
					<div style={{ padding: "24px", backgroundColor: "#F8F7FF", minHeight: "100vh" }}>
						{/* Header Section */}
						<div className="d-flex justify-content-between">
							<div
								style={{
									display: "flex",
									gap: "16px",
									marginBottom: "24px",
								}}>
								{/* Search Input */}
								<div
									style={{
										position: "relative",
										flex: "0 1 auto",
										maxWidth: "250px",
									}}>
									<input
										type="text"
										placeholder="Search..."
										style={{
											width: "100%",
											padding: "8px 36px",
											fontSize: "14px",
											border: "1px solid #E0E0E0",
											borderRadius: "4px",
											backgroundColor: "white",
										}}
									/>
									<SearchIcon
										style={{
											position: "absolute",
											left: "20px",
											top: "50%",
											transform: "translateY(-50%)",
											color: "#666",
										}}
									/>
								</div>

								{/* Add Button */}
								<button
									style={{
										padding: "8px 24px",
										backgroundColor: colors.primary,
										color: "white",
										border: "none",
										borderRadius: "4px",
										cursor: "pointer",
										fontSize: "14px",
										marginLeft: "0.5rem",
									}}>
									Add
								</button>
							</div>
							<div>
								<FormControl size="small">
									<Select value={month} onChange={(e) => setMonth(e.target.value)} sx={{ minWidth: 120 }}>
										{months.map((m) => (
											<MenuItem key={m.value} value={m.value}>
												{m.label}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</div>
						</div>

						{/* Employee Cards Grid */}
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
								gap: "24px",
							}}>
							{isLoading ? (
								<div style={{ gridColumn: "span 4", marginTop: "2rem" }} className="d-flex justify-content-center">
									<CircularProgress sx={{ color: "#FFCC16" }} />
								</div>
							) : employees.length > 0 ? (
								employees.map((employee, index) => (
									<div
										key={index}
										style={{
											backgroundColor: "white",
											borderRadius: "8px",
											overflow: "hidden",
											boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
										}}>
										{/* Employee Info */}
										<div
											style={{
												padding: "24px",
												display: "flex",
												flexDirection: "column",
												alignItems: "center",
												borderBottom: "1px solid #E0E0E0",
											}}>
											{employee.profile_image ? (
												<img
													src={import.meta.env.VITE_ASSET_API + profile_image || "/placeholder.svg"}
													alt={employee.employee_name}
													style={{
														width: "50px",
														height: "50px",
														borderRadius: "50%",
														marginBottom: "12px",
														objectFit: "contain",
													}}
												/>
											) : (
												<div
													style={{
														width: "64px",
														height: "64px",
														borderRadius: "50%",
														backgroundColor: "#F5F5F5",
														marginBottom: "12px",
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
													}}>
													<span style={{ color: "#666" }}>👤</span>
												</div>
											)}
											<div style={{ color: "#666", fontSize: "14px", marginBottom: "4px" }}>Employ ID : {employee.employee_id}</div>
											<div style={{ fontSize: "16px", fontWeight: "500", marginBottom: "4px" }}>{employee.employee_name}</div>
											<div style={{ color: "#666", fontSize: "14px" }}>{employee.designation}</div>
										</div>

										{/* Statistics */}
										<div style={{ padding: "16px 24px", backgroundColor: "#FFFFFF" }}>
											<div
												style={{
													display: "flex",
													justifyContent: "space-between",
													marginBottom: "16px",
												}}>
												<div
													style={{
														backgroundColor: "#F5F6FA",
														width: "100%",
														maxWidth: "120px",
														borderRadius: "10px",
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														flexDirection: "column",
														padding: "10px",
													}}>
													<div style={{ fontSize: "20px", fontWeight: "500" }}>{employee.total_leave}</div>
													<div style={{ color: "#666", fontSize: "12px" }}>Total Leave</div>
												</div>
												<div
													style={{
														backgroundColor: "#F5F6FA",
														width: "100%",
														maxWidth: "120px",
														borderRadius: "10px",
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														flexDirection: "column",
														padding: "10px",
													}}>
													<div style={{ fontSize: "20px", fontWeight: "500" }}>{employee.total_attendance}</div>
													<div style={{ color: "#666", fontSize: "12px" }}>Total Attendance</div>
												</div>
											</div>
											<div
												style={{
													display: "flex",
													justifyContent: "space-between",
												}}>
												<div
													style={{
														backgroundColor: "#F5F6FA",
														width: "100%",
														maxWidth: "120px",
														borderRadius: "10px",
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														flexDirection: "column",
														padding: "10px",
													}}>
													<div style={{ fontSize: "20px", fontWeight: "500" }}>{employee.time_present}</div>
													<div style={{ color: "#666", fontSize: "12px" }}>Time Present</div>
												</div>
												<div
													style={{
														backgroundColor: "#F5F6FA",
														width: "100%",
														maxWidth: "120px",
														borderRadius: "10px",
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														flexDirection: "column",
														padding: "10px",
													}}>
													<div style={{ fontSize: "20px", fontWeight: "500" }}>{employee.time_late}</div>
													<div style={{ color: "#666", fontSize: "12px" }}>Time Late</div>
												</div>
											</div>
											<div style={{ height: "8px", backgroundColor: colors.primary, marginTop: "auto" }}></div>
										</div>
									</div>
								))
							) : (
								<div
									style={{
										gridColumn: "span 4",
										marginTop: "2rem",
										display: "flex",
										justifyContent: "center",
										alignItems: "center",
										height: "100%",
										fontSize: "16px",
										fontWeight: "500",
										color: "#666",
									}}>
									No data found
								</div>
							)}
						</div>

						{/* Pagination */}
						<div className="d-flex justify-content-end mt-4">
							<Pagination count={totalPages} page={currentPage} onChange={(e, page) => setCurrentPage(page)} shape="rounded" style={{ color: colors.primary }} />
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default MonthlyReport;
