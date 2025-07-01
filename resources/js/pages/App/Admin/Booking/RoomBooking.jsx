import React, { useState } from 'react';
import { Container, Button, Form, InputGroup, Modal, Card, Row, Col } from 'react-bootstrap';
import { Stepper, Step, StepLabel, Box, Typography, Grid, TextField, Radio, RadioGroup, FormControlLabel, FormLabel, Checkbox, InputLabel, IconButton } from '@mui/material';
import { ArrowBack, CheckCircle, Add, Remove, Print, CreditCard, EventNote, AccountBalance, KeyboardArrowRight, Check } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import AsyncSearchTextField from '@/components/AsyncSearchTextField';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const steps = ['Booking Details', 'Room Selection', 'Charges', 'Upload'];

const RoomBooking = ({ booking, invoice, bookingNo }) => {
    // Access query parameters
    const { props } = usePage();
    const urlParams = new URLSearchParams(window.location.search);
    const urlParamsObject = Object.fromEntries([...urlParams.entries()].map(([key, value]) => [key, value]));
    const initialBookingType = urlParamsObject?.type === 'event' ? 'events' : 'room';

    // Main state for booking type
    const [open, setOpen] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        bookingNo: bookingNo || '',
        bookingDate: new Date().toISOString().split('T')[0],
        checkInDate: urlParamsObject?.checkin || '',
        checkOutDate: urlParamsObject?.checkout || '',
        bookingType: 'Member',
        guestName: '',
        room: '',
        bookingCategory: '',
        perDayCharge: '',
        nights: '',
        roomCharge: '',
        bookedBy: '',
        guestFirstName: '',
        guestLastName: '',
        company: '',
        address: '',
        country: '',
        city: '',
        mobile: '',
        email: '',
        cnic: '',
        accompaniedGuest: '',
        discount: '',
        documents: [],
        previewFiles: [],
        notes: '',
    });

    const handleNext = () => setActiveStep((prev) => prev + 1);
    const handleBack = () => setActiveStep((prev) => prev - 1);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData((prev) => ({
            ...prev,
            documents: files,
            previewFiles: files,
        }));
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return <BookingDetails formData={formData} handleChange={handleChange} />;
            case 1:
                return <RoomSelection formData={formData} handleChange={handleChange} />;
            case 2:
                return <ChargesInfo formData={formData} handleChange={handleChange} />;
            case 3:
                return <UploadInfo formData={formData} handleChange={handleChange} handleFileChange={handleFileChange} />;
            default:
                return <Typography>Step not implemented yet</Typography>;
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
                    <IconButton style={{ color: '#063455' }} onClick={() => router.visit('/booking/dashboard')}>
                        <ArrowBack />
                    </IconButton>
                    <h2 className="mb-0 fw-normal" style={{ color: '#063455', fontSize: '30px' }}>
                        Room Booking
                    </h2>
                </Box>

                <Box
                    sx={{
                        margin: '0 auto',
                        bgcolor: '#FFFFFF',
                        borderRadius: '4px',
                        marginTop: 5,
                    }}
                >
                    <Box sx={{ px: 4 }}>
                        <Stepper
                            activeStep={activeStep}
                            sx={{
                                '& .MuiStepIcon-root.Mui-active': {
                                    color: '#063455',
                                },
                                '& .MuiStepIcon-root.Mui-completed': {
                                    color: 'gray',
                                },
                            }}
                        >
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Box>
                    {/* Main Content */}
                    <div className="mx-4 my-4 p-4 bg-white rounded border">
                        <Box sx={{ width: '100%', p: 0 }}>
                            <Box sx={{ mb: 4 }}>{renderStepContent(activeStep)}</Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Button variant="contained" disabled={activeStep === 0} onClick={handleBack}>
                                    Back
                                </Button>
                                <Button style={{ backgroundColor: '#063455', color: '#fff' }} onClick={handleNext}>
                                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                                </Button>
                            </Box>
                        </Box>
                    </div>
                </Box>
            </div>
        </>
    );
};
export default RoomBooking;

