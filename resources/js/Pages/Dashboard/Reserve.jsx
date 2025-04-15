import React from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Button, 
  Chip, 
  Paper,
  Grid,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import { 
  Close, 
  KeyboardArrowLeft, 
  KeyboardArrowRight,
  KeyboardArrowDown,
  AccessTime
} from '@mui/icons-material';

const ReservationOrder = () => {
  const reservations = [
    { 
      table: 'T4', 
      name: 'Qafi Latif', 
      persons: 4, 
      items: null, 
      time: '10:00 AM',
      orderNumber: '001',
      deposit: '50%'
    },
    { 
      table: 'T5', 
      name: 'Annette Black', 
      persons: 2, 
      items: null, 
      time: '10:00 AM',
      orderNumber: '001',
      deposit: '50%'
    },
    { 
      table: 'T6', 
      name: 'Ronald Richards', 
      persons: 1, 
      items: null, 
      time: '15:00 PM',
      orderNumber: '001',
      deposit: '50%'
    },
    { 
      table: 'T7', 
      name: 'Floyd Miles', 
      persons: 10, 
      items: '12 Items', 
      time: '16:00 PM',
      orderNumber: '001',
      deposit: '50%'
    },
    { 
      table: 'T8', 
      name: 'Kristin Watson', 
      persons: 6, 
      items: '12 Items', 
      time: '18:00 am',
      orderNumber: '001',
      deposit: '50%'
    }
  ];

  const days = ['Sun', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const dates = [7, 8, 9, 10, 11, 12, 13];
  const daysWithDots = [0, 1, 2, 5]; // Sunday, Monday, Tuesday, Friday

  return (
    <Paper sx={{ mx: 'auto', height:'100%', p:2 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: 2,
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Reservation Order
        </Typography>
      </Box>

      {/* Calendar Navigation */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        px: 2,
        py: 1.5
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton size="small" sx={{ mr: 1 }}>
            <KeyboardArrowLeft fontSize="small" />
          </IconButton>
          <IconButton size="small" sx={{ mr: 1 }}>
            <KeyboardArrowRight fontSize="small" />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            July 2024
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          endIcon={<KeyboardArrowDown />}
          sx={{ 
            borderColor: '#e0e0e0', 
            color: '#333',
            textTransform: 'none',
            borderRadius: 1,
            px: 2
          }}
        >
          Week 1
        </Button>
      </Box>

      {/* Calendar Week */}
      <Grid container spacing={0}>
        {days.map((day, index) => (
          <Grid 
            item 
            key={index} 
            xs={12/7} 
            sx={{ 
              textAlign: 'center',
              p: 1,
              borderRight: index < 6 ? '1px solid #e0e0e0' : 'none',
              borderBottom: '1px solid #e0e0e0',
              bgcolor: index === 0 ? '#e6f0fa' : 'white',
            }}
          >
            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>
              {day}
            </Typography>
            
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {dates[index]}
              </Typography>
            </Box>
            
            {daysWithDots.includes(index) && (
              <Box 
                sx={{
                  mt: 1,
                  mx: 'auto',
                  width: 8,
                  height: 8,
                  bgcolor: '#1976d2',
                  borderRadius: '50%'
                }}
              />
            )}
          </Grid>
        ))}
      </Grid>

      {/* Reservations List */}
      <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
        {reservations.map((reservation, index) => (
          <Box 
            key={index}
            sx={{ 
              p: 2, 
              borderBottom: index < reservations.length - 1 ? '1px solid #f0f0f0' : 'none',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <Button
                variant="contained"
                sx={{
                  bgcolor: '#1976d2',
                  color: 'white',
                  borderRadius: '50%',
                  minWidth: 40,
                  height: 40,
                  p: 0,
                  fontWeight: 'bold',
                  fontSize: '0.875rem'
                }}
              >
                {reservation.table}
              </Button>
            </Box>

            <Box sx={{ 
              mr: 2,
              bgcolor: '#f0f0f0',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Box component="span" sx={{ fontSize: '1.2rem' }}>💬</Box>
            </Box>

            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mr: 1 }}>
                    {reservation.name}
                  </Typography>
                  <Box component="span" sx={{ 
                    color: '#f59e0b', 
                    fontSize: '1.2rem',
                    bgcolor: '#FEF3C7',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>😊</Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTime fontSize="small" sx={{ mr: 0.5, color: '#6b7280' }} />
                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    {reservation.time}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="caption" sx={{ color: '#666' }}>
                {reservation.persons} Person {reservation.items && `• ${reservation.items}`}
              </Typography>

              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 1
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip
                    label={`#${reservation.orderNumber}`}
                    size="small"
                    sx={{ 
                      mr: 1, 
                      bgcolor: '#f5f5f5', 
                      borderRadius: 1, 
                      height: 24,
                      fontSize: '0.75rem',
                      fontWeight: 'medium'
                    }}
                  />
                  <Chip
                    label={`DP • ${reservation.deposit}`}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      borderColor: '#e0e0e0', 
                      borderRadius: 1, 
                      height: 24,
                      fontSize: '0.75rem'
                    }}
                  />
                  <Box sx={{ ml: 2 }}>
                    <IconButton size="small" sx={{ p: 0 }}>
                      <Box component="span" sx={{ color: '#ef4444', fontSize: '1rem' }}>🗑️</Box>
                    </IconButton>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Box component="span" sx={{ fontSize: '0.875rem' }}>✓</Box>}
                  sx={{ 
                    bgcolor: '#0e3151', 
                    color: 'white', 
                    textTransform: 'none', 
                    borderRadius: 0,
                    px: 2,
                    py: 0.5,
                    fontSize: '0.875rem',
                    '&:hover': {
                      bgcolor: '#0a2540'
                    }
                  }}
                >
                  Process Order
                </Button>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default ReservationOrder;