import { wram } from './datatypes'
import { Rooms } from './supermetroid/enums'

export const MEMORY_MAPS = {
    roomID: {
        read: wram.uint16Read(0x079B),
        name: 'Room ID',
        priority: 100,
    },
    gameState: {
        name: 'Game State',
        read: wram.uint16Read(0x0998),
        priority: 100,
    },
    samusHP: {
        name: 'Samus HP',
        read: wram.uint16Read(0x09C2),
        priority: 100,
    },
    enemyHP: {
        name: 'Enemy HP',
        read: wram.uint16Read(0x0F8C),
        room: Rooms.WreckedShip.PHANTOON_ROOM,
    },
    phantoonEyeTimer: {
        name: 'Phantoon Eye Timer',
        read: wram.uint16Read(0x0FE8),
        room: Rooms.WreckedShip.PHANTOON_ROOM,
    },
    ceresTimer: {
        name: 'Ceres Timer',
        read: wram.bcdRead(0x0945, 2, true),
    },
    ceresState: {
        name: 'Ceres State',
        read: wram.uint16Read(0x093F),
    },
}