

import { IUser } from '../models/User';
import User from '../models/User';

class UserService {
    public createUser = async (user: IUser): Promise<IUser> => {
        const newUser = new User(user);
        return await newUser.save();    
    }

    public createUsers = async (users: IUser[]): Promise<IUser[]> => {
        const newUsers = await User.insertMany(users);
        return newUsers;
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
        return await User.find();
    }

    public getUserById = async (userId: string): Promise<IUser | null> => {
        return await User.findById(userId);
    }

    public updateUser = async (userId: string, updatedUserData: IUser): Promise<IUser | null> => {
        return await User.findByIdAndUpdate(userId, updatedUserData, { new: true });
    }

    public deleteUser = async (userId: string): Promise<IUser | null> => {
        return await User.findByIdAndDelete(userId);
    }
}

export default UserService;