import { Socket, createSocket } from 'node:dgram';
import EventEmitter from 'node:events';
import { fromBuffer, ArgumentType, toBuffer } from 'osc-min';

const port = 57110;
const host = '127.0.0.1';

const log = console.log;

let client: Socket;
export const event = new EventEmitter();

function getClient() {
    if (!client) {
        client = createSocket({
            type: 'udp4',
            reuseAddr: true,
        });

        client.on('error', (err) => {
            log(`client error:\n`, err);
            client.close();
        });

        client.on('message', (msg: Buffer) => {
            const decoded = fromBuffer(msg);
            event.emit(decoded.address, decoded.args);
            if (decoded.address === '/done') {
                event.emit(`/done${decoded.args[0].value}`, decoded.args);
            }
            // log('Client msg:', msg.toString(), decoded);
            if (decoded.address === '/fail') {
                console.error('SC Error:', decoded)
            }
        });
    }
    return client;
}

export function send(address: string, ...args: ArgumentType[]) {
    const client = getClient();
    // log('Send:', address, args);
    const buffer = toBuffer({
        address,
        args,
    });

    return new Promise<void>((resolve, reject) => {
        client.send(buffer, 0, buffer.length, port, host, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

export function init() {
    return send('/notify', 1);
}
