pragma circom 2.1.4;

template FieldHash2() {
    signal input left;
    signal input right;
    signal output out;

    signal sum;
    sum <== left + right;

    signal sum2;
    sum2 <== sum * sum;

    signal sum4;
    sum4 <== sum2 * sum2;

    signal sum5;
    sum5 <== sum4 * sum;

    signal mix;
    mix <== 3 * left + 5 * right + 7;

    out <== sum5 + mix;
}

template HashSponge(n) {
    signal input inputs[n];
    signal output out;

    signal state[n + 1];
    state[0] <== 0;

    component hashers[n];
    for (var i = 0; i < n; i++) {
        hashers[i] = FieldHash2();
        hashers[i].left <== state[i];
        hashers[i].right <== inputs[i];
        state[i + 1] <== hashers[i].out;
    }

    out <== state[n];
}
