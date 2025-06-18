import SideNav from '@/components/App/AdminSideBar/SideNav';
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    Container, Row, Col, Card, Button, Form
} from 'react-bootstrap';
import {
    ArrowBack, People, CheckCircle, Timer, Cancel,
    BarChart, EventNote, CardMembership, Fastfood, Print,
    CalendarToday
} from '@mui/icons-material';
import {
    IconButton, TextField, InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import { router } from '@inertiajs/react';
import InvoiceSlip from '../Subscription/Invoice';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const Dashboard = ({ FinancialInvoice }) => {
    const [open, setOpen] = useState(true);
    const [date, setDate] = useState('Apr-2025');
    const [openInvoiceModal, setOpenInvoiceModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    console.log('FinancialInvoice:', FinancialInvoice);

    // Calculate metrics from FinancialInvoice
    const totalMembers = new Set(FinancialInvoice?.map(i => i.member_id).filter(id => id !== null)).size;
    const activeMembers = FinancialInvoice?.filter(i => i.data?.status === 'in_active' && new Date(i.data?.expiry_date) > new Date()).length || 0;
    const expiredMembers = FinancialInvoice?.filter(i => i.data?.expiry_date && new Date(i.data.expiry_date) <= new Date()).length || 0;
    const canceledMembers = FinancialInvoice?.filter(i => i.status === 'unpaid' && i.data?.expiry_date && new Date(i.data.expiry_date) <= new Date()).length || 0;
    const totalRevenue = FinancialInvoice?.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.paid_amount, 0) || 0;

    // Format number with commas
    const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

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
                    <Container fluid>
                        {/* Header */}
                        <Row className="align-items-center mb-4">
                            <Col xs="auto">
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <h2 style={{ margin: 0, fontWeight: '500', color: '#3F4E4F', fontSize: '30px' }}>Finance Dashboard</h2>
                                    <pre>{JSON.stringify(FinancialInvoice, null, 2)}</pre>
                                </div>
                            </Col>
                            <Col className="d-flex justify-content-end align-items-center">
                                <div
                                    style={{
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        padding: '3px 10px',
                                        marginRight: '15px',
                                        backgroundColor: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        width: '250px',
                                    }}
                                >
                                    <TextField
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        variant="standard"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <CalendarToday fontSize="small" style={{ color: '#777' }} />
                                                </InputAdornment>
                                            ),
                                            disableUnderline: true,
                                        }}
                                        inputProps={{
                                            style: {
                                                textAlign: 'left',
                                                paddingRight: '8px',
                                                color: '#333',
                                                fontWeight: 500,
                                            },
                                        }}
                                        placeholder="Apr-2025"
                                        style={{ width: '220px' }}
                                    />
                                </div>

                                <Button
                                    style={{
                                        backgroundColor: '#063455',
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '5px',
                                        width: '200px',
                                        color: 'white',
                                    }}
                                    onClick={() => router.visit('/finance/add/transaction')}
                                >
                                    <span style={{ marginRight: '5px', fontSize: '20px' }}>+</span> Add Transaction
                                </Button>
                            </Col>
                        </Row>

                        {/* Metrics Cards - First Row */}
                        <Row className="mb-3 gx-2">
                            <Col md={3}>
                                <Card style={{ backgroundColor: '#3F4E4F', color: 'white', border: 'none' }}>
                                    <Card.Body className="text-center" style={{ height: '150px' }}>
                                        <div className="d-flex justify-content-center mb-2">
                                            <div style={{
                                                backgroundColor: '#202728',
                                                borderRadius: '50%',
                                                width: '40px',
                                                height: '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <People />
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '16px', color: '#C6C6C6', fontWeight: 400, marginBottom: '5px' }}>Total Members</div>
                                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF' }}>{totalMembers}</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card style={{ backgroundColor: '#3F4E4F', color: 'white', border: 'none' }}>
                                    <Card.Body className="text-center" style={{ height: '150px' }}>
                                        <div className="d-flex justify-content-center mb-2">
                                            <div style={{
                                                backgroundColor: '#202728',
                                                borderRadius: '50%',
                                                width: '40px',
                                                height: '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <CheckCircle />
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '16px', color: '#C6C6C6', fontWeight: 400, marginBottom: '5px' }}>Active Members</div>
                                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF' }}>{activeMembers}</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card style={{ backgroundColor: '#3F4E4F', color: 'white', border: 'none' }}>
                                    <Card.Body className="text-center" style={{ height: '150px' }}>
                                        <div className="d-flex justify-content-center mb-2">
                                            <div style={{
                                                backgroundColor: '#202728',
                                                borderRadius: '50%',
                                                width: '40px',
                                                height: '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Timer />
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '16px', color: '#C6C6C6', fontWeight: 400, marginBottom: '5px' }}>Expired Members</div>
                                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF' }}>{expiredMembers}</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card style={{ backgroundColor: '#3F4E4F', color: 'white', border: 'none' }}>
                                    <Card.Body className="text-center" style={{ height: '150px' }}>
                                        <div className="d-flex justify-content-center mb-2">
                                            <div style={{
                                                backgroundColor: '#202728',
                                                borderRadius: '50%',
                                                width: '40px',
                                                height: '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Cancel />
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '16px', color: '#C6C6C6', fontWeight: 400, marginBottom: '5px' }}>Canceled Members</div>
                                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF' }}>{canceledMembers}</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* Metrics Cards - Second Row */}
                        <Row className="mb-4 gx-2">
                            <Col md={3}>
                                <Card style={{ backgroundColor: '#3F4E4F', color: 'white', border: 'none' }}>
                                    <Card.Body style={{ height: '150px' }}>
                                        <div className="d-flex gap-3">
                                            <div style={{
                                                backgroundColor: '#202728',
                                                borderRadius: '50%',
                                                width: '40px',
                                                height: '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginTop: '10px'
                                            }}>
                                                <BarChart />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '16px', color: '#C6C6C6', fontWeight: 400, }}>Total Revenue</div>
                                                <div style={{ fontSize: '20px', fontWeight: 500, color: '#FFFFFF', marginBottom: '10px' }}>Pkr {formatNumber(totalRevenue)}</div>
                                            </div>
                                        </div>
                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                                            <div style={{ fontSize: '12px', color: '#C6C6C6', fontWeight: 400, marginTop: 10 }}>Total Expenses</div>
                                            <div style={{ fontSize: '18px', fontWeight: 500, color: '#FFFFFF' }}>Pkr 280,00</div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={3}>
                                <Card style={{ backgroundColor: '#3F4E4F', color: 'white', border: 'none' }}>
                                    <Card.Body style={{ height: '150px' }}>
                                        <div className="d-flex gap-3">
                                            <div style={{
                                                backgroundColor: '#202728',
                                                borderRadius: '50%',
                                                width: '40px',
                                                height: '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginTop: '10px'
                                            }}>
                                                <EventNote />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '16px', color: '#C6C6C6', fontWeight: 400 }}>Total Booking Revenue</div>
                                                <div style={{ fontSize: '20px', fontWeight: 500, color: '#FFFFFF', marginBottom: '10px' }}>Pkr 320,000</div>
                                            </div>
                                        </div>
                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                                            <Row>
                                                <Col>
                                                    <div style={{ fontSize: '12px', color: '#C6C6C6', fontWeight: 400, marginTop: 10 }}>Room Rev</div>
                                                    <div style={{ fontSize: '18px', fontWeight: 500, color: '#FFFFFF' }}>Pkr 280,00</div>
                                                </Col>
                                                <Col>
                                                    <div style={{ fontSize: '12px', color: '#C6C6C6', fontWeight: 400, marginTop: 10 }}>Event Rev</div>
                                                    <div style={{ fontSize: '18px', fontWeight: 500, color: '#FFFFFF' }}>Pkr 200,000</div>
                                                </Col>
                                            </Row>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={3}>
                                <Card style={{ backgroundColor: '#3F4E4F', color: 'white', border: 'none' }}>
                                    <Card.Body style={{ height: '150px' }}>
                                        <div className="d-flex gap-3">
                                            <div style={{
                                                backgroundColor: '#202728',
                                                borderRadius: '50%',
                                                width: '40px',
                                                height: '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginTop: '10px'
                                            }}>
                                                <CardMembership />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '16px', color: '#C6C6C6', fontWeight: 400 }}>Total Membership Revenue</div>
                                                <div style={{ fontSize: '20px', fontWeight: 500, marginBottom: '10px' }}>Pkr {formatNumber(totalRevenue)}</div>
                                            </div>
                                        </div>
                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '10px' }}>
                                            <div style={{ fontSize: '12px', fontWeight: 400, color: '#C6C6C6' }}>Subscription Revenue</div>
                                            <div style={{ fontSize: '18px', fontWeight: 500, color: '#FFFFFF' }}>Pkr {formatNumber(totalRevenue)}</div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={3}>
                                <Card style={{ backgroundColor: '#3F4E4F', color: 'white', border: 'none', }}>
                                    <Card.Body className="d-flex flex-column justify-content-center align-items-center" style={{ height: '150px' }}>
                                        <div className="d-flex justify-content-center mb-2">
                                            <div style={{
                                                backgroundColor: '#202728',
                                                borderRadius: '50%',
                                                width: '40px',
                                                height: '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Fastfood />
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '16px', color: '#C6C6C6', fontWeight: 500, marginTop: '10px' }}>Food Revenue</div>
                                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF' }}>Pkr 230,00</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* Recent Transactions */}
                        <Row className="mb-3">
                            <Col xs={6}>
                                <h5 style={{ fontWeight: '500', fontSize: '24px', color: '#000000' }}>Recent Transaction</h5>
                            </Col>
                            <Col xs={6} className="text-end">
                                <Button
                                    style={{
                                        backgroundColor: '#063455',
                                        border: 'none',
                                        padding: '8px 15px'
                                    }}
                                >
                                    <Print style={{ marginRight: '5px', fontSize: '18px' }} /> Print
                                </Button>
                            </Col>
                        </Row>

                        {/* Transactions Table */}
                        <Row>
                            <Col>
                                <TableContainer component={Paper} style={{ boxShadow: "none" }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow style={{ backgroundColor: "#E5E5EA", height: '60px' }}>
                                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Invoice ID</TableCell>
                                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Member</TableCell>
                                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Category</TableCell>
                                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Payment Type</TableCell>
                                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Amount</TableCell>
                                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Date</TableCell>
                                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Contact</TableCell>
                                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Added By</TableCell>
                                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Invoice</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {(FinancialInvoice || []).slice(0, 5).map((invoice) => (
                                                <TableRow key={invoice.id} style={{ borderBottom: "1px solid #eee" }}>
                                                    <TableCell
                                                        sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px', cursor: 'pointer' }}
                                                        onClick={() => {
                                                            setSelectMember(invoice); // save the clicked invoice
                                                            setOpenProfileModal(true); // open the modal
                                                        }}
                                                    >
                                                        {invoice.invoice_no}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                        {invoice.member_id}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                        {invoice.subscription_type || 'N/A'}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                        {invoice.payment_method.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                        {invoice.amount}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                        {new Date(invoice.payment_date).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 500, fontSize: '14px' }}>
                                                        {invoice.user?.phone_number ?? 'N/A'}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#7F7F7F', fontWeight: 500, fontSize: '14px' }}>
                                                        {invoice.user?.name ?? 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span
                                                            style={{
                                                                color: "#0C67AA",
                                                                textDecoration: "underline",
                                                                cursor: "pointer"
                                                            }}
                                                            onClick={() => {
                                                                setSelectedInvoice(invoice);
                                                                setOpenInvoiceModal(true);
                                                            }}
                                                        >
                                                            View
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Col>
                        </Row>
                    </Container>
                    <InvoiceSlip open={openInvoiceModal} onClose={() => setOpenInvoiceModal(false)} data={selectedInvoice} />
                </div>
            </div>
        </>
    );
};

export default Dashboard;
