import USB2Snes from './snes/usb2snes';
import DummyLogic from './snes/supermetroid/DummyLogic';

export default class Connection {
    constructor (react) {
        this.usb2snes = new USB2Snes();
        this.react = react;
        this.usb2snes.onAttach = this.onAttach;
        this.usb2snes.onDetach = this.onDisconnect;
        this.usb2snes.onListDevices = this.onListDevices;
        this.usb2snes.onDisconnect = this.onDisconnect;

        this.logic = new DummyLogic(this.usb2snes);

        this.apiToken = "";
        this.channel = "";
    }

    stop() {
        clearTimeout(this.eventLoopTimeout);
    }

    start() {
        this.eventLoopTimeout = setTimeout(this.eventLoop, 1000);
    }

    onListDevices = async (list) => {
        this.react.setDeviceList(list);
    }

    onAttach = async (device) => {
        this.react.setDeviceInfo(device.toObject());
    }

    onDisconnect = async () => {
        this.react.setDeviceInfo(null);
    }

    switchDevice(deviceName) {
        if (this.usb2snes.switchDevice(deviceName)) {
            this.react.setDeviceInfo(null);
        }
    }

    refreshDevices() {
        this.usb2snes.refreshDevices();
    }

    setAPIToken = (token) => {
        this.apiToken = token;
        this.logic.apiToken = token;
        this.react.setAPIToken(token);
        window.localStorage.setItem('funtoonAPIToken', token)
    }

    setChannel = (channel) => {
        this.channel = channel;
        this.logic.channel = channel;
        this.react.setChannel(channel);
        window.localStorage.setItem('channelName', channel)
    }

    setEnabled = (enabled) => {
        this.enabled = enabled;
        this.react.setEnabled(enabled);
        window.localStorage.setItem('enabled', enabled)
    }

    eventLoop = async () => {
        if (this.enabled) {
            if (this.usb2snes.isAttached()) {
                try {
                    await this.logic.loop();
                // } catch {}
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