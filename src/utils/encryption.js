import CryptoJS from 'crypto-js';
import forge from 'node-forge';

const hexToMatrix = (hex) => {
  const result = [];
  for (let i = 0; i < 4; i++) {
    result[i] = [];
    for (let j = 0; j < 4; j++) {
      const idx = (i * 4 + j) * 2;
      result[i][j] = parseInt(hex.substr(idx, 2), 16);
    }
  }
  return result;
};

const matrixToHex = (matrix) => {
  let result = '';
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      result += ('0' + matrix[i][j].toString(16)).slice(-2);
    }
  }
  return result;
};

// AES Helper Functions
const generateAESSteps = (plaintext, key) => {
  const steps = [];
  const wordSize = 4;
  const keyMatrix = hexToMatrix(CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(key)));
  const stateMatrix = hexToMatrix(CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(plaintext)));

  steps.push({
    type: 'keyExpansion',
    data: keyMatrix,
    description: 'Initial key matrix'
  });

  steps.push({
    type: 'addRoundKey',
    data: stateMatrix,
    key: keyMatrix,
    description: 'Initial state after AddRoundKey'
  });

  return steps;
};

export const encryptAES = (plaintext, key) => {
  const encrypted = CryptoJS.AES.encrypt(plaintext, key);
  return {
    ciphertext: encrypted.toString(),
    steps: generateAESSteps(plaintext, key)
  };
};

// DES Helper Functions
const generateDESSteps = (plaintext, key) => {
  const steps = [];
  const initialPermutation = [];
  // Add DES step generation logic here
  return steps;
};

export const encryptDES = (plaintext, key) => {
  const encrypted = CryptoJS.DES.encrypt(plaintext, key);
  return {
    ciphertext: encrypted.toString(),
    steps: generateDESSteps(plaintext, key)
  };
};

// RSA Helper Functions
const generateRSASteps = (plaintext, keySize = 2048) => {
  const steps = [];
  const rsa = forge.pki.rsa;
  const keypair = rsa.generateKeyPair({ bits: keySize });

  steps.push({
    type: 'primeGeneration',
    p: keypair.privateKey.p.toString(16),
    q: keypair.privateKey.q.toString(16),
    description: 'Generated prime numbers p and q'
  });

  steps.push({
    type: 'modulusCalculation',
    n: keypair.privateKey.n.toString(16),
    description: 'Calculated modulus n = p × q'
  });

  return {
    steps,
    keypair
  };
};

export const generateRSAKeys = () => {
  const { steps, keypair } = generateRSASteps('', 2048);
  return {
    publicKey: forge.pki.publicKeyToPem(keypair.publicKey),
    privateKey: forge.pki.privateKeyToPem(keypair.privateKey),
    steps
  };
};

export const encryptRSA = (plaintext, publicKey) => {
  const key = forge.pki.publicKeyFromPem(publicKey);
  const encrypted = key.encrypt(plaintext);
  return {
    ciphertext: forge.util.encode64(encrypted),
    steps: generateRSASteps(plaintext).steps
  };
};