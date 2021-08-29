import MemoryModule from "../../../util/memory/MemoryModule";
import { Rooms } from "../enums";
import Addresses from "../addresses";
import { isDemo } from "../smutils";

export default class ResetEventModule extends MemoryModule {
    constructor() {
        super("resetEvent", "Send Generic Reset Event");
        this.tooltip =
            "Sends an event to FUNtoon when the run is reset. This can be handled by scripts however you desire.";
    }

    getMemoryReads() {
        return [Addresses.gameState, Addresses.roomID];
    }

    async memoryReadAvailable({ memory, sendEvent, globalState }) {
        if (
            this.checkTransition(memory.roomID, undefined, Rooms.EMPTY) &&
            !isDemo(memory.gameState.value) &&
            !isDemo(memory.gameState.prev())
        ) {
            sendEvent("resetGame");
            globalState.isReset = true;
        } else {
            globalState.isReset = false;
        }
    }
}
