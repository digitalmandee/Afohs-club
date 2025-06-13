import { useState, useRef, useEffect, useCallback } from 'react';
import { Container, Button, Form, InputGroup, Modal, Card, Row, Col } from 'react-bootstrap';
import { ArrowBack, CheckCircle, Add, Remove, Print, CreditCard, EventNote, AccountBalance, KeyboardArrowRight, Check } from '@mui/icons-material';
import { IconButton, Divider, Box, Autocomplete, TextField, Typography } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const RoomBooking = ({ booking, invoice, next_booking_id }) => {
    // Access query parameters
    const { props } = usePage();
    const urlParams = new URLSearchParams(window.location.search);
    const urlParamsObject = Object.fromEntries([...urlParams.entries()].map(([key, value]) => [key, value]));
    const initialBookingType = urlParamsObject?.type === 'event' ? 'events' : 'room';

    // Main state for booking type
    const [open, setOpen] = useState(false);
    const [bookingType, setBookingType] = useState(initialBookingType);

    const [currentStep, setCurrentStep] = useState(urlParamsObject?.invoice_no ? 2 : 1);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [searchLoading, setSearchLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState([]);

    // Form data states
    const [formData, setFormData] = useState({
        customer: {},
        bookingId: next_booking_id,
        memberId: '',
        fullName: '',
        contactNumber: '',
        email: '',
        // roomCount: 0,
        personCount: urlParamsObject?.persons || 0,
        totalPayment: '',
        eventName: booking?.event_name || '',
        eventDate: booking?.date_time ? booking.date_time.split(' ')[0] : '',
        eventTime: booking?.date_time ? booking.date_time.split(' ')[1] : '',
        eventGuests: 0,
        cashAmount: '',
        customerChange: 0,
        bankName: 'Sea Bank',
        accountNumber: '',
        accountName: '',
        notes: '',
        bookingFor: 'mainGuest',
        checkin: urlParamsObject?.checkin || '',
        checkout: urlParamsObject?.checkout || '',
    });

    const [invoiceForm, setInvoiceForm] = useState({
        user_id: invoice?.customer?.id,
        inputAmount: invoice?.total_price?.toString() || '0',
        customerCharges: '0.00',
        paymentMethod: 'cash',
        receipt: null,
    });

    useEffect(() => {
        const nights = (new Date(formData.checkout) - new Date(formData.checkin)) / (1000 * 60 * 60 * 24);

        setFormData((prev) => ({
            ...prev,
            totalPayment: urlParamsObject?.type === 'room' ? booking?.price_per_night * nights : booking?.price_per_person * formData.personCount,
        }));
    }, [formData.checkout, formData.checkin]);

    const searchUser = useCallback(async (query) => {
        if (!query) return []; // Don't make a request if the query is empty.
        setSearchLoading(true);
        try {
            const response = await axios.get(route('membership.filter'), {
                params: { query },
            });
            setMembers(response.data.results);
        } catch (error) {
            console.error('Error fetching search results:', error);
            return [];
        } finally {
            setSearchLoading(false);
        }
    }, []);

    const handleSearch = async (event) => {
        const query = event?.target?.value;
        if (query) {
            await searchUser(query);
        } else {
            setMembers([]);
        }
    };

    const handleSearchChange = (event, value) => {
        setFormData((prev) => ({
            ...prev,
            fullName: [value?.first_name, value?.middle_name, value?.last_name].filter(Boolean).join(' ') || '',
            email: value?.email || '',
            contactNumber: value?.phone_number || '',
            customer: value || {},
        }));
    };

    // Handle payment method selection
    const handlePaymentMethodSelect = (method) => {
        setPaymentMethod(method);
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        // Calculate change if cash amount is entered
        if (name === 'cashAmount' && formData.totalPayment) {
            const change = Number.parseFloat(value) - Number.parseFloat(formData.totalPayment);
            setFormData((prev) => ({
                ...prev,
                customerChange: change > 0 ? change : 0,
            }));
        }
    };

    // Handle room/person count changes
    const handleCountChange = (field, operation) => {
        setFormData((prev) => ({
            ...prev,
            [field]: operation === 'add' ? prev[field] + 1 : Math.max(0, prev[field] - 1),
        }));
    };

    const [error, setError] = useState('');

    const minAmount = parseFloat(invoice?.total_price || 0);

    const handlePaymentChange = (e) => {
        const { name, value, files } = e.target;

        if (name === 'receipt') {
            setInvoiceForm((prev) => ({ ...prev, receipt: files[0] }));
            return;
        }

        if (name === 'inputAmount') {
            let inputValue = parseFloat(value) || 0;
            inputValue = Math.round(inputValue);
            const charges = inputValue - Math.round(minAmount);
            setInvoiceForm((prev) => ({
                ...prev,
                inputAmount: inputValue.toString(),
                customerCharges: charges > 0 ? charges.toString() : '0',
            }));
            return;
        }

        setInvoiceForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleQuickAmount = (value) => {
        setInvoiceForm((prev) => ({ ...prev, inputAmount: value }));
    };

    const handlePayNow = async (e) => {
        e.preventDefault();

        const inputAmount = Math.round(invoiceForm.inputAmount || '0');

        if (!invoiceForm.inputAmount || inputAmount <= 0) {
            setError('Please enter a valid amount.');
            return;
        }

        if (inputAmount < minAmount) {
            setError(`Amount must be at least Rs ${minAmount.toFixed(2)}.`);
            return;
        }

        const data = new FormData();
        data.append('user_id', invoiceForm.user_id);
        data.append('amount', invoice.amount); // or any other base you need
        data.append('total_amount', inputAmount);
        data.append('invoice_no', invoice.invoice_no); // optionally link to invoice
        data.append('customer_charges', parseFloat(invoiceForm.customerCharges));
        data.append('payment_method', paymentMethod);

        if (invoiceForm.paymentMethod === 'credit_card' && invoiceForm.receipt) {
            data.append('receipt', invoiceForm.receipt);
        }

        try {
            setLoading(true);
            const response = await axios.post(route('booking.payment.store'), data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                setError('');
                enqueueSnackbar('Payment successful', { variant: 'success' });
                router.visit(route('rooms.dashboard'));
            } else {
                setError('Payment failed: ' + (response.data?.message || 'Please check the form data.'));
            }
        } catch (error) {
            console.log(error);
            setError('Payment failed: ' + (error.response?.data?.message || 'Please check the form data.'));
        } finally {
            setLoading(false);
        }
    };

    // Handle bank selection
    const handleBankSelect = (bank) => {
        setFormData((prev) => ({
            ...prev,
            bankName: bank,
        }));
    };

    // Handle book now button
    const handleBookNow = async () => {
        try {
            let bookingData = null;
            if (bookingType === 'room') {
                bookingData = {
                    customer: formData.customer,
                    bookingType: 'room',
                    bookingTypeId: urlParamsObject.type_id,
                    bookingFor: formData.bookingFor === 'mainGuest' ? 'main_guest' : 'other',
                    personCount: formData.personCount,
                    totalPayment: Math.round(formData.totalPayment) || 0,
                    checkin: formData.checkin || null,
                    checkout: formData.checkout || null,
                };
            } else {
                bookingData = {
                    customer: formData.customer,
                    bookingType: 'event',
                    bookingTypeId: urlParamsObject.type_id,
                    bookingFor: formData.bookingFor === 'mainGuest' ? 'main_guest' : 'other',
                    personCount: formData.personCount,
                    totalPayment: Math.round(formData.totalPayment) || 0,
                    eventName: formData.eventName || null,
                    eventDate: formData.eventDate || null,
                    eventTime: formData.eventTime || null,
                };
            }
            setLoading(true);

            const response = await axios.post(route('rooms.booking.store'), bookingData);
            router.visit(route('rooms.booking', { invoice_no: response.data.invoice_no }));
            setCurrentStep(2);
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error saving booking:', error);
            alert('Failed to save booking. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle back button
    const handleBack = () => {
        if (currentStep === 2) {
            setCurrentStep(1);
        }
    };

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
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 15, ml: 5 }}>
                    <IconButton style={{ color: '#3F4E4F' }} onClick={() => router.visit('/admin/booking/dashboard')}>
                        <ArrowBack />
                    </IconButton>
                    <h2 className="mb-0 fw-normal" style={{ color: '#3F4E4F', fontSize: '30px' }}>
                        {currentStep === 1 ? (bookingType === 'room' ? 'Room Booking' : 'Event Booking') : paymentMethod === 'cash' ? 'Cash Payment' : 'Bank Payment'}
                    </h2>
                </Box>

                <Box
                    sx={{
                        margin: '0 auto',
                        maxWidth: '600px',
                        bgcolor: '#FFFFFF',
                        borderRadius: '4px',
                        marginTop: 5,
                    }}
                >
                    <div
                        className="mx-4 mb-4 p-3"
                        style={{
                            backgroundColor: '#E7E7E7',
                            borderRadius: '2px',
                        }}
                    >
                        <div className="d-flex align-items-center justify-content-center position-relative">
                            {/* Line */}
                            <div
                                className="position-absolute"
                                style={{
                                    height: '2px',
                                    backgroundColor: '#FFFFFF',
                                    width: '300px',
                                    top: '50%',
                                    zIndex: 1,
                                }}
                            ></div>

                            {/* Step 1 */}
                            <div className="d-flex align-items-center position-relative" style={{ zIndex: 2 }}>
                                <div className={`rounded-circle d-flex align-items-center justify-content-center ${currentStep >= 1 ? 'bg-dark text-white' : 'bg-light text-dark border'}`} style={{ width: '32px', height: '32px', border: currentStep >= 1 ? 'none' : '1px solid #dee2e6' }}>
                                    {currentStep > 1 ? <Check style={{ fontSize: '18px' }} /> : '1'}
                                </div>
                                <span
                                    className="ms-2 small"
                                    style={{
                                        color: '#121212',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                    }}
                                >
                                    First Step
                                </span>
                            </div>

                            {/* Spacer */}
                            <div className="flex-grow-1"></div>

                            {/* Step 2 */}
                            <div className="d-flex align-items-center position-relative" style={{ zIndex: 2 }}>
                                <div className={`rounded-circle d-flex align-items-center justify-content-center ${currentStep >= 2 ? 'bg-dark text-white' : 'bg-light text-dark border'}`} style={{ width: '32px', height: '32px', border: currentStep >= 2 ? 'none' : '1px solid #dee2e6' }}>
                                    2
                                </div>
                                <span
                                    className="ms-2 small"
                                    style={{
                                        color: '#121212',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                    }}
                                >
                                    Final Step
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="mx-4 mb-4 p-4 bg-white rounded border">
                        {currentStep === 1 && (
                            <>
                                <h6
                                    className="mb-4"
                                    style={{
                                        color: '#121212',
                                        fontSize: '16px',
                                    }}
                                >
                                    Booking Type : {bookingType === 'room' ? 'Room' : 'Event'}
                                </h6>

                                <Form>
                                    <Form.Group className="mb-4">
                                        <div
                                            className="form-control"
                                            style={{
                                                backgroundColor: '#e9ecef',
                                                color: '#7F7F7F',
                                                border: 'none',
                                                borderRadius: '4px',
                                                padding: '0.375rem 0.75rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <span style={{ color: '#7F7F7F' }}>Booking ID : </span>
                                            <span style={{ color: '#063455', marginLeft: '4px', fontWeight: 700 }}>#{formData.bookingId}</span>
                                        </div>
                                    </Form.Group>

                                    <Row className="mb-3 gx-3">
                                        <Col md={6} className="mb-3 mb-md-0">
                                            <Form.Group>
                                                <Form.Label
                                                    className="small"
                                                    style={{
                                                        color: '#121212',
                                                        fontSize: '14px',
                                                        fontWeight: 400,
                                                    }}
                                                >
                                                    Members ID
                                                </Form.Label>

                                                <Autocomplete
                                                    fullWidth
                                                    freeSolo
                                                    size="small"
                                                    options={members}
                                                    value={formData.customer}
                                                    name="customer"
                                                    loading={searchLoading}
                                                    getOptionLabel={(option) => option?.user_id || ''}
                                                    isOptionEqualToValue={(option, value) => option?.user_id === value?.user_id}
                                                    onInputChange={handleSearch}
                                                    onChange={handleSearchChange}
                                                    renderInput={(params) => <TextField {...params} type="text" placeholder="e.g: MEM2025" name="memberId" className="border" />}
                                                    renderOption={(props, option) => (
                                                        <li {...props}>
                                                            <span>
                                                                {option.first_name} ({option.user_id})
                                                            </span>
                                                            <span style={{ color: 'gray', fontSize: '0.875rem', marginLeft: '8px' }}>{option.email}</span>
                                                        </li>
                                                    )}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label
                                                    className="small"
                                                    style={{
                                                        color: '#121212',
                                                        fontSize: '14px',
                                                        fontWeight: 400,
                                                    }}
                                                >
                                                    Full Name
                                                </Form.Label>
                                                <Form.Control type="text" placeholder="e.g: Dianne" name="fullName" value={formData.fullName} onChange={handleInputChange} className="border" />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row className="mb-3 gx-3">
                                        <Col md={6} className="mb-3 mb-md-0">
                                            <Form.Group>
                                                <Form.Label
                                                    className="small"
                                                    style={{
                                                        color: '#121212',
                                                        fontSize: '14px',
                                                        fontWeight: 400,
                                                    }}
                                                >
                                                    Contact Number
                                                </Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text className="bg-white border">+92</InputGroup.Text>
                                                    <Form.Control type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} className="border" />
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label
                                                    className="small"
                                                    style={{
                                                        color: '#121212',
                                                        fontSize: '14px',
                                                        fontWeight: 400,
                                                    }}
                                                >
                                                    Email ID
                                                </Form.Label>
                                                <Form.Control type="email" placeholder="diannerussell@gmail.com" name="email" value={formData.email} onChange={handleInputChange} className="border" />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    {bookingType === 'room' ? (
                                        <>
                                            <Row className="mb-3 gx-3">
                                                <Col md={6} className="mb-3 mb-md-0">
                                                    <Form.Group>
                                                        <Form.Label
                                                            className="small"
                                                            style={{
                                                                color: '#121212',
                                                                fontSize: '14px',
                                                                fontWeight: 400,
                                                            }}
                                                        >
                                                            Person
                                                        </Form.Label>
                                                        <InputGroup>
                                                            <Button variant="outline-secondary" onClick={() => handleCountChange('personCount', 'subtract')} className="border">
                                                                <Remove fontSize="small" />
                                                            </Button>
                                                            <Form.Control type="text" className="text-center border-top border-bottom border-0" value={formData.personCount} readOnly />
                                                            <Button variant="outline-secondary" onClick={() => handleCountChange('personCount', 'add')} className="border">
                                                                <Add fontSize="small" />
                                                            </Button>
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label
                                                            className="small"
                                                            style={{
                                                                color: '#121212',
                                                                fontSize: '14px',
                                                                fontWeight: 400,
                                                            }}
                                                        >
                                                            Total Payment
                                                        </Form.Label>
                                                        <InputGroup>
                                                            <InputGroup.Text className="bg-white border">Rs</InputGroup.Text>
                                                            <Form.Control type="text" placeholder="Auto fill" name="totalPayment" value={formData.totalPayment} onChange={handleInputChange} className="border" />
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Row className="mb-3 gx-3">
                                                <Col md={6} className="mb-3 mb-md-0">
                                                    <Form.Group>
                                                        <Form.Label
                                                            className="small"
                                                            style={{
                                                                color: '#121212',
                                                                fontSize: '14px',
                                                                fontWeight: 400,
                                                            }}
                                                        >
                                                            Check-in Date
                                                        </Form.Label>
                                                        <Form.Control type="date" name="checkin" value={formData.checkin} onChange={handleInputChange} className="border" />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label
                                                            className="small"
                                                            style={{
                                                                color: '#121212',
                                                                fontSize: '14px',
                                                                fontWeight: 400,
                                                            }}
                                                        >
                                                            Check-out Date
                                                        </Form.Label>
                                                        <Form.Control type="date" name="checkout" value={formData.checkout} onChange={handleInputChange} className="border" />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </>
                                    ) : (
                                        <>
                                            <Row className="mb-3 gx-3">
                                                <Col md={6} className="mb-3 mb-md-0">
                                                    <Form.Group>
                                                        <Form.Label
                                                            className="small"
                                                            style={{
                                                                color: '#121212',
                                                                fontSize: '14px',
                                                                fontWeight: 400,
                                                            }}
                                                        >
                                                            Event Name
                                                        </Form.Label>
                                                        <Form.Control type="text" placeholder="e.g: Conference" name="eventName" value={formData.eventName} onChange={handleInputChange} className="border" />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label
                                                            className="small"
                                                            style={{
                                                                color: '#121212',
                                                                fontSize: '14px',
                                                                fontWeight: 400,
                                                            }}
                                                        >
                                                            Event Date
                                                        </Form.Label>
                                                        <Form.Control type="date" name="eventDate" value={formData.eventDate} onChange={handleInputChange} className="border" />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Row className="mb-3 gx-3">
                                                <Col md={6} className="mb-3 mb-md-0">
                                                    <Form.Group>
                                                        <Form.Label
                                                            className="small"
                                                            style={{
                                                                color: '#121212',
                                                                fontSize: '14px',
                                                                fontWeight: 400,
                                                            }}
                                                        >
                                                            Event Time
                                                        </Form.Label>
                                                        <Form.Control type="time" name="eventTime" value={formData.eventTime} onChange={handleInputChange} className="border" />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label
                                                            className="small"
                                                            style={{
                                                                color: '#121212',
                                                                fontSize: '14px',
                                                                fontWeight: 400,
                                                            }}
                                                        >
                                                            Total Payment
                                                        </Form.Label>
                                                        <InputGroup>
                                                            <InputGroup.Text className="bg-white border">Rs</InputGroup.Text>
                                                            <Form.Control type="text" placeholder="Auto fill" name="totalPayment" value={formData.totalPayment} onChange={handleInputChange} className="border" />
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </>
                                    )}

                                    <Form.Group className="mb-3">
                                        <Form.Label
                                            className="small"
                                            style={{
                                                color: '#121212',
                                                fontSize: '14px',
                                                fontWeight: 400,
                                            }}
                                        >
                                            Who are you booking for?
                                        </Form.Label>
                                        <div className="d-flex flex-column">
                                            <Form.Check type="radio" label="I'm the main guest" name="bookingFor" value="mainGuest" checked={formData.bookingFor === 'mainGuest'} onChange={handleInputChange} className="mb-2" />
                                            <Form.Check type="radio" label="I'm booking for someone else" name="bookingFor" value="someoneElse" checked={formData.bookingFor === 'someoneElse'} onChange={handleInputChange} />
                                        </div>
                                    </Form.Group>

                                    <div className="d-flex justify-content-end mt-4">
                                        <Button variant="light" className="me-2 border">
                                            Cancel
                                        </Button>
                                        <Button style={{ backgroundColor: '#003366', borderColor: '#003366' }} className="d-flex align-items-center" onClick={handleBookNow} disabled={loading} loading={loading} loadingPosition="start">
                                            Book Now
                                            <KeyboardArrowRight fontSize="small" className="ms-1" />
                                        </Button>
                                    </div>
                                </Form>
                            </>
                        )}

                        {currentStep === 2 && (
                            <>
                                <h6
                                    className="mb-4"
                                    style={{
                                        color: '#121212',
                                        fontWeight: 500,
                                        fontSize: '20px',
                                    }}
                                >
                                    Choose Payment Method
                                </h6>
                                <Row className="mb-4 gx-3">
                                    <Col md={4} className="mb-3 mb-md-0">
                                        <div
                                            className="border rounded p-3 text-center"
                                            onClick={() => handlePaymentMethodSelect('cash')}
                                            style={{
                                                cursor: 'pointer',
                                                backgroundColor: paymentMethod === 'cash' ? '#B0DEFF' : 'transparent',
                                                border: paymentMethod === 'cash' ? '1px solid #063455' : '1px solid #dee2e6',
                                            }}
                                        >
                                            <div className="d-flex justify-content-center mb-2">
                                                <img
                                                    src="/assets/money-bills.png"
                                                    alt=""
                                                    style={{
                                                        width: 24,
                                                        height: 20,
                                                    }}
                                                />
                                            </div>
                                            <div>Cash</div>
                                        </div>
                                    </Col>

                                    <Col md={4}>
                                        <div
                                            className="border rounded p-3 text-center"
                                            onClick={() => handlePaymentMethodSelect('credit_card')}
                                            style={{
                                                cursor: 'pointer',
                                                backgroundColor: paymentMethod === 'credit_card' ? '#B0DEFF' : 'transparent',
                                                border: paymentMethod === 'credit_card' ? '1px solid #063455' : '1px solid #dee2e6',
                                            }}
                                        >
                                            <div className="d-flex justify-content-center mb-2">
                                                <img
                                                    src="/assets/credit-card-change.png"
                                                    alt=""
                                                    style={{
                                                        width: 24,
                                                        height: 20,
                                                    }}
                                                />
                                            </div>
                                            <div>Credit Card</div>
                                        </div>
                                    </Col>
                                    <Col md={4}>
                                        <div
                                            className="border rounded p-3 text-center"
                                            onClick={() => handlePaymentMethodSelect('bank')}
                                            style={{
                                                cursor: 'pointer',
                                                backgroundColor: paymentMethod === 'bank' ? '#B0DEFF' : 'transparent',
                                                border: paymentMethod === 'bank' ? '1px solid #063455' : '1px solid #dee2e6',
                                            }}
                                        >
                                            <div className="d-flex justify-content-center mb-2">
                                                <img
                                                    src="/assets/credit-card-change.png"
                                                    alt=""
                                                    style={{
                                                        width: 24,
                                                        height: 20,
                                                    }}
                                                />
                                            </div>
                                            <div>Bank Transfer</div>
                                        </div>
                                    </Col>
                                </Row>

                                {paymentMethod === 'cash' || paymentMethod === 'credit_card' ? (
                                    <>
                                        <Row className="mb-3 gx-3">
                                            <Col md={6} className="mb-3 mb-md-0">
                                                <Form.Group>
                                                    <Form.Label
                                                        className="small"
                                                        style={{
                                                            color: '#121212',
                                                            fontWeight: 400,
                                                            fontSize: '14px',
                                                        }}
                                                    >
                                                        Input Amount
                                                    </Form.Label>
                                                    <InputGroup>
                                                        <InputGroup.Text className="bg-white border">Rs</InputGroup.Text>
                                                        <Form.Control type="text" name="inputAmount" value={invoiceForm.inputAmount} onChange={handlePaymentChange} className="border" />
                                                    </InputGroup>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label
                                                        className="small"
                                                        style={{
                                                            color: '#121212',
                                                            fontWeight: 400,
                                                            fontSize: '14px',
                                                        }}
                                                    >
                                                        Customer Changes
                                                    </Form.Label>
                                                    <h4>Rs {Math.round(invoiceForm.customerCharges)}</h4>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <div className="d-flex flex-wrap gap-2 mb-4">
                                            {['Exact money', '10.00', '20.00', '50.00', '100.00'].map((value) => (
                                                <Button
                                                    key={value}
                                                    variant="outlined"
                                                    className="p-2"
                                                    onClick={() => handleQuickAmount(value === 'Exact money' ? Math.round(minAmount) : parseInt(value))}
                                                    sx={{
                                                        textTransform: 'none',
                                                        borderColor: '#ccc',
                                                        color: '#333',
                                                        fontSize: '0.875rem',
                                                        '&:hover': { borderColor: '#999', bgcolor: '#f5f5f5' },
                                                    }}
                                                >
                                                    {value === 'Exact money' ? 'Exact money' : `Rs ${value}`}
                                                </Button>
                                            ))}
                                        </div>
                                        {error && (
                                            <Typography color="error" sx={{ mb: 2 }}>
                                                {error}
                                            </Typography>
                                        )}

                                        {paymentMethod === 'credit_card' && (
                                            <Box sx={{ mb: 4 }}>
                                                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500, color: '#666' }}>
                                                    Upload Receipt
                                                </Typography>
                                                <input type="file" name="receipt" accept="image/*,application/pdf" onChange={handlePaymentChange} style={{ display: 'block' }} />
                                            </Box>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small">Choose Bank Store</Form.Label>
                                            <div className="d-flex flex-wrap gap-2">
                                                <Button
                                                    variant={formData.bankName === 'Sea Bank' ? 'dark' : 'outline-secondary'}
                                                    onClick={() => handleBankSelect('Sea Bank')}
                                                    className="rounded-pill"
                                                    style={{
                                                        backgroundColor: formData.bankName === 'Sea Bank' ? '#003366' : 'transparent',
                                                        borderColor: formData.bankName === 'Sea Bank' ? '#003366' : '#dee2e6',
                                                    }}
                                                >
                                                    Sea Bank
                                                </Button>
                                                <Button
                                                    variant={formData.bankName === 'CNBC Bank' ? 'dark' : 'outline-secondary'}
                                                    onClick={() => handleBankSelect('CNBC Bank')}
                                                    className="rounded-pill"
                                                    style={{
                                                        backgroundColor: formData.bankName === 'CNBC Bank' ? '#003366' : 'transparent',
                                                        borderColor: formData.bankName === 'CNBC Bank' ? '#003366' : '#dee2e6',
                                                    }}
                                                >
                                                    CNBC Bank
                                                </Button>
                                                <Button
                                                    variant={formData.bankName === 'Citibank' ? 'dark' : 'outline-secondary'}
                                                    onClick={() => handleBankSelect('Citibank')}
                                                    className="rounded-pill"
                                                    style={{
                                                        backgroundColor: formData.bankName === 'Citibank' ? '#003366' : 'transparent',
                                                        borderColor: formData.bankName === 'Citibank' ? '#003366' : '#dee2e6',
                                                    }}
                                                >
                                                    Citibank
                                                </Button>
                                                <Button
                                                    variant={formData.bankName === 'OCBC NISP' ? 'dark' : 'outline-secondary'}
                                                    onClick={() => handleBankSelect('OCBC NISP')}
                                                    className="rounded-pill"
                                                    style={{
                                                        backgroundColor: formData.bankName === 'OCBC NISP' ? '#003366' : 'transparent',
                                                        borderColor: formData.bankName === 'OCBC NISP' ? '#003366' : '#dee2e6',
                                                    }}
                                                >
                                                    OCBC NISP
                                                </Button>
                                            </div>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label className="small">Customer Account Number</Form.Label>
                                            <Form.Control type="text" placeholder="88-08543-6982" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} className="border" />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label className="small">Customer Account Name</Form.Label>
                                            <Form.Control type="text" placeholder="Mr. Jamal" name="accountName" value={formData.accountName} onChange={handleInputChange} className="border" />
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
                                            <Form.Control type="text" placeholder="e.g. lunch at afohs club." name="notes" value={formData.notes} onChange={handleInputChange} className="border" />
                                        </Form.Group>
                                    </>
                                )}

                                <div className="d-flex justify-content-end mt-4">
                                    <Button variant="light" className="me-2 d-flex align-items-center border" onClick={handleBack}>
                                        <ArrowBack fontSize="small" className="me-1" />
                                        Back
                                    </Button>
                                    <Button style={{ backgroundColor: '#003366', borderColor: '#003366' }} className="d-flex align-items-center" onClick={handlePayNow} loading={loading} disabled={loading} loadingPosition="start">
                                        Pay Now
                                        <KeyboardArrowRight fontSize="small" className="ms-1" />
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </Box>
            </div>
        </>
    );
};
export default RoomBooking;
