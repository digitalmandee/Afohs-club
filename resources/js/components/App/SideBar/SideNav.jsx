import { router, usePage, Link } from '@inertiajs/react';
import HomeIcon from '@mui/icons-material/Home';
import InventoryIcon from '@mui/icons-material/Inventory';
import { RiReservedLine } from "react-icons/ri";
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { MdOutlineManageAccounts } from "react-icons/md";
import SettingsIcon from '@mui/icons-material/Settings';
import { Avatar, Button, Collapse } from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import { IoPeople } from 'react-icons/io5';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PaymentsIcon from '@mui/icons-material/Payments';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { MdOutlineRestaurantMenu } from "react-icons/md";
import { MdOutlineCake } from "react-icons/md";
import { styled } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import LoginActivityScreen from './Activity';
import ShiftActivityScreen from './ShiftActivity';
import LogoutScreen from './Logout';
import NotificationsPanel from './Notification';
import EmployeeProfileScreen from './Profile';
import { Modal, Slide } from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import ScaleIcon from '@mui/icons-material/Scale';
import { MdManageHistory } from 'react-icons/md';
import { MdRestaurantMenu } from 'react-icons/md';
import { MdMenuBook } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { FaKitchenSet } from 'react-icons/fa6';
import { FiPrinter } from "react-icons/fi";


