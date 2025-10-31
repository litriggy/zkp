const { buildTree, buildWitness } = require('../src/prover/aggregated_membership_witness');

function main() {
  const depth = 4; // capacity 16 leaves
  const leaves = Array.from({ length: 12 }).map((_, idx) => BigInt(idx + 1));
  const tree = buildTree(depth, leaves);
  const indicesToProve = [1, 4, 7, 10];
  const witness = buildWitness(tree, indicesToProve);
  console.log('Root:', witness.root.toString());
  console.log('Aggregate commitment:', witness.aggregateCommitment.toString());
  console.log('Leaves:', witness.leaves.map((x) => x.toString()));
  console.log('First path elements:', witness.pathElements[0].map((x) => x.toString()));
  console.log('First path indices:', witness.pathIndices[0]);
}

if (require.main === module) {
  main();
}
