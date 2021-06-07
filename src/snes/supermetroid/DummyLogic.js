import CeresGameModule from './modules/CeresGameModule'
import PhantoonGameModule from './modules/PhantoonGameModule'

export default class DummyLogic {
    constructor(usb2snes, callExternal) {
        this.usb2snes = usb2snes;
        this.callExternal = callExternal
        this.apiToken = '';
        this.channel = '';
        
        this.modules = [
            new PhantoonGameModule(),
            new CeresGameModule(),
        ]
    }

    sendEvent = async (event, data = null, delay = 0) => {
        if (!this.channel || !this.apiToken) {
            console.log('Failed to send event:', JSON.stringify(event))
            return;
        }
        console.log('Sending Event:', JSON.stringify(event), 'with data', JSON.stringify(data))
        setTimeout(async () => console.log(await fetch('https://funtoon.party/api/events/custom', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.apiToken,
            },
            body: JSON.stringify({
                channel: this.channel,
                event,
                data,
            }),
        })), delay)
    }

    async loop() {
        // Build read list
        const mems = {};
        const reads = {};
        
        for (const module of this.modules) {
            const moduleReads = module.getMemoryReads();
            for (const addr of moduleReads) {
                reads[addr.key] = addr.dataRead;
                mems[addr.key] = addr;
            }
        }

        // Perform reads
        const data = await this.usb2snes.readMultipleTyped(reads);

        // Update memstate values
        for (const key in data) {
            mems[key].update(data[key]);
        }
        
        // Run module logic
        for (const module of this.modules) {
            module.memoryReadAvailable(mems, this.sendEvent);
        }
    }
}