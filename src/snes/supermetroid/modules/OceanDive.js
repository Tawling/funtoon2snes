import MemoryModule from '../../../util/memory/MemoryModule';
import { Rooms, LiquidPhysicsType } from '../enums';
import Addresses from '../addresses';

export default class MoatDiveModule extends MemoryModule {
    constructor() {
        super("oceanDive", "Ocean Dive", false);
        this.tooltip = "Sends a message in chat if you fall in west ocean."
        this.lastTrigger = 0;
    }

    settingDefs = {
        chatMessage: {
            display: "What to say in chat when you fall in the water in West Ocean",
            type: 'text',
            default: "funtooFine funtooFine funtooFine funtooFine funtooFine funtooFine funtooFine funtooFine",
        },
        cooldown: {
            display: "Cooldown in seconds between triggers",
            type: 'number',
            default: 60,
        }
    }

    setEnabled(enabled) {
        super.setEnabled(enabled);
    }

    getMemoryReads() {
        return [
            Addresses.roomID,
            Addresses.samusWaterPhysics,
        ]
    }
    
    async memoryReadAvailable({ memory, sendEvent }) {
        let curTime = Date.now() / 1000;
        
        if (
            curTime - this.lastTrigger > this.settings.cooldown.value
            && Addresses.roomID.value === Rooms.Crateria.WEST_OCEAN
            && Addresses.roomID.prev(1) === Rooms.Crateria.THE_MOAT
            && memory.samusWaterPhysics.value === LiquidPhysicsType.WATER
            && memory.samusWaterPhysics.prevFrameValue === LiquidPhysicsType.AIR
        ) {
            sendEvent('msg', this.settings.chatMessage.value, 4);
            this.lastTrigger = Date.now() / 1000;
        }
    }
}