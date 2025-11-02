import React, { useEffect, useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Alert, CircularProgress, InputAdornment, Snackbar, Button } from '@mui/material';
import { Search, Add } from '@mui/icons-material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Pagination, IconButton, TextField, Box, Typography } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';
import dayjs from 'dayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// const drawerWidthOpen = 240;
// const drawerWidthClosed = 110;

const LeaveApplication = () => {
	const { props } = usePage();
	const { leaveApplications } = props;

	// const [open, setOpen] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [date, setDate] = useState(dayjs());
	const [applications, setApplications] = useState(leaveApplications?.data || []);
	const [isLoading, setIsLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(leaveApplications?.current_page || 1);
	const [totalPages, setTotalPages] = useState(leaveApplications?.last_page || 1);
	const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

	useEffect(() => {
		if (leaveApplications?.data) {
			setApplications(leaveApplications.data);
			setCurrentPage(leaveApplications.current_page);
			setTotalPages(leaveApplications.last_page);
		}
	}, [leaveApplications]);

	const handleCloseSnackbar = () => {
		setSnackbar({ ...snackbar, open: false });
	};

	return (
		<>
			{/* <SideNav open={open} setOpen={setOpen} /> */}
			<div
				style={{
					minHeight: '100vh',
					backgroundColor: '#f5f5f5',
				}}
			>
				<Box sx={{ px: 2, py: 2 }}>
					<div style={{ paddingTop: '1rem' }}>
						{/* Header */}
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
							<Typography variant="h5" style={{ fontWeight: 'bold' }}>
								Leave Applications
							</Typography>
							<Button
								variant="contained"
								startIcon={<Add />}
								onClick={() => router.visit(route('employees.leaves.application.create'))}
								style={{
									backgroundColor: '#063455',
									color: 'white',
									textTransform: 'none',
								}}
							>
								New Application
							</Button>
						</div>
						<Box style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

							{/* Date Picker on the Right */}
							<LocalizationProvider dateAdapter={AdapterDayjs}>
								<DatePicker label="Select Date" value={date} onChange={(newValue) => setDate(newValue)} renderInput={(params) => <TextField {...params} size="small" />} />
							</LocalizationProvider>
						</Box>

						<TableContainer component={Paper}>
							<Table>
								<TableHead>
									<TableRow style={{ backgroundColor: "#063455" }}>
										<TableCell sx={{ fontWeight: "bold", color: "white" }}>#</TableCell>
										<TableCell sx={{ fontWeight: "bold", color: "white" }}>Employ Name</TableCell>
										<TableCell sx={{ fontWeight: "bold", color: "white" }}>Start date</TableCell>
										<TableCell sx={{ fontWeight: "bold", color: "white" }}>End Date</TableCell>
										<TableCell sx={{ fontWeight: "bold", color: "white" }}>Leaves Days</TableCell>
										<TableCell sx={{ fontWeight: "bold", color: "white" }}>Leave Category</TableCell>
										<TableCell sx={{ fontWeight: "bold", color: "white" }}>Created At</TableCell>
										<TableCell sx={{ fontWeight: "bold", color: "white" }}>Active</TableCell>
										<TableCell sx={{ fontWeight: "bold", color: "white" }}>Action</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{isLoading ? (
										<TableRow>
											<TableCell colSpan={9} align="center">
												<CircularProgress sx={{ color: "#E0E8F0" }} />
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
															backgroundColor: application.status === 'approved' ? '#063455' : application.status === 'pending' ? '#FFA726' : '#F44336',
															color: 'white',
															padding: '4px 12px',
															borderRadius: '50px',
															textTransform: 'capitalize',
															display: 'inline-block',
														}}>
														{application.status}
													</span>
												</TableCell>
												<TableCell>
													<IconButton size="small" onClick={() => router.visit(route('employees.leaves.application.edit', application.id))}>
														<EditIcon fontSize="small" />
													</IconButton>
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
						<div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
							<Pagination count={totalPages} page={currentPage} onChange={(e, page) => setCurrentPage(page)} shape="rounded" />
						</div>
					</div>
				</Box>
			</div>

			{/* Snackbar */}
			<Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar}>
				<Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
					{snackbar.message}
				</Alert>
			</Snackbar>
		</>
	);
};

export default LeaveApplication;
