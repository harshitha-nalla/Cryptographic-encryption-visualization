import CryptoJS from 'crypto-js';

// DES Constants
const IP_TABLE = [
  58, 50, 42, 34, 26, 18, 10, 2,
  60, 52, 44, 36, 28, 20, 12, 4,
  62, 54, 46, 38, 30, 22, 14, 6,
  64, 56, 48, 40, 32, 24, 16, 8,
  57, 49, 41, 33, 25, 17, 9, 1,
  59, 51, 43, 35, 27, 19, 11, 3,
  61, 53, 45, 37, 29, 21, 13, 5,
  63, 55, 47, 39, 31, 23, 15, 7
];

const FP_TABLE = [
  40, 8, 48, 16, 56, 24, 64, 32,
  39, 7, 47, 15, 55, 23, 63, 31,
  38, 6, 46, 14, 54, 22, 62, 30,
  37, 5, 45, 13, 53, 21, 61, 29,
  36, 4, 44, 12, 52, 20, 60, 28,
  35, 3, 43, 11, 51, 19, 59, 27,
  34, 2, 42, 10, 50, 18, 58, 26,
  33, 1, 41, 9, 49, 17, 57, 25
];

const E_TABLE = [
  32, 1, 2, 3, 4, 5,
  4, 5, 6, 7, 8, 9,
  8, 9, 10, 11, 12, 13,
  12, 13, 14, 15, 16, 17,
  16, 17, 18, 19, 20, 21,
  20, 21, 22, 23, 24, 25,
  24, 25, 26, 27, 28, 29,
  28, 29, 30, 31, 32, 1
];

const PC1_TABLE = [
  57, 49, 41, 33, 25, 17, 9,
  1, 58, 50, 42, 34, 26, 18,
  10, 2, 59, 51, 43, 35, 27,
  19, 11, 3, 60, 52, 44, 36,
  63, 55, 47, 39, 31, 23, 15,
  7, 62, 54, 46, 38, 30, 22,
  14, 6, 61, 53, 45, 37, 29,
  21, 13, 5, 28, 20, 12, 4
];

const PC2_TABLE = [
  14, 17, 11, 24, 1, 5,
  3, 28, 15, 6, 21, 10,
  23, 19, 12, 4, 26, 8,
  16, 7, 27, 20, 13, 2,
  41, 52, 31, 37, 47, 55,
  30, 40, 51, 45, 33, 48,
  44, 49, 39, 56, 34, 53,
  46, 42, 50, 36, 29, 32
];

