import MemoryModule from "../util/memory/MemoryModule";

export default class GameDetectorModule extends MemoryModule {
    constructor() {
        super("globalGameDetector", "Game Detector", true, true);
        this.tooltip = "Detects the current game."
    }

    getMemoryReads() {
        return []
    }
    
    async memoryReadAvailable({ memory, sendEvent, globalState }) {
        
    }
}