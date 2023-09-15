import { model, Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';


export interface ITask {
    name: string;
    description: string;
}


const taskSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    }
});


// Customize toJSON method to rename _id to id in the JSON response
taskSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
    },
});


const Task = model<ITask>('Task', taskSchema);

export default Task;