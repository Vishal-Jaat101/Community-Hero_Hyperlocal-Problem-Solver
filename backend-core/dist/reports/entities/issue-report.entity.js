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
exports.IssueReport = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const comment_entity_1 = require("./comment.entity");
const upvote_validation_entity_1 = require("./upvote-validation.entity");
let IssueReport = class IssueReport {
    id;
    reporter;
    category;
    severity;
    status;
    latitude;
    longitude;
    geoLocation;
    s3MediaUrl;
    originalMediaUrl;
    createdAt;
    comments;
    validations;
};
exports.IssueReport = IssueReport;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], IssueReport.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (u) => u.reports, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'reporter_id' }),
    __metadata("design:type", user_entity_1.User)
], IssueReport.prototype, "reporter", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], IssueReport.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'Minor' }),
    __metadata("design:type", String)
], IssueReport.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'Reported' }),
    __metadata("design:type", String)
], IssueReport.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('double precision'),
    __metadata("design:type", Number)
], IssueReport.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)('double precision'),
    __metadata("design:type", Number)
], IssueReport.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Index)({ spatial: true }),
    (0, typeorm_1.Column)('geometry', {
        spatialFeatureType: 'Point',
        srid: 4326,
        nullable: true,
    }),
    __metadata("design:type", String)
], IssueReport.prototype, "geoLocation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 's3_media_url', nullable: true }),
    __metadata("design:type", String)
], IssueReport.prototype, "s3MediaUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'original_media_url', nullable: true }),
    __metadata("design:type", String)
], IssueReport.prototype, "originalMediaUrl", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], IssueReport.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => comment_entity_1.Comment, (c) => c.issue),
    __metadata("design:type", Array)
], IssueReport.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => upvote_validation_entity_1.UpvoteValidation, (v) => v.issue),
    __metadata("design:type", Array)
], IssueReport.prototype, "validations", void 0);
exports.IssueReport = IssueReport = __decorate([
    (0, typeorm_1.Entity)('issue_reports')
], IssueReport);
//# sourceMappingURL=issue-report.entity.js.map