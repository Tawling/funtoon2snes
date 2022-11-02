import MemoryModule from "../../../util/memory/MemoryModule";
import { GameStates } from "../enums";
import Addresses from "../addresses";
import { isDeath } from "../utils/gameStateUtils";

const deathStates = [GameStates.SAMUS_DEAD, GameStates.SAMUS_DEAD_BLACK_OUT, GameStates.SAMUS_DEAD_BLACK_OUT_2, GameStates.SAMUS_DEAD_BEGIN_DEATH_ANIMATION, GameStates.SAMUS_DEAD_FLASHING, GameStates.SAMUS_DEAD_EXPLOSION, GameStates.SAMUS_DEAD_FADE_TO_BLACK]

export default class DeathEventModule extends MemoryModule {
    constructor() {
        super("deathEvent", "Send Generic Death Event");
        this.tooltip = "Sends an event to FUNtoon when Samus dies. This can be handled by scripts however you desire.";
    }

    shouldRunForGame(gameTags) {
        return gameTags.SM;
    }

    getMemoryReads() {
        return [Addresses.gameState];
    }

    memoryReadAvailable({ memory, sendEvent, globalState }) {
        if (!isDeath(memory.gameState.prevReadValue) && isDeath(memory.gameState.value)) {
            sendEvent("samusDeath");
            globalState.isDeath = true;
        } else {
            globalState.isDeath = false;
        }
    }
}
