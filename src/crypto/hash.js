const { mod, add, mul } = require('./field');

const ALPHA = 3n;
const BETA = 5n;
const GAMMA = 7n;

function hash2(left, right) {
  const l = mod(left);
  const r = mod(right);
  const sum = add(l, r);
  const sum2 = mul(sum, sum);
  const sum4 = mul(sum2, sum2);
  const sum5 = mul(sum4, sum);
  const mix = add(add(mul(ALPHA, l), mul(BETA, r)), GAMMA);
  return add(sum5, mix);
}

function sponge(inputs) {
  let state = 0n;
  for (const input of inputs) {
    state = hash2(state, input);
  }
  return state;
}

module.exports = {
  hash2,
  sponge,
};
