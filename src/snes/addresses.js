const NUMBER = 'number'

export const WRAM_BASE_ADDR = 0xF50000
export const SRAM_BASE_ADDR = 0xE00000
export const ROM_BASE_ADDR = 0x000000

export const ROOMS = {
    wreckedShip: {
        'phantoon': 0xCD13,
    }
}

export const MEMORY_MAPS = {
    roomID: {
        name: 'Room ID',
        offset: 0x079B,
        size: 2,
        type: NUMBER,
        priority: 100,
    },
    gameState: {
        name: 'Game State',
        offset: 0x0998,
        size: 2,
        type: NUMBER,
        priority: 100,
    },
    samusHP: {
        name: 'Samus HP',
        offset: 0x09C2,
        size: 2,
        type: NUMBER,
        priority: 100,
    },
    phantoonHP: {
        name: 'Phantoon HP',
        offset: 0x0F8C,
        size: 2,
        type: NUMBER,
        room: ROOMS.wreckedShip.phantoon,
    },
}