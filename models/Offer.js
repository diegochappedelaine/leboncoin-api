const mongoose = require("mongoose");

const Offer = mongoose.model("Offer", {
    created: { type: Date, default: Date.now },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    description: { type: String, required: true },
    picture: Object,
    price: { type: Number, required: true },
    title: { type: String, unique: true, required: true },
});

module.exports = Offer;
