import { apiService } from '@/services/ApiService';
import type User from '@/types/User/User';
import type UserSignUp from '@/types/User/UserDetails';

import type UserDetails from '@/types/User/UserDetails';


class UserService {
    public async createUser(user: UserSignUp): Promise<UserSignUp> {
        try {
            const response = await apiService.post<UserSignUp>('/users', user);
            return response.data;
        } catch (error) {
            throw new Error('Failed to create user');
        }
    }

    public async createUsers(users: User[]): Promise<User[]> {
        try {
            const response = await apiService.post<User[]>('/users', users);
            return response.data;
        } catch (error) {
            // Handle createUser specific errors if needed
            throw new Error('Failed to create users');
        }
    }

    public async getAllUsers(): Promise<UserDetails[]> {
        try {
            const response = await apiService.get<UserDetails[]>('/users');

            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch users');
        }
    }

    public async getUserByUserName(userName: string): Promise<User | null> {
        const response = await apiService.get<User>(`/users/?username=${userName}`);
        return response.data;
    }

    public async getUserDataById(userId: string): Promise<UserDetails | null> {
        const response = await apiService.get<UserDetails>(`/users/${userId}`);
        return response.data;
    }



    public async updateUser(userId: string, updatedUserData: UserDetails): Promise<UserDetails | null> {
        try {
            const response = await apiService.put<UserDetails>(`/users/${userId}`, updatedUserData);
            return response.data;
        } catch (err) {
            throw new Error("Eror od update user:" + err)
        }

    }

    public async deleteUser(userId: string): Promise<UserDetails | null> {
        const response = await apiService.delete<UserDetails>(`/users/${userId}`);
        return response.data;
    }

    public async deleteUserByUserName(userName: string): Promise<User | null> {
        const responseUser = await apiService.get<User>(`/users/?username=${userName}`);
        if (!responseUser.data)
            return null;

        const response = await apiService.delete<User>(`/users/${responseUser.data.id}`);
        return response.data;
    }

    public async getUsersByRoles(roles: string[]): Promise<UserDetails[]> {
        try {
            const response = await apiService.get<UserDetails[]>('/users/roles', {
                params: {
                    roles
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching users by roles:', error);
            throw new Error('Failed to fetch users by roles');
        }
    }
}

export default new UserService();