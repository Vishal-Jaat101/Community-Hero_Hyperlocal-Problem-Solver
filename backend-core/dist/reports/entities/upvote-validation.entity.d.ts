import { IssueReport } from './issue-report.entity';
import { User } from '../../users/entities/user.entity';
export declare class UpvoteValidation {
    id: string;
    issue: IssueReport;
    user: User;
    voteType: string;
    createdAt: Date;
}
