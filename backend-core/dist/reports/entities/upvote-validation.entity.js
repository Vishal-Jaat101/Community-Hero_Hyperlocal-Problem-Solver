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
exports.UpvoteValidation = void 0;
const typeorm_1 = require("typeorm");
const issue_report_entity_1 = require("./issue-report.entity");
const user_entity_1 = require("../../users/entities/user.entity");
let UpvoteValidation = class UpvoteValidation {
    id;
    issue;
    user;
    voteType;
    createdAt;
};
exports.UpvoteValidation = UpvoteValidation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UpvoteValidation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => issue_report_entity_1.IssueReport, (r) => r.validations, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'issue_id' }),
    __metadata("design:type", issue_report_entity_1.IssueReport)
], UpvoteValidation.prototype, "issue", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (u) => u.validations, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], UpvoteValidation.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vote_type', type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], UpvoteValidation.prototype, "voteType", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], UpvoteValidation.prototype, "createdAt", void 0);
exports.UpvoteValidation = UpvoteValidation = __decorate([
    (0, typeorm_1.Entity)('upvotes_validations'),
    (0, typeorm_1.Unique)(['issue', 'user'])
], UpvoteValidation);
//# sourceMappingURL=upvote-validation.entity.js.map