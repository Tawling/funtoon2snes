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
        useEventInsteadOfMessage: {
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
            Addresses.enemy0HP,
            Addresses.samusHP,
            Addresses.samusReserveHP,
            Addresses.enemy0IFrames,
            Addresses.enemyProjectileDamage,
        ];
    }

    reset() {
        this.lastCheck = 0;
        this.iframesLeft = 0;
        this.inRidleyFight = false;
        this.startCounting = false;
        this.additionalShotCounter = 0;
        this.additionalDamageDealt = 0;
    }

    getMessage() {
        return 'That was an overkill. ' +
            'You had ' + this.additionalShotCounter + ' ' +
            'additional shot' + (this.additionalShotCounter > 1 ? 's' : '');
    }

    memoryReadAvailable({ memory, sendEvent, globalState}) {
        // Handle a run being reset
        if (globalState.isReset) {
            this.reset();
            return;
        }

        // if we are not yet in the fight, but we are in ridley room and he appears
        if (
            !this.inRidleyFight &&
            memory.roomID.value === Rooms.LowerNorfair.RIDLEY_ROOM &&
            this.checkChange(memory.enemy0HP)
        ) {
            if (memory.enemy0HP.value !== 0) {
                this.inRidleyFight = true;
                return;
            }
        }

        // we are in ridley fight
        else if (this.inRidleyFight) {

            // we left ridley room in whatever direction
            if (this.checkTransition(memory.roomID, Rooms.LowerNorfair.RIDLEY_ROOM)) {
                if (this.additionalShotCounter > 0) {
                    if (this.settings.useEventInsteadOfMessage.value) {
                        sendEvent('ridleyOverkill', {shots:this.additionalShotCounter, damage:this.additionalDamageDealt});
                    }
                    else {
                        sendEvent('msg', this.getMessage(), 3);
                    }
                }
                this.reset();
            }

            // keep watching for the last hit
            else if (memory.enemy0HP.value <= 1000 && this.checkTransition(memory.enemy0HP, undefined, 0)) {
                this.startCounting = true;

                // make sure to do next check only after x frames when the current damage is done
                this.iframesLeft = memory.enemy0IFrames.value;
                this.lastCheck = Date.now();
            }

            // he is dead
            else if (memory.enemy0HP.value === 0 && this.startCounting) {

                const time = Date.now();

                // only check every x + 1 frames
                if (time - this.lastCheck > (1000 / 60 * (this.iframesLeft + 1)))  {
                    // everytime we check and iframes are there, check how many iframes are left
                    if (memory.enemy0IFrames && memory.enemy0IFrames.value > 0) {
                        // keep track of how many iframes are left and only check again after this
                        this.iframesLeft = memory.enemy0IFrames.value;

                        this.additionalShotCounter++;

                        if (memory.enemyProjectileDamage && memory.enemyProjectileDamage.value > 0) {
                            // this is not reliable, somehow this is below 900 sometimes,
                            // depending on how many iframes were missed due to read speed
                            // maybe in future we should calculate current damage output (beam combo) * shotCount
                            this.additionalDamageDealt += memory.enemyProjectileDamage.value;
                        }

                        this.lastCheck = Date.now();
                    }
                }
            }
        }


        // If samus gets hurt, we have to check if she's dead, so we can end the game
        if (this.inRidleyFight && globalState.isDeath) {
            this.reset();
            this.reloadUnsafe = false;
        }
    }
}

