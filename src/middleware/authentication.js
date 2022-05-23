const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { UnauthenticatedError } = require("../errors");
const secretKey = process.env.JWT_SECRET;

const auth = async(req, res, next) => {
    //check header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
        throw new UnauthenticatedError("Authentication Invalid...!!!");
    }
    const token = authHeader.split(" ")[1];
    try {
        const payload = jwt.verify(token, secretKey);
        const user = await User.findOne({ _id: payload.userId });
        //console.log(user);
        //attach the user to the jobs route and creating req.user*
        req.user = {
            userId: payload.userId,
            name: payload.name,
            email: user.email,
            isAdmin: user.IsAdmin,
        };
        next();
    } catch (error) {
        throw new UnauthenticatedError("Authentication Invalid...!!!");
    }
};

module.exports = auth;