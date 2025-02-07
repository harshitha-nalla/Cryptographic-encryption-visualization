import CryptoJS from 'crypto-js';
import forge from 'node-forge';
import bigInt from 'big-integer';

// AES Helper Functions
export const generateAESSteps = (plaintext, key) => {
  const steps = [];
  const wordSize = 4;
  const keyMatrix = hexToMatrix(CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(key)));
  const stateMatrix = hexToMatrix(CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(plaintext)));

  // Key Expansion - Generate all round keys
  const roundKeys = [];
  let currentKey = keyMatrix;
  
  steps.push({
    type: 'keyExpansion',
    data: {
      originalKey: keyMatrix,
      currentKey,
      roundKeys: [...roundKeys],
      sBoxLookup: generateSBoxLookup(currentKey)
    },
    description: 'Initial Key Matrix'
  });

  for (let round = 0; round < 10; round++) {
    currentKey = expandKey(currentKey, round);
    roundKeys.push(currentKey);
    
    steps.push({
      type: 'keyExpansion',
      data: {
        originalKey: keyMatrix,
        currentKey,
        roundKeys: [...roundKeys],
        sBoxLookup: generateSBoxLookup(currentKey)
      },
      description: `Round ${round + 1} Key Generation`
    });
  }

  let currentState = stateMatrix;
  
  // Initial round
  steps.push({
    type: 'addRoundKey',
    data: {
      state: currentState,
      roundKey: roundKeys[0],
      xorResult: xorMatrices(currentState, roundKeys[0])
    },
    round: 0,
    description: 'Initial AddRoundKey'
  });

  // Main rounds
  for (let round = 1; round < 10; round++) {
    // SubBytes
    const subBytesState = applySubBytes(currentState);
    steps.push({
      type: 'subBytes',
      data: {
        before: currentState,
        after: subBytesState,
        sBoxLookup: generateSBoxLookup(currentState)
      },
      round,
      description: `Round ${round} SubBytes`
    });
    currentState = subBytesState;

    // ShiftRows
    const shiftRowsState = shiftRows(currentState);
    steps.push({
      type: 'shiftRows',
      data: {
        before: currentState,
        after: shiftRowsState,
        shifts: [0, 1, 2, 3]
      },
      round,
      description: `Round ${round} ShiftRows`
    });
    currentState = shiftRowsState;

    // MixColumns
    const mixColumnsState = mixColumns(currentState);
    steps.push({
      type: 'mixColumns',
      data: {
        before: currentState,
        after: mixColumnsState,
        multiplication: generateMixColumnsSteps(currentState)
      },
      round,
      description: `Round ${round} MixColumns`
    });
    currentState = mixColumnsState;

    // AddRoundKey
    const addRoundKeyState = xorMatrices(currentState, roundKeys[round]);
    steps.push({
      type: 'addRoundKey',
      data: {
        state: currentState,
        roundKey: roundKeys[round],
        xorResult: addRoundKeyState
      },
      round,
      description: `Round ${round} AddRoundKey`
    });
    currentState = addRoundKeyState;
  }

  // Final round (no MixColumns)
  const finalSubBytes = applySubBytes(currentState);
  steps.push({
    type: 'subBytes',
    data: {
      before: currentState,
      after: finalSubBytes,
      sBoxLookup: generateSBoxLookup(currentState)
    },
    round: 10,
    description: 'Final Round SubBytes'
  });

  const finalShiftRows = shiftRows(finalSubBytes);
  steps.push({
    type: 'shiftRows',
    data: {
      before: finalSubBytes,
      after: finalShiftRows,
      shifts: [0, 1, 2, 3]
    },
    round: 10,
    description: 'Final Round ShiftRows'
  });

  const finalState = xorMatrices(finalShiftRows, roundKeys[10]);
  steps.push({
    type: 'addRoundKey',
    data: {
      state: finalShiftRows,
      roundKey: roundKeys[10],
      xorResult: finalState
    },
    round: 10,
    description: 'Final Round AddRoundKey'
  });

  return steps;
};

