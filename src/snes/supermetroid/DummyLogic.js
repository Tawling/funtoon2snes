import { Rooms, GameStates, PhantoonPatterns, CeresEscapeStateFlags } from './enums'
import MemState from '../../util/memory/MemState'
import { MEMORY_MAPS } from '../addresses';

const NOT_IN_CERES = 0;
// const INTRO = 1;
const ESCAPE = 2;

function getGameState(gs) {
    for (const state in GameStates) {
        if (GameStates[state] === gs) {
            return state
        }
    }
    return '--------'
}

export default class DummyLogic {
    constructor(usb2snes, apiToken) {
        this.usb2snes = usb2snes;
        this.data = {
            roomID: new MemState(MEMORY_MAPS.roomID.read),
            gameState: new MemState(MEMORY_MAPS.gameState.read),
            samusHP: new MemState(MEMORY_MAPS.samusHP.read),
            enemyHP: new MemState(MEMORY_MAPS.enemyHP.read),
            phantoonEyeTimer: new MemState(MEMORY_MAPS.phantoonEyeTimer.read),
            ceresTimer: new MemState(MEMORY_MAPS.ceresTimer.read),
            ceresState: new MemState(MEMORY_MAPS.ceresState.read),
        };
        this.state = {
            inRun: false,
            ceresState: NOT_IN_CERES,
            inPhantoonRoom: false,
            inPhantoonFight: false,
            phantoonDead: false,
            currentPhantoonRound: 0,
            phantoonPatterns: [],
        };

        this.apiToken = '';
        this.channel = '';
    }

