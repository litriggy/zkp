const { sponge } = require('../crypto/hash');
const { IncrementalMerkleTree } = require('../tree/incremental_merkle_tree');

function bigintify(value) {
  if (typeof value === 'bigint') {
    return value;
  }
  if (typeof value === 'number') {
    return BigInt(value);
  }
  if (typeof value === 'string') {
    if (value.startsWith('0x') || value.startsWith('0X')) {
      return BigInt(value);
    }
    return BigInt(value);
  }
  throw new Error(`Unsupported value type: ${typeof value}`);
}

function buildTree(depth, leaves) {
  const tree = new IncrementalMerkleTree(depth);
  tree.bulkInsert(leaves.map(bigintify));
  return tree;
}

function buildWitness(tree, leafIndices) {
  const leaves = leafIndices.map((index) => tree.leaf(index));
  const commitment = sponge(leaves);
  const pathElements = [];
  const pathIndices = [];

  for (const index of leafIndices) {
    const { pathElements: siblings, pathIndices: positions } = tree.path(index);
    pathElements.push(siblings);
    pathIndices.push(positions);
  }

  return {
    root: tree.root(),
    aggregateCommitment: commitment,
    leaves,
    pathElements,
    pathIndices,
  };
}

module.exports = {
  buildTree,
  buildWitness,
};
