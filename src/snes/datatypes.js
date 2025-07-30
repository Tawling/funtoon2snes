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
    constructor(address, size, ramOffset = 0, customTransform = (value) => value) {
        this.address = address;
        this.ramOffset = ramOffset;
        this.size = size;
        this.customTransform = customTransform;
    }

    toOperands() {
        return [(this.address + this.ramOffset).toString(16), this.size.toString(16)];
    }

    transformValue(value) {
        return this.customTransform(value);
    }
}

/**
 * Unsigned 8-bit integer value to be read upon request of a module.
 */
class Uint8Read extends DataRead {
    constructor(address, ramOffset, customTransform) {
        super(address, 1, ramOffset, customTransform);
    }

    transformValue(value) {
        return this.customTransform(new DataView(value.buffer).getUint8());
    }
}

/**
 * Signed 8-bit integer value to be read upon request of a module.
 */
class Int8Read extends DataRead {
    constructor(address, ramOffset, customTransform) {
        super(address, 1, ramOffset, customTransform);
    }

    transformValue(value) {
        return this.customTransform(new DataView(value.buffer).getInt8());
    }
}

/**
 * Unsigned 16-bit integer value to be read upon request of a module.
 */
class Uint16Read extends DataRead {
    constructor(address, ramOffset, customTransform) {
        super(address, 2, ramOffset, customTransform);
    }

    transformValue(value) {
        return this.customTransform(new DataView(value.buffer).getUint16(0, true));
    }
}

/**
 * Signed 16-bit integer value to be read upon request of a module.
 */
class Int16Read extends DataRead {
    constructor(address, ramOffset, customTransform) {
        super(address, 2, ramOffset, customTransform);
    }

    transformValue(value) {
        return this.customTransform(new DataView(value.buffer).getInt16(0, true));
    }
}

/**
 * Unsigned 32-bit integer value to be read upon request of a module.
 */
class Uint32Read extends DataRead {
    constructor(address, ramOffset, customTransform) {
        super(address, 4, ramOffset, customTransform);
    }

    transformValue(value) {
        return this.customTransform(new DataView(value.buffer).getUint32(0, true));
    }
}

/**
 * Signed 32-bit integer value to be read upon request of a module.
 */
class Int32Read extends DataRead {
    constructor(address, ramOffset, customTransform) {
        super(address, 4, ramOffset, customTransform);
    }

    transformValue(value) {
        return this.customTransform(new DataView(value.buffer).getInt32(0, true));
    }
}

/**
 * Unsigned 64-bit integer value to be read upon request of a module.
 */
class Uint64Read extends DataRead {
    constructor(address, ramOffset, customTransform) {
        super(address, 8, ramOffset, customTransform);
    }

    transformValue(value) {
        return this.customTransform(new DataView(value.buffer).getBigUint64(0, true));
    }
}

/**
 * Signed 64-bit integer value to be read upon request of a module.
 */
class Int64Read extends DataRead {
    constructor(address, ramOffset, customTransform) {
        super(address, 8, ramOffset, customTransform);
    }

    transformValue(value) {
        return this.customTransform(new DataView(value.buffer).getBigInt64(0, true));
    }
}

/**
 * Binary-Coded Decimal value to be read upon request of a module.
 * (0x1234 hex ==> 1234 dec) 
 */
class BCDRead extends DataRead {
    constructor(address, size, littleEndian = true, ramOffset, customTransform) {
        super(address, size, ramOffset, customTransform);
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
        return this.customTransform(res.reduce((acc, v) => v + acc, ""));
    }
}

/**
 * JISX0201 encoded string value to be read upon request of a module.
 */
export class JISX0201Read extends DataRead {
    constructor(address, size, ramOffset = 0, customTransform) {
        super(address, size, ramOffset, customTransform);
    }

    transformValue(value) {
        let s = "";
        for (const v of value) {
            s += JISX0201[v];
        }
        return this.customTransform(s);
    }
}

// All data read types with a default RAM offset of 0, allowing user specification.
export const generic = {
    dataRead: (address, size, ramOffset = 0, customTransform) => new DataRead(address, size, ramOffset, customTransform),
    uint8Read: (address, ramOffset = 0, customTransform) => new Uint8Read(address, ramOffset, customTransform),
    int8Read: (address, ramOffset = 0, customTransform) => new Int8Read(address, ramOffset, customTransform),
    uint16Read: (address, ramOffset = 0, customTransform) => new Uint16Read(address, ramOffset, customTransform),
    int16Read: (address, ramOffset = 0, customTransform) => new Int16Read(address, ramOffset, customTransform),
    uint32Read: (address, ramOffset = 0, customTransform) => new Uint32Read(address, ramOffset, customTransform),
    int32Read: (address, ramOffset = 0, customTransform) => new Int32Read(address, ramOffset, customTransform),
    uint64Read: (address, ramOffset = 0, customTransform) => new Uint64Read(address, ramOffset, customTransform),
    int64Read: (address, ramOffset = 0, customTransform) => new Int64Read(address, ramOffset, customTransform),
    bcdRead: (address, size, littleEndian = true, ramOffset = 0, customTransform) => new BCDRead(address, size, littleEndian, ramOffset, customTransform),
    jisx0201Read: (address, size, ramOffset = 0, customTransform) => new JISX0201Read(address, size, ramOffset, customTransform),
};

