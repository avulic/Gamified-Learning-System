import { IRole, IRoleDb, Roles } from '../models/Role';
import Role from '../models/Role';
import { IUser, IUserDb } from '../models/User';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config/authConfig';
import { logger } from '../utils/logger';
import { Error, Types } from 'mongoose';
import { ClientError } from '../models/Errors/ClientError';
import { CustomError } from '../models/Errors/CustomError';
import { NotFoundError } from '../models/Errors/NotFoundError';
import { UnauthorizedError } from '../models/Errors/UnauthorizedError';
import { mapUserToAppModel, mapRoleToAppModel } from '../utils/ModelMapper';
import { MongoError } from 'mongodb';

class UserService {
    public async createUser(user: IUser): Promise<IUser> {
        await this.isValidUserData(user);

        try {
            const newUser = await this.makeNewUser(user);

            if (!newUser) {
                throw new Error("Failed to create new user object");
            }
            const savedUser = await newUser.save();
            const populatedUser = await savedUser.populate('roles');

            logger.info('User created successfully', { userId: savedUser._id });
            const mappedUser = mapUserToAppModel(populatedUser);

            return mappedUser;
        } catch (error) {
            throw error;
        }
    }

    public async createUsers(users: IUser[]): Promise<IUser[]> {
        const newUsers = await Promise.all(users.map(user => this.makeNewUser(user)));
        const savedUsers = await User.insertMany(newUsers);
        logger.info(`${savedUsers.length} users created successfully`);
        return savedUsers.map(user => mapUserToAppModel(user));
    }

    public async signIn(username: string, password: string): Promise<string> {
        if (!(username && password)) {
            throw new ClientError('Username and password are required');
        }
        const user = await this.getUserByUsername(username);
        const isPasswordValid = await this.verifyPassword(user.id, password);

        if (!isPasswordValid) {
            throw new UnauthorizedError("Invalid credentials");
        }

        const token = this.generateToken(user);

        return token;
    }

    public async getAllUsers(): Promise<IUser[]> {
        const users = await User.find().populate('roles');
        logger.debug(`Retrieved ${users.length} users`);
        return users.map(user => mapUserToAppModel(user));
    }

    public async getUserById(userId: string): Promise<IUser> {
        if (!Types.ObjectId.isValid(userId)) {
            throw new NotFoundError("Invalid user ID");
        }

        const user = await User.findById(userId).populate('roles');
        if (!user) {
            logger.warn('Attempt to get non-existent user', { userId });
            throw new NotFoundError(`User with ID ${userId} not found`);
        }

        logger.debug('User retrieved by ID', { userId });
        return mapUserToAppModel(user);
    }
    public async getUserByUsername(username: string): Promise<IUser> {
        const user = await User.findOne({ username });

        if (!user) {
            logger.warn('Attempt to get non-existent user by username', { username });
            throw new NotFoundError(`User with username ${username} not found`);
        }

        const populatedUser = await user.populate('roles');
    
        logger.debug('User retrieved by username', { username });
        return mapUserToAppModel(populatedUser);
    }

    public async updateUser(userId: string, updatedUserData: Partial<IUser>): Promise<IUser> {
        if (!Types.ObjectId.isValid(userId)) {
            throw new ClientError('Invalid user ID');
        }

        const existingUser = await User.findById(userId);
        if (!existingUser) {
            logger.warn('Attempt to update non-existent user', { userId });
            throw new NotFoundError('User not found');
        }

        // Check for unique email and username
        if (updatedUserData.email && updatedUserData.email !== existingUser.email) {
            const userWithSameEmail = await User.findOne({ email: updatedUserData.email });
            if (userWithSameEmail) {
                throw new ClientError('Email already in use');
            }
        }

        if (updatedUserData.username && updatedUserData.username !== existingUser.username) {
            const userWithSameUsername = await User.findOne({ username: updatedUserData.username });
            if (userWithSameUsername) {
                throw new ClientError('Username already in use');
            }
        }

        // Handle role updates
        if (updatedUserData.roles && updatedUserData.roles.length > 0) {
            try {
                const roles = await this.getRoles(updatedUserData.roles);
                existingUser.roles = roles.map(role => role._id);
            } catch (error) {
                logger.error('Error updating user roles', { userId, error });
                throw new ClientError('Invalid roles provided' + (error as Error).message.toString());
            }
        }

        // Exclude password and id from being updated
        const { password, id, roles, ...updateData } = updatedUserData;

        // Type-safe update of fields
        (Object.keys(updateData) as Array<keyof typeof updateData>).forEach(key => {
            if (updateData[key] !== undefined) {
                (existingUser as any)[key] = updateData[key];
            }
        });

        try {
            existingUser.isNew = false;
            await existingUser.save();
            logger.info('User updated successfully', { userId });
    
            const updatedUser = await existingUser.populate('roles');
            return mapUserToAppModel(updatedUser);
        } catch (error) {
            logger.error('Error saving updated user', { userId, error });
            throw new CustomError('Failed to update user', + (error as Error).message.toString());
        }
    }


    public async deleteUser(userId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(userId)) {
            throw new ClientError("Invalid user ID");
        }

        const result = await User.findByIdAndDelete(userId);

