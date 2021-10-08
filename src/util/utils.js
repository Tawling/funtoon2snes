export function readIntFlag(intValue, flagIndex) {
    return !!((intValue >>> flagIndex) & 1);
}

export function readBigIntFlag(bigIntValue, flagIndex) {
    return !!parseInt((bigIntValue >> BigInt(flagIndex)) & BigInt(1));
}

export function readByteArrayFlag(byteArray, flagIndex) {
    return !!(byteArray[(flagIndex >>> 3)] & (0b10000000 >>> (flagIndex & 0x111)));
}
