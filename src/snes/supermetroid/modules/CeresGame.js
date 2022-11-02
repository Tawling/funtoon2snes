import MemoryModule from "../../../util/memory/MemoryModule";
import { Rooms, GameStates, CeresEscapeStateFlags } from "../enums";
import Addresses from "../addresses";

const CeresGameState = {
    Closed: 0,
    PendingResult: 1,
    Opened: 2,
};

export default class CeresGameModule extends MemoryModule {
    constructor() {
        super("ceresGuessing", "Ceres Guessing Game");
        this.tooltip = "Allows chatters to guess the Ceres elevator time for points.";
        this.ceresState = CeresGameState.Closed;
        this.ceresDoorTimes = [0, 0, 0, 0, 0];
    }

    settingDefs = {
        ignoreResets: {
            display: "Keep guessing open through mid-ceres resets",
            type: "bool",
            default: true,
        },
        displayDoorTimes: {
            display: "Output what the ceres timer was at each door transition at the end of ceres",
            type: "bool",
            default: false,
        },
    };

    setEnabled(enabled) {
        super.setEnabled(enabled);
        this.ceresState = CeresGameState.Closed;
    }

    shouldRunForGame(gameTags) {
        return gameTags.SM && gameTags.VANILLA;
    }

    getMemoryReads() {
        return [Addresses.roomID, Addresses.gameState, Addresses.ceresTimer, Addresses.ceresState];
    }

    getTransitionIndex(memory) {
        if (this.checkTransition(memory.roomID, Rooms.Ceres.CERES_RIDLEY_ROOM, Rooms.Ceres.FIFTY_EIGHT_ESCAPE)) {
            return 0;
        } else if (
            this.checkTransition(memory.roomID, Rooms.Ceres.FIFTY_EIGHT_ESCAPE, Rooms.Ceres.DEAD_SCIENTIST_ROOM)
        ) {
            return 1;
        } else if (
            this.checkTransition(memory.roomID, Rooms.Ceres.DEAD_SCIENTIST_ROOM, Rooms.Ceres.MAGNET_STAIRS_ROOM)
        ) {
            return 2;
        } else if (this.checkTransition(memory.roomID, Rooms.Ceres.MAGNET_STAIRS_ROOM, Rooms.Ceres.FALLING_TILE_ROOM)) {
            return 3;
        } else if (
            this.checkTransition(memory.roomID, Rooms.Ceres.FALLING_TILE_ROOM, Rooms.Ceres.CERES_ELEVATOR_ROOM)
        ) {
            return 4;
        }
        return -1;
    }

    memoryReadAvailable({ memory, sendEvent, globalState, setReloadUnsafe }) {
        if (this.ceresState != CeresGameState.Closed && !this.settings.ignoreResets.value && globalState.isReset) {
            sendEvent("ceresReset");
            this.ceresState = CeresGameState.Closed;
            this.reloadUnsafe = false;
        }
        if (
            this.ceresState != CeresGameState.Opened &&
            this.checkTransition(memory.gameState, GameStates.NEW_GAME_POST_INTRO, undefined)
        ) {
            sendEvent("ceresOpen");
            this.ceresState = CeresGameState.Opened;
            this.reloadUnsafe = true;
        } else if (
            this.ceresState != CeresGameState.Closed &&
            this.checkTransition(
                memory.ceresState,
                CeresEscapeStateFlags.RIDLEY_SWOOP_CUTSCENE,
                CeresEscapeStateFlags.ESCAPE_TIMER_INITIATED
            )
        ) {
            sendEvent("ceresClose");
            this.ceresState = CeresGameState.PendingResult;
        } else if (
            this.checkTransition(
                memory.gameState,
                [GameStates.BLACK_OUT_FROM_CERES, GameStates.CERES_ELEVATOR],
                GameStates.CERES_DESTROYED_CINEMATIC
            )
        ) {
            this.ceresState = CeresGameState.Closed;
            sendEvent("ceresEnd", memory.ceresTimer.value, 3);

            if (this.settings.displayDoorTimes.value) {
                sendEvent("msg", "Door transition times: " + this.ceresDoorTimes.join(", "), 3);
            }

            setTimeout(() => (this.reloadUnsafe = false), 3200);
        } else if (this.ceresState == CeresGameState.PendingResult) {
            let transitionIndex = this.getTransitionIndex(memory);

            if (transitionIndex >= 0) {
                this.ceresDoorTimes[transitionIndex] = memory.ceresTimer.value.toString(16);
            }
        }
    }
}
