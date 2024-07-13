import mongoose, { Schema } from "mongoose";

// Category
export interface ICategory extends Document {
    name: string;
    description: string;
}

const CategorySchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String }
});

export const Category = mongoose.model<ICategory>('Category', CategorySchema);

