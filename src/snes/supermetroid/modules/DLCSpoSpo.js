import MemoryModule from "../../../util/memory/MemoryModule";
import { Rooms } from "../enums";
import Addresses from "../addresses";
import { BossStates } from "../enums";
import { readBigIntFlag } from "../smutils";

export default class DLCSpoSpo extends MemoryModule {
    constructor() {
        super("dlcSpoSpo", "Spore Spawn DLC", false);
        this.tooltip = "Sends a message in chat if you enter the Spore Spawn fight.";
    }

    settingDefs = {
        chatMessage: {
            display: "What to say in chat when you enter Spore Spawn fight",
            type: "text",
            default: "PogChamp DLC MINIBOSS",
        },
    };

    shouldRunForGame(gameTags) {
        return gameTags.SM && gameTags.VANILLA;
    }

    getMemoryReads() {
        return [Addresses.roomID, Addresses.bossStates];
    }

    memoryReadAvailable({ memory, sendEvent }) {
        const spospoDead = readBigIntFlag(memory.bossStates.value, BossStates.SPORE_SPAWN);
        if (!spospoDead && this.checkTransition(memory.roomID, undefined, Rooms.GreenBrinstar.SPORE_SPAWN_ROOM)) {
            sendEvent("msg", this.settings.chatMessage.value, 4);
        }
    }
}
