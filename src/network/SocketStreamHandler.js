import { Mutex } from "async-mutex";
import { readAsArrayBuffer } from "../util/utils";

export default class SocketStreamHandler {
    constructor({ onConnect, onDisconnect } = {}) {
        this.queue = [];
        this.ws = null;

        this.shouldReconnect = true;
        this.reconnectTimeout = null;

        this.onConnect = onConnect || null;
        this.onDisconnect = onDisconnect || null;

        this.mutex = new Mutex();

        this.connect();
    }

    clearQueue() {
        this.mutex.cancel();
        console.log('clearing', this.queue.length, 'queued items');
        this.queue.map((i) => i.reject('connection killed'));
        this.queue = [];
    }

    connect = () => {
        this.reconnectTimeout = clearTimeout(this.reconnectTimeout)
        this.clearQueue();
        this.mutex.cancel();
        return this.mutex.runExclusive(async () => {
            this.ws = null;
            try {
                await this.openWS('ws://localhost:23074');
                console.log('Successfully connected to Usb2Snes')
            } catch {
                try {
                    await this.openWS('ws://localhost:8080');
                    console.log('Successfully connected to QUsb2Snes')
                } catch (error) {
                    console.log('Could not connect to the Usb2Snes service, retrying:', error);
                    this.reconnectTimeout = setTimeout(this.connect, 3000);
                    return;
                }
            }
            this.ws.onclose = this.handleClose;
            this.ws.onmessage = this.handleMessage;
            this.ws.onerror = this.handleError;

            if (this.onConnect !== null) {
                this.onConnect()
            }

            this.clearQueue();
            this.mutex.cancel();
        });
    }

    openWS(url) {
        return new Promise((resolve, reject) => {
            if (this.ws !== null) {
                reject('ALREADY CONNECTED')
            }

            let socket = new WebSocket(url);
            socket.onopen = () => {
                this.ws = socket;
                this.clearQueue();
                resolve(socket);
            }

            socket.onerror = (err) => {
                reject(err);
            }
        });
    }

    handleClose = () => {
        console.error('Connection forcefully closed')
        this.clearQueue();
        this.ws = null;
        if (this.onDisconnect !== null) {
            this.onDisconnect(this.shouldReconnect)
        }
        if (this.shouldReconnect) {
            clearTimeout(this.reconnectTimeout)
            this.reconnectTimeout = setTimeout(this.connect, 10);
        }
    }

    handleMessage = (event) => {
        this.mutex.runExclusive(async () => {
            const context = this.queue[0];
            if (context) {
                const { resolve, reject } = context;
                if (context.size) {
                    // This is a memory read
                    if (!context.buffer) {
                        // initialize buffer
                        context.buffer = new Uint8Array(0);
                    }
                    // Read incoming data
                    try {
                        //const buf = await event.data.arrayBuffer();
                        const buf = await readAsArrayBuffer(event.data);
                        const arrayBuffer = new Uint8Array(buf);
                        // Append incoming data to outputBuffer
                        const tmpBuffer = new Uint8Array(context.buffer.byteLength + arrayBuffer.byteLength);
                        tmpBuffer.set(context.buffer);
                        tmpBuffer.set(arrayBuffer, context.buffer.byteLength)
                        context.buffer = tmpBuffer;

                        // End if we have read enough data
                        if (context.buffer.byteLength === context.size) {
                            // Pop from queue and resolve
                            this.queue.shift();
                            resolve(context.buffer);
                        }
                    } catch (err) {
                        console.log('failed byte read', err);
                        this.queue.shift();
                        reject(err);
                    }
                } else {
                    // This is a non-memory read
                    this.queue.shift();
                    resolve(event.data);
                }
            }
        })
    }

    handleError(err) {
        this.mutex.runExclusive(async () => {
            console.log(err);
            const context = this.queue.shift();
            this.clearQueue();
            if (context) {
                context.reject(err);
            }
        })
    }

    send(msg, noReply = false) {
        return new Promise((resolve, reject) => {
            if (!noReply) {
                // queue the response resolution for handleMessage
                this.queue.push({
                    size: null,
                    resolve,
                    reject,
                });
            }

            this.ws.send(msg);

            console.log('send:', msg);
            if (noReply) {
                resolve(true);
            }
        });
    }

    sendBin(msg, size = 2) {
        return new Promise((resolve, reject) => {
            if (size <= 0) {
                reject('Invalid size');
            }
            this.queue.push({
                size,
                resolve,
                reject,
            });

            this.ws.send(msg);

            // console.log('sendBin:', msg);
        });
    }

    isConnected() {
        return this.ws !== null;
    }
}