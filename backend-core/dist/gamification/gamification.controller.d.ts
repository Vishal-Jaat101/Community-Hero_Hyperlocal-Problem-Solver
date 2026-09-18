import { GamificationService } from './gamification.service';
import { LeaderboardService } from './leaderboard.service';
export declare class GamificationController {
    private readonly gamificationService;
    private readonly leaderboard;
    constructor(gamificationService: GamificationService, leaderboard: LeaderboardService);
    handleEvent(event: string, userId: string): Promise<{
        ok: boolean;
    }>;
    getLeaderboard(): Promise<{
        leaderboard: {
            rank: number;
            userId: string;
            score: number;
        }[];
    }>;
    getUserRank(userId: string): Promise<{
        rank: number;
        score: number;
    } | {
        rank: null;
        score: number;
    }>;
}
