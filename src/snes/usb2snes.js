import { WRAM_BASE_ADDR, ReadBlock } from './datatypes';
import Device from '../network/Device';
import SocketStreamHandler from '../network/SocketStreamHandler';

import { chunk } from 'lodash'

export default class USB2Snes {
    constructor() {
        this.currentDevice = null;
        this.deviceList = [];

        this.socketHandler = new SocketStreamHandler({
            onConnect: this.attemptReattach,
            onDisconnect: this.handleDisconnect,
        });

        this.onAttach = null;
        this.onDetach = null;
        this.onDisconnect = null;
        this.onListDevices = null;

        this.lastDeviceName = null;

        this.attached = false;
    }

    isAttached() {
        return this.attached;
    }

    createMessage(opcode, operands, space = 'SNES') {
        return JSON.stringify({
            'Opcode': opcode,
            'Space': space,
            'Flags': null,
            'Operands': operands,
        });
    }

    switchDevice(deviceName) {
        if (this.attached && this.currentDevice) {
            if (this.currentDevice.name === deviceName) {
                return false;
            }
        }
        this.currentDevice = null;
        this.lastDeviceName = deviceName;
        clearTimeout(this.reattachTimeout)
        this.reattachTimeout = setTimeout(this.attemptReattach, 1);
        return true;
    }

    attemptReattach = async () => {
        console.log('attempt attach')
        if (this.reattachTimeout) {
            clearTimeout(this.reattachTimeout);
            this.reattachTimeout = null;
        }

        if (this.socketHandler.isConnected()) {
            this.socketHandler.clearQueue();
            try {
                this.deviceList = await this.listDevices();
                if (this.onListDevices !== null) {
                    try {this.onListDevices(this.deviceList);}catch(eee){console.error(eee)}
                }
                const firstDevice = this.deviceList[0];
                if (!firstDevice) {
                    // No devices listed, retry
                    clearTimeout(this.reattachTimeout);
                    this.reattachTimeout = setTimeout(this.attemptReattach, 1000);
                    return;
                } else {
                    // Select last-selected device or first device
                    let deviceName = firstDevice;
                    if (this.deviceList.length > 1 && this.deviceList.indexOf(this.lastDeviceName) > -1) {
                        deviceName = this.lastDeviceName;
                    }
                    const deviceInfo = await this.attachToDevice(deviceName);
                    if (deviceInfo) {
                        this.currentDevice = new Device(deviceName, deviceInfo);
                        this.lastDeviceName = deviceName;
                        this.attached = true;
                        if (this.onDetach !== null) {
                            try {this.onDetach();}catch(eee){console.error(eee)}
                        }
                        if (this.onAttach !== null) {
                            // TODO: save to localstorage
                            try {this.onAttach(this.currentDevice);}catch(eee){console.error(eee)}
                        }
                    }
                }
            } catch (error) {
                if (this.reattachTimeout) {
                    clearTimeout(this.reattachTimeout);
                    this.reattachTimeout = null;
                }
                console.log('Error attaching to device. Retrying.', error)
                this.reattachTimeout = setTimeout(this.attemptReattach, 1000);
            }
        }
    }

    refreshDevices = async () => {
        try {
            this.deviceList = await this.listDevices();
            if (this.onListDevices !== null) {
                try {this.onListDevices(this.deviceList);}catch{}
            }
        } catch (error) {
            console.log('Error listing devices', error);
        }
    }

    handleDisconnect = () => {
        this.attached = false;
        if (this.reattachTimeout) {
            clearTimeout(this.reattachTimeout);
            this.reattachTimeout = null;
        }
        if (this.onDetach !== null) {
            try {this.onDetach();}catch{}
        }
        if (this.onDisconnect !== null) {
            try {this.onDisconnect();}catch{}
        }
    }

    lock() {
        if (this.busy) return false;
        this.busy = true;
        return true;
    }

