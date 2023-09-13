import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    service: {
        type: Number,
        ref: 'Service'
    },
    date: String,
    time: String,
    price: Number,
    reservation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reservation'
    }
},{
    collection: 'Appointment'
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;