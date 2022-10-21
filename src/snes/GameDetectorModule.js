import MemoryModule from "../util/memory/MemoryModule";
import headerAddresses from "./headerAddresses";
import smz3Addresses from "./smz3/addresses";

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

            // smz3Addresses.smz3CurrentGame,

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
        const loROMValid = (memory.loHeaderMapMode.value & 0b11101000) === 0b00100000;
        const hiROMValid = (memory.hiHeaderMapMode.value & 0b11101000) === 0b00100000;
        if (
            loROMValid &&
            ((memory.loHeaderMapMode.value & 0b111) === 0b000 || (memory.loHeaderMapMode.value & 0b111) === 0b011)
        ) {
            this.isLoRAM = true;
        } else if (
            hiROMValid &&
            ((memory.hiHeaderMapMode.value & 0b111) === 0b001 || (memory.hiHeaderMapMode.value & 0b111) === 0b101)
        ) {
            this.isLoRAM = false;
        } else {
            console.log("INVALID HEADER");
            return;
        }

        // console.log(this.isLoRAM);

        if ((this.isLoRAM && !memory.loHeaderChecksum) || (!this.isLoRAM && !memory.hiHeaderChecksum)) {
            // header values read were for the wrong map mode
            this.headerRead = false;
            console.log("Header not read...postponing until next read.");
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
            (checksum.prevReadValue === undefined && checksum.value !== undefined) ||
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
                    } else {
                        gameTags["VANILLA"] = true;
                    }
                    break;
                case "ZELDANODENSETSU":
                    gameTags["ALTTP"] = true;
                    break;
                case "ALTTP+SM RANDOMIZER":
                    gameTags["SMZ3"] = true;
                    // if (smz3Addresses.smz3CurrentGame.value === 0x0000) {
                    //     gameTags["ALTTP"] = true;
                    // } else if (smz3Addresses.smz3CurrentGame.value < 0x8000) {
                    //     gameTags["SM"] = true;
                    // } else {
                    //     gameTags["CREDITS"] = true;
                    // }
                    // TODO: check flag for current internal game and push corresponding tag
                    break;
                default:
            }

            // Put game state into persistent global state data
            globalState.persistent.gameTags = gameTags;
            sendEvent("gameROMDetected", Object.keys(gameTags));
        } else if (!globalState.persistent.gameTags) {
            globalState.persistent.gameTags = {};
        }
    }
}