// All data read types with a RAM offset of ROM start
export const rom = {
    dataRead: (address, size, customTransform) => new DataRead(address, size, ROM_BASE_ADDR, customTransform),
    jisx0201Read: (address, size, customTransform) => new JISX0201Read(address, size, ROM_BASE_ADDR, customTransform),
    uint8Read: (address, customTransform) => new Uint8Read(address, ROM_BASE_ADDR, customTransform),
    int8Read: (address, customTransform) => new Int8Read(address, ROM_BASE_ADDR, customTransform),
    uint16Read: (address, customTransform) => new Uint16Read(address, ROM_BASE_ADDR, customTransform),
    int16Read: (address, customTransform) => new Int16Read(address, ROM_BASE_ADDR, customTransform),
    uint32Read: (address, customTransform) => new Uint32Read(address, ROM_BASE_ADDR, customTransform),
    int32Read: (address, customTransform) => new Int32Read(address, ROM_BASE_ADDR, customTransform),
    uint64Read: (address, customTransform) => new Uint64Read(address, ROM_BASE_ADDR, customTransform),
    int64Read: (address, customTransform) => new Int64Read(address, ROM_BASE_ADDR, customTransform),
    bcdRead: (address, size, littleEndian, customTransform) => new BCDRead(address, size, littleEndian, ROM_BASE_ADDR, customTransform),
};

// All data read types with a RAM offset of WRAM start
export const wram = {
    dataRead: (address, size, customTransform) => new DataRead(address, size, WRAM_BASE_ADDR, customTransform),
    uint8Read: (address, customTransform) => new Uint8Read(address, WRAM_BASE_ADDR, customTransform),
    int8Read: (address, customTransform) => new Int8Read(address, WRAM_BASE_ADDR, customTransform),
    uint16Read: (address, customTransform) => new Uint16Read(address, WRAM_BASE_ADDR, customTransform),
    int16Read: (address, customTransform) => new Int16Read(address, WRAM_BASE_ADDR, customTransform),
    uint32Read: (address, customTransform) => new Uint32Read(address, WRAM_BASE_ADDR, customTransform),
    int32Read: (address, customTransform) => new Int32Read(address, WRAM_BASE_ADDR, customTransform),
    uint64Read: (address, customTransform) => new Uint64Read(address, WRAM_BASE_ADDR, customTransform),
    int64Read: (address, customTransform) => new Int64Read(address, WRAM_BASE_ADDR, customTransform),
    bcdRead: (address, size, littleEndian, customTransform) => new BCDRead(address, size, littleEndian, WRAM_BASE_ADDR, customTransform),
    jisx0201Read: (address, size, customTransform) => new JISX0201Read(address, size, WRAM_BASE_ADDR, customTransform),
};

// All data read types with a RAM offset of SRAM start
export const sram = {
    dataRead: (address, size, customTransform) => new DataRead(address, size, SRAM_BASE_ADDR, customTransform),
    uint8Read: (address, customTransform) => new Uint8Read(address, SRAM_BASE_ADDR, customTransform),
    int8Read: (address, customTransform) => new Int8Read(address, SRAM_BASE_ADDR, customTransform),
    uint16Read: (address, customTransform) => new Uint16Read(address, SRAM_BASE_ADDR, customTransform),
    int16Read: (address, customTransform) => new Int16Read(address, SRAM_BASE_ADDR, customTransform),
    uint32Read: (address, customTransform) => new Uint32Read(address, SRAM_BASE_ADDR, customTransform),
    int32Read: (address, customTransform) => new Int32Read(address, SRAM_BASE_ADDR, customTransform),
    uint64Read: (address, customTransform) => new Uint64Read(address, SRAM_BASE_ADDR, customTransform),
    int64Read: (address, customTransform) => new Int64Read(address, SRAM_BASE_ADDR, customTransform),
    bcdRead: (address, size, littleEndian, customTransform) => new BCDRead(address, size, littleEndian, SRAM_BASE_ADDR, customTransform),
    jisx0201Read: (address, size, customTransform) => new JISX0201Read(address, size, SRAM_BASE_ADDR, customTransform),
};

export default generic;
