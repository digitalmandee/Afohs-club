import { router, usePage } from '@inertiajs/react';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HomeIcon from '@mui/icons-material/Home';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import PeopleIcon from '@mui/icons-material/People';
import { Avatar, Collapse } from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { TiBusinessCard } from "react-icons/ti";
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { styled } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { useState } from 'react';

const drawerWidthOpen = 240; // Set open width to 240px
const drawerWidthClosed = 110; // Set closed width to 120px

const openedMixin = (theme) => ({
    width: drawerWidthOpen,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: drawerWidthClosed,
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    width: open ? drawerWidthOpen : drawerWidthClosed,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    '& .MuiDrawer-paper': {
        width: open ? drawerWidthOpen : drawerWidthClosed, // Ensure proper width change
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
        }),
        backgroundColor: '#000', // Keep the black background
        color: '#fff',
        ...(open ? openedMixin(theme) : closedMixin(theme)),
    },
}));

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: open ? drawerWidthOpen : drawerWidthClosed,
    width: `calc(100% - ${open ? drawerWidthOpen : drawerWidthClosed}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
}));

export default function SideNav({ open, setOpen }) {
    const { url, component, props } = usePage();

    const [showNotification, setShowNotification] = React.useState(false);
    const [showProfile, setShowProfile] = React.useState(false);
    const [showOrder, setShowOrder] = React.useState(false);
    const [profileView, setProfileView] = React.useState('profile');

    const [openDropdown, setOpenDropdown] = useState({});
    const toggleDropdown = (text) => {
        if (!open) return; // Prevent toggling if drawer is closed
        setOpenDropdown((prev) => ({ ...prev, [text]: !prev[text] }));
    };

    // const menuItems = [
    //     { text: 'Dashboard', icon: <HomeIcon />, path: '/dashboard' },
    //     { text: 'Room & Booking Event', icon: <CalendarMonthIcon />, path: '/booking/dashboard' },
    // ];
    const menuItems = [
        {
            text: 'Dashboard',
            icon: <HomeIcon />,
            path: route('dashboard'),
        },
        {
            text: 'Room & Booking Event',
            icon: <CalendarMonthIcon />,
            children: [
                {
                    text: 'Dashboard',
                    path: route('rooms.dashboard'),
                },
                {
                    text: 'Rooms',
                    path: route('rooms.manage'),
                },
                {
                    text: 'Events',
                    path: route('events.manage'),
                },
            ],
        },
        {
            text: 'Membership Booking',
            icon: <TiBusinessCard style={{width:25, height:25}}/>,
            children: [
                {
                    text: 'Dashboard',
                    path: route('membership.dashboard'),
                },
                {
                    text: 'All Memberships',
                    path: route('membership.members'),
                },
                {
                    text: 'Members History',
                    path: route('membership.history'),
                },
                {
                    text: 'Guest History',
                    path: route('membership.guest'),
                },
                {
                    text: 'Membership Type',
                    path: route('membership.membertype'),
                },
                {
                    text: 'Finance',
                    path: route('membership.finance'),
                },
            ],
        },
        {
            text: 'Employee Management',
            icon: <PeopleIcon />,
            children: [
                {
                    text: 'Dashboard',
                    path: route('employee.dashboard'),
                },
                {
                    text: 'Employee List',
                    path: route('employee.employeeList'),
                },
                {
                    text: 'Department',
                    path: route('employee.departmentlist'),
                },
                {
                    text: 'Attendance',
                    path: route('employee.attendance'),
                },
            ],
        },
        {
            text: 'Tenant',
            icon: <PeopleIcon />,
            children: [
                {
                    text: 'Dashboard',
                    path: route('tenant.index'),
                },
                {
                    text: 'Create Tenant',
                    path: route('tenant.create'),
                },
            ],
        },
        {
            text: 'Settings',
            icon: <PeopleIcon />,
            children: [
                {
                    text: 'Profile settings',
                    path: '/settings/profile',
                },
                {
                    text: 'Password',
                    path: '/settings/password',
                },
            ],
        },
        {
            text: 'Logout',
            icon: <HomeIcon />,
            path: route('logout'),
        },
    ];

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                open={open}
                style={{
                    backgroundColor: '#D3E1EB',
                    height: '80px',
                    justifyContent: 'center',
                    zIndex: 1000,
                }}
            >
                <Toolbar
                    style={{
                        justifyContent: 'space-between',
                        zIndex: 1000,
                    }}
                >
                    {/* Toggle Menu Icon */}
                    <IconButton
                        color="inherit"
                        aria-label="toggle drawer"
                        onClick={() => setOpen(!open)} // Toggle sidebar
                        edge="start"
                        sx={{
                            marginRight: 5,
                            border: '1px solid #3F4E4F',
                            borderRadius: '2px',
                        }}
                    >
                        {open ? (
                            <MenuOpenIcon
                                sx={{
                                    color: '#3F4E4F',
                                    width: '20px',
                                    height: '20',
                                }}
                            />
                        ) : (
                            <MenuIcon
                                sx={{
                                    color: '#3F4E4F',
                                    width: '20px',
                                    height: '20',
                                }}
                            />
                        )}{' '}
                        {/* Toggle between icons */}
                    </IconButton>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* Notification Icon */}
                        <IconButton
                            onClick={() => setShowNotification(true)}
                            sx={{
                                border: '1px solid #3F4E4F',
                                borderRadius: '2px',
                                p: 1.3,
                            }}
                        >
                            <img src="/assets/bell-notification.png" alt="" style={{ width: 17, height: 19 }} />
                        </IconButton>

                        <Divider
                            orientation="vertical"
                            flexItem
                            sx={{
                                backgroundColor: '#3F4E4F', // Set color to black
                                height: '30px',
                                width: '1px', // Increase thickness
                                opacity: 1,
                                mt: 1,
                            }}
                        />

                        {/* Profile Section */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                cursor: 'pointer',
                            }}
                            onClick={() => setShowProfile(true)}
                        >
                            <Avatar
                                // src="your-profile-image-url.jpg"
                                src="#"
                                alt="User Profile"
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '0',
                                }}
                            />
                            <Box>
                                <Typography sx={{ fontWeight: 'bold', color: '#000' }}>MALIK</Typography>
                                <Typography sx={{ fontSize: '12px', color: '#666' }}>Admin</Typography>
                            </Box>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Sidebar Drawer */}
            <Drawer
                variant="permanent"
                open={open}
                sx={{
                    '& .MuiDrawer-paper': {
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden', // hide overflow at root
                        backgroundColor: '#121212', // Optional: set background here
                    },
                }}
            >
                {/* Sticky Logo */}
                <DrawerHeader
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        p: 2,
                        position: 'sticky',
                        top: 0,
                        zIndex: 1000,
                        backgroundColor: '#121212', // match the drawer bg
                    }}
                >
                    <img
                        src={open ? '/assets/Logo.png' : '/assets/slogo.png'}
                        alt="Sidebar Logo"
                        style={{
                            width: open ? '180px' : '80px',
                            transition: 'width 0.3s ease-in-out',
                        }}
                    />
                </DrawerHeader>

                <Divider sx={{ backgroundColor: '#4A4A4A', mt: open ? 2 : 0 }} />

                {/* Scrollable Content */}
                <Box
                    sx={{
                        flexGrow: 1,
                        overflowY: 'auto',
                        scrollbarWidth: 'none', // Firefox
                        '&::-webkit-scrollbar': { display: 'none' }, // Chrome & Safari
                    }}
                >
                    <List sx={{ mt: 2 }}>
                        {menuItems.map(({ text, icon, path, children }) => {
                            const isDropdownOpen = openDropdown[text];
                            const isSelected = url === path || (children && children.some((child) => url === child.path));
                            // Main ListItem (with or without dropdown)
                            return (
                                <Box key={text}>
                                    <ListItem disablePadding sx={{ display: 'block', p: 0.5 }}>
                                        <ListItemButton
                                            onClick={() => {
                                                if (text === 'Logout') {
                                                    router.post(route('logout'));
                                                } else if (children) {
                                                    toggleDropdown(text);
                                                } else {
                                                    router.visit(path);
                                                }
                                            }}
                                            sx={{
                                                minHeight: 50,
                                                justifyContent: open ? 'initial' : 'center',
                                                mx: open ? 0.5 : 3,
                                                borderRadius: '12px',
                                                backgroundColor: isSelected ? '#333' : 'transparent',
                                                '&:hover': { backgroundColor: '#444' },
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    minWidth: 0,
                                                    justifyContent: 'center',
                                                    mr: open ? 0.8 : 'auto',
                                                    ml: open ? -2 : 0,
                                                    '& svg': {
                                                        fill: isSelected ? 'orange' : '#fff',
                                                    },
                                                }}
                                            >
                                                {icon}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={text}
                                                sx={{
                                                    color: isSelected ? 'orange' : '#fff',
                                                    opacity: open ? 1 : 0,
                                                }}
                                            />
                                            {children && open && (
                                                <KeyboardArrowRightIcon
                                                    sx={{
                                                        transform: isDropdownOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                                                        transition: 'transform 0.2s',
                                                        fill: '#fff',
                                                        ml: 21.5,
                                                    }}
                                                />
                                            )}
                                        </ListItemButton>
                                    </ListItem>

                                    {/* Submenu Rendering */}
                                    {children && open && isDropdownOpen && (
                                        <Collapse in={isDropdownOpen} timeout="auto" unmountOnExit>
                                            <List component="div" disablePadding>
                                                {children.map((child) => {
                                                    const isChildSelected = url === child.path;
                                                    return (
                                                        <ListItem
                                                            key={child.text}
                                                            disablePadding
                                                            sx={{
                                                                mt: 1,
                                                                pl: 1,
                                                            }}
                                                        >
                                                            <ListItemButton
                                                                onClick={() => router.visit(child.path)}
                                                                sx={{
                                                                    minHeight: 40,
                                                                    justifyContent: 'initial',
                                                                    mx: 3,
                                                                    borderRadius: '12px',
                                                                    backgroundColor: isChildSelected ? '#333' : 'transparent',
                                                                    '&:hover': { backgroundColor: '#444' },
                                                                }}
                                                            >
                                                                <ListItemText
                                                                    primary={child.text}
                                                                    sx={{
                                                                        color: isChildSelected ? 'orange' : '#fff',
                                                                        opacity: open ? 1 : 0,
                                                                    }}
                                                                />
                                                            </ListItemButton>
                                                        </ListItem>
                                                    );
                                                })}
                                            </List>
                                        </Collapse>
                                    )}
                                </Box>
                            );
                        })}
                    </List>
                </Box>
            </Drawer>
        </Box>
    );
}
