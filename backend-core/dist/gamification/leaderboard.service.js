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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var LeaderboardService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaderboardService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
let LeaderboardService = LeaderboardService_1 = class LeaderboardService {
    configService;
    logger = new common_1.Logger(LeaderboardService_1.name);
    redis;
    constructor(configService) {
        this.configService = configService;
        this.redis = new ioredis_1.default({
            host: this.configService.get('REDIS_HOST') || 'localhost',
            port: this.configService.get('REDIS_PORT') || 6379,
        });
    }
    currentKey() {
        const now = new Date();
        const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        return `leaderboard:${ym}`;
    }
    async addPoints(userId, delta) {
        const key = this.currentKey();
        await this.redis.zadd(key, 'XX', 0, userId);
        await this.redis.zincrby(key, delta, userId);
        await this.redis.expire(key, 60 * 60 * 24 * 40);
        this.logger.debug(`+${delta} pts → userId=${userId} on ${key}`);
    }
    async getTopN(n = 10) {
        const key = this.currentKey();
        const raw = await this.redis.zrevrange(key, 0, n - 1, 'WITHSCORES');
        const results = [];
        for (let i = 0; i < raw.length; i += 2) {
            results.push({
                rank: results.length + 1,
                userId: raw[i],
                score: parseFloat(raw[i + 1]),
            });
        }
        return results;
    }
    async getUserRank(userId) {
        const key = this.currentKey();
        const [rank, score] = await Promise.all([
            this.redis.zrevrank(key, userId),
            this.redis.zscore(key, userId),
        ]);
        if (rank === null)
            return null;
        return { rank: rank + 1, score: parseFloat(score || '0') };
    }
    async onModuleDestroy() {
        await this.redis.quit();
    }
};
exports.LeaderboardService = LeaderboardService;
exports.LeaderboardService = LeaderboardService = LeaderboardService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LeaderboardService);
//# sourceMappingURL=leaderboard.service.js.map