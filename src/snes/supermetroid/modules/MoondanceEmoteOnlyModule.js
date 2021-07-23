import MemoryModule from '../../../util/memory/MemoryModule';
import { Rooms } from '../enums';
import Addresses from '../../addresses';

const EmoteState = {
    Off: 0,
    On: 1,
}

export default class MoondanceEmoteOnlyModule extends MemoryModule {
    constructor() {
        super("moondanceEmoteOnly", "Emote-Only Mode During Moondance", false);
        this.emoteOnly = EmoteState.Off;
    }

    setEnabled(enabled) {
        super.setEnabled(enabled);
        this.emoteOnly = EmoteState.Off;
    }

    getMemoryReads() {
        return [
            Addresses.roomID,
            Addresses.samusMaxPBs,
        ]
    }
    
    async memoryReadAvailable(memory, handleEvent) {
        if (this.emoteOnly == EmoteState.Off && memory.samusMaxPBs.value == 0 && this.checkTransition(memory.roomID, Rooms.GreenBrinstar.GREEN_BRINSTAR_MAIN_SHAFT, Rooms.PinkBrinstar.DACHORA_ROOM)) {
            handleEvent('emoteOnly', true);
            this.emoteOnly = EmoteState.On;
        }
        else if (this.emoteOnly == EmoteState.On && memory.samusMaxPBs.value == 0 && this.checkTransition(memory.roomID, Rooms.PinkBrinstar.DACHORA_ROOM, [
            Rooms.GreenBrinstar.GREEN_BRINSTAR_MAIN_SHAFT,
            Rooms.PinkBrinstar.BIG_PINK,
        ])) {
            handleEvent('emoteOnly', false);
            this.emoteOnly = EmoteState.Off;
        }
    }
}