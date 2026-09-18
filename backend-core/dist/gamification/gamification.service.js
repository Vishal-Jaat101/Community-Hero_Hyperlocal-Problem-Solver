"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var GamificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_gamification_entity_1 = require("../users/entities/user-gamification.entity");
const leaderboard_service_1 = require("./leaderboard.service");
const events_gateway_1 = require("./events.gateway");
const gamification_constants_1 = require("./gamification.constants");
let GamificationService = GamificationService_1 = class GamificationService {
    gamificationRepo;
    leaderboard;
    eventsGateway;
    logger = new common_1.Logger(GamificationService_1.name);
    constructor(gamificationRepo, leaderboard, eventsGateway) {
        this.gamificationRepo = gamificationRepo;
        this.leaderboard = leaderboard;
        this.eventsGateway = eventsGateway;
    }
    async handleEvent(event, userId) {
        const delta = gamification_constants_1.POINTS[event];
        if (!delta)
            return;
        let row = await this.gamificationRepo.findOne({ where: { user: { id: userId } } });
        if (!row) {
            row = this.gamificationRepo.create({ user: { id: userId } });
        }
        const before = row.totalPoints;
        row.totalPoints += delta;
        const newBadges = [];
        for (const [threshold, badge] of Object.entries(gamification_constants_1.BADGES)) {
            const t = Number(threshold);
            if (before < t && row.totalPoints >= t && !row.badgeMilestones.includes(badge)) {
                row.badgeMilestones = [...row.badgeMilestones, badge];
                newBadges.push(badge);
            }
        }
        await this.gamificationRepo.save(row);
        this.logger.log(`[gamification] user=${userId} +${delta} pts → total=${row.totalPoints}`);
        await this.leaderboard.addPoints(userId, delta);
        for (const badge of newBadges) {
            this.logger.log(`[gamification] 🏅 Badge unlocked: "${badge}" for user=${userId}`);
            this.eventsGateway.emitToUser(userId, 'badge_unlocked', {
                badge,
                totalPoints: row.totalPoints,
            });
        }
        this.eventsGateway.emitToUser(userId, 'points_updated', {
            delta,
            totalPoints: row.totalPoints,
            event,
        });
    }
};
exports.GamificationService = GamificationService;
exports.GamificationService = GamificationService = GamificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_gamification_entity_1.UserGamification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        leaderboard_service_1.LeaderboardService,
        events_gateway_1.EventsGateway])
], GamificationService);
//# sourceMappingURL=gamification.service.js.map