import { router, usePage } from '@inertiajs/react';
import HomeIcon from '@mui/icons-material/Home';
import InventoryIcon from '@mui/icons-material/Inventory';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import { Avatar, Button } from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PaymentsIcon from '@mui/icons-material/Payments';
import { styled } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import LoginActivityScreen from './Activity';
import LogoutScreen from './Logout';
import NotificationsPanel from './Notification';
import EmployeeProfileScreen from './Profile';
import { Modal, Slide } from '@mui/material';
import KitchenIcon from '@/components/App/Icons/KitchenManagement';
import MemberIcon from '@/components/App/Icons/Member';
import TableIcon from '@/components/App/Icons/TableManagement';
import CategoryIcon from '@mui/icons-material/Category';
import AddressType from '../Icons/AddressType';
import { MdManageHistory } from 'react-icons/md';

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
    const { auth } = usePage().props;

    const [showNotification, setShowNotification] = React.useState(false);
    const [showProfile, setShowProfile] = React.useState(false);
    const [profileView, setProfileView] = React.useState('profile');
    const menuItems = [
        { text: 'Dashboard', icon: <HomeIcon />, path: '/', permission: 'dashboard' },
        { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory', permission: 'order' },
        { text: 'Inventory Category', icon: <CategoryIcon />, path: '/inventory/category', permission: 'order' },
        { text: 'Transaction', icon: <PaymentsIcon />, path: '/transaction', permission: 'order' },
        {
            text: 'Table Management',
            icon: <TableIcon />,
            path: '/table/management',
            permission: 'order',
        },
        {
            text: 'Kitchen',
            icon: <KitchenIcon />,
            path: '/kitchen',
            permission: 'kitchen',
        },
        {
            text: 'Order Management',
            icon: <MdManageHistory />,
            path: '/order/management',
            permission: 'order',
        },
        { text: 'Settings', icon: <SettingsIcon />, path: '/settings', permission: 'order' },
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
                        <Modal open={showNotification} onClose={() => setShowNotification(false)} closeAfterTransition>
                            <Slide direction="left" in={showNotification} mountOnEnter unmountOnExit>
                                <Box
                                    sx={{
                                        position: 'fixed',
                                        top: '10px',
                                        bottom: '10px',
                                        right: 10,
                                        width: { xs: '100%', sm: 600 },
                                        bgcolor: '#fff',
                                        boxShadow: 4,
                                        zIndex: 1300,
                                        overflowY: 'auto',
                                        borderRadius: 1,
                                        scrollbarWidth: 'none', // Firefox
                                        '&::-webkit-scrollbar': {
                                            display: 'none', // Chrome, Safari, Edge
                                        },
                                    }}
                                >
                                    <NotificationsPanel onClose={() => setShowNotification(false)} />
                                </Box>
                            </Slide>
                        </Modal>

                        {/* Vertical Divider */}
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
                                <Typography sx={{ fontWeight: 'bold', color: '#000' }}>{auth.user?.name}</Typography>
                                <Typography sx={{ fontSize: '12px', color: '#666' }}>{auth?.role}</Typography>
                            </Box>
                        </Box>
                        <Modal open={showProfile} onClose={() => setShowProfile(false)} aria-labelledby="profile-modal" sx={{ zIndex: 1300 }}>
                            <Box
                                sx={{
                                    position: 'fixed',
                                    top: '10px',
                                    bottom: '10px',
                                    right: 10,
                                    width: { xs: '100%', sm: 400 },
                                    bgcolor: '#fff',
                                    boxShadow: 4,
                                    zIndex: 1300,
                                    overflowY: 'auto',
                                    borderRadius: 2,
                                    scrollbarWidth: 'none',
                                    '&::-webkit-scrollbar': { display: 'none' },
                                }}
                            >
                                {/* Profile Modal Content */}
                                {profileView === 'profile' ? <EmployeeProfileScreen setProfileView={setProfileView} onClose={() => setShowProfile(false)} /> : profileView === 'loginActivity' ? <LoginActivityScreen setProfileView={setProfileView} /> : profileView === 'logoutSuccess' ? <LogoutScreen setProfileView={setProfileView} /> : null}
                            </Box>
                        </Modal>
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
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            p: 1,
                            mt: 2,
                        }}
                    >
                        <Button
                            variant="text"
                            sx={{
                                backgroundColor: '#0A2647',
                                color: '#fff',
                                '&:hover': { backgroundColor: '#09203F' },
                                width: open ? '90%' : '100px',
                                minWidth: '50px',
                                height: '40px',
                                fontSize: open ? '16px' : '12px',
                                textTransform: 'none',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textAlign: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease-in-out',
                            }}
                            onClick={() => router.visit('/new/order')}
                        >
                            {open ? '+ New Order' : '+ New Order'}
                        </Button>
                    </Box>

                    <List>
                        {menuItems
                            .filter((item) => auth.permissions.includes(item.permission))
                            .map(({ text, icon, path }) => {
                                const isSelected = url === path;
                                return (
                                    <ListItem key={text} disablePadding sx={{ display: 'block', p: 0.5 }}>
                                        <ListItemButton
                                            onClick={() => router.visit(path)}
                                            sx={{
                                                minHeight: 50,
                                                justifyContent: open ? 'initial' : 'center',
                                                mx: 3,
                                                borderRadius: '12px',
                                                backgroundColor: isSelected ? '#333' : 'transparent',
                                                '&:hover': { backgroundColor: '#444' },
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    minWidth: 0,
                                                    justifyContent: 'center',
                                                    ml: open ? -1 : 0,
                                                    mr: open ? 1 : 'auto',
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
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                    </List>
                </Box>
            </Drawer>
        </Box>
    );
}
