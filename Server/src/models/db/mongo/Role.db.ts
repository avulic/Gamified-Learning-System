import { AutoMap } from 'automapper-classes';
import { Roles } from '../../enums';
import { model, Schema, Document, Types } from 'mongoose';



export class IRoleDb {
    @AutoMap()
    _id?: Types.ObjectId;
    @AutoMap()
    name!: string;
    @AutoMap()
    description?: string;
}

const roleSchema: Schema = new Schema({
    name: {
        type: String,
        enum: Object.values(Roles),
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
});

export type RoleDocument = Document & IRoleDb;
const Role = model<RoleDocument>('Role', roleSchema);

export default Role;