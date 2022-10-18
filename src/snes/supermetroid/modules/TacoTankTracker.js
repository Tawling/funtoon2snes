import MemoryModule from "../../../util/memory/MemoryModule";
import { Rooms, SamusPose } from "../enums";
import Addresses from "../addresses";

export default class TacoTankTrackerModule extends MemoryModule {
    constructor() {
        super("tacoTankTracker", "Taco Tank Tracker", false);
        this.tooltip = "Totally Tracks Taco Tank Tries. Ask Taw_ about scripts to make this work in chat.";
        this.attempts = [];
        this.prevReadTacoed = false;
        this.avoidDoubleTaco = false;
        this.attemptAligned = false;
        this.attemptCount = 0;
        this.goodAttemptCount = 0;
        this.prevAttemptLookedGood = false;
        this.tankGrabFrames = 0;
        this.calculatedGrabForAttempt = false;
    }

    settingDefs = {
        rpsThreshold: {
            display: "Disable if Reads-per-second is below",
            type: "number",
            default: 16,
        },
    };

    shouldRunForGame(gameTags) {
        return gameTags.SM;
    }

    getMemoryReads() {
        return [
            Addresses.roomID,
            Addresses.samusX,
            Addresses.samusSubX,
            Addresses.samusY,
            Addresses.samusSubY,
            Addresses.collectedItemBits,
            Addresses.samusPose,
            Addresses.samusYDirection,
            Addresses.samusXSubSpeed,
            Addresses.samusXSubMomentum,
            Addresses.samusYSpeed,
            Addresses.samusYSubSpeed,
        ];
    }

