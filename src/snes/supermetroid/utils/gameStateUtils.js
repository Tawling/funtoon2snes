import { GameStates } from "../enums";

const DemoStates = [
    GameStates.TRANSITION_FROM_DEMO,
    GameStates.TRANSITION_FROM_DEMO_2,
    GameStates.PLAYING_DEMO,
    GameStates.TRANSITION_TO_DEMO,
    GameStates.TRANSITION_TO_DEMO_2,
];
export function isDemo(gameState) {
    return DemoStates.includes(gameState);
}

const DeathStates = [
    GameStates.SAMUS_DEAD,
    GameStates.SAMUS_DEAD_BLACK_OUT,
    GameStates.SAMUS_DEAD_BLACK_OUT_2,
    GameStates.SAMUS_DEAD_BEGIN_DEATH_ANIMATION,
    GameStates.SAMUS_DEAD_FLASHING,
    GameStates.SAMUS_DEAD_EXPLOSION,
    GameStates.SAMUS_DEAD_FADE_TO_BLACK,
];
export function isDeath(gameState) {
    return DeathStates.includes(gameState);
}

const IGTRunningStates = [
    GameStates.GAMEPLAY,
    GameStates.FADE_TO_PAUSE,
    GameStates.FADE_FROM_PAUSE,
    GameStates.INIT_GAME_AFTER_LOAD,
    GameStates.SAMUS_DEAD,
    GameStates.SAMUS_DEAD_BLACK_OUT,
    GameStates.AUTO_RESERVE,
    GameStates.CERES_ELEVATOR,
    GameStates.BLACK_OUT_FROM_CERES,
    GameStates.CERES_TIME_UP,
    GameStates.BEAT_THE_GAME,
];
export function isIGTPaused(gameState) {
    return !IGTRunningStates.includes(gameState);
}

const NonGameplayStates = [
    GameStates.START,
    GameStates.OPENING_CINEMATIC,
    GameStates.GAME_OPTIONS_MENU,
    GameStates.NOTHING,
    GameStates.SAVE_GAME_MENU,
    GameStates.LOADING_GAME_MAP_VIEW,
    GameStates.UNUSED,
    GameStates.DEBUG_MENU,
    GameStates.INTRO_CINEMATIC,
    GameStates.TRANSITION_FROM_DEMO,
    GameStates.TRANSITION_FROM_DEMO_2,
    GameStates.TRANSITION_TO_DEMO,
    GameStates.TRANSITION_TO_DEMO_2,
];
export function isGameplay(gameState) {
    return !NonGameplayStates.includes(gameState);
}
