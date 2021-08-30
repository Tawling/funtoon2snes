import MemoryModule from "../util/memory/MemoryModule";
import headerAddresses from "./headerAddresses";

export default class GameDetectorModule extends MemoryModule {
    constructor() {
        super("globalGameDetector", "Game Detector", true, true);
        this.tooltip = "Detects the current game.";
        this.__shouldRunForGame = true;
    }

    shouldRunForGame() {
        return true;
    }

    getMemoryReads() {
        return [headerAddresses.headerGameTitle, headerAddresses.headerChecksum];
    }

    async memoryReadAvailable({ memory, sendEvent, globalState }) {
        globalState.gameTagsChanged = false;
        if (memory.headerChecksum.prevUnique() === undefined || this.checkChange(memory.headerChecksum)) {
            // Flag game as changed if checksum changes
            globalState.gameTagsChanged = true;

            const gameTags = { [memory.headerGameTitle.value.strip()]: true }

            // Check for game and game variants and push values into game string list

            switch (game[0]) {
                case "Super Metroid":
                case "SUPER METROID":
                    gameTags["SM"] = true;
                    break;
                case "ZELDANODENSETSU":
                    gameTags["ALTTP"] = true;
                    break;
                case "ALTTP+SM RANDOMIZER":
                    gameTags["SMZ3"] = true;
                    // TODO: check flag for current internal game and push corresponding tag
                    break;
                default:
            }

            // Put game state into persistent global state data
            globalState.persistent.gameTags = gameTags;
            sendEvent("gameROMChanged", Object.keys(gameTags));
        }
    }
}