// DES Helper Functions
export const generateDESSteps = (plaintext, key) => {
  const steps = [];
  const initialBits = stringToBits(plaintext);
  
  // Initial Permutation
  const ipResult = applyInitialPermutation(initialBits);
  steps.push({
    type: 'initialPermutation',
    data: {
      input: initialBits,
      output: ipResult,
      permutationTable: IP_TABLE,
      bitMovements: generateBitMovements(initialBits, IP_TABLE)
    },
    description: 'Initial Permutation (IP)'
  });

  let [left, right] = splitBlock(ipResult);

  // Generate all round keys
  const roundKeys = generateAllRoundKeys(key);
  steps.push({
    type: 'keySchedule',
    data: {
      originalKey: key,
      roundKeys,
      permutationChoice1: PC1_TABLE,
      permutationChoice2: PC2_TABLE
    },
    description: 'Round Key Generation'
  });

  // Feistel rounds
  for (let round = 0; round < 16; round++) {
    const roundKey = roundKeys[round];
    
    // Expansion
    const expandedRight = expandBlock(right);
    steps.push({
      type: 'expansion',
      data: {
        input: right,
        output: expandedRight,
        expansionTable: E_TABLE
      },
      round,
      description: `Round ${round + 1} Expansion`
    });

    // Key mixing (XOR)
    const keyMixResult = xorBits(expandedRight, roundKey);
    steps.push({
      type: 'keyMixing',
      data: {
        input: expandedRight,
        key: roundKey,
        output: keyMixResult
      },
      round,
      description: `Round ${round + 1} Key Mixing`
    });

    // S-Box substitution
    const sBoxInput = splitIntoBlocks(keyMixResult, 6);
    const sBoxOutput = applySBoxes(sBoxInput);
    steps.push({
      type: 'sBox',
      data: {
        input: sBoxInput,
        output: sBoxOutput,
        sBoxes: S_BOXES,
        lookupSteps: generateSBoxLookupSteps(sBoxInput)
      },
      round,
      description: `Round ${round + 1} S-Box Substitution`
    });

    // P-Box permutation
    const pBoxOutput = applyPermutation(sBoxOutput, P_TABLE);
    steps.push({
      type: 'pBox',
      data: {
        input: sBoxOutput,
        output: pBoxOutput,
        permutationTable: P_TABLE,
        bitMovements: generateBitMovements(sBoxOutput, P_TABLE)
      },
      round,
      description: `Round ${round + 1} P-Box Permutation`
    });

    // Final XOR and swap
    const newRight = xorBits(left, pBoxOutput);
    steps.push({
      type: 'feistelXOR',
      data: {
        left,
        right: pBoxOutput,
        output: newRight
      },
      round,
      description: `Round ${round + 1} Feistel XOR`
    });

    left = right;
    right = newRight;
  }

  // Final Permutation
  const combined = combineBits(right, left); // Note: reverse order for final swap
  const finalOutput = applyFinalPermutation(combined);
  steps.push({
    type: 'finalPermutation',
    data: {
      input: combined,
      output: finalOutput,
      permutationTable: FP_TABLE,
      bitMovements: generateBitMovements(combined, FP_TABLE)
    },
    description: 'Final Permutation (FP)'
  });

  return steps;
};

// RSA Helper Functions
export const generateRSASteps = (message, keySize = 512) => {
  const steps = [];
  
  // Prime Generation
  const p = generatePrime(keySize / 2);
  const q = generatePrime(keySize / 2);
  
  steps.push({
    type: 'primeGeneration',
    data: {
      p: p.toString(),
      q: q.toString(),
      primality: {
        pTests: generatePrimalityTests(p),
        qTests: generatePrimalityTests(q)
      }
    },
    description: 'Prime Number Generation'
  });

  // Calculate n and φ(n)
  const n = p.multiply(q);
  const phi = p.subtract(1).multiply(q.subtract(1));
  
  steps.push({
    type: 'modulusCalculation',
    data: {
      p: p.toString(),
      q: q.toString(),
      n: n.toString(),
      phi: phi.toString(),
      steps: {
        n: `${p} × ${q} = ${n}`,
        phi: `(${p} - 1) × (${q} - 1) = ${phi}`
      }
    },
    description: 'Modulus and Totient Calculation'
  });

  // Choose public exponent e
  const e = bigInt(65537);
  steps.push({
    type: 'publicExponent',
    data: {
      e: e.toString(),
      phi: phi.toString(),
      gcdSteps: generateGCDSteps(e, phi)
    },
    description: 'Public Exponent Selection'
  });

  // Calculate private exponent d
  const d = e.modInv(phi);
  steps.push({
    type: 'privateExponent',
    data: {
      e: e.toString(),
      phi: phi.toString(),
      d: d.toString(),
      extendedEuclidean: generateExtendedEuclideanSteps(e, phi)
    },
    description: 'Private Exponent Calculation'
  });

  // Encryption
  const M = bigInt(stringToNumber(message));
  const encryptionSteps = generateModularExponentiationSteps(M, e, n);
  steps.push({
    type: 'encryption',
    data: {
      message: M.toString(),
      steps: encryptionSteps
    },
    description: 'Message Encryption'
  });

  return steps;
};

// Utility functions (implementation details omitted for brevity)
const expandKey = (key, round) => {
  // Implementation
};

const generateSBoxLookup = (matrix) => {
  // Implementation
};

const xorMatrices = (a, b) => {
  // Implementation
};

const applySubBytes = (state) => {
  // Implementation
};

const shiftRows = (state) => {
  // Implementation
};

const mixColumns = (state) => {
  // Implementation
};

const generateMixColumnsSteps = (state) => {
  // Implementation
};

// Export encryption functions
export const encryptAES = (plaintext, key) => {
  const encrypted = CryptoJS.AES.encrypt(plaintext, key);
  return {
    ciphertext: encrypted.toString(),
    steps: generateAESSteps(plaintext, key)
  };
};

export const encryptDES = (plaintext, key) => {
  const encrypted = CryptoJS.DES.encrypt(plaintext, key);
  return {
    ciphertext: encrypted.toString(),
    steps: generateDESSteps(plaintext, key)
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