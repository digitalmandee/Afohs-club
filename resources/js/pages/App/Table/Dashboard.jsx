import TableIcon from '@/components/App/Icons/BTable';
import Table2Icon from '@/components/App/Icons/CTable';
import Table1Icon from '@/components/App/Icons/Table1';
import SideNav from '@/components/App/SideBar/SideNav';
import { KeyboardArrowDown, Settings } from '@mui/icons-material';
import { Box, Button, Modal, Typography } from '@mui/material';
import update from 'immutability-helper';
import { useCallback, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import AddReservation from './Action';
import TableSetting from './Setting';

const ItemTypes = {
    TABLE: 'table',
};

// DraggableTable component
const DraggableTable = ({ id, tableNumber, width, height, tableIcon: TableComponent, fill, reservation, index, moveTable, onClick }) => {
    // Set up drag functionality
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.TABLE,
        item: { id, index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    // Set up drop functionality
    const [, drop] = useDrop(
        () => ({
            accept: ItemTypes.TABLE,
            hover: (draggedItem) => {
                if (draggedItem.id !== id) {
                    moveTable(draggedItem.index, index);
                    // Update the index in the dragged item to reflect its new position
                    draggedItem.index = index;
                }
            },
        }),
        [id, index, moveTable],
    );

    // Determine text color based on reservation status
    const getTextColor = () => {
        if (fill === '#d1fae5') return '#059669';
        if (fill === '#cfe7ff') return '#3b82f6';
        return '#6b7280';
    };

    return (
        <Box
            onClick={onClick}
            ref={(node) => drag(drop(node))}
            sx={{
                width,
                height,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: isDragging ? 0.5 : 1,
                cursor: 'move',
                transition: 'all 0.2s',
                '&:hover': {
                    transform: 'scale(1.02)',
                },
            }}
        >
            <TableComponent
                style={{
                    width: '100%',
                    height: '100%',
                    bgcolor: fill,
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography variant="body2" sx={{ fontWeight: 'medium', color: getTextColor() }}>
                    {tableNumber}
                </Typography>
                {reservation && (
                    <>
                        <Typography variant="caption" sx={{ color: getTextColor(), fontWeight: 'medium' }}>
                            #{reservation.id}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.65rem' }}>
                            {reservation.customer}
                        </Typography>
                    </>
                )}
            </Box>
        </Box>
    );
};

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const TableManagement = ({ floorsdata, tablesData }) => {
    const [open, setOpen] = useState(false);
    const [selectedFloor, setSelectedFloor] = useState(1);
    const [selectedDate, setSelectedDate] = useState(7);
    const [openSettings, setOpenSettings] = useState(false);
    const [openReservation, setOpenReservation] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);
    const [tables, setTables] = useState([
        // First row
        {
            id: '1',
            tableNumber: 'T12',
            width: 130,
            height: 120,
            tableIcon: Table1Icon,
            fill: 'white',
        },
        {
            id: '2',
            tableNumber: 'T13',
            width: 130,
            height: 120,
            tableIcon: Table1Icon,
            fill: 'white',
        },
        {
            id: '3',
            tableNumber: 'T14',
            width: 130,
            height: 120,
            tableIcon: Table1Icon,
            fill: '#cfe7ff',
            reservation: {
                id: 'RSV002',
                customer: 'Hanna Rose',
            },
        },
        {
            id: '4',
            tableNumber: 'T15',
            width: 130,
            height: 120,
            tableIcon: Table1Icon,
            fill: 'white',
        },
        {
            id: '5',
            tableNumber: 'T16',
            width: 220,
            height: 120,
            tableIcon: TableIcon,
            fill: '#cfe7ff',
            reservation: {
                id: 'RSV012',
                customer: 'Ahman Maulana',
            },
        },
        // Second row
        {
            id: '6',
            tableNumber: 'T17',
            width: 230,
            height: 120,
            tableIcon: Table2Icon,
            fill: 'white',
            row: 2,
        },
        {
            id: '7',
            tableNumber: 'T18',
            width: 230,
            height: 120,
            tableIcon: Table2Icon,
            fill: 'white',
            row: 2,
        },
        {
            id: '8',
            tableNumber: 'T19',
            width: 230,
            height: 120,
            tableIcon: Table2Icon,
            fill: '#d1fae5',
            reservation: {
                id: 'RSV003',
                customer: 'John Doe',
            },
            row: 2,
        },
        // Third row
        {
            id: '9',
            tableNumber: 'T20',
            width: 230,
            height: 120,
            tableIcon: Table2Icon,
            fill: 'white',
            row: 3,
        },
        {
            id: '10',
            tableNumber: 'T21',
            width: 230,
            height: 120,
            tableIcon: Table2Icon,
            fill: 'white',
            row: 3,
        },
        {
            id: '11',
            tableNumber: 'T22',
            width: 230,
            height: 120,
            tableIcon: Table2Icon,
            fill: '#d1fae5',
            reservation: {
                id: 'RSV004',
                customer: 'Jane Smith',
            },
            row: 3,
        },
    ]);

    const handleOpenReservation = (table) => {
        setSelectedTable(table);
        setOpenReservation(true);
    };

    const handleCloseReservation = () => {
        setOpenReservation(false);
        setSelectedTable(null);
    };

    const moveTable = useCallback((dragIndex, hoverIndex) => {
        setTables((prevTables) =>
            update(prevTables, {
                $splice: [
                    [dragIndex, 1],
                    [hoverIndex, 0, prevTables[dragIndex]],
                ],
            }),
        );
    }, []);

    // Group tables by row
    const firstRowTables = tables.slice(0, 5);
    const secondRowTables = tables.slice(5, 8);
    const thirdRowTables = tables.slice(8, 11);

    const handleOpenSettings = () => setOpenSettings(true);
    const handleCloseSettings = () => setOpenSettings(false);

    const handleFloorChange = (event, newValue) => {
        setSelectedFloor(newValue);
    };

    const handleDateClick = (date) => {
        setSelectedDate(date);
    };

    // Days of the week with dates and reservation indicators
    const days = [
        { day: 'Sun', date: 7, hasReservations: true },
        { day: 'Mo', date: 8, hasReservations: true },
        { day: 'Tu', date: 9, hasReservations: true },
        { day: 'We', date: 10, hasReservations: false },
        { day: 'Th', date: 11, hasReservations: false },
        { day: 'Fr', date: 12, hasReservations: true },
        { day: 'Sa', date: 13, hasReservations: false },
    ];

    // Floor options
    const floors = [
        { id: 0, name: 'Floor 1', area: 'Indoor Area', capacity: '62-Person' },
        { id: 1, name: 'Floor 1', area: 'Outdoor Area', capacity: '62-Person' },
        { id: 2, name: 'Floor 2', area: 'Indoor Area', capacity: '50-Person' },
    ];

    return (
        <>
            {/* <>{floorsdata}</> */}

            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                }}
            >
                <Box
                    sx={{
                        height: '100vh',
                        bgcolor: '#F6F6F6',
                        display: 'flex',
                        flexDirection: 'column',
                        px: 3,
                        pt: 2,
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            // p: 2,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: '500',
                                    fontSize: '30px',
                                    color: '#3F4E4F',
                                }}
                            >
                                Table Managementsds
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {/* <IconButton sx={{ mr: 1 }}>
                                <HelpOutline />
                            </IconButton> */}
                            <img
                                src="/assets/qbutton.png"
                                alt=""
                                style={{
                                    width: 40,
                                    height: 40,
                                    marginRight: 10,
                                }}
                            />
                            <Button
                                variant="outlined"
                                startIcon={<Settings />}
                                onClick={handleOpenSettings}
                                sx={{
                                    border: '1px solid #3F4E4F',
                                    color: '#3F4E4F',
                                    textTransform: 'none',
                                    height: 40,
                                    borderRadius: '0',
                                    fontSize: '14px',
                                }}
                            >
                                Table Settings
                            </Button>
                        </Box>
                        <Modal open={openSettings} onClose={handleCloseSettings}>
                            <Box
                                sx={{
                                    position: 'fixed',
                                    top: 5,
                                    bottom: 5,
                                    right: 10,
                                    bgcolor: '#FFFFFF',
                                    boxShadow: 24,
                                    // p: 4,
                                    borderRadius: 2,
                                    width: 400,
                                    overflowY: 'hidden', // Enables scrolling if content overflows
                                }}
                            >
                                <TableSetting floorsdata={floorsdata} tablesData={tablesData} />
                            </Box>
                        </Modal>
                    </Box>

                    {/* Main Content */}
                    <Box
                        sx={{
                            display: 'flex',
                            mt: 2,
                            flexGrow: 1,
                            justifyContent: 'center',
                            bgcolor: 'transparent',
                        }}
                    >
                        {/* Left Sidebar - Calendar */}
                        <Box
                            sx={{
                                width: 115,
                                display: 'flex',
                                flexDirection: 'column',
                                pr: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    mb: 2,
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: '500',
                                        fontSize: '14px',
                                        color: '#121212',
                                    }}
                                >
                                    May 2024
                                </Typography>
                                <KeyboardArrowDown fontSize="small" sx={{ ml: 0.5 }} />
                            </Box>

                            {days.map((day, index) => (
                                <Box
                                    key={index}
                                    onClick={() => handleDateClick(day.date)}
                                    sx={{
                                        height: '120px',
                                        py: 3,
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        bgcolor: selectedDate === day.date ? '#B0DEFF' : '#FFFFFF',
                                        border: selectedDate === day.date ? '1px solid #063455' : '1px solid #E3E3E3',
                                        '&:hover': {
                                            bgcolor: selectedDate === day.date ? '#B0DEFF' : '#FFFFFF',
                                        },
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            display: 'block',
                                            color: '#7F7F7F',
                                            fontSize: '16px',
                                        }}
                                    >
                                        {day.day}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontWeight: 'medium',
                                            my: 0.5,
                                            color: '#121212',
                                            fontSize: '22px',
                                        }}
                                    >
                                        {day.date}
                                    </Typography>
                                    {day.hasReservations && (
                                        <Box
                                            sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                bgcolor: '#1976d2',
                                                mx: 'auto',
                                            }}
                                        />
                                    )}
                                </Box>
                            ))}
                        </Box>

                        {/* Right Content - Floor Plan */}
                        <Box
                            sx={{
                                flexGrow: 1,
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            {/* Floor Tabs */}
                            <Box
                                sx={{
                                    position: 'relative',
                                    width: '100%',
                                    height: 150, // Adjust height to accommodate all tabs
                                    // mb: -1
                                }}
                            >
                                {/* Floor 1 Indoor Area - White background (bottom layer) */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        p: 1.5,
                                        bgcolor: '#FFFFFF',
                                        height: 100,
                                        zIndex: 1,
                                        borderTopLeftRadius: '24px',
                                        borderTopRightRadius: '24px',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            mt: -7,
                                            width: '100%',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 30,
                                                    height: 30,
                                                    borderRadius: '50%',
                                                    bgcolor: 'transparent',
                                                    // color: '#333333',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mr: 1.5,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold',
                                                    border: '1px solid #E3E3E3',
                                                }}
                                            >
                                                <img
                                                    src="/assets/home-roof.png"
                                                    alt=""
                                                    style={{
                                                        width: 18,
                                                        height: 18,
                                                    }}
                                                />
                                            </Box>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: '#333333',
                                                    fontWeight: 'medium',
                                                }}
                                            >
                                                Floor 1 • Indoor Area
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{ color: '#333333' }}>
                                            Available for 62-Person
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Floor 1 Outdoor Area - Blue background (middle layer) */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 40, // Offset to create layered effect
                                        left: 0,
                                        right: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        p: 1.5,
                                        bgcolor: '#0C67AA',
                                        height: 70,
                                        zIndex: 2,
                                        borderTopLeftRadius: '24px',
                                        borderTopRightRadius: '24px',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            mt: -4,
                                            width: '100%',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 30,
                                                    height: 30,
                                                    borderRadius: '50%',
                                                    bgcolor: 'white',
                                                    // color: '#3F4E4F',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mr: 1.5,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                <img
                                                    src="/assets/tree.png"
                                                    alt=""
                                                    style={{
                                                        width: 18,
                                                        height: 18,
                                                    }}
                                                />
                                            </Box>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: 'white',
                                                    fontWeight: 'medium',
                                                }}
                                            >
                                                Floor 2 • Indoor Area
                                            </Typography>
                                        </Box>

                                        {/* This will now stay on the right side */}
                                        <Typography variant="body2" sx={{ color: 'white' }}>
                                            Available for 50-Person
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Floor 2 Indoor Area - Dark gray/green background (top layer) */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 80,
                                        left: 0,
                                        right: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        p: 1.5,
                                        bgcolor: '#3F4E4F',
                                        height: 50,
                                        zIndex: 3,
                                        borderTopLeftRadius: '24px',
                                        borderTopRightRadius: '24px',
                                    }}
                                >
                                    {/* ✅ Removed 'position: absolute' from this Box */}
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 30,
                                                height: 30,
                                                borderRadius: '50%',
                                                bgcolor: 'white',
                                                // color: '#3F4E4F',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mr: 1.5,
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            <img
                                                src="/assets/home-roof-activity.png"
                                                alt=""
                                                style={{
                                                    width: 18,
                                                    height: 18,
                                                }}
                                            />
                                        </Box>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'white',
                                                fontWeight: 'medium',
                                            }}
                                        >
                                            Floor 2 • Indoor Area
                                        </Typography>
                                    </Box>

                                    {/* This will now stay on the right side */}
                                    <Typography variant="body2" sx={{ color: 'white' }}>
                                        Available for 50-Person
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Floor Plan */}
                            <DndProvider backend={HTML5Backend}>
                                <Box
                                    sx={{
                                        flexGrow: 1,
                                        bgcolor: '#3F4E4F',
                                        position: 'relative',
                                        overflow: 'auto',
                                        height: '100%',
                                        minHeight: 500,
                                    }}
                                >
                                    {/* First row of tables */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 10,
                                            left: 0,
                                            right: 0,
                                            display: 'flex',
                                            justifyContent: 'space-around',
                                            width: '100%',
                                            gap: '10px',
                                        }}
                                    >
                                        {firstRowTables.map((table, index) => (
                                            <DraggableTable
                                                key={table.id}
                                                id={table.id}
                                                index={index}
                                                tableNumber={table.tableNumber}
                                                width={table.width}
                                                height={table.height}
                                                tableIcon={table.tableIcon}
                                                fill={table.fill}
                                                reservation={table.reservation}
                                                moveTable={moveTable}
                                                onClick={() => handleOpenReservation(table)}
                                            />
                                        ))}
                                    </Box>

                                    {/* Second row of tables */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 190,
                                            left: 0,
                                            right: 0,
                                            display: 'flex',
                                            justifyContent: 'space-around',
                                            width: '80%',
                                        }}
                                    >
                                        {secondRowTables.map((table, index) => (
                                            <DraggableTable
                                                key={table.id}
                                                id={table.id}
                                                index={index + firstRowTables.length}
                                                tableNumber={table.tableNumber}
                                                width={table.width}
                                                height={table.height}
                                                tableIcon={table.tableIcon}
                                                fill={table.fill}
                                                reservation={table.reservation}
                                                moveTable={moveTable}
                                                onClick={() => handleOpenReservation(table)}
                                            />
                                        ))}
                                    </Box>

                                    {/* Third row of tables */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 360,
                                            left: 0,
                                            right: 0,
                                            display: 'flex',
                                            justifyContent: 'space-around',
                                            width: '80%',
                                        }}
                                    >
                                        {thirdRowTables.map((table, index) => (
                                            <DraggableTable
                                                key={table.id}
                                                id={table.id}
                                                index={index + firstRowTables.length + secondRowTables.length}
                                                tableNumber={table.tableNumber}
                                                width={table.width}
                                                height={table.height}
                                                tableIcon={table.tableIcon}
                                                fill={table.fill}
                                                reservation={table.reservation}
                                                moveTable={moveTable}
                                                onClick={() => handleOpenReservation(table)}
                                            />
                                        ))}
                                    </Box>

                                    {/* Bar/Counter */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            right: 40,
                                            top: 380,
                                            width: 30,
                                            height: 150,
                                            bgcolor: '#e5e7eb',
                                            borderRadius: 1,
                                        }}
                                    />
                                </Box>
                                <Modal open={openReservation} onClose={handleCloseReservation}>
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            bgcolor: 'white',
                                            borderRadius: 2,
                                            boxShadow: 24,
                                            p: 3,
                                            maxWidth: 600,
                                            width: '90%',
                                            maxHeight: '90vh',
                                            overflow: 'auto', // or remove if you want to hide scroll
                                        }}
                                    >
                                        <AddReservation table={selectedTable} onClose={handleCloseReservation} />
                                    </Box>
                                </Modal>
                            </DndProvider>
                        </Box>
                    </Box>
                </Box>
            </div>
        </>
    );
};

export default TableManagement;
