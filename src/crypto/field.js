const BN128_PRIME = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;

function mod(value) {
  let result = value % BN128_PRIME;
  if (result < 0n) {
    result += BN128_PRIME;
  }
  return result;
}

function add(a, b) {
  return mod(a + b);
}

function sub(a, b) {
  return mod(a - b);
}

function mul(a, b) {
  return mod(a * b);
}

function pow(base, exponent) {
  let result = 1n;
  let b = mod(base);
  let e = exponent;
  while (e > 0n) {
    if (e & 1n) {
      result = mul(result, b);
    }
    e >>= 1n;
    if (e > 0n) {
      b = mul(b, b);
    }
  }
  return result;
}

function inv(a) {
  if (a === 0n) {
    throw new Error("Cannot invert zero");
  }
  return pow(a, BN128_PRIME - 2n);
}

module.exports = {
  BN128_PRIME,
  mod,
  add,
  sub,
  mul,
  pow,
  inv,
};
