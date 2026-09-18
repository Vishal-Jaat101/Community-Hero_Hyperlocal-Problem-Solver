import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<{
        id: string;
        anonymizedDisplayName: string;
        isAnonymous: boolean;
        createdAt: Date;
        totalPoints: number;
        currentLevel: number;
        badgeMilestones: string[];
    }>;
    toggleAnonymity(req: any, isAnonymous: boolean): Promise<{
        isAnonymous: boolean;
    }>;
    updateDisplayName(req: any, name: string): Promise<{
        anonymizedDisplayName: string;
    }>;
}
