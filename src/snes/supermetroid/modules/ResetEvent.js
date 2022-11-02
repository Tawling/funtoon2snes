import MemoryModule from "../../../util/memory/MemoryModule";
import { GameStates, Rooms } from "../enums";
import Addresses from "../addresses";
import { isDemo, isGameplay } from "../utils/gameStateUtils";

export default class ResetEventModule extends MemoryModule {
    constructor() {
        super("resetEvent", "Send Generic Reset Event");
        this.tooltip =
            "Sends an event to FUNtoon when the run is reset. This can be handled by scripts however you desire.";
    }

    shouldRunForGame(gameTags) {
        return gameTags.SM;
    }

    getMemoryReads() {
        return [Addresses.gameState, Addresses.roomID];
    }

    memoryReadAvailable({ memory, sendEvent, globalState }) {
        if (
            memory.gameState.value !== GameStates.GAMEPLAY &&
            ((this.checkTransition(memory.roomID, undefined, Rooms.EMPTY) &&
                !isDemo(memory.gameState.value) &&
                !isDemo(memory.gameState.prevReadValue)) ||
                (isGameplay(memory.gameState.prevReadValue) && !isGameplay(memory.gameState.value)))
        ) {
            sendEvent("resetGame");
            globalState.isReset = true;
        } else {
            globalState.isReset = false;
        }
    }
}
