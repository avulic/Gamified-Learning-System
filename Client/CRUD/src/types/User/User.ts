import type { JwtToken } from "../JwtToken";
import type { Role } from "../Role";

export default interface User {
    id: string,
    username: string;
    roles: Role[];
    token: JwtToken;
}