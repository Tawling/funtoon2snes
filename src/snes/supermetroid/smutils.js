import { GameStates } from "./enums";

export function readIntFlag(eventStateValue, eventStateID) {
    return (eventStateValue >> eventStateID) & 1;
}
export function readBigIntFlag(bossStateValue, bossStateID) {
    return parseInt((bossStateValue >> BigInt(bossStateID)) & BigInt(1));
}

export function isDemo(gameState) {
    return (
        [
            GameStates.TRANSITION_FROM_DEMO,
            GameStates.TRANSITION_FROM_DEMO_2,
            GameStates.PLAYING_DEMO,
            GameStates.TRANSITION_TO_DEMO,
            GameStates.TRANSITION_TO_DEMO_2,
        ].indexOf(gameState) >= 0
    );
}
