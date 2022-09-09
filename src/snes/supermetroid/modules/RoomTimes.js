import MemoryModule from "../../../util/memory/MemoryModule";
import { GameStates, Rooms } from "../enums";
import Addresses from "../addresses";
import { BossStates } from "../enums";
import { noneOf, readBigIntFlag } from "../../../util/utils";

export default class DLCSpoSpo extends MemoryModule {
    constructor() {
        super("roomTimes", "Track Room Times", true);
        this.tooltip = "Tracks room times, sending events to FUNtoon for further processing.";
        this.state = {};
    }

    shouldRunForGame(gameTags) {
        return gameTags.SM;
    }

    getMemoryReads(globalState) {
        return [
            Addresses.roomID,
            Addresses.bossStates,
            Addresses.paletteIndex,
            Addresses.gameTimeFrames,
            Addresses.doorTransitionFunction,
            Addresses.paletteChangeNumerator,
            ...((globalState.persistent.gameTags || {}).PRACTICE
                ? [Addresses.prLastRealtimeRoom, Addresses.prRealtimeRoom, Addresses.prTransitionCounter]
                : []),
        ];
    }

    memoryReadAvailable({ memory, sendEvent, globalState }) {
        if (this.state.exit && this.checkChange(memory.roomID)) {
            // We got next room ID, time to send event
            sendEvent("smRoomTime", {
                frameCount: this.state.totalFrames,
                totalSeconds: this.state.roomTime,
                roomID: this.state.roomID,
                prevRoomID: this.state.prevRoomID,
                nextRoomID: memory.roomID.value,
                bossesKilled: {
                    phantoon: readBigIntFlag(memory.bossStates.value, BossStates.PHANTOON),
                    ridley: readBigIntFlag(memory.bossStates.value, BossStates.RIDLEY),
                    kraid: readBigIntFlag(memory.bossStates.value, BossStates.KRAID),
                    draygon: readBigIntFlag(memory.bossStates.value, BossStates.DRAYGON),
                    botwoon: readBigIntFlag(memory.bossStates.value, BossStates.BOTWOON),
                    bombTorizo: readBigIntFlag(memory.bossStates.value, BossStates.BOMB_TORIZO),
                    goldenTorizo: readBigIntFlag(memory.bossStates.value, BossStates.GOLDEN_TORIZO),
                    sporeSpawn: readBigIntFlag(memory.bossStates.value, BossStates.SPORE_SPAWN),
                    crocomire: readBigIntFlag(memory.bossStates.value, BossStates.CROCOMIRE),
                },
                exitFrameDelta: this.state.exitFrameDelta,
                entryFrameDelta: this.state.entryFrameDelta,
                practice: !!globalState.persistent.gameTags.PRACTICE,
                practiceFrames: globalState.persistent.gameTags.PRACTICE ? memory.prLastRealtimeRoom.value : 0,
                practiceExitDelta: globalState.persistent.gameTags.PRACTICE
                    ? memory.prTransitionCounter.value
                    : 0,
                practiceEntryDelta: this.state.practiceEntryDelta,
            });
            this.state = {};
        } else if (
            this.checkTransition(
                memory.gameState,
                noneOf(GameStates.HIT_DOOR_BLOCK, GameStates.LOAD_NEXT_ROOM, GameStates.LOAD_NEXT_ROOM_2),
                [GameStates.HIT_DOOR_BLOCK, GameStates.LOAD_NEXT_ROOM, GameStates.LOAD_NEXT_ROOM_2]
            )
        ) {
            // Exiting room
            const exitFrameDelta = this.getRoomExitTransitionFrame(memory);
            if (exitFrameDelta === null) {
                this.state = {};
                return;
            }
            const timeDelta = (exitFrameDelta - 1) / 60;
            const exitTime = performance.now() - timeDelta * 1000;
            if (this.state.entry) {
                // full room was tracked, log the prev room and time
                const roomTime = exitTime - this.state.entry;
                const totalFrames = Math.round((roomTime * 60) / 1000); // Should this round in only one direction?
                this.state.totalFrames = totalFrames;
                this.state.exit = exitTime;
                this.state.roomID = memory.roomID.value;
                this.state.roomTime = roomTime / 1000;
                this.state.exitFrameDelta = exitFrameDelta;
            } else {
                // room wasn't tracked fully. We only have an exit time.
                console.log("No room entrance time...skipping room time event");
            }
        } else if (this.checkTransition(memory.gameState, GameStates.LOAD_NEXT_ROOM_2, undefined)) {
            // Entering room
            const entryFrameDelta = (memory.gameTimeFrames.value - memory.gameTimeFrames.prev() + 60) % 60;
            const timeDelta = (entryFrameDelta - 1) / 60;
            this.state = {
                entry: performance.now() - timeDelta * 1000,
                entryFrameDelta,
                prevRoomID: memory.roomID.prevUnique(),
                practiceEntryDelta: globalState.persistent.gameTags.PRACTICE ? memory.prRealtimeRoom.value : 0,
            };
        }
    }

    getRoomExitTransitionFrame(memory) {
        if (memory.gameState.value === GameStates.HIT_DOOR_BLOCK) {
            return 0;
        } else if (memory.gameState.value === GameStates.LOAD_NEXT_ROOM) {
            return 0;
        } else {
            if (memory.doorTransitionFunction.value < 0xe2db) {
                return 1;
            } else if (memory.doorTransitionFunction.value === 0xe2db) {
                if (memory.paletteChangeNumerator.value === 1) {
                    return 4;
                } else if (memory.paletteIndex.value === 0x01fe) {
                    return 2;
                } else {
                    return 3;
                }
            } else {
                return null;
            }
        }
    }
}
