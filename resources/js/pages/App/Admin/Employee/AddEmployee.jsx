import { useState } from "react"
import {
    Box,
    Typography,
    TextField,
    Button,
    Radio,
    RadioGroup,
    FormControlLabel,
    Paper,
    Grid,
    Select,
    MenuItem,
    InputAdornment,
    FormControl,
    IconButton
} from "@mui/material"
import { Add, ArrowBack } from "@mui/icons-material"
import SideNav from '@/components/App/AdminSideBar/SideNav'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { router } from "@inertiajs/react"

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const EmployeeInformationForm = () => {
    const [open, setOpen] = useState(true);
    const [employeeType, setEmployeeType] = useState("fullTime")

    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                    backgroundColor: '#F6F6F6'
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", ml: 5, pt: 5 }}>
                    <IconButton style={{ color: "#3F4E4F" }}
                        onClick={() => window.history.back()}
                    >
                        <ArrowBack />
                    </IconButton>
                    <h2 className="mb-0 fw-normal" style={{ color: "#3F4E4F", fontSize: '30px' }}>
                        Add Employee
                    </h2>
                </Box>
                <Box sx={{ maxWidth: 600, mx: "auto", px:2.5, border: '1px solid #E3E3E3', bgcolor:'#FFFFFF' }}>
                    {/* <Paper elevation={0} sx={{ px: 3, borderRadius: 1 }}> */}
                        <Grid container spacing={2}>
                            {/* Employee ID */}
                            <Grid
                                item
                                xs={12}
                                sx={{
                                    bgcolor: '#F6F6F6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    mt: 4,
                                    ml: 2,
                                    // py: 1,
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom:'12px' }}>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: "#7F7F7F", fontWeight: 400, fontSize: '16px' }}
                                    >
                                        Employee ID:
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: '16px',
                                            fontWeight: 700,
                                            color: '#063455'
                                        }}
                                    >
                                        EMP 520
                                    </Typography>
                                </div>
                            </Grid>

                            {/* Profile Picture */}
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    {/* Upload Box */}
                                    <Box
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            border: "1px dashed #063455",
                                            borderRadius: 1,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            bgcolor: "#B0DEFF",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <Add sx={{ color: "#063455", fontSize: 20 }} />
                                    </Box>

                                    {/* Text content next to box */}
                                    <Box sx={{
                                        mt: -5
                                    }}>
                                        <Typography variant="body2" sx={{ color: "#121212", fontWeight: 500 }}>
                                            Profile Picture
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: "#7F7F7F",
                                                fontWeight: 400,
                                                mt: 0.5,
                                                fontSize: "14px",
                                            }}
                                        >
                                            Click upload to change profile picture (4 MB max)
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>

                            {/* Employee Type */}
                            <Grid item xs={12}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Employee Type
                                </Typography>
                                <RadioGroup row value={employeeType} onChange={(e) => setEmployeeType(e.target.value)}>
                                    {[
                                        { value: "fullTime", label: "Full Time" },
                                        { value: "partTime", label: "Part Time" }
                                    ].map((option) => (
                                        <Box
                                            key={option.value}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                border: "1px solid #E3E3E3",
                                                borderRadius: "6px",
                                                padding: "4px 8px",
                                                marginRight: 2,
                                            }}
                                        >
                                            <Typography sx={{ marginRight: 1, fontSize: "14px" }}>{option.label}</Typography>
                                            <Radio
                                                value={option.value}
                                                checked={employeeType === option.value}
                                                onChange={(e) => setEmployeeType(e.target.value)}
                                            />
                                        </Box>
                                    ))}
                                </RadioGroup>
                            </Grid>

                            {/* Employee Name */}
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Employee Name
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="e.g. Dianne Russel"
                                    InputProps={{
                                        sx: {
                                            height: 40,
                                            '& input': {
                                                height: 40,
                                                padding: '0 14px',
                                                boxSizing: 'border-box',
                                            },
                                        },
                                    }}
                                />
                            </Grid>

                            {/* Designation */}
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Designation
                                </Typography>
                                <FormControl fullWidth>
                                    <Select
                                        displayEmpty
                                        sx={{
                                            height: 40,
                                            '& .MuiSelect-select': {
                                                height: 40,
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '0 14px',
                                            },
                                        }}
                                        renderValue={(selected) => {
                                            if (!selected) {
                                                return <Typography sx={{ color: "#999" }}>e.g. HR</Typography>
                                            }
                                            return selected
                                        }}
                                        IconComponent={() => (
                                            <Box sx={{ position: "absolute", right: 8, pointerEvents: "none" }}>
                                                <Box
                                                    component="svg"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    sx={{ height: 18, width: 18, color: "#666" }}
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                                </Box>
                                            </Box>
                                        )}
                                    >
                                        <MenuItem value="HR">HR</MenuItem>
                                        <MenuItem value="Manager">Manager</MenuItem>
                                        <MenuItem value="Developer">Developer</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Department */}
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Department
                                </Typography>
                                <FormControl fullWidth>
                                    <Select
                                        displayEmpty
                                        sx={{
                                            height: 40,
                                            '& .MuiSelect-select': {
                                                height: 40,
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '0 14px',
                                            },
                                        }}
                                        renderValue={(selected) => {
                                            if (!selected) {
                                                return <Typography sx={{ color: "#999" }}>e.g. HR Manager</Typography>
                                            }
                                            return selected
                                        }}
                                        IconComponent={() => (
                                            <Box sx={{ position: "absolute", right: 8, pointerEvents: "none" }}>
                                                <Box
                                                    component="svg"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    sx={{ height: 18, width: 18, color: "#666" }}
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                                </Box>
                                            </Box>
                                        )}
                                    >
                                        <MenuItem value="HR">HR Department</MenuItem>
                                        <MenuItem value="IT">IT Department</MenuItem>
                                        <MenuItem value="Finance">Finance Department</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Joining Date */}
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Joining Date
                                </Typography>
                                <TextField
                                    fullWidth
                                    type="date"
                                    InputProps={{
                                        sx: {
                                            height: 40,
                                            '& input': {
                                                height: 40,
                                                padding: '0 14px',
                                                boxSizing: 'border-box',
                                            },
                                        },
                                    }}
                                />
                            </Grid>

                            {/* Email */}
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Email
                                </Typography>
                                <TextField fullWidth placeholder="e.g. dianne@gmail.com"
                                    InputProps={{
                                        sx: {
                                            height: 40,
                                            '& input': {
                                                height: 40,
                                                padding: '0 14px',
                                                boxSizing: 'border-box',
                                            },
                                        },
                                    }}
                                />
                            </Grid>

                            {/* Contact Number */}
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Contact Number
                                </Typography>
                                <Box sx={{ display: "flex" }}>
                                    <TextField sx={{ width: 70, mr: 1 }} defaultValue="+92"
                                        InputProps={{
                                            sx: {
                                                height: 40,
                                                '& input': {
                                                    height: 40,
                                                    padding: '0 14px',
                                                    boxSizing: 'border-box',
                                                },
                                            },
                                        }}
                                    />
                                    <TextField fullWidth placeholder="892 000 000 000" InputProps={{
                                        sx: {
                                            height: 40,
                                            '& input': {
                                                height: 40,
                                                padding: '0 14px',
                                                boxSizing: 'border-box',
                                            },
                                        },
                                    }} />
                                </Box>
                            </Grid>

                            {/* Status */}
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Status
                                </Typography>
                                <FormControl fullWidth>
                                    <Select
                                        displayEmpty
                                        sx={{
                                            height: 40,
                                            '& .MuiSelect-select': {
                                                height: 40,
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '0 14px',
                                            },
                                        }}
                                        renderValue={(selected) => {
                                            if (!selected) {
                                                return <Typography sx={{ color: "#999" }}>e.g. Active/Inactive</Typography>
                                            }
                                            return selected
                                        }}
                                        IconComponent={() => (
                                            <Box sx={{ position: "absolute", right: 8, pointerEvents: "none" }}>
                                                <Box
                                                    component="svg"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    sx={{ height: 18, width: 18, color: "#666" }}
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                                </Box>
                                            </Box>
                                        )}
                                    >
                                        <MenuItem value="Active">Active</MenuItem>
                                        <MenuItem value="Inactive">Inactive</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Salary */}
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Salary
                                </Typography>
                                <TextField fullWidth placeholder="e.g. 10000" InputProps={{
                                    sx: {
                                        height: 40,
                                        '& input': {
                                            height: 40,
                                            padding: '0 14px',
                                            boxSizing: 'border-box',
                                        },
                                    },
                                }} />
                            </Grid>

                            {/* Action Buttons */}
                            <Grid item xs={12}>
                                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 2 }}>
                                    <Button variant="text" sx={{ color: "#666" }}>
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="contained"
                                        sx={{
                                            bgcolor: "#0a3d62",
                                            "&:hover": { bgcolor: "#0c2461" },
                                        }}
                                    >
                                        Save
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    {/* </Paper> */}
                </Box>
            </div>
        </>
    )
}
export default EmployeeInformationForm
