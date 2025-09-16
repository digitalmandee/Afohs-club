import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopNavbar from "@/components/topNavbar";
import Sidebar from "@/components/leftSideBar";
import { MdArrowBackIos } from "react-icons/md";
import axiosInstance from "@/utils/axiosInstance";
import { Alert, Button, Snackbar } from "@mui/material";
import colors from "@/assets/styles/color";
const EditCategory = () => {
	const navigate = useNavigate();
	const { branch, id } = useParams();

	const [formData, setFormData] = useState({
		name: "",
		color: "#000000",
		description: "",
		short_code: "",
		status: "published",
	});
	const [errors, setErrors] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

	// Fetch category details on mount
	useEffect(() => {
		const fetchCategory = async () => {
			setIsLoading(true);
			try {
				const res = await axiosInstance.get(`employees/leavecategories/${id}`);
				if (res.data.success) {
					setFormData(res.data.leave_category);
				}
			} catch (error) {
				console.error("Error fetching category:", error);
				setSnackbar({ open: true, message: "Failed to fetch category", severity: "error" });
			} finally {
				setIsLoading(false);
			}
		};

		if (id) fetchCategory();
	}, [id]);

	// Handle input change
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	// Validate form fields
	const validateForm = () => {
		let newErrors = {};
		if (!formData.name.trim()) newErrors.name = "Category name is required.";
		if (!formData.description.trim()) newErrors.description = "Description is required.";
		if (!formData.short_code.trim()) newErrors.short_code = "Abbreviation is required.";
		if (!formData.status) newErrors.status = "Status is required.";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validateForm()) return;

		setIsLoading(true);
		try {
			await axiosInstance.put(`employees/leavecategories/${id}`, formData);
			setSnackbar({ open: true, message: "Category updated successfully!", severity: "success" });
			navigate(`/${branch}/branch/employee/leave/category`);
		} catch (error) {
			setSnackbar({ open: true, message: error.response?.data?.message ?? "Something went wrong", severity: "error" });
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
						<h3 style={{ margin: 0 }}>Edit Leave Category</h3>
					</div>
					<form
						onSubmit={handleSubmit}
						style={{
							maxWidth: "600px",
							margin: "20px auto",
							padding: "24px",
							backgroundColor: "white",
							borderRadius: "8px",
							boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
						}}>
						{/* Name */}
						<div style={{ marginBottom: "12px" }}>
							<label style={{ fontSize: "14px", color: "#333", marginBottom: "8px", display: "block" }}>
								Name <span style={{ color: "#FF0000" }}>*</span>
							</label>
							<input
								type="text"
								name="name"
								value={formData.name}
								onChange={handleChange}
								placeholder="Category Name"
								style={{
									width: "100%",
									padding: "12px",
									fontSize: "14px",
									border: "1px solid #E0E0E0",
									borderRadius: "4px",
									margin: 0,
								}}
							/>
							{errors.name && <p style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>{errors.name}</p>}
						</div>

						{/* Color */}
						<div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
							<div style={{ flex: 1 }}>
								<label style={{ fontSize: "14px", color: "#333", marginBottom: "8px", display: "block" }}>
									Abbreviation <span style={{ color: "#FF0000" }}>*</span>
								</label>
								<input
									type="text"
									name="short_code"
									value={formData.short_code}
									onChange={handleChange}
									placeholder="Abbreviation"
									style={{
										width: "100%",
										padding: "12px",
										fontSize: "14px",
										border: "1px solid #E0E0E0",
										borderRadius: "4px",
										margin: 0,
									}}
								/>
								{errors.short_code && <p style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>{errors.short_code}</p>}
							</div>
							<div style={{ marginBottom: "12px" }}>
								<label style={{ fontSize: "14px", color: "#333", marginBottom: "8px", display: "block" }}>
									Color <span style={{ color: "#FF0000" }}>*</span>
								</label>
								<input
									type="color"
									name="color"
									value={formData.color}
									onChange={handleChange}
									style={{
										width: "100px",
										height: "40px",
										border: "none",
										cursor: "pointer",
										margin: 0,
									}}
								/>
							</div>
						</div>

						<div style={{ marginBottom: "12px" }}>
							<label style={{ fontSize: "14px", color: "#333", marginBottom: "8px", display: "block" }}>Status</label>
							<select
								name="status"
								value={formData.status}
								onChange={handleChange}
								style={{
									width: "100%",
									padding: "12px",
									fontSize: "14px",
									border: "1px solid #E0E0E0",
									borderRadius: "4px",
									margin: 0,
								}}>
								<option value="published">Published</option>
								<option value="draft">Draft</option>
							</select>

							{errors.status && <p style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>{errors.status}</p>}
						</div>
						{/* Description */}
						<div style={{ marginBottom: "24px" }}>
							<label style={{ fontSize: "14px", color: "#333", marginBottom: "8px", display: "block" }}>
								Description <span style={{ color: "#FF0000" }}>*</span>
							</label>
							<textarea
								name="description"
								value={formData.description}
								onChange={handleChange}
								placeholder="Enter description..."
								style={{
									width: "100%",
									height: "100px",
									padding: "12px",
									fontSize: "14px",
									border: "1px solid #E0E0E0",
									borderRadius: "4px",
									resize: "none",
								}}
							/>
							{errors.description && <p style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>{errors.description}</p>}
						</div>

						{/* Buttons */}
						<div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
							<button
								type="button"
								onClick={() => navigate(-1)}
								style={{
									padding: "8px 16px",
									fontSize: "14px",
									border: "1px solid #E0E0E0",
									borderRadius: "4px",
									backgroundColor: "white",
									color: "#666",
									cursor: "pointer",
								}}>
								Cancel
							</button>
							<Button type="submit" disabled={isLoading} variant="contained" sx={{ backgroundColor: colors.primary, color: "white" }}>
								{isLoading ? "Updating..." : "Update"}
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

export default EditCategory;
