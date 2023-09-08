import mongoose from 'mongoose'
import bcryptPlugin from 'mongoose-bcrypt'

const { Schema, model, models } = mongoose



export interface IPlayer {
    nickname: string;
    password: string;
    email: string;
    date: string;
    data: string;
}


const schema = new Schema({ 
    nickname: { type: String, required: true, unique: true }, 
    password: { type: String, required: true },
    email: {
        type: String,
        required: true
    },
    date: { type: Date, default: Date.now },
    data: String
})

schema.plugin(bcryptPlugin)

export default model<IPlayer>('Player', schema);