export interface GameProfile {
    id: string;
    userId: string;
    level: number;
    xp: number;
    coins: number;
    achievements: string[];
    badges: string[];
    createdAt: Date;
    updatedAt: Date;
}