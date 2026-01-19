// import { createTheme } from '@mui/material/styles';

// const theme = createTheme({
//   typography: {
//     fontFamily: ['Inter'].join(','),
//   },
// });

// export default theme;

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: 'Inter, sans-serif',
  },

  palette: {
    primary: {
      main: '#063455',
    },
    secondary: {
      main: '#063455',
    },
  },

  components: {
    /* OUTLINED INPUT (TextField, Select, Autocomplete) */
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#ced4da',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#063455',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#063455',
            borderWidth: '2.5px',
          },
        },
      },
    },

    /* STANDARD INPUT */
    MuiInput: {
      styleOverrides: {
        underline: {
          '&:after': {
            borderBottomColor: '#063455',
          },
        },
      },
    },

    /* FILLED INPUT */
    MuiFilledInput: {
      styleOverrides: {
        underline: {
          '&:after': {
            borderBottomColor: '#063455',
          },
        },
      },
    },
  },
});

export default theme;