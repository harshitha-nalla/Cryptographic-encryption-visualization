import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material';
import CryptoVisualizer from './components/CryptoVisualizer';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
    },
    secondary: {
      main: '#3b82f6',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <CryptoVisualizer />
      </div>
    </ThemeProvider>
  );
}

export default App;