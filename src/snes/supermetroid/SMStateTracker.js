export default class SMStateTracker {
    constructor() {
        
    }
}

class MemState {
    constructor(address, depth) {
        this.address = address;
        this.depth = depth || 2;
        this.values = []
    }

    set value(v) {
        if (this.values.length < this.depth) {
            this.values = new Array(this.depth);
            this.values.fill(v);
        }
        this.values.unshift(v);
        this.values.pop();
    }
}