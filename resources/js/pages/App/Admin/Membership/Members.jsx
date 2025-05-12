import { useState } from "react"
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import PeopleIcon from '@mui/icons-material/People';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import {
    Typography,
    Button,
    Card,
    CardContent,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Avatar,
    Box,
    InputAdornment,
} from "@mui/material"
import { ArrowBack, Search, FilterAlt, MoreVert, People, CreditCard, Warning } from "@mui/icons-material"
import "bootstrap/dist/css/bootstrap.min.css"
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router } from '@inertiajs/react';
import MembershipSuspensionDialog from "./Modal";

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const AllMembers = () => {
    // Modal state
    const [open, setOpen] = useState(false);
    const [openModal, setOpenModal] = useState(false)
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 })
    const [selectedMember, setSelectedMember] = useState(null)
    const [modalType, setModalType] = useState("actions") // "actions" or "details"
    const [suspensionModalOpen, setSuspensionModalOpen] = useState(false);
    const [detailsData, setDetailsData] = useState({
        reason: "Violation of rules",
        duration: "30 Month",
        fromDate: "Apr 1, 2025",
        toDate: "Apr 30, 2025",
    })

    const handleOpenModal = (member, event, type = "actions") => {
        // Get the position of the clicked button
        const rect = event.currentTarget.getBoundingClientRect()

        // Calculate position for the modal
        const position = {
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
        }

        setSelectedMember(member)
        setModalPosition(position)
        setModalType(type)
        setOpenModal(true)
    }

    const handleCloseModal = () => {
        setOpenModal(false)
    }

    const handleCancelMembership = () => {
        // Logic to cancel membership would go here
        handleCloseModal()
    }

    const handleSuspendMembership = () => {
        // Logic to suspend membership would go here
        handleCloseModal()
    }

    const showMemberDetails = (member, event) => {
        // You would typically fetch these details from an API
        // For now we'll use the sample data
        handleOpenModal(member, event, "details")
    }

    // Sample data
    const members = [
        {
            id: "AFOHS-1235",
            name: "Zahid Ullah",
            email: "user@gmail.com",
            type: "Member",
            status: "Active",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        {
            id: "AFOHS-1234",
            name: "Zahid Ullah",
            email: "user@gmail.com",
            type: "Applied Member",
            status: "Suspend",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        {
            id: "AFOHS-1245",
            name: "Zahid Ullah",
            email: "user@gmail.com",
            type: "Affiliated Member",
            status: "Active",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        {
            id: "AFOHS-1345",
            name: "Zahid Ullah",
            email: "user@gmail.com",
            type: "VIP Guest",
            status: "Expired",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        {
            id: "AFOHS-2345",
            name: "Zahid Ullah",
            email: "user@gmail.com",
            type: "Applied Member",
            status: "Suspend",
            avatar: "/placeholder.svg?height=40&width=40",
        },
    ]

    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                    backgroundColor: '#F6F6F6',
                }}
            >
                <div className="container-fluid px-4" style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center p-3">
                        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <Typography
                                sx={{
                                    fontWeight: 500,
                                    fontSize: '30px',
                                    color: '#3F4E4F',
                                }}
                            >
                                All Members
                            </Typography>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div
                        style={{
                            display: 'flex',
                            width: '100%',
                            justifyContent: 'space-between',
                            gap: '1rem',
                            marginBottom: '24px',
                        }}
                    >
                        {[
                            { title: 'Total Employee', value: 320, icon: EventSeatIcon },
                            { title: 'Total Present', value: 200, icon: PeopleIcon },
                            { title: 'Total Absent', value: 120, icon: AssignmentIcon },
                            { title: 'Late Arrival', value: 120, icon: PrintIcon },
                        ].map((item, index) => (
                            <div key={index} style={{ flex: 1 }}>
                                <Card
                                    style={{
                                        backgroundColor: '#3F4E4F',
                                        color: '#fff',
                                        borderRadius: '2px',
                                        height: '120px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '1rem',
                                        boxShadow: 'none',
                                        border: 'none',
                                    }}
                                >
                                    <div
                                        style={{
                                            backgroundColor: '#1E2C2F',
                                            borderRadius: '50%',
                                            width: '50px',
                                            height: '50px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '1rem',
                                        }}
                                    >
                                        <item.icon style={{ color: '#fff', fontSize: '28px' }} />
                                    </div>
                                    <div>
                                        <Typography variant="body2" style={{ color: '#DDE6E8' }}>
                                            {item.title}
                                        </Typography>
                                        <Typography variant="h6" style={{ fontWeight: 'bold', color: '#fff' }}>
                                            {item.value}
                                        </Typography>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>

                    {/* Recently Joined Section */}
                    <div className="mx-3">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <Typography variant="h6" style={{ fontWeight: "bold" }}>
                                All Members
                            </Typography>
                            <div className="d-flex">
                                <TextField
                                    placeholder="Search by name, member type etc"
                                    variant="outlined"
                                    size="small"
                                    style={{ width: "350px", marginRight: "10px" }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <Button
                                    variant="outlined"
                                    startIcon={<FilterAlt />}
                                    style={{
                                        borderColor: "#ccc",
                                        color: "#333",
                                        textTransform: "none",
                                        backgroundColor: "white",
                                    }}
                                >
                                    Filter
                                </Button>
                            </div>
                        </div>

                        {/* Members Table */}
                        <TableContainer component={Paper} style={{ boxShadow: "none" }}>
                            <Table>
                                <TableHead>
                                    <TableRow style={{ backgroundColor: "#e8e8e8" }}>
                                        <TableCell>Membership ID</TableCell>
                                        <TableCell>Member</TableCell>
                                        <TableCell>Member Type</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Card</TableCell>
                                        <TableCell>Invoice</TableCell>
                                        <TableCell>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {members.map((member) => (
                                        <TableRow key={member.id} style={{ borderBottom: "1px solid #eee" }}>
                                            <TableCell>{member.id}</TableCell>
                                            <TableCell>
                                                <div className="d-flex align-items-center">
                                                    <Avatar src={member.avatar} alt={member.name} style={{ marginRight: "10px" }} />
                                                    <div>
                                                        <Typography variant="body2" style={{ fontWeight: "bold" }}>
                                                            {member.name}
                                                        </Typography>
                                                        <Typography variant="body2" color="textSecondary">
                                                            {member.email}
                                                        </Typography>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{member.type}</TableCell>
                                            <TableCell>
                                                <span
                                                    style={{
                                                        color:
                                                            member.status === "Active" ? "#2e7d32" : member.status === "Suspend" ? "#ed6c02" : "#d32f2f",
                                                        fontWeight: "medium",
                                                        cursor: "pointer",
                                                    }}
                                                    onClick={(e) => showMemberDetails(member, e)}
                                                >
                                                    {member.status}
                                                    {member.status === "Suspend" && (
                                                        <Warning
                                                            style={{ color: "#ed6c02", fontSize: "16px", marginLeft: "5px", verticalAlign: "middle" }}
                                                        />
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="text" style={{ color: "#1976d2", textTransform: "none", padding: "0" }}>
                                                    View
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                {member.status === "Expired" || member.status === "Suspend" ? (
                                                    <Button variant="text" style={{ color: "#1976d2", textTransform: "none", padding: "0" }}>
                                                        Send Remind
                                                    </Button>
                                                ) : (
                                                    <Button variant="text" style={{ color: "#1976d2", textTransform: "none", padding: "0" }}>
                                                        View
                                                    </Button>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <IconButton onClick={(e) => handleOpenModal(member, e)}>
                                                    <MoreVert />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>

                    {/* Modal */}
                    {openModal && (
                        <div
                            style={{
                                position: "absolute",
                                top: `${modalPosition.top + -115}px`,
                                left: modalType === "actions" ? `${modalPosition.left - 333}px` : `${modalPosition.left - 240}px`,
                                backgroundColor: "white",
                                borderRadius: "8px",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                                padding: "16px",
                            }}
                        >
                            <Box display="flex" justifyContent="flex-end">
                                <IconButton size="small" onClick={handleCloseModal} style={{ padding: "4px" }}>
                                    ×
                                </IconButton>
                            </Box>

                            {modalType === "actions" ? (
                                <div className="d-flex " style={{ gap: "10px", }}>
                                    <Button
                                        variant="outlined"
                                        style={{
                                            borderColor: "#1976d2",
                                            color: "#1976d2",
                                            textTransform: "none",
                                            justifyContent: "center",
                                            padding: "8px 16px",
                                        }}
                                        onClick={handleCancelMembership}
                                    >
                                        Cancel Membership
                                    </Button>
                                    <Button
                                        variant="contained"
                                        style={{
                                            backgroundColor: "#0a3d62",
                                            textTransform: "none",
                                            justifyContent: "center",
                                            padding: "8px 16px",
                                        }}
                                        // onClick={handleSuspendMembership}
                                        onClick={() => {
                                            handleCloseModal();
                                            setTimeout(() => {
                                                setSuspensionModalOpen(true);
                                            }, 2000);
                                        }}
                                    >
                                        Suspend Membership
                                    </Button>
                                </div>
                            ) : (
                                <div className="d-flex flex-column" style={{ gap: "15px" }}>
                                    <Typography variant="body1" style={{ color: "#555" }}>
                                        <span style={{ marginRight: "10px" }}>Reason :</span>
                                        <span style={{ color: "#333", fontWeight: "500" }}>{detailsData.reason}</span>
                                    </Typography>
                                    <Typography variant="body1" style={{ color: "#555" }}>
                                        <span style={{ marginRight: "10px" }}>Duration :</span>
                                        <span style={{ color: "#333", fontWeight: "500" }}>{detailsData.duration}</span>
                                    </Typography>
                                    <Typography variant="body1" style={{ color: "#555" }}>
                                        <span style={{ marginRight: "10px" }}>From :</span>
                                        <span style={{ color: "#333", fontWeight: "500" }}>{detailsData.fromDate}</span>
                                        <span style={{ margin: "0 10px" }}>To :</span>
                                        <span style={{ color: "#333", fontWeight: "500" }}>{detailsData.toDate}</span>
                                    </Typography>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default AllMembers
