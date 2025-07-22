import { router, usePage, useRemember } from '@inertiajs/react';
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
import { TiBusinessCard } from 'react-icons/ti';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { styled } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { FaRegAddressCard } from 'react-icons/fa';
import { FaKitchenSet } from 'react-icons/fa6';
import MemberIcon from '@/components/App/Icons/Member';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import PaymentsIcon from '@mui/icons-material/Payments';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';

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
    const auth = props.auth;

    const normalizePath = (fullPath) => new URL(fullPath, window.location.origin).pathname;

    const [showNotification, setShowNotification] = React.useState(false);
    const [showProfile, setShowProfile] = React.useState(false);
    const [showOrder, setShowOrder] = React.useState(false);
    const [profileView, setProfileView] = React.useState('profile');
    // const [openDropdown, setOpenDropdown] = useState({});
    const [openDropdown, setOpenDropdown] = useRemember({}, 'sidebarDropdown');
    useEffect(() => {
        const dropdownState = {};

        menuItems.forEach((item) => {
            if (item.children) {
                // Match direct children
                const matchChild = item.children.some((child) => normalizePath(child.path) === url || (child.children && child.children.some((sub) => normalizePath(sub.path) === url)));

                if (matchChild) {
                    dropdownState[item.text] = true;

                    // Match nested children if present
                    item.children.forEach((child) => {
                        if (child.children) {
                            const matchSub = child.children.some((sub) => normalizePath(sub.path) === url);
                            if (matchSub) {
                                dropdownState[child.text] = true;
                            }
                        }
                    });
                }
            }
        });

        setOpenDropdown((prev) => ({
            ...prev,
            ...dropdownState,
        }));
    }, [url]);
    const [hoveredDropdown, setHoveredDropdown] = useState(null); // Track hovered dropdown for popup
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
    const hidePopupTimer = React.useRef(null);

    const toggleDropdown = (text) => {
        if (!open) return; // Prevent toggling if drawer is closed
        setOpenDropdown((prev) => ({ ...prev, [text]: !prev[text] }));
    };

    // Helper to show popup
    const handleDropdownMouseEnter = (text, e) => {
        if (hidePopupTimer.current) {
            clearTimeout(hidePopupTimer.current);
            hidePopupTimer.current = null;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        setHoveredDropdown(text);
        setPopupPosition({
            top: rect.top + window.scrollY,
            left: rect.right + 8,
        });
    };
    // Helper to hide popup with delay
    const handleDropdownMouseLeave = (text) => {
        hidePopupTimer.current = setTimeout(() => {
            setHoveredDropdown((curr) => (curr === text ? null : curr));
        }, 120);
    };
    const handlePopupMouseEnter = (text) => {
        if (hidePopupTimer.current) {
            clearTimeout(hidePopupTimer.current);
            hidePopupTimer.current = null;
        }
        setHoveredDropdown(text);
    };
    const handlePopupMouseLeave = (text) => {
        hidePopupTimer.current = setTimeout(() => {
            setHoveredDropdown((curr) => (curr === text ? null : curr));
        }, 120);
    };

    const menuItems = [
        {
            text: 'Dashboard',
            icon: <HomeIcon />,
            path: route('dashboard'),
        },
        {
            text: 'Room & Event',
            icon: <CalendarMonthIcon />,
            children: [
                {
                    text: 'Guests',
                    path: route('guests.index'),
                },
                {
                    text: 'Rooms',
                    children: [
                        {
                            text: 'Dashboard',
                            path: route('rooms.dashboard'),
                        },
                        {
                            text: 'Manage',
                            path: route('rooms.manage'),
                        },
                        {
                            text: 'Add Room',
                            path: route('rooms.add'),
                        },
                        {
                            text: 'All Rooms',
                            path: route('rooms.all'),
                        },
                        {
                            text: 'Room Calendar',
                            path: route('rooms.booking.calendar'),
                        },
                        {
                            text: 'Room Types',
                            path: route('room-types.index'),
                        },
                        {
                            text: 'Room Categories',
                            path: route('room-categories.index'),
                        },
                        {
                            text: 'Room Charges Type',
                            path: route('room-charges-type.index'),
                        },
                        {
                            text: 'Room MiniBar',
                            path: route('room-minibar.index'),
                        },
                    ],
                },
                {
                    text: 'Events',
                    children: [
                        {
                            text: 'Dashboard',
                            path: route('events.dashboard'),
                        },
                        {
                            text: 'Event Venues',
                            path: route('event-venues.index'),
                        },
                        {
                            text: 'Event Menu',
                            path: route('event-menu.index'),
                        },
                        {
                            text: 'Event Menu Rate Category',
                            path: route('event-menu-category.index'),
                        },
                        {
                            text: 'Event Menu Type',
                            path: route('event-menu-type.index'),
                        },
                        {
                            text: 'Event Menu AddOn',
                            path: route('event-menu-addon.index'),
                        },
                        // {
                        //     text: 'Locations',
                        //     path: route('events.locations'),
                        // },
                    ],
                },
            ],
        },
        {
            text: 'Membership ',
            icon: <TiBusinessCard style={{ width: 25, height: 25 }} />,
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
                    text: 'Membership Type',
                    path: route('member-types.index'),
                },
                {
                    text: 'Membership Category',
                    path: route('member-categories.index'),
                },
                {
                    text: 'Family Members Archive',
                    path: route('family-members-archive.index'),
                },
                {
                    text: 'Applied Member',
                    path: route('applied-member.index'),
                },
                {
                    text: 'Finance',
                    path: route('membership.finance'),
                },
            ],
        },

        {
            text: 'Employee HR',
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
                {
                    text: 'Leave Category',
                    path: route('employee.leavecategory'),
                },
                {
                    text: 'Leave Management',
                    path: route('employee.leavemanagement'),
                },
                {
                    text: 'Leave Report',
                    path: route('employee.leavereport'),
                },
                {
                    text: 'Attendance Report',
                    path: route('employee.attendancereport'),
                },
                {
                    text: 'Monthly Report',
                    path: route('employee.monthlyreport'),
                },
                {
                    text: 'Payroll',
                    path: route('employee.payroll'),
                },
            ],
        },
        {
            text: 'Finance',
            icon: <PaymentsIcon />,
            children: [
                {
                    text: 'Dashboard',
                    path: route('finance.dashboard'),
                },
                {
                    text: 'Transaction',
                    path: route('finance.transaction'),
                },
            ],
        },

        {
            text: 'Subscription',
            icon: <SubscriptionsIcon />,
            children: [
                {
                    text: 'Dashboard',
                    path: route('subscription.dashboard'),
                },
                {
                    text: 'Management',
                    path: route('subscription.management'),
                },
                {
                    text: 'Monthly Fee',
                    path: route('subscription.monthly'),
                },
                {
                    text: 'Subscription Type',
                    path: route('subscription-types.index'),
                },
                {
                    text: 'Categories',
                    path: route('subscription-categories.index'),
                },
            ],
        },
        {
            text: 'Cards',
            icon: <FaRegAddressCard style={{ width: 25, height: 25 }} />,
            path: route('cards.dashboard'),
        },
        {
            text: 'Kitchen',
            icon: <FaKitchenSet style={{ width: 25, height: 25 }} />,
            children: [
                {
                    text: 'Dashboard',
                    path: route('kitchen.dashboard'),
                },
                {
                    text: 'Customer History',
                    path: route('kitchen.history'),
                },
            ],
        },
        {
            text: 'Restaurants',
            icon: <PeopleIcon />,
            children: [
                {
                    text: 'Dashboard',
                    path: route('tenant.index'),
                },
                {
                    text: 'Create Restaurant',
                    path: route('tenant.create'),
                },
            ],
        },

        {
            text: 'Settings',
            icon: <SettingsIcon />,
            children: [
                {
                    text: 'Billing',
                    path: route('admin.billing-settings.edit'),
                },
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
            icon: <LogoutIcon />,
            path: route('logout'),
        },
    ];

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                open={open}
                elevation={0}
                style={{
                    backgroundColor: '#FFFFFF',
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
                            backgroundColor: '#F0F5FF',
                            border: 'none',
                            borderRadius: '2px',
                        }}
                    >
                        {open ? (
                            <MenuOpenIcon
                                sx={{
                                    color: '#063455',
                                    width: '20px',
                                    height: '20',
                                }}
                            />
                        ) : (
                            <MenuIcon
                                sx={{
                                    color: '#063455',
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
                                backgroundColor: '#F0F5FF',
                                border: 'none',
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
                                backgroundColor: '#063455', // Set color to black
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
                                <Typography sx={{ fontWeight: 'bold', color: '#000' }}>{auth.user?.name}</Typography>
                                <Typography sx={{ fontSize: '12px', color: '#666' }}>{auth.role}</Typography>
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
                        backgroundColor: '#FFFFFF',
                        color: '#242220',
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
                    }}
                >
                    <img
                        src={open ? '/assets/Logo.png' : '/assets/slogo.png'}
                        alt="Sidebar Logo"
                        style={{
                            width: open ? '100px' : '60px',
                            transition: 'width 0.3s ease-in-out',
                        }}
                    />
                </DrawerHeader>

                {/* <Divider sx={{ backgroundColor: '#4A4A4A', mt: open ? 2 : 0 }} /> */}

                {/* Scrollable Content */}
                <Box
                    sx={{
                        flexGrow: 1,
                        overflowY: 'auto',
                        scrollbarWidth: 'none',
                        '&::-webkit-scrollbar': { display: 'none' },
                    }}
                >
                    <List sx={{ mt: 1 }}>
                        {menuItems.map(({ text, icon, path, children }) => {
                            const isDropdownOpen = openDropdown[text];
                            const isSelected = url === normalizePath(path) || (children && children.some((child) => url === normalizePath(child.path)));
                            return (
                                <Box key={text} sx={{ position: 'relative' }}>
                                    <ListItem disablePadding sx={{ display: 'block', px: 1 }}>
                                        <Box
                                            sx={{
                                                borderRadius: '12px',
                                                overflow: 'hidden',
                                                backgroundColor: isSelected ? '#063455' : 'transparent',
                                                '&:hover': {
                                                    backgroundColor: '#063455',
                                                },
                                            }}
                                        >
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
                                                onMouseEnter={!open && children ? (e) => handleDropdownMouseEnter(text, e) : undefined}
                                                onMouseLeave={!open && children ? () => handleDropdownMouseLeave(text) : undefined}
                                                sx={{
                                                    minHeight: 50,
                                                    justifyContent: open ? 'initial' : 'center',
                                                    mx: open ? 1 : 3,
                                                    borderRadius: '12px',
                                                    backgroundColor: isSelected ? '#063455' : 'transparent',
                                                    '&:hover': {
                                                        backgroundColor: '#063455',
                                                        '& .MuiTypography-root': {
                                                            color: '#FFFFFF',
                                                        },
                                                        '& .MuiListItemIcon-root svg': {
                                                            fill: '#FFFFFF',
                                                        },
                                                        '& .dropdown-arrow': {
                                                            fill: '#FFFFFF',
                                                        },
                                                    },
                                                }}
                                            >
                                                <ListItemIcon
                                                    sx={{
                                                        minWidth: 0,
                                                        justifyContent: 'center',
                                                        mr: open ? 0.8 : 'auto',
                                                        ml: open ? -2 : 0,
                                                        '& svg': {
                                                            fill: isSelected ? '#FFFFFF' : '#242220', // For MUI/React icons
                                                        },
                                                    }}
                                                >
                                                    {icon}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={text}
                                                    primaryTypographyProps={{
                                                        fontSize: '0.9rem',
                                                        color: isSelected ? '#FFFFFF' : '#242220',
                                                    }}
                                                    sx={{
                                                        opacity: open ? 1 : 0,
                                                    }}
                                                />
                                                {children && open && (
                                                    <KeyboardArrowRightIcon
                                                        className="dropdown-arrow"
                                                        sx={{
                                                            transform: isDropdownOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                                                            transition: 'transform 0.2s',
                                                            fill: '#000000',
                                                            ml: 19,
                                                        }}
                                                    />
                                                )}
                                            </ListItemButton>
                                        </Box>
                                    </ListItem>

                                    {/* Submenu Rendering (Expanded) */}
                                    {children && open && isDropdownOpen && (
                                        <Collapse in={isDropdownOpen} timeout="auto" unmountOnExit>
                                            <List component="div" disablePadding>
                                                {children.map((child) => {
                                                    const isChildSelected = url === normalizePath(child.path);
                                                    const hasNested = child.children && child.children.length > 0;
                                                    const isNestedOpen = openDropdown[child.text];

                                                    return (
                                                        <Box key={child.text} sx={{ my: 0.3 }}>
                                                            <ListItem disablePadding sx={{ pl: 3 }}>
                                                                <ListItemButton
                                                                    onClick={() => {
                                                                        if (hasNested) {
                                                                            toggleDropdown(child.text);
                                                                        } else {
                                                                            router.visit(child.path);
                                                                        }
                                                                    }}
                                                                    sx={{
                                                                        minHeight: 40,
                                                                        borderRadius: '12px',
                                                                        backgroundColor: isChildSelected ? '#063455' : 'transparent',
                                                                        '&:hover': {
                                                                            backgroundColor: '#063455',
                                                                        },
                                                                        '&:hover .MuiTypography-root': {
                                                                            color: '#FFFFFF', // text color on hover
                                                                        },
                                                                        '&:hover .dropdown-arrow': {
                                                                            fill: '#FFFFFF', // ← change arrow color to white on hover
                                                                        },
                                                                    }}
                                                                >
                                                                    <ListItemText
                                                                        primary={child.text}
                                                                        primaryTypographyProps={{
                                                                            fontSize: '0.85rem',
                                                                            color: isChildSelected ? '#FFFFFF' : '#242220',
                                                                        }}
                                                                    />
                                                                    {hasNested && (
                                                                        <KeyboardArrowRightIcon
                                                                            className="dropdown-arrow"
                                                                            sx={{
                                                                                transform: isNestedOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                                                                                transition: 'transform 0.2s',
                                                                                fill: '#000',
                                                                            }}
                                                                        />
                                                                    )}
                                                                </ListItemButton>
                                                            </ListItem>

                                                            {/* Nested Submenu */}
                                                            {hasNested && openDropdown[child.text] && (
                                                                <Collapse in={openDropdown[child.text]} timeout="auto" unmountOnExit>
                                                                    <List component="div" disablePadding>
                                                                        {child.children.map((sub) => {
                                                                            const isSubSelected = url === normalizePath(sub.path);
                                                                            return (
                                                                                <ListItem key={sub.text} disablePadding sx={{ pl: 5 }}>
                                                                                    <ListItemButton
                                                                                        onClick={() => router.visit(sub.path)}
                                                                                        sx={{
                                                                                            minHeight: 36,
                                                                                            borderRadius: '12px',
                                                                                            backgroundColor: isSubSelected ? '#063455' : 'transparent',
                                                                                            '&:hover': {
                                                                                                backgroundColor: '#063455',
                                                                                            },
                                                                                            '&:hover .MuiTypography-root': {
                                                                                                color: '#FFFFFF',
                                                                                            },
                                                                                        }}
                                                                                    >
                                                                                        <ListItemText
                                                                                            primary={sub.text}
                                                                                            primaryTypographyProps={{
                                                                                                fontSize: '0.8rem',
                                                                                                color: isSubSelected ? '#FFFFFF' : '#242220',
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
                                        </Collapse>
                                    )}

                                    {/* Popup Submenu (Collapsed) */}
                                    {children && !open && hoveredDropdown === text && (
                                        <Box
                                            onMouseEnter={() => handlePopupMouseEnter(text)}
                                            onMouseLeave={() => handlePopupMouseLeave(text)}
                                            sx={{
                                                position: 'fixed',
                                                top: popupPosition.top,
                                                left: popupPosition.left,
                                                zIndex: 2000,
                                                background: '#222',
                                                borderRadius: 2,
                                                boxShadow: 3,
                                                minWidth: 180,
                                                py: 1,
                                            }}
                                        >
                                            <HoverMenuList items={children} level={1} />
                                        </Box>
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

function HoverMenuList({ items, level }) {
    const { url } = usePage();
    const [hovered, setHovered] = useState(null);
    const [position, setPosition] = useState({});

    const handleMouseEnter = (text, event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setHovered(text);
        setPosition({
            top: rect.top + window.scrollY,
            left: rect.right + 3,
        });
    };

    const handleMouseLeave = () => {
        setHovered(null);
    };

    return (
        <List component="div" disablePadding>
            {items.map((item) => {
                const isChildSelected = url === item.path;
                const hasSub = item.children && item.children.length > 0;
                return (
                    <Box key={item.text} onMouseEnter={(e) => hasSub && handleMouseEnter(item.text, e)} onMouseLeave={() => hasSub && handleMouseLeave()}>
                        <ListItem disablePadding sx={{ pl: level * 1 }}>
                            <ListItemButton
                                onClick={() => {
                                    if (!hasSub) router.visit(item.path);
                                }}
                                sx={{
                                    minHeight: 40,
                                    borderRadius: '8px',
                                    backgroundColor: isChildSelected ? '#333' : 'transparent',
                                    '&:hover': { backgroundColor: '#444' },
                                }}
                            >
                                <ListItemText
                                    primary={item.text}
                                    sx={{
                                        color: isChildSelected ? 'orange' : '#fff',
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>

                        {/* Nested hover popup */}
                        {hasSub && hovered === item.text && (
                            <Box
                                sx={{
                                    position: 'fixed',
                                    top: position.top,
                                    left: position.left,
                                    zIndex: 2000 + level,
                                    background: '#222',
                                    borderRadius: 2,
                                    boxShadow: 3,
                                    minWidth: 180,
                                    py: 1,
                                }}
                            >
                                <HoverMenuList items={item.children} level={level + 1} />
                            </Box>
                        )}
                    </Box>
                );
            })}
        </List>
    );
}
