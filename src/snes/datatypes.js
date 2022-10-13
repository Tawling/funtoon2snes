export const WRAM_BASE_ADDR = 0xf50000;
export const SRAM_BASE_ADDR = 0xe00000;
export const ROM_BASE_ADDR = 0x000000;

const JISX0201 =
    "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A\x0B\x0C\x0D\x0E\x0F" +
    "\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F" +
    " !\"#$%&'()*+,-./0123456789:'<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
    "[¥]^_`abcdefghijklmnopqrstuvwxyz{|}‾\x7F" +
    "\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00" +
    "\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00" +
    "\xC0。「」、・ヲァィゥェォャュョッーアイウエオカキクケコサシスセソ" +
    "タチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン゛゜" +
    "\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00" +
    "\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00";

/**
 * A block of DataReads used for batched requests
 */
export class ReadBlock {
    constructor(reads) {
        this.reads = reads;
        this.start = this.reads[0].value.address;
        this.offset = this.reads[0].value.ramOffset;
        this.size =
            this.reads[this.reads.length - 1].value.address +
            this.reads[this.reads.length - 1].value.size -
            this.reads[0].value.address;
    }

    toOperands() {
        return [(this.start + this.offset).toString(16), this.size.toString(16)];
    }

    performReads(memory) {
        for (const read of this.reads) {
            read.value = read.value.transformValue(
                memory.slice(read.value.address - this.start, read.value.address - this.start + read.value.size)
            );
        }
    }
}

/**
 * DataRead represents a memory address and byte length to be read upon request of a module.
 * Subclasses implement data reads that are automatically processed as a specific data type.
 */
export class DataRead {
    constructor(address, size, ramOffset = 0) {
        this.address = address;
        this.ramOffset = ramOffset;
        this.size = size;
    }

    toOperands() {
        return [(this.address + this.ramOffset).toString(16), this.size.toString(16)];
    }

    transformValue(value) {
        return value;
    }
}

/**
 * Unsigned 8-bit integer value to be read upon request of a module.
 */
class Uint8Read extends DataRead {
    constructor(address, ramOffset) {
        super(address, 1, ramOffset);
    }

    transformValue(value) {
        return new DataView(value.buffer).getUint8();
    }
}

/**
 * Signed 8-bit integer value to be read upon request of a module.
 */
class Int8Read extends DataRead {
    constructor(address, ramOffset) {
        super(address, 1, ramOffset);
    }

    transformValue(value) {
        return new DataView(value.buffer).getInt8();
    }
}

/**
 * Unsigned 16-bit integer value to be read upon request of a module.
 */
class Uint16Read extends DataRead {
    constructor(address, ramOffset) {
        super(address, 2, ramOffset);
    }

    transformValue(value) {
        return new DataView(value.buffer).getUint16(0, true);
    }
}

/**
 * Signed 16-bit integer value to be read upon request of a module.
 */
class Int16Read extends DataRead {
    constructor(address, ramOffset) {
        super(address, 2, ramOffset);
    }

    transformValue(value) {
        return new DataView(value.buffer).getInt16(0, true);
    }
}

/**
 * Unsigned 32-bit integer value to be read upon request of a module.
 */
class Uint32Read extends DataRead {
    constructor(address, ramOffset) {
        super(address, 4, ramOffset);
    }

    transformValue(value) {
        return new DataView(value.buffer).getUint32(0, true);
    }
}

/**
 * Signed 32-bit integer value to be read upon request of a module.
 */
class Int32Read extends DataRead {
    constructor(address, ramOffset) {
        super(address, 4, ramOffset);
    }

    transformValue(value) {
        return new DataView(value.buffer).getInt32(0, true);
    }
}

/**
 * Unsigned 64-bit integer value to be read upon request of a module.
 */
class Uint64Read extends DataRead {
    constructor(address, ramOffset) {
        super(address, 8, ramOffset);
    }

    transformValue(value) {
        return new DataView(value.buffer).getBigUint64(0, true);
    }
}

/**
 * Signed 64-bit integer value to be read upon request of a module.
 */
class Int64Read extends DataRead {
    constructor(address, ramOffset) {
        super(address, 8, ramOffset);
    }

    transformValue(value) {
        return new DataView(value.buffer).getBigInt64(0, true);
    }
}

/**
 * Binary-Coded Decimal value to be read upon request of a module.
 * (0x1234 hex ==> 1234 dec) 
 */
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
        return res.reduce((acc, v) => v + acc, "");
    }
}

/**
 * JISX0201 encoded string value to be read upon request of a module.
 */
export class JISX0201Read extends DataRead {
    constructor(address, size, ramOffset = 0) {
        super(address, size, ramOffset);
    }

