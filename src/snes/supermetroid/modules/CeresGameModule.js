import MemoryModule from '../../../util/memory/MemoryModule';
import { Rooms, GameStates, CeresEscapeStateFlags } from '../enums';
import Addresses from '../../addresses';

const CeresGameState = {
    Closed: 0,
    Opened: 1,
}

export default class CeresGameModule extends MemoryModule {
    constructor() {
        super("ceresGuessing", "Ceres Guessing Game");
        this.ceresState = CeresGameState.Closed;
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
        if (this.ceresState == CeresGameState.Closed && this.checkTransition(memory.roomID, Rooms.EMPTY, Rooms.Ceres.CERES_ELEVATOR_ROOM)) {
            handleEvent('ceresOpen');
            this.ceresState = CeresGameState.Opened;
        }
        else if (this.ceresState == CeresGameState.Opened && this.checkTransition(memory.ceresState, CeresEscapeStateFlags.RIDLEY_SWOOP_CUTSCENE, CeresEscapeStateFlags.ESCAPE_TIMER_INITIATED)) {
            handleEvent('ceresClose');
            this.ceresState = CeresGameState.Opened;
        }
        else if (this.checkTransition(memory.gameState, [GameStates.BLACK_OUT_FROM_CERES, GameStates.CERES_ELEVATOR], GameStates.CERES_DESTROYED_CINEMATIC)) {
            if (this.checkTransition(memory.gameState, [GameStates.BLACK_OUT_FROM_CERES, GameStates.CERES_ELEVATOR], GameStates.CERES_DESTROYED_CINEMATIC)) {
                this.ceresState = CeresGameState.Closed;
                handleEvent('ceresEnd', memory.ceresTimer.value);
            }
        }
    }
}