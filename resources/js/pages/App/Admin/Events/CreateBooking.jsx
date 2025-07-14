import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { Stepper, Step, StepLabel, Box, Typography, Grid, TextField, Radio, RadioGroup, FormControlLabel, FormLabel, Checkbox, InputLabel, IconButton, Select, MenuItem, FormControl } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router, usePage } from '@inertiajs/react';
import AsyncSearchTextField from '@/components/AsyncSearchTextField';
import { differenceInCalendarDays } from 'date-fns';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { objectToFormData } from '@/helpers/objectToFormData';
import { enqueueSnackbar } from 'notistack';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const steps = ['Booking Details', 'Charges', 'Upload'];

const EventBooking = ({ bookingNo }) => {
    // Main state for booking type
    const [open, setOpen] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        bookingNo: bookingNo || '',
        bookingDate: new Date().toISOString().split('T')[0],
        bookingType: 0,
        persons: 0,
        guest: '',
        familyMember: '',
        perDayCharge: '',
        nights: '',
        roomCharge: '',
        bookedBy: '',
        natureOfEvent: '',
        eventDate: '',
        eventTimeFrom: '',
        eventTimeTo: '',
        discountType: 'fixed',
        discount: '',
        totalOtherCharges: '',
        totalMiniBar: '',
        grandTotal: '',
        mini_bar_items: [{ item: '', amount: '', qty: '', total: '' }],
        other_charges: [{ type: '', details: '', amount: '', is_complementary: false }],
        documents: [],
        previewFiles: [],
        notes: '',
    });

    const handleNext = () => {
        const newErrors = {};

        // Step 0: Booking Details
        if (activeStep === 0) {
            if (!formData.guest || Object.keys(formData.guest).length === 0) {
                newErrors.guest = 'Member is required';
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => setActiveStep((prev) => prev - 1);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData((prev) => ({
            ...prev,
            documents: [...(prev.documents || []), ...files],
            previewFiles: [...(prev.previewFiles || []), ...files],
        }));
    };

    const handleFileRemove = (index) => {
        setFormData((prev) => {
            const updatedFiles = [...(prev.previewFiles || [])];
            updatedFiles.splice(index, 1);
            return {
                ...prev,
                previewFiles: updatedFiles,
                documents: updatedFiles,
            };
        });
    };

    const handleSubmit = () => {
        const newErrors = {};

        // Final validation before submission
        if (!formData.guest || Object.keys(formData.guest).length === 0) {
            newErrors.guest = 'Member is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Proceed with actual submission
        const payload = objectToFormData(formData);

        setIsSubmitting(true);
        axios
            .post(route('rooms.booking.store'), payload)
            .then((res) => {
                enqueueSnackbar('Booking submitted successfully', { variant: 'success' });
                // Redirect or show success
                router.visit(route('booking.payment', { invoice_no: res.data.invoice_id }));
            })
            .catch((err) => {
                console.error('Submit error:', err);
                // Optionally show backend validation errors
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return <BookingDetails formData={formData} handleChange={handleChange} errors={errors} />;
            case 1:
                return <ChargesInfo formData={formData} handleChange={handleChange} />;
            case 2:
                return <UploadInfo formData={formData} handleChange={handleChange} handleFileChange={handleFileChange} handleFileRemove={handleFileRemove} />;
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
                        Event Booking
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
                                <Button variant="outlined" disabled={activeStep === 0} onClick={handleBack}>
                                    Back
                                </Button>
                                <Button style={{ backgroundColor: '#063455', color: '#fff' }} onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}>
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
export default EventBooking;

const BookingDetails = ({ formData, handleChange, errors }) => {
    const { props } = usePage();

    const [familyMembers, setFamilyMembers] = useState([]);
    useEffect(() => {
        if (formData.guest) {
            if (formData.guest.booking_type === 'member') {
                setFamilyMembers([]);
                return;
            }
            axios
                .get(route('admin.family-members', { id: formData.guest?.id }))
                .then((res) => {
                    setFamilyMembers(res.data.results);
                })
                .catch((err) => {
                    setFamilyMembers([]);
                });
        }
    }, [formData.guest]);

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField label="Booking No." name="bookingNo" value={formData.bookingNo} inputProps={{ readOnly: true }} fullWidth />
                </Grid>
                {JSON.stringify()}
                <Grid item xs={12} sm={6}>
                    <TextField label="Booking Date" name="bookingDate" type="date" value={formData.bookingDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12}>
                    <FormLabel>Booking Type</FormLabel>
                    <RadioGroup row name="bookingType" value={formData.bookingType} onChange={handleChange}>
                        <FormControlLabel value="0" control={<Radio />} label="Member" />
                        <FormControlLabel value="1" control={<Radio />} label="Guest / Non-Member" />
                    </RadioGroup>
                </Grid>

                <Grid item xs={12}>
                    <AsyncSearchTextField label="Member / Guest Name" name="guest" value={formData.guest} onChange={handleChange} endpoint="/admin/api/search-users" params={{ type: formData.bookingType }} placeholder="Search members..." />

                    {errors.guest && (
                        <Typography variant="body2" color="error">
                            {errors.guest}
                        </Typography>
                    )}

                    {formData.guest && (
                        <Box sx={{ mt: 1, p: 1, border: '1px solid #ccc', borderRadius: 1 }}>
                            <Typography variant="h5" sx={{ mb: 1 }}>
                                Member Information
                            </Typography>
                            <Typography variant="body1">{formData.guest?.booking_type == 'member' ? `Member # ${formData.guest?.membership_no}` : `Guest # ${formData.guest?.customer_no}`}</Typography>
                            <Typography variant="body1">Email: {formData.guest?.email}</Typography>
                            <Typography variant="body1">Phone: {formData.guest?.phone}</Typography>
                            <Typography variant="body1">Cnic / Passport: {formData.guest?.cnic}</Typography>
                            <Typography variant="body1">Address: {formData.guest?.address}</Typography>
                            {formData.guest?.booking_type == 'member' ? (
                                <FormControl fullWidth sx={{ mt: 2 }}>
                                    <InputLabel>Select Family Member</InputLabel>
                                    <Select value={formData.familyMember} onChange={handleChange} name="familyMember" label="Select Family Member">
                                        <MenuItem value="">Select Family Member</MenuItem>
                                        {familyMembers?.map((member) => (
                                            <MenuItem key={member.id} value={member.id}>
                                                {member.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            ) : (
                                ''
                            )}
                        </Box>
                    )}
                </Grid>
            </Grid>
            <Typography sx={{ my: 3 }} variant="h6">
                Event Details
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField label="Booked By*" name="bookedBy" value={formData.bookedBy} onChange={handleChange} fullWidth />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <TextField label="Nature of Event*" name="guestFirstName" value={formData.guestFirstName} onChange={handleChange} fullWidth />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <TextField label="Event Date*" type="date" name="guestLastName" value={formData.guestLastName} onChange={handleChange} fullWidth />
                </Grid>
                <Grid item xs={6}>
                    <TextField label="Timing (From)*" type="time" name="company" value={formData.company} onChange={handleChange} fullWidth />
                </Grid>
                <Grid item xs={6}>
                    <TextField label="Timing (To)*" type="time" name="address" value={formData.address} onChange={handleChange} fullWidth />
                </Grid>
                <Grid item xs={12}>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Venue*</InputLabel>
                        <Select value={formData.venue} onChange={handleChange} name="venue" label="Venue*">
                            <MenuItem value="">Choose Venue</MenuItem>
                            {props.eventVenues?.map((venue) => (
                                <MenuItem key={venue.id} value={venue.id}>
                                    {venue.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
        </>
    );
};

const ChargesInfo = ({ formData, handleChange }) => {
    const { props } = usePage();

    const handleOtherChange = (index, field, value) => {
        const updated = [...formData.other_charges];
        const item = { ...updated[index] };

        if (field === 'type') {
            const selected = props.chargesTypeItems.find((c) => c.name === value);
            item.type = value;
            item.amount = selected ? selected.amount : '';
        } else {
            item[field] = value;
        }

        updated[index] = item;
        handleChange({ target: { name: 'other_charges', value: updated } });
    };

    const calculateTotals = () => {
        const totalOther = formData.other_charges.reduce((sum, chg) => sum + (chg.is_complementary ? 0 : parseFloat(chg.amount) || 0), 0);

        const discountVal = parseFloat(formData.discount || 0);
        const discountType = formData.discountType || 'fixed';

        const baseTotal = totalOther;
        const discountAmount = discountType === 'percentage' ? (discountVal / 100) * baseTotal : discountVal;

        const grandTotal = baseTotal - discountAmount;

        return { totalOther, grandTotal };
    };

    useEffect(() => {
        const { totalOther, grandTotal } = calculateTotals();

        handleChange({ target: { name: 'totalOtherCharges', value: totalOther } });
        handleChange({ target: { name: 'grandTotal', value: grandTotal.toFixed(2) } });
    }, [formData.other_charges, formData.discount, formData.discountType]);

    const { totalOther, totalMini, grandTotal } = calculateTotals();

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h6">Other Charges</Typography>
            </Grid>

            {formData.other_charges.map((item, index) => (
                <React.Fragment key={index}>
                    <Grid item xs={3}>
                        <FormControl fullWidth>
                            <InputLabel>Charges Type</InputLabel>
                            <Select value={item.type} label="Charges Type" onChange={(e) => handleOtherChange(index, 'type', e.target.value)}>
                                <MenuItem value="">Select Type</MenuItem>
                                {props.chargesTypeItems.map((type, i) => (
                                    <MenuItem key={i} value={type.name}>
                                        {type.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={3}>
                        <TextField label="Bill Details" fullWidth value={item.details} onChange={(e) => handleOtherChange(index, 'details', e.target.value)} />
                    </Grid>
                    <Grid item xs={2}>
                        <TextField label="Amount" type="number" fullWidth value={item.amount} onChange={(e) => handleOtherChange(index, 'amount', e.target.value)} />
                    </Grid>
                    <Grid item xs={2}>
                        <FormControlLabel control={<Checkbox checked={item.is_complementary} onChange={(e) => handleOtherChange(index, 'is_complementary', e.target.checked)} />} label="Complementary" />
                    </Grid>
                </React.Fragment>
            ))}
            <Grid item xs={12}>
                <Button style={{ backgroundColor: '#063455', color: '#fff' }} variant="contained" onClick={() => handleChange({ target: { name: 'other_charges', value: [...formData.other_charges, { type: '', details: '', amount: '', is_complementary: false }] } })}>
                    Add More
                </Button>
            </Grid>

            {/* Summary Fields */}
            <Grid item xs={2}>
                <TextField label="Total Other Charges" value={totalOther} fullWidth disabled />
            </Grid>
            <Grid item xs={2}>
                <FormControl fullWidth>
                    <InputLabel>Discount Type</InputLabel>
                    <Select value={formData.discountType || 'fixed'} onChange={(e) => handleChange({ target: { name: 'discountType', value: e.target.value } })}>
                        <MenuItem value="fixed">Fixed</MenuItem>
                        <MenuItem value="percentage">Percentage</MenuItem>
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={2}>
                <TextField label="Discount" type="number" name="discount" value={formData.discount} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={2}>
                <TextField label="Grand Total" value={grandTotal.toFixed(2)} fullWidth disabled />
            </Grid>
        </Grid>
    );
};

const UploadInfo = ({ formData, handleChange, handleFileChange, handleFileRemove }) => (
    <Grid container spacing={2}>
        <Grid item xs={12}>
            <InputLabel>Upload Documents (PDF or Images)</InputLabel>
            <input type="file" multiple accept=".pdf,image/*" name="documents" onChange={handleFileChange} style={{ marginTop: 8 }} />
        </Grid>

        <Grid item xs={12}>
            <Grid container spacing={1}>
                {[...(formData.previewFiles || [])].map((file, idx) => (
                    <Grid item key={idx}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                border: '1px solid #ccc',
                                borderRadius: 1,
                                px: 1,
                                py: 0.5,
                                backgroundColor: '#f9f9f9',
                            }}
                        >
                            <Typography variant="body2" sx={{ mr: 1 }}>
                                {file.name}
                            </Typography>
                            <IconButton size="small" onClick={() => handleFileRemove(idx)}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Grid>

        <Grid item xs={12}>
            <TextField label="Additional Notes" name="notes" value={formData.notes || ''} onChange={handleChange} multiline rows={4} fullWidth />
        </Grid>
    </Grid>
);
