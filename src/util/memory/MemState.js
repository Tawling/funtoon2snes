export default class MemState {
    constructor(dataRead, key = "", displayName = "", depth = 2, uniqueDepth = 2) {
        this.displayName = displayName;
        this.key = key;
        this.dataRead = dataRead;
        this.depth = depth;
        this.uniqueDepth = uniqueDepth;
        this.values = [];
        this.uniqueValues = [];
        this.prevReadValue = undefined;
    }

    update(value) {
        // Update prev frame value
        this.prevReadValue = this.values[0];
        // Initialize value array if needed
        if (this.values.length < this.depth) {
            this.values = new Array(this.depth);
            this.values.fill(value);
        }
        // Initialize unique value array if needed
        if (this.uniqueValues.length < this.uniqueDepth) {
            this.uniqueValues = new Array(this.uniqueDepth);
            this.uniqueValues.fill(value);
        }
        // Propagate unique value update
        if (value !== this.uniqueValues[0]) {
            this.uniqueValues.pop();
            this.uniqueValues.unshift(value);
        }
        // Propagate value update
        this.values.pop();
        this.values.unshift(value);
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

    is(v) {
        return this.values[prevFrame] === value
    }
}
