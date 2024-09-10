
import type UserSignIn from '@/types/User/UserSignIn';
import type UserSignUp from '@/types/User/UserDetails';
import type User from '@/types/User/User';

import jwt_decode from 'jwt-decode';
import type { Role, RoleEnum } from '@/types/Role';
import { BehaviorSubject } from 'rxjs';
import { post } from '@/services/ApiService';
import type { ApiResponse } from '@/types/respons/Response';
import { JwtToken } from '@/types/JwtToken';

class AuthService {
    currentUserSubject = new BehaviorSubject<User | null>(null);
    private TOKEN_KEY = 'auth_token';

    public async signIn(user: UserSignIn): Promise<any> {
        try {
            const response = await post<User>('/signin', user);
            
            return response.data;
        } catch (error) {
            //console.error('Error during login:', error);
            throw new Error('Failed to login. Please check your credentials and try again.');
        }
    }

    public async signUp(user: UserSignUp): Promise<boolean> {
        try {
            const response: ApiResponse = await post<UserSignUp>('/signup', user);

            // Assuming a successful response has a status code of 200 or 201
            // You might need to adjust this based on your API's specific response structure
            if (response.status === 200 || response.status === 201) {
                console.log('User signed up successfully');
                return true;
            } else {
                console.log('Signup failed:', response.data);
                return false;
            }
        } catch (error) {
            console.error('Error during signup:', error);
            // You might want to handle different types of errors differently
            // For now, we'll return false for any error
            return false;
        }
    }


    public setToken(token: JwtToken | string): void {
        if (typeof token === 'string') {
            localStorage.setItem(this.TOKEN_KEY, token);
        } else {
            localStorage.setItem(this.TOKEN_KEY, token.value);
        }
        this.getUserFromLocalStorage();
    }

    public getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    public removeToken(): void {
        localStorage.removeItem(this.TOKEN_KEY);
    }

    public getUserFromLocalStorage(): void {
        var userData = {} as User;
        const token = this.getToken();
        if (!token) return;

        try {
            const tokenData:JwtToken = jwt_decode(token);
            userData.token = tokenData;
            this.currentUserSubject.next(userData);
        } catch (error) {
            console.error('Error decoding token:', error);
            this.removeToken(); // Remove invalid token
            return;
        }
    }

    public getCurentUserValues(): User | null {
        return this.currentUserSubject.value
    }

    public userLogOut(): void {
        localStorage.removeItem('token');
        this.currentUserSubject.next(null);
    }

    public currentUserHasPermission(requiredRoles: Array<Role | RoleEnum>): boolean {
        const user: User | null = this.getCurentUserValues();

        if (!user || !user.roles) {
            return false;
        }

        const userRoles = user.roles.map(role =>
            typeof role === 'string' ? role : role.name
        );

        return requiredRoles.every(requiredRole => {
            const roleName = typeof requiredRole === 'string' ? requiredRole : requiredRole.name;
            return userRoles.includes(roleName);
        });
    }

    public isAuthenticated(): boolean {
        const user:User|null = this.getCurentUserValues();
        if (!user) return false;

        try {
            const currentTime = Date.now() / 1000;


            return !!user.token.exp && user.token.exp > currentTime;

        } catch (error) {
            console.error('Error decoding token:', error);
            this.removeToken(); // Remove invalid token
            return false;
        }
    }
}


export default new AuthService();