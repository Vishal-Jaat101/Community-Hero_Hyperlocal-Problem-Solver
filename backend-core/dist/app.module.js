"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const gamification_module_1 = require("./gamification/gamification.module");
const user_entity_1 = require("./users/entities/user.entity");
const user_gamification_entity_1 = require("./users/entities/user-gamification.entity");
const issue_report_entity_1 = require("./reports/entities/issue-report.entity");
const comment_entity_1 = require("./reports/entities/comment.entity");
const upvote_validation_entity_1 = require("./reports/entities/upvote-validation.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST') || 'localhost',
                    port: configService.get('DB_PORT') || 5432,
                    username: configService.get('DB_USERNAME') || 'hero_user',
                    password: configService.get('DB_PASSWORD') || 'hero_password',
                    database: configService.get('DB_DATABASE') || 'community_hero',
                    entities: [user_entity_1.User, user_gamification_entity_1.UserGamification, issue_report_entity_1.IssueReport, comment_entity_1.Comment, upvote_validation_entity_1.UpvoteValidation],
                    synchronize: true,
                }),
            }),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            gamification_module_1.GamificationModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map