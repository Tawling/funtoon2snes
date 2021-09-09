import MemoryModule from "../../../util/memory/MemoryModule";
import Addresses from "../addresses";

export default class NiceModule extends MemoryModule {
    constructor() {
        super("niceEvent", "69...Nice");
        this.tooltip = "Says 'Nice' when health is nice.";
        this.reported = false;
        this.lastNon69Time = Date.now();
    }

    settingDefs = {
        threshold: {
            display: "Say 'Nice' if health is 69 for at least this many seconds",
            type: "number",
            default: 2,
        },
    };

    shouldRunForGame(gameTags) {
        return gameTags.SM;
    }

    getMemoryReads() {
        return [Addresses.samusHP];
    }

    memoryReadAvailable({ memory, sendEvent }) {
        const time = Date.now();
        if (!this.reported && memory.samusHP.value % 100 === 69 && time - this.lastNon69Time > this.settings.threshold) {
            this.reported = true;
            sendEvent('msg', 'Nice.');
        } else {
            this.reported = false;
            this.lastNon69Time = time;
        }
    }
}
