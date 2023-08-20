import ApiService from '@/services/ApiService';
import type User from '@/types/User/User';
import type UserSignUp from '@/types/User/UserSignUp';
import type ResponseData from '@/types/ResponseData';
import AuthService from './AuthService';
import type { AxiosHeaderValue, AxiosRequestConfig } from 'axios';


class UserService {
    public async createUser(user: UserSignUp): Promise<User> {
        try {
            const response: ResponseData = await ApiService.post<UserSignUp>('/users', user, this.setOptions());
            return response.data;
        } catch (error) {
            // Handle createUser specific errors if needed
            throw new Error('Failed to create user');
        }
    }

    public async createUsers(users: User[]): Promise<User> {
        try {
            const response: ResponseData = await ApiService.post<User[]>('/users', users);
            return response.data;
        } catch (error) {
            // Handle createUser specific errors if needed
            throw new Error('Failed to create users');
        }
    }

    public async getAllUsers(): Promise<User[]> {
        const response: ResponseData = await ApiService.get<User[]>('/users');
        return response.data;
    }

    public async getUserByName(userName: string): Promise<User | null> {
        const response: ResponseData = await ApiService.get<User>(`/users/?name=${userName}`);
        return response.data;
    }

    public async getUserById(userId: string): Promise<User | null> {
        const response: ResponseData = await ApiService.get<User>(`/users/${userId}`);
        return response.data;
    }

    public async updateUser(userId: string, updatedUserData: User): Promise<User | null> {
        const response: ResponseData = await ApiService.put<User>(`/users/${userId}`, updatedUserData);
        return response.data;
    }

    public async deleteUser(userId: string): Promise<User | null> {
        const response: ResponseData = await ApiService.delete<User>(`/users/${userId}`);
        return response.data;
    }


    private setOptions(): AxiosRequestConfig {
        const authHeader = AuthService.authHeader() as AxiosHeaderValue;
        return {
            headers: {
                Authorization: authHeader,
            },
        };
    }
}

export default new UserService();