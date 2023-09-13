import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userEmail: String,
    price: Number,
    token: String,
    promoCode: String
    
},{
    collection: 'Reservation'
});

const Reservation = mongoose.model('Reservation', reservationSchema);

export default Reservation;