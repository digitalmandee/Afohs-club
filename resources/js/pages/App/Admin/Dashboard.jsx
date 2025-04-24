import React, { useState } from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import { Container, Row, Col, Card, Button, Form, Badge, Modal } from "react-bootstrap"
import { Search, FilterAlt, Add, CreditCard } from "@mui/icons-material"
import { ThemeProvider, createTheme, Box, Typography } from "@mui/material"
import SideNav from '@/components/App/AdminSideBar/SideNav'

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const theme = createTheme({
    palette: {
        primary: {
            main: "#0e3c5f",
        },
        secondary: {
            main: "#2c3e50",
        },
        success: {
            main: "#0e5f3c",
        },
        warning: {
            main: "#5f0e0e",
        },
    },
})

const dialogStyles = `
  .dialog-top-right {
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    margin: 0 !important;
    transform: none !important;
  }
  
  .dialog-top-right .modal-content {
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    border-radius: 8px;
    border: 1px solid rgba(0,0,0,0.1);
  }
  
  .dialog-top-right .modal-dialog {
    margin: 0 !important;
    max-width: 100% !important;
  }
  
  @media (max-width: 576px) {
    .dialog-top-right {
      width: 90% !important;
    }
  }
`

const bookingsData = [
    {
        id: 1,
        type: "Deluxe Room",
        created: "March 25th 2025, 3:30 PM",
        bookingId: "ROM0232",
        duration: "March 25th 2025 to March 26th 2025",
        rooms: 2,
        nights: 1,
        status: "Confirmed",
    },
    {
        id: 2,
        type: "Standard Room",
        created: "March 25th 2025, 3:30 PM",
        bookingId: "ROM0232",
        duration: "March 25th 2025 to March 26th 2025",
        rooms: 1,
        nights: 1,
        status: "Confirmed",
    },
    {
        id: 3,
        type: "Suit Room",
        created: "March 25th 2025, 3:30 PM",
        bookingId: "ROM0232",
        duration: "March 25th 2025 to March 26th 2025",
        rooms: 1,
        nights: 1,
        status: "Pending",
    },
]

const availableRooms = [
    {
        id: 1,
        type: "Deluxe",
        price: 150,
        beds: 4,
        guests: 6,
        bathrooms: 1,
        image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-k4N3uDBQrDrW8IQHwMfKQMVh0luzr0.png",
    },
    {
        id: 2,
        type: "Suite",
        price: 150,
        beds: 4,
        guests: 6,
        bathrooms: 1,
        image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-k4N3uDBQrDrW8IQHwMfKQMVh0luzr0.png",
    },
    {
        id: 3,
        type: "Family",
        price: 150,
        beds: 4,
        guests: 6,
        bathrooms: 1,
        image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-k4N3uDBQrDrW8IQHwMfKQMVh0luzr0.png",
    },
    {
        id: 4,
        type: "Standard",
        price: 150,
        beds: 4,
        guests: 6,
        bathrooms: 1,
        image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-k4N3uDBQrDrW8IQHwMfKQMVh0luzr0.png",
    },
]

const availableEvents = [
    {
        id: 1,
        name: "Annual Gala",
        price: 150,
        location: "Main Hall",
        capacity: 100,
        date: "Mar 30, 6:00 PM",
        status: "Complete",
        image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-cFh7uHCUQRCGwRtoKSBnDMBQi3suwE.png",
    },
    {
        id: 2,
        name: "Sports Night",
        price: 150,
        location: "Ground Area",
        capacity: 50,
        date: "Apr 10, 10:00 PM",
        status: "Upcoming",
        image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-cFh7uHCUQRCGwRtoKSBnDMBQi3suwE.png",
    },
]

