import MemoryModule from "../../../util/memory/MemoryModule";
import Addresses from "../addresses";

export default class NiceModule extends MemoryModule {
    constructor() {
        super("niceEvent", "69...Nice");
        this.tooltip = "Says 'Nice' when health is nice.";
        this.reported = false;
        this.lastNon69Time = Date.now();
        this.lastReport = 0;
    }

    settingDefs = {
        threshold: {
            display: "Say 'Nice' if health is 69 for at least this many seconds",
            type: "number",
            default: 2,
        },
        cooldown: {
            display: "Cooldown",
            type: "number",
            default: 30,
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
        if (
            !this.reported &&
            memory.samusHP.value % 100 === 69 &&
            time - this.lastNon69Time > this.settings.threshold.value * 1000 &&
            time - this.lastReport > this.settings.cooldown.value * 1000
        ) {
            this.reported = true;
            this.lastReport = Date.now();
            sendEvent("msg", "Nice HP", 3);
        } else if (memory.samusHP.value % 100 !== 69) {
            this.reported = false;
            this.lastNon69Time = time;
        }
    }
}
