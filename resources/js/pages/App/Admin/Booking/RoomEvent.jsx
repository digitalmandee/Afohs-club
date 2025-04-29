import React, { useState } from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import { Container, Row, Col, Card, Button, Form, Badge, Modal } from "react-bootstrap"
import { Box, Typography } from "@mui/material"

const RoomEventModal = ({ handleCloseAvailabilityModal, onFind }) => {
    const [checkInDate, setCheckInDate] = useState("")
    const [checkOutDate, setCheckOutDate] = useState("")
    const [personType, setPersonType] = useState("Add person")
    const [adultCount, setAdultCount] = useState(0)
    const [childCount, setChildCount] = useState(0)
    const [infantCount, setInfantCount] = useState(0)

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
            <Box sx={{
                px: 2,
                py: 1
            }}>
                <Box sx={{ border: "none", paddingBottom: 0 }}>
                    <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>Room/Event Availability</Typography>
                    <Button
                        variant="link"
                        onClick={handleCloseAvailabilityModal}
                        style={{ color: "#000", position: "absolute", right: "15px", top: "15px", padding: "0" }}
                    >
                        <span style={{ fontSize: "24px" }}>&times;</span>
                    </Button>
                </Box>
                <Box sx={{ padding: "20px", maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
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
                        onClick={onFind}
                    >
                        Find
                    </Button>
                </Box>
            </Box>
        </>
    )
}

export default RoomEventModal
