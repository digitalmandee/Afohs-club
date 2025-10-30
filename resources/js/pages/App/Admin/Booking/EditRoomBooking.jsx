import React, { useEffect, useState, useRef } from 'react';
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

const steps = ['Booking Details', 'Room Selection', 'Charges', 'Upload'];

const EditRoomBooking = ({ booking, room, bookingNo, roomCategories }) => {
    // Access query parameters
    const { url } = usePage();
    const urlParams = new URLSearchParams(url.split('?')[1] || '');
    const isCheckout = urlParams.get('type') === 'checkout';
    // Main state for booking type
    const [open, setOpen] = useState(true);
    const [activeStep, setActiveStep] = useState(0);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        bookingNo: booking.bookingNo,
        bookingDate: booking.bookingDate,
        checkInDate: booking.checkInDate,
        checkInTime: booking.checkInTime,
        checkOutDate: booking.checkOutDate,
        checkOutTime: booking.checkOutTime,
        arrivalDetails: booking.arrivalDetails,
        departureDetails: booking.departureDetails,
        bookingType: booking.bookingType,
        guest: booking.guest, // contains id, name, etc.
        guestFirstName: booking.guestFirstName,
        guestLastName: booking.guestLastName,
        company: booking.company,
        address: booking.address,
        country: booking.country,
        city: booking.city,
        mobile: booking.mobile,
        email: booking.email,
        cnic: booking.cnic,
        accompaniedGuest: booking.accompaniedGuest,
        guestRelation: booking.guestRelation,
        bookedBy: booking.bookedBy,
        room: booking.room, // contains id (and optionally label)
        persons: booking.persons,
        bookingCategory: booking.bookingCategory,
        nights: booking.nights,
        perDayCharge: booking.perDayCharge,
        roomCharge: booking.roomCharge,
        securityDeposit: booking.securityDeposit,
        discountType: booking.discountType,
        discount: booking.discount,
        totalOtherCharges: booking.totalOtherCharges,
        totalMiniBar: booking.totalMiniBar,
        grandTotal: booking.grandTotal,
        notes: booking.notes,
        documents: booking.documents ?? [],
        previewFiles: booking.documents ?? [],
        mini_bar_items: booking.mini_bar_items ?? [],
        other_charges: booking.other_charges ?? [],
    });

    const handleNext = () => {
        const newErrors = {};

        // Step 0: Booking Details
        if (activeStep === 0) {
            if (!formData.guest || Object.keys(formData.guest).length === 0) {
                newErrors.guest = 'Member is required';
            }
        }

        // Step 1: Room Selection
        if (activeStep === 1) {
            if (!formData.bookingCategory) {
                newErrors.bookingCategory = 'Booking category is required';
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

        if (!formData.bookingCategory) {
            newErrors.bookingCategory = 'Booking category is required';
        }

        // Add more validations as needed for other fields...

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const newData = {
            ...formData,
            statusType: isCheckout ? 'checked_out' : '',
        };

        // Proceed with actual submission
        const payload = objectToFormData(newData);

        setIsSubmitting(true);
        axios
            .post(route('rooms.update.booking', { id: booking.id }), payload)
            .then((res) => {
                enqueueSnackbar('Booking Updated successfully', { variant: 'success' });
                // Redirect or show success
                if (isCheckout && res.data.invoice.status === 'unpaid') {
                    router.visit(route('booking.payment', { invoice_no: res.data.invoice.id }));
                } else {
                    router.visit(route('rooms.dashboard'));
                }
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
                return <BookingDetails formData={formData} handleChange={handleChange} isCheckout={isCheckout} errors={errors} />;
            case 1:
                return <RoomSelection formData={formData} handleChange={handleChange} isCheckout={isCheckout} errors={errors} />;
            case 2:
                return <ChargesInfo formData={formData} handleChange={handleChange} isCheckout={isCheckout} />;
            case 3:
                return <UploadInfo formData={formData} handleChange={handleChange} handleFileChange={handleFileChange} handleFileRemove={handleFileRemove} isCheckout={isCheckout} />;
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
                    <IconButton style={{ color: '#063455' }} onClick={() => router.visit(route('rooms.dashboard'))}>
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
                                <Button variant="outlined" disabled={activeStep === 0} onClick={handleBack}>
                                    Back
                                </Button>
                                <Button style={{ backgroundColor: '#063455', color: '#fff' }} onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext} disabled={isSubmitting} loading={isSubmitting} loadingPosition='start'>
                                    {activeStep === steps.length - 1 ? (isCheckout ? 'Checkout' : 'Finish') : 'Next'}
                                </Button>
                            </Box>
                        </Box>
                    </div>
                </Box>
            </div>
        </>
    );
};
export default EditRoomBooking;

const BookingDetails = ({ formData, handleChange, errors, isCheckout }) => {
    const [familyMembers, setFamilyMembers] = useState([]);
    useEffect(() => {
        if (formData.guest) {
            console.log(formData.guest);
            
            axios.get(route('admin.family-members', { id: formData.guest?.id })).then((res) => {
                setFamilyMembers(res.data.results);
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
                    <TextField label="Booking Date" name="bookingDate" type="date" value={formData.bookingDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} readOnly />
                </Grid>
                <Grid item xs={6}>
                    <TextField label="Check-In Date" name="checkInDate" type="date" value={formData.checkInDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
                </Grid>
                {isCheckout && (
                    <Grid item xs={6}>
                        <TextField label="Check-In Time" name="checkInTime" type="time" value={formData.checkInTime} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
                    </Grid>
                )}
                <Grid item xs={6}>
                    <TextField label="Check-Out Date" name="checkOutDate" type="date" value={formData.checkOutDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
                </Grid>
                {isCheckout && (
                    <Grid item xs={6}>
                        <TextField label="Check-Out Time" name="checkOutTime" type="time" value={formData.checkOutTime} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
                    </Grid>
                )}
                <Grid item xs={6}>
                    <TextField label="Arrival Details" name="arrivalDetails" value={formData.arrivalDetails} onChange={handleChange} fullWidth multiline rows={2} />
                </Grid>
                <Grid item xs={6}>
                    <TextField label="Departure Details" name="departureDetails" value={formData.departureDetails} onChange={handleChange} fullWidth multiline rows={2} />
                </Grid>
                <Grid item xs={12}>
                    <FormLabel>Booking Type</FormLabel>
                    <RadioGroup row name="bookingType" value={formData.bookingType} onChange={handleChange}>
                        <FormControlLabel value="Member" control={<Radio />} label="Member" disabled />
                        <FormControlLabel value="Corporate Member" control={<Radio />} label="Corporate Member" disabled />
                        <FormControlLabel value="Applied Member" control={<Radio />} label="Applied Member" disabled />
                        <FormControlLabel value="Affiliated Member" control={<Radio />} label="Affiliated Member" disabled />
                        <FormControlLabel value="VIP Guest" control={<Radio />} label="VIP Guest" disabled />
                    </RadioGroup>
                </Grid>

                <Grid item xs={12}>
                    <AsyncSearchTextField label="Member / Guest Name" name="guest" value={formData.guest} onChange={handleChange} endpoint="admin.api.search-users" placeholder="Search members..." disabled={true} />
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
                            <Typography variant="body1">Member #: {formData.guest?.membership_no}</Typography>
                            <Typography variant="body1">Email: {formData.guest?.email}</Typography>
                            <Typography variant="body1">Phone: {formData.guest?.phone}</Typography>
                            <Typography variant="body1">Address: {formData.guest?.address}</Typography>
                            <FormControl fullWidth sx={{ mt: 2 }}>
                                <InputLabel>Select Family Member</InputLabel>
                                <Select value={formData.familyMember} onChange={handleChange} name="familyMember" label="Select Family Member" disabled>
                                    <MenuItem value="">Select Family Member</MenuItem>
                                    {familyMembers?.map((member) => (
                                        <MenuItem key={member.id} value={member.id}>
                                            {member.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    )}
                </Grid>
            </Grid>
            <Typography sx={{ my: 3 }} variant="h6">
                Guest Info
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField label="Booked By" name="bookedBy" value={formData.bookedBy} onChange={handleChange} fullWidth disabled={isCheckout} />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <TextField label="Guest First Name" name="guestFirstName" value={formData.guestFirstName} onChange={handleChange} fullWidth disabled={isCheckout} />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <TextField label="Guest Last Name" name="guestLastName" value={formData.guestLastName} onChange={handleChange} fullWidth disabled={isCheckout} />
                </Grid>
                <Grid item xs={6}>
                    <TextField label="Company / Institution" name="company" value={formData.company} onChange={handleChange} fullWidth disabled={isCheckout} />
                </Grid>
                <Grid item xs={6}>
                    <TextField label="Address" name="address" value={formData.address} onChange={handleChange} fullWidth disabled={isCheckout} />
                </Grid>
                <Grid item xs={6}>
                    <TextField label="Country" name="country" value={formData.country} onChange={handleChange} fullWidth disabled={isCheckout} />
                </Grid>
                <Grid item xs={6}>
                    <TextField label="City" name="city" value={formData.city} onChange={handleChange} fullWidth disabled={isCheckout} />
                </Grid>
                <Grid item xs={6}>
                    <TextField label="Mobile" name="mobile" value={formData.mobile} onChange={handleChange} fullWidth disabled={isCheckout} />
                </Grid>
                <Grid item xs={6}>
                    <TextField label="Email" name="email" value={formData.email} onChange={handleChange} fullWidth disabled={isCheckout} />
                </Grid>
                <Grid item xs={6}>
                    <TextField label="CNIC / Passport No." name="cnic" value={formData.cnic} onChange={handleChange} fullWidth disabled={isCheckout} />
                </Grid>
                <Grid item xs={6}>
                    <TextField label="Enter Relationship" name="guestRelation" value={formData.guestRelation} onChange={handleChange} fullWidth disabled={isCheckout} />
                </Grid>
                <Grid item xs={12}>
                    <TextField label="Accompanied Guest Name" name="accompaniedGuest" value={formData.accompaniedGuest} onChange={handleChange} fullWidth disabled={isCheckout} />
                </Grid>
            </Grid>
        </>
    );
};

const RoomSelection = ({ formData, handleChange, errors, isCheckout }) => {
    const { props } = usePage();

    // Automatically calculate nights between check-in and check-out
    const nights = formData.checkInDate && formData.checkOutDate ? differenceInCalendarDays(new Date(formData.checkOutDate), new Date(formData.checkInDate)) : 0;

    // Find charge by selected booking category
    const selectedCategory = props.roomCategories.find((cat) => cat.id == formData.bookingCategory);
    const matchedCharge = formData.room.category_charges.find((charge) => charge.room_category_id == formData.bookingCategory);

    const perDayCharge = matchedCharge?.amount || 0;
    const totalCharge = nights * perDayCharge;

    // Sync calculated values into parent form state
    useEffect(() => {
        handleChange({ target: { name: 'nights', value: nights } });
        handleChange({ target: { name: 'perDayCharge', value: perDayCharge } });
        handleChange({ target: { name: 'roomCharge', value: totalCharge } });
    }, [formData.bookingCategory, formData.checkInDate, formData.checkOutDate]);

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h6">
                    <b>Selected Room:</b> {formData.room?.name} ({formData.room?.room_type?.name})
                </Typography>
            </Grid>

            <Grid item xs={12}>
                <FormControl fullWidth>
                    <InputLabel>Booking Category</InputLabel>
                    <Select value={formData.bookingCategory} onChange={handleChange} name="bookingCategory" label="Booking Category" disabled={isCheckout}>
                        <MenuItem value="">Booking Category</MenuItem>
                        {props.roomCategories.map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                                {item.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {errors.bookingCategory && (
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                        {errors.bookingCategory}
                    </Typography>
                )}
            </Grid>

            <Grid item xs={4}>
                <TextField label="Per Day Room Charges" name="perDayCharge" value={formData.perDayCharge} fullWidth InputProps={{ readOnly: true }} disabled />
            </Grid>
            <Grid item xs={4}>
                <TextField label="No. of Nights" name="nights" value={formData.nights} fullWidth InputProps={{ readOnly: true }} disabled />
            </Grid>
            <Grid item xs={4}>
                <TextField label="Room Charges" name="roomCharge" value={formData.roomCharge} fullWidth InputProps={{ readOnly: true }} disabled />
            </Grid>
            <Grid item xs={12}>
                <TextField type="number" label="Security Deposit" placeholder="Enter Amount of Security (if deposited)" name="securityDeposit" value={formData.securityDeposit} onChange={handleChange} fullWidth disabled={isCheckout} />
            </Grid>
        </Grid>
    );
};

const ChargesInfo = ({ formData, handleChange, isCheckout }) => {
    const { props } = usePage();

    const [miniBarItems, setMiniBarItems] = useState();

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

    const handleMiniBarChange = (index, field, value) => {
        const updated = [...formData.mini_bar_items];
        const item = { ...updated[index] };

        if (field === 'item') {
            const selected = props.miniBarItems.find((m) => m.name === value);
            item.item = value;
            item.qty = 1;
            item.amount = selected ? selected.amount : '';
        } else {
            item[field] = value;
        }

        const qty = parseFloat(item.qty) || 0;
        const amt = parseFloat(item.amount) || 0;
        item.total = (qty * amt).toFixed(2);

        updated[index] = item;
        handleChange({ target: { name: 'mini_bar_items', value: updated } });
    };

    const calculateTotals = () => {
        const totalOther = formData.other_charges.reduce((sum, chg) => sum + (chg.is_complementary ? 0 : parseFloat(chg.amount) || 0), 0);

        const totalMini = formData.mini_bar_items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);

        const room = parseFloat(formData.roomCharge || 0);
        const discountVal = parseFloat(formData.discount || 0);
        const discountType = formData.discountType || 'fixed';

        const baseTotal = room + totalOther + totalMini;
        const discountAmount = discountType === 'percentage' ? (discountVal / 100) * baseTotal : discountVal;

        const grandTotal = baseTotal - discountAmount;

        return { totalOther, totalMini, grandTotal };
    };

    useEffect(() => {
        const { totalOther, totalMini, grandTotal } = calculateTotals();

        handleChange({ target: { name: 'totalOtherCharges', value: totalOther } });
        handleChange({ target: { name: 'totalMiniBar', value: totalMini } });
        handleChange({ target: { name: 'grandTotal', value: grandTotal.toFixed(2) } });
    }, [formData.other_charges, formData.mini_bar_items, formData.discount, formData.discountType, formData.roomCharge]);

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

            <Grid item xs={12}>
                <Typography variant="h6">Mini Bar</Typography>
            </Grid>

            {formData.mini_bar_items.map((item, index) => (
                <Grid key={index} container spacing={2} sx={{ mb: 2, px: 2 }} alignItems="center">
                    <Grid item xs={3}>
                        <FormControl fullWidth>
                            <InputLabel>Item</InputLabel>
                            <Select value={item.item} label="Item" onChange={(e) => handleMiniBarChange(index, 'item', e.target.value)}>
                                <MenuItem value="">Select Item</MenuItem>
                                {props.miniBarItems.map((mb, i) => (
                                    <MenuItem key={i} value={mb.name}>
                                        {mb.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={3}>
                        <TextField label="Amount" type="number" fullWidth value={item.amount} onChange={(e) => handleMiniBarChange(index, 'amount', e.target.value)} />
                    </Grid>
                    <Grid item xs={3}>
                        <TextField label="Qty" type="number" fullWidth value={item.qty} onChange={(e) => handleMiniBarChange(index, 'qty', e.target.value)} />
                    </Grid>
                    <Grid item xs={3}>
                        <TextField label="Total" fullWidth disabled value={item.total} />
                    </Grid>
                </Grid>
            ))}
            <Grid item xs={12}>
                <Button style={{ backgroundColor: '#063455', color: '#fff' }} variant="contained" onClick={() => handleChange({ target: { name: 'mini_bar_items', value: [...formData.mini_bar_items, { item: '', amount: '', qty: '', total: '' }] } })}>
                    Add More
                </Button>
            </Grid>

            {/* Summary Fields */}
            <Grid item xs={2}>
                <TextField label="Total Other Charges" value={totalOther} fullWidth disabled />
            </Grid>
            <Grid item xs={2}>
                <TextField label="Total Mini Bar Charges" value={totalMini} fullWidth disabled />
            </Grid>
            <Grid item xs={2}>
                <TextField label="Room Charges" value={formData.roomCharge} fullWidth disabled />
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

const UploadInfo = ({ formData, handleChange, handleFileChange, handleFileRemove, isCheckout }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            const syntheticEvent = {
                target: {
                    name: 'documents',
                    files: files
                }
            };
            handleFileChange(syntheticEvent);
        }
    };

    const handleBoxClick = () => {
        fileInputRef.current?.click();
    };

    const getFilePreview = (file, index) => {
        const isFileObject = file instanceof File;
        const fileName = isFileObject ? file.name : file.split('/').pop();
        const ext = fileName.split('.').pop().toLowerCase();
        
        const previewUrl = isFileObject ? URL.createObjectURL(file) : file;
        
        return (
            <div key={index} style={{ 
                position: 'relative', 
                width: '100px', 
                textAlign: 'center',
                marginBottom: '10px'
            }}>
                <IconButton
                    size="small"
                    onClick={() => handleFileRemove(index)}
                    sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        backgroundColor: '#f44336',
                        color: 'white',
                        width: 24,
                        height: 24,
                        '&:hover': {
                            backgroundColor: '#d32f2f'
                        },
                        zIndex: 1
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>

                {['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'].includes(ext) ? (
                    <div>
                        <img 
                            src={previewUrl} 
                            alt={`Document ${index + 1}`} 
                            style={{ 
                                width: '60px', 
                                height: '60px', 
                                objectFit: 'cover', 
                                borderRadius: '6px', 
                                cursor: 'pointer',
                                border: '2px solid #ddd'
                            }} 
                            onClick={() => window.open(previewUrl, '_blank')} 
                        />
                        <p style={{ fontSize: '12px', marginTop: '5px', margin: 0 }}>Image</p>
                    </div>
                ) : ext === 'pdf' ? (
                    <div>
                        <div
                            style={{
                                width: '60px',
                                height: '60px',
                                backgroundColor: '#f44336',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                margin: '0 auto'
                            }}
                            onClick={() => window.open(previewUrl, '_blank')}
                        >
                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold', fontSize: '10px' }}>
                                PDF
                            </Typography>
                        </div>
                        <p style={{ fontSize: '12px', marginTop: '5px', margin: 0 }}>PDF</p>
                    </div>
                ) : ['docx', 'doc'].includes(ext) ? (
                    <div>
                        <div
                            style={{
                                width: '60px',
                                height: '60px',
                                backgroundColor: '#2196f3',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                margin: '0 auto'
                            }}
                            onClick={() => window.open(previewUrl, '_blank')}
                        >
                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold', fontSize: '10px' }}>
                                DOC
                            </Typography>
                        </div>
                        <p style={{ fontSize: '12px', marginTop: '5px', margin: 0 }}>Word</p>
                    </div>
                ) : (
                    <div>
                        <div
                            style={{
                                width: '60px',
                                height: '60px',
                                backgroundColor: '#757575',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                margin: '0 auto'
                            }}
                            onClick={() => window.open(previewUrl, '_blank')}
                        >
                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold', fontSize: '8px' }}>
                                FILE
                            </Typography>
                        </div>
                        <p style={{ fontSize: '12px', marginTop: '5px', margin: 0 }}>
                            {ext.toUpperCase()}
                        </p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Upload Documents
                </Typography>
                <Box
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleBoxClick}
                    sx={{
                        border: isDragOver ? '2px dashed #0a3d62' : '2px dashed #ccc',
                        borderRadius: 2,
                        p: 4,
                        textAlign: 'center',
                        backgroundColor: isDragOver ? '#e3f2fd' : '#fafafa',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            borderColor: '#0a3d62',
                            backgroundColor: '#f5f5f5',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }
                    }}
                >
                    <input 
                        ref={fileInputRef}
                        type="file" 
                        multiple 
                        accept=".pdf,.doc,.docx,image/*" 
                        name="documents" 
                        onChange={handleFileChange} 
                        style={{ display: 'none' }} 
                    />
                    
                    <Box sx={{ mb: 2 }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#2196f3" opacity="0.3"/>
                            <path d="M14 2L20 8H14V2Z" fill="#2196f3"/>
                            <path d="M12 11L8 15H10.5V19H13.5V15H16L12 11Z" fill="#2196f3"/>
                        </svg>
                    </Box>
                    
                    <Typography variant="h6" sx={{ mb: 1, color: isDragOver ? '#2196f3' : '#666' }}>
                        {isDragOver ? 'Drop files here' : 'Upload Documents'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        Drag and drop files here or click to browse
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                        Supported formats: PDF, DOC, DOCX, Images (JPG, PNG, etc.)
                    </Typography>
                </Box>
            </Grid>

            {formData.previewFiles && formData.previewFiles.length > 0 && (
                <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Uploaded Documents ({formData.previewFiles.length})
                    </Typography>
                    <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: '15px',
                        padding: '15px',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0'
                    }}>
                        {formData.previewFiles.map((file, index) => getFilePreview(file, index))}
                    </div>
                </Grid>
            )}

            <Grid item xs={12}>
                <TextField label="Additional Notes" name="notes" value={formData.notes || ''} onChange={handleChange} multiline rows={4} fullWidth />
            </Grid>
        </Grid>
    );
};
