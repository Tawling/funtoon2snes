import { WRAM_BASE_ADDR } from './datatypes';
import Device from '../network/Device';
import SocketStreamHandler from '../network/SocketStreamHandler';

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

            // Sort values longest to shortest then chunk the values by 64
            const unchunkedValues = [...values];
            unchunkedValues.sort((a, b) => b.value.size - a.value.size);
            if (unchunkedValues[0].value.size > 16) {
                throw Error('Single data read too large');
            }
            let sizeSum = 0;
            const chunks = [];
            let chunk = [];
            const chunkSizes = [];
            while (sizeSum < 16 && unchunkedValues.length > 0) {
                const nextItemIndex = unchunkedValues.findIndex(({value}) => sizeSum + value.size <= 16); // eslint-disable-line no-loop-func
                if (nextItemIndex < 0) {
                    chunks.push(chunk);
                    chunkSizes.push(sizeSum);
                    chunk = [];
                    sizeSum = 0;
                } else {
                    var [ item ] = unchunkedValues.splice(nextItemIndex, 1);
                    chunk.push(item);
                    sizeSum += item.value.size;
                }
            }
            if (sizeSum > 0) {
                chunks.push(chunk);
                chunkSizes.push(sizeSum);
            }

            // make requests
            const results = await Promise.all(chunks.map(async (c, i) => {
                const message = this.createMessage('GetAddress', [].concat(...(c.map((item) => item.value.toOperands()))));
                const response = await this.socketHandler.sendBin(message, chunkSizes[i]);
                let index = 0;
                c.forEach((item) => {
                    const size = item.value.size;
                    item.value = item.value.transformValue(response.slice(index, index+size))
                    index += size;
                })

                return c;
            }))

            const resultValues = [].concat(...results);

            if (typeof resultValues[0].key === 'number') {
                // build a list
                const final = new Array(resultValues.length);
                resultValues.forEach(({key, value}) => {
                    final[key] = value;
                })
                return final;
            } else{
                // build a dictionary
                const final = {}
                resultValues.forEach(({key, value}) => {
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
