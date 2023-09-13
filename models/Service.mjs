import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
    _id: Number,
    category: String,
    name: String,
    from: String,
    to: String,
    duration: Number,
    price: Number
},{
    collection: 'Services'
});

const Service = mongoose.model('Service', serviceSchema);

export default Service;