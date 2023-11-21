import { Role } from "../Role";

export default interface User {
    username: string;
    roles: Role[];
    token: string | null;
}