const BookingDetails = ({ formData, handleChange }) => (
    <>
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                <TextField label="Booking No." name="bookingNo" value={formData.bookingNo} inputProps={{ readOnly: true }} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField label="Booking Date" name="bookingDate" type="date" value={formData.bookingDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={6}>
                <TextField label="Check-In Date" name="checkInDate" type="date" value={formData.checkInDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={6}>
                <TextField label="Check-Out Date" name="checkOutDate" type="date" value={formData.checkOutDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
                <FormLabel>Booking Type</FormLabel>
                <RadioGroup row name="bookingType" value={formData.bookingType} onChange={handleChange}>
                    <FormControlLabel value="Member" control={<Radio />} label="Member" />
                    <FormControlLabel value="Corporate Member" control={<Radio />} label="Corporate Member" />
                    <FormControlLabel value="Applied Member" control={<Radio />} label="Applied Member" />
                    <FormControlLabel value="Affiliated Member" control={<Radio />} label="Affiliated Member" />
                    <FormControlLabel value="VIP Guest" control={<Radio />} label="VIP Guest" />
                </RadioGroup>
            </Grid>
            <Grid item xs={12}>
                <AsyncSearchTextField label="Search by Name, Membership No, or Email" name="guest" value={formData.guest} onChange={handleChange} endpoint="/admin/api/search-users" placeholder="Search members..." />

                {/* <TextField label="Member / Guest Name" name="guestName" value={formData.guestName} onChange={handleChange} fullWidth /> */}
            </Grid>
        </Grid>
        <Typography sx={{ my: 3 }} variant="h6">
            Guest Info
        </Typography>
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                <TextField label="Booked By" name="bookedBy" value={formData.bookedBy} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={6} sm={3}>
                <TextField label="Guest First Name" name="guestFirstName" value={formData.guestFirstName} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={6} sm={3}>
                <TextField label="Guest Last Name" name="guestLastName" value={formData.guestLastName} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12}>
                <TextField label="Company / Institution" name="company" value={formData.company} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12}>
                <TextField label="Address" name="address" value={formData.address} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={6}>
                <TextField label="Country" name="country" value={formData.country} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={6}>
                <TextField label="City" name="city" value={formData.city} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={6}>
                <TextField label="Mobile" name="mobile" value={formData.mobile} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={6}>
                <TextField label="Email" name="email" value={formData.email} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={6}>
                <TextField label="CNIC / Passport No." name="cnic" value={formData.cnic} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={6}>
                <TextField label="Accompanied Guest Name" name="accompaniedGuest" value={formData.accompaniedGuest} onChange={handleChange} fullWidth />
            </Grid>
        </Grid>
    </>
);

const RoomSelection = ({ formData, handleChange }) => {
    const handleCalculation = (e) => {
        handleChange(e);
        const { name, value } = e.target;
        let nights = name === 'nights' ? value : formData.nights;
        let rate = name === 'perDayCharge' ? value : formData.perDayCharge;

        const total = nights && rate ? parseInt(nights) * parseInt(rate) : '';
        handleChange({ target: { name: 'roomCharge', value: total } });
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <TextField label="Room" name="room" value={formData.room} onChange={handleChange} fullWidth select SelectProps={{ native: true }}>
                    <option value="">Select a Room</option>
                    <option value="101">Room 101</option>
                    <option value="102">Room 102</option>
                    <option value="103">Room 103</option>
                </TextField>
            </Grid>
            <Grid item xs={12}>
                <TextField label="Booking Category" name="bookingCategory" value={formData.bookingCategory} onChange={handleChange} fullWidth select SelectProps={{ native: true }}>
                    <option value="">Select Category</option>
                    <option value="Armed Forces Member">Armed Forces Member</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Guest">Guest</option>
                </TextField>
            </Grid>
            <Grid item xs={4}>
                <TextField label="Per Day Room Charges" name="perDayCharge" value={formData.perDayCharge} onChange={handleCalculation} fullWidth type="number" />
            </Grid>
            <Grid item xs={4}>
                <TextField label="No. of Nights" name="nights" value={formData.nights} onChange={handleCalculation} fullWidth type="number" />
            </Grid>
            <Grid item xs={4}>
                <TextField label="Room Charges" name="roomCharge" value={formData.roomCharge} fullWidth disabled />
            </Grid>
        </Grid>
    );
};

const ChargesInfo = ({ formData, handleChange }) => {
    const [otherChargesList, setOtherChargesList] = useState([{ type: '', details: '', amount: '', isComplementary: false }]);

    const [miniBarItems, setMiniBarItems] = useState([{ item: '', amount: '', qty: '', total: '' }]);

    const calculateTotalMiniBar = () => {
        return miniBarItems.reduce((acc, item) => acc + (parseFloat(item.total) || 0), 0);
    };

    const handleOtherChange = (index, field, value) => {
        const updated = [...otherChargesList];
        updated[index][field] = field === 'isComplementary' ? value : value;
        setOtherChargesList(updated);
    };

    const handleMiniBarChange = (index, field, value) => {
        const updated = [...miniBarItems];
        updated[index][field] = value;
        if (field === 'amount' || field === 'qty') {
            const qty = parseInt(updated[index].qty) || 0;
            const amt = parseFloat(updated[index].amount) || 0;
            updated[index].total = (qty * amt).toFixed(2);
        }
        setMiniBarItems(updated);
    };

    const totalOtherCharges = otherChargesList.reduce((sum, chg) => sum + (chg.isComplementary ? 0 : parseFloat(chg.amount) || 0), 0);
    const totalMiniBar = calculateTotalMiniBar();
    const room = parseFloat(formData.roomCharge || 0);
    const discount = parseFloat(formData.discount || 0);
    const grand = room + totalOtherCharges + totalMiniBar - discount;

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h6">Other Charges</Typography>
            </Grid>
            {otherChargesList.map((item, index) => (
                <React.Fragment key={index}>
                    <Grid item xs={3}>
                        <TextField label="Charges Type" fullWidth value={item.type} onChange={(e) => handleOtherChange(index, 'type', e.target.value)} />
                    </Grid>
                    <Grid item xs={3}>
                        <TextField label="Bill Details" fullWidth value={item.details} onChange={(e) => handleOtherChange(index, 'details', e.target.value)} />
                    </Grid>
                    <Grid item xs={2}>
                        <TextField label="Amount" type="number" fullWidth value={item.amount} onChange={(e) => handleOtherChange(index, 'amount', e.target.value)} />
                    </Grid>
                    <Grid item xs={2}>
                        <FormControlLabel control={<Checkbox checked={item.isComplementary} onChange={(e) => handleOtherChange(index, 'isComplementary', e.target.checked)} />} label="Complementary" />
                    </Grid>
                </React.Fragment>
            ))}
            <Grid item xs={12}>
                <Button onClick={() => setOtherChargesList([...otherChargesList, { type: '', details: '', amount: '', isComplementary: false }])}>Add More</Button>
            </Grid>

            <Grid item xs={12}>
                <Typography variant="h6">Mini Bar</Typography>
            </Grid>
            {miniBarItems.map((item, index) => (
                <React.Fragment key={index}>
                    <Grid item xs={3}>
                        <TextField label="Item" fullWidth value={item.item} onChange={(e) => handleMiniBarChange(index, 'item', e.target.value)} />
                    </Grid>
                    <Grid item xs={2}>
                        <TextField label="Amount" type="number" fullWidth value={item.amount} onChange={(e) => handleMiniBarChange(index, 'amount', e.target.value)} />
                    </Grid>
                    <Grid item xs={2}>
                        <TextField label="Qty" type="number" fullWidth value={item.qty} onChange={(e) => handleMiniBarChange(index, 'qty', e.target.value)} />
                    </Grid>
                    <Grid item xs={2}>
                        <TextField label="Total" fullWidth disabled value={item.total} />
                    </Grid>
                </React.Fragment>
            ))}
            <Grid item xs={12}>
                <Button onClick={() => setMiniBarItems([...miniBarItems, { item: '', amount: '', qty: '', total: '' }])}>Add More</Button>
            </Grid>

            <Grid item xs={3}>
                <TextField label="Total Other Charges" value={totalOtherCharges} fullWidth disabled />
            </Grid>
            <Grid item xs={3}>
                <TextField label="Total Mini Bar Charges" value={totalMiniBar} fullWidth disabled />
            </Grid>
            <Grid item xs={3}>
                <TextField label="Discount" type="number" name="discount" value={formData.discount} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={3}>
                <TextField label="Grand Total" value={grand} fullWidth disabled />
            </Grid>
        </Grid>
    );
};

