import Addresses from '../addresses';

export function readEventStateFlag(eventStateValue, eventStateID) {
    return (eventStateValue >> eventStateID) & 1;
}
export function readBossStateFlag(bossStateValue, bossStateID) {
    return parseInt((bossStateValue >> BigInt(bossStateID)) & BigInt(1));
}
