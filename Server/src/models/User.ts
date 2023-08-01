import { model, Schema, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    username: string;
    role: string;
}

const userSchema: Schema = new Schema({
    name: {
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
    role: {
        type: String,
        required: false,
        unique: false,
    }
});

// Customize toJSON method to rename _id to id in the JSON response
userSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
    },
});

const User = model<IUser>('User', userSchema);

export default User;