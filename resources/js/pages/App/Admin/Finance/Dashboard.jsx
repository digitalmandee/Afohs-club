import SideNav from '@/components/App/AdminSideBar/SideNav';
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  Container, Row, Col, Card, Button, Table, Form
} from 'react-bootstrap';
import {
  ArrowBack, People, CheckCircle, Timer, Cancel,
  BarChart, EventNote, CardMembership, Fastfood, Print,
  CalendarToday
} from '@mui/icons-material';
import {
  IconButton, TextField, InputAdornment
} from '@mui/material';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const Dashboard = () => {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState('Apr-2025');
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
                                    <ArrowBack style={{ color: '#555', marginRight: '15px', cursor: 'pointer' }} />
                                    <h2 style={{ margin: 0, fontWeight: '500', color: '#333' }}>Finance Dashboard</h2>
                                </div>
                            </Col>
                            <Col className="d-flex justify-content-end align-items-center">
                                <div style={{
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    padding: '8px 15px',
                                    marginRight: '15px',
                                    backgroundColor: 'white',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
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
                                            disableUnderline: true
                                        }}
                                        style={{ width: '100px' }}
                                    />
                                </div>
                                <Button
                                    style={{
                                        backgroundColor: '#0a3d62',
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '10px 15px'
                                    }}
                                >
                                    <span style={{ marginRight: '5px', fontSize: '20px' }}>+</span> Add Transaction
                                </Button>
                            </Col>
                        </Row>

                        {/* Metrics Cards - First Row */}
                        <Row className="mb-3">
                            <Col md={3}>
                                <Card style={{ backgroundColor: '#2c3e50', color: 'white', border: 'none' }}>
                                    <Card.Body className="text-center py-4">
                                        <div className="d-flex justify-content-center mb-2">
                                            <div style={{
                                                backgroundColor: 'rgba(255,255,255,0.1)',
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
                                        <div style={{ fontSize: '14px', marginBottom: '5px' }}>Total Members</div>
                                        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>30</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card style={{ backgroundColor: '#2c3e50', color: 'white', border: 'none' }}>
                                    <Card.Body className="text-center py-4">
                                        <div className="d-flex justify-content-center mb-2">
                                            <div style={{
                                                backgroundColor: 'rgba(255,255,255,0.1)',
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
                                        <div style={{ fontSize: '14px', marginBottom: '5px' }}>Active Members</div>
                                        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>20</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card style={{ backgroundColor: '#2c3e50', color: 'white', border: 'none' }}>
                                    <Card.Body className="text-center py-4">
                                        <div className="d-flex justify-content-center mb-2">
                                            <div style={{
                                                backgroundColor: 'rgba(255,255,255,0.1)',
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
                                        <div style={{ fontSize: '14px', marginBottom: '5px' }}>Expired Members</div>
                                        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>05</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card style={{ backgroundColor: '#2c3e50', color: 'white', border: 'none' }}>
                                    <Card.Body className="text-center py-4">
                                        <div className="d-flex justify-content-center mb-2">
                                            <div style={{
                                                backgroundColor: 'rgba(255,255,255,0.1)',
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
                                        <div style={{ fontSize: '14px', marginBottom: '5px' }}>Canceled Members</div>
                                        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>05</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* Metrics Cards - Second Row */}
                        <Row className="mb-4">
                            <Col md={3}>
                                <Card style={{ backgroundColor: '#2c3e50', color: 'white', border: 'none' }}>
                                    <Card.Body className="py-3">
                                        <div className="d-flex gap-3">
                                            <div style={{
                                                backgroundColor: 'rgba(255,255,255,0.1)',
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
                                                <div style={{ fontSize: '14px' }}>Total Revenue</div>
                                                <div style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '15px' }}>Pkr 320,000</div>
                                            </div>
                                        </div>
                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '10px' }}>
                                            <div style={{ fontSize: '14px' }}>Total Expenses</div>
                                            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Pkr 280,00</div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={3}>
                                <Card style={{ backgroundColor: '#2c3e50', color: 'white', border: 'none' }}>
                                    <Card.Body className="py-3">
                                        <div className="d-flex gap-3">
                                            <div style={{
                                                backgroundColor: 'rgba(255,255,255,0.1)',
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
                                                <div style={{ fontSize: '14px' }}>Total Booking Revenue</div>
                                                <div style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '15px' }}>Pkr 320,000</div>
                                            </div>
                                        </div>
                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '10px' }}>
                                            <Row>
                                                <Col>
                                                    <div style={{ fontSize: '14px' }}>Room Rev</div>
                                                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Pkr 280,00</div>
                                                </Col>
                                                <Col>
                                                    <div style={{ fontSize: '14px' }}>Event Rev</div>
                                                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Pkr 200,000</div>
                                                </Col>
                                            </Row>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={3}>
                                <Card style={{ backgroundColor: '#2c3e50', color: 'white', border: 'none' }}>
                                    <Card.Body className="py-3">
                                        <div className="d-flex gap-3">
                                            <div style={{
                                                backgroundColor: 'rgba(255,255,255,0.1)',
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
                                                <div style={{ fontSize: '14px' }}>Total Membership Revenue</div>
                                                <div style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '15px' }}>Pkr 320,000</div>
                                            </div>
                                        </div>
                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '10px' }}>
                                            <div style={{ fontSize: '14px' }}>Subscription Revenue</div>
                                            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Pkr 280,00</div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={3}>
                                <Card style={{ backgroundColor: '#2c3e50', color: 'white', border: 'none', }}>
                                    <Card.Body className="py-3 d-flex flex-column justify-content-center align-items-center">
                                        <div className="d-flex justify-content-center mb-3">
                                            <div style={{
                                                backgroundColor: 'rgba(255,255,255,0.1)',
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
                                        <div style={{ fontSize: '14px', marginBottom: '18px' }}>Food Revenue</div>
                                        <div style={{ fontSize: '22px', fontWeight: 'bold' }}>Pkr 230,00</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>


                        {/* Recent Transactions */}
                        <Row className="mb-3">
                            <Col xs={6}>
                                <h5 style={{ fontWeight: '500', color: '#333' }}>Recent Transaction</h5>
                            </Col>
                            <Col xs={6} className="text-end">
                                <Button
                                    style={{
                                        backgroundColor: '#0a3d62',
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
                                <Table>
                                    <thead>
                                        <tr>
                                            <th>Invoice ID</th>
                                            <th>Name</th>
                                            <th>Category</th>
                                            <th>Payment type</th>
                                            <th>Amount</th>
                                            <th>Date</th>
                                            <th>Contact</th>
                                            <th>Added By</th>
                                            <th>Invoice</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>12324</td>
                                            <td>Zahid Ullah</td>
                                            <td>Supplier</td>
                                            <td>Cash</td>
                                            <td>5000</td>
                                            <td>10-Jul-2025<br />at 8:00 PM</td>
                                            <td>0236546534</td>
                                            <td>Admin</td>
                                            <td>
                                                <Button size="sm" style={{ backgroundColor: '#0a3d62', border: 'none', fontSize: '12px' }}>
                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                                            <td>32423</td>
                                            <td>Utility Bill</td>
                                            <td>Electricity</td>
                                            <td>Cash</td>
                                            <td>4000</td>
                                            <td>10-Jul-2025<br />at 8:00 PM</td>
                                            <td>0324234243</td>
                                            <td>Admin</td>
                                            <td>
                                                <Button size="sm" style={{ backgroundColor: '#0a3d62', border: 'none', fontSize: '12px' }}>
                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>32423</td>
                                            <td>Utility Bill</td>
                                            <td>Electricity</td>
                                            <td>Cash</td>
                                            <td>4000</td>
                                            <td>10-Jul-2025<br />at 8:00 PM</td>
                                            <td>0324234243</td>
                                            <td>Admin</td>
                                            <td>
                                                <Button size="sm" style={{ backgroundColor: '#0a3d62', border: 'none', fontSize: '12px' }}>
                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
