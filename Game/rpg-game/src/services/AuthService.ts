import ApiService from './ApiService';
import type UserSignIn from '../types/User/UserSignIn';
import type UserSignUp from '../types/User/UserDetails';
import type User from '../types/User/User';
import type ResponseData from '../types/ResponseData';
import jwt_decode, {type JwtPayload} from 'jwt-decode';
import type { Role } from '../types/Role';
import { BehaviorSubject, Observable } from 'rxjs';

class AuthService {
    currentUserSubject =  new BehaviorSubject<User | null>(null);

    public async signIn(user: UserSignIn): Promise<any> {
        try {
            const response: ResponseData = await ApiService.post<User>('/signin', user);
            //console.log('Response:', response); // Add this line
            return response.data;
        } catch (error) {
            //console.error('Error during login:', error);
            throw new Error('Failed to login. Please check your credentials and try again.');
        }
    }

    public async signUp(user: UserSignUp): Promise<User> {
        try{
            const response: ResponseData = await ApiService.post<UserSignUp>('/signup', user);
            return response.data;
        } catch (error) {
            // Handle createUser specific errors if needed
            throw new Error('Failed to register');
        }
    }

    public setUserToLocalStorage(token: string): void {
        localStorage.setItem("token", token);
        this.getUserFromLocalStorage();
    }

    public removeUserFromLocalStorage(): void {
        localStorage.removeItem("token");
    }

    public getUserFromLocalStorage(): void {
        var token = localStorage.getItem("token");
        var userData = {} as User;
        
        if(token == null)
            return;
        
        userData = jwt_decode(token);
        this.currentUserSubject.next(userData);
    }

    public getCurentUserValues(): User | null {
        return this.currentUserSubject.value
    }

    public userLogOut():void {
        localStorage.removeItem('token');
        this.currentUserSubject.next(null);
    }

    public currentUserHasPermission(requiredRoles: Array<string>): boolean {
        const user: User | null = this.getCurentUserValues();
    
        if (!user || !user.roles) {
            return false;
        }
    
        return requiredRoles.every(requiredRole => user.roles.includes(requiredRole as Role));
    }

    public userLogedIn(): boolean {
        this.getUserFromLocalStorage();
        const user: User | null = this.getCurentUserValues();
        
        if ( user && user.exp && user.exp < Date.now()) {
            return true;
        }

        return false;
    }


    public authHeader(): {}  {
        let user: User | null = this.getCurentUserValues();
        if (user && user.token) {
            // for Node.js Express back-end
            return { 'x-access-token': user.token };
        } else {
            return {};
        }
    }

}


export default new AuthService();