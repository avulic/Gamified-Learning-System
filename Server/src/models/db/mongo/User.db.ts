import mongoose, { model, Schema, Document, Types, ObjectId } from 'mongoose';
import bcrypt from 'bcryptjs';
import { Roles } from '@/models/enums';
import { AutoMap } from 'automapper-classes';
import { IRoleDb } from './Role.db';



export class IUserDb {
    @AutoMap()
    _id?: mongoose.Types.ObjectId;
    @AutoMap()
    lastName!: string;
    @AutoMap()
    email!: string;
    @AutoMap()
    name!: string;
    @AutoMap()
    username!: string;
    @AutoMap()
    password!: string; // Hashed
    @AutoMap()
    roles!: IRoleDb[];
    @AutoMap()
    profilePicture!: string; // URL to storage
    @AutoMap()
    preferences!: {
        notifications: boolean;
        theme: string;
        language: string;
    };
    @AutoMap()
    enrolledCourses?: Array<{
        courseId: mongoose.Types.ObjectId;
        courseName: string;
    }>;
}


const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    roles: [{
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
        name: { type: String, required: true },
        description: { type: String }
    }],
    profilePicture: { type: String },
    preferences: {
        notifications: { type: Boolean, default: true, required: false },
        theme: { type: String, default: 'light', required: false },
        language: { type: String, default: 'en', required: false }
    },
    enrolledCourses: {
        type: [{
            courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: false },
            courseName: { type: String, required: false },
        }],
        required: false,
        default: null
    }
}, {
    timestamps: true
});

// Customize toJSON method to rename _id to id in the JSON response
UserSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
    },
});

UserSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password') || user.isNew) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        return next();
    }

    next();
});

UserSchema.pre('insertMany', async function (next, doc) {
    if (Array.isArray(doc) && doc.length) {
        doc.map(async (user) => {
            await new Promise(async (resolve, reject) => {
                if (user.isModified('password') || user.isNew) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                    return next();
                }
            });
        });
    }
    next();
});

UserSchema.index({ username: 1 });

export type UserDocument = Document & IUserDb;
const User = model<UserDocument>('User', UserSchema);

export default User;