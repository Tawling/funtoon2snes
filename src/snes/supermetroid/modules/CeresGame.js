import MemoryModule from '../../../util/memory/MemoryModule';
import { Rooms, GameStates, CeresEscapeStateFlags } from '../enums';
import Addresses from '../addresses';

const CeresGameState = {
    Closed: 0,
    PendingResult: 1,
    Opened: 2,
}

export default class CeresGameModule extends MemoryModule {
    constructor() {
        super("ceresGuessing", "Ceres Guessing Game");
        this.tooltip = "Allows chatters to guess the Ceres elevator time for points."
        this.ceresState = CeresGameState.Closed;
    }

    settingDefs = {
        ignoreResets: {
            display: "Keep guessing open through mid-ceres resets",
            type: 'bool',
            default: true,
        }
    }

    setEnabled(enabled) {
        super.setEnabled(enabled);
        this.ceresState = CeresGameState.Closed;
    }

    getMemoryReads() {
        return [
            Addresses.roomID,
            Addresses.gameState,
            Addresses.ceresTimer,
            Addresses.ceresState,
        ]
    }
    
    async memoryReadAvailable({ memory, sendEvent, globalState, setReloadUnsafe }) {
        if (
            this.ceresState != CeresGameState.Closed &&
            !this.settings.ignoreResets.value &&
            globalState.isReset
        ) {
            sendEvent('ceresReset');
            this.ceresState = CeresGameState.Closed;
            this.reloadUnsafe = false;
        }
        if (this.ceresState != CeresGameState.Opened && this.checkTransition(memory.roomID, Rooms.EMPTY, Rooms.Ceres.CERES_ELEVATOR_ROOM)) {
            sendEvent('ceresOpen');
            this.ceresState = CeresGameState.Opened;
            this.reloadUnsafe = true;
        }
        else if (this.ceresState != CeresGameState.Closed && this.checkTransition(memory.ceresState, CeresEscapeStateFlags.RIDLEY_SWOOP_CUTSCENE, CeresEscapeStateFlags.ESCAPE_TIMER_INITIATED)) {
            sendEvent('ceresClose');
            this.ceresState = CeresGameState.PendingResult;
        }
        else if (this.checkTransition(memory.gameState, [GameStates.BLACK_OUT_FROM_CERES, GameStates.CERES_ELEVATOR], GameStates.CERES_DESTROYED_CINEMATIC)) {
            if (this.checkTransition(memory.gameState, [GameStates.BLACK_OUT_FROM_CERES, GameStates.CERES_ELEVATOR], GameStates.CERES_DESTROYED_CINEMATIC)) {
                this.ceresState = CeresGameState.Closed;
                sendEvent('ceresEnd', memory.ceresTimer.value, 3);
                this.reloadUnsafe = false;
            }
        }
    }
}