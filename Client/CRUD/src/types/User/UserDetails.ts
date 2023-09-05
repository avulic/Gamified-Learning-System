export default interface UserDetails {
    id: string;
    username: string;
    password: string;
    name: string;
    lastName: string;
    email: string;
    roles: [{name: string}];
}