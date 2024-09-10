import { connect, closeDatabase, clearDatabase } from '../../test/setup';
import UserService from '../UserService';
import User from '../../models/User';
import Role, { Roles, IRole } from '../../models/Role';
import { IUser } from '../../models/User';
import { ClientError } from '../../models/app/Errors/ClientError';
import { NotFoundError } from '../../models/app/Errors/NotFoundError';
import { UnauthorizedError } from '../../models/app/Errors/UnauthorizedError';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { logger } from '../../utils/logger';
import { IsAny } from 'mongodb';

jest.mock('../../utils/logger');

describe('UserService Integration Tests', () => {
    let userService: UserService;

    beforeAll(async () => {
        await connect();
        userService = new UserService();

        // Check and recreate roles if they don't exist
        for (const role of Object.values(Roles)) {
            const existingRole = await Role.findOne({ name: role });
            if (!existingRole) {
                await Role.create({ name: role });
            }
        }
    });

    beforeEach(async () => {
        
        userService = new UserService();
    });

    afterEach(async () => {
        await User.deleteMany({});
    });

    afterAll(async () => {
        await clearDatabase ();
        await closeDatabase();

    });

    describe('createUser', () => {
        it('should assign default role when no roles are specified', async () => {
            const userData: IUser = {
                id: "",
                name: "John",
                lastName: "Doe",
                username: 'johndoe',
                password: 'Password123!',
                email: 'john@example.com',
                roles: [],
            };

            const createdUser = await userService.createUser(userData);

            expect(createdUser.roles).toHaveLength(1);
            expect(createdUser.roles[0]).toBe(Roles.User);

            // Verify in the database
            const userInDb = await User.findById(createdUser.id).populate('roles');
            expect(userInDb?.roles).toHaveLength(1);
            expect((userInDb?.roles[0] as IRole).name).toBe(Roles.User);
        });
        it('should create a user successfully with default role', async () => {
            const userData: IUser = {
                id: "",
                name: "John",
                lastName: "Doe",
                username: 'johndoe',
                password: 'Password123!',
                email: 'john@example.com',
                roles: [],
            };

            const createdUser = await userService.createUser(userData);

            expect(createdUser).toBeDefined();
            expect(createdUser.name).toBe(userData.name);
            expect(createdUser.lastName).toBe(userData.lastName);
            expect(createdUser.email).toBe(userData.email);
            expect(createdUser.username).toBe(userData.username);
            expect(createdUser.roles).toContainEqual(Roles.User);

            // Check if the user is actually in the database
            const userInDb = await User.findOne({ email: userData.email }).populate('roles');
            expect(userInDb).toBeDefined();
            expect(userInDb!.roles[0].name).toBe(Roles.User);
        });

        it('should create a user with specified roles', async () => {
            const userData: IUser = {
                id: "",
                name: "John",
                lastName: "Doe",
                username: 'johndoe',
                password: 'Password123!',
                email: 'john@example.com',
                roles: [Roles.User, Roles.Admin],
            };

            const createdUser = await userService.createUser(userData);

            expect(createdUser.roles).toContain(Roles.User);
            expect(createdUser.roles).toContain(Roles.Admin);

            // Check if the user is actually in the database with correct roles
            const userInDb = await User.findOne({ email: userData.email }).populate('roles');
            expect(userInDb).toBeDefined();
            const roleNames = userInDb!.roles.map((role: IRole) => role.name);
            
            expect(roleNames).toContain(Roles.User);
            expect(roleNames).toContain(Roles.Admin);
        });

        it('should throw ClientError for duplicate email', async () => {
            const userData: IUser = {
                id: "",
                name: "John",
                lastName: "Doe",
                username: 'johndoe',
                password: 'Password123!',
                email: 'john@example.com',
                roles: [],
            };

            await userService.createUser(userData);
            await expect(userService.createUser(userData)).rejects.toThrow(ClientError);
        });
    });

    describe('signIn', () => {
        it('should sign in a user successfully', async () => {
            const userData: IUser = {
                id: "",
                name: "John",
                lastName: "Doe",
                username: 'johndoe',
                password: 'Password123!',
                email: 'john@example.com',
                roles: [],
            };

            await userService.createUser(userData);

            const token = await userService.signIn(userData.username, userData.password);

            expect(typeof token).toBe('string');
            expect(token).not.toBe('');
        });

        it('should throw NotFoundError for non-existent user', async () => {
            await expect(userService.signIn('nonexistent', 'password')).rejects.toThrow(NotFoundError);
        });

        it('should throw UnauthorizedError for incorrect password', async () => {
            const userData: IUser = {
                id: "",
                name: "John",
                lastName: "Doe",
                username: 'johndoe',
                password: 'Password123!',
                email: 'john@example.com',
                roles: [],
            };

            await userService.createUser(userData);

            await expect(userService.signIn(userData.username, 'wrongpassword')).rejects.toThrow(UnauthorizedError);
        });
    });

    describe('getAllUsers', () => {
        it('should return all users', async () => {
            const userData1: IUser = {
                id: "",
                name: "John",
                lastName: "Doe",
                username: 'johndoe',
                password: 'Password123!',
                email: 'john@example.com',
                roles: [],
            };

            const userData2: IUser = {
                id: "",
                name: "Jane",
                lastName: "Doe",
                username: 'janedoe',
                password: 'Password123!',
                email: 'jane@example.com',
                roles: [],
            };

            await userService.createUser(userData1);
            await userService.createUser(userData2);

            const allUsers = await userService.getAllUsers();

            expect(allUsers).toHaveLength(2);
            expect(allUsers[0].username).toBe('johndoe');
            expect(allUsers[1].username).toBe('janedoe');
        });
    });

    describe('updateUser', () => {
        it('should update user successfully', async () => {
            const userData: IUser = {
                id: "",
                name: "John",
                lastName: "Doe",
                username: 'johndoe',
                password: 'Password123!',
                email: 'john@example.com',
                roles: [],
            };

            const createdUser = await userService.createUser(userData);

            const updatedUser = await userService.updateUser(createdUser.id, {
                name: 'Jane',
                lastName: 'Smith',
            });

            expect(updatedUser.name).toBe('Jane');
            expect(updatedUser.lastName).toBe('Smith');
            expect(updatedUser.email).toBe(userData.email);
            expect(updatedUser.username).toBe(userData.username);
        });

        it('should throw NotFoundError for non-existent user', async () => {
            const nonExistentId = new Types.ObjectId().toString();
            await expect(userService.updateUser(nonExistentId, { name: 'New Name' }))
                .rejects.toThrow(NotFoundError);
        });

        it('should update user roles', async () => {
            const userData: IUser = {
                id: "",
                name: "John",
                lastName: "Doe",
                username: 'johndoe',
                password: 'Password123!',
                email: 'john@example.com',
                roles: [Roles.User],
            };

            const createdUser = await userService.createUser(userData);

            const updatedUser = await userService.updateUser(createdUser.id, {
                roles: [Roles.User, Roles.Admin]
            });

            expect(updatedUser.roles).toContain(Roles.User);
            expect(updatedUser.roles).toContain(Roles.Admin);

            // Verify in the database
            const userInDb = await User.findById(createdUser.id).populate('roles');
            const roleNames = userInDb!.roles.map((role: IRole) => role.name);
            expect(roleNames).toContain(Roles.User);
            expect(roleNames).toContain(Roles.Admin);
        });
    });

    describe('deleteUser', () => {
        it('should delete user successfully', async () => {
            const userData: IUser = {
                id: "",
                name: "John",
                lastName: "Doe",
                username: 'johndoe',
                password: 'Password123!',
                email: 'john@example.com',
                roles: [],
            };

            const createdUser = await userService.createUser(userData);

            await expect(userService.deleteUser(createdUser.id)).resolves.toBe(true);

            await expect(userService.getUserById(createdUser.id)).rejects.toThrow(NotFoundError);
        });

        it('should throw NotFoundError when deleting non-existent user', async () => {
            const nonExistentId = new Types.ObjectId().toString();
            await expect(userService.deleteUser(nonExistentId)).rejects.toThrow(NotFoundError);
        });
    });

    describe('changePassword', () => {
        it('should change password successfully', async () => {
            const userData: IUser = {
                id: "",
                name: "John",
                lastName: "Doe",
                username: 'johndoe',
                password: 'Password123!',
                email: 'john@example.com',
                roles: [],
            };
        
            const createdUser = await userService.createUser(userData);
        
            // Verify initial password works
            await expect(userService.signIn(userData.username, 'Password123!')).resolves.toBeDefined();
        
            await userService.changePassword(createdUser.id, 'Password123!', 'NewPassword123!');
        
            // Verify that the old password no longer works
            await expect(userService.signIn(userData.username, 'Password123!')).rejects.toThrow(UnauthorizedError);
        
            // Verify that the new password works for sign in
            const token = await userService.signIn(userData.username, 'NewPassword123!');
            expect(typeof token).toBe('string');
            expect(token).not.toBe('');
        
            // Verify the user in the database
            const userInDb = await User.findById(createdUser.id).select('+password');
            const newPasswordIsValid = await bcrypt.compare('NewPassword123!', userInDb!.password);
            expect(newPasswordIsValid).toBe(true);
        });

        it('should throw UnauthorizedError for incorrect old password', async () => {
            const userData: IUser = {
                id: "",
                name: "John",
                lastName: "Doe",
                username: 'johndoe',
                password: 'Password123!',
                email: 'john@example.com',
                roles: [],
            };

            const createdUser = await userService.createUser(userData);

            await expect(userService.changePassword(createdUser.id, 'WrongPassword', 'NewPassword123!')).rejects.toThrow(UnauthorizedError);
        });
    });
});