import { UserGamification } from './user-gamification.entity';
import { IssueReport } from '../../reports/entities/issue-report.entity';
import { Comment } from '../../reports/entities/comment.entity';
import { UpvoteValidation } from '../../reports/entities/upvote-validation.entity';
export declare class User {
    id: string;
    phoneHash: string | null;
    emailHash: string | null;
    anonymizedDisplayName: string;
    isAnonymous: boolean;
    createdAt: Date;
    gamification: UserGamification;
    reports: IssueReport[];
    comments: Comment[];
    validations: UpvoteValidation[];
}
