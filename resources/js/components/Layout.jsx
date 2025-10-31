import React, { useState } from 'react';
import SideNav from '@/components/App/AdminSideBar/SideNav';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

export default function Layout({ children }) {
    const [open, setOpen] = useState(true);

    return (
        <div style={{ display: 'flex' }}>
            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    //   flexGrow: 1,
                    //   marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    //   transition: 'margin-left 0.3s ease-in-out',
                    //   marginTop: '5rem', // keep your marginTop if needed
                    flexGrow: 1,
                    marginLeft: 0, // <-- set to 0, let flexbox handle the width
                    marginTop: '5rem',
                    transition: 'margin-left 0.3s ease-in-out',
                }}
            >
                {children}
            </div>
        </div>
    );
}