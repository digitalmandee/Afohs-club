import React, { useState, useRef } from 'react';
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

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const RoomEventManager = () => {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('room'); // 'room' or 'events'
    const [photoUrl, setPhotoUrl] = useState(null);
    const fileInputRef = useRef(null);

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
                        <IconButton sx={{ color: '#3F4E4F' }}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h5" component="h1" sx={{ ml: 1, fontWeight: 500, fontSize:'30px', color:'#3F4E4F' }}>
                            {activeTab === 'room' ? 'Add Room' : 'Add Event'}
                        </Typography>
                    </Box>
                    <Box sx={{ maxWidth: 600, margin: '0 auto', border:'1px solid #E3E3E3', bgcolor:'#FFFFFF' }}>
                        <Paper sx={{ p: 3 }}>
                            {/* Tabs */}
                            <Grid container sx={{ mb: 3 }}>
                                <Grid item xs={6}>
                                    <Box
                                        onClick={() => handleTabChange('room')}
                                        sx={{
                                            p: 2,
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            backgroundColor: activeTab === 'room' ? '#a7d8fd' : 'white',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px 0 0 4px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: 1,
                                            height: 80
                                        }}
                                    >
                                        <Box component="span" sx={{
                                            width: 24,
                                            height: 24,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '2px solid #000',
                                            borderRadius: '2px'
                                        }}>
                                            <Box component="span" sx={{
                                                fontSize: '18px',
                                                lineHeight: 1,
                                                transform: 'rotate(45deg)',
                                                display: 'inline-block',
                                                width: '10px',
                                                height: '10px',
                                                borderRight: '2px solid #000',
                                                borderBottom: '2px solid #000'
                                            }}></Box>
                                        </Box>
                                        <Typography>Room</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box
                                        onClick={() => handleTabChange('events')}
                                        sx={{
                                            p: 2,
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            backgroundColor: activeTab === 'events' ? '#a7d8fd' : 'white',
                                            border: '1px solid #ddd',
                                            borderRadius: '0 4px 4px 0',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: 1,
                                            height:80
                                        }}
                                    >
                                        <Box component="span" sx={{
                                            width: 24,
                                            height: 24,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <CalendarTodayIcon sx={{ fontSize: 20 }} />
                                        </Box>
                                        <Typography>Events</Typography>
                                    </Box>
                                </Grid>
                            </Grid>

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
                                        <Typography variant="body1" sx={{ mb: 1 }}>Room Name</Typography>
                                        <TextField
                                            fullWidth
                                            placeholder="e.g : Standard"
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body1" sx={{ mb: 1 }}>No. of Beds</Typography>
                                        <TextField
                                            fullWidth
                                            placeholder="e.g : 3"
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body1" sx={{ mb: 1 }}>Max Capacity</Typography>
                                        <TextField
                                            fullWidth
                                            placeholder="e.g : 2 Adults"
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body1" sx={{ mb: 1 }}>Price Per Night</Typography>
                                        <TextField
                                            fullWidth
                                            placeholder="e.g : 100$"
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body1" sx={{ mb: 1 }}>No. of Bathroom</Typography>
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