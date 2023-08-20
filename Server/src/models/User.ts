import { model, Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IRole } from './Role';

export interface IUser {
    name: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    salt: string;
    rolesName: string[];
}

export interface IUserDb extends IUser, Document {
    roles: Schema.Types.ObjectId[];
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
        required: true,
        unique: false,
    },
    salt: {
        type: String,
        required: false,
        unique: false,
    },
    roles: [
        {
            type: Schema.Types.ObjectId,
            ref: "Role"
        }
    ]
});


// Customize toJSON method to rename _id to id in the JSON response
userSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
    },
});

userSchema.pre('save', function (next) {
    const user = this
    
    if (user.isModified("password") || user.isNew) {
        bcrypt.genSalt(10)
            .then(salt =>{
                user.salt = salt;
                bcrypt.hash(user.password, salt).then(hash=>{
                    user.password = hash;
                    next();
                });
            }) 
            .catch(error => next(error));
    } else {
        return next();
    }
})

const User = model<IUserDb>('User', userSchema);

export default User;