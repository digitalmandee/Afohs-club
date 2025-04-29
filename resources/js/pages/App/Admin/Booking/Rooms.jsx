import React, { useState } from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import { Container, Row, Col, Card, Button, Form, Badge, Modal } from "react-bootstrap"
import { Box, Typography } from "@mui/material"
import { router } from '@inertiajs/react';

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
                px:2,
                py:1
            }}>
                <Box sx={{ border: "none", paddingBottom: 0 }}>
                    <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>Available Rooms</Typography>
                    <Button
                        variant="link"
                        onClick={handleCloseResultsModal}
                        style={{ color: "#000", position: "absolute", right: "15px", top: "15px", padding: "0" }}
                    >
                        <span style={{ fontSize: "24px" }}>&times;</span>
                    </Button>
                </Box>
                <Box sx={{ padding: "20px", maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
                    {availableRooms.map((room, index) => (
                        <div key={index} className="border rounded mb-3 p-3">
                            <Row style={{
                                cursor:'pointer',
                            }}
                            onClick={() => router.visit('/admin/room/booking')}
                            >
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
                </Box>
            </Box>
        </>
    )
}

export default AvailableRooms
