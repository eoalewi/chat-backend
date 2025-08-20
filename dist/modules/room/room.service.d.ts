declare class RoomService {
    createRoom(name: string, isPrivate: boolean, userId: number): Promise<{
        members: {
            id: number;
            userId: number;
            roomId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        name: string;
        isPrivate: boolean;
    }>;
    joinRoom(roomId: number, userId: number): Promise<{
        id: number;
        userId: number;
        roomId: number;
    }>;
    getUserRooms(userId: number): Promise<any[]>;
}
declare const _default: RoomService;
export default _default;
//# sourceMappingURL=room.service.d.ts.map