import React, { useState } from 'react';
import { Box } from '@mui/material';
import SideNav from '@/components/App/AdminSideBar/SideNav';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const AdminLayout = ({ children }) => {
    const [open, setOpen] = useState(true);

    return (
        <Box sx={{ display: 'flex' }}>
            <SideNav open={open} setOpen={setOpen} />
            <div
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { sm: `calc(100% - ${open ? drawerWidthOpen : drawerWidthClosed}px)` },
                    ml: { sm: `${open ? drawerWidthOpen : drawerWidthClosed}px` },
                    transition: (theme) =>
                        theme.transitions.create(['margin', 'width'], {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.leavingScreen,
                        }),
                    minHeight: '100vh',
                    backgroundColor: '#f5f5f5',
                }}
            >
                {children}
            </div>
        </Box>
    );
};

export default AdminLayout;
