pragma circom 2.1.4;

include "hash.circom";

template MerkleProof(depth) {
    signal input leaf;
    signal input pathElements[depth];
    signal input pathIndices[depth];
    signal output root;

    component hashers[depth];
    signal current[depth + 1];
    current[0] <== leaf;

    for (var i = 0; i < depth; i++) {
        signal isRight;
        isRight <== pathIndices[i];
        pathIndices[i] * (pathIndices[i] - 1) === 0;

        hashers[i] = FieldHash2();

        signal left;
        signal right;
        left <== (1 - isRight) * current[i] + isRight * pathElements[i];
        right <== isRight * current[i] + (1 - isRight) * pathElements[i];

        hashers[i].left <== left;
        hashers[i].right <== right;
        current[i + 1] <== hashers[i].out;
    }

    root <== current[depth];
}

template AggregatedMembership(depth, batch) {
    signal input root;
    signal input aggregateCommitment;
    signal input leaves[batch];
    signal input pathElements[batch][depth];
    signal input pathIndices[batch][depth];

    component proofs[batch];
    component sponge = HashSponge(batch);

    for (var i = 0; i < batch; i++) {
        proofs[i] = MerkleProof(depth);
        proofs[i].leaf <== leaves[i];
        for (var d = 0; d < depth; d++) {
            proofs[i].pathElements[d] <== pathElements[i][d];
            proofs[i].pathIndices[d] <== pathIndices[i][d];
        }
        root === proofs[i].root;
        sponge.inputs[i] <== leaves[i];
    }

    aggregateCommitment === sponge.out;
}
