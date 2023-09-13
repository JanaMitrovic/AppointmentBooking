import express from "express";
import Appointment from "../models/Appointment.mjs";
import mongoose from "mongoose";

const router = express.Router();

router.post("/findAppointment", async (req, res) => {
    const {service, date, time} = req.body
    try {
        const appointment = await Appointment.findOne({ 
            service: service,
            date: date,
            time: time
        });
        res.status(200).json(appointment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete("/deleteAppointment", async (req, res) => {
    const {service, date, time} = req.body
    try {
        const appointment = await Appointment.findOneAndDelete({ 
            service: service,
            date: date,
            time: time
        });
        res.status(200).json({message : "Appointment deleted!"});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


export default router;