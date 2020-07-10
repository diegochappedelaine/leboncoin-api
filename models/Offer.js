const mongoose = require("mongoose");

const Offer = mongoose.model("Offer", {
    created: { type: Date, default: Date.now },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    description: { type: String, required: true, maxlength: 500 },
    picture: Object,
    price: { type: Number, min: 0, max: 100000, required: true },
    title: {
        type: String,
        minlength: 1,
        maxlength: 50,
        required: true,
        unique: true,
    },
});

module.exports = Offer;
