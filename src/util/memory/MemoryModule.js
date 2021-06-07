export default class MemoryModule {

    getMemoryReads() {
        throw Error('You must implement getMemoryReads()');
    }

    async memoryReadAvailable(memory, handleEvent) {
        throw Error('You must implement memoryReadAvailable()');
    }

    checkChange(read) {
        return (read.value !== undefined && read.prevFrameValue === undefined) || (read.prevFrameValue !== undefined && read.value !== read.prevFrameValue);
    }
    
    checkTransition(read, from, to) {
        const fromTrue = Array.isArray(from) ? from.some((v) => v === read.prevFrameValue): read.prevFrameValue === from;
        const toTrue = Array.isArray(to) ? to.some((v) => v === read.value): read.value === to;
        return fromTrue && toTrue;
    }
}
