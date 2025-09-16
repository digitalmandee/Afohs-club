import React, { useEffect, useState } from "react";
import TopNavbar from "@/components/topNavbar";
import Sidebar from "@/components/leftSideBar";
import { useNavigate, useParams } from "react-router-dom";
import { MdArrowBackIos } from "react-icons/md";
import { TextField, Select, MenuItem, Button, Card, CardContent, IconButton, Typography, FormControl, InputLabel, Menu, Snackbar, Alert } from "@mui/material";
import { ArrowBack, MoreVert } from "@mui/icons-material";
import "bootstrap/dist/css/bootstrap.min.css";
import axiosInstance from "@/utils/axiosInstance";
import dayjs from "dayjs";
import colors from "@/assets/styles/color";
const Management = () => {
	const navigate = useNavigate();
	const { branch } = useParams();

	const [clientName, setClientName] = useState("");
	const [selectedOption, setSelectedOption] = useState("");
	const [categories, setCategories] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

	const handleCloseSnackbar = () => {
		setSnackbar({ ...snackbar, open: false });
	};

	const getLeaveCatgories = async () => {
		setIsLoading(true);
		try {
			const res = await axiosInstance.get("employees/leavecategories");

			if (res.data.success) {
				setCategories(res.data.leave_categories);
			}
		} catch (error) {
			console.log(error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		getLeaveCatgories();
	}, []);

	const LeaveCard = ({ data }) => {
		const [menuAnchor, setMenuAnchor] = useState(null);
		const [deleteLoading, setDeleteLoading] = useState(false);

		const handleMenuOpen = (event) => {
			setMenuAnchor(event.currentTarget);
		};

		const handleMenuClose = () => {
			setMenuAnchor(null);
		};

		const handleDeleteClick = async (id) => {
			setDeleteLoading(true);

			try {
				const res = await axiosInstance.delete("employees/leavecategories/" + id);

				if (res.data.success) {
					setCategories((prevCategories) => prevCategories.filter((category) => category.id !== id));
					setSnackbar({ open: true, message: "Leave category deleted successfully!", severity: "success" });
				}
			} catch (error) {
				// console.log(error);
				setSnackbar({ open: true, message: error.response.data.message ?? "Something went wrong", severity: "error" });
			} finally {
				setDeleteLoading(false);
			}
		};

		return (
			<Card
				style={{
					flex: "1 1 calc(33.333% - 16px)",
					minWidth: "250px",
					padding: "16px",
					backgroundColor: "white",
					borderRadius: "12px",
					border: "1px solid #ccc",
					textAlign: "left",
					cursor: "pointer",
					boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
				}}>
				<CardContent>
					<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
						<Typography variant="h6">{data.name}</Typography>
						<div className="relative">
							<IconButton size="small" onClick={handleMenuOpen}>
								<MoreVert />
							</IconButton>
							<Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
								<MenuItem onClick={() => navigate(`/${branch}/branch/employee/leave/category/edit/${data.id}`)}>Edit</MenuItem>
								<MenuItem disabled={deleteLoading} onClick={() => handleDeleteClick(data.id)}>
									Delete
								</MenuItem>
							</Menu>
						</div>
					</div>
					<div style={{ marginBottom: "12px" }}>
						<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
							<Typography variant="body2" color="textSecondary">
								Added
							</Typography>
							<Typography variant="body2" color="textSecondary">
								Status
							</Typography>
						</div>
						<div style={{ display: "flex", justifyContent: "space-between" }}>
							<Typography variant="body2">{dayjs(data.created_at).format("DD MMM YYYY")}</Typography>
							<Typography variant="body2" sx={{ textTransform: "capitalize" }}>
								{data.status}
							</Typography>
						</div>
					</div>
					<div>
						<Typography variant="body2" color="textSecondary" style={{ marginBottom: "6px" }}>
							Description
						</Typography>
						<Typography variant="body2">{data.description}</Typography>
					</div>
				</CardContent>
			</Card>
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
						<h3 style={{ margin: 0 }}>Leave Category</h3>
					</div>
					<div style={{ marginBottom: "24px" }}>
						<div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
							<div style={{ flex: "1", maxWidth: "250px" }}>
								<TextField fullWidth label="Enter Client name" value={clientName} onChange={(e) => setClientName(e.target.value)} />
							</div>
							<div style={{ flex: "1", maxWidth: "250px" }}>
								<FormControl fullWidth>
									<InputLabel>Select one</InputLabel>
									<Select value={selectedOption} label="Select one" onChange={(e) => setSelectedOption(e.target.value)}>
										<MenuItem value="option1">Option 1</MenuItem>
										<MenuItem value="option2">Option 2</MenuItem>
										<MenuItem value="option3">Option 3</MenuItem>
									</Select>
								</FormControl>
							</div>
							<div style={{ maxWidth: "120px" }}>
								<Button
									onClick={() => navigate(`/${branch}/branch/employee/leave/category/create`)}
									variant="contained"
									fullWidth
									style={{
										backgroundColor: colors.primary,
										color: "white",
										textTransform: "none",
										padding: "12px",
										fontSize: "16px",
									}}>
									Add
								</Button>
							</div>
						</div>
					</div>

					{/* Cards Section */}
					<div style={{ display: "flex", width: "90%", flexWrap: "wrap", gap: "16px", justifyContent: "flex-start" }}>{categories.length > 0 && categories.map((category, index) => <LeaveCard key={index} data={category} />)}</div>
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

export default Management;
