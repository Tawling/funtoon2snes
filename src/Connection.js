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

        this.state = {}
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

    eventLoop = async () => {
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
        this.eventLoopTimeout = setTimeout(this.eventLoop, 16);
    }
}