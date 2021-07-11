import { wram } from './datatypes'
import MemState from '../util/memory/MemState'

export default {
    roomID: new MemState(wram.uint16Read(0x079B), 'roomID', 'Room ID'),
    gameState: new MemState(wram.uint16Read(0x0998), 'gameState', 'Game State'),
    samusHP: new MemState(wram.uint16Read(0x09C2), 'samusHP', 'Samus HP'),
    enemyHP: new MemState(wram.uint16Read(0x0F8C), 'enemyHP', 'Enemy HP'),
    phantoonEyeTimer: new MemState(wram.uint16Read(0x0FE8), 'phantoonEyeTimer', 'Phantoon Eye Timer'),
    ceresTimer: new MemState(wram.bcdRead(0x0945, 2, true), 'ceresTimer', 'Ceres Timer'),
    ceresState: new MemState(wram.uint16Read(0x093F), 'ceresState', 'Ceres State'),
    eventStates: new MemState(wram.uint32Read(0xD820), 'eventStates', 'Event States'),
    bossStates: new MemState(wram.uint64Read(0xD828), 'bossStates', 'Boss States'),
}
