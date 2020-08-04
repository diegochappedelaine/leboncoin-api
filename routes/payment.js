// express
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_KEY);

router.post("/pay", async (req, res) => {
    console.log("route payment");
    console.log(req.fields);
    const stripeToken = req.fields.stripeToken;
    const response = await stripe.charges.create({
        amount: req.fields.price,
        currency: "eur",
        description: "La description de l'objet acheté",
        source: stripeToken,
    });
    console.log(response.status);
    // TODO
    // Sauvegarder la transaction dans une BDD MongoDB
    res.json(response);
});

// Export des routes
module.exports = router;
