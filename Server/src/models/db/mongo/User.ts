import mongoose, { model, Schema, Document, Types, ObjectId } from 'mongoose';
import bcrypt from 'bcryptjs';
import { Roles } from '@/models/enums';



export interface IUserDb extends Document {
    _id: ObjectId;
    name: string;
    lastName: string;
    email: string;
    username: string;
    password: string; // Hashed
    roles: Roles[];
    profilePicture: string; // URL to storage
    preferences: {
        notifications: boolean;
        theme: string;
        language: string;
    };
    enrolledCourses?: Array<{
        courseId: ObjectId;
        courseName: string;
    }>;
}


const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    roles: [{ type: String, required: true, enum: Roles }],
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

const User = model<IUserDb>('User', UserSchema);

export default User;