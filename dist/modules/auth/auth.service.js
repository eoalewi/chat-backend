"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../../config/db"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const token_1 = require("../../utils/token");
class AuthService {
    async register(email, username, password) {
        // Check if user exists
        const existingUser = await db_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error("User already exists with this email");
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Create user
        const user = await db_1.default.user.create({
            data: { email, username, password: hashedPassword },
        });
        // Generate JWT
        const token = (0, token_1.generateToken)({ id: user.id, email: user.email });
        return { user, token };
    }
    async login(email, password) {
        const user = await db_1.default.user.findUnique({ where: { email } });
        if (!user)
            throw new Error("Invalid email or password");
        // Compare password
        const isValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isValid)
            throw new Error("Invalid email or password");
        // Generate JWT
        const token = (0, token_1.generateToken)({ id: user.id, email: user.email });
        return { user, token };
    }
}
exports.default = new AuthService();
//# sourceMappingURL=auth.service.js.map