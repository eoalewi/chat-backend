"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = __importDefault(require("./auth.service"));
class AuthController {
    async register(req, res) {
        try {
            const { email, username, password } = req.body;
            if (!email || !username || !password) {
                return res.status(400).json({ message: "All fields are required" });
            }
            const result = await auth_service_1.default.register(email, username, password);
            return res.status(201).json(result);
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res
                    .status(400)
                    .json({ message: "Email and password are required" });
            }
            const result = await auth_service_1.default.login(email, password);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
}
exports.default = new AuthController();
//# sourceMappingURL=auth.controller.js.map