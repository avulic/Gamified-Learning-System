
import { authConfig } from '@/config/authConfig';
import { IUser, IRole } from '@/models/app';
import { ClientError } from '@/models/app/Errors/ClientError';
import { NotFoundError } from '@/models/app/Errors/NotFoundError';
import { UnauthorizedError } from '@/models/app/Errors/UnauthorizedError';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '@/models/dto';
import { Roles } from '@/models/enums';
import { IUnitOfWork } from '@/repository/interface/IUnitOfWork';
import { MongoUnitOfWork } from '@/repository/MongoUnitOfWork';
import { RoleRepository } from '@/repository/RoleRepository';
import { UserRepository } from '@/repository/UserRepository';
import { TYPES } from '@/types';
import { UserMapper, RoleMapper } from '@/utils/ModelMapper';
import bcrypt from 'bcryptjs';
import { injectable, inject } from 'inversify';
import jwt from 'jsonwebtoken';
import { Logger } from 'winston';


@injectable()
class UserService {
    constructor(
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.RoleRepository) private roleRepository: RoleRepository,
        @inject(TYPES.Logger) private logger: Logger
    ) { }

    public async createUser(userData: IUser): Promise<IUser> {
        await this.validateUserData(userData);

        const roles: IRole[] = await this.getRoles(userData.roles.map(r => r as Roles));

        const userWithRoles: IUser = {
            ...userData,
            roles: roles.map(r => r.id!),
            profilePicture: '',
            preferences: {
                notifications: true,
                theme: 'light',
                language: 'en'
            },
            enrolledCoursesIds: []
        };

        const savedUser: IUser = await this.userRepository.create(userWithRoles, {});
        this.logger.info('User registered successfully', { userId: savedUser.id });
        return savedUser;
    }

    public async createUsers(usersData: IUser[]): Promise<IUser[]> {
        // await this.validateUsers(usersData);

        // const allRoleNames = [...new Set(usersData.flatMap(user => user.roles.length ? user.roles as Roles[] : [Roles.User]))];
        // const allRoles = await this.roleRepository.findAllByNames(allRoleNames,);

        // const users = usersData.map(userData => {
        //     const userRoles = userData.roles.length ? userData.roles : [Roles.User];
        //     const resolvedRoles = userRoles.map(roleName => {
        //         const foundRole = allRoles.find(role => role.name === roleName);
        //         return foundRole || { name: roleName as Roles };
        //     });


        //     const userWithRoles: IUser = {
        //         ...userData,
        //         roles: userData.roles,
        //         profilePicture: '',
        //         preferences: {
        //             notifications: true,
        //             theme: 'light',
        //             language: 'en'
        //         },
        //         enrolledCoursesIds: []
        //     };

        //     return userWithRoles;
        // });

        // const savedUsers: IUser[] = await this.userRepository.bulkCreate(users);
        // this.logger.info(`${savedUsers.length} users created successfully`);
        // return savedUsers;
        return [{} as IUser]
    }

    public async signIn(username: string, password: string): Promise<string> {
        if (!(username && password)) {
            throw new ClientError('Username and password are required');
        }
        const user = await this.userRepository.findByUsername(username, { populate: ['roles'] });
        if (!user) {
            throw new UnauthorizedError("Invalid credentials");
        }
        const isPasswordValid = await this.verifyPassword(user, password);
        if (!isPasswordValid) {
            throw new UnauthorizedError("Invalid credentials");
        }
        return this.generateToken(user);
    }

    public async getAllUsers(): Promise<IUser[]> {
        const users = await this.userRepository.findAll();
        if(!users)
            throw new NotFoundError('USre not found');
        // const { populate = [] } = options || {};
        // const course = await this.model.find().populate(populate).session(context!);
        // const courses = course ? course.map(c => this.toDomain(c)) : null;
        // return courses;


        this.logger.debug(`Retrieved ${users.length} users`);
        return users;
    }

    public async getUsersByRoles(roleNames: Roles[]): Promise<IUser[]> {
        try {
            const users = await this.userRepository.findByRoleNames(roleNames, { populate: ['roles'] });
            return users;
        } catch (error) {
            this.logger.error('Error fetching users by roles:', error);
            throw new Error('Failed to fetch users by roles');
        }
    }

    public async getUserById(userId: string): Promise<IUser> {
        const user = await this.userRepository.findById(userId, { populate: ['roles'] });
        if (!user) {
            this.logger.warn('Attempt to get non-existent user', { userId });
            throw new NotFoundError(`User with ID ${userId} not found`);
        }
        this.logger.debug('User retrieved by ID', { userId });
        return user;
    }

    public async getUserByUsername(username: string): Promise<IUser> {
        const user = await this.userRepository.findByUsername(username, { populate: ['roles'] });
        if (!user) {
            this.logger.warn('Attempt to get non-existent user by username', { username });
            throw new NotFoundError(`User with username ${username} not found`);
        }
        this.logger.debug('User retrieved by username', { username });
        return user;
    }

    public async updateUser(userId: string, updatedUserData: Partial<IUser>): Promise<IUser> {
        const existingUser = await this.userRepository.findById(userId, {});
        if (!existingUser) {
            throw new NotFoundError(`User with ID ${userId} not found`);
        }

        await this.validateUserDataForUpdate(updatedUserData, existingUser);
        if (updatedUserData.roles) {
            const roles = await this.getRoles(updatedUserData.roles as Roles[]);
            updatedUserData.roles = roles.map(r => r.name);
        }

        const updatedUser = await this.userRepository.update(userId, updatedUserData);
        if (!updatedUser) {
            this.logger.info('User unsuccessful update ', { userId });
            throw new NotFoundError(`User with ID ${userId} not found`);
        }
        this.logger.info('User updated successfully', { userId });
        return updatedUser;
    }

    public async deleteUser(userId: string): Promise<boolean> {
        const result = await this.userRepository.delete(userId);
        if (!result) {
            this.logger.warn('Attempt to delete non-existent user', { userId });
            throw new NotFoundError(`User with ID ${userId} not found`);
        }
        this.logger.info('User deleted successfully', { userId });
        return true;
    }

    //TO-Do: set db model to save new, so activate middleware for hashing
    public async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
        const user = await this.userRepository.findById(userId, {});
        if (!user) {
            throw new NotFoundError(`User with ID ${userId} not found`);
        }
        const isValidPassword = await bcrypt.compare(oldPassword, user.password);
        if (!isValidPassword) {
            throw new UnauthorizedError("Invalid old password");
        }
        if (!this.isStrongPassword(newPassword)) {
            throw new ClientError("New password does not meet strength requirements");
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.userRepository.update(userId, { password: hashedPassword });
        this.logger.info('User password changed successfully', { userId });
    }

    async enrollStudent(courseId: string, courseName: string, studentId: string): Promise<IUser> {
        // const course = await this.courseRepository.findById(courseId);
        // if (!course) {
        //     throw new NotFoundError('Course not found');
        // }
        const user = await this.userRepository.findById(studentId);
        if (!user) {
            throw new NotFoundError('User not found');
        }
        const courses = user.enrolledCoursesIds !== undefined ? [...user.enrolledCoursesIds] : [];
        const updatedUser = await this.userRepository.update(
            studentId,
            {
                enrolledStudents: [...courses, courseId]
            } as Partial<IUser>
        );
        if (!updatedUser)
            throw new NotFoundError('User not updated');

        return updatedUser;
    }






    private async validateUserData(userData: IUser): Promise<void> {
        if (!this.isValidEmail(userData.email)) {
            throw new ClientError('Invalid email format');
        }
        if (!this.isStrongPassword(userData.password)) {
            throw new ClientError('Password does not meet strength requirements');
        }
        const existingUser = await this.userRepository.findOne({
            $or: [{ email: userData.email }, { username: userData.username }]
        });
        if (existingUser) {
            throw new ClientError('User with this email or username already exists');
        }
    }

    private async validateUsers(usersData: IUser[]): Promise<void> {
        const emailsAndUsernames = usersData.map(user => ({ email: user.email, username: user.username }));
        const existingUsers = await this.userRepository.findByEmailsOrUsernames(emailsAndUsernames);
        if (existingUsers.length > 0) {
            const existingEmails = existingUsers.map(user => user.email);
            const existingUsernames = existingUsers.map(user => user.username);
            throw new ClientError(`Users with these emails or usernames already exist: ${existingEmails.join(', ')}, ${existingUsernames.join(', ')}`);
        }
    }

    private async validateUserDataForUpdate(updatedUserData: Partial<IUser>, existingUser: IUser): Promise<void> {
        if (updatedUserData.email && updatedUserData.email !== existingUser.email) {
            if (!this.isValidEmail(updatedUserData.email)) {
                throw new ClientError('Invalid email format');
            }
            const userWithSameEmail = await this.userRepository.findByEmail(updatedUserData.email);
            if (userWithSameEmail) {
                throw new ClientError('Email already in use');
            }
        }
        if (updatedUserData.username && updatedUserData.username !== existingUser.username) {
            const userWithSameUsername = await this.userRepository.findByUsername(updatedUserData.username);
            if (userWithSameUsername) {
                throw new ClientError('Username already in use');
            }
        }
    }

    private async getRoles(roleNames: Roles[], session?: any): Promise<IRole[]> {
        if (!roleNames || roleNames.length === 0) {
            this.logger.info('No roles specified, assigning default role');
            return [await this.getDefaultUserRole(session)];
        }
        const roles = await this.roleRepository.findAllByNames(roleNames, session);
        if (!roles || roles.length === 0) {
            throw new NotFoundError('Specified roles not found');
        }
        const foundRoleNames = roles.map(role => role.name);
        const missingRoles = roleNames.filter(name => !foundRoleNames.includes(name));
        if (missingRoles.length > 0) {
            this.logger.warn('Some specified roles not found', { missingRoles });
        }
        return roles;
    }

    private async getDefaultUserRole(session?: any): Promise<IRole> {
        try {
            let defaultRole = await this.roleRepository.findByName(Roles.User, session);
            if (!defaultRole) {
                defaultRole = await this.roleRepository.create({ name: Roles.User }, session);
                this.logger.info('Created new default user role', { roleName: defaultRole.name });
            }
            return defaultRole;
        } catch (error) {
            this.logger.error('Error in getDefaultUserRole:', error);
            throw new Error('Failed to get or create default role');
        }
    }

    private generateToken(user: IUser): string {
        try {
            return jwt.sign(
                {
                    id: user.id,
                    username: user.username,
                    roles: user.roles.map(role => role)
                },
                authConfig.JWT_SECRET,
                {
                    algorithm: 'HS256',
                    expiresIn: authConfig.JWT_EXPIRATION || '1h'
                }
            );
        } catch (error) {
            this.logger.error('Failed to generate token', { userId: user.id, error });
            throw new Error('Failed to generate token');
        }
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    private isStrongPassword(password: string): boolean {
        return password.length >= 8;
    }

    public async verifyPassword(user: IUser, password: string): Promise<boolean> {
        return bcrypt.compare(password, user.password);
    }
}

export default UserService;