import { wram, sram } from '../snes/datatypes';
import USB2Snes from '../snes/usb2snes'

export default class Connection {
    constructor (react) {
        this.usb2snes = new USB2Snes();
        this.react = react;
        this.usb2snes.onAttach = this.onAttach;
        this.usb2snes.onDetach = this.onDisconnect;
        this.usb2snes.onListDevices = this.onListDevices;
        this.usb2snes.onDisconnect = this.onDisconnect;

        this.state = {}
    }

    stop() {
        console.log('WEE WOO')
        clearTimeout(this.eventLoopTimeout)
    }

    start() {
        this.eventLoopTimeout = setTimeout(this.eventLoop, 1000)
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

                const read = await this.usb2snes.readMultipleTyped({
                    'roomID': wram.uint16Read(0x079B),
                    'gameState': wram.uint16Read(0x0998),
                    'samusHP': wram.uint16Read(0x09C2),
                    'enemyHP': wram.uint16Read(0x0F8C),
                    'phantoonEyeTimer': wram.uint16Read(0x0FE8),
                    'ceresTimer': wram.uint16Read(0x0945),
                    'ceresState': wram.uint16Read(0x093F),
                });



                console.log(read)

                // await Promise.all([
                //     this.usb2snes.readTypedMemory(sram.dataRead(0x2000, 0x15)),
                //     this.usb2snes.readTypedMemory(wram.int16Read(0x079B)),
                //     this.usb2snes.readTypedMemory(wram.int16Read(0x0998)),
                // ])
            // } catch {}
                } catch (e){
                    console.log(e)
                    // console.log(this.usb2snes.socketHandler.queue.length)
                }
        } else {
            console.log('skipped read')
        }
        this.eventLoopTimeout = setTimeout(this.eventLoop, 10)
    }
}