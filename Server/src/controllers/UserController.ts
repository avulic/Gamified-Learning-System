'use Strict'
import { Request, Response } from 'express';
import UserService from '../services/UserService';
import { IUser } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config/authConfig';
import logger from '../config/loggerConfig';

class UserController {
    private userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    // Function to create a new user
    public createUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const newUser: IUser = req.body;
            const createdUser = await this.userService.createUser(newUser);
            res.status(201).json(createdUser);
        } catch (err) {
            res.status(500).json({ error: 'Failed to create user' + err });
        }
    }

    // Function to create a new users
    public createUsers = async (req: Request, res: Response): Promise<void> => {
        try {
            const newUsers: IUser[] = req.body;
            console.log(req.body)
            const createdUsers = await this.userService.createUsers(newUsers);
            res.status(201).json(createdUsers);
        } catch (err) {
            res.status(500).json({ error: 'Failed to create users' + err });
        }
    }

    // Function to get all users
    public getAllUsers = async (req: Request, res: Response): Promise<void> => {
        try {
            const users = await this.userService.getAllUsers();
            res.status(200).json(users);
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    }

    // Function to get a user by ID
    public getUserById = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.params.id;
            const user = await this.userService.getUserById(userId);
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.status(200).json(user);
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch user' });
        }
    }

    // Function to update a user
    public updateUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.params.id;
            const updatedUserData: IUser = req.body;
            const updatedUser = await this.userService.updateUser(userId, updatedUserData);
            if (!updatedUser) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.status(200).json(updatedUser);
        } catch (err) {
            res.status(500).json({ error: 'Failed to update user' });
        }
    }

    // Function to delete a user
    public deleteUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.params.id;
            const deletedUser = await this.userService.deleteUser(userId);

            if (!deletedUser) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.status(200).json(deletedUser);
        } catch (err) {
            res.status(500).json({ error: 'Failed to delete user' });
        }
    }

    public signInUser = async (req: Request, res: Response) => {
        try{
            const { username, password } = req.body;

            const userSigned  = await this.userService.signIn( username, password );
            
            if(!userSigned){
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }
            res.status(200).json(userSigned);
        }catch (e){
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }        
    };

    public signUpUser = async (req: Request, res: Response) => {
        this.createUser(req, res);
    };
}

export default UserController;
