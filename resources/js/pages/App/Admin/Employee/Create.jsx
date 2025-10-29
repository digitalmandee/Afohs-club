import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Box, FormHelperText, Snackbar, Alert, Paper, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { router, usePage } from '@inertiajs/react';
import { MdArrowBackIos } from 'react-icons/md';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { enqueueSnackbar } from 'notistack';
import axios from 'axios';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const EmployeeCreate = () => {
    const [open, setOpen] = useState(true);

    const { props } = usePage();
    const { employeeTypes } = props; // comes from Laravel

    const [formData, setFormData] = useState({
        name: '',
        employee_id: '',
        email: '',
        designation: '',
        phone_no: '',
        salary: '',
        joining_date: '',
        department: null,
        gender: '',
        employment_type: 'full_time',
        employee_type_id: null,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [departments, setDepartments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch departments based on search input
    useEffect(() => {
        axios
            .get(route('api.departments.listAll', { type: 'search', query: searchTerm }))
            .then((res) => setDepartments(res.data.results))
            .catch((err) => console.error('Error fetching departments', err));
    }, [searchTerm]);

    const validate = () => {
        let newErrors = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.employee_id) newErrors.employee_id = 'Employee ID is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.phone_no) newErrors.phone_no = 'Phone number is required';
        if (!formData.salary) newErrors.salary = 'Salary is required';
        if (!formData.joining_date) newErrors.joining_date = 'Joining date is required';
        if (!formData.department) newErrors.department = 'Department is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setIsLoading(true);
        try {
            const payload = {
                ...formData,
                department_id: formData.department?.id || null,
            };
            await axios.post(route('api.employees.store'), payload);

            enqueueSnackbar('Employee added successfully!', { variant: 'success' });
            setTimeout(() => router.visit(route('employees.dashboard')), 1500);
        } catch (error) {
            // console.log(error.response.data);
            enqueueSnackbar(error.response.data.message || 'Failed to add employee.', { variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                    backgroundColor: '#F6F6F6',
                }}
            >
                <Box
                    sx={{
                        px: 2,
                        py: 2,
                    }}
                >
                    <div style={{ paddingTop: '1rem', display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                        <div onClick={() => router.visit(route('employees.dashboard'))} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <MdArrowBackIos style={{ fontSize: '20px', cursor: 'pointer' }} />
                        </div>
                        <h3 style={{ margin: 0 }}>Personal Detail</h3>
                    </div>
                    <Paper
                        sx={{
                            padding: '2rem',
                            borderRadius: '1rem',
                            maxWidth: '65rem',
                            margin: 'auto',
                            // boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <Box>
                                <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                                    Employment Type*
                                </Typography>
                                <RadioGroup row name="employment_type" value={formData.employment_type} onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}>
                                    {['full_time', 'part_time', 'contract'].map((type) => (
                                        <FormControlLabel key={type} value={type} control={<Radio />} label={type.replace('_', ' ').toUpperCase()} />
                                    ))}
                                </RadioGroup>
                                {errors.employment_type && <FormHelperText error>{errors.employment_type}</FormHelperText>}
                            </Box>

                            <Box>
                                <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                                    Employee Type*
                                </Typography>
                                <RadioGroup row name="employee_type_id" value={formData.employee_type_id} onChange={(e) => setFormData({ ...formData, employee_type_id: parseInt(e.target.value) })}>
                                    {employeeTypes.map((et) => (
                                        <FormControlLabel key={et.id} value={et.id} control={<Radio />} label={et.name} />
                                    ))}
                                </RadioGroup>
                                {errors.employee_type_id && <FormHelperText error>{errors.employee_type_id}</FormHelperText>}
                            </Box>
                        </Box>
                        <form
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 1fr',
                                gap: '16px',
                            }}
                        >
                            {[
                                { label: 'Employee Name*', name: 'name', placeholder: 'First Name' },
                                { label: 'Employee ID*', name: 'employee_id', placeholder: '12345' },
                                { label: 'Designation*', name: 'designation', placeholder: 'HR Manager' },
                                { label: 'E-mail*', name: 'email', placeholder: 'Abc@gmail.com' },
                                { label: 'Phone Number*', name: 'phone_no', placeholder: '03000000000', type: 'number', pattern: '[0-9]*' },
                                { label: 'Salary*', name: 'salary', placeholder: '30000', type: 'number', min: 0 },
                            ].map((field, index) => (
                                <Box key={index}>
                                    <Typography variant="body1" sx={{ fontWeight: 500, color: '#000000', marginBottom: '1rem' }}>
                                        {field.label}
                                    </Typography>
                                    <TextField
                                        sx={{
                                            backgroundColor: '#FFFFFF',
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { border: '1px solid #E9E9E9' },
                                                '&:hover fieldset': { border: '1px solid #E9E9E9' },
                                                '&.Mui-focused fieldset': { border: '1px solid #E9E9E9' },
                                            },
                                        }}
                                        name={field.name}
                                        value={formData[field.name]}
                                        onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                                        placeholder={field.placeholder}
                                        variant="outlined"
                                        fullWidth
                                        error={!!errors[field.name]}
                                        helperText={errors[field.name]}
                                        type={field.type || 'text'} // 👈 enforce type
                                        inputProps={{
                                            pattern: field.pattern || undefined,
                                            min: field.min || undefined,
                                        }}
                                    />
                                </Box>
                            ))}

                            <Box>
                                <Typography variant="body1" sx={{ fontWeight: 500, color: '#000000', marginBottom: '1rem' }}>
                                    Department*
                                </Typography>
                                <Autocomplete
                                    options={departments}
                                    getOptionLabel={(option) => option.name}
                                    value={formData.department}
                                    onInputChange={(event, value) => setSearchTerm(value)}
                                    onChange={(event, value) => setFormData({ ...formData, department: value })}
                                    renderInput={(params) => (
                                        <>
                                            <TextField
                                                sx={{
                                                    backgroundColor: '#FFFFFF',
                                                    '& .MuiOutlinedInput-root': {
                                                        '& fieldset': {
                                                            border: '1px solid #E9E9E9',
                                                        },
                                                        '&:hover fieldset': {
                                                            border: '1px solid #E9E9E9', // Lock border on hover
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            border: '1px solid #E9E9E9', // Optional: lock on focus too
                                                        },
                                                    },
                                                }}
                                                {...params}
                                                label="Search Department"
                                                variant="outlined"
                                            />
                                            {errors.department && <FormHelperText error>{errors.department}</FormHelperText>}
                                        </>
                                    )}
                                />
                            </Box>

                            <Box>
                                <Typography variant="body1" sx={{ fontWeight: 500, color: '#000000', marginBottom: '1rem' }}>
                                    Joining Date*
                                </Typography>
                                <TextField
                                    sx={{
                                        backgroundColor: '#FFFFFF',
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                border: '1px solid #E9E9E9',
                                            },
                                            '&:hover fieldset': {
                                                border: '1px solid #E9E9E9', // Lock border on hover
                                            },
                                            '&.Mui-focused fieldset': {
                                                border: '1px solid #E9E9E9', // Optional: lock on focus too
                                            },
                                        },
                                    }}
                                    type="date"
                                    name="joining_date"
                                    value={formData.joining_date}
                                    onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    error={!!errors.joining_date}
                                    helperText={errors.joining_date}
                                />
                            </Box>

                            <Box>
                                <Typography variant="body1" sx={{ fontWeight: 500, color: '#000000', marginBottom: '1rem' }}>
                                    Gender*
                                </Typography>
                                <TextField
                                    sx={{
                                        backgroundColor: '#FFFFFF',
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                border: '1px solid #E9E9E9',
                                            },
                                            '&:hover fieldset': {
                                                border: '1px solid #E9E9E9', // Lock border on hover
                                            },
                                            '&.Mui-focused fieldset': {
                                                border: '1px solid #E9E9E9', // Optional: lock on focus too
                                            },
                                        },
                                    }}
                                    select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    fullWidth
                                    variant="outlined"
                                    error={!!errors.gender}
                                    helperText={errors.gender}
                                    SelectProps={{ native: true }}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </TextField>
                            </Box>
                        </form>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', gap: '12px' }}>
                            <Button variant="contained" sx={{ backgroundColor: 'white', color: 'black' }} onClick={() => router.visit(document.referrer || '/')}>
                                Cancel
                            </Button>
                            <Button disabled={isLoading} variant="contained" onClick={handleSubmit} sx={{ backgroundColor: '#0a3d62', color: 'white' }}>
                                Submit
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            </div>
        </>
    );
};

export default EmployeeCreate;
