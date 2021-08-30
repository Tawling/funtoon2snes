export default class MemState {
    constructor(dataRead, key = "", displayName = "", depth = 2, uniqueDepth = 2) {
        this.displayName = displayName;
        this.key = key;
        this.dataRead = dataRead;
        this.depth = depth;
        this.uniqueDepth = uniqueDepth;
        this.values = [];
        this.uniqueValues = [];
        this.prevFrameValue = undefined;
        this.prevReadCount = undefined;
    }

    update(value, readCount = undefined) {
        if (this.values.length < this.depth) {
            this.values = new Array(this.depth);
            this.values.fill(value);
        }
        if (this.uniqueValues.length < this.uniqueDepth) {
            this.uniqueValues = new Array(this.uniqueDepth);
            this.uniqueValues.fill(value);
        }
        this.prevFrameValue = this.values[0];
        this.prevReadCount = readCount;
        if (value !== this.uniqueValues[0]) {
            this.uniqueValues.unshift(value);
            this.uniqueValues.pop();
        }
        this.values.unshift(value);
        this.values.pop();
    }

    get value() {
        return this.values[0];
    }

    prevUnique(n = 1) {
        return this.uniqueValues[n];
    }

    prev(n = 1) {
        return this.values[n];
    }
}
