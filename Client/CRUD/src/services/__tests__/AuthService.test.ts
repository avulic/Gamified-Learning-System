import AuthService from '../AuthService'
import ApiService from '../ApiService'
import jwt_decode from 'jwt-decode'
import { Role, RoleEnum } from '@/types/Role'
import UserDetails from '@/types/User/UserDetails'

jest.mock('../ApiService')
jest.mock('jwt-decode')

describe('AuthService', () => {
    const mockUser = { username: 'testuser', password: 'password' }
    const mockToken = 'mockToken'
    const mockDecodedToken = { exp: Date.now() / 1000 + 3600 } // Token expires in 1 hour

    beforeEach(() => {
        localStorage.clear()
            ; (ApiService.post as jest.Mock).mockClear()
            ; (jwt_decode as jest.Mock).mockClear()
    })

    describe('signIn', () => {
        it('should sign in successfully', async () => {
            ; (ApiService.post as jest.Mock).mockResolvedValue({ data: { token: mockToken } })
            const result = await AuthService.signIn(mockUser)
            expect(result).toEqual({ token: mockToken })
            expect(ApiService.post).toHaveBeenCalledWith('/signin', mockUser)
        })

        it('should throw an error on failed sign in', async () => {
            ; (ApiService.post as jest.Mock).mockRejectedValue(new Error('Failed'))
            await expect(AuthService.signIn(mockUser)).rejects.toThrow('Failed to login')
        })
    })

    const mockUserDetails = <UserDetails>{  
        id:"10",
        username: "test",
        password: "test",
        name: "test",
        lastName: "test",
        email: "test",
        roles: [new Role(RoleEnum.Admin)] 
    }

    describe('signUp', () => {
        it('should sign up successfully', async () => {
            const mockResponse = { data: { ...mockUserDetails } }
                ; (ApiService.post as jest.Mock).mockResolvedValue(mockResponse)
            const result = await AuthService.signUp(mockUserDetails)
            expect(result).toEqual(mockResponse)
            expect(ApiService.post).toHaveBeenCalledWith('/signup', mockUserDetails)
        })

        it('should throw an error on failed sign up', async () => {
            ; (ApiService.post as jest.Mock).mockRejectedValue(new Error('Failed'))
            await expect(AuthService.signUp(mockUserDetails)).rejects.toThrow('Failed to register')
        })
    })

    describe('token management', () => {
        it('should set and get token', () => {
            AuthService.setToken(mockToken)
            expect(AuthService.getToken()).toBe(mockToken)
        })

        it('should remove token', () => {
            AuthService.setToken(mockToken)
            AuthService.removeToken()
            expect(AuthService.getToken()).toBeNull()
        })
    })

    describe('authentication state', () => {
        it('should check if user is authenticated', () => {
            ; (jwt_decode as jest.Mock).mockReturnValue(mockDecodedToken)
            AuthService.setToken(mockToken)
            expect(AuthService.isAuthenticated()).toBe(true)
        })

        it('should return false for expired token', () => {
            ; (jwt_decode as jest.Mock).mockReturnValue({ exp: Date.now() / 1000 - 3600 }) // Expired token
            AuthService.setToken(mockToken)
            expect(AuthService.isAuthenticated()).toBe(false)
        })
    })

    describe('user permissions', () => {
        it('should check user permissions correctly', () => {
            const mockUser = { roles: ['admin', 'user'] };
            (jwt_decode as jest.Mock).mockReturnValue(mockUser);
            AuthService.setToken(mockToken);
            
            expect(AuthService.currentUserHasPermission([{ name: RoleEnum.Admin }])).toBe(true);
            expect(AuthService.currentUserHasPermission([RoleEnum.Admin])).toBe(true);
            expect(AuthService.currentUserHasPermission([{ name: RoleEnum.User }])).toBe(true);
            expect(AuthService.currentUserHasPermission([{ name: RoleEnum.Professor }])).toBe(false);
        });
    
        it('should handle invalid roles', () => {
            const mockUser = { roles: ['admin', 'user'] };
            (jwt_decode as jest.Mock).mockReturnValue(mockUser);
            AuthService.setToken(mockToken);
    
            expect(AuthService.currentUserHasPermission([{ name: 'superadmin' as RoleEnum }])).toBe(false);
        });
    });
})
