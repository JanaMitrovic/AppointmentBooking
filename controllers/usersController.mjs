import express from "express";
import User from "../models/User.mjs";
import { ObjectId } from "mongodb";

const router = express.Router();

router.post("/findUser", async (req, res) => {
    const {email} = req.body
    try {
        const user = await User.findOne({ email });
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post("/saveUser", async (req, res) => {
    const user = new User({
        _id: new ObjectId(),
        first_name: req.body.user.first_name,
        last_name: req.body.user.last_name,
        company: req.body.user.company,
        address1: req.body.user.address1,
        address2: req.body.user.address2,
        zip_code: req.body.user.zip_code,
        region: req.body.user.region,
        country: req.body.user.country,
        email: req.body.user.email,
        email_confirm: req.body.user.email_confirm,
      });
    try {
        const userSaved = await user.save();
        res.status(200).json(userSaved);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put("/changeUser", async (req, res) => {
    try {
        const userChanged = await User.findOneAndUpdate(
            { email: req.body.user.email },
            {
                first_name: req.body.user.first_name,
                last_name: req.body.user.last_name,
                company: req.body.user.company,
                address1: req.body.user.address1,
                address2: req.body.user.address2,
                zip_code: req.body.user.zip_code,
                region: req.body.user.region,
                country: req.body.user.country,
            },
            { new: true }
        );
        res.status(200).json(userChanged);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
  });

export default router;