    transformValue(value) {
        let s = "";
        for (const v of value) {
            s += JISX0201[v];
        }
        return s;
    }
}

// All data read types with a default RAM offset of 0, allowing user specification.
export const generic = {
    dataRead: (address, size, ramOffset = 0) => new DataRead(address, size, ramOffset),
    uint8Read: (address, ramOffset = 0) => new Uint8Read(address, ramOffset),
    int8Read: (address, ramOffset = 0) => new Int8Read(address, ramOffset),
    uint16Read: (address, ramOffset = 0) => new Uint16Read(address, ramOffset),
    int16Read: (address, ramOffset = 0) => new Int16Read(address, ramOffset),
    uint32Read: (address, ramOffset = 0) => new Uint32Read(address, ramOffset),
    int32Read: (address, ramOffset = 0) => new Int32Read(address, ramOffset),
    uint64Read: (address, ramOffset = 0) => new Uint64Read(address, ramOffset),
    int64Read: (address, ramOffset = 0) => new Int64Read(address, ramOffset),
    bcdRead: (address, size, littleEndian = true, ramOffset = 0) => new BCDRead(address, size, littleEndian, ramOffset),
    jisx0201Read: (address, size, ramOffset = 0) => new JISX0201Read(address, size, ramOffset),
};

// All data read types with a RAM offset of ROM start
export const rom = {
    dataRead: (address, size) => new DataRead(address, size, ROM_BASE_ADDR),
    jisx0201Read: (address, size) => new JISX0201Read(address, size, ROM_BASE_ADDR),
    uint8Read: (address) => new Uint8Read(address, ROM_BASE_ADDR),
    int8Read: (address) => new Int8Read(address, ROM_BASE_ADDR),
    uint16Read: (address) => new Uint16Read(address, ROM_BASE_ADDR),
    int16Read: (address) => new Int16Read(address, ROM_BASE_ADDR),
    uint32Read: (address) => new Uint32Read(address, ROM_BASE_ADDR),
    int32Read: (address) => new Int32Read(address, ROM_BASE_ADDR),
    uint64Read: (address) => new Uint64Read(address, ROM_BASE_ADDR),
    int64Read: (address) => new Int64Read(address, ROM_BASE_ADDR),
    bcdRead: (address, size, littleEndian) => new BCDRead(address, size, littleEndian, ROM_BASE_ADDR),
    jisx0201Read: (address, size) => new JISX0201Read(address, size, ROM_BASE_ADDR),
};

// All data read types with a RAM offset of WRAM start
export const wram = {
    dataRead: (address, size) => new DataRead(address, size, WRAM_BASE_ADDR),
    uint8Read: (address) => new Uint8Read(address, WRAM_BASE_ADDR),
    int8Read: (address) => new Int8Read(address, WRAM_BASE_ADDR),
    uint16Read: (address) => new Uint16Read(address, WRAM_BASE_ADDR),
    int16Read: (address) => new Int16Read(address, WRAM_BASE_ADDR),
    uint32Read: (address) => new Uint32Read(address, WRAM_BASE_ADDR),
    int32Read: (address) => new Int32Read(address, WRAM_BASE_ADDR),
    uint64Read: (address) => new Uint64Read(address, WRAM_BASE_ADDR),
    int64Read: (address) => new Int64Read(address, WRAM_BASE_ADDR),
    bcdRead: (address, size, littleEndian) => new BCDRead(address, size, littleEndian, WRAM_BASE_ADDR),
    jisx0201Read: (address, size) => new JISX0201Read(address, size, WRAM_BASE_ADDR),
};

// All data read types with a RAM offset of SRAM start
export const sram = {
    dataRead: (address, size) => new DataRead(address, size, SRAM_BASE_ADDR),
    uint8Read: (address) => new Uint8Read(address, SRAM_BASE_ADDR),
    int8Read: (address) => new Int8Read(address, SRAM_BASE_ADDR),
    uint16Read: (address) => new Uint16Read(address, SRAM_BASE_ADDR),
    int16Read: (address) => new Int16Read(address, SRAM_BASE_ADDR),
    uint32Read: (address) => new Uint32Read(address, SRAM_BASE_ADDR),
    int32Read: (address) => new Int32Read(address, SRAM_BASE_ADDR),
    uint64Read: (address) => new Uint64Read(address, SRAM_BASE_ADDR),
    int64Read: (address) => new Int64Read(address, SRAM_BASE_ADDR),
    bcdRead: (address, size, littleEndian) => new BCDRead(address, size, littleEndian, SRAM_BASE_ADDR),
    jisx0201Read: (address, size) => new JISX0201Read(address, size, SRAM_BASE_ADDR),
};

export default generic;
