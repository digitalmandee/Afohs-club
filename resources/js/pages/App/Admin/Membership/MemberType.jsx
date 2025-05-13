import React, {useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    Button,
    Card,
    CardContent,
    Typography,
    IconButton,
    Box,
    Checkbox,
    FormControlLabel
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Add as AddIcon,
    MoreVert as MoreVertIcon,
    Check as CheckIcon
} from '@mui/icons-material';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router } from '@inertiajs/react';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const MembersType = () => {
    const [open, setOpen] = useState(false);
    // Member types data
    const memberTypes = [
        {
            title: 'VIP Guest Member',
            fee: '20,00 / One time',
            duration: '1 Year',
            discountPercent: '30%',
            discountAmount: '30 Rs',
            maintenanceFee: 'Yearly',
            benefits: ['Free Guest Passes', 'Discount (30%)']
        },
        {
            title: 'Affiliated Member',
            fee: '20,00 / One time',
            duration: '1 Year',
            discountPercent: '40%',
            discountAmount: '40 Rs',
            maintenanceFee: 'Quarterly',
            benefits: ['Free Guest Passes', 'Discount (30%)']
        },
        {
            title: 'Applied Member',
            fee: '20,00',
            duration: '1 Year',
            discountPercent: '50%',
            discountAmount: '50 Rs',
            maintenanceFee: 'Monthly',
            benefits: ['Free Guest Passes', 'Discount (30%)']
        }
    ];

    // Custom checkbox with check icon
    const CustomCheckbox = ({ label }) => (
        <div className="d-flex align-items-center mb-2">
            <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                backgroundColor: '#003366',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '8px'
            }}>
                <CheckIcon style={{ color: 'white', fontSize: '16px' }} />
            </div>
            <Typography style={{
                color: '#555',
                fontSize: '14px'
            }}>
                {label}
            </Typography>
        </div>
    );

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
                <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
                    {/* Header with back button, title, and add type button */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="d-flex align-items-center">
                            <ArrowBackIcon style={{
                                cursor: 'pointer',
                                marginRight: '10px',
                                color: '#555',
                                fontSize: '24px'
                            }} />
                            <Typography variant="h5" style={{
                                fontWeight: 500,
                                color: '#333',
                                fontSize: '24px'
                            }}>
                                Members Type
                            </Typography>
                        </div>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            style={{
                                backgroundColor: '#003366',
                                textTransform: 'none',
                                color: 'white',
                                borderRadius: '4px',
                                padding: '8px 16px',
                                fontSize: '14px'
                            }}
                        >
                            Add Type
                        </Button>
                    </div>

                    {/* Member Type Cards */}
                    <div className="row">
                        {memberTypes.map((type, index) => (
                            <div className="col-md-4 mb-4" key={index}>
                                <Card style={{
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    height: '100%',
                                    border: "1px solid #E3E3E3"
                                }}>
                                    <div>
                                        <div
                                            className="d-flex justify-content-between align-items-center mb-3 p-3"
                                            style={{
                                                paddingBottom: '8px',
                                                borderBottom: '1px dashed  #E0E0E0',
                                                marginBottom: '16px'
                                            }}
                                        >

                                            <Typography style={{
                                                fontWeight: 500,
                                                color: '#003366',
                                                fontSize: '16px'

                                            }}>
                                                {type.title}
                                            </Typography>
                                            <IconButton size="small">
                                                <MoreVertIcon style={{ color: '#555' }} />
                                            </IconButton>
                                        </div>
                                        <CardContent style={{ padding: '' }}>
                                            {/* Card Header */}
                                            {/* Fee and Duration */}
                                            <div className="d-flex justify-content-between mb-2">
                                                <div className="d-flex gap-2 align-items-center">
                                                    <Typography style={{ color: '#777', fontSize: '12px' }}>
                                                        Fee:
                                                    </Typography>
                                                    <Typography style={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>
                                                        {type.fee}
                                                    </Typography>
                                                </div>
                                                <div className="d-flex gap-2 align-items-center">
                                                    <Typography style={{ color: '#777', fontSize: '12px', textAlign: 'right' }}>
                                                        Duration:
                                                    </Typography>
                                                    <Typography style={{ color: '#333', fontSize: '14px', fontWeight: 500, textAlign: 'right' }}>
                                                        {type.duration}
                                                    </Typography>
                                                </div>
                                            </div>

                                            {/* Discount */}
                                            <div className="d-flex justify-content-between mb-2">
                                                <div className="d-flex gap-2 align-items-center">
                                                    <Typography style={{ color: '#777', fontSize: '12px' }}>
                                                        Discount:
                                                    </Typography>
                                                    <Typography style={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>
                                                        {type.discountPercent}
                                                    </Typography>
                                                </div>
                                                <div className="d-flex gap-2 align-items-center">
                                                    <Typography style={{ color: '#777', fontSize: '12px', textAlign: 'right' }}>
                                                        Discount:
                                                    </Typography>
                                                    <Typography style={{ color: '#333', fontSize: '14px', fontWeight: 500, textAlign: 'right' }}>
                                                        {type.discountAmount}
                                                    </Typography>
                                                </div>
                                            </div>

                                            {/* Maintenance Fee */}
                                            <div className="d-flex gap-2 align-items-center mb-3">
                                                <Typography style={{ color: '#777', fontSize: '12px' }}>
                                                    Maintenance Fee:
                                                </Typography>
                                                <Typography style={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>
                                                    {type.maintenanceFee}
                                                </Typography>
                                            </div>

                                            {/* Benefits */}
                                            <div>
                                                {type.benefits.map((benefit, i) => (
                                                    <CustomCheckbox key={i} label={benefit} />
                                                ))}
                                            </div>
                                        </CardContent>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default MembersType;