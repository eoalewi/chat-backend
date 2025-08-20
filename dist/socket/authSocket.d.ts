import { Socket } from "socket.io";
export type AuthedSocket = Socket & {
    user?: {
        id: number;
        email: string;
    };
};
export declare function socketAuthMiddleware(socket: AuthedSocket, next: (err?: Error) => void): void;
//# sourceMappingURL=authSocket.d.ts.map