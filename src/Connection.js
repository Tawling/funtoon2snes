import USB2Snes from './snes/usb2snes';
import DummyLogic from './snes/supermetroid/DummyLogic';

export default class Connection {
    constructor (callExternal) {
        this.usb2snes = new USB2Snes();
        this.callExternal = callExternal
        this.usb2snes.onAttach = this.onAttach;
        this.usb2snes.onDetach = this.onDisconnect;
        this.usb2snes.onListDevices = this.onListDevices;
        this.usb2snes.onDisconnect = this.onDisconnect;

        this.logic = new DummyLogic(this.usb2snes, callExternal);

        this.apiToken = "";
        this.channel = "";
        
    }

    onExternal = ({ name, args }) => {
        this[name](...args)
    }

    stop() {
        clearTimeout(this.eventLoopTimeout);
        clearInterval(this.secondTimer);
    }

    start() {
        this.eventLoopTimeout = setTimeout(this.eventLoop, 1000);
        this.secondTimer = setInterval(this.setRPS, 5000);
    }

    onListDevices = async (list) => {
        this.callExternal('setDeviceList', list);
    }

    onAttach = async (device) => {
        this.callExternal('setDeviceInfo', device.toObject());
        setTimeout(this.setRPS, 1000);
    }

    onDisconnect = async () => {
        this.callExternal('setDeviceInfo', null);
    }

    switchDevice(deviceName) {
        if (this.usb2snes.switchDevice(deviceName)) {
            this.callExternal('setDeviceInfo', null)
        }
    }

    refreshDevices() {
        this.usb2snes.refreshDevices();
    }

    setAPIToken = (token) => {
        this.apiToken = token;
        this.logic.apiToken = token;
        this.callExternal('setAPIToken', token);
    }

    setChannel = (channel) => {
        this.channel = channel;
        this.logic.channel = channel;
        this.callExternal('setChannel', channel);
    }

    setEnabled = (enabled) => {
        this.enabled = enabled;
        this.callExternal('setEnabled', enabled);
    }

    setRPS = () => {
        this.callExternal('setRPS', this.readCount / 5)
        this.readCount = 0;
    }

    eventLoop = async () => {
        if (this.enabled) {
            if (this.usb2snes.isAttached()) {
                try {
                    await this.logic.loop();
                    this.readCount++;
                } catch (e){
                    console.log(e);
                }
            } else {
                console.log('skipped read');
            }
        }
        this.eventLoopTimeout = setTimeout(this.eventLoop, 16);
    }
}