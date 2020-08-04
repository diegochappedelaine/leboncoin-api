// express
const express = require("express");
const app = express();
// express-formidable
const formidableMiddleware = require("express-formidable");
app.use(formidableMiddleware());
// dotenv
require("dotenv").config();
// cors
const cors = require("cors");
app.use(cors());
// mongoose
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});

// Import des fichiers routes
const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer");
const paymentRoutes = require("./routes/payment");

// Initialisation des routes via Express
app.use(userRoutes);
app.use(offerRoutes);
app.use(paymentRoutes);

// Récuperer les routes que je n'ai pas déclaré
app.get("*", async (req, res) => {
    console.log("route : /");
    res.status(404).json("404, not found");
});

app.listen(process.env.PORT, () => {
    console.log("Server has started on port: " + process.env.PORT);
});
