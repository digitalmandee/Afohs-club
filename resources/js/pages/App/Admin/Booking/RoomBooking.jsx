"use client"

import { useState, useRef } from "react"
import { Container, Button, Form, InputGroup, Modal, Card, Row, Col } from "react-bootstrap"
import {
    ArrowBack,
    CheckCircle,
    Add,
    Remove,
    Print,
    CreditCard,
    EventNote,
    AccountBalance,
    KeyboardArrowRight,
    Check,
} from "@mui/icons-material"
import { IconButton, Divider, Box } from "@mui/material"
import "bootstrap/dist/css/bootstrap.min.css"
import SideNav from '@/components/App/AdminSideBar/SideNav'

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const RoomBooking = () => {
    // Main state for booking type
    const [open, setOpen] = useState(false);
    const [bookingType, setBookingType] = useState("room")
    const [currentStep, setCurrentStep] = useState(1)
    const [paymentMethod, setPaymentMethod] = useState("cash")
    const [showSuccessModal, setShowSuccessModal] = useState(false)

    // Form data states
    const [formData, setFormData] = useState({
        bookingId: "#001",
        memberId: "",
        fullName: "",
        contactNumber: "",
        email: "",
        roomCount: 0,
        personCount: 0,
        totalPayment: "",
        eventName: "",
        eventDate: "",
        eventTime: "",
        eventGuests: 0,
        cashAmount: "",
        customerChange: 0,
        bankName: "Sea Bank",
        accountNumber: "",
        accountName: "",
        notes: "",
    })

    // Receipt ref for printing
    const receiptRef = useRef(null)

    // Handle booking type selection
    const handleBookingTypeSelect = (type) => {
        setBookingType(type)
    }

    // Handle payment method selection
    const handlePaymentMethodSelect = (method) => {
        setPaymentMethod(method)
    }

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value,
        })

        // Calculate change if cash amount is entered
        if (name === "cashAmount" && formData.totalPayment) {
            const change = Number.parseFloat(value) - Number.parseFloat(formData.totalPayment)
            setFormData((prev) => ({
                ...prev,
                customerChange: change > 0 ? change : 0,
            }))
        }
    }

    // Handle room/person count changes
    const handleCountChange = (field, operation) => {
        setFormData((prev) => ({
            ...prev,
            [field]: operation === "add" ? prev[field] + 1 : Math.max(0, prev[field] - 1),
        }))
    }

    // Handle quick cash amount selection
    const handleQuickAmount = (amount) => {
        const numericTotal = Number.parseFloat(formData.totalPayment) || 0
        const change = amount - numericTotal

        setFormData((prev) => ({
            ...prev,
            cashAmount: amount.toString(),
            customerChange: change > 0 ? change : 0,
        }))
    }

    // Handle bank selection
    const handleBankSelect = (bank) => {
        setFormData((prev) => ({
            ...prev,
            bankName: bank,
        }))
    }

    // Handle book now button
    const handleBookNow = () => {
        setCurrentStep(2)
    }

    // Handle pay now button
    const handlePayNow = () => {
        setShowSuccessModal(true)
    }

    // Handle back button
    const handleBack = () => {
        if (currentStep === 2) {
            setCurrentStep(1)
        }
    }

    // Handle print receipt
    const handlePrint = () => {
        if (receiptRef.current) {
            const printContent = document.createElement("div")
            printContent.innerHTML = receiptRef.current.innerHTML
            document.body.appendChild(printContent)
            window.print()
            document.body.removeChild(printContent)
        }
    }

    // Handle close modal
    const handleCloseModal = () => {
        setShowSuccessModal(false)
        setCurrentStep(1)
        setBookingType("room")
        setPaymentMethod("cash")
        setFormData({
            bookingId: "#001",
            memberId: "",
            fullName: "",
            contactNumber: "",
            email: "",
            roomCount: 0,
            personCount: 0,
            totalPayment: "",
            eventName: "",
            eventDate: "",
            eventTime: "",
            eventGuests: 0,
            cashAmount: "",
            customerChange: 0,
            bankName: "Sea Bank",
            accountNumber: "",
            accountName: "",
            notes: "",
        })
    }

    // Format currency
    const formatCurrency = (amount) => {
        return `Rs ${Number.parseFloat(amount).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`
    }

    // Get current date and time
    const getCurrentDateTime = () => {
        const now = new Date()
        return now.toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: true,
        })
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
                <Container sx={{ px: 4, py: 2 }}>
                    {/* Header */}
                    <Box sx={{ display: "flex", alignItems: "center", mt: 4 }}>
                        <IconButton style={{ color: "#555" }}>
                            <ArrowBack />
                        </IconButton>
                        <h2 className="mb-0 ms-2 fw-normal" style={{ color: "#555" }}>
                            {currentStep === 1 ? "Room booking" : paymentMethod === "cash" ? "Cash Payment" : "Bank Payment"}
                        </h2>
                    </Box>

                    <Box sx={{
                        margin: '0 auto',
                        maxWidth: '600px',
                        bgcolor: '#FFFFFF',
                        borderRadius: '4px'
                    }}>
                        <div className="mx-4 mb-4 p-3 bg-light rounded">
                            <div className="d-flex align-items-center position-relative">
                                {/* Line */}
                                <div
                                    className="position-absolute"
                                    style={{
                                        height: "2px",
                                        backgroundColor: "#e9ecef",
                                        width: "100%",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        zIndex: 1,
                                    }}
                                ></div>

                                {/* Step 1 */}
                                <div className="d-flex align-items-center position-relative" style={{ zIndex: 2 }}>
                                    <div
                                        className={`rounded-circle d-flex align-items-center justify-content-center ${currentStep >= 1 ? "bg-dark text-white" : "bg-light text-dark border"
                                            }`}
                                        style={{ width: "32px", height: "32px", border: currentStep >= 1 ? "none" : "1px solid #dee2e6" }}
                                    >
                                        {currentStep > 1 ? <Check style={{ fontSize: "18px" }} /> : "1"}
                                    </div>
                                    <span className="ms-2 small">First Step</span>
                                </div>

                                {/* Spacer */}
                                <div className="flex-grow-1"></div>

                                {/* Step 2 */}
                                <div className="d-flex align-items-center position-relative" style={{ zIndex: 2 }}>
                                    <div
                                        className={`rounded-circle d-flex align-items-center justify-content-center ${currentStep >= 2 ? "bg-dark text-white" : "bg-light text-dark border"
                                            }`}
                                        style={{ width: "32px", height: "32px", border: currentStep >= 2 ? "none" : "1px solid #dee2e6" }}
                                    >
                                        2
                                    </div>
                                    <span className="ms-2 small">Final Step</span>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="mx-4 mb-4 p-4 bg-white rounded border">
                            {currentStep === 1 && (
                                <>
                                    <h6 className="mb-4">Choose booking Type</h6>
                                    <Row className="mb-4 gx-3">
                                        <Col md={6} className="mb-3 mb-md-0">
                                            <div
                                                className={`border rounded p-3 text-center ${bookingType === "room" ? "bg-info bg-opacity-10 border-info" : ""
                                                    }`}
                                                onClick={() => handleBookingTypeSelect("room")}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <div className="d-flex justify-content-center mb-2">
                                                    <EventNote style={{ color: "#555" }} />
                                                </div>
                                                <div>Room</div>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div
                                                className={`border rounded p-3 text-center ${bookingType === "events" ? "bg-info bg-opacity-10 border-info" : ""
                                                    }`}
                                                onClick={() => handleBookingTypeSelect("events")}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <div className="d-flex justify-content-center mb-2">
                                                    <EventNote style={{ color: "#555" }} />
                                                </div>
                                                <div>Events</div>
                                            </div>
                                        </Col>
                                    </Row>

                                    <Form>
                                        <Form.Group className="mb-4">
                                            <Form.Control
                                                type="text"
                                                value={`Booking ID : ${formData.bookingId}`}
                                                disabled
                                                className="bg-light border-0"
                                                style={{ color: "#555" }}
                                            />
                                        </Form.Group>

                                        <Row className="mb-3 gx-3">
                                            <Col md={6} className="mb-3 mb-md-0">
                                                <Form.Group>
                                                    <Form.Label className="small">Members ID</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="e.g: MEM2025"
                                                        name="memberId"
                                                        value={formData.memberId}
                                                        onChange={handleInputChange}
                                                        className="border"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="small">Full Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="e.g: Dianne"
                                                        name="fullName"
                                                        value={formData.fullName}
                                                        onChange={handleInputChange}
                                                        className="border"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row className="mb-3 gx-3">
                                            <Col md={6} className="mb-3 mb-md-0">
                                                <Form.Group>
                                                    <Form.Label className="small">Contact Number</Form.Label>
                                                    <InputGroup>
                                                        <InputGroup.Text className="bg-white border">+92</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            name="contactNumber"
                                                            value={formData.contactNumber}
                                                            onChange={handleInputChange}
                                                            className="border"
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="small">Email ID</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        placeholder="diannerussell@gmail.com"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        className="border"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        {bookingType === "room" ? (
                                            <Row className="mb-3 gx-3">
                                                <Col md={6} className="mb-3 mb-md-0">
                                                    <Form.Group>
                                                        <Form.Label className="small">{bookingType === "room" ? "Person" : "Rooms"}</Form.Label>
                                                        <InputGroup>
                                                            <Button
                                                                variant="outline-secondary"
                                                                onClick={() => handleCountChange("personCount", "subtract")}
                                                                className="border"
                                                            >
                                                                <Remove fontSize="small" />
                                                            </Button>
                                                            <Form.Control
                                                                type="text"
                                                                className="text-center border-top border-bottom border-0"
                                                                value={formData.personCount}
                                                                readOnly
                                                            />
                                                            <Button
                                                                variant="outline-secondary"
                                                                onClick={() => handleCountChange("personCount", "add")}
                                                                className="border"
                                                            >
                                                                <Add fontSize="small" />
                                                            </Button>
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="small">Total Payment</Form.Label>
                                                        <InputGroup>
                                                            <InputGroup.Text className="bg-white border">Rs</InputGroup.Text>
                                                            <Form.Control
                                                                type="text"
                                                                placeholder="Auto fill"
                                                                name="totalPayment"
                                                                value={formData.totalPayment}
                                                                onChange={handleInputChange}
                                                                className="border"
                                                            />
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        ) : (
                                            <>
                                                <Row className="mb-3 gx-3">
                                                    <Col md={6} className="mb-3 mb-md-0">
                                                        <Form.Group>
                                                            <Form.Label className="small">Event Name</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                placeholder="e.g: Conference"
                                                                name="eventName"
                                                                value={formData.eventName}
                                                                onChange={handleInputChange}
                                                                className="border"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group>
                                                            <Form.Label className="small">Event Date</Form.Label>
                                                            <Form.Control
                                                                type="date"
                                                                name="eventDate"
                                                                value={formData.eventDate}
                                                                onChange={handleInputChange}
                                                                className="border"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                                <Row className="mb-3 gx-3">
                                                    <Col md={6} className="mb-3 mb-md-0">
                                                        <Form.Group>
                                                            <Form.Label className="small">Event Time</Form.Label>
                                                            <Form.Control
                                                                type="time"
                                                                name="eventTime"
                                                                value={formData.eventTime}
                                                                onChange={handleInputChange}
                                                                className="border"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group>
                                                            <Form.Label className="small">Total Payment</Form.Label>
                                                            <InputGroup>
                                                                <InputGroup.Text className="bg-white border">Rs</InputGroup.Text>
                                                                <Form.Control
                                                                    type="text"
                                                                    placeholder="Auto fill"
                                                                    name="totalPayment"
                                                                    value={formData.totalPayment}
                                                                    onChange={handleInputChange}
                                                                    className="border"
                                                                />
                                                            </InputGroup>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            </>
                                        )}

                                        <div className="d-flex justify-content-end mt-4">
                                            <Button variant="light" className="me-2 border">
                                                Cancel
                                            </Button>
                                            <Button
                                                style={{ backgroundColor: "#003366", borderColor: "#003366" }}
                                                className="d-flex align-items-center"
                                                onClick={handleBookNow}
                                            >
                                                Book Now
                                                <KeyboardArrowRight fontSize="small" className="ms-1" />
                                            </Button>
                                        </div>
                                    </Form>
                                </>
                            )}

                            {currentStep === 2 && (
                                <>
                                    <h6 className="mb-4">Choose Payment Method</h6>
                                    <Row className="mb-4 gx-3">
                                        <Col md={6} className="mb-3 mb-md-0">
                                            <div
                                                className={`border rounded p-3 text-center ${paymentMethod === "cash" ? "bg-info bg-opacity-10 border-info" : ""
                                                    }`}
                                                onClick={() => handlePaymentMethodSelect("cash")}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <div className="d-flex justify-content-center mb-2">
                                                    <CreditCard style={{ color: "#555" }} />
                                                </div>
                                                <div>Cash</div>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div
                                                className={`border rounded p-3 text-center ${paymentMethod === "bank" ? "bg-info bg-opacity-10 border-info" : ""
                                                    }`}
                                                onClick={() => handlePaymentMethodSelect("bank")}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <div className="d-flex justify-content-center mb-2">
                                                    <AccountBalance style={{ color: "#555" }} />
                                                </div>
                                                <div>Bank Transfer</div>
                                            </div>
                                        </Col>
                                    </Row>

                                    {paymentMethod === "cash" ? (
                                        <>
                                            <Row className="mb-3 gx-3">
                                                <Col md={6} className="mb-3 mb-md-0">
                                                    <Form.Group>
                                                        <Form.Label className="small">Input Amount</Form.Label>
                                                        <InputGroup>
                                                            <InputGroup.Text className="bg-white border">Rs</InputGroup.Text>
                                                            <Form.Control
                                                                type="text"
                                                                name="cashAmount"
                                                                value={formData.cashAmount}
                                                                onChange={handleInputChange}
                                                                className="border"
                                                            />
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="small">Customer Changes</Form.Label>
                                                        <h4>Rs {formData.customerChange.toFixed(2)}</h4>
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            <div className="d-flex flex-wrap gap-2 mb-4">
                                                <Button
                                                    variant="outline-secondary"
                                                    onClick={() => handleQuickAmount(Number.parseFloat(formData.totalPayment) || 0)}
                                                    className="border"
                                                >
                                                    Exact money
                                                </Button>
                                                <Button variant="outline-secondary" onClick={() => handleQuickAmount(10)} className="border">
                                                    Rs 10.00
                                                </Button>
                                                <Button variant="outline-secondary" onClick={() => handleQuickAmount(20)} className="border">
                                                    Rs 20.00
                                                </Button>
                                                <Button variant="outline-secondary" onClick={() => handleQuickAmount(50)} className="border">
                                                    Rs 50.00
                                                </Button>
                                                <Button variant="outline-secondary" onClick={() => handleQuickAmount(100)} className="border">
                                                    Rs 100.00
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="small">Choose Bank Store</Form.Label>
                                                <div className="d-flex flex-wrap gap-2">
                                                    <Button
                                                        variant={formData.bankName === "Sea Bank" ? "dark" : "outline-secondary"}
                                                        onClick={() => handleBankSelect("Sea Bank")}
                                                        className="rounded-pill"
                                                        style={{
                                                            backgroundColor: formData.bankName === "Sea Bank" ? "#003366" : "transparent",
                                                            borderColor: formData.bankName === "Sea Bank" ? "#003366" : "#dee2e6",
                                                        }}
                                                    >
                                                        Sea Bank
                                                    </Button>
                                                    <Button
                                                        variant={formData.bankName === "CNBC Bank" ? "dark" : "outline-secondary"}
                                                        onClick={() => handleBankSelect("CNBC Bank")}
                                                        className="rounded-pill"
                                                        style={{
                                                            backgroundColor: formData.bankName === "CNBC Bank" ? "#003366" : "transparent",
                                                            borderColor: formData.bankName === "CNBC Bank" ? "#003366" : "#dee2e6",
                                                        }}
                                                    >
                                                        CNBC Bank
                                                    </Button>
                                                    <Button
                                                        variant={formData.bankName === "Citibank" ? "dark" : "outline-secondary"}
                                                        onClick={() => handleBankSelect("Citibank")}
                                                        className="rounded-pill"
                                                        style={{
                                                            backgroundColor: formData.bankName === "Citibank" ? "#003366" : "transparent",
                                                            borderColor: formData.bankName === "Citibank" ? "#003366" : "#dee2e6",
                                                        }}
                                                    >
                                                        Citibank
                                                    </Button>
                                                    <Button
                                                        variant={formData.bankName === "OCBC NISP" ? "dark" : "outline-secondary"}
                                                        onClick={() => handleBankSelect("OCBC NISP")}
                                                        className="rounded-pill"
                                                        style={{
                                                            backgroundColor: formData.bankName === "OCBC NISP" ? "#003366" : "transparent",
                                                            borderColor: formData.bankName === "OCBC NISP" ? "#003366" : "#dee2e6",
                                                        }}
                                                    >
                                                        OCBC NISP
                                                    </Button>
                                                </div>
                                            </Form.Group>

                                            <Form.Group className="mb-3">
                                                <Form.Label className="small">Customer Account Number</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="88-08543-6982"
                                                    name="accountNumber"
                                                    value={formData.accountNumber}
                                                    onChange={handleInputChange}
                                                    className="border"
                                                />
                                            </Form.Group>

                                            <Form.Group className="mb-3">
                                                <Form.Label className="small">Customer Account Name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Mr. Jamal"
                                                    name="accountName"
                                                    value={formData.accountName}
                                                    onChange={handleInputChange}
                                                    className="border"
                                                />
                                            </Form.Group>

                                            <Form.Group className="mb-3">
                                                <Form.Label className="small">Customer Account Bank</Form.Label>
                                                <Form.Select name="bankName" value={formData.bankName} onChange={handleInputChange} className="border">
                                                    <option value="Sea Bank">Sea Bank</option>
                                                    <option value="CNBC Bank">CNBC Bank</option>
                                                    <option value="Citibank">Citibank</option>
                                                    <option value="OCBC NISP">OCBC NISP</option>
                                                </Form.Select>
                                            </Form.Group>

                                            <Form.Group className="mb-3">
                                                <Form.Label className="small">Notes</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="e.g. lunch at imaji coffee"
                                                    name="notes"
                                                    value={formData.notes}
                                                    onChange={handleInputChange}
                                                    className="border"
                                                />
                                            </Form.Group>
                                        </>
                                    )}

                                    <div className="d-flex justify-content-end mt-4">
                                        <Button
                                            variant="light"
                                            className="me-2 d-flex align-items-center border"
                                            onClick={handleBack}
                                        >
                                            <ArrowBack fontSize="small" className="me-1" />
                                            Back
                                        </Button>
                                        <Button
                                            style={{ backgroundColor: "#003366", borderColor: "#003366" }}
                                            className="d-flex align-items-center"
                                            onClick={handlePayNow}
                                        >
                                            Pay Now
                                            <KeyboardArrowRight fontSize="small" className="ms-1" />
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Success Modal */}
                    </Box>
                </Container>
            </div>
        </>
    )
}
export default RoomBooking