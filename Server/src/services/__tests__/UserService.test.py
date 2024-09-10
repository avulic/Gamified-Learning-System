import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserService from '../../services/UserService';
import User from '../../models/User';
import Role, { IRoleDb, Roles } from '../../models/Role';
import { ClientError } from '../../models/app/Errors/ClientError';
import { NotFoundError } from '../../models/app/Errors/NotFoundError';
import { UnauthorizedError } from '../../models/app/Errors/UnauthorizedError';
import { IUser } from '../../models/User';
import { logger } from '../../utils/logger';
import { CustomError } from '../../models/app/Errors/CustomError';
import * as ModelMapper from '../../utils/ModelMapper';

jest.mock('../../utils/logger');
jest.mock('../../models/User');
jest.mock('../../models/Role');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../config/authConfig', () => ({
    authConfig: {
        secret: 'testsecret',
        expiresIn: '1h',
    }
}));
jest.mock('../../utils/ModelMapper');

describe('UserService', () => {
    let userService: UserService;

    beforeAll(async () => {
        userService = new UserService();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();

        // Mock mapUserToAppModel
        (ModelMapper.mapUserToAppModel as jest.Mock).mockImplementation((user) => ({
            id: user._id?.toString() || user.id || 'mock-id',
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            username: user.username,
            password: user.password,
            roles: user.roles?.map((role: any) => role.name) || [],
        }));

        userService = new UserService();
    });

    afterEach(async () => {
        jest.clearAllMocks(); // Clear mock call history
        jest.resetAllMocks(); // Reset mock implementations
    });

    afterAll(async () => {
        jest.restoreAllMocks(); // Restore original implementations
    });

    describe('createUser', () => {
        it('should create a user successfully with default role', async () => {
            const userData: IUser = {
                id: "",
                name: "test",
                lastName: "test",
                username: 'testuser',
                password: 'Password123!',
                email: 'test@example.com',
                roles: [],
            };

            const mockUser = {
                ...userData,
                _id: new Types.ObjectId(),
                save: jest.fn().mockResolvedValue({
                    ...userData,
                    _id: new Types.ObjectId(),
                    populate: jest.fn().mockResolvedValue({
                        ...userData,
                        _id: new Types.ObjectId(),
                        roles: [{ name: Roles.User }],
                    }),
                }),
            };

            (User as jest.MockedClass<typeof User>).mockImplementation(() => mockUser as any);
            (Role.findOne as jest.Mock).mockResolvedValue({ _id: new Types.ObjectId(), name: Roles.User });
            (User.findOne as jest.Mock).mockResolvedValue(null);

            const createdUser = await userService.createUser(userData);

            expect(createdUser).toBeDefined();
            expect(createdUser.name).toBe(userData.name);
            expect(createdUser.roles).toContain(Roles.User);
        });

        it('should throw ClientError for duplicate email', async () => {
            (User.findOne as jest.Mock)
                .mockResolvedValueOnce({ _id: new Types.ObjectId() }) // For email check
                .mockResolvedValueOnce(null); // For username check
            (Role.find as jest.Mock).mockResolvedValue([]); // Mock empty roles array

            const userData: IUser = {
                id: "",
                name: "Ante",
                lastName: "Vulic",
                username: 'avulic',
                password: 'Password123!',
                email: 'test@example.com',
                roles: [Roles.User],
            };

            await expect(userService.createUser(userData)).rejects.toThrow(ClientError);
        });

        it('should create a user with multiple specified roles', async () => {
            const userData: IUser = {
                id: "",
                name: "test",
                lastName: "test",
                username: 'testuser',
                password: 'Password123!',
                email: 'test@example.com',
                roles: [Roles.User, Roles.Admin],
            };

            const mockUser = {
                ...userData,
                _id: new Types.ObjectId(),
                save: jest.fn().mockResolvedValue({
                    ...userData,
                    populate: jest.fn().mockResolvedValue({
                        ...userData,
                        roles: [{ name: Roles.User }, { name: Roles.Admin }],
                    }),
                }),
            };

            (User as jest.MockedClass<typeof User>).mockImplementation(() => mockUser as any);
            (Role.find as jest.Mock).mockResolvedValue([
                { _id: new Types.ObjectId(), name: Roles.User },
                { _id: new Types.ObjectId(), name: Roles.Admin }
            ]);
            (User.findOne as jest.Mock)
                .mockResolvedValueOnce(null)  // For email check
                .mockResolvedValueOnce(null); // For username check

            const createdUser = await userService.createUser(userData);

            expect(createdUser.roles).toContain(Roles.User);
            expect(createdUser.roles).toContain(Roles.Admin);
        });

        it('should throw ClientError for invalid email format', async () => {
            const userData: IUser = {
                id: "",
                name: "test",
                lastName: "test",
                username: 'testuser',
                password: 'Password123!',
                email: 'invalidemail',
                roles: [],
            };

            await expect(userService.createUser(userData)).rejects.toThrow(ClientError);
        });

        it('should throw ClientError for weak password', async () => {
            const userData: IUser = {
                id: "",
                name: "test",
                lastName: "test",
                username: 'testuser',
                password: 'weak',
                email: 'test@example.com',
                roles: [],
            };

            await expect(userService.createUser(userData)).rejects.toThrow(ClientError);
        });

        it('should throw NotFoundError for non-existent role', async () => {
            const userData: IUser = {
                id: "",
                name: "test",
                lastName: "test",
                username: 'testuser',
                password: 'Password123!',
                email: 'test@example.com',
                roles: ['NonExistentRole' as Roles],
            };

            // Mock User.findOne to return null for both email and username checks
            (User.findOne as jest.Mock)
                .mockResolvedValueOnce(null)  // For email check
                .mockResolvedValueOnce(null); // For username check

            // Mock Role.find to return an empty array
            (Role.find as jest.Mock).mockResolvedValue([]);

            await expect(userService.createUser(userData)).rejects.toThrow(NotFoundError);
        });
    });

    describe('signIn', () => {
        it('should sign in a user successfully with case-sensitive username', async () => {
            const userId = new Types.ObjectId();
            const mockUser = {
                _id: userId,
                username: 'testUser',
                password: 'hashedPassword',
                roles: [{ name: Roles.User }],
                populate: jest.fn().mockResolvedValue({
                    _id: userId,
                    username: 'testUser',
                    password: 'hashedPassword',
                    roles: [{ name: Roles.User }],
                }),
            };

            (User.findOne as jest.Mock).mockImplementation(() => ({
                populate: jest.fn().mockResolvedValue(mockUser),
            }));

            (User.findById as jest.Mock).mockImplementation(() => ({
                populate: jest.fn().mockResolvedValue(mockUser),
            }));

            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue('token');

            const result = await userService.signIn('testUser', 'password');

            expect(result).toBe('token');
            expect(User.findOne).toHaveBeenCalledWith({ username: 'testUser' });
        });

        it('should throw NotFoundError for incorrect case username', async () => {
            (User.findOne as jest.Mock).mockResolvedValue(null);

            await expect(userService.signIn('TestUser', 'password')).rejects.toThrow(NotFoundError);
        });

        it('should throw UnauthorizedError for invalid password', async () => {
            const userId = new Types.ObjectId();
            const mockUser = {
                _id: userId,
                username: 'testUser',
                password: 'hashedPassword',
                roles: [{ name: Roles.User }],
                populate: jest.fn().mockResolvedValue({
                    _id: userId,
                    username: 'testUser',
                    password: 'hashedPassword',
                    roles: [{ name: Roles.User }],
                }),
            };

            (User.findOne as jest.Mock).mockImplementation(() => ({
                populate: jest.fn().mockResolvedValue(mockUser),
            }));

            (User.findById as jest.Mock).mockImplementation(() => ({
                populate: jest.fn().mockResolvedValue(mockUser),
            }));

            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(userService.signIn('testUser', 'wrongpassword')).rejects.toThrow(UnauthorizedError);
        });

        it('should throw NotFoundError for case-insensitive username in signIn', async () => {
            (User.findOne as jest.Mock).mockResolvedValue(null);
            (User.findById as jest.Mock).mockResolvedValue(null);
            await expect(userService.signIn('TESTUSER', 'password')).rejects.toThrow(NotFoundError);
        });

        it('should sign in a user successfully with case-sensitive username', async () => {
            const userId = new Types.ObjectId();
            const mockUser = {
                _id: userId,
                username: 'testUser',
                password: 'hashedPassword',
                roles: [{ name: Roles.User }],
                populate: jest.fn().mockResolvedValue({
                    _id: userId,
                    username: 'testUser',
                    password: 'hashedPassword',
                    roles: [{ name: Roles.User }],
                }),
            };

            (User.findOne as jest.Mock).mockImplementation(() => ({
                populate: jest.fn().mockResolvedValue(mockUser),
            }));

            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue('token');

            // Mock verifyPassword to return true for the test
            jest.spyOn(userService, 'verifyPassword').mockResolvedValue(true);

            const result = await userService.signIn('testUser', 'password');

            expect(result).toBe('token');
            expect(User.findOne).toHaveBeenCalledWith({ username: 'testUser' });
        });
    });

    describe('getAllUsers', () => {
        it('should return all users', async () => {
            const mockUsers = [
                { username: 'user1', name: 'User1', lastName: 'One', email: 'user1@example.com', roles: [Roles.User] },
                { username: 'user2', name: 'User2', lastName: 'Two', email: 'user2@example.com', roles: [Roles.User] }
            ];

            (User.find as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockUsers)
            });

            const allUsers = await userService.getAllUsers();

            expect(allUsers).toHaveLength(2);
            expect(allUsers[0].username).toBe('user1');
            expect(allUsers[1].username).toBe('user2');
        });
    });

    describe('getUserById', () => {
        it('should return user by id', async () => {
            const mockUser = {
                _id: new Types.ObjectId(),
                username: 'johndoe',
                name: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                roles: [Roles.User]
            };

            (User.findById as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockUser)
            });

            const foundUser = await userService.getUserById(mockUser._id.toString());

            expect(foundUser).toBeDefined();
            expect(foundUser.username).toBe('johndoe');
        });

        it('should throw NotFoundError for non-existent user id', async () => {
            (User.findById as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(null)
            });

            await expect(userService.getUserById('nonexistentid')).rejects.toThrow(NotFoundError);
        });
    });

    describe('updateUser', () => {

        it('should update user successfully', async () => {
            const mockUser = {
                _id: new Types.ObjectId(),
                name: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                username: 'johndoe',
                roles: [{ name: Roles.User }],
                save: jest.fn().mockResolvedValue(true),
                populate: jest.fn().mockReturnThis(),
            };

            (User.findById as jest.Mock).mockResolvedValue(mockUser);
            (User.findOne as jest.Mock).mockResolvedValue(null);

            const updatedUser = await userService.updateUser(mockUser._id.toString(), {
                name: 'Jane',
                lastName: 'Smith',
                email: 'jane@example.com'
            });

            expect(updatedUser.name).toBe('Jane');
            expect(updatedUser.lastName).toBe('Smith');
            expect(updatedUser.email).toBe('jane@example.com');
        });

        it('should throw CustomError when updating to existing email', async () => {
            const existingUser = {
                _id: new Types.ObjectId(),
                email: 'existing@example.com',
                save: jest.fn().mockRejectedValue(new Error('Duplicate key error')),
            };
            (User.findById as jest.Mock).mockResolvedValue(existingUser);
            (User.findOne as jest.Mock).mockResolvedValue({ _id: new Types.ObjectId() });

            await expect(userService.updateUser(existingUser._id.toString(), { email: 'existing@example.com' }))
                .rejects.toThrow(CustomError);
        });

        it('should not update password through updateUser method', async () => {
            const mockUser = {
                _id: new Types.ObjectId(),
                name: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                username: 'johndoe',
                password: 'oldpassword',
                roles: [{ name: Roles.User }],
                save: jest.fn().mockResolvedValue(true),
                populate: jest.fn().mockReturnThis(),
            };

            (User.findById as jest.Mock).mockResolvedValue(mockUser);
            (User.findOne as jest.Mock).mockResolvedValue(null);

            await userService.updateUser(mockUser._id.toString(), {
                name: 'Jane',
                password: 'newpassword'
            });

            expect(mockUser.password).toBe('oldpassword');
        });

        it('should update user roles', async () => {
            const userId = new Types.ObjectId();
            const mockUser = {
                _id: userId,
                username: 'testUser',
                password: 'hashedPassword',
                roles: [{ name: Roles.User }],
                save: jest.fn().mockResolvedValue({
                    _id: userId,
                    username: 'testUser',
                    password: 'hashedPassword',
                    roles: [{ name: Roles.User }, { name: Roles.Admin }],
                }),
                populate: jest.fn().mockResolvedValue({
                    _id: userId,
                    username: 'testUser',
                    password: 'hashedPassword',
                    roles: [{ name: Roles.User }, { name: Roles.Admin }],
                }),
            };

            (User.findById as jest.Mock).mockResolvedValue(mockUser);
            (Role.find as jest.Mock).mockResolvedValue([
                { _id: new Types.ObjectId(), name: Roles.User },
                { _id: new Types.ObjectId(), name: Roles.Admin }
            ]);

            const updatedUser = await userService.updateUser(userId.toString(), { roles: [Roles.User, Roles.Admin] });

            expect(updatedUser.roles.map(role => role)).toContain(Roles.User);
            expect(updatedUser.roles.map(role => role)).toContain(Roles.Admin);
        });
    });

    describe('deleteUser', () => {
        it('should delete user successfully', async () => {
            const mockUserId = new Types.ObjectId().toString();
            (User.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: mockUserId });

            const result = await userService.deleteUser(mockUserId);
            expect(result).toBe(true);
        });

        it('should throw NotFoundError when deleting non-existent user', async () => {
            const nonExistentId = new Types.ObjectId().toString();
            (User.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

            await expect(userService.deleteUser(nonExistentId)).rejects.toThrow(NotFoundError);
        });

        it('should throw ClientError for invalid user ID format', async () => {
            await expect(userService.deleteUser('invalidid')).rejects.toThrow(ClientError);
        });
    });

    describe('changePassword', () => {
        it('should change password successfully', async () => {
            const mockUser = {
                _id: new Types.ObjectId(),
                password: await bcrypt.hash('oldpassword', 10),
                save: jest.fn().mockResolvedValue(true)
            };
            (User.findById as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            await expect(userService.changePassword(mockUser._id.toString(), 'oldpassword', 'NewPassword123!')).resolves.not.toThrow();
            expect(mockUser.save).toHaveBeenCalled();
        });

        it('should throw UnauthorizedError for incorrect old password', async () => {
            const mockUser = {
                _id: new Types.ObjectId(),
                password: await bcrypt.hash('correctpassword', 10),
            };
            (User.findById as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(userService.changePassword(mockUser._id.toString(), 'wrongpassword', 'NewPassword123!')).rejects.toThrow(UnauthorizedError);
        });
        it('should throw ClientError for weak new password', async () => {
            const mockUser = {
                _id: new Types.ObjectId(),
                password: await bcrypt.hash('oldpassword', 10),
            };
            (User.findById as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            await expect(userService.changePassword(mockUser._id.toString(), 'oldpassword', 'weak')).rejects.toThrow(ClientError);
        });
    });

    describe('verifyPassword', () => {    
        it('should return true for correct password', async () => {
            const userId = new Types.ObjectId().toString();
            const mockUser = {
                _id: userId,
                username: 'testUser',
                password: 'hashedPassword'
            };
    
            (User.findById as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    
            const result = await userService.verifyPassword(userId, 'correctPassword');
            
            expect(User.findById).toHaveBeenCalledWith(userId);
            expect(bcrypt.compare).toHaveBeenCalledWith('correctPassword', 'hashedPassword');
            expect(result).toBe(true);
        });
    
        it('should return false for incorrect password', async () => {
            const userId = new Types.ObjectId().toString();
            const mockUser = {
                _id: userId,
                username: 'testUser',
                password: 'hashedPassword',
                roles: [{ name: Roles.User }],
            };
    
            (User.findById as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    
            const result = await userService.verifyPassword(userId, 'wrongPassword');
            
            expect(User.findById).toHaveBeenCalledWith(userId);
            expect(bcrypt.compare).toHaveBeenCalledWith('wrongPassword', 'hashedPassword');
            expect(result).toBe(false);
        });
    
        it('should throw NotFoundError for non-existent user', async () => {
            const userId = new Types.ObjectId().toString();
            (User.findById as jest.Mock).mockResolvedValue(null);
    
            await expect(userService.verifyPassword(userId, 'anyPassword'))
                .rejects.toThrow(NotFoundError);
            
            expect(User.findById).toHaveBeenCalledWith(userId);
        });
    });

    describe('createUsers', () => {
        it('should create multiple users successfully', async () => {
            const usersData: IUser[] = [
                {
                    id: "",
                    name: "User1",
                    lastName: "Test1",
                    username: 'user1',
                    password: 'Password123!',
                    email: 'user1@example.com',
                    roles: [],
                },
                {
                    id: "",
                    name: "User2",
                    lastName: "Test2",
                    username: 'user2',
                    password: 'Password123!',
                    email: 'user2@example.com',
                    roles: [],
                }
            ];

            const mockUsers = usersData.map(userData => ({
                ...userData,
                _id: new Types.ObjectId(),
                roles: [{ name: Roles.User }],
            }));

            (User.insertMany as jest.Mock).mockResolvedValue(mockUsers);
            (Role.findOne as jest.Mock).mockResolvedValue({ _id: new Types.ObjectId(), name: Roles.User });

            const createdUsers = await userService.createUsers(usersData);

            expect(createdUsers).toHaveLength(2);
            expect(createdUsers[0].name).toBe("User1");
            expect(createdUsers[1].name).toBe("User2");
            expect(createdUsers[0].roles).toContain(Roles.User);
            expect(createdUsers[1].roles).toContain(Roles.User);
        });
    });

    describe('getUserByUsername', () => {
        it('should get user by username successfully', async () => {
            const userId = new Types.ObjectId();
            const mockUserDb = {
                _id: userId,
                name: "Test",
                lastName: "User",
                email: "test@example.com",
                username: "testuser",
                password: "hashedpassword",
                populate: jest.fn().mockResolvedValue({
                    _id: userId,
                    name: "Test",
                    lastName: "User",
                    email: "test@example.com",
                    username: "testuser",
                    password: "hashedpassword",
                    roles: [{ name: Roles.User }],
                }),
            };

            const mockUserApp: IUser = {
                id: userId.toString(),
                name: "Test",
                lastName: "User",
                email: "test@example.com",
                username: "testuser",
                password: "hashedpassword",
                roles: [Roles.User],
            };

            (User.findOne as jest.Mock).mockResolvedValue(mockUserDb);
            (ModelMapper.mapUserToAppModel as jest.Mock).mockReturnValue(mockUserApp);

            const user = await userService.getUserByUsername("testuser");

            expect(user).toEqual(mockUserApp);
            expect(User.findOne).toHaveBeenCalledWith({ username: "testuser" });
            expect(mockUserDb.populate).toHaveBeenCalledWith('roles');
            expect(ModelMapper.mapUserToAppModel).toHaveBeenCalledWith(expect.objectContaining({
                _id: userId,
                name: "Test",
                lastName: "User",
                email: "test@example.com",
                username: "testuser",
                password: "hashedpassword",
                roles: [{ name: Roles.User }],
            }));
        });

        it('should throw NotFoundError for non-existent username', async () => {
            (User.findOne as jest.Mock).mockResolvedValue(null);

            await expect(userService.getUserByUsername('nonexistent')).rejects.toThrow(NotFoundError);
        });
    });
});