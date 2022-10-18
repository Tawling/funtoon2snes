import MemoryModule from "../../../util/memory/MemoryModule";
import { GameStates, Rooms } from "../enums";
import Addresses from "../addresses";
import { BossStates } from "../enums";
import { noneOf, readBigIntFlag } from "../../../util/utils";
import { counterDelta, isDemo, isIGTPaused } from "../smutils";

const FPS = 60.098813897441;

export default class RoomTimes extends MemoryModule {
    constructor() {
        super("roomTimes", "Track Room Times", true, false);
        this.tooltip = "Tracks room times, sending events to FUNtoon for further processing.";
        this.resetState();
    }

    resetState() {
        this.state = {
            nmiRollover: 0,
            frameCountRollover: 0,
        };
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
            return;
        }

        const isPaused = isIGTPaused(memory.gameState.value);
        const wasPaused = isIGTPaused(memory.gameState.prevFrameValue);

        const prevIGT =
            memory.gameTimeHours.prevFrameValue * 216000 +
            memory.gameTimeMinutes.prevFrameValue * 3600 +
            memory.gameTimeSeconds.prevFrameValue * 60 +
            memory.gameTimeFrames.prevFrameValue;

        const currentIGT =
            memory.gameTimeHours.value * 216000 +
            memory.gameTimeMinutes.value * 3600 +
            memory.gameTimeSeconds.value * 60 +
            memory.gameTimeFrames.value;

        if (memory.nmiCounter.value < memory.nmiCounter.prevFrameValue) {
            this.state.nmiRollover++;
        }

        if (memory.frameCounter.value < memory.frameCounter.prevFrameValue) {
            this.state.frameCountRollover++;
        }

        if (!wasPaused && isPaused) {
            // IGT pause detected
        } else if (wasPaused && !isPaused) {
            // IGT unpause detected
            if (
                // Standard door entrance
                this.checkTransition(memory.gameState, GameStates.LOAD_NEXT_ROOM_2, undefined) ||
                // Ceres start / Zebes start
                this.checkTransition(
                    memory.gameState,
                    [GameStates.NEW_GAME_POST_INTRO, GameStates.LOADING_GAME_DATA],
                    [GameStates.INIT_GAME_AFTER_LOAD, GameStates.GAMEPLAY]
                )
            ) {
                // Room entrance
                const lag =
                    counterDelta(memory.nmiCounter.prevFrameValue, memory.nmiCounter.value) -
                    counterDelta(memory.frameCounter.prevFrameValue, memory.frameCounter.value);
                const entryFrameDelta = currentIGT - prevIGT; // + lag;
                console.log(entryFrameDelta, entryFrameDelta / FPS);
                this.state = {
                    entryNMI: memory.nmiCounter.value - entryFrameDelta,
                    entryFrameCount: memory.frameCounter.value - entryFrameDelta,
                    entryFrameDelta: entryFrameDelta,
                    nmiRollover: 0,
                    frameCountRollover: 0,
                    entryTime: performance.now() - (entryFrameDelta / FPS) * 1000,
                    prevRoomID: memory.roomID.prevUnique(),
                    practiceEntryDelta: globalState.persistent.gameTags.PRACTICE ? memory.prRealtimeRoom.value : 0,
                    entryIGT: prevIGT,
                };
            }
        }

        if (
            this.state.exitTime &&
            (this.checkChange(memory.roomID) ||
                memory.gameState.value === GameStates.CERES_DESTROYED_CINEMATIC ||
                memory.gameState.value === GameStates.BEAT_THE_GAME)
        ) {
            // We got next room ID, time to send event
            const eventData = {
                frameCount: this.state.totalFrames,
                totalSeconds: this.state.roomTime,
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
                rps: globalState.readsPerSecond,
            };
            globalState.lastRoomTimeEvent = eventData;
            sendEvent("smRoomTime", eventData);
            this.resetState();
        } else if (
            // Standard door exit
            this.checkTransition(
                memory.gameState,
                noneOf(GameStates.HIT_DOOR_BLOCK, GameStates.LOAD_NEXT_ROOM, GameStates.LOAD_NEXT_ROOM_2),
                [GameStates.HIT_DOOR_BLOCK, GameStates.LOAD_NEXT_ROOM, GameStates.LOAD_NEXT_ROOM_2]
            ) ||
            // Ceres end
            this.checkTransition(memory.gameState, undefined, GameStates.CERES_DESTROYED_CINEMATIC) ||
            // Beat the game
            this.checkTransition(memory.gameState, undefined, GameStates.BEAT_THE_GAME)
        ) {
            // Exiting room
            if (this.state.entryTime) {
                // full room was tracked, log the prev room and time

                const igtDelta = currentIGT - prevIGT;
                const frameDelta = counterDelta(memory.frameCounter.prevFrameValue, memory.frameCounter.value);
                const lag = counterDelta(memory.nmiCounter.prevFrameValue, memory.nmiCounter.value) - frameDelta;

                console.log(igtDelta, frameDelta, lag);

                const exitFrameDelta = frameDelta - igtDelta; // + lag?
                console.log(exitFrameDelta, (exitFrameDelta - 1) / FPS);
                const exitTime = performance.now() - ((exitFrameDelta - 1) / FPS) * 1000;

                const roomTime = exitTime - this.state.entryTime;

                const roomTimeFrames = (roomTime * FPS) / 1000;
                console.log("room time frames: ", roomTimeFrames);

                const totalFrames =
                    memory.nmiCounter.value + 65536 * this.state.nmiRollover - this.state.entryNMI - exitFrameDelta;
                console.log("total frames: ", totalFrames);

                console.log("delta: ", roomTimeFrames - totalFrames);

                this.state.totalFrames = totalFrames;
                this.state.exitTime = exitTime;
                this.state.roomID = memory.roomID.value;
                this.state.roomTime = roomTime / 1000;
                this.state.exitFrameDelta = exitFrameDelta;

                this.state.exitNMI = memory.nmiCounter.value + 65536 * this.state.nmiRollover - exitFrameDelta;
                this.state.exitFrameCount =
                    memory.frameCounter.value + 65536 * this.state.frameCountRollover - exitFrameDelta;

                this.state.lagFrames =
                    this.state.exitNMI -
                    this.state.entryNMI -
                    (this.state.exitFrameCount - this.state.entryFrameCount) -
                    lag;
                this.state.exitIGT = currentIGT;
                this.state.igtFrames = currentIGT - this.state.entryIGT;
                console.log(this.state);
            } else {
                // room wasn't tracked fully. We only have an exit time.
                console.log("No room entrance time...skipping room time event");
            }
        }
        // TODO: detect MB phase changes and send as separate timing event?
        // TODO: track baby skip jumps??
        // TODO: track ammo usage
        // TODO: track health changes
        // TODO: track item pickups
        // TODO: log door transition times
    }
}
