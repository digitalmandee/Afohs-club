'use client';

import UserAutocomplete from '@/components/UserAutocomplete';
import { useOrderStore } from '@/stores/useOrderStore';
import { router } from '@inertiajs/react';
import { routeNameForContext } from '@/lib/utils';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Button, CircularProgress, FormControl, FormControlLabel, Grid, IconButton, InputBase, InputLabel, MenuItem, Paper, Radio, RadioGroup, Select, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

const RoomDialog = ({ guestTypes, roomTypes, loading }) => {
    const { orderDetails, handleOrderDetailChange } = useOrderStore();

    const [filterOption, setFilterOption] = useState('occupied');
    const [searchTerm, setSearchTerm] = useState('');

    const handleFilterOptionChange = (event, newFilterOption) => {
        if (newFilterOption !== null) {
            setFilterOption(newFilterOption);
        }
    };

    const handleRoomTypeChange = (value) => {
        handleOrderDetailChange('room_type', value);
        handleOrderDetailChange('room', null);
    };

    const handleMemberType = (value) => {
        handleOrderDetailChange('member_type', value);
        handleOrderDetailChange('member', {});
    };

    // Auto-select room based on selected member
    useEffect(() => {
        if (orderDetails.member && orderDetails.member.id && roomTypes.length > 0) {
            for (const type of roomTypes) {
                if (type.rooms) {
                    const foundRoom = type.rooms.find((r) => {
                        const booking = r.current_booking;
                        if (!booking) return false;
                        if (orderDetails.member_type == 0) return booking.member_id == orderDetails.member.id;
                        if (String(orderDetails.member_type).startsWith('guest-') || orderDetails.member_type == 2) return booking.customer_id == orderDetails.member.id;
                        if (orderDetails.member_type == 3) return booking.employee_id == orderDetails.member.id;
                        return false;
                    });

                    if (foundRoom) {
                        handleOrderDetailChange('room_type', type.id);
                        handleOrderDetailChange('room', foundRoom);
                        break;
                    }
                }
            }
        }
    }, [orderDetails.member, roomTypes]);

    const currentRoomType = roomTypes.find((r) => r.id === orderDetails.room_type);

    const filteredRooms = currentRoomType?.rooms?.length
        ? currentRoomType.rooms.filter((room) => {
              const isOccupied = !!room.current_booking;
              if (filterOption === 'occupied' && !isOccupied) return false;
              if (filterOption === 'vacant' && isOccupied) return false;

              // If a member is selected, filter by that member's booking
              if (orderDetails.member && orderDetails.member.id) {
                  const booking = room.current_booking;
                  if (!booking) return false;

                  // Check if booking matches selected member
                  if (orderDetails.member_type == 0) {
                      // Member
                      if (booking.member_id != orderDetails.member.id) return false;
                  } else if (String(orderDetails.member_type).startsWith('guest-') || orderDetails.member_type == 2) {
                      // Guest (or Corporate) -> assuming booking.customer covers guests
                      if (booking.customer_id != orderDetails.member.id) return false;
                  } else if (orderDetails.member_type == 3) {
                      // Employee
                      if (booking.employee_id != orderDetails.member.id) return false;
                  }
              }

              const keyword = searchTerm.toLowerCase();
              const booking = room.current_booking;
              const guestName = booking ? booking.guest_first_name + ' ' + booking.guest_last_name : '';

              return room.name.toLowerCase().includes(keyword) || guestName.toLowerCase().includes(keyword);
          })
        : [];

    const isDisabled = !orderDetails.room || !orderDetails.room.current_booking;

    return (
        <Box>
            <Box sx={{ px: 2, mb: 2 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: '',
                        bgcolor: '#F6F6F6',
                        px: 2,
                        py: 1.5,
                        borderRadius: 1,
                    }}
                >
                    <Typography sx={{ fontSize: '14px', color: '#7F7F7F' }}>Order ID</Typography>
                    <Typography
                        sx={{
                            fontWeight: 'bold',
                            fontSize: '14px',
                            color: '#063455',
                            marginLeft: 2,
                        }}
                    >
                        #{orderDetails.order_no}
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ px: 2, mb: 2 }}>
                <FormControl component="fieldset">
                    <RadioGroup
                        row
                        name="membership-type"
                        value={orderDetails.member_type}
                        onChange={(e) => {
                            handleMemberType(e.target.value);
                            handleOrderDetailChange('member', {});
                        }}
                    >
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, width: '100%' }}>
                            <FormControlLabel value="0" control={<Radio />} label="Member" sx={{ border: orderDetails.member_type == '0' ? '1px solid #A27B5C' : '1px solid #E3E3E3', borderRadius: 1, px: 1, m: 0, bgcolor: orderDetails.member_type == '0' ? '#FCF7EF' : 'transparent' }} />
                            <FormControlLabel value="2" control={<Radio />} label="Corporate Member" sx={{ border: orderDetails.member_type == '2' ? '1px solid #A27B5C' : '1px solid #E3E3E3', borderRadius: 1, px: 1, m: 0, bgcolor: orderDetails.member_type == '2' ? '#FCF7EF' : 'transparent' }} />
                            <FormControlLabel value="3" control={<Radio />} label="Employee" sx={{ border: orderDetails.member_type == '3' ? '1px solid #A27B5C' : '1px solid #E3E3E3', borderRadius: 1, px: 1, m: 0, bgcolor: orderDetails.member_type == '3' ? '#FCF7EF' : 'transparent' }} />
                            {guestTypes.map((type) => (
                                <FormControlLabel
                                    key={type.id}
                                    value={`guest-${type.id}`}
                                    control={<Radio />}
                                    label={type.name}
                                    sx={{
                                        border: orderDetails.member_type == `guest-${type.id}` ? '1px solid #A27B5C' : '1px solid #E3E3E3',
                                        borderRadius: 1,
                                        px: 1,
                                        m: 0,
                                        bgcolor: orderDetails.member_type == `guest-${type.id}` ? '#FCF7EF' : 'transparent',
                                    }}
                                />
                            ))}
                        </Box>
                    </RadioGroup>
                </FormControl>
            </Box>

            {/* Customer Information */}
            <Grid container spacing={2} sx={{ px: 2, mb: 2 }}>
                <Grid item xs={12}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Customer Name
                    </Typography>
                    <UserAutocomplete memberType={orderDetails.member_type} value={orderDetails.member && orderDetails.member.id ? orderDetails.member : null} onChange={(newValue) => handleOrderDetailChange('member', newValue || {})} label="Member / Guest Name" placeholder="Search by Name, ID, or CNIC..." />
                </Grid>
            </Grid>

            {/* Search and Filter */}
            <Box sx={{ px: 2, mb: 2, display: 'flex' }}>
                <Paper
                    component="form"
                    sx={{
                        p: '2px 4px',
                        display: 'flex',
                        alignItems: 'center',
                        flex: 1,
                        border: '1px solid #ddd',
                        boxShadow: 'none',
                    }}
                >
                    <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Search Room or Guest" inputProps={{ 'aria-label': 'search rooms' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                        <SearchIcon />
                    </IconButton>
                </Paper>
                {/* Select Room Type */}
                <FormControl sx={{ marginLeft: 1, minWidth: 120 }}>
                    <InputLabel id="select-room-type">Room Type</InputLabel>
                    <Select labelId="select-room-type" id="room-type" value={orderDetails.room_type || ''} label="Room Type" onChange={(e) => handleRoomTypeChange(e.target.value)}>
                        {roomTypes.map((item, index) => (
                            <MenuItem value={item.id} key={index}>
                                {item.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <ToggleButtonGroup value={filterOption} exclusive onChange={handleFilterOptionChange} aria-label="filter option" size="small" sx={{ ml: 1 }}>
                    <ToggleButton value="all" aria-label="all" sx={{ textTransform: 'none', '&.Mui-selected': { bgcolor: '#063455', color: 'white', '&:hover': { bgcolor: '#063455' } } }}>
                        All
                    </ToggleButton>
                    <ToggleButton value="occupied" aria-label="occupied" sx={{ textTransform: 'none', '&.Mui-selected': { bgcolor: '#063455', color: 'white', '&:hover': { bgcolor: '#063455' } } }}>
                        Occupied
                    </ToggleButton>
                    <ToggleButton value="vacant" aria-label="vacant" sx={{ textTransform: 'none', '&.Mui-selected': { bgcolor: '#063455', color: 'white', '&:hover': { bgcolor: '#063455' } } }}>
                        Vacant
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Room Selection */}
            <Box sx={{ px: 2, mb: 2 }}>
                <RadioGroup
                    value={orderDetails.room ? JSON.stringify(orderDetails.room) : ''}
                    onChange={(e) => {
                        const room = JSON.parse(e.target.value);
                        handleOrderDetailChange('room', room);

                        // Extract member info from booking
                        const booking = room.current_booking;
                        if (booking) {
                            let memberData = null;
                            let memberType = null;

                            if (booking.member) {
                                memberType = 1; // Member
                                memberData = {
                                    ...booking.member,
                                    name: booking.member.full_name, // Map full_name to name for consistency
                                    type: 'Member',
                                };
                            } else if (booking.customer) {
                                memberType = 2; // Guest
                                memberData = {
                                    ...booking.customer,
                                    name: booking.customer.name,
                                    type: 'Guest',
                                };
                            } else {
                                // Fallback for walk-in guest in room? (Or handle accordingly)
                                memberType = 2;
                                memberData = {
                                    id: null,
                                    name: `${booking.guest_first_name} ${booking.guest_last_name}`,
                                    customer_no: 'N/A',
                                    type: 'Guest',
                                };
                            }

                            handleOrderDetailChange('member', memberData);
                            handleOrderDetailChange('member_type', memberType);
                        }
                    }}
                >
                    <Grid container spacing={1}>
                        {loading ? (
                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                                <CircularProgress />
                            </Grid>
                        ) : filteredRooms.length > 0 ? (
                            filteredRooms.map((room) => {
                                const isOccupied = !!room.current_booking;
                                const booking = room.current_booking;
                                const isSelected = orderDetails.room?.id === room.id;

                                const handleSelectRoom = () => {
                                    handleOrderDetailChange('room', room);
                                    if (booking) {
                                        let memberData = null;
                                        let memberType = null;

                                        if (booking.member) {
                                            memberType = 1;
                                            memberData = {
                                                ...booking.member,
                                                name: booking.member.full_name,
                                                type: 'Member',
                                            };
                                        } else if (booking.customer) {
                                            memberType = 2;
                                            memberData = {
                                                ...booking.customer,
                                                name: booking.customer.name,
                                                type: 'Guest',
                                            };
                                        } else {
                                            memberType = 2;
                                            memberData = {
                                                id: null,
                                                name: `${booking.guest_first_name} ${booking.guest_last_name}`,
                                                customer_no: 'N/A',
                                                type: 'Guest',
                                            };
                                        }

                                        handleOrderDetailChange('member', memberData);
                                        handleOrderDetailChange('member_type', memberType);
                                    }
                                };

                                return (
                                    <Grid item xs={6} key={room.id}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 1.5,
                                                bgcolor: isSelected ? '#FCF7EF' : isOccupied ? 'white' : '#f5f5f5',
                                                border: isSelected ? '1px solid #A27B5C' : '1px solid #e0e0e0',
                                                borderRadius: 1,
                                                opacity: 1,
                                                cursor: 'pointer',
                                                position: 'relative',
                                            }}
                                            onClick={handleSelectRoom}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Box>
                                                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                                        {room.name}
                                                    </Typography>
                                                    {isOccupied ? (
                                                        <Box>
                                                            <Typography variant="caption" sx={{ color: 'green', display: 'block' }}>
                                                                {booking.member ? 'Member: ' : booking.customer ? 'Guest: ' : booking.employee ? 'Employee: ' : 'Guest: '}
                                                                {booking.member ? booking.member.full_name : booking.customer ? booking.customer.name : booking.employee ? booking.employee.name : `${booking.guest_first_name} ${booking.guest_last_name}`}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.7rem' }}>
                                                                Check-In: {booking.check_in_date}
                                                            </Typography>
                                                        </Box>
                                                    ) : (
                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                            Vacant
                                                        </Typography>
                                                    )}
                                                </Box>

                                                <FormControlLabel value={JSON.stringify(room)} control={<Radio size="small" checked={isSelected} />} label="" sx={{ m: 0, color: '#063455' }} />
                                            </Box>
                                        </Paper>
                                    </Grid>
                                );
                            })
                        ) : (
                            <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                                    No rooms found.
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </RadioGroup>

                {/* Selected Member Details */}
                {orderDetails.member && (
                    <Box sx={{ px: 2, mb: 2 }}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 1 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, color: '#063455' }}>
                                Selected {orderDetails.member_type === 1 ? 'Member' : 'Guest'}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box display="flex" justifyContent="space-between" width="100%">
                                    <Box>
                                        <Typography variant="body2" fontWeight="medium">
                                            {orderDetails.member.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {orderDetails.member_type === 1 ? `Membership No: ${orderDetails.member.membership_no}` : `Customer No: ${orderDetails.member.customer_no || 'N/A'}`}
                                        </Typography>
                                        {orderDetails.member_type === 1 && (
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', color: orderDetails.member.status === 'active' ? 'green' : 'red' }}>
                                                Status: {orderDetails.member.status || 'N/A'}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'capitalize' }}>
                                            Room Status: {orderDetails.room?.current_booking?.status?.replace('_', ' ') || 'Occupied'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                            Check-In: {orderDetails.room?.current_booking?.check_in_date}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                            Check-Out: {orderDetails.room?.current_booking?.check_out_date}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                )}
            </Box>

            {/* Footer */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    p: 2,
                    borderTop: '1px solid #e0e0e0',
                }}
            >
                <Button sx={{ color: '#666', textTransform: 'none', mr: 1 }} onClick={() => router.visit(route(routeNameForContext('order.new')))}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                        bgcolor: '#0c3b5c',
                        '&:hover': { bgcolor: '#072a42' },
                        textTransform: 'none',
                    }}
                    disabled={isDisabled}
                    onClick={() => {
                        const room = orderDetails.room;
                        // If room is occupied, pass booking id
                        const booking = room.current_booking;

                        router.visit(
                            route(routeNameForContext('order.menu'), {
                                room_id: room.id,
                                room_booking_id: booking ? booking.id : null,
                                member_id: orderDetails.member ? orderDetails.member.id : null,
                                member_type: orderDetails.member_type,
                                order_type: 'room_service',
                            }),
                        );
                    }}
                >
                    Choose Menu
                </Button>
            </Box>
        </Box>
    );
};

export default RoomDialog;
