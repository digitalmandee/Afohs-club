import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Autocomplete, TextField, Button, Alert, Select, MenuItem, FormHelperText, FormControl, InputLabel, Snackbar } from "@mui/material";
import axiosInstance from "@/utils/axiosInstance";
import TopNavbar from "../../components/topNavbar";
import Sidebar from "../../components/leftSideBar";
import colors from "@/assets/styles/color";

const LeaveApplication = () => {
	const { id } = useParams(); // Get the ID from URL
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		employee: "",
		leave_category_id: "",
		start_date: "",
		end_date: "",
		reason: "",
		status: "pending", // Default status
	});
	const [isLoading, setIsLoading] = useState(false);
	const [employees, setEmployees] = useState([]);
	const [categories, setCategories] = useState([]);
	const [errors, setErrors] = useState({});
	const [searchloading, setSearchLoading] = useState(false);
	const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

	useEffect(() => {
		const getLeaveCategories = async () => {
			try {
				const res = await axiosInstance.get("employees/leavecategories/all");
				setCategories(res.data.categories);
			} catch (error) {
				console.log(error);
			}
		};

		getLeaveCategories();

		if (id) {
			const fetchLeaveData = async () => {
				try {
					const res = await axiosInstance.get(`employees/leaves/${id}`);
					const leave = res.data.application;
					setFormData({
						employee: leave.employee.user,
						leave_category_id: leave.leave_category.id,
						start_date: leave.start_date,
						end_date: leave.end_date,
						reason: leave.reason,
						status: leave.status || "pending", // Set status if available
					});
				} catch (error) {
					console.error("Error fetching leave data:", error);
				}
			};
			fetchLeaveData();
		}
	}, [id]);

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const fetchSearchResults = useCallback(async (query, type) => {
		if (!query) return [];
		setSearchLoading(true);
		try {
			const response = await axiosInstance.get("search", { params: { query, type } });
			setSearchLoading(false);
			return response.data.success ? response.data.results : [];
		} catch (error) {
			setSearchLoading(false);
			console.error("Error fetching search results:", error);
			return [];
		}
	}, []);

	const handleEmployeeSearch = async (event) => {
		const query = event.target.value;
		if (query) {
			const results = await fetchSearchResults(query, "employee");
			setEmployees(results);
		} else {
			setEmployees([]);
		}
	};

	const handleAutocompleteChange = (event, value, field) => {
		setFormData({ ...formData, [field]: value });
	};

	const validateForm = () => {
		let tempErrors = {};
		if (!formData.employee) tempErrors.employee = "Employee is required";
		if (!formData.leave_category_id) tempErrors.leave_category_id = "Category is required";
		if (!formData.start_date) tempErrors.start_date = "Start date is required";
		if (!formData.end_date) tempErrors.end_date = "End date is required";
		if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
			tempErrors.end_date = "End date must be after start date";
		}
		if (!formData.reason) tempErrors.reason = "Reason is required";
		setErrors(tempErrors);
		return Object.keys(tempErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validateForm()) return;

		try {
			setIsLoading(true);
			if (id) {
				// Update leave application
				await axiosInstance.put(`employees/leaves/${id}`, { ...formData, employee_id: formData.employee.id });
				setSnackbar({ open: true, message: "Leave application updated successfully!", severity: "success" });
			} else {
				// Create new leave application
				await axiosInstance.post("employees/leaves", { ...formData, employee_id: formData.employee.id });
				setSnackbar({ open: true, message: "Leave application submitted successfully!", severity: "success" });
			}
			navigate(-1);
		} catch (error) {
			setSnackbar({ open: true, message: error.response?.data?.message ?? "Something went wrong", severity: "error" });
		} finally {
			setIsLoading(false);
		}
	};

	const handleStatusUpdate = async (newStatus) => {
		try {
			setIsLoading(true);
			await axiosInstance.patch(`employees/leaves/${id}/status`, { status: newStatus });
			setFormData({ ...formData, status: newStatus });
			setSnackbar({ open: true, message: `Leave status updated to ${newStatus}`, severity: "success" });
		} catch (error) {
			setSnackbar({ open: true, message: error.response?.data?.message ?? "Error updating status", severity: "error" });
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
					<h3>{id ? "Edit Leave Application" : "New Leave Application"}</h3>
					<form onSubmit={handleSubmit} style={{ maxWidth: "600px", margin: "auto", padding: "24px", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
						<Autocomplete className="mb-3" options={employees} getOptionLabel={(option) => option.name || ""} value={formData.employee} onInputCapture={handleEmployeeSearch} onChange={(event, value) => handleAutocompleteChange(event, value, "employee")} renderInput={(params) => <TextField {...params} label="Search Employee" variant="outlined" error={!!errors.employee} helperText={errors.employee} />} />

						<FormControl fullWidth error={!!errors.leave_category_id}>
							<InputLabel id="leave-category-label">Leave Category</InputLabel>
							<Select labelId="leave-category-label" value={formData.leave_category_id} label="Leave Category" name="leave_category_id" onChange={handleChange}>
								<MenuItem value="">Select one</MenuItem>
								{categories.map((item) => (
									<MenuItem key={item.id} value={item.id}>
										{item.name}
									</MenuItem>
								))}
							</Select>
							<FormHelperText>{errors.leave_category_id}</FormHelperText>
						</FormControl>

						<TextField type="date" label="Start Date" InputLabelProps={{ shrink: true }} fullWidth name="start_date" value={formData.start_date} onChange={handleChange} margin="normal" error={!!errors.start_date} helperText={errors.start_date} />
						<TextField type="date" label="End Date" InputLabelProps={{ shrink: true }} fullWidth name="end_date" value={formData.end_date} onChange={handleChange} margin="normal" error={!!errors.end_date} helperText={errors.end_date} />
						<TextField multiline rows={3} label="Reason" fullWidth name="reason" value={formData.reason} onChange={handleChange} margin="normal" error={!!errors.reason} helperText={errors.reason} />

						{id && (
							<FormControl fullWidth error={!!errors.status}>
								<InputLabel id="leave-category-label">Status</InputLabel>
								<Select className="mb-3" fullWidth value={formData.status} onChange={handleChange} name="status" label="Status">
									<MenuItem value="pending">Pending</MenuItem>
									<MenuItem value="approved">Approved</MenuItem>
									<MenuItem value="rejected">Rejected</MenuItem>
								</Select>
							</FormControl>
						)}

						<div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
							<button
								type="button"
								style={{
									padding: "8px 16px",
									fontSize: "14px",
									border: "1px solid #E0E0E0",
									borderRadius: "4px",
									backgroundColor: "white",
									color: "#666",
									cursor: "pointer",
								}}
								onClick={() => navigate(-1)}>
								Cancel
							</button>
							<Button type="submit" disabled={isLoading} loading={isLoading} variant="contained" sx={{ backgroundColor: colors.primary, color: "white" }}>
								{id ? "Update" : "Add"}
							</Button>
						</div>
					</form>
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

export default LeaveApplication;
