import MemoryModule from "../../../util/memory/MemoryModule";
import { GameStates, Rooms } from "../enums";
import Addresses from "../addresses";
import { BossStates } from "../enums";
import { noneOf, readBigIntFlag } from "../../../util/utils";
import { isDemo } from "../smutils";

const FPS = 60.098813897441;

export default class RoomTimes extends MemoryModule {
    constructor() {
        super("roomTimes", "Track Room Times", true, false);
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
            Addresses.gameTimeSeconds,
            Addresses.gameTimeMinutes,
            Addresses.gameTimeHours,
            Addresses.frameCounter,
            Addresses.nmiCounter,
            Addresses.doorTransitionFunction,
            Addresses.paletteChangeNumerator,
            ...((globalState.persistent.gameTags || {}).PRACTICE
                ? [Addresses.prLastRealtimeRoom, Addresses.prRealtimeRoom, Addresses.prTransitionCounter]
                : []),
            Addresses.collectedItems,
            Addresses.ceresState,
            Addresses.ceresTimer,
            Addresses.samusPose,
            Addresses.samusMissiles,
            Addresses.samusMaxMissiles,
            Addresses.samusSupers,
            Addresses.samusMaxSupers,
            Addresses.samusPBs,
            Addresses.samusMaxPBs,
            Addresses.samusReserveHP,
            Addresses.samusMaxReserveHP,
            Addresses.samusHP,
            Addresses.samusMaxHP,
            Addresses.eventStates,
        ];
    }

    memoryReadAvailable({ memory, sendEvent, globalState }) {
        if (isDemo(memory.gameState.value)) {
            return
        }
        if (this.state.exit && this.checkChange(memory.roomID)) {
            // We got next room ID, time to send event
            const eventData = {
                frameCount: this.state.totalFrames,
                totalSeconds: this.state.roomTime,
                trueFrames: this.state.trueFrames,
                lagFrames: this.state.lagFrames,
                igtFrames: this.state.igtFrames,
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
                practiceExitDelta: globalState.persistent.gameTags.PRACTICE ? memory.prTransitionCounter.value : 0,
                practiceEntryDelta: this.state.practiceEntryDelta,
            };
            globalState.lastRoomTimeEvent = eventData;
            sendEvent("smRoomTime", eventData);
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
            const timeDelta = (exitFrameDelta - 1) / FPS;
            const exitTime = performance.now() - timeDelta * 1000;

            if (this.state.entry) {
                // full room was tracked, log the prev room and time

                const newLagDelta = memory.nmiCounter.value - memory.frameCounter.value;
                const lagFrames = newLagDelta - this.state.lagDelta;
                const currentIGT =
                    memory.gameTimeHours.value * 216000 +
                    memory.gameTimeMinutes.value * 3600 +
                    memory.gameTimeSeconds.value * 60 +
                    memory.gameTimeFrames.value;

                const igtFrames = currentIGT - this.state.entryIGT;
                const trueFrames = igtFrames + lagFrames;

                const roomTime = exitTime - this.state.entry;
                const totalFrames = Math.round((roomTime * FPS) / 1000); // Should this round in only one direction?
                this.state.totalFrames = totalFrames;
                this.state.exit = exitTime;
                this.state.roomID = memory.roomID.value;
                this.state.roomTime = roomTime / 1000;
                this.state.exitFrameDelta = exitFrameDelta;

                this.state.lagFrames = lagFrames;
                this.state.trueFrames = trueFrames;
                this.state.exitIGT = currentIGT;
                this.state.igtFrames = igtFrames
            } else {
                // room wasn't tracked fully. We only have an exit time.
                console.log("No room entrance time...skipping room time event");
            }
        } else if (this.checkTransition(memory.gameState, GameStates.LOAD_NEXT_ROOM_2, undefined)) {
            // Entering room
            const entryFrameDelta = (memory.gameTimeFrames.value - memory.gameTimeFrames.prev() + 60) % 60; // mod 60 always wrapping to positive
            this.storeRoomEntryState(memory, globalState, entryFrameDelta);
        } else if (this.checkTransition(memory.roomID, Rooms.EMPTY, Rooms.Ceres.CERES_ELEVATOR_ROOM)) {
            // CERES START???
        } else if (this.checkTransition(
            memory.gameState,
            [GameStates.BLACK_OUT_FROM_CERES, GameStates.CERES_ELEVATOR],
            GameStates.CERES_DESTROYED_CINEMATIC
        )) {
            // CERES END???
        }
        // TODO: detect room start time on zebes after ceres cutscene
        // TODO: detect room end for hitting ship at end of run
        // TODO: detect starting run from ship instead of ceres
        // TODO: detect MB phase changes and send as separate timing event?
        // TODO: track baby skip jumps??
    }

    storeRoomEntryState(memory, globalState, entryFrameDelta) {
        const timeDelta = (entryFrameDelta - 1) / FPS;
        this.state = {
            entry: performance.now() - timeDelta * 1000,
            entryFrameDelta,
            entryIGT:
                memory.gameTimeHours.prev() * 216000 +
                memory.gameTimeMinutes.prev() * 3600 +
                memory.gameTimeSeconds.prev() * 60 +
                memory.gameTimeFrames.prev(),
            entryNMI: memory.nmiCounter.value - entryFrameDelta,
            lagDelta: memory.nmiCounter.value - memory.frameCounter.value,
            prevRoomID: memory.roomID.prevUnique(),
            practiceEntryDelta: globalState.persistent.gameTags.PRACTICE ? memory.prRealtimeRoom.value : 0,
        };
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
