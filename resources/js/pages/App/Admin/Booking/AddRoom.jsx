import React, { useState, useRef, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Grid,
    IconButton,
    InputAdornment
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideNav from '@/components/App/AdminSideBar/SideNav'
import { router } from '@inertiajs/react';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const RoomEventManager = () => {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('room'); // 'room' or 'events'
    const [photoUrl, setPhotoUrl] = useState(null);
    const fileInputRef = useRef(null);
    const { url } = usePage();
    const query = new URLSearchParams(url.split('?')[1]);
    const type = query.get('type');

    useEffect(() => {
        if (type === 'event') {
            setActiveTab('events');
        } else {
            setActiveTab('room');
        }
    }, [type]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handlePhotoUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPhotoUrl(e.target.result);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleChoosePhoto = () => {
        fileInputRef.current.click();
    };

    const handleDeletePhoto = () => {
        setPhotoUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
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
                <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '20px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <IconButton
                            sx={{ color: '#3F4E4F' }}
                            onClick={() => window.history.back()}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h5" component="h1" sx={{ ml: 1, fontWeight: 500, fontSize: '30px', color: '#3F4E4F' }}>
                            {activeTab === 'room' ? 'Add Room' : 'Add Event'}
                        </Typography>
                    </Box>
                    <Box sx={{ maxWidth: 600, margin: '0 auto', border: '1px solid #E3E3E3', bgcolor: '#FFFFFF' }}>
                        <Paper sx={{ p: 3 }}>

                            {/* Photo Upload Section */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Box
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        backgroundColor: '#d4a88e',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {photoUrl ? (
                                        <img src={photoUrl || "/placeholder.svg"} alt="Uploaded" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                border: '2px solid white',
                                                borderRadius: '50%',
                                                position: 'relative'
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 20,
                                                    height: 20,
                                                    border: '2px solid white',
                                                    borderRadius: '50%',
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)'
                                                }}
                                            />
                                        </Box>
                                    )}
                                </Box>
                                <Box sx={{ ml: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Button
                                            variant="text"
                                            onClick={handleChoosePhoto}
                                            sx={{
                                                color: '#1976d2',
                                                textTransform: 'none',
                                                p: 0,
                                                minWidth: 'auto',
                                                fontWeight: 'normal',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            Choose Photo
                                        </Button>
                                        <Typography sx={{ mx: 1, color: '#ccc' }}>|</Typography>
                                        <Button
                                            variant="text"
                                            onClick={handleDeletePhoto}
                                            sx={{
                                                color: '#f44336',
                                                textTransform: 'none',
                                                p: 0,
                                                minWidth: 'auto',
                                                fontWeight: 'normal',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            Delete
                                        </Button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handlePhotoUpload}
                                            style={{ display: 'none' }}
                                            accept="image/*"
                                        />
                                    </Box>
                                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem' }}>
                                        Click upload to room image (4 MB max)
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Form Fields */}
                            {activeTab === 'room' ? (
                                // Room Form
                                <Box>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography sx={{
                                            mb: 1,
                                            color: '#121212',
                                            fontWeight: 400,
                                            fontSize: '14px'
                                        }}>Room Name</Typography>
                                        <TextField
                                            fullWidth
                                            placeholder="e.g : Standard"
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography sx={{
                                            mb: 1,
                                            color: '#121212',
                                            fontWeight: 400,
                                            fontSize: '14px'
                                        }}>No. of Beds</Typography>
                                        <TextField
                                            fullWidth
                                            placeholder="e.g : 3"
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography sx={{
                                            mb: 1,
                                            color: '#121212',
                                            fontWeight: 400,
                                            fontSize: '14px'
                                        }}>Max Capacity</Typography>
                                        <TextField
                                            fullWidth
                                            placeholder="e.g : 2 Adults"
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography sx={{
                                            mb: 1,
                                            color: '#121212',
                                            fontWeight: 400,
                                            fontSize: '14px'
                                        }}>Price Per Night</Typography>
                                        <TextField
                                            fullWidth
                                            placeholder="e.g : 100$"
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography sx={{
                                            mb: 1,
                                            color: '#121212',
                                            fontWeight: 400,
                                            fontSize: '14px'
                                        }}>No. of Bathroom</Typography>
                                        <TextField
                                            fullWidth
                                            placeholder="e.g : 1"
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Box>
                                </Box>
                            ) : (
                                // Events Form
                                <Box>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body1" sx={{ mb: 1 }}>Event Title</Typography>
                                        <TextField
                                            fullWidth
                                            placeholder="e.g : Annual Gala"
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body1" sx={{ mb: 1 }}>Date & Time</Typography>
                                        <TextField
                                            fullWidth
                                            placeholder="e.g : Apr 10, 10:00 PM"
                                            variant="outlined"
                                            size="small"
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <CalendarTodayIcon fontSize="small" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body1" sx={{ mb: 1 }}>Max Capacity</Typography>
                                        <TextField
                                            fullWidth
                                            placeholder="e.g : 50 People"
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body1" sx={{ mb: 1 }}>Price Per Person</Typography>
                                        <TextField
                                            fullWidth
                                            placeholder="e.g : 100$"
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body1" sx={{ mb: 1 }}>Status</Typography>
                                        <TextField
                                            fullWidth
                                            placeholder="e.g : Upcoming"
                                            variant="outlined"
                                            size="small"
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <KeyboardArrowDownIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body1" sx={{ mb: 1 }}>Location</Typography>
                                        <TextField
                                            fullWidth
                                            placeholder="e.g : Main Hall"
                                            variant="outlined"
                                            size="small"
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <KeyboardArrowDownIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Box>
                                </Box>
                            )}

                            {/* Action Buttons */}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                                <Button
                                    variant="text"
                                    sx={{
                                        color: '#000',
                                        mr: 2,
                                        textTransform: 'none',
                                        fontWeight: 'normal'
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    sx={{
                                        backgroundColor: '#0a3d62',
                                        color: 'white',
                                        textTransform: 'none',
                                        '&:hover': {
                                            backgroundColor: '#0c2d48',
                                        },
                                        fontWeight: 'normal',
                                        px: 4
                                    }}
                                >
                                    Save
                                </Button>
                            </Box>
                        </Paper>
                    </Box>
                </div>
            </div>
        </>
    );
};

export default RoomEventManager;