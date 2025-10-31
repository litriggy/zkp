const { hash2 } = require('../crypto/hash');
const { mod } = require('../crypto/field');

class IncrementalMerkleTree {
  constructor(depth, zeroLeaf = 0n) {
    if (!Number.isInteger(depth) || depth <= 0) {
      throw new Error('Depth must be a positive integer');
    }
    this.depth = depth;
    this.capacity = 1 << depth;
    this.zeroLeaf = mod(BigInt(zeroLeaf));
    this.zeros = new Array(depth + 1);
    this.layers = new Array(depth + 1);

    this.zeros[0] = this.zeroLeaf;
    for (let level = 1; level <= depth; level += 1) {
      this.zeros[level] = hash2(this.zeros[level - 1], this.zeros[level - 1]);
    }

    for (let level = 0; level <= depth; level += 1) {
      const width = 1 << (depth - level);
      this.layers[level] = new Array(width).fill(this.zeros[level]);
    }

    this.nextIndex = 0;
  }

  insert(value) {
    if (this.nextIndex >= this.capacity) {
      throw new Error('Tree is full');
    }
    const leaf = mod(BigInt(value));
    let idx = this.nextIndex;
    this.layers[0][idx] = leaf;
    let current = leaf;

    for (let level = 0; level < this.depth; level += 1) {
      const isRightNode = idx % 2 === 1;
      const siblingIndex = isRightNode ? idx - 1 : idx + 1;
      const sibling = siblingIndex < this.layers[level].length
        ? this.layers[level][siblingIndex]
        : this.zeros[level];

      const left = isRightNode ? sibling : current;
      const right = isRightNode ? current : sibling;
      current = hash2(left, right);

      idx = Math.floor(idx / 2);
      this.layers[level + 1][idx] = current;
    }

    this.nextIndex += 1;
    return this.nextIndex - 1;
  }

  bulkInsert(values) {
    return values.map((value) => this.insert(value));
  }

  root() {
    return this.layers[this.depth][0];
  }

  path(index) {
    if (index < 0 || index >= this.nextIndex) {
      throw new Error('Leaf index is out of range or not yet populated');
    }
    const pathElements = [];
    const pathIndices = [];
    let idx = index;
    for (let level = 0; level < this.depth; level += 1) {
      const isRightNode = idx % 2 === 1;
      const siblingIndex = isRightNode ? idx - 1 : idx + 1;
      const sibling = siblingIndex < this.layers[level].length
        ? this.layers[level][siblingIndex]
        : this.zeros[level];
      pathElements.push(sibling);
      pathIndices.push(isRightNode ? 1 : 0);
      idx = Math.floor(idx / 2);
    }
    return { pathElements, pathIndices };
  }

  leaf(index) {
    if (index < 0 || index >= this.nextIndex) {
      throw new Error('Leaf index is out of range or not yet populated');
    }
    return this.layers[0][index];
  }
}

module.exports = {
  IncrementalMerkleTree,
};
