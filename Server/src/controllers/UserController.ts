'use Strict'
import { Request, Response } from 'express';
import UserService from '../services/UserService';
import Logger from '../utils/logger';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/types';
import { CreateUserDto, UserResponseDto } from '@/models/dto';
import { UserMapper } from '@/utils/ModelMapper';
import { IUser } from '@/models/app';
import { Roles } from '@/models/enums';

@injectable()
class UserController {
    constructor(
        @inject(TYPES.UserService) private userService: UserService,
        @inject(TYPES.Logger) private logger: Logger
    ) { }

    public createUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const requestDTO: CreateUserDto = req.body;
            const newUser: IUser = UserMapper.createDtoToDomain(requestDTO);

            const createdUser: IUser = await this.userService.createUser(newUser);
            const response: UserResponseDto = UserMapper.toResponseDto(createdUser);

            res.status(201).json(response);
        } catch (err) {
            res.status(500).json({ error: 'Failed to create user' + err });
        }
    }

    //TO-DO: dont return all users
    public createUsers = async (req: Request, res: Response): Promise<void> => {
        try {
            const requestDTO: CreateUserDto[] = req.body;
            const newUsers: IUser[] = requestDTO.map(UserMapper.createDtoToDomain);

            const createdUsers: IUser[] = await this.userService.createUsers(newUsers);
            const response: UserResponseDto[] = createdUsers.map(UserMapper.toResponseDto);

            res.status(20).json(response);
        } catch (err) {
            res.status(500).json({ error: 'Failed to create users' + err });
        }
    }

    public getAllUsers = async (req: Request, res: Response): Promise<void> => {
        try {
            const users: IUser[] = await this.userService.getAllUsers();
            const response: UserResponseDto[] = users.map(UserMapper.toResponseDto);
            
            res.status(200).json(response);
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    }

    public getUsersByRoles = async (req: Request, res: Response): Promise<void> => {
        try {
            const roles = req.query.roles;

            // Check if roles is present and is an array
            if (!roles || !Array.isArray(roles)) {
                res.status(400).json({ error: 'Roles must be provided as an array' });
                return;
            }

            // Validate each role against the Roles enum
            const validatedRoles: Roles[] = [];
            for (const role of roles) {
                if (typeof role !== 'string') {
                    res.status(400).json({ error: 'Each role must be a string' });
                    return;
                }

                if (!(role in Roles)) {
                    res.status(400).json({ error: `Invalid role: ${role}` });
                    return;
                }

                validatedRoles.push(Roles[role as keyof typeof Roles]);
            }

            const users: IUser[] = await this.userService.getUsersByRoles(validatedRoles);
            const response: UserResponseDto[] = users.map(UserMapper.toResponseDto);

            res.status(200).json(response); 

        } catch (err) {
            console.error('Error fetching users by roles:', err);
            res.status(500).json({ error: 'Failed to fetch users by roles' });
        }
    }

    public getUserById = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.params.id;
            const user: IUser = await this.userService.getUserById(userId);
            // if (!user) {
            //     res.status(404).json({ error: 'User not found' });
            //     return;
            // }
            const response: UserResponseDto = UserMapper.toResponseDto(user);

            res.status(200).json(response);
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch user' });
        }
    }

    public updateUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.params.id;
            const updatedUserData: Partial<IUser> = req.body;
            const updatedUser = await this.userService.updateUser(userId, updatedUserData);

            const response: UserResponseDto = UserMapper.toResponseDto(updatedUser);

            res.status(200).json(response);
        } catch (err) {
            res.status(500).json({ error: 'Failed to update user' });
        }
    }

    public deleteUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.params.id;
            const userDeleted = await this.userService.deleteUser(userId);

            if (!userDeleted) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (err) {
            res.status(500).json({ error: 'Failed to delete user' });
        }
    }


    public signInUser = async (req: Request, res: Response) => {
        try {
            const { username, password } = req.body;

            const userSigned = await this.userService.signIn(username, password);

            if (!userSigned) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }
            res.status(200).json(userSigned);
        } catch (e) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
    };

    public signUpUser = async (req: Request, res: Response) => {
        this.createUser(req, res);
    };

}

export default UserController;
