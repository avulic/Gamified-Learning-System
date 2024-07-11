// roles.ts

export enum RoleEnum {
    User = 'user',
    Student = 'student',
    Guest = 'guest',
    Admin = 'admin',
    Professor = 'professor'  // Fixed typo: 'Profesor' to 'Professor'
}

export interface IRole {
    name: RoleEnum;
}

// Example of creating a role
const userRole: Role = {
    name: RoleEnum.User
};

// If you need a class with a constructor
export class Role implements IRole {
    constructor(public name: RoleEnum) {}
}

// Example of using the class
const adminRole = new Role(RoleEnum.Admin);

// Type guard function to check if a string is a valid RoleEnum
export function isValidRole(role: string): role is RoleEnum {
    return Object.values(RoleEnum).includes(role as RoleEnum);
}

// Utility function to create a Role from a string
export function createRole(roleName: string): Role | null {
    if (isValidRole(roleName)) {
        return { name: roleName };
    }
    return null;
}