import { router, usePage, useRemember, Link } from '@inertiajs/react';
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
import AssessmentIcon from '@mui/icons-material/Assessment';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { FaRegAddressCard } from 'react-icons/fa';
import { FaKitchenSet } from 'react-icons/fa6';
import MemberIcon from '@/components/App/Icons/Member';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import PaymentsIcon from '@mui/icons-material/Payments';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import StorageIcon from '@mui/icons-material/Storage';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

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
    const rawAuth = (props && props.auth) || {};
    const auth = rawAuth;
    const role = auth.role || '';
    const permissions = Array.isArray(auth.permissions) ? auth.permissions : [];

    const normalizePath = (fullPath) => new URL(fullPath, window.location.origin).pathname;

    const [showNotification, setShowNotification] = React.useState(false);
    const [showProfile, setShowProfile] = React.useState(false);
    const [showOrder, setShowOrder] = React.useState(false);
    const [profileView, setProfileView] = React.useState('profile');
    // const [openDropdown, setOpenDropdown] = useState({});
    const [openDropdown, setOpenDropdown] = useRemember({}, 'sidebarDropdown');

    const hasPermission = (itemPermission) => {
        if (!itemPermission) return true;
        const permissionList = Array.isArray(itemPermission) ? itemPermission : String(itemPermission).split('|');
        return permissionList.some((p) => permissions.includes(String(p).trim()));
    };

    const filterMenuItems = (items) => {
        return items
            .filter((item) => {
                // 1. Check direct permission
                if (item.permission && !hasPermission(item.permission)) {
                    return false;
                }
                // 2. Check children
                if (item.children) {
                    const filteredChildren = filterMenuItems(item.children);
                    // If no children remain and it wasn't a direct link itself (or explicit permission says show), hide it
                    // But some parents are just containers. If container has no visible children, hide it.
                    if (filteredChildren.length === 0) {
                        return false;
                    }
                    // Mutating item copy for render is better, but here we can just attach the filtered list conceptually
                    // For React state/memo, we should return a new object
                    return true;
                }
                return true;
            })
            .map((item) => {
                if (item.children) {
                    return { ...item, children: filterMenuItems(item.children) };
                }
                return item;
            });
    };

    const rawMenuItems = [
        {
            text: 'Dashboard',
            icon: <HomeIcon />,
            path: route('dashboard'),
            permission: 'dashboard.view',
        },
        {
            text: 'Room & Event',
            icon: <CalendarMonthIcon />,
            children: [
                {
                    text: 'Guests',
                    path: route('guests.index'),
                    permission: 'guests.view',
                },
                {
                    text: 'Guest Types',
                    path: route('guest-types.index'),
                    permission: 'guest-types.view',
                },
                {
                    text: 'Rooms',
                    children: [
                        {
                            text: 'Dashboard',
                            path: route('rooms.dashboard'),
                            permission: 'rooms.bookings.view',
                        },
                        {
                            text: 'Calendar',
                            path: route('rooms.booking.calendar'),
                            permission: 'rooms.bookings.calendar',
                        },
                        {
                            text: 'Room Bookings',
                            path: route('rooms.manage'),
                            permission: 'rooms.bookings.view',
                        },
                        {
                            text: 'Check-In',
                            path: route('rooms.checkin'),
                            permission: 'rooms.bookings.checkin',
                        },
                        {
                            text: 'Check-Out',
                            path: route('rooms.checkout'),
                            permission: 'rooms.bookings.checkout',
                        },
                        {
                            text: 'Cancelled',
                            path: route('rooms.booking.cancelled'),
                            permission: 'rooms.bookings.cancelled',
                        },
                        {
                            text: 'Request',
                            path: route('rooms.request'),
                            permission: 'rooms.bookings.requests',
                        },
                        {
                            text: 'Add Room',
                            path: route('rooms.add'),
                            permission: 'rooms.create',
                        },
                        {
                            text: 'All Rooms',
                            path: route('rooms.all'),
                            permission: 'rooms.view',
                        },
                        {
                            text: 'Types',
                            path: route('room-types.index'),
                            permission: 'rooms.types.view',
                        },
                        {
                            text: 'Categories',
                            path: route('room-categories.index'),
                            permission: 'rooms.categories.view',
                        },
                        {
                            text: 'Charges Type',
                            path: route('room-charges-type.index'),
                            permission: 'rooms.chargesTypes.view',
                        },
                        {
                            text: 'MiniBar',
                            path: route('room-minibar.index'),
                            permission: 'rooms.miniBar.view',
                        },
                        {
                            text: 'Reports',
                            path: route('rooms.reports'),
                            permission: 'rooms.reports.view',
                        },
                    ],
                },
                {
                    text: 'Events',
                    children: [
                        {
                            text: 'Dashboard',
                            path: route('events.dashboard'),
                            permission: 'events.bookings.view',
                        },
                        {
                            text: 'Event Bookings',
                            path: route('events.manage'),
                            permission: 'events.bookings.view',
                        },
                        {
                            text: 'Completed',
                            path: route('events.completed'),
                            permission: 'events.bookings.completed',
                        },
                        {
                            text: 'Cancelled',
                            path: route('events.cancelled'),
                            permission: 'events.bookings.cancelled',
                        },
                        {
                            text: 'Calendar',
                            path: route('events.calendar'),
                            permission: 'events.bookings.calendar',
                        },
                        {
                            text: 'Venues',
                            path: route('event-venues.index'),
                            permission: 'events.venue.view',
                        },
                        {
                            text: 'Menu',
                            path: route('event-menu.index'),
                            permission: 'events.menu.view',
                        },
                        {
                            text: 'Menu Category',
                            path: route('event-menu-category.index'),
                            permission: 'events.menuCategories.view',
                        },
                        {
                            text: 'Menu Type',
                            path: route('event-menu-type.index'),
                            permission: 'events.menuTypes.view',
                        },
                        {
                            text: 'Charges Type',
                            path: route('event-charges-type.index'),
                            permission: 'events.chargesTypes.view',
                        },
                        {
                            text: 'Menu AddOn',
                            path: route('event-menu-addon.index'),
                            permission: 'events.menuAdons.view',
                        },
                        {
                            text: 'Reports',
                            path: route('events.reports'),
                            permission: 'events.reports.view',
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
            permission: 'members.view',
            children: [
                {
                    text: 'Dashboard',
                    path: route('membership.dashboard'),
                    permission: 'members.view',
                },
                {
                    text: 'Primary',
                    children: [
                        {
                            text: 'Add Member',
                            path: route('membership.add'),
                            permission: 'members.create',
                        },
                        {
                            text: 'All Members',
                            path: route('membership.members'),
                            permission: 'members.view',
                        },
                        {
                            text: 'Family Members',
                            path: route('membership.family-members'),
                            permission: 'family-members.view',
                        },
                    ],
                },
                {
                    text: 'Corporate',
                    permission: 'corporate-members.view',
                    children: [
                        {
                            text: 'Add Corporate',
                            path: route('corporate-membership.add'),
                            permission: 'corporate-companies.create',
                        },
                        {
                            text: 'All Corporate',
                            path: route('corporate-membership.members'),
                            permission: 'corporate-members.view',
                        },
                        {
                            text: 'Family Members',
                            path: route('corporate-membership.family-members'),
                            permission: 'corporate-members.view',
                        },
                        {
                            text: 'Companies',
                            path: route('corporate-companies.index'),
                            permission: 'corporate-companies.view',
                        },
                    ],
                },
                // {
                //     text: 'Type',
                //     path: route('member-types.index'),
                // },
                {
                    text: 'Category',
                    path: route('member-categories.index'),
                    permission: 'member-categories.view',
                },
                {
                    text: 'Applied Member',
                    path: route('applied-member.index'),
                    permission: 'applied-members.view',
                },
                {
                    text: 'Partners / Affiliates',
                    path: route('admin.membership.partners-affiliates.index'),
                    permission: 'partners-affiliates.view',
                },
                // {
                //     text: 'Finance',
                //     path: route('membership.finance'),
                // },
            ],
        },

        {
            text: 'Employee HR',
            icon: <PeopleIcon />,
            permission: 'employees.view',
            children: [
                {
                    text: 'Dashboard',
                    path: route('employees.dashboard'),
                    permission: 'employees.view',
                },
                {
                    text: 'Transfers',
                    path: route('employees.transfers.index'),
                    permission: 'employees.transfers.view',
                },
                {
                    text: 'Departments',
                    path: route('employees.departments'),
                    permission: 'employees.departments.view',
                },
                {
                    text: 'Sub Departments',
                    path: route('employees.subdepartments'),
                    permission: 'employees.departments.view',
                },
                {
                    text: 'Designations',
                    path: route('designations.index'),
                    permission: 'employees.designations.view',
                },
                {
                    text: 'Shifts',
                    path: route('shifts.index'),
                    permission: 'employees.shifts.view',
                },
                {
                    text: 'Companies',
                    path: route('branches.index'),
                    permission: 'employees.branches.view',
                },
                {
                    text: 'Leave Category',
                    path: route('employees.leaves.category.index'),
                    permission: 'employees.leaves.view',
                },
                {
                    text: 'Leave Application',
                    path: route('employees.leaves.application.index'),
                    permission: 'employees.leaves.view',
                },
                {
                    text: 'Leave Report',
                    path: route('employees.leaves.application.report'),
                    permission: 'employees.leaves.view',
                },
                {
                    text: 'Attendance',
                    path: route('employees.attendances.dashboard'),
                    permission: 'employees.attendance.view',
                },
                {
                    text: 'Management',
                    path: route('employees.attendances.management'),
                    permission: 'employees.attendance.view',
                },
                {
                    text: 'Report',
                    path: route('employees.attendances.report'),
                    permission: 'employees.attendance.view',
                },
                {
                    text: 'Monthly Report',
                    path: route('employees.attendances.monthly.report'),
                    permission: 'employees.attendance.view',
                },
                {
                    text: 'Loans',
                    path: route('employees.loans.index'),
                    permission: 'employees.loans.view',
                },
                {
                    text: 'Advances',
                    path: route('employees.advances.index'),
                    permission: 'employees.advances.view',
                },
                {
                    text: 'Reports',
                    path: route('employees.reports'),
                    permission: 'employees.reports.view',
                },
                {
                    text: 'Payroll',
                    path: route('employees.payroll.dashboard'),
                    permission: 'employees.payroll.view',
                },
                {
                    text: 'Payroll History',
                    path: route('employee.payroll.history'),
                    permission: 'employees.payroll.view',
                },
                {
                    text: 'Salary Sheet',
                    path: route('employees.payroll.salary-sheet'),
                    permission: 'employees.payroll.view',
                },
                {
                    text: 'Assets Inventory',
                    path: route('employees.assets.index'),
                    permission: 'employees.assets.view',
                },
                {
                    text: 'Asset Assignments',
                    path: route('employees.asset-attachments.index'),
                    permission: 'employees.assets.view',
                },
            ],
        },
        {
            text: 'Reports',
            icon: <AssessmentIcon />,
            permission: 'reports.view',
            children: [
                {
                    text: 'Membership Reports',
                    path: route('membership.reports'),
                    permission: 'reports.view',
                },
                {
                    text: 'POS Reports',
                    path: route('admin.reports.pos.all'),
                    permission: 'reports.pos.view',
                },
                {
                    text: 'POS Restaurant',
                    path: route('admin.reports.pos.restaurant-wise'),
                    permission: 'reports.pos.restaurant-wise',
                },
                {
                    text: 'Running Orders',
                    path: route('admin.reports.pos.running-sales-orders'),
                    permission: 'reports.pos.running-sales',
                },
                {
                    text: 'Sales Summary',
                    path: route('admin.reports.pos.sales-summary-with-items'),
                    permission: 'reports.pos.sales-summary',
                },
                {
                    text: 'Cashier Sales List',
                    path: route('admin.reports.pos.daily-sales-list-cashier-wise'),
                    permission: 'reports.pos.cashier-sales',
                },
                {
                    text: 'Dump Report',
                    path: route('admin.reports.pos.daily-dump-items-report'),
                    permission: 'reports.pos.dump-report',
                },
            ],
        },
        {
            text: 'Finance',
            icon: <PaymentsIcon />,
            permission: 'financial.view',
            children: [
                {
                    text: 'Dashboard',
                    path: route('finance.dashboard'),
                    permission: 'financial.dashboard.view',
                },
                {
                    text: 'Add Transaction',
                    path: route('finance.transaction.create'),
                    permission: 'financial.create',
                },
                {
                    text: 'Transaction',
                    path: route('finance.transaction'),
                    permission: 'financial.view',
                },
                {
                    text: 'Bulk Fee',
                    path: route('finance.maintenance.create'),
                    permission: 'financial.create',
                },
                {
                    text: 'Charge Types',
                    path: route('finance.charge-types.index'),
                    permission: 'finance.charge-types.view',
                },
                {
                    text: 'Payment Accounts',
                    path: route('finance.payment-accounts.index'),
                    permission: 'finance.payment-accounts.view',
                },
                {
                    text: 'Vouchers',
                    // icon: <ConfirmationNumberIcon />,
                    path: route('vouchers.dashboard'),
                    permission: 'finance.vouchers.view',
                },
            ],
        },

        {
            text: 'Subscription',
            icon: <SubscriptionsIcon />,
            permission: 'subscriptions.view',
            children: [
                {
                    text: 'Dashboard',
                    path: route('subscription.dashboard'),
                    permission: 'subscriptions.dashboard.view',
                },
                {
                    text: 'Management',
                    path: route('subscriptions.management'),
                    permission: 'subscriptions.view',
                },
                {
                    text: 'Type',
                    path: route('subscription-types.index'),
                    permission: 'subscriptions.types.view',
                },
                {
                    text: 'Categories',
                    path: route('subscription-categories.index'),
                    permission: 'subscriptions.categories.view',
                },
            ],
        },
        {
            text: 'Cards',
            icon: <FaRegAddressCard style={{ width: 25, height: 25 }} />,
            path: route('cards.dashboard'),
            permission: 'cards.view',
        },
        {
            text: 'Restaurants',
            icon: <FaKitchenSet style={{ width: 25, height: 25 }} />,
            permission: 'restaurant.locations.view|kitchen.locations.view',
            children: [
                {
                    text: 'Dashboard',
                    path: route('locations.index'),
                    permission: 'restaurant.locations.view|kitchen.locations.view',
                },
                {
                    text: 'Create New',
                    path: route('locations.create'),
                    permission: 'restaurant.locations.create|kitchen.locations.create',
                },
            ],
        },
        {
            text: 'Data Migration',
            icon: <StorageIcon />,
            path: route('data-migration.index'),
            permission: 'system.data-migration',
        },

        {
            text: 'Settings',
            icon: <SettingsIcon />,
            permission: 'settings.view',
            children: [
                {
                    text: 'Role Management',
                    path: route('admin.roles.index'),
                    permission: 'roles.view',
                },
                {
                    text: 'User Management',
                    path: route('admin.users.index'),
                    permission: 'users.view',
                },
                {
                    text: 'Billing',
                    path: route('admin.billing-settings.edit'),
                    permission: 'settings.edit',
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

    const menuItems = useMemo(() => filterMenuItems(rawMenuItems), [permissions]);

    const firstLoad = React.useRef(true);

    useEffect(() => {
        if (firstLoad.current) {
            const dropdownState = {};
            menuItems.forEach((item) => {
                if (item.children) {
                    const matchChild = item.children.some((child) => normalizePath(child.path) === url || (child.children && child.children.some((sub) => normalizePath(sub.path) === url)));
                    if (matchChild) {
                        dropdownState[item.text] = true;
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
            firstLoad.current = false;
        }
        // else do nothing on subsequent navigations
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
                        justifyContent: 'end',
                        zIndex: 1000,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* Notification Icon */}
                        <IconButton
                            onClick={() => setShowNotification(true)}
                            sx={{
                                backgroundColor: '#063455',
                                border: 'none',
                                borderRadius: '50px',
                                p: 1.3,
                                '& img': {
                                    filter: 'brightness(0) invert(1)', // makes PNG white
                                },
                                '&:hover': {
                                    backgroundColor: '#063455', // same as normal state
                                    color: '#fff', // same as normal state
                                },
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
                                alt="Sr Profile"
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50px',
                                }}
                            />
                            {auth && (
                                <Box>
                                    <Typography sx={{ fontWeight: 'bold', color: '#000' }}>{auth.user?.name || ''}</Typography>
                                    <Typography sx={{ fontSize: '12px', color: '#666' }}>{role}</Typography>
                                </Box>
                            )}
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
                        pt: 6,
                        pb: 7,
                        position: 'sticky',
                        top: 0,
                        zIndex: 1000,
                        height: open ? 120 : 80,
                    }}
                >
                    <img
                        src={open ? '/assets/Logo.png' : '/assets/slogo.png'}
                        alt="Sidebar Logo"
                        style={{
                            width: open ? '80px' : '70px',
                            transition: 'width 0.3s ease-in-out',
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '80%',
                            right: open ? -10 : -10, // slightly outside the sidebar for visibility
                            transform: 'translateY(-50%)',
                            backgroundColor: '#E6E6E6',
                            borderRadius: '50%',
                            width: 28,
                            height: 28,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 3000, // higher than DrawerHeader
                            boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: '#E0ECFF',
                            },
                        }}
                        onClick={() => setOpen(!open)} // toggle sidebar
                    >
                        {open ? <ChevronLeftIcon sx={{ color: '#063455', fontSize: 25, mr: 1 }} /> : <ChevronRightIcon sx={{ color: '#063455', fontSize: 25, mr: 1 }} />}
                    </Box>
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
                    <List>
                        {menuItems.map(({ text, icon, path, children }) => {
                            const isDropdownOpen = openDropdown[text];
                            // const isSelected = url === normalizePath(path) || (children && children.some((child) => url === normalizePath(child.path)));
                            const isSelected = (path && url === normalizePath(path)) || (children && children.some((child) => url === normalizePath(child.path) || (child.children && child.children.some((sub) => url === normalizePath(sub.path)))));
                            return (
                                <Box key={text} sx={{ position: 'relative' }}>
                                    <ListItem disablePadding sx={{ display: 'block', px: 3, py: 0.1 }}>
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
                                                component={children || text === 'Logout' ? 'div' : Link}
                                                href={!children && text !== 'Logout' ? path : undefined}
                                                onClick={() => {
                                                    if (text === 'Logout') {
                                                        router.post(route('logout'));
                                                    } else if (children) {
                                                        toggleDropdown(text);
                                                    }
                                                }}
                                                onMouseEnter={!open && children ? (e) => handleDropdownMouseEnter(text, e) : undefined}
                                                onMouseLeave={!open && children ? () => handleDropdownMouseLeave(text) : undefined}
                                                sx={{
                                                    minHeight: 50,
                                                    justifyContent: open ? 'initial' : 'center',
                                                    mx: open ? 1 : 1,
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
                                                            fill: isSelected ? '#FFFFFF' : '#808080', // For MUI/React icons
                                                        },
                                                    }}
                                                >
                                                    {icon}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={text}
                                                    primaryTypographyProps={{
                                                        fontSize: '0.9rem',
                                                        color: isSelected ? '#FFFFFF' : '#808080',
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
                                                            fill: '#808080',
                                                            ml: 15,
                                                        }}
                                                    />
                                                )}
                                            </ListItemButton>
                                        </Box>
                                    </ListItem>

                                    {/* Submenu Rendering (Expanded) */}
                                    {children && open && isDropdownOpen && (
                                        <Collapse in={isDropdownOpen} timeout="auto" unmountOnExit>
                                            <Box
                                                sx={{
                                                    position: 'relative',
                                                    ml: 4,
                                                    pl: 2,
                                                    '&::before': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        top: 0,
                                                        // left: '10px',
                                                        width: '2px',
                                                        height: '100%',
                                                        backgroundColor: '#d3d3d3',
                                                        borderRadius: '1px',
                                                    },
                                                    '& .connector': {
                                                        position: 'relative',
                                                        '&::before': {
                                                            content: '""',
                                                            position: 'absolute',
                                                            top: '50%',
                                                            left: '0px',
                                                            width: '14px',
                                                            height: '14px',
                                                            borderLeft: '2px solid #d3d3d3',
                                                            borderBottom: '2px solid #d3d3d3',
                                                            borderBottomLeftRadius: '10px',
                                                            transform: 'translateY(-50%)',
                                                        },
                                                    },
                                                }}
                                            >
                                                <List component="div" disablePadding>
                                                    {children.map((child) => {
                                                        const isChildSelected = url === normalizePath(child.path);
                                                        // const hasSelectedSub = child.children?.some(sub => url === normalizePath(sub.path));
                                                        const hasNested = child.children && child.children.length > 0;
                                                        const isNestedOpen = openDropdown[child.text];
                                                        // const isChildSelectedOrSubActive = isChildSelected || hasSelectedSub;

                                                        return (
                                                            <Box key={child.text} sx={{ my: 0.2 }} className="connector">
                                                                {(() => {
                                                                    // Check if any sub-item is selected
                                                                    const hasSelectedSub = child.children?.some((sub) => url === normalizePath(sub.path));

                                                                    // True if current parent or any sub is active
                                                                    const isChildSelectedOrSubActive = isChildSelected || hasSelectedSub;

                                                                    return (
                                                                        <>
                                                                            <ListItem disablePadding sx={{ pl: 2, pr: 2 }}>
                                                                                <ListItemButton
                                                                                    component={hasNested ? 'div' : Link}
                                                                                    href={!hasNested ? child.path : undefined}
                                                                                    onClick={() => {
                                                                                        if (hasNested) {
                                                                                            toggleDropdown(child.text);
                                                                                        }
                                                                                    }}
                                                                                    sx={{
                                                                                        minHeight: 40,
                                                                                        borderRadius: '12px',
                                                                                        backgroundColor: isChildSelectedOrSubActive ? '#063455' : 'transparent',
                                                                                        '&:hover': {
                                                                                            backgroundColor: '#063455',
                                                                                        },
                                                                                        '&:hover .MuiTypography-root': {
                                                                                            color: '#FFFFFF', // text color on hover
                                                                                        },
                                                                                        '&:hover .dropdown-arrow': {
                                                                                            fill: '#FFFFFF', // arrow color on hover
                                                                                        },
                                                                                    }}
                                                                                >
                                                                                    <ListItemText
                                                                                        primary={child.text}
                                                                                        primaryTypographyProps={{
                                                                                            fontSize: '0.85rem',
                                                                                            color: isChildSelectedOrSubActive ? '#FFFFFF' : '#808080',
                                                                                        }}
                                                                                    />
                                                                                    {hasNested && (
                                                                                        <KeyboardArrowRightIcon
                                                                                            className="dropdown-arrow"
                                                                                            sx={{
                                                                                                transform: openDropdown[child.text] ? 'rotate(90deg)' : 'rotate(0deg)',
                                                                                                transition: 'transform 0.2s',
                                                                                                fill: isChildSelectedOrSubActive ? '#FFFFFF' : '#808080',
                                                                                            }}
                                                                                        />
                                                                                    )}
                                                                                </ListItemButton>
                                                                            </ListItem>

                                                                            {/* Nested Submenu */}
                                                                            {hasNested && openDropdown[child.text] && (
                                                                                <Collapse in={openDropdown[child.text]} timeout="auto" unmountOnExit>
                                                                                    <Box
                                                                                        sx={{
                                                                                            position: 'relative',
                                                                                            ml: 5,
                                                                                            pl: 0.6,
                                                                                            '&::before': {
                                                                                                content: '""',
                                                                                                position: 'absolute',
                                                                                                top: 0,
                                                                                                left: '5px',
                                                                                                width: '2px',
                                                                                                height: '100%',
                                                                                                backgroundColor: '#d3d3d3',
                                                                                                borderRadius: '1px',
                                                                                            },
                                                                                        }}
                                                                                    >
                                                                                        <List component="div" disablePadding>
                                                                                            {child.children.map((sub) => {
                                                                                                const isSubSelected = url === normalizePath(sub.path);
                                                                                                return (
                                                                                                    <ListItem key={sub.text} disablePadding sx={{ py: 0.1, pl: 2, pr: 1 }} className="connector">
                                                                                                        <ListItemButton
                                                                                                            component={Link}
                                                                                                            href={sub.path}
                                                                                                            sx={{
                                                                                                                minHeight: 16,
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
                                                                                                                    color: isSubSelected ? '#FFFFFF' : '#808080',
                                                                                                                }}
                                                                                                            />
                                                                                                        </ListItemButton>
                                                                                                    </ListItem>
                                                                                                );
                                                                                            })}
                                                                                        </List>
                                                                                    </Box>
                                                                                </Collapse>
                                                                            )}
                                                                        </>
                                                                    );
                                                                })()}
                                                            </Box>
                                                        );
                                                    })}
                                                </List>
                                            </Box>
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
                                component={!hasSub ? Link : 'div'}
                                href={!hasSub ? item.path : undefined}
                                onClick={() => {
                                    // if (!hasSub) router.visit(item.path);
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
                                    // background: '#222',
                                    // borderRadius: 2,
                                    // boxShadow: 3,
                                    // minWidth: 180,
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
