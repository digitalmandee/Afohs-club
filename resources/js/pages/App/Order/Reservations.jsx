import React, { useState, useEffect, useMemo } from 'react';
import { Box, Button, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, TableContainer, Dialog, DialogTitle, DialogContent, DialogActions, Chip } from '@mui/material';
import { debounce } from 'lodash';
import { router, usePage } from '@inertiajs/react';
import SearchIcon from '@mui/icons-material/Search';
import FilterAlt from '@mui/icons-material/FilterAlt';
import ReservationFilter from '@/components/App/Reservation/Filter';
import SideNav from '@/components/App/SideBar/SideNav';
import { Modal } from 'react-bootstrap';
import { Close as CloseIcon } from '@mui/icons-material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CancelIcon from '@mui/icons-material/Cancel';
import { enqueueSnackbar } from 'notistack';

const Reservations = () => {
    const { reservations, filters,tenant } = usePage().props;


    const [open, setOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [filteredReservations, setFilteredReservations] = useState(reservations.data || []);
    const [showFilter, setShowFilter] = useState(false);

    // 🔹 Cancel Reservation State
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);

    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const handleInvoiceClick = (reservation) => {
        setSelectedInvoice(reservation);
        setShowInvoiceModal(true);
    };

    const debouncedSearch = useMemo(
        () =>
            debounce((value) => {
                router.get(route('reservations.index'), { search: value }, { preserveState: true });
            }, 500),
        [],
    );

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        debouncedSearch(e.target.value);
    };

    const handleFilterClose = () => setShowFilter(false);
    const handleFilterShow = () => setShowFilter(true);

    // 🔹 Handle cancel click
    const handleCancelClick = (reservation) => {
        setSelectedReservation(reservation);
        setShowCancelModal(true);
    };

    const confirmCancel = () => {
        if (!selectedReservation) return;

        router.post(
            route('reservations.cancel', selectedReservation.id),
            {},
            {
                onSuccess: () => {
                    setShowCancelModal(false);
                    setSelectedReservation(null);
                    enqueueSnackbar('Reservation cancelled successfully', { variant: 'success' });
                    // Optionally, refresh filteredReservations locally
                    setFilteredReservations((prev) => prev.map((r) => (r.id === selectedReservation.id ? { ...r, status: 'cancelled' } : r)));
                },
                onError: () => {
                    setShowCancelModal(false);
                    setSelectedReservation(null);
                },
            },
        );
    };

    useEffect(() => {
        setFilteredReservations(reservations.data || []);
    }, [reservations]);

    const handlePrintReceipt = (invoice) => {
        if (!invoice) return;

        const printWindow = window.open('', '_blank');
        const content = document.getElementById('invoice-content').innerHTML;

        printWindow.document.write(`
    <html>
      <head>
        <title>Invoice</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 300px; margin: auto; }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `);

        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 300);
    };

    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `240px` : `110px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5.5rem',
                }}
            >
                <Box sx={{ padding: '20px' }}>
                    {/* Header */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h4">Reservations</Typography>
                        <Box display="flex" gap={2}>
                            <Box sx={{ position: 'relative', width: '300px' }}>
                                <input
                                    type="text"
                                    name="search"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    placeholder="Search by member name..."
                                    style={{
                                        width: '100%',
                                        padding: '10px 0 10px 6px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                    }}
                                />
                                <SearchIcon sx={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                            </Box>
                            <Button
                                variant="outlined"
                                startIcon={<FilterAlt />}
                                onClick={handleFilterShow}
                                style={{
                                    border: '1px solid #063455',
                                    borderRadius: '0px',
                                    backgroundColor: 'transparent',
                                    color: '#495057',
                                }}
                            >
                                Filter
                            </Button>
                        </Box>
                    </Box>

                    {/* Table */}
                    <Paper>
                        <TableContainer sx={{ marginTop: '20px' }} component={Paper} style={{ boxShadow: 'none' }}>
                            <Table>
                                <TableHead>
                                    <TableRow style={{ backgroundColor: '#E5E5EA', height: '60px' }}>
                                        <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Member</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Persons</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Table</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Down Payment</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Nature of Function</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Theme</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Special Request</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredReservations.length > 0 ? (
                                        filteredReservations.map((reservation) => (
                                            <TableRow key={reservation.id} style={{ borderBottom: '1px solid #eee' }}>
                                                <TableCell>#{reservation.id}</TableCell>
                                                <TableCell>{reservation.member ? `${reservation.member?.full_name} (${reservation.member?.membership_no})` : `${reservation.customer?.name}`}</TableCell>
                                                <TableCell>{reservation.date}</TableCell>
                                                <TableCell>
                                                    {reservation.start_time} - {reservation.end_time}
                                                </TableCell>
                                                <TableCell>{reservation.person_count}</TableCell>
                                                <TableCell>{reservation.table?.table_no || 'N/A'}</TableCell>
                                                <TableCell>Rs {reservation.down_payment || '0'}</TableCell>
                                                <TableCell>{reservation.nature_of_function || '-'}</TableCell>
                                                <TableCell>{reservation.theme_of_function || '-'}</TableCell>
                                                <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {reservation.special_request || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={reservation.status} 
                                                        size="small"
                                                        color={reservation.status === 'pending' ? 'warning' : reservation.status === 'confirmed' ? 'success' : 'error'}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {/* Show only if pending */}
                                                        {reservation.status === 'pending' && (
                                                            <>
                                                                <Button onClick={() => router.visit(route('order.menu', { reservation_id: reservation.id, order_type: 'reservation' }))} size="small" variant="contained" color="primary" startIcon={<ShoppingCartIcon />}></Button>
                                                            </>
                                                        )}
                                                        <Button onClick={() => handleInvoiceClick(reservation)} size="small" variant="contained" color="secondary" startIcon={<ReceiptLongIcon />}></Button>
                                                        <Button disabled={reservation.status === 'cancelled'} size="small" variant="outlined" color="error" startIcon={<CancelIcon />} onClick={() => handleCancelClick(reservation)}></Button>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={12} align="center">
                                                No reservations found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                    {/* Invoice Modal */}
                    <Dialog
                        open={showInvoiceModal}
                        onClose={() => setShowInvoiceModal(false)}
                        maxWidth="sm"
                        fullWidth
                        PaperProps={{
                            sx: {
                                position: 'fixed',
                                top: '20px',
                                right: '20px',
                                margin: 0,
                                borderRadius: 2,
                                boxShadow: 5,
                                overflowY: 'auto',
                                maxHeight: 'calc(100vh - 40px)',
                            },
                        }}
                    >
                        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
                            Reservation Invoice
                            <Button onClick={() => setShowInvoiceModal(false)} size="small">
                                <CloseIcon />
                            </Button>
                        </DialogTitle>
                        <DialogContent dividers>
                            {selectedInvoice && (
                                <div id="invoice-content" style={{ padding: '10px', fontFamily: 'Arial' }}>
                                    <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                                        <img src="/assets/Logo.png" alt="AFOHS Logo" style={{ height: '60px' }} />
                                        <h5 style={{ margin: '5px 0' }}>AFOHS CLUB</h5>
                                        <p style={{ fontSize: '12px' }}>Enjoy the Pride</p>
                                        <p style={{ fontSize: '12px' }}>PAF Falcon Complex</p>
                                    </div>

                                    <h6 style={{ textAlign: 'center', margin: '10px 0' }}>RESERVATION INVOICE</h6>

                                    <p>Reservation #: {selectedInvoice.id}</p>
                                    <p>Invoice Date: {selectedInvoice.date}</p>
                                    <p>
                                        Time: {selectedInvoice.start_time} - {selectedInvoice.end_time}
                                    </p>
                                    <p>Restaurant: {tenant.name}</p>
                                    <p>Table: {selectedInvoice.table?.table_no || 'N/A'}</p>
                                    <p>Name: {selectedInvoice.member?.full_name || selectedInvoice.customer?.name}</p>
                                    <p>Type: {selectedInvoice.member?.member_type?.name || 'Member'}</p>
                                    <p>Contact: {selectedInvoice.member?.mobile_number_a || selectedInvoice.customer?.contact}</p>
                                    <hr />
                                    <h6>Advance Paid: {selectedInvoice.down_payment || '0'}</h6>
                                    <p style={{ fontSize: '12px', marginTop: '10px' }}>Thank you for making a reservation at AFOHS Club!</p>
                                </div>
                            )}
                        </DialogContent>
                        <DialogActions sx={{ justifyContent: 'center', p: 1 }}>
                            <Button variant="contained" color="primary" onClick={() => handlePrintReceipt(selectedInvoice)}>
                                Print / Download PDF
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Cancel Confirmation Modal */}
                    <Dialog open={showCancelModal} onClose={() => setShowCancelModal(false)} maxWidth="xs" fullWidth>
                        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
                            Cancel Reservation
                            <Button onClick={() => setShowCancelModal(false)} size="small">
                                <CloseIcon />
                            </Button>
                        </DialogTitle>
                        <DialogContent>Are you sure you want to cancel reservation #{selectedReservation?.id}?</DialogContent>
                        <DialogActions>
                            <Button variant="outlined" onClick={() => setShowCancelModal(false)}>
                                No
                            </Button>
                            <Button variant="contained" color="error" onClick={confirmCancel}>
                                Yes, Cancel
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Filter Drawer */}
                    <Dialog
                        open={showFilter}
                        onClose={handleFilterClose}
                        PaperProps={{
                            sx: {
                                position: 'fixed',
                                top: 0,
                                right: 0,
                                margin: 0,
                                height: '100vh',
                                width: 400,
                                maxWidth: '90vw',
                                borderRadius: 0,
                                overflowY: 'auto',
                            },
                        }}
                    >
                        <DialogContent sx={{ p: 0 }}>
                            <ReservationFilter onClose={handleFilterClose} />
                        </DialogContent>
                    </Dialog>
                </Box>
            </div>
        </>
    );
};
Reservations.layout = (page) => page;
export default Reservations;
