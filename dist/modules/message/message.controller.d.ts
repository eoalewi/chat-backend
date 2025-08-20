import { Response } from "express";
import { AuthRequest } from "../../middlewares/authMiddleware";
declare class MessageController {
    send(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    list(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    markRead(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
declare const _default: MessageController;
export default _default;
//# sourceMappingURL=message.controller.d.ts.map