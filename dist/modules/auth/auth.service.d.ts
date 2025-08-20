declare class AuthService {
    register(email: string, username: string, password: string): Promise<{
        user: {
            id: number;
            email: string;
            password: string;
            username: string;
            createdAt: Date;
            lastSeen: Date | null;
        };
        token: string;
    }>;
    login(email: string, password: string): Promise<{
        user: {
            id: number;
            email: string;
            password: string;
            username: string;
            createdAt: Date;
            lastSeen: Date | null;
        };
        token: string;
    }>;
}
declare const _default: AuthService;
export default _default;
//# sourceMappingURL=auth.service.d.ts.map