import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class LeaderboardService implements OnModuleDestroy {
    private readonly configService;
    private readonly logger;
    private readonly redis;
    constructor(configService: ConfigService);
    private currentKey;
    addPoints(userId: string, delta: number): Promise<void>;
    getTopN(n?: number): Promise<Array<{
        rank: number;
        userId: string;
        score: number;
    }>>;
    getUserRank(userId: string): Promise<{
        rank: number;
        score: number;
    } | null>;
    onModuleDestroy(): Promise<void>;
}