const UploadInfo = ({ formData, handleChange, handleFileChange }) => (
    <Grid container spacing={2}>
        <Grid item xs={12}>
            <InputLabel>Upload Documents (PDF or Images)</InputLabel>
            <input type="file" multiple accept=".pdf,image/*" name="documents" onChange={handleFileChange} style={{ marginTop: 8 }} />
        </Grid>

        <Grid item xs={12}>
            <Grid container spacing={2}>
                {[...(formData.previewFiles || [])].map((file, idx) => (
                    <Grid item key={idx}>
                        {file.type.startsWith('image/') ? (
                            <img src={URL.createObjectURL(file)} alt="preview" width={100} />
                        ) : file.type === 'application/pdf' ? (
                            <Box sx={{ border: '1px solid gray', p: 1, width: 100, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="caption">
                                    PDF
                                    <br />
                                    {file.name}
                                </Typography>
                            </Box>
                        ) : null}
                    </Grid>
                ))}
            </Grid>
        </Grid>

        <Grid item xs={12}>
            <TextField label="Additional Notes" name="notes" value={formData.notes || ''} onChange={handleChange} multiline rows={4} fullWidth />
        </Grid>
        <Grid item xs={12} sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" color="primary">
                Save
            </Button>
            <Button variant="contained" color="success">
                Save & Print
            </Button>
            <Button variant="outlined" color="error">
                Cancel
            </Button>
        </Grid>
    </Grid>
);
