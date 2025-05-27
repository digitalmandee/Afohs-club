import { useState } from 'react';
import { Add as AddIcon, ChevronRight as ChevronRightIcon, RadioButtonUnchecked as CircleIcon, Close as CloseIcon, CallMerge as MergeIcon, OpenWith as MoveIcon } from '@mui/icons-material';
import { Box, Dialog, Divider, IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Paper, Switch, Typography } from '@mui/material';
import OrderDetails from './OrderDetails';

const ActiveTable = ({ table, floorName, onClose }) => {
    const [orderDrawerOpen, setOrderDrawerOpen] = useState(false);

    const toggleOrderDrawer = (open) => () => {
        setOrderDrawerOpen(open);
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
                <Typography variant="h4" sx={{ fontWeight: 500 }}>
                    Table ID
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', px: 2.5, py: 2 }}>
                {table.table_no} - {floorName}
            </Typography>

            <Divider />

            {/* Action Items */}
            <List sx={{ py: 0 }}>
                {/* Add New Reservation */}
                <ListItem
                    button
                    onClick={toggleOrderDrawer(true)}
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
                                Detail Order
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
            </List>

            {/* Order Details */}
            <Dialog
                open={orderDrawerOpen}
                onClose={toggleOrderDrawer(false)}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        borderRadius: 1,
                        m: 0,
                        position: 'fixed',
                        right: 0,
                        top: 0,
                        height: '100%',
                        maxHeight: '100%',
                    },
                }}
            >
                <OrderDetails orderId={table.booked_by?.order_id} onClose={toggleOrderDrawer(false)} />
            </Dialog>
        </Paper>
    );
};

export default ActiveTable;
