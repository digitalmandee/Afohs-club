import SideNav from '@/components/App/AdminSideBar/SideNav';
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { People, CheckCircle, Timer, Cancel, BarChart, EventNote, CardMembership, Fastfood, Print } from '@mui/icons-material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { router } from '@inertiajs/react';
import InvoiceSlip from '../Subscription/Invoice';
import axios from 'axios';

import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const Dashboard = ({ statistics, recent_transactions }) => {
    const [open, setOpen] = useState(true);
    const [date, setDate] = useState('Apr-2025');
    const [openInvoiceModal, setOpenInvoiceModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    // Extract statistics from backend
    const {
        total_members = 0,
        active_members = 0,
        expired_members = 0,
        canceled_members = 0,
        total_revenue = 0,
        total_expenses = 0,
        room_revenue = 0,
        event_revenue = 0,
        total_membership_revenue = 0,
        subscription_fee_revenue = 0,
        food_revenue = 0,
        total_booking_revenue = 0,
    } = statistics || {};

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
                                    <h2 style={{ margin: 0, fontWeight: '500', color: '#063455', fontSize: '30px' }}>Finance Dashboard</h2>
                                    {/* <pre>{JSON.stringify(FinancialInvoice, null, 2)}</pre> */}
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
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DemoContainer components={['DatePicker']}>
                                            <DatePicker
                                                views={['month']}
                                                // views={['year', 'month']},
                                                label="Select Month"
                                                sx={{ width: '100%' }}
                                                format="MMM-YYYY"
                                                value={dayjs(date)}
                                                onChange={(newValue) => setDate(newValue)}
                                                slotProps={{
                                                    textField: {
                                                        size: 'small',
                                                        sx: {
                                                            '& .MuiInputBase-root': {
                                                                height: 40,
                                                            },
                                                        },
                                                    },
                                                }}
                                            />
                                        </DemoContainer>
                                    </LocalizationProvider>
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
                                    onClick={() => router.visit(route('finance.transaction.create'))}
                                >
                                    <span style={{ marginRight: '5px', fontSize: '20px' }}>+</span> Add Transaction
                                </Button>
                            </Col>
                        </Row>

                        {/* Metrics Cards - First Row */}
                        <Row className="mb-3 gx-2">
                            <Col md={3}>
                                <Card style={{ backgroundColor: '#063455', color: 'white', border: 'none' }}>
                                    <Card.Body className="text-center" style={{ height: '150px' }}>
                                        <div className="d-flex justify-content-center mb-2">
                                            <div
                                                style={{
                                                    backgroundColor: '#202728',
                                                    borderRadius: '50%',
                                                    width: '40px',
                                                    height: '40px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <People />
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '16px', color: '#C6C6C6', fontWeight: 400, marginBottom: '5px' }}>Total Members</div>
                                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF' }}>{total_members}</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card style={{ backgroundColor: '#063455', color: 'white', border: 'none' }}>
                                    <Card.Body className="text-center" style={{ height: '150px' }}>
                                        <div className="d-flex justify-content-center mb-2">
                                            <div
                                                style={{
                                                    backgroundColor: '#202728',
                                                    borderRadius: '50%',
                                                    width: '40px',
                                                    height: '40px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <CheckCircle />
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '16px', color: '#C6C6C6', fontWeight: 400, marginBottom: '5px' }}>Active Members</div>
                                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF' }}>{active_members}</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card style={{ backgroundColor: '#063455', color: 'white', border: 'none' }}>
                                    <Card.Body className="text-center" style={{ height: '150px' }}>
                                        <div className="d-flex justify-content-center mb-2">
                                            <div
                                                style={{
                                                    backgroundColor: '#202728',
                                                    borderRadius: '50%',
                                                    width: '40px',
                                                    height: '40px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Timer />
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '16px', color: '#C6C6C6', fontWeight: 400, marginBottom: '5px' }}>Expired Members</div>
                                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF' }}>{expired_members}</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card style={{ backgroundColor: '#063455', color: 'white', border: 'none' }}>
                                    <Card.Body className="text-center" style={{ height: '150px' }}>
                                        <div className="d-flex justify-content-center mb-2">
                                            <div
                                                style={{
                                                    backgroundColor: '#202728',
                                                    borderRadius: '50%',
                                                    width: '40px',
                                                    height: '40px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Cancel />
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '16px', color: '#C6C6C6', fontWeight: 400, marginBottom: '5px' }}>Canceled Members</div>
                                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF' }}>{canceled_members}</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* Metrics Cards - Second Row */}
                        <Row className="mb-4 gx-2">
                            <Col md={3}>
                                <Card style={{ backgroundColor: '#063455', color: 'white', border: 'none' }}>
                                    <Card.Body style={{ height: '150px' }}>
                                        <div className="d-flex gap-3">
                                            <div
                                                style={{
                                                    backgroundColor: '#202728',
                                                    borderRadius: '50%',
                                                    width: '40px',
                                                    height: '40px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginTop: '10px',
                                                }}
                                            >
                                                <BarChart />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '16px', color: '#C6C6C6', fontWeight: 400 }}>Total Revenue</div>
                                                <div style={{ fontSize: '20px', fontWeight: 500, color: '#FFFFFF', marginBottom: '10px' }}>Rs {total_revenue?.toLocaleString() || 0}</div>
                                            </div>
                                        </div>
                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                                            <div style={{ fontSize: '12px', color: '#C6C6C6', fontWeight: 400, marginTop: 10 }}>Total Expenses</div>
                                            <div style={{ fontSize: '18px', fontWeight: 500, color: '#FFFFFF' }}>Rs {total_expenses?.toLocaleString() || 0}</div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={3}>
                                <Card style={{ backgroundColor: '#063455', color: 'white', border: 'none' }}>
                                    <Card.Body style={{ height: '150px' }}>
                                        <div className="d-flex gap-3">
                                            <div
                                                style={{
                                                    backgroundColor: '#202728',
                                                    borderRadius: '50%',
                                                    width: '40px',
                                                    height: '40px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginTop: '10px',
                                                }}
                                            >
                                                <EventNote />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '16px', color: '#C6C6C6', fontWeight: 400 }}>Total Booking Revenue</div>
                                                <div style={{ fontSize: '20px', fontWeight: 500, color: '#FFFFFF', marginBottom: '10px' }}>Rs {total_booking_revenue?.toLocaleString() || 0}</div>
                                            </div>
                                        </div>
                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                                            <Row>
                                                <Col>
                                                    <div style={{ fontSize: '12px', color: '#C6C6C6', fontWeight: 400, marginTop: 10 }}>Room Rev</div>
                                                    <div style={{ fontSize: '18px', fontWeight: 500, color: '#FFFFFF' }}>Rs {room_revenue?.toLocaleString() || 0}</div>
                                                </Col>
                                                <Col>
                                                    <div style={{ fontSize: '12px', color: '#C6C6C6', fontWeight: 400, marginTop: 10 }}>Event Rev</div>
                                                    <div style={{ fontSize: '18px', fontWeight: 500, color: '#FFFFFF' }}>Rs {event_revenue?.toLocaleString() || 0}</div>
                                                </Col>
                                            </Row>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={3}>
                                <Card style={{ backgroundColor: '#063455', color: 'white', border: 'none' }}>
                                    <Card.Body style={{ height: '150px' }}>
                                        <div className="d-flex gap-3">
                                            <div
                                                style={{
                                                    backgroundColor: '#202728',
                                                    borderRadius: '50%',
                                                    width: '40px',
                                                    height: '40px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginTop: '10px',
                                                }}
                                            >
                                                <CardMembership />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '16px', color: '#C6C6C6', fontWeight: 400 }}>Total Membership Rev</div>
                                                <div style={{ fontSize: '20px', fontWeight: 500, marginBottom: '10px' }}>Rs {total_membership_revenue?.toLocaleString() || 0}</div>
                                            </div>
                                        </div>
                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '10px' }}>
                                            <div style={{ fontSize: '12px', fontWeight: 400, color: '#C6C6C6' }}>Subscription Revenue</div>
                                            <div style={{ fontSize: '18px', fontWeight: 500, color: '#FFFFFF' }}>Rs {subscription_fee_revenue?.toLocaleString() || 0}</div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={3}>
                                <Card style={{ backgroundColor: '#063455', color: 'white', border: 'none' }}>
                                    <Card.Body className="d-flex flex-column justify-content-center align-items-center" style={{ height: '150px' }}>
                                        <div className="d-flex justify-content-center mb-2">
                                            <div
                                                style={{
                                                    backgroundColor: '#202728',
                                                    borderRadius: '50%',
                                                    width: '40px',
                                                    height: '40px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Fastfood />
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '16px', color: '#C6C6C6', fontWeight: 500, marginTop: '10px' }}>Food Revenue</div>
                                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF' }}>Rs {food_revenue?.toLocaleString() || 0}</div>
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
                                        padding: '8px 15px',
                                    }}
                                >
                                    <Print style={{ marginRight: '5px', fontSize: '18px' }} /> Print
                                </Button>
                            </Col>
                        </Row>

                        {/* Transactions Table */}
                        <Row>
                            <Col>
                                <TableContainer component={Paper} style={{ boxShadow: 'none' }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow style={{ backgroundColor: '#E5E5EA', height: '60px' }}>
                                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Invoice No</TableCell>
                                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Member</TableCell>
                                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Fee Type</TableCell>
                                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Amount</TableCell>
                                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Status</TableCell>
                                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Payment Method</TableCell>
                                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Date</TableCell>
                                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Valid Until</TableCell>
                                                <TableCell sx={{ color: '#000000', fontSize: '18px', fontWeight: 500 }}>Invoice</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {(recent_transactions || []).length > 0 ? (
                                                recent_transactions.slice(0, 5).map((transaction) => {
                                                    // Format fee type for display
                                                    const formatFeeType = (feeType) => {
                                                        if (!feeType) return 'N/A';
                                                        return feeType
                                                            .replace(/_/g, ' ')
                                                            .split(' ')
                                                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                            .join(' ');
                                                    };

                                                    // Format payment method
                                                    const formatPaymentMethod = (method) => {
                                                        if (!method) return 'N/A';
                                                        return method
                                                            .replace(/_/g, ' ')
                                                            .split(' ')
                                                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                            .join(' ');
                                                    };

                                                    // Format date
                                                    const formatDate = (date) => {
                                                        if (!date) return 'N/A';
                                                        try {
                                                            return new Date(date).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            });
                                                        } catch (e) {
                                                            return 'N/A';
                                                        }
                                                    };

                                                    // Get status badge style
                                                    const getStatusBadge = (status) => {
                                                        const styles = {
                                                            paid: { bg: '#d4edda', color: '#155724', text: 'Paid' },
                                                            unpaid: { bg: '#f8d7da', color: '#721c24', text: 'Unpaid' },
                                                            partial: { bg: '#fff3cd', color: '#856404', text: 'Partial' },
                                                            default: { bg: '#e2e3e5', color: '#383d41', text: status || 'N/A' }
                                                        };
                                                        return styles[status] || styles.default;
                                                    };

                                                    const statusStyle = getStatusBadge(transaction.status);

                                                    return (
                                                        <TableRow key={transaction.id} style={{ borderBottom: '1px solid #eee' }}>
                                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                                {transaction.invoice_no || 'N/A'}
                                                            </TableCell>
                                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                                <div>
                                                                    <div style={{ fontWeight: 500, color: '#000000' }}>
                                                                        {transaction.member?.full_name || transaction.customer?.name || 'N/A'}
                                                                    </div>
                                                                    {transaction.member?.membership_no && (
                                                                        <div style={{ fontSize: '12px', color: '#7F7F7F' }}>
                                                                            {transaction.member.membership_no}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                                <span style={{
                                                                    backgroundColor: '#e3f2fd',
                                                                    color: '#1976d2',
                                                                    padding: '4px 8px',
                                                                    borderRadius: '4px',
                                                                    fontSize: '12px',
                                                                    fontWeight: 500
                                                                }}>
                                                                    {formatFeeType(transaction.fee_type) || transaction.invoice_type || 'N/A'}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 500, fontSize: '14px' }}>
                                                                Rs {transaction.total_price?.toLocaleString() || transaction.amount?.toLocaleString() || 0}
                                                            </TableCell>
                                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                                <span style={{
                                                                    backgroundColor: statusStyle.bg,
                                                                    color: statusStyle.color,
                                                                    padding: '4px 8px',
                                                                    borderRadius: '4px',
                                                                    fontSize: '12px',
                                                                    fontWeight: 500
                                                                }}>
                                                                    {statusStyle.text.toUpperCase()}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                                {formatPaymentMethod(transaction.payment_method)}
                                                            </TableCell>
                                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                                {formatDate(transaction.payment_date || transaction.created_at)}
                                                            </TableCell>
                                                            <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>
                                                                {transaction.valid_to ? (
                                                                    <span style={{ 
                                                                        color: new Date(transaction.valid_to) > new Date() ? '#28a745' : '#dc3545',
                                                                        fontWeight: 500 
                                                                    }}>
                                                                        {formatDate(transaction.valid_to)}
                                                                    </span>
                                                                ) : (
                                                                    <span style={{ color: '#7F7F7F' }}>-</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <span
                                                                    style={{
                                                                        color: '#0C67AA',
                                                                        textDecoration: 'underline',
                                                                        cursor: 'pointer',
                                                                        fontWeight: 500
                                                                    }}
                                                                    onClick={() => {
                                                                        setSelectedInvoice(transaction);
                                                                        setOpenInvoiceModal(true);
                                                                    }}
                                                                >
                                                                    View
                                                                </span>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={9} align="center" sx={{ py: 4, color: '#7F7F7F' }}>
                                                        No recent transactions found
                                                    </TableCell>
                                                </TableRow>
                                            )}
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
