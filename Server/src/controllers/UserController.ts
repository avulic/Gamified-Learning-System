
import { NextFunction, Request, Response } from 'express';
import UserService from '../services/UserService';
import Logger from '../utils/logger';
import { inject, injectable } from 'inversify';
import { ILogger, TYPES } from '@/types';
import { } from '@/models/dto';

import { Course, User } from '@/models/app';
import { Roles } from '@/models/enums';
import { CreateUserDto } from '@/models/dto/request';
import { UserResponseDto } from '@/models/dto/response';
import { userMapper } from '@/utils/mapper/autoMapper';
@injectable()
class UserController {
    constructor(
        @inject(TYPES.UserService) private userService: UserService,
        @inject(TYPES.Logger) private logger: ILogger
    ) { }

    public createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const requestDTO: CreateUserDto = req.body;
            const newUser: User = userMapper.fromRequest(requestDTO);

            const createdUser: User = await this.userService.createUser(newUser);
            const response: UserResponseDto = createdUser as unknown as UserResponseDto;

            res.status(201).json(response);
        } catch (err) {
            next(err);
        }
    }

    //TO-DO: dont return all users
    public createUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const requestDTO: CreateUserDto[] = req.body;
            const newUsers: User[] = requestDTO as unknown as User[];

            const createdUsers: User[] = await this.userService.createUsers(newUsers);
            const response: UserResponseDto[] = createdUsers as unknown as UserResponseDto[];

            res.status(20).json(response);
        } catch (err) {
            next(err);
        }
    }

    public getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const users: User[] = await this.userService.getAllUsers();
            const response: UserResponseDto[] = users as unknown as UserResponseDto[];

            res.status(200).json(response);
        } catch (err) {
            next(err);
        }
    }

    public getUsersByRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

            const users: User[] = await this.userService.getUsersByRoles(validatedRoles);
            const response: UserResponseDto[] = users as unknown as UserResponseDto[];

            res.status(200).json(response);

        } catch (err) {
            console.error('Error fetching users by roles:', err);
            next(err);
        }
    }

    public getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.params.id;
            const user: User = await this.userService.getUserById(userId);
            // if (!user) {
            //     res.status(404).json({ error: 'User not found' });
            //     return;
            // }


            res.status(200).json(user);
        } catch (err) {
            next(err);
        }
    }

    public getUserEnrolledCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.params.userId;
            const user: Course[] = await this.userService.getUserEnrolledCourses(userId);

            res.status(200).json(user);
        } catch (err) {
            console.error('Error fetching users by roles:', err);
            next(err);
        }
    }

    public updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.params.id;
            const updatedUserDto: CreateUserDto = req.body;
            const user = userMapper.fromRequest(updatedUserDto);
            const updatedUser = await this.userService.updateUser(userId, user);

            const response: UserResponseDto = updatedUser as unknown as UserResponseDto;

            res.status(200).json(response);
        } catch (err) {
            next(err);
        }
    }

    public deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.params.id;
            const userDeleted = await this.userService.deleteUser(userId);

            if (!userDeleted) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (err) {
            next(err);
        }
    }
}

export default UserController;
