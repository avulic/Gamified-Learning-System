import mongoose, { Schema } from "mongoose";

// Category


export interface ICategory  {
    id:string,
    name: string;
    description: string;
}
export interface ICategoryDb extends Omit<ICategory, 'id'>,Document {

}

const CategorySchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String }
});

const Category = mongoose.model<ICategoryDb>('Category', CategorySchema);

export default Category;
