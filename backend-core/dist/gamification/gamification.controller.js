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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamificationController = void 0;
const common_1 = require("@nestjs/common");
const gamification_service_1 = require("./gamification.service");
const leaderboard_service_1 = require("./leaderboard.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let GamificationController = class GamificationController {
    gamificationService;
    leaderboard;
    constructor(gamificationService, leaderboard) {
        this.gamificationService = gamificationService;
        this.leaderboard = leaderboard;
    }
    async handleEvent(event, userId) {
        await this.gamificationService.handleEvent(event, userId);
        return { ok: true };
    }
    async getLeaderboard() {
        const top = await this.leaderboard.getTopN(20);
        return { leaderboard: top };
    }
    async getUserRank(userId) {
        const result = await this.leaderboard.getUserRank(userId);
        return result ?? { rank: null, score: 0 };
    }
};
exports.GamificationController = GamificationController;
__decorate([
    (0, common_1.Post)('event'),
    __param(0, (0, common_1.Body)('event')),
    __param(1, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "handleEvent", null);
__decorate([
    (0, common_1.Get)('leaderboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "getLeaderboard", null);
__decorate([
    (0, common_1.Get)('rank/:userId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "getUserRank", null);
exports.GamificationController = GamificationController = __decorate([
    (0, common_1.Controller)('gamification'),
    __metadata("design:paramtypes", [gamification_service_1.GamificationService,
        leaderboard_service_1.LeaderboardService])
], GamificationController);
//# sourceMappingURL=gamification.controller.js.map