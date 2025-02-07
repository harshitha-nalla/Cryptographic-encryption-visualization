import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  IconButton
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import RSAVisualizer from './RSAVisualizer';
import DESVisualizer from './AlgorithmSteps/DESVisualization';
import AESVisualizer from './AlgorithmSteps/AESVisualization';

const algorithmInfo = {
  RSA: {
    name: 'RSA (Rivest–Shamir–Adleman)',
    description: 'A public-key cryptosystem used for secure data transmission. Uses two keys: public for encryption and private for decryption.',
    keySize: '512-2048 bits',
    type: 'Asymmetric'
  },
  DES: {
    name: 'DES (Data Encryption Standard)',
    description: 'A symmetric-key algorithm for electronic data encryption. Uses a 56-bit key for both encryption and decryption.',
    keySize: '56 bits',
    type: 'Symmetric'
  },
  AES: {
    name: 'AES (Advanced Encryption Standard)',
    description: 'A specification for electronic data encryption. Uses 128-bit block size and key lengths of 128, 192, or 256 bits.',
    keySize: '128/192/256 bits',
    type: 'Symmetric'
  }
};

const CryptoVisualizer = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('RSA');
  const [showInfo, setShowInfo] = useState(false);

  const handleAlgorithmChange = (event) => {
    setSelectedAlgorithm(event.target.value);
  };

  const renderAlgorithmInfo = () => {
    const info = algorithmInfo[selectedAlgorithm];
    return (
      <Paper elevation={3} className="p-4 mb-6 bg-blue-50">
        <Typography variant="h6" className="mb-2">
          {info.name}
        </Typography>
        <Typography variant="body2" className="mb-2">
          {info.description}
        </Typography>
        <Typography variant="body2">
          <strong>Type:</strong> {info.type}
        </Typography>
        <Typography variant="body2">
          <strong>Key Size:</strong> {info.keySize}
        </Typography>
      </Paper>
    );
  };

  const renderVisualizer = () => {
    switch (selectedAlgorithm) {
      case 'RSA':
        return <RSAVisualizer />;
      case 'DES':
        return <DESVisualizer />;
      case 'AES':
        return <AESVisualizer />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" className="py-8">
      <Box className="mb-8">
        <Typography variant="h3" className="mb-6 text-center flex items-center justify-center">
          Cryptography Visualizer
          <Tooltip title="Click for algorithm information">
            <IconButton onClick={() => setShowInfo(!showInfo)} className="ml-2">
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Typography>

        <Paper elevation={3} className="p-6 mb-6">
          <FormControl fullWidth>
            <InputLabel>Select Encryption Algorithm</InputLabel>
            <Select
              value={selectedAlgorithm}
              onChange={handleAlgorithmChange}
              label="Select Encryption Algorithm"
            >
              {Object.keys(algorithmInfo).map((algo) => (
                <MenuItem key={algo} value={algo}>
                  {algorithmInfo[algo].name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        {showInfo && renderAlgorithmInfo()}

        <Box className="transition-all duration-300">
          {renderVisualizer()}
        </Box>
      </Box>
    </Container>
  );
};

export default CryptoVisualizer;