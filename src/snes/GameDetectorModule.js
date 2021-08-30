import MemoryModule from "../util/memory/MemoryModule";
import headerAddresses from "./headerAddresses";

export default class GameDetectorModule extends MemoryModule {
    constructor() {
        super("globalGameDetector", "Game Detector", true, true);
        this.tooltip = "Detects the current game.";
    }

    getMemoryReads() {
        return [headerAddresses.headerGameTitle, headerAddresses.headerChecksum];
    }

    async memoryReadAvailable({ memory, sendEvent, globalState }) {
        globalState.gameChanged = false;
        if (this.checkChange(memory.headerChecksum)) {
            // Flag game as changed if checksum changes
            globalState.gameChanged = true;

            const game = [memory.headerGameTitle.value.strip()];
            
            // TODO: check for game and game variants and push values into game string list
            switch (memory.headerGameTitle.value) {
                default:
            }
            // Put game state into persistent global state data
            globalState.persistent.currentGame = game;
            sendEvent('gameROMChanged', game);
        }
    }
}
