import MemoryModule from "../../../util/memory/MemoryModule";
import { EventStates, GameStates, MotherBrainForms, Rooms } from "../enums";
import Addresses from "../addresses";
import { readIntFlag } from "../../../util/utils";

const ZebesGameState = {
    Closed: 0,
    PendingResult: 1,
    Opened: 2,
};

export default class ZebesGameModule extends MemoryModule {
    constructor() {
        super("zebesGuessing", "Zebes Escape Guessing Game");
        this.tooltip = "Allows chatters to guess the Zebes escape timer for points.";
        this.zebesState = ZebesGameState.Closed;
        // this.zebesDoorTimes = [0, 0, 0, 0, 0];
    }

    settingDefs = {
        // displayDoorTimes: {
        //     display: "Output what the zebes timer was at each door transition at the end of zebes escape",
        //     type: "bool",
        //     default: false,
        // },
    };

    setEnabled(enabled) {
        super.setEnabled(enabled);
        this.zebesState = ZebesGameState.Closed;
    }

    shouldRunForGame(gameTags) {
        return gameTags.SM && gameTags.VANILLA;
    }

    getMemoryReads() {
        return [
            Addresses.roomID,
            Addresses.gameState,
            Addresses.eventStates,
            Addresses.mbForm,
            Addresses.timerMinutes,
        ];
    }

    // getTransitionIndex(memory) {
    //     if (this.checkTransition(memory.roomID, Rooms.Zebes.CERES_RIDLEY_ROOM, Rooms.Zebes.FIFTY_EIGHT_ESCAPE)) {
    //         return 0;
    //     } else if (
    //         this.checkTransition(memory.roomID, Rooms.Zebes.FIFTY_EIGHT_ESCAPE, Rooms.Zebes.DEAD_SCIENTIST_ROOM)
    //     ) {
    //         return 1;
    //     } else if (
    //         this.checkTransition(memory.roomID, Rooms.Zebes.DEAD_SCIENTIST_ROOM, Rooms.Zebes.MAGNET_STAIRS_ROOM)
    //     ) {
    //         return 2;
    //     } else if (this.checkTransition(memory.roomID, Rooms.Zebes.MAGNET_STAIRS_ROOM, Rooms.Zebes.FALLING_TILE_ROOM)) {
    //         return 3;
    //     } else if (
    //         this.checkTransition(memory.roomID, Rooms.Zebes.FALLING_TILE_ROOM, Rooms.Zebes.CERES_ELEVATOR_ROOM)
    //     ) {
    //         return 4;
    //     }
    //     return -1;
    // }

    memoryReadAvailable({ memory, sendEvent, globalState, setReloadUnsafe }) {
        if (this.zebesState !== ZebesGameState.Closed && globalState.isReset) {
            sendEvent("zebesReset");
            this.zebesState = ZebesGameState.Closed;
            this.reloadUnsafe = false;
        }
        if (
            this.zebesState !== ZebesGameState.Opened && memory.roomID === Rooms.Tourian.MOTHER_BRAIN_ROOM &&
            this.checkTransition(memory.mbForm, undefined, MotherBrainForms.SECOND_PHASE)
        ) {
            sendEvent("zebesOpen");
            this.zebesState = ZebesGameState.Opened;
            this.reloadUnsafe = true;
        } else if (
            this.zebesState !== ZebesGameState.Closed &&
            this.checkBitChange(memory.eventStates, EventStates.ZEBES_TIMEBOMB_SET) &&
            readIntFlag(memory.eventStates.value, EventStates.ZEBES_TIMEBOMB_SET)
        ) {
            sendEvent("zebesClose");
            this.zebesState = ZebesGameState.PendingResult;
        } else if (
            this.checkTransition(
                memory.gameState,
                undefined,
                GameStates.BEAT_THE_GAME,
            )
        ) {
            this.zebesState = ZebesGameState.Closed;
            sendEvent("zebesEnd", `${(memory.timerMinutes.value || '00')}${(memory.ceresTimer.value || '0000')}`, 3);

            // if (this.settings.displayDoorTimes.value) {
            //     sendEvent("msg", "Door transition times: " + this.zebesDoorTimes.join(", "), 3);
            // }

            setTimeout(() => (this.reloadUnsafe = false), 3200);
        } else if (this.zebesState === ZebesGameState.PendingResult) {
            // let transitionIndex = this.getTransitionIndex(memory);
            // if (transitionIndex >= 0) {
            //     this.zebesDoorTimes[transitionIndex] = memory.ceresTimer.value.toString(16);
            // }
        }
    }
}
