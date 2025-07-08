import { useState } from 'react';
import SideNav from '@/components/App/SideBar/SideNav';
import { router, useForm } from '@inertiajs/react';
import { Add, ArrowBack, Delete, ExpandMore } from '@mui/icons-material';
import { Alert, Box, Button, Container, FormControl, Grid, IconButton, MenuItem, Paper, Select, Snackbar, TextField, Typography } from '@mui/material';
import Table10Icon from '@/components/App/Icons/CTable';
import Table1Icon from '@/components/App/Icons/Table1';
import Table2Icon from '@/components/App/Icons/Table2';
import Table6Icon from '@/components/App/Icons/Table6';
import Table8Icon from '@/components/App/Icons/Table8';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const NewFloor = ({ floorInfo }) => {
    const [open, setOpen] = useState(true);
    const [modalOpen, setModalOpen] = useState(true);
    const [isFloorExpanded, setIsFloorExpanded] = useState(true);
    const [isTableExpanded, setIsTableExpanded] = useState(true);
    const [duplicateError, setDuplicateError] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success', // 'success' | 'error' | 'info' | 'warning'
    });

    const { data, setData, post, put, processing, errors, reset } = useForm({
        floor: floorInfo ? { name: floorInfo.name || '', area: floorInfo.area || '' } : { name: '', area: '' },
        tables:
            floorInfo && floorInfo.tables && floorInfo.tables.length > 0
                ? floorInfo.tables.map((t) => ({
                      id: t.id,
                      original_table_no: t.table_no,
                      table_no: t.table_no || '',
                      capacity: t.capacity || '2',
                  }))
                : [],
    });

    // Snackbar popup handle
    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // Handle input changes for floors
    const handleFloorChange = (key, value) => {
        setData('floor', { ...data.floor, [key]: value });
    };

    // Handle input changes for tables
    const handleTableChange = (index, key, value) => {
        const updatedTables = [...data.tables];
        updatedTables[index][key] = value;
        setData('tables', updatedTables);
    };

    // Remove table
    const removeTable = (index) => {
        if (window.confirm('Are you sure you want to delete this table?')) {
            const updatedTables = data.tables.filter((_, i) => i !== index);
            setData('tables', updatedTables);
        }
    };

    const addNewTable = () => {
        setData('tables', [
            ...data.tables,
            {
                id: `new`,
                original_table_no: '',
                table_no: '',
                capacity: '2',
            },
        ]);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        // router.visit(route('table.management'));
    };

    const processTableData = () => {
        let updateCounter = 1;
        return data.tables.map((table) => {
            const idStr = String(table.id || ''); // ensure it's a string

            if (idStr.startsWith('new')) {
                return table; // Newly added table; already tagged
            }

            if (table.table_no !== table.original_table_no) {
                return {
                    ...table,
                    id: `update-${idStr}`,
                };
            }

            return table;
        });
    };

    const handleSaveFloorAndTable = () => {
        const hasEmptyFields = !data.floor.name.trim() || !data.floor.area.trim() || data.tables.some((t) => !t.table_no.trim());

        const tableNumbers = data.tables.map((t) => t.table_no.trim());
        const hasDuplicateTableNumbers = new Set(tableNumbers).size !== tableNumbers.length;

        if (hasEmptyFields) {
            setSnackbar({ open: true, message: 'Please fill all fields before saving.', severity: 'error' });
            return;
        }

        if (hasDuplicateTableNumbers) {
            setDuplicateError(true);
            setSnackbar({ open: true, message: 'Duplicate table numbers are not allowed.', severity: 'error' });
            return;
        }

        if (floorInfo && floorInfo.id) {
            const updatedData = {
                ...data,
                tables: processTableData(),
            };
            console.log(updatedData);

            // Update existing floor
            router.put(route('floors.update', floorInfo.id), updatedData, {
                onSuccess: () => {
                    reset();
                    setModalOpen(false);
                    setSnackbar({ open: true, message: 'Floor updated successfully!', severity: 'success' });
                    router.visit(route('table.management'));
                },
                onError: (err) => {
                    setSnackbar({ open: true, message: 'Failed to update floor.', severity: 'error' });
                    console.error('Update error:', err);
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
                onError: (err) => {
                    setSnackbar({ open: true, message: 'Failed to create floor.', severity: 'error' });
                    console.error('Create error:', err);
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
                            display: 'flex',
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
                            <Typography onClick={() => setModalOpen(true)} variant="body2" sx={{ color: 'white', cursor: 'pointer', fontWeight: 500 }}>
                                {data.floor.name ? (data.floor.area ? `${data.floor.name} • ${data.floor.area}` : `${data.floor.name} • Untitled Area`) : data.floor.area ? `Untitled Floor • ${data.floor.area}` : 'Untitled Floor • Untitled Area'}
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
                        {data.tables.length === 0 && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center',
                                    maxWidth: 250,
                                    // display: modalOpen ? 'none' : 'block',
                                }}
                            >
                                <Typography variant="body2" sx={{ color: 'white' }}>
                                    You need to fill out the properties form to view table at here
                                </Typography>
                            </Box>
                        )}

                        {data.tables.length > 0 && (
                            <Box
                                sx={{
                                    flexGrow: 1,
                                    position: 'relative',
                                    overflow: 'auto',
                                    top: 50,
                                    height: '100%',
                                    minHeight: 500,
                                    zIndex: 1,
                                }}
                            >
                                {/* First row of tables */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 10,
                                        left: 20,
                                        right: 20,
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        width: '100%',
                                        gap: '30px',
                                    }}
                                >
                                    {data && data?.tables.map((table, index) => <DraggableTable key={index} index={index} data={table} />)}
                                </Box>
                            </Box>
                        )}

                        {/* Right side modal */}
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
                                    overflow: 'auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    boxShadow: '-4px 0 10px rgba(0, 0, 0, 0.15)',
                                    zIndex: 2,
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
                                        <Typography variant="subtitle1">{floorInfo && floorInfo.id ? 'Edit Floor' : 'Add New Floor'}</Typography>
                                    </Box>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={handleSaveFloorAndTable}
                                        disabled={processing}
                                        sx={{
                                            bgcolor: '#0d3b5c',
                                            '&:hover': { bgcolor: '#0a2e4a' },
                                            textTransform: 'none',
                                            px: 3,
                                        }}
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
                                        }}
                                    >
                                        <Typography variant="subtitle2">Floor List</Typography>
                                        <IconButton size="small" onClick={() => setIsFloorExpanded(!isFloorExpanded)}>
                                            <ExpandMore
                                                fontSize="small"
                                                sx={{
                                                    transform: isFloorExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                                    transition: '0.3s',
                                                }}
                                            />
                                        </IconButton>
                                    </Box>
                                    {isFloorExpanded && (
                                        <>
                                            <Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
                                                <Grid item xs={5}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Floor Name
                                                    </Typography>
                                                    <TextField size="small" value={data.floor.name} onChange={(e) => handleFloorChange('name', e.target.value)} fullWidth error={!!errors[`floor.name`]} helperText={errors[`floor.name`]} />
                                                </Grid>
                                                <Grid item xs={5}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Floor Area
                                                    </Typography>
                                                    <TextField size="small" value={data.floor.area} onChange={(e) => handleFloorChange('area', e.target.value)} fullWidth error={!!errors[`floor.area`]} helperText={errors[`floor.area`]} />
                                                </Grid>
                                            </Grid>
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
                                                sx={{
                                                    transform: isTableExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                                    transition: '0.3s',
                                                }}
                                            />
                                        </IconButton>
                                    </Box>

                                    {isTableExpanded && (
                                        <>
                                            {data.tables.map((table, index) => (
                                                <Grid container spacing={2} alignItems="center" key={index} sx={{ mt: 0.5 }}>
                                                    <Grid item xs={5}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Table Number
                                                        </Typography>
                                                        <TextField size="small" value={table.table_no} onChange={(e) => handleTableChange(index, 'table_no', e.target.value)} fullWidth error={!!errors[`tables.${index}.table_no`]} helperText={errors[`tables.${index}.table_no`]} />
                                                    </Grid>
                                                    <Grid item xs={5}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Capacity
                                                        </Typography>
                                                        <FormControl fullWidth size="small">
                                                            <Select value={table.capacity} onChange={(e) => handleTableChange(index, 'capacity', e.target.value)} error={!!errors[`tables.${index}.capacity`]}>
                                                                <MenuItem value="2">2 Person</MenuItem>
                                                                <MenuItem value="4">4 Person</MenuItem>
                                                                <MenuItem value="6">6 Person</MenuItem>
                                                                <MenuItem value="8">8 Person</MenuItem>
                                                                <MenuItem value="10">10 Person</MenuItem>
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
                                        </>
                                    )}
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

const DraggableTable = ({ data, reservation, index, moveTable, onClick, fill }) => {
    // Determine text color based on reservation status
    const getTextColor = () => {
        if (fill === '#d1fae5') return '#059669';
        if (fill === '#cfe7ff') return '#3b82f6';
        return '#6b7280';
    };

    return (
        <Box
            onClick={onClick}
            sx={{
                // width,
                // height,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'move',
                transition: 'all 0.2s',
                '&:hover': {
                    transform: 'scale(1.02)',
                },
            }}
        >
            {data.capacity == 2 ? (
                <Table2Icon
                    style={{
                        height: '100%',
                        bgcolor: fill,
                    }}
                />
            ) : data.capacity == 4 ? (
                <Table1Icon
                    style={{
                        height: '100%',
                        bgcolor: fill,
                    }}
                />
            ) : data.capacity == 6 ? (
                <Table6Icon
                    style={{
                        height: '100%',
                        bgcolor: fill,
                    }}
                />
            ) : data.capacity == 8 ? (
                <Table8Icon
                    style={{
                        height: '100%',
                        bgcolor: fill,
                    }}
                />
            ) : data.capacity == 10 ? (
                <Table10Icon
                    style={{
                        height: '100%',
                        bgcolor: fill,
                    }}
                />
            ) : null}

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
                    {data.table_no}
                </Typography>
            </Box>
        </Box>
    );
};
