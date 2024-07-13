import mongoose, { Schema } from "mongoose";
import { ICourse } from "./Course";

// Badge
export interface IBadge extends Document {
    name: string;
    description: string;
    image: string;
    criteria: string;
    courses: ICourse[][];
}

const BadgeSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String, required: true },
    criteria: { type: String, required: true },
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }]
});

export const Badge = mongoose.model<IBadge>('Badge', BadgeSchema);

