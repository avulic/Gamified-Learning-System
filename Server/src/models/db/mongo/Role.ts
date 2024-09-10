import { Roles } from '../../enums';
import { model, Schema, Document } from 'mongoose';



export interface IRoleDb extends Document {
    name: string;
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


const Role = model<IRoleDb>('Role', roleSchema);

export default Role;