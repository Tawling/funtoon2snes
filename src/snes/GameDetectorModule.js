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
        if (memory.headerChecksum.prevUnique() === undefined || this.checkChange(memory.headerChecksum)) {
            // Flag game as changed if checksum changes
            globalState.gameChanged = true;

            const game = [memory.headerGameTitle.value.strip()];

            // Check for game and game variants and push values into game string list

            switch (game[0]) {
                case "Super Metroid":
                case "SUPER METROID":
                    game.push("SM");
                    break;
                case "ZELDANODENSETSU":
                    game.push("ALTTP");
                    break;
                case "ALTTP+SM RANDOMIZER":
                    game.push("SMZ3");
                    break;
                default:
            }

            // Put game state into persistent global state data
            globalState.persistent.currentGame = game;
            sendEvent("gameROMChanged", game);
        }
    }
}
