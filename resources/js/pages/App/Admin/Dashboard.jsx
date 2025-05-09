import SideNav from '@/components/App/AdminSideBar/SideNav';
import { useState } from 'react';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const Dashboard = () => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                }}
            >
                <h1>Admin Dashboard</h1>
            </div>
        </>
    );
};

export default Dashboard;
