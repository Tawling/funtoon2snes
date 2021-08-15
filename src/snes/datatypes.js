export const WRAM_BASE_ADDR =   0xF50000;
export const SRAM_BASE_ADDR =   0xE00000;
export const ROM_BASE_ADDR  =   0x000000;

export class ReadBlock {
    constructor(reads) {
        this.reads = reads;
        this.start = this.reads[0].value.address;
        this.offset = this.reads[0].value.ramOffset;
        this.size = this.reads[this.reads.length - 1].value.address + this.reads[this.reads.length - 1].value.size
        - this.reads[0].value.address;
    }

    toOperands() {
        return [
            (this.start + this.offset).toString(16),
            (this.size).toString(16),
        ];
    }

    performReads(memory) {
        for (const read of this.reads) {
            read.value = read.value.transformValue(memory.slice(read.value.address - this.start, read.value.address - this.start + read.value.size));
        }
    }
}

export class DataRead {
    constructor (address, size, ramOffset = 0) {
        this.address = address;
        this.ramOffset = ramOffset;
        this.size = size;
    }

    toOperands() {
        return [(this.address + this.ramOffset).toString(16), (this.size).toString(16)];
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

class BCDRead extends DataRead {
    constructor(address, size, littleEndian = true, ramOffset) {
        super(address, size, ramOffset);
        this.littleEndian = littleEndian;
    }

    transformValue(value) {
        const res = [];
        for (const v of value) {
            if (this.littleEndian) {
                res.push(`00${v.toString(16)}`.slice(-2));
            } else {
                res.unshift(`00${v.toString(16)}`.slice(-2));
            }
        }
        return res.reduce((acc, v) => v + acc, '');
    }
}

export const generic = {
    dataRead: (address, size, ramOffset = 0) => new DataRead(address, size, ramOffset),
    uint8Read: (address, ramOffset = 0) => new Uint8Read(address, ramOffset),
    uint16Read: (address, ramOffset = 0) => new Uint16Read(address, ramOffset),
    uint32Read: (address, ramOffset = 0) => new Uint32Read(address, ramOffset),
    uint64Read: (address, ramOffset = 0) => new Uint64Read(address, ramOffset),
    bcdRead: (address, size, littleEndian = true, ramOffset = 0) => new BCDRead(address, size, littleEndian, ramOffset),
}

export const wram = {
    dataRead: (address, size) => new DataRead(address, size, WRAM_BASE_ADDR),
    uint8Read: (address) => new Uint8Read(address, WRAM_BASE_ADDR),
    uint16Read: (address) => new Uint16Read(address, WRAM_BASE_ADDR),
    uint32Read: (address) => new Uint32Read(address, WRAM_BASE_ADDR),
    uint64Read: (address) => new Uint64Read(address, WRAM_BASE_ADDR),
    bcdRead: (address, size, littleEndian) => new BCDRead(address, size, littleEndian, WRAM_BASE_ADDR),
}

export const sram = {
    dataRead: (address, size) => new DataRead(address, size, SRAM_BASE_ADDR),
    uint8Read: (address) => new Uint8Read(address, SRAM_BASE_ADDR),
    uint16Read: (address) => new Uint16Read(address, SRAM_BASE_ADDR),
    uint32Read: (address) => new Uint32Read(address, SRAM_BASE_ADDR),
    uint64Read: (address) => new Uint64Read(address, SRAM_BASE_ADDR),
    bcdRead: (address, size, littleEndian) => new BCDRead(address, size, littleEndian, SRAM_BASE_ADDR),
}

export default generic;