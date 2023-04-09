declare module 'osc-min' {
    export interface Argument {
        type: string;

        value: boolean | number | string;
    }

    export type ArgumentType = boolean | number | string | Argument;

    export interface Message {
        address: string;
        args: ArgumentType[];
    }

    export interface ToMessage {
        address: string;
        args: Argument[];
    }

    export type MessageLike =
        | [string, ...ArgumentType[]]
        | Message;

    export function toBuffer(msg: MessageLike): Buffer;

    export function fromBuffer(buffer: Buffer): ToMessage;
}