    listDevices() {
        return new Promise(async (resolve, reject) => {
            try {
                const message = this.createMessage('DeviceList');
                const response = await this.socketHandler.send(message);
                const json = JSON.parse(response);
                resolve(json.Results)
            } catch (err) {
                console.log('Error listing devices', err)
                reject(err);
            }
        })
    }

    attachToDevice(deviceName) {
        return new Promise(async (resolve, reject) => {
            try {
                let message = this.createMessage('Attach', [deviceName]);
                await this.socketHandler.send(message, true);
                message = this.createMessage('Info', [deviceName]);
                const response = await this.socketHandler.send(message);
                console.log('INFO response:', response)
                const json = JSON.parse(response);
                resolve(json.Results);
            } catch (err) {
                console.error(err)
                reject(err);
            }
        })
    }

    readMemory(address, numBytes, baseAddr = WRAM_BASE_ADDR) {
        return new Promise(async (resolve, reject) => {
            try {
                const message = this.createMessage('GetAddress', [(baseAddr + address).toString(16), numBytes.toString(16)]);
                const response = await this.socketHandler.sendBin(message, numBytes);
                resolve(response);
            } catch (err) {
                reject('Could not read data from device' + err);
            }
        });
    }

    readTypedMemory(readType) {
        return new Promise(async (resolve, reject) => {
            try {
                const message = this.createMessage('GetAddress', readType.toOperands());
                const response = await this.socketHandler.sendBin(message, readType.size);
                resolve(readType.transformValue(response));
            } catch (err) {
                console.log(err)
                reject('Could not read typed data from device' + err);
            }
        });
    }

    async readMultipleTyped(readTypes) {
        try {
            let values = []
            if (Array.isArray(readTypes)) {
                // Array of data reads
                values = readTypes.map((value, key) => ({key, value}))
            } else if (readTypes.toOperands && {}.toString.call(readTypes.toOperands) === '[object Function]') {
                // This must be a single data read object...
                return await this.readTypedMemory(readTypes);
            } else {
                // Dictionary of data reads
                values = Object.keys(readTypes).map((key) => ({key, value: readTypes[key]}))
            }

            if (values.length === 0) {
                return null;
            }

            // Sort values by address
            const valuesByAddr = [...values]
            valuesByAddr.sort((a, b) => (a.value.address + a.value.ramOffset) - (b.value.address + b.value.ramOffset))

            let startIndex = null;
            let endIndex = null
            const blocks = [];
            valuesByAddr.forEach((val, i) => {
                if (startIndex === null) {
                    startIndex = i
                } else {
                    if (
                        val.value.address + val.value.ramOffset + val.value.size
                            > valuesByAddr[startIndex].value.address + valuesByAddr[startIndex].value.ramOffset + 255
                    ) {
                        blocks.push(new ReadBlock(valuesByAddr.slice(startIndex, endIndex + 1)))
                        startIndex = i
                    }
                }
                endIndex = i
            })
            if (endIndex !== null) {
                blocks.push(new ReadBlock(valuesByAddr.slice(startIndex, endIndex + 1)))
            }

            await Promise.all(chunk(blocks, 8).map(async (chunk) => {
                const message = this.createMessage('GetAddress', [].concat(...(chunk.map((block) => block.toOperands()))))
                const response = await this.socketHandler.sendBin(message, chunk.reduce((acc, block) => acc + block.size, 0))
                let index = 0;
                chunk.forEach((block) => {
                    block.performReads(response.slice(index, index+block.size));
                    index += block.size;
                })
            }))

            if (typeof values[0].key === 'number') {
                // build a list
                const final = new Array(values.length);
                values.forEach(({key, value}) => {
                    final[key] = value;
                })
                return final;
            } else{
                // build a dictionary
                const final = {}
                values.forEach(({key, value}) => {
                    final[key] = value;
                })
                return final;
            }
        } catch (error) {
            console.error(error)
            return null
        }
    }
}
