import { IssueReport } from './issue-report.entity';
import { User } from '../../users/entities/user.entity';
export declare class Comment {
    id: string;
    issue: IssueReport;
    user: User;
    commentText: string;
    createdAt: Date;
}
