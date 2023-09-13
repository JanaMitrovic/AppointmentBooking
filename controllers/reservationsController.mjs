import express from "express";
import User from "../models/User.mjs";
import { ObjectId } from "mongodb";
import Reservation from "../models/Reservation.mjs";
import Appointment from "../models/Appointment.mjs";
import PromoCode from "../models/PromoCode.mjs";

const router = express.Router();

router.post("/save", async (req, res) => {
    
    function generate(length) {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let token = "";
        for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        token += charset.charAt(randomIndex);
        }
        return token;
    }

    let token = generate(10);
    let promoCode = generate(5);

    const reservation = new Reservation({
        _id: new ObjectId(),
        userEmail: req.body.userEmail,
        price: req.body.price,
        token: token,
        promoCode: promoCode
    });

    let reservSaved = null;

    try {
        reservSaved = await reservation.save();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }

    const promoCodeNew = new PromoCode({
        _id: new ObjectId(),
        code: promoCode,
        userEmail: req.body.userEmail
    });

    try {
        const promoCodeSaved = await promoCodeNew.save();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }


    const appointments = req.body.appointments;

    for (let i = 0; i < appointments.length; i++) {
        const appointment = new Appointment({
            _id: new ObjectId(),
            service: appointments[i].service._id,
            date: appointments[i].date,
            time: appointments[i].time,
            price: appointments[i].price,
            reservation: reservSaved._id
        });
    
        try {
            const appSaved = await appointment.save();
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    let promoCodeUsed = null;
    let massage = "";

    if(req.body.usedPromoCode !== ""){
        try {
            promoCodeUsed = await PromoCode.findOneAndDelete({ code: req.body.usedPromoCode });
            massage = promoCodeUsed.userEmail;
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    const response = {
        email: reservSaved.userEmail,
        token: reservSaved.token,
        promoCode: reservSaved.promoCode,
        userMassage: massage
    }

    res.status(200).json(response);

});

router.post("/find", async (req, res) => {
    const {email, token} = req.body

    let reserv = null;

    try {
        reserv = await Reservation.findOne({ 
            userEmail: email,
            token: token
         });
         if(reserv === null){
            res.json(null);
            return;
        }
        // res.status(200).json(reserv);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }

    let appointments = [];

    try {
        appointments = await Appointment.find({
            reservation: reserv._id
        });
        // res.status(200).json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }

    let user = null;

    try {
        user = await User.findOne({ email: reserv.userEmail });
        // res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }

    res.status(200).json({
        reservation: reserv,
        appointments: appointments,
        user: user
    })
});

router.post("/update", async (req, res) => {
    const {reservation, price, appointments} = req.body;

    let updatedReservation = null;

    try {
        updatedReservation = await Reservation.findOneAndUpdate(
            {token: reservation.token, userEmail: reservation.userEmail},
            {price: price}
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }

    for (let i = 0; i < appointments.length; i++) {
        let appointment = null;
        try {
            appointment = await Appointment.findOne({ 
                service: appointments[i].service._id,
                date: appointments[i].date,
                time: appointments[i].time
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
        if(appointment === null){
            const appointmentSave = new Appointment({
                _id: new ObjectId(),
                service: appointments[i].service._id,
                date: appointments[i].date,
                time: appointments[i].time,
                price: appointments[i].price,
                reservation: reservation._id
            });
        
            try {
                const appSaved = await appointmentSave.save();
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }else{
            try {
                const updatedAppointment = await Appointment.findOneAndUpdate(
                    {service: appointments[i].service._id, date: appointments[i].date, time: appointments[i].time,},
                    {price: appointments[i].price}
                );
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }
        
    }

    const response = {
        email: updatedReservation.userEmail,
        token: updatedReservation.token
    }

    res.status(200).json(response);
    
})

router.post("/delete", async (req, res) => {
    const {token, email} = req.body;

    let deletedReservation = null;

    try {
        deletedReservation = await Reservation.findOneAndDelete({
            token: token,
            userEmail: email
        });
        if(deletedReservation === null){
            res.json({
                message: "Reservation doesn't exist!",
                reservation: deletedReservation
            });
            return;
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }

    try {
        const appointments = await Appointment.deleteMany({
            reservation: deletedReservation._id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }

    try {
        const promoCode = await PromoCode.findOneAndDelete({
            userEmail: email,
            code: deletedReservation.promoCode
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }

    res.json({
        message: "Reservation deleted!",
        reservation: deletedReservation
    });
});

export default router;