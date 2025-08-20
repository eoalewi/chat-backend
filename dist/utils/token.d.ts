import jwt from "jsonwebtoken";
export declare const generateToken: (payload: object, expiresIn?: string | number) => string;
export declare const verifyToken: (token: string) => string | jwt.JwtPayload;
//# sourceMappingURL=token.d.ts.map