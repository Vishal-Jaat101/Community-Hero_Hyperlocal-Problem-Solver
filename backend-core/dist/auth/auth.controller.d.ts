import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(email?: string, phone?: string): Promise<{
        accessToken: string;
        user: {
            id: any;
            anonymizedDisplayName: any;
            isAnonymous: any;
        };
    }>;
}
