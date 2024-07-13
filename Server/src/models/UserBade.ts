import mongoose, { Schema } from "mongoose";
import { IBadge } from "./Badge";
import { IUser } from "./User";

// UserBadge (intermediate model for Many-to-Many relationship between User and Badge)
export interface IUserBadge extends Document {
    user: IUser[];
    badge: IBadge[];
    earnedDate: Date;
}

const UserBadgeSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    badge: { type: Schema.Types.ObjectId, ref: 'Badge', required: true },
    earnedDate: { type: Date, default: Date.now }
});

export const UserBadge = mongoose.model<IUserBadge>('UserBadge', UserBadgeSchema);

