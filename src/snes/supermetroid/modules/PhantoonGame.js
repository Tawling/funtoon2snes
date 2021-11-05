import MemoryModule from "../../../util/memory/MemoryModule";
import { Rooms, PhantoonPatterns, BossStates } from "../enums";
import { readBigIntFlag } from "../../../util/utils";
import Addresses from "../addresses";

const PhantoonGameState = {
    Ended: 0,
    Opened: 1,
    Closed: 2,
};

export default class PhantoonGameModule extends MemoryModule {
    constructor() {
        super("phantoonGuessing", "Phantoon Guessing Game");
        this.tooltip = "Allows chatters to guess the Phantoon pattern for points.";
        this.phantoonGameState = PhantoonGameState.Ended;
        this.inPhantoonFight = false;
        this.phantoonPatterns = [];
        this.currentPhantoonRound = 0;
    }

    setEnabled(enabled) {
        super.setEnabled(enabled);
        this.phantoonGameState = PhantoonGameState.Ended;
        this.inPhantoonFight = false;
        this.phantoonPatterns = [];
        this.currentPhantoonRound = 0;
    }

    shouldRunForGame(gameTags) {
        return gameTags.SM && gameTags.VANILLA;
    }

    getMemoryReads() {
        return [
            Addresses.roomID,
            Addresses.gameState,
            Addresses.enemyHP,
            Addresses.samusHP,
            Addresses.samusReserveHP,
            Addresses.phantoonEyeTimer,
            Addresses.bossStates,
        ];
    }

    memoryReadAvailable({ memory, sendEvent }) {
        // Handle a run being reset
        if (
            memory.roomID.prevFrameValue !== undefined &&
            memory.roomID.prevFrameValue !== Rooms.EMPTY &&
            memory.roomID.value === Rooms.EMPTY
        ) {
            if (this.inPhantoonFight && this.phantoonPatterns.length > 0) {
                sendEvent("phanEnd", this.phantoonPatterns.join(" "), 2000);
                this.reloadUnsafe = false;
            } else if (this.phantoonGameState == PhantoonGameState.Opened) {
                sendEvent("phanClose");
                this.phantoonGameState = PhantoonGameState.Ended;
            }
            this.inPhantoonFight = false;
        }

        // When Phantoon's health changes, we're either initializing the fight, ending it (phantoon is dead), or moving on to the next round
        if (this.checkChange(memory.enemyHP)) {
            // enemy HP changed
            if (memory.roomID.value === Rooms.WreckedShip.PHANTOON_ROOM) {
                if (!this.inPhantoonFight) {
                    if (memory.enemyHP.value !== 0) {
                        this.inPhantoonFight = true;
                        this.currentPhantoonRound = 1;
                        this.phantoonPatterns = [];
                    }
                } else {
                    if (memory.enemyHP.value === 0 && this.inPhantoonFight) {
                        this.inPhantoonFight = false;
                        sendEvent("phanEnd", this.phantoonPatterns.join(" "), 3);
                        this.phantoonGameState = PhantoonGameState.Ended;
                        this.reloadUnsafe = false;
                    } else if (this.phantoonPatterns.length === this.currentPhantoonRound) {
                        this.currentPhantoonRound++;
                    }
                }
            }
        } else if (this.inPhantoonFight && this.checkChange(memory.phantoonEyeTimer)) {
            if (this.phantoonPatterns.length < this.currentPhantoonRound) {
                if (memory.phantoonEyeTimer.value <= PhantoonPatterns.FAST) {
                    this.phantoonPatterns.push("fast");
                } else if (memory.phantoonEyeTimer.value <= PhantoonPatterns.MID) {
                    this.phantoonPatterns.push("mid");
                } else {
                    this.phantoonPatterns.push("slow");
                }
                if (this.phantoonPatterns.length === 1) {
                    sendEvent("phanClose");
                    this.phantoonGameState = PhantoonGameState.Closed;
                }
            }
        }

        // If samus gets hurt, we have to check if she's dead so we can end the game
        if (
            this.inPhantoonFight &&
            this.checkChange(memory.samusHP) &&
            memory.samusHP.value === 0 &&
            memory.samusReserveHP.value === 0
        ) {
            this.inPhantoonFight = false;
            this.phantoonPatterns = [];
            sendEvent("phanEnd", "death", 2000);
            this.reloadUnsafe = false;
        }

        const phantoonDead = readBigIntFlag(memory.bossStates.value, BossStates.PHANTOON);
        if (
            !phantoonDead &&
            (this.checkTransition(memory.roomID, Rooms.Crateria.THE_MOAT, Rooms.Crateria.WEST_OCEAN) ||
                this.checkTransition(
                    memory.roomID,
                    Rooms.Crateria.FORGOTTEN_HIGHWAY_ELEVATOR,
                    Rooms.Crateria.FORGOTTEN_HIGHWAY_ELBOW
                ))
        ) {
            sendEvent("phanOpen");
            this.reloadUnsafe = true;
            this.phantoonGameState = PhantoonGameState.Opened;
        }

        if (
            this.checkTransition(
                memory.roomID,
                [Rooms.Crateria.BOWLING_ALLEY_PATH, Rooms.Crateria.WEST_OCEAN_BETWEEN_BOWLING],
                Rooms.WreckedShip.BOWLING_ALLEY
            )
        ) {
            sendEvent("enterBowlingAlley");
        }

        if (this.checkTransition(memory.roomID, undefined, Rooms.WreckedShip.GRAVITY_SUIT_ROOM)) {
            sendEvent("enterGravitySuit");
        }
    }
}
