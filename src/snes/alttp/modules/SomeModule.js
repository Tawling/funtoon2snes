import MemoryModule from "../../../util/memory/MemoryModule";
import Addresses from "../addresses";

export default class SomeModule extends MemoryModule {
    constructor() {
        super("someUniqueName", "Some Explanation", false, false);  // The last two booleans are "defaultEnabled" and "hidden"
        this.tooltip = "Some human-readable tooltip explaining what this module does.";
    }

    // Return the tag or list of tags that need to be active for this module to run.
    // See GameDetectorModule.js for how the tags get set.
    shouldRunForGame(gameTags) {
        return gameTags.ALTTP;
    }

    // Return a list of memory addresses to be read each loop
    // These names will be available in the `memory` variable in memoryReadAvailable as DataRead objects
    getMemoryReads() {
        return [Addresses.someName];
    }

    // This function will be called each loop after reading the game memory.
    // The provided `memory` variable will contain the same names as the addresses you specified in getMemoryReads
    // The `sendEvent` function can be used to send custom events to FUNtoon.
    //     It has the shape sendEvent(eventName: string, data: any, delay: number [optional])
    // The `globalState` variable is a persistent object that is shared across all modules. You can use it to store data from one module, and have another module read that data.
    memoryReadAvailable({ memory, sendEvent, globalState }) {
        if (this.checkChange(memory.someName)) {
            console.log(memory.someName.value)
        }
    }
}
