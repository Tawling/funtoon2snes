export default class MemState {
    constructor(dataRead, depth = 2) {
        this.dataRead = dataRead;
        this.depth = depth;
        this.values = [];
        this.prevFrameValue = undefined;
    }

    set value(v) {
        if (this.values.length < this.depth) {
            this.values = new Array(this.depth);
            this.values.fill(v);
        }
        this.prevFrameValue = this.values[0];
        if (v !== this.values[0]) {
            this.values.unshift(v);
            this.values.pop();
        }
    }

    get value() {
        return this.values[0];
    }

    prevUniqueValue(n) {
        return this.values[n];
    }
}