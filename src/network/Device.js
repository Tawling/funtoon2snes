export default class Device {
    constructor(deviceName, deviceInfo) {
        // deviceInfo example ["1.1.0", "Snes9x", "Super Metroid        ", "NO_CONTROL_CMD", "NO_FILE_CMD"]
        const [version, deviceType, romName, ...flags] = deviceInfo;
        this.name = deviceName;
        this.version = version;
        this.deviceType = deviceType;
        this.romName = romName;
        this.flags = flags;
    }

    toObject() {
        return {
            name: this.name,
            version: this.version,
            type: this.deviceType,
            romName: this.romName,
            flags: this.flags,
        };
    }
}
