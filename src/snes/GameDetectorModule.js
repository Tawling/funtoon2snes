import MemoryModule from "../util/memory/MemoryModule";
import headerAddresses from "./headerAddresses";

export default class GameDetectorModule extends MemoryModule {
    constructor() {
        super("globalGameDetector", "Game Detector", true, true);
        this.tooltip = "Detects the current game.";
        this.__shouldRunForGame = true;
        this.isLoRAM = true;
        this.headerRead = false;
    }

    shouldRunForGame() {
        return true;
    }

    getMemoryReads() {
        return [
            headerAddresses.hiHeaderMapMode,
            headerAddresses.loHeaderMapMode,
            ...(this.isLoRAM
                ? [headerAddresses.loHeaderGameTitle, headerAddresses.loHeaderChecksum, headerAddresses.loHeaderRAMSize]
                : [
                      headerAddresses.hiHeaderGameTitle,
                      headerAddresses.hiHeaderChecksum,
                      headerAddresses.hiHeaderRAMSize,
                  ]),
        ];
    }

    memoryReadAvailable({ memory, sendEvent, globalState }) {
        globalState.gameTagsChanged = false;

        // Check for HiROM or LoROM bits
        if (memory.hiHeaderMapMode.value & (1 === 1)) {
            this.isLoRAM = false;
        } else if (memory.loHeaderMapMode.value & (1 === 0)) {
            this.isLoRAM = true;
        } else {
            console.log("INVALID HEADER");
            return;
        }

        if ((this.isLoRAM && !memory.loHeaderChecksum) || (!this.isLoRAM && !memory.hiHeaderChecksum)) {
            // header values read were for the wrong map mode
            this.headerRead = false;
            return;
        }

        let checksum, ramSize, gameTitle;

        if (this.isLoRAM) {
            checksum = memory.loHeaderChecksum;
            ramSize = memory.loHeaderRAMSize;
            gameTitle = memory.loHeaderGameTitle;
        } else {
            checksum = memory.hiHeaderChecksum;
            ramSize = memory.hiHeaderRAMSize;
            gameTitle = memory.hiHeaderGameTitle;
        }

        if (
            !this.headerRead ||
            (checksum.prevFrameValue === undefined && checksum.value !== undefined) ||
            this.checkChange(checksum) ||
            this.checkChange(ramSize)
        ) {
            this.headerRead = true;
            // Flag game as changed if header changes
            globalState.gameTagsChanged = true;

            const gameTags = { [gameTitle.value.trim()]: true };

            // Check for game and game variants and push values into game string list

            switch (gameTitle.value.trim()) {
                case "Super Metroid":
                case "SUPER METROID":
                    gameTags["SM"] = true;
                    if (ramSize.value >= 0x05) {
                        gameTags["PRACTICE"] = true;
                    }
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
        } else if (!globalState.persistent.gameTags) {
            globalState.persistent.gameTags = {};
        }
    }
}
