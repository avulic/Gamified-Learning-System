import mongoose, { Schema } from "mongoose";
import { ICourse } from "./Course";
import { IUser } from "./User";

  // Group
  export interface IGroup extends Document {
    name: string;
    description: string;
    members: IUser[][];
    courses: ICourse[][];
  }
  
  const GroupSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }]
  });
  
  export const Group = mongoose.model<IGroup>('Group', GroupSchema);
  
