import MemoryModule from '../../../util/memory/MemoryModule';
import { Rooms, GameStates, CeresEscapeStateFlags } from '../enums';
import Addresses from '../../addresses';

const CeresGameState = {
    Closed: 0,
    PendingResult: 1,
    Opened: 2,
}

export default class CeresGameModule extends MemoryModule {
    constructor() {
        super("ceresGuessing", "Ceres Guessing Game");
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
    
    async memoryReadAvailable(memory, handleEvent) {
        if (!this.settings.ignoreResets.value && this.checkTransition(memory.roomID, undefined, Rooms.EMPTY) && [
            GameStates.TRANSITION_FROM_DEMO,
            GameStates.TRANSITION_FROM_DEMO_2,
            GameStates.PLAYING_DEMO,
            GameStates.TRANSITION_TO_DEMO,
            GameStates.TRANSITION_TO_DEMO_2
        ].indexOf(memory.gameState.value) > -1) {
            handleEvent('ceresReset');
            this.ceresState = CeresGameState.Closed;
        }
        if (this.ceresState != CeresGameState.Opened && this.checkTransition(memory.roomID, Rooms.EMPTY, Rooms.Ceres.CERES_ELEVATOR_ROOM)) {
            handleEvent('ceresOpen');
            this.ceresState = CeresGameState.Opened;
        }
        else if (this.ceresState != CeresGameState.Closed && this.checkTransition(memory.ceresState, CeresEscapeStateFlags.RIDLEY_SWOOP_CUTSCENE, CeresEscapeStateFlags.ESCAPE_TIMER_INITIATED)) {
            handleEvent('ceresClose');
            this.ceresState = CeresGameState.PendingResult;
        }
        else if (this.checkTransition(memory.gameState, [GameStates.BLACK_OUT_FROM_CERES, GameStates.CERES_ELEVATOR], GameStates.CERES_DESTROYED_CINEMATIC)) {
            if (this.checkTransition(memory.gameState, [GameStates.BLACK_OUT_FROM_CERES, GameStates.CERES_ELEVATOR], GameStates.CERES_DESTROYED_CINEMATIC)) {
                this.ceresState = CeresGameState.Closed;
                handleEvent('ceresEnd', memory.ceresTimer.value);
            }
        }
    }
}