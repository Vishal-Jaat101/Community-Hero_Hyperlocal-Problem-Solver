import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateOrRegisterUser(email?: string, phone?: string): Promise<{
        accessToken: string;
        user: {
            id: any;
            anonymizedDisplayName: any;
            isAnonymous: any;
        };
    }>;
    login(user: any): Promise<{
        accessToken: string;
        user: {
            id: any;
            anonymizedDisplayName: any;
            isAnonymous: any;
        };
    }>;
}
