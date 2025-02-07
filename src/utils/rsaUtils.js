import bigInt from 'big-integer';

// Miller-Rabin primality test
const millerRabinTest = (n, k = 5) => {
  if (n.equals(2) || n.equals(3)) return true;
  if (n.lesser(2) || n.isEven()) return false;

  // Write n-1 as 2^s * d
  let s = 0;
  let d = n.subtract(1);
  while (d.isEven()) {
    s++;
    d = d.divide(2);
  }

  // Witness loop
  for (let i = 0; i < k; i++) {
    const a = bigInt.randBetween(2, n.subtract(2));
    let x = a.modPow(d, n);

    if (x.equals(1) || x.equals(n.subtract(1))) continue;

    let continueWitness = false;
    for (let r = 1; r < s; r++) {
      x = x.modPow(2, n);
      if (x.equals(1)) return false;
      if (x.equals(n.subtract(1))) {
        continueWitness = true;
        break;
      }
    }

    if (!continueWitness) return false;
  }

  return true;
};

// Generate a random prime number using Miller-Rabin test
const generatePrime = (bits) => {
  while (true) {
    const num = bigInt.randBetween(
      bigInt(2).pow(bits - 1),
      bigInt(2).pow(bits).subtract(1)
    );
    if (millerRabinTest(num)) return num;
  }
};

// Extended Euclidean Algorithm with detailed steps
const extendedGCD = (a, b) => {
  const steps = [];
  let old_r = a;
  let r = b;
  let old_s = bigInt(1);
  let s = bigInt(0);
  let old_t = bigInt(0);
  let t = bigInt(1);

  while (!r.equals(0)) {
    const quotient = old_r.divide(r);
    const temp_r = r;
    r = old_r.subtract(quotient.multiply(r));
    old_r = temp_r;

    const temp_s = s;
    s = old_s.subtract(quotient.multiply(s));
    old_s = temp_s;

    const temp_t = t;
    t = old_t.subtract(quotient.multiply(t));
    old_t = temp_t;

    steps.push({
      quotient: quotient.toString(),
      remainder: r.toString(),
      coefficient1: s.toString(),
      coefficient2: t.toString()
    });
  }

  return {
    gcd: old_r,
    x: old_s,
    y: old_t,
    steps
  };
};

// Generate RSA key pair with detailed steps
export const generateKeyPair = (bits = 512) => {
  const steps = [];

  // Generate p and q
  const p = generatePrime(bits / 2);
  const q = generatePrime(bits / 2);
  
  steps.push({
    type: 'primeGeneration',
    description: 'Generating prime numbers p and q',
    data: {
      p: p.toString(),
      q: q.toString(),
      bits: bits / 2,
      isPrime: {
        p: millerRabinTest(p),
        q: millerRabinTest(q)
      }
    }
  });

  // Calculate n = p * q
  const n = p.multiply(q);
  steps.push({
    type: 'modulusCalculation',
    description: 'Computing modulus n = p × q',
    data: {
      p: p.toString(),
      q: q.toString(),
      n: n.toString(),
      calculation: {
        steps: [
          { description: 'Multiply p and q', result: n.toString() }
        ]
      }
    }
  });

  // Calculate φ(n) = (p-1)(q-1)
  const p_minus_1 = p.subtract(1);
  const q_minus_1 = q.subtract(1);
  const phi = p_minus_1.multiply(q_minus_1);
  
  steps.push({
    type: 'totientCalculation',
    description: 'Computing Euler\'s totient φ(n) = (p-1)(q-1)',
    data: {
      p: p.toString(),
      q: q.toString(),
      phi: phi.toString(),
      calculation: {
        p_minus_1: p_minus_1.toString(),
        q_minus_1: q_minus_1.toString(),
        steps: [
          { description: 'p - 1', result: p_minus_1.toString() },
          { description: 'q - 1', result: q_minus_1.toString() },
          { description: '(p-1)(q-1)', result: phi.toString() }
        ]
      }
    }
  });

  // Choose public exponent e
  const e = bigInt(65537);
  const gcdResult = extendedGCD(e, phi);
  
  steps.push({
    type: 'publicExponent',
    description: 'Selecting public exponent e',
    data: {
      e: e.toString(),
      phi: phi.toString(),
      gcd: gcdResult.gcd.toString(),
      steps: gcdResult.steps
    }
  });

  // Calculate private exponent d
  const d = e.modInv(phi);
  steps.push({
    type: 'privateExponent',
    description: 'Computing private exponent d',
    data: {
      e: e.toString(),
      phi: phi.toString(),
      d: d.toString(),
      verification: {
        ed_mod_phi: e.multiply(d).mod(phi).toString(),
        should_equal_1: true
      }
    }
  });

  return {
    publicKey: { e, n },
    privateKey: { d, n },
    steps
  };
};

