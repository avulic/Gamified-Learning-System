import ApiService from './ApiService';
import type User from '../types/User/User';
import type UserSignUp from '../types/User/UserDetails';
import type ResponseData from '../types/ResponseData';
import AuthService from './AuthService';
import type { AxiosHeaderValue, AxiosRequestConfig } from 'axios';
import type UserDetails from '../types/User/UserDetails';
import { throwError } from 'rxjs';


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

    public async getUserByUserName(userName: string): Promise<User | null> {
        const response: ResponseData = await ApiService.get<User>(`/users/?username=${userName}`);
        return response.data;
    }

    public async getUserById(userId: string): Promise<User | null> {
        const response: ResponseData = await ApiService.get<User>(`/users/${userId}`);
        return response.data;
    }

    public async updateUser(userId: string, updatedUserData: UserDetails): Promise<UserDetails | null> {
        try{
            const response: ResponseData = await ApiService.put<UserDetails>(`/users/${userId}`, updatedUserData);
            return response.data;
        } catch(err){
            throw new Error("Eror od servera:"+err)
        }

    }

    public async deleteUser(userId: string): Promise<UserDetails | null> {
        const response: ResponseData = await ApiService.delete<UserDetails>(`/users/${userId}`);
        return response.data;
    }

    public async deleteUserByUserName(userName: string): Promise<UserSignUp | null> {
        const responseUser: ResponseData = await ApiService.get<User>(`/users/?username=${userName}`);
        if(!responseUser.data)
            return null;

        const response: ResponseData = await ApiService.delete<User>(`/users/${responseUser.data.id}`);
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