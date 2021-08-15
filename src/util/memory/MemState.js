export default class MemState {
    constructor(dataRead, key = '', displayName = '', depth = 2) {
        this.displayName = displayName;
        this.key = key;
        this.dataRead = dataRead;
        this.depth = depth;
        this.values = [];
        this.prevFrameValue = undefined;
        this.prevReadCount = undefined;
    }

    update(value, readCount = undefined) {
        if (this.values.length < this.depth) {
            this.values = new Array(this.depth);
            this.values.fill(value);
        }
        this.prevFrameValue = this.values[0];
        this.prevReadCount = readCount;
        if (value !== this.values[0]) {
            this.values.unshift(value);
            this.values.pop();
        }
    }

    get value() {
        return this.values[0];
    }

    prevUniqueValue(n=1) {
        return this.values[n];
    }

    prev(n=1) {
        return this.values[n];
    }
}