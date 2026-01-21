import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Box, Typography, Button, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Grid, Pagination, Avatar, Divider, Tooltip, Autocomplete } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, Person as PersonIcon, AdminPanelSettings as AdminIcon, Work as WorkIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const UserManagement = () => {
    const { users, roles, tenants, filters, can } = usePage().props;
    const { enqueueSnackbar } = useSnackbar();
    // const [open, setOpen] = useState(true);
    const [search, setSearch] = useState(filters.search || '');
    const [createUserOpen, setCreateUserOpen] = useState(false);
    const [createEmployeeUserOpen, setCreateEmployeeUserOpen] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: '' });
    const [employeeUser, setEmployeeUser] = useState({ employee_id: '', password: '', tenant_ids: [] });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.users.index'), { search }, { preserveState: true });
    };

    const handleCreateSuperAdminUser = () => {
        router.post(route('admin.users.create-super-admin'), newUser, {
            onSuccess: () => {
                setCreateUserOpen(false);
                setNewUser({ name: '', email: '', password: '', role: '' });
                enqueueSnackbar('Super Admin user created successfully!', { variant: 'success' });
            },
            onError: (errors) => {
                // Show specific validation errors
                if (typeof errors === 'object' && errors !== null) {
                    Object.values(errors).forEach((error) => {
                        enqueueSnackbar(error, { variant: 'error' });
                    });
                } else {
                    enqueueSnackbar('Error creating user', { variant: 'error' });
                }
            },
        });
    };

    const handleCreateEmployeeUser = () => {
        router.post(route('admin.users.create-employee'), employeeUser, {
            onSuccess: () => {
                setCreateEmployeeUserOpen(false);
                setEmployeeUser({ employee_id: '', password: '', tenant_ids: [] });
                enqueueSnackbar('Employee user created successfully!', { variant: 'success' });
            },
            onError: (errors) => {
                // Show specific validation errors
                if (typeof errors === 'object' && errors !== null) {
                    Object.values(errors).forEach((error) => {
                        enqueueSnackbar(error, { variant: 'error' });
                    });
                } else {
                    enqueueSnackbar('Error creating employee user', { variant: 'error' });
                }
            },
        });
    };

    const handleAssignRole = (userId, roleName) => {
        router.post(
            route('admin.users.assign-role'),
            { user_id: userId, role_name: roleName },
            {
                onSuccess: () => {
                    enqueueSnackbar('Role assigned successfully!', { variant: 'success' });
                },
                onError: () => {
                    enqueueSnackbar('Error assigning role', { variant: 'error' });
                },
            },
        );
    };

    const handleRemoveRole = (userId, roleName) => {
        router.post(
            route('admin.users.remove-role'),
            { user_id: userId, role_name: roleName },
            {
                onSuccess: () => {
                    enqueueSnackbar('Role removed successfully!', { variant: 'success' });
                },
                onError: () => {
                    enqueueSnackbar('Error removing role', { variant: 'error' });
                },
            },
        );
    };

    const getRoleColor = (roleName) => {
        switch (roleName) {
            case 'super-admin':
                return 'error';
            case 'admin':
                return 'warning';
            case 'manager':
                return 'info';
            case 'staff':
                return 'success';
            case 'user':
                return 'primary';
            default:
                return 'default';
        }
    };

    const getUserTypeIcon = (user) => {
        if (user.roles.some((role) => ['super-admin', 'admin'].includes(role.name))) {
            return <AdminIcon sx={{ color: '#d32f2f' }} />;
        }
        if (user.employee) {
            return <WorkIcon sx={{ color: '#1976d2' }} />;
        }
        return <PersonIcon sx={{ color: '#757575' }} />;
    };

    const capitalizeFirstLetter = (text = '') => text.charAt(0).toUpperCase() + text.slice(1);

    return (
        <>
            <Head title="User Management" />
            {/* <SideNav open={open} setOpen={setOpen} /> */}
            <Box
                sx={{
                    minHeight: '100vh',
                    p: 3,
                    backgroundColor: '#f5f5f5',
                }}
            >
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography sx={{ fontWeight: 700, color: '#063455', fontSize: '30px' }}>User Management</Typography>
                    </Box>
                    {can.create && (
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="contained"
                                startIcon={<AdminIcon />}
                                onClick={() => setCreateUserOpen(true)}
                                sx={{
                                    backgroundColor: '#063455',
                                    textTransform: 'none',
                                    borderRadius: '16px',
                                    '&:hover': { backgroundColor: '#063455' },
                                }}
                            >
                                Create Super Admin
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<WorkIcon />}
                                onClick={() => setCreateEmployeeUserOpen(true)}
                                sx={{
                                    backgroundColor: '#063455',
                                    textTransform: 'none',
                                    borderRadius: '16px',
                                    '&:hover': { borderColor: '#1565c0', backgroundColor: '#063455' },
                                }}
                            >
                                Create Employee User
                            </Button>
                        </Box>
                    )}
                </Box>

                {/* Search */}
                <Box sx={{ mb: 3 }}>
                    <form onSubmit={handleSearch}>
                        <TextField
                            fullWidth
                            placeholder="Search users by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            sx={{
                                width: '300px',
                                backgroundColor: 'transparent',

                                '& .MuiInputBase-root': {
                                    height: 40, // 🔥 set height
                                    backgroundColor: 'transparent', // remove white background
                                    paddingRight: 0,
                                    borderRadius: '16px',
                                },

                                '& .MuiInputBase-input': {
                                    padding: '0 8px', // vertically center input text
                                },

                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#999', // border color (optional)
                                },
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </form>
                </Box>

                {/* Users Table */}
                <TableContainer sx={{ borderRadius: '12px', overflowX: 'auto' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#063455' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, color: '#fff' }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#fff' }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#fff' }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#fff' }}>Roles</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#fff' }}>Employee Info</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#fff' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.data.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar sx={{ mr: 2, bgcolor: '#063455' }}>{user.name.charAt(0).toUpperCase()}</Avatar>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    fontWeight: 600,
                                                    textOverflow: 'ellipsis',
                                                    overflow: 'hidden',
                                                    maxWidth: '100px',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                <Tooltip title={user.name} arrow>
                                                    <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</Box>
                                                </Tooltip>

                                                <Typography variant="caption" color="textSecondary">
                                                    ID: {user.id}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            {getUserTypeIcon(user)}
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    ml: 1,
                                                    textOverflow: 'ellipsis',
                                                    overflow: 'hidden',
                                                    maxWidth: '100px',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {user.roles.some((role) => ['super-admin', 'admin'].includes(role.name)) ? 'Admin User' : user.employee ? 'Employee User' : 'Regular User'}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            textOverflow: 'ellipsis',
                                            overflow: 'hidden',
                                            maxWidth: '150px',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        <Tooltip title={user.email} arrow>
                                            {user.email}
                                        </Tooltip>
                                    </TableCell>
                                    {/* <TableCell>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {user.roles.map((role) => (
                                                <Chip key={role.id} label={role.name} color={getRoleColor(role.name)} size="small" variant="outlined" onDelete={can.edit ? () => handleRemoveRole(user.id, role.name) : undefined} />
                                            ))}
                                        </Box>
                                    </TableCell> */}
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {user.roles.map((role) => (
                                                <Chip key={role.id} label={capitalizeFirstLetter(role.name)} color={getRoleColor(role.name)} size="small" variant="outlined" onDelete={can.edit ? () => handleRemoveRole(user.id, role.name) : undefined} />
                                            ))}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        {user.employee ? (
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {user.employee.designation}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    Emp ID: {user.employee.employee_id}
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Typography variant="body2" color="textSecondary">
                                                No employee record
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {can.edit && (
                                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                                <InputLabel>Assign Role</InputLabel>
                                                <Select label="Assign Role" onChange={(e) => handleAssignRole(user.id, e.target.value)} displayEmpty>
                                                    {roles
                                                        .filter((role) => !user.roles.some((userRole) => userRole.name === role.name))
                                                        .map((role) => (
                                                            <MenuItem key={role.id} value={role.name}>
                                                                {role.name}
                                                            </MenuItem>
                                                        ))}
                                                </Select>
                                            </FormControl>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                {users.last_page > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Pagination
                            count={users.last_page}
                            page={users.current_page}
                            onChange={(e, page) => {
                                router.get(route('admin.users.index'), { ...filters, page });
                            }}
                            color="primary"
                        />
                    </Box>
                )}

                {/* Create Super Admin User Dialog */}
                <Dialog open={createUserOpen} onClose={() => setCreateUserOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
                        <AdminIcon sx={{ mr: 1, color: '#063455' }} />
                        Create Super Admin User
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Full Name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Password" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Role</InputLabel>
                                    <Select value={newUser.role} label="Role" onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                                        {roles.map((role) => (
                                            <MenuItem key={role.id} value={role.name}>
                                                <Chip label={role.name} color={getRoleColor(role.name)} size="small" sx={{ mr: 1 }} />
                                                {role.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCreateUserOpen(false)} sx={{ border: '1px solid #063455', color: '#063455', textTransform: 'none' }}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateSuperAdminUser} variant="contained" sx={{ bgcolor: '#063455', textTransform: 'none' }}>
                            Create User
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Create Employee User Dialog */}
                <Dialog open={createEmployeeUserOpen} onClose={() => setCreateEmployeeUserOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
                        <WorkIcon sx={{ mr: 1, color: '#063455' }} />
                        Create Employee User Account
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Create a user account for an existing employee to access the POS system.
                        </Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Employee ID" placeholder="Enter employee ID" value={employeeUser.employee_id} onChange={(e) => setEmployeeUser({ ...employeeUser, employee_id: e.target.value })} helperText="The employee must exist in the employee system" />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Password" type="password" value={employeeUser.password} onChange={(e) => setEmployeeUser({ ...employeeUser, password: e.target.value })} helperText="Password for the employee to login to POS system" />
                            </Grid>
                            <Grid item xs={12}>
                                <Autocomplete
                                    multiple
                                    options={tenants || []}
                                    getOptionLabel={(option) => option.name}
                                    value={(tenants || []).filter((t) => employeeUser.tenant_ids.includes(t.id))}
                                    onChange={(e, values) =>
                                        setEmployeeUser({
                                            ...employeeUser,
                                            tenant_ids: values.map((v) => v.id),
                                        })
                                    }
                                    renderInput={(params) => <TextField {...params} label="Allowed Restaurants" placeholder="Select restaurants this employee can access" helperText="Select which restaurants this cashier can punch orders for" />}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCreateEmployeeUserOpen(false)} sx={{ color: '#063455', border: '1px solid #063455', textTransform: 'none' }}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateEmployeeUser} variant="contained" sx={{ bgcolor: '#063455', textTransform: 'none' }}>
                            Create Employee User
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </>
    );
};

export default UserManagement;
