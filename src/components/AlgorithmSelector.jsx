import React from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Paper,
  Typography,
  Box
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import EnhancedEncryptionIcon from '@mui/icons-material/EnhancedEncryption';

const AlgorithmSelector = ({ selectedAlgorithm, onAlgorithmChange }) => {
  const algorithms = [
    {
      value: 'AES',
      name: 'AES (Advanced Encryption Standard)',
      description: '128-bit symmetric block cipher',
      icon: <EnhancedEncryptionIcon className="text-blue-600" />,
      keyRequirement: '16 characters (128 bits)'
    },
    {
      value: 'DES',
      name: 'DES (Data Encryption Standard)',
      description: '56-bit symmetric block cipher',
      icon: <VpnKeyIcon className="text-green-600" />,
      keyRequirement: '8 characters (56 bits)'
    },
    {
      value: 'RSA',
      name: 'RSA (Rivest-Shamir-Adleman)',
      description: 'Public-key cryptosystem',
      icon: <LockIcon className="text-purple-600" />,
      keyRequirement: 'Prime number for key generation'
    }
  ];

  return (
    <div className="space-y-6">
      <FormControl fullWidth>
        <InputLabel>Select Encryption Algorithm</InputLabel>
        <Select
          value={selectedAlgorithm}
          onChange={(e) => onAlgorithmChange(e.target.value)}
          label="Select Encryption Algorithm"
          className="mb-4"
        >
          {algorithms.map((algo) => (
            <MenuItem key={algo.value} value={algo.value}>
              {algo.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {algorithms.map((algo) => (
          <Paper
            key={algo.value}
            elevation={selectedAlgorithm === algo.value ? 8 : 1}
            className={`p-4 cursor-pointer transition-all duration-300 ${
              selectedAlgorithm === algo.value
                ? 'border-2 border-blue-500 transform scale-105'
                : 'hover:shadow-lg'
            }`}
            onClick={() => onAlgorithmChange(algo.value)}
          >
            <Box className="flex items-center mb-2">
              {algo.icon}
              <Typography variant="h6" className="ml-2 font-semibold">
                {algo.value}
              </Typography>
            </Box>
            <Typography variant="body2" color="textSecondary" className="mb-2">
              {algo.description}
            </Typography>
            <Typography variant="caption" className="text-blue-600">
              Key: {algo.keyRequirement}
            </Typography>
          </Paper>
        ))}
      </div>
    </div>
  );
};

export default AlgorithmSelector;