    memoryReadAvailable({ memory, sendEvent, globalState }) {
        if (globalState.readsPerSecond < this.settings.rpsThreshold) {
            // Cancel if we drop below the rps threshold
            return;
        }

        if (
            !this.attemptAligned &&
            memory.samusX.value === 555 &&
            memory.samusSubX.value === 0xffff &&
            memory.samusY.value === 699 &&
            memory.samusSubY.value === 0xffff &&
            !(memory.samusPose.value & 0x01)
        ) {
            // We are set up for a new attempt...
            this.attemptAligned = true;
            this.calculatedGrabForAttempt = false;
        } else if (this.attemptAligned && memory.samusPose.value === SamusPose.FACING_LEFT_SPIN_JUMP) {
            // We attemptin', boys!
            this.attemptAligned = false;
            this.attemptCount++;
        }

        if (this.prevReadTacoed) {
            // If the last read was within taco range, check to see if the bitfield changes
            // This catches errors where the read occurred JUST before bitfield changed for collected items.
            this.prevReadTacoed = false;
            this.avoidDoubleTaco = true;
            if (memory.collectedItemBits.prev()[3] !== memory.collectedItemBits.value[3]) {
                // GRAB
                sendEvent("tacoTank", {
                    x: memory.samusX.prev(),
                    subx: memory.samusSubX.prev().toString(16),
                    y: memory.samusY.prev(),
                    suby: memory.samusSubY.prev().toString(16),
                    grab: true,
                });
                this.attempts.push({
                    x: memory.samusX.prev(),
                    subx: memory.samusSubX.prev().toString(16),
                    y: memory.samusY.prev(),
                    suby: memory.samusSubY.prev().toString(16),
                    grab: true,
                });
            } else {
                // OSCILLATOR
                sendEvent("tacoTank", {
                    x: memory.samusX.prev(),
                    subx: memory.samusSubX.prev().toString(16),
                    y: memory.samusY.prev(),
                    suby: memory.samusSubY.prev().toString(16),
                    grab: false,
                });
                this.attempts.push({
                    x: memory.samusX.prev(),
                    subx: memory.samusSubX.prev().toString(16),
                    y: memory.samusY.prev(),
                    suby: memory.samusSubY.prev().toString(16),
                    grab: false,
                });
            }
        }

        if (this.checkTransition(memory.roomID, undefined, Rooms.BlueBrinstar.BLUE_BRINSTAR_ENERGY_TANK_ROOM)) {
            // Reset attempt tracker on room entry
            this.attempts = [];
            this.attemptCount = 0;
            this.goodAttemptCount = 0;
            console.log("reset attempt count");
            this.prevAttemptLookedGood = false;
            this.prevReadTacoed = false;
            this.avoidDoubleTaco = false;
            this.tankGrabFrames = 0;
            this.calculatedGrabForAttempt = false;
            this.reloadUnsafe = true;
        }
        if (
            memory.roomID.value === Rooms.BlueBrinstar.BLUE_BRINSTAR_ENERGY_TANK_ROOM &&
            memory.samusX.value >= 453 &&
            memory.samusX.value <= 468
        ) {
            // Check for specific grab height
            if (memory.samusY.value === 579 && memory.samusSubY.value === 0) {
                if (!this.avoidDoubleTaco) {
                    this.prevReadTacoed = true;
                }
            } else if (memory.samusX.value > 467 || (memory.samusX.value === 467 && memory.samusSubX.value >= 36864)) {
                this.avoidDoubleTaco = false;
            } else if (
                (memory.samusY.value === 580 && memory.samusSubY.value === 13312) ||
                (memory.samusY.value === 580 && memory.samusSubY.value === 20480) ||
                (memory.samusY.value === 580 && memory.samusSubY.value === 27648)
            ) {
                if (!this.avoidDoubleTaco) {
                    this.prevReadTacoed = true;
                }
            } else if (memory.samusX.value > 466 || (memory.samusX.value === 466 && memory.samusSubX.value >= 8192)) {
                this.avoidDoubleTaco = false;
            } else if (
                (memory.samusY.value === 581 && memory.samusSubY.value === 19456) ||
                (memory.samusY.value === 581 && memory.samusSubY.value === 33792) ||
                (memory.samusY.value === 581 && memory.samusSubY.value === 48128)
            ) {
                if (!this.avoidDoubleTaco) {
                    this.prevReadTacoed = true;
                }
            } else if (memory.samusX.value > 464 || (memory.samusX.value === 464 && memory.samusSubX.value >= 45056)) {
                this.avoidDoubleTaco = false;
            } else if (
                (memory.samusY.value === 582 && memory.samusSubY.value === 18432) ||
                (memory.samusY.value === 582 && memory.samusSubY.value === 39936) ||
                (memory.samusY.value === 582 && memory.samusSubY.value === 61440)
            ) {
                if (!this.avoidDoubleTaco) {
                    this.prevReadTacoed = true;
                }
            } else if (memory.samusX.value > 463 || (memory.samusX.value === 463 && memory.samusSubX.value >= 16384)) {
                this.avoidDoubleTaco = false;
            } else if (
                (memory.samusY.value === 583 && memory.samusSubY.value === 10240) ||
                (memory.samusY.value === 583 && memory.samusSubY.value === 38912) ||
                (memory.samusY.value === 584 && memory.samusSubY.value === 2048)
            ) {
                if (!this.avoidDoubleTaco) {
                    this.prevReadTacoed = true;
                }
            } else if (memory.samusX.value > 461 || (memory.samusX.value === 461 && memory.samusSubX.value >= 53248)) {
                this.avoidDoubleTaco = false;
            } else if (
                (memory.samusY.value === 583 && memory.samusSubY.value === 60416) ||
                (memory.samusY.value === 584 && memory.samusSubY.value === 30720) ||
                (memory.samusY.value === 585 && memory.samusSubY.value === 1024)
            ) {
                if (!this.avoidDoubleTaco) {
                    this.prevReadTacoed = true;
                }
            } else if (memory.samusX.value > 460 || (memory.samusX.value === 460 && memory.samusSubX.value >= 24576)) {
                this.avoidDoubleTaco = false;
            } else if (
                (memory.samusY.value === 584 && memory.samusSubY.value === 37888) ||
                (memory.samusY.value === 585 && memory.samusSubY.value === 15360) ||
                (memory.samusY.value === 585 && memory.samusSubY.value === 58368)
            ) {
                if (!this.avoidDoubleTaco) {
                    this.prevReadTacoed = true;
                }
            } else {
                this.avoidDoubleTaco = false;
            }
            if (this.prevReadTacoed && memory.collectedItemBits.prev(1)[3] !== memory.collectedItemBits.value[3]) {
                // GRAB
                sendEvent("tacoTank", {
                    x: memory.samusX.value,
                    subx: memory.samusSubX.value.toString(16),
                    y: memory.samusY.value,
                    suby: memory.samusSubY.value.toString(16),
                    grab: true,
                });
                this.attempts.push({
                    x: memory.samusX.value,
                    subx: memory.samusSubX.value.toString(16),
                    y: memory.samusY.value,
                    suby: memory.samusSubY.value.toString(16),
                    grab: true,
                });
                this.prevReadTacoed = false;
                this.avoidDoubleTaco = true;
            }
        } else if (this.checkTransition(memory.roomID, Rooms.BlueBrinstar.BLUE_BRINSTAR_ENERGY_TANK_ROOM, undefined)) {
            if (this.attemptCount > 0) {
                // Report attempts on room exit or reset
                sendEvent("exitTacoTank", {
                    attempts: this.attempts,
                    count: this.attemptCount,
                    grabFrames: this.tankGrabFrames,
                    goodAttempts: this.goodAttemptCount,
                });
                this.attempts = [];
                this.attemptCount = 0;
            }
            this.reloadUnsafe = false;
            this.avoidDoubleTaco = false;
        } else {
            this.avoidDoubleTaco = false;
        }

        if (!this.calculatedGrabForAttempt) {
            let grabFrames = 0;
            if (memory.samusYDirection.value === 2 && memory.samusY.value < 579 && memory.samusY.value > 550) {
                console.log(
                    "detected possible grab jump... subspeed:",
                    memory.samusXSubSpeed.value,
                    "submomentum:",
                    memory.samusXSubMomentum.value
                );
                if (memory.samusXSubSpeed.value === 0x3000 && memory.samusXSubMomentum.value === 0x4000) {
                    console.log("calculating grab frames...");
                    let speed = memory.samusYSpeed.value + memory.samusYSubSpeed.value / 65536;
                    let x = memory.samusX.value + memory.samusSubX.value / 65536;
                    let y = memory.samusY.value + memory.samusSubY.value / 65536;
                    do {
                        console.log("x:", x, "y:", y, "speed:", speed);
                        if (x < 469) {
                            grabFrames++;
                            console.log("grab frame:", grabFrames);
                        }
                        x -= 1.4375;
                        y += speed;
                        speed += 0.109375;
                    } while (y < 579);
                    this.calculatedGrabForAttempt = true;

                    if (grabFrames > 0) {
                        this.goodAttemptCount++;
                    }

                    this.tankGrabFrames += grabFrames;
                    console.log("total so far:", this.tankGrabFrames);
                }
            }
        }
    }
}
