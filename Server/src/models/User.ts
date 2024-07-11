import { model, Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IRole, IRoleDb, Roles } from './Role';

export interface IUser {
    id:string,
    name: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    roles: Roles[];
}

export interface IUserDb extends Omit<IUser, "id"|"roles">, Document {
    roles: IRoleDb[];
}



const userSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: false,
        //select: false // This ensures the password isn't returned in normal queries
    },
    roles: [{
        type: Schema.Types.ObjectId,
        ref: "Role",
        required: true
    }]
});

// Customize toJSON method to rename _id to id in the JSON response
userSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
    },
});

userSchema.pre('save', async function(next) {
    const user = this;

    if (user.isModified('password') || user.isNew) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        return  next();
    }
    
    next();
});

const User = model<IUserDb>('User', userSchema);

export default User;