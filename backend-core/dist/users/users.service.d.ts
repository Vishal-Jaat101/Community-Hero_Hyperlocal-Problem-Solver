import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserGamification } from './entities/user-gamification.entity';
export declare class UsersService {
    private usersRepository;
    private gamificationRepository;
    constructor(usersRepository: Repository<User>, gamificationRepository: Repository<UserGamification>);
    hashIdentifier(val: string): string | null;
    findByHash(emailHash?: string | null, phoneHash?: string | null): Promise<User | null>;
    findById(id: string): Promise<User>;
    createUser(email?: string, phone?: string): Promise<User>;
    toggleAnonymity(userId: string, isAnonymous: boolean): Promise<User>;
    updateDisplayName(userId: string, name: string): Promise<User>;
}
