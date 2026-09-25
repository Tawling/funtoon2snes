import MemoryModule from "../../../util/memory/MemoryModule";
import { Blacklist } from "../../../util/utils";
import Addresses from "../addresses";
import { OverworldLocations, UnderworldLocations } from "../enums";

export default class RoomsModule extends MemoryModule {
    constructor() {
        super("alttpRooms", "ALTTP Room Tracking", false, false);  // The last two booleans are "defaultEnabled" and "hidden"
        this.tooltip = "Work-In-Progress module for tracking rooms in ALTTP.";
        this.state = {
            currentRoom: null,
            currentFrames: 0,
            currentGameState: null
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
        return [
            Addresses.roomID
            , Addresses.overworldScreenID
            , Addresses.indoorState
            , Addresses.roomProp
            , Addresses.frameCounter
            , Addresses.lag
            , Addresses.subGameMode
        ];
    }

    // This function will be called each loop after reading the game memory.
    // The provided `memory` variable will contain the same names as the addresses you specified in getMemoryReads
    // The `sendEvent` function can be used to send custom events to FUNtoon.
    //     It has the shape sendEvent(eventName: string, data: any, delay: number [optional])
    // The `globalState` variable is a persistent object that is shared across all modules. You can use it to store data from one module, and have another module read that data.
    memoryReadAvailable({ memory, sendEvent, globalState }) {
        const curFrameCounter = memory.frameCounter.value;
        const prevFrameCounter = memory.frameCounter.prevReadValue;

        // Bitwise-and with 255 in order to handle the frame counter overflowing back to 0
        const framesAdvanced = (curFrameCounter - prevFrameCounter) & 0xFF;

        this.state.currentFrames += framesAdvanced; // + memory.lag.value;

        if (
            this.checkChange(memory.roomID)
            || this.checkChange(memory.overworldScreenID)
            || this.checkChange(memory.roomProp)
            || this.checkChange(memory.indoorState)
        ) {
            const currentRoom = this._findRoomDef(memory);
            if (null == this.state.currentRoom) {
                this.state.currentRoom = currentRoom;
            }
            const prevRoom = this.state.currentRoom;
            if (currentRoom && currentRoom.name !== prevRoom?.name) {
                this.state.currentRoom = currentRoom;
                const seconds = Math.trunc(this.state.currentFrames / 60);
                const frames = this.state.currentFrames % 60;
                this.state.currentFrames = 0;
                console.log("Room changed: %s -> %s, Time: %d.%d", prevRoom.name, currentRoom.name, seconds, frames);
            }
        }
    }

    _findRoomDef(memory, skipOverlay = true) {
        const Locations = memory.indoorState.value ? UnderworldLocations : OverworldLocations;
        const found = Object.entries(Locations).find(([roomName, roomDef]) => this._matchRoom(roomDef, memory, skipOverlay));
        return found ? { name: found[0], ...found[1] } : null;
    }

    _matchRoom(roomDef, memory, skipOverlay) {
        return this._checkValue(roomDef.roomID, memory.roomID.value)
            && this._checkValue(roomDef.overworldID, memory.overworldScreenID.value)
            && this._checkValue(roomDef.quadH, this._quadH(memory))
            && this._checkValue(roomDef.quadV, this._quadV(memory))
            && !(skipOverlay && roomDef.overlay);
    }

    _quadH(memory) {
        return memory.roomProp.value & 1;
    }

    _quadV(memory) {
        return memory.roomProp.value & 2;
    }

    _checkValue(valueDef, value) {
        return valueDef == undefined || (Array.isArray(valueDef) ? valueDef.includes(value) : valueDef === value);
    }
}