        if (!result) {
            logger.warn('Attempt to delete non-existent user', { userId });
            throw new NotFoundError(`User with ID ${userId} not found`);
        }
        logger.info('User deleted successfully', { userId });
        return true;
    }

    public async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
        const user = await User.findById(userId);
        if (!user) {
            logger.warn('Attempt to change password for non-existent user', { userId });
            throw new NotFoundError(`User with ID ${userId} not found`);
        }

        logger.info('Comparing old password', { userId });
        const passwordIsValid = await bcrypt.compare(oldPassword, user.password);
        logger.info('Old password comparison result', { userId, isValid: passwordIsValid });

        if (!passwordIsValid) {
            logger.warn('Attempt to change password with invalid old password', { userId });
            throw new UnauthorizedError("Invalid old password");
        }

        if (!this.isStrongPassword(newPassword)) {
            logger.warn('Attempt to set weak password', { userId });
            throw new ClientError("New password does not meet strength requirements");
        }

        user.password = newPassword;

        try {
            await user.save();

        } catch {
            logger.info('User password changed successfully', { userId });
            throw new CustomError("Error saving user", 500);

        }
        logger.info('User password changed successfully', { userId });
    }




    private async makeNewUser(user: IUser): Promise<IUserDb | undefined> {
        const { id, roles: roleNames, ...userData } = user;
        const roles = await this.getRoles(roleNames);

        const newUser = new User({
            ...userData,
            roles: roles.map(role => role._id),
        });

        return newUser;

    }

    private async getRoles(roleNames: string[] | null | undefined): Promise<IRoleDb[]> {
        if (!Array.isArray(roleNames) || roleNames.length === 0) {
            logger.info('No roles specified, assigning default role');
            return this.getDefaultUserRole();
        }

        logger.info('Searching for roles:', { roleNames });
        const roles = await Role.find({ name: { $in: roleNames } });
        logger.info('Found roles:', { roles: roles.map(r => r.name) });

        if (!roles || roles.length === 0) {
            logger.warn('No roles found');
            throw new NotFoundError('Specified roles not found');
        }

        const foundRoleNames = roles.map(role => role.name);
        const missingRoles = roleNames.filter(name => !foundRoleNames.includes(name as Roles));
        if (missingRoles.length > 0) {
            logger.warn('Some specified roles not found', { missingRoles });
        }

        return roles;
    }

    private async getDefaultUserRole(): Promise<IRoleDb[]> {
        try {
            const defaultRole = await Role.findOne({ name: Roles.User });
            if (!defaultRole) {
                logger.error('Default user role not found');
                // Instead of throwing an error, let's create the default role
                const newDefaultRole = await Role.create({ name: Roles.User });
                logger.info('Created new default user role', { roleId: newDefaultRole._id });
                return [newDefaultRole];
            }
            logger.info('Retrieved default user role', { roleId: defaultRole._id });
            return [defaultRole];
        } catch (error) {
            logger.error('Error in getDefaultUserRole:', error);
            throw new CustomError('Failed to get or create default role', 500);
        }
    }

    private generateToken(user: IUser): string {
        try {
            return jwt.sign(
                {
                    id: user.id,
                    username: user.username,
                    roles: user.roles.map((role: Roles) => role)
                },
                authConfig.JWT_SECRET,
                {
                    algorithm: 'HS256',
                    expiresIn: authConfig.JWT_EXPIRATION || '1h'
                }
            );
        } catch (error) {
            logger.error('Failed to generate token', { userId: user.id, error });
            throw new CustomError('Failed to generate token');
        }
    }

    private async isValidUserData(user: IUser): Promise<boolean> {
        if (Array.isArray(user)) {
            throw new ClientError("Array input is not accepted. Please provide a single user object.");
        }
        if (typeof user !== 'object' || user === null) {
            throw new ClientError("Invalid input. Please provide a valid user object.");
        }
        if (!user.name || !user.lastName || !user.email || !user.username || !user.password) {
            logger.error("Error creating user", user);
            throw new ClientError("Missing required user fields");
        }
        if (!await this.isUniqEmail(user.email)) {
            throw new ClientError("Email exists");
        }
        if (user.roles && user.roles.length > 0) {
            const roles = await this.getRoles(user.roles);
            if (roles.length === 0) {
                throw new NotFoundError("Specified roles not found");
            }
        }
       
        if (!this.isValidEmail(user.email)) {
            throw new ClientError("Invalid email format");
        }
        if (!await this.isUniqUsername(user.username)) {
            throw new ClientError("Username exists");
        }
        if (!this.isStrongPassword(user.password)) {
            throw new ClientError("Password does not meet strength requirements");
        }

        return true;
    }

    private async isUniqEmail(email: string): Promise<boolean> {
        const user = await User.findOne({ email });
        return !user;
    }

    private async isUniqUsername(username: string): Promise<boolean> {
        const user = await User.findOne({ username });
        return !user;
    }

    private isValidEmail(email: string): boolean {
        // Add email validation logic
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    private isStrongPassword(password: string): boolean {
        // Add password strength validation logic
        return password.length >= 8; // Simplified check for demonstration
    }

    public async verifyPassword(userId: string, password: string): Promise<boolean> {
        const user = await User.findById(userId);
        if (!user) {
            throw new NotFoundError(`User with ID ${userId} not found`);
        }
        return bcrypt.compare(password, user.password);
    }
}

export default UserService;