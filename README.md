# Aggregated Merkle Membership zkSNARK demo

This repository demonstrates the end-to-end layout for building an incremental Merkle tree off-chain, generating an aggregated membership witness for a batch of leaves, and verifying the corresponding zkSNARK proof on-chain.

> **Note**
> To keep the repository self-contained in an offline environment we use a lightweight algebraic hash instead of Poseidon. The circuits, JavaScript helpers, and Solidity contract are written so that replacing `FieldHash2`/`hash2` with a SNARK-friendly hash such as Poseidon or Rescue is straightforward.

## Repository layout

```
├── circuits
│   ├── aggregated_membership.circom  # Merkle proof aggregation circuit
│   └── hash.circom                   # Field hash and sponge primitive
├── contracts
│   └── AggregatedMembershipVerifier.sol  # Groth16 verifier skeleton
├── scripts
│   └── demo.js                       # Example incremental tree + witness builder
└── src
    ├── crypto
    │   ├── field.js                  # BN254 field operations
    │   └── hash.js                   # Hash primitive shared by JS & circuit
    ├── prover
    │   └── aggregated_membership_witness.js  # Witness construction helper
    └── tree
        └── incremental_merkle_tree.js        # Incremental Merkle tree implementation
```

## Off-chain workflow

1. **Ingest streaming data** – Use `IncrementalMerkleTree` to append leaves as they arrive. The implementation keeps all intermediate nodes so that membership paths can be served quickly.
2. **Batch selection** – Choose the leaf indices that should be aggregated into a single proof.
3. **Witness construction** – Call `buildWitness(tree, indices)` to obtain the Merkle paths, orientation bits, and aggregated commitment enforced by the circuit.
4. **Proof generation** – Compile `circuits/aggregated_membership.circom` with your desired `depth` and `batch` parameters and feed the witness into Groth16/Plonk proof generation.

You can run the example data flow locally:

```bash
node scripts/demo.js
```

The script prints the Merkle root, aggregated commitment, and the first membership path.

## Circuit compilation and proof generation

The Circom circuit is parameterised by depth (tree height) and batch size. A typical Groth16 pipeline with `snarkjs` looks like this:

```bash
circom circuits/aggregated_membership.circom --r1cs --wasm --sym -l circuits -D DEPTH=32 -D BATCH=1024
snarkjs groth16 setup aggregated_membership.r1cs powersOfTau28_hez_final_20.ptau agg_membership_0000.zkey
snarkjs zkey contribute agg_membership_0000.zkey agg_membership_final.zkey
snarkjs zkey export solidityverifier agg_membership_final.zkey contracts/AggregatedMembershipVerifier.sol
```

* Replace the parameters (`DEPTH`, `BATCH`) with values suited to your throughput.
* Feed the JSON witness produced by your prover (e.g. `snarkjs wtns calculate`) when generating proofs.
* The exported verifier will fill in the verifying key constants inside `AggregatedMembershipVerifier.sol`. The contract in this repository contains zero placeholders to highlight where the generated values must be inserted.

## On-chain verification

Deploy `AggregatedMembershipVerifier.sol` to your target network after replacing the verifying key with the auto-generated values. The contract exposes:

```solidity
function verifyAggregatedMembership(
    Proof memory proof,
    uint256 root,
    uint256 aggregateCommitment
) external view returns (bool)
```

The public inputs are the committed Merkle root published on-chain and the aggregate leaf commitment produced by the aggregator. Successful verification ensures that every leaf in the batch is part of the committed Merkle tree and that the aggregator didn’t alter the batch contents.

## Extending the demo

* **Poseidon hash** – Swap `FieldHash2`/`hash2` with Poseidon to reduce constraints and align with production SNARK systems.
* **Streaming storage** – Persist intermediate tree levels in a database (e.g. RocksDB) to serve proofs for billions of leaves.
* **Recursive aggregation** – Chunk very large batches (e.g. 100k leaves) into sub-circuits and wrap them recursively for smaller on-chain proofs.

This code base provides a compact but complete starting point for building the incremental Merkle tree + aggregated proof architecture discussed in the accompanying design conversation.