    async sendEvent(event, data = null) {
        if (!this.channel || !this.apiToken) {
            console.log('Failed to send event:', JSON.stringify(event))
            return;
        }
        console.log('Sending Event:', JSON.stringify(event), 'with data', JSON.stringify(data))
        console.log(await fetch('https://funtoon.party/api/events/custom', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.apiToken,
            },
            body: JSON.stringify({
                channel: this.channel,
                event,
                data,
            }),
        }))
    }

    async loop() {
        const data = await this.usb2snes.readMultipleTyped({
            'roomID': this.data.roomID.dataRead,
            'gameState': this.data.gameState.dataRead,
            'samusHP': this.data.samusHP.dataRead,
            'enemyHP': this.data.enemyHP.dataRead,
            'phantoonEyeTimer': this.data.phantoonEyeTimer.dataRead,
            'ceresTimer': this.data.ceresTimer.dataRead,
            'ceresState': this.data.ceresState.dataRead,
        });

        // Update reads
        for (const key in data) {
            this.data[key].value = data[key];
        }

        if (this.checkChange(this.data.gameState)) {
            console.log(getGameState(this.data.gameState.value), '-', this.data.gameState.value.toString(16))
        }

        if (this.checkTransition(this.data.gameState, GameStates.GAME_OPTIONS_MENU, [
            GameStates.NEW_GAME_POST_INTRO, GameStates.INTRO_CINEMATIC, GameStates.CERES_DESTROYED_CINEMATIC, GameStates.GAMEPLAY,
        ]) || this.checkTransition(this.data.gameState, GameStates.LOADING_GAME_DATA, GameStates.LOADING_GAME_MAP_VIEW)) {
            // run started
            this.state.inRun = true;
            console.log('Run Started');
        }

        if (this.checkTransition(this.data.roomID, Rooms.EMPTY, Rooms.Ceres.CERES_ELEVATOR_ROOM)) {
            // ceres started
            console.log('Ceres Open');
            this.sendEvent('ceresOpen');
        }
        if (this.checkTransition(this.data.ceresState, CeresEscapeStateFlags.RIDLEY_SWOOP_CUTSCENE, CeresEscapeStateFlags.ESCAPE_TIMER_INITIATED)) {
            // ceres timer started
            console.log('Ceres Close');
            this.sendEvent('ceresClose');
        }
        if (this.data.roomID.prevFrameValue !== undefined && this.data.roomID.prevFrameValue !== Rooms.EMPTY && this.data.roomID.value === Rooms.EMPTY) {
            // run reset
            console.log('Run Reset');
            this.state.inRun = false;
            this.state.inPhantoonFight = false;
            this.state.inPhantoonRoom = false;
            if (this.state.ceresState === ESCAPE) {
                this.state.ceresState = NOT_IN_CERES;
            }
        }
        if (this.checkChange(this.data.enemyHP)) {
            // enemy HP changed
            if (this.data.roomID.value === Rooms.WreckedShip.PHANTOON_ROOM) {
                if (!this.state.inPhantoonFight && this.data.enemyHP.value !== 0) {
                    this.state.inPhantoonFight = true;
                    this.state.currentPhantoonRound = 1;
                    this.state.phantoonPatterns = [];
                } else {
                    if (this.data.enemyHP.value === 0 && this.state.inPhantoonFight) {
                        this.inPhantoonFight = false;
                        console.log('Phan End:', this.state.phantoonPatterns);
                        this.sendEvent('phanEnd', this.state.phantoonPatterns.join(' '));
                    } else if (this.state.phantoonPatterns.length === this.state.currentPhantoonRound) {
                        this.state.currentPhantoonRound++;
                    }
                }
            }
        }
        if (this.checkChange(this.data.samusHP)) {
            // samus HP changed
        }
        if (this.data.roomID.value === Rooms.WreckedShip.PHANTOON_ROOM && this.checkChange(this.data.phantoonEyeTimer)) {
            // phantoon eye timer changed
            if (this.state.inPhantoonFight) {
                console.log('eye timer changed')
                console.log(this.state.phantoonPatterns.length, this.state.currentPhantoonRound)
                if (this.state.phantoonPatterns.length < this.state.currentPhantoonRound) {
                    if (this.data.phantoonEyeTimer.value <= PhantoonPatterns.FAST) {
                        this.state.phantoonPatterns.push('fast');
                        console.log('fast')
                    } else if (this.data.phantoonEyeTimer.value <= PhantoonPatterns.MID) {
                        this.state.phantoonPatterns.push('mid');
                        console.log('mid')
                    } else {
                        this.state.phantoonPatterns.push('slow');
                        console.log('slow')
                    }
                    if (this.phantoonPatterns.length === 1) {
                        console.log('Phan Close');
                        this.sendEvent('phanClose');
                    }
                }
            }
        }
        if (this.checkTransition(this.data.gameState, [GameStates.BLACK_OUT_FROM_CERES, GameStates.CERES_ELEVATOR], GameStates.CERES_DESTROYED_CINEMATIC) || this.checkChange(this.data.ceresTimer)) {
            // ceres timer changed
            if (this.checkTransition(this.data.gameState, [GameStates.BLACK_OUT_FROM_CERES, GameStates.CERES_ELEVATOR], GameStates.CERES_DESTROYED_CINEMATIC)) {
                // ceres finished
                this.ceresState = NOT_IN_CERES;
                console.log('Ceres End:', this.data.ceresTimer.value);
                this.sendEvent('ceresEnd', this.data.ceresTimer.value);
            }
        }
        if (this.checkChange(this.data.gameState)) {
            // game state changed
        }
        if (this.checkTransition(this.data.roomID, Rooms.Crateria.THE_MOAT, Rooms.Crateria.WEST_OCEAN)) {
            // Entered west ocean from moat
            console.log('Phan Open');
            this.sendEvent('phanOpen');
        }
    }

    checkChange(read) {
        return (read.value !== undefined && read.prevFrameValue === undefined) || (read.prevFrameValue !== undefined && read.value !== read.prevFrameValue);
    }

    checkTransition(read, from, to) {
        const fromTrue = Array.isArray(from) ? from.some((v) => v === read.prevFrameValue): read.prevFrameValue === from;
        const toTrue = Array.isArray(to) ? to.some((v) => v === read.value): read.value === to;
        return fromTrue && toTrue;
    }
}