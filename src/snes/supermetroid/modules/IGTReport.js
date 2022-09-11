import MemoryModule from "../../../util/memory/MemoryModule";
import { GameStates } from "../enums";
import Addresses from "../addresses";

export default class IGTReport extends MemoryModule {
    constructor() {
        super("igtReport", "Report In-Game Time", true);
        this.tooltip = "Reports the exact in-game time at the end of a run, down to the frames.";
    }

    shouldRunForGame(gameTags) {
        return gameTags.SM && gameTags.VANILLA;
    }

    getMemoryReads() {
        return [
            Addresses.gameState,
            Addresses.gameTimeFrames,
            Addresses.gameTimeSeconds,
            Addresses.gameTimeMinutes,
            Addresses.gameTimeHours,
        ];
    }

    memoryReadAvailable({ memory, sendEvent }) {
        if (this.checkTransition(memory.gameState, undefined, GameStates.BEAT_THE_GAME)) {
            sendEvent("smIGTReport", {
                hours: memory.gameTimeHours.value,
                minutes: memory.gameTimeMinutes.value,
                seconds: memory.gameTimeSeconds.value,
                frames: memory.gameTimeFrames.value,
            });
        }
    }
}
