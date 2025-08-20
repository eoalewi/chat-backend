import { Response } from "express";
import { AuthRequest } from "../../middlewares/authMiddleware";
declare class RoomController {
    createRoom(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    joinRoom(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getMyRooms(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
declare const _default: RoomController;
export default _default;
//# sourceMappingURL=room.controller.d.ts.map