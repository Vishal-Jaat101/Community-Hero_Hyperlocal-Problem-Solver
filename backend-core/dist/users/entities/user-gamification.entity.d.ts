import { User } from './user.entity';
export declare class UserGamification {
    id: string;
    user: User;
    totalPoints: number;
    currentLevel: number;
    badgeMilestones: string[];
}
