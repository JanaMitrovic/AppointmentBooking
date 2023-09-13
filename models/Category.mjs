import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    _id: String,
    name: String,
},{
    collection: 'Categories'
});

const Category = mongoose.model('Category', categorySchema);

export default Category;