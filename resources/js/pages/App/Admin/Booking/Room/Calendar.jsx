import React, { useEffect, useRef, useState } from 'react';
import { DayPilot, DayPilotScheduler } from 'daypilot-pro-react';
import axios from 'axios';
import moment from 'moment';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { FormControl, InputLabel, MenuItem, Select, Box, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const RoomCalendar = () => {
    const schedulerRef = useRef();
    const [open, setOpen] = useState(false);
    const [month, setMonth] = useState(moment().format('MM'));
    const [year, setYear] = useState(moment().format('YYYY'));
    const [resources, setResources] = useState([]);
    const [events, setEvents] = useState([]);

    const fetchData = async () => {
        try {
            const { data } = await axios.get('/api/room-bookings/calendar', {
                params: { month, year },
            });
            console.log(data);

            setResources(data.rooms);

            const evs = data.bookings.map((b) => {
                return {
                    id: b.id,
                    resource: 'R' + b.room_number,
                    start: b.check_in_date,
                    end: moment(b.check_out_date).add(1, 'day').format('YYYY-MM-DD'),
                    text: `#${b.booking_no}: ${b.guest_name}`,
                    backColor: statusBack(b.status),
                    barColor: statusBar(b.status),
                    bubbleHtml: `
            <strong>${b.guest_name}</strong><br/>
            Status: ${b.status.replace('_', ' ')}<br/>
            <button onclick="window.open('/room-management/room-check-in/${b.id}', '_blank')">Check-in</button>
            <button onclick="window.open('/room-management/room-check-out/${b.id}', '_blank')">Check-out</button>
          `,
                };
            });

            setEvents(evs);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchData();
    }, [month, year]);

    const statusBack = (s) => ({ booked: 'blue', checked_in: 'yellow', checked_out: '#ddd', refund: 'green' })[s] || 'gray';
    const statusBar = (s) => ({ booked: 'blue', checked_in: 'black', checked_out: 'black', refund: 'black' })[s] || 'black';

    const dpConfig = {
        startDate: `${year}-${month}-01`,
        days: 31,
        scale: 'Day',
        treeEnabled: true,
        treePreventParentUsage: true,
        timeHeaders: [
            { groupBy: 'Month', format: 'MMMM yyyy' },
            { groupBy: 'Day', format: 'd' },
        ],
        resources: [
            {
                name: 'Rooms',
                id: 'rooms_group',
                expanded: true,
                children: resources.map((r) => ({
                    id: 'R' + r.room_number,
                    name: `Room no: ${r.room_number}`,
                    expanded: true,
                })),
            },
        ],
        events: events,
        eventHoverHandling: 'Bubble',
        bubble: new DayPilot.Bubble(),
        onEventClick: (args) => {
            const id = args.e.id();
            window.open(`/room-management/room-check-in/${id}`, '_blank');
        },
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
                <Box px={2}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton style={{ color: '#063455' }} onClick={() => router.visit('/booking/dashboard')}>
                            <ArrowBack />
                        </IconButton>
                        <h2 className="mb-0 fw-normal" style={{ color: '#063455', fontSize: '24px' }}>
                            Room Booking Calendar
                        </h2>
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                        <FormControl variant="outlined" size="small">
                            <InputLabel id="month-label">Month</InputLabel>
                            <Select labelId="month-label" value={month} onChange={(e) => setMonth(e.target.value)} label="Month">
                                {moment.months().map((m, i) => (
                                    <MenuItem key={i} value={String(i + 1).padStart(2, '0')}>
                                        {m}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl variant="outlined" size="small">
                            <InputLabel id="year-label">Year</InputLabel>
                            <Select labelId="year-label" value={year} onChange={(e) => setYear(e.target.value)} label="Year">
                                {Array.from({ length: 5 }, (_, i) => 2023 + i).map((y) => (
                                    <MenuItem key={y} value={y}>
                                        {y}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <DayPilotScheduler ref={schedulerRef} {...dpConfig} style={{ height: '650px' }} />
                </Box>
            </div>
        </>
    );
};

export default RoomCalendar;
