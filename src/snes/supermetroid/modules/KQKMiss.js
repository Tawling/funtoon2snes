import MemoryModule from "../../../util/memory/MemoryModule";
import { Rooms } from "../enums";
import Addresses from "../addresses";
import { BossStates } from "../enums";

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
        return gameTags.SM && gameTags.VANILLA;
    }

    getMemoryReads() {
        return [Addresses.roomID, Addresses.bossStates, Addresses.scroll1, Addresses.scroll2];
    }

    memoryReadAvailable({ memory, sendEvent }) {
        const kraidDead = readBigIntFlag(memory.bossStates.value, BossStates.KRAID);
        if (
            !kraidDead &&
            memory.roomID.value === Rooms.Warehouse.KRAID_ROOM &&
            this.checkTransition(memory.scroll1, undefined, 0x0202) &&
            this.checkTransition(memory.scroll2, undefined, 0x0101)
        ) {
            sendEvent("msg", this.settings.chatMessage.value, 4);
        }
    }
}
