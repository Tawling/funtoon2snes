
export function counterDelta(prevValue, newValue, bytes = 2) {
    if (newValue < prevValue) {
        return Math.pow(256, bytes) - prevValue + newValue;
    }
    return newValue - prevValue;
}
