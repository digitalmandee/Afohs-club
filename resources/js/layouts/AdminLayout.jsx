import React, { useState } from 'react';
import { Box } from '@mui/material';
import SideNav from '@/components/App/AdminSideBar/SideNav';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const AdminLayout = ({ children }) => {
    const [open, setOpen] = useState(true);

    return (
        <Box sx={{ display: 'flex' }}>
            <div>{children}</div>
        </Box>
    );
};

export default AdminLayout;
