import { Repository } from 'typeorm';
import { UserGamification } from '../users/entities/user-gamification.entity';
import { LeaderboardService } from './leaderboard.service';
import { EventsGateway } from './events.gateway';
import { GamificationEvent } from './gamification.constants';
export declare class GamificationService {
    private readonly gamificationRepo;
    private readonly leaderboard;
    private readonly eventsGateway;
    private readonly logger;
    constructor(gamificationRepo: Repository<UserGamification>, leaderboard: LeaderboardService, eventsGateway: EventsGateway);
    handleEvent(event: GamificationEvent, userId: string): Promise<void>;
}
