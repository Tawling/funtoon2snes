import MemoryModule from '../../../util/memory/MemoryModule';
import { Rooms, GameStates } from '../enums';
import Addresses from '../addresses';

export default class ResetEventModule extends MemoryModule {
    constructor() {
        super("resetEvent", "Send Generic Reset Event");
        this.tooltip = "Sends an event to FUNtoon when the run is reset. This can be handled by scripts however you desire."
    }

    getMemoryReads() {
        return [
            Addresses.gameState,
        ]
    }
    
    async memoryReadAvailable(memory, sendEvent, globalState) {
        if (this.checkTransition(memory.roomID, undefined, Rooms.EMPTY) && [
            GameStates.TRANSITION_FROM_DEMO,
            GameStates.TRANSITION_FROM_DEMO_2,
            GameStates.PLAYING_DEMO,
            GameStates.TRANSITION_TO_DEMO,
            GameStates.TRANSITION_TO_DEMO_2
        ].indexOf(memory.gameState.value) < 0) {
            sendEvent('resetGame');
            globalState.reset = true;
        } else {
            globalState.reset = false;
        }
    }
}