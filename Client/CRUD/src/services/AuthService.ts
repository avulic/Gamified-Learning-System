
import type UserSignIn from '@/types/User/UserSignIn';
import type UserSignUp from '@/types/User/UserDetails';
import type User from '@/types/User/User';

import jwt_decode from 'jwt-decode';
import type { Role } from '@/types/Role';
import { BehaviorSubject } from 'rxjs';
import { apiService } from '@/services/ApiService';
import { AuthError, AuthResponse, type ApiResponse } from '@/types/respons/Response';
import { JwtToken } from '@/types/JwtToken';
import { RoleEnum } from '@/types/enums';

class AuthService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    private TOKEN_KEY = 'auth_token';

    public async signIn(user: UserSignIn): Promise<AuthResponse<JwtToken>> {
        try {
            const response = await apiService.post<JwtToken>('/signin', user);

            if (!response.data) {
                throw new AuthError('Invalid response from server', response.status);
            }

            this.setToken(response.data);

            return {
                success: true,
                data: response.data,
                message: 'Successfully signed in',
                status: response.status
            };
        } catch (error: any) {
            const errorMessage = error.status === 500
                ? 'Server error occurred. Please try again later.'
                : error.message || 'Failed to login. Please check your credentials and try again.';

            throw new AuthError(errorMessage, error.status || 500);
        }
    }

    public async signUp(user: UserSignUp): Promise<AuthResponse<void>> {
        try {
            const response = await apiService.post('/signup', user);

            return {
                success: true,
                message: 'Registration successful! You can now log in.',
                status: response.status
            };
        } catch (error: any) {
            const errorMessage = error.status === 500
                ? 'Server error occurred. Please try again later.'
                : error.message || 'Failed to register. Please try again.';

            throw new AuthError(errorMessage, error.status || 500);
        }
    }


    public setToken(token: JwtToken | string): void {
        const tokenValue = typeof token === 'string' ? token : token.value;
        localStorage.setItem(this.TOKEN_KEY, tokenValue);
        this.loadUserFromLocalStorage();
    }

    public getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    public removeToken(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        this.currentUserSubject.next(null);
    }

    public loadUserFromLocalStorage(): void {
        const token = this.getToken();
        if (!token) {
            this.currentUserSubject.next(null);
            return;
        }

        try {
            const userData = jwt_decode<User>(token);
            this.currentUserSubject.next(userData);
        } catch (error) {
            console.error('Error decoding token:', error);
            this.removeToken();
        }
    }

    public getCurrentUserValues(): User | null {
        const user = this.currentUserSubject.value
        if (!user) {
            return null;
        }
        return user;
    }

    public getCurrentUserObservable() {
        return this.currentUserSubject.asObservable();
    }

    public userLogOut(): void {
        this.removeToken()
    }

    public currentUserHasPermission(requiredRoles: Array<Role | RoleEnum>): boolean {
        const user: User | null = this.getCurrentUserValues();

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
        const user: User | null = this.getCurrentUserValues();
        if (!user) return false;
        if (!user.exp) return false;

        const currentTime = Date.now() / 1000;
        const isValid = user.exp > currentTime;

        if (!isValid) {
            this.removeToken();
        }

        return isValid;
    }
}


export default new AuthService();