const AdminDashboard = () => {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("")
    const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)
    const [showResultsModal, setShowResultsModal] = useState(false)
    const [bookingType, setBookingType] = useState("room") // "room" or "event"

    // Form state
    const [checkInDate, setCheckInDate] = useState("")
    const [checkOutDate, setCheckOutDate] = useState("")
    const [personType, setPersonType] = useState("Add person")
    const [adultCount, setAdultCount] = useState(0)
    const [childCount, setChildCount] = useState(0)
    const [infantCount, setInfantCount] = useState(0)

    const filteredBookings = bookingsData.filter((booking) =>
        booking.type.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const handleOpenBookingModal = () => {
        setShowAvailabilityModal(true)
    }

    const handleCloseAvailabilityModal = () => {
        setShowAvailabilityModal(false)
    }

    const handleCloseResultsModal = () => {
        setShowResultsModal(false)
    }

    const handleFind = () => {
        // Validate form
        if (!checkInDate || !checkOutDate) {
            alert("Please select check-in and check-out dates")
            return
        }

        // Close availability modal and open results modal
        setShowAvailabilityModal(false)
        setShowResultsModal(true)
    }

    const handleIncrement = (type) => {
        if (type === "adult") {
            setAdultCount(adultCount + 1)
        } else if (type === "child") {
            setChildCount(childCount + 1)
        } else if (type === "infant") {
            setInfantCount(infantCount + 1)
        }
    }

    const handleDecrement = (type) => {
        if (type === "adult") {
            setAdultCount(Math.max(0, adultCount - 1))
        } else if (type === "child") {
            setChildCount(Math.max(0, childCount - 1))
        } else if (type === "infant") {
            setInfantCount(Math.max(0, infantCount - 1))
        }
    }
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
                <ThemeProvider theme={theme}>
                    <style>{dialogStyles}</style>
                    <Container fluid className="p-4 bg-light">
                        <Row className="mb-4 align-items-center">
                            <Col>
                                <Typography variant="h4" component="h1" style={{ color: "#2c3e50", fontWeight: 500 }}>
                                    Dashboard
                                </Typography>
                            </Col>
                            <Col xs="auto" className="d-flex gap-2">
                                <Button
                                    variant="outline-primary"
                                    className="d-flex align-items-center gap-1"
                                    style={{
                                        borderColor: "#0e3c5f",
                                        color: "#0e3c5f",
                                    }}
                                >
                                    <Add fontSize="small" /> Add New
                                </Button>
                                <Button style={{ backgroundColor: "#0e3c5f", borderColor: "#0e3c5f" }} onClick={handleOpenBookingModal}>
                                    Booking
                                </Button>
                            </Col>
                        </Row>

                        <Row className="mb-4">
                            {/* Total Booking */}
                            <Col md={4}>
                                <Card
                                    style={{
                                        backgroundColor: "#3F4E4F",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "8px",
                                        height: "100%",
                                    }}
                                >
                                    <Card.Body className="p-4">
                                        <Box className="d-flex align-items-center gap-3 mb-3">
                                            <Box
                                                sx={{
                                                    backgroundColor: "#202728",
                                                    borderRadius: "50%",
                                                    width: 48,
                                                    height: 48,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <CreditCard style={{ color: "white" }} />
                                            </Box>
                                            <Box>
                                                <Typography sx={{ color: "#C6C6C6", fontSize: "14px" }}>Total Booking</Typography>
                                                <Typography sx={{ fontSize: "24px" }} className="m-0">
                                                    320
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* Total Room Booking */}
                            <Col md={4}>
                                <Card
                                    style={{
                                        backgroundColor: "#3F4E4F",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "8px",
                                        height: "100%",
                                    }}
                                >
                                    <Card.Body className="p-4">
                                        <Box className="d-flex align-items-center gap-3 mb-3">
                                            <Box
                                                sx={{
                                                    backgroundColor: "#202728",
                                                    borderRadius: "50%",
                                                    width: 48,
                                                    height: 48,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <CreditCard style={{ color: "white" }} />
                                            </Box>
                                            <Box>
                                                <Typography sx={{ color: "#C6C6C6", fontSize: "14px" }}>Total Room Booking</Typography>
                                                <Typography sx={{ fontSize: "24px" }} className="m-0">
                                                    320
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <hr className="border-top"></hr>
                                        <Row>
                                            <Col>
                                                <Typography sx={{ color: "#C6C6C6", fontSize: "12px" }}>Available Room</Typography>
                                                <Typography variant="h6">280</Typography>
                                            </Col>
                                            <Col>
                                                <Typography sx={{ color: "#C6C6C6", fontSize: "12px" }}>Total Room</Typography>
                                                <Typography variant="h6">40</Typography>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* Total Event Booking */}
                            <Col md={4}>
                                <Card
                                    style={{
                                        backgroundColor: "#3F4E4F",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "8px",
                                        height: "100%",
                                    }}
                                >
                                    <Card.Body className="p-4">
                                        <Box className="d-flex align-items-center gap-3 mb-3">
                                            <Box
                                                sx={{
                                                    backgroundColor: "#202728",
                                                    borderRadius: "50%",
                                                    width: 48,
                                                    height: 48,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <CreditCard style={{ color: "white" }} />
                                            </Box>
                                            <Box>
                                                <Typography sx={{ color: "#C6C6C6", fontSize: "14px" }}>Total Event Booking</Typography>
                                                <Typography variant="h5" className="m-0">
                                                    320
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <hr className="border-top"></hr>
                                        <Typography sx={{ color: "#C6C6C6", fontSize: "12px" }}>Available Event</Typography>
                                        <Typography variant="h6">2</Typography>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* Search and Filter */}
                        <Row className="mb-3 align-items-center">
                            <Col>
                                <Typography variant="h6" component="h2" style={{ color: "#2c3e50", fontWeight: 600 }}>
                                    Recently Booking
                                </Typography>
                            </Col>
                            <Col xs="auto" className="d-flex gap-2">
                                <div style={{ position: "relative", width: "300px" }}>
                                    <Form.Control
                                        placeholder="Search"
                                        aria-label="Search"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{
                                            paddingLeft: "2rem",
                                            borderColor: "#ced4da",
                                            borderRadius: "4px",
                                            height: "38px",
                                            fontSize: "0.9rem",
                                        }}
                                    />
                                    <Search
                                        style={{
                                            position: "absolute",
                                            left: "8px",
                                            top: "53%",
                                            transform: "translateY(-50%)",
                                            color: "#adb5bd",
                                            fontSize: "1.5rem",
                                            pointerEvents: "none",
                                        }}
                                    />
                                </div>

                                <Button
                                    variant="outline-secondary"
                                    className="d-flex align-items-center gap-1"
                                    style={{
                                        border: "1px solid #ced4da",
                                        borderRadius: "6px",
                                        color: "#495057",
                                    }}
                                >
                                    <FilterAlt fontSize="small" /> Filter
                                </Button>
                            </Col>
                        </Row>

                        {filteredBookings.map((booking, index) => (
                            <Card key={index} className="mb-2" style={{ border: "1px solid #e0e0e0" }}>
                                <Card.Body className="p-2">
                                    <Row>
                                        {/* Room Image */}
                                        <Col md={2} className="d-flex justify-content-center">
                                            <img
                                                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-IuCtZ2a4wrWMZXu6pYSfLcMMwigfuK.png"
                                                alt={booking.type}
                                                style={{
                                                    width: "100%",
                                                    objectFit: "cover",
                                                }}
                                            />
                                        </Col>

                                        {/* Booking Info */}
                                        <Col md={10}>
                                            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
                                                <div>
                                                    <Typography variant="h6" style={{ fontWeight: 600, fontSize: "1.1rem", color: "#333" }}>
                                                        {booking.type}
                                                    </Typography>
                                                    <Typography variant="body2" style={{ color: "#7a7a7a", fontSize: "0.85rem" }}>
                                                        Created on {booking.created}
                                                    </Typography>
                                                </div>
                                                <Badge
                                                    bg=""
                                                    style={{
                                                        backgroundColor: booking.status === "Confirmed" ? "#0e5f3c" : "#842029",
                                                        color: "white",
                                                        padding: "6px 14px",
                                                        borderRadius: "6px",
                                                        fontSize: "0.85rem",
                                                        fontWeight: 500,
                                                        minWidth: "100px",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {booking.status}
                                                </Badge>
                                            </div>

                                            {/* Booking Details */}
                                            <Row className="text-start mt-2">
                                                <Col md={3} sm={6} className="mb-2">
                                                    <Typography variant="body2" style={{ color: "#6c757d" }}>
                                                        Booking ID
                                                    </Typography>
                                                    <Typography variant="body1" style={{ fontWeight: 500 }}>
                                                        {booking.bookingId}
                                                    </Typography>
                                                </Col>
                                                <Col md={4} sm={6} className="mb-2">
                                                    <Typography variant="body2" style={{ color: "#6c757d" }}>
                                                        Duration
                                                    </Typography>
                                                    <Typography variant="body1" style={{ fontWeight: 500 }}>
                                                        {booking.duration}
                                                    </Typography>
                                                </Col>
                                                <Col md={2} sm={6} className="mb-2">
                                                    <Typography variant="body2" style={{ color: "#6c757d" }}>
                                                        Room
                                                    </Typography>
                                                    <Typography variant="body1" style={{ fontWeight: 500 }}>
                                                        {booking.rooms}
                                                    </Typography>
                                                </Col>
                                                <Col md={2} sm={6} className="mb-2">
                                                    <Typography variant="body2" style={{ color: "#6c757d" }}>
                                                        Night
                                                    </Typography>
                                                    <Typography variant="body1" style={{ fontWeight: 500 }}>
                                                        {booking.nights}
                                                    </Typography>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        ))}

                        {/* Room/Event Availability Dialog */}
                        <Modal
                            show={showAvailabilityModal}
                            onHide={handleCloseAvailabilityModal}
                            dialogClassName="dialog-top-right"
                        >
                            <Modal.Header style={{ border: "none", paddingBottom: 0 }}>
                                <Modal.Title style={{ fontSize: "24px", fontWeight: "bold" }}>Room/Event Availability</Modal.Title>
                                <Button
                                    variant="link"
                                    onClick={handleCloseAvailabilityModal}
                                    style={{ color: "#000", position: "absolute", right: "15px", top: "15px", padding: "0" }}
                                >
                                    <span style={{ fontSize: "24px" }}>&times;</span>
                                </Button>
                            </Modal.Header>
                            <Modal.Body style={{ padding: "20px", maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
                                <Row className="mb-3">
                                    <Col>
                                        <Form.Group>
                                            <Form.Label style={{ fontWeight: "500" }}>Check-In Date</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={checkInDate}
                                                onChange={(e) => setCheckInDate(e.target.value)}
                                                style={{ height: "40px" }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group>
                                            <Form.Label style={{ fontWeight: "500" }}>Check-Out Date</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={checkOutDate}
                                                onChange={(e) => setCheckOutDate(e.target.value)}
                                                style={{ height: "40px" }}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: "500" }}>Person</Form.Label>
                                    <Form.Select
                                        value={personType}
                                        onChange={(e) => setPersonType(e.target.value)}
                                        style={{ height: "40px" }}
                                    >
                                        <option>Add person</option>
                                        <option>1 Person</option>
                                        <option>2 Persons</option>
                                        <option>3 Persons</option>
                                        <option>4+ Persons</option>
                                    </Form.Select>
                                </Form.Group>

                                <div className="border rounded p-3 mb-4">
                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span style={{ fontWeight: "500" }}>Adult</span>
                                            <div className="d-flex align-items-center">
                                                <Button
                                                    variant="light"
                                                    style={{ padding: "0px 8px", border: "1px solid #dee2e6" }}
                                                    onClick={() => handleDecrement("adult")}
                                                >
                                                    −
                                                </Button>
                                                <span className="mx-3">{adultCount}</span>
                                                <Button
                                                    variant="light"
                                                    style={{ padding: "0px 8px", border: "1px solid #dee2e6" }}
                                                    onClick={() => handleIncrement("adult")}
                                                >
                                                    +
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span style={{ fontWeight: "500" }}>Child</span>
                                            <div className="d-flex align-items-center">
                                                <Button
                                                    variant="light"
                                                    style={{ padding: "0px 8px", border: "1px solid #dee2e6" }}
                                                    onClick={() => handleDecrement("child")}
                                                >
                                                    −
                                                </Button>
                                                <span className="mx-3">{childCount}</span>
                                                <Button
                                                    variant="light"
                                                    style={{ padding: "0px 8px", border: "1px solid #dee2e6" }}
                                                    onClick={() => handleIncrement("child")}
                                                >
                                                    +
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span style={{ fontWeight: "500" }}>Infant</span>
                                            <div className="d-flex align-items-center">
                                                <Button
                                                    variant="light"
                                                    style={{ padding: "0px 8px", border: "1px solid #dee2e6" }}
                                                    onClick={() => handleDecrement("infant")}
                                                >
                                                    −
                                                </Button>
                                                <span className="mx-3">{infantCount}</span>
                                                <Button
                                                    variant="light"
                                                    style={{ padding: "0px 8px", border: "1px solid #dee2e6" }}
                                                    onClick={() => handleIncrement("infant")}
                                                >
                                                    +
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    variant="dark"
                                    className="w-100"
                                    style={{ backgroundColor: "#3F4E4F", border: "none", padding: "10px" }}
                                    onClick={handleFind}
                                >
                                    Find
                                </Button>
                            </Modal.Body>
                        </Modal>

                        {/* Available Rooms/Events Results Dialog */}
                        <Modal
                            show={showResultsModal}
                            onHide={handleCloseResultsModal}
                            dialogClassName="dialog-top-right">
                            <Modal.Header style={{ border: "none", paddingBottom: 0 }}>
                                <Modal.Title style={{ fontSize: "24px", fontWeight: "bold" }}>Available Rooms</Modal.Title>
                                <Button
                                    variant="link"
                                    onClick={handleCloseResultsModal}
                                    style={{ color: "#000", position: "absolute", right: "15px", top: "15px", padding: "0" }}
                                >
                                    <span style={{ fontSize: "24px" }}>&times;</span>
                                </Button>
                            </Modal.Header>
                            <Modal.Body style={{ padding: "20px", maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
                                {availableRooms.map((room, index) => (
                                    <div key={index} className="border rounded mb-3 p-3">
                                        <Row>
                                            <Col xs={3}>
                                                <img
                                                    src={room.image || "/placeholder.svg"}
                                                    alt={room.type}
                                                    style={{ width: "100%", height: "auto", borderRadius: "4px" }}
                                                />
                                            </Col>
                                            <Col xs={9}>
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <h5 style={{ fontWeight: "bold", marginBottom: "5px" }}>{room.type}</h5>
                                                    <div>
                                                        <span style={{ fontWeight: "bold" }}>{room.price}$</span>
                                                        <span style={{ color: "#6c757d", fontSize: "0.9rem" }}>/Per night</span>
                                                    </div>
                                                </div>
                                                <div className="d-flex mt-2">
                                                    <div className="me-4">
                                                        <small style={{ color: "#6c757d" }}>
                                                            <i className="bi bi-bed"></i> {room.beds} Beds
                                                        </small>
                                                    </div>
                                                    <div className="me-4">
                                                        <small style={{ color: "#6c757d" }}>
                                                            <i className="bi bi-person"></i> {room.guests} Guest
                                                        </small>
                                                    </div>
                                                    <div>
                                                        <small style={{ color: "#6c757d" }}>
                                                            <i className="bi bi-droplet"></i> {room.bathrooms} Bathroom
                                                        </small>
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                ))}

                                <h4 className="mt-4 mb-3">Available Events</h4>

                                {availableEvents.map((event, index) => (
                                    <div key={index} className="border rounded mb-3 p-3">
                                        <Row>
                                            <Col xs={3}>
                                                <img
                                                    src={event.image || "/placeholder.svg"}
                                                    alt={event.name}
                                                    style={{ width: "100%", height: "auto", borderRadius: "4px" }}
                                                />
                                            </Col>
                                            <Col xs={9}>
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <h5 style={{ fontWeight: "bold", marginBottom: "5px" }}>{event.name}</h5>
                                                    <div>
                                                        <Badge
                                                            bg={event.status === "Complete" ? "success" : "primary"}
                                                            style={{
                                                                backgroundColor: event.status === "Complete" ? "#0e5f3c" : "#0d6efd",
                                                                padding: "5px 10px",
                                                            }}
                                                        >
                                                            {event.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span style={{ fontWeight: "bold" }}>{event.price}$</span>
                                                    <span style={{ color: "#6c757d", fontSize: "0.9rem" }}>/Per Person</span>
                                                </div>
                                                <div className="d-flex mt-2">
                                                    <div className="me-4">
                                                        <small style={{ color: "#6c757d" }}>
                                                            <i className="bi bi-geo-alt"></i> {event.location}
                                                        </small>
                                                    </div>
                                                    <div className="me-4">
                                                        <small style={{ color: "#6c757d" }}>
                                                            <i className="bi bi-people"></i> {event.capacity} Capacity
                                                        </small>
                                                    </div>
                                                    <div>
                                                        <small style={{ color: "#6c757d" }}>
                                                            <i className="bi bi-calendar"></i> {event.date}
                                                        </small>
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                ))}
                            </Modal.Body>
                        </Modal>
                    </Container>
                </ThemeProvider>
            </div>
        </>
    )
}

export default AdminDashboard
