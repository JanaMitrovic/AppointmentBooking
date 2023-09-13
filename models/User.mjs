import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    first_name: String,
    last_name: String,
    company: String,
    address1: String,
    address2: String,
    zip_code: String,
    region: String,
    country: String,
    email: String,
    email_confirm: Boolean, 
},{
    collection: 'Users'
});

const User = mongoose.model('User', userSchema);

export default User;