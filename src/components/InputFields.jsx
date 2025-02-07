import React from 'react';
import { 
  TextField, 
  Paper, 
  Typography, 
  Box,
  Alert,
  Tooltip,
  IconButton
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const InputFields = ({ 
  algorithm, 
  plaintext, 
  encryptionKey, 
  onPlaintextChange, 
  onKeyChange,
  error 
}) => {
  const getKeyHelperText = () => {
    switch (algorithm) {
      case 'AES':
        return 'Enter exactly 16 characters for AES-128';
      case 'DES':
        return 'Enter exactly 8 characters for DES';
      case 'RSA':
        return 'Enter a prime number for RSA key generation';
      default:
        return '';
    }
  };

  const getKeyValidation = () => {
    switch (algorithm) {
      case 'AES':
        return encryptionKey.length === 16;
      case 'DES':
        return encryptionKey.length === 8;
      case 'RSA':
        return !isNaN(encryptionKey) && isPrime(parseInt(encryptionKey));
      default:
        return true;
    }
  };

  const isPrime = (num) => {
    for(let i = 2; i < num; i++)
      if(num % i === 0) return false;
    return num > 1;
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Paper elevation={3} className="p-6 space-y-6">
      <Box className="mb-4">
        <Typography variant="h6" className="mb-4 flex items-center">
          Input Data
          <Tooltip title="Enter your plaintext and encryption key based on the selected algorithm">
            <IconButton size="small" className="ml-2">
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Typography>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <div className="space-y-4">
          <div className="relative">
            <TextField
              fullWidth
              label="Plaintext"
              value={plaintext}
              onChange={(e) => onPlaintextChange(e.target.value)}
              multiline
              rows={4}
              variant="outlined"
              placeholder="Enter the text you want to encrypt"
              className="mb-4"
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => handleCopyToClipboard(plaintext)}
                    size="small"
                    className="absolute bottom-2 right-2"
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                ),
              }}
            />
          </div>

          <div className="relative">
            <TextField
              fullWidth
              label={`${algorithm} Key`}
              value={encryptionKey}
              onChange={(e) => onKeyChange(e.target.value)}
              variant="outlined"
              placeholder={`Enter ${algorithm} key`}
              error={encryptionKey.length > 0 && !getKeyValidation()}
              helperText={getKeyHelperText()}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => handleCopyToClipboard(encryptionKey)}
                    size="small"
                    className="absolute top-2 right-2"
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                ),
              }}
            />
          </div>
        </div>
      </Box>
    </Paper>
  );
};

export default InputFields;