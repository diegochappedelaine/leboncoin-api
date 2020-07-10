const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
    const token = req.headers.authorization.replace("Bearer ", "");
    try {
        const userLoggingIn = await User.findOne({ token: token });
        if (userLoggingIn) {
            req.user = userLoggingIn;
        } else {
            return res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
    next();
};

module.exports = isAuthenticated;
