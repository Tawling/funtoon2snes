import MemoryModule from "../../../util/memory/MemoryModule";
import { Rooms } from "../enums";
import Addresses from "../addresses";

const RidleyGameState = {
    Closed: 0,
    PendingResult: 1,
    Opened: 2,
};

export default class RidleyGameModule extends MemoryModule {
    constructor() {
        super("ridleyGuessing", "Ridley Guessing Game", true);
        this.tooltip = "Allows chatters to guess the Ridley room time for points.";
        this.ridleyState = RidleyGameState.Closed;
    }

    setEnabled(enabled) {
        super.setEnabled(enabled);
        this.ridleyState = RidleyGameState.Closed;
    }

    shouldRunForGame(gameTags) {
        return gameTags.SM && gameTags.VANILLA;
    }

    getMemoryReads() {
        return [Addresses.roomID];
    }

    memoryReadAvailable({ memory, sendEvent, globalState, setReloadUnsafe }) {
        if (globalState.isReset || globalState.isDeath) {
            this.ridleyState = RidleyGameState.Closed;
            return;
        }
        if (this.ridleyState != RidleyGameState.Closed && globalState.isReset) {
            this.ridleyState = RidleyGameState.Closed;
            setReloadUnsafe("false");
        }
        if (
            this.ridleyState != RidleyGameState.Opened &&
            this.checkTransition(
                memory.roomID,
                Rooms.LowerNorfair.WORST_ROOM_IN_THE_GAME,
                Rooms.LowerNorfair.AMPHITHEATRE
            )
        ) {
            sendEvent("ridleyOpen");
            this.ridleyState = RidleyGameState.Opened;
            setReloadUnsafe(true);
        } else if (
            this.ridleyState != RidleyGameState.Closed &&
            this.checkTransition(memory.roomID, Rooms.LowerNorfair.WASTELAND, Rooms.LowerNorfair.METAL_PIRATES_ROOM)
        ) {
            sendEvent("ridleyClose");
            this.ridleyState = RidleyGameState.PendingResult;
        } else if (
            this.ridleyState === RidleyGameState.PendingResult &&
            globalState.lastRoomTimeEvent.roomID === Rooms.LowerNorfair.RIDLEY_ROOM
        ) {
            this.ridleyState = RidleyGameState.Closed;
            sendEvent("ridleyEnd", globalState.lastRoomTimeEvent, 3);
            setReloadUnsafe(false);
        }
    }
}
