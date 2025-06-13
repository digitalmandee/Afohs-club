import React from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Modal } from 'react-bootstrap';
import { Box, Typography } from '@mui/material';
import { router } from '@inertiajs/react';
import HotelIcon from '@mui/icons-material/Hotel';
import PeopleIcon from '@mui/icons-material/People';
import BathtubIcon from '@mui/icons-material/Bathtub';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HistoryIcon from '@mui/icons-material/History';

const AvailableRooms = ({ data, type }) => {
    return (
        <>
            <Box sx={{ px: 2, py: 1, pt: 2 }}>
                <Typography sx={{ px: 2, fontSize: '20px', fontWeight: 500, color: '#121212' }}>{type === 'room' ? 'Available Rooms' : 'Available Events'}</Typography>

                <Box sx={{ p: 1, mt: 3, maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
                    {data && data.length > 0 ? (
                        data.map((item, index) => (
                            <div key={index} className="border mb-3 p-2" style={{ height: 88, border: '1px solid #E3E3E3' }} onClick={type === 'room' ? () => router.visit(route('rooms.booking')) : undefined}>
                                <Row style={{ cursor: 'pointer' }}>
                                    <Col xs={3}>
                                        <img src={item.image || '/placeholder.svg'} alt={type === 'room' ? item.type : item.name} style={{ width: 100, height: 67, borderRadius: '4px' }} />
                                    </Col>
                                    <Col xs={9}>
                                        {type === 'room' ? (
                                            <>
                                                <div className="d-flex justify-content-between">
                                                    <h5 style={{ fontWeight: 400, fontSize: '18px', color: '#121212', marginBottom: '5px' }}>{item.type}</h5>
                                                    <div>
                                                        <span style={{ fontWeight: 'bold' }}>{item.price}$</span>
                                                        <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>/Per night</span>
                                                    </div>
                                                </div>
                                                <div className="d-flex mt-3" style={{ gap: 5 }}>
                                                    <div className="me-4">
                                                        <HotelIcon style={{ color: '#A5A5A5', width: 20, height: 14 }} />
                                                        <small style={{ color: '#6c757d' }}>{item.beds} Beds</small>
                                                    </div>
                                                    <div className="me-4">
                                                        <PeopleIcon style={{ color: '#A5A5A5', width: 20, height: 14 }} />
                                                        <small style={{ color: '#6c757d' }}>{item.guests} Guests</small>
                                                    </div>
                                                    <div>
                                                        <BathtubIcon style={{ color: '#A5A5A5', width: 20, height: 14 }} />
                                                        <small style={{ color: '#6c757d' }}>{item.bathrooms} Bathroom</small>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <h5 style={{ fontWeight: 400, fontSize: '20px', color: '#121212' }}>{item.name}</h5>
                                                    <div>
                                                        <Badge bg={item.status === 'Complete' ? 'success' : 'primary'} style={{ padding: '5px 10px', borderRadius: '0px' }}>
                                                            {item.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div style={{ marginTop: '-12px' }}>
                                                    <span style={{ fontWeight: '400', fontSize: '12px' }}>{item.price}$</span>
                                                    <span style={{ color: '#A5A5A5', fontSize: '12px' }}>/Per Person</span>
                                                </div>
                                                <div className="d-flex mt-1">
                                                    <div className="me-3">
                                                        <LocationOnIcon style={{ color: '#A5A5A5', width: '20px', height: '14px' }} />
                                                        <small style={{ color: '#6c757d' }}>{item.location}</small>
                                                    </div>
                                                    <div className="me-3">
                                                        <PeopleIcon style={{ color: '#A5A5A5', width: '20px', height: '14px' }} />
                                                        <small style={{ color: '#6c757d' }}>{item.capacity} Capacity</small>
                                                    </div>
                                                    <div>
                                                        <HistoryIcon style={{ color: '#A5A5A5', width: '20px', height: '14px' }} />
                                                        <small style={{ color: '#6c757d' }}>{item.date}</small>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </Col>
                                </Row>
                            </div>
                        ))
                    ) : (
                        <Typography sx={{ px: 2, mt: 3, color: ' #6c757d' }}>{type === 'room' ? 'No rooms available' : 'No events available'}</Typography>
                    )}
                </Box>
            </Box>
        </>
    );
};

export default AvailableRooms;
