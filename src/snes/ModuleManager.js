import GameDetectorModule from "./GameDetectorModule";
import { SuperMetroid } from "./supermetroid/modules";

export default class ModuleManager {
    constructor(usb2snes, callExternal, setReloadUnsafe) {
        this.usb2snes = usb2snes;
        this.callExternal = callExternal;
        this.apiToken = "";
        this.channel = "";
        this.reloadUnsafeCount = 0;
        this.lastReadTime = performance.now();

        this.modules = [GameDetectorModule, ...SuperMetroid].map((Module) => {
            const m = new Module();
            let reloadUnsafe = false;
            m.__setReloadUnsafe = (b) => {
                if (reloadUnsafe && !b) {
                    this.reloadUnsafeCount -= 1;
                    if (this.reloadUnsafeCount === 0) {
                        setReloadUnsafe(false);
                    }
                } else if (!reloadUnsafe && b) {
                    this.reloadUnsafeCount += 1;
                    setReloadUnsafe(true);
                }
                reloadUnsafe = b;
            };
            return m;
        });
    }

    setModuleStates(states) {
        for (const module of this.modules) {
            if (states[module.moduleName] && states[module.moduleName].settings) {
                module.setSettings({
                    enabled: states[module.moduleName].enabled,
                    ...states[module.moduleName].settings,
                });
            }
        }
    }

    getModuleStates() {
        const newStates = {};
        for (const module of this.modules) {
            newStates[module.moduleName] = {
                displayName: module.displayName,
                enabled: module.enabled,
                hidden: module.hidden,
                tooltip: module.tooltip,
                description: module.description,
                settings: module.getSettings(),
            };
        }
        return newStates;
    }

    sendEvent = async (event, data = null, delay = 0) => {
        return new Promise((resolve, reject) => {
            if (!this.channel || !this.apiToken) {
                console.log("Failed to send event:", JSON.stringify(event));
                return reject("Invalid auth");
            }
            console.log("Sending Event:", JSON.stringify(event), "with data", JSON.stringify(data));
            setTimeout(
                async () =>
                    resolve(
                        console.log(
                            await fetch("https://funtoon.party/api/events/custom", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: this.apiToken,
                                },
                                body: JSON.stringify({
                                    channel: this.channel,
                                    event,
                                    data,
                                }),
                            })
                        )
                    ),
                Math.floor(delay * 1000)
            );
        });
    };

    async loop(globalState) {
        // Build read list
        const mems = {};
        const reads = {};

        const enabledModules = this.modules.filter(({ enabled }) => enabled);

        for (const module of enabledModules) {
            const moduleReads = module.getMemoryReads(globalState);
            for (const addr of moduleReads) {
                reads[addr.key] = addr.dataRead;
                mems[addr.key] = addr;
            }
        }

        const readStartTime = performance.now();
        // Perform reads
        const data = await this.usb2snes.readMultipleTyped(reads);
        const readEndTime = performance.now();
        globalState.readTime = readEndTime - this.lastReadTime;
        this.lastReadTime = readEndTime;

        // Update memstate values
        for (const key in data) {
            mems[key].update(data[key]);
        }

        // Run module logic
        for (const module of enabledModules) {
            if (globalState.gameTagsChanged) {
                module.__shouldRunForGame = module.shouldRunForGame(globalState.persistent.gameTags);
            }
            if (module.enabled && module.__shouldRunForGame) {
                module.memoryReadAvailable({
                    memory: mems,
                    sendEvent: this.sendEvent,
                    globalState,
                    setReloadUnsafe: this.setReloadUnsafe,
                });
            }
        }
    }
}
