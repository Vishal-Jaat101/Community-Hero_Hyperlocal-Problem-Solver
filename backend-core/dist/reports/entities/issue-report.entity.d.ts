import { User } from '../../users/entities/user.entity';
import { Comment } from './comment.entity';
import { UpvoteValidation } from './upvote-validation.entity';
export declare class IssueReport {
    id: string;
    reporter: User;
    category: string;
    severity: string;
    status: string;
    latitude: number;
    longitude: number;
    geoLocation: string;
    s3MediaUrl: string;
    originalMediaUrl: string;
    createdAt: Date;
    comments: Comment[];
    validations: UpvoteValidation[];
}
