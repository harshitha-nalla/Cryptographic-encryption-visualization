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
import { generateDESVisualizationSteps } from '../../utils/cryptoUtils';

const DESVisualization = () => {
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
      setError('Please enter plaintext and key (8 characters each)');
      return;
    }

    if (plaintext.length !== 8 || key.length !== 8) {
      setError('Both plaintext and key must be exactly 8 characters');
      return;
    }

    try {
      const result = generateDESVisualizationSteps(plaintext, key);
      setSteps(result.steps);
      setCiphertext(result.finalState.join(''));
      setActiveStep(0);
      setError('');
    } catch (err) {
      setError('Error during encryption: ' + err.message);
    }
  }, [plaintext, key]);

  const renderVisualization = () => {
    const step = steps[activeStep];
    if (!step) return null;

    const width = 800;
    const height = 400;

    switch (step.type) {
      case 'initialPermutation':
        return (
          <Stage width={width} height={height}>
            <Layer>
              <Group>
                <Text
                  text="Initial Permutation (IP)"
                  x={50}
                  y={30}
                  fontSize={18}
                  fill="#1976d2"
                  fontStyle="bold"
                />
                {renderBitMatrix(step.data.input, 50, 70, 'Input')}
                <Arrow
                  points={[200, 150, 300, 150]}
                  fill="#1976d2"
                  stroke="#1976d2"
                />
                {renderBitMatrix(step.data.output, 350, 70, 'Output')}
              </Group>
            </Layer>
          </Stage>
        );

      case 'feistelRound':
        return (
          <Stage width={width} height={height}>
            <Layer>
              <Group>
                <Text
                  text={`Feistel Round ${activeStep}`}
                  x={50}
                  y={30}
                  fontSize={18}
                  fill="#1976d2"
                  fontStyle="bold"
                />
                {renderFeistelRound(step.data)}
              </Group>
            </Layer>
          </Stage>
        );

      // Add other cases for different DES steps

      default:
        return null;
    }
  };

  const renderBitMatrix = (bits, x, y, label) => {
    const cellSize = 30;
    return (
      <Group>
        <Text
          text={label}
          x={x}
          y={y - 20}
          fontSize={14}
          fill="#666"
        />
        {bits.map((bit, i) => (
          <Group key={i}>
            <Rect
              x={x + (i % 8) * cellSize}
              y={y + Math.floor(i / 8) * cellSize}
              width={cellSize}
              height={cellSize}
              fill={bit ? "#bbdefb" : "#e3f2fd"}
              stroke="#1976d2"
            />
            <Text
              text={bit.toString()}
              x={x + (i % 8) * cellSize + 12}
              y={y + Math.floor(i / 8) * cellSize + 8}
              fontSize={14}
              fill="#000"
            />
          </Group>
        ))}
      </Group>
    );
  };

  const renderFeistelRound = (data) => {
    // Implementation for Feistel round visualization
    return (
      <Group>
        {renderBitMatrix(data.left, 50, 70, 'Left Half')}
        {renderBitMatrix(data.right, 350, 70, 'Right Half')}
        <Arrow
          points={[250, 150, 300, 150]}
          fill="#1976d2"
          stroke="#1976d2"
        />
      </Group>
    );
  };

  return (
    <Box className="p-8">
      <Typography variant="h4" className="mb-6 flex items-center justify-between">
        DES Encryption Visualizer
        <Tooltip title="Click for DES algorithm information">
          <IconButton onClick={() => setShowInfo(!showInfo)}>
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Typography>

      {showInfo && (
        <Paper elevation={3} className="p-4 mb-6 bg-blue-50">
          <Typography variant="body2">
            DES (Data Encryption Standard) is a symmetric-key algorithm that processes data in 64-bit blocks using a 56-bit key.
            The algorithm performs 16 rounds of Feistel operations, including permutation, substitution, and key mixing.
          </Typography>
        </Paper>
      )}

      <Paper elevation={3} className="p-6 mb-6">
        <Box className="space-y-4">
          <TextField
            fullWidth
            label="Plaintext (8 characters)"
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
            className="mb-4"
          />
          <TextField
            fullWidth
            label="Key (8 characters)"
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

export default DESVisualization;