import express from "express";
import PromoCode from "../models/PromoCode.mjs";

const router = express.Router();

router.post("/check", async (req, res) => {
    const {code} = req.body
    try {
        const promoCode = await PromoCode.findOne({ 
            code: code
        });
        res.status(200).json(promoCode);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;