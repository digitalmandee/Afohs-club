import React, { useState, useEffect, useMemo } from 'react';
import { Box, Button, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, TableContainer } from '@mui/material';
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

const dialogStyles = `
.custom-dialog-right.modal-dialog {
  position: fixed;
  top: 20px;
  right: 20px;
  margin: 0;
  background-color: white;
  width: 400px;
  max-width: 400px;
  transform: none;
  z-index: 1050;
}

.custom-dialog-right .modal-content {
  height: auto;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  scrollbar-width: none;         /* Firefox */
  -ms-overflow-style: none;      /* IE 10+ */
}

.custom-dialog-right .modal-content::-webkit-scrollbar {
  display: none;                 /* Chrome, Safari */
}
.dialog-top-right {
  position: fixed !important;
  top: 20px !important;
  right: 20px !important;
  margin: 0 !important;
  background-color: white !important;
  transform: none !important;
  height: auto;
  max-height: calc(100vh - 40px); /* prevent going off screen */
  z-index: 1050;

}

.dialog-top-right .modal-dialog {
  margin: 0 !important;
  max-width: 600px !important;
  width: 600px !important;
}

.dialog-top-right .modal-content {
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  border-radius: 0px;
  border: 1px solid rgba(0,0,0,0.1);
  height: 100%;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none;  /* IE 10+ */
}

.dialog-top-right .modal-content::-webkit-scrollbar {
  display: none; /* Chrome, Safari */
}

@media (max-width: 600px) {
  .dialog-top-right .modal-dialog {
    width: 90% !important;
    max-width: 90% !important;
  }
}
`;

const Reservations = () => {
    const { reservations, filters } = usePage().props;

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
        if (selectedReservation) {
            router.post(route('reservations.cancel', selectedReservation.id)); // backend route
        }
        setShowCancelModal(false);
        setSelectedReservation(null);
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
                    <style>{dialogStyles}</style>
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
                                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredReservations.length > 0 ? (
                                        filteredReservations.map((reservation) => (
                                            <TableRow key={reservation.id} style={{ borderBottom: '1px solid #eee' }}>
                                                <TableCell>#{reservation.id}</TableCell>
                                                <TableCell>
                                                    {reservation.member?.full_name || 'N/A'} ({reservation.member?.membership_no})
                                                </TableCell>
                                                <TableCell>{reservation.date}</TableCell>
                                                <TableCell>
                                                    {reservation.start_time} - {reservation.end_time}
                                                </TableCell>
                                                <TableCell>{reservation.person_count}</TableCell>
                                                <TableCell>{reservation.table?.table_no || 'N/A'}</TableCell>
                                                <TableCell>{reservation.status}</TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {/* Show only if pending */}
                                                        {reservation.status === 'pending' && (
                                                            <>
                                                                <Button onClick={() => router.visit(route('order.menu', { reservation_id: reservation.id, order_type: 'reservation' }))} size="small" variant="contained" color="primary" startIcon={<ShoppingCartIcon />}></Button>
                                                            </>
                                                        )}
                                                        <Button onClick={() => handleInvoiceClick(reservation)} size="small" variant="contained" color="secondary" startIcon={<ReceiptLongIcon />}></Button>
                                                        <Button size="small" variant="outlined" color="error" startIcon={<CancelIcon />} onClick={() => handleCancelClick(reservation)}></Button>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center">
                                                No reservations found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                    {/* Invoice Modal */}
                    <Modal show={showInvoiceModal} onHide={() => setShowInvoiceModal(false)} dialogClassName="dialog-top-right" centered>
                        <Modal.Header style={{ padding: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Modal.Title>
                                <Typography variant="h6" fontWeight={600}>
                                    Reservation Invoice
                                </Typography>
                            </Modal.Title>

                            <Button onClick={() => setShowInvoiceModal(false)} size="small">
                                <CloseIcon />
                            </Button>
                        </Modal.Header>
                        <Modal.Body>
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
                                    <p>Restaurant: {selectedInvoice.restaurant?.name || 'Dhaba'}</p>
                                    <p>Table: {selectedInvoice.table?.table_no || 'N/A'}</p>
                                    <p>Name: {selectedInvoice.member?.full_name}</p>
                                    <p>Type: {selectedInvoice.member?.member_type?.name || 'Member'}</p>
                                    <p>Contact: {selectedInvoice.member?.mobile_number_a}</p>
                                    <hr />
                                    <h6>Advance Paid: {selectedInvoice.down_payment || '0'}</h6>
                                    <p style={{ fontSize: '12px', marginTop: '10px' }}>Thank you for making a reservation at AFOHS Club!</p>
                                </div>
                            )}
                        </Modal.Body>
                        <Modal.Footer style={{ display: 'flex', justifyContent: 'center', padding: 8 }}>
                            <Button variant="contained" color="primary" onClick={() => handlePrintReceipt(selectedInvoice)}>
                                Print / Download PDF
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    {/* Cancel Confirmation Modal */}
                    <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
                        <Modal.Header style={{ padding: 8 }}>
                            <Modal.Title sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                Cancel Reservation{' '}
                                <Button onClick={() => setShowCancelModal(false)} size="small">
                                    <CloseIcon />
                                </Button>
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body style={{ padding: 8 }}>Are you sure you want to cancel reservation #{selectedReservation?.id}?</Modal.Body>
                        <Modal.Footer style={{ padding: 8 }}>
                            <Button variant="outlined" onClick={() => setShowCancelModal(false)}>
                                No
                            </Button>
                            <Button variant="contained" color="error" onClick={confirmCancel}>
                                Yes, Cancel
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    {/* Filter Drawer */}
                    <Modal show={showFilter} onHide={handleFilterClose} dialogClassName="custom-dialog-right" backdrop={true} keyboard={true}>
                        <Modal.Body style={{ padding: 0, height: '100vh', overflowY: 'auto' }}>
                            <ReservationFilter onClose={handleFilterClose} />
                        </Modal.Body>
                    </Modal>
                </Box>
            </div>
        </>
    );
};

export default Reservations;
