import { IRole } from '../models/Role';
import Role from '../models/Role';
import { IUser, IUserDb } from '../models/User';
import User from '../models/User';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config/authConfig';
import logger from '../config/loggerConfig';

class UserService {
    public createUser = async (user: IUser): Promise<void> => {
        try {
            // // Validate input data
            // if (!this.isValidUserData(user)) {
            //     throw new Error('Invalid user data');
            // }
    
            let roleIds: string[] = [];
            roleIds = await this.setRoles(user.rolesName);
            // Create the user with assigned roles
            const createdUser = await this.createUserWithRoles(user, roleIds);
        } catch (error: any) {
            console.error('Caught an error:', error.message);
            throw error;
        }
    }

    private async setRoles(rolesName: IRole[]): Promise<string[]> {
        // Check if roles are provided, and find role IDs
        let roleIds: string[] = [];

        if (rolesName && rolesName.length > 0) {
            roleIds = await this.getRoleIds(rolesName);
            return roleIds;
        } 

        const defaultRole = await this.getDefaultUserRole();
        if (defaultRole) {
            roleIds = [defaultRole._id];
        } else {
            throw new Error('Default role not found');
        }

        return roleIds;
    }

    private async getRoleIds(roleNames: IRole[]): Promise<string[]> {
        const roleNamesArray = roleNames.map(role => role.name);
        const roles = await Role.find({ name: { $in: roleNamesArray } });
        return roles.map(role => role._id.toString());
    }

    private async getDefaultUserRole(): Promise<IRole | null> {
        return await Role.findOne({ name: 'user' });
    }

    private async createUserWithRoles(user: IUser, roleIds: string[]): Promise<IUser> {
        const newUser = new User({
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            username: user.username,
            password: user.password,
            roles: roleIds,
        });
    
        return await newUser.save();
    }

    private isValidUserData(user: IUser): boolean {
        // Implement your validation logic here
        // For example, check if required fields are present
        return !!user.name && !!user.email && !!user.username && !!user.password;
    }

    public createUsers = async (users: IUser[]): Promise<IUser[]> => {
        try {
            var usersDb: IUserDb[] = [];

            for (const user of users) {
                const roleIds: string[] = await this.setRoles(user.rolesName);
                
                const newUser = new User({
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    password: user.password,
                    roles: roleIds
                });
                usersDb.push(newUser)
                //promises.push(newUser.save());
            }
            // Create the user with assigned roles
            const newUsers = await User.insertMany(usersDb);
            
            return newUsers;
        } catch (error) {
            console.error('Error creating users:', error);
            throw new Error('Failed to create users');
        }
    }

    public signIn = async (username: string, password: string): Promise<any> => {
        const user = await User.findOne({ username }).populate('roles', '-__v');
        if (!user) {
            throw new Error('User not found.');
        }
        
        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            throw new Error('Invalid password.');
        }

        const token = jwt.sign({ username: user.username,  roles: user.roles }, authConfig.secret, {
            algorithm: 'HS256',
            expiresIn: '1h' 
        });

        //const authorities = user.roles.map((role) => `ROLE_${role.name.toUpperCase()}`);
        return {
            token: token
        };
    }

    // // Function to read users from a file and call createUsers
    // public createUsersFromFile = async (filePath: string): Promise<IUser[]> => {
    //     try {
    //         const fileData = await fs.readFile(filePath, 'utf-8');
    //         const users: IUser[] = JSON.parse(fileData);
    //         return await this.createUsers(users);
    //     } catch (error) {
    //         throw new Error('Failed to read or create users from the file');
    //     }
    // }

    public getAllUsers = async (): Promise<IUser[]> => {
        return await User.find().populate({
            path: 'roles',
            select: 'name -_id' // Only select the 'name' field and exclude '_id'
        });
    }

    public getUserById = async (userId: string): Promise<IUser | null> => {
        return await User.findById(userId);
    }

    public updateUser = async (userId: string, updatedUserData: any): Promise<IUser | null> => {  
        try {   
            const roleIds: string[] = await this.getRoleIds(updatedUserData.roles);
            console.log("🚀 ~ file: UserService.ts:151 ~ UserService ~ updateUser= ~ roleIds:", roleIds)
            updatedUserData.roles = roleIds; 
            
            var user = await User.findByIdAndUpdate(userId, updatedUserData, { new: true });
            
            return user;
        } catch (err: any) { 
            console.log("Error updating user:", err);
            throw new Error(err);
        }
    }
    

    public deleteUser = async (userId: string): Promise<IUser | null> => {
        return await User.findByIdAndDelete(userId);
    }

    public getUserByUsername = async (username: string): Promise<IUser | null> => {
        return await User.findOne({ username: username }).exec();
    }
}

export default UserService;