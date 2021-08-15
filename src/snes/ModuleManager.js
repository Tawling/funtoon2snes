import { SuperMetroid } from "./supermetroid/modules";

export default class ModuleManager {
    constructor(usb2snes, callExternal) {
        this.usb2snes = usb2snes;
        this.callExternal = callExternal
        this.apiToken = '';
        this.channel = '';
        
        this.modules = [
            ...SuperMetroid,
        ]
    }

    setModuleStates(states) {
        for (const module of this.modules) {
            if (states[module.moduleName] && states[module.moduleName].settings) {
                module.setSettings({ enabled: states[module.moduleName].enabled, ...states[module.moduleName].settings});
            }
        }
    }

    getModuleStates() {
        const newStates = {};
        for (const module of this.modules) {
            newStates[module.moduleName] = {
                displayName: module.displayName,
                enabled: module.enabled,
                tooltip: module.tooltip,
                description: module.description,
                settings: module.getSettings(),
            };
        }
        return newStates;
    }

    sendEvent = async (event, data = null, delay = 0) => {
        if (!this.channel || !this.apiToken) {
            console.log('Failed to send event:', JSON.stringify(event));
            return;
        }
        console.log('Sending Event:', JSON.stringify(event), 'with data', JSON.stringify(data));
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
        })), delay);
    }

    async loop(globalState) {
        // Build read list
        const mems = {};
        const reads = {};

        const enabledModules = this.modules.filter(({ enabled }) => enabled)
        
        for (const module of enabledModules) {
            if (module.enabled) {
                const moduleReads = module.getMemoryReads();
                for (const addr of moduleReads) {
                    reads[addr.key] = addr.dataRead;
                    mems[addr.key] = addr;
                }
            }
        }

        // Perform reads
        const data = await this.usb2snes.readMultipleTyped(reads);

        // Update memstate values
        for (const key in data) {
            mems[key].update(data[key]);
        }
        
        // Run module logic
        for (const module of enabledModules) {
            if (module.enabled) {
                module.memoryReadAvailable(mems, this.sendEvent, globalState);
            }
        }
    }
}