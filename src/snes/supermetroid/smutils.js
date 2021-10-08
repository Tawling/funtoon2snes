import { GameStates } from "./enums";

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
