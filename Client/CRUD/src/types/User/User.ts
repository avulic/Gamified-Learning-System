import type { JwtToken } from "../JwtToken";
import type { Role } from "../Role";
import UserDetails from "./UserDetails";

export default interface User {
    id: string,
    username: string;
    roles: Role[];
    exp: number;
    iat: number;
    
    data: UserDetails;
}