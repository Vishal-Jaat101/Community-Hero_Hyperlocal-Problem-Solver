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
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const typeorm_1 = require("typeorm");
const user_gamification_entity_1 = require("./user-gamification.entity");
const issue_report_entity_1 = require("../../reports/entities/issue-report.entity");
const comment_entity_1 = require("../../reports/entities/comment.entity");
const upvote_validation_entity_1 = require("../../reports/entities/upvote-validation.entity");
let User = class User {
    id;
    phoneHash;
    emailHash;
    anonymizedDisplayName;
    isAnonymous;
    createdAt;
    gamification;
    reports;
    comments;
    validations;
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phone_hash', nullable: true, unique: true }),
    __metadata("design:type", Object)
], User.prototype, "phoneHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email_hash', nullable: true, unique: true }),
    __metadata("design:type", Object)
], User.prototype, "emailHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'anonymized_display_name' }),
    __metadata("design:type", String)
], User.prototype, "anonymizedDisplayName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_anonymous', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isAnonymous", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_gamification_entity_1.UserGamification, (g) => g.user, { cascade: true }),
    __metadata("design:type", user_gamification_entity_1.UserGamification)
], User.prototype, "gamification", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => issue_report_entity_1.IssueReport, (r) => r.reporter),
    __metadata("design:type", Array)
], User.prototype, "reports", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => comment_entity_1.Comment, (c) => c.user),
    __metadata("design:type", Array)
], User.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => upvote_validation_entity_1.UpvoteValidation, (v) => v.user),
    __metadata("design:type", Array)
], User.prototype, "validations", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map