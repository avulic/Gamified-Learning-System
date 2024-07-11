import type { JwtPayload } from 'jwt-decode';
import type { Role } from './Role';

export interface JwtToken extends JwtPayload {
    value:string;
}