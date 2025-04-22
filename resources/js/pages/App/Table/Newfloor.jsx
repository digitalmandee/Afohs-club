'use client';

import SideNav from '@/components/App/SideBar/SideNav';
import { router, useForm } from '@inertiajs/react';
import { Add, ArrowBack, Delete, ExpandMore } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Container,
    FormControl,
    Grid,
    IconButton,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    TextField,
    Typography,
} from '@mui/material';
import { useState } from 'react';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const NewFloor = ({ floorInfo }) => {
    const [open, setOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(true);
    const [isFloorExpanded, setIsFloorExpanded] = useState(true);
    const [isTableExpanded, setIsTableExpanded] = useState(true);
    const [duplicateError, setDuplicateError] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success', // 'success' | 'error' | 'info' | 'warning'
    });

    const { data, setData, post, processing, errors, reset } = useForm({
        floors: floorInfo ? [{ name: floorInfo.name, area: floorInfo.area }] : [{ name: '', area: '' }],
        tables:
            floorInfo && floorInfo.tables && floorInfo.tables.length > 0
                ? floorInfo.tables.map((t) => ({
                      table_no: t.table_no,
                      capacity: t.capacity,
                  }))
                : [{ table_no: '', capacity: '2 Person' }],
    });
    // Snackbar popup handle
    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // Handle input changes for floors
    const handleFloorChange = (index, key, value) => {
        const updatedFloors = [...data.floors];
        updatedFloors[index][key] = value;
        setData('floors', updatedFloors);
    };

    // Handle input changes for tables
    const handleTableChange = (index, key, value) => {
        const updatedTables = [...data.tables];
        updatedTables[index][key] = value;
        setData('tables', updatedTables);
    };
    // remove table
    const removeTable = (index) => {
        const updatedTables = data.tables.filter((_, i) => i !== index);
        setData('tables', updatedTables);
    };
    // remove floor
    const removeFloor = (index) => {
        const updatedFloors = data.floors.filter((_, i) => i !== index);
        setData('floors', updatedFloors);
    };

    const addNewTable = () => {
        setData('tables', [...data.tables, { table_no: '', capacity: '2 Person' }]);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleSaveFloorAndTable = () => {
        const hasEmptyFields = data.floors.some((f) => !f.name.trim() || !f.area.trim()) || data.tables.some((t) => !t.table_no.trim());

        const tableNumbers = data.tables.map((t) => t.table_no.trim());
        const hasDuplicateTableNumbers = new Set(tableNumbers).size !== tableNumbers.length;

        if (hasEmptyFields) {
            alert('Please fill all fields before saving.');
            return;
        }

        if (hasDuplicateTableNumbers) {
            setDuplicateError(true);
            return;
        }

        // console.log('Data to be sent:', data);

        if (data.id) {
            // Update existing floor
            router.put(route('floors.update', data.id), data, {
                onSuccess: () => {
                    reset();
                    setModalOpen(false);
                    setSnackbar({ open: true, message: 'Floor updated successfully!', severity: 'success' });
                    router.visit(route('table.management'));
                },
                onError: () => {
                    setSnackbar({ open: true, message: 'Failed to update floor.', severity: 'error' });
                },
            });
        } else {
            // Create new floor
            router.post(route('floors.store'), data, {
                onSuccess: () => {
                    reset();
                    setModalOpen(false);
                    setSnackbar({ open: true, message: 'Floor created successfully!', severity: 'success' });
                    router.visit(route('table.management'));
                },
                onError: () => {
                    setSnackbar({ open: true, message: 'Failed to create floor.', severity: 'error' });
                },
            });
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
                <Container maxWidth="xl" sx={{ height: '100vh', py: 1, px: 2 }}>
                    <Box
                        sx={{
                            height: 'calc(100% - 20px)',
                            width: '100%',
                            bgcolor: '#0d3b5c',
                            position: 'relative',
                            overflow: 'hidden',
                            borderRadius: 3,
                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        {/* Header */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                p: 2,
                                display: 'flex',
                                alignItems: 'center',
                                zIndex: 1,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    bgcolor: 'white',
                                    mr: 1.5,
                                }}
                            />
                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                                Untitled Floor • Untitled Area
                            </Typography>
                        </Box>

                        {/* Grid pattern */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
                                backgroundSize: '20px 20px',
                            }}
                        />

                        {/* Center message */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                textAlign: 'center',
                                maxWidth: 250,
                                display: modalOpen ? 'none' : 'block', // Hide when modal is open
                            }}
                        >
                            <Typography variant="body2" sx={{ color: 'white' }}>
                                You need to fill out the properties form to view table at here
                            </Typography>
                        </Box>

                        {/* Right side modal - positioned inside the blue container */}
                        {modalOpen && (
                            <Paper
                                elevation={4}
                                sx={{
                                    position: 'absolute',
                                    top: 5,
                                    right: 10,
                                    bottom: 5,
                                    width: 400,
                                    borderTopLeftRadius: 12,
                                    borderBottomLeftRadius: 12,
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    boxShadow: '-4px 0 10px rgba(0, 0, 0, 0.15)',
                                }}
                            >
                                {/* Header */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        p: 2,
                                        borderBottom: '1px solid #e0e0e0',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <IconButton size="small" sx={{ mr: 1 }} onClick={handleCloseModal}>
                                            <ArrowBack fontSize="small" />
                                        </IconButton>
                                        <Typography variant="subtitle1">Add New Floor</Typography>
                                    </Box>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={handleSaveFloorAndTable}
                                        disabled={processing}
                                        sx={{ bgcolor: '#0d3b5c', '&:hover': { bgcolor: '#0a2e4a' }, textTransform: 'none', px: 3 }}
                                    >
                                        {processing ? 'Saving...' : 'Save'}
                                    </Button>
                                </Box>

                                {/* Floor List Section */}
                                <Box sx={{ p: 2 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mb: 2,
                                        }}
                                    >
                                        <Typography variant="subtitle2">Floor List</Typography>
                                        <IconButton size="small" onClick={() => setIsFloorExpanded(!isFloorExpanded)}>
                                            <ExpandMore
                                                fontSize="small"
                                                sx={{ transform: isFloorExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }}
                                            />
                                        </IconButton>
                                    </Box>
                                    {isFloorExpanded && (
                                        <>
                                            {data.floors.map((floor, index) => (
                                                <Grid container spacing={2} alignItems="center" key={index} sx={{ mt: 0.5 }}>
                                                    <Grid item xs={5}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Floor Name
                                                        </Typography>
                                                        <TextField
                                                            size="small"
                                                            value={floor.name}
                                                            onChange={(e) => handleFloorChange(index, 'name', e.target.value)}
                                                            fullWidth
                                                        />
                                                    </Grid>
                                                    <Grid item xs={5}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Floor Area
                                                        </Typography>
                                                        <TextField
                                                            size="small"
                                                            value={floor.area}
                                                            onChange={(e) => handleFloorChange(index, 'area', e.target.value)}
                                                            fullWidth
                                                        />
                                                    </Grid>
                                                </Grid>
                                            ))}
                                        </>
                                    )}
                                </Box>

                                {/* Table List Section */}
                                <Box sx={{ p: 2 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mb: 2,
                                        }}
                                    >
                                        <Typography variant="subtitle2">Table List ({data.tables.length})</Typography>
                                        <IconButton size="small" onClick={() => setIsTableExpanded(!isTableExpanded)}>
                                            <ExpandMore
                                                fontSize="small"
                                                sx={{ transform: isTableExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }}
                                            />
                                        </IconButton>
                                    </Box>

                                    {data.tables.map((table, index) => (
                                        <Grid container spacing={2} alignItems="center" key={index} sx={{ mt: 0.5 }}>
                                            <Grid item xs={5}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Table Number
                                                </Typography>
                                                <TextField
                                                    size="small"
                                                    value={table.table_no}
                                                    onChange={(e) => handleTableChange(index, 'table_no', e.target.value)}
                                                    fullWidth
                                                />
                                            </Grid>
                                            <Grid item xs={5}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Capacity
                                                </Typography>
                                                <FormControl fullWidth size="small">
                                                    <Select
                                                        value={table.capacity}
                                                        onChange={(e) => handleTableChange(index, 'capacity', e.target.value)}
                                                    >
                                                        <MenuItem value="2 Person">2 Person</MenuItem>
                                                        <MenuItem value="4 Person">4 Person</MenuItem>
                                                        <MenuItem value="6 Person">6 Person</MenuItem>
                                                        <MenuItem value="8 Person">8 Person</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={2} sx={{ textAlign: 'center' }}>
                                                <IconButton size="small" onClick={() => removeTable(index)}>
                                                    <Delete fontSize="small" sx={{ color: '#d32f2f' }} />
                                                </IconButton>
                                            </Grid>
                                        </Grid>
                                    ))}
                                    <Button startIcon={<Add />} onClick={addNewTable}>
                                        Add Table
                                    </Button>
                                </Box>
                            </Paper>
                        )}
                    </Box>
                </Container>
            </div>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default NewFloor;
