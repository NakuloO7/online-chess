import type WebSocket from "ws";
export declare class GameManager {
    private games;
    private pendingUser;
    private users;
    constructor();
    addUser(socket: WebSocket): void;
    removeUser(socket: WebSocket): void;
    private handleMessage;
    private addHandler;
}
//# sourceMappingURL=GameManager.d.ts.map