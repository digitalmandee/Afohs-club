import React, { useState } from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import { Container, Row, Col, Card, Button, Form, Badge, Modal } from "react-bootstrap"
import { Box, Typography } from "@mui/material"
import { router } from '@inertiajs/react';
import HotelIcon from '@mui/icons-material/Hotel';
import PeopleIcon from '@mui/icons-material/People';
import BathtubIcon from '@mui/icons-material/Bathtub';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HistoryIcon from '@mui/icons-material/History';
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

const AvailableRooms = () => {
    const handleCloseResultsModal = () => {
        setShowResultsModal(false)
    }
    return (
        <>
            <Box sx={{
                px: 2,
                py: 1,
                pt: 2
            }}>
                <Typography sx={{ px: 2, fontSize: "20px", fontWeight: 500, color: '#121212' }}>Available Rooms</Typography>
                {/* <Button
                        variant="link"
                        onClick={handleCloseResultsModal}
                        style={{ color: "#000", position: "absolute", right: "15px", top: "15px", padding: "0" }}
                    >
                        <span style={{ fontSize: "24px" }}>&times;</span>
                    </Button> */}
                <Box sx={{ p: 1, mt: 3, maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
                    {availableRooms.map((room, index) => (
                        <div key={index} className="border mb-3 p-2" style={{
                            height: 88,
                            border: '1px solid #E3E3E3',
                        }}>
                            <Row style={{
                                cursor: 'pointer',
                            }}
                                onClick={() => router.visit('/admin/room/booking')}
                            >
                                <Col xs={3}>
                                    <img
                                        src={room.image || "/placeholder.svg"}
                                        alt={room.type}
                                        style={{ width: 100, height: 67, borderRadius: "4px" }}
                                    />
                                </Col>
                                <Col xs={9}>
                                    <div className="d-flex justify-content-between">
                                        <h5 style={{ fontWeight: 400, fontSize: '18px', color: '#121212', marginBottom: "5px" }}>{room.type}</h5>
                                        <div>
                                            <span style={{ fontWeight: "bold" }}>{room.price}$</span>
                                            <span style={{ color: "#6c757d", fontSize: "0.9rem" }}>/Per night</span>
                                        </div>
                                    </div>
                                    <div className="d-flex mt-3" style={{
                                        gap: 5
                                    }}>
                                        <div className="me-4">
                                            <HotelIcon style={{
                                                color: '#A5A5A5',
                                                width: 20,
                                                height: 14
                                            }} />
                                            <small style={{ color: "#6c757d" }}>
                                                <i className="bi bi-bed" style={{
                                                    fontSize: '12px'
                                                }}></i> {room.beds} Beds
                                            </small>
                                        </div>
                                        <div className="me-4">
                                            <PeopleIcon style={{
                                                color: '#A5A5A5',
                                                width: 20,
                                                height: 14
                                            }} />
                                            <small style={{ color: "#6c757d" }}>
                                                <i className="bi bi-person" style={{
                                                    fontSize: '12px'
                                                }}></i> {room.guests} Guest
                                            </small>
                                        </div>
                                        <div>
                                            <BathtubIcon style={{
                                                color: '#A5A5A5',
                                                width: 20,
                                                height: 14
                                            }} />
                                            <small style={{ color: "#6c757d" }}>
                                                <i className="bi bi-droplet" style={{
                                                    fontSize: '12px'
                                                }}></i> {room.bathrooms} Bathroom
                                            </small>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    ))}

                    <h4 className="mt-4 mb-3" style={{
                        fontWeight: 500,
                        fontSize: '20px',
                        color: '#121212'
                    }}>Available Events</h4>

                    {availableEvents.map((event, index) => (
                        <div key={index} className="border mb-3 p-2" style={{
                            height: 88,
                            border: '1px solid #E3E3E3',
                        }}>
                            <Row>
                                <Col xs={3}>
                                    <img
                                        src={event.image || "/placeholder.svg"}
                                        alt={event.name}
                                        style={{ width: 100, height: 67, borderRadius: "4px" }}
                                    />
                                </Col>
                                <Col xs={9}>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <h5 style={{ fontWeight: 400, fontSize: '20px', color: '#121212' }}>{event.name}</h5>
                                        <div>
                                            <Badge
                                                bg={event.status === "Complete" ? "success" : "primary"}
                                                style={{
                                                    backgroundColor: event.status === "Complete" ? "#0e5f3c" : "#0d6efd",
                                                    padding: "5px 10px",
                                                    borderRadius: 0
                                                }}
                                            >
                                                {event.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div style={{
                                        marginTop: -12
                                    }}>
                                        <span style={{ fontWeight: 400, fontSize: '12px', color: '#121212' }}>{event.price}$</span>
                                        <span style={{ fontWeight: 400, fontSize: '12px', color: '#A5A5A5' }}>/Per Person</span>
                                    </div>
                                    <div className="d-flex mt-1">
                                        <div className="me-3">
                                            <LocationOnIcon style={{
                                                color: '#A5A5A5',
                                                width: 20,
                                                height: 14
                                            }} />
                                            <small style={{ color: "#6c757d" }}>
                                                <i className="bi bi-geo-alt" style={{
                                                    fontSize: '12px'
                                                }}></i> {event.location}
                                            </small>
                                        </div>
                                        <div className="me-3">
                                            <PeopleIcon style={{
                                                color: '#A5A5A5',
                                                width: 20,
                                                height: 14
                                            }} />
                                            <small style={{ color: "#6c757d" }}>
                                                <i className="bi bi-people" style={{
                                                    fontSize: '12px'
                                                }}></i> {event.capacity} Capacity
                                            </small>
                                        </div>
                                        <div>
                                            <HistoryIcon style={{
                                                color: '#A5A5A5',
                                                width: 20,
                                                height: 14
                                            }} />
                                            <small style={{ color: "#6c757d" }}>
                                                <i className="bi bi-calendar" style={{
                                                    fontSize: '12px'
                                                }}></i> {event.date}
                                            </small>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    ))}
                </Box>
            </Box>
        </>
    )
}

export default AvailableRooms
