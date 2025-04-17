'use client';

import {
    Add as AddIcon,
    ChevronRight as ChevronRightIcon,
    RadioButtonUnchecked as CircleIcon,
    Close as CloseIcon,
    CallMerge as MergeIcon,
    OpenWith as MoveIcon,
} from '@mui/icons-material';
import {
    Box,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Paper,
    Switch,
    Typography,
} from '@mui/material';
import { useState } from 'react';

const AddReservation = ({ tableName = 'Table', onClose }) => {
    const [notAvailableActive, setNotAvailableActive] = useState(false);

    const handleToggleNotAvailable = () => {
        setNotAvailableActive(!notAvailableActive);
    };

    return (
        <Paper
            elevation={0}
            sx={{
                width: '100%',
                // maxWidth: 360,
                borderRadius: 2,
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 2,
                    py: 1,
                }}
            >
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 500, fontSize: '1.1rem' }}>
                        Actions
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        Actions for {tableName}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            <Divider />

            {/* Action Items */}
            <List sx={{ py: 0 }}>
                {/* Add New Reservation */}
                <ListItem
                    button
                    sx={{
                        py: 1.5,
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                        <AddIcon sx={{ color: 'primary.main' }} />
                    </ListItemIcon>
                    <ListItemText
                        primary={
                            <Typography variant="body1" sx={{ fontWeight: 500, cursor: 'pointer' }}>
                                Add New Reservation
                            </Typography>
                        }
                    />
                    <ListItemSecondaryAction>
                        <ChevronRightIcon color="action" />
                    </ListItemSecondaryAction>
                </ListItem>

                <Divider />

                {/* Merge Table */}
                <ListItem
                    button
                    sx={{
                        py: 1.5,
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                        <MergeIcon sx={{ transform: 'rotate(90deg)' }} />
                    </ListItemIcon>
                    <ListItemText
                        primary={
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                Merge Table
                            </Typography>
                        }
                    />
                    <ListItemSecondaryAction>
                        <ChevronRightIcon color="action" />
                    </ListItemSecondaryAction>
                </ListItem>

                <Divider />

                {/* Move Table */}
                <ListItem
                    button
                    sx={{
                        py: 1.5,
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                        <MoveIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary={
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                Move Table
                            </Typography>
                        }
                    />
                    <ListItemSecondaryAction>
                        <ChevronRightIcon color="action" />
                    </ListItemSecondaryAction>
                </ListItem>

                <Divider />

                {/* Not Available */}
                <ListItem
                    sx={{
                        py: 1.5,
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                        <CircleIcon sx={{ color: 'text.secondary' }} />
                    </ListItemIcon>
                    <ListItemText
                        primary={
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                Not Available
                            </Typography>
                        }
                    />
                    <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mr: 1, fontSize: '0.85rem' }}>
                                Inactive
                            </Typography>
                            <Switch
                                size="small"
                                checked={notAvailableActive}
                                onChange={handleToggleNotAvailable}
                                sx={{
                                    '& .MuiSwitch-thumb': {
                                        backgroundColor: notAvailableActive ? 'primary.main' : 'grey.400',
                                    },
                                }}
                            />
                        </Box>
                    </ListItemSecondaryAction>
                </ListItem>
            </List>
        </Paper>
    );
};

export default AddReservation;
