const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const {
    BadRequestError,
    UnauthenticatedError,
    NotFoundError
} = require("../errors");

/**
 * REGISTER METHOD
 * @param {*} req
 * @param {*} res
 */
const register = async(req, res) => {
    const newUser = await User.create({...req.body });
    const token = newUser.createJWT();
    const { password, updatedAt, createdAt, IsAdmin, _id, ...others } =
    newUser._doc;
    res.status(StatusCodes.OK).json({...others, token });
};

/**
 * LOGIN METHOD
 * @param {*} req
 * @param {*} res
 */
const login = async(req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new BadRequestError("Please provide email and password...!!!");
    }
    const userLogin = await User.findOne({ email });
    if (!userLogin) {
        throw new UnauthenticatedError("Invalid email or not register yet...!!!");
    }
    const isPasswordCorrect = await userLogin.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new UnauthenticatedError("Invalid password...!!!");
    }
    const token = userLogin.createJWT();
    res.status(StatusCodes.OK).json({ user: { name: userLogin.name, email: userLogin.email, id: userLogin._id }, token });
};

/**
 * GET ALL USERS METHOD
 * @param {*} req
 * @param {*} res
 */
const getAllUsers = async(req, res) => {
    const allUsers = await User.find({}).sort("createdAt");
    if (!allUsers || allUsers == "") {
        throw new NotFoundError("No users found in DB...!!!");
    }
    res.status(StatusCodes.OK).json({ No_Users: allUsers.length, allUsers });
};

/**
 * DELETE ONE USERS METHOD BY ADMIN AND BY EMAIL
 * @param {*} req
 * @param {*} res
 */
const deleteUserByEmail = async(req, res) => {
    const {
        params: { id: userId },
    } = req;
    const user = await User.findOneAndRemove({ _id: userId });
    if (!user || user == null) {
        throw new NotFoundError("No user in DB with this id...!!!");
    } else {
        res.status(StatusCodes.OK).json({ msg: "User deleted...!!!" });
    }
};

module.exports = { register, login, deleteUserByEmail, getAllUsers };