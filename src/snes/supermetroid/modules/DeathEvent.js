import MemoryModule from "../../../util/memory/MemoryModule";
import Addresses from "../addresses";
import { isDeath } from "../utils/gameStateUtils";

export default class DeathEventModule extends MemoryModule {
    constructor() {
        super("deathEvent", "Send Generic Death Event", true, true);
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
