import MemoryModule from "../../../util/memory/MemoryModule";
import { Rooms } from "../enums";
import Addresses from "../addresses";
import { BossStates } from "../enums";
import { readBigIntFlag } from "../smutils";

export default class KQKMiss extends MemoryModule {
    constructor() {
        super("kqkMiss", "Miss Kraid Quick Kill", false);
        this.tooltip = "Sends a message in chat if you miss KQK.";
    }

    settingDefs = {
        chatMessage: {
            display: "What to say in chat when you miss KQK",
            type: "text",
            default: "PogChamp DLC BOSS PHASE",
        },
    };

    shouldRunForGame(gameTags) {
        return gameTags.SM;
    }

    getMemoryReads() {
        return [Addresses.roomID, Addresses.bossStates, Addresses.scroll1, Addresses.scroll2];
    }

    memoryReadAvailable({ memory, sendEvent }) {
        if (memory.roomID.value === Rooms.Warehouse.KRAID_ROOM) {
            const kraidDead = readBigIntFlag(memory.bossStates.value, BossStates.KRAID);
            if (
                !kraidDead &&
                this.checkTransition(memory.scroll1, 0x0000, 0x0202) &&
                this.checkTransition(memory.scroll2, 0x0001, 0x0101)
            ) {
                sendEvent("msg", this.settings.chatMessage.value, 4);
            }
        }
    }
}