// Convert text to number with steps
const textToNumber = (text) => {
  const steps = [];
  const bytes = new TextEncoder().encode(text);
  let num = bigInt(0);
  
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    const oldNum = num.toString();
    num = num.multiply(256).add(byte);
    
    steps.push({
      byte,
      char: text[i],
      calculation: `(${oldNum} × 256) + ${byte} = ${num.toString()}`
    });
  }
  
  return { number: num, steps };
};

// Convert number to text with steps
const numberToText = (num) => {
  const steps = [];
  const bytes = [];
  let remaining = bigInt(num);
  
  while (remaining.greater(0)) {
    const byte = Number(remaining.mod(256));
    bytes.unshift(byte);
    remaining = remaining.divide(256);
    
    steps.push({
      remainder: byte,
      remainingNumber: remaining.toString()
    });
  }
  
  const text = new TextDecoder().decode(new Uint8Array(bytes));
  return { text, steps };
};

// Square-and-multiply algorithm for modular exponentiation
const modPow = (base, exponent, modulus) => {
  const steps = [];
  let result = bigInt(1);
  let power = base.mod(modulus);
  let binaryExp = exponent.toString(2);

  steps.push({
    step: 0,
    description: 'Initial values',
    result: '1',
    power: power.toString(),
    binaryExp
  });

  for (let i = 0; i < binaryExp.length; i++) {
    // Square step
    const oldResult = result.toString();
    result = result.multiply(result).mod(modulus);
    
    steps.push({
      step: i + 1,
      description: 'Square',
      calculation: `(${oldResult} × ${oldResult}) mod ${modulus} = ${result}`,
      bit: binaryExp[i]
    });

    // Multiply step (if bit is 1)
    if (binaryExp[i] === '1') {
      const oldResult = result.toString();
      result = result.multiply(base).mod(modulus);
      
      steps.push({
        step: i + 1,
        description: 'Multiply',
        calculation: `(${oldResult} × ${base}) mod ${modulus} = ${result}`,
        bit: binaryExp[i]
      });
    }
  }

  return { result, steps };
};

// Encrypt message
export const encrypt = (message, publicKey) => {
  const { number: M, steps: conversionSteps } = textToNumber(message);
  const { result, steps: expSteps } = modPow(M, publicKey.e, publicKey.n);
  
  return {
    ciphertext: result.toString(),
    steps: [
      {
        type: 'messageConversion',
        description: 'Converting message to number',
        data: {
          message,
          number: M.toString(),
          steps: conversionSteps
        }
      },
      {
        type: 'encryption',
        description: 'Performing modular exponentiation',
        data: {
          base: M.toString(),
          exponent: publicKey.e.toString(),
          modulus: publicKey.n.toString(),
          steps: expSteps
        }
      }
    ]
  };
};

// Decrypt message
export const decrypt = (ciphertext, privateKey) => {
  const C = bigInt(ciphertext);
  const { result, steps: expSteps } = modPow(C, privateKey.d, privateKey.n);
  const { text, steps: conversionSteps } = numberToText(result);

  return {
    message: text,
    steps: [
      {
        type: 'decryption',
        description: 'Performing modular exponentiation',
        data: {
          base: C.toString(),
          exponent: privateKey.d.toString(),
          modulus: privateKey.n.toString(),
          steps: expSteps
        }
      },
      {
        type: 'messageConversion',
        description: 'Converting number to message',
        data: {
          number: result.toString(),
          message: text,
          steps: conversionSteps
        }
      }
    ]
  };
};