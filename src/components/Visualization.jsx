import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Stepper, Step, StepLabel, IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import InfoIcon from '@mui/icons-material/Info';
import AESVisualization from './AlgorithmSteps/AESVisualization';
import DESVisualization from './AlgorithmSteps/DESVisualization';
import RSAVisualization from './AlgorithmSteps/RSAVisualization';

const Visualization = ({ algorithm, data }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  
  const width = window.innerWidth * 0.9;
  const height = 600;

  const algorithmSteps = {
    AES: [
      { name: 'Key Expansion', description: 'Generating round keys from the initial key' },
      { name: 'AddRoundKey', description: 'XORing the state with the round key' },
      { name: 'SubBytes', description: 'Substituting bytes using the S-box' },
      { name: 'ShiftRows', description: 'Shifting rows of the state matrix' },
      { name: 'MixColumns', description: 'Mixing data within each column' }
    ],
    DES: [
      { name: 'Initial Permutation', description: 'Reordering input bits' },
      { name: 'Feistel Rounds', description: '16 rounds of encryption' },
      { name: 'Final Permutation', description: 'Final bit reordering' }
    ],
    RSA: [
      { name: 'Prime Selection', description: 'Selecting prime numbers p and q' },
      { name: 'Key Generation', description: 'Computing public and private keys' },
      { name: 'Encryption', description: 'Performing modular exponentiation' }
    ]
  };

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => 
          (prev + 1) % algorithmSteps[algorithm].length
        );
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, algorithm]);

  const renderVisualization = () => {
    const props = {
      step: algorithmSteps[algorithm][currentStep].name.toLowerCase(),
      data,
      width,
      height
    };

    switch (algorithm) {
      case 'AES':
        return <AESVisualization {...props} />;
      case 'DES':
        return <DESVisualization {...props} />;
      case 'RSA':
        return <RSAVisualization {...props} />;
      default:
        return null;
    }
  };

  return (
    <Paper elevation={3} className="p-8">
      <Box className="mb-6">
        <Typography variant="h5" className="mb-4 flex items-center justify-between">
          <span>{algorithm} Encryption Process</span>
          <Box>
            <IconButton onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
            <IconButton onClick={() => setShowDetails(!showDetails)}>
              <InfoIcon />
            </IconButton>
          </Box>
        </Typography>

        <Stepper activeStep={currentStep} alternativeLabel className="mb-8">
          {algorithmSteps[algorithm].map(({ name }) => (
            <Step key={name}>
              <StepLabel>{name}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Box className="bg-gray-50 p-6 rounded-lg shadow-inner min-h-[600px]">
        {renderVisualization()}
      </Box>

      {showDetails && (
        <Box className="mt-4 p-4 bg-blue-50 rounded-lg">
          <Typography variant="h6" className="mb-2">
            {algorithmSteps[algorithm][currentStep].name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {algorithmSteps[algorithm][currentStep].description}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default Visualization;