const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

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
        width: open ? drawerWidthOpen : drawerWidthClosed,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
        }),
        backgroundColor: '#FFFFFF',
        color: '#242220',
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
    const { url } = usePage();
    const { auth: rawAuth, tenant } = usePage().props;
    const auth = rawAuth || {};
    const role = auth.role || '';
    const permissions = Array.isArray(auth.permissions) ? auth.permissions : [];

    const [showNotification, setShowNotification] = React.useState(false);
    const [showProfile, setShowProfile] = React.useState(false);
    const [profileView, setProfileView] = React.useState('profile');
    const [openDropdown, setOpenDropdown] = useState({});

    // Refactored Menu Items with Nesting
    const menuItems = [
        {
            text: 'Dashboard',
            icon: <HomeIcon />,
            path: route('tenant.dashboard'),
        },
        {
            text: 'Order Management',
            icon: <MdOutlineManageAccounts style={{ width: 25, height: 25 }} />,
            path: route('order.management'),
        },
        {
            text: 'Order History',
            icon: <MdManageHistory style={{ width: 25, height: 25 }} />,
            path: route('order.history'),
        },
        {
            text: 'Reservations',
            icon: <RiReservedLine style={{ width: 25, height: 25 }} />,
            path: route('reservations.index'),
        },
        {
            text: 'Table Management',
            path: route('table.management'),
            icon: <img src="/assets/Tablemanage.svg" alt="Table Icon" className="svg-img-icon" style={{ width: 20, height: 20 }} />,
        },
        {
            text: 'Products / Menu',
            icon: <MdOutlineRestaurantMenu />,
            path: route('inventory.index'),
        },
        {
            text: 'Categories',
            icon: <CategoryIcon />,
            path: route('inventory.category'),
        },
        {
            text: 'Sub Categories',
            icon: <CategoryIcon />,
            path: route('sub-categories.index'),
        },
        {
            text: 'Ingredients',
            icon: <InventoryIcon />,
            path: route('ingredients.index'),
        },
        {
            text: 'Units',
            icon: <ScaleIcon />,
            path: route('units.index'),
        },
        {
            text: 'Manufacturers',
            icon: <InventoryIcon />,
            path: route('manufacturers.index'),
        },
        {
            text: 'Cake Bookings',
            icon: <MdMenuBook style={{ height: '25px', width: '25px' }} />,
            path: route('cake-bookings.index'),
        },
        {
            text: 'Cake Types',
            icon: <MdOutlineCake style={{ height: '25px', width: '25px' }} />,
            path: route('cake-types.index'),
        },
        {
            text: 'Printer Test',
            icon: <FiPrinter style={{ height: '25px', width: '25px' }} />,
            path: route('printer.index'),
        },
        {
            text: 'Kitchen',
            icon: <FaKitchenSet style={{ width: 25, height: 25 }} />,
            path: route('kitchen.index'),
            permission: 'kitchen',
        },
        {
            text: 'Transactions',
            icon: <PaymentsIcon />,
            path: route('transaction.history'),
        },
        {
            text: 'Guests',
            icon: <IoPeople style={{ height: 20, width: 20 }} />,
            path: route('customers.index'),
        },
        {
            text: 'Settings',
            icon: <SettingsIcon />,
            path: route('setting.index'),
        },
    ];

    const toggleDropdown = (text) => {
        if (!open) setOpen(true); // Auto-open sidebar if user clicks a dropdown
        setOpenDropdown((prev) => ({ ...prev, [text]: !prev[text] }));
    };

    const normalizePath = (fullPath) => {
        try {
            return new URL(fullPath, window.location.origin).pathname;
        } catch (e) {
            return fullPath;
        }
    };

    // Auto-open dropdowns if child is active
    useEffect(() => {
        const dropdownState = {};
        menuItems.forEach((item) => {
            if (item.children) {
                const matchChild = item.children.some((child) => normalizePath(child.path) === url);
                if (matchChild) {
                    dropdownState[item.text] = true;
                }
            }
        });
        setOpenDropdown((prev) => ({ ...prev, ...dropdownState }));
    }, [url]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F12') {
                e.preventDefault();
                router.visit(route('order.management'));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [router]);

    const renderMenuItem = (item) => {
        if (item.permission && role !== 'super' && !permissions.includes(item.permission)) {
            // Basic permission check
            if (role !== 'admin' && item.permission !== 'kitchen') return null;
            // Assuming existing logic: !item.permission || auth.permissions.includes(item.permission)
            // The original code used: .filter((item) => !item.permission || auth.permissions.includes(item.permission))
            // Replicating loosely here, usually auth.permissions is an array
            if (item.permission && (!permissions || !permissions.includes(item.permission))) return null;
        }

        const isDropdownOpen = openDropdown[item.text];
        const isSelected = item.path && normalizePath(item.path) === url;
        const hasChildren = item.children && item.children.length > 0;
        const isChildSelected = hasChildren && item.children.some((child) => normalizePath(child.path) === url);

        return (
            <React.Fragment key={item.text}>
                <ListItem disablePadding sx={{ display: 'block', px: 2, py: 0.2 }}>
                    <ListItemButton
                        component={hasChildren ? 'div' : Link}
                        href={!hasChildren ? item.path : undefined}
                        onClick={() => hasChildren && toggleDropdown(item.text)}
                        sx={{
                            minHeight: 48,
                            justifyContent: open ? 'initial' : 'center',
                            borderRadius: '12px',
                            backgroundColor: isSelected || isChildSelected ? '#063455' : 'transparent',
                            color: isSelected || isChildSelected ? '#fff' : 'inherit',
                            '&:hover': {
                                backgroundColor: '#063455',
                                color: '#fff',
                                '& .MuiListItemIcon-root': { color: '#fff' },
                                '& .svg-img-icon': { filter: 'invert(1)' },
                            },
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: 0,
                                mr: open ? 2 : 'auto',
                                justifyContent: 'center',
                                color: isSelected || isChildSelected ? '#fff' : '#555',
                            }}
                        >
                            {/* Handling Image Icons specially if needed */}
                            {React.isValidElement(item.icon)
                                ? React.cloneElement(item.icon, {
                                    style: {
                                        color: isSelected || isChildSelected ? '#fff' : 'inherit',
                                        width: 24,
                                        height: 24,
                                        ...item.icon.props.style,
                                    },
                                })
                                : item.icon}
                        </ListItemIcon>

                        {open && <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />}

                        {open && hasChildren && (
                            <KeyboardArrowRightIcon
                                sx={{
                                    transform: isDropdownOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s',
                                    color: isSelected || isChildSelected ? '#fff' : '#555',
                                }}
                            />
                        )}
                    </ListItemButton>
                </ListItem>

                {/* Dropdown Content */}
                {hasChildren && (
                    <Collapse in={isDropdownOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding sx={{ pl: 2 }}>
                            {item.children.map((child) => (
                                <ListItemButton
                                    key={child.text}
                                    component={Link}
                                    href={child.path}
                                    sx={{
                                        pl: open ? 4 : 2,
                                        borderRadius: '12px',
                                        my: 0.5,
                                        backgroundColor: normalizePath(child.path) === url ? '#E0ECFF' : 'transparent',
                                        color: normalizePath(child.path) === url ? '#063455' : '#555',
                                        '&:hover': {
                                            backgroundColor: '#E0ECFF',
                                            color: '#063455',
                                        },
                                    }}
                                >
                                    {child.icon && <ListItemIcon sx={{ minWidth: 30, color: 'inherit' }}>{child.icon}</ListItemIcon>}
                                    {open && <ListItemText primary={child.text} primaryTypographyProps={{ fontSize: '0.9rem' }} />}
                                </ListItemButton>
                            ))}
                        </List>
                    </Collapse>
                )}
            </React.Fragment>
        );
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
                <Toolbar style={{ justifyContent: 'space-between', zIndex: 1000 }}>
                    <IconButton color="inherit" aria-label="toggle drawer" onClick={() => setOpen(!open)} edge="start" sx={{ marginRight: 5, backgroundColor: '#F0F5FF', borderRadius: '2px' }}>
                        {open ? <MenuOpenIcon sx={{ color: '#063455' }} /> : <MenuIcon sx={{ color: '#063455' }} />}
                    </IconButton>
                    <Typography variant="h5" sx={{ color: '#063455', fontWeight: 'bold' }}>
                        {tenant?.name}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton onClick={() => setShowNotification(true)} sx={{ backgroundColor: '#F0F5FF', borderRadius: '2px', p: 1.3 }}>
                            <img src="/assets/bell-notification.png" alt="" style={{ width: 17, height: 19 }} />
                        </IconButton>

                        {/* Notification Modal */}
                        <Modal open={showNotification} onClose={() => setShowNotification(false)} closeAfterTransition>
                            <Slide direction="left" in={showNotification} mountOnEnter unmountOnExit>
                                <Box sx={{ position: 'fixed', top: '10px', bottom: '10px', right: 10, width: { xs: '100%', sm: 600 }, bgcolor: '#fff', boxShadow: 4, zIndex: 1300, overflowY: 'auto', borderRadius: 1 }}>
                                    <NotificationsPanel onClose={() => setShowNotification(false)} />
                                </Box>
                            </Slide>
                        </Modal>

                        <Divider orientation="vertical" flexItem sx={{ backgroundColor: '#063455', height: '30px', width: '1px', mt: 1 }} />

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => setShowProfile(true)}>
                            <Avatar src="#" alt="User Profile" sx={{ width: 40, height: 40, borderRadius: '0' }} />
                            <Box>
                                <Typography sx={{ fontWeight: 'bold', color: '#000' }}>{auth.user?.name}</Typography>
                                <Typography sx={{ fontSize: '12px', color: '#666' }}>{auth?.role}</Typography>
                            </Box>
                        </Box>

                        {/* Profile Modal */}
                        <Modal open={showProfile} onClose={() => setShowProfile(false)} sx={{ zIndex: 1300 }}>
                            <Box sx={{ position: 'fixed', top: '10px', bottom: '10px', right: 10, width: { xs: '100%', sm: 400 }, bgcolor: '#fff', boxShadow: 4, zIndex: 1300, overflowY: 'auto', borderRadius: 2 }}>{profileView === 'profile' ? <EmployeeProfileScreen setProfileView={setProfileView} onClose={() => setShowProfile(false)} /> : profileView === 'loginActivity' ? <LoginActivityScreen setProfileView={setProfileView} /> : profileView === 'shiftActivity' ? <ShiftActivityScreen setProfileView={setProfileView} /> : profileView === 'logoutSuccess' ? <LogoutScreen setProfileView={setProfileView} /> : null}</Box>
                        </Modal>
                    </Box>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="permanent"
                open={open}
                sx={{
                    '& .MuiDrawer-paper': {
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        backgroundColor: '#FFFFFF',
                        color: '#242220',
                    },
                }}
            >
                <DrawerHeader
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        pt: 6,
                        pb: 5,
                        position: 'sticky',
                        top: 0,
                        zIndex: 1000,
                        height: open ? 120 : 80,
                    }}>
                    <img src={open ? '/assets/Logo.png' : '/assets/slogo.png'} alt="Sidebar Logo" style={{ width: open ? '100px' : '80px', transition: 'width 0.3s ease-in-out' }} />
                </DrawerHeader>

                <Box sx={{ flexGrow: 1, overflowY: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
                    {auth.role !== 'kitchen' && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 1, mt: 4 }}>
                            <Button
                                variant="text"
                                sx={{
                                    backgroundColor: '#0A2647',
                                    color: '#fff',
                                    '&:hover': { backgroundColor: '#09203F' },
                                    width: open ? '90%' : '50px',
                                    minWidth: '50px',
                                    height: '40px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                }}
                                onClick={() => router.visit(route('order.new'))}
                            >
                                {open ? '+ New Order' : '+'}
                            </Button>
                        </Box>
                    )}

                    <List>{menuItems.map(renderMenuItem)}</List>
                </Box>
            </Drawer>
        </Box>
    );
}
