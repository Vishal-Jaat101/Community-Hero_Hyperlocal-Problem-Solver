"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const user_gamification_entity_1 = require("./entities/user-gamification.entity");
const crypto = __importStar(require("crypto"));
let UsersService = class UsersService {
    usersRepository;
    gamificationRepository;
    constructor(usersRepository, gamificationRepository) {
        this.usersRepository = usersRepository;
        this.gamificationRepository = gamificationRepository;
    }
    hashIdentifier(val) {
        if (!val)
            return null;
        return crypto.createHash('sha256').update(val).digest('hex');
    }
    async findByHash(emailHash, phoneHash) {
        if (!emailHash && !phoneHash)
            return null;
        const query = this.usersRepository.createQueryBuilder('user')
            .leftJoinAndSelect('user.gamification', 'gamification');
        if (emailHash) {
            query.orWhere('user.email_hash = :emailHash', { emailHash });
        }
        if (phoneHash) {
            query.orWhere('user.phone_hash = :phoneHash', { phoneHash });
        }
        return query.getOne();
    }
    async findById(id) {
        const user = await this.usersRepository.findOne({
            where: { id },
            relations: { gamification: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async createUser(email, phone) {
        const emailHash = email ? this.hashIdentifier(email) : null;
        const phoneHash = phone ? this.hashIdentifier(phone) : null;
        const existing = await this.findByHash(emailHash, phoneHash);
        if (existing) {
            throw new common_1.ConflictException('User with this email or phone already exists');
        }
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const anonymizedDisplayName = `Hero#${randomSuffix}`;
        const user = new user_entity_1.User();
        user.emailHash = emailHash;
        user.phoneHash = phoneHash;
        user.anonymizedDisplayName = anonymizedDisplayName;
        const gamification = new user_gamification_entity_1.UserGamification();
        gamification.totalPoints = 0;
        gamification.currentLevel = 1;
        gamification.badgeMilestones = [];
        user.gamification = gamification;
        return this.usersRepository.save(user);
    }
    async toggleAnonymity(userId, isAnonymous) {
        const user = await this.findById(userId);
        user.isAnonymous = isAnonymous;
        return this.usersRepository.save(user);
    }
    async updateDisplayName(userId, name) {
        const user = await this.findById(userId);
        user.anonymizedDisplayName = name;
        return this.usersRepository.save(user);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(user_gamification_entity_1.UserGamification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map