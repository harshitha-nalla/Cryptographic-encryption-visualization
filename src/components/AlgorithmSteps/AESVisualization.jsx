import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import InfoIcon from '@mui/icons-material/Info';
import { Stage, Layer, Text, Arrow, Rect, Group } from 'react-konva';
import { generateVisualizationSteps } from '../../utils/cryptoUtils';

const AESVisualization = () => {
  const [plaintext, setPlaintext] = useState('');
  const [key, setKey] = useState('');
  const [steps, setSteps] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    let timer;
    if (isPlaying && activeStep < steps.length - 1) {
      timer = setTimeout(() => {
        setActiveStep(prev => prev + 1);
      }, 2000);
    } else if (activeStep === steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, activeStep, steps.length]);

  const handleEncrypt = useCallback(() => {
    if (!plaintext || !key) {
      setError('Please enter plaintext and key');
      return;
    }

    if (key.length !== 16) {
      setError('Key must be exactly 16 characters (128 bits)');
      return;
    }

    try {
      const result = generateVisualizationSteps(plaintext, key);
      setSteps(result.steps);
      setCiphertext(result.finalState.flat().map(byte => 
        byte.toString(16).padStart(2, '0')
      ).join(''));
      setActiveStep(0);
      setError('');
    } catch (err) {
      setError('Error during encryption: ' + err.message);
    }
  }, [plaintext, key]);

  const renderMatrix = (matrix, x, y, label) => {
    const cellSize = 40;
    return (
      <Group>
        <Text
          text={label}
          x={x}
          y={y - 25}
          fontSize={14}
          fill="#1976d2"
          fontStyle="bold"
        />
        {matrix.map((row, i) => 
          row.map((cell, j) => (
            <Group key={`${label}-${i}-${j}`}>
              <Rect
                x={x + j * cellSize}
                y={y + i * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#e3f2fd"
                stroke="#1976d2"
                strokeWidth={1}
              />
              <Text
                x={x + j * cellSize + 5}
                y={y + i * cellSize + 15}
                text={typeof cell === 'number' ? cell.toString(16).padStart(2, '0') : cell}
                fontSize={12}
                fill="#000"
              />
            </Group>
          ))
        )}
      </Group>
    );
  };

  const renderVisualization = () => {
    const step = steps[activeStep];
    if (!step) return null;

    const width = 800;
    const height = 400;

    switch (step.type) {
      case 'keyExpansion':
        return (
          <Stage width={width} height={height}>
            <Layer>
              {renderMatrix(step.data.state, 50, 70, 'Initial State')}
              <Arrow
                points={[250, 150, 300, 150]}
                fill="#1976d2"
                stroke="#1976d2"
              />
              {renderMatrix(step.data.key, 350, 70, 'Round Key')}
            </Layer>
          </Stage>
        );

      case 'subBytes':
      case 'shiftRows':
      case 'mixColumns':
      case 'addRoundKey':
        return (
          <Stage width={width} height={height}>
            <Layer>
              {renderMatrix(step.data.state, 50, 70, 'Before')}
              <Arrow
                points={[250, 150, 300, 150]}
                fill="#1976d2"
                stroke="#1976d2"
              />
              {renderMatrix(step.data.result || step.data.state, 350, 70, 'After')}
            </Layer>
          </Stage>
        );

      default:
        return null;
    }
  };

  return (
    <Box className="p-8">
      <Typography variant="h4" className="mb-6 flex items-center justify-between">
        AES Encryption Visualizer
        <Tooltip title="Click for AES algorithm information">
          <IconButton onClick={() => setShowInfo(!showInfo)}>
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Typography>

      {showInfo && (
        <Paper elevation={3} className="p-4 mb-6 bg-blue-50">
          <Typography variant="body2">
            AES (Advanced Encryption Standard) is a symmetric block cipher that processes data in 128-bit blocks using keys of 128, 192, or 256 bits.
            This implementation uses AES-128 with 10 rounds of transformation including SubBytes, ShiftRows, MixColumns, and AddRoundKey operations.
          </Typography>
        </Paper>
      )}

      <Paper elevation={3} className="p-6 mb-6">
        <Box className="space-y-4">
          <TextField
            fullWidth
            label="Plaintext"
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
            className="mb-4"
          />
          <TextField
            fullWidth
            label="Key (16 characters)"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="mb-4"
          />
          <Button
            variant="contained"
            onClick={handleEncrypt}
          >
            Start Encryption
          </Button>
        </Box>
      </Paper>

      {error && (
        <Paper className="p-4 mb-6 bg-red-50">
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {steps.length > 0 && (
        <>
          <Stepper activeStep={activeStep} className="mb-6">
            {steps.map((step, index) => (
              <Step key={index}>
                <StepLabel>{step.description}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box className="flex justify-center space-x-4 mb-6">
            <IconButton onClick={() => setActiveStep(0)} disabled={activeStep === 0}>
              <RestartAltIcon />
            </IconButton>
            <IconButton
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
            >
              <SkipPreviousIcon />
            </IconButton>
            <IconButton onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
            <IconButton
              onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
              disabled={activeStep === steps.length - 1}
            >
              <SkipNextIcon />
            </IconButton>
          </Box>

          <Paper elevation={3} className="p-6 mb-6">
            {renderVisualization()}
          </Paper>

          {ciphertext && (
            <Paper elevation={3} className="p-6">
              <Typography variant="h6" className="mb-2">
                Encrypted Message (Ciphertext)
              </Typography>
              <Typography className="font-mono break-all">
                {ciphertext}
              </Typography>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
};

export default AESVisualization;