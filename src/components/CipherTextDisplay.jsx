import React from 'react';
import { 
  Paper, 
  Typography, 
  Box,
  IconButton,
  Tooltip,
  Fade
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';

const CipherTextDisplay = ({ ciphertext }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(ciphertext);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Fade in={true}>
      <Paper elevation={3} className="p-6">
        <Box className="flex items-center mb-4">
          <SecurityIcon className="text-green-600 mr-2" />
          <Typography variant="h6" component="h2">
            Encryption Complete
          </Typography>
        </Box>

        <Paper 
          elevation={1} 
          className="p-4 bg-gray-50 relative mb-4 break-all"
        >
          <Typography variant="body1" component="p" className="font-mono">
            {ciphertext}
          </Typography>
          <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
            <IconButton 
              onClick={handleCopy}
              className="absolute top-2 right-2"
              color={copied ? "success" : "default"}
            >
              {copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
            </IconButton>
          </Tooltip>
        </Paper>

        <Typography variant="body2" color="textSecondary" className="mt-4">
          This is your encrypted text. Keep it secure and share it only with intended recipients.
        </Typography>
      </Paper>
    </Fade>
  );
};

export default CipherTextDisplay;