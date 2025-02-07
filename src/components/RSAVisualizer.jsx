import React, { useState, useCallback, useEffect } from 'react';
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
import { Stage, Layer, Text, Arrow, Rect, Group, Line } from 'react-konva';
import { generateKeyPair, encrypt, decrypt } from '../utils/rsaUtils';

const RSAVisualizer = () => {
  const [message, setMessage] = useState('');
  const [keyPair, setKeyPair] = useState(null);
  const [ciphertext, setCiphertext] = useState('');
  const [decryptedMessage, setDecryptedMessage] = useState('');
  const [steps, setSteps] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

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

  const handleGenerateKeys = useCallback(async () => {
    try {
      setIsGenerating(true);
      setError('');
      
      // Generate keys in a non-blocking way
      const result = await new Promise(resolve => {
        setTimeout(() => {
          const keys = generateKeyPair(512);
          resolve(keys);
        }, 0);
      });

      setKeyPair(result);
      setSteps(result.steps);
      setActiveStep(0);
      setIsGenerating(false);
    } catch (err) {
      setError('Error generating keys: ' + err.message);
      setIsGenerating(false);
    }
  }, []);

  const handleEncrypt = useCallback(() => {
    if (!message || !keyPair) {
      setError('Please enter a message and generate keys first');
      return;
    }

    try {
      const { ciphertext: encrypted, steps: encryptSteps } = encrypt(message, keyPair.publicKey);
      setCiphertext(encrypted);
      setSteps(prev => [...prev, ...encryptSteps]);
      setError('');
    } catch (err) {
      setError('Error encrypting message: ' + err.message);
    }
  }, [message, keyPair]);

  const handleDecrypt = useCallback(() => {
    if (!ciphertext || !keyPair) {
      setError('Please encrypt a message first');
      return;
    }

    try {
      const { message: decrypted, steps: decryptSteps } = decrypt(ciphertext, keyPair.privateKey);
      setDecryptedMessage(decrypted);
      setSteps(prev => [...prev, ...decryptSteps]);
      setError('');
    } catch (err) {
      setError('Error decrypting message: ' + err.message);
    }
  }, [ciphertext, keyPair]);

  const renderPrimeGeneration = (step) => {
    const width = 800;
    const height = 400;

    return (
      <Stage width={width} height={height}>
        <Layer>
          <Group>
            <Rect
              x={50}
              y={50}
              width={300}
              height={150}
              fill="#e3f2fd"
              stroke="#1976d2"
              cornerRadius={5}
            />
            <Text
              text="Prime Number Generation"
              x={60}
              y={70}
              fontSize={18}
              fill="#1976d2"
              fontStyle="bold"
            />
            <Text
              text={`p = ${step.data.p}`}
              x={60}
              y={100}
              fontSize={16}
              fill="#000"
            />
            <Text
              text={`q = ${step.data.q}`}
              x={60}
              y={130}
              fontSize={16}
              fill="#000"
            />
            <Text
              text={`Bit Length: ${step.data.bits}`}
              x={60}
              y={160}
              fontSize={14}
              fill="#666"
            />
          </Group>
        </Layer>
      </Stage>
    );
  };

  const renderModulusCalculation = (step) => {
    const width = 800;
    const height = 400;

    return (
      <Stage width={width} height={height}>
        <Layer>
          <Group>
            <Rect
              x={50}
              y={50}
              width={700}
              height={200}
              fill="#e3f2fd"
              stroke="#1976d2"
              cornerRadius={5}
            />
            <Text
              text="Modulus Calculation (n = p × q)"
              x={60}
              y={70}
              fontSize={18}
              fill="#1976d2"
              fontStyle="bold"
            />
            <Text
              text={`p = ${step.data.p}`}
              x={60}
              y={100}
              fontSize={16}
              fill="#000"
            />
            <Text
              text={`q = ${step.data.q}`}
              x={60}
              y={130}
              fontSize={16}
              fill="#000"
            />
            <Line
              points={[60, 150, 700, 150]}
              stroke="#1976d2"
              strokeWidth={1}
            />
            <Text
              text={`n = ${step.data.n}`}
              x={60}
              y={170}
              fontSize={16}
              fill="#000"
              fontStyle="bold"
            />
          </Group>
        </Layer>
      </Stage>
    );
  };

  const renderEncryptionStep = (step) => {
    const width = 800;
    const height = 400;

    return (
      <Stage width={width} height={height}>
        <Layer>
          {step.data.steps.map((substep, i) => (
            <Group key={i}>
              <Rect
                x={50}
                y={50 + i * 60}
                width={700}
                height={50}
                fill={i % 2 === 0 ? "#e3f2fd" : "#bbdefb"}
                stroke="#1976d2"
                cornerRadius={5}
              />
              <Text
                text={`Step ${substep.step}: ${substep.description}`}
                x={60}
                y={60 + i * 60}
                fontSize={14}
                fill="#000"
              />
              <Text
                text={substep.calculation || substep.result}
                x={60}
                y={80 + i * 60}
                fontSize={12}
                fill="#666"
              />
            </Group>
          ))}
        </Layer>
      </Stage>
    );
  };

  const renderVisualization = () => {
    const step = steps[activeStep];
    if (!step) return null;

    switch (step.type) {
      case 'primeGeneration':
        return renderPrimeGeneration(step);
      case 'modulusCalculation':
      case 'totientCalculation':
        return renderModulusCalculation(step);
      case 'encryption':
      case 'decryption':
        return renderEncryptionStep(step);
      default:
        return null;
    }
  };

  return (
    <Box className="p-8">
      <Typography variant="h4" className="mb-6 flex items-center justify-between">
        RSA Encryption Visualizer
        <Tooltip title="RSA is a public-key cryptosystem used for secure data transmission">
          <IconButton onClick={() => setShowTooltip(!showTooltip)}>
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Typography>

      {showTooltip && (
        <Paper elevation={3} className="p-4 mb-6 bg-blue-50">
          <Typography variant="body2">
            RSA encryption works by:
            1. Generating two large prime numbers (p, q)
            2. Computing their product (n = p × q)
            3. Finding a public exponent (e)
            4. Computing a private exponent (d)
            5. Using (e, n) to encrypt and (d, n) to decrypt
          </Typography>
        </Paper>
      )}

      <Paper elevation={3} className="p-6 mb-6">
        <Box className="space-y-4">
          <TextField
            fullWidth
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mb-4"
            disabled={isGenerating}
          />

          <Box className="flex space-x-4">
            <Button
              variant="contained"
              onClick={handleGenerateKeys}
              disabled={isGenerating}
              startIcon={isGenerating ? <CircularProgress size={20} /> : null}
            >
              {isGenerating ? 'Generating Keys...' : 'Generate Keys'}
            </Button>

            <Button
              variant="contained"
              onClick={handleEncrypt}
              disabled={!keyPair || isGenerating}
            >
              Encrypt
            </Button>

            <Button
              variant="contained"
              onClick={handleDecrypt}
              disabled={!ciphertext || isGenerating}
            >
              Decrypt
            </Button>
          </Box>
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
            <Paper elevation={3} className="p-6 mb-6">
              <Typography variant="h6" className="mb-2">
                Encrypted Message (Ciphertext)
              </Typography>
              <Typography className="font-mono break-all">
                {ciphertext}
              </Typography>
            </Paper>
          )}

          {decryptedMessage && (
            <Paper elevation={3} className="p-6">
              <Typography variant="h6" className="mb-2">
                Decrypted Message
              </Typography>
              <Typography>{decryptedMessage}</Typography>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
};

export default RSAVisualizer;