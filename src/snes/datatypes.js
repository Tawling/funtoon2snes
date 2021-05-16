import { SRAM_BASE_ADDR, WRAM_BASE_ADDR } from "./addresses";

class DataRead {
    constructor (address, size, ramOffset = 0) {
        this.address = address + ramOffset;
        this.size = size;
    }

    toOperands() {
        return [(this.address).toString(16), (this.size).toString(16)]
    }

    transformValue(value) {
        return value;
    }
}

class Uint8Read extends DataRead {
    constructor(address, ramOffset) {
        super(address, 1, ramOffset);
    }

    transformValue(value) {
        return new DataView(value.buffer).getUint8();
    }
}

class Uint16Read extends DataRead {
    constructor(address, ramOffset) {
        super(address, 2, ramOffset);
    }

    transformValue(value) {
        return new DataView(value.buffer).getUint16(0, true);
    }
}

class Uint32Read extends DataRead {
    constructor(address, ramOffset) {
        super(address, 4, ramOffset);
    }

    transformValue(value) {
        return new DataView(value.buffer).getUint32(0, true);
    }
}

class Uint64Read extends DataRead {
    constructor(address, ramOffset) {
        super(address, 8, ramOffset);
    }

    transformValue(value) {
        return new DataView(value.buffer).getBigUint64(0, true);
    }
}

export const generic = {
    dataRead: (address, size, ramOffset = 0) => new DataRead(address, size, ramOffset),
    uint8Read: (address, ramOffset = 0) => new Uint8Read(address, ramOffset),
    uint16Read: (address, ramOffset = 0) => new Uint16Read(address, ramOffset),
    uint32Read: (address, ramOffset = 0) => new Uint32Read(address, ramOffset),
    uint64Read: (address, ramOffset = 0) => new Uint64Read(address, ramOffset),
}

export const wram = {
    dataRead: (address, size) => new DataRead(address, size, WRAM_BASE_ADDR),
    uint8Read: (address) => new Uint8Read(address, WRAM_BASE_ADDR),
    uint16Read: (address) => new Uint16Read(address, WRAM_BASE_ADDR),
    uint32Read: (address) => new Uint32Read(address, WRAM_BASE_ADDR),
    uint64Read: (address) => new Uint64Read(address, WRAM_BASE_ADDR),
}

export const sram = {
    dataRead: (address, size) => new DataRead(address, size, SRAM_BASE_ADDR),
    uint8Read: (address) => new Uint8Read(address, SRAM_BASE_ADDR),
    uint16Read: (address) => new Uint16Read(address, SRAM_BASE_ADDR),
    uint32Read: (address) => new Uint32Read(address, SRAM_BASE_ADDR),
    uint64Read: (address) => new Uint64Read(address, SRAM_BASE_ADDR),
}

export default generic;