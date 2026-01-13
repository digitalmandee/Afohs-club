import React, { useState } from 'react';
import { Box, ThemeProvider, createTheme } from '@mui/material';
import SideNav from '@/components/App/AdminSideBar/SideNav';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;
// const theme = createTheme({
//     palette: {
//         primary: {
//             main: '#063455',
//         },
//         secondary: {
//             main: '#063455',
//         },
//     },
// });

const AdminLayout = ({ children }) => {
    const [open, setOpen] = useState(true);

    return (
        // <ThemeProvider theme={theme}>
            <Box>
                <div style={{ backgroundColor: '#f5f5f5' }}>{children}</div>
            </Box>
        // </ThemeProvider>
    );
};

export default AdminLayout;
