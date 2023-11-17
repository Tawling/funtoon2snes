import MemoryModule from "../../../util/memory/MemoryModule";
import { GameStates } from "../enums";
import Addresses from "../addresses";

export default class RunTrackerModule extends MemoryModule {
    constructor() {
        super("runTracker", "Track Contiguous Runs", true, true);
        this.tooltip = "Keeps track of runs from run start to run reset, assigning a unique ID per run.";
    }

    shouldRunForGame(gameTags) {
        return gameTags.SM;
    }

    getMemoryReads() {
        return [Addresses.gameState];
    }

    memoryReadAvailable({ memory, sendEvent, globalState }) {
        // TODO: detect run start
        // How should starting from a save point be treated? Should it be treated as a new run entirely?
        // Should it be treated differently if it's starting from the ship vs other locations? Or based on loadout?

        // Track deaths per run?
        if (globalState.isDeath) {
            globalState.persistent.deathCount = (globalState.persistent.deathCount ?? 0) + 1;
        }

        if (globalState.isReset) {
            // Run ended with reset
        } else if (this.checkTransition(memory.gameState, undefined, GameStates.BEAT_THE_GAME)) {
            // Run completed
        }
    }
}