const S_BOXES = [
  [
    [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
    [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
    [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
    [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13]
  ],
  // S2-S8 boxes omitted for brevity
];

// Utility Functions
const stringToBits = (str) => {
  const bytes = CryptoJS.enc.Utf8.parse(str);
  let bits = Array(64).fill(0);
  for (let i = 0; i < Math.min(8, bytes.sigBytes); i++) {
    const byte = bytes.words[Math.floor(i / 4)] >>> (24 - (i % 4) * 8) & 0xff;
    for (let j = 0; j < 8; j++) {
      bits[i * 8 + j] = (byte >>> (7 - j)) & 1;
    }
  }
  return bits;
};

const permute = (bits, table) => {
  return table.map(pos => bits[pos - 1]);
};

const splitBlock = (block) => {
  const mid = Math.floor(block.length / 2);
  return [block.slice(0, mid), block.slice(mid)];
};

const rotateLeft = (bits, positions) => {
  const pos = positions % bits.length;
  return [...bits.slice(pos), ...bits.slice(0, pos)];
};

const xorBits = (a, b) => {
  return a.map((bit, i) => bit ^ b[i]);
};

const generateRoundKeys = (key) => {
  const pc1Key = permute(stringToBits(key), PC1_TABLE);
  const [c0, d0] = splitBlock(pc1Key);
  
  const roundKeys = [];
  let c = c0;
  let d = d0;
  
  for (let round = 0; round < 16; round++) {
    const shifts = (round === 0 || round === 1 || round === 8 || round === 15) ? 1 : 2;
    c = rotateLeft(c, shifts);
    d = rotateLeft(d, shifts);
    const cd = [...c, ...d];
    roundKeys.push(permute(cd, PC2_TABLE));
  }
  
  return roundKeys;
};

const generateDESVisualizationSteps = (plaintext, key) => {
  const steps = [];
  const plaintextBits = stringToBits(plaintext);
  
  // Initial Permutation
  const ipOutput = permute(plaintextBits, IP_TABLE);
  steps.push({
    type: 'initialPermutation',
    description: 'Initial Permutation (IP)',
    data: {
      input: plaintextBits,
      output: ipOutput,
      permutationTable: IP_TABLE
    }
  });
  
  // Key Schedule
  const roundKeys = generateRoundKeys(key);
  steps.push({
    type: 'keySchedule',
    description: 'Key Schedule Generation',
    data: {
      originalKey: stringToBits(key),
      roundKeys
    }
  });
  
  // Feistel Rounds
  let [left, right] = splitBlock(ipOutput);
  
  for (let round = 0; round < 16; round++) {
    const currentLeft = [...left];
    const currentRight = [...right];
    
    // Expansion
    const expanded = permute(right, E_TABLE);
    steps.push({
      type: 'expansion',
      description: `Round ${round + 1} - Expansion`,
      data: {
        input: right,
        output: expanded,
        expansionTable: E_TABLE
      }
    });
    
    // Key Mixing
    const mixed = xorBits(expanded, roundKeys[round]);
    steps.push({
      type: 'keyMixing',
      description: `Round ${round + 1} - Key Mixing`,
      data: {
        input: expanded,
        roundKey: roundKeys[round],
        output: mixed
      }
    });
    
    // S-Box Substitution
    const sBoxInputs = [];
    const sBoxOutputs = [];
    for (let i = 0; i < 8; i++) {
      const block = mixed.slice(i * 6, (i + 1) * 6);
      const row = (block[0] << 1) | block[5];
      const col = (block[1] << 3) | (block[2] << 2) | (block[3] << 1) | block[4];
      const output = S_BOXES[0][row][col]; // Using S1 box for all substitutions
      sBoxInputs.push(block);
      sBoxOutputs.push(output);
    }
    
    steps.push({
      type: 'sBox',
      description: `Round ${round + 1} - S-Box Substitution`,
      data: {
        input: sBoxInputs,
        output: sBoxOutputs,
        sBoxes: S_BOXES
      }
    });
    
    // Feistel Function
    const feistelOutput = sBoxOutputs.flatMap(num => 
      Array(4).fill().map((_, i) => (num >>> (3 - i)) & 1)
    );
    
    steps.push({
      type: 'feistelRound',
      description: `Round ${round + 1} - Feistel Round`,
      data: {
        left: currentLeft,
        right: currentRight,
        roundKey: roundKeys[round],
        output: feistelOutput
      }
    });
    
    // Prepare for next round
    left = right;
    right = xorBits(currentLeft, feistelOutput);
  }
  
  // Final Permutation
  const combined = [...right, ...left];
  const fpOutput = permute(combined, FP_TABLE);
  steps.push({
    type: 'finalPermutation',
    description: 'Final Permutation (FP)',
    data: {
      input: combined,
      output: fpOutput,
      permutationTable: FP_TABLE
    }
  });
  
  return {
    steps,
    finalState: fpOutput
  };
};

// AES Helper Functions
const hexToMatrix = (hex) => {
  const result = Array(4).fill().map(() => Array(4).fill(0));
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const idx = (i * 4 + j) * 2;
      if (idx < hex.length) {
        result[i][j] = parseInt(hex.substr(idx, 2), 16);
      }
    }
  }
  return result;
};

const generateVisualizationSteps = (plaintext, key) => {
  const steps = [];
  
  // Convert plaintext and key to matrices
  const plaintextHex = CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(plaintext));
  const keyHex = CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(key));
  
  let state = hexToMatrix(plaintextHex);
  const keyMatrix = hexToMatrix(keyHex);
  
  // Initial step
  steps.push({
    type: 'keyExpansion',
    description: 'Initial State',
    data: {
      state,
      key: keyMatrix
    }
  });

  // Add round steps
  for (let round = 0; round < 10; round++) {
    steps.push({
      type: 'addRoundKey',
      description: `Round ${round + 1} - AddRoundKey`,
      data: {
        state,
        roundKey: keyMatrix,
        result: state
      }
    });
  }
  
  return {
    steps,
    finalState: state
  };
};

// Export functions
export {
  generateVisualizationSteps,
  generateDESVisualizationSteps
};

function encryptAES(plaintext, key) {
  const result = generateVisualizationSteps(plaintext, key);
  return {
    ciphertext: CryptoJS.AES.encrypt(plaintext, key).toString(),
    steps: result.steps
  };
}

function encryptDES(plaintext, key) {
  const result = generateDESVisualizationSteps(plaintext, key);
  return {
    ciphertext: CryptoJS.DES.encrypt(plaintext, key).toString(),
    steps: result.steps
  };
}

export { encryptAES, encryptDES };