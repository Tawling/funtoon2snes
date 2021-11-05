import MemoryModule from "../../../util/memory/MemoryModule";
import { Rooms } from "../enums";
import Addresses from "../addresses";

const EmoteState = {
    Off: 0,
    On: 1,
};

export default class MoondanceEmoteOnlyModule extends MemoryModule {
    constructor() {
        super("moondanceEmoteOnly", "Emote-Only Mode During Moondance", false);
        this.tooltip = "Enables emote-only mode in chat during Moondance for RBO runs.";
        this.emoteOnly = EmoteState.Off;
    }

    setEnabled(enabled) {
        super.setEnabled(enabled);
        this.emoteOnly = EmoteState.Off;
    }

    shouldRunForGame(gameTags) {
        return gameTags.SM && gameTags.VANILLA;
    }

    getMemoryReads() {
        return [Addresses.roomID, Addresses.samusMaxPBs];
    }

    memoryReadAvailable({ memory, sendEvent }) {
        if (
            this.emoteOnly == EmoteState.Off &&
            memory.samusMaxPBs.value == 0 &&
            this.checkTransition(
                memory.roomID,
                Rooms.GreenBrinstar.GREEN_BRINSTAR_MAIN_SHAFT,
                Rooms.PinkBrinstar.DACHORA_ROOM
            )
        ) {
            sendEvent("emoteOnly", true, 10);
            this.emoteOnly = EmoteState.On;
        } else if (
            this.emoteOnly == EmoteState.On &&
            memory.samusMaxPBs.value == 0 &&
            this.checkTransition(memory.roomID, Rooms.PinkBrinstar.DACHORA_ROOM, [
                Rooms.GreenBrinstar.GREEN_BRINSTAR_MAIN_SHAFT,
                Rooms.PinkBrinstar.BIG_PINK,
                Rooms.EMPTY,
            ])
        ) {
            sendEvent("emoteOnly", false);
            this.emoteOnly = EmoteState.Off;
        }
    }
}
