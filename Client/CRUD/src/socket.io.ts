import { io } from "socket.io-client";
import type { Socket }  from "socket.io-client";


export const useSocketIO = () => {
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io('http://localhost:8000')
    return {
        socket,
    }
}



export interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
}

export interface ClientToServerEvents {
    hello: () => void;
}

export interface InterServerEvents {
    ping: () => void;
}

export interface SocketData {
    name: string;
    age: number;
}