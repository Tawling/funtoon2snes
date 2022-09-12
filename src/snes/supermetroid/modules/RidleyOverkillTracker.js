import MemoryModule from "../../../util/memory/MemoryModule";
import { Rooms } from "../enums";
import Addresses from "../addresses";

export default class RidleyOverkillTracker extends MemoryModule {
    constructor() {
        super("ridleyOverkillTracker", "Ridley Overkill Tracker");
        this.tooltip = "Writes in Chat how many shots you wasted on Ridley.";
        this.reset();
    }

    settingDefs = {
        displayDoorTimes: {
            display: "Use a custom event (name: ridleyOverkill) instead of default message",
            type: "bool",
            default: false,
        }
    };

    setEnabled(enabled) {
        super.setEnabled(enabled);
        this.reset();
    }

    shouldRunForGame(gameTags) {
        return gameTags.SM;
    }

    getMemoryReads() {
        return [
            Addresses.roomID,
            Addresses.gameState,
            Addresses.enemyHP,
            Addresses.samusHP,
            Addresses.samusReserveHP,
            Addresses.ridleyIframeTimer,
            Addresses.ridleyShotDamage,
        ];
    }

    reset() {
        this.lastCheck = 0;
        this.inRidleyFight = false;
        this.startCounting = false;
        this.additionalShotCounter = 0;
        this.additionalDamageDealt = 0;
    }

    getMessage() {
        return 'That was an overkill. ' +
            'You had ' + this.additionalShotCounter + ' ' +
            'additional <{plural("shot", ' + this.additionalShotCounter + ')}>'
    }

    memoryReadAvailable({ memory, sendEvent }) {
        // Handle a run being reset
        if (
            memory.roomID.prevFrameValue !== undefined &&
            memory.roomID.prevFrameValue !== Rooms.EMPTY &&
            memory.roomID.value === Rooms.EMPTY
        ) {
            if (this.inRidleyFight) {
                // were in ridley fight but reset due to ridley
            }
            this.reset();
            return;
        }

        // if we are not yet in the fight, but we are in ridley room and he appears
        if (
            !this.inRidleyFight &&
            memory.roomID.value === Rooms.LowerNorfair.RIDLEY_ROOM &&
            this.checkChange(memory.enemyHP)
        ) {
            if (memory.enemyHP.value !== 0) {
                this.inRidleyFight = true;
                return;
            }
        }

        // we are in ridley fight
        else if (this.inRidleyFight) {

            // we left ridley room in whatever direction
            if (this.checkTransition(memory.roomID, Rooms.LowerNorfair.RIDLEY_ROOM)) {
                if (this.additionalShotCounter > 0) {
                    if (this.settings.displayDoorTimes.value) {
                        sendEvent('ridleyOverkill', {shots:this.additionalShotCounter, damage:this.additionalDamageDealt});
                    }
                    else {
                        sendEvent('msg', this.getMessage(), 3);
                    }
                }
                this.reset();
            }

            // keep watching for the last hit
            else if (memory.enemyHP.value <= 1000 && this.checkTransition(memory.enemyHP, undefined, 0)) {
                this.startCounting = true;

                // make sure to do next check only after 10 frames
                this.lastCheck = Date.now();
            }

            // he is dead
            else if (memory.enemyHP.value === 0 && this.startCounting) {

                const time = Date.now();

                // only check every 10 frames
                if (time - this.lastCheck > (1000 / 60 * 10))  {
                    if (memory.ridleyIframeTimer && memory.ridleyIframeTimer.value === 10) {
                        this.additionalShotCounter++;

                        if (memory.ridleyShotDamage && memory.ridleyShotDamage.value > 0) {
                            // this is not reliable, somehow this is below 900 sometimes
                            this.additionalDamageDealt += memory.ridleyShotDamage.value;
                        }

                        this.lastCheck = Date.now();
                    }
                }
            }
        }


        // If samus gets hurt, we have to check if she's dead, so we can end the game
        if (
            this.inRidleyFight &&
            this.checkChange(memory.samusHP) &&
            memory.samusHP.value === 0 &&
            memory.samusReserveHP.value === 0
        ) {
            this.reset();
            this.reloadUnsafe = false;
        }
    }
}

