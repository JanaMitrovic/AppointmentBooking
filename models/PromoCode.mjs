import mongoose from "mongoose";

const promoCodeSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    code: String,
    userEmail: String,
},{
    collection: 'PromoCode'
});

const PromoCode = mongoose.model("PromoCode", promoCodeSchema);

export default PromoCode;