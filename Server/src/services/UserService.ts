
import { IUser } from '../models/User';
import User from '../models/User';

class UserService {

    public createUser = async (user: IUser): Promise<IUser> => {
        const newUser = new User(user);
        return await newUser.save();    
    }

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