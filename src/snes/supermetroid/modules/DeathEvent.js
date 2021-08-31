import MemoryModule from "../../../util/memory/MemoryModule";
import { GameStates } from "../enums";
import Addresses from "../addresses";

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
        if (this.checkTransition(memory.gameState, undefined, GameStates.SAMUS_DEAD)) {
            sendEvent("samusDeath");
            globalState.isDeath = true;
        } else {
            globalState.isDeath = false;
        }
    }
}
