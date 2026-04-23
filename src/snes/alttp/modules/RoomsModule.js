import MemoryModule from "../../../util/memory/MemoryModule";
import Addresses from "../addresses";
import { RoomIDs } from "../enums";

export default class RoomsModule extends MemoryModule {
    constructor() {
        super("alttpRooms", "ALTTP Room Tracking", false, false);  // The last two booleans are "defaultEnabled" and "hidden"
        this.tooltip = "Work-In-Progress module for tracking rooms in ALTTP.";
        this.state = {
            currentRoom: null,
        }
    }

    // Return the tag or list of tags that need to be active for this module to run.
    // See GameDetectorModule.js for how the tags get set.
    shouldRunForGame(gameTags) {
        return gameTags.ALTTP;
    }

    // Return a list of memory addresses to be read each loop
    // These names will be available in the `memory` variable in memoryReadAvailable as DataRead objects
    getMemoryReads() {
        return [Addresses.roomID, Addresses.overworldScreenID, Addresses.quadH, Addresses.quadV];
    }

    // This function will be called each loop after reading the game memory.
    // The provided `memory` variable will contain the same names as the addresses you specified in getMemoryReads
    // The `sendEvent` function can be used to send custom events to FUNtoon.
    //     It has the shape sendEvent(eventName: string, data: any, delay: number [optional])
    // The `globalState` variable is a persistent object that is shared across all modules. You can use it to store data from one module, and have another module read that data.
    memoryReadAvailable({ memory, sendEvent, globalState }) {
        if (this.checkChange(memory.roomID) || this.checkChange(memory.overworldScreenID) || this.checkChange(memory.quadH) || this.checkChange(memory.quadV)) {
            const currentRoom = this._findRoomDef(memory);
            const prevRoom = this.state.currentRoom;
            this.state.currentRoom = currentRoom;
            if (currentRoom && prevRoom && currentRoom.name !== prevRoom.name) {
                // Room changed
                sendEvent("alttpRoomChanged", {
                    currentRoom,
                    prevRoom,
                });
            }
        }
    }

    _findRoomDef(memory) {
        const found = Object.entries(RoomIDs).find(([roomName, roomDef]) => this._matchRoom(roomDef, memory));
        return found ? { name: found[0], ...found[1] } : null;
    }

    _matchRoom(roomDef, memory) {
        return this._checkValue(roomDef.roomID, memory.roomID.value) &&
            this._checkValue(roomDef.overworldScreenID, memory.overworldScreenID.value) &&
            this._checkValue(roomDef.quadH, memory.quadH.value) &&
            this._checkValue(roomDef.quadV, memory.quadV.value);
    }

    _checkValue(valueDef, value) {
        return !valueDef || (Array.isArray(valueDef) ? valueDef.includes(value) : valueDef === value);
    }
}
