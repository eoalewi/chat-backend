export type PaginatedMessages = {
    items: Array<{
        id: number;
        content: string;
        createdAt: Date;
        sender: {
            id: number;
            username: string;
            email: string;
        };
    }>;
    nextCursor: number | null;
};
declare class MessageService {
    ensureUserInRoom(userId: number, roomId: number): Promise<void>;
    sendMessage(userId: number, roomId: number, content: string): Promise<{
        sender: {
            id: number;
            email: string;
            username: string;
        };
    } & {
        id: number;
        createdAt: Date;
        roomId: number;
        content: string;
        senderId: number;
    }>;
    /**
     * Cursor-based pagination:
     * - pass ?limit=20&cursor=123 where cursor is last message id user have seen
     * - returns messages ordered newest->oldest (descending by id)
     */
    getRoomMessages(userId: number, roomId: number, limit?: number, cursor?: number): Promise<PaginatedMessages>;
    markRead(userId: number, messageIds: number[]): Promise<{
        count: number;
    }>;
}
declare const _default: MessageService;
export default _default;
//# sourceMappingURL=message.service.d.ts.map